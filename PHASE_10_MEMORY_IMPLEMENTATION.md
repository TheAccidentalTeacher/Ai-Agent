# Phase 10: Memory & Knowledge Management
## Implementation Plan

**Duration**: 2-3 weeks  
**Status**: 🟢 ACTIVE - Week 1 Starting  
**Started**: December 21, 2025

---

## 🎯 Goal

Make agents remember everything forever. Enable truly autonomous operation by giving agents persistent memory, universal search, and knowledge graph visualization.

---

## 📋 Week 1: Vector Storage + Embeddings + Search

**Duration**: 5-7 days  
**Focus**: Backend infrastructure for memory storage

### Day 1-2: Database Setup ✅ STARTING NOW

**Tasks**:
- [ ] Create Supabase tables for memory storage
  - `memory_entries` table (id, user_id, content, embedding, metadata, created_at)
  - `memory_tags` table (id, tag_name, color, created_at)
  - `memory_entry_tags` junction table (memory_id, tag_id)
- [ ] Enable pgvector extension in Supabase
- [ ] Create indexes for fast vector similarity search
- [ ] Add RLS policies for user data isolation

**Database Schema**:
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Memory entries table
CREATE TABLE memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'research', 'conversation', 'video', 'creative'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embeddings
  metadata JSONB DEFAULT '{}',
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE memory_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tag_name)
);

-- Junction table for many-to-many
CREATE TABLE memory_entry_tags (
  memory_id UUID REFERENCES memory_entries(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES memory_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, tag_id)
);

-- Indexes for performance
CREATE INDEX idx_memory_user ON memory_entries(user_id);
CREATE INDEX idx_memory_created ON memory_entries(created_at DESC);
CREATE INDEX idx_memory_type ON memory_entries(content_type);
CREATE INDEX idx_memory_embedding ON memory_entries USING ivfflat (embedding vector_cosine_ops);

-- Full-text search
ALTER TABLE memory_entries ADD COLUMN search_vector tsvector;
CREATE INDEX idx_memory_search ON memory_entries USING gin(search_vector);

-- Auto-update search vector on insert/update
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memory_search_update
  BEFORE INSERT OR UPDATE ON memory_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

-- RLS policies
ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_entry_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories" ON memory_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" ON memory_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" ON memory_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON memory_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for tags
CREATE POLICY "Users can view own tags" ON memory_tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tags" ON memory_tags
  FOR ALL USING (auth.uid() = user_id);
```

### Day 3-4: Embedding Service

**Tasks**:
- [ ] Create `memory-service.js` for embedding generation
- [ ] Implement OpenAI embedding API integration
- [ ] Add chunking for large content (max 8000 tokens)
- [ ] Create batch embedding function for efficiency
- [ ] Add error handling and retry logic

**Features**:
- Auto-chunk large content into semantic sections
- Generate embeddings using OpenAI `text-embedding-ada-002`
- Store embeddings in pgvector format
- Cost tracking (embeddings are $0.0001 per 1K tokens)

**File**: `memory-service.js`
```javascript
// Embedding generation, chunking, storage
// Cost: ~$0.10 per 1000 entries (very cheap!)
```

### Day 5-7: Search Implementation

**Tasks**:
- [ ] Create `/api/memory-search` endpoint
- [ ] Implement hybrid search (vector + full-text)
- [ ] Add filters (date range, content type, tags)
- [ ] Create relevance scoring algorithm
- [ ] Add pagination (20 results per page)
- [ ] Test with existing research/video data

**Search Algorithm**:
1. **Vector Search**: Find semantically similar content (pgvector cosine similarity)
2. **Full-Text Search**: Find exact keyword matches (PostgreSQL tsvector)
3. **Hybrid Score**: Combine both with weighted average (70% vector, 30% text)
4. **Re-rank**: Apply filters, recency boost, user preferences

**Endpoint**: `/api/memory-search`
```javascript
POST /api/memory-search
{
  "query": "classical education homeschool",
  "filters": {
    "content_type": ["research", "video"],
    "tags": ["education", "homeschool"],
    "date_from": "2024-01-01",
    "date_to": "2025-12-31"
  },
  "limit": 20,
  "offset": 0
}

