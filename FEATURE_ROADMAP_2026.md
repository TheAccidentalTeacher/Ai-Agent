# 🚀 Hypomnemata Feature Roadmap 2026
**Closing the Gap: Monica.im Feature Parity & Beyond**

Based on competitive analysis with Monica.im, this roadmap prioritizes features that serve **The Accidental Teacher's educational mission** while maintaining Hypomnemata's unique strengths (12 Personas, Fellowship collaboration, educational design focus).

---

## 📊 Current State Assessment

### ✅ Already Have (Better Than Monica!)
1. **Model Switching** - Dynamic provider/model selection (6 providers, 20+ models)
2. **12 Expert Personas** - Deep, consistent characters (vs. generic bots)
3. **Fellowship Collaboration** - Multi-agent deliberation (Monica is single-agent)
4. **Semantic Memory System** - pgvector embeddings + auto-save
5. **35 Specialized Functions** - YouTube intelligence, document processing, research tools
6. **Educational Design Focus** - Purpose-built for curriculum development

### ❌ Missing (Monica Has, We Don't)
1. **Favorites/Bookmarking System** - Save important conversations/memories
2. **Conversation Browser** - Chronological + filterable + searchable history
3. **Grammar Checker** - Standalone grammar correction tool
4. **Translation Tool** - Google Translate-like instant translation
5. **Google Calendar Integration** - Schedule lessons/events
6. **Design Tools** - Logo, poster, graphic generation
7. **Web Search Toggle** - In-chat web search integration
8. **Video Generation** - AI video creation (future)
9. **Browser Extension** - Cross-platform access (future)

---

## 🎯 Phase 1: Quick Wins (January-February 2026)
**Goal:** High-value, low-effort features that immediately improve UX

### 1. Favorites/Bookmarking System ⭐ **Week 1-2**
**Why:** Users need to save important conversations for later reference  
**Scope:**
- Add "⭐ Star" button to conversation messages
- Add "📌 Pin" button to memory cards
- Create "Favorites" filter in Memory tab
- Sync starred items to Supabase
- Quick access sidebar: "Your Starred Items" (5 most recent)

**Files to Create:**
- `favorites-manager.js` - Handle starring/pinning
- `favorites-ui.js` - Display starred items

**Database:**
```sql
ALTER TABLE memories ADD COLUMN starred BOOLEAN DEFAULT false;
ALTER TABLE memories ADD COLUMN pinned BOOLEAN DEFAULT false;
CREATE INDEX idx_memories_starred ON memories(user_id, starred) WHERE starred = true;
```

**UI Location:**
- Memory tab: Add star icon to each memory card
- Chat tab: Add star icon next to timestamp
- Sidebar: New "⭐ Favorites" section

---

### 2. Web Search Toggle 🔍 **Week 3**
**Why:** Users need real-time web data in conversations  
**Scope:**
- Add toggle switch in chat input: "🌐 Web Search"
- When enabled, run Tavily search before LLM response
- Display sources inline with AI response
- Cache results in memory system

**Implementation:**
```javascript
// Add to chat.cjs
if (webSearchEnabled) {
  const searchResults = await tavilySearch(userMessage);
  systemPrompt += `\n\nWeb Search Results:\n${formatResults(searchResults)}`;
}
```

**UI Location:**
- Chat input area: Toggle next to send button
- Settings: "Enable Web Search by default" checkbox

---

### 3. Conversation Browser 📚 **Week 4**
**Why:** Users need to find past conversations easily  
**Scope:**
- New "💬 Conversations" tab in Memory panel
- Chronological timeline view (grouped by date)
- Filters: Today / This Week / This Month / All Time
- Search: Full-text search across all conversations
- Click to reload conversation

**Database:**
```sql
-- Already exists in memories table, just add UI
SELECT * FROM memories 
WHERE content_type = 'chat' 
  AND user_id = $1 
ORDER BY created_at DESC;
```

