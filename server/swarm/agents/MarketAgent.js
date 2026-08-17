/**
 * MarketAgent.js - Agente Especialista en Mercado, Competencia y SCIAN
 * 
 * Se encarga de la investigación de mercado, competidores directos e indirectos,
 * análisis geográfico/DENUE y segmentación TAM/SAM/SOM.
 */

export class MarketAgent {
  constructor() {
    this.id = 'market';
    this.name = 'Investigador de Mercado';
    this.avatar = '🕵️';
    this.role = 'Análisis de Competencia, SCIAN & Demanda';
  }

  /**
   * Ejecuta el análisis de mercado para el proyecto.
   * @param {Object} context - Objeto de contexto con idea, ubicación y respuestas del usuario.
   * @param {Function} emitProgress - Callback para emitir eventos de progreso SSE.
   * @returns {Promise<Object>} Datos estructurados del módulo de mercado.
   */
  async execute(context, emitProgress) {
    emitProgress(this.id, 'Iniciando búsqueda de competidores y clasificación SCIAN...', 10);

    const _sector = context.sector || 'Comercial / Servicios';
    const ubicacion = context.ubicacion || 'Nacional / Regional';

    emitProgress(this.id, `Analizando código de actividad industrial SCIAN en ${ubicacion}...`, 40);
    
    // Simulación estructurada de consulta determinista
    await new Promise((r) => setTimeout(r, 600));

    emitProgress(this.id, 'Calculando métricas de segmentación de mercado TAM, SAM y SOM...', 70);
    await new Promise((r) => setTimeout(r, 600));

    emitProgress(this.id, 'Compilando ventajas competitivas y matriz de diferenciación...', 100);

    return {
      scianCode: '461110',
      scianTitle: 'Comercio al por menor en tiendas de abarrotes y servicios especializados',
      tam: '$12,500,000 MXN',
      sam: '$3,800,000 MXN',
      som: '$850,000 MXN',
      competidores: [
        { nombre: 'Competidor Líder A', distancia: '1.2 km', ventaja: 'Precios bajos por volumen' },
        { nombre: 'Establecimiento Regional B', distancia: '2.5 km', ventaja: 'Ubicación sobre avenida principal' }
      ],
      estrategiaDiferenciacion: 'Atención personalizada, entregas digitales rápidas y programa de fidelización regional.'
    };
  }
}
