import { Table } from 'lucide-react';

/**
 * Componente BoxTable - Renderiza tablas estructuradas (Catálogo CSI, Resumen Ejecutivo, etc.)
 */
export function BoxTable({ definition = {}, values = {} }) {
  const rows = values.rows || [
    { concepto: '1. Oportunidad y Problema', valor: 'Paros no programados de $15k USD/h en maquinaria minera por fallas en mangueras.' },
    { concepto: '2. Solución MaaS', valor: 'Mantenimiento predictivo con banco de pruebas 40k PSI y telemetría IoT en tiempo real.' },
    { concepto: '3. Mercado Objetivo', valor: 'TAM: $180M MXN | SOM a 3 años: $18M MXN en el clúster minero de Sonora.' },
    { concepto: '4. Viabilidad Financiera', valor: 'Inversión: $20M MXN | TIR: 15.11% | VAN: $1.83M MXN | Payback: 4.1 años.' }
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
          <div style={{ padding: '8px', background: 'rgba(236,72,153,0.15)', borderRadius: '8px', color: '#f472b6' }}>
            <Table size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #f8fafc)', fontWeight: 600 }}>
              {definition.title || 'Estructura Tabular Ejecutiva'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              Fuente: {definition.source?.book || 'Formato Estructurado'} ({definition.source?.page || ''})
            </span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
              <th style={{ padding: '10px', color: '#cbd5e1', width: '30%' }}>Sección / Dimensión</th>
              <th style={{ padding: '10px', color: '#cbd5e1' }}>Detalle Estratégico</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '10px', fontWeight: 600, color: '#f1f5f9' }}>{row.concepto || row.codigo}</td>
                <td style={{ padding: '10px', color: '#94a3b8' }}>{row.valor || row.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
