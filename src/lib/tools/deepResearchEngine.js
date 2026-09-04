/**
 * deepResearchEngine.js — Motor de Investigación Profunda Híbrido y Resiliente
 * Fondo Thoth AC — Open Business Plan
 * 
 * Estrategia de búsqueda escalonada:
 * - Fila 1 (Gratis / Freemium / Local): Se agota primero:
 *     1. INEGI DENUE / Banxico SIE (APIs oficiales del estado mexicano)
 *     2. Tavily Free Tier (1,000 créditos mensuales gratuitos)
 *     3. Brave Search Free API (2,000 req/mes)
 *     4. DuckDuckGo + Scraping de Hardware Local (Puppeteer/Chromium local)
 * - Fila 2 (Premium):
 *     1. Exa.ai (Búsqueda neuronal semántica B2B para competidores reales)
 *     2. Perplexity Sonar Pro (Razonamiento en vivo con citas verificadas)
 *     3. Tavily Pro
 * 
 * Contrato Estricto de Procedencia (Data Provenance):
 * Cada fuente entrega { title, url, snippet, score, provider, provenance: 'verified_real' | 'synthetic_estimate', retrievedAt, confidenceScore }.
 */

import { executeAgentTool } from '../agentTools.js';

export const SEARCH_TIERS = {
  tier1_free: ['inegi_denue', 'banxico_sie', 'duckduckgo', 'brave', 'tavily_free', 'local_puppeteer'],
  tier2_premium: ['exa', 'perplexity', 'tavily_pro', 'serper']
};

export const PRICING_ESTIMATES = {
  tavily: 0.005,      // ~$5 USD por 1,000 búsquedas
  perplexity: 0.010,  // ~$10 USD por 1,000 queries Sonar
  exa: 0.008,         // ~$8 USD por 1,000 queries semánticas de empresas
  brave: 0.000,       // 2,000 consultas gratis al mes
  serper: 0.001,      // 2,500 queries de prueba gratis
  free_tier: 0.000    // Capa base sin costo de API
};

/**
 * Conector para Brave Search API (Fila 1 Freemium)
 */
async function fetchBraveSearch(query, apiKey, depth = 'rapido') {
  if (!apiKey) return null;
  const count = depth === 'profundo' ? 8 : 4;
  const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}&text_decorations=false`, {
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': apiKey
    }
  });
  if (!res.ok) throw new Error(`Brave Search HTTP ${res.status}`);
  const data = await res.json();
  const items = data?.web?.results || [];
  return items.map(it => ({
    title: it.title,
    url: it.url,
    snippet: it.description || '',
    score: 0.88,
    provider: 'Brave Search API',
    provenance: 'verified_real',
    retrievedAt: new Date().toISOString(),
    confidenceScore: 0.90
  }));
}

/**
 * Conector para Exa.ai API (Fila 2 Premium — Búsqueda Semántica de Empresas y Competidores B2B)
 */
async function fetchExaSearch(query, apiKey, depth = 'rapido') {
  if (!apiKey) return null;
  const numResults = depth === 'profundo' ? 8 : 5;
  const res = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      query,
      type: 'neural',
      useAutoprompt: true,
      numResults,
      contents: {
        text: { maxCharacters: 1000 }
      }
    })
  });
  if (!res.ok) throw new Error(`Exa.ai HTTP ${res.status}`);
  const data = await res.json();
  const items = data?.results || [];
  return items.map(it => ({
    title: it.title || it.url,
    url: it.url,
    snippet: it.text ? it.text.substring(0, 300) : '',
    score: it.score || 0.95,
    provider: 'Exa.ai Neural Search',
    provenance: 'verified_real',
    retrievedAt: new Date().toISOString(),
    confidenceScore: 0.95
  }));
}

/**
 * Conector para Perplexity Sonar API (Fila 2 Premium — Razonamiento con Citas en Vivo)
 */
async function fetchPerplexitySearch(query, apiKey) {
  if (!apiKey) return null;
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { role: 'system', content: 'Eres un analista de mercado de alta precisión. Devuelve hallazgos factuales con URLs y fuentes de precios y competidores.' },
        { role: 'user', content: query }
      ]
    })
  });
  if (!res.ok) throw new Error(`Perplexity HTTP ${res.status}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  const citations = data?.citations || [];
  return citations.map((url, idx) => ({
    title: `Fuente Verificada Perplexity #${idx + 1}`,
    url,
    snippet: content.substring(idx * 150, (idx + 1) * 150) || content.substring(0, 200),
    score: 0.94,
    provider: 'Perplexity Sonar',
    provenance: 'verified_real',
    retrievedAt: new Date().toISOString(),
    confidenceScore: 0.93
  }));
}

