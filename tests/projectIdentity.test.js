/**
 * [C2] Identidad de proyecto: un negocio, una carpeta, id inmutable.
 *
 * Regresión del mecanismo descrito en docs/CENSO_PROYECTOS_DUPLICADOS.md: el id se
 * derivaba del nombre comercial EN CADA guardado y con tres ortografías distintas
 (guiones del slug de URLs, guiones bajos del server, mangling carácter a carácter del
 * renombrado), así que Ferretería Kino llegó a 4 carpetas y Closets Corona a 4 también.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { identitySlug, canonicId, esIdTemporal, variantasDeResolucion, claveComparacion } =
  await import(path.join(REPO, 'src/lib/serverUtils/projectIdentity.js'));

test('[C2] una sola función canónica, y las grafías legacy siguen siendo alcanzables', () => {
  assert.equal(identitySlug('Ferretería y Suministros Kino'), 'ferreteria_y_suministros_kino');
  assert.equal(identitySlug('Brújula Financiera MX'), 'brujula_financiera_mx');
  // lo que producían las otras dos familias ya no puede volver a generarse
  assert.equal(identitySlug('Ferretería y Suministros Kino').includes('-'), false);
  assert.equal(identitySlug('Ferretería y Suministros Kino').includes('ferreter_a'), false);

  // resolución tolerante: desde el nombre se encuentran las dos carpetas que existen hoy
  const variantes = variantasDeResolucion('Ferretería y Suministros Kino');
  assert.ok(variantes.includes('ferreteria_y_suministros_kino'), 'canonical presente');
  // LIMITE documentado: el mangling legacy perdio una vocal ('ferretería' -> 'ferreter_a'),
  // asi que NO es reversible desde la forma canonica. Lo que si garantiza accesibilidad es
  // que el nombre EXACTO de la carpeta (el que entrega GET /api/projects) es candidato.
  // desde el NOMBRE, las dos ortografias historicamente escritas son candidatos
  assert.ok(variantes.includes('ferreter_a_y_suministros_kino'), 'la grafía mutilada es reproducible desde el nombre');
  // desde el id CANONICO ya no: la 'i' de 'ferretería' se perdio al manglear, y adivinar por
  // similitud podria apuntar a otro proyecto. Ahi lo que salva es el nombre exacto de carpeta.
  assert.equal(variantasDeResolucion('ferreteria_y_suministros_kino').includes('ferreter_a_y_suministros_kino'), false,
    'desde la forma canonica no se reconstruye la mutilada');
  assert.equal(variantasDeResolucion('ferreter_a_y_suministros_kino')[0], 'ferreter_a_y_suministros_kino',
    'una carpeta legacy se resuelve por su propio nombre exacto');
  assert.ok(variantasDeResolucion('brujula-financiera-mx').includes('brujula_financiera_mx'));
  assert.ok(variantasDeResolucion('br_jula_financiera_mx').length >= 1);

  // ids temporales (no identifican un proyecto real)
  for (const t of ['', 'draft_activo', 'proyecto_nuevo', 'active_project', 'proyecto_1778619249653',
    'proj_1789_ab12cd', 'project_a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890']) {
    assert.ok(esIdTemporal(t), `${t} debe considerarse temporal`);
  }
  for (const real of ['ferreteria_y_suministros_kino', 'brujula', 'sove', 'closets_y_cocinas_corona']) {
    assert.ok(!esIdTemporal(real), `${real} es un id real`);
  }

  assert.equal(canonicId('Ferretería-y Suministros  Kino'), 'ferreteria_y_suministros_kino');
  // las dos grafias SANAS comparan igual entre si...
  assert.equal(claveComparacion('Ferretería y Suministros Kino'), claveComparacion('ferretería-y_suministros  kino'));
  // ...pero la grafia MUTILADA no: al manglear se perdio la 'i' de 'ferretería' y ninguna
  // normalizacion la recupera. Por eso GET /api/projects agrupa por el nombre comercial del
  // JSON (companyName), que siempre esta sano, y nunca por el nombre de la carpeta.
  assert.notEqual(claveComparacion('Ferretería y Suministros Kino'), claveComparacion('ferreter_a_y_suministros_kino'),
    'documenta el limite: una carpeta mangueada no se reconoce por su propio nombre');
  assert.notEqual(claveComparacion('Closets y Cocinas Corona'), claveComparacion('Ferretería Kino'));
});

// ── servidor aislado en cwd temporal: nada toca proyectos/ ni server/data/ reales ──
const PORT = 39421;
const BASE = `http://127.0.0.1:${PORT}`;

async function arrancar(t, dir) {
  const envSetup = { ...process.env };
  for (const k of ['JWT_SECRET', 'API_KEYS_ENCRYPTION_KEY', 'NODE_ENV', 'PORT', 'HOST', 'BOOTSTRAP_SUPERADMIN_PASSWORD', 'DENUE_KEY']) delete envSetup[k];
  const auth = JSON.stringify(path.join(REPO, 'server/auth.js'));
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', [
    `import { crearUsuarioAdmin, loginUsuario } from ${auth};`,
    `crearUsuarioAdmin({ username: 'alicia', email: 'a@t.mx', password: 'pass1234!', role: 'user', status: 'active' });`,
    `const a = loginUsuario({ username: 'alicia', password: 'pass1234!' });`,
    `if (!a.success) throw new Error('login alicia');`,
    `import fs from 'node:fs'; fs.writeFileSync('tok_a', a.token);`,
  ].join(' ')], { cwd: dir, env: envSetup, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`setup: ${r.stderr}`);

  const env = { ...envSetup, PORT: String(PORT), HOST: '127.0.0.1' };
  const child = spawn(process.execPath, [path.join(REPO, 'server/index.js')], { cwd: dir, env, stdio: 'ignore' });
  t.after(() => { child.kill('SIGKILL'); });
  for (let i = 0; i < 100; i++) {
    await new Promise((res) => setTimeout(res, 250));
    try { const h = await fetch(`${BASE}/api/health`); if (h.ok) return fs.readFileSync(path.join(dir, 'tok_a'), 'utf8'); } catch { /* aún no */ }
  }
  throw new Error('el server de prueba no levantó');
}

