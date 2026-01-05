/**
 * Search Orchestrator - Multi-Source Search with Deduplication
 * 
 * Combines results from multiple search providers:
 * - SerpAPI (Google Search)
 * - Tavily (AI-optimized search)
 * 
 * Features:
 * - Parallel search execution
 * - URL deduplication
 * - Relevance scoring and ranking
 * - Source attribution
 */

class SearchOrchestrator {
  constructor(options = {}) {
    // Web Search APIs
    this.serpApiKey = options.serpApiKey || process.env.SERPAPI_KEY; // Fixed: use SERPAPI_KEY from .env
    this.tavilyApiKey = options.tavilyApiKey || process.env.TAVILY_API_KEY;
    this.azureBingKey = options.azureBingKey || process.env.AZURE_BING_SEARCH_KEY;
    
    // Academic Search APIs
    this.semanticScholarKey = options.semanticScholarKey || process.env.SEMANTIC_SCHOLAR_KEY; // Optional, works without key
    this.crossRefEmail = options.crossRefEmail || process.env.CROSSREF_EMAIL; // Required for polite access
    
    this.maxResults = options.maxResults || 10;
  }

  /**
   * Decompose complex queries into simpler sub-queries
   * Example: "A, B, and C" becomes ["A", "B", "C"]
   */
  decomposeQuery(query) {
    // Detect if query has multiple distinct concepts
    const hasMultipleConcepts = query.match(/,|\band\b|\bor\b/i);
    
    if (!hasMultipleConcepts) {
      return [query]; // Simple query, no decomposition needed
    }

    // Split on common delimiters while preserving context
    const parts = query
      .split(/[,;]|\b(?:and|or)\b/i)
      .map(part => part.trim())
      .filter(part => part.length > 10); // Ignore very short fragments

    if (parts.length <= 1) {
      return [query]; // Couldn't meaningfully decompose
    }

    console.log(`[SearchOrchestrator] Decomposed query into ${parts.length} parts`);
    return parts.slice(0, 3); // Max 3 sub-queries to avoid overwhelming APIs
  }