Response:
{
  "results": [
    {
      "id": "uuid",
      "title": "Classical Education Research",
      "content": "...",
      "content_type": "research",
      "relevance": 0.87,
      "tags": ["education", "homeschool"],
      "created_at": "2025-12-01T10:30:00Z"
    }
  ],
  "total": 47,
  "page": 1,
  "pages": 3
}
```

---

## 📋 Week 2: Knowledge Graph + Connections + Auto-Tagging

**Duration**: 5-7 days  
**Focus**: Intelligent connections and organization

### Day 8-10: Knowledge Graph Backend

**Tasks**:
- [ ] Create graph data structure (nodes = memories, edges = connections)
- [ ] Implement connection detection algorithm
- [ ] Add manual connection creation
- [ ] Calculate connection strength scores
- [ ] Store graph in Supabase JSONB or separate table

**Connection Detection**:
- Semantic similarity > 0.75 = strong connection
- Shared tags = medium connection  
- Same content type + recent = weak connection
- Manual user links = strongest connection

**Graph Schema**:
```sql
CREATE TABLE memory_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_memory_id UUID REFERENCES memory_entries(id) ON DELETE CASCADE,
  to_memory_id UUID REFERENCES memory_entries(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL, -- 'semantic', 'tag', 'manual', 'temporal'
  strength DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_memory_id, to_memory_id)
);

CREATE INDEX idx_connections_from ON memory_connections(from_memory_id);
CREATE INDEX idx_connections_to ON memory_connections(to_memory_id);
```

### Day 11-12: Auto-Tagging System

**Tasks**:
- [ ] Implement AI-powered tag extraction (Claude)
- [ ] Create tag suggestion algorithm
- [ ] Add tag merging/aliasing (homeschool = home-school)
- [ ] Build tag hierarchy (education > homeschool > classical)
- [ ] Add batch re-tagging for existing content

**Tag Extraction Prompt**:
```
Analyze this content and extract 3-7 relevant tags.
Tags should be:
- Single words or short phrases (2-3 words max)
- Lowercase, hyphenated if needed
- Broad enough to group similar content
- Specific enough to be useful

Content: [...]

Return as JSON array: ["tag1", "tag2", "tag3"]
```

### Day 13-14: Analytics Backend

**Tasks**:
- [ ] Create `/api/memory-analytics` endpoint
- [ ] Calculate memory statistics (total, by type, growth over time)
- [ ] Identify most-used tags and topics
- [ ] Find knowledge gaps (topics with few memories)
- [ ] Generate insights ("You research education 3x more than games")

---

## 📋 Week 3: UI + Visualization + Export

**Duration**: 5-7 days  
**Focus**: User interface and data visualization

### Day 15-17: Memory Search UI

**Tasks**:
- [ ] Create new "Memory" tab in AI panel
- [ ] Build search interface with filters
- [ ] Add search results display with preview
- [ ] Implement "Save to Memory" buttons in:
  - Research tab → Save research session
  - Video tab → Save video summary + analysis
  - Creative Studio → Save generated content
  - Chat → Save important conversations
- [ ] Add manual memory creation form
- [ ] Show memory details modal

**UI Features**:
- Search bar with autocomplete (recent searches)
- Filter sidebar (content type, tags, date range)
- Results grid with cards (title, preview, tags, date)
- Quick actions (view, edit, delete, connect)
- Empty state with onboarding

### Day 18-19: Knowledge Graph Visualization

**Tasks**:
- [ ] Install D3.js for graph rendering
- [ ] Create force-directed graph layout
- [ ] Add node customization (size by importance, color by type)
- [ ] Implement zoom/pan/drag interactions
- [ ] Add node click → show memory details
- [ ] Create graph legend and controls
- [ ] Add graph export (PNG, SVG)

**Graph Features**:
- Nodes sized by number of connections
- Color-coded by content type (research=blue, video=red, creative=purple)
- Edges weighted by connection strength (thicker = stronger)
- Cluster detection (groups of related memories)
- Search highlighting (dim unrelated nodes)

### Day 20-21: Export & Integration

**Tasks**:
- [ ] Add export to Markdown (individual or bulk)
- [ ] Add export to JSON (full memory dump)
- [ ] Create Obsidian-compatible format (with frontmatter)
- [ ] Add Notion integration (optional, Phase 11)
- [ ] Create memory backup/restore
- [ ] Add memory import from files

**Export Formats**:

**Markdown**:
```markdown
---
title: Classical Education Research
type: research
tags: [education, homeschool, classical]
created: 2025-12-01
---

