import CryptoJS from 'crypto-js';
import { API_URL } from '@env';

export const backupPrivateKey = async (privateKeyHex, userId, userType, password, publicKeyHex) => {
    // Derive a key from the password
    const key = CryptoJS.SHA256(password);
    // Encrypt the private key
    const encrypted = CryptoJS.AES.encrypt(privateKeyHex, key.toString()).toString();

    // Upload to backend
    await fetch(`${API_URL}/api/keys/private/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            user_type: userType,
            encrypted_private_key: encrypted,
        }),
    });
    await fetch(`${API_URL}/api/messages/keys/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            user_type: userType,
            public_key: publicKeyHex,
        }),
    });
};