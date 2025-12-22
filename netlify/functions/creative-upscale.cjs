// Phase 9: Image Upscaling Function
// Uses Real-ESRGAN for 4x upscaling
// Optional GFPGAN for face restoration

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
        const { imageUrl, scale, faceRestore } = JSON.parse(event.body);

        console.log('[Image Upscale] Request received:', {
            imageUrl: imageUrl?.substring(0, 50) + '...',
            scale,
            faceRestore
        });

        // Validation
        if (!imageUrl) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Image URL is required' })
            };
        }

        // Upscale with Real-ESRGAN via Replicate
        const result = await upscaleWithReplicate(imageUrl, scale || 4, faceRestore || false);

        console.log('[Image Upscale] ✓ Upscaling successful');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                url: result.url,
                originalSize: result.originalSize,
                newSize: result.newSize,
                metadata: {
                    scale: scale || 4,
                    faceRestore,
                    upscaledAt: new Date().toISOString()
                }
            })
        };

    } catch (error) {
        console.error('[Image Upscale] ✗ Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Image upscaling failed',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};

// Upscale with Real-ESRGAN via Replicate
async function upscaleWithReplicate(imageUrl, scale, faceRestore) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured. Please add it to your environment variables.');
    }

    // Choose model based on face restoration requirement
    const modelVersion = faceRestore 
        ? 'tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3'
        : 'nightmareai/real-esrgan:42186ee6d4fe5b7e45f3e08c88a4d2b3c56e5a4d7b2fd8cc0f9f0c8a2a8a9c';

    console.log('[Upscale] Using model:', faceRestore ? 'GFPGAN (with face restore)' : 'Real-ESRGAN');

    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: modelVersion,
            input: {
                image: imageUrl,
                scale: scale,
                face_enhance: faceRestore
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Replicate API error: ${error.detail || response.statusText}`);
    }

    const prediction = await response.json();
    console.log('[Replicate Upscale] Prediction created:', prediction.id);

    // Poll for result
    const resultUrl = await pollReplicatePrediction(prediction.id, REPLICATE_API_TOKEN);

    // Get image dimensions (approximate based on scale)
    return {
        url: resultUrl,
        originalSize: { width: 1024, height: 1024 }, // Placeholder
        newSize: { width: 1024 * scale, height: 1024 * scale }
    };
}

// Poll Replicate prediction
async function pollReplicatePrediction(predictionId, token) {
    const maxAttempts = 120; // Upscaling can take a while
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
            return Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
        }

        if (prediction.status === 'failed') {
            throw new Error(prediction.error || 'Upscaling failed');
        }

        if (prediction.status === 'canceled') {
            throw new Error('Upscaling was canceled');
        }

        // Wait 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
    }

    throw new Error('Image upscaling timed out after 2 minutes');
}
