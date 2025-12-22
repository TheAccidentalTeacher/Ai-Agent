/**
 * Local Development Server
 * Mimics Netlify Functions for local testing
 * Serves static files and handles API endpoints
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = 8888;

// Import the chat function handler
const chatFunction = require('./netlify/functions/chat.cjs');

// Import the multi-agent function handler
const multiAgentFunction = require('./netlify/functions/multi-agent.cjs');

// Import the research function handler
const researchFunction = require('./netlify/functions/research.cjs');

// Import the youtube-transcript function handler
const youtubeTranscriptFunction = require('./netlify/functions/youtube-transcript.cjs');

// Import the youtube-search function handler
const youtubeSearchFunction = require('./netlify/functions/youtube-search.cjs');

// Import the video-analyze function handler
const videoAnalyzeFunction = require('./netlify/functions/video-analyze.cjs');

// Phase 8 Week 2: Import content creation tool handlers
const videoQuizFunction = require('./netlify/functions/video-quiz.cjs');
const videoLessonPlanFunction = require('./netlify/functions/video-lesson-plan.cjs');
const videoDiscussionFunction = require('./netlify/functions/video-discussion.cjs');

// Phase 8 Week 3: Import DOK project, vocabulary, guided notes & graphic organizer handlers
const videoDOKProjectFunction = require('./netlify/functions/video-dok-project.cjs');
const videoVocabularyFunction = require('./netlify/functions/video-vocabulary.cjs');
const videoGuidedNotesFunction = require('./netlify/functions/video-guided-notes.cjs');
const videoGraphicOrganizerFunction = require('./netlify/functions/video-graphic-organizer.cjs');

// Phase 8 Week 4: Import batch operation handlers
const videoBatchSummaryFunction = require('./netlify/functions/video-batch-summary.cjs');
const videoBatchQuizFunction = require('./netlify/functions/video-batch-quiz.cjs');
const videoBatchVocabularyFunction = require('./netlify/functions/video-batch-vocabulary.cjs');
const videoBatchStudyGuideFunction = require('./netlify/functions/video-batch-study-guide.cjs');

// Phase 10: Import memory system handlers
const memorySearchFunction = require('./netlify/functions/memory-search.cjs');
const memorySaveFunction = require('./netlify/functions/memory-save.cjs');
const memoryGraphFunction = require('./netlify/functions/memory-graph.cjs');

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

console.log('\n' + '='.repeat(80));
console.log('🚀 Starting Local Development Server');
console.log('='.repeat(80));
console.log('[Server] Port:', PORT);
console.log('[Server] Environment variables loaded:', Object.keys(process.env).filter(k => k.includes('API')).length, 'API keys');
console.log('[Server] ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✓ Loaded' : '❌ Missing');
console.log('='.repeat(80) + '\n');

const server = http.createServer(async (req, res) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  console.log(`\n📨 [${requestId}] ${req.method} ${req.url}`);
  console.log(`[${requestId}] Headers:`, JSON.stringify(req.headers, null, 2));

  // Handle API endpoints (Netlify Functions)
  if (req.url.startsWith('/.netlify/functions/') || req.url.startsWith('/api/')) {
    console.log(`[${requestId}] 🔧 API endpoint detected`);
    
    // Extract function name
    const functionPath = req.url.replace('/.netlify/functions/', '').replace('/api/', '').split('?')[0];
    console.log(`[${requestId}] Function path:`, functionPath);
    
    if (functionPath === 'chat') {
      console.log(`[${requestId}] 💬 Routing to chat function`);
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
        console.log(`[${requestId}] Received ${chunk.length} bytes`);
      });
      
      req.on('end', async () => {
        console.log(`[${requestId}] ✓ Request body complete (${body.length} bytes)`);
        
        try {
          // Create Netlify-compatible event object
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url,
            queryStringParameters: {}
          };
          
          const context = {};
          
          console.log(`[${requestId}] 📤 Calling chat function handler...`);
          const result = await chatFunction.handler(event, context);
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Function completed in ${duration}ms`);
          console.log(`[${requestId}] Status:`, result.statusCode);
          console.log(`[${requestId}] Response body length:`, result.body?.length || 0);
          
          // Send response
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
          
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Function error after ${duration}ms:`, error);
          console.error(`[${requestId}] Error stack:`, error.stack);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message,
            requestId: requestId
          }));
        }
      });
      
      return;
    }

    // Multi-Agent endpoint
    if (functionPath === 'multi-agent') {
      console.log(`[${requestId}] 🤖 Routing to multi-agent function`);
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
        console.log(`[${requestId}] Received ${chunk.length} bytes`);
      });
      
      req.on('end', async () => {
        console.log(`[${requestId}] ✓ Request body complete (${body.length} bytes)`);
        
        try {
          // Create Netlify-compatible event object
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url,
            queryStringParameters: {}
          };
          
          const context = {};
          
          console.log(`[${requestId}] 📤 Calling multi-agent function handler...`);
          const result = await multiAgentFunction.handler(event, context);
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Function completed in ${duration}ms`);
          console.log(`[${requestId}] Status:`, result.statusCode);
          console.log(`[${requestId}] Response body length:`, result.body?.length || 0);
          
          // Send response
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
          
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Function error after ${duration}ms:`, error);
          console.error(`[${requestId}] Error stack:`, error.stack);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message,
            requestId: requestId
          }));
        }
      });
      
      return;
    }

    // YouTube Transcript endpoint
    if (functionPath === 'youtube-transcript') {
      console.log(`[${requestId}] 📹 Routing to youtube-transcript function`);
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url,
            queryStringParameters: {}
          };
          
          const context = {};
          
          console.log(`[${requestId}] 📤 Calling youtube-transcript function handler...`);
          const result = await youtubeTranscriptFunction.handler(event, context);
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Function completed in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
          
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Function error after ${duration}ms:`, error);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message
          }));
        }
      });
      
      return;
    }

    // YouTube Search endpoint
    if (functionPath === 'youtube-search') {
      console.log(`[${requestId}] 🔍 Routing to youtube-search function`);
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url,
            queryStringParameters: {}
          };
          
          const context = {};
          
          console.log(`[${requestId}] 📤 Calling youtube-search function handler...`);
          const result = await youtubeSearchFunction.handler(event, context);
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Function completed in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
          
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Function error after ${duration}ms:`, error);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message
          }));
        }
      });
      
      return;
    }

    // Video Analysis endpoint
    if (functionPath === 'video-analyze') {
      console.log(`[${requestId}] 🎬 Routing to video-analyze function`);
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url,
            queryStringParameters: {}
          };
          
          const context = {};
          
          console.log(`[${requestId}] 📤 Calling video-analyze function handler...`);
          const result = await videoAnalyzeFunction.handler(event, context);
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Function completed in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
          
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Function error after ${duration}ms:`, error);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message
          }));
        }
      });
      
      return;
    }

    // Phase 8 Week 2: Video Quiz endpoint
    if (functionPath === 'video-quiz') {
      console.log(`[${requestId}] 📝 Routing to video-quiz function`);
      
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url,
            queryStringParameters: {}
          };
          
          const result = await videoQuizFunction.handler(event, {});
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Quiz generated in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
        } catch (error) {
          console.error(`[${requestId}] ❌ Quiz error:`, error);
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Quiz generation failed', message: error.message }));
        }
      });
      
      return;
    }

    // Phase 8 Week 2: Video Lesson Plan endpoint
    if (functionPath === 'video-lesson-plan') {
      console.log(`[${requestId}] 📚 Routing to video-lesson-plan function`);
      
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url,
            queryStringParameters: {}
          };
          
          const result = await videoLessonPlanFunction.handler(event, {});
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Lesson plan generated in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
        } catch (error) {
          console.error(`[${requestId}] ❌ Lesson plan error:`, error);
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Lesson plan generation failed', message: error.message }));
        }
      });
      
      return;
    }

    // Phase 8 Week 2: Video Discussion Questions endpoint
    if (functionPath === 'video-discussion') {
      console.log(`[${requestId}] 💬 Routing to video-discussion function`);
      
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url,
            queryStringParameters: {}
          };
          
          const result = await videoDiscussionFunction.handler(event, {});
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Discussion questions generated in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
        } catch (error) {
          console.error(`[${requestId}] ❌ Discussion questions error:`, error);
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Discussion questions generation failed', message: error.message }));
        }
      });
      
      return;
    }

    // Video DOK Project endpoint (Phase 8 Week 3)
    if (functionPath === 'video-dok-project') {
      console.log(`[${requestId}] 🎓 Routing to video-dok-project function`);
      
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url,
            queryStringParameters: {}
          };
          
          const result = await videoDOKProjectFunction.handler(event, {});
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ DOK project generated in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
        } catch (error) {
          console.error(`[${requestId}] ❌ DOK project error:`, error);
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'DOK project generation failed', message: error.message }));
        }
      });
      
      return;
    }

    // Video Vocabulary endpoint (Phase 8 Week 3)
    if (functionPath === 'video-vocabulary') {
      console.log(`[${requestId}] 📚 Routing to video-vocabulary function`);
      
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url,
            queryStringParameters: {}
          };
          
          const result = await videoVocabularyFunction.handler(event, {});
          const duration = Date.now() - startTime;
          
          console.log(`[${requestId}] ✓ Video vocabulary complete in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers);
          res.end(result.body);
        } catch (error) {
          console.error(`[${requestId}] ❌ Video vocabulary error:`, error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      
      return;
    }

    // Phase 8 Week 3: Guided Notes endpoint
    if (functionPath === 'video-guided-notes') {
      console.log(`[${requestId}] 📝 Routing to video-guided-notes function`);
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
        console.log(`[${requestId}] Received ${chunk.length} bytes`);
      });
      
      req.on('end', async () => {
        console.log(`[${requestId}] ✓ Request body complete (${body.length} bytes)`);
        
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url
          };
          
          const result = await videoGuidedNotesFunction.handler(event, {});
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✓ Video guided notes complete in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ✗ Guided notes error after ${duration}ms:`, error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      
      return;
    }

    // Phase 8 Week 3: Graphic Organizer endpoint
    if (functionPath === 'video-graphic-organizer') {
      console.log(`[${requestId}] 🗺️ Routing to video-graphic-organizer function`);
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
        console.log(`[${requestId}] Received ${chunk.length} bytes`);
      });
      
      req.on('end', async () => {
        console.log(`[${requestId}] ✓ Request body complete (${body.length} bytes)`);
        
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url
          };
          
          // Ensure ANTHROPIC_API_KEY is available in process.env for the function
          if (!process.env.ANTHROPIC_API_KEY) {
            console.error(`[${requestId}] ❌ ANTHROPIC_API_KEY not found in environment!`);
            throw new Error('ANTHROPIC_API_KEY not configured');
          }
          
          const result = await videoGraphicOrganizerFunction.handler(event, {});
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✓ Graphic organizer complete in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ✗ Graphic organizer error after ${duration}ms:`, error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      
      return;
    }

    // Phase 8 Week 4: Batch Summary endpoint
    if (functionPath === 'video-batch-summary') {
      console.log(`[${requestId}] 📊 Routing to video-batch-summary function`);
      
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url
          };
          
          const result = await videoBatchSummaryFunction.handler(event, {});
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✓ Batch summary complete in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
        } catch (error) {
          console.error(`[${requestId}] ✗ Batch summary error:`, error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      
      return;
    }

    // Phase 8 Week 4: Batch Quiz endpoint
    if (functionPath === 'video-batch-quiz') {
      console.log(`[${requestId}] 📝 Routing to video-batch-quiz function`);
      
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url
          };
          
          const result = await videoBatchQuizFunction.handler(event, {});
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✓ Batch quiz complete in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
        } catch (error) {
          console.error(`[${requestId}] ✗ Batch quiz error:`, error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      
      return;
    }

    // Phase 8 Week 4: Batch Vocabulary endpoint
    if (functionPath === 'video-batch-vocabulary') {
      console.log(`[${requestId}] 📖 Routing to video-batch-vocabulary function`);
      
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url
          };
          
          const result = await videoBatchVocabularyFunction.handler(event, {});
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✓ Batch vocabulary complete in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
        } catch (error) {
          console.error(`[${requestId}] ✗ Batch vocabulary error:`, error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      
      return;
    }

    // Phase 8 Week 4: Batch Study Guide endpoint
    if (functionPath === 'video-batch-study-guide') {
      console.log(`[${requestId}] 📚 Routing to video-batch-study-guide function`);
      
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url
          };
          
          const result = await videoBatchStudyGuideFunction.handler(event, {});
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✓ Batch study guide complete in ${duration}ms`);
          
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
        } catch (error) {
          console.error(`[${requestId}] ✗ Batch study guide error:`, error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      
      return;
    }

    // Research endpoint
    if (functionPath === 'research') {
      console.log(`[${requestId}] 🔍 Routing to research function`);
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
        console.log(`[${requestId}] Received ${chunk.length} bytes`);
      });
      
      req.on('end', async () => {
        console.log(`[${requestId}] ✓ Request body complete (${body.length} bytes)`);
        
        try {
          // Create Netlify-compatible event object
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body,
            path: req.url,
            queryStringParameters: {}
          };
          
          const context = {};
          
          console.log(`[${requestId}] 📤 Calling research function handler...`);
          const result = await researchFunction.handler(event, context);
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Function completed in ${duration}ms`);
          console.log(`[${requestId}] Status:`, result.statusCode);
          console.log(`[${requestId}] Response body length:`, result.body?.length || 0);
          
          // Send response
          res.writeHead(result.statusCode, result.headers || {});
          res.end(result.body);
          
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Function error after ${duration}ms:`, error);
          console.error(`[${requestId}] Error stack:`, error.stack);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message,
            requestId: requestId
          }));
        }
      });
      
      return;
    }

    // Phase 9: Creative Studio endpoints
    if (functionPath === 'creative-image') {
      console.log(`[${requestId}] 🎨 Routing to creative-image endpoint`);
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const settings = JSON.parse(body);
          console.log(`[${requestId}] Image generation settings:`, settings);
          
          let result;
          const model = settings.model || 'dall-e-3';
          
          // Route to appropriate API based on model selection
          if (model === 'dall-e-3') {
            // OpenAI DALL-E 3
            console.log(`[${requestId}] 🎨 Generating with DALL-E 3...`);
            
            // Map dimensions to DALL-E 3 supported sizes
            let size = '1024x1024';
            if (settings.dimensions === '1024×768 (Landscape)' || settings.dimensions === '1024x768') {
              size = '1792x1024';
            } else if (settings.dimensions === '768×1024 (Portrait)' || settings.dimensions === '768x1024') {
              size = '1024x1792';
            }
            
            const response = await fetch('https://api.openai.com/v1/images/generations', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'dall-e-3',
                prompt: settings.prompt,
                size: size,
                quality: 'hd',
                n: 1
              })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
              throw new Error(data.error?.message || 'DALL-E 3 API error');
            }
            
            result = {
              success: true,
              imageUrl: data.data[0].url,
              revisedPrompt: data.data[0].revised_prompt,
              model: 'DALL-E 3',
              prompt: settings.prompt,
              timestamp: new Date().toISOString()
            };
            
          } else if (model === 'stable-diffusion' || model === 'flux-2' || model === 'dreamshaper') {
            // Stability AI, Replicate Flux, or DreamShaper
            const useStability = model === 'stable-diffusion';
            const useDreamShaper = model === 'dreamshaper';
            
            if (useStability) {
              console.log(`[${requestId}] 🎨 Generating with Stable Diffusion 3...`);
              
              const formData = new FormData();
              formData.append('prompt', settings.prompt);
              if (settings.negativePrompt) {
                formData.append('negative_prompt', settings.negativePrompt);
              }
              formData.append('output_format', 'png');
              formData.append('mode', 'text-to-image');
              
              const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.STABILITY_AI_API_KEY}`
                },
                body: formData
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error(`[${requestId}] Stability AI error:`, errorText);
                throw new Error(`Stability AI error: ${response.status} ${errorText}`);
              }
              
              const data = await response.json();
              
              result = {
                success: true,
                imageUrl: `data:image/png;base64,${data.image}`,
                model: 'Stable Diffusion 3',
                prompt: settings.prompt,
                timestamp: new Date().toISOString()
              };
              
            } else if (useDreamShaper) {
              // DreamShaper via Replicate
              console.log(`[${requestId}] 🎨 Generating with DreamShaper via Replicate...`);
              
              const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
                  input: {
                    prompt: settings.prompt,
                    negative_prompt: settings.negativePrompt || '',
                    num_inference_steps: settings.steps || 20,
                    guidance_scale: settings.guidance || 7.5,
                    width: 1024,
                    height: 1024
                  }
                })
              });
              
              const data = await response.json();
              console.log(`[${requestId}] 📊 DreamShaper initial prediction:`, JSON.stringify(data, null, 2));
              
              if (!response.ok) {
                throw new Error(data.detail || 'Replicate DreamShaper API error');
              }
              
              // Poll for result
              let prediction = data;
              let pollCount = 0;
              while (prediction.status === 'starting' || prediction.status === 'processing') {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const pollResponse = await fetch(prediction.urls.get, {
                  headers: {
                    'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
                  }
                });
                prediction = await pollResponse.json();
                pollCount++;
                console.log(`[${requestId}] 🔄 Poll ${pollCount}: status=${prediction.status}`);
              }
              
              console.log(`[${requestId}] ✅ DreamShaper final prediction:`, JSON.stringify(prediction, null, 2));
              
              if (prediction.status === 'failed') {
                throw new Error(prediction.error || 'DreamShaper generation failed');
              }
              
              if (!prediction.output) {
                throw new Error(`No image URL in DreamShaper output: ${JSON.stringify(prediction)}`);
              }
              
              const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
              
              result = {
                success: true,
                imageUrl: imageUrl,
                model: 'DreamShaper',
                prompt: settings.prompt,
                timestamp: new Date().toISOString()
              };
              
            } else {
              // Replicate Flux 2
              console.log(`[${requestId}] 🎨 Generating with Flux 2 via Replicate...`);
              
              // Flux Pro has max guidance of 5
              const guidance = Math.min(settings.guidance || 3.5, 5);
              
              const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  version: 'black-forest-labs/flux-pro',
                  input: {
                    prompt: settings.prompt,
                    guidance: guidance,
                    num_inference_steps: settings.steps || 20,
                    width: 1024,
                    height: 1024
                  }
                })
              });
              
              const data = await response.json();
              
              console.log(`[${requestId}] 📊 Initial prediction:`, JSON.stringify(data, null, 2));
              
              if (!response.ok) {
                throw new Error(data.detail || 'Replicate API error');
              }
              
              // Poll for result
              let prediction = data;
              let pollCount = 0;
              while (prediction.status === 'starting' || prediction.status === 'processing') {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second intervals
                const pollResponse = await fetch(prediction.urls.get, {
                  headers: {
                    'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
                  }
                });
                prediction = await pollResponse.json();
                pollCount++;
                console.log(`[${requestId}] 🔄 Poll ${pollCount}: status=${prediction.status}`);
              }
              
              console.log(`[${requestId}] ✅ Final prediction:`, JSON.stringify(prediction, null, 2));
              
              if (prediction.status === 'failed') {
                throw new Error(prediction.error || 'Generation failed');
              }
              
              if (!prediction.output) {
                throw new Error(`No image URL in prediction output: ${JSON.stringify(prediction)}`);
              }
              
              // Flux Pro output is a single string URL, not an array
              const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
              
              result = {
                success: true,
                imageUrl: imageUrl,
                model: 'Flux 2 Pro',
                prompt: settings.prompt,
                timestamp: new Date().toISOString()
              };
            }
            
          } else {
            // Fallback for unknown models
            throw new Error(`Unsupported model: ${model}`);
          }
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Creative image completed in ${duration}ms`);
          
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify(result));
          
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Creative image error after ${duration}ms:`, error);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Image generation failed',
            message: error.message,
            requestId: requestId
          }));
        }
      });
      
      return;
    }
    
    // ===== CREATIVE AUDIO ENDPOINT =====
    if (functionPath === 'creative-audio') {
      // Import the creative-audio function handler
      const creativeAudioModule = require('./netlify/functions/creative-audio.cjs');
      
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: 'POST',
            body: body,
            headers: req.headers
          };
          
          const response = await creativeAudioModule.handler(event);
          
          res.writeHead(response.statusCode || 200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(response.body);
          
        } catch (error) {
          console.error('❌ Creative audio error:', error);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Audio generation failed',
            message: error.message
          }));
        }
      });
      
      return;
    }
    
    // ===== CREATIVE MUSIC ENDPOINT =====
    if (functionPath === 'creative-music') {
      const requestId = Date.now().toString().slice(-6);
      const startTime = Date.now();
      console.log(`[${requestId}] 🎵 Creative music request received`);
      
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const settings = JSON.parse(body);
          console.log(`[${requestId}] Settings:`, settings);
          
          const model = settings.model || 'MusicGen (Free)';
          let result;
          
          if (model === 'MusicGen (Free)' || model === 'Lyria Lite (Fast)') {
            console.log(`[${requestId}] 🎵 Generating with MusicGen (Meta)...`);
            
            const response = await fetch('https://api.replicate.com/v1/predictions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                version: 'meta/musicgen',
                input: {
                  prompt: settings.prompt,
                  duration: settings.duration || 30,
                  temperature: 1.0,
                  top_k: 250,
                  top_p: 0.0,
                  classifier_free_guidance: 3
                }
              })
            });
            
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.detail || 'Replicate API error');
            }
            
            // Poll for result
            let prediction = data;
            while (prediction.status === 'starting' || prediction.status === 'processing') {
              await new Promise(resolve => setTimeout(resolve, 1500));
              const pollResponse = await fetch(prediction.urls.get, {
                headers: {
                  'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
                }
              });
              prediction = await pollResponse.json();
            }
            
            if (prediction.status === 'failed') {
              throw new Error(prediction.error || 'Generation failed');
            }
            
            result = {
              success: true,
              audioUrl: prediction.output,
              model: 'MusicGen (Meta)',
              prompt: settings.prompt,
              duration: settings.duration || 30,
              timestamp: new Date().toISOString()
            };
          } else {
            throw new Error(`Unsupported model: ${model}`);
          }
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Creative music completed in ${duration}ms`);
          
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify(result));
          
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Creative music error after ${duration}ms:`, error);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Music generation failed',
            message: error.message,
            requestId: requestId
          }));
        }
      });
      
      return;
    }
    
    // ===== CREATIVE VIDEO ENDPOINT =====
    if (functionPath === 'creative-video') {
      const requestId = Date.now().toString().slice(-6);
      const startTime = Date.now();
      console.log(`[${requestId}] 🎬 Creative video request received`);
      
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const settings = JSON.parse(body);
          console.log(`[${requestId}] Settings:`, settings);
          
          const model = settings.model || 'Zeroscope v2 (Free)';
          let result;
          
          if (model === 'Zeroscope v2 (Free)' || model === 'Veo 2 (Fast)') {
            console.log(`[${requestId}] 🎬 Generating with Zeroscope v2 XL...`);
            
            const response = await fetch('https://api.replicate.com/v1/predictions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                version: 'anotherjesse/zeroscope-v2-xl',
                input: {
                  prompt: settings.prompt,
                  num_frames: settings.duration === 3 ? 24 : (settings.duration === 5 ? 40 : 24),
                  fps: settings.fps || 24,
                  width: 576,
                  height: 320,
                  num_inference_steps: 50
                }
              })
            });
            
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.detail || 'Replicate API error');
            }
            
            // Poll for result (video takes longer)
            let prediction = data;
            while (prediction.status === 'starting' || prediction.status === 'processing') {
              await new Promise(resolve => setTimeout(resolve, 2000));
              const pollResponse = await fetch(prediction.urls.get, {
                headers: {
                  'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
                }
              });
              prediction = await pollResponse.json();
            }
            
            if (prediction.status === 'failed') {
              throw new Error(prediction.error || 'Generation failed');
            }
            
            result = {
              success: true,
              videoUrl: prediction.output,
              model: 'Zeroscope v2 XL',
              prompt: settings.prompt,
              duration: settings.duration || 3,
              timestamp: new Date().toISOString()
            };
          } else {
            throw new Error(`Unsupported model: ${model}`);
          }
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Creative video completed in ${duration}ms`);
          
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify(result));
          
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Creative video error after ${duration}ms:`, error);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Video generation failed',
            message: error.message,
            requestId: requestId
          }));
        }
      });
      
      return;
    }
    
    // ===== PHASE 10: MEMORY SEARCH ENDPOINT =====
    if (functionPath === 'memory-search') {
      console.log(`[${requestId}] 🔍 Memory search request received`);
      
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body
          };
          
          const result = await memorySearchFunction.handler(event);
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Memory search completed in ${duration}ms`);
          
          res.writeHead(result.statusCode || 200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end(result.body);
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Memory search error after ${duration}ms:`, error);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Memory search failed',
            message: error.message,
            requestId: requestId
          }));
        }
      });
      
      return;
    }
    
    // ===== PHASE 10: MEMORY SAVE ENDPOINT =====
    if (functionPath === 'memory-save') {
      console.log(`[${requestId}] 💾 Memory save request received`);
      
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body
          };
          
          const result = await memorySaveFunction.handler(event);
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Memory save completed in ${duration}ms`);
          
          res.writeHead(result.statusCode || 200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end(result.body);
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Memory save error after ${duration}ms:`, error);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Memory save failed',
            message: error.message,
            requestId: requestId
          }));
        }
      });
      
      return;
    }
    
    // ===== PHASE 10 WEEK 3: MEMORY GRAPH ENDPOINT =====
    if (functionPath === 'memory-graph') {
      console.log(`[${requestId}] 🔗 Memory graph request received`);
      
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body: body
          };
          
          const result = await memoryGraphFunction.handler(event);
          
          const duration = Date.now() - startTime;
          console.log(`[${requestId}] ✅ Memory graph completed in ${duration}ms`);
          
          res.writeHead(result.statusCode || 200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end(result.body);
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] ❌ Memory graph error after ${duration}ms:`, error);
          
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Memory graph failed',
            message: error.message,
            requestId: requestId
          }));
        }
      });
      
      return;
    }
  }

  // Serve static files
  console.log(`[${requestId}] 📄 Serving static file`);
  
  // Strip query parameters from URL for file path
  const urlPath = req.url.split('?')[0];
  let filePath = '.' + urlPath;
  if (filePath === './' || filePath === '.') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        console.log(`[${requestId}] ⚠️ File not found:`, filePath);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        console.error(`[${requestId}] ❌ Server error:`, error);
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] ✓ Served ${filePath} (${content.length} bytes) in ${duration}ms`);
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(80));
  console.log('✅ Server Running!');
  console.log('='.repeat(80));
  console.log(`🌐 Local:            http://localhost:${PORT}`);
  console.log(`🌐 Network:         http://127.0.0.1:${PORT}`);
  console.log('');
  console.log('📁 Serving static files from current directory');
  console.log('🔧 API endpoint:     /.netlify/functions/chat');
  console.log('🔧 API endpoint:     /api/chat');
  console.log('🔧 API endpoint:     /.netlify/functions/multi-agent');
  console.log('🔧 API endpoint:     /api/multi-agent');
  console.log('🔧 API endpoint:     /.netlify/functions/research');
  console.log('🔧 API endpoint:     /api/research');
  console.log('🎨 NEW: /api/video-quiz (Phase 8 Week 2)');
  console.log('🎨 NEW: /api/video-lesson-plan (Phase 8 Week 2)');
  console.log('🎨 NEW: /api/video-discussion (Phase 8 Week 2)');
  console.log('🎓 NEW: /api/video-dok-project (Phase 8 Week 3 - DOK 3-4 Projects)');
  console.log('📚 NEW: /api/video-vocabulary (Phase 8 Week 3 - Vocabulary Builder)');
  console.log('📝 NEW: /api/video-guided-notes (Phase 8 Week 3 - Guided Notes)');
  console.log('🗺️ NEW: /api/video-graphic-organizer (Phase 8 Week 3 - Graphic Organizers) ✅ COMPLETE');
  console.log('');
  console.log('📦 BATCH: /api/video-batch-summary (Phase 8 Week 4 - Weekly Summary)');
  console.log('📦 BATCH: /api/video-batch-quiz (Phase 8 Week 4 - Combined Quiz)');
  console.log('📦 BATCH: /api/video-batch-vocabulary (Phase 8 Week 4 - Master Vocabulary)');
  console.log('📦 BATCH: /api/video-batch-study-guide (Phase 8 Week 4 - Unit Study Guide)');
  console.log('');
  console.log('🧠 PHASE 10: /api/memory-search (Memory & Knowledge Management)');
  console.log('🧠 PHASE 10: /api/memory-save (Save with Auto-embeddings + Tags)');
  console.log('🔗 PHASE 10 WEEK 3: /api/memory-graph (Knowledge Graph Visualization)');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('='.repeat(80) + '\n');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error('Kill the process using that port and try again.');
    console.error(`Run: Get-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess | Stop-Process -Force\n`);
  } else {
    console.error('\n❌ Server error:', error);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