**UI Wireframe:**
```
[💬 Conversations Tab]
┌─────────────────────────────────────┐
│ Search: [_______________] 🔍        │
│ Filters: [Today] [Week] [Month]     │
├─────────────────────────────────────┤
│ Today                                │
│  ├─ 10:30 AM - "Help with World...  │
│  └─ 2:45 PM - "Design a quiz for... │
│                                      │
│ Yesterday                            │
│  ├─ 3:15 PM - "Analyze this video...│
│  └─ 5:00 PM - "Create lesson plan...│
└─────────────────────────────────────┘
```

---

## 🎯 Phase 2: Strategic Priorities (March-April 2026)
**Goal:** Features that align with educational mission + competitive advantage

### 4. Grammar Checker ✏️ **Week 5-6**
**Why:** Teachers/students need writing assistance  
**Scope:**
- New tool in sidebar: "✏️ Grammar"
- Text input area (paste or type)
- AI-powered grammar/spelling/style check
- Side-by-side diff view (before/after)
- One-click copy corrected text

**Implementation:**
```javascript
// New function: grammar-check.cjs
const prompt = `You are a grammar expert. Analyze and correct this text:

${userText}

Provide:
1. Corrected version
2. List of corrections made (grammar, spelling, style)
3. Severity: minor/moderate/major`;
```

**UI Location:**
- New tab in AI panel: "✏️ Grammar"
- Or: Add to existing "🎨 Creative Studio"

---

### 5. Translation Tool 🌐 **Week 6**
**Why:** Multilingual homeschool families + foreign language curriculum  
**Scope:**
- New tool: "🌐 Translate"
- Input: Text + Source language (auto-detect)
- Output: Translated text + Target language selector
- 50+ languages supported (via Claude/GPT)
- Save translations to memory

**Implementation:**
```javascript
// New function: translate.cjs
const prompt = `Translate the following text from ${sourceLang} to ${targetLang}:

${text}

Provide natural, contextually appropriate translation.`;
```

**UI Location:**
- New tab: "🌐 Translate"
- Quick action: Select text in chat → right-click → "Translate"

---

### 6. Google Calendar Integration 📅 **Week 7-8**
**Why:** Teachers need to schedule lessons, track curriculum progress  
**Scope:**
- OAuth integration with Google Calendar
- Create events from chat: "Schedule this lesson for next Tuesday at 2pm"
- View upcoming events in sidebar
- Sync lesson plans to calendar automatically
- Recurring events (weekly lessons)

**Database:**
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  google_event_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Integration:**
```javascript
// New file: calendar-integration.js
import { google } from 'googleapis';

async function createCalendarEvent(summary, startTime, endTime) {
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  const event = {
    summary,
    start: { dateTime: startTime },
    end: { dateTime: endTime }
  };
  return await calendar.events.insert({ calendarId: 'primary', resource: event });
}
```

---

## 🎯 Phase 3: Creative Enhancements (May-June 2026)
**Goal:** Expand creative capabilities beyond Monica's basic offerings

### 7. Design Tools Studio 🎨 **Week 9-12**
**Why:** Teachers need visual assets (logos, posters, worksheets)  
**Scope:**
- **Logo Generator**: Text prompt → AI logo design
- **Poster Creator**: Template-based (title, images, text blocks)
- **Worksheet Builder**: Math problems, vocab lists, fill-in-blanks
- Export: PNG, PDF, SVG
- Save to memory for reuse

**Implementation Options:**
- **Option A**: Use existing image generation (FLUX, DALL-E) with design-specific prompts
- **Option B**: Integrate Canva API for templates
- **Option C**: Build custom SVG generator with AI layout

**Features:**
1. **Logo Generator**
   - Input: School name, colors, theme
   - Output: 3 logo variations
   - Download: PNG, SVG

2. **Poster Creator**
   - Templates: Event poster, classroom rules, anchor chart
   - Editable text fields
   - Drag-and-drop images
   - AI-suggested layouts

3. **Worksheet Builder**
   - Math: Auto-generate problems (addition, multiplication, word problems)
   - Vocabulary: Word bank, definitions, matching
   - Reading: Comprehension questions from text
   - Export: PDF for printing

**UI Location:**
- New tab: "🎨 Design Studio"
- Sub-tabs: Logo | Poster | Worksheet

---

