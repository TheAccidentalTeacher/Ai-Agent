# Phase 9: Creative Studio Environment Variables

## Required Environment Variables

### 1. REPLICATE_API_TOKEN (Required)
**Purpose**: Primary API for image generation, music generation, TTS, and upscaling

**How to get**:
1. Go to https://replicate.com
2. Sign up for a free account
3. Go to Account Settings → API Tokens
4. Create a new token
5. Copy the token (starts with `r8_`)

**Add to Netlify**:
```bash
netlify env:set REPLICATE_API_TOKEN "r8_your_token_here"
```

**Models used**:
- **Images**: Flux 2, Stable Diffusion XL, DreamShaper
- **Music**: Meta MusicGen (free), Google Lyria 2
- **TTS**: Coqui XTTS v2 (voice cloning)
- **Upscaling**: Real-ESRGAN, GFPGAN

**Pricing**: Pay-per-use, no monthly fee
- Image generation: ~$0.01-0.03 per image
- Music generation: ~$0.05-0.10 per 30 seconds
- Upscaling: ~$0.01 per image
- TTS: ~$0.001 per minute

**Free tier**: $5 credit on signup (enough for ~500 images or 100 music tracks)

---

### 2. OPENAI_API_KEY (Already configured)
**Purpose**: Fallback for DALL-E 3 image generation and OpenAI TTS

**Models used**:
- **Images**: DALL-E 3 (when Replicate unavailable)
- **TTS**: OpenAI TTS voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)

**Pricing**:
- DALL-E 3: $0.04-0.17 per image (depending on size/quality)
- TTS: $15 per 1M characters (~$0.015 per 1000 chars)

---

## Optional Premium Features

### 3. ELEVENLABS_API_KEY (Optional - Premium TTS)
**Purpose**: Highest quality text-to-speech with voice cloning

**How to get**:
1. Go to https://elevenlabs.io
2. Sign up for an account
3. Go to Profile → API Keys
4. Create a new API key

**Add to Netlify**:
```bash
netlify env:set ELEVENLABS_API_KEY "your_key_here"
```

**Pricing**:
- **Free tier**: 10,000 characters/month (~20 minutes of audio)
- **Starter**: $5/month for 30,000 characters
- **Creator**: $11/month for 100,000 characters
- **Pro**: $99/month for 500,000 characters

**Features**:
- 29 realistic voices
- Voice cloning from audio samples
- Multi-language support
- Emotion control
- Best quality available

**When to use**: When you need professional-grade voiceovers and have budget

---

### 4. HUGGINGFACE_API_KEY (Optional - Alternative Models)
**Purpose**: Access to 90,000+ free AI models on Hugging Face

**How to get**:
1. Go to https://huggingface.co
2. Sign up for a free account
3. Go to Settings → Access Tokens
4. Create a new token with "read" access

**Add to Netlify**:
```bash
netlify env:set HUGGINGFACE_API_KEY "hf_your_token_here"
```

**Pricing**: FREE for inference API (with rate limits)

**Models available**:
- Text-to-image: Stable Diffusion, FLUX.1-dev, DreamBooth fine-tunes
- Text-to-speech: Bark, FastSpeech2, MMS-TTS
- Music generation: MusicGen, AudioLDM
- Text-to-video: ModelScope, Zeroscope

**When to use**: When experimenting with different models or need free alternatives

---

### 5. STABILITY_API_KEY (Optional - Stable Diffusion)
**Purpose**: Direct access to Stability AI's Stable Diffusion models

**How to get**:
1. Go to https://platform.stability.ai
2. Sign up for an account
3. Go to Account → API Keys
4. Create a new API key

**Add to Netlify**:
```bash
netlify env:set STABILITY_API_KEY "sk-your_key_here"
```

**Pricing**:
- $10 free credits on signup
- Pay-as-you-go: $0.002-0.01 per image
- More control over generation parameters

**When to use**: When you need direct Stability AI integration or specific model versions

---

