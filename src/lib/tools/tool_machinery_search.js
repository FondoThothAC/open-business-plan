/**
 * Herramienta Agéntica Universal de Búsqueda y Cotización de Maquinaria
 * Consulta endpoints reales de mercado y erradica precios fabricados
 */
import { getApiBase } from '../../config/apiConfig.js';

export async function searchMachineryQuotes(itemQuery, location = 'Sonora, México') {
  if (!itemQuery) {
    return {
      success: true,
      item: '',
      quotes: [],
      totalFound: 0,
      provenance: 'none',
      warning: 'No se proporcionó término de maquinaria a cotizar.'
    };
  }

  const apiBase = getApiBase();
  const query = encodeURIComponent(`${itemQuery} precio cotizacion distribuidor industrial ${location}`);
  
  try {
    const response = await fetch(`${apiBase}/api/market/search?q=${query}`, {
      signal: AbortSignal.timeout(6000)
    }).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      const quotes = data.results || [];
      if (quotes.length > 0) {
        return {
          success: true,
          item: itemQuery,
          location,
          quotes,
          totalFound: quotes.length,
          provenance: 'real',
          source: data.source || 'DuckDuckGo Industrial Market Search'
        };
      }
    }
  } catch (err) {
    console.warn('[MachinerySearch] Error en búsqueda de maquinaria:', err.message);
  }

  // Estado honesto vacío: CERO fabricación silenciosa de precios de benchmarking
  return {
    success: true,
    item: itemQuery,
    location,
    quotes: [],
    totalFound: 0,
    provenance: 'none',
    warning: `Sin cotizaciones verificadas para "${itemQuery}" en fuentes industriales. No se fabricaron precios sintéticos.`
  };
}
