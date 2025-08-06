import AsyncStorage from '@react-native-async-storage/async-storage';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

// Generate user-specific storage key
const getPrivateKeyStorageKey = (userId, userType) => {
    return `ecdhPrivateKey_${userType}_${userId}`;
};

/**  
 * Generates a new ECDH key pair, stores the private key securely with user-specific key,
 * and returns both the private and public keys in hex format.
 */
export const generateAndStoreKeys = async (userId, userType) => {
    if (!userId || !userType) {
        throw new Error('User ID and user type are required for key generation');
    }
    
    const keyPair = ec.genKeyPair();
    const privateKeyHex = keyPair.getPrivate('hex');
    const publicKeyHex = keyPair.getPublic('hex');
    
    const storageKey = getPrivateKeyStorageKey(userId, userType);
    await AsyncStorage.setItem(storageKey, privateKeyHex);
    
    console.log('🔑 Generated and stored private key for:', `${userType}_${userId}`);
    return { privateKeyHex, publicKeyHex };
};

/**
 * Retrieves the stored private key from AsyncStorage for a specific user.
 * @returns {Promise<string|null>} The private key in hex format, or null if not found.
 */
export const getPrivateKey = async (userId, userType) => {
    if (!userId || !userType) {
        console.warn('⚠️ User ID and user type are required to retrieve private key');
        return null;
    }
    
    const storageKey = getPrivateKeyStorageKey(userId, userType);
    const privateKey = await AsyncStorage.getItem(storageKey);
    
    console.log('🔍 Private key lookup for:', `${userType}_${userId}`, privateKey ? 'Found' : 'Not found');
    return privateKey;
};

/**
 * Derives and returns the public key from the stored private key for a specific user.
 * @returns {Promise<string|null>} The public key in hex format, or null if no private key is stored.
 */
export const getPublicKey = async (userId, userType) => {
    const privateKeyHex = await getPrivateKey(userId, userType);
    if (!privateKeyHex) {
        return null;
    }
    const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex');
    return keyPair.getPublic('hex');
};

/**
 * Deletes the private key for a specific user (used during logout).
 */
export const deletePrivateKey = async (userId, userType) => {
    if (!userId || !userType) {
        console.warn('⚠️ User ID and user type are required to delete private key');
        return;
    }
    
    const storageKey = getPrivateKeyStorageKey(userId, userType);
    await AsyncStorage.removeItem(storageKey);
    console.log('🗑️ Deleted private key for:', `${userType}_${userId}`);
};

/**
 * Deletes all encryption keys from storage (complete cleanup).
 */
export const clearAllEncryptionKeys = async () => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const encryptionKeys = allKeys.filter(key => key.startsWith('ecdhPrivateKey_'));
        
        if (encryptionKeys.length > 0) {
            await AsyncStorage.multiRemove(encryptionKeys);
            console.log('🧹 Cleared all encryption keys:', encryptionKeys.length);
        }
    } catch (error) {
        console.error('❌ Error clearing encryption keys:', error);
    }
};