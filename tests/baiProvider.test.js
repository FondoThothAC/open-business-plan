/**
 * baiProvider.test.js — Suite de Pruebas TDD para el Proveedor B.AI (B ia)
 * 
 * Verifica:
 * 1. Formateo de payloads hacia https://api.b.ai/v1/chat/completions.
 * 2. Procesamiento de reasoning_content y texto generado.
 * 3. Integración en callAiProvider con provider: 'bai'.
 * 4. Fallback resiliente ante errores de balance o rate limit.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { callAiProvider } from '../src/lib/ai.js';
import { MODEL_REGISTRY, calculateCost } from '../src/config/pricing.js';

describe('B.AI (B ia) Provider - TDD Test Suite', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('Debe tener registrados los modelos principales de B.AI en MODEL_REGISTRY', () => {
    assert.ok(MODEL_REGISTRY['gpt-5.2'], 'Debe existir gpt-5.2 en el registro');
    assert.equal(MODEL_REGISTRY['gpt-5.2'].provider, 'bai');

    assert.ok(MODEL_REGISTRY['qwen3.8-flash'], 'Debe existir qwen3.8-flash en el registro');
    assert.equal(MODEL_REGISTRY['qwen3.8-flash'].provider, 'bai');
    assert.equal(MODEL_REGISTRY['qwen3.8-flash'].tier, 'free');
  });

  it('Debe invocar el endpoint de B.AI con Authorization Bearer y estructura OpenAI', async () => {
    let capturedUrl = null;
    let capturedHeaders = null;
    let capturedBody = null;

    globalThis.fetch = async (url, options) => {
      const urlStr = String(url);
      if (urlStr.includes('api.b.ai')) {
        capturedUrl = urlStr;
        capturedHeaders = options.headers;
        capturedBody = JSON.parse(options.body);

        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'chatcmpl-bai-test-123',
            object: 'chat.completion',
            created: 1788492261,
            model: 'gpt-5.2',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  reasoning_content: 'Análisis preliminar de viabilidad...',
                  content: '{"resumen": "Propuesta ejecutiva generada vía B.AI"}'
                },
                finish_reason: 'stop'
              }
            ],
            usage: {
              prompt_tokens: 150,
              completion_tokens: 80,
              total_tokens: 230
            }
          })
        };
      }
      return { ok: true, json: async () => ({}) };
    };

    const config = {
      provider: 'bai',
      baiKey: 'sk-ot9784lxbkdpedgsxlnf55400obu54ie',
      model: 'gpt-5.2'
    };

    const response = await callAiProvider(config, 'Generar análisis de mercado', true);
    
    assert.equal(capturedUrl, 'https://api.b.ai/v1/chat/completions');
    assert.equal(capturedHeaders['Authorization'], 'Bearer sk-ot9784lxbkdpedgsxlnf55400obu54ie');
    assert.equal(capturedHeaders['Content-Type'], 'application/json');
    assert.equal(capturedBody.model, 'gpt-5.2');
    assert.equal(response.resumen, 'Propuesta ejecutiva generada vía B.AI');
  });

  it('Debe hacer fallback a otro proveedor si B.AI devuelve error de balance o rate limit', async () => {
    globalThis.fetch = async (url, options) => {
      const urlStr = String(url);
      if (urlStr.includes('api.b.ai')) {
        return {
          ok: false,
          status: 402,
          json: async () => ({
            error: {
              code: 'insufficient_user_quota',
              message: 'credit insufficient balance'
            }
          })
        };
      }
      if (urlStr.includes('api.groq.com')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [
              { message: { content: '{"status": "Recuperado exitosamente en Groq"}' } }
            ],
            usage: { total_tokens: 100 }
          })
        };
      }
      return { ok: true, json: async () => ({}) };
    };

    const config = {
      provider: 'bai',
      baiKey: 'sk-ot9784lxbkdpedgsxlnf55400obu54ie',
      groqKey: 'gsk_fallback_mock',
      model: 'gpt-5.2'
    };

    const response = await callAiProvider(config, 'Validar presupuesto', true);
    assert.equal(response.status, 'Recuperado exitosamente en Groq');
  });
});
