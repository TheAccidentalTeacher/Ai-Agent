# Universal Cognitive Amplification System (UCAS)

**Formerly: Universal Game Level Editor**  
**Now: Multi-Agent AI Cognitive Amplification Platform**

A next-generation cognitive amplification tool that combines multi-agent AI collaboration, deep research capabilities, cloud sync, and OAuth authentication into one unified system. Built to replace ChatGPT, Perplexity, and more with an integrated "Extended Mind" approach.

## 🚨 DEPLOYING TO PRODUCTION?

**⚠️ CRITICAL**: Read [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) FIRST!

You **MUST** update OAuth redirect URLs in Supabase, GitHub, and Google when deploying to Netlify or authentication will fail. The checklist has step-by-step instructions to prevent hours of debugging.

---

## 🎯 What Is This?

UCAS is a platform that amplifies your cognition through specialized AI agents working together. Think of it as having a team of 12 expert consultants (Master Teacher, Technical Architect, Strategist, Theologian, and more) who can:
- Discuss complex topics collaboratively
- Conduct deep research with citations and multi-agent analysis
- Save research sessions to the cloud with multi-device sync
- Sign in with GitHub or Google OAuth
- Create content (planned: images, videos, audio)
- Develop software end-to-end (planned)
- Integrate with your productivity tools (planned)

**Current Status**: Phase 8 Complete (YouTube Intelligence) ✅ | Phase 9 Partial (Image + Audio) ✅  
**Development Time**: ~25 hours total (AI-assisted rapid development)  
**Next Up**: Phase 10 - Planning in progress (need to define scope)

## 📚 Documentation Hub

### 🆘 Need Help Using the App?

**👉 [USER_GUIDE.md](USER_GUIDE.md)** - **COMPLETE 150+ PAGE USER GUIDE** (Start here!)
- What is this application? (explained for anyone)
- How to use every feature (step-by-step)
- All 12 AI personas and when to use them
- Video Intelligence (7 content creation tools)
- Creative Studio (images, audio, music, video)
- Deep Research Engine (multi-agent analysis)
- Memory & Knowledge Management (auto-save + graph)
- 100+ example prompts and real workflows
- Troubleshooting, FAQ, and tips

