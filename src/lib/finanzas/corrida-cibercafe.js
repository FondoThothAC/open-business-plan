const mxn = (value) => new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const years = [1, 2, 3, 4, 5];

const annualRows = [
  {
    year: 1,
    sales: 250000,
    fixedCosts: 140280,
    variableCosts: 41520.8,
    totalCosts: 181800.8,
    grossProfit: 68199.2,
    depreciation: 28780.166667,
    ebt: 39419.033333,
    taxes: 3941.903333,
    netIncome: 35477.13,
    salvageValue: 0,
    cashFlow: 68199.2,
    breakEvenAmount: 168218.220331,
    breakEvenPct: 67.2873,
  },
  {
    year: 2,
    sales: 262500,
    fixedCosts: 147294,
    variableCosts: 43596.84,
    totalCosts: 190890.84,
    grossProfit: 71609.16,
    depreciation: 30219.175,
    ebt: 41389.985,
    taxes: 4138.9985,
    netIncome: 37250.9865,
    salvageValue: 0,
    cashFlow: 71609.16,
    breakEvenAmount: 176629.131347,
    breakEvenPct: 67.2873,
  },
  {
    year: 3,
    sales: 275625,
    fixedCosts: 154658.7,
    variableCosts: 45776.682,
    totalCosts: 200435.382,
    grossProfit: 75189.618,
    depreciation: 31730.13375,
    ebt: 43459.48425,
    taxes: 4345.948425,
    netIncome: 39113.535825,
    salvageValue: 0,
    cashFlow: 75189.618,
    breakEvenAmount: 185460.587915,
    breakEvenPct: 67.2873,
  },
  {
    year: 4,
    sales: 289406.25,
    fixedCosts: 162391.635,
    variableCosts: 48065.5161,
    totalCosts: 210457.1511,
    grossProfit: 78949.0989,
    depreciation: 33316.640438,
    ebt: 45632.458462,
    taxes: 4563.245846,
    netIncome: 41069.212616,
    salvageValue: 0,
    cashFlow: 78949.0989,
    breakEvenAmount: 194733.617311,
    breakEvenPct: 67.2873,
  },
  {
    year: 5,
    sales: 303876.5625,
    fixedCosts: 170511.21675,
    variableCosts: 50468.791905,
    totalCosts: 220980.008655,
    grossProfit: 82896.553845,
    depreciation: 34982.472459,
    ebt: 47914.081386,
    taxes: 4791.408139,
    netIncome: 43122.673247,
    salvageValue: 36099.166667,
    cashFlow: 118995.720512,
    breakEvenAmount: 204470.298176,
    breakEvenPct: 67.2873,
  },
];

const investmentItems = [
  { concepto: 'Copiadora Multifuncional Impresora y Escaner 6322 Samsung', unidad: 'equipo', cantidad: 1, costoUnitario: 18840, monto: 18840, tipo: 'Activo Fijo' },
  { concepto: 'Módulos Cibercafé Petit Nvd, escritorio para PC', unidad: 'Piezas', cantidad: 12, costoUnitario: 1787, monto: 21444, tipo: 'Activo Fijo' },
  { concepto: 'Computadora completa Intel Celeron dual, disco duro 500 GB, RAM 4 GB, pantalla, teclado, mouse y diadema', unidad: 'equipo', cantidad: 12, costoUnitario: 8300, monto: 99600, tipo: 'Activo Fijo' },
  { concepto: 'Impresora a color multifuncional laser', unidad: 'equipo', cantidad: 1, costoUnitario: 4872, monto: 4872, tipo: 'Activo Fijo' },
  { concepto: 'Servidor de alta velocidad con periféricos múltiples y pantalla LCD', unidad: 'equipo', cantidad: 1, costoUnitario: 10180, monto: 10180, tipo: 'Activo Fijo' },
  { concepto: 'Sillas fijas para computadora', unidad: 'Pieza', cantidad: 12, costoUnitario: 970, monto: 11640, tipo: 'Activo Fijo' },
  { concepto: 'Reguladores de voltaje para cada computadora', unidad: 'Pieza', cantidad: 12, costoUnitario: 722, monto: 8664, tipo: 'Activo Fijo' },
  { concepto: 'Switch múltiple para distribuir señal de internet', unidad: 'equipo', cantidad: 1, costoUnitario: 812, monto: 812, tipo: 'Activo Fijo' },
  { concepto: 'Cableado de red para 13 computadoras', unidad: 'lote', cantidad: 1, costoUnitario: 3948, monto: 3948, tipo: 'Activo Fijo' },
  { concepto: 'Acondicionamiento del local', unidad: 'Presupuesto', cantidad: 1, costoUnitario: 8000, monto: 8000, tipo: 'Activo Fijo' },
  { concepto: 'Capacitación y asistencia técnica', unidad: 'Presupuesto', cantidad: 1, costoUnitario: 18000, monto: 18000, tipo: 'Activo Diferido' },
  { concepto: 'Materia prima e insumos', unidad: 'Presupuesto', cantidad: 1, costoUnitario: 3460.066667, monto: 3460.066667, tipo: 'Capital de Trabajo' },
  { concepto: 'Mano de obra inicial', unidad: 'Presupuesto', cantidad: 1, costoUnitario: 700, monto: 700, tipo: 'Capital de Trabajo' },
  { concepto: 'Servicios y otros', unidad: 'Presupuesto', cantidad: 1, costoUnitario: 10190, monto: 10190, tipo: 'Capital de Trabajo' },
];

