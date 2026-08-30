import { useState } from 'react';
import { Target, Compass, Layers, CheckCircle2 } from 'lucide-react';

/**
 * BoxMatrizX - Matriz X de Hoshin Kanri (Japón - Despliegue de Políticas)
 * 4 Cuadrantes: Norte Verdadero (3-5a), Objetivos Anuales, Proyectos de Mejora, KPIs / Métricas.
 * Totalmente adaptado al tema claro/oscuro del sistema
 */
export function BoxMatrizX({ definition = {}, values = {}, onChange = () => {} }) {
  const defaultData = {
    norteVerdadero: values.norteVerdadero || ['Liderazgo en servicio MaaS predictivo en minería', 'Margen EBITDA > 30% sostenido', 'Cero accidentes laborales y 99.5% uptime'],
    objetivosAnuales: values.objetivosAnuales || ['Captar 20 contratos corporativos anuales', 'Certificación ISO 9001 / ISO 14001', 'Reducción de costos de refaccionamiento en 15%'],
    proyectosClave: values.proyectosClave || ['Despliegue de sensores IoT LoRaWAN', 'Programa de capacitación y semillero técnico', 'Alianza estratégica con proveedores directos'],
    kpisMetricas: values.kpisMetricas || ['Facturación recurrente ($M MXN)', 'NPS de satisfacción de planta (>= 90)', 'Tiempo Medio entre Fallas (MTBF > 500 hrs)']
  };

  const [data, setData] = useState(defaultData);

  const updateQuadrant = (quadrant, index, value) => {
    const nextList = [...data[quadrant]];
    nextList[index] = value;
    const nextData = { ...data, [quadrant]: nextList };
    setData(nextData);
    onChange(nextData);
  };

  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e4e4e7)',
      borderRadius: '12px',
      padding: '24px',
      margin: '20px 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.12)', borderRadius: '10px', color: '#8b5cf6' }}>
            <Compass size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>
              {definition.title || 'Matriz X de Hoshin Kanri (Alineación Estratégica 4 Cuadrantes)'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
              Fuente: {definition.source?.book || 'Hoshin Kanri for the Lean Enterprise'} ({definition.source?.page || 'Ch. 3'})
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Cuadrante 1: Norte Verdadero */}
        <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', border: '1px solid var(--border-color, #e4e4e7)', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#8b5cf6', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={16} /> 1. Norte Verdadero (3-5 Años)
          </h5>
          {data.norteVerdadero.map((item, idx) => (
            <input
              key={idx}
              type="text"
              className="form-control"
              style={{ fontSize: '0.8rem', marginBottom: '8px' }}
              value={item}
              onChange={(e) => updateQuadrant('norteVerdadero', idx, e.target.value)}
            />
          ))}
        </div>

        {/* Cuadrante 2: Objetivos Anuales */}
        <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', border: '1px solid var(--border-color, #e4e4e7)', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#3b82f6', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} /> 2. Objetivos Anuales (Tácticos)
          </h5>
          {data.objetivosAnuales.map((item, idx) => (
            <input
              key={idx}
              type="text"
              className="form-control"
              style={{ fontSize: '0.8rem', marginBottom: '8px' }}
              value={item}
              onChange={(e) => updateQuadrant('objetivosAnuales', idx, e.target.value)}
            />
          ))}
        </div>

        {/* Cuadrante 3: Proyectos de Mejora */}
        <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', border: '1px solid var(--border-color, #e4e4e7)', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#10b981', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> 3. Prioridades / Proyectos
          </h5>
          {data.proyectosClave.map((item, idx) => (
            <input
              key={idx}
              type="text"
              className="form-control"
              style={{ fontSize: '0.8rem', marginBottom: '8px' }}
              value={item}
              onChange={(e) => updateQuadrant('proyectosClave', idx, e.target.value)}
            />
          ))}
        </div>

        {/* Cuadrante 4: KPIs / Métricas */}
        <div style={{ background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))', border: '1px solid var(--border-color, #e4e4e7)', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={16} /> 4. KPIs y Métricas de Control
          </h5>
          {data.kpisMetricas.map((item, idx) => (
            <input
              key={idx}
              type="text"
              className="form-control"
              style={{ fontSize: '0.8rem', marginBottom: '8px' }}
              value={item}
              onChange={(e) => updateQuadrant('kpisMetricas', idx, e.target.value)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
