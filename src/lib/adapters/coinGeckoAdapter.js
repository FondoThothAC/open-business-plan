/**
 * Adaptador para CoinGecko API (Criptoactivos, DeFi, Tokens).
 * Acceso público gratuito sin API Key para endpoints básicos.
 */

export async function fetchCoinGeckoPrice(coinId = 'bitcoin', vsCurrency = 'usd') {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}&include_24hr_change=true&include_market_cap=true`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return adaptCoinGecko(data, coinId, vsCurrency);
  } catch (err) {
    console.warn('[CoinGecko] Error:', err.message);
    return adaptCoinGecko(null, coinId, vsCurrency, err.message);
  }
}

export function adaptCoinGecko(rawData, coinId = 'bitcoin', vsCurrency = 'usd', error = null) {
  const now = new Date().toISOString();
  if (error || !rawData || !rawData[coinId]) {
    return {
      indicator: `Criptoactivo / DeFi (${coinId.toUpperCase()})`,
      value: error ? 'Sin conexión' : 0,
      unit: vsCurrency.toUpperCase(),
      timeseries: [],
      source: 'CoinGecko API',
      timestamp: now,
      rawType: 'json',
      metadata: { coinId, vsCurrency, error: error || 'Sin datos' }
    };
  }

  const coinData = rawData[coinId];
  const price = coinData[vsCurrency] || 0;
  const change24h = coinData[`${vsCurrency}_24h_change`] || 0;
  const marketCap = coinData[`${vsCurrency}_market_cap`] || 0;

  return {
    indicator: `Cotización ${coinId.toUpperCase()} (${vsCurrency.toUpperCase()})`,
    value: price,
    unit: vsCurrency.toUpperCase(),
    timeseries: [],
    source: 'CoinGecko API',
    timestamp: now,
    rawType: 'json',
    metadata: {
      coinId,
      vsCurrency,
      change24h: `${change24h.toFixed(2)}%`,
      marketCapUsd: marketCap
    }
  };
}
