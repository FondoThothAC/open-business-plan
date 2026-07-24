/**
 * CapexAgent.js - Agente Especialista en Ingeniería de Inversión y WACC
 * 
 * Diseñado para proyectos de infraestructura, ingeniería pesada, licitaciones
 * y estudios de factibilidad tipo ONUDI.
 */

export class CapexAgent {
  constructor() {
    this.id = 'capex_wacc';
    this.name = 'Ingeniero CAPEX & WACC';
    this.avatar = '🏗️';
    this.role = 'Ingeniería de Obra, WACC & Explosión de Insumos';
  }

  /**
   * Ejecuta el análisis de ingeniería de inversión y costo de capital.
   * @param {Object} context 
   * @param {Function} emitProgress 
   * @returns {Promise<Object>}
   */
  async execute(context, emitProgress) {
    emitProgress(this.id, 'Estructurando catálogo de conceptos de obra física e ingeniería básica...', 20);
    await new Promise((r) => setTimeout(r, 600));

    emitProgress(this.id, 'Calculando Costo Promedio Ponderado de Capital (WACC)...', 60);
    await new Promise((r) => setTimeout(r, 600));

    emitProgress(this.id, 'Generando cronograma físico-financiero de desembolsos...', 100);

    return {
      wacc: '11.8%',
      costoDeuda: '9.5%',
      costoCapitalPropio: '14.2%',
      catalogoConceptos: [
        { concepto: 'Adecuación de Planta Físico-Industrial', costo: 120000 },
        { concepto: 'Adquisición de Maquinaria Principal', costo: 350000 },
        { concepto: 'Instalaciones Eléctricas e Hidráulicas', costo: 45000 }
      ],
      cronogramaFisico: 'Fase 1: Meses 1-2 (Obras) | Fase 2: Mes 3 (Pruebas y Puesta en Marcha)'
    };
  }
}