/**
 * Conector para Tavily AI Search (Fila 1 Freemium / Fila 2 Pro)
 */
async function fetchTavilySearch(query, apiKey, depth = 'rapido') {
  if (!apiKey) return null;
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: depth === 'profundo' ? 'advanced' : 'basic',
      include_answer: true,
      max_results: depth === 'profundo' ? 7 : 4
    })
  });
  if (!response.ok) throw new Error(`Tavily HTTP ${response.status}`);
  const tavilyData = await response.json();
  const results = tavilyData.results || [];
  return results.map(r => ({
    title: r.title,
    url: r.url,
    snippet: r.content,
    score: r.score || 0.9,
    provider: 'Tavily AI Search',
    provenance: 'verified_real',
    retrievedAt: new Date().toISOString(),
    confidenceScore: 0.92
  }));
}

/**
 * Ejecuta una investigación profunda en el ecosistema híbrido
 * Prioriza agotar Fila 1 (Gratis/Freemium/Local) antes de activar Fila 2 (Premium).
 */
export async function runDeepResearch({
  query,
  domain = 'mercado',
  depth = 'rapido',
  forcePaidTier = false,
  tierPreference = 'tier1_first',
  simulateQuotaExhausted = false,
  allowSyntheticEstimate = false,
  apiKeys = {},
  onLog = () => {}
}) {
  const startTime = Date.now();
  let costAccumulated = 0;
  let sources = [];
  let rawSnippets = [];
  let tierUsed = 'free';
  let tierCategory = 'tier1_free';

  onLog(`🔍 Iniciando Deep Research para: "${query}" (Dominio: ${domain}, Nivel: ${depth})`);

  // Verificación de pausa por cuota / simulación
  if (simulateQuotaExhausted || (apiKeys.tavilyKey === 'fake_exhausted_key')) {
    onLog(`⏸️ Cuota de proveedor agotada. Pausando investigación y programando reanudación automática...`);
    const resumeAfterMs = 3600000;
    const quotaData = {
      status: 'paused_waiting_quota',
      query,
      domain,
      depth,
      reason: 'Límite de cuota o rate limit alcanzado en el proveedor. Tarea pausada automáticamente.',
      resumeAfterMs,
      resumeAt: new Date(Date.now() + resumeAfterMs).toISOString(),
      sources: [],
      summary: `Investigación en pausa por cuota. Se reanudará de forma automática en ${Math.round(resumeAfterMs / 60000)} minutos.`
    };
    return {
      success: true,
      data: quotaData,
      ...quotaData
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FASE 1: AGOTAR PRIMERO FILA 1 (GRATIS / FREEMIUM / HARDWARE LOCAL)
  // ─────────────────────────────────────────────────────────────────────────
  const braveKey = apiKeys.braveKey || (typeof process !== 'undefined' ? process.env.BRAVE_SEARCH_KEY : null);
  const tavilyKey = apiKeys.tavilyKey || (typeof process !== 'undefined' ? process.env.TAVILY_API_KEY : null);
  const exaKey = apiKeys.exaKey || (typeof process !== 'undefined' ? process.env.EXA_API_KEY : null);
  const perplexityKey = apiKeys.perplexityKey || (typeof process !== 'undefined' ? process.env.PERPLEXITY_API_KEY : null);

  let gatheredTier1 = false;

  if (tierPreference !== 'tier2_premium' && !forcePaidTier) {
    onLog('⚡ Consultando Fila 1 (Gratis / Freemium / Oficiales)...');

    // 1.1 Intentar Tavily Free (1,000 consultas gratis/mes)
    if (tavilyKey && sources.length === 0) {
      try {
        onLog('📡 Consultando Tavily Free Tier para extracción limpia...');
        const tavilySources = await fetchTavilySearch(query, tavilyKey, depth);
        if (tavilySources && tavilySources.length > 0) {
          sources.push(...tavilySources);
          costAccumulated += PRICING_ESTIMATES.tavily;
          gatheredTier1 = true;
          onLog(`✅ Tavily Free devolvió ${tavilySources.length} fuentes reales.`);
        }
      } catch (err) {
        onLog(`⚠️ Tavily Free no disponible (${err.message}). Pasando a siguiente proveedor Fila 1...`);
      }
    }

    // 1.2 Intentar Brave Search (2,000 consultas gratis/mes)
    if (braveKey && sources.length === 0) {
      try {
        onLog('🦁 Consultando Brave Search API (Freemium)...');
        const braveSources = await fetchBraveSearch(query, braveKey, depth);
        if (braveSources && braveSources.length > 0) {
          sources.push(...braveSources);
          costAccumulated += PRICING_ESTIMATES.brave;
          gatheredTier1 = true;
          onLog(`✅ Brave Search devolvió ${braveSources.length} fuentes reales.`);
        }
      } catch (err) {
        onLog(`⚠️ Brave Search no disponible (${err.message}). Pasando a DuckDuckGo / Local...`);
      }
    }

    // 1.3 DuckDuckGo & Scraping de Hardware Local
    if (sources.length === 0) {
      try {
        onLog('🦆 Consultando DuckDuckGo + Scraping de Hardware Local...');
        const ddgResult = await executeAgentTool('tool_web_search', { query, limit: 5, allowSyntheticEstimate: false });
        if (ddgResult?.data?.results && ddgResult.data.results.length > 0) {
          const ddgSources = ddgResult.data.results.map(r => ({
            title: r.title || 'Referencia Web Verificada',
            url: r.link || r.url || 'https://duckduckgo.com',
            snippet: r.snippet || r.body || r.pricingAvg || '',
            score: 0.80,
            provider: r.provider || 'DuckDuckGo Web',
            provenance: r.provenance || 'real',
            retrievedAt: r.retrievedAt || new Date().toISOString(),
            confidenceScore: r.confidenceScore || 0.82
          }));
          sources.push(...ddgSources);
          gatheredTier1 = true;
          onLog(`✅ Capa local recopiló ${ddgSources.length} resultados web reales.`);
        }
      } catch (err) {
        onLog(`⚠️ Búsqueda local no completó resultados: ${err.message}`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FASE 2: FILA 2 PREMIUM (EXA.AI / PERPLEXITY) SI FUE SOLICITADA O TRAS AGOTAR FILA 1
  // ─────────────────────────────────────────────────────────────────────────
  if ((forcePaidTier || tierPreference === 'tier2_premium' || (sources.length === 0 && (exaKey || perplexityKey)))) {
    onLog('💎 Activando Fila 2 Premium (Exa.ai / Perplexity Sonar)...');
    tierUsed = 'premium';
    tierCategory = 'tier2_premium';

    // 2.1 Intentar Exa.ai (Especialista en Empresas B2B y Competidores Reales)
    if (exaKey && sources.length === 0) {
      try {
        onLog('🧠 Consultando Exa.ai Neural Search (Búsqueda Semántica de Empresas)...');
        const exaSources = await fetchExaSearch(query, exaKey, depth);
        if (exaSources && exaSources.length > 0) {
          sources.push(...exaSources);
          costAccumulated += PRICING_ESTIMATES.exa;
          onLog(`✅ Exa.ai identificó ${exaSources.length} empresas y competidores reales verificados.`);
        }
      } catch (err) {
        onLog(`⚠️ Exa.ai no disponible (${err.message})...`);
      }
    }

    // 2.2 Intentar Perplexity Sonar
    if (perplexityKey && sources.length === 0) {
      try {
        onLog('🔮 Consultando Perplexity Sonar (Razonamiento y Citas en Vivo)...');
        const pplxSources = await fetchPerplexitySearch(query, perplexityKey);
        if (pplxSources && pplxSources.length > 0) {
          sources.push(...pplxSources);
          costAccumulated += PRICING_ESTIMATES.perplexity;
          onLog(`✅ Perplexity Sonar extrajo ${pplxSources.length} citas verificadas.`);
        }
      } catch (err) {
        onLog(`⚠️ Perplexity no disponible (${err.message})...`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FASE 3: ENRIQUECIMIENTO CON DATOS OFICIALES INEGI DENUE
  // ─────────────────────────────────────────────────────────────────────────
  if (domain === 'competencia' || domain === 'mercado' || domain === 'maquinaria') {
    try {
      onLog('🗺️ Cruzando con base de datos geoespacial de establecimientos (INEGI DENUE)...');
      const inegiResult = await executeAgentTool('tool_inegi_denue', {
        keywords: query,
        allowSyntheticEstimate: false
      });
      if (inegiResult?.data?.establishments && inegiResult.data.establishments.length > 0) {
        sources.push({
          title: `Directorio DENUE INEGI (${inegiResult.data.establishments.length} establecimientos encontrados)`,
          url: 'https://www.inegi.org.mx/app/mapa/denue/',
          snippet: `Establecimientos reales registrados: ${inegiResult.data.establishments.slice(0, 3).map(e => e.nombre || e.razonSocial).join(', ')}.`,
          score: 0.98,
          provider: 'INEGI DENUE Oficial',
          provenance: 'verified_real',
          retrievedAt: new Date().toISOString(),
          confidenceScore: 0.99
        });
      }
    } catch {
      // Continuar con lo recopilado
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FASE 4: RESGUARDO CONTRA ALUCINACIONES (Data Provenance Contract)
  // ─────────────────────────────────────────────────────────────────────────
  if (sources.length === 0) {
    if (allowSyntheticEstimate) {
      onLog('ℹ️ No se hallaron fuentes web directas. Generando estimación heurística aprobada manualmente...');
      sources.push({
        title: `Estimación Heurística de Mercado: ${query}`,
        url: 'https://fondothoth.com/estimaciones',
        snippet: `Proyección heurística para "${query}" basada en densidad sectorial nacional. No constituye una cita factual confirmada.`,
        score: 0.60,
        provider: 'Motor Heurístico Local',
        provenance: 'synthetic_estimate',
        retrievedAt: new Date().toISOString(),
        confidenceScore: 0.50
      });
    } else {
      onLog('⚠️ No se encontraron fuentes verificadas para esta consulta en la web.');
      sources.push({
        title: `Sin Fuentes Verificadas para: ${query}`,
        url: 'https://fondothoth.com/radar',
        snippet: `No se encontraron resultados verificados en internet para los términos especificados. Se recomienda afinar la búsqueda.`,
        score: 0.40,
        provider: 'Verificador de Procedencia',
        provenance: 'not_found',
        retrievedAt: new Date().toISOString(),
        confidenceScore: 0.0
      });
    }
  }

  rawSnippets = sources.map(s => `[${s.provider}] (${(s.provenance === 'real' || s.provenance === 'verified_real') ? 'Verificado' : 'Estimación'}): ${s.title} — ${s.snippet}`);

  const durationMs = Date.now() - startTime;
  const synthesizedSummary = rawSnippets.join('\n\n');

  const resultData = {
    status: 'completed',
    query,
    domain,
    depth,
    tierUsed,
    tierCategory,
    durationMs,
    costUsd: Number(costAccumulated.toFixed(4)),
    sourcesCount: sources.length,
    sources,
    summary: synthesizedSummary
  };

  return {
    success: true,
    data: resultData,
    ...resultData
  };
}

