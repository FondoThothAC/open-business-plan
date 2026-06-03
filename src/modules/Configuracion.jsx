import React, { useState, useEffect } from 'react';
import { usePlan } from '../context/PlanContext';
import { Cpu, Palette, Save, Globe, Database, Upload, Image as ImageIcon, RefreshCw, Settings, Sliders, Activity, DollarSign, Zap, AlertTriangle, Info, Plus, Trash2, BookOpen, Link, FileText } from 'lucide-react';
import DocumentUploader from '../components/DocumentUploader';

// [MDD] Modelo de precios de API (USD por 1M tokens) — se actualiza manualmente
const API_COSTS = {
  'gemini-1.5-flash':       { input: 0.075, output: 0.30,  name: 'Gemini 1.5 Flash' },
  'gemini-1.5-pro':         { input: 1.25,  output: 5.00,  name: 'Gemini 1.5 Pro' },
  'llama-3.3-70b-versatile':{ input: 0.59,  output: 0.79,  name: 'Groq Llama 3.3 70B' },
  'mistral-large-latest':   { input: 2.00,  output: 6.00,  name: 'Mistral Large' },
  'gpt-4o':                 { input: 2.50,  output: 10.00, name: 'GPT-4o' },
};

const CTX_PRESETS = [
  { label: '8k',   value: 8192   },
  { label: '16k',  value: 16384  },
  { label: '32k',  value: 32768  },
  { label: '64k',  value: 65536  },
  { label: '128k', value: 131072 },
  { label: '256k', value: 262144 },
];

// [TDD] Función pura: estima costo de una generación de módulo completa (3 fases Mesa de Expertos)
function estimateMesaCost(contextTokens, model) {
  const pricing = API_COSTS[model];
  if (!pricing) return null;
  // Mesa de Expertos: 3 llamadas, cada una envía el contexto + respuesta
  // Fase 1 (Analista): ctx_in + 800 out
  // Fase 2 (Crítico): ctx_in + draft_in + 400 out  
  // Fase 3 (Redactor): ctx_in + draft_in + critique_in + 1200 out
  const avgInput  = contextTokens * 2.5; // promedio de tokens entrada entre 3 fases
  const avgOutput = 2400;
  const costUSD = (avgInput / 1e6 * pricing.input) + (avgOutput / 1e6 * pricing.output);
  return { costUSD, tokensIn: Math.round(avgInput), tokensOut: avgOutput };
}

