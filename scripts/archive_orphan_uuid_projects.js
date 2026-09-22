/**
 * @file archive_orphan_uuid_projects.js
 * @description Script de limpieza que traslada carpetas huérfanas con nombres UUID
 * (ej. project_1483738a...) a un directorio .archive sin perder información,
 * evitando que aparezcan números raros o proyectos duplicados en el panel del usuario.
 */

import fs from 'fs';
import path from 'path';

const BASE_DIR = path.resolve('proyectos');
const ARCHIVE_DIR = path.join(BASE_DIR, '.archive', 'uuid_orphans');

if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

let movedCount = 0;

['negocios', 'social'].forEach(type => {
  const typeDir = path.join(BASE_DIR, type);
  if (!fs.existsSync(typeDir)) return;

  const inspectDirectory = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      // Si es un directorio de usuario (ej. user_roberto), inspeccionar su contenido
      if (entry.name.startsWith('user_')) {
        inspectDirectory(path.join(dir, entry.name));
        continue;
      }

      const isUuidName = /^project_[a-f0-9_-]{8,}/i.test(entry.name) ||
                         /^[a-f0-9]{8}_[a-f0-9]{4}/i.test(entry.name) ||
                         /^[a-f0-9]{8}-[a-f0-9]{4}/i.test(entry.name);

      if (isUuidName) {
        const sourcePath = path.join(dir, entry.name);
        const targetPath = path.join(ARCHIVE_DIR, `${path.basename(dir)}_${entry.name}`);

        console.log(`[Archive] Moviendo carpeta huérfana: ${sourcePath} -> ${targetPath}`);
        try {
          fs.renameSync(sourcePath, targetPath);
          movedCount++;
        } catch (err) {
          console.error(`[Error] No se pudo mover ${sourcePath}:`, err.message);
        }
      }
    }
  };

  inspectDirectory(typeDir);
});

console.log(`\n✅ Proceso completado: ${movedCount} carpetas huérfanas archivadas con éxito.`);
