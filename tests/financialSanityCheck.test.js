import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFinancialConsistency } from '../src/lib/finanzas/financialSanityCheck.js';

test('TDD-25: Financial Sanity Check & Consistency Engine', async (t) => {
  await t.test('debe validar satisfactoriamente un plan con métricas financieras coherentes', () => {
    const planData = {
      semilla: { inversion_esperada: '20000000' },
      organizacion: {
        inversion: {
          inversion_fija: '10000000',
          inversion_diferida: '1000000',
          opex_inicial: '2000000',
          financiamiento: '7000000'
        },
        estados_financieros: {
          balance: 'Activo Total: $20,000,000 MXN'
        },
        rentabilidad: {
          indicadores: 'TIR: 24.5%, VPN: $1,660,000, Payback: 4.1 años, ROI: 45%',
          punto_equilibrio: '$1,200,000 anual'
        }
      }
    };

    const res = validateFinancialConsistency(planData);
    assert.equal(res.valid, true);
    assert.equal(res.inconsistencies.length, 0);
  });

  await t.test('debe detectar inconsistencia cuando la suma de desgloses difiere de la semilla en más de 5%', () => {
    const planData = {
      semilla: { inversion_esperada: '20000000' },
      organizacion: {
        inversion: {
          inversion_fija: '100000',
          inversion_diferida: '10000',
          opex_inicial: '40000'
        }
      }
    };

    const res = validateFinancialConsistency(planData);
    assert.equal(res.valid, false);
    assert.ok(res.inconsistencies.some(i => i.flag === 'inconsistency_canonicas'));
  });

  await t.test('debe detectar banderas de TIR implausible (fuera de rango 0% a 100%)', () => {
    const planData = {
      semilla: { inversion_esperada: '1000000' },
      organizacion: {
        rentabilidad: {
          indicadores: 'TIR: 360%, VPN: $100,000'
        }
      }
    };

    const res = validateFinancialConsistency(planData);
    assert.ok(res.inconsistencies.some(i => i.flag === 'tir_implausible'));
  });

  await t.test('debe alertar si el Payback indica "Nunca" o excede 10 años', () => {
    const planData = {
      semilla: { inversion_esperada: '1000000' },
      organizacion: {
        rentabilidad: {
          indicadores: 'TIR: 15%, Payback: Nunca'
        }
      }
    };

    const res = validateFinancialConsistency(planData);
    assert.ok(res.inconsistencies.some(i => i.flag === 'payback_no_viable'));
  });

  await t.test('debe detectar división por cero o punto de equilibrio infinito', () => {
    const planData = {
      semilla: { inversion_esperada: '1000000' },
      organizacion: {
        rentabilidad: {
          punto_equilibrio: 'Punto de Equilibrio: $∞'
        }
      }
    };

    const res = validateFinancialConsistency(planData);
    assert.ok(res.inconsistencies.some(i => i.flag === 'pe_infinito'));
  });
});
