const crypto = require('crypto');

const SECRET_KEY = Buffer.from('12345678901234567890123456789012'); // 32-byte key
const IV = Buffer.from('1234567890123456'); // 16-byte IV

function decryptAES(encrypted) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, IV);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { decryptAES };