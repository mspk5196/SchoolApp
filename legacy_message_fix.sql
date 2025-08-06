-- SQL script to clear legacy encrypted messages that can't be decrypted
-- This will help resolve the key mismatch issue

-- First, let's see what messages we have
SELECT 
    message_id, 
    sender_id, 
    sender_type, 
    receiver_id, 
    receiver_type,
    created_at,
    SUBSTRING(message_text, 1, 50) as message_preview
FROM messages 
WHERE message_text IS NOT NULL
ORDER BY created_at DESC;

-- Update all encrypted messages to show a clear message about the reset
UPDATE messages 
SET message_text = '[🔐 Previous messages were encrypted with old keys. New messages will work properly.]'
WHERE message_text IS NOT NULL 
AND message_text LIKE '%"iv":%'
AND message_text LIKE '%"encrypted":%';

-- Check the results
SELECT 
    message_id, 
    sender_id, 
    sender_type, 
    receiver_id, 
    receiver_type,
    created_at,
    message_text
FROM messages 
WHERE message_text IS NOT NULL
ORDER BY created_at DESC;
