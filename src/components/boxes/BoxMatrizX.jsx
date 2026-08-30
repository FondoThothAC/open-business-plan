import { useState } from 'react';
import { Target, Compass, Layers, CheckCircle2 } from 'lucide-react';

/**
 * BoxMatrizX - Matriz X de Hoshin Kanri (Japón - Despliegue de Políticas)
 * 4 Cuadrantes: Norte Verdadero (3-5a), Objetivos Anuales, Proyectos de Mejora, KPIs / Métricas.
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
      background: 'var(--card-bg, #1e293b)',
      border: '1px solid rgba(139, 92, 246, 0.25)',
      borderRadius: '12px',
      padding: '24px',
      margin: '20px 0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '10px', color: '#8b5cf6' }}>
            <Compass size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary, #f8fafc)', fontWeight: 700 }}>
              {definition.title || 'Matriz X de Hoshin Kanri (Alineación Estratégica 4 Cuadrantes)'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              Fuente: {definition.source?.book || 'Hoshin Kanri for the Lean Enterprise'} ({definition.source?.page || 'Ch. 3'})
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Cuadrante 1: Norte Verdadero */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#a78bfa', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#60a5fa', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#34d399', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#fbbf24', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
