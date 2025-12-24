# AI Models Configuration Reference

## Overview
This document provides a complete reference for all AI models configured in the UCAS system. The configuration is centralized in `ai-models-config.js` for easy maintenance and extensibility.

---

## 🤖 Anthropic (Claude)

**API Key Environment Variable:** `ANTHROPIC_API_KEY`  
**Endpoint:** `https://api.anthropic.com/v1/messages`  
**Default Model:** `claude-sonnet-4-5`

### Models

| Model ID | Name | Max Output | Context Window | Best For |
|----------|------|------------|----------------|----------|
| `claude-sonnet-4-5` | Claude Sonnet 4.5 (Latest) | 16,384 tokens | 200,000 tokens | Agents, coding, balanced performance |
| `claude-opus-4-5` | Claude Opus 4.5 (Maximum Intelligence) | 16,384 tokens | 200,000 tokens | Complex reasoning, analysis |
| `claude-haiku-4-5` | Claude Haiku 4.5 (Fastest) | 16,384 tokens | 200,000 tokens | Speed, cost efficiency |
| `claude-3-5-sonnet-20240620` | Claude 3.5 Sonnet (Legacy) | 4,096 tokens | 200,000 tokens | Legacy support |
| `claude-3-opus-20240229` | Claude 3 Opus | 4,096 tokens | 200,000 tokens | Legacy high-intelligence |
| `claude-3-sonnet-20240229` | Claude 3 Sonnet | 4,096 tokens | 200,000 tokens | Legacy balanced |
| `claude-3-haiku-20240307` | Claude 3 Haiku | 4,096 tokens | 200,000 tokens | Legacy fast/cheap |

**Key Features:**
- **Claude 4 Series:** Extended 16K output capacity (4x Claude 3)
- **200K Context:** All models support 200K token context windows
- **Best for:** Agentic workflows, coding, detailed analysis

---

## 🧠 OpenAI (GPT)

**API Key Environment Variable:** `OPENAI_API_KEY`  
**Endpoint:** `https://api.openai.com/v1/chat/completions`  
**Default Model:** `gpt-5.2`

### Models

| Model ID | Name | Max Output | Context Window | Best For |
|----------|------|------------|----------------|----------|
| `gpt-5.2` | GPT-5.2 (Best for Coding/Agents) | 16,384 tokens | 128,000 tokens | Coding, agents, complex tasks |
| `gpt-5` | GPT-5 (Reasoning Model) | 16,384 tokens | 128,000 tokens | Advanced reasoning |
| `gpt-5-mini` | GPT-5 Mini (Faster/Cheaper) | 16,384 tokens | 128,000 tokens | Fast responses |
| `gpt-4.1` | GPT-4.1 (Smart Non-Reasoning) | 16,384 tokens | 128,000 tokens | Balanced performance |
| `gpt-4-turbo` | GPT-4 Turbo | 16,384 tokens | 128,000 tokens | General purpose |
| `gpt-4` | GPT-4 | 8,192 tokens | 8,000 tokens | Legacy support |
| `gpt-3.5-turbo` | GPT-3.5 Turbo | 4,096 tokens | 16,385 tokens | Cost-effective |

**Key Features:**
- **GPT-5 Series:** State-of-the-art reasoning and coding capabilities
- **128K Context:** Extended context for GPT-5 models
- **Best for:** Software development, game design, technical writing

---

## 🌐 Google (Gemini)

**API Key Environment Variable:** `GOOGLE_API_KEY`  
**Endpoint:** `https://generativelanguage.googleapis.com/v1beta`  
**Default Model:** `gemini-2.0-flash-exp`

### Models

| Model ID | Name | Max Output | Context Window | Best For |
|----------|------|------------|----------------|----------|
| `gemini-2.0-flash-exp` | Gemini 2.0 Flash (Experimental) | 8,192 tokens | 1,048,576 tokens | Ultra-long context |
| `gemini-1.5-pro` | Gemini 1.5 Pro | 8,192 tokens | 2,097,152 tokens | **2M token context!** |
| `gemini-1.5-flash` | Gemini 1.5 Flash | 8,192 tokens | 1,048,576 tokens | Fast, long context |
| `gemini-1.0-pro` | Gemini 1.0 Pro | 8,192 tokens | 32,768 tokens | Legacy support |

**Key Features:**
- **Massive Context Windows:** Up to 2 million tokens (Gemini 1.5 Pro)
- **Best for:** Processing entire codebases, large documents, book analysis
- **Note:** Lower output tokens but unprecedented input capacity

---

## 🚀 xAI (Grok)

**API Key Environment Variable:** `XAI_API_KEY`  
**Endpoint:** `https://api.x.ai/v1/chat/completions`  
**Default Model:** `grok-2-latest`

### Models

| Model ID | Name | Max Output | Context Window | Best For |
|----------|------|------------|----------------|----------|
| `grok-2-latest` | Grok 2 (Latest) | 32,768 tokens | 131,072 tokens | **Longest output!** |
| `grok-2` | Grok 2 | 32,768 tokens | 131,072 tokens | High output capacity |
| `grok-beta` | Grok (Beta) | 32,768 tokens | 131,072 tokens | Experimental features |

**Key Features:**
- **32K Output Tokens:** Highest output capacity of any model
- **131K Context:** Large context window
- **Best for:** Generating long-form content, detailed documentation, comprehensive analysis

