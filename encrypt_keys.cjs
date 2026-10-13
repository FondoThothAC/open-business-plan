/**
 * [B2] Herramienta para cifrar API keys al formato enc:v1 que usa server/auth.js.
 *
 * Antes contenía tres credenciales en claro (una de Tavily, una de Brave y la del
 * DENUE/INEGI) embebidas en el código. Ahora todo se lee del entorno: no se imprime
 * ningún valor y no queda nada sensible en el repositorio. Cero referencias a este
 * archivo en el repo: se conserva por si hace falta regenerar blobs cifrados.
 *
 * Uso:  DENUE_KEY=... TAVILY_API_KEY=... BRAVE_SEARCH_KEY=... \
 *       API_KEYS_ENCRYPTION_KEY=... node encrypt_keys.cjs
 */
const crypto = require('crypto');

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

const secret = process.env.API_KEYS_ENCRYPTION_KEY;
if (!secret) {
  console.error('Falta API_KEYS_ENCRYPTION_KEY en el entorno (misma que usa server/auth.js).');
  process.exit(1);
}
const keyBuffer = crypto.createHash('sha256').update(secret).digest();

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = crypto.getAuthTag();
  return `enc:v1:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

const fuentes = {
  tavily: process.env.TAVILY_API_KEY,
  brave: process.env.BRAVE_SEARCH_KEY,
  inegi: process.env.DENUE_KEY || process.env.INEGI_KEY,
};

const salida = {};
for (const [nombre, valor] of Object.entries(fuentes)) {
  if (valor) salida[nombre] = encrypt(valor);
}

if (Object.keys(salida).length === 0) {
  console.error('Ninguna de TAVILY_API_KEY / BRAVE_SEARCH_KEY / DENUE_KEY está definida. Nada que cifrar.');
  process.exit(1);
}

console.log(JSON.stringify(salida, null, 2));
