/**
 * Benchmarks de industria y fórmulas financieras extraídas de la literatura de referencia
 * Fuentes: Nature of Value (Ch. 2-5), Lean Startup (p. 89), Burn the Business Plan (p. 67),
 * Anatomy of a Business Plan (p. 78), Starting a Business QuickStart Guide (p. 112).
 */

export const BENCHMARKS = {
  saas: {
    nombre: 'Software as a Service (SaaS)',
    grossMargin: [0.70, 0.85],
    cacLtvRatioMin: 3.0,
    paybackMonthsMax: 12,
    runwayMonths: [18, 24],
    somPctSam: 0.03,
    waccEstimado: 0.14,
    otdMin: 0.99
  },
  services: {
    nombre: 'Servicios Profesionales / Consultoría B2B',
    grossMargin: [0.35, 0.60],
    cacLtvRatioMin: 3.0,
    paybackMonthsMax: 18,
    runwayMonths: [12, 18],
    somPctSam: 0.02,
    waccEstimado: 0.12,
    otdMin: 0.95
  },
  industrial: {
    nombre: 'Industrial / Minería / Manufactura',
    grossMargin: [0.25, 0.45],
    cacLtvRatioMin: 4.0,
    paybackMonthsMax: 36,
    runwayMonths: [24, 36],
    somPctSam: 0.015,
    waccEstimado: 0.12,
    otdMin: 0.98
  },
  micro: {
    nombre: 'Microempresa / Comercio Local',
    grossMargin: [0.30, 0.50],
    cacLtvRatioMin: 2.0,
    paybackMonthsMax: 12,
    runwayMonths: [6, 12],
    somPctSam: 0.05,
    waccEstimado: 0.10,
    otdMin: 0.90
  }
};

export const FINANCIAL_FORMULAS = {
  wacc: {
    formula: 'Ke * (E/V) + Kd * (1 - T) * (D/V)',
    descripcion: 'Costo Promedio Ponderado de Capital (Weighted Average Cost of Capital).',
    fuente: 'Nature of Value (Ch. 5), Anatomy of a Business Plan (Ch. 7)'
  },
  van: {
    formula: 'Σ [ FCF_t / (1 + WACC)^t ] - Inversion_Inicial',
    descripcion: 'Valor Actual Neto descontado a la tasa WACC.',
    fuente: 'Anatomy of a Business Plan (Ch. 7)'
  },
  tir: {
    formula: 'Tasa r tal que VAN(r) = 0',
    descripcion: 'Tasa Interna de Retorno obtenida por aproximación numérica (Newton-Raphson).',
    fuente: 'Plan de Negocios VF (p. 84)'
  },
  fcff: {
    formula: 'EBIT * (1 - T) + D&A - CAPEX - ΔNWC',
    descripcion: 'Flujo de Caja Libre para la Firma (Free Cash Flow to Firm).',
    fuente: 'ONUDI Manual de Preparación de Proyectos Industriales'
  },
  payback: {
    formula: 'Periodo t donde Flujo_Acumulado(t) >= Inversion_Inicial',
    descripcion: 'Periodo de recuperación de la inversión inicial en años/meses.',
    fuente: 'Starting a Business QuickStart Guide (Ch. 9)'
  },
  cac: {
    formula: 'Gasto Total en Ventas y Marketing / Nuevos Clientes Adquiridos',
    descripcion: 'Costo de Adquisición de Clientes (Customer Acquisition Cost).',
    fuente: 'The Lean Startup (Ch. 6)'
  },
  ltv: {
    formula: '(Ticket Promedio * Frecuencia Compra * Margen Bruto) / Tasa Cancelacion',
    descripcion: 'Valor de Vida del Cliente (Customer Lifetime Value).',
    fuente: 'Burn the Business Plan (p. 67)'
  }
};
