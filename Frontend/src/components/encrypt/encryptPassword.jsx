import CryptoJS from 'crypto-js';

const SECRET_KEY = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012'); // 32 chars
const IV = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16 chars

export const encryptPassword = (plainPassword) => {
  const encrypted = CryptoJS.AES.encrypt(plainPassword, SECRET_KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.toString();
};