-- DIAGNOSTIC: Check what columns actually exist in user_documents table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_documents'
ORDER BY ordinal_position;
