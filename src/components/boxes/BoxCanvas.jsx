import { useState } from 'react';
import { CanvasBuilder } from '../../lib/tools/canvas/CanvasBuilder.js';
import { LayoutGrid, Sparkles } from 'lucide-react';

/**
 * Componente BoxCanvas - Renderiza lienzos Canvas interactivos (Lean / Classic / Micro)
 */
export function BoxCanvas({ definition = {}, values = {}, onChange = () => {}, mode = 'classic' }) {
  const resolvedMode = mode || CanvasBuilder.resolveModeForDocType();
  const blocks = CanvasBuilder.getBlockDefinitions(resolvedMode);
  const [activeBlock, setActiveBlock] = useState(null);

  const handleTextChange = (key, text) => {
    const nextValues = { ...values, [key]: text };
    onChange(nextValues);
  };

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
          <div style={{ padding: '8px', background: 'rgba(99,102,241,0.15)', borderRadius: '8px', color: '#818cf8' }}>
            <LayoutGrid size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #f8fafc)', fontWeight: 600 }}>
              {definition.title || 'Lienzo de Modelo de Negocio (Canvas)'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              Modo: <strong style={{ color: '#818cf8', textTransform: 'capitalize' }}>{resolvedMode}</strong> | Fuente: {definition.source?.book || 'Metodología Estándar'} ({definition.source?.page || ''})
            </span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: resolvedMode === 'micro' ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        {blocks.map(block => {
          const val = values[block.key] || '';
          const isSelected = activeBlock === block.key;

          return (
            <div
              key={block.key}
              onClick={() => setActiveBlock(block.key)}
              style={{
                background: isSelected ? 'rgba(99,102,241,0.08)' : 'rgba(15,23,42,0.6)',
                border: `1px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '140px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? '#a5b4fc' : '#cbd5e1' }}>
                  {block.title}
                </span>
                {val && <Sparkles size={12} style={{ color: '#10b981' }} />}
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.72rem', color: '#64748b' }}>
                {block.desc}
              </p>
              <textarea
                value={val}
                onChange={(e) => handleTextChange(block.key, e.target.value)}
                placeholder="Escribe los puntos clave..."
                style={{
                  width: '100%',
                  flex: 1,
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: '0.82rem',
                  padding: '8px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
