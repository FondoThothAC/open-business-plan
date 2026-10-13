/**
 * [B2] Regresión de rutas de IA/swarm autenticadas, límites de body y credencial ausente.
 *
 * Servidor aislado en cwd temporal (sin DENUE_KEY en su .env.local), de modo que se puede
 * verificar el guard 503 sin depender de credenciales reales.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER = path.join(REPO, 'server', 'index.js');
const AUTH = path.join(REPO, 'server', 'auth.js');
const PORT = 39412;
const BASE = `http://127.0.0.1:${PORT}`;

function setupEn(cwd, code) {
  const env = { ...process.env };
  for (const k of ['JWT_SECRET', 'API_KEYS_ENCRYPTION_KEY', 'NODE_ENV', 'PORT', 'HOST', 'DENUE_KEY', 'INEGI_KEY', 'OLLAMA_KEY', 'BOOTSTRAP_SUPERADMIN_PASSWORD']) delete env[k];
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd, env, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`setup falló: ${r.stderr}`);
}

async function api(method, url, { token, body, rawBody, contentType } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (rawBody !== undefined) { headers['Content-Type'] = contentType || 'application/json'; }
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${BASE}${url}`, { method, headers, body: rawBody !== undefined ? rawBody : (body === undefined ? undefined : JSON.stringify(body)), signal: ctrl.signal });
    let json;
    try { json = await res.json(); } catch { /* SSE o sin body */ }
    return { status: res.status, json };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * POST de body grande con node:http. fetch/undici lanza al recibir el 413 porque
 * body-parser responde y cierra el socket mientras el cliente todavía escribe; con
 * http.request se captura el status real (o el error de transporte, que también
 * demuestra que el cuerpo fue rechazado).
 */
