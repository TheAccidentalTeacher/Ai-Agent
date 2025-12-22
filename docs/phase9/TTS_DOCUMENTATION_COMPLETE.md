# Phase 9: Text-to-Speech (TTS) - COMPLETE DOCUMENTATION

**Last Updated**: December 21, 2024  
**Status**: ⚠️ **PARTIALLY READY** - Backend complete, awaiting API key testing  
**Ready for Testing**: Coqui TTS (FREE), OpenAI TTS, ElevenLabs (needs key)

---

## 🎯 Executive Summary

Phase 9 Creative Studio includes **3 AI text-to-speech engines** with voice cloning capabilities:

| Engine | Provider | Speed | Cost | Quality | Status |
|--------|----------|-------|------|---------|--------|
| **Coqui TTS** | Replicate | 10-20s | FREE | Good, voice cloning | ✅ READY (needs testing) |
| **OpenAI TTS** | OpenAI | 5-15s | $0.015/1k chars | Professional | ✅ READY (needs testing) |
| **ElevenLabs** | ElevenLabs | 5-10s | $5-99/mo | Premium | ⚠️ NEEDS API KEY |

---

## 📁 File Structure

```
C:\Users\scoso\WEBSITES\Game Editor\
│
├── creative-studio-ui.js (946 lines)
│   ├── Audio panel with form controls (40% left)
│   │   ├── Text input (5000 char limit)
│   │   ├── Engine dropdown (3 options)
│   │   ├── Voice dropdown (7 voices)
│   │   ├── Language dropdown (9 languages)
│   │   ├── Speed slider (0.5x - 2.0x)
│   │   └── Voice cloning file upload
│   └── generateAudio() function (lines 695-750)
│
├── netlify/functions/creative-audio.cjs (283 lines)
│   ├── Request handler (lines 1-80)
│   ├── Coqui TTS generator (lines 90-135)
│   ├── ElevenLabs generator (lines 138-200)
│   ├── OpenAI TTS generator (lines 203-250)
│   └── Replicate polling helper (lines 253-283)
│
└── .env
    ├── REPLICATE_API_TOKEN=r8_40z... (✅ CONFIGURED - for Coqui)
    ├── OPENAI_API_KEY=sk-proj-... (✅ CONFIGURED - for OpenAI TTS)
    └── ELEVENLABS_API_KEY=??? (⚠️ NOT CONFIGURED - optional premium)
```

---

## 🔧 Technical Implementation

### Frontend Form (creative-studio-ui.js)

**Text Input** (Lines 338-346):
```javascript
<textarea 
    id="audio-text" 
    placeholder="Enter the text you want to convert to speech..." 
    style="height: 180px; width: 100%;"
    maxlength="5000"
></textarea>
<small class="char-count">0 / 5000</small>
```

**Engine Selection** (Lines 348-354):
```javascript
<select id="audio-engine">
    <option value="coqui">Coqui TTS (Free)</option>
    <option value="elevenlabs">ElevenLabs (Premium)</option>
    <option value="openai">OpenAI TTS</option>
</select>
```

**Voice Options** (Lines 356-366):
```javascript
<select id="audio-voice">
    <option value="default">Default (English)</option>
    <option value="alloy">Alloy (Neutral)</option>
    <option value="echo">Echo (Male)</option>
    <option value="fable">Fable (British)</option>
    <option value="onyx">Onyx (Deep)</option>
    <option value="nova">Nova (Female)</option>
    <option value="shimmer">Shimmer (Soft)</option>
</select>
```

**Language Support** (Lines 368-380):
```javascript
<select id="audio-language">
    <option value="en">English</option>
    <option value="es">Spanish</option>
    <option value="fr">French</option>
    <option value="de">German</option>
    <option value="it">Italian</option>
    <option value="pt">Portuguese</option>
    <option value="zh">Chinese</option>
    <option value="ja">Japanese</option>
    <option value="ko">Korean</option>
</select>
```

**Speed Control** (Lines 382-388):
```javascript
<input 
    type="range" 
    id="audio-speed" 
    min="0.5" 
    max="2.0" 
    value="1.0" 
    step="0.1"
>
<span class="range-value">1.0x</span>
```

