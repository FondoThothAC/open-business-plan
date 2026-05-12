import React, { useState, useEffect, useMemo } from 'react';
import { usePlan } from '../context/PlanContext';
import { calculateFinancialProjections } from '../lib/finanzas/financial-calculations';
import { Calculator, TrendingUp, DollarSign, Activity, Settings, RefreshCw, BarChart, PieChart } from 'lucide-react';
import ExpertPanel from './ExpertPanel';
import { CashFlowChart, ProfitGauge } from './FinancialCharts';

export default function ModuloFinanciero({ title, description, moduleKey, pillarId }) {
  const { planData, updateSection } = usePlan();
  
  // Extraer datos iniciales de la Semilla si existen
  const semilla = planData.semilla || {};
  const inver = semilla.finanzas?.inversion_total || '100000';
  const fijos = semilla.finanzas?.costos_fijos || '20000';
  const meta = semilla.finanzas?.meta_ingresos || '500000';
  
  // Extraer solo números de los strings de la semilla
  const parseNum = (str) => parseInt(str.toString().replace(/\D/g, '')) || 0;

  // Estado Local de Finanzas
  const [financeData, setFinanceData] = useState({
    projectDuration: 5, // Años
    taxRate: 30, // ISR
    discountRate: 12, // Tasa de descuento
    inflationRate: 4.5,
    initialInvestment: parseNum(inver),
    monthlyFixedCosts: parseNum(fijos),
    annualSalesGoal: parseNum(meta),
    monthlyVariableCosts: parseNum(fijos) * 0.3, // Asumimos un 30% variable inicialmente
    annualSalesGrowth: 15, // Crecimiento anual de ventas (%)
    annualCostGrowth: 5 // Crecimiento anual de costos (%)
  });

  const [results, setResults] = useState(null);
  const [activeExpertField, setActiveExpertField] = useState(null);

  const handleDataChange = (field, value) => {
    setFinanceData(prev => ({ ...prev, [field]: Number(value) }));
  };

  const runCalculations = () => {
    const projectData = {
      projectDuration: financeData.projectDuration,
      taxRate: financeData.taxRate,
      discountRate: financeData.discountRate,
      inflationRate: financeData.inflationRate,
      investmentItems: [
        { id: 1, name: 'Inversión Inicial Base', amount: financeData.initialInvestment, type: 'Activo' }
      ],
      depreciableAssets: [],
      recurringRevenues: [
        { 
          id: 1, 
          name: 'Ventas Proyectadas', 
          initialMonthlyAmount: financeData.annualSalesGoal / 12, 
          annualGrowthRates: Array(financeData.projectDuration).fill(financeData.annualSalesGrowth) 
        }
      ],
      recurringExpenses: [
        { 
          id: 1, 
          name: 'Costos Fijos Operativos', 
          type: 'Fijo', 
          initialMonthlyAmount: financeData.monthlyFixedCosts, 
          annualGrowthRates: Array(financeData.projectDuration).fill(financeData.annualCostGrowth) 
        },
        { 
          id: 2, 
          name: 'Costos Variables Estimados', 
          type: 'Variable', 
          initialMonthlyAmount: financeData.monthlyVariableCosts, 
          annualGrowthRates: Array(financeData.projectDuration).fill(financeData.annualCostGrowth) 
        }
      ],
      loans: [],
      payrollConfig: { positions: [], temporaryEmployees: 0, temporaryEmployeeSalary: 0, dailyMinimumWage: 250, vacationDaysPerYear: 12, vacationBonusRate: 25, socialChargesRate: 30, annualSalaryGrowthRate: 5 },
      workingCapitalConfig: { requiredMonthsOfFixedCosts: 3 },
      advancedConfig: { products: [] }
    };

    try {
      const proj = calculateFinancialProjections(projectData, 'years');
      setResults(proj);
      updateSection(pillarId, moduleKey, 'corrida_automatica', JSON.stringify(proj.financialMetrics));
    } catch (error) {
      console.error("Error al calcular:", error);
    }
  };

  useEffect(() => {
    runCalculations();
  }, []);

  // Preparar datos para el gráfico de Cash Flow
  const chartData = useMemo(() => {
    if (!results || !results.cashFlow || !Array.isArray(results.cashFlow.years)) return [];
    
    // Obtenemos el flujo acumulado y anual
    let cumulative = -financeData.initialInvestment;
    return results.cashFlow.years.map((yearFlow, index) => {
      cumulative += (yearFlow.totalInflow - yearFlow.totalOutflow);
      return {
        label: `Año ${index + 1}`,
        income: yearFlow.totalInflow,
        expense: yearFlow.totalOutflow,
        net: cumulative
      };
    });
  }, [results, financeData.initialInvestment]);

  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="module-view">
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="view-title">Dashboard Financiero Industrial</h1>
          <p className="text-secondary mt-1">Cálculos determinísticos con visualización en tiempo real.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Gráficos de Análisis */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
             <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart className="w-5 h-5 text-accent" /> Proyección de Flujo de Caja (5 Años)
            </h3>
            <CashFlowChart data={chartData} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Parámetros */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings className="w-5 h-5 text-accent" /> Parámetros
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{fontSize: '0.7rem'}}>Inversión ($)</label>
                  <input type="number" className="form-control" value={financeData.initialInvestment} onChange={(e) => handleDataChange('initialInvestment', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{fontSize: '0.7rem'}}>Ventas Año 1 ($)</label>
                  <input type="number" className="form-control" value={financeData.annualSalesGoal} onChange={(e) => handleDataChange('annualSalesGoal', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{fontSize: '0.7rem'}}>Costos Fijos ($)</label>
                  <input type="number" className="form-control" value={financeData.monthlyFixedCosts} onChange={(e) => handleDataChange('monthlyFixedCosts', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{fontSize: '0.7rem'}}>Crecimiento (%)</label>
                  <input type="number" className="form-control" value={financeData.annualSalesGrowth} onChange={(e) => handleDataChange('annualSalesGrowth', e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary w-full mt-4" onClick={runCalculations}>
                <RefreshCw className="w-4 h-4" /> Recalcular
              </button>
            </div>

            {/* Análisis IA */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Análisis IA</h3>
                <button 
                  onClick={() => setActiveExpertField({ key: 'analisis_ejecutivo', label: 'Análisis Financiero' })}
                  className="btn btn-ia" 
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                >
                  <Calculator className="w-3 h-3" /> <span>Redactar</span>
                </button>
              </div>
              <textarea 
                className="form-control"
                style={{ minHeight: '130px', fontSize: '0.85rem' }}
                placeholder="La IA analizará el VAN y TIR..."
                value={planData[pillarId]?.[moduleKey]?.analisis_ejecutivo || ''}
                onChange={(e) => updateSection(pillarId, moduleKey, 'analisis_ejecutivo', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Barra Lateral de Indicadores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>SALUD DEL PROYECTO (TIR)</h3>
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
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Periodo de Recuperación</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginTop: '4px' }}>
                {(results?.financialMetrics?.paybackPeriod || '').replace(/\|/g, ' ') || 'Calculando...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExpertPanel 
        fieldName={activeExpertField?.label}
        currentValue={planData[pillarId]?.[moduleKey]?.[activeExpertField?.key] || ''}
        isOpen={!!activeExpertField}
        onClose={() => setActiveExpertField(null)}
        onApply={(newText) => {
          updateSection(pillarId, moduleKey, activeExpertField.key, newText);
          setActiveExpertField(null);
        }}
      />
    </div>
  );
}
