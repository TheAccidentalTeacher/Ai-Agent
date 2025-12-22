# Phase 9: Creative Studio Implementation Plan

**Start Date**: December 20, 2024  
**Target Completion**: 5 hours (autonomous work)  
**Status**: IN PROGRESS

## Research Summary: Best Tools Found

### 🖼️ Image Generation
1. **Replicate** (FREE tier + usage pricing) ✅ RECOMMENDED
   - Flux 2 models (open-source, best quality)
   - DALL-E 3 via OpenAI API
   - Stable Diffusion (many variants)
   - API: Simple REST, pay-per-generation
   
2. **Hugging Face** (FREE for many models)
   - 90,000+ text-to-image models
   - Inference API available
   - Self-hosted option

3. **ComfyUI/A1111** (FREE, self-hosted)
   - Best for local generation
   - No API costs
   - Requires GPU

### 🎤 Text-to-Speech
1. **Coqui TTS** (FREE, open-source) ✅ RECOMMENDED
   - ~1100 languages via Fairseq
   - Voice cloning
   - No API costs
   - Python library

2. **ElevenLabs**
   - Free: 10k chars/month
   - Starter: $5/mo (30k chars)
   - Best quality

3. **OpenAI TTS**
   - $15/1M chars
   - Good quality

### 🎵 Music Generation
1. **Replicate** (Google Lyria 2, MiniMax Music) ✅ RECOMMENDED
   - Pay-per-use
   - No monthly fee
   
2. **Open-source alternatives**
   - MusicGen (Facebook)
   - AudioCraft

### 🎬 Video Generation
1. **Replicate** ✅ RECOMMENDED
   - Google Veo 3.1
   - WAN 2.6
   - OpenAI Sora 2
   - Pay-per-generation

2. **Luma AI**
   - Dream Machine
   - Good quality

### 🎨 Additional Tools
- **Stable Diffusion WebUI** (FREE, self-hosted)
- **Upscaling**: Real-ESRGAN, GFPGAN (face restoration)
- **Voice Cloning**: Coqui TTS, Resemble AI

## Environment Variables Needed

```env
# EXISTING (already have)
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-proj-xxx

# NEW REQUIRED
REPLICATE_API_TOKEN=r8_xxx                  # Main generation platform
ELEVENLABS_API_KEY=xxx                      # Premium TTS (optional)
HUGGINGFACE_API_KEY=hf_xxx                  # Alternative models
STABILITY_API_KEY=sk-xxx                    # Stable Diffusion (optional)

# NEW OPTIONAL (for future)
RUNWAY_API_KEY=xxx                          # Video generation
LUMA_API_KEY=xxx                            # Video generation
```

## Implementation Structure

### File Organization
```
├── creative-studio-ui.js          # Main modal UI (similar to video-ui.js)
├── creative-generators.js         # All generation functions
├── creative-history-manager.js    # Storage & retrieval
├── creative-gallery-ui.js         # Gallery view
└── netlify/functions/
    ├── creative-image.cjs         # Image generation
    ├── creative-tts.cjs           # Text-to-speech
    ├── creative-music.cjs         # Music generation
    ├── creative-video.cjs         # Video generation
    └── creative-upscale.cjs       # Image upscaling
```

### UI Design (98vw × 98vh Modal)
```
┌─────────────────────────────────────────────────┐
│ 🎨 Creative Studio                         [×]  │
├─────────────────────────────────────────────────┤
│ [🖼️ Images] [🎤 Voice] [🎵 Music] [🎬 Video]  │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│  CREATION PANEL  │       PREVIEW/GALLERY       │
│  (40%)           │       (60%)                  │
│                  │                              │
│  Input fields    │  Generated content display   │
│  Settings        │  Download/Export buttons     │
│  Generate button │  History thumbnails          │
│                  │                              │
└──────────────────┴──────────────────────────────┘
```

## Phase 9 Features (Priority Order)

### Priority 1: Image Generation (Hours 0-1.5)
- ✅ Replicate API integration
- ✅ Flux 2 model (best open-source)
- ✅ DALL-E 3 fallback
- ✅ Prompt engineering UI
- ✅ Style presets
- ✅ Gallery with download

### Priority 2: Text-to-Speech (Hours 1.5-2.5)
- ✅ Coqui TTS integration (free!)
- ✅ Voice selection (1100+ languages)
- ✅ Voice cloning capability
- ✅ Speed/pitch controls
- ✅ Audio player with waveform

### Priority 3: Image Upscaling (Hours 2.5-3.5)
- ✅ Real-ESRGAN integration
- ✅ Face restoration (GFPGAN)
- ✅ Multiple upscale factors
- ✅ Before/after comparison

### Priority 4: Music Generation (Hours 3.5-4.5)
- ✅ Replicate/Google Lyria integration
- ✅ Genre selection
- ✅ Duration controls
- ✅ Audio preview

### Priority 5: Polish & Testing (Hours 4.5-5)
- ✅ Error handling
- ✅ Loading states
- ✅ Cache-busting
- ✅ Basic testing
- ✅ Documentation

## Video Generation (Phase 9.5 - Future)
*Will implement after initial testing*
- Google Veo 3.1
- OpenAI Sora 2
- Text-to-video + Image-to-video

## Database Schema (Supabase)

```sql
CREATE TABLE creative_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL, -- 'image', 'audio', 'music', 'video'
    prompt TEXT NOT NULL,
    model TEXT NOT NULL,
    settings JSONB,
    result_url TEXT,
    thumbnail_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_creative_user_type ON creative_generations(user_id, type);
CREATE INDEX idx_creative_created ON creative_generations(created_at DESC);
```

## Success Metrics
- [ ] Image generation: <10 seconds per image
- [ ] TTS: <5 seconds for 30 seconds of audio
- [ ] Gallery loads instantly (cached)
- [ ] All downloads work correctly
- [ ] Zero crashes during generation
- [ ] Clear error messages for API failures

## Cost Estimates (per 1000 generations)

| Service | Free Tier | Paid Cost |
|---------|-----------|-----------|
| Replicate Images | None | ~$10-30 |
| Coqui TTS | ∞ FREE | $0 |
| ElevenLabs TTS | 333 gens | $5/mo |
| Replicate Music | None | ~$50-100 |
| Replicate Video | None | ~$100-300 |

**Recommendation**: Start with Replicate (pay-per-use, no monthly fees) + Coqui TTS (free)

## Next Steps (Autonomous Work)
1. ✅ Create `creative-studio-ui.js` with full UI
2. ✅ Create serverless functions for each generator
3. ✅ Implement image generation first (most requested)
4. ✅ Add TTS with Coqui (free!)
5. ✅ Add gallery/history management
6. ✅ Test all features
7. ✅ Document usage

## Completion Criteria
- [ ] Can generate images with 3+ models
- [ ] Can generate speech with voice cloning
- [ ] Can upscale images 4x
- [ ] Can generate music (basic)
- [ ] Gallery shows all generated content
- [ ] All downloads work
- [ ] Documentation complete
- [ ] ENV variables documented

---

**Agent Autonomy Note**: This plan is designed for 5 hours of unattended work. Will implement in order of priority, test each feature, and provide comprehensive documentation upon completion.
