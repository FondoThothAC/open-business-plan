import { Gauge, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Componente BoxBenchmark - Renderiza indicadores de desempeño con semáforo y rangos de industria
 * Totalmente adaptado al tema claro/oscuro del sistema
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
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e4e4e7)',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(168,85,247,0.12)', borderRadius: '8px', color: '#9333ea' }}>
            <Gauge size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>
              {definition.title || 'Tablero de Benchmarks y KPIs de Industria'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
              Fuente: {definition.source?.book || 'Benchmarks Oficiales'} ({definition.source?.page || ''})
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))',
            border: '1px solid var(--border-color, #e4e4e7)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #71717a)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              {kpi.label}
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: kpi.isOk ? '#10b981' : '#f59e0b', marginBottom: '6px' }}>
              {kpi.val}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: kpi.isOk ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
              {kpi.isOk ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              <span>{kpi.status}</span>
            </div>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary, #71717a)', marginTop: '4px' }}>
              Ref: {kpi.benchmark}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
