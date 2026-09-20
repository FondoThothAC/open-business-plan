// Run on the VPS; credentials arrive through stdin, never command arguments.
import fs from 'node:fs';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
const input = [];
for await (const chunk of process.stdin) input.push(chunk);
const personal = JSON.parse(Buffer.concat(input).toString());
const envPath = '.env.local';
const config = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};
const userPath = 'server/data/users.json';
const users = JSON.parse(fs.readFileSync(userPath));
const user = users.users.find(u => u.id === 'u_superadmin_roberto');
if (!user) throw new Error('Expected owner missing');
// Refuse automatic key rotation when existing encrypted credentials need migration.
if (users.users.some(u => Object.values(u.apiKeys || {}).some(v => String(v).startsWith('enc:v1:'))) && !config.API_KEYS_ENCRYPTION_KEY) throw new Error('Existing encrypted keys require migration first');
config.JWT_SECRET ||= crypto.randomBytes(64).toString('hex');
config.API_KEYS_ENCRYPTION_KEY ||= crypto.randomBytes(32).toString('hex');
if (config.JWT_SECRET === config.API_KEYS_ENCRYPTION_KEY) throw new Error('Secrets must be independent');
config.ALLOW_SHARED_SEARCH_KEYS = 'false';
config.NODE_ENV = 'production';
fs.writeFileSync(envPath, Object.entries(config).map(([k,v]) => `${k}=${JSON.stringify(v)}`).join('\n')+'\n', {mode:0o600});
fs.chmodSync(envPath,0o600);
const key = crypto.createHash('sha256').update(config.API_KEYS_ENCRYPTION_KEY).digest();
user.apiKeys ||= {};
for (const name of ['tavily','brave','inegi']) {
  if (!personal[name] || user.apiKeys[name]) continue;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm',key,iv);
  const encrypted = Buffer.concat([cipher.update(personal[name],'utf8'),cipher.final()]);
  user.apiKeys[name] = `enc:v1:${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${encrypted.toString('base64')}`;
}
fs.writeFileSync(userPath+'.tmp',JSON.stringify(users,null,2),{mode:0o600});
fs.renameSync(userPath+'.tmp',userPath);
console.log(JSON.stringify({persistentSecrets:true,sharedSearch:false,personalKeys:Object.fromEntries(['tavily','brave','inegi'].map(k=>[k,Boolean(user.apiKeys[k])]))}));
