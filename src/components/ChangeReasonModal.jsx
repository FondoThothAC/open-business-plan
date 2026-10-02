import { useState } from 'react';
import { Check, X, Sparkles, AlertCircle } from 'lucide-react';

/**
 * @file ChangeReasonModal.jsx
 * @description Modal de captura de motivos de modificación o regeneración con IA.
 * Permite a los alumnos y docentes documentar por qué se altera un módulo
 * (ej. "No calculó bien el CAC", "Población mal definida", "Texto demasiado largo")
 * para registrarlo en el historial del módulo y alimentar la telemetría del harness de IA.
 * 
 * [UXDD] Diseño interactivo con chips rápidos y campo de notas.
 * [SDD] Canal de calibración de prompts y algoritmos.
 */
export default function ChangeReasonModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  moduleName = 'Módulo',
  actionType = 'modificacion' // 'regenerar' | 'desbloquear' | 'modificacion'
}) {
  const [selectedTag, setSelectedTag] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const COMMON_REASONS = [
    { id: 'cac_incorrecto', label: 'No calculó bien el CAC', color: '#f59e0b' },
    { id: 'poblacion_mal_definida', label: 'Población mal definida', color: '#ef4444' },
    { id: 'texto_extenso', label: 'Texto demasiado largo', color: '#3b82f6' },
    { id: 'finanzas_irreales', label: 'Datos financieros irreales', color: '#10b981' },
    { id: 'falta_detalle_tecnico', label: 'Faltó detalle técnico/procesos', color: '#8b5cf6' },
    { id: 'competencia_incompleta', label: 'Competencia incompleta', color: '#ec4899' },
    { id: 'ajuste_manual', label: 'Ajuste manual del equipo', color: '#06b6d4' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTag && !customComment.trim()) return;

    setIsSubmitting(true);
    try {
      onConfirm({
        reasonTag: selectedTag || 'ajuste_manual',
        userComment: customComment.trim()
      });
      setSelectedTag('');
      setCustomComment('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleAction = actionType === 'regenerar' 
    ? 'Regeneración con IA' 
    : actionType === 'desbloquear' 
      ? 'Desbloqueo de Módulo' 
      : 'Modificación del Módulo';

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'linear-gradient(145deg, #0f172a, #1e293b)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(56, 189, 248, 0.15)',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                Motivo de {titleAction}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Módulo: <strong style={{ color: '#38bdf8' }}>{moduleName}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Explicación de valor para el alumno y docente */}
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          fontSize: '0.82rem',
          color: '#cbd5e1',
          display: 'flex',
          gap: '0.6rem',
          alignItems: 'center'
        }}>
          <AlertCircle size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />
          <span>
            Tu justificación se archivará en el historial del equipo y retroalimentará los prompts y modelos de IA para afinar su precisión.
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Etiquetas rápidas */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              ¿Qué motivó el ajuste o regeneración? (Selecciona una opción rápida):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {COMMON_REASONS.map(reason => {
                const isSelected = selectedTag === reason.id;
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedTag(isSelected ? '' : reason.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected 
                        ? `1px solid ${reason.color}` 
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isSelected 
                        ? `${reason.color}25` 
                        : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? reason.color : '#cbd5e1',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {isSelected && <Check size={13} />}
                    {reason.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campo de texto libre */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Detalles o notas adicionales para el equipo y profesor:
            </label>
            <textarea
              rows={3}
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Ej: El CAC calculado de $150 MXN es muy alto para Hermosillo. Debería rondar los $45 MXN según el estudio de mercado..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.84rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!selectedTag && !customComment.trim())}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                background: (!selectedTag && !customComment.trim())
                  ? 'rgba(56, 189, 248, 0.2)'
                  : 'linear-gradient(135deg, #38bdf8, #818cf8)',
                border: 'none',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: (!selectedTag && !customComment.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={16} />
              Confirmar y Proceder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
