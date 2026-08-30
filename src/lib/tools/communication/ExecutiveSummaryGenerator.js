/**
 * ExecutiveSummaryGenerator - Generador de Resúmenes Ejecutivos, Elevator Pitch y One-Pagers
 * Fuentes: Anatomy of a Business Plan (p. 12), Burn the Business Plan (p. 33), The Lean Startup (AARRR).
 */

export class ExecutiveSummaryGenerator {
  /**
   * Genera el Resumen Ejecutivo Estructurado de 1 Página (Linda Pinson)
   */
  static generateOnePage({
    companyName = 'Comercio Cuántico Internacional TR SAPI de CV',
    industry = 'Servicios Industriales y Mantenimiento Hidráulico Minero (MaaS)',
    location = 'Hermosillo / Cananea, Sonora',
    problem = 'Paros no programados de $15,000 USD/hora en maquinaria minera pesada por fallas catastróficas en mangueras hidráulicas.',
    solution = 'Mantenimiento como Servicio (MaaS) con banco de pruebas de 40k PSI y telemetría IoT preventiva Parker SensoNODE con SLA <2 horas.',
    tam = '$180M MXN',
    som = '$18M MXN',
    traction = 'Taller central en habilitación en Hermosillo y cartas de intención con contratistas mineros Tier 1.',
    initialInvestment = '$20M MXN',
    irr = '15.11%',
    npv = '$1.83M MXN',
    team = 'Dirección General + 4 Gerencias Estratégicas (Operaciones, Calidad/IoT, B2B y Finanzas).'
  } = {}) {
    return {
      title: `Resumen Ejecutivo — ${companyName} (${industry})`,
      sections: [
        { title: '1. Oportunidad y Problema', content: problem },
        { title: '2. Solución y Propuesta de Valor', content: solution },
        { title: '3. Mercado Objetivo (TAM/SOM)', content: `TAM: ${tam} | SOM a 3 años: ${som} en el clúster minero de Sonora.` },
        { title: '4. Modelo de Negocio e Ingresos', content: `Suscripción mensual MaaS ($68k MXN/mes por equipo) + refacciones de alta presión.` },
        { title: '5. Viabilidad Financiera y Rentabilidad', content: `Inversión: ${initialInvestment} | TIR: ${irr} | VAN (12%): ${npv} | Payback: 4.1 años.` },
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
