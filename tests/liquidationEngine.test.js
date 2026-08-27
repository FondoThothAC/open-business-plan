import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLiquidationReserve, analyzeBurnRateAndSurvival, getQuantumExitProtocol } from '../src/lib/finanzas/liquidationEngine.js';

test('calculateLiquidationReserve calcula correctamente pasivo laboral LFT y FRLI', () => {
  const staff = [
    { title: 'Técnico Especialista Hidráulico', salary: 20000 },
    { title: 'Auxiliar Operativo', salary: 12000 },
  ];

  const options = {
    rentaMensual: 10000,
    pasivoProveedores: 15000,
  };

  const reserve = calculateLiquidationReserve({}, staff, options);

  // Colaborador 1: 20,000 * 3.5 = 70,000
  // Colaborador 2: 12,000 * 3.5 = 42,000
  // Pasivo laboral = 112,000
  // Penalización renta (2 meses) = 20,000
  // Pasivos proveedores = 15,000
  // Gastos legales = 25,000
  // Total esperado = 112,000 + 20,000 + 15,000 + 25,000 = 172,000

  assert.strictEqual(reserve.pasivoLaboralTotal, 112000);
  assert.strictEqual(reserve.penalizacionRenta, 20000);
  assert.strictEqual(reserve.pasivosProveedores, 15000);
  assert.strictEqual(reserve.gastosCierreLegalFiscal, 25000);
  assert.strictEqual(reserve.totalFRLI, 172000);
  assert.strictEqual(reserve.desglosePersonal.length, 2);
});

test('analyzeBurnRateAndSurvival detecta quema planeada tipo Amazon sin disparar alerta falsa', () => {
  // 6 meses de pérdida planeada
  const monthlyFlows = [-20000, -25000, -15000, -10000, -5000, -2000, 10000, 15000];
  const config = {
    isPlannedBurnStrategy: true,
    plannedBurnMonths: 6,
    currentCashBalance: 250000,
    liquidationReserve: 100000,
    toleranceConsecutiveLossMonths: 3,
  };

  const analysis = analyzeBurnRateAndSurvival(monthlyFlows, config);

  assert.strictEqual(analysis.phase, 'VERDE');
  assert.strictEqual(analysis.maxConsecutiveUnplannedLosses, 0);
  assert.strictEqual(analysis.safeAvailableCash, 150000);
});

test('analyzeBurnRateAndSurvival activa Fase Roja (Kill Switch) ante 3 meses imprevistos o saldo <= FRLI', () => {
  // 3 meses seguidos de pérdida imprevista
  const monthlyFlows = [10000, 15000, -30000, -35000, -40000];
  const config = {
    isPlannedBurnStrategy: false,
    currentCashBalance: 90000,
    liquidationReserve: 100000, // Caja por debajo del FRLI
    toleranceConsecutiveLossMonths: 3,
  };

  const analysis = analyzeBurnRateAndSurvival(monthlyFlows, config);

  assert.strictEqual(analysis.phase, 'ROJA');
  assert.strictEqual(analysis.maxConsecutiveUnplannedLosses, 3);
  assert.match(analysis.alertMessage, /ALERTA CRÍTICA/);
});

test('getQuantumExitProtocol entrega las 3 fases cuánticas con checklist operativo', () => {
  const protocol = getQuantumExitProtocol('ROJA', { totalFRLI: 150000 });

  assert.strictEqual(protocol.length, 3);
  assert.strictEqual(protocol[0].phase, 'AMARILLA');
  assert.strictEqual(protocol[1].phase, 'NARANJA');
  assert.strictEqual(protocol[2].phase, 'ROJA');
  assert.strictEqual(protocol[2].isActive, true);
  assert.strictEqual(protocol[2].acciones.length, 4);
});
