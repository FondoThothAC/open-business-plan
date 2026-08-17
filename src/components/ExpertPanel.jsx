import { useEffect, useMemo, useRef, useState } from 'react';
import { BrainCircuit, Sparkles, TrendingUp, ShieldCheck, Cpu, Zap, X, Trash2, AlertTriangle, Terminal, MessageSquare, Check, RefreshCw } from 'lucide-react';
import { generateExpertSuggestion } from '../lib/ai';

export default function ExpertPanel({ fieldName, currentValue, onApply, isOpen, onClose, aiConfig, planData }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeExpertId, setActiveExpertId] = useState(null);
  const abortRef = useRef(null);
  const panelRef = useRef(null);
  const streamEndRef = useRef(null);

  const experts = useMemo(() => ([
    { id: 'marketing', name: 'Experto en Marketing', icon: TrendingUp, color: '#ec4899', role: 'Experto en marketing (conversión, posicionamiento, propuesta de valor)' },
    { id: 'finance', name: 'Experto Financiero', icon: ShieldCheck, color: '#10b981', role: 'Experto financiero (unit economics, supuestos, riesgos, métricas)' },
    { id: 'tech', name: 'Experto Técnico', icon: Cpu, color: '#6366f1', role: 'Experto técnico y procesos (operación, escalabilidad, eficiencia, KPIs)' }
  ]), []);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    abortRef.current?.abort?.();
    abortRef.current = null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);

    setTimeout(() => panelRef.current?.focus?.(), 0);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
      abortRef.current?.abort?.();
      abortRef.current = null;
    };
  }, [isOpen, onClose]);

  // Scroll to bottom when suggestions change or loading starts
  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [suggestions, loading]);

  const getSuggestion = async (expert) => {
    if (loading) return;
    if (!fieldName) return;
    if (!aiConfig) {
      setError('Configura IA en Configuración para usar la Mesa de Expertos.');
      return;
    }
    if (!currentValue || currentValue.trim().length < 10) {
      setError('Agrega un poco más de texto (mín. ~10 caracteres) para poder mejorarlo.');
      return;
    }

    setError('');
    setLoading(true);
    setActiveExpertId(expert.id);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const text = await generateExpertSuggestion(aiConfig, {
        expertRole: expert.role,
        fieldLabel: fieldName,
        currentValue,
        planData
      });
      if (controller.signal.aborted) return;
      const entry = { ...expert, text, id: `${Date.now()}_${Math.random().toString(16).slice(2)}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setSuggestions(prev => [...prev, entry]);
    } catch (e) {
      if (!controller.signal.aborted) setError(e?.message || 'No se pudo generar sugerencia.');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setActiveExpertId(null);
      }
    }
  };

  const runOrchestrator = async () => {
    if (loading) return;
    if (!fieldName) return;
    if (!aiConfig) {
      setError('Configura IA en Configuración para usar la Mesa de Expertos.');
      return;
    }
    if (!currentValue || currentValue.trim().length < 10) {
      setError('Agrega un poco más de texto (mín. ~10 caracteres) para poder mejorarlo.');
      return;
    }

    setError('');
    setLoading(true);
    setActiveExpertId('orchestrator');
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // 1. Crítico
      const criticRole = "Eres un inversor escéptico y despiadado. Encuentra los 3 peores defectos lógicos, financieros o de mercado en el siguiente texto y destruye sus argumentos. Sé breve.";
      const criticText = await generateExpertSuggestion(aiConfig, { expertRole: criticRole, fieldLabel: fieldName, currentValue, planData });
      if (controller.signal.aborted) return;
      setSuggestions(prev => [...prev, { name: 'Agente Crítico', icon: Sparkles, color: '#ef4444', text: criticText, id: Date.now() + 'c', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

      // 2. Creativo
      const creativeRole = "Eres un visionario en marketing y ventas. Lee el texto original y piensa en cómo venderlo de forma innovadora o qué propuesta de valor disruptiva le añadirías. Sé breve.";
      const creativeText = await generateExpertSuggestion(aiConfig, { expertRole: creativeRole, fieldLabel: fieldName, currentValue, planData });
      if (controller.signal.aborted) return;
      setSuggestions(prev => [...prev, { name: 'Agente Innovador', icon: TrendingUp, color: '#f59e0b', text: creativeText, id: Date.now() + 'i', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

      // 3. Orquestador
      const orchestratorRole = `Eres el Orquestador final. Mejora el texto original usando la CRÍTICA ("${criticText}") para arreglar los errores, y la INNOVACIÓN ("${creativeText}") para hacerlo más atractivo. Redacta el resultado final perfecto y profesional.`;
      const finalText = await generateExpertSuggestion(aiConfig, { expertRole: orchestratorRole, fieldLabel: fieldName, currentValue, planData });
      if (controller.signal.aborted) return;
      setSuggestions(prev => [...prev, { name: 'Veredicto Final (Orquestador)', icon: BrainCircuit, color: '#8b5cf6', text: finalText, id: Date.now() + 'o', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      
    } catch (e) {
      if (!controller.signal.aborted) setError(e?.message || 'Error en la orquestación.');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setActiveExpertId(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="expert-panel-overlay no-print"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{ 
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, 
        background: 'rgba(5, 5, 10, 0.65)', backdropFilter: 'blur(8px)', zIndex: 1000, 
        display: 'flex', justifyContent: 'flex-end' 
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Mesa de Expertos"
        className="expert-panel glass-panel"
        style={{ 
          width: '450px', height: '100%', borderRadius: 0, 
          padding: '1.5rem', display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid var(--border-color)',
          background: 'rgba(10, 12, 22, 0.95)',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Panel Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-color), #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
            }}>
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Mesa de Expertos</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }}></span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Agentes Conectados</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <button
              onClick={() => { setSuggestions([]); setError(''); }}
              className="icon-btn-rounded"
              title="Limpiar sugerencias"
              disabled={loading || suggestions.length === 0}
              style={{ padding: '8px', color: 'var(--text-secondary)' }}
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
            <button onClick={onClose} className="icon-btn-rounded" title="Cerrar (Esc)" style={{ padding: '8px', color: 'var(--text-secondary)' }}><X className="w-4.5 h-4.5" /></button>
          </div>
        </div>

        {/* Input Scope Scope Description */}
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Terminal className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-color)' }}>Foco de Optimización</span>
          </div>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fieldName}</p>
        </div>

        {/* Action / Expert Select Grid */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, marginBottom: '0.6rem' }}>
            Consultar Opinión Profesional
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            {experts.map(expert => {
              const isCurrent = activeExpertId === expert.id;
              return (
                <button 
                  key={expert.id}
                  onClick={() => getSuggestion(expert)}
                  className="expert-button glass-panel"
                  disabled={loading}
                  style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', 
                    gap: '0.4rem', padding: '0.75rem 0.5rem', borderRadius: '12px',
                    background: isCurrent ? `${expert.color}18` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isCurrent ? expert.color : 'rgba(255,255,255,0.06)'}`,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: loading && !isCurrent ? 0.5 : 1,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {isCurrent && (
                    <span style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: expert.color
                    }} />
                  )}
                  <expert.icon className={`w-5 h-5 ${isCurrent ? 'animate-bounce' : ''}`} style={{ color: expert.color }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textAlign: 'center', color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {expert.name.split(' ')[1]}
                  </span>
                  {isCurrent ? (
                    <span style={{ fontSize: '0.55rem', color: expert.color, fontWeight: 800, letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Zap className="w-2.5 h-2.5 animate-pulse" /> PENSANDO
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>DISPONIBLE</span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={runOrchestrator}
            className="btn btn-primary w-full mt-3"
            disabled={loading}
            style={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              padding: '0.65rem',
              display: 'flex', justifyContent: 'center', gap: '0.5rem',
              opacity: loading && activeExpertId !== 'orchestrator' ? 0.5 : 1
            }}
          >
            {activeExpertId === 'orchestrator' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span style={{ fontWeight: 800, letterSpacing: '0.05em' }}>
              {activeExpertId === 'orchestrator' ? 'ORQUESTANDO DEBATE...' : 'INICIAR MESA REDONDA (MoE)'}
            </span>
          </button>

          {error && (
            <div style={{
              display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
              padding: '0.85rem', borderRadius: '10px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', marginTop: '1rem', fontSize: '0.8rem', lineHeight: 1.35
            }}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{error}</div>
            </div>
          )}
        </div>

        {/* Chat / suggestion stream */}
        <div style={{ 
          flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem',
          padding: '0.5rem 0.25rem', borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0, 0, 0, 0.15)', borderRadius: '12px', marginBottom: '0.5rem'
        }}>
          {suggestions.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', opacity: 0.4, margin: 'auto' }}>
              <MessageSquare className="w-10 h-10 text-secondary" style={{ margin: '0 auto', marginBottom: '0.75rem', opacity: 0.6 }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Mesa de debate inactiva</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                Selecciona un experto arriba para obtener una propuesta de redacción mejorada.
              </p>
            </div>
          )}

          {suggestions.map((s) => (
            <div 
              key={s.id} 
              className="suggestion-card" 
              style={{ 
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
                padding: '1rem', borderRadius: '16px', 
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid rgba(255,255,255,0.05)`,
                borderLeft: `3px solid ${s.color}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <s.icon className="w-3 h-3" style={{ color: s.color }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.name}</span>
                </div>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{s.timestamp}</span>
              </div>
              <div style={{ 
                fontSize: '0.85rem', lineHeight: '1.55', color: 'var(--text-secondary)',
                background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.02)', fontFamily: 'var(--font-main)'
              }}>
                {s.text}
              </div>
              <button 
                onClick={() => onApply(s.text)}
                className="btn btn-primary" 
                style={{ 
                  marginTop: '0.35rem', width: '100%', fontSize: '0.75rem', height: '32px', padding: 0,
                  background: s.color, boxShadow: `0 4px 10px ${s.color}25`
                }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aplicar esta mejora</span>
              </button>
            </div>
          ))}

          {loading && (
            <div style={{ 
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
              padding: '1rem', borderRadius: '16px', 
              background: 'rgba(255,255,255,0.01)',
              border: '1px dashed rgba(255,255,255,0.08)',
              animation: 'pulse 1.5s infinite'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} className="animate-pulse" />
                <div style={{ width: 80, height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} className="animate-pulse" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                <div style={{ width: '100%', height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                <div style={{ width: '90%', height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                <div style={{ width: '60%', height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
              </div>
            </div>
          )}
          <div ref={streamEndRef} />
        </div>
      </div>
    </div>
  );
}
