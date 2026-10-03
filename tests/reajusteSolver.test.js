import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { solveFinancialReajuste } from '../src/lib/finanzas/reajusteSolver.js';

describe('TDD: Motor de Solución y Plan de Reajuste (reajusteSolver)', () => {

  it('debe devolver que el negocio ya es viable si el VPN es positivo y el payback cumple la meta', () => {
    const inputViable = {
      capexTotal: 50000,
      costosFijosMensuales: 4000,
      costoVariableUnitario: 50,
      precioUnitario: 150,
      volumenMensual: 100,
      tasaDescuento: 12,
      duracionAnios: 5,
      metaPaybackMeses: 36
    };

    const res = solveFinancialReajuste(inputViable);
    assert.equal(res.requiereReajuste, false);
    assert.equal(res.diagnostico, 'VIABLE_CONFORME_A_METAS');
  });

  it('debe resolver palancas individuales de precio, volumen y costos fijos para un proyecto deficitario', () => {
    // Caso deficitario: Fijos de $20,000, ventas de solo $12,000 (100 unidades a $120, costo $60 = margen $6,000 vs fijos $20,000 -> Pérdida mensual -$14,000)
    const inputDeficit = {
      capexTotal: 80000,
      costosFijosMensuales: 20000,
      costoVariableUnitario: 60,
      precioUnitario: 120,
      volumenMensual: 100,
      tasaDescuento: 12,
      duracionAnios: 5,
      metaPaybackMeses: 36
    };

    const res = solveFinancialReajuste(inputDeficit);
    assert.equal(res.requiereReajuste, true);
    assert.ok(res.palancas, 'Debe incluir palancas calculadas');

    // Palanca 1: Precio mínimo necesario manteniendo volumen actual de 100 unidades
    assert.ok(res.palancas.precioMinimo > inputDeficit.precioUnitario, 
      `El precio requerido (${res.palancas.precioMinimo}) debe ser superior al precio actual (${inputDeficit.precioUnitario})`);

    // Palanca 2: Volumen mínimo necesario manteniendo precio actual de $120
    assert.ok(res.palancas.volumenMinimo > inputDeficit.volumenMensual, 
      `El volumen requerido (${res.palancas.volumenMinimo}) debe ser superior al volumen actual (${inputDeficit.volumenMensual})`);

    // Palanca 3: Costo fijo máximo tolerable manteniendo precio y volumen actuales
    assert.ok(res.palancas.costoFijoMaximo < inputDeficit.costosFijosMensuales, 
      `El costo fijo tolerable (${res.palancas.costoFijoMaximo}) debe ser menor al actual (${inputDeficit.costosFijosMensuales})`);

    // Palanca 4: Escenario combinado realista (ej. +15% precio y +25% volumen)
    assert.ok(res.palancas.escenarioCombinado, 'Debe incluir propuesta combinada equilibrada');
  });

  it('debe permitir configurar la meta de recuperación en meses (ej. 24 meses vs 36 meses)', () => {
    const input = {
      capexTotal: 100000,
      costosFijosMensuales: 10000,
      costoVariableUnitario: 40,
      precioUnitario: 100,
      volumenMensual: 200,
      tasaDescuento: 12,
      duracionAnios: 5
    };

    const res36 = solveFinancialReajuste({ ...input, metaPaybackMeses: 36 });
    const res24 = solveFinancialReajuste({ ...input, metaPaybackMeses: 24 });

    // Para recuperar en 24 meses se exige mayor volumen o mayor precio que para 36 meses
    assert.ok(res24.palancas.volumenMinimo >= res36.palancas.volumenMinimo);
  });

});
