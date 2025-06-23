import AsyncStorage from '@react-native-async-storage/async-storage';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');
const PRIVATE_KEY_STORAGE_KEY = 'ecdhPrivateKey';

/**  
 * Generates a new ECDH key pair, stores the private key securely,
 * and returns both the private and public keys in hex format.
 */
// export const generateAndStoreKeys = async () => {
//     const keyPair = ec.genKeyPair();
//     const privateKeyHex = keyPair.getPrivate('hex');
//     const publicKeyHex = keyPair.getPublic('hex');

//     await AsyncStorage.setItem(PRIVATE_KEY_STORAGE_KEY, privateKeyHex);
//     return { privateKeyHex, publicKeyHex };
// };

export const generateAndStoreKeys = async () => {
    const keyPair = ec.genKeyPair();
    const privateKeyHex = keyPair.getPrivate('hex');
    const publicKeyHex = keyPair.getPublic('hex');
    await AsyncStorage.setItem('ecdhPrivateKey', privateKeyHex);
    return { privateKeyHex, publicKeyHex };
};
/**
 * Retrieves the stored private key from AsyncStorage.
 * @returns {Promise<string|null>} The private key in hex format, or null if not found.
 */
export const getPrivateKey = async () => {
    return await AsyncStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
};

/**
 * Derives and returns the public key from the stored private key.
 * @returns {Promise<string|null>} The public key in hex format, or null if no private key is stored.
 */
export const getPublicKey = async () => {
    const privateKeyHex = await getPrivateKey();
    if (!privateKeyHex) {
        return null;
    }
    const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex');
    return keyPair.getPublic('hex');
};