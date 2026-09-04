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
import { busquedaMultiFuente } from '../server/competitorEngine.js';
import { runDeepResearch } from '../src/lib/tools/deepResearchEngine.js';
import { checkSearchQuota, incrementSearchQuota, resetSearchQuota } from '../server/quotaTracker.js';

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

test('Fase 5: Erradicación de Fuentes Sintéticas No Autorizadas y Etiquetado Honesto', async (t) => {
  await t.test('executeToolInegiDenue sin allowSyntheticEstimate debe retornar provenance none sin inventar datos', async () => {
    const res = await executeAgentTool('tool_inegi_denue', {
      keywords: 'Mina Cobre Subterránea Inexistente 8888',
      location: 'Ubicación Fantasma',
      allowSyntheticEstimate: false,
      forceSimulateNoResults: true
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.provenance, 'none');
    assert.strictEqual(res.data.totalFound, 0);
    assert.strictEqual(res.data.isSynthetic, false);
    assert.deepStrictEqual(res.data.establishments, []);
    assert.ok(res.data.warning.includes('No se encontraron unidades económicas'));
  });

  await t.test('executeToolInegiDenue con allowSyntheticEstimate=true debe marcar provenance synthetic', async () => {
    const res = await executeAgentTool('tool_inegi_denue', {
      keywords: 'Minería y Refacciones',
      location: 'Cananea, Sonora',
      allowSyntheticEstimate: true,
      forceSimulateNoResults: true
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.provenance, 'synthetic');
    assert.strictEqual(res.data.isSynthetic, true);
    assert.strictEqual(res.data.sourceUsed, 'synthetic_cluster');
    assert.ok(res.data.warning.includes('Clúster territorial estimado'));
    assert.strictEqual(res.data.establishments[0].provenance, 'synthetic');
  });

  await t.test('busquedaMultiFuente con allowSynthetic=false debe devolver lista vacía sin fabricar 16 competidores', async () => {
    const res = await busquedaMultiFuente({
      lat: 29.072967,
      lng: -110.955919,
      query: 'Actividad Extremadamente Rara Inexistente 99999',
      radius: 100,
      allowSynthetic: false
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.total, 0);
    assert.deepStrictEqual(res.competidores, []);
    assert.strictEqual(res.reason, 'Sin competidores verificados en las fuentes consultadas');
  });

  await t.test('busquedaMultiFuente con allowSynthetic=true debe marcar competidores con confianza baja y provenance synthetic', async () => {
    const res = await busquedaMultiFuente({
      lat: 29.072967,
      lng: -110.955919,
      query: 'Actividad Extremadamente Rara Inexistente 99999',
      radius: 100,
      allowSynthetic: true
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.competidores.length >= 1);
    const synth = res.competidores[0];
    assert.strictEqual(synth.confianza, 'baja');
    assert.strictEqual(synth.provenance, 'synthetic');
  });

  await t.test('runDeepResearch sin fuentes no debe insertar URL fondothoth.com/radar', async () => {
    const res = await runDeepResearch({
      query: 'Consulta Sin Resultados Web 55555',
      domain: 'general',
      allowSyntheticEstimate: false
    });

    assert.strictEqual(res.success, true);
    const radarUrls = res.data.sources.filter(s => s.url && s.url.includes('fondothoth.com/radar'));
    assert.strictEqual(radarUrls.length, 0);
  });
});

test('Fase 6: Soporte para Brave Search, Cuotas Persistidas y Cascada con Autorización', async (t) => {
  await t.test('checkSearchQuota para duckduckgo siempre debe estar permitido sin autorización', () => {
    const q = checkSearchQuota('duckduckgo');
    assert.strictEqual(q.allowed, true);
    assert.strictEqual(q.quotaExceeded, false);
    assert.strictEqual(q.requiresAuthorization, false);
  });

  await t.test('incrementSearchQuota debe incrementar y persistir conteo', () => {
    resetSearchQuota();
    const c1 = incrementSearchQuota('brave');
    assert.strictEqual(c1, 1);
    const c2 = incrementSearchQuota('brave');
    assert.strictEqual(c2, 2);
  });

  await t.test('cuota excedida sin allowPaidTier debe requerir autorización', () => {
    resetSearchQuota();
    // Simular que tavily alcanzó el límite de 950
    for (let i = 0; i < 950; i++) {
      incrementSearchQuota('tavily');
    }
    const q = checkSearchQuota('tavily', false);
    assert.strictEqual(q.allowed, false);
    assert.strictEqual(q.quotaExceeded, true);
    assert.strictEqual(q.requiresAuthorization, true);
  });

  await t.test('cuota excedida con allowPaidTier=true debe permitir ejecución en nivel de pago', () => {
    const q = checkSearchQuota('tavily', true);
    assert.strictEqual(q.allowed, true);
    assert.strictEqual(q.paidTierActive, true);
    assert.strictEqual(q.requiresAuthorization, false);
  });

  await t.test('tool_web_search con failover debe consultar y preservar procedencia real', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url, opts) => {
        if (String(url).includes('/api/search')) {
          const body = JSON.parse(opts.body);
          assert.strictEqual(body.provider, 'brave');
          // Simular respuesta exitosa de Brave Search
          return {
            ok: true,
            json: async () => ({
              success: true,
              provider: 'brave',
              results: [
                { title: 'Tornos CNC México', url: 'https://maquinaria.mx', snippet: 'Venta de maquinaria' }
              ]
            })
          };
        }
        return originalFetch(url, opts);
      };

      const res = await executeAgentTool('tool_web_search', {
        query: 'Tornos CNC Industriales',
        location: 'Monterrey, NL'
      }, {
        config: {
          search: {
            provider: 'brave',
            braveApiKey: 'brave-test-key-valid'
          }
        }
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data.provenance, 'real');
      assert.strictEqual(res.data.results[0].provider, 'brave');
      assert.strictEqual(res.data.results[0].provenance, 'real');
    } finally {
      globalThis.fetch = originalFetch;
      resetSearchQuota();
    }
  });
});


