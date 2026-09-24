import React, { useState } from 'react';
import { X, Search, History, Sparkles, Send, CheckCircle2, User, Clock, Brain, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { getBoxBadgeLabel, getBoxHistory } from '../lib/boxIdManager';

export default function BoxTrajectoryModal({
  isOpen,
  onClose,
  boxDef = {},
  boxData = {},
  planData = {},
  onSendToBob = () => {},
  onApplyManualCorrection = () => {}
}) {
  if (!isOpen || !boxDef?.id) return null;

  const [activeTab, setActiveTab] = useState('trajectory'); // 'trajectory' | 'history' | 'correct'
  const [correctionText, setCorrectionText] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const boxBadge = getBoxBadgeLabel(boxDef.id);
  const history = getBoxHistory(planData, boxDef.id);
  const trajectory = boxData._trajectory || planData[boxDef.pillar]?.[boxDef.moduleKey]?._trace || null;

  // Extraer fragmentos RAG asociados o del documento estructurado
  const ragDocs = (planData.config?.documents || []).filter(d => d.classification === 'project_evidence');

  const handleApply = async () => {
    if (!correctionText.trim()) return;
    setIsApplying(true);
    try {
      await onApplyManualCorrection(boxDef.id, correctionText);
      setSuccessMsg('¡Corrección guardada y registrada en el RAG!');
      setCorrectionText('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Error al guardar');
    } finally {
      setIsApplying(false);
    }
  };

  const handleOpenBobChat = () => {
    const textToSend = correctionText.trim()
      ? `el ${boxBadge} está mal: ${correctionText.trim()}`
      : `el ${boxBadge} (${boxDef.title || boxDef.id}) está mal: `;
    onSendToBob(textToSend);
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          background: 'var(--bg-panel, #0f172a)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header Modal */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 800,
              padding: '0.3rem 0.75rem',
              borderRadius: '8px',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(99,102,241,0.4)'
            }}>
              {boxBadge}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {boxDef.title || boxDef.id}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Trazabilidad del Harness DeepSeek, Auditoría y Corrección de Hechos
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn-icon"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs de navegación */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.06))',
          background: 'rgba(0, 0, 0, 0.15)'
        }}>
          <button
            onClick={() => setActiveTab('trajectory')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'trajectory' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'trajectory' ? '#818cf8' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Search size={15} />
            <span>Trazabilidad del Harness</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'history' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'history' ? '#818cf8' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <History size={15} />
            <span>Historial de Versiones ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('correct')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'correct' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'correct' ? '#34d399' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={15} />
            <span>Corregir con BOB / Manual</span>
          </button>
        </div>

        {/* Contenido de la Pestaña Activa */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* TAB 1: TRAZABILIDAD DEL HARNESS */}
          {activeTab === 'trajectory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <Brain className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div style={{ fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Generación Asistida por DeepSeek Harness:</strong>{' '}
                  Este Box fue calculado sintetizando el contexto de la Semilla, la evidencia de la entrevista de 1 hora de Closets y Cocinas Corona y las restricciones validadas por el usuario.
                </div>
              </div>

              {/* System Prompt & Guidance */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={15} />
                  <span>Metodología Inyectada ({boxDef.source?.book || 'Estándar OBP'})</span>
                </h4>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: '#94a3b8'
                }}>
                  {boxDef.description || 'Configuración analítica basada en benchmarks de industria.'}
                  {boxDef.source && (
                    <div style={{ marginTop: '0.4rem', color: '#6366f1', fontSize: '0.75rem' }}>
                      📖 Referencia: {boxDef.source.book} ({boxDef.source.page})
                    </div>
                  )}
                </div>
              </div>

              {/* RAG Usado */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <span>Documentos de Evidencia RAG Asociados</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {ragDocs.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      No hay documentos RAG cargados para este proyecto.
                    </div>
                  ) : (
                    ragDocs.map((doc, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '0.6rem 0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem'
                      }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>📄 {doc.name}</span>
                        <span style={{
                          fontSize: '0.7rem',
                          background: doc.isImmutableConstraint ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: doc.isImmutableConstraint ? '#f59e0b' : '#34d399',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 700
                        }}>
                          {doc.isImmutableConstraint ? 'Restricción Inviolable' : 'Evidencia Real'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Valores Actuales */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Estado Actual de Datos en el Box
                </h4>
                <pre style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.75rem',
                  color: '#e2e8f0',
                  maxHeight: '160px',
                  overflowY: 'auto'
                }}>
                  {JSON.stringify(boxData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORIAL DE VERSIONES (AUDIT TRAIL) */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem'
                }}>
                  <History size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p>Aún no hay versiones registradas para este Box.</p>
                  <p style={{ fontSize: '0.75rem' }}>Cualquier cambio o corrección asistida por IA quedará registrado aquí con autor y timestamp.</p>
                </div>
              ) : (
                [...history].reverse().map((ver, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                        Versión {ver.version} — {ver.changeReason || 'Actualización'}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        background: ver.isAi ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: ver.isAi ? '#818cf8' : '#34d399'
                      }}>
                        {ver.isAi ? '🤖 IA DeepSeek' : '👤 Manual'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <User size={12} /> {ver.author}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} /> {new Date(ver.timestamp).toLocaleString('es-MX')}
                      </span>
                    </div>

                    {ver.promptUsed && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                        <strong>Prompt / Instrucción:</strong> {ver.promptUsed}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: CORREGIR CON BOB / MANUAL */}
          {activeTab === 'correct' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5'
              }}>
                <strong style={{ color: '#34d399' }}>Feedback Loop "Correction-as-Evidence":</strong>{' '}
                Escribe la instrucción o el hecho real que debe modificarse en este Box. Al guardar, se aplicará el cambio y se añadirá automáticamente al documento inmutable de RAG para que ninguna generación futura lo contradiga.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Instrucción de Corrección para {boxBadge}
                </label>
                <textarea
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  placeholder={`Ejemplo: El box ${boxBadge} está mal: la residencia está en planta alta y el taller en planta baja, y pagan $6,000 de CFE juntos sin medidor comercial separado...`}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {successMsg && (
                <div style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  onClick={handleOpenBobChat}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    fontSize: '0.85rem'
                  }}
                >
                  <Send size={14} />
                  <span>Pedirle a BOB en el Chat</span>
                </button>

                <button
                  onClick={handleApply}
                  disabled={isApplying || !correctionText.trim()}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>{isApplying ? 'Guardando en RAG...' : 'Guardar y Blindar en RAG'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
