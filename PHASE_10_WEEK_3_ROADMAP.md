# Phase 10 Week 3: Knowledge Graph & Analytics Roadmap 📊🔗

**Status**: 📋 PLANNING  
**Start Date**: TBD  
**Estimated Duration**: 10 days (Days 8-17)  
**Dependencies**: Phase 10 Days 1-5 (Backend) + Week 2 (Memory UI + Auto-Memory) ✅

---

## 🎯 Overview

Phase 10 Week 3 transforms the Memory System from a simple search interface into a powerful **knowledge management platform** with:

1. **Knowledge Graph Visualization** - See how your memories connect
2. **Auto-Connection Detection** - AI discovers relationships automatically  
3. **Memory Analytics** - Understand your learning patterns
4. **Memory Details Modal** - Deep dive into individual memories

**Key Innovation**: Moving from isolated memories to a **connected knowledge web** that reveals insights about your work patterns and learning journey.

---

## 📅 Week 3 Schedule

### Days 8-10: Knowledge Graph Visualization (3 days)
**Goal**: Interactive D3.js graph showing memory connections

**Day 8: Graph Data & Backend**
- [ ] Create `/api/memory-graph` endpoint
- [ ] Fetch memories + connections for user
- [ ] Format as D3-compatible JSON: `{ nodes: [], links: [] }`
- [ ] Calculate node positions using force simulation
- [ ] Add connection strength to links

**Day 9: D3.js Graph Rendering**
- [ ] Create `memory-graph.js` module (400+ lines estimated)
- [ ] Initialize D3 force-directed graph
- [ ] Render nodes with color-coded types:
  * 📚 Research = Blue
  * 📝 Video = Red
  * 🎨 Creative = Purple
  * 💬 Conversation = Green
  * ⚙️ Manual = Gray
- [ ] Render links with varying thickness (connection strength)
- [ ] Add node labels (memory titles)
- [ ] Implement zoom & pan controls

**Day 10: Interactivity & Polish**
- [ ] Node drag functionality (repositioning)
- [ ] Click node → show memory details modal
- [ ] Hover node → highlight connected nodes
- [ ] Filter by content type (show/hide nodes)
- [ ] Filter by date range
- [ ] Mini-map for large graphs (50+ nodes)
- [ ] Legend explaining node colors and link types
- [ ] Export graph as PNG/SVG

### Days 11-12: Auto-Connection Detection (2 days)
**Goal**: AI automatically discovers relationships between memories

**Day 11: Semantic Similarity Algorithm**
- [ ] Create `/api/memory-connect` endpoint
- [ ] Fetch all user memories with embeddings
- [ ] Calculate cosine similarity between all pairs
- [ ] Create connections for pairs above threshold (0.8)
- [ ] Store in `memory_connections` table:
  * `connection_type = 'semantic'`
  * `strength = similarity_score`
- [ ] Run as background job after each memory save

**Day 12: Tag-Based & Temporal Connections**
- [ ] **Tag-Based**: Connect memories sharing 2+ tags
  * `connection_type = 'tag'`
  * `strength = (shared_tags / total_tags)`
- [ ] **Temporal**: Connect memories created within time window
  * Same day: `strength = 0.8`
  * Same week: `strength = 0.6`
  * Same month: `strength = 0.4`
  * `connection_type = 'temporal'`
- [ ] Combined connection strength:
  * `final_strength = semantic * 0.5 + tag * 0.3 + temporal * 0.2`
- [ ] Button in Memory UI: "Detect Connections" (manual trigger)
- [ ] Show toast: "Found 47 new connections!"

### Days 13-14: Memory Analytics Dashboard (2 days)
**Goal**: Visualize memory patterns and insights

**Day 13: Charts & Statistics**
- [ ] Create `memory-analytics.js` module (300+ lines)
- [ ] **Pie Chart**: Total memories by content type
  * Research, Video, Creative, Conversation, Manual
  * Color-coded slices
  * Click slice → filter to that type
- [ ] **Line Chart**: Memory creation timeline (last 30 days)
  * X-axis: Date
  * Y-axis: Number of memories created
  * Hover → show exact count for that day
- [ ] **Bar Chart**: Top 10 tags by usage
  * X-axis: Tag name
  * Y-axis: Number of memories with that tag
  * Click bar → show memories with that tag