const revenueLines = [
  { concepto: 'Copias', annual: [5400, 5670, 5953.5, 6251.175, 6563.73375] },
  { concepto: 'Impresiones a color', annual: [10400, 10920, 11466, 12039.3, 12641.265] },
  { concepto: 'Captura de Texto', annual: [23250, 24412.5, 25633.125, 26914.78125, 28260.520313] },
  { concepto: 'Venta de USB 2G', annual: [35250, 37012.5, 38863.125, 40806.28125, 42846.595313] },
  { concepto: 'Renta de internet', annual: [110000, 115500, 121275, 127338.75, 133705.6875] },
  { concepto: 'Impresiones B/N', annual: [47000, 49350, 51817.5, 54408.375, 57128.79375] },
  { concepto: 'Grabado de CD´s', annual: [11250, 11812.5, 12403.125, 13023.28125, 13674.445312] },
  { concepto: 'Venta de CD´s', annual: [7450, 7822.5, 8213.625, 8624.30625, 9055.521563] },
];

const fixedCostLines = [
  { concepto: 'Administración', monthly: 2880, annual: [34560, 36288, 38102.4, 40007.52, 42007.896] },
  { concepto: 'Mantenimiento', monthly: 700, annual: [8400, 8820, 9261, 9724.05, 10210.2525] },
  { concepto: 'Mano de obra', monthly: 5760, annual: [69120, 72576, 76204.8, 80015.04, 84015.792] },
  { concepto: 'Renta de local', monthly: 1200, annual: [14400, 15120, 15876, 16669.8, 17503.29] },
  { concepto: 'Pago de luz', monthly: 350, annual: [4200, 4410, 4630.5, 4862.025, 5105.12625] },
  { concepto: 'Pago de teléfono e internet', monthly: 800, annual: [9600, 10080, 10584, 11113.2, 11668.86] },
];

const variableCostLines = [
  { concepto: 'Hojas blancas', monthly: 320.4, annual: [3844.8, 4037.04, 4238.892, 4450.8366, 4673.37843] },
  { concepto: 'Tóner de impresora a color', monthly: 383.333333, annual: [4600, 4830, 5071.5, 5325.075, 5591.32875] },
  { concepto: 'Tóner B/N', monthly: 356.666667, annual: [4280, 4494, 4718.7, 4954.635, 5202.36675] },
  { concepto: 'CD´s', monthly: 49.666667, annual: [596, 625.8, 657.09, 689.9445, 724.441725] },
  { concepto: 'USB', monthly: 2350, annual: [28200, 29610, 31090.5, 32645.025, 34277.27625] },
];

const depreciationAssets = [
  { concepto: 'Copiadora Multifuncional Impresora y Escaner 6322 Samsung', initialCost: 18840, annualDepreciation: 3140, salvageValue: 3140 },
  { concepto: 'Módulos Cibercafé Petit Nvd, escritorio para PC', initialCost: 21444, annualDepreciation: 2680.5, salvageValue: 8041.5 },
  { concepto: 'Computadora completa Intel Celeron dual, disco duro 500 GB, RAM 4 GB, pantalla, teclado, mouse y diadema', initialCost: 99600, annualDepreciation: 16600, salvageValue: 16600 },
  { concepto: 'Impresora a color multifuncional laser', initialCost: 4872, annualDepreciation: 812, salvageValue: 812 },
  { concepto: 'Servidor de alta velocidad con periféricos múltiples y pantalla LCD', initialCost: 10180, annualDepreciation: 1696.666667, salvageValue: 1696.666667 },
  { concepto: 'Sillas fijas para computadora', initialCost: 11640, annualDepreciation: 1455, salvageValue: 4365 },
  { concepto: 'Reguladores de voltaje para cada computadora', initialCost: 8664, annualDepreciation: 1444, salvageValue: 1444 },
  { concepto: 'Switch múltiple para distribuir señal de internet', initialCost: 812, annualDepreciation: 162.4, salvageValue: 0 },
  { concepto: 'Cableado de red para 13 computadoras', initialCost: 3948, annualDepreciation: 789.6, salvageValue: 0 },
];

