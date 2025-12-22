// Phase 10: Memory Search Serverless Function
// Handles semantic search across saved memories using hybrid vector + full-text search

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize Supabase client
let supabase;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Generate embedding for search query
 */
async function generateQueryEmbedding(query) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: query,
      encoding_format: 'float'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

exports.handler = async (event) => {
  console.log('[Memory Search] Request received');
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Validate configuration
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const {
      query,
      userId,
      filters = {},
      limit = 20,
      similarityThreshold = 0.7
    } = body;

    console.log('[Memory Search] Query:', query);
    console.log('[Memory Search] User ID:', userId);
    console.log('[Memory Search] Filters:', filters);

    // Validate required fields
    if (!query || query.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Query text is required'
        })
      };
    }

    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'User ID is required'
        })
      };
    }

    // Generate embedding for search query
    console.log('[Memory Search] Generating query embedding...');
    const queryEmbedding = await generateQueryEmbedding(query);
    console.log('[Memory Search] Embedding generated (1536 dimensions)');

    // Call the search_memories database function
    console.log('[Memory Search] Executing hybrid search...');
    
    const { data: searchResults, error: searchError } = await supabase
      .rpc('search_memories', {
        query_embedding: queryEmbedding,
        query_text: query,
        user_uuid: userId,
        similarity_threshold: similarityThreshold,
        result_limit: limit
      });

    if (searchError) {
      console.error('[Memory Search] Database error:', searchError);
      throw new Error(`Search failed: ${searchError.message}`);
    }

    console.log(`[Memory Search] Found ${searchResults.length} results`);

    // Apply additional filters if provided
    let filteredResults = searchResults;
    
    if (filters.contentType && filters.contentType.length > 0) {
      filteredResults = filteredResults.filter(r => 
        filters.contentType.includes(r.content_type)
      );
      console.log(`[Memory Search] Filtered by content type: ${filteredResults.length} results`);
    }

    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filteredResults = filteredResults.filter(r => 
        new Date(r.created_at) >= dateFrom
      );
      console.log(`[Memory Search] Filtered by date from: ${filteredResults.length} results`);
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      filteredResults = filteredResults.filter(r => 
        new Date(r.created_at) <= dateTo
      );
      console.log(`[Memory Search] Filtered by date to: ${filteredResults.length} results`);
    }

    // Fetch tags for each result
    for (const result of filteredResults) {
      const { data: tags } = await supabase
        .from('memory_entry_tags')
        .select('tag_id, memory_tags(tag_name, color)')
        .eq('memory_id', result.id);

      result.tags = tags ? tags.map(t => ({
        name: t.memory_tags.tag_name,
        color: t.memory_tags.color
      })) : [];
    }

    // Return results
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        results: filteredResults,
        total: filteredResults.length,
        query: query,
        filters: filters,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('[Memory Search] Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Memory search failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
