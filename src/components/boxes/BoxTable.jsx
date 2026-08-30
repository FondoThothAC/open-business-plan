import { Table } from 'lucide-react';

/**
 * Componente BoxTable - Renderiza tablas estructuradas (Catálogo CSI, Resumen Ejecutivo, etc.)
 * Totalmente adaptado al tema claro/oscuro del sistema
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
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e4e4e7)',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(236,72,153,0.12)', borderRadius: '8px', color: '#db2777' }}>
            <Table size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>
              {definition.title || 'Estructura Tabular Ejecutiva'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
              Fuente: {definition.source?.book || 'Formato Estructurado'} ({definition.source?.page || ''})
            </span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color, #e4e4e7)', textAlign: 'left', background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))' }}>
              <th style={{ padding: '10px 14px', color: 'var(--text-primary, #09090b)', width: '30%', fontWeight: 700 }}>Sección / Dimensión</th>
              <th style={{ padding: '10px 14px', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>Detalle Estratégico</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color, #e4e4e7)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary, #09090b)' }}>{row.concepto || row.codigo}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-secondary, #71717a)' }}>{row.valor || row.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
