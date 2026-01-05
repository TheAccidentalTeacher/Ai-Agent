-- ============================================================================
-- FAVORITES SYSTEM - Phase 1 Week 1
-- Add starring/pinning capability to memories table
-- ============================================================================

-- Add starred and pinned columns to memories table
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS starred_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;

-- Create index for fast starred queries (WHERE starred = true)
CREATE INDEX IF NOT EXISTS idx_memories_starred 
ON memories(user_id, starred, starred_at DESC) 
WHERE starred = true;

-- Create index for fast pinned queries (WHERE pinned = true)
CREATE INDEX IF NOT EXISTS idx_memories_pinned 
ON memories(user_id, pinned, pinned_at DESC) 
WHERE pinned = true;

-- Create composite index for favorites view (starred OR pinned)
CREATE INDEX IF NOT EXISTS idx_memories_favorites 
ON memories(user_id, created_at DESC) 
WHERE starred = true OR pinned = true;

-- Add comment for documentation
COMMENT ON COLUMN memories.starred IS 'User has starred this memory (favorite)';
COMMENT ON COLUMN memories.pinned IS 'User has pinned this memory (quick access)';
COMMENT ON COLUMN memories.starred_at IS 'Timestamp when memory was starred';
COMMENT ON COLUMN memories.pinned_at IS 'Timestamp when memory was pinned';

-- Grant necessary permissions
GRANT SELECT, UPDATE ON memories TO authenticated;
