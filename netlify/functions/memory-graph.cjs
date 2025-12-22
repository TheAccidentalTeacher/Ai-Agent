/**
 * Phase 10 Week 3 Day 8: Knowledge Graph Data API
 * Fetches memories and connections in D3-compatible format
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client (deferred to avoid startup errors)
let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

exports.handler = async (event) => {
  console.log('🔗 [Memory Graph] Request received');
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Handle preflight
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
    // Parse request
    const { userId, filters } = JSON.parse(event.body || '{}');
    
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId is required' })
      };
    }
    
    console.log(`[Memory Graph] Fetching graph for user: ${userId}`);
    console.log(`[Memory Graph] Filters:`, filters);
    
    // Build query for memories
    let memoriesQuery = supabase
      .from('user_memories')
      .select('id, content, content_type, tags, created_at, metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters) {
      if (filters.contentType && filters.contentType !== 'all') {
        memoriesQuery = memoriesQuery.eq('content_type', filters.contentType);
      }
      
      if (filters.dateFrom) {
        memoriesQuery = memoriesQuery.gte('created_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        memoriesQuery = memoriesQuery.lte('created_at', filters.dateTo);
      }
    }
    
    // Limit to last 100 memories for performance
    memoriesQuery = memoriesQuery.limit(100);
    
    // Fetch memories
    const { data: memories, error: memoriesError } = await memoriesQuery;
    
    if (memoriesError) {
      console.error('[Memory Graph] Error fetching memories:', memoriesError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch memories', details: memoriesError.message })
      };
    }
    
    console.log(`[Memory Graph] Found ${memories.length} memories`);
    
    // Convert memories to D3 nodes
    const nodes = memories.map(memory => {
      // Extract title from content (first 50 chars)
      const title = memory.content.substring(0, 50) + (memory.content.length > 50 ? '...' : '');
      
      // Determine node color based on content type
      const colorMap = {
        'research': '#3b82f6',      // Blue
        'video': '#ef4444',          // Red
        'creative': '#a855f7',       // Purple
        'conversation': '#10b981',   // Green
        'panel': '#10b981',          // Green
        'consensus': '#10b981',      // Green
        'debate': '#10b981',         // Green
        'code': '#f59e0b',           // Orange
        'settings': '#6b7280',       // Gray
        'manual': '#6b7280'          // Gray
      };
      
      const color = colorMap[memory.content_type] || '#6b7280';
      
      return {
        id: memory.id,
        label: title,
        fullContent: memory.content,
        type: memory.content_type,
        tags: memory.tags || [],
        color: color,
        createdAt: memory.created_at,
        size: 10, // Base size, can be adjusted based on connections
        metadata: memory.metadata
      };
    });
    
    // TODO: Fetch connections from memory_connections table (Day 11-12)
    // For now, return empty links array
    const links = [];
    
    // Calculate simple semantic connections based on shared tags (temporary)
    if (memories.length > 1) {
      for (let i = 0; i < memories.length - 1; i++) {
        for (let j = i + 1; j < memories.length; j++) {
          const memory1 = memories[i];
          const memory2 = memories[j];
          
          // Check for shared tags
          const tags1 = memory1.tags || [];
          const tags2 = memory2.tags || [];
          const sharedTags = tags1.filter(tag => tags2.includes(tag));
          
          if (sharedTags.length > 0) {
            // Create connection based on shared tags
            const strength = sharedTags.length / Math.max(tags1.length, tags2.length);
            
            links.push({
              source: memory1.id,
              target: memory2.id,
              strength: strength,
              type: 'tag',
              sharedTags: sharedTags
            });
          }
        }
      }
    }
    
    console.log(`[Memory Graph] Generated ${nodes.length} nodes and ${links.length} links`);
    
    // Return D3-compatible graph data
    const graphData = {
      nodes: nodes,
      links: links,
      stats: {
        totalMemories: memories.length,
        totalConnections: links.length,
        contentTypes: nodes.reduce((acc, node) => {
          acc[node.type] = (acc[node.type] || 0) + 1;
          return acc;
        }, {}),
        averageConnections: nodes.length > 0 ? (links.length * 2 / nodes.length).toFixed(2) : 0
      }
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(graphData)
    };
    
  } catch (error) {
    console.error('[Memory Graph] ❌ Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
