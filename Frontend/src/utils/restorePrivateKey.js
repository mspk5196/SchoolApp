import CryptoJS from 'crypto-js';
import { API_URL } from '../utils/env.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const restorePrivateKey = async (userId, userType, password) => {
    const res = await fetch(`${API_URL}/api/keys/private/get?user_id=${userId}&user_type=${userType}`);
    
    if (!res.ok) {
        if (res.status === 404) {
            console.log('No private key found on server for this user.');
            return null; // Explicitly return null on 404
        }
        throw new Error(`Server responded with status ${res.status}`);
    }

    const { encrypted_private_key } = await res.json();
    if (!encrypted_private_key) return null;

    const key = CryptoJS.SHA256(password);
    const decrypted = CryptoJS.AES.decrypt(encrypted_private_key, key.toString());
    const privateKeyHex = decrypted.toString(CryptoJS.enc.Utf8);

    if (!privateKeyHex) {
        // This case handles decryption failure (e.g., wrong password)
        throw new Error('Failed to decrypt private key. The password may be incorrect.');
    }

    await AsyncStorage.setItem('ecdhPrivateKey', privateKeyHex);
    return privateKeyHex;
};