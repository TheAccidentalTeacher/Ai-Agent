-- Phase 10: Memory & Knowledge Management
-- Database Schema for Supabase
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New Query

-- ========================================
-- 1. ENABLE PGVECTOR EXTENSION
-- ========================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ========================================
-- 2. MEMORY ENTRIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('research', 'video', 'creative', 'conversation', 'manual')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embeddings (1536 dimensions)
  metadata JSONB DEFAULT '{}',
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 3. TAGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS memory_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tag_name)
);

-- ========================================
-- 4. MEMORY-TAG JUNCTION TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS memory_entry_tags (
  memory_id UUID REFERENCES memory_entries(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES memory_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (memory_id, tag_id)
);

-- ========================================
-- 5. MEMORY CONNECTIONS (Knowledge Graph)
-- ========================================
CREATE TABLE IF NOT EXISTS memory_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_memory_id UUID REFERENCES memory_entries(id) ON DELETE CASCADE,
  to_memory_id UUID REFERENCES memory_entries(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('semantic', 'tag', 'manual', 'temporal')),
  strength DECIMAL(3,2) NOT NULL CHECK (strength >= 0.00 AND strength <= 1.00),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_memory_id, to_memory_id)
);

-- ========================================
-- 6. INDEXES FOR PERFORMANCE
-- ========================================

-- Memory entries indexes
CREATE INDEX IF NOT EXISTS idx_memory_user ON memory_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_created ON memory_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memory_type ON memory_entries(content_type);
CREATE INDEX IF NOT EXISTS idx_memory_updated ON memory_entries(updated_at DESC);

-- Vector similarity index (IVFFlat for faster approximate search)
CREATE INDEX IF NOT EXISTS idx_memory_embedding ON memory_entries 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Full-text search column
ALTER TABLE memory_entries ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_memory_search ON memory_entries USING gin(search_vector);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_tags_user ON memory_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON memory_tags(tag_name);

-- Connections indexes
CREATE INDEX IF NOT EXISTS idx_connections_from ON memory_connections(from_memory_id);
CREATE INDEX IF NOT EXISTS idx_connections_to ON memory_connections(to_memory_id);
CREATE INDEX IF NOT EXISTS idx_connections_strength ON memory_connections(strength DESC);

-- ========================================
-- 7. AUTO-UPDATE SEARCH VECTOR TRIGGER
-- ========================================

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_memory_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.content, '') || ' ' ||
    COALESCE(NEW.metadata::text, '')
  );
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call function on insert/update
DROP TRIGGER IF EXISTS memory_search_update ON memory_entries;
CREATE TRIGGER memory_search_update
  BEFORE INSERT OR UPDATE ON memory_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_memory_search_vector();

-- ========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_entry_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_connections ENABLE ROW LEVEL SECURITY;

-- Memory entries policies
DROP POLICY IF EXISTS "Users can view own memories" ON memory_entries;
CREATE POLICY "Users can view own memories" ON memory_entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own memories" ON memory_entries;
CREATE POLICY "Users can insert own memories" ON memory_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own memories" ON memory_entries;
CREATE POLICY "Users can update own memories" ON memory_entries
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own memories" ON memory_entries;
CREATE POLICY "Users can delete own memories" ON memory_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
DROP POLICY IF EXISTS "Users can view own tags" ON memory_tags;
CREATE POLICY "Users can view own tags" ON memory_tags
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own tags" ON memory_tags;
CREATE POLICY "Users can manage own tags" ON memory_tags
  FOR ALL USING (auth.uid() = user_id);

-- Memory-tag junction policies (inherit from parent tables)
DROP POLICY IF EXISTS "Users can view own memory tags" ON memory_entry_tags;
CREATE POLICY "Users can view own memory tags" ON memory_entry_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memory_entries 
      WHERE id = memory_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage own memory tags" ON memory_entry_tags;
CREATE POLICY "Users can manage own memory tags" ON memory_entry_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memory_entries 
      WHERE id = memory_id AND user_id = auth.uid()
    )
  );

-- Connections policies
DROP POLICY IF EXISTS "Users can view own connections" ON memory_connections;
CREATE POLICY "Users can view own connections" ON memory_connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memory_entries 
      WHERE id = from_memory_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage own connections" ON memory_connections;
CREATE POLICY "Users can manage own connections" ON memory_connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memory_entries 
      WHERE id = from_memory_id AND user_id = auth.uid()
    )
  );

-- ========================================
-- 9. HELPER FUNCTIONS
-- ========================================

-- Function to search memories with hybrid vector + text search
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding vector(1536),
  query_text text,
  user_uuid uuid,
  similarity_threshold float DEFAULT 0.7,
  result_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  content_type text,
  metadata jsonb,
  source_url text,
  created_at timestamptz,
  similarity_score float,
  text_score float,
  combined_score float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.content,
    m.content_type,
    m.metadata,
    m.source_url,
    m.created_at,
    (1 - (m.embedding <=> query_embedding)) as similarity_score,
    ts_rank(m.search_vector, plainto_tsquery('english', query_text)) as text_score,
    -- Weighted average: 70% vector, 30% text
    ((1 - (m.embedding <=> query_embedding)) * 0.7 + 
     ts_rank(m.search_vector, plainto_tsquery('english', query_text)) * 0.3) as combined_score
  FROM memory_entries m
  WHERE m.user_id = user_uuid
    AND (
      (1 - (m.embedding <=> query_embedding)) > similarity_threshold
      OR m.search_vector @@ plainto_tsquery('english', query_text)
    )
  ORDER BY combined_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get connected memories (knowledge graph neighbors)
CREATE OR REPLACE FUNCTION get_connected_memories(
  memory_uuid uuid,
  user_uuid uuid,
  connection_strength_min float DEFAULT 0.5
)
RETURNS TABLE (
  id uuid,
  title text,
  content_type text,
  connection_type text,
  strength decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.content_type,
    c.connection_type,
    c.strength
  FROM memory_connections c
  JOIN memory_entries m ON (
    (c.from_memory_id = memory_uuid AND m.id = c.to_memory_id) OR
    (c.to_memory_id = memory_uuid AND m.id = c.from_memory_id)
  )
  WHERE m.user_id = user_uuid
    AND c.strength >= connection_strength_min
  ORDER BY c.strength DESC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 10. VERIFICATION QUERIES
-- ========================================

-- Check if pgvector is enabled
-- SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check table structure
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'memory%';

-- Check indexes
-- SELECT tablename, indexname FROM pg_indexes WHERE tablename LIKE 'memory%';

-- ========================================
-- SETUP COMPLETE!
-- ========================================

-- Next steps:
-- 1. Verify pgvector extension: SELECT * FROM pg_extension WHERE extname = 'vector';
-- 2. Verify tables: SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'memory%';
-- 3. Check policies: SELECT * FROM pg_policies WHERE tablename LIKE 'memory%';
