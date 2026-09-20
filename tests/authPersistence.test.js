import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const auth = new URL('../server/auth.js',import.meta.url).href;
test('dotenv loads before auth and secrets/keys survive a fresh process', () => {
 const dir = fs.mkdtempSync(path.join(os.tmpdir(),'obp-auth-'));
 fs.writeFileSync(path.join(dir,'.env.local'), 'NODE_ENV=production\nJWT_SECRET=test-session-secret-stable\nAPI_KEYS_ENCRYPTION_KEY=test-independent-encryption-secret\nBOOTSTRAP_SUPERADMIN_PASSWORD=test-password-123\n');
 const env={...process.env}; for(const k of ['JWT_SECRET','API_KEYS_ENCRYPTION_KEY','NODE_ENV']) delete env[k];
 const run=code=>{const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:dir,env,encoding:'utf8'}); assert.equal(r.status,0,r.stderr);};
 run(`import fs from 'node:fs';import {loginUsuario,actualizarApiKeys} from ${JSON.stringify(auth)}; const r=loginUsuario({username:'roberto',password:'test-password-123'});if(!r.success)throw Error('login');actualizarApiKeys(r.user.id,{tavily:'test-personal-secret'});fs.writeFileSync('token',r.token);`);
 run(`import fs from 'node:fs';import {verificarToken,obtenerApiKeysParaServicio} from ${JSON.stringify(auth)};if(!verificarToken(fs.readFileSync('token','utf8')).valid)throw Error('session lost');if(obtenerApiKeysParaServicio('u_superadmin_roberto').tavily!=='test-personal-secret')throw Error('decryption lost');`);
 assert.ok(!fs.readFileSync(path.join(dir,'server/data/users.json'),'utf8').includes('test-personal-secret'));
 fs.rmSync(dir,{recursive:true,force:true});
});
