/**
 * ============================================================================
 * FAVORITES MANAGER - Phase 1 Week 1
 * Handle starring and pinning of memories (conversations, research, videos)
 * ============================================================================
 */

import { supabase, getCurrentUser } from './supabase-client.js';

/**
 * Favorites Manager Class
 * Handles all starring/pinning operations with Supabase sync
 */
export class FavoritesManager {
    constructor() {
        this.supabase = null;
        this.userId = null;
        this.cache = new Map(); // Cache starred/pinned status for quick lookups
    }

    /**
     * Initialize manager (call after auth)
     */
    async initialize() {
        try {
            this.supabase = supabase;
            if (!this.supabase) {
                console.warn('[Favorites] Supabase not initialized');
                return false;
            }

            const user = getCurrentUser();
            if (user) {
                this.userId = user.id;
                await this.loadCache();
                console.log('[Favorites] ✓ Initialized for user:', user.email);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[Favorites] Initialize error:', error);
            return false;
        }
    }

    /**
     * Load all starred/pinned items into cache
     */
    async loadCache() {
        if (!this.supabase || !this.userId) return;

        try {
            const { data, error } = await this.supabase
                .from('memory_entries')
                .select('id, starred, pinned')
                .eq('user_id', this.userId)
                .or('starred.eq.true,pinned.eq.true');

            if (error) throw error;

            this.cache.clear();
            data.forEach(item => {
                this.cache.set(item.id, {
                    starred: item.starred,
                    pinned: item.pinned
                });
            });

            console.log(`[Favorites] Loaded ${data.length} favorites into cache`);
        } catch (error) {
            console.error('[Favorites] Cache load error:', error);
        }
    }

    /**
     * Star a memory
     * @param {string} memoryId - Memory UUID
     * @returns {Promise<boolean>} Success status
     */
    async star(memoryId) {
        if (!this.supabase || !this.userId) {
            console.warn('[Favorites] Cannot star: Not authenticated');
            return false;
        }

        try {
            const { error } = await this.supabase
                .from('memory_entries')
                .update({ 
                    starred: true, 
                    starred_at: new Date().toISOString() 
                })
                .eq('id', memoryId)
                .eq('user_id', this.userId);

            if (error) throw error;

            // Update cache
            const cached = this.cache.get(memoryId) || {};
            this.cache.set(memoryId, { ...cached, starred: true });

            console.log('[Favorites] ⭐ Starred memory:', memoryId);
            return true;
        } catch (error) {
            console.error('[Favorites] Star error:', error);
            return false;
        }
    }

    /**
     * Unstar a memory
     * @param {string} memoryId - Memory UUID
     * @returns {Promise<boolean>} Success status
     */
    async unstar(memoryId) {
        if (!this.supabase || !this.userId) return false;

        try {
            const { error } = await this.supabase
                .from('memory_entries')
                .update({ 
                    starred: false, 
                    starred_at: null 
                })
                .eq('id', memoryId)
                .eq('user_id', this.userId);

            if (error) throw error;

            // Update cache
            const cached = this.cache.get(memoryId) || {};
            this.cache.set(memoryId, { ...cached, starred: false });

            console.log('[Favorites] ☆ Unstarred memory:', memoryId);
            return true;
        } catch (error) {
            console.error('[Favorites] Unstar error:', error);
            return false;
        }
    }

    /**
     * Toggle star status
     * @param {string} memoryId - Memory UUID
     * @returns {Promise<boolean>} New starred state (true = now starred)
     */
    async toggleStar(memoryId) {
        const isStarred = this.isStarred(memoryId);
        const success = isStarred ? await this.unstar(memoryId) : await this.star(memoryId);
        return success ? !isStarred : isStarred;
    }

    /**
     * Pin a memory (higher priority than starring)
     * @param {string} memoryId - Memory UUID
     * @returns {Promise<boolean>} Success status
     */
    async pin(memoryId) {
        if (!this.supabase || !this.userId) return false;

        try {
            const { error } = await this.supabase
                .from('memory_entries')
                .update({ 
                    pinned: true, 
                    pinned_at: new Date().toISOString() 
                })
                .eq('id', memoryId)
                .eq('user_id', this.userId);

            if (error) throw error;

            // Update cache
            const cached = this.cache.get(memoryId) || {};
            this.cache.set(memoryId, { ...cached, pinned: true });

            console.log('[Favorites] 📌 Pinned memory:', memoryId);
            return true;
        } catch (error) {
            console.error('[Favorites] Pin error:', error);
            return false;
        }
    }

    /**
     * Unpin a memory
     * @param {string} memoryId - Memory UUID
     * @returns {Promise<boolean>} Success status
     */
    async unpin(memoryId) {
        if (!this.supabase || !this.userId) return false;

        try {
            const { error } = await this.supabase
                .from('memory_entries')
                .update({ 
                    pinned: false, 
                    pinned_at: null 
                })
                .eq('id', memoryId)
                .eq('user_id', this.userId);

            if (error) throw error;

            // Update cache
            const cached = this.cache.get(memoryId) || {};
            this.cache.set(memoryId, { ...cached, pinned: false });

            console.log('[Favorites] 📍 Unpinned memory:', memoryId);
            return true;
        } catch (error) {
            console.error('[Favorites] Unpin error:', error);
            return false;
        }
    }

    /**
     * Toggle pin status
     * @param {string} memoryId - Memory UUID
     * @returns {Promise<boolean>} New pinned state (true = now pinned)
     */
    async togglePin(memoryId) {
        const isPinned = this.isPinned(memoryId);
        const success = isPinned ? await this.unpin(memoryId) : await this.pin(memoryId);
        return success ? !isPinned : isPinned;
    }

    /**
     * Check if memory is starred (from cache)
     * @param {string} memoryId - Memory UUID
     * @returns {boolean} Is starred
     */
    isStarred(memoryId) {
        return this.cache.get(memoryId)?.starred || false;
    }

    /**
     * Check if memory is pinned (from cache)
     * @param {string} memoryId - Memory UUID
     * @returns {boolean} Is pinned
     */
    isPinned(memoryId) {
        return this.cache.get(memoryId)?.pinned || false;
    }

    /**
     * Get all starred memories
     * @param {number} limit - Max results
     * @returns {Promise<Array>} Starred memories
     */
    async getStarred(limit = 50) {
        if (!this.supabase || !this.userId) return [];

        try {
            const { data, error } = await this.supabase
                .from('memory_entries')
                .select('*')
                .eq('user_id', this.userId)
                .eq('starred', true)
                .order('starred_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[Favorites] Get starred error:', error);
            return [];
        }
    }

    /**
     * Get all pinned memories
     * @param {number} limit - Max results
     * @returns {Promise<Array>} Pinned memories
     */
    async getPinned(limit = 10) {
        if (!this.supabase || !this.userId) return [];

        try {
            const { data, error } = await this.supabase
                .from('memory_entries')
                .select('*')
                .eq('user_id', this.userId)
                .eq('pinned', true)
                .order('pinned_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[Favorites] Get pinned error:', error);
            return [];
        }
    }

    /**
     * Get all favorites (starred OR pinned)
     * @param {number} limit - Max results
     * @returns {Promise<Array>} All favorites
     */
    async getAllFavorites(limit = 100) {
        if (!this.supabase || !this.userId) return [];

        try {
            const { data, error } = await this.supabase
                .from('memory_entries')
                .select('*')
                .eq('user_id', this.userId)
                .or('starred.eq.true,pinned.eq.true')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[Favorites] Get all favorites error:', error);
            return [];
        }
    }

    /**
     * Get recent starred items (for sidebar widget)
     * @param {number} count - Number to retrieve
     * @returns {Promise<Array>} Recent starred memories
     */
    async getRecentStarred(count = 5) {
        return await this.getStarred(count);
    }

    /**
     * Get favorites count
     * @returns {Promise<Object>} {starred: number, pinned: number, total: number}
     */
    async getCount() {
        if (!this.supabase || !this.userId) {
            return { starred: 0, pinned: 0, total: 0 };
        }

        try {
            // Count starred
            const { count: starredCount, error: starredError } = await this.supabase
                .from('memory_entries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.userId)
                .eq('starred', true);

            if (starredError) throw starredError;

            // Count pinned
            const { count: pinnedCount, error: pinnedError } = await this.supabase
                .from('memory_entries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.userId)
                .eq('pinned', true);

            if (pinnedError) throw pinnedError;

            // Count total favorites (starred OR pinned, avoid double-counting)
            const { count: totalCount, error: totalError } = await this.supabase
                .from('memory_entries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.userId)
                .or('starred.eq.true,pinned.eq.true');

            if (totalError) throw totalError;

            return {
                starred: starredCount || 0,
                pinned: pinnedCount || 0,
                total: totalCount || 0
            };
        } catch (error) {
            console.error('[Favorites] Get count error:', error);
            return { starred: 0, pinned: 0, total: 0 };
        }
    }

    /**
     * Clear all favorites (DANGEROUS - use with caution)
     * @returns {Promise<boolean>} Success status
     */
    async clearAll() {
        if (!this.supabase || !this.userId) return false;

        try {
            const { error } = await this.supabase
                .from('memory_entries')
                .update({ 
                    starred: false, 
                    pinned: false,
                    starred_at: null,
                    pinned_at: null
                })
                .eq('user_id', this.userId)
                .or('starred.eq.true,pinned.eq.true');

            if (error) throw error;

            this.cache.clear();
            console.log('[Favorites] 🗑️ Cleared all favorites');
            return true;
        } catch (error) {
            console.error('[Favorites] Clear all error:', error);
            return false;
        }
    }
}

// Singleton instance
let favoritesManager = null;

/**
 * Get or create favorites manager instance
 * @returns {FavoritesManager} Singleton instance
 */
export function getFavoritesManager() {
    if (!favoritesManager) {
        favoritesManager = new FavoritesManager();
    }
    return favoritesManager;
}

// Export for global access
if (typeof window !== 'undefined') {
    window.getFavoritesManager = getFavoritesManager;
}
