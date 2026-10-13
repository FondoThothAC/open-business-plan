/**
 * [B3] Escritura atómica de los almacenes JSON del servidor.
 *
 * Por qué: varios stores hacían `fs.writeFileSync(file + '.tmp.' + Date.now())` y
 * `renameSync`. Con dos escrituras en el mismo milisegundo los temp files colisionaban,
 * y un writeFileSync directo sobre el archivo final deja JSON truncado si el proceso
 * muere a mitad (o si un segundo lector lo abre en ese instante).
 *
 * Por qué NO un mutex de promesas: las rutas de usuarios son síncronas de punta a punta
 * (bcrypt.hashSync, readFileSync) y PM2 corre instances:1, así que un read-modify-write
 * sin await ya es indivisible dentro del proceso. Asyncronizar auth.js habría obligado a
 * awaitear en buscarPorId, que authGuard ejecuta en CADA request autenticado de las ~134
 * rutas. La misma garantía se logra aquí con tmp único + fsync + rename.
 *
 * El nombre del temp sigue el patrón que ya existía en server/reviewStore.js:12
 * (pid + timestamp + contador) y se le añade aleatoriedad para el caso de dos procesos.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

let contador = 0;

function nombreTemp(file) {
  contador += 1;
  const ruido = crypto.randomBytes(3).toString('hex');
  return `${file}.${process.pid}.${Date.now()}.${contador}.${ruido}.tmp`;
}

/**
 * Escribe `data` en `file` de forma atómica: tmp -> fsync -> rename.
 * @param {string} file destino
 * @param {any} data objeto serializable
 * @param {{ indent?: number|string|null }} opciones indent null = compacto
 */
export function writeJsonAtomic(file, data, { indent = 2 } = {}) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const texto = JSON.stringify(data, null, indent);
  if (texto === undefined) throw new Error(`writeJsonAtomic: dato no serializable para ${file}`);
  const temp = nombreTemp(file);

  const fd = fs.openSync(temp, 'wx');
  try {
    fs.writeFileSync(fd, texto, 'utf8');
    fs.fsyncSync(fd);          // el contenido llega a disco antes del rename
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(temp, file);   // rename es atómico dentro del mismo filesystem
  return file;
}

/**
 * Escribe texto ya serializado de forma atómica (para los .md, .jsonl, etc.).
 */
export function writeTextAtomic(file, texto) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const temp = nombreTemp(file);
  const fd = fs.openSync(temp, 'wx');
  try {
    fs.writeFileSync(fd, texto, 'utf8');
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(temp, file);
  return file;
}

/**
 * Elimina .tmp huérfanos de ejecuciones anteriores. Los archivos de destino nunca llevan
 * este sufijo, así que borrarlos por patrón es seguro.
 * @param {string} dir directorio a limpiar
 * @param {{ olderThanMs?: number }} opciones
 */
export function limpiarTemps(dir, { olderThanMs = 0 } = {}) {
  let borrados = 0;
  try {
    if (!fs.existsSync(dir)) return 0;
    const ahora = Date.now();
    for (const entrada of fs.readdirSync(dir)) {
      if (!entrada.endsWith('.tmp')) continue;
      const ruta = path.join(dir, entrada);
      try {
        if (olderThanMs > 0 && ahora - fs.statSync(ruta).mtimeMs < olderThanMs) continue;
        fs.rmSync(ruta, { force: true });
        borrados += 1;
      } catch { /* otro proceso lo limpió primero */ }
    }
  } catch (err) {
    console.warn('[atomicJson] no se pudo limpiar temporales de', dir, err.message);
  }
  return borrados;
}
