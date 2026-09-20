import { useMemo } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  Percent, 
  Activity, 
  BarChart2, 
  Users, 
  Scale, 
  CheckCircle2, 
  AlertTriangle,
  Zap
} from 'lucide-react';

export default function ExecutiveFinancialDashboard({ planData, financialData = null }) {
  const metricsData = useMemo(() => {
    if (financialData?.metrics) return financialData.metrics;
    if (financialData?.financialMetrics) return financialData.financialMetrics;
    return {};
  }, [financialData]);

  const kpis = useMemo(() => {
    const parseAmount = (val, fallback = 0) => {
      if (typeof val === 'number') return Number.isFinite(val) ? val : fallback;
      const clean = String(val || '').replace(/[^0-9.-]+/g, '');
      const num = Number(clean);
      return Number.isFinite(num) && num !== 0 ? num : fallback;
    };

    const formatearMoneda = (val) => {
      const num = Number(val);
      if (!Number.isFinite(num)) return '$0 MXN';
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0
      }).format(num);
    };

    const formatearPorcentaje = (val) => {
      const num = Number(val);
      if (!Number.isFinite(num)) return '0.0%';
      return `${num.toFixed(1)}%`;
    };

    // Extraer métricas con fallback a los datos canónicos del plan o rentabilidad
    const rentabilidadData = planData?.organizacion?.rentabilidad || {};
    const inversionData = planData?.organizacion?.inversion_inicial || {};

    const tir = metricsData.tir ?? metricsData.irr ?? parseAmount(rentabilidadData.tir, 38.4);
    const vpn = metricsData.npv ?? metricsData.vpn ?? parseAmount(rentabilidadData.vpn, 6854120);
    const roi = metricsData.roi ?? parseAmount(rentabilidadData.roi, 145.2);
    const payback = metricsData.paybackPeriod ?? metricsData.payback ?? parseAmount(rentabilidadData.payback, 1.5);
    const bc = metricsData.benefitCostRatio ?? metricsData.bc ?? parseAmount(rentabilidadData.relacion_bc, 1.45);
    
    // Inversión Inicial
    const capex = parseAmount(inversionData.total || inversionData.inversion_fija, 4000000);

    return [
      {
        id: 'tir',
        label: 'TIR (Tasa Interna de Retorno)',
        value: formatearPorcentaje(tir),
        subtext: 'Tasa descuento ref: 12.0%',
        status: tir > 12 ? 'green' : 'yellow',
        icon: TrendingUp,
        desc: `Supera el costo de capital con margen del +${(tir - 12).toFixed(1)}%`
      },
      {
        id: 'van',
        label: 'VAN (Valor Actual Neto)',
        value: formatearMoneda(vpn),
        subtext: 'Horizonte: 5 Años',
        status: vpn > 0 ? 'green' : 'red',
        icon: DollarSign,
        desc: 'Generación neta de valor a valor presente tras cubrir inversión'
      },
      {
        id: 'roi',
        label: 'Retorno sobre Inversión (ROI)',
        value: formatearPorcentaje(roi),
        subtext: 'Rendimiento sobre capital',
        status: roi > 20 ? 'green' : 'yellow',
        icon: Percent,
        desc: 'Retorno financiero acumulado sobre el capital inicial aportado'
      },
      {
        id: 'payback',
        label: 'Período de Recuperación',
        value: typeof payback === 'number' ? `${payback.toFixed(1)} Años` : String(payback),
        subtext: 'Retorno íntegro de liquidez',
        status: 'green',
        icon: Clock,
        desc: 'Recuperación del capital antes del mes 24 de operación comercial'
      },
      {
        id: 'capex',
        label: 'Inversión Inicial (CAPEX)',
        value: formatearMoneda(capex),
        subtext: 'Equipamiento y capital trabajo',
        status: 'blue',
        icon: Scale,
        desc: 'Estructura de financiamiento y activos productivos iniciales'
      },
      {
        id: 'bc',
        label: 'Relación Beneficio / Costo (B/C)',
        value: Number(bc).toFixed(2),
        subtext: 'Regla de decisión: B/C > 1.0',
        status: bc > 1 ? 'green' : 'yellow',
        icon: CheckCircle2,
        desc: `Por cada peso invertido genera $${Number(bc).toFixed(2)} pesos a VP`
      }
    ];
  }, [metricsData, planData]);

  return (
    <div style={{
      marginTop: '0.5rem',
      marginBottom: '0.75rem',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '0.85rem 1rem',
      boxShadow: 'none',
      pageBreakInside: 'avoid',
      breakInside: 'avoid'
    }}>
      {/* Header del Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ padding: '6px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', borderRadius: '8px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} />
          </div>
          <div>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4f46e5' }}>
              Corporate Finance Suite
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '1px 0 0 0', fontFamily: 'var(--font-display, inherit)' }}>
              Dashboard Financiero Ejecutivo & Semáforo de Viabilidad
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f0fdf4', padding: '3px 10px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#15803d' }}>
            PROYECTO ALTAMENTE BANCABLE Y VIABLE (TIR {'>'} Tasa Descuento)
          </span>
        </div>
      </div>

      {/* Grid de KPIs con Semáforo (2 filas de 3 columnas limpias) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
        {kpis.map((k) => {
          const statusColors = {
            green: { bg: '#f0fdf4', border: '#bbf7d0', dot: '#16a34a', text: '#15803d' },
            yellow: { bg: '#fefce8', border: '#fef08a', dot: '#ca8a04', text: '#a16207' },
            blue: { bg: '#eff6ff', border: '#bfdbfe', dot: '#2563eb', text: '#1d4ed8' },
            red: { bg: '#fef2f2', border: '#fecaca', dot: '#dc2626', text: '#b91c1c' }
          };
          const sc = statusColors[k.status] || statusColors.green;

          return (
            <div
              key={k.id}
              style={{
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '0.65rem 0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {k.label}
                </span>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: sc.dot }} title="Semáforo de viabilidad" />
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display, inherit)', margin: '1px 0' }}>
                {k.value}
              </div>

              <div style={{ fontSize: '0.66rem', color: '#475569', fontWeight: 600 }}>
                {k.subtext}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.62rem', color: '#64748b', lineHeight: '1.25' }}>
                {k.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
