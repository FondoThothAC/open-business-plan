/**
 * [B1] Regresión de path traversal y propiedad en los endpoints de logo y logs.
 *
 * Aisla el server en un cwd temporal (patrón de tests/authPersistence.test.js): las rutas
 * de proyecto se construyen con path.resolve('proyectos', …), que es relativo al cwd, así
 * que un cwd temporal da proyectos/ y server/data/ de prueba sin tocar los datos reales.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER = path.join(REPO, 'server', 'index.js');
const AUTH = path.join(REPO, 'server', 'auth.js');
const PORT = 39411;
const BASE = `http://127.0.0.1:${PORT}`;

function runIn(cwd, code) {
  const env = { ...process.env };
  for (const k of ['JWT_SECRET', 'API_KEYS_ENCRYPTION_KEY', 'NODE_ENV', 'PORT', 'HOST']) delete env[k];
  const res = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd, env, encoding: 'utf8' });
  if (res.status !== 0) throw new Error(`setup falló: ${res.stderr}`);
  return res;
}

async function api(method, url, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${url}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  let json = null;
  try { json = await res.json(); } catch { /* sin body JSON */ }
  return { status: res.status, json };
}

const PNG_1PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==';

test('[B1] logo y logs: traversal rechazado y aislamiento por inquilino', { timeout: 90000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'obp-b1-'));
  fs.writeFileSync(path.join(dir, '.env.local'), [
    'NODE_ENV=development',
    'JWT_SECRET=test-b1-secret',
    'API_KEYS_ENCRYPTION_KEY=test-b1-encryption-secret-32chars-xx',
    'BOOTSTRAP_SUPERADMIN_PASSWORD=test-password-123',
    `PORT=${PORT}`,
    'HOST=127.0.0.1',
  ].join('\n'));

  // ----- datos de prueba: dos inquilinos y una raíz compartida trampa -----
  const aliciaJson = path.join(dir, 'proyectos/negocios/user_alicia/proy_a/proy_a.json');
  const aliciaLogs = path.join(dir, 'proyectos/negocios/user_alicia/proy_a_logs.json');
  const bobLogs = path.join(dir, 'proyectos/negocios/user_bob/proy_b_logs.json');
  const sharedLogs = path.join(dir, 'proyectos/negocios/proy_a_logs.json');
  fs.mkdirSync(path.dirname(aliciaJson), { recursive: true });
  fs.mkdirSync(path.dirname(aliciaLogs), { recursive: true });
  fs.mkdirSync(path.dirname(bobLogs), { recursive: true });
  fs.writeFileSync(aliciaJson, JSON.stringify({ config: { id: 'proy_a', projectType: 'negocios', brandKit: {} } }, null, 2));
  fs.writeFileSync(aliciaLogs, JSON.stringify([{ type: 'stage', message: 'log de alicia' }]));
  fs.writeFileSync(bobLogs, JSON.stringify([{ type: 'stage', message: 'log de bob' }]));
  fs.writeFileSync(sharedLogs, JSON.stringify([{ type: 'stage', message: 'LOG RAÍZ COMPARTIDA' }]));

  // ----- usuarios activos (registrarUsuario deja status pending → 403) -----
  const authUrl = JSON.stringify(AUTH);
  runIn(dir, [
    `import { crearUsuarioAdmin, loginUsuario } from ${authUrl};`,
    `for (const u of ['alicia','bob']) {`,
    `  crearUsuarioAdmin({ username: u, email: u + '@test.mx', password: 'pass1234!', displayName: u, role: 'user', status: 'active' });`,
    `}`,
    `const a = loginUsuario({ username: 'alicia', password: 'pass1234!' });`,
    `const b = loginUsuario({ username: 'bob', password: 'pass1234!' });`,
    `if (!a.success || !b.success) throw new Error('no se pudo loguear: ' + JSON.stringify(a) + JSON.stringify(b));`,
    `import fs from 'node:fs';`,
    `fs.writeFileSync('tok_alicia', a.token); fs.writeFileSync('tok_bob', b.token);`,
  ].join(' '));
  const tokA = fs.readFileSync(path.join(dir, 'tok_alicia'), 'utf8');
  const tokB = fs.readFileSync(path.join(dir, 'tok_bob'), 'utf8');

  // ----- server en el cwd temporal -----
  const env = { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' };
  for (const k of ['JWT_SECRET', 'API_KEYS_ENCRYPTION_KEY', 'NODE_ENV']) delete env[k];
  const child = spawn(process.execPath, [SERVER], { cwd: dir, env, stdio: 'ignore' });
  t.after(() => { child.kill('SIGKILL'); fs.rmSync(dir, { recursive: true, force: true }); });

  let listo = false;
  for (let i = 0; i < 80 && !listo; i++) {
    await new Promise(r => setTimeout(r, 250));
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) listo = true;
    } catch { /* todavía no escucha */ }
  }
  assert.ok(listo, 'el server de prueba no levantó en 20 s');

  // ---------- traversal ----------
  const logoType = await api('POST', '/api/logo/save', { token: tokA, body: { projectId: 'proy_a', projectType: '../server/data', dataUrl: PNG_1PX } });
  assert.equal(logoType.status, 400, 'projectType con ../ debe rechazarse con 400');
  assert.equal(logoType.json?.code, 'INVALID_PROJECT_REF');

  const logId = await api('POST', '/api/log', { token: tokA, body: { type: 'stage', message: 'hola', projectId: '../../evil', projectType: 'negocios' } });
  assert.equal(logId.status, 400, 'projectId con ../ debe rechazarse con 400');
  assert.equal(logId.json?.code, 'INVALID_PROJECT_REF');
  assert.ok(!fs.existsSync(path.join(dir, 'evil_logs.json')), 'no debe escribirse fuera de proyectos/');

  const logsType = await api('GET', '/api/projects/telemetry/proy_a/logs', { token: tokA });
  assert.equal(logsType.status, 400, 'tipo fuera de la whitelist debe dar 400');
  const logsId = await api('GET', '/api/projects/negocios/proy_a%2F..%2F..%2Fetc/logs', { token: tokA });
  assert.ok([400, 404].includes(logsId.status), `id con traversal rechazado (llegó ${logsId.status})`);

  // ---------- flujo vivo de la Semilla: sin projectType no persiste, pero responde 200 ----------
  const semilla = await api('POST', '/api/log', { token: tokA, body: { type: 'info', message: 'brain dump', projectId: '' } });
  assert.equal(semilla.status, 200);
  assert.equal(semilla.json?.ok, true, 'el log sin proyecto debe seguir respondiendo {ok:true}');

  // ---------- aislamiento de inquilinos ----------
  const aLees = await api('GET', '/api/projects/negocios/proy_a/logs', { token: tokA });
  assert.equal(aLees.status, 200);
  assert.ok(Array.isArray(aLees.json) && aLees.json.length >= 1, 'alicia ve sus propios logs');

  const bLees = await api('GET', '/api/projects/negocios/proy_a/logs', { token: tokB });
  assert.equal(bLees.status, 200, 'se conserva el contrato: sin archivo propio responde 200 []');
  assert.deepEqual(bLees.json, [], 'bob NO debe ver los logs de alicia ni caer a la raíz compartida');
  assert.ok(fs.existsSync(sharedLogs), 'el log de raíz compartida sigue intacto');

  const bBorra = await api('DELETE', '/api/projects/negocios/proy_a/logs', { token: tokB });
  assert.equal(bBorra.status, 200);
  assert.ok(fs.existsSync(aliciaLogs), 'bob NO pudo borrar los logs de alicia');
  assert.ok(fs.existsSync(sharedLogs), 'bob NO pudo borrar el log de raíz compartida');

  const bBorraPropios = await api('DELETE', '/api/projects/negocios/proy_b/logs', { token: tokB });
  assert.equal(bBorraPropios.status, 200);
  assert.ok(!fs.existsSync(bobLogs), 'bob sí puede borrar sus propios logs');

  // ---------- camino feliz: logo en el proyecto propio ----------
  const logoOk = await api('POST', '/api/logo/save', { token: tokA, body: { projectId: 'proy_a', projectType: 'negocios', dataUrl: PNG_1PX } });
  assert.equal(logoOk.status, 200, `guardar logo propio debe funcionar: ${JSON.stringify(logoOk.json)}`);
  assert.ok(fs.existsSync(path.join(dir, 'proyectos/negocios/user_alicia/proy_a/logo.png')), 'el png queda dentro de la carpeta del proyecto resuelto');
  const pData = JSON.parse(fs.readFileSync(aliciaJson, 'utf8'));
  assert.equal(pData.config.brandKit.logoUrl, PNG_1PX, 'config.brandKit.logoUrl se sincroniza');

  // ---------- logo antes del primer guardado: no es 403, cae a la carpeta propia ----------
  const logoDraft = await api('POST', '/api/logo/save', { token: tokA, body: { projectId: 'borrador_nuevo', projectType: 'negocios', dataUrl: PNG_1PX } });
  assert.equal(logoDraft.status, 200, `proyecto aún no guardado no puede quedar bloqueado: ${JSON.stringify(logoDraft.json)}`);
  assert.ok(fs.existsSync(path.join(dir, 'proyectos/negocios/user_alicia/borrador_nuevo/logo.png')), 'el borrador escribe en la carpeta de alicia');

  // ---------- dataUrl malformed ----------
  const logoMalo = await api('POST', '/api/logo/save', { token: tokA, body: { projectId: 'proy_a', projectType: 'negocios', dataUrl: 'javascript:alert(1)' } });
  assert.equal(logoMalo.status, 400, 'un dataUrl que no es imagen base64 se rechaza');

  // ---------- sin sesión ----------
  const sinSesion = await api('GET', '/api/projects/negocios/proy_a/logs');
  assert.equal(sinSesion.status, 401, 'estos endpoints ya requieren sesión');
});