export const CIBERCAFE_CORRIDA = {
  id: 'corrida-cibercafe-fappa-promete-2015',
  sourceFile: 'Corrida-cibercafe-fappa-promete-2015-G.xls',
  projectName: 'CIBERCAFE',
  program: 'FAPPA/PROMETE',
  durationYears: 5,
  discountRate: 10,
  taxRate: 10,
  annualGrowthRate: 5,
  initialInvestment: 220350.066667,
  fixedAssetInvestment: 188000,
  deferredInvestment: 18000,
  workingCapital: 14350.066667,
  investmentItems,
  revenueLines,
  fixedCostLines,
  variableCostLines,
  depreciationAssets,
  annualRows,
  profitability: {
    npv: 85131.679961,
    irr: 22.9198,
    cbr: 1.087321,
    paybackPeriod: '3 año(s)|0 mes(es)|24 día(s)',
  },
};

export function readCorrida(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

export function getActiveCorrida(planData) {
  return readCorrida(planData?.organizacion?.estados_financieros?.corrida_importada);
}

export function buildCapexRowsFromCorrida(run = CIBERCAFE_CORRIDA) {
  return run.investmentItems.map((item, index) => ({
    id: index + 1,
    concepto: item.concepto,
    tipo: item.tipo,
    unidad: item.unidad,
    cantidad: item.cantidad,
    costoUnitario: item.costoUnitario,
    monto: item.monto,
  }));
}

export function buildOpexRowsFromCorrida(run = CIBERCAFE_CORRIDA) {
  const fixed = run.fixedCostLines.map((item, index) => ({
    id: index + 1,
    categoria: 'Fijo',
    concepto: item.concepto,
    mensual: item.monthly,
  }));

  const variable = run.variableCostLines.map((item, index) => ({
    id: 100 + index + 1,
    categoria: 'Variable',
    concepto: item.concepto,
    mensual: item.monthly,
  }));

  return [...fixed, ...variable];
}

export function buildRevenueRowsFromCorrida(run = CIBERCAFE_CORRIDA) {
  return run.revenueLines.map((item, index) => ({
    id: index + 1,
    concepto: item.concepto,
    mensual: item.annual[0] / 12,
    anual: item.annual[0],
    crecimiento: run.annualGrowthRate,
  }));
}

export function buildProjectDataFromCorrida(run = CIBERCAFE_CORRIDA) {
  const investmentItemsMapped = run.investmentItems.map((item, index) => ({
    id: index + 1,
    name: item.concepto,
    type: item.tipo,
    amount: item.monto,
    acquisitionSource: item.tipo === 'Activo Fijo' || item.tipo === 'Activo Diferido' ? 'Financiamiento' : 'Aportación (Nuevo)',
  }));

  return {
    projectDuration: run.durationYears,
    taxRate: run.taxRate,
    discountRate: run.discountRate,
    inflationRate: 0,
    minimumAcceptableIRR: run.discountRate,
    investmentItems: investmentItemsMapped,
    depreciableAssets: run.depreciationAssets.map((item, index) => ({
      id: index + 1,
      name: item.concepto,
      initialCost: item.initialCost,
      salvageValue: item.salvageValue,
      usefulLifeYears: run.durationYears,
      depreciationMethod: 'Línea Recta',
    })),
    recurringRevenues: run.revenueLines.map((item, index) => ({
      id: index + 1,
      name: item.concepto,
      initialMonthlyAmount: item.annual[0] / 12,
      annualGrowthRates: Array(run.durationYears).fill(run.annualGrowthRate),
    })),
    recurringExpenses: [
      ...run.fixedCostLines.map((item, index) => ({
        id: index + 1,
        name: item.concepto,
        type: 'Fijo',
        initialMonthlyAmount: item.monthly,
        growthType: 'annual',
        monthlyGrowthRate: 0,
        annualGrowthRates: Array(run.durationYears).fill(run.annualGrowthRate),
      })),
      ...run.variableCostLines.map((item, index) => ({
        id: 100 + index + 1,
        name: item.concepto,
        type: 'Variable',
        initialMonthlyAmount: item.monthly,
        growthType: 'annual',
        monthlyGrowthRate: 0,
        annualGrowthRates: Array(run.durationYears).fill(run.annualGrowthRate),
      })),
    ],
    loans: [],
    payrollConfig: {
      positions: [],
      temporaryEmployees: 0,
      temporaryEmployeeSalary: 0,
      dailyMinimumWage: 250,
      vacationDaysPerYear: 12,
      vacationBonusRate: 25,
      socialChargesRate: 30,
      annualSalaryGrowthRate: run.annualGrowthRate,
    },
    workingCapitalConfig: {
      requiredMonthsOfFixedCosts: 0,
    },
    advancedConfig: {
      products: [],
    },
  };
}

function getPaybackPeriod(annualCashFlowData) {
  for (let index = 1; index < annualCashFlowData.length; index += 1) {
    const current = annualCashFlowData[index];
    const previous = annualCashFlowData[index - 1];
    if (current.cumulativeCashFlow > 0) {
      const fractionOfYear = Math.abs(previous.cumulativeCashFlow) / Math.max(1, current.netCashFlow);
      const totalMonths = fractionOfYear * 12;
      const months = Math.floor(totalMonths);
      const days = Math.round((totalMonths - months) * 30);
      return `${index - 1} año(s)|${months} mes(es)|${days} día(s)`;
    }
  }
  return 'Nunca';
}

export function buildProjectionFromCorrida(run = CIBERCAFE_CORRIDA) {
  const annualSummaries = run.annualRows.map((row) => ({
    year: row.year,
    incomeStatement: {
      year: row.year,
      sales: row.sales,
      fixedCosts: row.fixedCosts,
      variableCosts: row.variableCosts,
      grossProfit: row.grossProfit,
      annualDepreciation: row.depreciation,
      annualInterest: 0,
      ebt: row.ebt,
      taxes: row.taxes,
      netIncome: row.netIncome,
    },
    cashFlow: {
      year: row.year,
      netIncome: row.netIncome,
      annualDepreciation: row.depreciation,
      annualPrincipalRepayment: 0,
      salvageValue: row.salvageValue,
      netCashFlow: row.cashFlow,
    },
    breakEven: {
      year: row.year,
      sales: row.sales,
      fixedCosts: row.fixedCosts,
      variableCosts: row.variableCosts,
      bepAmount: row.breakEvenAmount,
      bepPercentage: row.breakEvenPct,
    },
    costBenefit: {
      year: row.year,
      benefits: row.sales + row.salvageValue,
      costs: row.totalCosts,
      netBenefit: row.cashFlow,
    },
  }));

  const annualCashFlowData = [{ year: 0, netCashFlow: -run.initialInvestment, cumulativeCashFlow: -run.initialInvestment }];
  run.annualRows.forEach((row) => {
    const previous = annualCashFlowData[annualCashFlowData.length - 1];
    annualCashFlowData.push({
      year: row.year,
      netCashFlow: row.cashFlow,
      cumulativeCashFlow: previous.cumulativeCashFlow + row.cashFlow,
    });
  });

  let monthlyCumulativeCashFlow = -run.initialInvestment;
  let monthlyCumulativeBenefits = 0;
  let monthlyCumulativeCosts = run.initialInvestment;
  const monthlyBreakdown = [];
  const monthlyCashFlowData = [];
  const monthlyCostBenefitData = [];

  run.annualRows.forEach((row) => {
    for (let month = 1; month <= 12; month += 1) {
      const sales = row.sales / 12;
      const fixedCosts = row.fixedCosts / 12;
      const variableCosts = row.variableCosts / 12;
      const netCashFlow = row.cashFlow / 12;
      const grossProfit = row.grossProfit / 12;
      const monthlyDepreciation = row.depreciation / 12;
      const ebt = row.ebt / 12;
      const taxes = row.taxes / 12;
      const netIncome = row.netIncome / 12;
      const contributionMarginRatio = sales > 0 ? (sales - variableCosts) / sales : 0;
      const bepAmount = contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : Infinity;
      const benefits = sales + (month === 12 ? row.salvageValue : 0);
      const costs = fixedCosts + variableCosts;

      monthlyCumulativeCashFlow += netCashFlow;
      monthlyCumulativeBenefits += benefits;
      monthlyCumulativeCosts += costs;

      const monthRow = {
        year: row.year,
        month,
        sales,
        fixedCosts,
        variableCosts,
        grossProfit,
        operatingExpenses: fixedCosts,
        monthlyDepreciation,
        monthlyInterest: 0,
        ebitda: grossProfit,
        ebit: ebt,
        ebt,
        taxes,
        netIncome,
        netCashFlow,
        bepAmount,
        bepPercentage: sales > 0 ? (bepAmount / sales) * 100 : Infinity,
        benefits,
        costs,
        netBenefit: benefits - costs,
      };

      monthlyBreakdown.push(monthRow);
      monthlyCashFlowData.push({
        year: row.year,
        month,
        name: `A${row.year}M${month}`,
        netCashFlow,
        cumulativeCashFlow: monthlyCumulativeCashFlow,
      });
      monthlyCostBenefitData.push({
        ...monthRow,
        cumulativeBenefits: monthlyCumulativeBenefits,
        cumulativeCosts: monthlyCumulativeCosts,
        cumulativeNetBenefit: monthlyCumulativeBenefits - monthlyCumulativeCosts,
      });
    }
  });

  let cumulativeBenefits = 0;
  let cumulativeCosts = run.initialInvestment;
  const annualCostBenefitData = run.annualRows.map((row) => {
    cumulativeBenefits += row.sales + row.salvageValue;
    cumulativeCosts += row.totalCosts;
    return {
      year: row.year,
      benefits: row.sales + row.salvageValue,
      costs: row.totalCosts,
      netBenefit: row.cashFlow,
      cumulativeBenefits,
      cumulativeCosts,
      cumulativeNetBenefit: cumulativeBenefits - cumulativeCosts,
    };
  });

  const annualCashFlows = [-run.initialInvestment, ...run.annualRows.map((row) => row.cashFlow)];
  const annualNPVContributions = annualCashFlows.map((cashFlow, index) => ({
    year: index,
    discountedCashFlow: cashFlow / Math.pow(1 + run.discountRate / 100, index),
  }));

  const roi = run.initialInvestment > 0
    ? (run.annualRows.reduce((total, row) => total + row.netIncome, 0) / run.initialInvestment) * 100
    : 0;

  return {
    source: run.sourceFile,
    netInitialInvestment: run.initialInvestment,
    monthlyBreakdown,
    annualSummaries,
    annualCashFlowData,
    monthlyCashFlowData,
    annualCostBenefitData,
    monthlyCostBenefitData,
    financialMetrics: {
      npv: run.profitability.npv,
      irr: run.profitability.irr,
      paybackPeriod: run.profitability.paybackPeriod || getPaybackPeriod(annualCashFlowData),
      cbr: run.profitability.cbr,
      roi,
    },
    compositionData: annualSummaries.map((summary) => ({ ...summary.incomeStatement })),
    salesData: run.annualRows.map((row) => ({ year: row.year, sales: row.sales })),
    monthlyBreakEvenData: monthlyBreakdown,
    annualNPVContributions,
    loanSchedules: {},
    derivedData: {
      investmentItems: buildProjectDataFromCorrida(run).investmentItems,
      recurringRevenues: buildProjectDataFromCorrida(run).recurringRevenues,
      recurringExpenses: buildProjectDataFromCorrida(run).recurringExpenses,
      netInitialInvestment: run.initialInvestment,
    },
  };
}

export function buildCorridaNarratives(run = CIBERCAFE_CORRIDA) {
  const firstYear = run.annualRows[0];
  const lastYear = run.annualRows[run.annualRows.length - 1];
  const fixedTotal = run.fixedCostLines.reduce((total, row) => total + row.monthly, 0);
  const variableTotal = run.variableCostLines.reduce((total, row) => total + row.monthly, 0);
  const annualLines = run.annualRows
    .map((row) => `Año ${row.year}: ventas ${mxn(row.sales)}, utilidad neta ${mxn(row.netIncome)}, flujo ${mxn(row.cashFlow)}.`)
    .join('\n');

  return {
    capex: `Total estimado CAPEX + capital de trabajo: ${mxn(run.initialInvestment)}. Activo fijo: ${mxn(run.fixedAssetInvestment)}; activo diferido: ${mxn(run.deferredInvestment)}; capital de trabajo: ${mxn(run.workingCapital)}.`,
    opexInicial: `Capital de trabajo inicial: ${mxn(run.workingCapital)} para materia prima, mano de obra y servicios de arranque.`,
    financiamiento: `Estructura de origen del presupuesto: programa ${mxn(198000)} y socios ${mxn(22350.066667)}.`,
    fijos: `${mxn(fixedTotal)} mensuales en costos fijos base. Año 1: ${mxn(firstYear.fixedCosts)}.`,
    variables: `${mxn(variableTotal)} mensuales promedio en costos variables base. Año 1: ${mxn(firstYear.variableCosts)}.`,
    unitario: `Punto de equilibrio año 1: ${mxn(firstYear.breakEvenAmount)} (${firstYear.breakEvenPct.toFixed(1)}% de ventas).`,
    resultados: `Estado de resultados importado de corrida ${run.program}:\n${annualLines}`,
    balance: [
      `Inversión inicial total: ${mxn(run.initialInvestment)}.`,
      `Valor de rescate año 5: ${mxn(lastYear.salvageValue)}.`,
      `VAN a ${run.discountRate}%: ${mxn(run.profitability.npv)}.`,
      `Relación beneficio/costo: ${run.profitability.cbr.toFixed(2)}.`,
    ].join('\n'),
    flujoCaja: [
      `Flujo inicial: -${mxn(run.initialInvestment)}.`,
      ...run.annualRows.map((row) => `Año ${row.year}: ${mxn(row.cashFlow)}`),
    ].join('\n'),
    puntoEquilibrio: `Punto de equilibrio año 1: ${mxn(firstYear.breakEvenAmount)} (${firstYear.breakEvenPct.toFixed(1)}% de ventas). Recuperación estimada: ${run.profitability.paybackPeriod.replace(/\|/g, ' ')}.`,
    indicadores: [
      `VAN: ${mxn(run.profitability.npv)}`,
      `TIR: ${run.profitability.irr.toFixed(2)}%`,
      `B/C: ${run.profitability.cbr.toFixed(2)}`,
      `Tasa de actualización: ${run.discountRate}%`,
    ].join('\n'),
  };
}

export function buildCorridaPlanUpdates(run = CIBERCAFE_CORRIDA) {
  const narratives = buildCorridaNarratives(run);
  return [
    ['organizacion', 'inversion', 'desglose_capex_json', JSON.stringify(buildCapexRowsFromCorrida(run))],
    ['organizacion', 'inversion', 'capex', narratives.capex],
    ['organizacion', 'inversion', 'opex_inicial', narratives.opexInicial],
    ['organizacion', 'inversion', 'financiamiento', narratives.financiamiento],
    ['organizacion', 'costos', 'desglose_opex_json', JSON.stringify(buildOpexRowsFromCorrida(run))],
    ['organizacion', 'costos', 'fijos', narratives.fijos],
    ['organizacion', 'costos', 'variables', narratives.variables],
    ['organizacion', 'costos', 'unitario', narratives.unitario],
    ['organizacion', 'estados_financieros', 'ingresos_json', JSON.stringify(buildRevenueRowsFromCorrida(run))],
    ['organizacion', 'estados_financieros', 'corrida_importada', JSON.stringify(run)],
    ['organizacion', 'estados_financieros', 'resultados', narratives.resultados],
    ['organizacion', 'estados_financieros', 'balance', narratives.balance],
    ['organizacion', 'estados_financieros', 'flujo_caja', narratives.flujoCaja],
    ['organizacion', 'rentabilidad', 'punto_equilibrio', narratives.puntoEquilibrio],
    ['organizacion', 'rentabilidad', 'indicadores', narratives.indicadores],
  ];
}

export function applyCorridaToPlan(updateSection, run = CIBERCAFE_CORRIDA) {
  buildCorridaPlanUpdates(run).forEach(([pillar, module, field, value]) => {
    updateSection(pillar, module, field, value);
  });
}

export function getCorridaSummaryCards(run = CIBERCAFE_CORRIDA) {
  return [
    { label: 'Inversión total', value: mxn(run.initialInvestment), detail: `${run.program} · ${run.durationYears} años` },
    { label: 'Ventas año 1', value: mxn(run.annualRows[0].sales), detail: `${run.annualGrowthRate}% crecimiento anual` },
    { label: 'VAN', value: mxn(run.profitability.npv), detail: `Tasa ${run.discountRate}%` },
    { label: 'TIR', value: `${run.profitability.irr.toFixed(2)}%`, detail: `B/C ${run.profitability.cbr.toFixed(2)}` },
  ];
}

export { years };
