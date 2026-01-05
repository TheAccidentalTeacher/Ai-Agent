/**
 * AI Models Configuration
 * Central configuration for all AI providers and their models
 * Easy to extend with new providers like Grok, Gemini, etc.
 */

const AI_MODELS = {
    anthropic: {
        name: 'Anthropic',
        apiKeyEnv: 'ANTHROPIC_API_KEY',
        endpoint: 'https://api.anthropic.com/v1/messages',
        defaultModel: 'claude-sonnet-4-5-20250929',
        maxOutputTokens: {
            'claude-sonnet-4-5-20250929': 64000,
            'claude-opus-4-5-20251101': 64000,
            'claude-haiku-4-5-20251001': 64000,
            'claude-3-5': 8192,
            'claude-3': 4096,
            'default': 64000
        },
        models: [
            // Claude 4.5 Series (Latest - Sept/Oct/Nov 2025)
            { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5 (Sep 2025 - Latest)', maxOutput: 64000, contextWindow: 200000 },
            { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5 (Nov 2025 - Maximum Intelligence)', maxOutput: 64000, contextWindow: 200000 },
            { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5 (Oct 2025 - Fast & Smart)', maxOutput: 64000, contextWindow: 200000 },
            // Claude 3.5 Series (Legacy)
            { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Oct 2024 - Fastest)', maxOutput: 8192, contextWindow: 200000 },
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Oct 2024)', maxOutput: 8192, contextWindow: 200000 },
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (Feb 2024)', maxOutput: 4096, contextWindow: 200000 },
            { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet (Feb 2024)', maxOutput: 4096, contextWindow: 200000 },
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Mar 2024)', maxOutput: 4096, contextWindow: 200000 }
        ]
    },
    
    openai: {
        name: 'OpenAI',
        apiKeyEnv: 'OPENAI_API_KEY',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-5.2',
        maxOutputTokens: {
            'gpt-5': 16384,
            'gpt-4': 16384,
            'gpt-3.5': 4096,
            'o3': 16384,
            'o4': 16384,
            'default': 16384
        },
        models: [
            // Flagship models
            { id: 'gpt-5.2', name: 'GPT-5.2 (Best for Coding/Agents)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'gpt-5.2-pro', name: 'GPT-5.2 Pro (Smartest)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'gpt-5', name: 'GPT-5 (Reasoning)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'gpt-5-pro', name: 'GPT-5 Pro', maxOutput: 16384, contextWindow: 128000 },
            { id: 'gpt-5-mini', name: 'GPT-5 Mini (Fast/Cheap)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'gpt-5-nano', name: 'GPT-5 Nano (Fastest)', maxOutput: 16384, contextWindow: 128000 },
            // Codex models (optimized for coding)
            { id: 'gpt-5.1-codex', name: 'GPT-5.1 Codex (Agentic Coding)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'gpt-5.1-codex-max', name: 'GPT-5.1 Codex Max (Long-horizon)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'gpt-5-codex', name: 'GPT-5 Codex', maxOutput: 16384, contextWindow: 128000 },
            // Non-reasoning models
            { id: 'gpt-4.1', name: 'GPT-4.1 (Smart Non-Reasoning)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', maxOutput: 16384, contextWindow: 128000 },
            { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', maxOutput: 16384, contextWindow: 128000 },
            // Reasoning models (o-series)
            { id: 'o3', name: 'o3 (Reasoning)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'o3-pro', name: 'o3 Pro (More Compute)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'o4-mini', name: 'o4-mini (Fast Reasoning)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'o3-deep-research', name: 'o3 Deep Research', maxOutput: 16384, contextWindow: 128000 },
            // Legacy
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo (Legacy)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Legacy)', maxOutput: 4096, contextWindow: 16384 }
        ]
    },
    
    google: {
        name: 'Google',
        apiKeyEnv: 'GOOGLE_API_KEY',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        defaultModel: 'gemini-2.0-flash-exp',
        maxOutputTokens: {
            'gemini-2': 8192,
            'gemini-1.5': 8192,
            'default': 8192
        },
        models: [
            { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)', maxOutput: 8192, contextWindow: 1000000 },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', maxOutput: 8192, contextWindow: 2000000 },
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', maxOutput: 8192, contextWindow: 1000000 },
            { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', maxOutput: 8192, contextWindow: 32000 }
        ]
    },
    
    xai: {
        name: 'xAI (Grok)',
        apiKeyEnv: 'XAI_API_KEY',
        endpoint: 'https://api.x.ai/v1/chat/completions',
        defaultModel: 'grok-4-latest',
        maxOutputTokens: {
            'grok-4': 32768,
            'grok-2': 32768,
            'grok-beta': 32768,
            'default': 32768
        },
        models: [
            { id: 'grok-4-latest', name: 'Grok 4 (Latest)', maxOutput: 32768, contextWindow: 131072 },
            { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', maxOutput: 32768, contextWindow: 131072 },
            { id: 'grok-2-1212', name: 'Grok 2', maxOutput: 32768, contextWindow: 131072 },
            { id: 'grok-beta', name: 'Grok Beta', maxOutput: 32768, contextWindow: 131072 }
        ]
    },
    
    mistral: {
        name: 'Mistral AI',
        apiKeyEnv: 'MISTRAL_API_KEY',
        endpoint: 'https://api.mistral.ai/v1/chat/completions',
        defaultModel: 'mistral-large-latest',
        maxOutputTokens: {
            'mistral-large': 16384,
            'mistral-medium': 16384,
            'mistral-small': 8192,
            'default': 16384
        },
        models: [
            { id: 'mistral-large-latest', name: 'Mistral Large (Latest)', maxOutput: 16384, contextWindow: 128000 },
            { id: 'mistral-medium-latest', name: 'Mistral Medium', maxOutput: 16384, contextWindow: 32000 },
            { id: 'mistral-small-latest', name: 'Mistral Small', maxOutput: 8192, contextWindow: 32000 },
            { id: 'open-mistral-7b', name: 'Mistral 7B', maxOutput: 8192, contextWindow: 32000 }
        ]
    },
    
    cohere: {
        name: 'Cohere',
        apiKeyEnv: 'COHERE_API_KEY',
        endpoint: 'https://api.cohere.ai/v1/chat',
        defaultModel: 'command-r-plus',
        maxOutputTokens: {
            'command-r': 4096,
            'default': 4096
        },
        models: [
            { id: 'command-r-plus', name: 'Command R+', maxOutput: 4096, contextWindow: 128000 },
            { id: 'command-r', name: 'Command R', maxOutput: 4096, contextWindow: 128000 },
            { id: 'command', name: 'Command', maxOutput: 4096, contextWindow: 4096 }
        ]
    }
};

/**
 * Get max output tokens for a specific model
 */
function getMaxOutputTokens(provider, modelId) {
    const providerConfig = AI_MODELS[provider];
    if (!providerConfig) return 8192; // Safe default
    
    // Check specific model config first
    const model = providerConfig.models.find(m => m.id === modelId);
    if (model && model.maxOutput) return model.maxOutput;
    
    // Check model family patterns
    const patterns = Object.keys(providerConfig.maxOutputTokens);
    for (const pattern of patterns) {
        if (pattern !== 'default' && modelId.includes(pattern)) {
            return providerConfig.maxOutputTokens[pattern];
        }
    }
    
    // Return default for provider
    return providerConfig.maxOutputTokens.default || 8192;
}

/**
 * Get model configuration
 */
function getModelConfig(provider, modelId) {
    const providerConfig = AI_MODELS[provider];
    if (!providerConfig) return null;
    
    return providerConfig.models.find(m => m.id === modelId) || {
        id: modelId,
        name: modelId,
        maxOutput: getMaxOutputTokens(provider, modelId),
        contextWindow: 128000
    };
}

/**
 * Get all available providers
 */
function getAvailableProviders() {
    return Object.keys(AI_MODELS);
}

/**
 * Get provider configuration
 */
function getProviderConfig(provider) {
    return AI_MODELS[provider] || null;
}

// Export for use in Node.js (backend)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AI_MODELS,
        getMaxOutputTokens,
        getModelConfig,
        getAvailableProviders,
        getProviderConfig
    };
}

// Export for use in browser (frontend)
if (typeof window !== 'undefined') {
    window.AI_MODELS = AI_MODELS;
    window.getMaxOutputTokens = getMaxOutputTokens;
    window.getModelConfig = getModelConfig;
    window.getAvailableProviders = getAvailableProviders;
    window.getProviderConfig = getProviderConfig;
}
