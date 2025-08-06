-- Clear all encrypted messages and reset to plain text messaging
-- This removes all encryption artifacts and starts fresh

-- First, let's see what encrypted messages we have
SELECT 
    message_id, 
    sender_id, 
    sender_type, 
    receiver_id, 
    receiver_type,
    created_at,
    CASE 
        WHEN message_text LIKE '%"iv":%' AND message_text LIKE '%"encrypted":%' THEN 'ENCRYPTED'
        WHEN message_text IS NOT NULL THEN 'PLAIN_TEXT'
        ELSE 'NO_TEXT'
    END as message_status,
    SUBSTRING(message_text, 1, 100) as message_preview
FROM messages 
WHERE message_text IS NOT NULL
ORDER BY created_at DESC;

-- Clear all encrypted messages and replace with plain message
UPDATE messages 
SET message_text = 'This message has been reset for direct messaging.'
WHERE message_text IS NOT NULL 
AND message_text LIKE '%"iv":%'
AND message_text LIKE '%"encrypted":%';

-- Optional: Drop the user_keys table if it exists (removes all encryption keys)
-- DROP TABLE IF EXISTS user_keys;

-- Verify the cleanup
SELECT 
    COUNT(*) as total_messages,
    SUM(CASE WHEN message_text IS NOT NULL THEN 1 ELSE 0 END) as text_messages,
    SUM(CASE WHEN attachment_path IS NOT NULL THEN 1 ELSE 0 END) as attachment_messages,
    SUM(CASE WHEN message_text LIKE '%"iv":%' THEN 1 ELSE 0 END) as encrypted_messages_remaining
FROM messages;

-- Show recent messages after cleanup
SELECT 
    message_id, 
    sender_id, 
    sender_type, 
    receiver_id, 
    receiver_type,
    message_text,
    created_at
FROM messages 
WHERE message_text IS NOT NULL
ORDER BY created_at DESC 
LIMIT 10;
