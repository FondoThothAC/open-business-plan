/**
 * Adaptador para NewsAPI / GNews (Noticias del sector, tendencias de mercado).
 * Requiere API Key opcional (free tier disponible con registro).
 */

export async function fetchNewsSector(query = 'industria', apiKey = '') {
  if (!apiKey) {
    return adaptNewsApi(null, query, 'Sin API Key configurada');
  }

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=es&sortBy=relevancy&pageSize=5&apiKey=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return adaptNewsApi(data, query);
  } catch (err) {
    console.warn('[NewsAPI] Error:', err.message);
    return adaptNewsApi(null, query, err.message);
  }
}

export function adaptNewsApi(rawData, query = 'industria', error = null) {
  const now = new Date().toISOString();
  if (error || !rawData || !Array.isArray(rawData.articles)) {
    return {
      indicator: `Noticias y Tendencias del Sector (${query})`,
      value: error ? 'Sin conexión' : 'Sin artículos',
      unit: 'Texto',
      timeseries: [],
      source: 'NewsAPI',
      timestamp: now,
      rawType: 'text',
      metadata: { query, error: error || 'Sin resultados' }
    };
  }

  const headlines = rawData.articles.map(a => ({
    title: a.title,
    source: a.source?.name,
    publishedAt: a.publishedAt,
    url: a.url
  }));

  return {
    indicator: `Radar de Noticias (${query})`,
    value: `${rawData.totalResults || headlines.length} noticias encontradas`,
    unit: 'Noticias',
    timeseries: [],
    source: 'NewsAPI',
    timestamp: now,
    rawType: 'text',
    metadata: {
      query,
      topArticles: headlines.slice(0, 5)
    }
  };
}
