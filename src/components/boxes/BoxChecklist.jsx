import { useState } from 'react';
import { CheckSquare, Check, Square } from 'lucide-react';

/**
 * Componente BoxChecklist - Renderiza listas de verificación interactivas (TRL 1-9, DNSH, Legal)
 * Totalmente adaptado al tema claro/oscuro del sistema
 */
export function BoxChecklist({ definition = {}, values = {}, onChange = () => {} }) {
  const defaultItems = [
    { id: 1, label: 'Principios y requerimientos analizados formalmente', done: true },
    { id: 2, label: 'Validación en laboratorio o prueba de concepto (PoC)', done: true },
    { id: 3, label: 'Demostración de prototipo en entorno relevante', done: true },
    { id: 4, label: 'Certificación de cumplimiento normativo y ambiental', done: false },
    { id: 5, label: 'Despliegue operativo y comercialización', done: false }
  ];

  const [items, setItems] = useState(values.items || defaultItems);

  const toggleItem = (index) => {
    const nextItems = items.map((it, i) => i === index ? { ...it, done: !it.done } : it);
    setItems(nextItems);
    onChange({ items: nextItems });
  };

  const completedCount = items.filter(i => i.done).length;
  const progressPct = Math.round((completedCount / (items.length || 1)) * 100);

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
          <div style={{ padding: '8px', background: 'rgba(56,189,248,0.12)', borderRadius: '8px', color: '#0284c7' }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>
              {definition.title || 'Lista de Verificación y Madurez (Checklist)'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
              Fuente: {definition.source?.book || 'Estándar de Calidad'} ({definition.source?.page || ''})
            </span>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7' }}>
          {completedCount}/{items.length} ({progressPct}%)
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => toggleItem(idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              background: item.done ? 'rgba(56,189,248,0.08)' : 'var(--bg-panel-hover, rgba(0,0,0,0.02))',
              border: `1px solid ${item.done ? 'rgba(56,189,248,0.3)' : 'var(--border-color, #e4e4e7)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ color: item.done ? '#0284c7' : 'var(--text-secondary, #71717a)' }}>
              {item.done ? <Check size={16} /> : <Square size={16} />}
            </div>
            <span style={{
              fontSize: '0.85rem',
              color: item.done ? 'var(--text-primary, #09090b)' : 'var(--text-secondary, #71717a)',
              fontWeight: item.done ? 600 : 400
            }}>
              {item.label || item.tarea || item.obj}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
