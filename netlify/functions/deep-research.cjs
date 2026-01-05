/**
 * Deep Research with Multi-Agent Analysis
 * 
 * This is what you ACTUALLY wanted - not just search aggregation,
 * but hours-long, AI-powered, multi-agent collaborative research.
 * 
 * WORKFLOW:
 * 1. Multi-source search (Google, Bing, Scholar, arXiv, Semantic Scholar)
 * 2. Extract and chunk content
 * 3. AI Consortium analyzes from 12 expert perspectives
 * 4. Synthesis by Writer persona
 * 5. Generate comprehensive report with citations
 * 
 * Expected Duration: 5-30 minutes (not 10 seconds!)
 */

const { SearchOrchestrator } = require('../../research/search-orchestrator.cjs');
const { ContentExtractor } = require('../../research/content-extractor.cjs');
const ResearchAnalyzer = require('../../research/research-analyzer.cjs');

exports.handler = async (event, context) => {
  const startTime = Date.now();

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { query, options = {} } = JSON.parse(event.body);

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query is required' })
      };
    }

    console.log(`[DeepResearch] Starting deep research for: "${query}"`);
    console.log(`[DeepResearch] Options:`, options);

    // ========================================================================
    // PHASE 1: MULTI-SOURCE SEARCH (1-2 minutes)
    // ========================================================================
    console.log('[DeepResearch] Phase 1: Multi-source search...');
    const searchStartTime = Date.now();

    const orchestrator = new SearchOrchestrator({
      serpApiKey: process.env.SERPAPI_KEY,
      tavilyApiKey: process.env.TAVILY_API_KEY,
      azureBingKey: process.env.AZURE_BING_SEARCH_KEY,
      semanticScholarKey: process.env.SEMANTIC_SCHOLAR_KEY,
      crossRefEmail: process.env.CROSSREF_EMAIL,
      maxResults: options.maxResults || 30 // More results for deep research
    });

    const searchOptions = {
      maxResults: options.maxResults || 30,
      searchDepth: 'advanced',
      includeAcademic: options.includeAcademic !== false, // Enable academic search
      decomposeQuery: options.decomposeQuery !== false,
      freshness: 'Month' // For Bing - recent content
    };

    const searchResponse = await orchestrator.search(query, searchOptions);
    const searchResults = searchResponse.results;
    
    const searchDuration = Date.now() - searchStartTime;
    console.log(`[DeepResearch] Phase 1 complete: ${searchResults.length} results in ${searchDuration}ms`);

    if (searchResults.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          query,
          results: [],
          analysis: null,
          message: 'No search results found',
          stats: { duration: Date.now() - startTime }
        })
      };
    }

    // ========================================================================
    // PHASE 2: CONTENT EXTRACTION (2-5 minutes)
    // ========================================================================
    console.log('[DeepResearch] Phase 2: Extracting content from top results...');
    const extractStartTime = Date.now();

    const extractor = new ContentExtractor({
      maxUrls: options.extractCount || 10, // Extract more URLs for deep research
      timeout: 20000, // 20s per URL
      chunkSize: 4000,
      overlap: 200
    });

    const extractedContent = await extractor.extractFromResults(searchResults);
    const chunks = extractor.chunkContent(extractedContent, {
      maxChunks: options.maxChunks || 50 // More chunks for comprehensive analysis
    });

    const extractDuration = Date.now() - extractStartTime;
    console.log(`[DeepResearch] Phase 2 complete: ${extractedContent.length} URLs, ${chunks.length} chunks in ${extractDuration}ms`);

    // ========================================================================
    // PHASE 3: MULTI-AGENT CONSORTIUM ANALYSIS (10-25 minutes!)
    // ========================================================================
    console.log('[DeepResearch] Phase 3: Consortium analysis (this will take 10-25 minutes)...');
    const analysisStartTime = Date.now();

    const analyzer = new ResearchAnalyzer(
      process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
      options.model || 'claude-sonnet-4-5-20250929'
    );

    // Select personas for analysis
    const selectedPersonas = options.personas || [
      'master-teacher',
      'classical-educator',
      'strategist',
      'theologian',
      'technical-architect',
      'debugger',
      'writer',
      'analyst'
    ];

    console.log(`[DeepResearch] Analyzing with ${selectedPersonas.length} Consortium members...`);

    const analysisResult = await analyzer.analyze(
      query,
      extractedContent,
      chunks,
      selectedPersonas
    );

    const analysisDuration = Date.now() - analysisStartTime;
    console.log(`[DeepResearch] Phase 3 complete: ${analysisResult.analyses.length} analyses in ${analysisDuration}ms`);

    // ========================================================================
    // PHASE 4: SYNTHESIS & REPORT GENERATION
    // ========================================================================
    console.log('[DeepResearch] Phase 4: Generating comprehensive report...');

    const totalDuration = Date.now() - startTime;

    const report = {
      query,
      timestamp: new Date().toISOString(),
      
      // Search Results
      searchResults: {
        count: searchResults.length,
        sources: [...new Set(searchResults.map(r => r.source))],
        results: searchResults.slice(0, 20) // Top 20 for report
      },

      // Content Analysis
      contentAnalysis: {
        urlsExtracted: extractedContent.length,
        totalChunks: chunks.length,
        topSources: extractedContent.slice(0, 10).map(c => ({
          url: c.url,
          title: c.title,
          contentLength: c.content?.length || 0
        }))
      },

      // Consortium Analysis
      consortiumAnalysis: {
        personasInvolved: analysisResult.analyses.length,
        analyses: analysisResult.analyses,
        synthesis: analysisResult.synthesis || null,
        insights: extractKeyInsights(analysisResult.analyses)
      },

      // Performance Stats
      stats: {
        totalDuration,
        searchDuration,
        extractDuration,
        analysisDuration,
        phases: {
          'Phase 1: Multi-Source Search': `${searchDuration}ms`,
          'Phase 2: Content Extraction': `${extractDuration}ms`,
          'Phase 3: Consortium Analysis': `${analysisDuration}ms`,
          'Phase 4: Report Generation': `${Date.now() - startTime - analysisDuration}ms`
        }
      },

      // Metadata
      metadata: {
        researchType: 'deep-multi-agent',
        includesAcademicSources: searchOptions.includeAcademic,
        aiModel: options.model || 'claude-sonnet-4-5-20250929',
        completedAt: new Date().toISOString()
      }
    };

    console.log(`[DeepResearch] ✨ COMPLETE: Total duration ${totalDuration}ms (${Math.round(totalDuration / 1000 / 60)} minutes)`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(report)
    };

  } catch (error) {
    console.error('[DeepResearch] Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Deep research failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

/**
 * Extract key insights from consortium analyses
 */
function extractKeyInsights(analyses) {
  const insights = {
    strengths: [],
    concerns: [],
    opportunities: [],
    recommendations: []
  };

  for (const analysis of analyses) {
    const text = analysis.analysis || '';
    
    // Simple keyword extraction (could be enhanced with NLP)
    if (text.match(/strength|advantage|benefit|positive/i)) {
      insights.strengths.push({
        persona: analysis.name,
        focus: analysis.focus
      });
    }
    
    if (text.match(/concern|risk|problem|limitation/i)) {
      insights.concerns.push({
        persona: analysis.name,
        focus: analysis.focus
      });
    }
    
    if (text.match(/opportunity|potential|could|might/i)) {
      insights.opportunities.push({
        persona: analysis.name,
        focus: analysis.focus
      });
    }
    
    if (text.match(/recommend|suggest|should|propose/i)) {
      insights.recommendations.push({
        persona: analysis.name,
        focus: analysis.focus
      });
    }
  }

  return insights;
}