# Classical Education Research

[Full content here...]

## Connections
- [[Homeschool Curriculum Comparison]]
- [[Liberal Arts Education]]
```

**JSON**:
```json
{
  "id": "uuid",
  "title": "Classical Education Research",
  "content": "...",
  "type": "research",
  "tags": ["education", "homeschool"],
  "connections": ["uuid1", "uuid2"],
  "created_at": "2025-12-01T10:30:00Z"
}
```

---

## 🔧 Technical Stack

**Backend**:
- Supabase (PostgreSQL + pgvector)
- OpenAI Embeddings API (`text-embedding-ada-002`)
- Node.js/Express endpoints

**Frontend**:
- D3.js (graph visualization)
- Vanilla JS (consistent with existing code)
- CSS Grid/Flexbox layouts

**Libraries**:
- `@supabase/supabase-js` (already installed)
- `openai` (already installed)
- `d3` (need to install)

---

## 💰 Cost Breakdown

**OpenAI Embeddings**:
- $0.0001 per 1K tokens
- Average research session: ~2K tokens = $0.0002
- 1000 memories: ~$0.20
- Monthly for heavy user: $5-10/month

**Supabase**:
- Free tier: 500MB database, 2GB bandwidth
- Paid tier ($25/month): 8GB database, 50GB bandwidth
- For 10,000 memories: ~2GB = FREE tier sufficient

**Total**: $5-10/month (embeddings only, Supabase free tier)

---

## ✅ Success Criteria

**Week 1**:
- [ ] Can save research session to memory
- [ ] Can search memories with vector similarity
- [ ] Search returns relevant results <1 second

**Week 2**:
- [ ] Knowledge graph shows connections between memories
- [ ] Auto-tagging suggests 3-7 relevant tags
- [ ] Can view analytics dashboard

**Week 3**:
- [ ] Memory tab fully functional in UI
- [ ] Knowledge graph visualization works with zoom/pan
- [ ] Can export memories to Markdown/JSON
- [ ] All existing content types (research, video, creative) auto-save to memory

**Final Test**:
1. Do research on "classical education"
2. Watch YouTube video on "homeschool curriculum"
3. Generate image related to "education"
4. Search for "education" → should find all 3 items
5. View knowledge graph → should show connections
6. Export to Markdown → should work

---

## 🚀 After Phase 10

**Phase 11 Dependencies**:
- Autonomous agents will use memory search to recall past tasks
- Background processing will save results to memory automatically
- Goal-oriented agents will learn from past successes/failures stored in memory
- Agent inbox will show memories created overnight

**The Power of Memory**:
- Ask: "What did I research about homeschool in November?"
- See connections: How curriculum relates to classical education
- Never repeat research: Agents know what you already know
- True autonomy: Agents can work independently because they remember context

---

## 📝 Implementation Notes

**Phase Integration**:
- Memory system will automatically capture:
  - ✅ Deep research sessions (Phase 6)
  - ✅ YouTube video analyses (Phase 8)
  - ✅ Creative Studio outputs (Phase 9)
  - ✅ Multi-agent conversations (Phase 1-5)

**No Breaking Changes**:
- Existing features continue to work
- Memory is additive, not disruptive
- Users opt-in to saving specific content
- Auto-save can be toggled on/off

---

**Status**: Ready to implement! Starting with database setup...
