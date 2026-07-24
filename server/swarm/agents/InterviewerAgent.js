/**
 * InterviewerAgent.js - Agente Entrevistador y Asesor de Inicio (Fase 1)
 * 
 * Analiza la idea de negocio del usuario, formula 2 a 3 preguntas de precisión
 * y recomienda el tipo de documento/framework idóneo de los 11 frameworks disponibles.
 */

export class InterviewerAgent {
  constructor() {
    this.id = 'interviewer';
    this.name = 'Asesor de Inicio';
    this.avatar = '💬';
    this.role = 'Diagnóstico Contextual y Selección de Documento';
  }

  /**
   * Procesa la idea inicial y genera la recomendación y preguntas de contexto.
   * @param {string} ideaText - Texto de la idea proporcionada por el usuario.
   * @returns {Promise<Object>} Resultado con recomendación de framework y preguntas.
   */
  async analyzeIdea(ideaText) {
    if (!ideaText || ideaText.trim().length === 0) {
      return {
        recommendedFramework: 'business',
        frameworkName: 'Plan de Negocios Comercial',
        questions: [
          '¿Cuál es el producto o servicio principal que deseas comercializar?',
          '¿A qué segmento de clientes o público objetivo va dirigido principalmente?',
          '¿Tienes estimado un presupuesto inicial o capital para comenzar?'
        ],
        reasoning: 'Dado que no se proporcionaron detalles iniciales, recomendamos el Plan de Negocios Comercial Estándar.'
      };
    }

    const lower = ideaText.toLowerCase();

    // Detección heurística de framework óptimo basado en palabras clave del dominio
    if (lower.includes('social') || lower.includes('comunidad') || lower.includes('ong') || lower.includes('bid') || lower.includes('pobreza') || lower.includes('beneficiar')) {
      return {
        recommendedFramework: 'social_bid',
        frameworkName: 'Proyecto Social (Metodología BID / MML)',
        questions: [
          '¿Quiénes son los beneficiarios directos e indirectos de este proyecto social?',
          '¿Cuál es el problema central específico que busca erradicar o solucionar?',
          '¿Qué fuentes de financiamiento o donantes se prevén (gobierno, ONGs, cooperación internacional)?'
        ],
        reasoning: 'Tu idea tiene un enfoque de impacto social y comunitario, ideal para la Metodología Marco Lógico del BID.'
      };
    }

    if (lower.includes('patente') || lower.includes('tecnolog') || lower.includes('investigacion') || lower.includes('trl') || lower.includes('software') || lower.includes('biotec') || lower.includes('ia')) {
      return {
        recommendedFramework: 'technology_id',
        frameworkName: 'Plan de Base Tecnológica e Innovación (I+D)',
        questions: [
          '¿En qué nivel de maduración tecnológica (TRL 1-9) o prototipo se encuentra la innovación?',
          '¿Existe o se planea un registro de propiedad intelectual, secreto industrial o patente?',
          '¿Cuál es la ventaja tecnológica disruptiva frente a las soluciones existentes?'
        ],
        reasoning: 'Detectamos innovación técnica o científica. Este framework protege tu I+D y mapea la propiedad intelectual.'
      };
    }

    if (lower.includes('obra') || lower.includes('planta') || lower.includes('fabrica') || lower.includes('maquinaria') || lower.includes('capex') || lower.includes('construccion') || lower.includes('licitacion')) {
      return {
        recommendedFramework: 'investment_project',
        frameworkName: 'Proyecto de Inversión (Ingeniería y Finanzas CAPEX/WACC)',
        questions: [
          '¿Cuál es el monto estimado del presupuesto base de obra o adquisición de activos fijos (CAPEX)?',
          '¿Se requerirá apalancamiento financiero o crédito bancario para la estructura de capital?',
          '¿Qué capacidad instalada o volumen de producción se planea para el año de arranque?'
        ],
        reasoning: 'Tu proyecto involucra fuerte infraestructura física o maquinaria pesada, requiriendo análisis de ingeniería y CAPEX/WACC.'
      };
    }

    if (lower.includes('app') || lower.includes('startup') || lower.includes('mvp') || lower.includes('plataforma') || lower.includes('lean') || lower.includes('digital')) {
      return {
        recommendedFramework: 'agile_startup',
        frameworkName: 'Agile Startup (Lean MVP & Unit Economics)',
        questions: [
          '¿Cuál es la hipótesis principal de valor que deseas validar con el Producto Mínimo Viable (MVP)?',
          '¿Cómo planeas adquirir a tus primeros 100 usuarios/clientes (canal de tracción)?',
          '¿Cuál es el modelo de monetización previsto (suscripción, comisión, freemium)?'
        ],
        reasoning: 'Para un modelo digital ágil, el enfoque Lean Canvas permite validar hipótesis rápidamente sin burocracia.'
      };
    }

    // Default: Plan de Negocios Comercial Tradicional
    return {
      recommendedFramework: 'business',
      frameworkName: 'Plan de Negocios Comercial Tradicional',
      questions: [
        '¿Cuáles serán tus principales canales de distribución o puntos de venta?',
        '¿Cuál es tu propuesta de valor diferenciadora respecto a tus competidores locales?',
        '¿Cuál es tu meta de ventas o facturación proyectada para el primer año?'
      ],
      reasoning: 'Analizamos tu idea y es idónea para un Plan de Negocios Comercial integral con estudio de mercado y corridas financieras.'
    };
  }
}