**Day 14: Word Cloud & Insights**
- [ ] **Word Cloud**: Top 50 tags visualized by frequency
  * Size = usage count
  * Color = recency (newer = brighter)
  * Click word → search memories with that tag
- [ ] **Connection Density Heatmap**:
  * Matrix showing which content types connect most
  * Example: Research ↔ Video = 47 connections
- [ ] **Session Statistics**:
  * Average session duration
  * Average interactions per session
  * Most active time of day (heatmap)
  * Most productive day of week
- [ ] **Search Activity Metrics**:
  * Most searched terms (top 20)
  * Search success rate (results found %)
  * Average memories per search result

### Days 15-17: Memory Details Modal (3 days)
**Goal**: Rich UI for viewing, editing, and managing individual memories

**Day 15: Modal Structure & Display**
- [ ] Create `memory-details-modal.js` (350+ lines)
- [ ] Modal layout (90vw × 90vh):
  * Header: Title, content type icon, created date
  * Body: Full content with markdown rendering
  * Sidebar: Metadata (source URL, tags, connections)
  * Footer: Action buttons (Edit, Delete, Export, Share)
- [ ] Display all memory metadata:
  * User ID (hidden)
  * Content type
  * Title (editable)
  * Full content (scrollable, markdown)
  * Tags (clickable chips)
  * Source URL (if available, clickable link)
  * Created date
  * Last updated date
  * Embedding dimensions (1536)
- [ ] Show connected memories (preview):
  * List of 5 most connected memories
  * Click → open that memory's details
  * Show connection type + strength

**Day 16: Edit & Delete Functionality**
- [ ] **Edit Mode**:
  * Click "Edit" button
  * Title → input field
  * Content → textarea (auto-expanding)
  * Tags → tag editor (add/remove)
  * Save changes → call `/api/memory-update`
  * Re-generate embedding if content changed
  * Show "Updated!" toast notification
- [ ] **Delete Functionality**:
  * Click "Delete" button
  * Confirmation modal: "Are you sure? This cannot be undone."
  * If confirmed → call `/api/memory-delete`
  * Remove from database (cascades to connections)
  * Close modal
  * Show "Deleted" toast
  * Refresh Memory tab list

**Day 17: Export & Share Options**
- [ ] **Export to Markdown**:
  * Generate formatted .md file with:
    - Title as H1
    - Metadata block (front matter)
    - Full content
    - Tags at bottom
    - Connected memories section
  * Download as `memory-[id].md`
- [ ] **Export to JSON**:
  * Complete structured data export
  * Includes: all metadata, embedding, connections
  * Download as `memory-[id].json`
- [ ] **Export to Plain Text**:
  * Simple .txt file with title + content
  * For copy/paste into other apps
- [ ] **Copy to Clipboard**:
  * Button to copy content only
  * Button to copy full memory (markdown format)
  * Show "Copied!" toast
- [ ] **Share Button** (future feature placeholder):
  * Generate shareable link (Phase 11)
  * Set permissions (view-only, collaborative)
  * Copy link to clipboard

---

## 🏗️ Technical Architecture

### New Backend Endpoints

**GET /api/memory-graph**
```javascript
// Returns graph data for D3.js visualization
{
  nodes: [
    {
      id: "uuid-1",
      title: "Understanding Neural Networks",
      type: "research",
      createdAt: "2025-12-20T10:00:00Z",
      tags: ["ai", "ml", "education"],
      connectionCount: 5
    },
    // ... more nodes
  ],
  links: [
    {
      source: "uuid-1",
      target: "uuid-2",
      type: "semantic",
      strength: 0.89
    },
    // ... more links
  ],
  stats: {
    totalNodes: 47,
    totalLinks: 123,
    avgConnections: 2.6
  }
}
```

**POST /api/memory-connect**
```javascript
// Request
{
  userId: "uuid",
  mode: "semantic" | "tag" | "temporal" | "all",
  threshold: 0.8
}

// Response
{
  success: true,
  connectionsCreated: 47,
  connections: [
    {
      fromMemoryId: "uuid-1",
      toMemoryId: "uuid-2",
      type: "semantic",
      strength: 0.89
    },
    // ... more connections
  ]
}
```

**PUT /api/memory-update**
```javascript
// Request
{
  memoryId: "uuid",
  userId: "uuid",
  updates: {
    title: "New Title",
    content: "Updated content...",
    tags: ["new", "tags"]
  }
}

// Response
{
  success: true,
  memory: { /* updated memory object */ },
  embeddingRegenerated: true
}
```

