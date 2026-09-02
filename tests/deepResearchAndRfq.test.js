/**
 * tests/deepResearchAndRfq.test.js
 * 
 * Suite de pruebas unitarias para el motor de Deep Research híbrido,
 * el generador e ingestor de RFQs de maquinaria pesada y el motor de Forking Temporal.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRfqPackage, ingestQuoteResponse, applyQuoteToPlanCapex, RFQ_STATUS } from '../src/lib/tools/machineryRfqEngine.js';
import { createTemporalFork, evaluateImpactTrafficLight } from '../src/lib/digitalTwinForkEngine.js';
import { runDeepResearch } from '../src/lib/tools/deepResearchEngine.js';

test('Machinery RFQ Engine - Test Suite', async (t) => {
  await t.test('genera un paquete formal de RFQ con identificador único y carta técnica', () => {
    const rfq = generateRfqPackage({
      machineryName: 'Centro de Maquinado 5 Ejes CNC',
      category: 'Maquinaria Pesada',
      deliveryLocation: 'Hermosillo, Sonora'
    });

    assert.ok(rfq.rfqId.startsWith('RFQ-'));
    assert.equal(rfq.status, RFQ_STATUS.DRAFT);
    assert.equal(rfq.machineryName, 'Centro de Maquinado 5 Ejes CNC');
    assert.ok(rfq.formalLetter.includes('SOLICITUD FORMAL DE COTIZACIÓN'));
    assert.ok(rfq.emailSubject.includes('Ref. RFQ-'));
  });

  await t.test('ingesta una respuesta de cotización y actualiza el estado a QUOTE_RECEIVED', () => {
    const initialRfq = generateRfqPackage({ machineryName: 'Torno CNC Haas ST-20' });
    const quoteData = {
      quoteAmount: 2450000,
      currency: 'MXN',
      supplierName: 'Haas Automation México',
      deliveryWeeks: 6,
      warrantyMonths: 24,
      includesShipping: true
    };

    const updatedRfq = ingestQuoteResponse(initialRfq, quoteData);

    assert.equal(updatedRfq.status, RFQ_STATUS.QUOTE_RECEIVED);
    assert.equal(updatedRfq.receivedQuote.quoteAmount, 2450000);
    assert.equal(updatedRfq.receivedQuote.supplierName, 'Haas Automation México');
  });

  await t.test('aplica la cotización verificada a la estructura de CAPEX del plan financiero', () => {
    const initialPlan = {
      organizacion: {
        inversion: {
          activos_fijos: [],
          total_activos_fijos: 0
        }
      }
    };

    const rfq = generateRfqPackage({ machineryName: 'Torno CNC Haas ST-20' });
    const completedRfq = ingestQuoteResponse(rfq, {
      quoteAmount: 2450000,
      supplierName: 'Haas Automation México'
    });

    const updatedPlan = applyQuoteToPlanCapex(initialPlan, completedRfq);

    assert.equal(updatedPlan.organizacion.inversion.activos_fijos.length, 1);
    assert.equal(updatedPlan.organizacion.inversion.total_activos_fijos, 2450000);
    assert.equal(updatedPlan.organizacion.inversion.activos_fijos[0].concepto, 'Torno CNC Haas ST-20');
  });
});

test('Digital Twin Temporal Forking Engine - Test Suite', async (t) => {
  await t.test('evalúa correctamente el semáforo de impacto financiero', () => {
    // Caso 1: Impacto mínimo -> GREEN
    const greenResult = evaluateImpactTrafficLight(10000000, 9800000, 30, 29);
    assert.equal(greenResult.light, 'GREEN');

    // Caso 2: Caída moderada -> YELLOW
    const yellowResult = evaluateImpactTrafficLight(10000000, 8500000, 30, 24);
    assert.equal(yellowResult.light, 'YELLOW');

    // Caso 3: Caída severa -> RED
    const redResult = evaluateImpactTrafficLight(10000000, 5000000, 30, 15);
    assert.equal(redResult.light, 'RED');
  });

  await t.test('crea un fork temporal con snapshot aislado y matriz comparativa', () => {
    const mockPlan = {
      config: { projectId: 'cci-01', brandKit: { companyName: 'CCI Minería' } },
      finanzas: { van: 20000000, tir: 35.0, roi: 180.0 }
    };

    const fork = createTemporalFork({
      planData: mockPlan,
      triggerReason: 'Auditoría Periódica de 30 Días',
      newCostMultiplier: 1.05
    });

    assert.ok(fork.forkId.startsWith('FORK-'));
    assert.ok(fork.forkName.includes('CCI Minería — Gemelo Digital'));
    assert.equal(fork.baseMetrics.van, 20000000);
    assert.ok(fork.forkMetrics.van < 20000000);
    assert.ok(fork.impact && fork.impact.light);
  });
});

test('Deep Research Engine (Capa Base) - Test Suite', async (t) => {
  await t.test('ejecuta búsqueda en capa gratuita sin arrojar error cuando no hay keys de pago', async () => {
    const result = await runDeepResearch({
      query: 'Precios de tornos CNC en Sonora',
      domain: 'maquinaria',
      depth: 'rapido',
      forcePaidTier: false,
      apiKeys: {}
    });

    assert.equal(result.success, true);
    assert.equal(result.tierUsed, 'free');
    assert.equal(result.costUsd, 0);
  });
});
