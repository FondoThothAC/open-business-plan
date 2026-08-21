import { useState, useEffect, useMemo } from 'react';
import { usePlan } from '../context/PlanContext';
import { calculateFinancialProjections } from '../lib/finanzas/financial-calculations';
import { Calculator, Settings, RefreshCw, BarChart, TrendingUp, Wallet, FileText, CheckCircle2 } from 'lucide-react';
import ExpertPanel from './ExpertPanel';
import FinancialCharts, { CashFlowChart, ProfitGauge } from './FinancialCharts';
import MonteCarloSimulator from './MonteCarloSimulator';
import {
  CIBERCAFE_CORRIDA,
  buildProjectionFromCorrida,
  getActiveCorrida,
  getCorridaSummaryCards,
  years,
} from '../lib/finanzas/corrida-cibercafe';

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value || 0));

function parseNum(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const str = String(value).trim();
  
  const millonMatch = str.match(/(\d+(?:\.\d+)?)\s*millon(?:es)?/i);
  if (millonMatch) {
    const num = parseFloat(millonMatch[1]);
    if (!isNaN(num)) return num * 1000000;
  }
  
  const currencyMatch = str.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)/);
  if (currencyMatch) {
    const num = parseFloat(currencyMatch[1].replace(/,/g, ''));
    if (!isNaN(num)) return num;
  }

  const normalized = str.replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

function readJson(raw, fallback) {
  if (!raw) return fallback;
  if (typeof raw !== 'string') {
    return Array.isArray(fallback) ? (Array.isArray(raw) ? raw : fallback) : (raw || fallback);
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : (parsed || fallback);
  } catch {
    return fallback;
  }
}

function isVariableExpense(row) {
  const label = `${row.categoria || ''} ${row.tipo || ''}`.toLowerCase();
  return label.includes('variable') || label.includes('comercial') || label.includes('venta');
}

function buildInitialFinanceData(planData, importedCorrida) {
  const banxicoData = planData.naturaleza?.pestel?.indicadores_banxico || {};
  const currentInflation = banxicoData.inflacion ? parseFloat(banxicoData.inflacion) : 4.5;
  const currentTIIE = banxicoData.tiie ? parseFloat(banxicoData.tiie) : 10;
  const estimatedWACC = currentTIIE + 2.0; // TIIE + prima de riesgo base

  if (importedCorrida) {
    return {
      projectDuration: importedCorrida.durationYears || 5,
      taxRate: importedCorrida.taxRate || 10,
      discountRate: importedCorrida.discountRate || estimatedWACC,
      inflationRate: currentInflation,
      initialInvestment: importedCorrida.initialInvestment || 0,
      monthlyFixedCosts: (importedCorrida.fixedCostLines || []).reduce((sum, row) => sum + parseNum(row.monthly), 0),
      annualSalesGoal: importedCorrida.annualRows?.[0]?.sales || 0,
      monthlyVariableCosts: (importedCorrida.variableCostLines || []).reduce((sum, row) => sum + parseNum(row.monthly), 0),
      annualSalesGrowth: importedCorrida.annualGrowthRate || 5,
      annualCostGrowth: importedCorrida.annualGrowthRate || 5,
    };
  }

  const semilla = planData.semilla || {};
  const capexRows = readJson(planData.organizacion?.inversion?.desglose_capex_json, []);
  const opexRows = readJson(planData.organizacion?.costos?.desglose_opex_json, []);
  const revenueRows = readJson(planData.organizacion?.estados_financieros?.ingresos_json, []);
  const capexTotal = capexRows.reduce((sum, row) => sum + parseNum(row.monto || row.amount), 0);
  const fixedTotal = opexRows.filter((row) => !isVariableExpense(row)).reduce((sum, row) => sum + parseNum(row.mensual), 0);
  const revenueTotal = revenueRows.reduce((sum, row) => sum + (parseNum(row.anual) || (parseNum(row.mensual) * 12)), 0);
  const inver = capexTotal || semilla.finanzas?.inversion_total || planData.organizacion?.inversion?.capex || '100000';
  const fijos = fixedTotal || semilla.finanzas?.costos_fijos || planData.organizacion?.costos?.fijos || '20000';
  const meta = revenueTotal || semilla.finanzas?.meta_ingresos || '500000';

  return {
    projectDuration: 5,
    taxRate: 30,
    discountRate: estimatedWACC,
    inflationRate: currentInflation,
    initialInvestment: parseNum(inver),
    monthlyFixedCosts: parseNum(fijos),
    annualSalesGoal: parseNum(meta),
    monthlyVariableCosts: parseNum(fijos) * 0.3,
    annualSalesGrowth: 15,
    annualCostGrowth: 5,
  };
}