**Voice Cloning** (Lines 390-400):
```javascript
<div class="file-upload-area">
    <input 
        type="file" 
        id="audio-clone-file" 
        accept="audio/*" 
        style="display: none;"
    >
    <button 
        class="file-upload-btn" 
        onclick="document.getElementById('audio-clone-file').click()"
    >
        📁 Upload Reference Audio
    </button>
    <small>Upload a 10-30 second audio sample for voice cloning</small>
</div>
```

### Generation Function (creative-studio-ui.js, lines 695-750)

```javascript
async function generateAudio() {
    const settings = {
        text: document.getElementById('audio-text').value.trim(),
        engine: document.getElementById('audio-engine').value,
        voice: document.getElementById('audio-voice').value,
        language: document.getElementById('audio-language').value,
        speed: parseFloat(document.getElementById('audio-speed').value),
        cloneFile: null  // TODO: Handle file upload
    };

    // Validation
    if (!settings.text || settings.text.length < 10) {
        alert('Please enter text (at least 10 characters)');
        return;
    }

    if (settings.text.length > 5000) {
        alert('Text too long. Maximum 5000 characters.');
        return;
    }

    // Show loading state
    showLoadingState('audio', 'Generating speech...');

    try {
        // Call backend API
        const response = await fetch('/api/creative-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'TTS generation failed');
        }

        const result = await response.json();

        // Display audio player in preview panel
        displayAudioResult(result);

    } catch (error) {
        console.error('TTS generation error:', error);
        showError('audio', error.message);
    }
}
```

---

## 🔌 Backend API Implementation

### Request Handler (creative-audio.cjs, lines 1-80)

```javascript
// Phase 9: Text-to-Speech Generation Function
// Supports: Coqui TTS (free), ElevenLabs (premium), OpenAI TTS
// Includes voice cloning capability

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
```

---

## 🎤 Engine 1: Coqui TTS (FREE via Replicate)

**Status**: ✅ READY (needs user testing with REPLICATE_API_TOKEN)

**Implementation** (creative-audio.cjs, lines 90-135):

```javascript
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
```

**Features**:
- **Voice Cloning**: Upload 10-30 second audio sample
- **Multi-Language**: 9 languages supported
- **Speed Control**: 0.5x - 2.0x playback speed
- **Cost**: FREE (unlimited via Replicate)
- **Quality**: Good, natural-sounding voices

**Configuration**:
- **API Token**: `REPLICATE_API_TOKEN` in .env (✅ CONFIGURED)
- **Model**: Coqui XTTS v2
- **Speed**: 10-20 seconds for typical text
- **Output**: Audio file URL (MP3/WAV)

---

## 💎 Engine 2: ElevenLabs (Premium)

**Status**: ⚠️ NEEDS API KEY (backend ready, key not configured)

**Implementation** (creative-audio.cjs, lines 138-200):

```javascript
// Generate with ElevenLabs
async function generateWithElevenLabs(text, voice, language, speed) {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY not configured. This is a premium feature - sign up at elevenlabs.io');
    }

    // Map voice names to ElevenLabs voice IDs
    const voiceIds = {
        'default': '21m00Tcm4TlvDq8ikWAM', // Rachel
        'alloy': 'EXAVITQu4vr4xnSDxMaL',  // Bella
        'echo': 'pNInz6obpgDQGcFmaJgB',   // Adam
        'fable': 'onwK4e9ZLuTAKqWW03F9', // Arnold
        'onyx': 'VR6AewLTigWG4xSOukaG',  // Antoni
        'nova': 'jsCqWAovK2LkecY7zXl4',  // Dorothy
        'shimmer': 'ThT5KcBeYPX3keUQqHPh' // Freya
    };

    const voiceId = voiceIds[voice] || voiceIds['default'];

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.0,
                use_speaker_boost: true,
                speaking_rate: speed || 1.0
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`ElevenLabs error: ${error.detail?.message || response.statusText}`);
    }

    // Response is raw audio bytes
    const audioBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    // Estimate duration
    const estimatedDuration = Math.ceil(text.length * 0.06 / speed);

    return {
        url: audioUrl,
        duration: estimatedDuration
    };
}
```

