-- Phase 9: Creative Generations Table
-- Stores history of all AI-generated content (images, audio, music, video)

CREATE TABLE IF NOT EXISTS creative_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'audio', 'music', 'video')),
    prompt TEXT NOT NULL,
    model TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    result_url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_creative_user_id ON creative_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_creative_type ON creative_generations(type);
CREATE INDEX IF NOT EXISTS idx_creative_user_type ON creative_generations(user_id, type);
CREATE INDEX IF NOT EXISTS idx_creative_created ON creative_generations(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE creative_generations ENABLE ROW LEVEL SECURITY;

-- Users can view their own generations
CREATE POLICY "Users can view own generations"
    ON creative_generations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own generations
CREATE POLICY "Users can create own generations"
    ON creative_generations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own generations
CREATE POLICY "Users can update own generations"
    ON creative_generations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own generations
CREATE POLICY "Users can delete own generations"
    ON creative_generations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_creative_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER creative_generations_updated_at
    BEFORE UPDATE ON creative_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_creative_generations_updated_at();

-- Comments for documentation
COMMENT ON TABLE creative_generations IS 'Stores all AI-generated creative content with full history';
COMMENT ON COLUMN creative_generations.type IS 'Type of generation: image, audio, music, or video';
COMMENT ON COLUMN creative_generations.settings IS 'JSON object with generation parameters (dimensions, style, voice, etc.)';
COMMENT ON COLUMN creative_generations.metadata IS 'JSON object with additional info (model version, cost, duration, etc.)';
