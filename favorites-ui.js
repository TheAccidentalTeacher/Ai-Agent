/**
 * ============================================================================
 * FAVORITES UI - Phase 1 Week 1
 * Display starred/pinned memories in sidebar and manage favorites view
 * ============================================================================
 */

import { getFavoritesManager } from './favorites-manager.js';
import { chatHistory } from './chat-history-manager.js';

/**
 * Favorites UI Manager
 * Handles all UI interactions for favorites system
 */
export class FavoritesUI {
    constructor() {
        this.favManager = getFavoritesManager();
        this.sidebarWidget = null;
        this.initialized = false;
    }

    /**
     * Initialize UI (call after DOM ready and auth)
     */
    async initialize() {
        if (this.initialized) return;

        try {
            await this.favManager.initialize();
            
            // Initialize chat history with better error handling
            if (chatHistory && chatHistory.initialize) {
                const initialized = await chatHistory.initialize();
                if (initialized) {
                    console.log('[Favorites UI] ✓ Chat history manager initialized');
                } else {
                    console.warn('[Favorites UI] Chat history not available (user not authenticated)');
                }
            } else {
                console.warn('[Favorites UI] Chat history manager not found');
            }
            
            this.attachEventListeners();
            this.initialized = true;

            console.log('[Favorites UI] ✓ Initialized');
        } catch (error) {
            console.error('[Favorites UI] Initialization error:', error);
            this.initialized = true; // Mark as initialized anyway to prevent retries
        }
        
        // Refresh favorites when panel is opened
        this.refreshFavorites();
    }

    /**
     * Load recent conversations from database
     */
    async getRecentConversations(limit = 20) {
        try {
            // Check if chatHistory is available
            if (!chatHistory || !chatHistory.listConversations) {
                console.warn('[Favorites UI] Chat history manager not available');
                return [];
            }
            const conversations = await chatHistory.listConversations(limit);
            console.log('[Favorites UI] ✓ Loaded conversations:', conversations);
            return conversations || [];
        } catch (error) {
            console.error('[Favorites UI] Failed to load conversations:', error);
            return [];
        }
    }

    /**
     * Create HTML for conversation card
     */
    createConversationCard(conversation) {
        const relativeTime = chatHistory.formatRelativeTime(conversation.last_message_at || conversation.created_at);
        const messageCount = conversation.message_count || 0;
        
        return `
            <div class="conversation-card" data-conversation-id="${conversation.id}">
                <div class="conversation-card-icon">💬</div>
                <div class="conversation-card-content">
                    <div class="conversation-card-title">${this.escapeHtml(conversation.title)}</div>
                    <div class="conversation-card-meta">
                        ${messageCount} message${messageCount !== 1 ? 's' : ''} · ${relativeTime}
                    </div>
                </div>
                <button class="conversation-delete-btn" data-conversation-id="${conversation.id}" title="Delete conversation">
                    ×
                </button>
            </div>
        `;
    }

    /**
     * Create HTML for conversation turn (legacy - for backward compatibility)
     */
    createConversationItem(turn, index) {
        const icon = turn.role === 'user' ? '👤' : '🤖';
        const roleClass = turn.role === 'user' ? 'user-turn' : 'assistant-turn';
        const roleName = turn.role === 'user' ? 'You' : 'AI';
        
        let preview = turn.content || '';
        if (preview.length > 150) {
            preview = preview.substring(0, 150) + '...';
        }
        
        const escaped = preview.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        return `
            <div class="conversation-item ${roleClass}" data-turn="${index}">
                <div class="conversation-icon">${icon}</div>
                <div class="conversation-content">
                    <div class="conversation-header">
                        <span class="conversation-role">${roleName}</span>
                    </div>
                    <div class="conversation-preview">${escaped}</div>
                </div>
            </div>
        `;
    }

