import { useState } from 'react';
import { Users, HeartHandshake, Shield, Sparkles } from 'lucide-react';

/**
 * BoxGuanxi - Mapa Relacional de Redes Guanxi & Preservación de Mianzi (China / Negocios Globales)
 * 3 Círculos de Confianza: Núcleo (Jiaren), Conexiones Estratégicas (Shuren), Contactos Externos (Shengren).
 */
export function BoxGuanxi({ definition = {}, values = {}, onChange = () => {} }) {
  const defaultCircles = {
    nucleo: values.nucleo || ['Equipo Fundador e Inversionistas Ángel de máxima confianza', 'Socios Industriales con trayectoria probada de 10+ años'],
    estrategicos: values.estrategicos || ['Asociación de Mineros de Sonora / AIMMGM', 'Directores de Compras y Mantenimiento de Grupos Mineros Clave', 'Autoridades de Desarrollo Económico Estatal'],
    secundarios: values.secundarios || ['Proveedores de refacciones en China / EE.UU.', 'Cámaras de Comercio Bilaterales (México-China / México-EE.UU.)']
  };

  const [circles, setCircles] = useState(defaultCircles);

  const updateCircle = (circleKey, index, text) => {
    const nextList = [...circles[circleKey]];
    nextList[index] = text;
    const next = { ...circles, [circleKey]: nextList };
    setCircles(next);
    onChange(next);
  };

  return (
    <div style={{
      background: 'var(--card-bg, #1e293b)',
      border: '1px solid rgba(239, 68, 68, 0.25)',
      borderRadius: '12px',
      padding: '24px',
      margin: '20px 0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '10px', color: '#ef4444' }}>
            <HeartHandshake size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary, #f8fafc)', fontWeight: 700 }}>
              {definition.title || 'Mapa de Redes Guanxi & Protocolo Mianzi (Relaciones Estratégicas)'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              Fuente: {definition.source?.book || 'Negotiating South-South Regional Trade Agreements'} ({definition.source?.page || 'Ch. 3'})
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        
        {/* Círculo 1: Núcleo de Confianza (Jiaren) */}
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#f87171', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={16} /> 1. Núcleo Familiar / Confianza Total (Jiaren)
          </h5>
          {circles.nucleo.map((item, idx) => (
            <textarea
              key={idx}
              rows={2}
              className="form-control"
              style={{ fontSize: '0.8rem', marginBottom: '8px' }}
              value={item}
              onChange={(e) => updateCircle('nucleo', idx, e.target.value)}
            />
          ))}
        </div>

        {/* Círculo 2: Relaciones Estratégicas y Gobierno (Shuren) */}
        <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#fbbf24', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} /> 2. Conexiones Estratégicas y Gobierno (Shuren)
          </h5>
          {circles.estrategicos.map((item, idx) => (
            <textarea
              key={idx}
              rows={2}
              className="form-control"
              style={{ fontSize: '0.8rem', marginBottom: '8px' }}
              value={item}
              onChange={(e) => updateCircle('estrategicos', idx, e.target.value)}
            />
          ))}
        </div>

        {/* Círculo 3: Red Secundaria e Internacional (Shengren) */}
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#60a5fa', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} /> 3. Red Internacional y Terceros (Shengren)
          </h5>
          {circles.secundarios.map((item, idx) => (
            <textarea
              key={idx}
              rows={2}
              className="form-control"
              style={{ fontSize: '0.8rem', marginBottom: '8px' }}
              value={item}
              onChange={(e) => updateCircle('secundarios', idx, e.target.value)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
