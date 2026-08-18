import React from 'react';
import { Compass, Target, CheckCircle2, TrendingUp, Users } from 'lucide-react';

/**
 * Widget Visual e Interactivo para Metodología Hoshin Kanri:
 * Renderiza la Matriz X de Alineación Estratégica en 4 cuadrantes interconectados:
 * 1. Sur: Objetivos a Largo Plazo (3-5 años)
 * 2. Oeste: Metas Anuales Tácticas
 * 3. Norte: Prioridades y Proyectos de Mejora
 * 4. Este: Métricas Clave (KPIs) y Responsables
 */
export default function XMatrixHoshinKanri({
  objetivosLargoPlazo = [
    'Liderazgo en cuota de mercado regional (>30%)',
    'Margen EBITDA superior al 25%',
    'Excelencia operativa y cero defectos en entregas'
  ],
  metasAnuales = [
    'Incrementar ventas un 40% en el año en curso',
    'Reducir tiempo de ciclo de producción a la mitad',
    'Obtener certificación de calidad ISO 9001'
  ],
  proyectosMejora = [
    'Automatización de línea principal y digitalización',
    'Campaña de marketing omnicanal y retención',
    'Reingeniería de compras y negociación con proveedores'
  ],
  metricasResponsables = [
    { kpi: 'Crecimiento de Ingresos Mensuales', meta: '+3.5% MoM', responsable: 'Director Comercial' },
    { kpi: 'Tiempo de Entrega (OTD)', meta: '>98.5%', responsable: 'Gerente de Operaciones' },
    { kpi: 'NPS de Clientes', meta: '>75 pts', responsable: 'Líder de Calidad' }
  ]
}) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}>
          <Compass className="w-4 h-4" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Matriz X de Alineación Estratégica (Hoshin Kanri)
          </h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Despliegue integral de directrices: de la visión a largo plazo a los proyectos y responsables del día a día.
          </p>
        </div>
      </div>

      {/* Grid de Cuadrantes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Cuadrante 1: Objetivos a Largo Plazo (Sur) */}
        <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#818cf8', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Compass className="w-4 h-4" />
            1. Objetivos a Largo Plazo (3-5 Años)
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {objetivosLargoPlazo.map((obj, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* Cuadrante 2: Metas Anuales (Oeste) */}
        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#34d399', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Target className="w-4 h-4" />
            2. Metas Anuales (Tácticas)
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {metasAnuales.map((meta, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {meta}
              </li>
            ))}
          </ul>
        </div>

        {/* Cuadrante 3: Proyectos de Mejora (Norte) */}
        <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <TrendingUp className="w-4 h-4" />
            3. Prioridades y Proyectos de Mejora
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {proyectosMejora.map((proy, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {proy}
              </li>
            ))}
          </ul>
        </div>

        {/* Cuadrante 4: Métricas y Responsables (Este) */}
        <div style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#f472b6', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Users className="w-4 h-4" />
            4. Métricas Clave y Responsables
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {metricasResponsables.map((item, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.kpi}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>
                  <span>Meta: <strong style={{ color: '#34d399' }}>{item.meta}</strong></span>
                  <span>Resp: <strong>{item.responsable}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