**Features**:
- **Premium Quality**: Highest quality TTS available
- **29 Realistic Voices**: Professional voice actors
- **Voice Cloning**: Upload samples for custom voices
- **Multi-Language**: 28 languages supported
- **Emotion Control**: Adjust tone, style, stability

**Pricing**:
- **Free Tier**: 10,000 characters/month (~20 minutes)
- **Starter**: $5/month for 30,000 characters
- **Creator**: $11/month for 100,000 characters
- **Pro**: $99/month for 500,000 characters

**Configuration**:
- **API Key**: `ELEVENLABS_API_KEY` in .env (⚠️ NOT CONFIGURED)
- **Get Key**: https://elevenlabs.io/app/speech-synthesis
- **Model**: eleven_monolingual_v1
- **Output**: Base64-encoded MP3

**How to Add API Key**:
```bash
# 1. Sign up at https://elevenlabs.io
# 2. Go to Profile → API Keys
# 3. Create new API key
# 4. Add to .env:
ELEVENLABS_API_KEY=your_key_from_elevenlabs_io
```

---

## 🤖 Engine 3: OpenAI TTS

**Status**: ✅ READY (OPENAI_API_KEY configured, needs testing)

**Implementation** (creative-audio.cjs, lines 203-250):

```javascript
// Generate with OpenAI TTS
async function generateWithOpenAI(text, voice, speed) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    // Map voice names to OpenAI voices
    const voices = {
        'default': 'alloy',
        'alloy': 'alloy',
        'echo': 'echo',
        'fable': 'fable',
        'onyx': 'onyx',
        'nova': 'nova',
        'shimmer': 'shimmer'
    };

    const selectedVoice = voices[voice] || 'alloy';

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'tts-1-hd',  // High-definition model
            input: text,
            voice: selectedVoice,
            speed: speed || 1.0
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI TTS error: ${error.error?.message || response.statusText}`);
    }

    // Response is raw audio bytes
    const audioBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    // Estimate duration
    const estimatedDuration = Math.ceil(text.length * 0.06 / speed);

    return {
        url: audioUrl,
        duration: estimatedDuration
    };
}
```

**Features**:
- **6 Built-in Voices**: Alloy, Echo, Fable, Onyx, Nova, Shimmer
- **HD Quality**: tts-1-hd model (highest quality)
- **Speed Control**: 0.25x - 4.0x (wider range than others)
- **Multi-Language**: Auto-detects language from text
- **Fast Generation**: 5-15 seconds typical

**Voices**:
| Voice | Description | Gender | Accent |
|-------|-------------|--------|--------|
| Alloy | Neutral, balanced | Neutral | American |
| Echo | Male, professional | Male | American |
| Fable | British, expressive | Male | British |
| Onyx | Deep, authoritative | Male | American |
| Nova | Female, friendly | Female | American |
| Shimmer | Soft, warm | Female | American |

**Pricing**:
- **tts-1**: $15 per 1M characters (~$0.015 per 1k chars)
- **tts-1-hd**: $30 per 1M characters (~$0.030 per 1k chars)
- **Example**: 1000 characters = $0.03 (HD model)

**Configuration**:
- **API Key**: `OPENAI_API_KEY` in .env (✅ CONFIGURED)
- **Model**: tts-1-hd (high-definition)
- **Speed**: 5-15 seconds for typical text
- **Output**: Base64-encoded MP3

---

## 📊 Comparison Matrix

### Cost Comparison

| Engine | Free Tier | Pay-Per-Use | Monthly Plan | Best For |
|--------|-----------|-------------|--------------|----------|
| **Coqui TTS** | ✅ Unlimited | FREE | N/A | Budget, voice cloning |
| **OpenAI TTS** | ❌ None | $0.03/1k chars | N/A | Professional quality |
| **ElevenLabs** | 10k chars/mo | ❌ N/A | $5-99/mo | Premium, emotion control |

### Feature Comparison

| Feature | Coqui TTS | OpenAI TTS | ElevenLabs |
|---------|-----------|------------|------------|
| Voice Cloning | ✅ Yes | ❌ No | ✅ Yes (premium) |
| Languages | 9 | Auto-detect | 28 |
| Speed Control | 0.5x - 2.0x | 0.25x - 4.0x | 0.5x - 2.0x |
| Voices | Custom | 6 built-in | 29 professional |
| Quality | Good | Professional | Premium |
| Generation Time | 10-20s | 5-15s | 5-10s |
| Cost | FREE | $0.03/1k chars | $5-99/mo |

### Quality Comparison

**Sound Quality** (1-10):
- Coqui TTS: 7/10 (natural, but some artifacts)
- OpenAI TTS: 8/10 (professional, clear)
- ElevenLabs: 10/10 (indistinguishable from human)

**Voice Variety**:
- Coqui TTS: Unlimited (via voice cloning)
- OpenAI TTS: 6 voices (fixed)
- ElevenLabs: 29 voices + custom cloning

**Emotion/Expression**:
- Coqui TTS: Limited
- OpenAI TTS: Moderate (natural intonation)
- ElevenLabs: Excellent (emotion control, style adjustment)

---

## 🔑 API Keys Status

**Current Configuration**:
```env
# ✅ CONFIGURED (Ready for Testing)
REPLICATE_API_TOKEN=r8_40z6KPvdQYamk43KQ...  # For Coqui TTS
OPENAI_API_KEY=sk-proj-LhXr_8dNtwe18PIt...   # For OpenAI TTS

