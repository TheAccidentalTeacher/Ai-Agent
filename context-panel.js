// ============================================================================
// CONTEXT PANEL - Phase 11+
// JavaScript for handling 6-panel contextual system with auto-switching
// ============================================================================

class ContextPanel {
    constructor() {
        this.currentPanel = 'context-aware'; // Default panel
        this.autoMode = true; // Start with auto-switching enabled
        this.isCollapsed = false;
        
        // Initialize after DOM loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // CRITICAL: Hide game editor elements from grid layout
        // Use CSS Grid explicit column placement instead of DOM removal to avoid breaking editor.js
        const canvas = document.getElementById('canvas-container');
        const properties = document.getElementById('properties-panel');
        const aiPanel = document.getElementById('ai-panel');
        const contextPanel = document.getElementById('context-panel');
        
        // Force explicit grid positioning so hidden elements don't create extra columns
        if (canvas) canvas.style.gridColumn = '1 / 2';
        if (properties) properties.style.gridColumn = '1 / 2';
        if (aiPanel) aiPanel.style.gridColumn = '1 / 2';
        if (contextPanel) contextPanel.style.gridColumn = '2 / 3';
        
        // Get DOM elements
        this.panel = document.getElementById('context-panel');
        this.autoIndicator = document.getElementById('context-auto-indicator');
        this.autoToggle = document.getElementById('context-auto-toggle');
        this.closeBtn = document.getElementById('context-close');
        this.reopenBtn = document.getElementById('context-reopen');
        
        // Bind event listeners
        this.bindEvents();
        
        // Load saved state from localStorage
        this.loadState();
        
        // Set initial active panel
        this.switchPanel(this.currentPanel);
        
        console.log('✅ Context Panel initialized');
    }

