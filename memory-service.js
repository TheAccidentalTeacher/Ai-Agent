// Phase 10: Memory & Knowledge Management
// Embedding Service - OpenAI text-embedding-ada-002 integration

import { createClient } from '@supabase/supabase-js';

// ========================================
// CONFIGURATION
// ========================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_DIMENSIONS = 1536;
const MAX_TOKENS_PER_CHUNK = 8000; // OpenAI limit is ~8192 tokens
const COST_PER_1K_TOKENS = 0.0001; // $0.0001 per 1K tokens

// Initialize Supabase client
let supabase;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ========================================
// TOKEN ESTIMATION
// ========================================

/**
 * Rough token estimation (1 token ≈ 4 characters)
 * More accurate than character count, less expensive than actual tokenization
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Calculate estimated cost for embedding generation
 */
function estimateCost(text) {
  const tokens = estimateTokens(text);
  const cost = (tokens / 1000) * COST_PER_1K_TOKENS;
  return {
    tokens,
    cost: cost.toFixed(6),
    costDisplay: `$${cost.toFixed(6)}`
  };
}

// ========================================
// CONTENT CHUNKING
// ========================================

/**
 * Split large text into chunks that fit within token limits
 * Tries to split at sentence boundaries to preserve context
 */
function chunkContent(text, maxTokens = MAX_TOKENS_PER_CHUNK) {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const estimatedTokens = estimateTokens(text);
  
  // If text fits in one chunk, return as-is
  if (estimatedTokens <= maxTokens) {
    return [text];
  }

  // Split into chunks at sentence boundaries
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = '';
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);
    
    // If single sentence exceeds limit, split by words
    if (sentenceTokens > maxTokens) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }
      
      const words = sentence.split(/\s+/);
      let wordChunk = '';
      let wordTokens = 0;
      
      for (const word of words) {
        const wordToken = estimateTokens(word);
        if (wordTokens + wordToken > maxTokens) {
          chunks.push(wordChunk.trim());
          wordChunk = word + ' ';
          wordTokens = wordToken;
        } else {
          wordChunk += word + ' ';
          wordTokens += wordToken;
        }
      }
      
      if (wordChunk) {
        chunks.push(wordChunk.trim());
      }
      continue;
    }

    // Add sentence to current chunk if it fits
    if (currentTokens + sentenceTokens <= maxTokens) {
      currentChunk += sentence + ' ';
      currentTokens += sentenceTokens;
    } else {
      // Save current chunk and start new one
      chunks.push(currentChunk.trim());
      currentChunk = sentence + ' ';
      currentTokens = sentenceTokens;
    }
  }

  // Add remaining content
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// ========================================
// EMBEDDING GENERATION
// ========================================

/**
 * Generate embedding for a single text string using OpenAI
 * Returns array of 1536 floats
 */
async function generateEmbedding(text, retries = 3) {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text');
  }

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const tokens = estimateTokens(text);
  if (tokens > MAX_TOKENS_PER_CHUNK) {
    throw new Error(`Text too long (${tokens} tokens). Use chunkContent() first or pass smaller text.`);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: text,
          encoding_format: 'float'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data[0] || !data.data[0].embedding) {
        throw new Error('Invalid response from OpenAI API');
      }

      const embedding = data.data[0].embedding;
      
      // Validate embedding dimensions
      if (embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(`Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`);
      }

      return embedding;

    } catch (error) {
      console.error(`[Memory Service] Embedding generation attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * Returns array of embedding vectors
 */
async function batchGenerateEmbeddings(texts, maxBatchSize = 100) {
  if (!texts || texts.length === 0) {
    return [];
  }

  // Filter out empty texts
  const validTexts = texts.filter(t => t && t.trim().length > 0);
  
  if (validTexts.length === 0) {
    return [];
  }

  // Process in batches to avoid rate limits
  const embeddings = [];
  
  for (let i = 0; i < validTexts.length; i += maxBatchSize) {
    const batch = validTexts.slice(i, i + maxBatchSize);
    
    console.log(`[Memory Service] Processing batch ${Math.floor(i / maxBatchSize) + 1}/${Math.ceil(validTexts.length / maxBatchSize)} (${batch.length} texts)`);
    
    const batchEmbeddings = await Promise.all(
      batch.map(text => generateEmbedding(text))
    );
    
    embeddings.push(...batchEmbeddings);
  }

  return embeddings;
}

// ========================================
// MEMORY STORAGE
// ========================================

/**
 * Save a memory entry to Supabase with embedding
 */
async function saveMemory({
  userId,
  contentType, // 'research', 'video', 'creative', 'conversation', 'manual'
  title,
  content,
  metadata = {},
  sourceUrl = null,
  tags = [] // Array of tag names
}) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  if (!userId) {
    throw new Error('userId is required');
  }

  if (!contentType || !['research', 'video', 'creative', 'conversation', 'manual'].includes(contentType)) {
    throw new Error('Invalid contentType');
  }

  if (!title || !content) {
    throw new Error('title and content are required');
  }

  console.log(`[Memory Service] Saving memory: "${title}"`);
  console.log(`[Memory Service] Content length: ${content.length} chars`);

  // Generate embedding for content
  const embedding = await generateEmbedding(content);
  const cost = estimateCost(content);
  
  console.log(`[Memory Service] Embedding generated: ${EMBEDDING_DIMENSIONS} dimensions`);
  console.log(`[Memory Service] Estimated cost: ${cost.costDisplay} (${cost.tokens} tokens)`);

  // Insert memory entry
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
    throw new Error(`Failed to save memory: ${memoryError.message}`);
  }

  console.log(`[Memory Service] Memory saved: ${memory.id}`);

  // Add tags if provided
  if (tags && tags.length > 0) {
    await addTagsToMemory(userId, memory.id, tags);
  }

  return {
    memory,
    cost
  };
}

/**
 * Add tags to a memory entry
 */
async function addTagsToMemory(userId, memoryId, tagNames) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const tagIds = [];

  // Create or get existing tags
  for (const tagName of tagNames) {
    // Try to get existing tag
    let { data: existingTag } = await supabase
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
        console.error(`[Memory Service] Failed to create tag "${tagName}":`, error.message);
        continue;
      }

      tagIds.push(newTag.id);
    }
  }

  // Link tags to memory
  if (tagIds.length > 0) {
    const { error } = await supabase
      .from('memory_entry_tags')
      .insert(
        tagIds.map(tagId => ({
          memory_id: memoryId,
          tag_id: tagId
        }))
      );

    if (error) {
      console.error('[Memory Service] Failed to link tags:', error.message);
    } else {
      console.log(`[Memory Service] Added ${tagIds.length} tags to memory`);
    }
  }
}

// ========================================
// EXPORTS
// ========================================

export {
  // Token estimation
  estimateTokens,
  estimateCost,
  
  // Content processing
  chunkContent,
  
  // Embedding generation
  generateEmbedding,
  batchGenerateEmbeddings,
  
  // Memory storage
  saveMemory,
  addTagsToMemory,
  
  // Constants
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  MAX_TOKENS_PER_CHUNK
};