## Cost Estimates for 1000 Generations

### Images (1024×1024)
- **Replicate Flux 2**: $10-30 (recommended)
- **DALL-E 3**: $40-170
- **Stable Diffusion**: $2-10 (via Hugging Face or Stability)

### Audio/TTS (1 minute each)
- **Coqui TTS**: FREE via Replicate
- **OpenAI TTS**: $0.90
- **ElevenLabs**: $5-99 depending on plan

### Music (30 seconds each)
- **Replicate MusicGen**: FREE (open source)
- **Google Lyria 2**: $50-100 (premium quality)

### Image Upscaling (4x)
- **Real-ESRGAN**: $10-20 per 1000 images

---

## Recommended Setup for Phase 9

### Minimal Setup (FREE)
```bash
# Use existing OpenAI for DALL-E 3 fallback
# Already configured: OPENAI_API_KEY

# Add Replicate for free TTS and music
netlify env:set REPLICATE_API_TOKEN "r8_your_token_here"
```

**Cost**: $0/month (uses free credits)
**Capabilities**: Basic image generation, FREE TTS, FREE music, upscaling

---

### Recommended Setup ($5/month)
```bash
# Core generation
netlify env:set REPLICATE_API_TOKEN "r8_your_token_here"

# Premium TTS (optional)
netlify env:set ELEVENLABS_API_KEY "your_key_here"

# Already have
# OPENAI_API_KEY (for DALL-E 3 fallback)
# ANTHROPIC_API_KEY (for AI chat)
```

**Cost**: ~$5-10/month for light usage
**Capabilities**: All image models, premium TTS, music generation, upscaling

---

### Pro Setup ($20+/month)
```bash
# Everything above, plus:
netlify env:set HUGGINGFACE_API_KEY "hf_your_token_here"
netlify env:set STABILITY_API_KEY "sk-your_key_here"
```

**Cost**: $20-50/month for heavy usage
**Capabilities**: All models, highest quality, more options, faster generation

---

## Testing Your Setup

### Test Image Generation
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/creative-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "model": "flux-2",
    "dimensions": "1024x1024",
    "quantity": 1
  }'
```

### Test TTS Generation
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/creative-audio \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world, this is a test.",
    "engine": "coqui",
    "voice": "default",
    "language": "en"
  }'
```

### Test Music Generation
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/creative-music \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "upbeat electronic music",
    "genre": "electronic",
    "duration": 30,
    "tempo": 120
  }'
```

---

## Troubleshooting

### Error: "REPLICATE_API_TOKEN not configured"
1. Make sure you've added the token to Netlify
2. Redeploy your site after adding env vars
3. Check token starts with `r8_`

### Error: "Prediction failed" or "Timeout"
- Replicate models can take 5-60 seconds to generate
- Check your Replicate dashboard for quota limits
- Try a different model (e.g., switch from Flux 2 to DALL-E 3)

### Error: "ELEVENLABS_API_KEY not configured"
- This is optional - switch to "Coqui TTS" engine (free)
- Or add ElevenLabs API key if you want premium voices

### Images not loading
- Check CORS settings on image URLs
- Replicate URLs expire after 24 hours - save to your own storage for persistence
- Use thumbnail URLs for gallery views to reduce bandwidth

---

## Security Best Practices

1. **Never commit API keys** to Git
2. **Use Netlify env vars** for all secrets
3. **Rotate keys** every 90 days
4. **Set spending limits** on API accounts
5. **Monitor usage** to detect anomalies
6. **Use RLS policies** in Supabase to protect user data

---

## Next Steps

1. **Add REPLICATE_API_TOKEN** to Netlify
2. **Test image generation** in Creative Studio
3. **Try voice cloning** with Coqui TTS
4. **Generate music** for your game
5. **Optionally add ElevenLabs** for premium TTS
6. **Monitor costs** in API dashboards
7. **Set up alerts** for spending thresholds

---

**Phase 9 Ready!** 🎨✨
