import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeSearchConfig,
  buildSearchApiKeys,
  tagReal,
  tagSynthetic,
  tagLocalOffline,
  tagNone,
  createHonestEmptyResult,
  summarizeProvenance
} from '../src/lib/tools/provenance.js';
import { executeAgentTool } from '../src/lib/agentTools.js';

test('Fase 1: Unificación de Esquema config.search y Migración de Aliases Legacy', async (t) => {
  await t.test('debe normalizar el esquema canónico por defecto', () => {
    const config = normalizeSearchConfig({});
    assert.strictEqual(config.provider, 'duckduckgo');
    assert.strictEqual(config.apiKey, '');
    assert.strictEqual(config.braveApiKey, '');
    assert.strictEqual(config.enableDdg, true);
    assert.strictEqual(config.scraperEngine, 'local');
    assert.strictEqual(config.allowPaidTier, false);
    assert.strictEqual(config.failover, true);
  });

  await t.test('debe migrar tavilyApiKey a apiKey si apiKey está ausente', () => {
    const legacySearch = {
      provider: 'tavily',
      tavilyApiKey: 'tvly-legacy-secret-999',
      duckDuckGoEnabled: false
    };
    const normalized = normalizeSearchConfig(legacySearch);
    assert.strictEqual(normalized.apiKey, 'tvly-legacy-secret-999');
    assert.strictEqual(normalized.enableDdg, false);
    assert.strictEqual(normalized.provider, 'tavily');
  });

  await t.test('debe migrar braveKey a braveApiKey', () => {
    const legacySearch = {
      braveKey: 'brave-secret-abc'
    };
    const normalized = normalizeSearchConfig(legacySearch);
    assert.strictEqual(normalized.braveApiKey, 'brave-secret-abc');
  });

  await t.test('buildSearchApiKeys debe extraer tavilyKey y braveKey puras', () => {
    const planConfig = {
      search: {
        apiKey: 'tvly-key-1',
        braveApiKey: 'brave-key-2'
      }
    };
    const keys = buildSearchApiKeys(planConfig);
    assert.strictEqual(keys.tavilyKey, 'tvly-key-1');
    assert.strictEqual(keys.braveKey, 'brave-key-2');
  });

  await t.test('buildSearchApiKeys debe resolver claves incluso si vienen con nombres legacy', () => {
    const legacyPlanConfig = {
      search: {
        tavilyApiKey: 'tvly-key-legacy',
        braveKey: 'brave-key-legacy'
      }
    };
    const keys = buildSearchApiKeys(legacyPlanConfig);
    assert.strictEqual(keys.tavilyKey, 'tvly-key-legacy');
    assert.strictEqual(keys.braveKey, 'brave-key-legacy');
  });
});

test('Fase 2: Contrato Estricto de Procedencia y Estado Honesto Vacío', async (t) => {
  await t.test('tagReal debe marcar datos factuales verificados', () => {
    const tagged = tagReal('Tavily Web', 'https://ejemplo.com/estudio');
    assert.strictEqual(tagged.provenance, 'real');
    assert.strictEqual(tagged.provider, 'Tavily Web');
    assert.strictEqual(tagged.sourceUrl, 'https://ejemplo.com/estudio');
    assert.ok(typeof tagged.retrievedAt === 'string');
    assert.strictEqual(tagged.confidenceScore, 0.95);
  });

  await t.test('tagSynthetic debe marcar estimaciones heurísticas con advertencia', () => {
    const synth = tagSynthetic('Motor Heurístico Local', 'Estimación manual');
    assert.strictEqual(synth.provenance, 'synthetic');
    assert.strictEqual(synth.sourceUrl, null);
    assert.strictEqual(synth.warning, 'Estimación manual');
    assert.strictEqual(synth.confidenceScore, 0.40);
  });

  await t.test('createHonestEmptyResult debe retornar estado honesto sin payload inventado', () => {
    const empty = createHonestEmptyResult('Tornos CNC en Mérida');
    assert.strictEqual(empty.success, true);
    assert.strictEqual(empty.data.provenance, 'none');
    assert.strictEqual(empty.data.totalFound, 0);
    assert.deepStrictEqual(empty.data.results, []);
    assert.ok(empty.data.warning.includes('Sin datos verificados'));
  });

  await t.test('summarizeProvenance debe totalizar correctamente las fuentes', () => {
    const items = [
      { provenance: 'real' },
      { provenance: 'verified_real' },
      { provenance: 'synthetic' },
      { provenance: 'local_offline' },
      { provenance: 'none' }
    ];
    const summary = summarizeProvenance(items);
    assert.strictEqual(summary.real, 2);
    assert.strictEqual(summary.synthetic, 1);
    assert.strictEqual(summary.localOffline, 1);
    assert.strictEqual(summary.none, 1);
    assert.strictEqual(summary.total, 5);
  });

  await t.test('executeAgentTool debe enriquecer la respuesta con provenanceSummary', async () => {
    const res = await executeAgentTool('tool_critic_validator', {
      sectionKey: 'test',
      draftContent: 'Este es un contenido de prueba extenso para validación de agentes con 100 usuarios y 50000 pesos.'
    });
    assert.strictEqual(res.success, true);
    assert.ok(res.provenanceSummary);
    assert.strictEqual(typeof res.provenanceSummary.total, 'number');
  });
});
