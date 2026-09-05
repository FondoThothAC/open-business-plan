import test from 'node:test';
import assert from 'node:assert/strict';
import { isPaidProviderOrModel, estimateCallCostUSD, shouldAllowPaidFallback } from '../src/lib/paidModelGovernance.js';

test('TDD: Gobernanza de Costos y Human-in-the-Loop para APIs de Pago', async (t) => {
  await t.test('debe identificar correctamente proveedores y modelos de pago vs gratuitos', () => {
    // Gratuitos / Freemium
    assert.equal(isPaidProviderOrModel('groq', 'llama-3.1-8b-instant'), false);
    assert.equal(isPaidProviderOrModel('bai', 'qwen3.8-flash'), false);
    assert.equal(isPaidProviderOrModel('ollama_cloud', 'minimax-m3:cloud'), false);
    assert.equal(isPaidProviderOrModel('openrouter', 'nvidia/nemotron-3.5-lightning:free'), false);
    assert.equal(isPaidProviderOrModel('gemini', 'gemini-1.5-flash'), false);

    // De Pago
    assert.equal(isPaidProviderOrModel('openai', 'gpt-4o'), true);
    assert.equal(isPaidProviderOrModel('claude', 'claude-3-5-sonnet-20241022'), true);
    assert.equal(isPaidProviderOrModel('grok', 'grok-beta'), true);
    assert.equal(isPaidProviderOrModel('openrouter', 'anthropic/claude-3.5-sonnet'), true);
  });

  await t.test('debe estimar el costo en USD de forma coherente usando pricing.js', () => {
    // Estimación para GPT-4o (por ejemplo 1k input, 2k output)
    const costGpt = estimateCallCostUSD('openai', 'gpt-4o', 1000, 2000);
    assert.ok(costGpt > 0, 'El costo para GPT-4o debe ser mayor a 0');

    // Modelo gratuito debe estimar 0
    const costFree = estimateCallCostUSD('groq', 'llama-3.1-8b-instant', 1000, 2000);
    assert.equal(costFree, 0, 'El costo para Groq gratuito debe ser 0');
  });

  await t.test('no debe conmutar a proveedor de pago si no está explícitamente autorizado', () => {
    const searchOrAiConfig = { allowPaidTier: false };
    const allowed = shouldAllowPaidFallback('openai', 'gpt-4o', searchOrAiConfig);
    assert.equal(allowed, false, 'No debe permitir conmutar a OpenAI si allowPaidTier es falso');

    const allowedFree = shouldAllowPaidFallback('groq', 'llama-3.1-8b-instant', searchOrAiConfig);
    assert.equal(allowedFree, true, 'Siempre debe permitir proveedores gratuitos');
  });

  await t.test('debe autorizar conmutación si allowPaidTier está habilitado', () => {
    const searchOrAiConfig = { allowPaidTier: true };
    const allowed = shouldAllowPaidFallback('openai', 'gpt-4o', searchOrAiConfig);
    assert.equal(allowed, true, 'Debe permitir conmutar a OpenAI si allowPaidTier es verdadero');
  });
});
