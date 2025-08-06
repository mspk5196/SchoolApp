-- Clear Encrypted Messages Script
-- This script removes all encrypted messages and resets the messaging system for direct messaging

-- 1. Clear all existing messages (they are encrypted and can't be decrypted without keys)
DELETE FROM messages WHERE message_text IS NOT NULL AND message_text != '';

-- 2. Clear any user encryption keys if that table exists
-- (Comment out if user_keys table doesn't exist)
-- DELETE FROM user_keys;

-- 3. Reset auto-increment for messages table (optional)
ALTER TABLE messages AUTO_INCREMENT = 1;

-- 4. Verify cleanup
SELECT COUNT(*) as remaining_messages FROM messages;

-- Note: This script prepares the database for direct messaging without encryption
-- All users can now send and receive plain text messages securely through HTTPS
