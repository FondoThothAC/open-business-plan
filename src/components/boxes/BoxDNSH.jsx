import { useState } from 'react';
import { Leaf, ShieldCheck } from 'lucide-react';

/**
 * BoxDNSH - Evaluación del Principio Do No Significant Harm (DNSH) de la Unión Europea / Horizon Europe
 * Totalmente adaptado al tema claro/oscuro del sistema
 */
export function BoxDNSH({ definition = {}, values = {}, onChange = () => {} }) {
  const defaultObjectives = [
    { id: 'mitigacion', title: '1. Mitigación del cambio climático', status: 'cumple', detalle: 'Cero emisiones directas de CO2 o reducción certificada con energía solar/limpia.' },
    { id: 'adaptacion', title: '2. Adaptación al cambio climático', status: 'cumple', detalle: 'Resiliencia ante eventos climáticos extremos y planes de contingencia hídrica.' },
    { id: 'agua', title: '3. Uso sostenible y protección de recursos hídricos y marinos', status: 'cumple', detalle: 'Sistemas de circuito cerrado, recirculación y cero vertidos contaminantes.' },
    { id: 'circular', title: '4. Transición a una economía circular (incluye reciclaje)', status: 'cumple', detalle: 'Reacondicionamiento de piezas, overhauls y diseño para durabilidad extendida.' },
    { id: 'contaminacion', title: '5. Prevención y control de la contaminación', status: 'cumple', detalle: 'Disposición certificada de residuos peligrosos (aceites y solventes bajo NOM/UE).' },
    { id: 'biodiversidad', title: '6. Protección y restauración de la biodiversidad y ecosistemas', status: 'cumple', detalle: 'Operación sin impacto en áreas protegidas ni fragmentación de hábitats.' }
  ];

  const [objectives, setObjectives] = useState(values.objectives || defaultObjectives);

  const updateStatus = (index, newStatus) => {
    const next = objectives.map((obj, i) => i === index ? { ...obj, status: newStatus } : obj);
    setObjectives(next);
    onChange({ objectives: next });
  };

  const updateDetalle = (index, text) => {
    const next = objectives.map((obj, i) => i === index ? { ...obj, detalle: text } : obj);
    setObjectives(next);
    onChange({ objectives: next });
  };

  const cumpleCount = objectives.filter(o => o.status === 'cumple').length;
  const scorePct = Math.round((cumpleCount / objectives.length) * 100);

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
          <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.12)', borderRadius: '10px', color: '#10b981' }}>
            <Leaf size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>
              {definition.title || 'Evaluación de Principio DNSH (Do No Significant Harm — UE)'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
              Fuente: {definition.source?.book || 'Taxonomía Verde Europea (Reglamento UE 2020/852)'} ({definition.source?.page || 'Criterios Técnicos'})
            </span>
          </div>
        </div>
        <div style={{
          padding: '6px 14px',
          borderRadius: '20px',
          background: scorePct === 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          color: scorePct === 100 ? '#10b981' : '#f59e0b',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={16} />
          DNSH Score: {scorePct}%
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #71717a)', marginBottom: '16px', lineHeight: '1.4' }}>
        El principio <strong>DNSH</strong> exige demostrar que las actividades del proyecto no causan daño significativo a ninguno de los 6 objetivos climáticos y medioambientales de la Unión Europea.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {objectives.map((obj, idx) => (
          <div key={obj.id} style={{
            background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))',
            border: '1px solid var(--border-color, #e4e4e7)',
            borderRadius: '8px',
            padding: '12px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary, #09090b)', fontSize: '0.9rem' }}>
                {obj.title}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => updateStatus(idx, 'cumple')}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    border: '1px solid #10b981',
                    background: obj.status === 'cumple' ? '#10b981' : 'transparent',
                    color: obj.status === 'cumple' ? '#fff' : '#10b981'
                  }}
                >
                  ✓ Cumple
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(idx, 'mitigacion')}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    border: '1px solid #f59e0b',
                    background: obj.status === 'mitigacion' ? '#f59e0b' : 'transparent',
                    color: obj.status === 'mitigacion' ? '#fff' : '#f59e0b'
                  }}
                >
                  ⚡ En Mitigación
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(idx, 'no_aplica')}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    border: '1px solid #94a3b8',
                    background: obj.status === 'no_aplica' ? '#94a3b8' : 'transparent',
                    color: obj.status === 'no_aplica' ? '#fff' : '#64748b'
                  }}
                >
                  N/A
                </button>
              </div>
            </div>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              value={obj.detalle}
              onChange={(e) => updateDetalle(idx, e.target.value)}
              placeholder="Detalle de justificación técnica o medidas de salvaguarda..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}