**👉 [QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - **ONE-PAGE QUICK START** (Bookmark this!)
- 3-step quick start
- Essential keyboard shortcuts
- Common issues & fixes
- Pro tips for power users

---

### 🚨 For Developers/Deployers

**⚠️ CRITICAL**: Read [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) FIRST!

You **MUST** update OAuth redirect URLs in Supabase, GitHub, and Google when deploying to Netlify or authentication will fail. The checklist has step-by-step instructions to prevent hours of debugging.

**New to UCAS?** → Start with [GETTING_STARTED.md](GETTING_STARTED.md) (15 min setup)

---

### 📖 Essential Reading

- 📖 [COGNITIVE_AMPLIFICATION_VISION.md](docs/COGNITIVE_AMPLIFICATION_VISION.md) - The big picture, philosophy, competitive analysis
- 🏗️ [CURRENT_CAPABILITIES_INVENTORY.md](docs/CURRENT_CAPABILITIES_INVENTORY.md) - What works now (Phases 1-7)
- 🔬 [RESEARCH_CAPABILITIES_SPEC.md](docs/RESEARCH_CAPABILITIES_SPEC.md) - Deep research system (Phase 6)
- 🗺️ [FUTURE_CAPABILITIES_ROADMAP.md](docs/FUTURE_CAPABILITIES_ROADMAP.md) - What's coming next (Phases 8-13)
- 🏛️ [TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) - How everything works
- 🧭 [MASTER_INDEX.md](docs/MASTER_INDEX.md) - Navigation hub for all docs
- 🤖 [docs/ai/CONTEXT_LOADER.md](docs/ai/CONTEXT_LOADER.md) - AI context loading guide

---

### 🚀 Implementation Docs
- 🚀 [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - **CRITICAL for production**
- ✅ [PHASE_7_COMPLETE.md](PHASE_7_COMPLETE.md) - Cloud sync & OAuth (just shipped)
- ✅ [PHASE_6_WEEK_7-8_COMPLETE.md](PHASE_6_WEEK_7-8_COMPLETE.md) - Research memory & export
- 📊 [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current project state
- 📊 [CURRENT_STATUS.md](CURRENT_STATUS.md) - Live development status

## ✨ Features

### Phase 1-5: Multi-Agent Consortium ✅ COMPLETE

**12 Expert Personas**:
- Core Council: Master Teacher, Classical Educator, Strategist, Theologian
- Specialists: Technical Architect, Writer, Analyst, Debugger, UX Designer, Marketing Strategist, Game Designer, Gen-Alpha Expert

**Four Orchestration Modes**:
1. **Panel Mode** - Sequential responses from all agents
2. **Consensus Mode** - Agents debate and reach agreement
3. **Debate Mode** - Focused argumentation
4. **Conversation Mode** - Turn-taking discussion with user interjections

**Key Capabilities**:
- 🧠 Agent memory system (remembers past conversations)
- 💬 Real-time chat interface with persona avatars
- 🎭 Research-backed personas (30-60 min research each)
- 🤖 Multi-provider support (Anthropic Claude + OpenAI GPT)
- 📊 Dynamic speaker selection and turn-taking
- 💭 Context-aware responses building on previous turns

### Phase 6: Deep Research Engine ✅ COMPLETE

**Perplexity-like research with multi-agent analysis**:
- 🔍 Multi-source search (Tavily, Brave, Serper)
- 📄 Smart content extraction (Mozilla Readability)
- 🧩 Intelligent chunking (semantic boundaries, ~4000 tokens)
- 🤖 Multi-agent analysis (12 personas analyze together)
- ✍️ Executive synthesis (Writer persona)
- 💾 Research memory (save/load/export sessions)
- 📊 Export to Markdown & JSON
- 🎨 Beautiful collapsible UI with markdown rendering

### Phase 7: Cloud Sync with OAuth ✅ COMPLETE

**Multi-device access with secure authentication**:
- ☁️ Supabase PostgreSQL cloud database
- 🔐 OAuth authentication (GitHub & Google, PKCE flow)
- 👤 User profiles with avatars
- 🔄 Auto-sync across all devices
- 📵 Offline fallback to localStorage
- 🔒 Row-Level Security (RLS) for data privacy
- 🎨 Clean minimal UI (sign-in button, auth modal, profile dropdown)

### Phase 8: YouTube Intelligence ✅ COMPLETE

**Deep video analysis and educational content creation**:
- 🎬 YouTube video search and direct URL loading
- 📝 Automatic transcript extraction and display
- 🤖 AI-powered video summarization (TLDR, Abstract, Detailed, Key Moments)
- 👥 Multi-agent analysis (12 personas provide expert perspectives)
- 📚 7 Content Creation Tools:
  * Quiz Maker (Multiple Choice, Short Answer, True/False, Fill-in-Blank)
  * Lesson Plan Generator (complete with activities and assessments)
  * Discussion Questions (Bloom's taxonomy levels)
  * DOK 3-4 Extended Projects (Strategic & Extended Thinking)
  * Vocabulary Builder (15-20 terms with definitions, examples, memory tips)
  * Guided Notes (Cornell, Outline, Fill-in-Blank formats)
  * Graphic Organizers (Concept Maps, Timelines, Venn Diagrams with Mermaid)
- 💾 Video history tracking
- 📊 Export to Markdown, Copy to clipboard
- 📄 Word export with table conversion
- 🎨 Full-screen modal interface (98vw × 98vh)

### Phase 9: Creative Studio 🟡 PARTIAL COMPLETE

**AI-powered content generation**:
- ✅ **Image Generation** (4 models working):
  * Flux 2 Pro, DALL-E 3, Stable Diffusion XL, DreamShaper 8
  * 7 style presets, 5 dimension options
  * Quality controls, negative prompts, batch generation
- ✅ **Text-to-Speech** (4 engines working):
  * Google Cloud TTS (380 voices, 1M FREE chars/month)
  * 45 English voice presets (US, UK, Australia, India)
  * Custom voice input for all 380 voices
  * Coqui TTS (FREE), OpenAI TTS, ElevenLabs
- ❌ **Music Generation** (UI exists, not implemented - not needed)
- ❌ **Video Generation** (UI exists, not implemented - not needed)
- 📹 YouTube video analysis with transcript extraction
- 🎯 Key moments extraction and timestamps
- 📊 Multi-agent analysis of video content
- 🔍 Search and citation system
- 💾 Save analyzed videos to library
- 🎨 Full-screen modal UI

### Phase 9: Creative Studio ✅ COMPLETE

**AI-powered content generation**:
- 🎨 **Image Generation**: Flux 2, DALL-E 3, Stable Diffusion XL, DreamShaper
  - 7 style presets, 5 dimensions, quality controls
  - Batch generation (1-4 images), negative prompts
  - 4x upscaling with face restoration
- 🎙️ **Text-to-Speech**: Coqui TTS (FREE), ElevenLabs, OpenAI TTS
  - 7 voices, 9 languages, speed control
  - Voice cloning from audio samples
- 🎵 **Music Generation**: MusicGen (FREE), Google Lyria 2
  - 8 genres, tempo/mood controls, 15s-2min tracks
- 📊 **Gallery & History**: Save all generations, persistent storage
- 🎨 **98vw×98vh Modal**: Full-screen professional UI
- 💰 **Cost-Effective**: FREE options + pay-per-use ($10-30 per 1000 images)

See [PHASE_9_COMPLETION.md](PHASE_9_COMPLETION.md) and [ENV_VARIABLES_PHASE9.md](ENV_VARIABLES_PHASE9.md) for setup.

### Phases 10-13: The Full Vision 🔮 NEXT 6-12 MONTHS

- **Phase 10**: Code editor + development environment
- **Phase 11**: Productivity integrations (Google Workspace, Microsoft Office)
- **Phase 12**: Advanced AI (autonomous agents, persistent memory)
- **Phase 13**: Scale & ecosystem (API, mobile apps, enterprise)

**Full details**: [FUTURE_CAPABILITIES_ROADMAP.md](docs/FUTURE_CAPABILITIES_ROADMAP.md)

### Legacy: Game Level Editor 🎮 STILL WORKS

The original game editor is still fully functional:
- Load background images and add game assets
- Drag & drop positioning with live property editing
- JSON export for game integration
- Project save/load functionality
- Keyboard shortcuts for fast workflow

## 🚀 Quick Start

### For New Developers

1. **Read** [GETTING_STARTED.md](GETTING_STARTED.md) (15 min setup guide)
2. **Install**:
   ```bash
   npm install
   # Creates .env file with your API keys
   node server.cjs
   ```
3. **Set up Supabase** (for cloud sync - optional but recommended):
   - Follow [PHASE_7_SETUP_GUIDE.md](PHASE_7_SETUP_GUIDE.md) (5 min)
   - Enables multi-device access (desktop, laptop, tablet, mobile)
   - Research sessions sync across all your devices
   - Automatic backup to cloud (500MB free tier)
   - Skip this to use localStorage only (single device)
4. **Try It**: Open http://localhost:3000 and click 🤖 Multi-Agent Consortium
5. **Read**: [PHASE_6_IMPLEMENTATION_PLAN.md](PHASE_6_IMPLEMENTATION_PLAN.md) for next steps

### For Users

**Using the Multi-Agent Consortium**:

1. Click the 🤖 button in the UI
2. Select mode (Panel/Consensus/Conversation)
3. Choose personas (or use all 12)
4. Enter your question or topic
5. Watch agents collaborate!

**Three Modes Explained**:

- **Panel Mode**: All agents respond sequentially (best for comprehensive coverage)
- **Consensus Mode**: Agents debate and reach agreement (best for decisions)
- **Conversation Mode**: Turn-taking discussion (best for exploration)

## 🛠️ Technology Stack

**Current (Phases 1-5)**:
- **LangGraph.js** - Agent orchestration and state machines
- **Anthropic Claude** - Primary LLM (Sonnet, Opus, Haiku)
- **OpenAI GPT** - Secondary LLM (GPT-4, GPT-4o)
- **Netlify Functions** - Serverless API endpoints
- **Vanilla JS** - Frontend (no framework)

**Coming (Phase 6+)**:
- **SerpAPI** - Google search integration
- **Tavily** - AI-optimized search
- **Cheerio** - Web scraping
- **Turndown** - HTML to Markdown
- **YouTube API** - Video processing (Phase 7)
- **DALL-E, ElevenLabs** - Creative generation (Phase 8)

## 📊 Project Status

**Current Phase**: Phase 5 Complete ✅  
**Next Phase**: Phase 6 (Research Engine) - Starting Now  
**Timeline**: 2-3 days for Phase 6, then 4-6 weeks for Phases 7-11  
**Development Velocity**: 10-20x normal (AI-assisted)

**Detailed Status**: [PROJECT_STATUS.md](PROJECT_STATUS.md)
2. Log in to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Deploy settings:
   - **Build command**: (leave empty)
   - **Publish directory**: (leave empty or use `/`)
6. Click "Deploy site"

Netlify will automatically redeploy when you push to GitHub!

## Current Status & Roadmap

### ✅ PHASES COMPLETE (v2.0.0)

**Phase 0 - Persona System** ✓
- 12 deeply-researched expert personas loaded and available
- UI indicators showing active persona
- Enhanced logging and debugging tools

**Phase 1 - Agent Memory** ✓
- AgentMemory class (350 lines)
- Short-term memory (last 20 interactions)
- Long-term insights (preferences, topics, project context)
- Memory UI with viewer modal, stats, and export
- Persona-specific memory isolation via localStorage

**Phase 1.5 - Scott's Agent Council** ✓
- **12 Deeply-Researched Expert Personas**:
  - **Core Council** (7 personas): Master Teacher, Technical Architect, Strategist, Theologian, Writer, Analyst, Debugger
  - **Specialty Consultants** (5 personas): Classical Educator, Gen Alpha Expert, UX Designer, Marketing Strategist, Game Designer
  - Research-driven: 30-60 min per persona covering frameworks, voice, problem-solving approaches
  - Scott-specific: Tailored for The Accidental Teacher project, Alaska context, Reformed Baptist worldview

- **UX & Interface**:
  - Resizable AI Panel with proper collapse/expand
  - Quick-switcher UI for on-the-fly persona switching
  - Persona badge system with color coding
  - Markdown formatting with proper styling
  - Message timestamps for conversation context
  - Keyboard shortcuts with visual hints
  - Loading states with typing indicators

**Phase 4 - Frontend UI Integration** ✓
- Modal-based consortium interface (90vw × 90vh)
- Persona selector with 12 checkbox personas
- Mode selector: Panel (12 sequential agents), Consensus, Debate
- Results display with markdown formatting
- Dynamic LLM provider support (Anthropic Claude + OpenAI GPT)
- Color-coded 10-level logging system
- Full integration with multi-agent execution

**Phase 5 - Interactive Conversation Mode** ✓ (NEW!)
- **Conversation Orchestration Engine** (langgraph-conversation.js - 350 lines):
  - Turn-taking architecture with sequential agent responses
  - Smart speaker selection avoiding repetition
  - Persona-specific prompting with speaking style/tendency
  - Support for user interjections at any conversation point
## 🤝 Contributing

This project uses "vibe coding" - AI-assisted rapid development where concepts become code in hours instead of weeks.

**For Developers**:
1. Read [GETTING_STARTED.md](GETTING_STARTED.md)
2. Pick a task from [PHASE_6_IMPLEMENTATION_PLAN.md](PHASE_6_IMPLEMENTATION_PLAN.md)
3. Follow existing patterns in codebase
4. Update documentation as you go
5. Test thoroughly before committing

**For AI Assistants**:
- Read [docs/ai/AI_CONTEXT.md](docs/ai/AI_CONTEXT.md) for full context
- Follow [docs/ai/DAILY_UPDATE_CHECKLIST.md](docs/ai/DAILY_UPDATE_CHECKLIST.md) for updates
- Reference [TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) for system design

## 📖 Version History

**Current**: v2.0.0 - Phase 5 Complete  
**Next**: v2.1.0 - Phase 6 (Research Engine)

See [CHANGELOG.md](docs/CHANGELOG.md) for detailed version history.

## 📜 License

MIT License - Build whatever you want with this!

## 🙏 Acknowledgments

Built with AI assistance (Claude Sonnet 4.5) using "vibe coding" methodology.

**Development Philosophy**: *"Don't build the Death Star when you need a speeder bike."*

---

**Ready to amplify your cognition?** Start with [GETTING_STARTED.md](GETTING_STARTED.md)!

## Project Philosophy

This project was born from rejecting **5,000+ lines of over-engineered specifications** in favor of a **650-line MVP**. We embrace:

- **Simplicity over features**
- **Real usage over imagined requirements**
- **Documentation as first-class citizen**
- **AI-first development workflow**

The result: A fully functional game level editor built in hours, not months, with documentation more comprehensive than most enterprise applications.
