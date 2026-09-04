/**
 * Contrato de Procedencia de Datos y Normalización Canónica de Búsqueda
 * Fondo Thoth AC — Open Business Plan
 */

/**
 * Normaliza el objeto config.search migrando campos legacy a nombres canónicos.
 * @param {Object} rawSearch
 * @returns {Object} searchConfig canónico
 */
export function normalizeSearchConfig(rawSearch = {}) {
  const apiKey = rawSearch.apiKey || rawSearch.tavilyApiKey || '';
  const braveApiKey = rawSearch.braveApiKey || rawSearch.braveKey || '';
  const serperApiKey = rawSearch.serperApiKey || rawSearch.serperKey || '';
  const enableDdg = rawSearch.enableDdg !== undefined
    ? Boolean(rawSearch.enableDdg)
    : (rawSearch.duckDuckGoEnabled !== undefined ? Boolean(rawSearch.duckDuckGoEnabled) : true);

  const provider = rawSearch.provider || 'duckduckgo';
  const scraperEngine = rawSearch.scraperEngine || 'local';
  const allowPaidTier = Boolean(rawSearch.allowPaidTier);
  const failover = rawSearch.failover !== undefined ? Boolean(rawSearch.failover) : true;

  return {
    provider,
    apiKey,
    braveApiKey,
    serperApiKey,
    enableDdg,
    scraperEngine,
    allowPaidTier,
    failover
  };
}

/**
 * Extrae las API keys de búsqueda a partir de la configuración global o de search.
 * Función pura, testeable sin dependencias de React ni estado.
 * @param {Object} config
 * @returns {{ tavilyKey: string, braveKey: string }}
 */
export function buildSearchApiKeys(config = {}) {
  const search = config?.search ? normalizeSearchConfig(config.search) : normalizeSearchConfig(config);
  return {
    tavilyKey: search.apiKey || '',
    braveKey: search.braveApiKey || '',
    serperKey: search.serperApiKey || ''
  };
}

/**
 * Etiqueta un registro proveniente de una fuente externa real verificada.
 */
export function tagReal(provider, sourceUrl, confidenceScore = 0.95) {
  return {
    provenance: 'real',
    provider: provider || 'Web Verificada',
    sourceUrl: sourceUrl || null,
    retrievedAt: new Date().toISOString(),
    confidenceScore
  };
}

/**
 * Etiqueta una estimación heurística sintética autorizada.
 */
export function tagSynthetic(provider = 'Motor Heurístico Local', warning = 'Estimación sintética de mercado') {
  return {
    provenance: 'synthetic',
    provider,
    sourceUrl: null,
    retrievedAt: new Date().toISOString(),
    confidenceScore: 0.40,
    warning
  };
}

/**
 * Etiqueta un resultado proveniente de hardware local o caché offline.
 */
export function tagLocalOffline(sourceUrl = null, provider = 'Scraping Local / Hardware') {
  return {
    provenance: 'local_offline',
    provider,
    sourceUrl: sourceUrl || null,
    retrievedAt: new Date().toISOString(),
    confidenceScore: 0.80
  };
}

/**
 * Etiqueta de ausencia de datos factuales.
 */
export function tagNone(query = '', reason = 'Sin datos verificados en fuentes abiertas') {
  return {
    provenance: 'none',
    provider: null,
    sourceUrl: null,
    retrievedAt: new Date().toISOString(),
    confidenceScore: 0.0,
    warning: `Sin datos verificados para "${query}": ${reason}`
  };
}

/**
 * Genera una respuesta honesta vacía cuando no existen datos verificados.
 */
export function createHonestEmptyResult(query, reason = 'No se encontraron fuentes verificadas') {
  return {
    success: true,
    data: {
      results: [],
      provenance: 'none',
      query,
      totalFound: 0,
      warning: `Sin datos verificados para "${query}". Declarar limitación en la formulación.`,
      retrievedAt: new Date().toISOString()
    }
  };
}

/**
 * Genera un resumen de procedencia agrupando los resultados obtenidos.
 */
export function summarizeProvenance(items = []) {
  const summary = {
    real: 0,
    synthetic: 0,
    localOffline: 0,
    none: 0,
    total: Array.isArray(items) ? items.length : 0
  };

  if (!Array.isArray(items)) return summary;

  for (const item of items) {
    const prov = item?.provenance || 'none';
    if (prov === 'real' || prov === 'verified_real') summary.real++;
    else if (prov === 'synthetic' || prov === 'synthetic_estimate') summary.synthetic++;
    else if (prov === 'local_offline') summary.localOffline++;
    else summary.none++;
  }

  return summary;
}

/**
 * Genera la configuración visual (colores, etiqueta, icono, tooltip) para badges de procedencia.
 * @param {{ provenance?: string, provider?: string, warning?: string }} params
 * @returns {{ bg: string, color: string, icon: string, label: string, title: string }}
 */
export function getProvenanceBadgeConfig({ provenance, provider, warning } = {}) {
  let bg = '#21262d';
  let color = '#8b949e';
  let icon = '⚪';
  let label = 'Sin Datos';

  if (provenance === 'real' || provenance === 'verified_real') {
    bg = 'rgba(63, 185, 80, 0.15)';
    color = '#3fb950';
    icon = '🟢';
    label = `Factual Verificado (${provider || 'Web'})`;
  } else if (provenance === 'local_offline') {
    bg = 'rgba(210, 153, 34, 0.2)';
    color = '#d29922';
    icon = '🟡';
    label = `Hardware Local (${provider || 'Offline'})`;
  } else if (provenance === 'synthetic' || provenance === 'synthetic_estimate') {
    bg = 'rgba(248, 81, 73, 0.15)';
    color = '#f85149';
    icon = '🔴';
    label = `Estimación Sintética (${warning || 'No Verificado'})`;
  } else {
    bg = 'rgba(139, 148, 158, 0.15)';
    color = '#8b949e';
    icon = '⚪';
    label = `Sin Datos (${warning || 'Vacío'})`;
  }

  return {
    bg,
    color,
    icon,
    label,
    title: warning || label
  };
}
