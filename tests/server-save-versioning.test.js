import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { saveWithVersioning, countPopulatedModules } from '../src/lib/serverUtils/saveVersioning.js';

test('TDD-26 & TDD-27: Save Versioning & Anti-Regression Engine', async (t) => {
  const testDir = path.resolve('tests/scratch_projects/test_proj');

  t.beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  t.afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  await t.test('debe contar con precisión los módulos canónicos poblados', () => {
    const emptyPlan = { naturaleza: { introduccion: {} } };
    assert.equal(countPopulatedModules(emptyPlan), 0);

    const activePlan = {
      naturaleza: {
        introduccion: { origen: 'Texto válido con datos' },
        identidad: { mision: 'Misión corporativa sólida' }
      },
      mercado: {
        analisis: { producto: 'Servicio de mantenimiento' }
      }
    };
    assert.equal(countPopulatedModules(activePlan), 3);
  });

  await t.test('debe crear la versión con hash y manifiesto en .versions/', () => {
    const plan = {
      config: { projectId: 'test_proj' },
      semilla: { inversion_esperada: '20000000' },
      naturaleza: {
        introduccion: { origen: 'Origen válido' }
      }
    };

    const res = saveWithVersioning({
      dirPath: testDir,
      safeName: 'test_proj',
      planData: plan
    });

    assert.equal(res.success, true);
    assert.equal(res.versionSaved, true);

    const versionsDir = path.join(testDir, '.versions');
    assert.ok(fs.existsSync(versionsDir));

    const manifestPath = path.join(versionsDir, 'index.json');
    assert.ok(fs.existsSync(manifestPath));

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.versions.length, 1);
    assert.equal(manifest.versions[0].modulesCount, 1);
    assert.equal(manifest.versions[0].inversionTotal, 20000000);
  });

  await t.test('debe rechazar si una versión entrante reduce drásticamente los módulos sin forzar', () => {
    // 1. Guardar versión con 5 módulos
    const fullPlan = {
      config: { projectId: 'test_proj' },
      naturaleza: {
        introduccion: { origen: 'Detalle' },
        identidad: { mision: 'Misión' },
        foda: { fortalezas: 'Fortaleza' }
      },
      mercado: {
        analisis: { producto: 'Producto' },
        segmentacion: { tam: 'TAM' }
      }
    };

    saveWithVersioning({
      dirPath: testDir,
      safeName: 'test_proj',
      planData: fullPlan
    });

    // 2. Intentar guardar versión con solo 1 módulo
    const degradedPlan = {
      config: { projectId: 'test_proj' },
      naturaleza: {
        introduccion: { origen: 'Solo uno' }
      }
    };

    assert.throws(() => {
      saveWithVersioning({
        dirPath: testDir,
        safeName: 'test_proj',
        planData: degradedPlan
      });
    }, /MODULE_COUNT_REGRESSION_DETECTED/);

    // 3. Con allowRegression=true debe permitirlo
    const forced = saveWithVersioning({
      dirPath: testDir,
      safeName: 'test_proj',
      planData: degradedPlan,
      allowRegression: true
    });
    assert.equal(forced.success, true);
  });

  await t.test('debe mantener un límite FIFO de máximo 20 versiones en el manifiesto', () => {
    for (let i = 1; i <= 25; i++) {
      const plan = {
        config: { projectId: 'test_proj' },
        naturaleza: {
          introduccion: { origen: `Versión número ${i}` }
        }
      };
      saveWithVersioning({
        dirPath: testDir,
        safeName: 'test_proj',
        planData: plan,
        allowRegression: true
      });
    }

    const manifestPath = path.join(testDir, '.versions', 'index.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.ok(manifest.versions.length <= 20);
  });
});