    /**
     * Refresh favorites list in context panel
     */
    async refreshFavorites() {
        const favoritesList = document.getElementById('favorites-list');
        if (!favoritesList) return;

        try {
            // Get recent conversations from database
            const conversations = await this.getRecentConversations(20);
            
            // Get pinned and starred items
            const pinned = await this.favManager.getPinned(10);
            const starred = await this.favManager.getStarred(20);

            if (conversations.length === 0 && pinned.length === 0 && starred.length === 0) {
                favoritesList.innerHTML = `
                    <div class="panel-empty-state">
                        <div class="empty-icon">⭐</div>
                        <p>No activity yet</p>
                        <p class="hint">Start a conversation or star memories</p>
                    </div>
                `;
                return;
            }

            let html = '';

            // Show conversation history
            if (conversations.length > 0) {
                html += `
                    <div class="conversation-history-section">
                        <div class="conversation-history-header">
                            <h5>💬 Chat History</h5>
                            <button class="new-conversation-btn" title="Start new conversation">
                                + New Chat
                            </button>
                        </div>
                        <div class="conversation-list">
                `;
                conversations.forEach(conv => {
                    html += this.createConversationCard(conv);
                });
                html += `
                        </div>
                    </div>
                `;
                
                // Add delimiter if there are also favorites
                if (pinned.length > 0 || starred.length > 0) {
                    html += '<hr class="favorites-delimiter">';
                    html += '<h5>⭐ Your Favorites</h5>';
                }
            }

            // Show pinned section if any
            if (pinned.length > 0) {
                html += `
                    <div class="favorites-section">
                        <h5>📌 Pinned</h5>
                        <div class="favorites-items">
                `;
                pinned.forEach(mem => {
                    html += this.createFavoriteItem(mem, true);
                });
                html += `
                        </div>
                    </div>
                `;
            }

            // Show starred section
            if (starred.length > 0) {
                html += `
                    <div class="favorites-section">
                        <h5>⭐ Starred</h5>
                        <div class="favorites-items">
                `;
                starred.forEach(mem => {
                    html += this.createFavoriteItem(mem, false);
                });
                html += `
                        </div>
                    </div>
                `;
            }

            favoritesList.innerHTML = html;

        } catch (error) {
            console.error('[Favorites UI] Refresh error:', error);
            favoritesList.innerHTML = `
                <div class="panel-empty-state">
                    <div class="empty-icon">⚠️</div>
                    <p>Error loading favorites</p>
                    <p class="hint">${error.message}</p>
                </div>
            `;
        }
    }

    /**
     * Create HTML for single favorite item
     * @param {Object} memory - Memory object
     * @param {boolean} isPinned - Show as pinned (vs starred)
     * @returns {string} HTML string
     */
    createFavoriteItem(memory, isPinned) {
        const icon = this.getMemoryIcon(memory.content_type);
        const title = this.getMemoryTitle(memory);
        const date = new Date(memory.created_at).toLocaleDateString();
        const actionBtn = isPinned ? 
            '<button class="unpin-btn" title="Unpin">📍</button>' :
            '<button class="unstar-btn" title="Unstar">☆</button>';

        return `
            <div class="favorite-item" data-memory-id="${memory.id}">
                <div class="favorite-icon">${icon}</div>
                <div class="favorite-info">
                    <div class="favorite-title">${title}</div>
                    <div class="favorite-meta">${date}</div>
                </div>
                ${actionBtn}
            </div>
        `;
    }

    /**
     * Get icon for memory type
     * @param {string} contentType - Memory content type
     * @returns {string} Emoji icon
     */
    getMemoryIcon(contentType) {
        const icons = {
            'chat': '💬',
            'video': '🎥',
            'research': '🔍',
            'creative': '🎨',
            'project': '🎮',
            'manual': '📝'
        };
        return icons[contentType] || '📄';
    }

    /**
     * Get display title for memory
     * @param {Object} memory - Memory object
     * @returns {string} Display title
     */
    getMemoryTitle(memory) {
        if (memory.title) return memory.title;
        
        // Extract title from content (first 50 chars)
        const content = memory.content || memory.text_content || '';
        return content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }

    /**
     * Load memory into main view
     * @param {string} memoryId - Memory UUID
     */
    async loadMemory(memoryId) {
        console.log('[Favorites UI] Loading memory:', memoryId);
        
        // Dispatch custom event for main app to handle
        window.dispatchEvent(new CustomEvent('load-memory', {
            detail: { memoryId }
        }));

        // Alternative: Direct integration with memory-ui.js
        if (window.showMemoryDetails) {
            // Fetch full memory data
            const memory = await this.fetchMemory(memoryId);
            if (memory) {
                window.showMemoryDetails(memory);
            }
        }
    }

    /**
     * Fetch memory by ID
     * @param {string} memoryId - Memory UUID
     * @returns {Promise<Object>} Memory object
     */
    async fetchMemory(memoryId) {
        try {
            const memories = await this.favManager.supabase
                .from('memories')
                .select('*')
                .eq('id', memoryId)
                .single();

            return memories.data;
        } catch (error) {
            console.error('[Favorites UI] Fetch memory error:', error);
            return null;
        }
    }

