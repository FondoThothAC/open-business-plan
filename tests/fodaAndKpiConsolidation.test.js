import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULE_BOX_MAP, getBoxIdsForModule } from '../src/config/moduleBoxMap.js';

test('FODA & KPI Consolidation Suite - TDD', async (t) => {
  await t.test('1. Erradicación de FODA duplicado y cajas repetidas en competencia', () => {
    // business:foda se gestiona de forma canónica y única por FodaMatrix en VistaPrevia
    const fodaBoxes = getBoxIdsForModule('foda', 'business');
    assert.deepEqual(fodaBoxes, [], 'business:foda no debe mapear box_swot_foda para evitar doble FODA impreso');

    // business:competencia no debe mapear box_swot_foda
    const compBoxes = getBoxIdsForModule('competencia', 'business');
    assert.ok(!compBoxes.includes('box_swot_foda'), 'competencia no debe arrastrar una matriz FODA ajena');
  });

  await t.test('2. Limpieza de indicadores en módulos intermedios y de organización', () => {
    // Estructura y Recursos Humanos no deben tener indicadores comerciales de ventas (CAC/LTV)
    const estructuraBoxes = getBoxIdsForModule('estructura', 'business');
    const rrhhBoxes = getBoxIdsForModule('recursos_humanos', 'business');
    assert.ok(!estructuraBoxes.includes('box_unit_economics'), 'estructura no debe contener box_unit_economics');
    assert.ok(!estructuraBoxes.includes('box_benchmark_cac_ltv'), 'estructura no debe contener box_benchmark_cac_ltv');
    assert.ok(!rrhhBoxes.includes('box_unit_economics'), 'recursos_humanos no debe contener box_unit_economics');

    // Capacidad y Operativa no deben duplicar los KPIs operativos de operacion
    const capBoxes = getBoxIdsForModule('capacidad', 'business');
    const opBoxes = getBoxIdsForModule('operativa', 'business');
    assert.ok(!capBoxes.includes('box_kpi_otd_dso_dio_ccc'), 'capacidad no debe duplicar kpis operativos');
    assert.ok(!opBoxes.includes('box_kpi_otd_dso_dio_ccc'), 'operativa no debe duplicar kpis operativos');
  });

  await t.test('3. Asignación canónica única para módulos clave', () => {
    // Ventas debe concentrar los indicadores comerciales unitarios
    const ventasBoxes = getBoxIdsForModule('ventas', 'business');
    assert.ok(ventasBoxes.includes('box_unit_economics'), 'ventas debe contener unit economics');
    assert.ok(ventasBoxes.includes('box_benchmark_cac_ltv'), 'ventas debe contener benchmarks de CAC/LTV');

    // Operación debe concentrar los KPIs operativos de supply chain
    const operacionBoxes = getBoxIdsForModule('operacion', 'business');
    assert.ok(operacionBoxes.includes('box_kpi_otd_dso_dio_ccc'), 'operacion debe contener cuadro de mando OTD/DSO/DIO/CCC');

    // Rentabilidad e Inversión deben concentrar WACC, VAN y TIR
    const rentabilidadBoxes = getBoxIdsForModule('rentabilidad', 'business');
    assert.ok(rentabilidadBoxes.includes('box_wacc_van_tir'), 'rentabilidad debe contener evaluación financiera maestra');
  });

  await t.test('4. Parseo de FODA estructurado sin lore simulado', () => {
    const rawFoda = {
      fortalezas: '• Certificación técnica ISO\n• Banco de pruebas propio',
      oportunidades: '1. Crecimiento del sector minero 2026; 2. Alianzas estratégicas',
      debilidades: '- Marca nueva en el mercado regional',
      amenazas: '* Volatilidad en tipo de cambio'
    };

    // Validar que se transformen en elementos limpios y sin texto mock
    const parse = (txt) => (txt || '').split(/\r?\n|•|- |\* |;/).map(s => s.trim().replace(/^[-*•\d.)\s]+/, '')).filter(s => s.length > 2);

    const fortalezasParsed = parse(rawFoda.fortalezas);
    assert.equal(fortalezasParsed.length, 2);
    assert.equal(fortalezasParsed[0], 'Certificación técnica ISO');
    assert.equal(fortalezasParsed[1], 'Banco de pruebas propio');

    const debilidadesParsed = parse(rawFoda.debilidades);
    assert.equal(debilidadesParsed.length, 1);
    assert.equal(debilidadesParsed[0], 'Marca nueva en el mercado regional');
  });
});
