// Phase 9: Music Generation Function
// Supports: Google Lyria 2 (Replicate), MiniMax Music
// Generates music from text descriptions with genre, tempo, mood controls

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
        const { prompt, genre, duration, tempo, mood } = JSON.parse(event.body);

        console.log('[Music Generation] Request received:', {
            genre,
            duration,
            tempo,
            mood,
            promptLength: prompt?.length
        });

        // Validation
        if (!prompt || prompt.trim().length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Music description is required' })
            };
        }

        if (prompt.length > 1000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Description too long. Maximum 1000 characters.' })
            };
        }

        // Enhance prompt with parameters
        const enhancedPrompt = buildMusicPrompt(prompt, genre, tempo, mood);

        // Generate music via Replicate
        const result = await generateMusicWithReplicate(enhancedPrompt, duration);

        console.log('[Music Generation] ✓ Generation successful');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                url: result.url,
                duration: duration || 30,
                metadata: {
                    genre,
                    tempo,
                    mood,
                    duration,
                    prompt: enhancedPrompt,
                    generatedAt: new Date().toISOString()
                }
            })
        };

    } catch (error) {
        console.error('[Music Generation] ✗ Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Music generation failed',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};

// Generate music with Replicate (using MusicGen or similar)
async function generateMusicWithReplicate(prompt, duration) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN not configured. Please add it to your environment variables.');
    }

    // Use Meta's MusicGen model (free on Replicate)
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: 'meta/musicgen:7be0f12c54a8d033a0fbd14418c9af98962da9a86f5ff7811f9b3423a1f0b7d7',
            input: {
                prompt,
                duration: duration || 30,
                model_version: 'stereo-large',
                output_format: 'mp3',
                normalization_strategy: 'loudness'
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Replicate API error: ${error.detail || response.statusText}`);
    }

    const prediction = await response.json();
    console.log('[Replicate Music] Prediction created:', prediction.id);

    // Poll for result
    const resultUrl = await pollReplicatePrediction(prediction.id, REPLICATE_API_TOKEN);

    return {
        url: resultUrl,
        duration: duration || 30
    };
}

// Poll Replicate prediction
async function pollReplicatePrediction(predictionId, token) {
    const maxAttempts = 120; // Music takes longer - allow 2 minutes
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
            throw new Error(prediction.error || 'Music generation failed');
        }

        if (prediction.status === 'canceled') {
            throw new Error('Music generation was canceled');
        }

        // Wait 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
    }

    throw new Error('Music generation timed out after 2 minutes');
}

// Build enhanced music prompt
function buildMusicPrompt(basePrompt, genre, tempo, mood) {
    let enhanced = basePrompt;

    // Add genre
    if (genre && genre !== 'electronic') {
        const genreDescriptions = {
            'ambient': 'ambient, atmospheric, soundscape',
            'classical': 'classical music, orchestral',
            'jazz': 'jazz, smooth, improvisational',
            'rock': 'rock music, guitar-driven',
            'pop': 'pop music, catchy, melodic',
            'cinematic': 'cinematic, epic, film score',
            'lo-fi': 'lo-fi, chill, relaxed beats'
        };
        enhanced += `, ${genreDescriptions[genre] || genre}`;
    }

    // Add mood
    if (mood) {
        const moodDescriptions = {
            'happy': 'upbeat, cheerful, positive',
            'sad': 'melancholic, emotional, somber',
            'energetic': 'energetic, driving, powerful',
            'calm': 'calm, peaceful, soothing',
            'mysterious': 'mysterious, dark, enigmatic',
            'epic': 'epic, grand, dramatic'
        };
        enhanced += `, ${moodDescriptions[mood] || mood}`;
    }

    // Add tempo descriptor
    if (tempo) {
        if (tempo < 80) {
            enhanced += ', slow tempo';
        } else if (tempo > 140) {
            enhanced += ', fast tempo';
        } else {
            enhanced += ', medium tempo';
        }
    }

    return enhanced;
}
