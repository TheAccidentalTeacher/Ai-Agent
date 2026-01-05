/**
 * Chat History Manager
 * Manages persistent chat conversation storage in Supabase
 * Auto-saves messages, loads conversations, and provides elegant history management
 */

import { supabase, getCurrentUser } from './supabase-client.js';

class ChatHistoryManager {
    constructor() {
        this.currentConversationId = null;
        this.currentUser = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the manager with current user
     */
    async initialize() {
        try {
            this.currentUser = getCurrentUser();
            if (!this.currentUser) {
                console.warn('[Chat History] No authenticated user');
                return false;
            }
            this.isInitialized = true;
            console.log('[Chat History] ✓ Initialized for user:', this.currentUser.email);
            return true;
        } catch (error) {
            console.error('[Chat History] Initialization error:', error);
            return false;
        }
    }

    /**
     * Create a new conversation
     * @param {string} firstMessage - First user message to generate title
     * @returns {Object} Created conversation
     */
    async createConversation(firstMessage) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (!this.currentUser) {
            throw new Error('User not authenticated');
        }

        try {
            // Generate title from first message (max 60 chars)
            const title = firstMessage.length > 60 
                ? firstMessage.substring(0, 60) + '...' 
                : firstMessage;

            const { data, error } = await supabase
                .from('chat_conversations')
                .insert({
                    user_id: this.currentUser.id,
                    title: title,
                    last_message_at: new Date().toISOString(),
                    message_count: 0
                })
                .select()
                .single();

            if (error) throw error;

            this.currentConversationId = data.id;
            console.log('[Chat History] ✓ Created conversation:', data.id);
            return data;
        } catch (error) {
            console.error('[Chat History] Create conversation error:', error);
            throw error;
        }
    }

    /**
     * Save a message to the current conversation
     * @param {string} role - 'user' or 'assistant'
     * @param {string} content - Message content
     * @param {Object} metadata - Optional metadata
     * @returns {Object} Saved message
     */
    async saveMessage(role, content, metadata = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (!this.currentUser) {
            console.warn('[Chat History] Cannot save message - not authenticated');
            return null;
        }

        try {
            // If no current conversation, create one (first message)
            if (!this.currentConversationId && role === 'user') {
                await this.createConversation(content);
            }

            if (!this.currentConversationId) {
                throw new Error('No active conversation');
            }

            // Insert message
            const { data: messageData, error: messageError } = await supabase
                .from('chat_messages')
                .insert({
                    conversation_id: this.currentConversationId,
                    role,
                    content,
                    metadata
                })
                .select()
                .single();

            if (messageError) throw messageError;

            // Update conversation metadata (increment message count)
            const { data: convData } = await supabase
                .from('chat_conversations')
                .select('message_count')
                .eq('id', this.currentConversationId)
                .single();
            
            const newCount = (convData?.message_count || 0) + 1;
            
            const { error: updateError } = await supabase
                .from('chat_conversations')
                .update({
                    last_message_at: new Date().toISOString(),
                    message_count: newCount
                })
                .eq('id', this.currentConversationId);

            if (updateError) {
                console.warn('[Chat History] Failed to update conversation metadata:', updateError);
            }

            console.log('[Chat History] ✓ Saved message:', messageData.id);
            return messageData;
        } catch (error) {
            console.error('[Chat History] Save message error:', error);
            // Don't throw - allow app to continue even if save fails
            return null;
        }
    }

    /**
     * Load all messages from a conversation
     * @param {string} conversationId - UUID of conversation
     * @returns {Array} Array of message objects
     */
    async loadConversation(conversationId) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            this.currentConversationId = conversationId;
            console.log('[Chat History] ✓ Loaded conversation:', conversationId, `(${data.length} messages)`);
            
            return data.map(msg => ({
                role: msg.role,
                content: msg.content,
                metadata: msg.metadata,
                createdAt: msg.created_at
            }));
        } catch (error) {
            console.error('[Chat History] Load conversation error:', error);
            throw error;
        }
    }

    /**
     * List all conversations for current user
     * @param {number} limit - Maximum number of conversations to return
     * @returns {Array} Array of conversation objects
     */
    async listConversations(limit = 50) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (!this.currentUser) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('chat_conversations')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('last_message_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            console.log('[Chat History] ✓ Listed conversations:', data.length);
            return data;
        } catch (error) {
            console.error('[Chat History] List conversations error:', error);
            return [];
        }
    }

    /**
     * Delete a conversation and all its messages
     * @param {string} conversationId - UUID of conversation to delete
     */
    async deleteConversation(conversationId) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const { error } = await supabase
                .from('chat_conversations')
                .delete()
                .eq('id', conversationId);

            if (error) throw error;

            if (this.currentConversationId === conversationId) {
                this.currentConversationId = null;
            }

            console.log('[Chat History] ✓ Deleted conversation:', conversationId);
        } catch (error) {
            console.error('[Chat History] Delete conversation error:', error);
            throw error;
        }
    }

    /**
     * Start a new conversation (resets current conversation ID)
     */
    startNewConversation() {
        this.currentConversationId = null;
        console.log('[Chat History] ✓ Started new conversation');
    }

    /**
     * Get current conversation ID
     * @returns {string|null} Current conversation ID
     */
    getCurrentConversationId() {
        return this.currentConversationId;
    }

    /**
     * Set current conversation ID (for loading existing conversations)
     * @param {string} conversationId - UUID of conversation
     */
    setCurrentConversationId(conversationId) {
        this.currentConversationId = conversationId;
        console.log('[Chat History] ✓ Set current conversation:', conversationId);
    }

    /**
     * Format relative time (e.g., "2 hours ago")
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Formatted relative time
     */
    formatRelativeTime(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return then.toLocaleDateString();
    }
}

// Export singleton instance
export const chatHistory = new ChatHistoryManager();
