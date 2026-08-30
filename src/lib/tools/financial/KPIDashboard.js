import { BENCHMARKS } from '../../../config/benchmarks.js';

/**
 * KPIDashboard - Motor de cálculo y semaforización de KPIs Operativos, Financieros y ESG
 * Fuentes: Starting a Business QuickStart Guide (Ch. 8), The Lean Startup (Ch. 6), The Nature of Value (Ch. 2).
 */

export class KPIDashboard {
  /**
   * Evalúa Unit Economics y salud financiera
   */
  static evaluateFinancialKPIs({
    cac = 15000,
    ltv = 75000,
    monthlyRevenue = 1500000,
    monthlyCostOfSales = 600000,
    monthlyOperatingExpenses = 450000,
    cashReserve = 4500000,
    industry = 'industrial'
  } = {}) {
    const bench = BENCHMARKS[industry] || BENCHMARKS.industrial;

    const cacLtvRatio = cac > 0 ? (ltv / cac) : 0;
    const grossProfit = monthlyRevenue - monthlyCostOfSales;
    const grossMargin = monthlyRevenue > 0 ? (grossProfit / monthlyRevenue) : 0;
    const operatingProfit = grossProfit - monthlyOperatingExpenses;
    const operatingMargin = monthlyRevenue > 0 ? (operatingProfit / monthlyRevenue) : 0;

    // Burn Rate & Runway
    const netBurnMonthly = monthlyOperatingExpenses + monthlyCostOfSales - monthlyRevenue;
    const runwayMonths = netBurnMonthly > 0 ? (cashReserve / netBurnMonthly) : 999;

    return {
      cacLtvRatio: Math.round(cacLtvRatio * 100) / 100,
      cacLtvStatus: cacLtvRatio >= bench.cacLtvRatioMin ? 'Óptimo (>=3x)' : 'Alerta (Sub-óptimo)',
      grossMargin: Math.round(grossMargin * 10000) / 100,
      grossMarginPct: `${(grossMargin * 100).toFixed(1)}%`,
      grossMarginStatus: grossMargin >= bench.grossMargin[0] ? 'Saludable' : 'Bajo Margen',
      operatingMargin: Math.round(operatingMargin * 10000) / 100,
      operatingMarginPct: `${(operatingMargin * 100).toFixed(1)}%`,
      runwayMonths: Math.min(999, Math.round(runwayMonths * 10) / 10),
      runwayFormatted: runwayMonths > 60 ? 'Autosustentable (>5 años)' : `${Math.round(runwayMonths)} meses`,
      runwayStatus: runwayMonths >= bench.runwayMonths[0] ? 'Seguro' : 'Riesgo de Liquidez',
      benchmarksApplied: bench.nombre
    };
  }

  /**
   * Evalúa Eficiencia Operativa de la Cadena de Suministro (SCM)
   */
  static evaluateOperationalKPIs({
    onTimeDeliveries = 98,
    totalDeliveries = 100,
    annualCostOfGoodsSold = 7200000,
    averageInventory = 1200000,
    annualCreditSales = 18000000,
    accountsReceivable = 2250000,
    accountsPayable = 1200000
  } = {}) {
    // 1. OTD (On-Time Delivery)
    const otd = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) : 1.0;

    // 2. Rotación de Inventarios y Días de Inventario (DIO)
    const inventoryTurnover = averageInventory > 0 ? (annualCostOfGoodsSold / averageInventory) : 6.0;
    const dio = inventoryTurnover > 0 ? (365 / inventoryTurnover) : 60;

    // 3. Días de Cobro (DSO - Days Sales Outstanding)
    const dso = annualCreditSales > 0 ? ((accountsReceivable * 365) / annualCreditSales) : 45;

    // 4. Días de Pago (DPO - Days Payable Outstanding)
    const dpo = annualCostOfGoodsSold > 0 ? ((accountsPayable * 365) / annualCostOfGoodsSold) : 60;

    // 5. Ciclo de Conversión de Efectivo (CCC = DIO + DSO - DPO)
    const ccc = dio + dso - dpo;

    return {
      otdPct: `${(otd * 100).toFixed(1)}%`,
      otdStatus: otd >= 0.95 ? 'Excelente (Tier 1)' : 'Alerta de Cumplimiento',
      inventoryTurnover: Math.round(inventoryTurnover * 10) / 10,
      dioDays: Math.round(dio),
      dsoDays: Math.round(dso),
      dpoDays: Math.round(dpo),
      cccDays: Math.round(ccc),
      cccStatus: ccc <= 45 ? 'Ciclo Eficiente' : 'Capital de Trabajo Alto'
    };
  }

  /**
   * Evalúa Indicadores ESG y Sostenibilidad
   */
  static evaluateESGScore({
    renewableEnergyPct = 40,
    recycledMaterialsPct = 65,
    formalJobsCreated = 14,
    femaleLeadershipPct = 35
  } = {}) {
    const envScore = (renewableEnergyPct * 0.5) + (recycledMaterialsPct * 0.5);
    const socialScore = Math.min(100, (formalJobsCreated * 4) + (femaleLeadershipPct * 1.2));
    const governanceScore = 90; // Cumplimiento normativo y manual de ética

    const compositeScore = Math.round((envScore * 0.4) + (socialScore * 0.3) + (governanceScore * 0.3));

    return {
      compositeScore,
      rating: compositeScore >= 80 ? 'A+ (Líder ESG)' : compositeScore >= 65 ? 'B (En Cumplimiento)' : 'C (Mejora Requerida)',
      environmentalPct: `${Math.round(envScore)}%`,
      socialPct: `${Math.round(socialScore)}%`,
      governancePct: `${Math.round(governanceScore)}%`,
      citation: 'The Role of Corporate Sustainability in Asian Development (p. 89): DNSH Framework.'
    };
  }
}
