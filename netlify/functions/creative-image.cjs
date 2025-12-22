// Phase 9: Image Generation Serverless Function
// Supports multiple models: Flux 2, DALL-E 3, Stable Diffusion
// Uses Replicate as primary API, OpenAI as fallback

const Anthropic = require('@anthropic-ai/sdk');

// Model configurations
const MODELS = {
    'flux-2': {
        replicateModel: 'black-forest-labs/flux-2-pro',
        provider: 'replicate'
    },
    'dall-e-3': {
        openaiModel: 'dall-e-3',
        provider: 'openai'
    },
    'stable-diffusion': {
        replicateModel: 'stability-ai/sdxl',
        provider: 'replicate'
    },
    'dreamshaper': {
        replicateModel: 'cjwbw/dreamshaper',
        provider: 'replicate'
    }
};

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { prompt, negativePrompt, model, style, dimensions, quantity, steps, guidance } = JSON.parse(event.body);

        console.log('[Image Generation] Request received:', {
            model,
            promptLength: prompt?.length,
            dimensions,
            quantity
        });

        // Validation
        if (!prompt || prompt.trim().length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Prompt is required' })
            };
        }

        // Enhance prompt with style
        const enhancedPrompt = enhancePrompt(prompt, style);

        // Get model config
        const modelConfig = MODELS[model] || MODELS['flux-2'];

        // Generate based on provider
        let result;
        if (modelConfig.provider === 'replicate') {
            result = await generateWithReplicate(enhancedPrompt, negativePrompt, modelConfig, dimensions, steps, guidance);
        } else if (modelConfig.provider === 'openai') {
            result = await generateWithOpenAI(enhancedPrompt, dimensions, quantity);
        } else {
            throw new Error(`Unsupported provider: ${modelConfig.provider}`);
        }

        console.log('[Image Generation] ✓ Generation successful');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                url: result.url,
                thumbnail: result.thumbnail || result.url,
                metadata: {
                    model,
                    dimensions,
                    prompt: enhancedPrompt,
                    negativePrompt,
                    generatedAt: new Date().toISOString()
                }
            })
        };

    } catch (error) {
        console.error('[Image Generation] ✗ Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Image generation failed',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};

// Generate with Replicate API
async function generateWithReplicate(prompt, negativePrompt, modelConfig, dimensions, steps, guidance) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured. Please add it to your environment variables.');
    }

    const [width, height] = dimensions.split('x').map(Number);

    // Prepare request
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: modelConfig.replicateModel,
            input: {
                prompt,
                negative_prompt: negativePrompt || '',
                width,
                height,
                num_inference_steps: steps || 20,
                guidance_scale: guidance || 7.5,
                num_outputs: 1
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Replicate API error: ${error.detail || response.statusText}`);
    }

    const prediction = await response.json();
    console.log('[Replicate] Prediction created:', prediction.id);

    // Poll for result
    const resultUrl = await pollReplicatePrediction(prediction.id, REPLICATE_API_TOKEN);

    return {
        url: resultUrl,
        thumbnail: resultUrl
    };
}

// Poll Replicate prediction until complete
async function pollReplicatePrediction(predictionId, token) {
    const maxAttempts = 60; // 60 seconds max
    let attempts = 0;

    while (attempts < maxAttempts) {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to check prediction status');
        }

        const prediction = await response.json();

        if (prediction.status === 'succeeded') {
            // Return first output image
            return Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
        }

        if (prediction.status === 'failed') {
            throw new Error(prediction.error || 'Prediction failed');
        }

        if (prediction.status === 'canceled') {
            throw new Error('Prediction was canceled');
        }

        // Wait 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
    }

    throw new Error('Image generation timed out after 60 seconds');
}

// Generate with OpenAI DALL-E 3
async function generateWithOpenAI(prompt, dimensions, quantity) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured. Please add it to your environment variables.');
    }

    // DALL-E 3 only supports specific sizes
    let size = '1024x1024'; // default
    if (dimensions === '1024x1792' || dimensions === '1792x1024') {
        size = dimensions;
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt.substring(0, 4000), // DALL-E 3 limit
            n: Math.min(quantity || 1, 1), // DALL-E 3 only supports 1 image at a time
            size,
            quality: 'standard',
            response_format: 'url'
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('[OpenAI] Image generated successfully');

    return {
        url: data.data[0].url,
        thumbnail: data.data[0].url
    };
}

// Enhance prompt with style presets
function enhancePrompt(prompt, style) {
    const styleEnhancements = {
        'realistic': ', photorealistic, highly detailed, 8k uhd, professional photography',
        'artistic': ', artistic, creative, expressive, masterpiece, fine art',
        'anime': ', anime style, manga, cel shaded, vibrant colors, Japanese animation',
        '3d-render': ', 3d render, octane render, unreal engine, highly detailed, volumetric lighting',
        'watercolor': ', watercolor painting, soft colors, artistic, flowing, traditional art',
        'oil-painting': ', oil painting, impressionist, thick brush strokes, classical art',
        'pencil-sketch': ', pencil sketch, hand drawn, black and white, detailed line art'
    };

    const enhancement = styleEnhancements[style] || '';
    return prompt + enhancement;
}
