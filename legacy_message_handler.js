// Quick fix for legacy message decryption issues
// Add this to your message decryption logic

const handleLegacyMessages = (messages) => {
  console.log('🔍 Checking for legacy message issues...');
  
  let decryptionFailures = 0;
  let totalEncryptedMessages = 0;
  
  const processedMessages = messages.map(message => {
    if (message.message_text && message.message_text.includes('"iv":') && message.message_text.includes('"encrypted":')) {
      totalEncryptedMessages++;
      
      try {
        // Try to decrypt the message
        const decrypted = decryptMessage(message.message_text);
        if (decrypted === '[🔐 This message was encrypted with old keys and cannot be decrypted. New messages will encrypt properly.]') {
          decryptionFailures++;
          return {
            ...message,
            message_text: '🔐 This message was encrypted with old keys. Please send new messages.',
            isLegacyMessage: true
          };
        }
        return { ...message, message_text: decrypted };
      } catch (error) {
        decryptionFailures++;
        console.log(`🚨 Decryption failed for message ${message.message_id}`);
        return {
          ...message,
          message_text: '🔐 This message was encrypted with old keys. Please send new messages.',
          isLegacyMessage: true
        };
      }
    }
    return message;
  });
  
  // If more than 80% of messages fail, suggest key reset
  if (totalEncryptedMessages > 0 && (decryptionFailures / totalEncryptedMessages) > 0.8) {
    console.log('⚠️ High failure rate detected. Consider key reset.');
    // You could show a user-friendly message here
  }
  
  return processedMessages;
};

// Example usage in your message fetching:
const fetchAndDecryptMessages = async () => {
  try {
    const response = await fetch('/api/messages/get', {
      method: 'POST',
      body: JSON.stringify(messageParams),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    if (data.success) {
      const processedMessages = handleLegacyMessages(data.messages);
      setMessages(processedMessages);
    }
  } catch (error) {
    console.error('Message fetch error:', error);
  }
};

export { handleLegacyMessages };