  /**
   * Search across all available providers
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<Array>} - Deduplicated and ranked results
   */
  async search(query, options = {}) {
    const startTime = Date.now();
    console.log(`[SearchOrchestrator] Starting search for: "${query}"`);

    // Decompose complex queries for better coverage
    const queries = options.decomposeQuery !== false ? this.decomposeQuery(query) : [query];
    
    if (queries.length > 1) {
      console.log(`[SearchOrchestrator] Searching ${queries.length} sub-queries:`, queries);
    }

    // Execute searches in parallel for each query
    const searchPromises = [];

    for (const subQuery of queries) {
      // Web Search Providers
      if (this.serpApiKey) {
        searchPromises.push(this.searchSerpAPI(subQuery, options));
      }
      if (this.tavilyApiKey) {
        searchPromises.push(this.searchTavily(subQuery, options));
      }
      if (this.azureBingKey) {
        searchPromises.push(this.searchAzureBing(subQuery, options));
      }

      // Academic Search Providers (if academic mode enabled)
      if (options.includeAcademic !== false) {
        searchPromises.push(this.searchSemanticScholar(subQuery, options));
        if (this.crossRefEmail) {
          searchPromises.push(this.searchCrossRef(subQuery, options));
        }
        searchPromises.push(this.searchArXiv(subQuery, options));
      }
    }

    if (searchPromises.length === 0) {
      throw new Error('No search API keys configured. Add: SERPAPI_KEY, TAVILY_API_KEY, or AZURE_BING_SEARCH_KEY');
    }

    // Wait for all searches to complete
    const results = await Promise.allSettled(searchPromises);

    // Extract successful results
    const allResults = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      } else {
        console.error(`[SearchOrchestrator] Search provider ${index} failed:`, result.reason);
      }
    });

    // Deduplicate by URL
    const deduplicated = this.deduplicateResults(allResults);

    // Score and rank
    const ranked = this.rankResults(deduplicated, query);

    // Limit to max results
    const final = ranked.slice(0, this.maxResults);

    const duration = Date.now() - startTime;
    console.log(`[SearchOrchestrator] Search complete: ${final.length} results in ${duration}ms`);

    return {
      results: final,
      stats: {
        totalSources: allResults.length,
        afterDeduplication: deduplicated.length,
        finalResults: final.length,
        duration,
        query
      }
    };
  }

  /**
   * Search using SerpAPI (Google Search)
   */
  async searchSerpAPI(query, options = {}) {
    if (!this.serpApiKey) return [];

    try {
      console.log('[SearchOrchestrator] Searching SerpAPI...');
      
      const params = new URLSearchParams({
        q: query,
        api_key: this.serpApiKey,
        engine: 'google',
        num: options.numResults || 10,
        gl: options.country || 'us',
        hl: options.language || 'en'
      });

      const response = await fetch(`https://serpapi.com/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract organic results
      const results = (data.organic_results || []).map(result => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        source: 'serpapi',
        position: result.position,
        displayedLink: result.displayed_link,
        date: result.date || null
      }));

      console.log(`[SearchOrchestrator] SerpAPI returned ${results.length} results`);
      return results;

    } catch (error) {
      console.error('[SearchOrchestrator] SerpAPI error:', error.message);
      return [];
    }
  }

  /**
   * Search using Tavily (AI-optimized search)
   */
  async searchTavily(query, options = {}) {
    if (!this.tavilyApiKey) return [];

    try {
      console.log('[SearchOrchestrator] Searching Tavily...');

      // Build request body
      const requestBody = {
        api_key: this.tavilyApiKey,
        query: query,
        search_depth: options.searchDepth || 'advanced', // Use 'advanced' for better quality
        max_results: options.maxResults || this.maxResults || 20, // Support higher result counts
        include_answer: true,
        include_raw_content: false,
        include_images: false
      };

      // Add date filtering for recent content (2024-2025)
      if (options.includeRecent !== false) {
        // Tavily doesn't have direct date filtering, but we can add time keywords to query
        requestBody.query = query + ' 2024 OR 2025';
      }

      // Add domain filtering if specified
      if (options.includeDomains && options.includeDomains.length > 0) {
        requestBody.include_domains = options.includeDomains;
      }

      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Tavily error: ${response.status}`);
      }

      const data = await response.json();

      // Store the AI-generated answer separately
      const aiAnswer = data.answer || null;

      // Extract results
      const results = (data.results || []).map((result, index) => ({
        title: result.title,
        url: result.url,
        snippet: result.content,
        source: 'tavily',
        position: index + 1,
        score: result.score || 0,
        publishedDate: result.published_date || null
      }));

      console.log(`[SearchOrchestrator] Tavily returned ${results.length} results`);
      
      // Return both results and AI answer
      return results.map(r => ({ ...r, aiAnswer: aiAnswer }));

    } catch (error) {
      console.error('[SearchOrchestrator] Tavily error:', error.message);
      return [];
    }
  }

  /**
   * Deduplicate results by URL
   */
  deduplicateResults(results) {
    const seen = new Map();

    for (const result of results) {
      const normalizedUrl = this.normalizeUrl(result.url);
      
      if (!seen.has(normalizedUrl)) {
        seen.set(normalizedUrl, result);
      } else {
        // If duplicate, merge data (prefer higher scores)
        const existing = seen.get(normalizedUrl);
        if ((result.score || 0) > (existing.score || 0)) {
          // Keep result with higher score, but track sources
          result.sources = [existing.source, result.source];
          seen.set(normalizedUrl, result);
        } else {
          existing.sources = existing.sources || [existing.source];
          if (!existing.sources.includes(result.source)) {
            existing.sources.push(result.source);
          }
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Normalize URL for comparison
   */
  normalizeUrl(url) {
    try {
      const parsed = new URL(url);
      // Remove www, trailing slashes, common tracking params
      let normalized = parsed.hostname.replace(/^www\./, '') + parsed.pathname;
      normalized = normalized.replace(/\/$/, '');
      return normalized.toLowerCase();
    } catch (error) {
      return url.toLowerCase();
    }
  }

  /**
   * Rank results by relevance
   */
  rankResults(results, query) {
    const queryTerms = query.toLowerCase().split(/\s+/);

    return results.map(result => {
      let score = 0;

      // Base score from Tavily if available
      if (result.score) {
        score += result.score * 10;
      }

      // Position bonus (earlier = better)
      if (result.position) {
        score += Math.max(0, 10 - result.position);
      }

      // Title relevance
      const titleLower = (result.title || '').toLowerCase();
      queryTerms.forEach(term => {
        if (titleLower.includes(term)) score += 5;
      });

      // Snippet relevance
      const snippetLower = (result.snippet || '').toLowerCase();
      queryTerms.forEach(term => {
        if (snippetLower.includes(term)) score += 2;
      });

      // Multiple source bonus
      if (result.sources && result.sources.length > 1) {
        score += 3;
      }

      // Recency bonus (if date available)
      if (result.date || result.publishedDate) {
        const dateStr = result.date || result.publishedDate;
        const date = new Date(dateStr);
        const daysSince = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 30) score += 5;
        else if (daysSince < 90) score += 3;
        else if (daysSince < 365) score += 1;
      }

      return { ...result, relevanceScore: score };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Search using Azure Bing Web Search API
   * https://learn.microsoft.com/en-us/bing/search-apis/bing-web-search/overview
   */
  async searchAzureBing(query, options = {}) {
    if (!this.azureBingKey) return [];

    try {
      console.log('[SearchOrchestrator] Searching Azure Bing...');
      
      const params = new URLSearchParams({
        q: query,
        count: options.numResults || 20,
        offset: options.offset || 0,
        mkt: options.market || 'en-US',
        safeSearch: options.safeSearch || 'Moderate',
        freshness: options.freshness || 'Month' // Day, Week, Month for recent content
      });

      const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?${params}`, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.azureBingKey
        }
      });

      if (!response.ok) {
        throw new Error(`Azure Bing error: ${response.status}`);
      }

      const data = await response.json();

      const results = (data.webPages?.value || []).map((result, index) => ({
        title: result.name,
        url: result.url,
        snippet: result.snippet,
        source: 'azure-bing',
        position: index + 1,
        displayedLink: result.displayUrl,
        date: result.dateLastCrawled || null
      }));

      console.log(`[SearchOrchestrator] Azure Bing returned ${results.length} results`);
      return results;

    } catch (error) {
      console.error('[SearchOrchestrator] Azure Bing error:', error.message);
      return [];
    }
  }

  /**
   * Search using Semantic Scholar API (Academic Papers)
   * FREE API - no key required for basic usage
   * https://api.semanticscholar.org/
   */
  async searchSemanticScholar(query, options = {}) {
    try {
      console.log('[SearchOrchestrator] Searching Semantic Scholar...');
      
      const params = new URLSearchParams({
        query: query,
        limit: Math.min(options.numResults || 10, 100),
        fields: 'paperId,title,abstract,url,year,authors,citationCount,publicationDate,venue'
      });

      const headers = {};
      if (this.semanticScholarKey) {
        headers['x-api-key'] = this.semanticScholarKey;
      }

      const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?${params}`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`Semantic Scholar error: ${response.status}`);
      }

      const data = await response.json();

      const results = (data.data || []).map(paper => ({
        title: paper.title,
        url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
        snippet: paper.abstract || 'No abstract available',
        source: 'semantic-scholar',
        type: 'academic-paper',
        citations: paper.citationCount,
        year: paper.year,
        venue: paper.venue,
        authors: paper.authors?.map(a => a.name).join(', ') || 'Unknown',
        publishedDate: paper.publicationDate
      }));

      console.log(`[SearchOrchestrator] Semantic Scholar returned ${results.length} papers`);
      return results;

    } catch (error) {
      console.error('[SearchOrchestrator] Semantic Scholar error:', error.message);
      return [];
    }
  }

  /**
   * Search using arXiv API (Scientific Preprints)
   * FREE - no key required
   * http://arxiv.org/help/api/
   */
  async searchArXiv(query, options = {}) {
    try {
      console.log('[SearchOrchestrator] Searching arXiv...');
      
      const params = new URLSearchParams({
        search_query: `all:${query}`,
        start: options.offset || 0,
        max_results: options.numResults || 10,
        sortBy: options.sortBy || 'relevance',
        sortOrder: 'descending'
      });

      const response = await fetch(`http://export.arxiv.org/api/query?${params}`);

      if (!response.ok) {
        throw new Error(`arXiv error: ${response.status}`);
      }

      const xmlText = await response.text();
      
      // Parse XML (simple regex-based parsing for basic fields)
      const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
      
      const results = entries.map(entry => {
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1]?.trim();
        const summary = entry.match(/<summary>(.*?)<\/summary>/)?.[1]?.trim().replace(/\s+/g, ' ');
        const id = entry.match(/<id>(.*?)<\/id>/)?.[1]?.trim();
        const published = entry.match(/<published>(.*?)<\/published>/)?.[1]?.trim();
        const authors = (entry.match(/<author>[\s\S]*?<name>(.*?)<\/name>/g) || [])
          .map(a => a.match(/<name>(.*?)<\/name>/)?.[1]).join(', ');

        return {
          title,
          url: id,
          snippet: summary,
          source: 'arxiv',
          type: 'scientific-preprint',
          authors,
          publishedDate: published
        };
      }).filter(r => r.title); // Filter out failed parses

      console.log(`[SearchOrchestrator] arXiv returned ${results.length} preprints`);
      return results;

    } catch (error) {
      console.error('[SearchOrchestrator] arXiv error:', error.message);
      return [];
    }
  }

  /**
   * Search using CrossRef API (Scholarly Citations)
   * Requires polite pool access (add email to .env as CROSSREF_EMAIL)
   * FREE API
   * https://www.crossref.org/documentation/retrieve-metadata/rest-api/
   */
  async searchCrossRef(query, options = {}) {
    if (!this.crossRefEmail) return [];

    try {
      console.log('[SearchOrchestrator] Searching CrossRef...');
      
      const params = new URLSearchParams({
        query: query,
        rows: options.numResults || 10,
        mailto: this.crossRefEmail // Polite pool access
      });

      const response = await fetch(`https://api.crossref.org/works?${params}`);

      if (!response.ok) {
        throw new Error(`CrossRef error: ${response.status}`);
      }

      const data = await response.json();

      const results = (data.message?.items || []).map(item => ({
        title: item.title?.[0] || 'Untitled',
        url: item.URL || item.DOI ? `https://doi.org/${item.DOI}` : null,
        snippet: item.abstract || item.subtitle?.[0] || 'No abstract available',
        source: 'crossref',
        type: 'scholarly-article',
        doi: item.DOI,
        publishedDate: item.created?.['date-time'],
        citations: item['is-referenced-by-count'],
        publisher: item.publisher,
        authors: item.author?.map(a => `${a.given} ${a.family}`).join(', ')
      })).filter(r => r.url); // Only include items with accessible URLs

      console.log(`[SearchOrchestrator] CrossRef returned ${results.length} articles`);
      return results;

    } catch (error) {
      console.error('[SearchOrchestrator] CrossRef error:', error.message);
      return [];
    }
  }

  /**
   * Get search statistics
   */
  getStats() {
    return {
      serpApiConfigured: !!this.serpApiKey,
      tavilyConfigured: !!this.tavilyApiKey,
      azureBingConfigured: !!this.azureBingKey,
      academicSearchAvailable: true,
      maxResults: this.maxResults
    };
  }
}

// Export for CommonJS (Netlify Functions)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SearchOrchestrator };
}
