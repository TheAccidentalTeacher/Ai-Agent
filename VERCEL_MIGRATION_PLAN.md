# Vercel Migration Plan - UCAS (Universal Cognitive Amplification System)

## Overview

This document outlines the migration of UCAS from Netlify to Vercel Pro to take advantage of:
- **60-second function timeout** (vs Netlify's 10s)
- **300-second Edge Runtime timeout** 
- Better support for AI-heavy workloads (Gemini video transcription)
- Simpler function configuration

---

## Current Architecture (Netlify)

### Hosting
- **Platform**: Netlify (Free tier)
- **Domain**: scott-ai.netlify.app
- **Build**: Static HTML/JS/CSS (no framework)

### Backend Functions
Located in `netlify/functions/`:
| Function | Purpose | Timeout Issues? |
|----------|---------|-----------------|
| `ai-chat.cjs` | Main AI chat (OpenAI, Anthropic, xAI) | No |
| `youtube-transcript.cjs` | Fetch YouTube captions | No |
| `youtube-whisper-transcript.cjs` | Whisper AI fallback | Yes (blocked) |
| `youtube-gemini-transcript.cjs` | Gemini video understanding | **YES - TIMEOUT** |
| `extract-documents.cjs` | Document extraction | Sometimes |
| `document-process.cjs` | Document processing | Sometimes |
| `research-*.cjs` | Deep research functions | No |
| `task-scheduler.cjs` | Background task scheduler | No |

### Edge Functions
Located in `netlify/edge-functions/`:
- `youtube-gemini-transcript.js` - Attempted fix for timeout (not working)

### Authentication
- **Provider**: Supabase Auth
- **OAuth**: GitHub
- **Callback URL**: `https://scott-ai.netlify.app` (configured in Supabase)

### Database
- **Provider**: Supabase (PostgreSQL)
- No migration needed - same Supabase project will work

### Environment Variables (27 total)
See `.env` file for full list. Key ones:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `XAI_API_KEY`
- `GEMINI_API_KEY`
- `YOUTUBE_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

---

## Vercel Architecture (Target)

### File Structure Changes

```
BEFORE (Netlify):
├── netlify/
│   ├── functions/           # Serverless functions
│   │   ├── ai-chat.cjs
│   │   └── ...
│   └── edge-functions/      # Edge functions
│       └── youtube-gemini-transcript.js
├── netlify.toml             # Netlify config

AFTER (Vercel):
├── api/                     # Vercel API routes
│   ├── ai-chat.js           # Serverless (60s timeout)
│   ├── youtube-transcript.js
│   ├── gemini-transcript.js # Will actually work now!
│   └── ...
├── vercel.json              # Vercel config
```

### Function Migration Map

| Netlify Function | Vercel API Route | Notes |
|------------------|------------------|-------|
| `netlify/functions/ai-chat.cjs` | `api/ai-chat.js` | Convert to ES modules |
| `netlify/functions/youtube-transcript.cjs` | `api/youtube-transcript.js` | Simple port |
| `netlify/functions/youtube-gemini-transcript.cjs` | `api/gemini-transcript.js` | **Key function - will work!** |
| `netlify/functions/youtube-whisper-transcript.cjs` | `api/whisper-transcript.js` | Optional |
| `netlify/functions/extract-documents.cjs` | `api/extract-documents.js` | Port |
| `netlify/functions/document-process.cjs` | `api/document-process.js` | Port |
| All `research-*.cjs` | `api/research/*.js` | Can use route groups |

### Frontend URL Changes

All API calls need to change from:
```javascript
// Netlify
fetch('/.netlify/functions/ai-chat', ...)
fetch('/.netlify/functions/youtube-transcript', ...)
fetch('/api/gemini-transcript', ...)  // Edge function

// Vercel
fetch('/api/ai-chat', ...)
fetch('/api/youtube-transcript', ...)
fetch('/api/gemini-transcript', ...)  // All consistent now!
```

---

## Migration Steps

### Phase 1: Preparation (Before Copy)
- [x] Create this migration plan
- [ ] Create handoff document
- [ ] Audit all `/.netlify/functions/` references in frontend code
- [ ] List all environment variables

### Phase 2: Copy & Setup
1. Copy folder to new location (e.g., `Ai-Agent-Vercel`)
2. Delete Netlify-specific files:
   - `netlify.toml`
   - `netlify/` folder
3. Create Vercel structure:
   - `vercel.json`
   - `api/` folder

### Phase 3: Function Migration
1. Convert each function from CommonJS to ES modules
2. Update handler signatures:
   ```javascript
   // Netlify
   exports.handler = async (event, context) => {
     const body = JSON.parse(event.body);
     return { statusCode: 200, body: JSON.stringify(result) };
   };
   
   // Vercel
   export default async function handler(req, res) {
     const body = req.body;
     res.status(200).json(result);
   }
   ```
3. Test each function locally with `vercel dev`

### Phase 4: Frontend Updates
1. Find & replace all API URLs:
   - `/.netlify/functions/` → `/api/`
2. Files to update:
   - `transcript-fetcher.js`
   - `editor.js` (AI chat)
   - `document-upload.js`
   - `multi-agent-client.js`
   - `deep-research.js`
   - Any other files calling backend

### Phase 5: Auth Updates
1. **Supabase Dashboard**:
   - Add new redirect URL: `https://your-project.vercel.app`
   - Keep Netlify URL for now (dual operation)

2. **GitHub OAuth App**:
   - Add callback URL: `https://your-project.vercel.app`
   - Keep Netlify URL

### Phase 6: Environment Variables
1. In Vercel Dashboard:
   - Project Settings → Environment Variables
   - Add all 27+ variables from `.env`
2. Verify all functions have access to their required variables

### Phase 7: Deployment & Testing
1. Push to GitHub (new repo or branch)
2. Import project to Vercel
3. Test all features:
   - [ ] AI Chat (all providers)
   - [ ] YouTube transcript (captions)
   - [ ] YouTube transcript (Gemini fallback) ⭐
   - [ ] Document upload
   - [ ] Deep research
   - [ ] Multi-agent panel
   - [ ] Authentication (GitHub OAuth)
   - [ ] Memory sync

### Phase 8: DNS (Optional)
If you want a custom domain:
1. Add domain in Vercel
2. Update DNS records
3. Update OAuth callback URLs

---

## Files Requiring Changes

### API URL References
Search for these patterns and update:

```bash
# Find all Netlify function references
grep -r "\.netlify/functions" --include="*.js" --include="*.html"
```

Known files:
1. `transcript-fetcher.js` - YouTube functions
2. `editor.js` - AI chat
3. `document-upload.js` - Document processing
4. `multi-agent-client.js` - Multi-agent
5. `creative-studio-ui.js` - Image generation
6. `deep-research.js` - Research functions

### Configuration Files
- DELETE: `netlify.toml`
- DELETE: `netlify/` folder
- CREATE: `vercel.json`
- CREATE: `api/` folder with migrated functions

---

## Vercel Configuration

### vercel.json
```json
{
  "version": 2,
  "buildCommand": null,
  "outputDirectory": ".",
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

---

## Rollback Plan

If Vercel migration fails:
1. Netlify version remains active at scott-ai.netlify.app
2. No changes needed to revert
3. Both can run in parallel during testing

---

## Success Criteria

- [ ] All AI chat providers work (OpenAI, Claude, Grok)
- [ ] YouTube transcripts work with captions
- [ ] **YouTube Gemini transcription works for videos without captions** ⭐
- [ ] Document upload and processing works
- [ ] Deep research works
- [ ] Multi-agent panel works
- [ ] GitHub authentication works
- [ ] Memory sync works
- [ ] Creative Studio image generation works

---

## Timeline Estimate

| Phase | Duration |
|-------|----------|
| Phase 1-2: Prep & Copy | 30 min |
| Phase 3: Function Migration | 2-3 hours |
| Phase 4: Frontend Updates | 1 hour |
| Phase 5-6: Auth & Env Vars | 30 min |
| Phase 7: Testing | 1-2 hours |
| **Total** | **5-7 hours** |

---

## Notes

- Keep both Netlify and Vercel running in parallel during migration
- Test thoroughly before switching any DNS
- The Gemini video transcription is the primary driver for this migration
- Vercel Pro's 60-second timeout should handle most videos
- For very long videos (>1 hour), may need Edge Runtime with streaming
