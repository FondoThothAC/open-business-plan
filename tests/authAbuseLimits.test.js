/**
 * [C1] Regresión de abuso en autenticación: límite de intentos en login/registro y
 * autenticación ANTES de parsear los bodies grandes (8 MB / 4 MB).
 *
 * El servidor corre aislado en un cwd temporal para no tocar server/data ni proyectos/ reales.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER = path.join(REPO, 'server', 'index.js');
const AUTH = path.join(REPO, 'server', 'auth.js');
const PORT = 39413;
const BASE = `http://127.0.0.1:${PORT}`;

const { createRateLimiter } = await import(path.join(REPO, 'server/rateLimiter.js'));

test('[C1] el limitador bloquea al superar el máximo y se libera al vencer la ventana', () => {
  let ahora = 1_000_000;
  const limitador = createRateLimiter({ windowMs: 60_000, max: 3, now: () => ahora });

  for (let i = 0; i < 3; i++) {
    assert.equal(limitador.check('k').allowed, true, `intento ${i + 1} aún permitido`);
    limitador.hit('k');
  }
  const bloqueado = limitador.check('k');
  assert.equal(bloqueado.allowed, false, 'al llegar al máximo se bloquea');
  assert.ok(bloqueado.retryAfterSec >= 1 && bloqueado.retryAfterSec <= 60, 'informa cuánto esperar');

  assert.equal(limitador.check('otra').allowed, true, 'las claves son independientes');

  ahora += 60_001;
  assert.equal(limitador.check('k').allowed, true, 'la ventana vencida libera la clave');
});

test('[C1] reset libera la clave y el almacén no crece sin límite', () => {
  const ahora = 5_000;
  const limitador = createRateLimiter({ windowMs: 60_000, max: 1, now: () => ahora, maxKeys: 50 });
  limitador.hit('a');
  assert.equal(limitador.check('a').allowed, false);
  limitador.reset('a');
  assert.equal(limitador.check('a').allowed, true, 'reset borra el contador');

  for (let i = 0; i < 500; i++) limitador.hit(`ip-${i}`);
  assert.ok(limitador.size() <= 50, `el almacén respeta maxKeys (tamaño ${limitador.size()})`);
});

function postGrande(ruta, cuerpo, token) {
  return new Promise((resolve) => {
    const req = http.request(`${BASE}${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
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

async function post(ruta, body) {
  const res = await fetch(`${BASE}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  let json;
  try { json = await res.json(); } catch { /* sin body */ }
  return { status: res.status, json, retryAfter: res.headers.get('retry-after') };
}

test('[C1] login con fuerza bruta → 429; body grande sin sesión → 401 sin parsear', { timeout: 90000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'obp-c1-'));
  fs.writeFileSync(path.join(dir, '.env.local'), [
    'NODE_ENV=development',
    'JWT_SECRET=test-c1-secret',
    'API_KEYS_ENCRYPTION_KEY=test-c1-encryption-secret-32ch-x',
    'BOOTSTRAP_SUPERADMIN_PASSWORD=test-password-123',
    `PORT=${PORT}`,
    'HOST=127.0.0.1'
  ].join('\n'));

  const authUrl = JSON.stringify(AUTH);
  const setup = spawnSync(process.execPath, ['--input-type=module', '-e', [
    `import { crearUsuarioAdmin } from ${authUrl};`,
    `crearUsuarioAdmin({ username: 'alicia', email: 'a@test.mx', password: 'pass1234!', displayName: 'a', role: 'user', status: 'active' });`
  ].join(' ')], { cwd: dir, encoding: 'utf8' });
  assert.equal(setup.status, 0, `setup falló: ${setup.stderr}`);

  const env = { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' };
  for (const k of ['JWT_SECRET', 'API_KEYS_ENCRYPTION_KEY', 'NODE_ENV', 'BOOTSTRAP_SUPERADMIN_PASSWORD']) delete env[k];
  const child = spawn(process.execPath, [SERVER], { cwd: dir, env, stdio: 'ignore' });
  t.after(() => { child.kill('SIGKILL'); fs.rmSync(dir, { recursive: true, force: true }); });

  let listo = false;
  for (let i = 0; i < 80 && !listo; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try { const r = await fetch(`${BASE}/api/health`); if (r.ok) listo = true; } catch { /* aún no */ }
  }
  assert.ok(listo, 'el server de prueba no levantó en 20 s');

  // ---------- body grande sin sesión: 401 y no se bufferea ----------
  const relleno = 'x'.repeat(3 * 1024 * 1024);
  for (const ruta of ['/api/save', '/api/logo/save', '/api/ai/proxy', '/api/market/enrich']) {
    const r = await postGrande(ruta, JSON.stringify({ relleno }));
    assert.ok(r.status === 401 || r.status === 0, `${ruta} sin sesión debe rechazarse con 401 (llegó ${r.status})`);
    if (r.status === 401) assert.equal(r.json?.code, 'AUTH_REQUIRED');
  }

  // ---------- login: contraseña correcta funciona antes del abuso ----------
  const bueno = await post('/api/auth/login', { username: 'alicia', password: 'pass1234!' });
  assert.equal(bueno.status, 200, 'el login legítimo no se ve afectado');

  // ---------- fuerza bruta contra un usuario: 401 hasta el umbral y luego 429 ----------
  const estados = [];
  for (let i = 0; i < 12; i++) {
    const r = await post('/api/auth/login', { username: 'alicia', password: `mala-${i}` });
    estados.push(r.status);
    if (r.status === 429) {
      assert.ok(Number(r.retryAfter) >= 1, '429 incluye Retry-After');
      assert.equal(r.json?.code, 'RATE_LIMITED');
      break;
    }
  }
  assert.ok(estados.includes(429), `la fuerza bruta debe terminar en 429 (estados: ${estados.join(',')})`);
  assert.ok(estados.filter((s) => s === 401).length >= 5, 'hay margen para errores humanos antes de bloquear');

  // ---------- bloqueado: ni siquiera la contraseña correcta pasa mientras dura el bloqueo ----------
  const bloqueado = await post('/api/auth/login', { username: 'alicia', password: 'pass1234!' });
  assert.equal(bloqueado.status, 429, 'durante el bloqueo se rechaza también la contraseña correcta');

  // ---------- registro: ráfaga → 429 ----------
  const registros = [];
  for (let i = 0; i < 15; i++) {
    const r = await post('/api/auth/register', { username: `u${i}`, email: `u${i}@t.mx`, password: 'pass1234!', displayName: `U${i}` });
    registros.push(r.status);
    if (r.status === 429) break;
  }
  assert.ok(registros.includes(429), `la ráfaga de registros debe terminar en 429 (estados: ${registros.join(',')})`);
});
