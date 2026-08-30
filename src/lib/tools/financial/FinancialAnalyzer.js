/**
 * FinancialAnalyzer - Motor Unificado de Análisis Financiero y Valoración
 * Fuentes: The Nature of Value (Ch. 5), Anatomy of a Business Plan (Ch. 7), Plan de Negocios VF (p. 84).
 */

export class FinancialAnalyzer {
  /**
   * Calcula el WACC (Costo Promedio Ponderado de Capital) mediante el modelo CAPM
   */
  static calculateWACC({
    equity = 20000000,
    debt = 0,
    costOfEquity = 0.15,
    costOfDebt = 0.08,
    taxRate = 0.30
  } = {}) {
    const totalCapital = equity + debt;
    if (totalCapital <= 0) return 0.12;

    const we = equity / totalCapital;
    const wd = debt / totalCapital;
    const afterTaxCostOfDebt = costOfDebt * (1 - taxRate);

    const wacc = (we * costOfEquity) + (wd * afterTaxCostOfDebt);
    return Math.round(wacc * 10000) / 10000;
  }

  /**
   * Calcula el Valor Actual Neto (VAN / NPV)
   */
  static calculateNPV(initialInvestment, cashFlows, discountRate = 0.12) {
    if (!Array.isArray(cashFlows) || cashFlows.length === 0) return 0;
    
    let presentValue = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const year = t + 1;
      const flow = Number(cashFlows[t]) || 0;
      presentValue += flow / Math.pow(1 + discountRate, year);
    }

