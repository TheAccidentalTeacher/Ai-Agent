-- Add missing error_message column to user_documents table
ALTER TABLE user_documents 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_documents' 
AND column_name = 'error_message';
