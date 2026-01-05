-- ============================================================================
-- CHAT HISTORY PERSISTENCE
-- Tables for storing persistent chat conversation history
-- Created: January 3, 2026
-- ============================================================================

-- Chat Conversations Table
-- Stores metadata about each conversation
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    message_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Chat Messages Table
-- Stores individual messages within conversations
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_conv_user_id 
    ON chat_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_conv_last_message 
    ON chat_conversations(user_id, last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_chat_msg_conversation 
    ON chat_messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_msg_role 
    ON chat_messages(conversation_id, role) 
    WHERE role = 'user';

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only see their own conversations
CREATE POLICY "Users can view their own conversations"
    ON chat_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
    ON chat_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON chat_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
    ON chat_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Messages: Users can access messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE chat_conversations.id = chat_messages.conversation_id 
            AND chat_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their conversations"
    ON chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE chat_conversations.id = chat_messages.conversation_id 
            AND chat_conversations.user_id = auth.uid()
        )
    );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on conversation updates
CREATE TRIGGER update_chat_conversation_timestamp
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_conversation_timestamp();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages TO authenticated;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✓ Chat history tables created successfully';
  RAISE NOTICE '  - chat_conversations: % rows', (SELECT COUNT(*) FROM chat_conversations);
  RAISE NOTICE '  - chat_messages: % rows', (SELECT COUNT(*) FROM chat_messages);
  RAISE NOTICE '✓ RLS policies enabled';
  RAISE NOTICE '✓ Indexes created for performance';
END $$;