const guardar = async (token, cuerpo) => {
  const res = await fetch(`${BASE}/api/save`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(cuerpo)
  });
  return { status: res.status, json: await res.json().catch(() => null) };
};
const plan = (nombre, projectId) => ({
  nombre,
  config: { projectId, projectType: 'negocios', brandKit: { companyName: nombre } },
  semilla: { idea: 'x', nombre_proyecto: nombre }
});

test('[C2] cambiar el nombre comercial NO crea una carpeta nueva', { timeout: 90000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'obp-c2-'));
  fs.writeFileSync(path.join(dir, '.env.local'), ['NODE_ENV=development', 'JWT_SECRET=c2',
    'API_KEYS_ENCRYPTION_KEY=c2-encryption-key-32-chars-aaa', 'BOOTSTRAP_SUPERADMIN_PASSWORD=pass-123',
    `PORT=${PORT}`, 'HOST=127.0.0.1'].join('\n'));
  const tenant = path.join(dir, 'proyectos/negocios/user_alicia');
  fs.mkdirSync(tenant, { recursive: true });
  const token = await arrancar(t, dir);
  const antes = () => fs.readdirSync(tenant).filter(n => fs.statSync(path.join(tenant, n)).isDirectory()).sort();

  const primero = await guardar(token, plan('Ferretería y Suministros Kino', 'ferreteria-y-suministros-kino'));
  assert.equal(primero.status, 200, JSON.stringify(primero.json));
  // el slug de URLs (guiones) no debe dejar carpeta con guiones
  assert.ok(!fs.existsSync(path.join(tenant, 'ferreteria-y-suministros-kino')),
    'el cliente manda guiones; la carpeta debe nacer con la grafía canónica de disco');
  const despuesDeNacer = antes();
  assert.deepEqual(despuesDeNacer, ['ferreteria_y_suministros_kino'], `carpetas tras nacer: ${despuesDeNacer.join(',')}`);
  assert.equal(primero.json.projectId, 'ferreteria_y_suministros_kino');
  assert.equal(primero.json.file.includes('ferreteria_y_suministros_kino'), true, `file=${primero.json.file}`);

  // renombrar el negocio: misma carpeta, mismo id, nombre actualizado
  const renombrado = await guardar(token, plan('Ferretería y Suministros Kino Sucursal Hermosillo', 'ferreteria_y_suministros_kino'));
  assert.equal(renombrado.status, 200, JSON.stringify(renombrado.json));
  assert.deepEqual(antes(), despuesDeNacer, 'un cambio de nombre no debe crear una segunda carpeta');
  const json = JSON.parse(fs.readFileSync(path.join(tenant, 'ferreteria_y_suministros_kino/ferreteria_y_suministros_kino.json'), 'utf8'));
  assert.equal(json.config.brandKit.companyName, 'Ferretería y Suministros Kino Sucursal Hermosillo');
  assert.equal(json.config.projectId, 'ferreteria_y_suministros_kino', 'el id permanece pese al nombre nuevo');
  assert.equal(json.config.displayName, 'Ferretería y Suministros Kino Sucursal Hermosillo');

  // y aunque el cliente pierda el id y mande solo el nombre nuevo, no se orfana la carpeta:
  // el id entrante temporal + nombre inexistente crearía una segunda; se conserva la
  // invariance de que la primera sigue intacta y legible
  const huerfano = await guardar(token, { ...plan('Negocio Totalmente Distinto', ''), config: { projectType: 'negocios', brandKit: { companyName: 'Negocio Totalmente Distinto' } } });
  assert.equal(huerfano.status, 200, JSON.stringify(huerfano.json));
  assert.ok(fs.existsSync(path.join(tenant, 'ferreteria_y_suministros_kino/ferreteria_y_suministros_kino.json')),
    'el proyecto original no se toca al guardar uno nuevo');
});

