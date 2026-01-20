# UCAS Vercel Migration - Handoff Document

## Project Overview

**Project Name**: UCAS (Universal Cognitive Amplification System)
**Current URL**: https://scott-ai.netlify.app
**Target Platform**: Vercel Pro
**Primary Goal**: Fix YouTube Gemini video transcription timeout issues

---

## Architecture Summary

### What This App Does
UCAS is an AI-powered research and learning assistant with:
- Multi-model AI chat (OpenAI, Anthropic/Claude, xAI/Grok)
- YouTube Video Intelligence (transcript analysis, summaries)
- Deep Research Engine (multi-source academic research)
- Multi-Agent Panel (AI personas debating topics)
- Creative Studio (AI image generation)
- Memory & Knowledge Management
- Cloud sync via Supabase

### Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | Vanilla HTML/CSS/JavaScript (no framework) |
| Backend | Serverless Functions |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + GitHub OAuth |
| AI Providers | OpenAI, Anthropic, xAI, Google Gemini, Replicate |
| Current Hosting | Netlify |
| Target Hosting | Vercel Pro |

---

## Code Conventions

### File Naming
- JavaScript: `kebab-case.js` (e.g., `transcript-fetcher.js`)
- CSS: `kebab-case.css` (e.g., `context-panel-styles.css`)
- Netlify Functions: `kebab-case.cjs` (CommonJS for Node.js)
- Documentation: `SCREAMING_SNAKE_CASE.md`

### JavaScript Style
- ES Modules for frontend (`import/export`)
- CommonJS for Netlify functions (`require/module.exports`)
- **Vercel**: Convert all to ES Modules

### API Response Format
```javascript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  error: "Error message",
  details: "Optional details"
}
```

### Console Logging Conventions
```javascript
console.log('✅ Success message');
console.log('❌ Error message');
console.log('🔄 Loading/Processing...');
console.log('📝 Info message');
console.log('🎬 Video-related');
console.log('🧠 Memory-related');
console.log('🤖 AI/Agent-related');
```

---

## Directory Structure

```
Ai-Agent/
├── index.html              # Main application
├── help.html               # Help documentation
├── style.css               # Main styles
├── style-new.css           # Additional styles
├── 
├── # Core JavaScript Modules
├── editor.js               # Main AI chat panel
├── transcript-fetcher.js   # YouTube transcript logic
├── video-ui.js             # Video Intelligence UI
├── multi-agent-client.js   # Multi-agent panel client
├── multi-agent-ui.js       # Multi-agent panel UI
├── deep-research.js        # Research engine
├── creative-studio-ui.js   # Image generation UI
├── memory-service.js       # Memory management
├── memory-ui.js            # Memory UI
├── auth-ui.js              # Authentication UI
├── supabase-client.js      # Supabase connection
├── 
├── # Netlify Functions (TO BE MIGRATED)
├── netlify/
│   ├── functions/
│   │   ├── ai-chat.cjs             # Main AI chat endpoint
│   │   ├── youtube-transcript.cjs   # YouTube captions
│   │   ├── youtube-whisper-transcript.cjs  # Whisper fallback
│   │   ├── youtube-gemini-transcript.cjs   # Gemini fallback ⭐
│   │   ├── extract-documents.cjs    # Document extraction
│   │   ├── document-process.cjs     # Document processing
│   │   ├── research-*.cjs           # Research functions
│   │   └── task-scheduler.cjs       # Background tasks
│   └── edge-functions/
│       └── youtube-gemini-transcript.js  # Edge attempt (failed)
├── 
├── # Configuration
├── netlify.toml            # Netlify config (DELETE for Vercel)
├── package.json            # Dependencies
├── .env                    # Environment variables (gitignored)
├── 
├── # Documentation
├── VERCEL_MIGRATION_PLAN.md
├── ARCHITECTURE.md
├── GETTING_STARTED.md
├── FEATURES_CURRENT.md
└── ... (many more docs)
```

