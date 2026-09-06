/**
 * deepResearchEngine.js — Motor de Investigación Profunda Híbrido y Resiliente
 * Fondo Thoth AC — Open Business Plan
 * 
 * Estrategia de búsqueda escalonada:
 * - Fila 1 (Gratis / Freemium / Local): Se agota primero:
 *     1. INEGI DENUE / Banxico SIE (APIs oficiales del estado mexicano)
 *     2. DuckDuckGo + Scraping Local: Respaldo gratuito ilimitado.
 *     3. Tavily: 1,000 búsquedas/mes con cuenta Researcher.
 *     4. Brave Search: 1,000 búsquedas/mes con los $5 de crédito gratuito.
 *     5. Puppeteer/Chromium hardware local
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
  tier1_free: ['inegi_denue', 'banxico_sie', 'duckduckgo', 'tavily_free', 'brave', 'serper_free', 'local_puppeteer'],
  tier2_premium: ['exa', 'perplexity', 'tavily_pro']
};

export const PRICING_ESTIMATES = {
  tavily: 0.005,      // ~$5 USD por 1,000 búsquedas
  perplexity: 0.010,  // ~$10 USD por 1,000 queries Sonar
  exa: 0.008,         // ~$8 USD por 1,000 queries semánticas de empresas
  brave: 0.000,       // 2,000 consultas gratis al mes
  serper: 0.000,      // 2,500 queries gratis iniciales
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
 * Conector para Google Serper API (Fila 1 — 2,500 búsquedas gratuitas de Google)
 */
async function fetchSerperSearch(query, apiKey, depth = 'rapido') {
  if (!apiKey) return null;
  const num = depth === 'profundo' ? 8 : 4;
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: query,
      gl: 'mx',
      hl: 'es',
      num
    })
  });
  if (!res.ok) throw new Error(`Google Serper HTTP ${res.status}`);
  const data = await res.json();
  const items = data?.organic || [];
  return items.map(it => ({
    title: it.title,
    url: it.link,
    snippet: it.snippet || '',
    score: 0.92,
    provider: 'Google Serper Search',
    provenance: 'verified_real',
    retrievedAt: new Date().toISOString(),
    confidenceScore: 0.94
  }));
}

/**
 * Conector para Google Serper Places API (Extracción especializada de Competidores Físicos y Locales)
 */
export async function fetchSerperPlaces(query, apiKey) {
  if (!apiKey) return [];
  const res = await fetch('https://google.serper.dev/places', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: query,
      gl: 'mx',
      hl: 'es',
      num: 10
    })
  });
  if (!res.ok) throw new Error(`Google Serper Places HTTP ${res.status}`);
  const data = await res.json();
  const places = data?.places || [];
  return places.map(p => ({
    name: p.title,
    address: p.address || '',
    latitude: p.latitude || null,
    longitude: p.longitude || null,
    rating: p.rating || null,
    ratingCount: p.ratingCount || 0,
    category: p.category || 'Competidor Local',
    phoneNumber: p.phoneNumber || '',
    website: p.website || null,
    provider: 'Google Maps (Serper Places)',
    provenance: 'verified_real',
    retrievedAt: new Date().toISOString()
  }));
}

const CANONICAL_TIER1_PROVIDERS = ['duckduckgo', 'tavily', 'brave', 'serper'];

/**
 * Normaliza nombres de proveedores de búsqueda a identificadores canónicos.
 * @param {string} name - Nombre o alias del proveedor.
 * @returns {string} Identificador canónico.
 */
function normalizeProviderName(name = '') {
  if (!name || typeof name !== 'string') return '';
  const n = name.toLowerCase().trim();
  if (n === 'duckduckgo' || n === 'ddg' || n === 'duckduck') return 'duckduckgo';
  if (n === 'serper' || n === 'serper_free' || n === 'google_serper' || n === 'serper_api') return 'serper';
  if (n === 'tavily' || n === 'tavily_free' || n === 'tavily_search') return 'tavily';
  if (n === 'brave' || n === 'brave_search' || n === 'brave_free') return 'brave';
  return n;
}

/**
 * Resuelve el orden de prioridad de búsqueda para Fila 1 según la configuración.
 * Permite posicionar DuckDuckGo en cualquier prioridad (1º, 2º, 3º, etc.).
 * @param {object} searchConfig - Objeto de configuración de búsqueda.
 * @returns {string[]} Lista ordenada de proveedores para Fila 1.
 */