export default function Configuracion() {
  const { planData, updateConfig } = usePlan();
  const [ollamaModels, setOllamaModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [ollamaOnline, setOllamaOnline] = useState(false);
  // [EDD] Rastreo local de sesión de tokens (estimado)
  const [sessionTokens, setSessionTokens] = useState(() => {
    return parseInt(localStorage.getItem('op_session_tokens') || '0');
  });

  const fetchOllamaModels = async () => {
    setIsFetchingModels(true);
    try {
      const endpoint = planData.config.ai.endpoint || 'http://localhost:11434';
      const response = await fetch(`${endpoint}/api/tags`);
      const data = await response.json();
      
      if (data.models) {
        setOllamaModels(data.models.map(m => ({
          name: m.name,
          details: m.details
        })));
        setOllamaOnline(true);
      }
    } catch (error) {
      setOllamaOnline(false);
      setOllamaModels([
        { name: 'gemma4:pro' },
        { name: 'gemma4:e4b' },
        { name: 'qwen2.5:1.5b' },
      ]);
    } finally {
      setIsFetchingModels(false);
    }
  };

  useEffect(() => {
    fetchOllamaModels();
  }, [planData.config.ai.endpoint]);

  const handleAiChange = (field, value) => {
    updateConfig('ai', field, value);
  };

  const handleBrandChange = (field, value) => {
    updateConfig('brandKit', field, value);
  };

  const handleExternalChange = (field, value) => {
    updateConfig('externalApis', field, value);
  };

  const handleCoverChange = (field, value) => {
    updateConfig('coverDesign', field, value);
  };

  const handleSearchConfigChange = (field, value) => {
    updateConfig('search', field, value);
  };

  const searchConfig = planData.config?.search || { provider: 'tavily', duckDuckGoEnabled: false, apiKey: '' };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleBrandChange('logoUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInstitutionLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const current = planData.config?.coverDesign?.institutionLogos || [];
      if (current.length >= 4) {
        alert('Máximo 4 logos institucionales permitidos.');
        return;
      }
      const newLogo = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: reader.result
      };
      handleCoverChange('institutionLogos', [...current, newLogo]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeInstitutionLogo = (logoId) => {
    const current = planData.config?.coverDesign?.institutionLogos || [];
    handleCoverChange('institutionLogos', current.filter(l => l.id !== logoId));
  };

  const updateInstitutionLogoName = (logoId, newName) => {
    const current = planData.config?.coverDesign?.institutionLogos || [];
    handleCoverChange('institutionLogos', current.map(l => l.id === logoId ? { ...l, name: newName } : l));
  };

  // --- Data Sources / Fuentes de Información ---
  const dataSources = planData.config?.dataSources || [];

  const addDataSource = () => {
    const newSource = {
      id: Date.now().toString(),
      type: 'manual',
      title: '',
      url: '',
      description: ''
    };
    updateConfig('dataSources', null, [...dataSources, newSource]);
  };

  const updateDataSource = (sourceId, field, value) => {
    const updated = dataSources.map(s => s.id === sourceId ? { ...s, [field]: value } : s);
    updateConfig('dataSources', null, updated);
  };

  const removeDataSource = (sourceId) => {
    updateConfig('dataSources', null, dataSources.filter(s => s.id !== sourceId));
  };

  // Datos derivados para el monitor
  const ctxSize = planData.config?.ai?.contextSize || 32768;
  const currentModel = planData.config?.ai?.model || 'gemma4:pro';
  const isLocal = ollamaOnline && currentModel.includes(':');
  const mesaEstimate = estimateMesaCost(ctxSize, 'gemini-1.5-flash');
  const ctxLabel = CTX_PRESETS.find(p => p.value === ctxSize)?.label || `${Math.round(ctxSize/1024)}k`;

  const coverDesign = planData.config?.coverDesign || {
    layout: 'classic',
    logoSize: 'medium',
    logoAlign: 'center',
    titleSize: 'medium',
    creatorName: '',
    subtitle: 'Plan Estratégico Maestro',
    institution: 'Formulación y Evaluación Académica 2026',
    showDate: true,
    customDate: '',
    institutionLogos: []
  };

  const institutionLogos = coverDesign.institutionLogos || [];

  return (
    <div className="module-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Configuración Maestro</h1>
          <p className="text-secondary mt-1">Industrialización: IA con Fallback, APIs y Kit de Marca.</p>
        </div>
        <button className="btn btn-ia" onClick={() => { localStorage.removeItem('openplan_setup'); window.location.reload(); }} style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
          <RefreshCw size={14} /> Re-ejecutar Wizard
        </button>
      </div>

      {/* Monitor de Uso y Costos */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Activity style={{ color: 'var(--accent-color)' }} size={18} />
          <h2 style={{ fontSize: '1.1rem' }}>Monitor de IA — Uso y Costos</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: isLocal ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isLocal ? '#10b981' : '#ef4444', border: `1px solid ${isLocal ? '#10b981' : '#ef4444'}`, borderRadius: '20px', padding: '2px 10px', fontWeight: 800 }}>
            {isLocal ? '⚡ LOCAL — Sin Costo' : '☁️ NUBE'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { icon: Sliders, label: 'Contexto activo', value: ctxLabel, color: '#8b5cf6' },
            { icon: Zap, label: 'Mesa de Expertos', value: '3 fases / módulo', color: '#f59e0b' },
            { icon: Activity, label: 'Tokens/módulo est.', value: mesaEstimate ? `~${(mesaEstimate.tokensIn/1000).toFixed(0)}k` : '--', color: '#6366f1' },
            { icon: DollarSign, label: 'Costo nube/módulo', value: mesaEstimate ? `$${mesaEstimate.costUSD.toFixed(4)} USD` : 'Local ✓', color: '#10b981' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ padding: '0.875rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <Icon size={16} style={{ color, margin: '0 auto 0.4rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{value}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabla de precios de API */}
        <div style={{ fontSize: '0.75rem' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={12} /> Costo estimado por módulo con Mesa de Expertos (3 llamadas × contexto {ctxLabel})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.4rem' }}>
            {Object.entries(API_COSTS).map(([key, val]) => {
              const est = estimateMesaCost(ctxSize, key);
              return (
                <div key={key} style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.7rem', marginBottom: '0.25rem' }}>{val.name}</div>
                  <div style={{ color: est && est.costUSD > 0.05 ? '#f59e0b' : '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                    {est ? `$${est.costUSD.toFixed(4)}` : '--'}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem' }}>por módulo</div>
                </div>
              );
            })}
          </div>
          {!isLocal && (
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', color: '#f59e0b', fontSize: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertTriangle size={14} /> La Mesa de Expertos hace 3 llamadas por módulo. Con contexto {ctxLabel} el costo se multiplica. Activa Ollama local para generación sin costo.
            </div>
          )}
        </div>
      </div>

      {/* Control de Contexto */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sliders style={{ color: 'var(--accent-color)' }} size={18} />
          <h2 style={{ fontSize: '1.1rem' }}>Tamaño de Contexto</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          {CTX_PRESETS.map(p => (
            <button key={p.value}
              onClick={() => handleAiChange('contextSize', p.value)}
              style={{
                padding: '0.4rem 0.875rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800,
                border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                borderColor: ctxSize === p.value ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                background: ctxSize === p.value ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: ctxSize === p.value ? 'var(--accent-color)' : 'var(--text-secondary)',
              }}>
              {p.label}
            </button>
          ))}
        </div>
        <input type="range" min={8192} max={262144} step={8192}
          value={ctxSize}
          onChange={e => handleAiChange('contextSize', parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-color)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          <span>8k — Rápido (GPU 4GB)</span>
          <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{ctxLabel} seleccionado</span>
          <span>256k — Máx (RAM 64GB+)</span>
        </div>
      </div>

      {/* ─── Mesa de Expertos ─────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🧠</span>
          <h2 style={{ fontSize: '1.1rem' }}>Mesa de Expertos — Agentes y Modelos</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px', padding: '2px 10px', fontWeight: 800 }}>
            ⚡ Nivel 1 Activo por defecto
          </span>
        </div>

        {/* Asignación de modelos por rol */}
        {[
          { rol: 'analista',      emoji: '📊', label: 'Analista Estratégico',  hint: 'Genera el borrador. Usa modelos rápidos.' },
          { rol: 'critico',       emoji: '🔍', label: 'Crítico Financiero',     hint: 'Evalúa debilidades. Nivel 2+.' },
          { rol: 'redactor',      emoji: '✍️', label: 'Redactor Ejecutivo',     hint: 'Síntesis final. Usa el mejor modelo disponible.' },
          { rol: 'estratega',     emoji: '🗺️', label: 'Estratega',              hint: 'Define el marco. Solo nivel 3 (Profundo).' },
          { rol: 'abogadoDiablo', emoji: '😈', label: "Devil's Advocate",       hint: 'Contraargumenta. Solo nivel 3 (Profundo).' },
        ].map(({ rol, emoji, label, hint }) => {
          const current = planData.config?.ai?.agentModels?.[rol]?.model || 'gemma4:e4b';
          const isDeepOnly = rol === 'estratega' || rol === 'abogadoDiablo';
          return (
            <div key={rol} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 160px', gap: '0.75rem', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{emoji}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{label}</div>
                  {isDeepOnly && <div style={{ fontSize: '0.6rem', color: '#8b5cf6' }}>🔬 Solo nivel Profundo</div>}
                </div>
              </div>
              <select
                className="form-control"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', opacity: isDeepOnly ? 0.6 : 1 }}
                value={current}
                onChange={e => {
                  const newModels = { ...(planData.config?.ai?.agentModels || {}) };
                  newModels[rol] = { ...newModels[rol], model: e.target.value };
                  handleAiChange('agentModels', newModels);
                }}
              >
                <optgroup label="— Tu hardware (recomendados) —">
                  <option value="nemotron">nemotron  (~4GB VRAM) ★ Recomendado</option>
                  <option value="gemma4:e4b">gemma4:e4b  (~4.5-8GB VRAM)</option>
                  <option value="gemma4:pro">gemma4:pro  (~8GB VRAM) — Mejor calidad</option>
                  <option value="gemma4:e2b">gemma4:e2b  (~2GB VRAM) — Ultra rápido</option>
                </optgroup>
                <optgroup label="— Otros modelos Ollama —">
                  <option value="qwen2.5:7b">qwen2.5:7b  (~4.5GB) — Datos numéricos</option>
                  <option value="phi4:14b">phi4:14b    (~8GB) — Matemáticas</option>
                  <option value="llama3.1:8b">llama3.1:8b (~5GB) — Estructura</option>
                  <option value="mistral:7b">mistral:7b  (~4.5GB) — Multilingüe</option>
                  <option value="qwen3.5:2b-mlx" disabled>qwen3.5:2b-mlx (No soportado)</option>
                </optgroup>
                <optgroup label="— Nube (Requiere API Key) —">
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Google)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Google)</option>
                  <option value="llama-3.3-70b-versatile">Groq Llama 3.3 70B</option>
                  <option value="mistral-large-latest">Mistral Large</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                </optgroup>
                {ollamaModels.filter(m => !['nemotron','gemma4:e4b','gemma4:pro','gemma4:e2b','qwen2.5:7b','phi4:14b','llama3.1:8b','mistral:7b', 'qwen3.5:2b-mlx'].includes(m.name)).length > 0 && (
                  <optgroup label="— Detectados en tu Ollama —">
                    {ollamaModels
                      .filter(m => !['nemotron','gemma4:e4b','gemma4:pro','gemma4:e2b','qwen2.5:7b','phi4:14b','llama3.1:8b','mistral:7b', 'qwen3.5:2b-mlx'].includes(m.name))
                      .map(m => <option key={m.name} value={m.name}>{m.name}</option>)
                    }
                  </optgroup>
                )}
              </select>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{hint}</div>
            </div>
          );
        })}

        {/* Profundidad global — Feature avanzada desbloqueada */}
        <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>🔓 Profundidad Global (Avanzado)</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Cuando está activo, aparece el selector ⚡/🧠/🔬 en cada módulo. Por defecto usa nivel 1 (Rápido).
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {planData.config?.ai?.advancedDepth ? 'Activado' : 'Desactivado'}
              </span>
              <div
                onClick={() => handleAiChange('advancedDepth', !planData.config?.ai?.advancedDepth)}
                style={{
                  width: 40, height: 22, borderRadius: 11, cursor: 'pointer', transition: 'all 0.3s',
                  background: planData.config?.ai?.advancedDepth ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, transition: 'all 0.3s',
                  left: planData.config?.ai?.advancedDepth ? 20 : 3,
                  width: 16, height: 16, borderRadius: '50%', background: 'white'
                }} />
              </div>
            </label>
          </div>
          {planData.config?.ai?.advancedDepth && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { level: 1, icon: '⚡', label: 'Rápido',    time: '~1 min',  desc: '2 agentes' },
                { level: 2, icon: '🧠', label: 'Pro',       time: '~3 min',  desc: '3 agentes' },
                { level: 3, icon: '🔬', label: 'Profundo',  time: '~10 min', desc: '5 agentes' },
                { level: 4, icon: '🏭', label: 'Industrial', time: '~25 min', desc: '9 agentes' },
              ].map(({ level, icon, label, time, desc }) => (
                <button key={level}
                  onClick={() => handleAiChange('depth', level)}
                  style={{
                    flex: 1, padding: '0.75rem 0.5rem', borderRadius: '10px', border: '1px solid',
                    borderColor: (planData.config?.ai?.depth || 1) === level ? 'var(--accent-color)' : 'rgba(255,255,255,0.08)',
                    background: (planData.config?.ai?.depth || 1) === level ? 'rgba(99,102,241,0.15)' : 'transparent',
                    cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{icon}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{label}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{desc} · {time}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Metodología del Proyecto */}
        <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Settings style={{ color: 'var(--accent-color)' }} />
            <h2 style={{ fontSize: '1.25rem' }}>Metodología del Proyecto</h2>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Proyecto</label>
            <select 
              className="form-control" 
              value={planData.config?.projectType || 'business'}
              onChange={(e) => {
                updateConfig('projectType', null, e.target.value);
              }}
            >
              <option value="business">Plan de Negocios Comercial (Tradicional)</option>
              <option value="social_bid">Proyecto Social (Metodología BID)</option>
            </select>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Cambiar este valor adaptará automáticamente toda la plataforma (Semilla, Menús, Módulos e Inteligencia Artificial) a la metodología seleccionada.
            </p>
          </div>
        </div>

        {/* IA Config con Fallback */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Cpu style={{ color: 'var(--accent-color)' }} />
            <h2 style={{ fontSize: '1.25rem' }}>IA Swarm con Auto-Fallback</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Proveedor Primario</label>
              <select 
                className="form-control" 
                value={planData.config.ai.primaryProvider}
                onChange={(e) => handleAiChange('primaryProvider', e.target.value)}
              >
                <option value="gemini">Gemini</option>
                <option value="groq">Groq</option>
                <option value="ollama">Ollama (Local)</option>
              </select>
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Modelo Local (Ollama)</label>
                <button 
                  onClick={fetchOllamaModels} 
                  className="btn btn-secondary" 
                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                  title="Refrescar modelos"
                  disabled={isFetchingModels}
                >
                  <RefreshCw className={`w-3 h-3 ${isFetchingModels ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <select 
                value={planData.config.ai.model} 
                onChange={(e) => handleAiChange('model', e.target.value)}
                className="form-control"
              >
                {ollamaModels.length > 0 ? (
                  ollamaModels.map(model => (
                    <option key={model.name} value={model.name}>
                      {model.name} {model.details?.parameter_size ? `(${model.details.parameter_size})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="">No se detectaron modelos</option>
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">API Key (Gemini/OpenAI/Mistral)</label>
            <input 
              type="password" 
              className="form-control" 
              value={planData.config.ai.apiKey}
              onChange={(e) => handleAiChange('apiKey', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">API Key (Groq)</label>
            <input 
              type="password" 
              className="form-control" 
              value={planData.config.ai.groqKey}
              onChange={(e) => handleAiChange('groqKey', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ollama Endpoint</label>
            <input 
              type="text" 
              className="form-control" 
              value={planData.config.ai.endpoint || 'http://localhost:11434'}
              onChange={(e) => handleAiChange('endpoint', e.target.value)}
            />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Palette className="text-[#8b5cf6]" />
            <h2 style={{ fontSize: '1.25rem' }}>Kit de Marca e Identidad</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Proyecto</label>
            <input 
              type="text" 
              className="form-control" 
              value={planData.config.brandKit.companyName}
              onChange={(e) => handleBrandChange('companyName', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Logotipo de Empresa</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                border: '1px dashed var(--border-color)', 
                borderRadius: '8px', 
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'var(--input-bg)',
                overflow: 'hidden'
              }}>
                {planData.config.brandKit.logoUrl ? (
                  <img src={planData.config.brandKit.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <ImageIcon className="w-6 h-6 text-secondary" />
                )}
              </div>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                <Upload className="w-4 h-4" />
                <span>Subir PNG</span>
                <input type="file" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Color de Acento</label>
            <input 
              type="color" 
              className="form-control" 
              style={{ height: '42px', padding: '2px' }}
              value={planData.config.brandKit.primaryColor}
              onChange={(e) => handleBrandChange('primaryColor', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tema de Interfaz</label>
            <select 
              className="form-control" 
              value={planData.config.theme || 'dark'}
              onChange={(e) => updateConfig('theme', '', e.target.value)}
            >
              <option value="dark">Modo Oscuro (Industrial)</option>
              <option value="light">Modo Claro (Académico)</option>
              <option value="midnight">Noche Profunda (Contraste)</option>
              <option value="forest">Sostenible (Bosque)</option>
              <option value="clean">Ejecutivo (Limpio)</option>
              <option value="oceanic">Creativo (Océano)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lienzo de Diseño de Portada */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Palette className="text-[#8b5cf6]" />
          <h2 style={{ fontSize: '1.25rem' }}>Lienzo de Diseño de Portada (Diseñador General)</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem' }}>
          {/* Controles de Diseño */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label">Estilo de Diseño (Layout)</label>
              <select 
                className="form-control" 
                value={coverDesign.layout}
                onChange={(e) => handleCoverChange('layout', e.target.value)}
              >
                <option value="classic">Clásico (Centrado)</option>
                <option value="modern">Moderno (Franja y Contraste)</option>
                <option value="minimalist">Minimalista (Limpio y Elegante)</option>
                <option value="sidebar">Borde Lateral (Izquierdo)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Alineación del Logo</label>
              <select 
                className="form-control" 
                value={coverDesign.logoAlign}
                onChange={(e) => handleCoverChange('logoAlign', e.target.value)}
              >
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tamaño del Logo</label>
              <select 
                className="form-control" 
                value={coverDesign.logoSize}
                onChange={(e) => handleCoverChange('logoSize', e.target.value)}
              >
                <option value="small">Chico</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tamaño del Título</label>
              <select 
                className="form-control" 
                value={coverDesign.titleSize}
                onChange={(e) => handleCoverChange('titleSize', e.target.value)}
              >
                <option value="small">Chico</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Subtítulo de la Portada</label>
              <input 
                type="text" 
                className="form-control" 
                value={coverDesign.subtitle}
                onChange={(e) => handleCoverChange('subtitle', e.target.value)}
                placeholder="Ej. Plan Estratégico Maestro"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Institución / Organización</label>
              <input 
                type="text" 
                className="form-control" 
                value={coverDesign.institution}
                onChange={(e) => handleCoverChange('institution', e.target.value)}
                placeholder="Ej. Formulación y Evaluación Académica 2026"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Creador (Nombre de quien crea)</label>
              <input 
                type="text" 
                className="form-control" 
                value={coverDesign.creatorName}
                onChange={(e) => handleCoverChange('creatorName', e.target.value)}
                placeholder="Ej. Roberto Eduardo Celis Robles"
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={coverDesign.showDate !== false}
                  onChange={(e) => handleCoverChange('showDate', e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                />
                <span style={{ fontSize: '0.85rem' }}>Mostrar Fecha en Portada</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha Personalizada (Opcional)</label>
              <input 
                type="text" 
                className="form-control" 
                value={coverDesign.customDate}
                onChange={(e) => handleCoverChange('customDate', e.target.value)}
                placeholder="Vacío para fecha actual"
                disabled={coverDesign.showDate === false}
              />
            </div>

            {/* Logos Institucionales */}
            <div className="form-group" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem', marginTop: '0.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🏛️ Logos de Instituciones Participantes
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 400 }}>(Máx. 4)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {institutionLogos.map((logo) => (
                  <div key={logo.id} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                    padding: '0.5rem', background: 'var(--bg-dark)', borderRadius: '8px',
                    border: '1px solid var(--border-color)', width: '110px'
                  }}>
                    <img src={logo.url} alt={logo.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }} />
                    <input
                      type="text"
                      value={logo.name}
                      onChange={(e) => updateInstitutionLogoName(logo.id, e.target.value)}
                      style={{
                        width: '100%', fontSize: '0.65rem', textAlign: 'center',
                        background: 'transparent', border: 'none', color: 'var(--text-primary)',
                        borderBottom: '1px solid var(--border-color)', padding: '2px 0', outline: 'none'
                      }}
                      placeholder="Nombre"
                    />
                    <button
                      onClick={() => removeInstitutionLogo(logo.id)}
                      style={{
                        fontSize: '0.65rem', color: '#ef4444', background: 'transparent',
                        border: 'none', cursor: 'pointer', padding: '2px'
                      }}
                      title="Eliminar logo"
                    >
                      <Trash2 style={{ width: '12px', height: '12px' }} />
                    </button>
                  </div>
                ))}
                {institutionLogos.length < 4 && (
                  <label style={{
                    width: '110px', height: '90px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                    border: '2px dashed var(--border-color)', borderRadius: '8px',
                    cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.7rem',
                    transition: 'border-color 0.2s'
                  }}>
                    <Plus style={{ width: '20px', height: '20px' }} />
                    <span>Agregar</span>
                    <input type="file" accept="image/*" onChange={handleInstitutionLogoUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Miniatura en Vivo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vista Previa Portada</span>
            <div style={{
              width: '220px',
              height: '310px',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
              textAlign: coverDesign.layout === 'classic' ? 'center' : 'left',
              justifyContent: 'space-between',
              fontFamily: 'Inter, sans-serif'
            }}>
              {/* Sidebar border style */}
              {coverDesign.layout === 'sidebar' && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '12px',
                  height: '100%',
                  background: planData.config.brandKit.primaryColor || '#6366f1'
                }} />
              )}

              {/* Modern banner layout */}
              {coverDesign.layout === 'modern' && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '15%',
                  width: '100%',
                  height: '40px',
                  background: planData.config.brandKit.primaryColor || '#6366f1',
                  opacity: 0.15
                }} />
              )}

              {/* Top part: Logo */}
              <div style={{
                display: 'flex',
                justifyContent: coverDesign.logoAlign === 'left' ? 'flex-start' : coverDesign.logoAlign === 'right' ? 'flex-end' : 'center',
                width: '100%',
                paddingLeft: coverDesign.layout === 'sidebar' ? '10px' : '0'
              }}>
                {planData.config.brandKit.logoUrl ? (
                  <img 
                    src={planData.config.brandKit.logoUrl} 
                    alt="Logo preview" 
                    style={{
                      width: coverDesign.logoSize === 'small' ? '30px' : coverDesign.logoSize === 'large' ? '70px' : '50px',
                      height: 'auto',
                      maxHeight: '40px',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div style={{
                    width: coverDesign.logoSize === 'small' ? '30px' : coverDesign.logoSize === 'large' ? '70px' : '50px',
                    height: '25px',
                    borderRadius: '4px',
                    border: '1px dashed #cbd5e1',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    color: '#94a3b8'
                  }}>Logo</div>
                )}
              </div>

              {/* Center part: Title and Subtitle */}
              <div style={{
                paddingLeft: coverDesign.layout === 'sidebar' ? '10px' : '0',
                margin: 'auto 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                {coverDesign.layout === 'modern' && (
                  <div style={{ width: '30px', height: '3px', background: planData.config.brandKit.primaryColor || '#6366f1', marginBottom: '0.25rem', alignSelf: coverDesign.layout === 'classic' ? 'center' : 'flex-start' }} />
                )}
                <h3 style={{
                  margin: 0,
                  fontSize: coverDesign.titleSize === 'small' ? '10px' : coverDesign.titleSize === 'large' ? '16px' : '13px',
                  fontWeight: 800,
                  lineHeight: '1.2',
                  color: '#0f172a'
                }}>
                  {planData.config.brandKit.companyName || 'Nombre del Proyecto'}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '7px',
                  color: '#64748b',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {coverDesign.subtitle || 'Plan Estratégico Maestro'}
                </p>
                {coverDesign.institution && (
                  <p style={{
                    margin: '3px 0 0 0',
                    fontSize: '6px',
                    color: '#94a3b8'
                  }}>
                    {coverDesign.institution}
                  </p>
                )}
              </div>

              {/* Bottom part: Creator and Date */}
              <div style={{
                paddingLeft: coverDesign.layout === 'sidebar' ? '10px' : '0',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '8px',
                fontSize: '6.5px',
                color: '#475569'
              }}>
                <div style={{ fontWeight: 600 }}>
                  {coverDesign.creatorName ? `Creado por: ${coverDesign.creatorName}` : 'Elaborado por: [Tu Nombre]'}
                </div>
                {coverDesign.showDate !== false && (
                  <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                    {coverDesign.customDate || new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
                {/* Institution logos in miniature */}
                {institutionLogos.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '5px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                    {institutionLogos.map(logo => (
                      <img key={logo.id} src={logo.url} alt={logo.name} style={{ width: '16px', height: '16px', objectFit: 'contain', borderRadius: '2px' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Globe className="text-blue-400" />
          <h2 style={{ fontSize: '1.25rem' }}>Investigación Web e Internet</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
               <input 
                 type="checkbox" 
                 checked={searchConfig.duckDuckGoEnabled}
                 onChange={(e) => {
                   handleSearchConfigChange('duckDuckGoEnabled', e.target.checked);
                   if (!e.target.checked && searchConfig.provider === 'duckduckgo') {
                     handleSearchConfigChange('provider', 'tavily');
                   }
                 }}
                 style={{ width: '1.2rem', height: '1.2rem' }}
               />
               <span>Habilitar DuckDuckGo Scraper (Alternativa local sin costo)</span>
             </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Proveedor de Búsqueda Principal</label>
              <select 
                className="form-control"
                value={searchConfig.provider}
                onChange={(e) => handleSearchConfigChange('provider', e.target.value)}
              >
                <option value="tavily">Tavily AI (Recomendado)</option>
                {searchConfig.duckDuckGoEnabled && (
                  <option value="duckduckgo">DuckDuckGo Scraper</option>
                )}
              </select>
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                Tavily ofrece mejores resultados orientados a LLMs. DuckDuckGo es gratuito pero puede ser bloqueado.
              </small>
            </div>

            {searchConfig.provider === 'tavily' && (
              <div className="form-group">
                <label className="form-label">API Key de Tavily AI</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="tvly-..."
                  value={searchConfig.apiKey}
                  onChange={(e) => handleSearchConfigChange('apiKey', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Database className="text-emerald-400" />
          <h2 style={{ fontSize: '1.25rem' }}>Investigación Estratégica (INEGI / DENUE)</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Token INEGI / DENUE</label>
            <input 
              type="password" 
              className="form-control" 
              value={planData.config.externalApis.inegiToken}
              onChange={(e) => handleExternalChange('inegiToken', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Token BANXICO</label>
            <input 
              type="password" 
              className="form-control" 
              value={planData.config.externalApis.banxicoToken}
              onChange={(e) => handleExternalChange('banxicoToken', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Créditos y Metodologías */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Database style={{ color: 'var(--accent-color)' }} />
          <h2 style={{ fontSize: '1.25rem' }}>Créditos y Metodologías Aplicadas</h2>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '1rem' }}>
            El motor financiero y estratégico de esta plataforma ha sido calibrado usando estándares de clase mundial y metodologías oficiales para garantizar validez institucional y viabilidad bancaria:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>NAFIN (Nacional Financiera):</strong> Estructuras de Flujo de Caja y evaluación crediticia para MiPyMEs en México.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>BID (Banco Interamericano de Desarrollo):</strong> Implementación de la Metodología de Marco Lógico (MML) para el diseño, ejecución y evaluación de proyectos sociales.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>CFI (Corporate Finance Institute):</strong> Fórmulas estandarizadas globales para Valor Actual Neto (VAN), Tasa Interna de Retorno (TIR) y Retorno sobre Inversión (ROI).</li>
            <li><strong>INEGI y Banxico:</strong> Datos macroeconómicos integrados a través de DENUE y SieAPI para el análisis del entorno regional.</li>
          </ul>
        </div>
      </div>

      {/* Fuentes de Información */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <BookOpen style={{ color: '#f59e0b' }} />
          <h2 style={{ fontSize: '1.25rem' }}>Fuentes de Información</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Agrega las fuentes de información consultadas para la elaboración de este plan. Se incluirán automáticamente las APIs utilizadas (DENUE, Banxico) y puedes agregar fuentes manuales (leyes, precios, estudios, etc.).
        </p>

        {/* Auto-detected sources */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fuentes Automáticas Detectadas</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {planData.config?.externalApis?.inegiToken && (
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 600 }}>
                ✓ INEGI / DENUE — Directorio Estadístico Nacional de Unidades Económicas
              </span>
            )}
            {planData.config?.externalApis?.banxicoToken && (
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: 600 }}>
                ✓ Banxico SieAPI — Indicadores Macroeconómicos
              </span>
            )}
            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', fontWeight: 600 }}>
              ✓ INEGI WMS — Cartografía y Límites Territoriales
            </span>
            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)', fontWeight: 600 }}>
              ✓ OpenStreetMap — Base Cartográfica
            </span>
          </div>
        </div>

        {/* Manual sources */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fuentes Manuales</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
            {dataSources.map((source) => (
              <div key={source.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto',
                gap: '0.5rem', alignItems: 'start',
                padding: '0.75rem', background: 'var(--bg-dark)',
                borderRadius: '10px', border: '1px solid var(--border-color)'
              }}>
                <input
                  type="text"
                  className="form-control"
                  value={source.title}
                  onChange={(e) => updateDataSource(source.id, 'title', e.target.value)}
                  placeholder="Título de la fuente"
                  style={{ fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={source.url}
                  onChange={(e) => updateDataSource(source.id, 'url', e.target.value)}
                  placeholder="URL (opcional)"
                  style={{ fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={source.description}
                  onChange={(e) => updateDataSource(source.id, 'description', e.target.value)}
                  placeholder="Descripción breve (ej: Consulta de precios de materiales)"
                  style={{ fontSize: '0.8rem' }}
                />
                <button
                  onClick={() => removeDataSource(source.id)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', color: '#ef4444', fontSize: '0.75rem' }}
                  title="Eliminar fuente"
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addDataSource}
            className="btn btn-secondary"
            style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
          >
            <Plus style={{ width: '14px', height: '14px' }} />
            <span>Agregar Fuente Manual</span>
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <DocumentUploader />
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <RefreshCw style={{ color: '#ef4444' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#ef4444' }}>Herramientas de Emergencia</h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Si experimentas problemas con datos mezclados de otros proyectos o la vista previa no se actualiza, usa el botón de abajo para limpiar completamente el motor.
        </p>
        <button 
          className="btn" 
          style={{ background: '#ef4444', color: 'white', border: 'none' }}
          onClick={() => {
            if (window.confirm('⚠️ ¿LIMPIAR TODO? Esto borrará el caché del navegador y reiniciará el proyecto desde cero. Úsalo si ves datos mezclados.')) {
              localStorage.clear();
              window.location.href = '/semilla';
            }
          }}
        >
          <Database className="w-4 h-4" />
          <span>Limpiar Todo y Reiniciar Master</span>
        </button>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
        <button className="btn btn-primary" onClick={() => alert('Industrialización Guardada')}>
          <Save className="w-4 h-4" />
          <span>Guardar Configuración</span>
        </button>
      </div>
    </div>
  );
}
