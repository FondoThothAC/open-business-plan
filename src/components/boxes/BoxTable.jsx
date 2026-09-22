import { Table } from 'lucide-react';

/**
 * Componente BoxTable - Renderiza tablas estructuradas (Catálogo CSI, Resumen Ejecutivo, etc.)
 * Totalmente adaptado al tema claro/oscuro del sistema
 */
export function BoxTable({ definition = {}, values = {} }) {
  const plan = values.planData || {};
  const semilla = plan.semilla || {};
  const negocio = semilla.negocio || {};
  const fin = plan.finanzas || plan.simulador_financiero || plan.finanzas_agiles || {};
  const dictamen = plan.resumen_ejecutivo?.dictamen_viabilidad || {};
  const text = (...items) => items.find(v => typeof v === 'string' && v.trim()) || 'Pendiente de definir';
  const money = (v) => Number.isFinite(Number(v)) ? `$${Number(v).toLocaleString('es-MX')} MXN` : null;
  const financial = [
    money(fin.capex ?? fin.inversionInicial ?? plan.organizacion?.inversion?.total_inversion),
    fin.tir != null ? `TIR: ${fin.tir}%` : null,
    money(fin.van ?? fin.npv ?? dictamen.van),
    fin.payback != null ? `Payback: ${fin.payback} años` : null
  ].filter(Boolean).join(' | ') || 'Pendiente de calcular con el modelo financiero del proyecto';
  const generatedRows = [
    { concepto: '1. Oportunidad y Problema', valor: text(semilla.problema, negocio.problema, plan.problema) },
    { concepto: '2. Solución', valor: text(semilla.solucion, negocio.que_es, plan.solucion) },
    { concepto: '3. Mercado Objetivo', valor: text(semilla.mercado_objetivo, plan.mercado?.segmento, plan.mercado?.descripcion) },
    { concepto: '4. Viabilidad Financiera', valor: financial }
  ];
  const rows = definition.id === 'box_resumen_ejecutivo_1p' ? generatedRows : (values.rows || generatedRows);

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