---

## Environment Variables

### Required for AI Chat
| Variable | Purpose | Required By |
|----------|---------|-------------|
| `OPENAI_API_KEY` | OpenAI GPT models | ai-chat, whisper |
| `ANTHROPIC_API_KEY` | Claude models | ai-chat |
| `XAI_API_KEY` | Grok models | ai-chat |
| `GEMINI_API_KEY` | Google Gemini | **gemini-transcript** |

### Required for YouTube Features
| Variable | Purpose |
|----------|---------|
| `YOUTUBE_API_KEY` | YouTube Data API |
| `GEMINI_API_KEY` | Video transcription |
| `GOOGLE_CLOUD_API_KEY` | Fallback for Gemini |

### Required for Auth & Database
| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public API key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (server only) |
| `GITHUB_CLIENT_ID` | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth |

### Required for Other Features
| Variable | Purpose |
|----------|---------|
| `TAVILY_API_KEY` | Deep research |
| `SERPAPI_KEY` | Search results |
| `REPLICATE_API_TOKEN` | Image generation |
| `STABILITY_AI_API_KEY` | Stable Diffusion |
| `PEXELS_API_KEY` | Stock photos |
| `UNSPLASH_ACCESS_KEY` | Stock photos |

---

## API Endpoints

### Current (Netlify)
```
POST /.netlify/functions/ai-chat
POST /.netlify/functions/youtube-transcript
POST /.netlify/functions/youtube-whisper-transcript
POST /.netlify/functions/youtube-gemini-transcript
POST /.netlify/functions/extract-documents
POST /.netlify/functions/document-process
POST /.netlify/functions/research-tavily
POST /.netlify/functions/research-serp
POST /.netlify/functions/multi-agent
GET  /.netlify/functions/task-scheduler
```

### Target (Vercel)
```
POST /api/ai-chat
POST /api/youtube-transcript
POST /api/whisper-transcript
POST /api/gemini-transcript
POST /api/extract-documents
POST /api/document-process
POST /api/research/tavily
POST /api/research/serp
POST /api/multi-agent
GET  /api/task-scheduler (or use Vercel Cron)
```

---

## Function Conversion Guide

### Netlify → Vercel Handler Syntax

**Netlify (CommonJS):**
```javascript
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body);
    const result = await doSomething(body);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

**Vercel (ES Modules):**
```javascript
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.body; // Already parsed
    const result = await doSomething(body);
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Optional: Configure function
export const config = {
  maxDuration: 60 // seconds
};
```

### Key Differences
| Aspect | Netlify | Vercel |
|--------|---------|--------|
| Module System | CommonJS (`.cjs`) | ES Modules (`.js`) |
| Handler | `exports.handler` | `export default function` |
| Request Body | `JSON.parse(event.body)` | `req.body` (auto-parsed) |
| Response | `return { statusCode, body }` | `res.status().json()` |
| Environment | `process.env.VAR` | `process.env.VAR` (same) |
| Timeout Config | `netlify.toml` | `export const config` |

---

## Frontend Files to Update

### Files with API Calls

1. **transcript-fetcher.js** (lines ~165, ~120, ~70)
   ```javascript
   // Change these:
   fetch('/.netlify/functions/youtube-transcript', ...)
   fetch('/.netlify/functions/youtube-whisper-transcript', ...)
   fetch('/api/gemini-transcript', ...)
   
   // To:
   fetch('/api/youtube-transcript', ...)
   fetch('/api/whisper-transcript', ...)
   fetch('/api/gemini-transcript', ...)  // Already correct!
   ```

2. **editor.js** (main AI chat)
   ```javascript
   // Change:
   fetch('/.netlify/functions/ai-chat', ...)
   // To:
   fetch('/api/ai-chat', ...)
   ```

3. **document-upload.js**
   ```javascript
   // Change:
   fetch('/.netlify/functions/extract-documents', ...)
   fetch('/.netlify/functions/document-process', ...)
   // To:
   fetch('/api/extract-documents', ...)
   fetch('/api/document-process', ...)
   ```

4. **multi-agent-client.js**
   ```javascript
   // Change:
   fetch('/.netlify/functions/multi-agent', ...)
   // To:
   fetch('/api/multi-agent', ...)
   ```

5. **deep-research.js** or research-related files
   ```javascript
   // Change:
   fetch('/.netlify/functions/research-tavily', ...)
   // To:
   fetch('/api/research/tavily', ...)
   ```

6. **creative-studio-ui.js**
   - Check for any function calls

### Search Command
```bash
grep -rn "\.netlify/functions" --include="*.js" --include="*.html" .
```

---

## Authentication Migration

### Supabase Dashboard Updates
1. Go to: https://supabase.com/dashboard/project/kxctrosgcockwtrteizd
2. Authentication → URL Configuration
3. Add to "Redirect URLs":
   - `https://your-project.vercel.app`
   - `https://your-project.vercel.app/**`

