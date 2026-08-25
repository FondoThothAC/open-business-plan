/**
 * Adaptador para World Bank Open Data API.
 * Acceso público gratuito sin necesidad de API Key.
 * Provee indicadores macroeconómicos internacionales (PIB, Inflación, Desempleo, Facilidad de Negocios).
 */

export async function fetchWorldBankIndicator(countryCode = 'MX', indicatorCode = 'NY.GDP.MKTP.CD') {
  try {
    const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=10`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return adaptWorldBank(data, countryCode, indicatorCode);
  } catch (err) {
    console.warn('[WorldBank] Error:', err.message);
    return adaptWorldBank(null, countryCode, indicatorCode, err.message);
  }
}

export function adaptWorldBank(rawData, countryCode = 'MX', indicatorCode = 'NY.GDP.MKTP.CD', error = null) {
  const now = new Date().toISOString();
  if (error || !rawData || !Array.isArray(rawData) || rawData.length < 2 || !Array.isArray(rawData[1])) {
    return {
      indicator: `Indicador Banco Mundial (${indicatorCode})`,
      value: error ? 'Sin conexión' : 0,
      unit: 'USD',
      timeseries: [],
      source: 'World Bank Open Data',
      timestamp: now,
      rawType: 'timeseries',
      metadata: { countryCode, indicatorCode, error: error || 'Datos no disponibles' }
    };
  }

  const records = rawData[1].filter(item => item.value !== null);
  const latest = records[0] || {};
  const indicatorName = latest.indicator?.value || indicatorCode;

  const timeseries = records.slice(0, 10).map(r => ({
    date: r.date,
    val: r.value
  }));

  return {
    indicator: `${indicatorName} (${countryCode})`,
    value: latest.value || 0,
    unit: 'Nativo',
    timeseries,
    source: 'World Bank Open Data',
    timestamp: now,
    rawType: 'timeseries',
    metadata: {
      country: latest.country?.value || countryCode,
      countryCode,
      indicatorCode,
      year: latest.date
    }
  };
}