---

## 🌟 Mistral AI

**API Key Environment Variable:** `MISTRAL_API_KEY`  
**Endpoint:** `https://api.mistral.ai/v1/chat/completions`  
**Default Model:** `mistral-large-latest`

### Models

| Model ID | Name | Max Output | Context Window | Best For |
|----------|------|------------|----------------|----------|
| `mistral-large-latest` | Mistral Large (Latest) | 16,384 tokens | 128,000 tokens | High performance |
| `mistral-medium-latest` | Mistral Medium | 8,192 tokens | 32,000 tokens | Balanced |
| `mistral-small-latest` | Mistral Small | 8,192 tokens | 32,000 tokens | Fast/cheap |
| `open-mistral-7b` | Open Mistral 7B | 8,192 tokens | 32,000 tokens | Open source |

**Key Features:**
- **European Alternative:** Privacy-focused European AI provider
- **Cost-Effective:** Competitive pricing
- **Best for:** Privacy-conscious deployments, European data residency

---

## 🔵 Cohere

**API Key Environment Variable:** `COHERE_API_KEY`  
**Endpoint:** `https://api.cohere.ai/v1/chat`  
**Default Model:** `command-r-plus`

### Models

| Model ID | Name | Max Output | Context Window | Best For |
|----------|------|------------|----------------|----------|
| `command-r-plus` | Command R+ (Latest) | 4,096 tokens | 128,000 tokens | RAG, search |
| `command-r` | Command R | 4,096 tokens | 128,000 tokens | Retrieval tasks |
| `command` | Command | 4,096 tokens | 4,096 tokens | Legacy |

**Key Features:**
- **RAG Optimized:** Excellent for retrieval-augmented generation
- **Search Integration:** Built-in web search capabilities
- **Best for:** Knowledge base queries, document search, Q&A systems

---

## 📊 Output Capacity Comparison

### Longest Output (for generating long content)
1. **Grok 2:** 32,768 tokens (~130,000 characters)
2. **Claude 4:** 16,384 tokens (~65,000 characters)
3. **GPT-5:** 16,384 tokens (~65,000 characters)
4. **Mistral Large:** 16,384 tokens (~65,000 characters)

### Largest Context Window (for reading long documents)
1. **Gemini 1.5 Pro:** 2,097,152 tokens (~8.4 million characters)
2. **Gemini 2.0/1.5 Flash:** 1,048,576 tokens (~4.2 million characters)
3. **Claude (all):** 200,000 tokens (~800,000 characters)
4. **Grok 2:** 131,072 tokens (~524,000 characters)

### Best Balance (output + context)
1. **Claude Sonnet 4.5:** 16K output + 200K context
2. **Grok 2:** 32K output + 131K context  
3. **GPT-5.2:** 16K output + 128K context

---

## 🎯 Use Case Recommendations

### For Agentic Workflows & Coding
- **Primary:** Claude Sonnet 4.5 (16K output, excellent reasoning)
- **Alternative:** GPT-5.2 (16K output, strong code generation)

### For Detailed Analysis & Long Responses
- **Primary:** Grok 2 (32K output - longest responses)
- **Alternative:** Claude Opus 4.5 (16K output, deep reasoning)

### For Processing Large Documents
- **Primary:** Gemini 1.5 Pro (2M context - can read entire codebases)
- **Alternative:** Gemini 2.0 Flash (1M context, faster)

### For Cost-Effective Development
- **Primary:** Claude Haiku 4.5 (16K output, fast, cheap)
- **Alternative:** GPT-5 Mini (16K output, affordable)

### For Privacy/European Deployment
- **Primary:** Mistral Large (16K output, EU-based)
- **Alternative:** Open Mistral 7B (open source)

### For RAG/Search Applications
- **Primary:** Cohere Command R+ (optimized for retrieval)
- **Alternative:** Gemini 1.5 Pro (massive context for search)

---

## 🔧 Adding New Models

To add a new AI provider or model:

1. **Edit `ai-models-config.js`:**
   ```javascript
   const AI_MODELS = {
     // ... existing providers
     newprovider: {
       name: 'New Provider',
       apiKeyEnv: 'NEW_PROVIDER_API_KEY',
       endpoint: 'https://api.newprovider.com/v1/chat',
       defaultModel: 'model-id',
       maxOutputTokens: {
         'model-family': 8192,
         'default': 8192
       },
       models: [
         {
           id: 'model-id',
           name: 'Model Name',
           maxOutput: 8192,
           contextWindow: 32000
         }
       ]
     }
   };
   ```

2. **Add API Handler in `netlify/functions/chat.cjs`:**
   ```javascript
   else if (selectedProvider === 'newprovider') {
     // Add API call logic
   }
   ```

3. **Add Environment Variable:**
   - In Netlify dashboard: `NEW_PROVIDER_API_KEY`
   - In local `.env`: `NEW_PROVIDER_API_KEY=your-key-here`

4. **Restart Server** - The UI will automatically show the new provider!

---

## 📝 Current Configuration Summary

- ✅ **6 Providers Configured**
- ✅ **28 Models Available**
- ✅ **Output Range:** 4K - 32K tokens
- ✅ **Context Range:** 4K - 2M tokens
- ✅ **Auto-detects Token Limits**
- ✅ **Extensible Architecture**

**Status:** All models properly configured with correct token limits. Ready for production use.
