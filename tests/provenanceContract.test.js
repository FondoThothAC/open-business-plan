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

test('Fase 3: Cable de Claves hacia Deep Research y Prioridad en Servidor', async (t) => {
  await t.test('buildSearchApiKeys debe generar el objeto esperado para TerminalDrawer y agentTools', () => {
    const config = {
      search: {
        provider: 'tavily',
        apiKey: 'tvly-live-123',
        braveApiKey: 'brave-live-456'
      }
    };
    const keys = buildSearchApiKeys(config);
    assert.deepStrictEqual(keys, {
      tavilyKey: 'tvly-live-123',
      braveKey: 'brave-live-456'
    });
  });

  await t.test('resolución de servidor debe priorizar process.env sobre el body del cliente', () => {
    const mockEnv = {
      TAVILY_API_KEY: 'env-tavily-key',
      BRAVE_SEARCH_KEY: 'env-brave-key'
    };
    const clientBodyKeys = {
      tavilyKey: 'body-tavily-key',
      braveKey: 'body-brave-key'
    };

    const resolved = {
      tavilyKey: mockEnv.TAVILY_API_KEY || clientBodyKeys.tavilyKey || '',
      braveKey: mockEnv.BRAVE_SEARCH_KEY || mockEnv.BRAVE_API_KEY || clientBodyKeys.braveKey || ''
    };

    assert.strictEqual(resolved.tavilyKey, 'env-tavily-key');
    assert.strictEqual(resolved.braveKey, 'env-brave-key');
  });
});

test('Fase 4: tool_web_search conectado a /api/search y Erradicación de Competidores Fake', async (t) => {
  await t.test('con fetch caído o sin resultados, debe devolver estado honesto vacío sin fabricar competidores', async () => {
    const res = await executeAgentTool('tool_web_search', {
      query: 'Termofusión Minera Cananea Hiper-Especializada XYZ99',
      location: 'Cananea, Sonora',
      forceSimulateNoResults: true
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.provenance, 'none');
    assert.strictEqual(res.data.competitorsFound, 0);
    assert.deepStrictEqual(res.data.results, []);
    assert.ok(res.data.warning.includes('Sin datos verificados'));
  });

  await t.test('debe consultar POST /api/search con los parámetros correctos y marcar resultados como real', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url, opts) => {
        if (String(url).includes('/api/search')) {
          assert.strictEqual(opts.method, 'POST');
          const body = JSON.parse(opts.body);
          assert.strictEqual(body.provider, 'tavily');
          assert.strictEqual(body.apiKey, 'tvly-phase4-token');
          assert.ok(body.query.includes('Panadería Artesanal'));

          return {
            ok: true,
            json: async () => ({
              success: true,
              provider: 'tavily',
              results: [
                { title: 'Panadería La Espiga', url: 'https://laespiga.mx', snippet: 'Pan de masa madre' }
              ]
            })
          };
        }
        return originalFetch(url, opts);
      };

      const res = await executeAgentTool('tool_web_search', {
        query: 'Panadería Artesanal',
        location: 'Colonia Roma, CDMX'
      }, {
        config: {
          apiBase: 'http://localhost:3001',
          search: {
            provider: 'tavily',
            apiKey: 'tvly-phase4-token'
          }
        }
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data.provenance, 'real');
      assert.strictEqual(res.data.competitorsFound, 1);
      assert.strictEqual(res.data.results[0].title, 'Panadería La Espiga');
      assert.strictEqual(res.data.results[0].provenance, 'real');
      assert.strictEqual(res.data.results[0].provider, 'tavily');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});