    /**
     * Add star button to memory card
     * @param {HTMLElement} card - Memory card element
     * @param {string} memoryId - Memory UUID
     */
    addStarButton(card, memoryId) {
        // Check if button already exists
        if (card.querySelector('.star-btn')) return;

        const isStarred = this.favManager.isStarred(memoryId);
        const isPinned = this.favManager.isPinned(memoryId);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'memory-actions';
        buttonContainer.innerHTML = `
            <button class="icon-btn star-btn ${isStarred ? 'active' : ''}" 
                    data-memory-id="${memoryId}" 
                    title="${isStarred ? 'Unstar' : 'Star'}">
                ${isStarred ? '⭐' : '☆'}
            </button>
            <button class="icon-btn pin-btn ${isPinned ? 'active' : ''}" 
                    data-memory-id="${memoryId}" 
                    title="${isPinned ? 'Unpin' : 'Pin'}">
                ${isPinned ? '📌' : '📍'}
            </button>
        `;

        // Insert buttons (adjust based on card structure)
        const cardHeader = card.querySelector('.memory-card-header') || card;
        cardHeader.appendChild(buttonContainer);

        // Attach handlers
        const starBtn = buttonContainer.querySelector('.star-btn');
        const pinBtn = buttonContainer.querySelector('.pin-btn');

        starBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const newState = await this.favManager.toggleStar(memoryId);
            starBtn.textContent = newState ? '⭐' : '☆';
            starBtn.classList.toggle('active', newState);
            starBtn.title = newState ? 'Unstar' : 'Star';
            this.refreshSidebar();
        });

        pinBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const newState = await this.favManager.togglePin(memoryId);
            pinBtn.textContent = newState ? '📌' : '📍';
            pinBtn.classList.toggle('active', newState);
            pinBtn.title = newState ? 'Unpin' : 'Pin';
            this.refreshSidebar();
        });
    }

    /**
     * Add star button to chat message
     * @param {HTMLElement} message - Chat message element
     * @param {string} messageId - Message ID (will save to memory)
     */
    addChatStarButton(message, messageId) {
        // Check if button already exists
        if (message.querySelector('.star-btn')) return;

        const button = document.createElement('button');
        button.className = 'icon-btn star-btn-small';
        button.innerHTML = '☆';
        button.title = 'Star this message';
        button.dataset.messageId = messageId;

        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            // Save message to memory as starred
            const messageContent = message.querySelector('.message-content')?.textContent || '';
            const memoryId = await this.saveMessageAsMemory(messageContent);
            
            if (memoryId) {
                await this.favManager.star(memoryId);
                button.innerHTML = '⭐';
                button.classList.add('active');
                this.refreshSidebar();
            }
        });

        // Insert button
        const messageHeader = message.querySelector('.message-header') || message;
        messageHeader.appendChild(button);
    }

    /**
     * Save chat message as memory
     * @param {string} content - Message content
     * @returns {Promise<string>} Memory ID
     */
    async saveMessageAsMemory(content) {
        // This would integrate with your existing memory save system
        // Placeholder implementation
        console.log('[Favorites UI] Saving message to memory:', content.substring(0, 50));
        
        // Call existing saveToMemory function if available
        if (window.saveToMemory) {
            return await window.saveToMemory(
                'Starred Message',
                content,
                'chat',
                { starred: true }
            );
        }
        
        return null;
    }

    /**
     * Show all favorites in main view
     */
    async showAllFavorites() {
        console.log('[Favorites UI] Showing all favorites');
        
        // Switch to Memory tab
        const memoryTab = document.querySelector('[data-tab="memory"]');
        if (memoryTab) {
            memoryTab.click();
        }

        // Apply favorites filter
        if (window.applyMemoryFilter) {
            window.applyMemoryFilter('favorites');
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-favorites');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshFavorites());
        }

        // View all link
        const viewAllLink = document.getElementById('view-all-favorites');
        if (viewAllLink) {
            viewAllLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAllFavorites();
            });
        }

        // Listen for memory updates to refresh sidebar
        window.addEventListener('memory-saved', () => this.refreshFavorites());
        window.addEventListener('memory-deleted', () => this.refreshFavorites());
        
        // Delegate conversation card clicks
        document.addEventListener('click', async (e) => {
            // Load conversation
            const conversationCard = e.target.closest('.conversation-card');
            if (conversationCard && !e.target.closest('.conversation-delete-btn')) {
                const conversationId = conversationCard.dataset.conversationId;
                await this.loadConversation(conversationId);
                return;
            }
            
            // Delete conversation
            const deleteBtn = e.target.closest('.conversation-delete-btn');
            if (deleteBtn) {
                e.stopPropagation();
                const conversationId = deleteBtn.dataset.conversationId;
                await this.deleteConversation(conversationId);
                return;
            }
            
            // New conversation
            const newConvBtn = e.target.closest('.new-conversation-btn');
            if (newConvBtn) {
                this.startNewConversation();
                return;
            }
        });
    }

    /**
     * Load a conversation into the chat
     * @param {string} conversationId - UUID of conversation to load
     */
    async loadConversation(conversationId) {
        try {
            console.log('[Favorites UI] Loading conversation:', conversationId);
            console.log('[Favorites UI] window.editor available:', !!window.editor);
            console.log('[Favorites UI] window.editor.addMessage available:', !!(window.editor && window.editor.addMessage));
            
            // Load messages from database
            const messages = await chatHistory.loadConversation(conversationId);
            
            // Clear current chat
            const messagesContainer = document.getElementById('ai-messages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
                console.log('[Favorites UI] Cleared messages container');
            }
            
            // Clear in-memory conversation history
            if (window.editor && window.editor.conversationHistory) {
                window.editor.conversationHistory = [];
            }
            if (window.conversationHistory) {
                window.conversationHistory = [];
            }
            
            // Render messages using the editor's addMessage method
            messages.forEach(msg => {
                // Try multiple ways to add messages
                if (window.editor && typeof window.editor.addMessage === 'function') {
                    window.editor.addMessage(msg.role, msg.content, false); // false = not editable for restored messages
                } else if (window.addMessage) {
                    window.addMessage(msg.role, msg.content);
                } else {
                    // Fallback: manually add to DOM
                    const messagesContainer = document.getElementById('ai-messages');
                    if (messagesContainer) {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = `ai-message ${msg.role}`;
                        messageDiv.innerHTML = msg.role === 'user' 
                            ? `<p><strong>You:</strong> ${msg.content}</p>`
                            : `<div>${msg.content}</div>`;
                        messagesContainer.appendChild(messageDiv);
                    }
                }
                
                // Add to in-memory history (editor stores its own)
                if (window.editor && window.editor.conversationHistory) {
                    window.editor.conversationHistory.push({ role: msg.role, content: msg.content });
                } else if (window.conversationHistory) {
                    window.conversationHistory.push({ role: msg.role, content: msg.content });
                }
            });
            
            // Also update the chatHistory manager's current conversation
            if (chatHistory) {
                chatHistory.currentConversationId = conversationId;
            }
            
            console.log('[Favorites UI] ✓ Loaded', messages.length, 'messages to chat UI');
            
        } catch (error) {
            console.error('[Favorites UI] Failed to load conversation:', error);
            alert('Failed to load conversation. Please try again.');
        }
    }

    /**
     * Delete a conversation
     * @param {string} conversationId - UUID of conversation to delete
     */
    async deleteConversation(conversationId) {
        if (!confirm('Delete this conversation? This cannot be undone.')) {
            return;
        }
        
        try {
            await chatHistory.deleteConversation(conversationId);
            await this.refreshFavorites();
            console.log('[Favorites UI] ✓ Deleted conversation');
        } catch (error) {
            console.error('[Favorites UI] Failed to delete conversation:', error);
            alert('Failed to delete conversation. Please try again.');
        }
    }

    /**
     * Start a new conversation
     */
    startNewConversation() {
        console.log('[Favorites UI] Starting new conversation');
        
        // Clear current conversation
        chatHistory.startNewConversation();
        
        // Clear in-memory history
        if (window.conversationHistory) {
            window.conversationHistory = [];
        }
        
        // Clear chat UI
        const messagesContainer = document.getElementById('ai-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        // Focus on input
        const chatInput = document.getElementById('ai-input');
        if (chatInput) {
            chatInput.focus();
        }
        
        console.log('[Favorites UI] ✓ New conversation started');
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Singleton instance
let favoritesUI = null;

/**
 * Get or create favorites UI instance
 * @returns {FavoritesUI} Singleton instance
 */
export function getFavoritesUI() {
    if (!favoritesUI) {
        favoritesUI = new FavoritesUI();
    }
    return favoritesUI;
}

/**
 * Initialize favorites UI (call after auth)
 * @returns {Promise<void>}
 */
export async function initFavoritesUI() {
    const ui = getFavoritesUI();
    await ui.initialize();
}

// Export for global access
if (typeof window !== 'undefined') {
    window.getFavoritesUI = getFavoritesUI;
}
