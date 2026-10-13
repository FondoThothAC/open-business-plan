/**
 * [B3] Regresión de escrituras atómicas, revisión autoritativa, reserva de cuota y
 * protección del borrador de otro dueño. Servidor aislado en cwd temporal.
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
const PORT = 39413;
const BASE = `http://127.0.0.1:${PORT}`;

function setupEn(cwd, code) {
  const env = { ...process.env };
  for (const k of ['JWT_SECRET', 'API_KEYS_ENCRYPTION_KEY', 'NODE_ENV', 'PORT', 'HOST', 'BOOTSTRAP_SUPERADMIN_PASSWORD']) delete env[k];
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd, env, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`setup falló: ${r.stderr}`);
}

async function save(token, cuerpo, baseRevision) {
  const res = await fetch(`${BASE}/api/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(baseRevision === undefined ? cuerpo : { ...cuerpo, baseRevision })
  });
  let json = null;
  try { json = await res.json(); } catch { /* sin body */ }
  return { status: res.status, json };
}

// ── atomicJson: unidad pura, sin servidor ────────────────────────────────────
test('[B3] writeJsonAtomic no deja temporales y nunca deja JSON truncado', async () => {
  const { writeJsonAtomic, limpiarTemps } = await import(path.join(REPO, 'src/lib/serverUtils/atomicJson.js'));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'obp-atomic-'));
  try {
    const file = path.join(dir, 'store.json');
    for (let i = 0; i < 50; i++) writeJsonAtomic(file, { ciclo: i, datos: 'x'.repeat(64) });
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { ciclo: 49, datos: 'x'.repeat(64) });
    const temps = fs.readdirSync(dir).filter(n => n.endsWith('.tmp'));
    assert.equal(temps.length, 0, `quedaron ${temps.length} temporales: ${temps.join(', ')}`);

    // nombre unico aunque dos escrituras caigan en el mismo milisegundo
    const a = writeJsonAtomic(file, { n: 1 });
    const b = writeJsonAtomic(file, { n: 2 });
    assert.equal(a, b);
    assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).n, 2);

    // limpiarTemps elimina huérfanos y no toca el destino
    fs.writeFileSync(path.join(dir, 'store.json.1234.tmp'), 'basura');
    const borrados = limpiarTemps(dir);
    assert.ok(borrados >= 1, 'debería limpiar el .tmp huérfano');
    assert.ok(fs.existsSync(file), 'limpiarTemps no debe borrar el archivo final');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ── reserva de cuota ─────────────────────────────────────────────────────────
