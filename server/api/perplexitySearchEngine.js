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
  constructor() {
    this.tavilyKey = process.env.TAVILY_API_KEY || '';
    this.braveKey = process.env.BRAVE_SEARCH_API_KEY || '';
  }

  /**
   * Extrae el contenido de texto legible de una URL usando Cheerio.
   */
  async scrapeUrlContent(url) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });
      if (!res.ok) return '';
      const html = await res.text();
      const $ = cheerio.load(html);
      
      $('script, style, nav, footer, header, noscript').remove();
      let text = $('body').text().replace(/\s+/g, ' ').trim();
      return text.substring(0, 3000); // Limitar a 3000 chars por fuente
    } catch (err) {
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
          })
        });
        if (res.ok) {
          const data = await res.json();
          results = data.results.map(r => ({ title: r.title, url: r.url, snippet: r.content }));
          source = 'tavily';
        }
      } catch (e) {
        console.warn('[PerplexityEngine] Tavily falló:', e.message);
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
          }
        });
        if (res.ok) {
          const data = await res.json();
          results = (data.web?.results || []).map(r => ({ title: r.title, url: r.url, snippet: r.description }));
          source = 'brave';
        }
      } catch (e) {
        console.warn('[PerplexityEngine] Brave falló:', e.message);
      }
    }

    // 3. DuckDuckGo (Fallback)
    if (results.length === 0) {
      try {
        const ddgRes = await ddgSearch(query, { safeSearch: 'Off' });
        results = (ddgRes.results || []).slice(0, limit).map(r => ({ title: r.title, url: r.url, snippet: r.description }));
        source = 'duckduckgo';
      } catch (e) {
        console.warn('[PerplexityEngine] DDG falló:', e.message);
      }
    }

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
      source,
      results: enrichedResults
    };
  }
}
