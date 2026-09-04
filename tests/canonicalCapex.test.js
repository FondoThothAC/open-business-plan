import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCanonicalCapex } from '../src/lib/finanzas/canonicalCapex.js';

test('TDD-24: CanonicalCapex Resolution Engine', async (t) => {
  const originalEnv = process.env.OBP_STRICT_FINANCIALS;

  await t.test('debe resolver la inversión canónica directamente desde seed.inversion_esperada (numérico o string)', () => {
    const seedString = { inversion_esperada: '20000000' };
    const resString = resolveCanonicalCapex({}, seedString);
    assert.equal(resString.capex, 20000000);
    assert.equal(resString.source, 'seed.inversion_esperada');
    assert.equal(resString.status, 'resolved');

    const seedNum = { inversion_esperada: 15000000 };
    const resNum = resolveCanonicalCapex({}, seedNum);
    assert.equal(resNum.capex, 15000000);
  });

  await t.test('debe extraer correctamente desde cadenas monetarias con comas y signos de pesos', () => {
    const seed = { inversion_esperada: '$20,000,000 MXN' };
    const res = resolveCanonicalCapex({}, seed);
    assert.equal(res.capex, 20000000);
    assert.equal(res.source, 'seed.inversion_esperada');
  });

  await t.test('debe resolver como segunda prioridad desde seed.finanzas.inversion_inicial', () => {
    const seed = {
      finanzas: { inversion_inicial: '5000000' }
    };
    const res = resolveCanonicalCapex({}, seed);
    assert.equal(res.capex, 5000000);
    assert.equal(res.source, 'seed.finanzas.inversion_inicial');
  });

  await t.test('debe resolver sumando el desglose de planData.organizacion.inversion si no hay semilla', () => {
    const planData = {
      organizacion: {
        inversion: {
          inversion_fija: '$10,000,000',
          inversion_diferida: '$1,000,000',
          opex_inicial: '$2,000,000'
        }
      }
    };
    const res = resolveCanonicalCapex(planData, {});
    assert.equal(res.capex, 13000000);
    assert.equal(res.source, 'planData.organizacion.inversion.desglose');
  });

  await t.test('debe resolver desde planData.organizacion.inversion.monto_inversion como fallback previo', () => {
    const planData = {
      organizacion: {
        inversion: {
          monto_inversion: '8500000'
        }
      }
    };
    const res = resolveCanonicalCapex(planData, {});
    assert.equal(res.capex, 8500000);
    assert.equal(res.source, 'planData.organizacion.inversion.monto_inversion');
  });

  await t.test('en modo permisivo debe retornar fallback 150000 con warning si no encuentra inversión', () => {
    delete process.env.OBP_STRICT_FINANCIALS;
    const res = resolveCanonicalCapex({}, {});
    assert.equal(res.capex, 150000);
    assert.equal(res.source, 'fallback_default');
    assert.equal(res.status, 'warning_fallback');
    assert.equal(res.requiresReview, true);
  });

  await t.test('en modo estricto (OBP_STRICT_FINANCIALS=1) debe lanzar un error explícito si no hay inversión', () => {
    process.env.OBP_STRICT_FINANCIALS = '1';
    assert.throws(() => {
      resolveCanonicalCapex({}, {});
    }, /INVERSION_CANONICA_NO_ENCONTRADA/);
    process.env.OBP_STRICT_FINANCIALS = originalEnv;
  });
});