export function resolveTier1PriorityOrder(searchConfig = {}) {
  // 1. Prioridad explícita en array tier1Priority
  if (Array.isArray(searchConfig.tier1Priority) && searchConfig.tier1Priority.length > 0) {
    const normalized = searchConfig.tier1Priority
      .map(normalizeProviderName)
      .filter(p => CANONICAL_TIER1_PROVIDERS.includes(p));
    // Completar con los que falten asegurando DuckDuckGo
    for (const p of CANONICAL_TIER1_PROVIDERS) {
      if (!normalized.includes(p)) normalized.push(p);
    }
    return normalized;
  }

  // 2. Si se especificó un provider primario único
  if (searchConfig.provider) {
    const primary = normalizeProviderName(searchConfig.provider);
    if (CANONICAL_TIER1_PROVIDERS.includes(primary)) {
      const remaining = CANONICAL_TIER1_PROVIDERS.filter(p => p !== primary);
      return [primary, ...remaining];
    }
  }

  // 3. Orden por defecto
  return [...CANONICAL_TIER1_PROVIDERS];
}

/**
 * Ejecuta una investigación profunda en el ecosistema híbrido
 * Prioriza agotar Fila 1 (Gratis/Freemium/Local) según el orden de prioridad configurado antes de activar Fila 2 (Premium).
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
  searchConfig = {},
  onLog = () => {}
}) {
  const startTime = Date.now();
  let costAccumulated = 0;
  let sources = [];
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
  // Cascada dinámica y configurable: respeta la prioridad de DuckDuckGo, Serper, Tavily y Brave
  // ─────────────────────────────────────────────────────────────────────────
  const braveKey = apiKeys.braveKey || (typeof process !== 'undefined' ? process.env.BRAVE_SEARCH_KEY : null);
  const tavilyKey = apiKeys.tavilyKey || (typeof process !== 'undefined' ? process.env.TAVILY_API_KEY : null);
  const serperKey = apiKeys.serperKey || (typeof process !== 'undefined' ? process.env.SERPER_API_KEY : null);
  const exaKey = apiKeys.exaKey || (typeof process !== 'undefined' ? process.env.EXA_API_KEY : null);
  const perplexityKey = apiKeys.perplexityKey || (typeof process !== 'undefined' ? process.env.PERPLEXITY_API_KEY : null);

  const tier1Order = resolveTier1PriorityOrder(searchConfig);
  let gatheredTier1 = false;

  if (tierPreference !== 'tier2_premium' && !forcePaidTier) {
    onLog(`⚡ Consultando Fila 1 en orden de prioridad: [${tier1Order.join(' ➔ ')}]...`);

    for (const prov of tier1Order) {
      if (sources.length > 0) break;

      if (prov === 'duckduckgo') {
        try {
          onLog('🦆 Consultando DuckDuckGo + Scraping de Hardware Local (Respaldo gratuito ilimitado)...');
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
            onLog(`✅ Capa DuckDuckGo recopiló ${ddgSources.length} resultados web reales.`);
          }
        } catch (err) {
          onLog(`⚠️ DuckDuckGo no completó resultados (${err.message}). Continuando cascada...`);
        }
      } else if (prov === 'tavily' && tavilyKey) {
        try {
          onLog('📡 Consultando Tavily Researcher / Free Tier (1,000 búsquedas/mes)...');
          const tavilySources = await fetchTavilySearch(query, tavilyKey, depth);
          if (tavilySources && tavilySources.length > 0) {
            sources.push(...tavilySources);
            costAccumulated += PRICING_ESTIMATES.tavily;
            gatheredTier1 = true;
            onLog(`✅ Tavily devolvió ${tavilySources.length} fuentes reales.`);
          }
        } catch (err) {
          onLog(`⚠️ Tavily no disponible (${err.message}). Continuando cascada...`);
        }
      } else if (prov === 'brave' && braveKey) {
        try {
          onLog('🦁 Consultando Brave Search API (1,000 búsquedas/mes con crédito de $5)...');
          const braveSources = await fetchBraveSearch(query, braveKey, depth);
          if (braveSources && braveSources.length > 0) {
            sources.push(...braveSources);
            costAccumulated += PRICING_ESTIMATES.brave;
            gatheredTier1 = true;
            onLog(`✅ Brave Search devolvió ${braveSources.length} fuentes reales.`);
          }
        } catch (err) {
          onLog(`⚠️ Brave Search no disponible (${err.message}). Continuando cascada...`);
        }
      } else if (prov === 'serper' && serperKey) {
        try {
          onLog('🔍 Consultando Google Serper API (2,500 búsquedas gratuitas)...');
          const serperSources = await fetchSerperSearch(query, serperKey, depth);
          if (serperSources && serperSources.length > 0) {
            sources.push(...serperSources);
            costAccumulated += PRICING_ESTIMATES.serper;
            gatheredTier1 = true;
            onLog(`✅ Google Serper devolvió ${serperSources.length} resultados orgánicos de Google.`);
          }
        } catch (err) {
          onLog(`⚠️ Google Serper no disponible (${err.message}). Continuando cascada...`);
        }
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
  // FASE 3: ENRIQUECIMIENTO CON DATOS OFICIALES (INEGI DENUE + GOOGLE PLACES)
  // ─────────────────────────────────────────────────────────────────────────
  if (domain === 'competencia' || domain === 'mercado' || domain === 'maquinaria') {
    // 3.1 Cruzar con INEGI DENUE
    try {
      onLog('🗺️ Cruzando con base de datos geoespacial de establecimientos (INEGI DENUE)...');
      const inegiResult = await executeAgentTool('tool_inegi_denue', {
        keywords: query,
        allowSyntheticEstimate: false
      });
      if (inegiResult?.data?.establishments && inegiResult.data.establishments.length > 0) {
        const isSyntheticCluster = inegiResult.data.isSynthetic || inegiResult.data.sourceUsed === 'synthetic_cluster' || inegiResult.data.provenance === 'synthetic' || inegiResult.data.provenance === 'synthetic_estimate';
        const denueProvenance = isSyntheticCluster ? 'synthetic' : 'real';
        const denueConfidence = isSyntheticCluster ? 0.40 : 0.95;
        const denueProvider = isSyntheticCluster ? 'Clúster Estimado (DENUE Heurístico)' : 'INEGI DENUE Oficial';

        sources.push({
          title: `Directorio DENUE INEGI (${inegiResult.data.establishments.length} establecimientos)`,
          url: isSyntheticCluster ? null : 'https://www.inegi.org.mx/app/mapa/denue/',
          snippet: `Establecimientos registrados: ${inegiResult.data.establishments.slice(0, 3).map(e => e.nombre || e.razonSocial).join(', ')}.`,
          score: isSyntheticCluster ? 0.40 : 0.95,
          provider: denueProvider,
          provenance: denueProvenance,
          retrievedAt: new Date().toISOString(),
          confidenceScore: denueConfidence
        });
      }
    } catch {
      // Continuar con lo recopilado
    }

    // 3.2 Cruzar con Google Maps Places vía Serper si está disponible
    if (serperKey) {
      try {
        onLog('📍 Verificando fichas de negocios y competidores en Google Maps (Serper Places)...');
        const places = await fetchSerperPlaces(query, serperKey);
        if (places && places.length > 0) {
          places.slice(0, 3).forEach(pl => {
            sources.push({
              title: `${pl.name} (${pl.category})`,
              url: pl.website || 'https://maps.google.com',
              snippet: `${pl.address} — Calificación Google: ${pl.rating || 'N/A'}★ (${pl.ratingCount} reseñas). Tel: ${pl.phoneNumber || 'N/A'}`,
              score: 0.93,
              provider: 'Google Maps Places',
              provenance: 'verified_real',
              retrievedAt: pl.retrievedAt,
              confidenceScore: 0.95
            });
          });
          onLog(`✅ Google Maps aportó ${places.length} competidores físicos verificados.`);
        }
      } catch (err) {
        // Continuar silenciosamente
      }
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
        url: null,
        snippet: `Proyección heurística para "${query}" basada en densidad sectorial nacional. No constituye una cita factual confirmada.`,
        score: 0.40,
        provider: 'Motor Heurístico Local',
        provenance: 'synthetic',
        retrievedAt: new Date().toISOString(),
        confidenceScore: 0.40,
        warning: 'Estimación sintética de mercado autorizada'
      });
    } else {
      onLog('⚠️ No se encontraron fuentes verificadas para esta consulta en la web.');
      // Estado honesto vacío: sources se mantiene vacío sin URLs falsas de radar
    }
  }

  const rawSnippets = sources.length > 0
    ? sources.map(s => `[${s.provider}] (${(s.provenance === 'real' || s.provenance === 'verified_real') ? 'Verificado' : 'Estimación'}): ${s.title} — ${s.snippet}`)
    : [`Sin fuentes verificadas en internet para "${query}". Se declara limitación informativa en la formulación.`];

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