    const npv = presentValue - Number(initialInvestment || 0);
    return Math.round(npv * 100) / 100;
  }

  /**
   * Calcula la Tasa Interna de Retorno (TIR / IRR) mediante aproximación numérica Newton-Raphson
   */
  static calculateIRR(initialInvestment, cashFlows, maxIterations = 100, tolerance = 1e-6) {
    if (!Array.isArray(cashFlows) || cashFlows.length === 0 || initialInvestment <= 0) return 0;

    let rate = 0.15; // Estimación inicial (15%)

    for (let iter = 0; iter < maxIterations; iter++) {
      let npv = -initialInvestment;
      let derivative = 0;

      for (let t = 0; t < cashFlows.length; t++) {
        const year = t + 1;
        const flow = Number(cashFlows[t]) || 0;
        const denom = Math.pow(1 + rate, year);

        npv += flow / denom;
        derivative -= (year * flow) / (denom * (1 + rate));
      }

      if (Math.abs(npv) < tolerance) {
        return Math.round(rate * 10000) / 10000;
      }

      if (Math.abs(derivative) < 1e-10) break;

      const newRate = rate - (npv / derivative);
      if (isNaN(newRate) || newRate < -0.99 || newRate > 10.0) break;

      if (Math.abs(newRate - rate) < tolerance) {
        return Math.round(newRate * 10000) / 10000;
      }

      rate = newRate;
    }

    // Fallback aproximado si no converge exactamente
    const totalFlow = cashFlows.reduce((sum, f) => sum + (Number(f) || 0), 0);
    const avgAnnualFlow = totalFlow / cashFlows.length;
    return Math.max(0, Math.min(1.0, Math.round(((avgAnnualFlow / initialInvestment) - 0.05) * 10000) / 10000));
  }

  /**
   * Calcula el Periodo de Recuperación de Inversión (Payback)
   */
  static calculatePayback(initialInvestment, cashFlows) {
    if (!Array.isArray(cashFlows) || cashFlows.length === 0 || initialInvestment <= 0) return 0;

    let cumulative = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const year = t + 1;
      const flow = Number(cashFlows[t]) || 0;
      cumulative += flow;

      if (cumulative >= initialInvestment) {
        const previousCumulative = cumulative - flow;
        const needed = initialInvestment - previousCumulative;
        const fraction = flow > 0 ? (needed / flow) : 0;
        const paybackYears = (year - 1) + fraction;
        return Math.round(paybackYears * 10) / 10;
      }
    }

    return cashFlows.length + 1; // Supera el horizonte
  }

  /**
   * Relación Beneficio / Costo (B/C Ratio)
   */
  static calculateBCRatio(initialInvestment, cashFlows, discountRate = 0.12) {
    if (initialInvestment <= 0 || !Array.isArray(cashFlows)) return 1.0;
    
    let presentValue = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const year = t + 1;
      const flow = Number(cashFlows[t]) || 0;
      presentValue += flow / Math.pow(1 + discountRate, year);
    }

    const ratio = presentValue / initialInvestment;
    return Math.round(ratio * 100) / 100;
  }

  /**
   * Análisis de Sensibilidad Tornado (Efecto en VAN variando 1 parámetro ±25%)
   */
  static sensitivityTornado({
    initialInvestment = 20000000,
    baseCashFlows = [5000000, 6500000, 8000000, 9500000, 11000000],
    wacc = 0.12,
    variationPct = 0.25
  } = {}) {
    const baseNPV = this.calculateNPV(initialInvestment, baseCashFlows, wacc);

    // 1. Sensibilidad a Ingresos / Flujos (+-25%)
    const highFlows = baseCashFlows.map(f => f * (1 + variationPct));
    const lowFlows = baseCashFlows.map(f => f * (1 - variationPct));
    const npvFlowsHigh = this.calculateNPV(initialInvestment, highFlows, wacc);
    const npvFlowsLow = this.calculateNPV(initialInvestment, lowFlows, wacc);

    // 2. Sensibilidad a Inversión Inicial (+-25%)
    const npvCapexHigh = this.calculateNPV(initialInvestment * (1 + variationPct), baseCashFlows, wacc);
    const npvCapexLow = this.calculateNPV(initialInvestment * (1 - variationPct), baseCashFlows, wacc);

    // 3. Sensibilidad a Tasa WACC (+-2%)
    const npvWaccHigh = this.calculateNPV(initialInvestment, baseCashFlows, wacc + 0.02);
    const npvWaccLow = this.calculateNPV(initialInvestment, baseCashFlows, Math.max(0.01, wacc - 0.02));

    return [
      {
        variable: 'Ingresos y Flujo Operativo (±25%)',
        lowNPV: npvFlowsLow,
        baseNPV,
        highNPV: npvFlowsHigh,
        impacto: Math.abs(npvFlowsHigh - npvFlowsLow)
      },
      {
        variable: 'Inversión Inicial CAPEX (±25%)',
        lowNPV: npvCapexHigh, // Mayor CAPEX = Menor VAN
        baseNPV,
        highNPV: npvCapexLow, // Menor CAPEX = Mayor VAN
        impacto: Math.abs(npvCapexLow - npvCapexHigh)
      },
      {
        variable: 'Tasa de Descuento WACC (±2%)',
        lowNPV: npvWaccHigh,
        baseNPV,
        highNPV: npvWaccLow,
        impacto: Math.abs(npvWaccLow - npvWaccHigh)
      }
    ].sort((a, b) => b.impacto - a.impacto);
  }

  /**
   * Ejecuta el análisis integral completo
   */
  static analyze({
    initialInvestment = 20000000,
    cashFlows = [5000000, 6500000, 8000000, 9500000, 11000000],
    equity = 20000000,
    debt = 0,
    costOfEquity = 0.15,
    costOfDebt = 0.08,
    taxRate = 0.30
  } = {}) {
    const wacc = this.calculateWACC({ equity, debt, costOfEquity, costOfDebt, taxRate });
    const npv = this.calculateNPV(initialInvestment, cashFlows, wacc);
    const irr = this.calculateIRR(initialInvestment, cashFlows);
    const payback = this.calculatePayback(initialInvestment, cashFlows);
    const bcRatio = this.calculateBCRatio(initialInvestment, cashFlows, wacc);
    const tornado = this.sensitivityTornado({ initialInvestment, baseCashFlows: cashFlows, wacc });

    // 3 Escenarios Maestros
    const optimisticFlows = cashFlows.map(f => f * 1.25);
    const pessimisticFlows = cashFlows.map(f => f * 0.75);

    const scenarios = {
      base: { npv, irr, payback, flows: cashFlows },
      optimista: {
        npv: this.calculateNPV(initialInvestment, optimisticFlows, wacc),
        irr: this.calculateIRR(initialInvestment, optimisticFlows),
        payback: this.calculatePayback(initialInvestment, optimisticFlows),
        flows: optimisticFlows
      },
      pesimista: {
        npv: this.calculateNPV(initialInvestment, pessimisticFlows, wacc),
        irr: this.calculateIRR(initialInvestment, pessimisticFlows),
        payback: this.calculatePayback(initialInvestment, pessimisticFlows),
        flows: pessimisticFlows
      }
    };

    return {
      wacc,
      waccPct: `${(wacc * 100).toFixed(2)}%`,
      npv,
      npvFormatted: `$${(npv / 1000000).toFixed(2)}M MXN`,
      irr,
      irrPct: `${(irr * 100).toFixed(2)}%`,
      paybackYears: payback,
      paybackFormatted: `${payback} años`,
      bcRatio,
      isViable: npv > 0 && irr > wacc,
      scenarios,
      tornado
    };
  }
}
