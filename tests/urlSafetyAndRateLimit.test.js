/**
 * [B6] Regresión del validador de URLs (SSRF) y de la cola serial del limiter de DDG.
 *
 * Se prueba la unidad (urlSafety / serialQueue) y la entrada de la ruta HTTP. No se lanza
 * Chromium en ningún caso: la validación ocurre antes de puppeteer.launch(), así que el
 * test de /api/scrape/social es verde sin navegador y sin dependencias de mock (el repo no
 * tiene framework de mocks y en ESM no se parcha un namespace importado).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { assertSafeExternalUrl, isSafeUrlShapeSync, esIpPrivada, hostnameDe, perteneceADominio } =
  await import(path.join(REPO, 'server/urlSafety.js'));
const { createThrottledQueue } = await import(path.join(REPO, 'server/serialQueue.js'));

const NO_PERMITIDAS_SINC = [
  'file:///etc/passwd',
  'ftp://127.0.0.1/archivo',
  'http://127.0.0.1:9229/json/list',
  'http://localhost:3001/api/health',
  'http://169.254.169.254/latest/meta-data/',
  'http://192.168.1.15/',
  'http://10.0.0.1/',
  'http://172.16.5.4/',
  'http://[::1]:3001/',
  'http://servidor.local/',
  'http://metadata.google.internal/',
  'http://usuario:clave@ejemplo.com/',
  'no-es-una-url',
  '',
  // evasiones numericas de loopback: el parser WHATWG las normaliza ANTES de nuestro chequeo
  'http://2130706433/',
  'http://0x7f000001/',
  'http://127.1/',
  'http://[0:0:0:0:0:0:0:1]/'
];

const PERMITIDAS_SINC = [
  'https://www.facebook.com/maricarmen',
  'https://listado.mercadolibre.com.mx/carne',
  'http://ejemplo.com/recurso',
  'https://sub.dominio.institucional.mx/x'
];

test('[B6] isSafeUrlShapeSync rechaza esquemas, puertos, userinfo e hosts internos', () => {
  for (const u of NO_PERMITIDAS_SINC) {
    assert.ok(!isSafeUrlShapeSync(u), `debería rechazar ${JSON.stringify(u)}`);
  }
  for (const u of PERMITIDAS_SINC) {
    assert.ok(isSafeUrlShapeSync(u), `debería aceptar ${JSON.stringify(u)}`);
  }
});

test('[B6] esIpPrivada cubre los rangos que importan en un VPS', () => {
  const privadas = ['0.0.0.0', '10.1.2.3', '100.64.0.1', '100.127.255.255', '127.0.0.1', '127.9.9.9',
    '169.254.169.254', '172.16.0.1', '172.31.255.255', '192.0.2.1', '192.168.0.1', '198.18.0.1',
    '203.0.113.10', '224.0.0.1', '240.0.0.1', '::1', '::', 'fe80::1', 'fc00::1', 'fd12::34', 'ff02::1',
    '::ffff:127.0.0.1', '[::1]', '10.0.0.256'];
  for (const ip of privadas) assert.ok(esIpPrivada(ip), `${ip} debería considerarse privada/no enrutable`);

  const publicas = ['8.8.8.8', '172.32.0.1', '100.128.0.1', '192.167.1.1', '2001:4860:4860::8888', '187.0.0.1'];
  for (const ip of publicas) assert.ok(!esIpPrivada(ip), `${ip} debería ser enrutable`);
});

test('[B6] assertSafeExternalUrl rechaza antes de navegar y no revela el motivo', async () => {
  for (const u of ['file:///etc/passwd', 'http://127.0.0.1:9229/', 'http://169.254.169.254/']) {
    await assert.rejects(() => assertSafeExternalUrl(u), (err) => {
      assert.equal(err.name, 'UrlNoPermitida');
      assert.equal(err.code, 'URL_NOT_ALLOWED');
      // no se distingue "es privada" de "no resuelve" para no regalar un oráculo
      assert.equal(err.message, 'URL no permitida.');
      return true;
    }, `debería rechazar ${u}`);
  }
  await assert.rejects(() => assertSafeExternalUrl('host-inexistente-obp-b6.invalid/x'), undefined, 'host que no resuelve debe rechazarse');
  const ok = await assertSafeExternalUrl('https://www.google.com/');
  assert.equal(ok.url.hostname, 'www.google.com');
  assert.ok(ok.ips.length > 0 && !ok.ips.some(esIpPrivada), 'un host público resuelve a IPs públicas');
});

test('[B6] el filtro por hostname mata el payload ?x=facebook.com', () => {
  const malicioso = 'https://127.0.0.1:9229/?x=facebook.com';
  const host = hostnameDe(malicioso);
  assert.equal(host, '127.0.0.1');
  assert.ok(!perteneceADominio(host, 'facebook.com'), 'el substring ya no debe contar como perfil de Facebook');
  assert.ok(malicioso.toLowerCase().includes('facebook.com'), 'el substring sigue presente en la URL: por eso includes() fallaba');

  assert.ok(perteneceADominio('www.facebook.com', 'facebook.com'));
  assert.ok(perteneceADominio('facebook.com', 'facebook.com'));
  assert.ok(!perteneceADominio('nofacebook.com', 'facebook.com'));
  assert.ok(!perteneceADominio('facebook.com.ejemplo.mx', 'facebook.com'));
  assert.ok(perteneceADominio('listado.mercadolibre.com.mx', 'mercadolibre.com.mx'));
});

test('[B6] la cola serial espacia ejecuciones concurrentes y no se rompe con errores', async () => {
  const intervalo = 250;
  const q = createThrottledQueue({ intervalMs: intervalo });
  const marcas = [];
  const inicio = Date.now();
  const tareas = [1, 2, 3, 4].map((n) => q.run(async () => { marcas.push(Date.now() - inicio); return n; }));
  const resultados = await Promise.all(tareas);

  assert.deepEqual(resultados, [1, 2, 3, 4], 'el orden y los resultados se conservan');
  assert.equal(marcas.length, 4);
  for (let i = 1; i < marcas.length; i++) {
    assert.ok(marcas[i] - marcas[i - 1] >= intervalo - 15, `hueco ${i} = ${marcas[i] - marcas[i - 1]} ms < ${intervalo} ms`);
  }

  const q2 = createThrottledQueue({ intervalMs: 5 });
  const a = q2.run(() => Promise.resolve('a'));
  const b = q2.run(() => Promise.reject(new Error('boom'))).catch((e) => e.message);
  const c = await q2.run(() => Promise.resolve('c'));
  assert.deepEqual([await a, await b, c], ['a', 'boom', 'c'], 'un rechazo no envenena la cola');
  assert.equal(q2.pendientes(), 0, 'la cola no deja trabajos colgados');
});

test('[B6] /api/scrape/social responde 400 sin lanzar Chromium', { timeout: 90000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'obp-b6-'));
  fs.writeFileSync(path.join(dir, '.env.local'), [
    'NODE_ENV=development', 'JWT_SECRET=test-b6-secret',
    'API_KEYS_ENCRYPTION_KEY=test-b6-encryption-secret-32chars',
    'BOOTSTRAP_SUPERADMIN_PASSWORD=test-password-123', 'PORT=39414', 'HOST=127.0.0.1'
  ].join('\n'));
  fs.mkdirSync(path.join(dir, 'proyectos/negocios'), { recursive: true });

  // El login HTTP no devuelve el JWT a proposito (usa cookie HttpOnly), asi que el token se
  // obtiene por auth.js dentro del cwd temporal, igual que en los tests de B1 y B3.
  const { spawnSync } = await import('node:child_process');
  const envSetup = { ...process.env };
  for (const k of ['JWT_SECRET', 'API_KEYS_ENCRYPTION_KEY', 'NODE_ENV', 'PORT', 'HOST']) delete envSetup[k];
  const codigo = [
    `import { loginUsuario } from ${JSON.stringify(path.join(REPO, 'server/auth.js'))};`,
    `const r = loginUsuario({ username: 'roberto', password: 'test-password-123' });`,
    `if (!r.success) throw new Error('login: ' + JSON.stringify(r));`,
    `import fs from 'node:fs'; fs.writeFileSync('tok', r.token);`
  ].join(' ');
  const setupRes = spawnSync(process.execPath, ['--input-type=module', '-e', codigo], { cwd: dir, env: envSetup, encoding: 'utf8' });
  if (setupRes.status !== 0) throw new Error(`setup: ${setupRes.stderr}`);
  const token = fs.readFileSync(path.join(dir, 'tok'), 'utf8');

  const env = { ...process.env, PORT: '39414', HOST: '127.0.0.1' };
  for (const k of ['JWT_SECRET', 'API_KEYS_ENCRYPTION_KEY', 'NODE_ENV', 'BOOTSTRAP_SUPERADMIN_PASSWORD']) delete env[k];
  const child = spawn(process.execPath, [path.join(REPO, 'server/index.js')], { cwd: dir, env, stdio: 'ignore' });
  t.after(() => { child.kill('SIGKILL'); fs.rmSync(dir, { recursive: true, force: true }); });

  let listo = false;
  for (let i = 0; i < 80 && !listo; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try { const h = await fetch('http://127.0.0.1:39414/api/health'); if (h.ok) listo = true; } catch { /* aún no */ }
  }
  assert.ok(listo, 'el server de prueba no levantó en 20 s');

  for (const url of ['file:///etc/passwd', 'http://127.0.0.1:9229/json/list', 'http://169.254.169.254/latest/meta-data/']) {
    const t0 = Date.now();
    const res = await fetch('http://127.0.0.1:39414/api/scrape/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url })
    });
    const duracion = Date.now() - t0;
    assert.equal(res.status, 400, `${url} debería dar 400`);
    const json = await res.json();
    assert.equal(json.code, 'URL_NOT_ALLOWED');
    // Chromium tarda segundos en lanzarse y el goto otros 20 s de timeout: si la respuesta
    // es inmediata, es evidencia de que el navegador nunca se levantó.
    assert.ok(duracion < 3000, `la ruta no debería lanzar Chromium (tardó ${duracion} ms)`);
  }

  const sinUrl = await fetch('http://127.0.0.1:39414/api/scrape/social', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({})
  });
  assert.equal(sinUrl.status, 400, 'URL requerida sigue devolviendo 400');
});
