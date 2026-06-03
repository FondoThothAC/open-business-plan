import React, { useState, useEffect, useMemo } from 'react';
import { usePlan } from '../context/PlanContext';
import { Sparkles, Package, TrendingUp, CreditCard, Calculator, RotateCcw, Activity, Gauge, ArrowUpRight, ArrowDownRight, Minus, Brain } from 'lucide-react';
import { generateSingleField } from '../lib/ai';
import ExpertPanel from './ExpertPanel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Mini Gauge SVG Component
const MiniGauge = ({ value, max = 100, color = 'var(--accent-color)', size = 60 }) => {
  const normalized = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = 22;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - normalized / 100);

  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 60 38">
      <path d="M 8 35 A 22 22 0 0 1 52 35" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" />
      <path d="M 8 35 A 22 22 0 0 1 52 35" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
    </svg>
  );
};

// Trend Indicator
const TrendIcon = ({ status }) => {
  if (status === 'positive') return <ArrowUpRight style={{ width: 14, height: 14, color: 'var(--success-color)' }} />;
  if (status === 'negative') return <ArrowDownRight style={{ width: 14, height: 14, color: 'var(--danger-color)' }} />;
  return <Minus style={{ width: 14, height: 14, color: 'var(--text-secondary)' }} />;
};

export default function ModuloOperaciones({ title, description }) {
  const { planData, updateSection } = usePlan();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeExpertField, setActiveExpertField] = useState(null);
  const [editAnalysis, setEditAnalysis] = useState(false);

  // Initialize data from planData or defaults
  const data = planData.tecnico?.operativa || {
    pedidosTiempo: 950,
    pedidosTotales: 1000,
    empleados: 10,
    costoMercancias: 500000,
    inventarioPromedio: 100000,
    inventarioActual: 80000,
    cuentasCobrar: 50000,
    cuentasPagar: 40000,
    ventasAnuales: 1000000
  };

  const [kpis, setKpis] = useState({
    otd: 0,
    rotacion: 0,
    dso: 0,
    dpo: 0,
    ccc: 0,
    dio: 0
  });

  const calculateKpis = (vals) => {
    const safeVals = {
      pedidosTiempo: Number(vals.pedidosTiempo) || 0,
      pedidosTotales: Number(vals.pedidosTotales) || 0,
      costoMercancias: Number(vals.costoMercancias) || 0,
      inventarioPromedio: Number(vals.inventarioPromedio) || 0,
      inventarioActual: Number(vals.inventarioActual) || 0,
      cuentasCobrar: Number(vals.cuentasCobrar) || 0,
      cuentasPagar: Number(vals.cuentasPagar) || 0,
      ventasAnuales: Number(vals.ventasAnuales) || 0
    };

    const otd = safeVals.pedidosTotales > 0 ? (safeVals.pedidosTiempo / safeVals.pedidosTotales) * 100 : 0;
    const rotacion = safeVals.inventarioPromedio > 0 ? safeVals.costoMercancias / safeVals.inventarioPromedio : 0;
    const dso = safeVals.ventasAnuales > 0 ? (safeVals.cuentasCobrar / safeVals.ventasAnuales) * 365 : 0;
    const dpo = safeVals.costoMercancias > 0 ? (safeVals.cuentasPagar / safeVals.costoMercancias) * 365 : 0;
    const dio = safeVals.costoMercancias > 0 ? (safeVals.inventarioActual / safeVals.costoMercancias) * 365 : 0;
    const ccc = dio + dso - dpo;

    setKpis({ otd, rotacion, dso, dpo, ccc, dio });
  };

  useEffect(() => {
    calculateKpis(data);
  }, [data]);

  const getKpiStatus = (key, value) => {
    switch(key) {
      case 'otd': return value >= 95 ? 'positive' : value >= 90 ? 'warning' : 'negative';
      case 'dso': return value <= 30 ? 'positive' : value <= 45 ? 'warning' : 'negative';
      case 'ccc': return value <= 30 ? 'positive' : value <= 60 ? 'warning' : 'negative';
      case 'rotacion': return value >= 6 ? 'positive' : value >= 3 ? 'warning' : 'negative';
      default: return 'neutral';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'positive': return 'var(--success-color)';
      case 'negative': return 'var(--danger-color)';
      case 'warning': return '#f59e0b';
      default: return 'var(--text-primary)';
    }
  };

  const handleChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    updateSection('tecnico', 'operativa', field, numValue);
  };

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Actúa como Gerente de Operaciones para el negocio "${planData.config?.brandKit?.companyName || 'Proyecto'}".
      Estimación de métricas operativas realistas para este tipo de negocio.
      Devuelve SOLO un JSON con estas claves numéricas: pedidosTiempo, pedidosTotales, empleados, costoMercancias, inventarioPromedio, inventarioActual, cuentasCobrar, cuentasPagar, ventasAnuales.`;
      
      const result = await generateSingleField(planData.config.ai, 'operativa_data', 'Métricas Operativas', { desc: prompt }, planData);
      
      if (result && typeof result === 'object') {
        Object.entries(result).forEach(([key, val]) => {
          updateSection('tecnico', 'operativa', key, val);
        });
      }
    } catch (error) {
      console.error("Error generating AI metrics:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetData = () => {
    if (!window.confirm('¿Reiniciar las métricas operativas?')) return;
    const defaults = {
      pedidosTiempo: 950,
      pedidosTotales: 1000,
      empleados: 10,
      costoMercancias: 500000,
      inventarioPromedio: 100000,
      inventarioActual: 80000,
      cuentasCobrar: 50000,
      cuentasPagar: 40000,
      ventasAnuales: 1000000
    };
    Object.entries(defaults).forEach(([key, val]) => {
      updateSection('tecnico', 'operativa', key, val);
    });
  };

  // Overall health score
  const healthScore = useMemo(() => {
    let score = 0;
    if (kpis.otd >= 95) score += 25; else if (kpis.otd >= 90) score += 15;
    if (kpis.rotacion >= 6) score += 25; else if (kpis.rotacion >= 3) score += 15;
    if (kpis.dso <= 30) score += 25; else if (kpis.dso <= 45) score += 15;
    if (kpis.ccc <= 30) score += 25; else if (kpis.ccc <= 60) score += 15;
    return score;
  }, [kpis]);

  const healthLabel = healthScore >= 80 ? 'Excelente' : healthScore >= 60 ? 'Buena' : healthScore >= 40 ? 'Regular' : 'Crítica';
  const healthColor = healthScore >= 80 ? 'var(--success-color)' : healthScore >= 60 ? '#f59e0b' : 'var(--danger-color)';

  const formatNum = (n) => new Intl.NumberFormat('es-MX').format(Math.round(n));

  return (
    <div className="module-view animate-fade-in">
      {/* Header */}
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="view-title">{title}</h1>
          <p className="text-secondary mt-1">{description}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={resetData} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            <RotateCcw style={{ width: 14, height: 14 }} />
            <span>Reset</span>
          </button>
          <button className={`btn btn-ia ${isGenerating ? 'animate-pulse' : ''}`} onClick={handleAiGenerate} disabled={isGenerating}>
            <Sparkles style={{ width: 16, height: 16 }} />
            <span>{isGenerating ? 'Estimando...' : 'IA: Estimar'}</span>
          </button>
        </div>
      </div>

      {/* Dashboard Grid: 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        
        {/* LEFT COLUMN: KPIs + Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* KPI Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            {[
              { key: 'otd', label: 'Entregas OTD', value: kpis.otd, suffix: '%', icon: Package, max: 100 },
              { key: 'rotacion', label: 'Rotación Inv.', value: kpis.rotacion, suffix: 'x', icon: TrendingUp, max: 12 },
              { key: 'dso', label: 'DSO (Cobro)', value: kpis.dso, suffix: 'd', icon: CreditCard, max: 90 },
              { key: 'dpo', label: 'DPO (Pago)', value: kpis.dpo, suffix: 'd', icon: CreditCard, max: 90 },
              { key: 'ccc', label: 'Ciclo CCC', value: kpis.ccc, suffix: 'd', icon: Activity, max: 120 },
            ].map((kpi, idx) => {
              const status = getKpiStatus(kpi.key, kpi.value);
              const color = getStatusColor(status);
              return (
                <div key={kpi.key} className="glass-panel" style={{
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.08}s both`
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: color, opacity: 0.8 }} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <MiniGauge value={kpi.value} max={kpi.max} color={color} />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    {kpi.value.toFixed(kpi.key === 'rotacion' ? 1 : 0)}{kpi.suffix}
                    <TrendIcon status={status} />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginTop: '0.4rem' }}>
                    {kpi.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Input Sections */}
          <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Package style={{ width: 18, height: 18, color: '#6366f1' }} /> Logística y Entregas
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { key: 'pedidosTiempo', label: 'Pedidos a Tiempo' },
                { key: 'pedidosTotales', label: 'Pedidos Totales' },
                { key: 'empleados', label: 'Total Empleados' },
              ].map(f => (
                <div key={f.key}>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>{f.label}</label>
                  <input type="number" className="form-control" style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                    value={data[f.key]} onChange={(e) => handleChange(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(180deg, #10b981, #34d399)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <TrendingUp style={{ width: 18, height: 18, color: '#10b981' }} /> Gestión de Inventarios
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { key: 'costoMercancias', label: 'Costo Mercancías (CMV)' },
                { key: 'inventarioPromedio', label: 'Inventario Promedio' },
                { key: 'inventarioActual', label: 'Inventario Actual' },
              ].map(f => (
                <div key={f.key}>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>{f.label}</label>
                  <input type="number" className="form-control" style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                    value={data[f.key]} onChange={(e) => handleChange(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(180deg, #f59e0b, #fbbf24)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CreditCard style={{ width: 18, height: 18, color: '#f59e0b' }} /> Ciclo Financiero
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { key: 'cuentasCobrar', label: 'Cuentas por Cobrar' },
                { key: 'cuentasPagar', label: 'Cuentas por Pagar' },
                { key: 'ventasAnuales', label: 'Ventas Anuales' },
              ].map(f => (
                <div key={f.key}>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>{f.label}</label>
                  <input type="number" className="form-control" style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                    value={data[f.key]} onChange={(e) => handleChange(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Health + Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Health Score Gauge */}
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '1rem' }}>
              Salud Operativa
            </h3>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <svg width="160" height="100" viewBox="0 0 200 120">
                <defs>
                  <linearGradient id="health-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
                <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="url(#health-grad)" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={Math.PI * 80}
                  strokeDashoffset={Math.PI * 80 * (1 - healthScore / 100)}
                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                <text x="100" y="90" textAnchor="middle" fill="var(--text-primary)" fontSize="28" fontWeight="900" fontFamily="var(--font-display)">
                  {healthScore}%
                </text>
                <text x="100" y="112" textAnchor="middle" fill={healthColor} fontSize="11" fontWeight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {healthLabel}
                </text>
              </svg>
            </div>
          </div>

          {/* KPI Detail Cards */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '1rem' }}>
              Detalle de Indicadores
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'OTD (On-Time Delivery)', value: `${kpis.otd.toFixed(1)}%`, status: getKpiStatus('otd', kpis.otd), desc: 'Meta: ≥95%' },
                { label: 'Rotación de Inventario', value: `${kpis.rotacion.toFixed(1)}x`, status: getKpiStatus('rotacion', kpis.rotacion), desc: 'Meta: ≥6x/año' },
                { label: 'DSO (Días de Cobro)', value: `${kpis.dso.toFixed(0)} días`, status: getKpiStatus('dso', kpis.dso), desc: 'Meta: ≤30 días' },
                { label: 'DPO (Días de Pago)', value: `${kpis.dpo.toFixed(0)} días`, status: 'neutral', desc: 'Referencia' },
                { label: 'DIO (Días Inventario)', value: `${kpis.dio.toFixed(0)} días`, status: 'neutral', desc: 'Referencia' },
                { label: 'Ciclo de Efectivo (CCC)', value: `${kpis.ccc.toFixed(0)} días`, status: getKpiStatus('ccc', kpis.ccc), desc: 'Meta: ≤30 días' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0.75rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  transition: 'all 0.2s ease'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                  <div style={{
                    fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                    color: getStatusColor(item.status),
                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                  }}>
                    {item.value}
                    {item.status !== 'neutral' && <TrendIcon status={item.status} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis Box */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="field-header">
              <h3 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, margin: 0 }}>
                Análisis IA
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setEditAnalysis(!editAnalysis)}
                  className="btn btn-secondary" 
                  style={{ padding: '4px 8px', fontSize: '0.65rem' }}
                >
                  {editAnalysis ? 'Visualizar' : 'Editar'}
                </button>
                <button
                  onClick={() => setActiveExpertField({ key: 'analisis_operativo', label: 'Análisis Operativo' })}
                  className="btn btn-ia"
                  style={{ padding: '4px 10px', fontSize: '0.65rem' }}
                >
                  <Brain style={{ width: 12, height: 12 }} /> <span>Redactar</span>
                </button>
              </div>
            </div>
            {editAnalysis ? (
              <textarea
                className="form-control"
                style={{ minHeight: '120px', fontSize: '0.8rem', resize: 'vertical' }}
                placeholder="La IA analizará tus métricas OTD, rotación, DSO/DPO y ciclo de efectivo..."
                value={planData.tecnico?.operativa?.analisis_operativo || ''}
                onChange={(e) => updateSection('tecnico', 'operativa', 'analisis_operativo', e.target.value)}
              />
            ) : (
              <div className="preview-box" style={{ minHeight: '120px', padding: '1rem' }} onClick={() => setEditAnalysis(true)}>
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {planData.tecnico?.operativa?.analisis_operativo || '*Sin análisis. Haz clic en "Redactar" para que la IA analice tus métricas.*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Formula Reference */}
          <div style={{
            padding: '1rem 1.25rem', borderRadius: '12px',
            background: 'rgba(0,0,0,0.15)', border: '1px dashed rgba(255,255,255,0.08)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem',
            color: 'var(--text-secondary)', lineHeight: 1.8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--accent-color)', fontWeight: 700, fontSize: '0.7rem' }}>
              <Calculator style={{ width: 12, height: 12 }} /> FÓRMULAS
            </div>
            OTD = Pedidos Tiempo / Totales × 100<br />
            Rotación = CMV / Inv. Promedio<br />
            DSO = (CxC / Ventas) × 365<br />
            DPO = (CxP / CMV) × 365<br />
            DIO = (Inv. Actual / CMV) × 365<br />
            <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>CCC = DIO + DSO − DPO</span>
          </div>
        </div>
      </div>

      <ExpertPanel 
        fieldName={activeExpertField?.label}
        currentValue={planData.tecnico?.operativa?.[activeExpertField?.key] || ''}
        isOpen={!!activeExpertField}
        onClose={() => setActiveExpertField(null)}
        onApply={(newText) => {
          updateSection('tecnico', 'operativa', activeExpertField.key, newText);
          setActiveExpertField(null);
        }}
        aiConfig={planData.config?.ai}
        planData={planData}
      />
    </div>
  );
}