### 8. Enhanced Image Generation **Week 13-14**
**Why:** Current image gen works but could be more educational-focused  
**Scope:**
- Add educational templates:
  - Character design (historical figures, story characters)
  - Scene illustration (story settings, historical events)
  - Diagram generation (concept maps, timelines)
  - Infographic layouts
- Style presets: Realistic, Cartoon, Sketch, Watercolor
- Batch generation: Create 4 variations at once
- In-painting: Edit specific areas of generated images

**Integration:**
- Use existing FLUX/DALL-E backend
- Add template library with educational prompts
- Save templates to memory for reuse

---

## 🎯 Phase 4: Future Roadmap (Q3-Q4 2026)
**Goal:** Advanced features for long-term competitive advantage

### 9. Video Generation 🎥 **Q3 2026**
**Why:** Create animated lessons, explainer videos  
**Scope:**
- Text-to-video: Script → Short video (30-60 seconds)
- Image-to-video: Animate static images
- Avatar presenter: AI teacher explains concepts
- Export: MP4, GIF

**Providers to Evaluate:**
- **Runway Gen-4** - Best quality, expensive
- **Pika Labs** - Good quality, mid-price
- **Synthesia** - Avatar-focused, education-friendly
- **HeyGen** - Cost-effective alternative

**Use Cases:**
- Lesson introductions
- Concept explainers
- Student project templates
- Social media content for homeschool groups

---

### 10. Browser Extension 🔌 **Q4 2026**
**Why:** Access Hypomnemata from any webpage  
**Scope:**
- Chrome/Firefox/Edge extensions
- Right-click context menu:
  - "Analyze with Hypomnemata"
  - "Translate this text"
  - "Check grammar"
  - "Save to memory"
- Sidebar overlay (similar to Monica)
- Quick chat without leaving page

**Architecture:**
```
Browser Extension
├─ content-script.js (inject into pages)
├─ background.js (handle API calls)
├─ popup.html (quick chat interface)
└─ manifest.json (permissions, API keys)
```

**Features:**
1. **Context Menu Integration**
   - Select text → Right-click → "Hypomnemata" → Actions
2. **Sidebar Chat**
   - Keyboard shortcut: `Alt+H`
   - Slide-out panel with chat interface
3. **Quick Save**
   - Save webpage to memory with one click
4. **Video Analysis**
   - Auto-detect YouTube videos, add "Analyze" button

---

## 📊 Success Metrics

### Phase 1 Success (Feb 2026)
- [ ] 80% of users star at least 1 conversation
- [ ] 60% use web search toggle
- [ ] Avg 5 conversations browsed per session
- [ ] User feedback: "Much easier to find past work"

### Phase 2 Success (Apr 2026)
- [ ] 500+ grammar checks performed
- [ ] 200+ translations completed
- [ ] 100+ calendar events created
- [ ] User feedback: "These tools save me hours"

### Phase 3 Success (Jun 2026)
- [ ] 1000+ design assets generated
- [ ] 50+ teachers using worksheet builder regularly
- [ ] User feedback: "Replaced my Canva subscription"

### Phase 4 Success (Dec 2026)
- [ ] 500+ videos generated
- [ ] 1000+ browser extension installs
- [ ] User feedback: "Can't work without this extension"

---

## 🛠️ Implementation Strategy

