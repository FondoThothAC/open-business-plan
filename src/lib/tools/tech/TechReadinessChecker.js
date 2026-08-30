/**
 * TechReadinessChecker - Validador de Nivel TRL, Clasificación IPC y Canvas Jobs-to-be-Done
 * Fuentes: The Innovator's Dilemma (TRL & JTBD), Anatomy of a Business Plan (IPC Patentes).
 */

export class TechReadinessChecker {
  /**
   * Evalúa el nivel de madurez tecnológica TRL (1 a 9)
   */
  static evaluateTRL(checkedLevel = 7) {
    const levels = [
      { trl: 1, title: 'Principios básicos observados y reportados', fase: 'Investigación Básica' },
      { trl: 2, title: 'Concepto o aplicación tecnológica formulada', fase: 'Investigación Aplicada' },
      { trl: 3, title: 'Prueba de concepto analítica y experimental (PoC)', fase: 'Prueba de Concepto' },
      { trl: 4, title: 'Componentes validados en entorno de laboratorio', fase: 'Desarrollo en Laboratorio' },
      { trl: 5, title: 'Componentes validados en entorno relevante (simulado)', fase: 'Validación en Entorno Relevante' },
      { trl: 6, title: 'Sistema / Prototipo demostrado en entorno relevante', fase: 'Demostración Piloto' },
      { trl: 7, title: 'Prototipo de sistema demostrado en entorno operativo real (Mina)', fase: 'Validación en Operación Real' },
      { trl: 8, title: 'Sistema completo calificado mediante pruebas y evaluaciones', fase: 'Comercialización Temprana' },
      { trl: 9, title: 'Sistema probado y desplegado con éxito en el mercado', fase: 'Producción a Escala' }
    ];

    const current = Math.max(1, Math.min(9, Number(checkedLevel) || 7));
    const currentInfo = levels.find(l => l.trl === current) || levels[6];

    return {
      currentTRL: current,
      title: currentInfo.title,
      fase: currentInfo.fase,
      isCommercialReady: current >= 7,
      gapToCommercial: current < 8 ? `Faltan ${8 - current} niveles para certificación comercial completa.` : 'Nivel óptimo para despliegue industrial.',
      levels,
      citation: "The Innovator's Dilemma (Ch. 3): Technology Readiness Levels (TRL) Scale."
    };
  }

  /**
   * Sugiere categorías de Clasificación Internacional de Patentes (IPC)
   */
  static suggestIPC(keywords = '') {
    const text = (keywords || '').toLowerCase();
    const suggestions = [];

    if (text.includes('hidraul') || text.includes('manguera') || text.includes('presion') || text.includes('valvula')) {
      suggestions.push({ code: 'F15B', description: 'Sistemas que utilizan fluidos bajo presión en general; Circuitos hidráulicos o neumáticos.' });
      suggestions.push({ code: 'F16L', description: 'Tuberías; Mangueras; Empalmes de tuberías o de mangueras.' });
    }

    if (text.includes('mina') || text.includes('mineria') || text.includes('perforacion') || text.includes('tajo')) {
      suggestions.push({ code: 'E21C', description: 'Explotación de minas o canteras.' });
    }

    if (text.includes('iot') || text.includes('sensor') || text.includes('telemetria') || text.includes('software')) {
      suggestions.push({ code: 'G06F', description: 'Tratamiento digital de datos eléctricos (algoritmos y software).' });
      suggestions.push({ code: 'G08C', description: 'Sistemas de transmisión de valores de medida; Sistemas de telemetría.' });
    }

    if (suggestions.length === 0) {
      suggestions.push({ code: 'G06Q', description: 'Sistemas de procesamiento de datos especialmente adaptados para fines comerciales o de gestión.' });
    }

    return {
      suggestions,
      searchHint: 'Consultar base de datos de patentes IMPI (SIGA) y WIPO PATENTSCOPE con estos códigos.',
      citation: 'Anatomy of a Business Plan (IPC Edition, p. 210).'
    };
  }

  /**
   * Estructura la propuesta bajo el framework Jobs-to-be-Done (Clayton Christensen)
   */
  static buildJTBD({
    situacion = 'Cuando una pala mecánica o camión de extracción minera trabaja 24/7 en tajo abierto',
    motivacion = 'Quiero monitorear en tiempo real la presión y fatiga de las mangueras hidráulicas críticas',
    resultado = 'Para evitar paros no programados de $15,000 USD/hora y blindar la seguridad del operador'
  } = {}) {
    return {
      situacion,
      motivacion,
      resultado,
      declaracionJTBD: `${situacion}, el cliente necesita ${motivacion.toLowerCase()}, con el fin de ${resultado.toLowerCase()}.`,
      citation: "The Innovator's Dilemma (Ch. 4): Jobs-to-be-Done Framework."
    };
  }
}