function buildManualProjectData(financeData, planData) {
  const capexRows = readJson(planData.organizacion?.inversion?.desglose_capex_json, []);
  const opexRows = readJson(planData.organizacion?.costos?.desglose_opex_json, []);
  const revenueRows = readJson(planData.organizacion?.estados_financieros?.ingresos_json, []);

  const investmentItems = capexRows.length > 0
    ? capexRows.map((row, index) => ({
      id: index + 1,
      name: row.concepto || row.name || `Inversión ${index + 1}`,
      amount: parseNum(row.monto || row.amount),
      type: ['Activo Fijo', 'Activo Diferido', 'Capital de Trabajo'].includes(row.tipo) ? row.tipo : 'Activo Fijo',
      acquisitionSource: row.fuente || 'Aportación (Nuevo)',
    })).filter((row) => row.amount > 0)
    : [{ id: 1, name: 'Inversión Inicial Base', amount: financeData.initialInvestment, type: 'Activo Fijo', acquisitionSource: 'Aportación (Nuevo)' }];

  const recurringRevenues = revenueRows.length > 0
    ? revenueRows.map((row, index) => ({
      id: index + 1,
      name: row.concepto || row.name || `Ingreso ${index + 1}`,
      initialMonthlyAmount: parseNum(row.mensual || (parseNum(row.anual) / 12) || 0),
      annualGrowthRates: Array(financeData.projectDuration).fill(parseNum(row.crecimiento || financeData.annualSalesGrowth || 0)),
    })).filter((row) => row.initialMonthlyAmount > 0)
    : [{ id: 1, name: 'Ventas Proyectadas', initialMonthlyAmount: financeData.annualSalesGoal / 12, annualGrowthRates: Array(financeData.projectDuration).fill(financeData.annualSalesGrowth) }];

  const recurringExpenses = opexRows.length > 0
    ? opexRows.map((row, index) => ({
      id: index + 1,
      name: row.concepto || row.name || `Gasto ${index + 1}`,
      type: isVariableExpense(row) ? 'Variable' : 'Fijo',
      initialMonthlyAmount: parseNum(row.mensual || 0),
      growthType: 'annual',
      monthlyGrowthRate: 0,
      annualGrowthRates: Array(financeData.projectDuration).fill(financeData.annualCostGrowth),
    })).filter((row) => row.initialMonthlyAmount > 0)
    : [
      { id: 1, name: 'Costos Fijos Operativos', type: 'Fijo', initialMonthlyAmount: financeData.monthlyFixedCosts, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: Array(financeData.projectDuration).fill(financeData.annualCostGrowth) },
      { id: 2, name: 'Costos Variables Estimados', type: 'Variable', initialMonthlyAmount: financeData.monthlyVariableCosts, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: Array(financeData.projectDuration).fill(financeData.annualCostGrowth) },
    ];

  return {
    projectDuration: financeData.projectDuration,
    taxRate: financeData.taxRate,
    discountRate: financeData.discountRate,
    inflationRate: financeData.inflationRate,
    minimumAcceptableIRR: financeData.discountRate,
    investmentItems,
    depreciableAssets: [],
    recurringRevenues,
    recurringExpenses,
    loans: [],
    payrollConfig: {
      positions: [],
      temporaryEmployees: 0,
      temporaryEmployeeSalary: 0,
      dailyMinimumWage: 250,
      vacationDaysPerYear: 12,
      vacationBonusRate: 25,
      socialChargesRate: 30,
      annualSalaryGrowthRate: 5,
    },
    workingCapitalConfig: { requiredMonthsOfFixedCosts: 3 },
    advancedConfig: { products: [] },
  };
}

