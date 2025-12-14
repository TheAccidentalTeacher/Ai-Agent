# Phase 6: Deep Research Engine - Setup Guide

## 🎯 Overview

Phase 6 adds deep research capabilities with multi-source search. You can now search across Google (via SerpAPI) and AI-optimized results (via Tavily).

## ⚙️ Setup (Required for Research Mode)

### 1. Get API Keys

**SerpAPI** (Google Search):
- Sign up at: https://serpapi.com/
- Free tier: 100 searches/month
- Get your API key from dashboard
- Cost: Free for basic use, $50/month for 5K searches

**Tavily** (AI-Optimized Search):
- Sign up at: https://tavily.com/
- Free tier: 1,000 searches/month  
- Get your API key from dashboard
- Cost: Free for basic use, paid plans available

### 2. Add Keys to .env

Edit your `.env` file and add:

```env
# Existing keys (Phase 1-5)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...

# New Phase 6 keys
SERP_API_KEY=your_serpapi_key_here
TAVILY_API_KEY=your_tavily_key_here
```

### 3. Restart Server

```bash
# Stop server (Ctrl+C)
# Start again
node server.cjs
```

## 🚀 Using Research Mode

1. Open http://localhost:8888
2. Click 🤖 Multi-Agent Consortium button
3. Click "🔍 Deep Research" mode
4. Enter your search query
5. Click "🔍 Start Research"

## 🔍 What You Get

- **Multi-source results**: Combines Google (SerpAPI) + Tavily
- **Deduplication**: Removes duplicate URLs
- **Relevance scoring**: Ranks by relevance to your query
- **Source attribution**: Shows which API provided each result
- **Rich metadata**: Title, URL, snippet, date, score

## 📊 Example Query

Try: "explain quantum computing simply"

You'll see:
- 10 ranked results
- Scores showing relevance
- Multiple sources (serpapi, tavily)
- Clickable links to original content
- Execution time and stats

## 🛠️ Troubleshooting

### "No search API keys configured"

**Problem**: Neither SERP_API_KEY nor TAVILY_API_KEY is set in .env

**Solution**: 
1. Sign up for at least one service (SerpAPI or Tavily)
2. Add the API key to `.env`
3. Restart server

### "Search provider X failed"

**Problem**: One API key is invalid or quota exceeded

**Solution**:
- The system will still work with the other provider
- Check API key is correct in `.env`
- Check quota limits on provider dashboard
- Add second provider as backup

### No results returned

**Problem**: Query might be too specific or both APIs failed

**Solution**:
- Try broader search terms
- Check console logs for detailed error messages
- Verify API keys are active on provider dashboards

## 💡 Pro Tips

1. **Use both APIs**: Get more comprehensive results
2. **Start with Tavily**: Often better for AI-related queries
3. **SerpAPI = Google**: Traditional web search results
4. **Check quotas**: Monitor your usage on provider dashboards
5. **Free tiers**: Sufficient for development and testing

## 📈 What's Next

**Phase 6 Day 2** (Coming soon):
- Content extraction from URLs
- Web scraping with readability  
- Smart chunking for LLM processing
- Batch processing multiple URLs

**Phase 6 Day 3** (Coming soon):
- Multi-agent analysis of research
- Research session save/load
- Export to Markdown, PDF, JSON
- Complete research workflow

## 🔗 Resources

- [PHASE_6_IMPLEMENTATION_PLAN.md](PHASE_6_IMPLEMENTATION_PLAN.md) - Complete implementation guide
- [SerpAPI Docs](https://serpapi.com/search-api)
- [Tavily API Docs](https://docs.tavily.com/)
- [RESEARCH_CAPABILITIES_SPEC.md](docs/RESEARCH_CAPABILITIES_SPEC.md) - Full specifications

---

**Status**: Phase 6 Day 1 Complete ✅  
**Next**: Day 2 - Content Extraction (3-4 hours)  
**Last Updated**: December 14, 2025
