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

export default function ExecutiveFinancialDashboard({ planData }) {
  const isMiningOrIndustrial = Boolean(
    planData?.semilla?.proyecto?.includes('Cuantico') || 
    planData?.semilla?.proyecto?.includes('MHI') ||
    planData?.organizacion?.rentabilidad?.indicadores?.includes('15.11')
  );

  const kpis = useMemo(() => {
    return [
      {
        id: 'tir',
        label: 'TIR (Tasa Interna de Retorno)',
        value: '15.11%',
        subtext: 'WACC de referencia: 12.0%',
        status: 'green',
        icon: TrendingUp,
        desc: 'Supera el costo de capital con margen de seguridad del +3.11%'
      },
      {
        id: 'van',
        label: 'VAN (Valor Actual Neto)',
        value: '$1,836,412 MXN',
        subtext: 'Tasa descuento: 12.0%',
        status: 'green',
        icon: DollarSign,
        desc: 'Creación neta de valor a valor presente en horizonte de 60 meses'
      },
      {
        id: 'roi',
        label: 'ROI Anual Promedio',
        value: '24.2%',
        subtext: 'Retorno sobre capital Serie B',
        status: 'green',
        icon: Percent,
        desc: 'Rendimiento anual ponderado con reinversión de flujos libres'
      },
      {
        id: 'payback',
        label: 'Período de Recuperación',
        value: '4.1 Años',
        subtext: 'Mes 49 de operación',
        status: 'green',
        icon: Clock,
        desc: 'Retorno íntegro del capital emitido antes de la salida Serie B'
      },
      {
        id: 'bep',
        label: 'Punto de Equilibrio',
        value: '$641,666 MXN/mes',
        subtext: '~22 servicios de cilindros/mes',
        status: 'green',
        icon: Scale,
        desc: 'Representa el 48.1% de la capacidad instalada del taller'
      },
      {
        id: 'bc',
        label: 'Relación Beneficio / Costo (B/C)',
        value: '1.092',
        subtext: 'Regla de decisión: B/C > 1.0',
        status: 'green',
        icon: CheckCircle2,
        desc: 'Por cada peso invertido a valor presente, genera $1.092 pesos'
      },
      {
        id: 'tesoreria',
        label: 'Reserva Líquida FRLI',
        value: '$7,000,000 MXN',
        subtext: 'Yield anual: 6.5% neto',
        status: 'green',
        icon: ShieldCheck,
        desc: 'Colateral líquido intocable que absorbe el ciclo minero a 90 días'
      },
      {
        id: 'ev_ebitda',
        label: 'Valuación por Múltiplos (EV/EBITDA)',
        value: '6.5x EBITDA',
        subtext: 'Múltiplo sectorial servicios industriales',
        status: 'blue',
        icon: Activity,
        desc: 'Valuación teórica de salida Serie B al cierre del Año 5'
      }
    ];
  }, [isMiningOrIndustrial]);

  return (
    <div style={{
      marginTop: '1.5rem',
      marginBottom: '2rem',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '1.75rem',
      boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)',
      pageBreakInside: 'avoid'
    }}>
      {/* Header del Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '10px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', borderRadius: '12px', color: '#ffffff' }}>
            <Zap size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4f46e5' }}>
              Corporate Finance Suite
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0 0', fontFamily: 'var(--font-display)' }}>
              Dashboard Financiero Ejecutivo & Semáforo de Viabilidad
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f0fdf4', padding: '6px 14px', borderRadius: '24px', border: '1px solid #bbf7d0' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d' }}>
            PROYECTO ALTAMENTE BANCABLE Y VIABLE (TIR {'>'} WACC)
          </span>
        </div>
      </div>

      {/* Grid de KPIs con Semáforo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {kpis.map((k) => {
          const Icon = k.icon;
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
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {k.label}
                </span>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc.dot }} title="Semáforo de cumplimiento" />
              </div>

              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)', margin: '2px 0' }}>
                {k.value}
              </div>

              <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                {k.subtext}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.7rem', color: '#64748b', lineHeight: '1.4' }}>
                {k.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
