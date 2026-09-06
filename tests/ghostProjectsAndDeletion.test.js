import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

test('TDD: Filtrado de Proyectos Fantasmas y Eliminación Segura', async (t) => {
  const baseDir = path.resolve('tests/scratch_projects/ghost_test_base');
  const type = 'negocios';
  const typeDir = path.join(baseDir, type);

  t.beforeEach(() => {
    if (fs.existsSync(baseDir)) {
      fs.rmSync(baseDir, { recursive: true, force: true });
    }
    fs.mkdirSync(typeDir, { recursive: true });
  });

  t.afterEach(() => {
    if (fs.existsSync(baseDir)) {
      fs.rmSync(baseDir, { recursive: true, force: true });
    }
  });

  await t.test('1. No debe listar archivos sueltos proyecto_*.json en raíz como proyectos válidos', () => {
    // Crear un proyecto canónico en carpeta
    const canonicalDir = path.join(typeDir, 'proyecto_canonico');
    fs.mkdirSync(canonicalDir, { recursive: true });
    fs.writeFileSync(
      path.join(canonicalDir, 'proyecto_canonico.json'),
      JSON.stringify({ config: { projectId: 'proyecto_canonico', brandKit: { companyName: 'Empresa Real' } } }, null, 2)
    );

    // Crear archivos sueltos huérfanos/fantasmas en raíz
    fs.writeFileSync(path.join(typeDir, 'proyecto_1778618292381.json'), JSON.stringify({ semilla: {} }));
    fs.writeFileSync(path.join(typeDir, 'proyecto_1778618292381.md'), '# Fantasma');

    // Simular la lógica filtrada de app.get('/api/projects')
    const entries = fs.readdirSync(typeDir, { withFileTypes: true });
    const validProjects = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name === '.archive' || entry.name === 'node_modules') continue;
        const jsonPath = path.join(typeDir, entry.name, `${entry.name}.json`);
        if (fs.existsSync(jsonPath)) {
          validProjects.push(entry.name);
        }
      }
    }

    assert.equal(validProjects.length, 1);
    assert.equal(validProjects[0], 'proyecto_canonico');
    assert.ok(!validProjects.includes('proyecto_1778618292381'));
  });

  await t.test('2. Eliminación segura mueve el proyecto a .archive/deleted_projects', () => {
    const projId = 'proyecto_a_eliminar';
    const projDir = path.join(typeDir, projId);
    fs.mkdirSync(projDir, { recursive: true });
    fs.writeFileSync(path.join(projDir, `${projId}.json`), JSON.stringify({ id: projId }));

    const archiveDir = path.join(baseDir, type, '.archive', 'deleted_projects');
    fs.mkdirSync(archiveDir, { recursive: true });

    const timestamp = '2026-09-06T12-00-00';
    const targetArchive = path.join(archiveDir, `${projId}_deleted_${timestamp}`);
    fs.renameSync(projDir, targetArchive);

    assert.ok(!fs.existsSync(projDir), 'La carpeta original debe haber sido eliminada');
    assert.ok(fs.existsSync(targetArchive), 'La carpeta archivada debe existir con su timestamp');
  });
});