    bindEvents() {
        // Tab click events
        const tabs = document.querySelectorAll('.context-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const panelId = tab.dataset.panel;
                this.switchPanel(panelId);
            });
        });

        // Auto-toggle button
        if (this.autoToggle) {
            this.autoToggle.addEventListener('click', () => {
                this.toggleAutoMode();
            });
        }

        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.toggleCollapse();
            });
        }

        // Reopen button
        if (this.reopenBtn) {
            this.reopenBtn.addEventListener('click', () => {
                this.toggleCollapse();
            });
        }

        // Listen for custom events
        document.addEventListener('context-panel-switch', (e) => {
            if (this.autoMode) {
                this.switchPanel(e.detail.panel);
            }
        });
    }

    switchPanel(panelId) {
        // Update active tab
        document.querySelectorAll('.context-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.panel === panelId);
        });

        // Update active panel content
        document.querySelectorAll('.context-panel-item').forEach(item => {
            item.classList.toggle('active', item.id === `panel-${panelId}`);
        });

        this.currentPanel = panelId;
        this.saveState();

        console.log(`📊 Context panel switched to: ${panelId}`);
    }

    toggleAutoMode() {
        this.autoMode = !this.autoMode;
        
        if (this.autoIndicator) {
            this.autoIndicator.classList.toggle('inactive', !this.autoMode);
        }
        
        if (this.autoToggle) {
            this.autoToggle.classList.toggle('active', this.autoMode);
            this.autoToggle.textContent = this.autoMode ? '⚡' : '🔒';
            this.autoToggle.title = this.autoMode 
                ? 'Auto-switching enabled (click to disable)' 
                : 'Manual mode (click to enable auto-switching)';
        }

        this.saveState();
        console.log(`🔄 Auto-switching ${this.autoMode ? 'enabled' : 'disabled'}`);
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        
        if (this.panel) {
            this.panel.classList.toggle('collapsed', this.isCollapsed);
        }
        
        if (this.reopenBtn) {
            this.reopenBtn.classList.toggle('visible', this.isCollapsed);
        }

        // Update workspace grid
        const workspace = document.getElementById('workspace');
        if (workspace) {
            workspace.style.gridTemplateColumns = this.isCollapsed ? '1fr' : '1fr 400px';
        }

        this.saveState();
        console.log(`${this.isCollapsed ? '⏸️' : '▶️'} Context panel ${this.isCollapsed ? 'collapsed' : 'expanded'}`);
    }

    // Auto-switching triggers based on user actions
    static triggerSwitch(panelId) {
        document.dispatchEvent(new CustomEvent('context-panel-switch', {
            detail: { panel: panelId }
        }));
    }

    saveState() {
        const state = {
            currentPanel: this.currentPanel,
            autoMode: this.autoMode,
            isCollapsed: this.isCollapsed
        };
        localStorage.setItem('contextPanelState', JSON.stringify(state));
    }

    loadState() {
        const saved = localStorage.getItem('contextPanelState');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.currentPanel = state.currentPanel || 'context-aware';
                this.autoMode = state.autoMode !== undefined ? state.autoMode : true;
                this.isCollapsed = state.isCollapsed || false;

                // Apply auto mode state
                if (this.autoIndicator) {
                    this.autoIndicator.classList.toggle('inactive', !this.autoMode);
                }
                if (this.autoToggle) {
                    this.autoToggle.classList.toggle('active', this.autoMode);
                    this.autoToggle.textContent = this.autoMode ? '⚡' : '🔒';
                }

                // Apply collapse state
                if (this.panel) {
                    this.panel.classList.toggle('collapsed', this.isCollapsed);
                }
                if (this.reopenBtn) {
                    this.reopenBtn.classList.toggle('visible', this.isCollapsed);
                }
            } catch (e) {
                console.warn('Failed to load context panel state:', e);
            }
        }
    }

    // Helper methods for populating panels with data
    updateDocumentPanel(files) {
        const panel = document.getElementById('panel-document');
        if (!panel) return;

        const preview = panel.querySelector('.document-preview');
        if (files && files.length > 0) {
            // Update with file information
            preview.innerHTML = `<p>📄 ${files.length} file(s) uploaded</p>`;
        }
    }

    updateAgentMonitor(agents) {
        const list = document.querySelector('.agent-list');
        if (!list) return;

        if (!agents || agents.length === 0) return;

        list.innerHTML = agents.map(agent => `
            <div class="agent-item ${agent.active ? 'active' : ''}">
                <div class="agent-header">
                    <span class="agent-name">${agent.name}</span>
                    <span class="agent-status-badge">${agent.status}</span>
                </div>
                <div class="agent-thinking">${agent.thinking}</div>
                <div class="agent-confidence">
                    <span class="confidence-label">Confidence:</span>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${agent.confidence}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateContextAware(memories, keyPoints, suggestions) {
        const memoriesEl = document.querySelector('#relevant-memories .context-list');
        const keyPointsEl = document.querySelector('#key-points .context-list');
        const suggestionsEl = document.querySelector('.suggestion-list');

        if (memoriesEl && memories) {
            memoriesEl.innerHTML = memories.length > 0
                ? memories.map(m => `<p>${m}</p>`).join('')
                : '<p class="empty-hint">No relevant memories yet</p>';
        }

        if (keyPointsEl && keyPoints) {
            keyPointsEl.innerHTML = keyPoints.length > 0
                ? keyPoints.map(k => `<p>• ${k}</p>`).join('')
                : '<p class="empty-hint">No key points extracted yet</p>';
        }

        if (suggestionsEl && suggestions) {
            suggestionsEl.innerHTML = suggestions.length > 0
                ? suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('')
                : '';
        }
    }

    updateGallery(outputs) {
        const grid = document.querySelector('.output-grid');
        if (!grid || !outputs) return;

        grid.innerHTML = outputs.map(output => `
            <div class="output-item" data-id="${output.id}">
                <img src="${output.preview}" alt="${output.type}" class="output-preview">
                <div class="output-meta">
                    <div class="output-type">${output.type}</div>
                    <div class="output-timestamp">${output.timestamp}</div>
                </div>
            </div>
        `).join('');
    }
}

// Global context panel instance
let contextPanel;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        contextPanel = new ContextPanel();
    });
} else {
    contextPanel = new ContextPanel();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContextPanel };
}
