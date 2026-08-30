import React, { useState, useEffect } from 'react';
import { X, Save, AlignLeft, Lightbulb, TrendingUp, Quote, CheckSquare, Sparkles } from 'lucide-react';

export default function PromptEditor({ isOpen, onClose, fieldLabel, fieldKey, promptData, onSave }) {
  const [draft, setDraft] = useState({
    instruccion: '',
    ejemplo: '',
    benchmark: '',
    cita: '',
    placeholder: ''
  });

  useEffect(() => {
    if (isOpen && promptData) {
      setDraft({
        instruccion: promptData.instruccion || '',
        ejemplo: promptData.ejemplo || '',
        benchmark: promptData.benchmark || '',
        cita: promptData.cita || '',
        placeholder: promptData.placeholder || ''
      });
    }
  }, [isOpen, promptData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const fieldStyle = {
    marginBottom: '1.25rem'
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem'
  };

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 1040,
          animation: 'fadeIn 0.2s ease-out'
        }} 
      />
      
      <div 
        className="glass-panel"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '400px',
          maxWidth: '90vw',
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
          boxShadow: '-5px 0 25px rgba(0,0,0,0.2)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99, 102, 241, 0.05)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)' }}>
              <Sparkles className="w-5 h-5" />
              Editor de Prompt
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Campo: <strong>{fieldLabel}</strong>
            </p>
          </div>
          <button className="icon-btn-rounded" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          
          <div style={fieldStyle}>
            <label style={labelStyle}>
              <AlignLeft className="w-4 h-4 text-blue-400" />
              Instrucción Principal (Obligatorio)
            </label>
            <textarea
              className="form-control"
              rows={4}
              value={draft.instruccion}
              onChange={(e) => setDraft({...draft, instruccion: e.target.value})}
              placeholder="Ej: Explica detalladamente en qué consiste la innovación tecnológica..."
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Ejemplo (Recomendado)
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={draft.ejemplo}
              onChange={(e) => setDraft({...draft, ejemplo: e.target.value})}
              placeholder='Ej: "Algoritmo de visión artificial basado en redes neuronales..."'
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Benchmark / Regla
            </label>
            <input
              type="text"
              className="form-control"
              value={draft.benchmark}
              onChange={(e) => setDraft({...draft, benchmark: e.target.value})}
              placeholder="Ej: LTV debe ser >= 3x CAC"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              <Quote className="w-4 h-4 text-purple-400" />
              Cita / Referencia
            </label>
            <input
              type="text"
              className="form-control"
              value={draft.cita}
              onChange={(e) => setDraft({...draft, cita: e.target.value})}
              placeholder="Ej: The Lean Startup (p. 89)"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              <CheckSquare className="w-4 h-4 text-orange-400" />
              Placeholder UI
            </label>
            <input
              type="text"
              className="form-control"
              value={draft.placeholder}
              onChange={(e) => setDraft({...draft, placeholder: e.target.value})}
              placeholder="Texto temporal que ve el usuario antes de escribir"
            />
          </div>

        </div>

        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'rgba(0,0,0,0.1)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save className="w-4 h-4" />
            Guardar Prompt
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