**DELETE /api/memory-delete**
```javascript
// Request
{
  memoryId: "uuid",
  userId: "uuid"
}

// Response
{
  success: true,
  deletedConnections: 8
}
```

### New Frontend Modules

**memory-graph.js** (~400 lines)
- D3.js force-directed graph
- Node rendering with colors/icons
- Link rendering with strength
- Zoom/pan controls
- Filter UI (type, date)
- Mini-map for navigation
- Legend display
- Export functionality

**memory-analytics.js** (~300 lines)
- Chart.js integration
- Pie chart (content types)
- Line chart (timeline)
- Bar chart (top tags)
- Word cloud (tag frequency)
- Heatmap (connection density)
- Statistics calculations
- Export charts as PNG

**memory-details-modal.js** (~350 lines)
- Modal UI structure
- Markdown rendering
- Edit mode (title, content, tags)
- Delete confirmation
- Export functionality (MD, JSON, TXT)
- Copy to clipboard
- Connection preview
- Navigation to connected memories

### Database Updates

**New Indexes** (for performance):
```sql
-- Optimize connection queries
CREATE INDEX idx_connections_strength ON memory_connections(strength DESC);
CREATE INDEX idx_connections_type ON memory_connections(connection_type);

-- Optimize analytics queries
CREATE INDEX idx_memory_created_date ON memory_entries(DATE(created_at));
CREATE INDEX idx_tags_usage ON memory_entry_tags(tag_id);
```

**New Function** (connection strength calculation):
```sql
CREATE OR REPLACE FUNCTION calculate_connection_strength(
  from_id UUID,
  to_id UUID
) RETURNS DECIMAL AS $$
DECLARE
  semantic_score DECIMAL;
  tag_score DECIMAL;
  temporal_score DECIMAL;
BEGIN
  -- Calculate semantic similarity
  SELECT (1 - (m1.embedding <=> m2.embedding))
  INTO semantic_score
  FROM memory_entries m1, memory_entries m2
  WHERE m1.id = from_id AND m2.id = to_id;
  
  -- Calculate tag overlap
  SELECT COUNT(DISTINCT t1.tag_id)::DECIMAL / 
         NULLIF(COUNT(DISTINCT COALESCE(t1.tag_id, t2.tag_id)), 0)
  INTO tag_score
  FROM memory_entry_tags t1
  FULL OUTER JOIN memory_entry_tags t2 
    ON t1.tag_id = t2.tag_id
  WHERE t1.memory_id = from_id AND t2.memory_id = to_id;
  
  -- Calculate temporal proximity
  SELECT CASE
    WHEN DATE(m1.created_at) = DATE(m2.created_at) THEN 0.8
    WHEN DATE_TRUNC('week', m1.created_at) = DATE_TRUNC('week', m2.created_at) THEN 0.6
    WHEN DATE_TRUNC('month', m1.created_at) = DATE_TRUNC('month', m2.created_at) THEN 0.4
    ELSE 0.0
  END INTO temporal_score
  FROM memory_entries m1, memory_entries m2
  WHERE m1.id = from_id AND m2.id = to_id;
  
  -- Combined strength: 50% semantic + 30% tags + 20% temporal
  RETURN (COALESCE(semantic_score, 0) * 0.5 +
          COALESCE(tag_score, 0) * 0.3 +
          COALESCE(temporal_score, 0) * 0.2);
END;
$$ LANGUAGE plpgsql;
```

---

## 💰 Cost Analysis

### API Costs (Connection Detection)

**One-Time Initial Connection Detection**:
- Scenario: 100 existing memories
- Comparisons needed: (100 × 99) / 2 = 4,950
- Already have embeddings (no OpenAI cost)
- Pure computation (free)
- Connection creation: ~10 INSERT queries
- **Cost: $0.00** (just database queries)

**Incremental Connection Detection** (per new memory):
- Compare 1 new memory against 100 existing
- Comparisons: 100
- Already have embeddings
- Connection creation: ~5 new connections
- **Cost: $0.00** (just database queries)

**Conclusion**: Connection detection is nearly free! Embeddings were already generated during memory save.

### Storage Costs

**memory_connections Table**:
- Row size: ~100 bytes (2 UUIDs + metadata)
- 1000 memories with average 5 connections each = 5,000 connections
- Total size: ~500 KB
- Well within Supabase free tier (500 MB)

