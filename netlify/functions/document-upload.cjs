/**
 * Document Upload API
 * Phase 11 Week 1: Handle file uploads and storage
 * 
 * Accepts: PDF, DOCX, TXT, EPUB files
 * Max size: 10 MB
 * 
 * Process:
 * 1. Receive file upload
 * 2. Validate file type and size
 * 3. Store in Supabase Storage
 * 4. Save metadata to database
 * 5. Return document ID
 */

const { createClient } = require('@supabase/supabase-js');
const multipart = require('parse-multipart-data');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function handler(event, context) {
  // CORS headers
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
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse multipart form data
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    const boundary = contentType.split('boundary=')[1];
    
    if (!boundary) {
      throw new Error('No boundary found in multipart data');
    }

    // CRITICAL: Use 'binary' encoding for multipart file uploads to preserve binary data
    // Using 'utf8' corrupts binary files like DOCX, PDF, etc.
    const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    const parts = multipart.parse(bodyBuffer, boundary);

    // Extract file and metadata
    let file = null;
    let userId = null;
    let filename = null;
    let fileType = null;
    let fileSize = null;

    for (const part of parts) {
      const name = part.name;
      if (name === 'file') {
        file = part;
      } else if (name === 'userId') {
        userId = part.data.toString();
      } else if (name === 'filename') {
        filename = part.data.toString();
      } else if (name === 'fileType') {
        fileType = part.data.toString();
      } else if (name === 'fileSize') {
        fileSize = parseInt(part.data.toString());
      }
    }

    if (!file || !userId || !filename) {
      throw new Error('Missing required fields: file, userId, or filename');
    }

    console.log(`📤 [Upload] Processing: ${filename} (${fileSize} bytes) for user ${userId}`);

    // Validate file size (10 MB max)
    const maxSize = 10 * 1024 * 1024;
    if (fileSize > maxSize) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'File too large',
          message: 'Maximum file size is 10 MB'
        })
      };
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/epub+zip'
    ];

    const fileExtension = filename.split('.').pop().toLowerCase();
    const validExtensions = ['pdf', 'docx', 'txt', 'epub'];

    if (!validExtensions.includes(fileExtension)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid file type',
          message: 'Only PDF, DOCX, TXT, and EPUB files are supported'
        })
      };
    }

    // Generate unique storage path
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${userId}/${timestamp}_${sanitizedFilename}`;

    console.log(`💾 [Upload] Storing at: ${storagePath}`);

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('Documents')
      .upload(storagePath, file.data, {
        contentType: fileType || 'application/octet-stream',
        upsert: false
      });

    if (storageError) {
      console.error('❌ [Upload] Storage error:', storageError);
      throw new Error(`Storage upload failed: ${storageError.message}`);
    }

    console.log('✅ [Upload] File stored successfully');

    // Save metadata to database
    const { data: docData, error: dbError } = await supabase
      .from('user_documents')
      .insert([{
        user_id: userId,
        filename: filename,
        file_type: fileType || `application/${fileExtension}`,
        file_size: fileSize,
        storage_path: storagePath
      }])
      .select()
      .single();

    if (dbError) {
      console.error('❌ [Upload] Database error:', dbError);
      
      // Cleanup: Delete uploaded file from storage
      await supabase.storage.from('documents').remove([storagePath]);
      
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    console.log('✅ [Upload] Metadata saved, document ID:', docData.id);

    // Return success
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        document: {
          id: docData.id,
          filename: docData.filename,
          fileType: docData.file_type,
          fileSize: docData.file_size,
          createdAt: docData.created_at
        },
        message: 'Document uploaded successfully'
      })
    };

  } catch (error) {
    console.error('❌ [Upload] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Upload failed',
        message: error.message
      })
    };
  }
}

module.exports = { handler };
