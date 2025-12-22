// Phase 10: Memory Save Serverless Function
// Saves content to memory with automatic embedding generation and tagging

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Initialize Supabase client
let supabase;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Generate embedding for content
 */
async function generateEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
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

/**
 * Auto-generate tags using Claude
 */
async function generateTags(title, content) {
  if (!ANTHROPIC_API_KEY) {
    return [];
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Generate 3-5 relevant tags for this content. Return ONLY the tags as a comma-separated list, nothing else.

Title: ${title}

Content: ${content.substring(0, 1000)}...`
        }]
      })
    });

    if (!response.ok) {
      console.error('[Memory Save] Tag generation failed:', response.statusText);
      return [];
    }

    const data = await response.json();
    const tagsText = data.content[0].text.trim();
    const tags = tagsText.split(',').map(t => t.trim().toLowerCase());
    
    console.log('[Memory Save] Auto-generated tags:', tags);
    return tags;
    
  } catch (error) {
    console.error('[Memory Save] Tag generation error:', error);
    return [];
  }
}

/**
 * Create or get existing tags
 */
async function ensureTags(userId, tagNames) {
  const tagIds = [];

  for (const tagName of tagNames) {
    // Try to get existing tag
    const { data: existingTag } = await supabase
      .from('memory_tags')
      .select('id')
      .eq('user_id', userId)
      .eq('tag_name', tagName)
      .single();

    if (existingTag) {
      tagIds.push(existingTag.id);
    } else {
      // Create new tag
      const { data: newTag, error } = await supabase
        .from('memory_tags')
        .insert({
          user_id: userId,
          tag_name: tagName
        })
        .select()
        .single();

      if (error) {
        console.error(`[Memory Save] Failed to create tag "${tagName}":`, error.message);
        continue;
      }

      tagIds.push(newTag.id);
    }
  }

  return tagIds;
}

exports.handler = async (event) => {
  console.log('[Memory Save] Request received');
  
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
      userId,
      contentType,
      title,
      content,
      metadata = {},
      sourceUrl = null,
      tags = [],
      autoGenerateTags = true
    } = body;

    console.log('[Memory Save] Title:', title);
    console.log('[Memory Save] Content type:', contentType);
    console.log('[Memory Save] User ID:', userId);
    console.log('[Memory Save] Content length:', content?.length || 0);

    // Validate required fields
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

    if (!contentType || !['research', 'video', 'creative', 'conversation', 'manual'].includes(contentType)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Invalid content type'
        })
      };
    }

    if (!title || !content) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Title and content are required'
        })
      };
    }

    // Generate embedding
    console.log('[Memory Save] Generating embedding...');
    const embedding = await generateEmbedding(content);
    console.log('[Memory Save] Embedding generated (1536 dimensions)');

    // Calculate cost estimate
    const tokens = Math.ceil(content.length / 4);
    const cost = (tokens / 1000) * 0.0001;
    console.log(`[Memory Save] Estimated cost: $${cost.toFixed(6)} (${tokens} tokens)`);

    // Insert memory entry
    console.log('[Memory Save] Saving to database...');
    const { data: memory, error: memoryError } = await supabase
      .from('memory_entries')
      .insert({
        user_id: userId,
        content_type: contentType,
        title,
        content,
        embedding,
        metadata,
        source_url: sourceUrl
      })
      .select()
      .single();

    if (memoryError) {
      console.error('[Memory Save] Database error:', memoryError);
      throw new Error(`Failed to save memory: ${memoryError.message}`);
    }

    console.log(`[Memory Save] Memory saved: ${memory.id}`);

    // Handle tags
    let allTags = [...tags];
    
    // Auto-generate tags if enabled
    if (autoGenerateTags && ANTHROPIC_API_KEY) {
      console.log('[Memory Save] Auto-generating tags...');
      const generatedTags = await generateTags(title, content);
      allTags = [...new Set([...allTags, ...generatedTags])]; // Deduplicate
    }

    // Create/link tags
    if (allTags.length > 0) {
      console.log(`[Memory Save] Processing ${allTags.length} tags...`);
      const tagIds = await ensureTags(userId, allTags);
      
      if (tagIds.length > 0) {
        const { error: tagError } = await supabase
          .from('memory_entry_tags')
          .insert(
            tagIds.map(tagId => ({
              memory_id: memory.id,
              tag_id: tagId
            }))
          );

        if (tagError) {
          console.error('[Memory Save] Failed to link tags:', tagError.message);
        } else {
          console.log(`[Memory Save] Linked ${tagIds.length} tags`);
        }
      }
    }

    // Return success
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        memory: {
          id: memory.id,
          title: memory.title,
          contentType: memory.content_type,
          createdAt: memory.created_at
        },
        tags: allTags,
        cost: {
          tokens,
          amount: cost,
          display: `$${cost.toFixed(6)}`
        },
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('[Memory Save] Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Memory save failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
