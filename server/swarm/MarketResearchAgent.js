import { llmExecutionEngine } from './LlmExecutionEngine.js';

/**
 * Agente Analista de Mercado (Perplexity Method)
 * 
 * Sintetiza la información cruda extraída de múltiples buscadores (Tavily, Brave, DDG)
 * y de datos oficiales (INEGI AGEB/DENUE) para redactar un reporte Markdown rico y estructurado.
 */
export class MarketResearchAgent {
  constructor() {
    this.systemPrompt = `Eres un Analista de Inteligencia de Mercado Cuántico de alto nivel.
Tu objetivo es redactar un "Deep Dive Report" en formato Markdown sobre el mercado y los competidores de un modelo de negocio, basado estrictamente en los datos crudos proporcionados (búsquedas web e INEGI).

Reglas de Síntesis (Contrato de Procedencia de Datos):
1. NO inventes empresas, nombres, ubicaciones, ni estadísticas. Usa solo los datos provistos en el input.
2. Si un dato demográfico o competidor proviene del INEGI, cíta al INEGI explícitamente.
3. Si citas un competidor de la web, enlaza la fuente si es posible.
4. Tu reporte debe tener una estructura muy profesional:
   - Resumen Ejecutivo Demográfico (Basado en INEGI).
   - Tabla Analítica de Competidores Detectados (Nombre, Procedencia, Snippet clave).
   - Análisis de Tendencias de Búsqueda y Mercado.
   - Conclusión Estratégica (Oportunidades y Amenazas).
5. Utiliza formato Markdown puro y atractivo (negritas, listas, tablas).
6. Tu idioma de salida es español neutro premium.`;
  }

  /**
   * Genera el reporte profundo en Markdown
   * @param {Object} params
   * @param {string} params.businessIdea - La idea o rubro del negocio
   * @param {Object} params.inegiData - Perfil demográfico de InegiAgebEngine
   * @param {Object} params.perplexityData - Resultados de PerplexitySearchEngine
   * @param {Function} params.onThought - Callback para logs SSE (UXDD)
   */
  async generateDeepReport({ businessIdea, inegiData, perplexityData, onThought = () => {} }) {
    onThought('Preparando el contexto con datos demográficos (INEGI) y resultados web (Perplexity)...');

    const userPrompt = `
**Proyecto / Giro:** ${businessIdea}

### 1. Datos Demográficos Extraídos (INEGI DENUE / AGEB)
- Coordenadas de búsqueda: ${inegiData.coordenadas.lat}, ${inegiData.coordenadas.lng}
- Nivel Socioeconómico Estimado: ${inegiData.nivel_socioeconomico_estimado}
- Actividad Económica Zonal: ${inegiData.actividad_economica}
- Establecimientos (Densidad Comercial): ${inegiData.densidad_comercial}
- Puntos de interés locales relevantes: ${JSON.stringify(inegiData.puntos_interes)}

### 2. Datos de Mercado Web (Search APIs)
- Fuente primaria utilizada: ${perplexityData.source}
- Resultados obtenidos:
${perplexityData.results.map((r, i) => `${i+1}. [${r.title}](${r.url}) - ${r.content}`).join('\n\n')}

Redacta el reporte final en Markdown integrando ambas fuentes. Usa el Markdown para crear una lectura agradable y jerárquica. No inventes datos que no estén aquí.
`;

    onThought('Sintetizando el reporte final de mercado con IA...');

    const result = await llmExecutionEngine.executeAgentPrompt({
      systemPrompt: this.systemPrompt,
      userPrompt: userPrompt,
      tools: ['market_search'],
      onThought
    });

    if (result.status === 'success') {
      onThought('¡Reporte de mercado generado con éxito!');
      return result.generatedText;
    } else {
      throw new Error('No se pudo generar el reporte: ' + result.error);
    }
  }
}

export const marketResearchAgent = new MarketResearchAgent();