### GitHub OAuth App Updates
1. Go to: https://github.com/settings/developers
2. Find your OAuth App
3. Add to "Authorization callback URL":
   - Keep: `https://scott-ai.netlify.app`
   - Add: `https://your-project.vercel.app`

---

## Testing Checklist

### Core Features
- [ ] Home page loads
- [ ] AI Chat works (OpenAI)
- [ ] AI Chat works (Claude)
- [ ] AI Chat works (Grok)
- [ ] Web search toggle works

### YouTube Features
- [ ] YouTube search works
- [ ] Video loads in player
- [ ] Transcript loads (with captions)
- [ ] **Transcript loads (Gemini fallback)** ⭐ PRIMARY TEST
- [ ] Summary generation works
- [ ] Analysis works

### Research Features
- [ ] Deep research works
- [ ] Multi-source search works
- [ ] Academic search works

### Multi-Agent
- [ ] Panel discussion works
- [ ] Consensus voting works
- [ ] Live conversation works

### Creative Studio
- [ ] Image generation works
- [ ] Gallery loads

### Auth & Memory
- [ ] GitHub login works
- [ ] Session persists
- [ ] Memory saves
- [ ] Sync works

---

## Known Issues to Address

1. **Gemini Video Transcription** (PRIMARY ISSUE)
   - Netlify timeout (10s) too short
   - Vercel Pro gives 60s - should work

2. **Whisper Transcription**
   - YouTube blocks audio extraction
   - May work better from different IP/region on Vercel

3. **Scheduled Tasks**
   - Netlify uses `task-scheduler` function
   - Vercel uses Cron Jobs (vercel.json)
   
---

## Post-Migration Cleanup

After successful Vercel deployment:

1. Keep Netlify running for 1-2 weeks
2. Monitor both for issues
3. Eventually:
   - Remove Netlify Edge Functions
   - Clean up `netlify.toml`
   - Update any documentation

---

## Contact & Resources

### Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup guide
- [FEATURES_CURRENT.md](./FEATURES_CURRENT.md) - Feature list
- [VERCEL_MIGRATION_PLAN.md](./VERCEL_MIGRATION_PLAN.md) - Detailed plan

### External Docs
- [Vercel Functions](https://vercel.com/docs/functions)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google Gemini API](https://ai.google.dev/docs)

---

## Quick Start for Migration

```bash
# 1. Copy the project
cp -r "Ai-Agent" "Ai-Agent-Vercel"
cd "Ai-Agent-Vercel"

# 2. Remove Netlify files
rm -rf netlify/
rm netlify.toml

# 3. Create Vercel structure
mkdir api

# 4. Install Vercel CLI
npm i -g vercel

# 5. Link to Vercel
vercel link

# 6. Test locally
vercel dev

# 7. Deploy
vercel --prod
```

---

*Document created: January 19, 2026*
*For: UCAS Netlify → Vercel Migration*
