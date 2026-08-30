import { Gauge, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Componente BoxBenchmark - Renderiza indicadores de desempeño con semáforo y rangos de industria
 */
export function BoxBenchmark({ definition = {}, values = {} }) {
  const kpis = values.kpis || [
    { label: 'Margen Bruto Objetivo', val: '40.0%', status: 'Saludable', isOk: true, benchmark: '25% - 45% (Sector Industrial)' },
    { label: 'Ratio LTV / CAC', val: '5.0x', status: 'Excelente (>=3x)', isOk: true, benchmark: 'Mínimo 3.0x (SaaS / B2B)' },
    { label: 'On-Time Delivery (OTD)', val: '98.5%', status: 'Nivel Tier 1', isOk: true, benchmark: '>= 95.0% Minería' },
    { label: 'Ciclo Conversión Efectivo (CCC)', val: '45 días', status: 'Eficiente', isOk: true, benchmark: '<= 60 días' }
  ];

  return (
    <div style={{
      background: 'var(--card-bg, #1e293b)',
      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(168,85,247,0.15)', borderRadius: '8px', color: '#c084fc' }}>
            <Gauge size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #f8fafc)', fontWeight: 600 }}>
              {definition.title || 'Tablero de Benchmarks y KPIs de Industria'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              Fuente: {definition.source?.book || 'Benchmarks Oficiales'} ({definition.source?.page || ''})
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              {kpi.label}
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: kpi.isOk ? '#34d399' : '#f59e0b', marginBottom: '6px' }}>
              {kpi.val}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: kpi.isOk ? '#10b981' : '#f59e0b' }}>
              {kpi.isOk ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              <span>{kpi.status}</span>
            </div>
            <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>
              Ref: {kpi.benchmark}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
