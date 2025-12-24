/**
 * AI Settings UI Manager
 * Dynamically populates provider and model dropdowns from centralized config
 */

class AISettingsManager {
    constructor() {
        this.config = null;
        this.init();
    }

    init() {
        // Wait for config to be loaded
        if (typeof AI_MODELS === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }
        
        this.populateProviders();
        this.loadSavedSettings();
        this.attachEventListeners();
    }

    populateProviders() {
        const providerSelect = document.getElementById('ai-provider');
        if (!providerSelect) return;

        // Clear existing options except the first (placeholder)
        while (providerSelect.options.length > 1) {
            providerSelect.remove(1);
        }

        // Add all available providers
        const providers = getAvailableProviders();
        providers.forEach(providerId => {
            const provider = getProviderConfig(providerId);
            const option = document.createElement('option');
            option.value = providerId;
            option.textContent = provider.name;
            providerSelect.appendChild(option);
        });
    }

    loadSavedSettings() {
        const config = JSON.parse(localStorage.getItem('ai_config') || '{}');
        const provider = config.provider || 'anthropic';
        
        // Set provider
        const providerSelect = document.getElementById('ai-provider');
        if (providerSelect) {
            providerSelect.value = provider;
        }

        // Load models for selected provider
        this.switchProvider(provider);

        // Load other settings
        const enableImages = document.getElementById('enable-images');
        if (enableImages) {
            enableImages.checked = config.enable_images !== false;
        }

        const persona = document.getElementById('persona-select');
        if (persona) {
            persona.value = config.persona || 'default';
        }
    }

    switchProvider(providerId) {
        const providerConfig = getProviderConfig(providerId);
        if (!providerConfig) return;

        // Hide all model containers
        const allContainers = document.querySelectorAll('[id$="-models"]');
        allContainers.forEach(container => container.classList.add('hidden'));

        // Show/create container for this provider
        let container = document.getElementById(`${providerId}-models`);
        if (!container) {
            container = this.createModelContainer(providerId, providerConfig);
        } else {
            // Container exists, populate it
            this.populateModelSelect(providerId, providerConfig);
        }
        container.classList.remove('hidden');

        // Populate quick switch dropdown
        this.populateQuickSwitch();
    }

    populateModelSelect(providerId, providerConfig) {
        const select = document.getElementById(`${providerId}-model`);
        if (!select) return;

        // Clear existing options
        select.innerHTML = '';

        providerConfig.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.name} (${model.maxOutput} tokens, ${this.formatContextWindow(model.contextWindow)} context)`;
            select.appendChild(option);
        });

        // Load saved value
        const config = JSON.parse(localStorage.getItem('ai_config') || '{}');
        const savedModel = config[`${providerId}_model`] || providerConfig.defaultModel;
        select.value = savedModel;
    }

    createModelContainer(providerId, providerConfig) {
        const settingsContainer = document.querySelector('.ai-settings-content .settings-group:nth-child(2)');
        
        const container = document.createElement('div');
        container.id = `${providerId}-models`;
        container.className = 'settings-group hidden';

        const label = document.createElement('label');
        label.textContent = `${providerConfig.name} Model:`;
        
        const select = document.createElement('select');
        select.id = `${providerId}-model`;
        select.name = `${providerId}_model`;

        providerConfig.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.name} (${model.maxOutput} tokens, ${this.formatContextWindow(model.contextWindow)} context)`;
            select.appendChild(option);
        });

        // Load saved value
        const config = JSON.parse(localStorage.getItem('ai_config') || '{}');
        const savedModel = config[`${providerId}_model`] || providerConfig.defaultModel;
        select.value = savedModel;

        container.appendChild(label);
        container.appendChild(select);
        
        // Insert after provider select
        const providerGroup = document.querySelector('.settings-group');
        providerGroup.parentNode.insertBefore(container, providerGroup.nextSibling);

        return container;
    }

    formatContextWindow(tokens) {
        if (tokens >= 1000000) {
            return `${(tokens / 1000000).toFixed(1)}M`;
        } else if (tokens >= 1000) {
            return `${(tokens / 1000).toFixed(0)}K`;
        }
        return tokens.toString();
    }

    populateQuickSwitch() {
        const quickSwitch = document.getElementById('quick-model-switch');
        if (!quickSwitch) return;

        // Clear existing options
        while (quickSwitch.options.length > 0) {
            quickSwitch.remove(0);
        }

        // Get current config
        const config = JSON.parse(localStorage.getItem('ai_config') || '{}');
        const currentProvider = config.provider || 'anthropic';

        // Add all providers and their models
        const providers = getAvailableProviders();
        providers.forEach(providerId => {
            const provider = getProviderConfig(providerId);
            
            // Add optgroup for provider
            const optgroup = document.createElement('optgroup');
            optgroup.label = provider.name;

            provider.models.forEach(model => {
                const option = document.createElement('option');
                option.value = `${providerId}:${model.id}`;
                option.textContent = `${model.name}`;
                
                // Select current model
                const currentModel = config[`${providerId}_model`] || provider.defaultModel;
                if (providerId === currentProvider && model.id === currentModel) {
                    option.selected = true;
                }
                
                optgroup.appendChild(option);
            });

            quickSwitch.appendChild(optgroup);
        });
    }

    attachEventListeners() {
        // Provider change listener
        const providerSelect = document.getElementById('ai-provider');
        if (providerSelect) {
            providerSelect.addEventListener('change', (e) => {
                this.switchProvider(e.target.value);
            });
        }

        // Save settings listener
        const saveBtn = document.getElementById('save-ai-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
    }

    saveSettings() {
        const config = {};

        // Get provider
        const providerSelect = document.getElementById('ai-provider');
        config.provider = providerSelect ? providerSelect.value : 'anthropic';

        // Get model for each provider
        const providers = getAvailableProviders();
        providers.forEach(providerId => {
            const modelSelect = document.getElementById(`${providerId}-model`);
            if (modelSelect) {
                config[`${providerId}_model`] = modelSelect.value;
            }
        });

        // Get other settings
        const enableImages = document.getElementById('enable-images');
        config.enable_images = enableImages ? enableImages.checked : true;

        const persona = document.getElementById('persona-select');
        config.persona = persona ? persona.value : 'default';

        // Save to localStorage
        localStorage.setItem('ai_config', JSON.stringify(config));

        // Update quick switch
        this.populateQuickSwitch();

        console.log('[AI Settings] Saved:', config);
        
        // Show success message
        alert('AI settings saved successfully!');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aiSettingsManager = new AISettingsManager();
    });
} else {
    window.aiSettingsManager = new AISettingsManager();
}
