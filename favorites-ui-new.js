/**
 * ============================================================================
 * FAVORITES UI - Phase 1 Week 1 (REVISED)
 * Display starred/pinned memories in Context Panel
 * ============================================================================
 */

import { getFavoritesManager } from './favorites-manager.js';

/**
 * Favorites UI Manager - Integrates with Context Panel
 */
export class FavoritesUI {
    constructor() {
        this.favManager = getFavoritesManager();
        this.initialized = false;
    }

    /**
     * Initialize UI (call after DOM ready and auth)
     */
    async initialize() {
        if (this.initialized) return;

        await this.favManager.initialize();
        this.attachContextPanelListener();
        this.initialized = true;

        console.log('[Favorites UI] ✓ Initialized - integrated with Context Panel');
    }

    /**
     * Listen for context panel tab switches
     */
    attachContextPanelListener() {
        // Listen for favorites tab being clicked
        const favoritesTab = document.querySelector('[data-panel="favorites"]');
        if (favoritesTab) {
            favoritesTab.addEventListener('click', () => {
                this.refreshFavorites();
            });
        }
    }

    /**
     * Refresh favorites list in context panel
     */
    async refreshFavorites() {
        const favoritesList = document.getElementById('favorites-list');
        if (!favoritesList) return;

        favoritesList.innerHTML = '<div class="favorites-loading">Loading...</div>';

        try {
            // Get pinned and starred items
            const pinned = await this.favManager.getPinned(10);
            const starred = await this.favManager.getStarred(20);

            if (pinned.length === 0 && starred.length === 0) {
                favoritesList.innerHTML = `
                    <div class="panel-empty-state">
                        <div class="empty-icon">⭐</div>
                        <p>No favorites yet</p>
                        <p class="hint">Star memories in the Memory tab for quick access</p>
                    </div>
                `;
                return;
            }

            let html = '';

            // Show pinned section if any
            if (pinned.length > 0) {
                html += `
                    <div class="favorites-section">
                        <h5 style="font-size: 12px; color: #888; margin: 12px 0 8px;">📌 PINNED</h5>
                `;
                pinned.forEach(mem => {
                    html += this.createFavoriteItem(mem, true);
                });
                html += `</div>`;
            }

            // Show starred section
            if (starred.length > 0) {
                html += `
                    <div class="favorites-section">
                        <h5 style="font-size: 12px; color: #888; margin: 12px 0 8px;">⭐ STARRED</h5>
                `;
                starred.forEach(mem => {
                    if (!mem.pinned) { // Don't duplicate pinned items
                        html += this.createFavoriteItem(mem, false);
                    }
                });
                html += `</div>`;
            }

            favoritesList.innerHTML = html;
            this.attachFavoriteItemListeners();

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
     */
    createFavoriteItem(memory, isPinned) {
        const icon = this.getMemoryIcon(memory.content_type);
        const title = this.getMemoryTitle(memory);
        const excerpt = (memory.summary || memory.content || '').substring(0, 60);
        const date = new Date(memory.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
            <div class="favorite-item" data-memory-id="${memory.id}" style="
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 10px;
                background: #2a2a2a;
                border: 1px solid #3c3c3c;
                border-radius: 6px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseover="this.style.background='#333'; this.style.borderColor='#555'" 
               onmouseout="this.style.background='#2a2a2a'; this.style.borderColor='#3c3c3c'">
                <div class="favorite-icon" style="font-size: 24px; flex-shrink: 0;">${icon}</div>
                <div class="favorite-info" style="flex: 1; min-width: 0;">
                    <div class="favorite-title" style="
                        font-size: 13px;
                        font-weight: 500;
                        color: #e0e0e0;
                        margin-bottom: 4px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    ">${title}</div>
                    <div class="favorite-excerpt" style="
                        font-size: 11px;
                        color: #999;
                        margin-bottom: 4px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    ">${excerpt}</div>
                    <div class="favorite-meta" style="font-size: 10px; color: #666;">${date}</div>
                </div>
                <button class="${isPinned ? 'unpin-btn' : 'unstar-btn'}" 
                        data-memory-id="${memory.id}" 
                        title="${isPinned ? 'Unpin' : 'Unstar'}"
                        style="
                            background: transparent;
                            border: none;
                            color: ${isPinned ? '#2196F3' : '#ffc107'};
                            cursor: pointer;
                            font-size: 16px;
                            padding: 4px;
                            border-radius: 4px;
                            flex-shrink: 0;
                        ">${isPinned ? '📌' : '⭐'}</button>
            </div>
        `;
    }

    /**
     * Attach listeners to favorite items
     */
    attachFavoriteItemListeners() {
        // Unstar buttons
        document.querySelectorAll('.unstar-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const memoryId = btn.dataset.memoryId;
                await this.favManager.unstar(memoryId);
                this.refreshFavorites();
            });
        });

        // Unpin buttons
        document.querySelectorAll('.unpin-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const memoryId = btn.dataset.memoryId;
                await this.favManager.unpin(memoryId);
                this.refreshFavorites();
            });
        });

        // Click on item to view
        document.querySelectorAll('.favorite-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') return;
                const memoryId = item.dataset.memoryId;
                this.viewMemory(memoryId);
            });
        });
    }

    /**
     * View memory details
     */
    async viewMemory(memoryId) {
        try {
            const { data: memory } = await this.favManager.supabase
                .from('memory_entries')
                .select('*')
                .eq('id', memoryId)
                .single();
            
            if (memory && window.memoryDetailsModal) {
                window.memoryDetailsModal.show(memory);
            }
        } catch (error) {
            console.error('[Favorites] View memory error:', error);
        }
    }

    /**
     * Get icon for memory type
     */
    getMemoryIcon(contentType) {
        const icons = {
            conversation: '💬',
            research: '🔍',
            video: '🎬',
            document: '📄',
            note: '📝',
            default: '💭'
        };
        return icons[contentType] || icons.default;
    }

    /**
     * Get display title for memory
     */
    getMemoryTitle(memory) {
        if (memory.title) return memory.title;
        const content = memory.content || memory.text_content || 'Untitled';
        return content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }

    /**
     * Add star button to memory card (for Memory tab integration)
     */
    addStarButton(card, memoryId) {
        const isStarred = this.favManager.isStarred(memoryId);
        const isPinned = this.favManager.isPinned(memoryId);

        const actionsDiv = card.querySelector('.memory-actions') || document.createElement('div');
        actionsDiv.className = 'memory-actions';

        actionsDiv.innerHTML = `
            <button class="pin-btn ${isPinned ? 'active' : ''}" data-memory-id="${memoryId}" title="Pin">📌</button>
            <button class="star-btn ${isStarred ? 'active' : ''}" data-memory-id="${memoryId}" title="Star">⭐</button>
        `;

        if (!card.querySelector('.memory-actions')) {
            card.appendChild(actionsDiv);
        }

        // Attach listeners
        actionsDiv.querySelector('.star-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.favManager.toggleStar(memoryId);
            const btn = e.target;
            btn.classList.toggle('active');
            this.refreshFavorites();
        });

        actionsDiv.querySelector('.pin-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.favManager.togglePin(memoryId);
            const btn = e.target;
            btn.classList.toggle('active');
            this.refreshFavorites();
        });
    }
}

// Singleton instance
let favoritesUI = null;

/**
 * Get or create favorites UI instance
 */
export function getFavoritesUI() {
    if (!favoritesUI) {
        favoritesUI = new FavoritesUI();
    }
    return favoritesUI;
}

/**
 * Initialize favorites UI (call after auth)
 */
export async function initFavoritesUI() {
    const ui = getFavoritesUI();
    await ui.initialize();
}

// Export for global access
if (typeof window !== 'undefined') {
    window.getFavoritesUI = getFavoritesUI;
}