# ⚠️ NOT CONFIGURED (Optional Premium)
ELEVENLABS_API_KEY=(not set)
```

**To Complete Setup**:

1. **For Coqui TTS** (FREE):
   - ✅ Already have `REPLICATE_API_TOKEN`
   - Ready to test immediately

2. **For OpenAI TTS**:
   - ✅ Already have `OPENAI_API_KEY`
   - Ready to test immediately

3. **For ElevenLabs** (Optional):
   ```bash
   # Get key from https://elevenlabs.io
   # Add to .env:
   ELEVENLABS_API_KEY=your_elevenlabs_key_here
   
   # Or set in Netlify:
   netlify env:set ELEVENLABS_API_KEY "your_key_here"
   ```

---

## ✅ Testing Checklist

### Ready to Test (Have API Keys)

**Coqui TTS** (FREE):
- [ ] Generate basic speech (English)
- [ ] Test Spanish language
- [ ] Test speed control (0.5x, 1.0x, 2.0x)
- [ ] Test voice cloning (upload 10s sample)
- [ ] Verify audio plays in browser
- [ ] Check audio quality

**OpenAI TTS**:
- [ ] Test all 6 voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- [ ] Test speed control (0.5x, 1.0x, 1.5x, 2.0x)
- [ ] Test long text (1000+ characters)
- [ ] Test multi-language (Spanish, French, etc.)
- [ ] Verify HD quality (tts-1-hd model)
- [ ] Compare with Coqui quality

### Needs API Key

**ElevenLabs** (Premium):
- [ ] Sign up for account
- [ ] Generate API key
- [ ] Add to .env file
- [ ] Test premium voices
- [ ] Test emotion controls
- [ ] Compare with free options

---

## 🐛 Known Issues

### Issue 1: Voice Cloning Not Implemented
**Status**: Backend ready, frontend upload incomplete  
**Location**: creative-studio-ui.js, line 398  
**Solution Needed**:
```javascript
// TODO: Handle file upload for voice cloning
const cloneFileInput = document.getElementById('audio-clone-file');
if (cloneFileInput.files.length > 0) {
    const file = cloneFileInput.files[0];
    // Convert to base64 or upload to storage
    settings.cloneFile = await convertFileToBase64(file);
}
```

### Issue 2: Character Counter Not Live-Updating
**Status**: Counter shows "0 / 5000" but doesn't update as user types  
**Location**: creative-studio-ui.js, line 344  
**Solution Needed**:
```javascript
document.getElementById('audio-text').addEventListener('input', function(e) {
    const charCount = e.target.value.length;
    const counter = e.target.nextElementSibling;
    counter.textContent = `${charCount} / 5000`;
    
    // Warn if approaching limit
    if (charCount > 4500) {
        counter.style.color = 'red';
    } else {
        counter.style.color = '';
    }
});
```

### Issue 3: Duration Estimation Inaccurate
**Status**: Uses rough estimate (1 char = 0.06s), not actual duration  
**Impact**: Minor - doesn't affect functionality  
**Solution**: Get actual duration from audio file metadata after generation

---

## 🚀 Usage Examples

### Example 1: Generate with Coqui TTS (FREE)
```javascript
const settings = {
    text: "Welcome to the Universal Cognitive Amplification System. This is a test of the Coqui text-to-speech engine with voice cloning capabilities.",
    engine: "coqui",
    voice: "default",
    language: "en",
    speed: 1.0,
    cloneFile: null
};

