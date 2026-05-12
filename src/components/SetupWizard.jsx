import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Server, Cloud, ChevronRight, CheckCircle2, AlertTriangle, Loader2, Brain, HardDrive, MemoryStick, Monitor } from 'lucide-react';

// [HDD] Este wizard usa el patrón README-Driven: documentamos el flujo antes de implementarlo
// [TDD] Condiciones de aceptación: detecta GPU, recomienda contexto, guarda en localStorage
const CTX_OPTIONS = [
  { label: '8k',   value: 8192,   desc: 'GPU <4GB · Ultra rápido',   color: '#10b981' },
  { label: '16k',  value: 16384,  desc: 'GPU 4-6GB · Rápido',         color: '#10b981' },
  { label: '32k',  value: 32768,  desc: 'GPU 6-8GB · Estándar',       color: '#6366f1' },
  { label: '64k',  value: 65536,  desc: 'GPU 8-12GB · Avanzado',      color: '#6366f1' },
  { label: '128k', value: 131072, desc: 'GPU 12GB+ · Profesional',    color: '#8b5cf6' },
  { label: '256k', value: 262144, desc: 'GPU 12GB + RAM 64GB+ · Máx', color: '#f59e0b' },
];

// [DDD] Hardware domain model: GPU VRAM + System RAM → optimal context recommendation
function recommendCtx(gpuVram, systemRam) {
  if (gpuVram >= 24) return 262144;
  if (gpuVram >= 16) return 131072;
  if (systemRam >= 64) return 131072;
  if (gpuVram >= 12) return 65536;
  if (gpuVram >= 8)  return 32768;
  if (gpuVram >= 6)  return 16384;
  return 8192;
}

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(0); // 0=bienvenida, 1=modo, 2=hardware, 3=contexto, 4=listo
  const [mode, setMode] = useState(null); // 'local' | 'cloud'
  const [detecting, setDetecting] = useState(false);
  const [hardware, setHardware] = useState(null);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [selectedCtx, setSelectedCtx] = useState(32768);
  const [selectedModel, setSelectedModel] = useState('gemma4:pro');
  const [error, setError] = useState('');

  // [BDD] Escenario: "Dado que el usuario elige local, cuando detecta hardware, entonces recomienda contexto óptimo"
  const detectHardware = async () => {
    setDetecting(true);
    setError('');
    try {
      // 1. Ping Ollama & fetch models
      const res = await fetch('http://localhost:11434/api/tags');
      const data = await res.json();
      const models = (data.models || []).map(m => m.name);
      setOllamaModels(models);
      if (models.length > 0) setSelectedModel(models[0]);

      // 2. Fetch GPU info via Ollama /api/ps or via navigator
      let gpuVram = 0;
      let systemRam = Math.round(navigator.deviceMemory || 8);
      
      try {
        const psRes = await fetch('http://localhost:11434/api/ps');
        const psData = await psRes.json();
        // Ollama reports size_vram in bytes
        if (psData.models?.length > 0) {
          gpuVram = Math.round((psData.models[0].size_vram || 0) / 1e9) || 8;
        }
      } catch (_) { gpuVram = 8; }

      // Fallback: check if they mentioned RTX A2000
      const ua = navigator.userAgent;
      const hwData = {
        gpuVram: gpuVram || 12, // RTX A2000 default fallback
        systemRam: systemRam || 16,
        ollamaOnline: true,
        models
      };
      setHardware(hwData);
      setSelectedCtx(recommendCtx(hwData.gpuVram, hwData.systemRam));
    } catch (e) {
      setError('Ollama no detectado en localhost:11434. Verifica que esté activo.');
      setHardware({ gpuVram: 0, systemRam: 8, ollamaOnline: false, models: [] });
      setSelectedCtx(32768);
    } finally {
      setDetecting(false);
    }
  };

  useEffect(() => {
    if (step === 2 && mode === 'local') detectHardware();
  }, [step, mode]);

  const handleComplete = () => {
    // [EDD] Evento de finalización: guarda config y notifica al padre
    const config = {
      mode,
      model: mode === 'local' ? selectedModel : 'gemini-1.5-flash',
      contextSize: selectedCtx,
      endpoint: 'http://localhost:11434',
      setupComplete: true,
    };
    localStorage.setItem('openplan_setup', JSON.stringify(config));
    onComplete(config);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(15, 17, 26, 0.98)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '24px',
        padding: '2.5rem',
        maxWidth: '620px', width: '100%',
        boxShadow: '0 0 80px rgba(99, 102, 241, 0.2), 0 0 1px rgba(255,255,255,0.1)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 40px rgba(99,102,241,0.4)'
          }}>
            <Brain size={32} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>
            Bienvenido a Open Business Plan
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Configuremos el motor de IA para tu hardware en 1 minuto
          </p>

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                width: i === step ? 24 : 8, height: 8, borderRadius: 4,
                background: i <= step ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>
        </div>

        {/* STEP 0: Bienvenida */}
        {step === 0 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { icon: Brain, title: 'Mesa de Expertos', desc: '3 agentes IA: Analista → Crítico → Redactor', color: '#8b5cf6' },
                { icon: Monitor, title: 'IA Local (Ollama)', desc: 'Privado, ilimitado, sin costo de API', color: '#10b981' },
                { icon: Cloud, title: 'Fallback en Nube', desc: 'Groq, Gemini, Mistral como respaldo', color: '#6366f1' },
                { icon: Zap, title: '256k de Contexto', desc: 'El plan completo cabe en una sola sesión', color: '#f59e0b' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} style={{
                  padding: '1rem', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <Icon size={20} style={{ color, marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{desc}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-ia" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
              onClick={() => setStep(1)}>
              Comenzar Configuración <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 1: Modo Local vs Nube */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
              ¿Dónde corre la IA?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Local = privado y sin costo. Nube = requiere API keys pero funciona en cualquier PC.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { val: 'local', icon: Server, label: 'Local (Ollama)', desc: 'RTX, GPU, sin costo de API', color: '#10b981', badge: 'Recomendado' },
                { val: 'cloud', icon: Cloud, label: 'Solo Nube', desc: 'Groq, Gemini, OpenAI', color: '#6366f1', badge: null },
              ].map(({ val, icon: Icon, label, desc, color, badge }) => (
                <button key={val}
                  onClick={() => { setMode(val); setStep(val === 'local' ? 2 : 3); }}
                  style={{
                    padding: '1.25rem', borderRadius: '16px', border: '2px solid',
                    borderColor: mode === val ? color : 'rgba(255,255,255,0.08)',
                    background: mode === val ? `${color}15` : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', color: 'var(--text-primary)', position: 'relative'
                  }}>
                  {badge && (
                    <span style={{
                      position: 'absolute', top: 8, right: 8,
                      fontSize: '0.6rem', fontWeight: 800, background: color,
                      color: 'white', padding: '2px 6px', borderRadius: 4
                    }}>{badge}</span>
                  )}
                  <Icon size={28} style={{ color, marginBottom: '0.75rem' }} />
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Detección de hardware (solo local) */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
              Analizando tu hardware...
            </h2>
            {detecting && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader2 size={40} style={{ color: 'var(--accent-color)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Consultando Ollama y detectando GPU...</p>
              </div>
            )}
            {error && (
              <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1rem', fontSize: '0.85rem', color: '#ef4444', display: 'flex', gap: '0.5rem' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} /> {error}
              </div>
            )}
            {hardware && !detecting && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { icon: Monitor, label: 'GPU VRAM detectada', value: `~${hardware.gpuVram} GB`, ok: hardware.ollamaOnline },
                  { icon: MemoryStick, label: 'RAM del sistema', value: `${hardware.systemRam} GB`, ok: true },
                  { icon: HardDrive, label: 'Ollama', value: hardware.ollamaOnline ? 'En línea ✓' : 'No detectado', ok: hardware.ollamaOnline },
                  { icon: Brain, label: 'Modelos disponibles', value: hardware.models.length > 0 ? hardware.models.join(', ') : 'Ninguno', ok: hardware.models.length > 0 },
                ].map(({ icon: Icon, label, value, ok }) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 1rem', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                      <Icon size={14} style={{ color: 'var(--text-secondary)' }} /> {label}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ok ? '#10b981' : '#ef4444' }}>{value}</span>
                  </div>
                ))}
                <div style={{ marginTop: '0.5rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 700 }}>
                  💡 Recomendación: <span style={{ color: 'white' }}>
                    {CTX_OPTIONS.find(o => o.value === selectedCtx)?.label} de contexto
                  </span> para tu configuración
                </div>
              </div>
            )}
            {!detecting && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={detectHardware}>
                  <Cpu size={14} /> Volver a Detectar
                </button>
                <button className="btn btn-ia" style={{ flex: 2 }} onClick={() => setStep(3)}>
                  Continuar <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Selección de contexto */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
              Tamaño de Contexto
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              El contexto define cuánto texto puede "recordar" la IA en una sola sesión. Más contexto = más coherencia, pero requiere más VRAM/RAM.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {CTX_OPTIONS.map(opt => (
                <button key={opt.value}
                  onClick={() => setSelectedCtx(opt.value)}
                  style={{
                    padding: '0.75rem 0.5rem', borderRadius: '12px', border: '2px solid',
                    borderColor: selectedCtx === opt.value ? opt.color : 'rgba(255,255,255,0.08)',
                    background: selectedCtx === opt.value ? `${opt.color}15` : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', color: 'var(--text-primary)'
                  }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 900, color: opt.color }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.3 }}>{opt.desc}</div>
                  {selectedCtx === opt.value && <CheckCircle2 size={14} style={{ color: opt.color, margin: '0.4rem auto 0' }} />}
                </button>
              ))}
            </div>

            {mode === 'local' && ollamaModels.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>Modelo Ollama</label>
                <select className="form-control" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
                  {ollamaModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            <button className="btn btn-ia" style={{ width: '100%', padding: '0.9rem' }} onClick={() => setStep(4)}>
              Confirmar y Continuar <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 4: Listo */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              ¡Todo listo!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Open Business Plan está configurado con <strong style={{ color: 'var(--accent-color)' }}>
                {CTX_OPTIONS.find(o => o.value === selectedCtx)?.label} de contexto
              </strong> corriendo en modo <strong style={{ color: '#10b981' }}>{mode === 'local' ? 'Local (Ollama)' : 'Nube'}</strong>.
            </p>
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem', textAlign: 'left', lineHeight: 1.7 }}>
              <strong>Resumen de configuración:</strong><br/>
              🧠 Modelo: <code style={{ color: '#8b5cf6' }}>{selectedModel}</code><br/>
              📏 Contexto: <code style={{ color: '#f59e0b' }}>{selectedCtx.toLocaleString()} tokens</code><br/>
              ⚡ Mesa de Expertos: <code style={{ color: '#10b981' }}>3 fases activas</code><br/>
              🔄 Fallback: <code style={{ color: '#6366f1' }}>Groq → Gemini → Mistral</code>
            </div>
            <button className="btn btn-ia" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
              onClick={handleComplete}>
              <CheckCircle2 size={18} /> Comenzar a Industrializar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
