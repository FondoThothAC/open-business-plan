import { useState, useEffect } from 'react';
import { X, Save, AlignLeft, Lightbulb, TrendingUp, Quote, CheckSquare, Sparkles, Database, FileText, Cpu, Copy, Check } from 'lucide-react';
import { buildExternalPrompt, copyPromptToClipboard } from '../lib/promptExporter';

/**
 * Componente PromptEditor - Drawer lateral para editar los 5 campos del prompt,
 * previsualizar el contexto RAG/Semilla y copiar el prompt completo para IA externa.
 */
export default function PromptEditor({ 
  isOpen, 
  onClose, 
  fieldLabel, 
  fieldKey, 
  promptData, 
  onSave, 
  semilla = {}, 
  documents = [],
  pillar = '',
  moduleKey = '',
  moduleTitle = '',
  planData = {}
}) {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'context'
  const [copied, setCopied] = useState(false);
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
      setActiveTab('editor');
      setCopied(false);
    }
  }, [isOpen, promptData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const handleCopyExternalPrompt = async () => {
    const fullPlan = planData && Object.keys(planData).length > 0 ? planData : {
      naturaleza: { semilla },
      config: { uploadedDocuments: documents }
    };

    const textToCopy = buildExternalPrompt({
      pillar,
      moduleKey,
      moduleTitle,
      field: { key: fieldKey, label: fieldLabel },
      fieldGuide: draft,
      planData: fullPlan
    });

    const success = await copyPromptToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
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

  const hasSemilla = semilla && Object.keys(semilla).length > 0;
  const hasDocs = Array.isArray(documents) && documents.length > 0;

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
          width: '470px',
          maxWidth: '94vw',
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
          boxShadow: '-5px 0 25px rgba(0,0,0,0.2)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header con tabs */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(99, 102, 241, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)' }}>
                <Sparkles className="w-5 h-5" />
                Editor de Prompt
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Campo: <strong>{fieldLabel}</strong> {fieldKey && <span style={{ opacity: 0.6 }}>({fieldKey})</span>}
              </p>
            </div>
            <button className="icon-btn-rounded" onClick={onClose} title="Cerrar editor">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Botón destacado para Copiar Prompt con Semilla para IA Externa */}
          <div style={{ marginBottom: '0.85rem' }}>
            <button
              type="button"
              onClick={handleCopyExternalPrompt}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.55rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: copied ? '1px solid var(--success-color, #10b981)' : '1px solid rgba(99, 102, 241, 0.4)',
                background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.12)',
                color: copied ? 'var(--success-color, #10b981)' : 'var(--accent-color, #818cf8)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Copia el prompt completo con contexto de semilla, reglas de concisión y datos RAG listo para pegar en ChatGPT o Claude"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? '¡Prompt Copiado con Semilla y Referencia!' : 'Copiar Prompt para ChatGPT / Claude (con Semilla)'}
            </button>
          </div>

          {/* Selector de Pestañas */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              style={{
                flex: 1, padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                background: activeTab === 'editor' ? 'var(--accent-color, #6366f1)' : 'transparent',
                color: activeTab === 'editor' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              ✏️ 5 Textboxes del Prompt
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('context')}
              style={{
                flex: 1, padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                background: activeTab === 'context' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: activeTab === 'context' ? '#38bdf8' : 'var(--text-secondary)'
              }}
            >
              👁️ Contexto IA (RAG/Semilla)
            </button>
          </div>
        </div>

        {/* Contenido según pestaña activa */}
        {activeTab === 'editor' ? (
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
        ) : (
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '12px' }}>
              <h5 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu className="w-4 h-4" /> Contexto Continuo de Generación
              </h5>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                La IA no solo recibe el prompt anterior; antes de redactar este campo, se le inyectan automáticamente todos los datos de la <strong>Semilla</strong>, los documentos <strong>RAG</strong> anexados completos y el <strong>JSON acumulado</strong> del plan.
              </p>
            </div>

            {/* Preview Semilla */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database className="w-4 h-4" /> Semilla del Negocio {hasSemilla ? '✓' : '(Vacía)'}
              </h5>
              {hasSemilla ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(semilla.nombre_proyecto || semilla.nombreProyecto) && <div><strong>Proyecto:</strong> {semilla.nombre_proyecto || semilla.nombreProyecto}</div>}
                  {(semilla.industria || semilla.giro) && <div><strong>Industria:</strong> {semilla.industria || semilla.giro}</div>}
                  {(semilla.ubicacion || semilla.cobertura) && <div><strong>Ubicación:</strong> {semilla.ubicacion || semilla.cobertura}</div>}
                  {(semilla.monto_inversion || semilla.montoInversion) && <div><strong>Inversión:</strong> ${Number(semilla.monto_inversion || semilla.montoInversion).toLocaleString()} MXN</div>}
                  {semilla.problema && <div><strong>Problema:</strong> {semilla.problema.substring(0, 150)}...</div>}
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configura la Semilla en el inicio para darle contexto automático.</span>
              )}
            </div>

            {/* Preview Documentos RAG */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText className="w-4 h-4" /> Documentos RAG Activos ({hasDocs ? documents.length : 0})
              </h5>
              {hasDocs ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {documents.map((doc, idx) => (
                    <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '4px' }}>
                      📄 <strong>{doc.name}</strong> ({((doc.text || '').length).toLocaleString()} caracteres inyectados)
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No hay documentos PDF/TXT adicionales subidos al RAG.</span>
              )}
            </div>

          </div>
        )}

        {/* Footer */}
        {activeTab === 'editor' && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleCopyExternalPrompt}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
              title="Copiar prompt listo para IA externa"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? '¡Copiado!' : 'Copiar Prompt'}
            </button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save className="w-4 h-4" />
                Guardar Prompt
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { transform: opacity: 1; }
        }
      `}</style>
    </>
  );
}