// Expected result:
// - Audio generated in 10-20 seconds
// - Natural-sounding voice
// - FREE (no cost)
// - URL: Replicate delivery CDN
```

### Example 2: Generate with OpenAI TTS
```javascript
const settings = {
    text: "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
    engine: "openai",
    voice: "nova",  // Female, friendly voice
    speed: 1.2,     // Slightly faster
    language: "en"
};

// Expected result:
// - Audio generated in 5-15 seconds
// - Professional HD quality
// - Cost: ~$0.01 (for 100 characters)
// - Format: Base64-encoded MP3
```

### Example 3: Generate with ElevenLabs (Premium)
```javascript
const settings = {
    text: "In a world where AI amplifies human potential, creativity knows no bounds.",
    engine: "elevenlabs",
    voice: "onyx",   // Deep, authoritative
    language: "en",
    speed: 0.9       // Slightly slower for emphasis
};

// Expected result (if API key configured):
// - Audio generated in 5-10 seconds
// - Premium quality, indistinguishable from human
// - Cost: Deducted from monthly quota
// - Emotion and expression fully controlled
```

---

## 📝 Integration with Server

**Server Endpoint** (server.cjs - needs to be added):

```javascript
// Phase 9: Creative Audio endpoint
if (functionPath === 'creative-audio') {
    console.log(`[${requestId}] 🎤 Routing to creative-audio endpoint`);
    
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    
    req.on('end', async () => {
        try {
            const event = {
                httpMethod: req.method,
                headers: req.headers,
                body: body,
                path: req.url
            };
            
            const audioFunction = require('./netlify/functions/creative-audio.cjs');
            const result = await audioFunction.handler(event, {});
            
            const duration = Date.now() - startTime;
            console.log(`[${requestId}] ✅ Creative audio completed in ${duration}ms`);
            
            res.writeHead(result.statusCode, result.headers || {});
            res.end(result.body);
            
        } catch (error) {
            console.error(`[${requestId}] ❌ Audio generation error:`, error);
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
                error: error.message || 'Audio generation failed'
            }));
        }
    });
    
    return;
}
```

**Note**: This endpoint needs to be added to server.cjs similar to creative-image endpoint.

---

## 🔗 Related Documentation

- [IMAGE_GENERATION_COMPLETE.md](./IMAGE_GENERATION_COMPLETE.md) - Image generation docs
- [PHASE_9_COMPLETION.md](../../PHASE_9_COMPLETION.md) - Full Phase 9 overview
- [ENV_VARIABLES_PHASE9.md](../../ENV_VARIABLES_PHASE9.md) - API setup guide
- [CONTEXT_LOADER.md](../ai/CONTEXT_LOADER.md) - Master index

---

## 📝 Next Steps

1. **Immediate Testing** (Have API keys):
   - [ ] Test Coqui TTS with basic English text
   - [ ] Test OpenAI TTS with all 6 voices
   - [ ] Verify audio plays in browser
   - [ ] Compare quality between Coqui and OpenAI

2. **Add Server Integration**:
   - [ ] Add `/api/creative-audio` endpoint to server.cjs
   - [ ] Test from frontend form
   - [ ] Verify error handling
   - [ ] Check audio playback in preview panel

3. **Optional Premium**:
   - [ ] Sign up for ElevenLabs account
   - [ ] Add ELEVENLABS_API_KEY to .env
   - [ ] Test premium features
   - [ ] Compare quality with free options

4. **Enhance Features**:
   - [ ] Implement voice cloning file upload
   - [ ] Add live character counter
   - [ ] Get actual audio duration from file
   - [ ] Add progress bar during generation
   - [ ] Support batch TTS (multiple texts)

---

**Document Version**: 1.0  
**Author**: AI Agent (Autonomous Documentation)  
**Generated**: December 21, 2024  
**Status**: Backend complete, ready for testing with existing API keys