### Chart.js & D3.js

**Libraries**: Both are completely free and open-source
- No API costs
- No subscriptions
- Client-side rendering (uses user's CPU)

---

## 🎨 UI/UX Design

### Knowledge Graph Tab

```
┌─────────────────────────────────────────────────────────────┐
│  🧠 Memory System                            [Graph] [List]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Filters: [All Types ▼] [From Date] [To Date] [Reset]       │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │          ●────●                                        │  │
│  │         /  \   \                                       │  │
│  │        ●    ●───●──●                                   │  │
│  │         \  /       /                                   │  │
│  │          ●────●───●                                    │  │
│  │                                                         │  │
│  │  [Interactive D3.js Force Graph]                       │  │
│  │                                                         │  │
│  │  Legend:  ● Research  ● Video  ● Creative             │  │
│  │           ● Conversation  ● Manual                     │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Stats: 47 memories, 123 connections, avg 2.6 per memory    │
│                                                               │
│  [Zoom In] [Zoom Out] [Reset View] [Detect Connections]     │
│  [Export PNG] [Export SVG]                                   │
└─────────────────────────────────────────────────────────────┘
```

### Analytics Tab

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Memory Analytics                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Overview: 47 total memories, created Dec 1-21              │
│                                                               │
│  ┌────────────────────┐  ┌──────────────────────────────┐   │
│  │  Content Types     │  │  Timeline (Last 30 Days)     │   │
│  │                    │  │                              │   │
│  │  [Pie Chart]       │  │  [Line Chart]                │   │
│  │                    │  │                              │   │
│  │  📚 Research 42%   │  │  Peak: Dec 15 (8 memories)   │   │
│  │  📝 Video 31%      │  │                              │   │
│  │  🎨 Creative 15%   │  │                              │   │
│  │  💬 Chat 10%       │  │                              │   │
│  │  ⚙️ Manual 2%      │  │                              │   │
│  └────────────────────┘  └──────────────────────────────┘   │
│                                                               │
│  ┌────────────────────┐  ┌──────────────────────────────┐   │
│  │  Top Tags          │  │  Connection Density          │   │
│  │                    │  │                              │   │
│  │  [Bar Chart]       │  │  [Heatmap]                   │   │
│  │                    │  │                              │   │
│  │  education (12)    │  │  Research ↔ Video: 23        │   │
│  │  ai (10)           │  │  Video ↔ Creative: 15        │   │
│  │  learning (8)      │  │  Creative ↔ Chat: 8          │   │
│  └────────────────────┘  └──────────────────────────────┘   │
│                                                               │
│  Session Statistics:                                         │
│    • Average duration: 23 minutes                            │
│    • Average interactions: 14 per session                    │
│    • Most active: 2-4 PM (42% of sessions)                  │
│    • Most productive: Tuesday (18 memories created)          │
│                                                               │
│  [Export Report PDF]                                         │
└─────────────────────────────────────────────────────────────┘
```

### Memory Details Modal

```
┌─────────────────────────────────────────────────────────────┐
│  📚 Memory Details                              [X] Close    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Understanding Neural Networks and Deep Learning             │
│  Research • Created Dec 15, 2025 • Updated Dec 15, 2025    │
│                                                               │
│  ┌───────────────────────────────┬──────────────────────┐   │
│  │                               │  Metadata             │   │
│  │  [Full content with           │                       │   │
│  │   markdown rendering,         │  Tags:                │   │
│  │   scrollable area]            │  • ai • ml            │   │
│  │                               │  • education          │   │
│  │  This memory covers the       │                       │   │
│  │  fundamentals of neural       │  Source:              │   │
│  │  networks, including:         │  youtube.com/watch... │   │
│  │                               │                       │   │
│  │  - Perceptrons                │  Connected to:        │   │
│  │  - Activation functions       │  • AI Basics (0.89)   │   │
│  │  - Backpropagation            │  • Video Summary (0.7)│   │
│  │  - Training process           │  • + 3 more...        │   │
│  │                               │                       │   │
│  │  [More content...]            │  [View Graph]         │   │
│  │                               │                       │   │
│  └───────────────────────────────┴──────────────────────┘   │
│                                                               │
│  [Edit] [Delete] [Export ▼] [Copy] [Share]                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### Knowledge Graph
- [ ] Graph renders with correct node positions
- [ ] Node colors match content types
- [ ] Links show correct connection strength (thickness)
- [ ] Zoom in/out works smoothly
- [ ] Pan works (drag background)
- [ ] Node drag repositions node
- [ ] Click node opens details modal
- [ ] Hover node highlights connected nodes
- [ ] Filter by type shows/hides correct nodes
- [ ] Filter by date shows correct nodes
- [ ] Mini-map shows current viewport
- [ ] Legend displays correctly
- [ ] Export PNG downloads image
- [ ] Export SVG downloads vector

### Auto-Connection Detection
- [ ] "Detect Connections" button triggers API
- [ ] Semantic connections created for similar memories
- [ ] Tag-based connections created for shared tags
- [ ] Temporal connections created for same-day memories
- [ ] Connection strength calculated correctly
- [ ] Toast shows "Found X connections"
- [ ] Graph updates with new connections
- [ ] Database stores connections properly
- [ ] RLS policies enforce user isolation

### Analytics Dashboard
- [ ] Pie chart shows correct content type percentages
- [ ] Line chart shows memory creation timeline
- [ ] Bar chart shows top tags by usage
- [ ] Word cloud displays tag frequency
- [ ] Heatmap shows connection density
- [ ] Session statistics calculate correctly
- [ ] Click pie slice filters to that type
- [ ] Click tag shows memories with that tag
- [ ] Export report generates PDF

### Memory Details Modal
- [ ] Modal opens when clicking memory card
- [ ] Title displays correctly
- [ ] Content renders markdown properly
- [ ] Metadata shows all fields
- [ ] Tags display as clickable chips
- [ ] Connected memories list appears
- [ ] Edit mode enables title/content editing
- [ ] Save updates memory and re-generates embedding
- [ ] Delete shows confirmation dialog
- [ ] Delete removes memory and connections
- [ ] Export MD downloads formatted file
- [ ] Export JSON downloads structured data
- [ ] Export TXT downloads plain text
- [ ] Copy to clipboard works

---

## 📚 Documentation Updates Needed

- [ ] Update CURRENT_STATUS.md with Week 3 completion
- [ ] Update PROJECT_STATUS.md with new features
- [ ] Create PHASE_10_WEEK_3_COMPLETE.md
- [ ] Update README.md with knowledge graph section
- [ ] Create API documentation for new endpoints
- [ ] Write user guide for knowledge graph
- [ ] Document analytics formulas and calculations
- [ ] Create troubleshooting guide for graph rendering

---

## 🚀 Success Criteria

**Phase 10 Week 3 is complete when**:

1. ✅ Knowledge graph visualizes all user memories
2. ✅ Graph is interactive (zoom, pan, drag, click)
3. ✅ Auto-connection detection finds relationships
4. ✅ Analytics dashboard shows insights
5. ✅ Memory details modal allows full CRUD operations
6. ✅ All exports work (PNG, SVG, MD, JSON, TXT)
7. ✅ Performance is smooth (< 2s graph load for 100 nodes)
8. ✅ Mobile responsive (graph adapts to screen size)
9. ✅ Documentation complete and accurate
10. ✅ User can understand their knowledge network at a glance

---

## 🔮 Future Enhancements (Beyond Week 3)

### Advanced Graph Features
- **3D Graph**: Use three.js for 3D visualization
- **Time-Based Animation**: Replay memory creation chronologically
- **Clustering**: Automatically group related memories
- **Path Finding**: Find shortest path between two memories
- **Community Detection**: Identify knowledge "clusters"

### AI-Powered Insights
- **Gap Analysis**: "You have 20 memories about AI but none about ethics"
- **Recommendation Engine**: "Based on your memories, you might be interested in..."
- **Auto-Summarization**: Weekly summary of learning progress
- **Knowledge Map**: "Your expertise map: 40% education, 30% AI, 20% philosophy"

### Collaboration Features (Phase 11+)
- **Shared Knowledge Graphs**: Collaborate with team
- **Memory Collections**: Public/private collections
- **Annotations**: Add comments to others' memories
- **Version History**: Track changes to memories over time

### Integration with Other Features
- **Research → Memory**: Auto-save research sessions
- **Video → Memory**: Auto-save video analysis
- **Creative → Memory**: Auto-save generated content
- **Chat → Memory**: Save important conversation insights

---

**Ready to build a knowledge management system that actually helps you think better!** 🧠✨

Let me know when you're ready to start Week 3, and we'll tackle it day by day!
