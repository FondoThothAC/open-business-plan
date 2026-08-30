import { useState } from 'react';
import { CheckSquare, Check, Square } from 'lucide-react';

/**
 * Componente BoxChecklist - Renderiza listas de verificación interactivas (TRL 1-9, DNSH, Legal)
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
      background: 'var(--card-bg, #1e293b)',
      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(56,189,248,0.15)', borderRadius: '8px', color: '#38bdf8' }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #f8fafc)', fontWeight: 600 }}>
              {definition.title || 'Lista de Verificación y Madurez (Checklist)'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              Fuente: {definition.source?.book || 'Estándar de Calidad'} ({definition.source?.page || ''})
            </span>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>
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
              background: item.done ? 'rgba(56,189,248,0.06)' : 'rgba(15,23,42,0.5)',
              border: `1px solid ${item.done ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.05)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ color: item.done ? '#38bdf8' : '#64748b' }}>
              {item.done ? <Check size={16} /> : <Square size={16} />}
            </div>
            <span style={{
              fontSize: '0.85rem',
              color: item.done ? '#f1f5f9' : '#94a3b8',
              textDecoration: item.done ? 'none' : 'none'
            }}>
              {item.label || item.tarea || item.obj}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