function postGrande(ruta, { token, cuerpo }) {
  return new Promise((resolve) => {
    const req = http.request(`${BASE}${ruta}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); } catch { json = { texto: data.slice(0, 120) }; }
        resolve({ status: res.statusCode, json });
      });
    });
    req.on('error', (e) => resolve({ status: 0, json: { transporte: e.code || e.message } }));
    req.write(cuerpo);
    req.end();
  });
}


test('[B2] rutas de IA autenticadas, límites de body y credencial sin configurar', { timeout: 90000 }, async (t) => {  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'obp-b2-'));
  fs.writeFileSync(path.join(dir, '.env.local'), [
    'NODE_ENV=development',
    'JWT_SECRET=test-b2-secret',
    'API_KEYS_ENCRYPTION_KEY=test-b2-encryption-secret-32ch-x',
    'BOOTSTRAP_SUPERADMIN_PASSWORD=test-password-123',
    `PORT=${PORT}`,
    'HOST=127.0.0.1',
  ].join('\n'));
  fs.mkdirSync(path.join(dir, 'proyectos/negocios/user_alicia'), { recursive: true });

  const authUrl = JSON.stringify(AUTH);
  setupEn(dir, [
    `import { crearUsuarioAdmin, loginUsuario } from ${authUrl};`,
    `crearUsuarioAdmin({ username: 'alicia', email: 'a@test.mx', password: 'pass1234!', displayName: 'a', role: 'user', status: 'active' });`,
    `const s = loginUsuario({ username: 'alicia', password: 'pass1234!' });`,
    `if (!s.success) throw new Error('login: ' + JSON.stringify(s));`,
    `import fs from 'node:fs'; fs.writeFileSync('tok', s.token);`,
  ].join(' '));
  const tok = fs.readFileSync(path.join(dir, 'tok'), 'utf8');

  const env = { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' };
  for (const k of ['JWT_SECRET', 'API_KEYS_ENCRYPTION_KEY', 'NODE_ENV', 'DENUE_KEY', 'INEGI_KEY', 'OLLAMA_KEY', 'BOOTSTRAP_SUPERADMIN_PASSWORD']) delete env[k];
  const child = spawn(process.execPath, [SERVER], { cwd: dir, env, stdio: 'ignore' });
  t.after(() => { child.kill('SIGKILL'); fs.rmSync(dir, { recursive: true, force: true }); });

  let listo = false;
  for (let i = 0; i < 80 && !listo; i++) {
    await new Promise(r => setTimeout(r, 250));
    try { const r = await fetch(`${BASE}/api/health`); if (r.ok) listo = true; } catch { /* no aún */ }
  }
  assert.ok(listo, 'el server de prueba no levantó en 20 s');

  // ---------- sin sesión: las 4 rutas de IA/swarm exigen autenticación ----------
  for (const [metodo, ruta] of [
    ['POST', '/api/ai/account-chat'],
    ['POST', '/api/swarm/interview'],
    ['POST', '/api/swarm/industrialize'],
    ['GET', '/api/swarm/stream/cualquiera'],
  ]) {
    const r = await api(metodo, ruta, metodo === 'GET' ? {} : { body: {} });
    assert.equal(r.status, 401, `${metodo} ${ruta} sin sesión debe dar 401 (llegó ${r.status})`);
    assert.equal(r.json?.code, 'AUTH_REQUIRED');
  }

  // ---------- con sesión: pasan el guard (no son 401) ----------
  const conSesion = await api('POST', '/api/ai/account-chat', { token: tok, body: { prompt: 'hola', provider: 'ollamaCloud' } });
  assert.notEqual(conSesion.status, 401, 'autenticado no puede recibir 401');
  assert.ok([409, 502].includes(conSesion.status), `sin key configurada toca 409 PERSONAL_API_KEY_REQUIRED (llegó ${conSesion.status})`);

  // ---------- body: 1mb global, 8mb en /api/save ----------
  const relleno = 'x'.repeat(2 * 1024 * 1024);
  const logGordo = await postGrande('/api/log', { cuerpo: JSON.stringify({ type: 'stage', message: relleno }) });
  assert.ok(logGordo.status === 413 || logGordo.status === 0, `2 MB a una ruta genérica debe rechazarse (llegó ${logGordo.status})`);
  if (logGordo.status === 413) {
    assert.equal(logGordo.json?.code, 'PAYLOAD_TOO_LARGE', 'el 413 ahora es JSON, no HTML');
  }

  const saveGordo = await postGrande('/api/save', { token: tok, cuerpo: JSON.stringify({ nombre: 'p', config: { id: 'p', projectType: 'negocios', relleno } }) });
  assert.ok(saveGordo.status !== 413 && saveGordo.status !== 0, `2 MB cabe en el límite de 8 MB de /api/save (llegó ${saveGordo.status})`);
  assert.notEqual(saveGordo.status, 401, '/api/save sigue autenticada');

  const saveSinSesion = await api('POST', '/api/save', { body: { nombre: 'p', config: { id: 'p', projectType: 'negocios' } } });
  assert.equal(saveSinSesion.status, 401, 'sin sesión no se guarda, limite de body o no');

  // ---------- /api/ai/proxy con host fuera de la allowlist ----------
  const proxyMalo = await api('POST', '/api/ai/proxy', { token: tok, body: { url: 'http://169.254.169.254/latest/meta-data', method: 'POST', body: {} } });
  assert.equal(proxyMalo.status, 400, 'el proxy rechaza destinos fuera de la allowlist');

  // ---------- INEGI sin credencial: 503 explícito, server vivo ----------
  const inegi = await api('GET', '/api/inegi/denue', { token: tok });
  assert.equal(inegi.status, 503, 'sin DENUE_KEY/INEGI_KEY la ruta responde 503, no 401 de upstream');
  assert.equal(inegi.json?.code, 'INEGI_TOKEN_NOT_CONFIGURED');
  const salud = await api('GET', '/api/health');
  assert.equal(salud.status, 200, 'la ausencia de credencial no tumba el server');

  // ---------- camino feliz que B2 no debe romper ----------
  const proyectos = await api('GET', '/api/projects', { token: tok });
  assert.equal(proyectos.status, 200);
  assert.ok(typeof proyectos.json === 'object' && !Array.isArray(proyectos.json), 'la lista de proyectos sigue siendo el objeto {negocios, social}');
});

test('[B2] allowlist de endpoints de IA: loopback de Ollama adentro, todo lo demás afuera', async () => {
  const { esEndpointDeProveedorPermitido } = await import(path.join(REPO, 'server', 'aiEndpointAllowlist.js'));
  for (const permitido of ['http://localhost:11434', 'http://127.0.0.1:11434/api/generate', 'https://api.groq.com/openai/v1/chat/completions', 'https://api.openai.com/v1/chat/completions']) {
    assert.ok(esEndpointDeProveedorPermitido(permitido), `debería permitir ${permitido}`);
  }
  for (const rechazado of ['http://localhost:9229', 'http://169.254.169.254/latest/meta-data/', 'http://192.168.1.5:11434', 'https://api.ejemplo.com', 'file:///etc/passwd', 'http://groq.com', '', undefined]) {
    assert.ok(!esEndpointDeProveedorPermitido(rechazado), `debería rechazar ${rechazado}`);
  }
});
