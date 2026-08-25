/**
 * Adaptador para ExchangeRate API / Exchangerate.host
 * Provee tipos de cambio internacionales en tiempo real (MXN, USD, EUR, CAD, GBP, JPY).
 * Acceso público gratuito.
 */

export async function fetchExchangeRates(baseCurrency = 'USD') {
  try {
    const url = `https://open.er-api.com/v6/latest/${baseCurrency}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return adaptExchangeRates(data, baseCurrency);
  } catch (err) {
    console.warn('[ExchangeRate] Error:', err.message);
    return adaptExchangeRates(null, baseCurrency, err.message);
  }
}

export function adaptExchangeRates(rawData, baseCurrency = 'USD', error = null) {
  const now = new Date().toISOString();
  if (error || !rawData || !rawData.rates) {
    return {
      indicator: `Tipos de Cambio Internacionales (Base ${baseCurrency})`,
      value: error ? 'Sin conexión' : 0,
      unit: 'FX',
      timeseries: [],
      source: 'ExchangeRate API',
      timestamp: now,
      rawType: 'json',
      metadata: { baseCurrency, error: error || 'Datos no disponibles' }
    };
  }

  const rates = rawData.rates;
  const mxnRate = rates.MXN || 0;
  const eurRate = rates.EUR || 0;
  const cadRate = rates.CAD || 0;

  return {
    indicator: `Paridad Cambiaria (${baseCurrency}/MXN)`,
    value: mxnRate,
    unit: 'MXN',
    timeseries: [],
    source: 'ExchangeRate API',
    timestamp: now,
    rawType: 'json',
    metadata: {
      base: baseCurrency,
      usd_mxn: mxnRate,
      eur_mxn: rates.EUR ? (mxnRate / rates.EUR).toFixed(4) : null,
      cad_mxn: rates.CAD ? (mxnRate / rates.CAD).toFixed(4) : null,
      lastUpdate: rawData.time_last_update_utc || now
    }
  };
}
