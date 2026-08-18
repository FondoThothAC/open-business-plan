import { useState } from 'react';
import { HelpCircle, Sparkles, Send, CheckCircle, Mic, ArrowRight } from 'lucide-react';

export default function GrillMePromptModal({ promptData, onSubmitResponse, onCancel }) {
  if (!promptData) return null;

  const [selectedKey, setSelectedKey] = useState(null);
  const [customText, setCustomText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isSubmitting) return;

    let finalResponse = '';
    if (selectedKey) {
      const opt = promptData.options?.find(o => o.key === selectedKey);
      finalResponse = opt ? opt.text : selectedKey;
      if (customText.trim()) {
        finalResponse += ` (Detalle adicional: ${customText.trim()})`;
      }
    } else if (customText.trim()) {
      finalResponse = customText.trim();
    } else {
      return;
    }

    setIsSubmitting(true);
    onSubmitResponse(finalResponse);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '560px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '2px solid #6366f1',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
            <HelpCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mesa de Expertos · Human-in-the-Loop
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
              El Agente requiere tu confirmación
            </h3>
          </div>
        </div>

        <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.5', marginBottom: '1.5rem', fontWeight: 600, background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          "{promptData.question}"
        </p>

        {/* Opciones interactivas estilo Grill-Me */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {promptData.options?.map(opt => {
            const isSelected = selectedKey === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedKey(isSelected ? null : opt.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: `2px solid ${isSelected ? '#6366f1' : '#e2e8f0'}`,
                  background: isSelected ? 'rgba(99, 102, 241, 0.06)' : '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: isSelected ? '#6366f1' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem'
                }}>
                  {opt.key}
                </div>
                <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: isSelected ? 700 : 500, flex: 1 }}>
                  {opt.text}
                </span>
                {isSelected && <CheckCircle size={18} color="#6366f1" />}
              </button>
            );
          })}
        </div>

        {/* Campo de respuesta libre / detalle personalizado */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            O escribe / detalla tu respuesta personalizada:
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Escribe tu indicación específica o complementa la opción elegida..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            >
              Omitir / Asumir Default
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={(!selectedKey && !customText.trim()) || isSubmitting}
            style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>Enviar Decisión al Agente</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
