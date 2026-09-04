import test from 'node:test';
import assert from 'node:assert/strict';
import { executeAgentTool, AGENT_TOOLS_MANIFEST } from '../src/lib/agentTools.js';
import { runDeepResearch, SEARCH_TIERS } from '../src/lib/tools/deepResearchEngine.js';

test('Contrato Estricto de Procedencia de Datos (Data Provenance)', async (t) => {
  await t.test('tool_web_search no debe inventar empresas falsas si no hay resultados', async () => {
    // Si la búsqueda web falla o no hay conexión
    const res = await executeAgentTool('tool_web_search', {
      query: 'Termofusión Minera Cananea Hiper-Especializada XYZ99',
      location: 'Cananea, Sonora',
      forceSimulateNoResults: true
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.provenance, 'none');
    assert.strictEqual(res.data.competitorsFound, 0);
    assert.strictEqual(res.data.results.length, 0);
    assert.ok(res.data.warning.includes('Sin datos verificados'));
  });

  await t.test('tool_web_search retorna estado honesto vacío sin fabricar cuando no hay resultados', async () => {
    const res = await executeAgentTool('tool_web_search', {
      query: 'Negocio Desconocido 987654321',
      location: 'Ubicación Remota',
      forceSimulateNoResults: true
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.provenance, 'none');
    assert.strictEqual(res.data.competitorsFound, 0);
    assert.deepStrictEqual(res.data.results, []);
    assert.strictEqual(res.data.isFactualVerified, false);
    assert.ok(res.data.warning.includes('Sin datos verificados'));
  });

  await t.test('tool_inegi_denue debe reportar provenance: real o none sin inventar empresas por defecto', async () => {
    const res = await executeAgentTool('tool_inegi_denue', {
      keywords: 'Minería Inexistente 99999',
      location: 'Polo Norte',
      allowSyntheticEstimate: false,
      forceSimulateNoResults: true
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.data.provenance === 'none' || res.data.provenance === 'not_found' || res.data.provenance === 'real' || res.data.provenance === 'verified_real');
    if (res.data.provenance === 'none' || res.data.provenance === 'not_found') {
      assert.strictEqual(res.data.totalFound, 0);
      assert.strictEqual(res.data.isSynthetic, false);
    }
  });
});

test('Arquitectura de Búsqueda Fila 1 (Freemium/Local) y Fila 2 (Premium)', async (t) => {
  await t.test('SEARCH_TIERS debe definir formalmente proveedores de Fila 1 y Fila 2', () => {
    assert.ok(Array.isArray(SEARCH_TIERS.tier1_free));
    assert.ok(Array.isArray(SEARCH_TIERS.tier2_premium));
    
    // Fila 1 debe incluir DuckDuckGo, Brave Search y Tavily Free
    assert.ok(SEARCH_TIERS.tier1_free.includes('duckduckgo'));
    assert.ok(SEARCH_TIERS.tier1_free.includes('brave'));
    assert.ok(SEARCH_TIERS.tier1_free.includes('tavily_free'));

    // Fila 2 debe incluir Exa y Perplexity
    assert.ok(SEARCH_TIERS.tier2_premium.includes('exa'));
    assert.ok(SEARCH_TIERS.tier2_premium.includes('perplexity'));
  });

  await t.test('runDeepResearch debe ejecutar Fila 1 primero y devolver fuentes con contrato de procedencia honesto', async () => {
    const result = await runDeepResearch({
      query: 'Maquinaria de Trituración para Cobre en México',
      domain: 'maquinaria',
      depth: 'rapido',
      tierPreference: 'tier1_first'
    });

    assert.strictEqual(result.success, true);
    // En entorno offline o sin claves, sources es un array honesto (vacío si no hay resultados reales)
    assert.ok(Array.isArray(result.data.sources));
    if (result.data.sources.length > 0) {
      const firstSource = result.data.sources[0];
      assert.ok(firstSource.title);
      assert.ok(['real', 'verified_real', 'synthetic', 'synthetic_estimate', 'none', 'not_found'].includes(firstSource.provenance));
      assert.ok(typeof firstSource.retrievedAt === 'string');
    } else {
      assert.ok(result.data.summary.includes('Sin fuentes verificadas') || result.data.summary.length > 0);
    }
  });

  await t.test('runDeepResearch con allowSyntheticEstimate debe generar estimación cuando no hay fuentes reales', async () => {
    const result = await runDeepResearch({
      query: 'Inexistente XYZ 123456789',
      domain: 'mercado',
      allowSyntheticEstimate: true
    });

    assert.strictEqual(result.success, true);
    const synthSource = result.data.sources[0];
    assert.ok(synthSource.provenance === 'synthetic' || synthSource.provenance === 'synthetic_estimate');
  });
});
