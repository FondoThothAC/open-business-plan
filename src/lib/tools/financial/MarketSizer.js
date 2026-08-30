/**
 * MarketSizer - Calculadora de Dimensionamiento de Mercado (TAM / SAM / SOM)
 * Fuentes: Anatomy of a Business Plan (p. 78), The Lean Startup (p. 89), Starting a Business QuickStart Guide (p. 112).
 */

export class MarketSizer {
  /**
   * Enfoque 1: Top-Down (Población total o universo macro × penetración)
   */
  static topDown({ totalUniverse = 1000000, targetSegmentPct = 0.20, annualSpendPerCustomer = 5000, somSharePct = 0.02 } = {}) {
    const tam = totalUniverse * annualSpendPerCustomer;
    const sam = tam * targetSegmentPct;
    const som = sam * somSharePct;

    return {
      method: 'top_down',
      tam: Math.round(tam),
      sam: Math.round(sam),
      som: Math.round(som),
      somPctSam: somSharePct,
      tamFormatted: `$${(tam / 1000000).toFixed(2)}M MXN`,
      samFormatted: `$${(sam / 1000000).toFixed(2)}M MXN`,
      somFormatted: `$${(som / 1000000).toFixed(2)}M MXN`
    };
  }

  /**
   * Enfoque 2: Bottom-Up (Clientes identificados × Capacidad instalada × Ticket promedio)
   */
  static bottomUp({ identifiedClients = 100, averageTicket = 50000, purchasesPerYear = 12, capacityLimit = 25 } = {}) {
    const clientAnnualValue = averageTicket * purchasesPerYear;
    const sam = identifiedClients * clientAnnualValue;
    const tam = sam * 5; // Mercado regional estimado como 5x el clúster directo
    const som = Math.min(identifiedClients, capacityLimit) * clientAnnualValue;

    return {
      method: 'bottom_up',
      tam: Math.round(tam),
      sam: Math.round(sam),
      som: Math.round(som),
      somPctSam: Math.round((som / (sam || 1)) * 1000) / 1000,
      tamFormatted: `$${(tam / 1000000).toFixed(2)}M MXN`,
      samFormatted: `$${(sam / 1000000).toFixed(2)}M MXN`,
      somFormatted: `$${(som / 1000000).toFixed(2)}M MXN`
    };
  }

  /**
   * Enfoque 3: Value-Theory (Ahorro o Valor generado × Disposición a pagar)
   */
  static valueTheory({ industryEconomicLoss = 250000000, valueCapturePct = 0.20, accessibleSharePct = 0.35, targetCapturePct = 0.05 } = {}) {
    const tam = industryEconomicLoss * valueCapturePct;
    const sam = tam * accessibleSharePct;
    const som = sam * targetCapturePct;

    return {
      method: 'value_theory',
      tam: Math.round(tam),
      sam: Math.round(sam),
      som: Math.round(som),
      somPctSam: targetCapturePct,
      tamFormatted: `$${(tam / 1000000).toFixed(2)}M MXN`,
      samFormatted: `$${(sam / 1000000).toFixed(2)}M MXN`,
      somFormatted: `$${(som / 1000000).toFixed(2)}M MXN`
    };
  }

  /**
   * Construye el dimensionamiento a partir de datos territoriales de DENUE/INEGI
   */
  static fromTerritorialData(territorialAnalysis = {}) {
    const clientsCount = territorialAnalysis.clientsWithinRadius || 12;
    const nearbyRevenue = territorialAnalysis.totalNearbyRevenue || 80000000;

    // Supuesto: Servicio MaaS captura el 2.5% del gasto operativo industrial de la zona
    const sam = nearbyRevenue * 0.25;
    const tam = sam * 4;
    const som = Math.min(clientsCount * 68000 * 12, sam * 0.08);

    return {
      tam: Math.round(tam),
      sam: Math.round(sam),
      som: Math.round(som),
      somPctSam: Math.round((som / (sam || 1)) * 1000) / 1000,
      tamFormatted: `$${(tam / 1000000).toFixed(2)}M MXN`,
      samFormatted: `$${(sam / 1000000).toFixed(2)}M MXN`,
      somFormatted: `$${(som / 1000000).toFixed(2)}M MXN`,
      benchmarkQuote: 'Linda Pinson — Anatomy of a Business Plan (p. 78): SOM realista entre 1% y 5% del SAM en etapas tempranas.'
    };
  }
}
