import { httpProviderStatus } from './providerStatus.js';
import { search as ddgSearch } from 'duck-duck-scrape';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Motor de Búsqueda Secuencial (Perplexity Method)
 * 
 * Orquesta búsquedas a través de Tavily, Brave Search y DuckDuckGo,
 * extrayendo texto plano para alimentar al agente LLM de investigación.
 */
export class PerplexitySearchEngine {
  constructor(keys = {}, { allowSharedKeys = process.env.ALLOW_SHARED_SEARCH_KEYS === 'true', allowDuckDuckGo = process.env.ENABLE_DDG_FALLBACK !== 'false' } = {}) {
    this.allowDuckDuckGo = allowDuckDuckGo;
    this.tavilyKey = keys.tavily || keys.tavilyKey || (allowSharedKeys ? process.env.TAVILY_API_KEY || '' : '');
    this.braveKey = keys.brave || keys.braveKey || (allowSharedKeys ? process.env.BRAVE_SEARCH_API_KEY || process.env.BRAVE_SEARCH_KEY || '' : '');
  }

  /**
   * Extrae el contenido de texto legible de una URL usando Cheerio.
   */
  async scrapeUrlContent(url) {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol) || ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname) || /^10\.|^127\.|^169\.254\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(parsed.hostname)) return '';
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });
      if (!res.ok) return '';
      const length = Number(res.headers.get('content-length') || 0);
      if (length > 1_000_000) return '';
      const html = (await res.text()).slice(0, 1_000_000);
      const $ = cheerio.load(html);
      
      $('script, style, nav, footer, header, noscript').remove();
      let text = $('body').text().replace(/\s+/g, ' ').trim();
      return text.substring(0, 3000); // Limitar a 3000 chars por fuente
    } catch {
      return '';
    }
  }

  /**
   * Búsqueda integral en internet.
   * Prioriza Tavily -> Brave -> DDG.
   * @param {string} query 
   * @param {number} limit 
   */
  async searchMarketContext(query, limit = 5) {
    const attempts = [];
    const record = (provider, status, httpStatus) => attempts.push({ provider, status, httpStatus, retrievedAt: new Date().toISOString() });
    if (!this.tavilyKey) record('tavily', 'missing_key');
    if (!this.braveKey) record('brave', 'missing_key');
    let results = [];
    let source = 'none';

    // 1. Tavily Search (Ideal para investigación de IA)
    if (this.tavilyKey && results.length === 0) {
      try {
        const res = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: this.tavilyKey,
            query: query,
            search_depth: 'advanced',
            include_answer: false,
          max_results: limit,
          }),
          signal: AbortSignal.timeout(12000)
        });
        if (res.ok) {
          const data = await res.json();
          results = data.results.map(r => ({ title: r.title, url: r.url, snippet: r.content }));
          source = 'tavily';
          record('tavily', results.length ? 'observed' : 'no_results');
        } else record('tavily', httpProviderStatus(res.status), res.status);
      } catch (e) {
        record('tavily', 'unavailable');
      }
    }

    // 2. Brave Search
    if (this.braveKey && results.length === 0) {
      try {
        const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`, {
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'X-Subscription-Token': this.braveKey
          },
          signal: AbortSignal.timeout(12000)
        });
        if (res.ok) {
          const data = await res.json();
          results = (data.web?.results || []).map(r => ({ title: r.title, url: r.url, snippet: r.description }));
          source = 'brave';
          record('brave', results.length ? 'observed' : 'no_results');
        } else record('brave', httpProviderStatus(res.status), res.status);
      } catch (e) {
        record('brave', 'unavailable');
      }
    }

    // 3. DuckDuckGo (Fallback)
    if (results.length === 0 && this.allowDuckDuckGo) {
      try {
        const ddgRes = await ddgSearch(query);
        results = (ddgRes.results || []).slice(0, limit).map(r => ({ title: r.title, url: r.url, snippet: r.description }));
        source = 'duckduckgo';
        record('duckduckgo', results.length ? 'observed' : 'no_results');
      } catch (e) {
        record('duckduckgo', /anomaly|quickly|rate/i.test(e.message) ? 'rate_limited' : 'unavailable');
      }
    }

    if (!this.allowDuckDuckGo) record('duckduckgo', 'disabled');
    // Extraer contenido adicional para cada resultado (Scraping)
    const enrichedResults = await Promise.all(results.map(async (res) => {
      // Tavily ya trae contenido robusto, pero DDG/Brave solo traen snippets cortos.
      let fullText = res.snippet;
      if (source !== 'tavily') {
        const extraText = await this.scrapeUrlContent(res.url);
        if (extraText.length > fullText.length) {
          fullText = extraText;
        }
      }
      return { ...res, content: fullText };
    }));

    return {
      query,
      attempts,
      source,
      results: enrichedResults
    };
  }
}
