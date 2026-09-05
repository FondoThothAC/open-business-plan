import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { renameProject } from '../src/lib/serverUtils/projectRename.js';

test('TDD: Renombrado Seguro y Consolidación de Proyectos (Rename Endpoint)', async (t) => {
  const baseDir = path.resolve('tests/scratch_projects/rename_test_base');
  const type = 'negocios';

  t.beforeEach(() => {
    if (fs.existsSync(baseDir)) {
      fs.rmSync(baseDir, { recursive: true, force: true });
    }
    fs.mkdirSync(path.join(baseDir, type), { recursive: true });
  });

  t.afterEach(() => {
    if (fs.existsSync(baseDir)) {
      fs.rmSync(baseDir, { recursive: true, force: true });
    }
  });

  await t.test('debe renombrar un proyecto existente actualizando archivos y metadata', () => {
    const oldId = 'proyecto_viejo';
    const oldDir = path.join(baseDir, type, oldId);
    fs.mkdirSync(oldDir, { recursive: true });

    const originalPlan = {
      config: { projectId: oldId, projectType: 'business' },
      semilla: { nombre_proyecto: 'Proyecto Viejo', inversion_esperada: '5000000' },
      naturaleza: {
        introduccion: { origen: 'Texto detallado del proyecto inicial' }
      }
    };

    fs.writeFileSync(path.join(oldDir, `${oldId}.json`), JSON.stringify(originalPlan, null, 2));

    const newId = 'proyecto_nuevo_oficial';
    const result = renameProject({
      baseDir,
      type,
      currentId: oldId,
      newId
    });

    assert.equal(result.success, true);
    assert.equal(result.newId, newId);

    // Verificar que el nuevo directorio y archivos existen
    const newDir = path.join(baseDir, type, newId);
    assert.ok(fs.existsSync(newDir), 'El nuevo directorio debe existir');
    assert.ok(fs.existsSync(path.join(newDir, `${newId}.json`)), 'El nuevo JSON debe existir');
    assert.ok(fs.existsSync(path.join(newDir, `${newId}.md`)), 'El nuevo MD debe existir');

    // Verificar que el JSON actualizado tiene el nuevo projectId
    const updatedPlan = JSON.parse(fs.readFileSync(path.join(newDir, `${newId}.json`), 'utf8'));
    assert.equal(updatedPlan.config.projectId, newId);

    // Verificar que el directorio viejo fue archivado o movido fuera
    assert.equal(fs.existsSync(oldDir), false, 'El directorio viejo no debe permanecer activo en la raíz');
    assert.ok(fs.existsSync(result.archivePath), 'Debe existir la copia archivada histórica');
  });

  await t.test('debe rechazar si el proyecto de origen no existe', () => {
    assert.throws(() => {
      renameProject({
        baseDir,
        type,
        currentId: 'no_existe',
        newId: 'nuevo_destino'
      });
    }, /PROJECT_NOT_FOUND/);
  });

  await t.test('debe rechazar si el nuevo projectId ya existe en disco', () => {
    const proj1 = path.join(baseDir, type, 'proj_1');
    const proj2 = path.join(baseDir, type, 'proj_2');
    fs.mkdirSync(proj1, { recursive: true });
    fs.mkdirSync(proj2, { recursive: true });

    fs.writeFileSync(path.join(proj1, 'proj_1.json'), JSON.stringify({ config: { projectId: 'proj_1' } }));
    fs.writeFileSync(path.join(proj2, 'proj_2.json'), JSON.stringify({ config: { projectId: 'proj_2' } }));

    assert.throws(() => {
      renameProject({
        baseDir,
        type,
        currentId: 'proj_1',
        newId: 'proj_2'
      });
    }, /PROJECT_ALREADY_EXISTS/);
  });
});
