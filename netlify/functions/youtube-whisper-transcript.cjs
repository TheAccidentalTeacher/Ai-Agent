/**
 * Netlify Function: YouTube Whisper Transcript
 * 
 * Fallback transcript generation using OpenAI Whisper API
 * Used when YouTube captions are not available
 * 
 * Flow:
 * 1. Get audio stream URL from YouTube using @distube/ytdl-core
 * 2. Download audio directly
 * 3. Send to OpenAI Whisper API
 * 4. Return formatted transcript with timestamps
 * 
 * Updated: Using @distube/ytdl-core for better reliability
 */

const ytdl = require('@distube/ytdl-core');
const { fetch: undiciFetch } = require('undici');

// OpenAI Whisper API endpoint
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'OpenAI API key not configured' })
    };
  }

  try {
    const { videoId, language = 'en' } = JSON.parse(event.body);

    if (!videoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'videoId is required' })
      };
    }

    console.log(`🎤 Whisper transcription for video: ${videoId}`);
    const startTime = Date.now();

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Get video info first
    console.log('   Getting video info...');
    let videoInfo;
    try {
      videoInfo = await ytdl.getInfo(videoUrl, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        }
      });
    } catch (infoError) {
      console.error('   Failed to get video info:', infoError.message);
      throw new Error(`Cannot access video: ${infoError.message}`);
    }

    const duration = parseInt(videoInfo.videoDetails?.lengthSeconds) || 0;
    const title = videoInfo.videoDetails?.title || 'Unknown';
    
    console.log(`   Title: ${title}`);
    console.log(`   Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`);

    // Check video length - Whisper has 25MB file limit
    // Approximately 1MB per minute of audio at low quality
    if (duration > 1500) { // 25 minutes max to be safe
      throw new Error(`Video too long (${Math.floor(duration / 60)} min). Maximum is ~25 minutes for Whisper transcription.`);
    }

    // Get audio-only format
    const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audioonly');
    
    if (!audioFormats || audioFormats.length === 0) {
      throw new Error('No audio format available for this video');
    }

    // Sort by bitrate (lowest first for smaller file)
    audioFormats.sort((a, b) => (a.audioBitrate || 0) - (b.audioBitrate || 0));
    const audioFormat = audioFormats[0];

    console.log(`   Audio format: ${audioFormat.mimeType}, bitrate: ${audioFormat.audioBitrate}kbps`);
    console.log(`   Downloading audio...`);

    // Download audio as buffer
    const audioChunks = [];
    
    await new Promise((resolve, reject) => {
      const stream = ytdl(videoUrl, {
        format: audioFormat,
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      });

      stream.on('data', chunk => audioChunks.push(chunk));
      stream.on('end', resolve);
      stream.on('error', reject);
      
      // Timeout after 60 seconds
      setTimeout(() => reject(new Error('Audio download timeout')), 60000);
    });

    const audioBuffer = Buffer.concat(audioChunks);
    console.log(`   Audio size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Check file size (Whisper limit is 25MB)
    if (audioBuffer.length > 25 * 1024 * 1024) {
      throw new Error('Audio file too large for Whisper API (> 25MB). Try a shorter video.');
    }

    // Determine file extension from mime type
    let fileExt = 'webm';
    if (audioFormat.mimeType?.includes('mp4')) fileExt = 'm4a';
    else if (audioFormat.mimeType?.includes('webm')) fileExt = 'webm';
    else if (audioFormat.mimeType?.includes('opus')) fileExt = 'opus';

    // Send to OpenAI Whisper
    console.log(`   Sending to Whisper API...`);
    
    // Create form data manually for Node.js
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    
    const formParts = [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="file"; filename="audio.${fileExt}"\r\n`,
      `Content-Type: ${audioFormat.mimeType || 'audio/webm'}\r\n\r\n`
    ];
    
    const fileHeader = Buffer.from(formParts.join(''));
    
    const modelPart = Buffer.from(
      `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="model"\r\n\r\n` +
      `whisper-1\r\n`
    );
    
    const formatPart = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="response_format"\r\n\r\n` +
      `verbose_json\r\n`
    );
    
    const langPart = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="language"\r\n\r\n` +
      `${language}\r\n` +
      `--${boundary}--\r\n`
    );
    
    // Combine all parts
    const formBody = Buffer.concat([
      fileHeader,
      audioBuffer,
      modelPart,
      formatPart,
      langPart
    ]);

    const whisperResponse = await undiciFetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: formBody
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('Whisper API error:', errorText);
      throw new Error(`Whisper API error: ${whisperResponse.status} - ${errorText}`);
    }

    const whisperResult = await whisperResponse.json();
    console.log(`   Whisper transcription complete!`);

    // Transform Whisper response to our transcript format
    const segments = (whisperResult.segments || []).map(seg => ({
      text: seg.text.trim(),
      start: seg.start,
      duration: seg.end - seg.start,
      end: seg.end,
      timestamp: formatTimestamp(seg.start)
    }));

    // Build full text
    const fullText = whisperResult.text || segments.map(s => s.text).join(' ');

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ✅ Complete in ${processingTime}s`);

    // Calculate approximate cost ($0.006 per minute)
    const costEstimate = (duration / 60 * 0.006).toFixed(4);

    const response = {
      videoId,
      language: whisperResult.language || language,
      segments,
      fullText,
      totalDuration: duration,
      wordCount: fullText.split(/\s+/).filter(w => w.length > 0).length,
      segmentCount: segments.length,
      metadata: {
        source: 'whisper',
        model: 'whisper-1',
        processingTime: parseFloat(processingTime),
        costEstimate: parseFloat(costEstimate),
        audioSize: audioBuffer.length,
        detectedLanguage: whisperResult.language,
        videoTitle: title
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('❌ Whisper transcript error:', error);

    let errorMessage = error.message;
    let statusCode = 500;

    // Handle specific error types
    if (error.message.includes('Video unavailable') || 
        error.message.includes('Private video') ||
        error.message.includes('Sign in')) {
      errorMessage = 'Video is private, age-restricted, or requires sign-in';
      statusCode = 403;
    } else if (error.message.includes('too long') || error.message.includes('too large')) {
      statusCode = 413;
    } else if (error.message.includes('Cannot access')) {
      statusCode = 403;
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        videoId: JSON.parse(event.body || '{}').videoId
      })
    };
  }
};

/**
 * Format seconds to MM:SS or HH:MM:SS timestamp
 */
function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