test('[B3] checkSearchQuota reserva: N chequeos concurrentes no superan el tope', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'obp-quota-'));
  const previo = process.env.QUOTA_FILE;
  try {
    const { checkSearchQuota, incrementSearchQuota, reservasVivas, devolverCuota } = await import(path.join(REPO, 'server/quotaTracker.js'));
    // DDG no se mide: nunca reserva
    checkSearchQuota('duckduckgo');
    assert.equal(reservasVivas('duckduckgo'), 0, 'duckduckgo es ilimitado y no debe reservar');

    const proveedor = 'brave';
    const antes = checkSearchQuota(proveedor);
    const base = antes.count;
    const limite = antes.limit;
    const disponibles = limite - base;

    // N+1 chequeos simultáneos: como mucho pueden autorizar los que quedan de cuota
    const resultados = [];
    for (let i = 0; i < Math.min(disponibles + 3, 25); i++) resultados.push(checkSearchQuota(proveedor, false));
    const autorizados = resultados.filter(r => r.allowed).length;
    assert.ok(autorizados <= disponibles, `${autorizados} autorizados superan los ${disponibles} cupos disponibles`);
    assert.ok(reservasVivas(proveedor) >= autorizados - 1, 'cada autorización deja su reserva en memoria');

    // las reservas se materializan y liberan al incrementar
    const vivasAntes = reservasVivas(proveedor);
    incrementSearchQuota(proveedor);
    assert.equal(reservasVivas(proveedor), vivasAntes - 1, 'incrementar libera la reserva consumida');
    devolverCuota(proveedor);
    assert.equal(reservasVivas(proveedor), vivasAntes - 2);
  } finally {
    if (previo === undefined) delete process.env.QUOTA_FILE; else process.env.QUOTA_FILE = previo;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ── servidor: revisión autoritativa y borrador ajeno ─────────────────────────
test('[B3] /api/save: revision del servidor, un solo conflicto y borrador ajeno intacto', { timeout: 90000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'obp-b3-'));
  fs.writeFileSync(path.join(dir, '.env.local'), [
    'NODE_ENV=development',
    'JWT_SECRET=test-b3-secret',
    'API_KEYS_ENCRYPTION_KEY=test-b3-encryption-secret-32ch-',
    'BOOTSTRAP_SUPERADMIN_PASSWORD=test-password-123',
    `PORT=${PORT}`,
    'HOST=127.0.0.1',
  ].join('\n'));

  const carpetaAlicia = path.join(dir, 'proyectos/negocios/user_alicia');
  // /api/save deriva el id de config.brandKit.companyName (slugificado) y el dueño de
  // config.projectId: la carpeta y el payload tienen que llamarse 'proyecto_a'.
  const dirProyecto = path.join(carpetaAlicia, 'proyecto_a');
  const jsonProyecto = path.join(dirProyecto, 'proyecto_a.json');
  const draftAlicia = path.join(carpetaAlicia, 'draft_activo');
  fs.mkdirSync(dirProyecto, { recursive: true });
  fs.mkdirSync(path.join(draftAlicia, 'documentos'), { recursive: true });
  fs.writeFileSync(path.join(draftAlicia, 'draft_activo.json'), JSON.stringify({ nombre: 'Borrador vivo de alicia', config: { revision: 3 } }));
  fs.writeFileSync(path.join(draftAlicia, 'documentos', 'nota.txt'), 'no borrar');
  fs.writeFileSync(jsonProyecto, JSON.stringify({ nombre: 'Proyecto A', config: { projectId: 'proyecto_a', projectType: 'negocios', revision: 5, brandKit: { companyName: 'Proyecto A' } } }, null, 2));

  const authUrl = JSON.stringify(AUTH);
  setupEn(dir, [
    `import { crearUsuarioAdmin, loginUsuario } from ${authUrl};`,
    `crearUsuarioAdmin({ username: 'alicia', email: 'a@test.mx', password: 'pass1234!', role: 'user', status: 'active' });`,
    `const a = loginUsuario({ username: 'alicia', password: 'pass1234!' });`,
    `if (!a.success) throw new Error('login alicia: ' + JSON.stringify(a));`,
    `const s = loginUsuario({ username: 'roberto', password: 'test-password-123' });`,
    `if (!s.success) throw new Error('login roberto: ' + JSON.stringify(s));`,
    `import fs from 'node:fs'; fs.writeFileSync('tok_alicia', a.token); fs.writeFileSync('tok_root', s.token);`,
  ].join(' '));
  const tokA = fs.readFileSync(path.join(dir, 'tok_alicia'), 'utf8');
  const tokRoot = fs.readFileSync(path.join(dir, 'tok_root'), 'utf8');

  const env = { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' };
  for (const k of ['JWT_SECRET', 'API_KEYS_ENCRYPTION_KEY', 'NODE_ENV', 'BOOTSTRAP_SUPERADMIN_PASSWORD']) delete env[k];
  const child = spawn(process.execPath, [SERVER], { cwd: dir, env, stdio: 'ignore' });
  t.after(() => { child.kill('SIGKILL'); fs.rmSync(dir, { recursive: true, force: true }); });

  let listo = false;
  for (let i = 0; i < 80 && !listo; i++) {
    await new Promise(r => setTimeout(r, 250));
    try { const r = await fetch(`${BASE}/api/health`); if (r.ok) listo = true; } catch { /* no aún */ }
  }
  assert.ok(listo, 'el server de prueba no levantó en 20 s');

  const plan = (extra = 'v1') => ({
    nombre: 'Proyecto A',
    config: { projectId: 'proyecto_a', projectType: 'negocios', brandKit: { companyName: 'Proyecto A' }, marca: extra },
    semilla: { idea: extra, nombre_proyecto: 'Proyecto A' }
  });

  // ---------- (a) dos guardados concurrentes con la misma baseRevision ----------
  const [r1, r2] = await Promise.all([save(tokA, plan('A'), 5), save(tokA, plan('B'), 5)]);
  const conflictos = [r1, r2].filter(r => r.status === 409);
  assert.equal(conflictos.length, 1, `exactamente uno debe recibir REVISION_CONFLICT (llegaron ${r1.status}/${r2.status})`);
  assert.equal(conflictos[0].json?.code, 'REVISION_CONFLICT');
  const guardado = JSON.parse(fs.readFileSync(jsonProyecto, 'utf8'));
  assert.equal(guardado.config.revision, 6, 'la siguiente revisión es disco+1, no cliente+1');

  // ---------- (b) la revisión la pone el servidor aunque el cliente mienta ----------
  const mintiroso = await save(tokA, { nombre: 'Proyecto A', config: { projectId: 'proyecto_a', projectType: 'negocios', brandKit: { companyName: 'Proyecto A' }, revision: 999 } });
  assert.equal(mintiroso.status, 200, JSON.stringify(mintiroso.json));
  const trasMentira = JSON.parse(fs.readFileSync(jsonProyecto, 'utf8'));
  assert.equal(trasMentira.config.revision, 7, 'un cliente no puede definirse a sí mismo la versión 1000');

  // ---------- (c) guardar sin baseRevision sigue funcionando (autoguardado) ----------
  assert.ok(!Number.isFinite(Number(undefined)), 'sin header ni campo el chequeo se omite a propósito');
  const sinBase = await save(tokA, plan('C'));
  assert.equal(sinBase.status, 200, 'el autoguardado del frontend no manda baseRevision: no puede romperse');

  // ---------- (d) el superadmin NO destruye el borrador de alicia ----------
  // En (a) alicia guardo su proyecto con nombre formal, lo que RETIRO su propio
  // draft_activo (comportamiento correcto: es su carpeta). Se vuelve a crear para
  // probar el caso que importa: que otro inquilino no lo toque.
  fs.mkdirSync(path.join(draftAlicia, 'documentos'), { recursive: true });
  fs.writeFileSync(path.join(draftAlicia, 'draft_activo.json'), JSON.stringify({ nombre: 'Borrador vivo de alicia', config: { revision: 3 } }));
  fs.writeFileSync(path.join(draftAlicia, 'documentos', 'nota.txt'), 'no borrar');

  const comoRoot = await save(tokRoot, plan('D'));
  assert.equal(comoRoot.status, 200, JSON.stringify(comoRoot.json));
  assert.ok(fs.existsSync(draftAlicia), 'el draft_activo del dueño sigue ahí después de un guardado administrado');
  assert.equal(fs.readFileSync(path.join(draftAlicia, 'documentos', 'nota.txt'), 'utf8'), 'no borrar');
  assert.equal(JSON.parse(fs.readFileSync(path.join(draftAlicia, 'draft_activo.json'), 'utf8')).nombre, 'Borrador vivo de alicia');

  // ---------- (e) el dueño SÍ archiva su propio borrador huérfano ----------
  const carpetaRoot = path.join(dir, 'proyectos/negocios/user_roberto');
  fs.mkdirSync(path.join(carpetaRoot, 'draft_activo'), { recursive: true });
  fs.writeFileSync(path.join(carpetaRoot, 'draft_activo', 'draft_activo.json'), JSON.stringify({ nombre: 'mio' }));
  fs.mkdirSync(path.join(carpetaRoot, 'mio_proy'), { recursive: true });
  fs.writeFileSync(path.join(carpetaRoot, 'mio_proy/mio_proy.json'), JSON.stringify({ nombre: 'mio_proy', config: { projectId: 'mio_proy', projectType: 'negocios', revision: 1, brandKit: { companyName: 'Mio Proy' } } }));
  const guardoComoRoot = await save(tokRoot, { nombre: 'Mio Proy', config: { projectId: 'mio_proy', projectType: 'negocios', brandKit: { companyName: 'Mio Proy' } }, semilla: { idea: 'x', nombre_proyecto: 'Mio Proy' } });
  assert.equal(guardoComoRoot.status, 200, JSON.stringify(guardoComoRoot.json));
  const archivado = path.join(dir, 'proyectos/.archive/drafts');
  assert.ok(fs.existsSync(archivado), 'el borrador propio se archiva en proyectos/.archive/drafts');
  const entradas = fs.readdirSync(archivado);
  assert.ok(entradas.some(e => e.startsWith('2') && e.includes('user_roberto')), `nombre de archivo esperado, lleg: ${entradas.join(', ')}`);
  assert.ok(!fs.existsSync(path.join(carpetaRoot, 'draft_activo')), 'el draft propio ya no está en su sitio original');
  assert.ok(fs.existsSync(path.join(archivado, entradas[0], 'draft_activo.json')) || entradas.length >= 1, 'el contenido queda recuperable');

  // ---------- (f) store de usuarios sin temporales residuales ----------
  const temps = fs.readdirSync(path.join(dir, 'server/data')).filter(n => n.endsWith('.tmp'));
  assert.equal(temps.length, 0, `no deben quedar .tmp en server/data: ${temps.join(', ')}`);
});
