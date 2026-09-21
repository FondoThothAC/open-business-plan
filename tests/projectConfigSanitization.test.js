import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeProjectConfig } from '../src/lib/serverUtils/sanitizeProjectConfig.js';

test('el guardado conserva la configuración del proyecto sin persistir credenciales', () => {
  const original = {
    projectId: 'proyecto-seguro',
    projectType: 'business',
    externalApis: { inegiToken: 'inegi-secret', banxicoToken: 'banxico-secret' },
    apiKeys: { tavily: 'tavily-secret' },
    ai: {
      primaryProvider: 'ollama',
      model: 'minimax-m3:cloud',
      depth: 2,
      ollamaKey: 'ollama-secret',
      bobOllamaKey: 'bob-secret',
      openrouterKey: 'openrouter-secret'
    }
  };

  const clean = sanitizeProjectConfig(original);

  assert.equal(clean.projectId, 'proyecto-seguro');
  assert.equal(clean.ai.primaryProvider, 'ollama');
  assert.equal(clean.ai.model, 'minimax-m3:cloud');
  assert.equal(clean.ai.depth, 2);
  assert.equal(clean.externalApis, undefined);
  assert.equal(clean.apiKeys, undefined);
  assert.equal(clean.ai.ollamaKey, undefined);
  assert.equal(clean.ai.bobOllamaKey, undefined);
  assert.equal(clean.ai.openrouterKey, undefined);
  assert.equal(original.ai.ollamaKey, 'ollama-secret');
});