export function CorridaTemplatePanel({ activeCorrida, onLoad, onClear }) {
  const cards = getCorridaSummaryCards(activeCorrida || CIBERCAFE_CORRIDA);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderColor: activeCorrida ? 'rgba(16,185,129,0.35)' : 'var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', marginBottom: '0.35rem' }}>
            <FileText className="w-5 h-5 text-accent" />
            Corrida financiera FAPPA/PROMETE
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            Plantilla importada desde <strong>Corrida-cibercafe-fappa-promete-2015-G.xls</strong> para alimentar CAPEX, OPEX, ingresos, estados y rentabilidad.
          </p>
        </div>
        {activeCorrida ? (
          <button className="btn btn-secondary" onClick={onClear} style={{ whiteSpace: 'nowrap' }}>Usar datos manuales</button>
        ) : (
          <button className="btn btn-primary" onClick={onLoad} style={{ whiteSpace: 'nowrap' }}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Cargar XLS</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        {cards.map((card) => (
          <div key={card.label} style={{ padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.25rem' }}>{card.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{card.detail}</div>
          </div>
        ))}
      </div>

      {activeCorrida && (
        <div style={{ marginTop: '1rem', color: 'var(--success-color)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 className="w-4 h-4" />
          Corrida activa: los tableros usan los datos exactos del XLS.
        </div>
      )}
    </div>
  );
}

export function RevenueTable({ corrida }) {
  if (!corrida) return null;
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Presupuesto anual de ingresos importado</h3>
      <div className="financial-table-wrapper" style={{ marginTop: 0 }}>
        <table className="financial-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Concepto</th>
              {years.map((year) => <th key={year} style={{ textAlign: 'right' }}>Año {year}</th>)}
            </tr>
          </thead>
          <tbody>
            {corrida.revenueLines.map((row) => (
              <tr key={row.concepto}>
                <td style={{ fontWeight: 700 }}>{row.concepto}</td>
                {row.annual.map((amount, index) => (
                  <td key={index} style={{ textAlign: 'right' }}>{formatCurrency(amount)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function buildEstadosText(result) {
  const metrics = result?.financialMetrics || {};
  const annual = Array.isArray(result?.annualSummaries) ? result.annualSummaries : [];

  const resultados = [
    'Estado de Resultados Proyectado (resumen):',
    ...annual.map((row) => `Año ${row.year}: Ventas ${formatCurrency(row?.incomeStatement?.sales)}, Utilidad Neta ${formatCurrency(row?.incomeStatement?.netIncome)}`),
  ].join('\n');

  const balance = [
    'Balance General Simplificado:',
    `Inversión Inicial: ${formatCurrency(result?.netInitialInvestment)}`,
    `VAN estimado: ${formatCurrency(metrics.npv)}`,
    `ROI acumulado: ${Number(metrics.roi || 0).toFixed(1)}%`,
  ].join('\n');

  const flujo = [
    'Flujo de Caja Proyectado:',
    ...(Array.isArray(result?.annualCashFlowData)
      ? result.annualCashFlowData.map((row) => `Año ${row.year}: Flujo Neto ${formatCurrency(row.netCashFlow)} | Acumulado ${formatCurrency(row.cumulativeCashFlow)}`)
      : []),
  ].join('\n');

  return { resultados, balance, flujo };
}

function buildRentabilidadText(result) {
  const metrics = result?.financialMetrics || {};

  return {
    punto_equilibrio: `Punto de equilibrio estimado: ${metrics.paybackPeriod || 'No disponible'}.`,
    indicadores: [
      `TIR: ${Number(metrics.irr || 0).toFixed(2)}%`,
      `VAN: ${formatCurrency(metrics.npv)}`,
      `ROI: ${Number(metrics.roi || 0).toFixed(2)}%`,
      `CBR: ${Number(metrics.cbr || 0).toFixed(2)}`,
    ].join('\n'),
  };
}

export default function ModuloFinanciero({ title, description, moduleKey, pillarId }) {
  const { planData, updateSection } = usePlan();
  const isEstados = moduleKey === 'estados_financieros';
  const activeCorridaRaw = planData?.organizacion?.estados_financieros?.corrida_importada || '';
  const activeCorrida = useMemo(() => getActiveCorrida(planData), [activeCorridaRaw]);

  const [financeData, setFinanceData] = useState(() => buildInitialFinanceData(planData, activeCorrida));

  const [results, setResults] = useState(null);
  const [activeExpertField, setActiveExpertField] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('corrida'); // Pestaña de navegación interna

  useEffect(() => {
    if (activeCorrida) setFinanceData(buildInitialFinanceData(planData, activeCorrida));
  }, [activeCorridaRaw]);

  const handleDataChange = (field, value) => {
    setFinanceData((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const persistProjection = (proj) => {
    const payload = {
      generatedAt: new Date().toISOString(),
      source: proj.source || 'manual',
      financialMetrics: proj.financialMetrics,
      annualCashFlowData: proj.annualCashFlowData,
      monthlyCashFlowData: proj.monthlyCashFlowData,
      annualSummaries: proj.annualSummaries,
      monthlyBreakdown: proj.monthlyBreakdown,
      annualCostBenefitData: proj.annualCostBenefitData,
      monthlyCostBenefitData: proj.monthlyCostBenefitData,
      monthlyBreakEvenData: proj.monthlyBreakEvenData,
      annualNPVContributions: proj.annualNPVContributions,
      loanSchedules: proj.loanSchedules || {},
      netInitialInvestment: proj.netInitialInvestment,
    };

    updateSection(pillarId, moduleKey, 'corrida_automatica', JSON.stringify(payload));
    if (pillarId === 'organizacion' && moduleKey !== 'estados_financieros') {
      updateSection('organizacion', 'estados_financieros', 'corrida_automatica', JSON.stringify(payload));
    }

    if (isEstados) {
      const text = buildEstadosText(proj);
      updateSection(pillarId, moduleKey, 'resultados', text.resultados);
      updateSection(pillarId, moduleKey, 'balance', text.balance);
      updateSection(pillarId, moduleKey, 'flujo_caja', text.flujo);
    } else {
      const text = buildRentabilidadText(proj);
      updateSection(pillarId, moduleKey, 'punto_equilibrio', text.punto_equilibrio);
      updateSection(pillarId, moduleKey, 'indicadores', text.indicadores);
    }
  };

  const runCalculations = (corridaOverride = activeCorrida) => {
    try {
      const proj = corridaOverride
        ? buildProjectionFromCorrida(corridaOverride)
        : calculateFinancialProjections(buildManualProjectData(financeData, planData), 'years');

      setResults(proj);
      persistProjection(proj);
    } catch (error) {
      console.error('Error al calcular:', error);
    }
  };

  useEffect(() => {
    runCalculations(activeCorrida);
  }, [moduleKey, activeCorridaRaw]);

  // Listen for simulator exports to update the plan dynamically from the embedded iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'SIMULATOR_EXPORT') {
        const payload = event.data.payload;
        const indicatorsText = `Resultados Simulador Avanzado FAPPA (${payload.scenarioName}):\n- TIR: ${(payload.tir * 100).toFixed(2)}%\n- VAN: ${formatCurrency(payload.van)}\n- Relación B/C: ${payload.benefitCostRatio.toFixed(2)}\n- Payback: ${payload.payback.toFixed(1)} años.`;
        
        updateSection('organizacion', 'rentabilidad', 'indicadores', indicatorsText);
        updateSection('organizacion', 'inversion', 'capex', `Inversión total requerida (calculada por simulador): ${formatCurrency(payload.totalInvestment)}.`);
        
        if (payload.programInvestment !== undefined && payload.partnersInvestment !== undefined) {
          const financiamientoText = `Estructura de financiamiento recomendada:\n- Subsidio Gubernamental (FAPPA): ${formatCurrency(payload.programInvestment)} (${(payload.programInvestment / payload.totalInvestment * 100).toFixed(1)}%)\n- Aportación de Socios: ${formatCurrency(payload.partnersInvestment)} (${(payload.partnersInvestment / payload.totalInvestment * 100).toFixed(1)}%)`;
          updateSection('organizacion', 'inversion', 'financiamiento', financiamientoText);
        }
        
        if (payload.breakevenAmount !== undefined && payload.breakevenPercentage !== undefined) {
          const ptoEquilibrioText = `Punto de equilibrio operativo (Año 1): Facturación anual mínima requerida de ${formatCurrency(payload.breakevenAmount)} (equivalente al ${(payload.breakevenPercentage * 100).toFixed(1)}% de la capacidad operativa estimada) para cubrir los gastos fijos y evitar pérdidas.`;
          updateSection('organizacion', 'rentabilidad', 'punto_equilibrio', ptoEquilibrioText);
        }
        
        alert('¡Datos del simulador exportados e integrados con éxito en tu plan de negocios!');
        runCalculations(activeCorrida);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeCorrida]);

  const chartData = useMemo(() => {
    if (!results || !Array.isArray(results.annualCashFlowData)) return [];
    return results.annualCashFlowData.map((row) => {
      const summary = (results.annualSummaries || []).find((item) => item.year === row.year);
      return {
        label: `Año ${row.year}`,
        income: summary?.incomeStatement?.sales || 0,
        expense: (summary?.incomeStatement?.fixedCosts || 0) + (summary?.incomeStatement?.variableCosts || 0),
        net: row.cumulativeCashFlow || row.netCashFlow || 0,
      };
    });
  }, [results]);

  return (
    <div className="module-view">
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="view-title">{title || 'Dashboard Financiero'}</h1>
          <p className="text-secondary mt-1">{description || 'Modelo financiero dinámico con corrida anual y KPIs ejecutivos.'}</p>
        </div>
      </div>

      {/* Tabs de Navegación del Módulo Financiero */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('corrida')} 
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'corrida' ? '2px solid var(--accent-color)' : '2px solid transparent',
            color: activeSubTab === 'corrida' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Corrida Financiera y Proyecciones
        </button>
        <button 
          onClick={() => setActiveSubTab('montecarlo')} 
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'montecarlo' ? '2px solid var(--accent-color)' : '2px solid transparent',
            color: activeSubTab === 'montecarlo' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Simulador de Riesgo Monte Carlo
        </button>
      </div>

      {activeSubTab === 'montecarlo' ? (
        <MonteCarloSimulator 
          initialInvestment={financeData.initialInvestment}
          baseRevenue={financeData.annualSalesGoal}
          baseCost={(financeData.monthlyFixedCosts + financeData.monthlyVariableCosts) * 12}
          wacc={financeData.discountRate}
          onExport={(simResults) => {
            updateSection('organizacion', 'rentabilidad', 'simulacion_montecarlo', simResults.conclusion);
            alert('¡Conclusiones de la simulación de Monte Carlo exportadas con éxito al plan de negocios!');
          }}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings className="w-5 h-5 text-accent" /> Parámetros Manuales
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Inversión ($)</label>
                      <input type="number" className="form-control" disabled={!!activeCorrida} value={financeData.initialInvestment} onChange={(e) => handleDataChange('initialInvestment', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Ventas Año 1 ($)</label>
                      <input type="number" className="form-control" disabled={!!activeCorrida} value={financeData.annualSalesGoal} onChange={(e) => handleDataChange('annualSalesGoal', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Costos Fijos ($)</label>
                      <input type="number" className="form-control" disabled={!!activeCorrida} value={financeData.monthlyFixedCosts} onChange={(e) => handleDataChange('monthlyFixedCosts', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Crecimiento (%)</label>
                      <input type="number" className="form-control" disabled={!!activeCorrida} value={financeData.annualSalesGrowth} onChange={(e) => handleDataChange('annualSalesGrowth', e.target.value)} />
                    </div>
                  </div>
                  {activeCorrida && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                      Los parámetros están bloqueados porque la corrida XLS está activa. Usa "datos manuales" para editarlos.
                    </p>
                  )}
                  <button className="btn btn-primary w-full mt-4" onClick={() => runCalculations(activeCorrida)}>
                    <RefreshCw className="w-4 h-4" /> {activeCorrida ? 'Sincronizar corrida' : 'Recalcular'}
                  </button>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Análisis IA</h3>
                    <button
                      onClick={() => setActiveExpertField({ key: 'analisis_ejecutivo', label: isEstados ? 'Análisis de Estados Financieros' : 'Análisis de Rentabilidad' })}
                      className="btn btn-ia"
                      style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                    >
                      <Calculator className="w-3 h-3" /> <span>Redactar</span>
                    </button>
                  </div>
                  <textarea
                    className="form-control"
                    style={{ minHeight: '130px', fontSize: '0.85rem' }}
                    placeholder={isEstados ? 'La IA analizará estado de resultados, balance y flujo...' : 'La IA analizará TIR, VAN, ROI y punto de equilibrio...'}
                    value={planData[pillarId]?.[moduleKey]?.analisis_ejecutivo || ''}
                    onChange={(e) => updateSection(pillarId, moduleKey, 'analisis_ejecutivo', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart className="w-5 h-5 text-accent" /> Proyección de Flujo de Caja (5 Años)
                </h3>
                <CashFlowChart data={chartData} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {isEstados ? 'SALUD DEL PROYECTO (TIR)' : 'RENTABILIDAD GLOBAL'}
                </h3>
                <ProfitGauge value={Number(results?.financialMetrics?.irr || 0)} label="TIR Anual" />
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>VAN (Valor Actual Neto)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: (results?.financialMetrics?.npv || 0) > 0 ? 'var(--success-color)' : '#ef4444' }}>
                    {results ? formatCurrency(results.financialMetrics.npv || 0) : '$0.00'}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ROI Proyectado</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                    {results?.financialMetrics?.roi ? `${Number(results.financialMetrics.roi).toFixed(1)}%` : '0%'}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{isEstados ? 'Periodo de Recuperación' : 'Punto de Equilibrio'}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', marginTop: '4px' }}>
                    {(results?.financialMetrics?.paybackPeriod || '').replace(/\|/g, ' ') || 'Calculando...'}
                  </div>
                </div>
              </div>

              {!isEstados && (
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <TrendingUp size={16} /> Indicadores de Rentabilidad
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    CBR estimado: <strong>{Number(results?.financialMetrics?.cbr || 0).toFixed(2)}</strong>
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Inversión inicial: <strong>{formatCurrency(results?.netInitialInvestment || 0)}</strong>
                  </p>
                </div>
              )}

              {isEstados && (
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Wallet size={16} /> Estado Resumido
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Corrida guardada automáticamente en el módulo para exportación en vista previa.
                  </p>
                </div>
              )}
            </div>
          </div>

          {isEstados && (
            <div style={{ marginTop: '2rem', width: '100%', overflowX: 'auto' }}>
              <FinancialCharts projections={results} showTables={true} />
            </div>
          )}
        </>
      )}

      <ExpertPanel
        fieldName={activeExpertField?.label}
        currentValue={planData[pillarId]?.[moduleKey]?.[activeExpertField?.key] || ''}
        isOpen={!!activeExpertField}
        onClose={() => setActiveExpertField(null)}
        onApply={(newText) => {
          updateSection(pillarId, moduleKey, activeExpertField.key, newText);
          setActiveExpertField(null);
        }}
        aiConfig={planData.config?.ai}
        planData={planData}
      />
    </div>
  );
}
