import { useState } from 'react';
import { Check, X, RefreshCw, Sparkles, MessageSquare, Eye, Layers } from 'lucide-react';
import DiffViewer from './DiffViewer';

/**
 * Modal interactivo para revisión visual de diferencias (Diff) y control de cambios generado por IA.
 * Permite al usuario comparar el texto previo contra la nueva propuesta,
 * aceptar el cambio, descartarlo o proporcionar instrucciones adicionales para una nueva iteración.
 */
export default function DiffReviewModal({
  isOpen,
  onClose,
  fieldLabel = '',
  oldText = '',
  newText = '',
  comments = [],
  onAccept,
  onIterate,
  isIterating = false
}) {
  const [activeTab, setActiveTab] = useState('diff'); // 'diff', 'sideBySide', 'newOnly'
  const [iterationFeedback, setIterationFeedback] = useState('');

  if (!isOpen) return null;

  const handleIterate = () => {
    if (!iterationFeedback.trim()) return;
    if (onIterate) {
      onIterate(iterationFeedback.trim());
      setIterationFeedback('');
    }
  };

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-panel, #1e1e2d)',
          borderRadius: '16px',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary, #fff)' }}>
                Control de Cambios y Revisión Editorial
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>
                Campo: <strong style={{ color: 'var(--accent-color, #6366f1)' }}>{fieldLabel}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Selector de Vista */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '3px',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))'
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('diff')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'diff' ? 'var(--accent-color, #6366f1)' : 'transparent',
                  color: activeTab === 'diff' ? '#fff' : 'var(--text-secondary, #94a3b8)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Layers className="w-3.5 h-3.5" />
                Diferencias (Diff)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sideBySide')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'sideBySide' ? 'var(--accent-color, #6366f1)' : 'transparent',
                  color: activeTab === 'sideBySide' ? '#fff' : 'var(--text-secondary, #94a3b8)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Eye className="w-3.5 h-3.5" />
                Lado a Lado
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-icon"
              style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumen de Notas y Comentarios Aplicados */}
        {comments && comments.length > 0 && (
          <div
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(99, 102, 241, 0.08)',
              borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}
          >
            <MessageSquare className="w-4 h-4 text-accent" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary, #fff)' }}>
              <span style={{ fontWeight: 600 }}>Instrucciones procesadas por la IA: </span>
              {comments.map((c, i) => (
                <span key={i} style={{ fontStyle: 'italic', color: 'var(--text-secondary, #cbd5e1)' }}>
                  "{c.text}"{i < comments.length - 1 ? ' | ' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contenido Central: Vista de Comparación */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {activeTab === 'diff' ? (
            <div>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', display: 'flex', gap: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#4ade80', borderRadius: '2px', display: 'inline-block' }}></span>
                  Texto propuesto / insertado
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#f87171', borderRadius: '2px', display: 'inline-block' }}></span>
                  Texto previo / reemplazado
                </span>
              </div>
              <DiffViewer oldText={oldText} newText={newText} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary, #94a3b8)' }}>
                  Versión Actual
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                    background: 'rgba(0, 0, 0, 0.2)',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-secondary, #94a3b8)',
                    maxHeight: '380px',
                    overflowY: 'auto'
                  }}
                >
                  {oldText || <em style={{ color: 'var(--text-muted, #64748b)' }}>Sin contenido previo</em>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-color, #6366f1)' }}>
                  Propuesta IA Refinada
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    background: 'rgba(99, 102, 241, 0.03)',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-primary, #fff)',
                    maxHeight: '380px',
                    overflowY: 'auto'
                  }}
                >
                  {newText}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección Inferior: Iteración adicional y Botones de Decisión */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            background: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* Campo para Iterar */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="¿Quieres ajustar algo más? Ej: 'Hacerlo más breve y formal'..."
              value={iterationFeedback}
              onChange={(e) => setIterationFeedback(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleIterate()}
              disabled={isIterating}
              style={{
                flex: 1,
                padding: '0.6rem 0.85rem',
                fontSize: '0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff'
              }}
            />
            <button
              type="button"
              onClick={handleIterate}
              disabled={isIterating || !iterationFeedback.trim()}
              className="btn btn-secondary"
              style={{
                padding: '0.6rem 1rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: isIterating || !iterationFeedback.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isIterating ? 'animate-spin' : ''}`} />
              Re-generar con ajuste
            </button>
          </div>

          {/* Botones de Aceptar y Descartar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{
                padding: '0.6rem 1.25rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <X className="w-4 h-4" />
              Descartar Sugerencia
            </button>

            <button
              type="button"
              onClick={onAccept}
              className="btn btn-primary"
              style={{
                padding: '0.6rem 1.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderColor: '#059669',
                cursor: 'pointer'
              }}
            >
              <Check className="w-4 h-4" />
              Aceptar y Aplicar Cambio al Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
