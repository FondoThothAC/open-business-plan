import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseApiKeys, getRotatedApiKey, callAiProvider } from '../src/lib/ai.js';

describe('Rotación Inteligente de IA y Failover Multi-Proveedor - TDD Test Suite', () => {

  it('Debe extraer y sanitizar un pool de múltiples API Keys separadas por comas, saltos de línea o punto y coma', () => {
    const rawKeys = '  gsk_key_alpha, gsk_key_beta \n gsk_key_gamma; gsk_key_delta  ';
    const parsed = parseApiKeys(rawKeys);

    assert.equal(parsed.length, 4);
    assert.deepEqual(parsed, ['gsk_key_alpha', 'gsk_key_beta', 'gsk_key_gamma', 'gsk_key_delta']);
  });

  it('Debe retornar un array vacío si la API key es nula o indefinida', () => {
    assert.deepEqual(parseApiKeys(null), []);
    assert.deepEqual(parseApiKeys(''), []);
    assert.deepEqual(parseApiKeys(undefined), []);
  });

  it('Debe rotar de manera circular (Round-Robin) a través del pool de llaves configurado', () => {
    const rawKeys = 'gsk_1, gsk_2, gsk_3';
    const key1 = getRotatedApiKey(rawKeys, 'test_pool');
    const key2 = getRotatedApiKey(rawKeys, 'test_pool');
    const key3 = getRotatedApiKey(rawKeys, 'test_pool');
    const key4 = getRotatedApiKey(rawKeys, 'test_pool');

    assert.equal(key1, 'gsk_1');
    assert.equal(key2, 'gsk_2');
    assert.equal(key3, 'gsk_3');
    assert.equal(key4, 'gsk_1'); // Vuelve al inicio
  });

  it('Debe ejecutar fallback atómico a otro proveedor si el primario se satura o agota cuotas', async () => {
    const originalFetch = globalThis.fetch;

    // Simular que Groq devuelve 429 Rate Limit y Gemini responde exitosamente
    globalThis.fetch = async (url, options) => {
      const urlStr = String(url);
      if (urlStr.includes('api.groq.com')) {
        return {
          status: 429,
          ok: false,
          headers: new Map([['retry-after', '1']]),
          json: async () => ({ error: { message: 'Rate limit reached for model qwen3.6-27b', code: 'rate_limit_exceeded' } })
        };
      }
      if (urlStr.includes('generativelanguage.googleapis.com')) {
        return {
          status: 200,
          ok: true,
          json: async () => ({
            candidates: [{
              content: { parts: [{ text: '{"resumen_ejecutivo": "Análisis completado vía rotación a Gemini"}' }] }
            }]
          })
        };
      }
      return originalFetch(url, options);
    };

    try {
      const config = {
        provider: 'groq',
        groqKey: 'gsk_test_mock',
        apiKey: 'AIza_gemini_test_mock', // Gemini key
        model: 'qwen/qwen3.6-27b'
      };

      const result = await callAiProvider(
        config,
        'Genera resumen de demanda',
        true,
        ['resumen_ejecutivo']
      );

      assert.ok(result);
      assert.equal(result.resumen_ejecutivo, 'Análisis completado vía rotación a Gemini');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('Debe rotar entre modelos dentro de Groq si el primer modelo devuelve 429 y el segundo tiene éxito', async () => {
    const originalFetch = globalThis.fetch;
    let callCount = 0;

    globalThis.fetch = async (url, options) => {
      const urlStr = String(url);
      if (urlStr.includes('api.groq.com')) {
        const body = JSON.parse(options.body || '{}');
        callCount++;
        if (body.model === 'qwen/qwen3.6-27b') {
          return {
            status: 429,
            ok: false,
            headers: new Map([['retry-after', '1']]),
            json: async () => ({ error: { message: 'TPM limit exceeded', code: 'rate_limit_exceeded' } })
          };
        }
        // El siguiente modelo alternativo (gpt-oss-120b) responde con éxito
        return {
          status: 200,
          ok: true,
          json: async () => ({
            choices: [{
              message: { content: '{"demanda_historica": "Crecimiento del 6.2%", "elasticidad": "-0.28"}' }
            }]
          })
        };
      }
      return originalFetch(url, options);
    };

    try {
      const config = {
        provider: 'groq',
        groqKey: 'gsk_test_mock',
        model: 'qwen/qwen3.6-27b'
      };

      const result = await callAiProvider(
        config,
        'Genera demanda y elasticidad',
        true,
        ['demanda_historica', 'elasticidad']
      );

      assert.ok(result);
      assert.equal(result.demanda_historica, 'Crecimiento del 6.2%');
      assert.equal(result.elasticidad, '-0.28');
      assert.ok(callCount >= 2, 'Debió haber intentado más de un modelo en Groq tras el 429');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

});