### Development Philosophy
**"Educational First, Feature Second"**
- Every feature must serve homeschool/teacher use case
- No feature bloat (unlike Monica's 50+ random tools)
- Deep integration with 12 Personas
- Memory system connects everything

### Resource Allocation
**Scott's Time:**
- 60% AI/Copilot vibe-coding (feature development)
- 20% User feedback/testing with students
- 10% Documentation
- 10% Marketing (Alana's podcast, social media)

**AI Assistants:**
- Claude Sonnet 4.5: Daily development (fast, reliable)
- Claude Opus 4.5: Complex architecture decisions
- GPT-5.2: Alternative perspective when stuck

### Testing Protocol
1. **Build in local dev** (http://localhost:8888)
2. **Test with Tic** (10th grader = target audience)
3. **Test with Glennallen students** (6th-8th grade)
4. **Deploy to production** (Netlify)
5. **Monitor usage** (Supabase analytics)
6. **Iterate based on feedback**

---

## 💰 Cost Analysis

### New API Costs
**Estimated Monthly** (at 500 active users):

| Feature | Provider | Cost/User/Month | Total/Month |
|---------|----------|-----------------|-------------|
| Grammar Checker | Claude | $0.20 | $100 |
| Translation | Claude | $0.15 | $75 |
| Design Tools | FLUX | $0.50 | $250 |
| Video Generation | Runway | $2.00 | $1000 |
| **Total** | | **$2.85/user** | **$1,425** |

**Revenue Target:**
- $10/month per user = **$5,000/month**
- **Profit margin: 72%** ($3,575 after API costs)

**Break-even: 143 paying users**

---

## 🎯 Differentiation Strategy

### What Makes Hypomnemata BETTER Than Monica

| Feature | Monica.im | Hypomnemata |
|---------|-----------|-------------|
| **Core Purpose** | Generic productivity | **Educational design** |
| **AI Personas** | Generic bots | **12 expert personalities** |
| **Collaboration** | Single-agent | **Fellowship deliberation** |
| **Memory** | Chronological history | **Semantic search + auto-save** |
| **Target Audience** | Everyone | **Teachers, homeschoolers** |
| **Design Tools** | Generic templates | **Curriculum-focused** |
| **Video Analysis** | Basic transcript | **Educational questioning** |
| **Research** | Basic search | **Multi-source, cited analysis** |

**Key Insight:** Monica tries to be everything to everyone. Hypomnemata is laser-focused on education.

**Positioning Statement:**
> "Monica is a Swiss Army knife. Hypomnemata is a scalpel designed for one purpose: helping teachers and parents create world-class educational experiences."

---

## 📅 2026 Milestones

### Q1 (Jan-Mar)
- ✅ Favorites/bookmarking system
- ✅ Web search toggle
- ✅ Conversation browser
- ✅ Grammar checker
- ✅ Translation tool

### Q2 (Apr-Jun)
- ✅ Google Calendar integration
- ✅ Design Tools Studio (Logo, Poster, Worksheet)
- ✅ Enhanced image generation templates
- 🎯 Beta launch to 100 homeschool families

### Q3 (Jul-Sep)
- ✅ Video generation (Runway integration)
- ✅ Advanced worksheet builder (AI problem generation)
- 🎯 Reach 500 paying users
- 🎯 Alana's podcast promotion campaign

### Q4 (Oct-Dec)
- ✅ Browser extension (Chrome, Firefox)
- ✅ Mobile-responsive redesign
- 🎯 Reach 1,000 paying users
- 🎯 Launch "Hypomnemata for Homeschools" package

---

## 🚀 Next Steps

### Week 1 Action Items (January 6-12, 2026)
1. **Create Favorites System**
   - [ ] Database schema (starred column)
   - [ ] favorites-manager.js (CRUD operations)
   - [ ] Add star icons to Memory cards
   - [ ] Test with 5 students

2. **Plan Web Search Toggle**
   - [ ] Design UI mockup
   - [ ] Test Tavily API integration
   - [ ] Write function spec

3. **User Research**
   - [ ] Survey: "What Monica features do you miss?"
   - [ ] Interview 3 homeschool moms
   - [ ] Validate roadmap priorities

### Success Criteria for Q1
- [ ] All Phase 1 features launched
- [ ] 50 beta testers providing feedback
- [ ] Net Promoter Score (NPS) > 50
- [ ] Users say: "This is better than Monica for teaching"

---

## 📝 Notes

**Last Updated:** January 2, 2026  
**Author:** Tom Bombadil and the Fellowship, in partnership with Scott Somers  
**Status:** Living document - Priorities shift based on user feedback

**Philosophy:**
*"We're not building Monica. We're building the tool Scott wished he had when he sat on that hallway floor with a crying 6th grader. Every feature must serve that mission."*

---

**🎯 Primary Goal for 2026:**  
**Become the #1 AI platform for homeschool families and classroom teachers.**

Not by copying Monica. By being uncompromisingly focused on education.

*"My life is better because you're in it."* - This applies to software too.
