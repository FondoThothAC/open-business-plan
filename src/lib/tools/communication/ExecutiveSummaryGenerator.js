/**
 * ExecutiveSummaryGenerator - Generador de Resúmenes Ejecutivos, Elevator Pitch y One-Pagers
 * Fuentes: Anatomy of a Business Plan (p. 12), Burn the Business Plan (p. 33), The Lean Startup (AARRR).
 */

export class ExecutiveSummaryGenerator {
  /**
   * Genera el Resumen Ejecutivo Estructurado de 1 Página (Linda Pinson)
   */
  static generateOnePage({
    companyName = 'Proyecto sin nombre',
    industry = 'Pendiente de definir',
    location = 'Pendiente de definir',
    problem = 'Pendiente de definir',
    solution = 'Pendiente de definir',
    tam = 'Pendiente de calcular',
    som = 'Pendiente de calcular',
    traction = 'Pendiente de documentar',
    initialInvestment = 'Pendiente de calcular',
    irr = 'Pendiente de calcular',
    npv = 'Pendiente de calcular',
    team = 'Pendiente de definir'
  } = {}) {
    return {
      title: `Resumen Ejecutivo — ${companyName} (${industry})`,
      sections: [
        { title: '1. Oportunidad y Problema', content: problem },
        { title: '2. Solución y Propuesta de Valor', content: solution },
        { title: '3. Mercado Objetivo (TAM/SOM)', content: `TAM: ${tam} | SOM a 3 años: ${som}.` },
        { title: '4. Modelo de Negocio e Ingresos', content: 'Pendiente de definir con los datos del proyecto.' },
        { title: '5. Viabilidad Financiera y Rentabilidad', content: `Inversión: ${initialInvestment} | TIR: ${irr} | VAN (12%): ${npv}.` },
        { title: '6. Equipo Directivo y Ubicación', content: `${team} Ubicación estratégica: ${location}.` },
        { title: '7. Tracción y Estado Actual', content: traction }
      ],
      citation: 'Anatomy of a Business Plan (p. 12): The 1-Page Executive Summary Framework.'
    };
  }

  /**
   * Genera un Elevator Pitch de 30 Segundos (Burn the Business Plan)
   */
  static generateElevatorPitch({
    targetAudience = 'Directores de Mantenimiento y Operaciones Mineras en Sonora',
    pain = 'pierden millones de dólares al año por paros imprevistos en sistemas hidráulicos',
    product = 'Comercio Cuántico MaaS',
    category = 'la primera plataforma integral de blindaje y telemetría hidráulica 4.0',
    keyBenefit = 'garantiza cero paros catastróficos con reemplazos in-situ en menos de 2 horas',
    differentiator = 'los talleres tradicionales que solo venden mangueras de mostrador de forma reactiva'
  } = {}) {
    return {
      pitchText: `Para los ${targetAudience} que ${pain}, ${product} es ${category} que ${keyBenefit}. A diferencia de ${differentiator}, nosotros blindamos la disponibilidad operativa mediante monitoreo IoT en tiempo real y banco de pruebas propio.`,
      durationSeconds: 30,
      citation: 'Burn the Business Plan (p. 33): The 30-Second Elevator Pitch Structure.'
    };
  }
}
