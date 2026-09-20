const crypto = require('crypto');

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const API_KEYS_ENCRYPTION_KEY = '892ed625637226df0cbbdc0de38531fa096e37678770319b15b21ae7a0d9643e';
// Auth.js hace: crypto.createHash('sha256').update(API_KEYS_ENCRYPTION_KEY).digest();
const keyBuffer = crypto.createHash('sha256').update(API_KEYS_ENCRYPTION_KEY).digest();

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `enc:v1:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

const tavily = encrypt('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');
const brave = encrypt('BSACniLH_OR7EKATmbzElVpNvHNGCqg');
const inegi = encrypt('1b9e230f-2ae0-48db-bd20-8810b1db575e');

console.log(JSON.stringify({ tavily, brave, inegi }));
