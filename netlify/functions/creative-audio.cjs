// Phase 9: Text-to-Speech Generation Function
// Supports: Coqui TTS (free), ElevenLabs (premium), OpenAI TTS, Google Cloud TTS
// Includes voice cloning capability

const textToSpeech = require('@google-cloud/text-to-speech');

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
        const { text, engine, voice, language, speed, cloneFile } = JSON.parse(event.body);

        console.log('[TTS Generation] Request received:', {
            engine,
            voice,
            language,
            textLength: text?.length
        });

        // Validation
        if (!text || text.trim().length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Text is required' })
            };
        }

        if (text.length > 5000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Text too long. Maximum 5000 characters.' })
            };
        }

        let result;
        switch (engine) {
            case 'coqui':
                result = await generateWithCoqui(text, voice, language, speed, cloneFile);
                break;
            case 'elevenlabs':
                result = await generateWithElevenLabs(text, voice, language, speed);
                break;
            case 'openai':
                result = await generateWithOpenAI(text, voice, speed);
                break;
            case 'google-cloud':
                result = await generateWithGoogleCloud(text, voice, language, speed);
                break;
            default:
                throw new Error(`Unsupported engine: ${engine}`);
        }

        console.log('[TTS Generation] ✓ Generation successful');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                url: result.url,
                duration: result.duration,
                metadata: {
                    engine,
                    voice,
                    language,
                    textLength: text.length,
                    generatedAt: new Date().toISOString()
                }
            })
        };

    } catch (error) {
        console.error('[TTS Generation] ✗ Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'TTS generation failed',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};

// Generate with Coqui TTS (via Replicate)
async function generateWithCoqui(text, voice, language, speed, cloneFile) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured');
    }

    // Use Coqui XTTS on Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: 'coqui/xtts-v2',
            input: {
                text,
                language: language || 'en',
                speaker_wav: cloneFile || null,
                speed: speed || 1.0
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Coqui TTS error: ${error.detail || response.statusText}`);
    }

    const prediction = await response.json();
    console.log('[Coqui] Prediction created:', prediction.id);

    // Poll for result
    const resultUrl = await pollReplicatePrediction(prediction.id, REPLICATE_API_TOKEN);

    // Estimate duration (roughly 1 char = 0.06 seconds)
    const estimatedDuration = Math.ceil(text.length * 0.06 / speed);

    return {
        url: resultUrl,
        duration: estimatedDuration
    };
}

// Generate with ElevenLabs
async function generateWithElevenLabs(text, voice, language, speed) {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY not configured. This is a premium feature - sign up at elevenlabs.io');
    }

    // Map voice names to ElevenLabs voice IDs
    const voiceIds = {
        'default': '21m00Tcm4TlvDq8ikWAM', // Rachel
        'alloy': 'pNInz6obpgDQGcFmaJgB', // Adam
        'echo': 'VR6AewLTigWG4xSOukaG', // Arnold
        'fable': 'TX3LPaxmHKxFdv7VOQHJ', // Bella
        'onyx': 'EXAVITQu4vr4xnSDxMaL', // Gigi
        'nova': 'IKne3meq5aSn9XLyUdCD', // Freya
        'shimmer': 'ThT5KcBeYPX3keUQqHPh' // Grace
    };

    const voiceId = voiceIds[voice] || voiceIds['default'];

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                speed: speed || 1.0
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`ElevenLabs API error: ${error.detail?.message || response.statusText}`);
    }

    // Get audio as buffer
    const audioBuffer = await response.arrayBuffer();
    
    // TODO: Upload to storage (Supabase storage or similar)
    // For now, return base64 data URL
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log('[ElevenLabs] Audio generated successfully');

    // Estimate duration
    const estimatedDuration = Math.ceil(text.length * 0.06 / (speed || 1.0));

    return {
        url: dataUrl,
        duration: estimatedDuration
    };
}

// Generate with OpenAI TTS
async function generateWithOpenAI(text, voice, speed) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    // OpenAI supported voices
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const selectedVoice = validVoices.includes(voice) ? voice : 'alloy';

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: selectedVoice,
            speed: speed || 1.0
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI TTS error: ${error.error?.message || response.statusText}`);
    }

    // Get audio as buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 data URL
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log('[OpenAI] Audio generated successfully');

    // Estimate duration
    const estimatedDuration = Math.ceil(text.length * 0.06 / (speed || 1.0));

    return {
        url: dataUrl,
        duration: estimatedDuration
    };
}

// Generate with Google Cloud TTS
async function generateWithGoogleCloud(text, voice, language, speed) {
    const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
    
    if (!GOOGLE_CLOUD_API_KEY) {
        throw new Error('GOOGLE_CLOUD_API_KEY not configured. Get your API key from console.cloud.google.com');
    }

    // Create client with API key
    const client = new textToSpeech.TextToSpeechClient({
        apiKey: GOOGLE_CLOUD_API_KEY
    });

    // Parse voice name (format: "en-US-Neural2-F")
    const languageCode = voice.split('-').slice(0, 2).join('-') || language || 'en-US';

    // Build request
    const request = {
        input: { text },
        voice: {
            languageCode: languageCode,
            name: voice || 'en-US-Neural2-F'
        },
        audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: speed || 1.0
        }
    };

    console.log('[Google Cloud TTS] Generating audio:', { voice, languageCode, textLength: text.length });

    // Perform TTS request
    const [response] = await client.synthesizeSpeech(request);

    // Convert audio content to base64 data URL
    const audioContent = response.audioContent;
    const base64Audio = Buffer.from(audioContent).toString('base64');
    const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log('[Google Cloud TTS] ✓ Audio generated successfully');

    // Estimate duration (roughly 1 char = 0.06 seconds)
    const estimatedDuration = Math.ceil(text.length * 0.06 / (speed || 1.0));

    return {
        url: dataUrl,
        duration: estimatedDuration
    };
}

// Poll Replicate prediction
async function pollReplicatePrediction(predictionId, token) {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
                'Authorization': `Token ${token}`
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
            throw new Error(prediction.error || 'Prediction failed');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
    }

    throw new Error('TTS generation timed out');
}