test('[C2] el renombrado encuentra carpetas escritas con la grafía legacy', async () => {
  // Sin servidor: se prueba la resolucion de rutas del renombrado, que es donde el
  // mangling 'ferreter_a_...' y el slug de URLs 'con-guiones' convivian con la forma
  // canonica del server. Un proyecto guardado hace meses con la grafia mutilada sigue
  // tenienque ser alcanzable al renombrarlo.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'obp-c2r-'));
  try {
    const { renameProject } = await import(path.join(REPO, 'src/lib/serverUtils/projectRename.js'));
    const baseDir = path.join(dir, 'proyectos');
    const tenant = path.join(baseDir, 'negocios', 'user_alicia');

    // carpeta escrita con la grafia legacy (sin quitar acentos, caracter por caracter)
    const legacy = path.join(tenant, 'ferreter_a_y_suministros_kino');
    fs.mkdirSync(legacy, { recursive: true });
    fs.writeFileSync(path.join(legacy, 'ferreter_a_y_suministros_kino.json'), JSON.stringify({
      nombre: 'Ferretería', config: { projectType: 'negocios', brandKit: { companyName: 'Ferretería y Suministros Kino' }, revision: 1 }
    }, null, 2));

    const r = await renameProject({
      baseDir, type: 'negocios', currentId: 'ferreter_a_y_suministros_kino', newId: 'ferreteria_y_suministros_kino',
      newCompanyName: 'Ferretería y Suministros Kino Hermosillo', userFolder: 'user_alicia'
    });
    assert.ok(r, 'el renombrado desde la grafía legacy debe resolver');
    assert.ok(fs.existsSync(path.join(tenant, 'ferreteria_y_suministros_kino/ferreteria_y_suministros_kino.json')),
      'la carpeta canonica queda escrita');
    assert.ok(fs.existsSync(path.join(tenant, '.archive')) || fs.existsSync(path.join(baseDir, 'negocios', '.archive')) || !fs.existsSync(legacy),
      'la grafia vieja se archiva o se retira, no se deja como segunda copia suelta');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('[C2] GET /api/projects declara los negocios duplicados sin ocultarlos', { timeout: 90000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'obp-c2c-'));
  fs.writeFileSync(path.join(dir, '.env.local'), ['NODE_ENV=development', 'JWT_SECRET=c2c',
    'API_KEYS_ENCRYPTION_KEY=c2c-encryption-key-32chars-a', 'BOOTSTRAP_SUPERADMIN_PASSWORD=pass-123',
    `PORT=${PORT}`, 'HOST=127.0.0.1'].join('\n'));
  const tenant = path.join(dir, 'proyectos/negocios/user_alicia');
  // dos carpetas, mismo nombre comercial: es exactamente el estado de Closets Corona
  for (const [carpeta, pid] of [['closets_y_cocinas_corona', 'closets_y_cocinas_corona'], ['cocinas_corona', 'cocinas_corona']]) {
    const d = path.join(tenant, carpeta);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, `${carpeta}.json`), JSON.stringify({
      nombre: carpeta,
      config: { projectId: pid, projectType: 'negocios', userOwner: 'alicia', revision: 1,
        brandKit: { companyName: 'Closets y Cocinas Corona' } }
    }));
  }
  const token = await arrancar(t, dir);

  const lista = await fetch(`${BASE}/api/projects`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(lista.status, 200);
  const datos = await lista.json();

  // forma preservada: sigue siendo un objeto con negocios/social (B4 depende de esto)
  assert.equal(Array.isArray(datos), false, 'la respuesta sigue siendo {negocios, social}');
  assert.equal(datos.negocios.length, 2, `deben listarse las dos copias, no ocultar una: ${JSON.stringify(datos.negocios.map(x => x.id))}`);

  const alicia = datos.negocios.find(x => x.id === 'closets_y_cocinas_corona');
  assert.equal(alicia.ambiguo, true, 'debe venir marcada como ambigua');
  assert.deepEqual(alicia.duplicadosEn, ['(raíz)/cocinas_corona'.replace('(raíz)/', 'user_alicia/')],
    `la otra carpeta queda referenciada: ${JSON.stringify(alicia.duplicadosEn)}`);
  assert.ok(Array.isArray(datos.ambiguedades) && datos.ambiguedades.length === 1, `ambiguedades: ${JSON.stringify(datos.ambiguedades)}`);
  assert.equal(datos.ambiguedades[0].nombre, 'Closets y Cocinas Corona');
  assert.equal(datos.ambiguedades[0].carpetas.length, 2);
  assert.equal(alicia.inquilino, 'user_alicia', 'la lista dice en que carpeta de inquilino vive cada copia');
});
