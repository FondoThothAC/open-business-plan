import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { resolveCanonicalCapex } from '../../src/lib/finanzas/canonicalCapex.js';
import { validateFinancialConsistency } from '../../src/lib/finanzas/financialSanityCheck.js';

test('TDD: Coherencia Financiera e Inmutabilidad de CC-TR-SAPI', async (t) => {
  const jsonPath = path.resolve(
    'proyectos/negocios/comercio_cu_ntico_internacional_tr_sapi_de_cv/comercio_cu_ntico_internacional_tr_sapi_de_cv.json'
  );

  assert.ok(fs.existsSync(jsonPath), 'El archivo del proyecto CC-TR-SAPI debe existir');
  const planData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  await t.test('debe anclar la inversión canónica a $20,000,000 MXN desde semilla', () => {
    const res = resolveCanonicalCapex(planData, planData.semilla);
    const capexValue = typeof res === 'object' && res !== null ? res.capex : res;
    assert.equal(capexValue, 20000000, 'El CAPEX resuelto debe ser exactamente $20M MXN');
    if (typeof res === 'object' && res !== null) {
      assert.equal(res.source, 'seed.inversion_esperada');
      assert.equal(res.status, 'resolved');
    }
  });

  await t.test('debe validar la viabilidad y consistencia financiera sin flags de implausibilidad', () => {
    const report = validateFinancialConsistency(planData);
    assert.ok(report, 'Debe devolver reporte de validación');

    // Comprobamos que no se dispararon alertas críticas
    const criticalFlags = ['tir_implausible', 'payback_no_viable', 'roi_implausible', 'pe_infinito'];
    for (const flag of criticalFlags) {
      const found = report.inconsistencies.some(inc => inc.flag === flag);
      assert.equal(found, false, `No debe existir la inconsistencia crítica: ${flag}`);
    }
  });

  await t.test('debe asegurar 0 secciones fantasma Pro-Forma en el archivo', () => {
    const proformaKeys = [
      'mercado_cuantitativo',
      'ingenieria_tecnica',
      'presupuesto_obra',
      'estructura_capital',
      'riesgo_matematico',
      'simulador_financiero'
    ];

    for (const key of proformaKeys) {
      assert.equal(planData[key], undefined, `La sección fantasma ${key} no debe existir`);
    }
  });
});
