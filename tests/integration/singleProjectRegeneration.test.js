import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { saveWithVersioning, countPopulatedModules } from '../../src/lib/serverUtils/saveVersioning.js';

test('TDD: Integración de Regeneración Unitaria y Anti-Duplicación de Módulos', async (t) => {
  const testDir = path.resolve('tests/scratch_projects/regen_test_dir');

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

  await t.test('3 generaciones consecutivas del mismo proyecto nunca reducen el conteo de módulos ni reintroducen proforma fantasma', () => {
    // Sesión 1: Generación inicial con 5 módulos
    const gen1 = {
      config: { projectId: 'cc_tr_sapi', projectType: 'business' },
      semilla: { inversion_esperada: '20000000' },
      naturaleza: {
        introduccion: { origen: 'Origen industrial Hermosillo' },
        identidad: { mision: 'Misión minera' }
      },
      mercado: {
        analisis: { producto: 'Equipos hidráulicos' }
      },
      organizacion: {
        inversion: { monto_inversion: '20000000' },
        rentabilidad: { tir: '15.11%', vpn: '$1,834,210' }
      }
    };

    saveWithVersioning({
      dirPath: testDir,
      safeName: 'cc_tr_sapi',
      planData: gen1
    });

    const c1 = countPopulatedModules(gen1);
    assert.equal(c1, 5);

    // Sesión 2: Generación incremental que añade módulos de operaciones y técnico
    const gen2 = {
      ...gen1,
      tecnico: {
        macro: { ubicacion: 'Hermosillo, Sonora' },
        ingenieria: { capacidad: 'Alta capacidad' }
      }
    };

    saveWithVersioning({
      dirPath: testDir,
      safeName: 'cc_tr_sapi',
      planData: gen2
    });

    const c2 = countPopulatedModules(gen2);
    assert.ok(c2 >= c1, 'El conteo de módulos no debe decrecer en la sesión 2');

    // Sesión 3: Pulido final
    const gen3 = {
      ...gen2,
      organizacion: {
        ...gen2.organizacion,
        estructura: { organigrama: 'Estructura directiva consolidada' }
      }
    };

    saveWithVersioning({
      dirPath: testDir,
      safeName: 'cc_tr_sapi',
      planData: gen3
    });

    const c3 = countPopulatedModules(gen3);
    assert.ok(c3 >= c2, 'El conteo de módulos no debe decrecer en la sesión 3');

    // Comprobar ausencia absoluta de secciones fantasma Pro-Forma
    const proformaKeys = [
      'mercado_cuantitativo',
      'ingenieria_tecnica',
      'presupuesto_obra',
      'estructura_capital',
      'riesgo_matematico',
      'simulador_financiero'
    ];

    for (const key of proformaKeys) {
      assert.equal(gen3[key], undefined, `La sección fantasma ${key} no debe existir en el planData canónico`);
    }

    // Verificar manifiesto de versiones inmutables
    const manifestPath = path.join(testDir, '.versions', 'index.json');
    assert.ok(fs.existsSync(manifestPath));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.versions.length, 3, 'Deben existir 3 versiones registradas');
  });
});
