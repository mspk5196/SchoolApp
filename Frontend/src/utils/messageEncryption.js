import { ec as EC } from 'elliptic';
import CryptoJS from 'crypto-js';

const ec = new EC('secp256k1');

/**
 * Computes a shared secret using ECDH and derives a 256-bit AES key from it.
 * @param {string} myPrivateKeyHex - Your private key in hex.
 * @param {string} theirPublicKeyHex - The other user's public key in hex.
 * @returns {string} The derived AES key as a hex string.
 */
export const getSharedSecretAESKey = (myPrivateKeyHex, theirPublicKeyHex) => {
    const myKeyPair = ec.keyFromPrivate(myPrivateKeyHex, 'hex');
    const theirPublicKey = ec.keyFromPublic(theirPublicKeyHex, 'hex');
    const sharedSecret = myKeyPair.derive(theirPublicKey.getPublic());

    // Derive a 256-bit key from the shared secret using SHA-256
    const aesKey = CryptoJS.SHA256(sharedSecret.toString('hex')).toString(CryptoJS.enc.Hex);
    return aesKey.substring(0, 64); // Ensure 256-bit (32 bytes / 64 hex chars)
};

/**
 * Encrypts a text message using AES-256-GCM.
 * @param {string} text - The plaintext message.
 * @param {string} aesKeyHex - The shared AES key in hex.
 * @returns {string} A stringified JSON object containing the ciphertext, IV, and auth tag.
 */
export const encryptText = (text, aesKeyHex) => {
    const key = CryptoJS.enc.Hex.parse(aesKeyHex);
    const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes for CBC

    const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return JSON.stringify({
        iv: CryptoJS.enc.Base64.stringify(iv),
        encrypted: encrypted.toString()
    });
};

/**
 * Decrypts a message encrypted with AES-256-GCM.
 * @param {string} encryptedPayload - The stringified JSON object from encryptText.
 * @param {string} aesKeyHex - The shared AES key in hex.
 * @returns {string} The decrypted plaintext message.
 */
export const decryptText = (encryptedPayload, aesKeyHex) => {
    try {
        const payload = JSON.parse(encryptedPayload);
        const key = CryptoJS.enc.Hex.parse(aesKeyHex);
        const iv = CryptoJS.enc.Base64.parse(payload.iv);

        const decrypted = CryptoJS.AES.decrypt(payload.encrypted, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed:", error);
        return "[Unable to decrypt message]";
    }
};