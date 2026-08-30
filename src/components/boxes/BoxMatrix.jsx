import { Grid3X3, ShieldAlert } from 'lucide-react';

/**
 * Componente BoxMatrix - Renderiza matrices bidimensionales (FODA, Porter 5F, ZOPP 4x4, Matriz X)
 */
export function BoxMatrix({ definition = {}, values = {} }) {
  const quadrants = values.quadrants || [
    { title: 'Fortalezas (Internas)', items: ['Banco de pruebas propio 40k PSI', 'Personal certificado en hidráulica', 'Convenio directo con proveedores OEM'] },
    { title: 'Oportunidades (Externas)', items: ['Boom minero en Sonora 2026', 'Demanda de modelos MaaS predictivos', 'Crecimiento de contratos Tier 1'] },
    { title: 'Debilidades (Internas)', items: ['Marca nueva en el sector minero', 'Capacidad inicial limitada a 25 equipos', 'Curva de adopción del sensor IoT'] },
    { title: 'Amenazas (Externas)', items: ['Volatilidad en tipo de cambio USD/MXN', 'Competidores de mostrador con precios bajos', 'Retraso en autorizaciones de clientes'] }
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
          <div style={{ padding: '8px', background: 'rgba(245,158,11,0.15)', borderRadius: '8px', color: '#fbbf24' }}>
            <Grid3X3 size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #f8fafc)', fontWeight: 600 }}>
              {definition.title || 'Matriz Estratégica Bidimensional'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              Fuente: {definition.source?.book || 'Metodología Estratégica'} ({definition.source?.page || ''})
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {quadrants.map((q, idx) => (
          <div key={idx} style={{
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '14px'
          }}>
            <h5 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} style={{ color: idx % 2 === 0 ? '#34d399' : '#f59e0b' }} />
              {q.title}
            </h5>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
              {q.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
