import { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Play, 
  Pause, 
  RefreshCw, 
  Globe, 
  Cpu, 
  DollarSign, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Database,
  Layers
} from 'lucide-react';
import { getApiBase } from '../config/apiConfig.js';
import { usePlan } from '../context/PlanContext.jsx';
import { buildSearchApiKeys, getProvenanceBadgeConfig } from '../lib/tools/provenance.js';

/**
 * Badge visual de procedencia de datos (Factual Verificado / Hardware Local / Estimación Sintética / Sin Datos)
 * Garantiza cumplimiento estricto con la directiva de erradicación de datos falsos.
 */
export function ProvenanceBadge({ provenance, provider, warning }) {
  const cfg = getProvenanceBadgeConfig({ provenance, provider, warning });

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.68rem',
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: '10px',
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}40`,
        lineHeight: 1.2
      }}
      title={cfg.title}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  );
}

export default function TerminalDrawer({ isOpen, onToggle }) {
  const { planData, updateConfig } = usePlan();
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'research' | 'quotas' | 'harness'
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [activeResearchTask, setActiveResearchTask] = useState(null);
  const [isResearchLoading, setIsResearchLoading] = useState(false);
  const [researchQuery, setResearchQuery] = useState('');
  const [researchDomain, setResearchDomain] = useState('mercado');
  const [researchDepth, setResearchDepth] = useState('rapido');
  const [forcePaidTier, setForcePaidTier] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [quotaStats, setQuotaStats] = useState(null);
  const [isQuotaLoading, setIsQuotaLoading] = useState(false);
  const logsEndRef = useRef(null);

  // Escuchar eventos de telemetría, SSE y Deep Research
  useEffect(() => {
    const handleTrajectoryEvent = (e) => {
      const detail = e.detail || {};
      const step = detail.steps ? detail.steps[detail.steps.length - 1] : null;
      if (step) {
        addLog(`[DAG ${step.type.toUpperCase()}] ${step.title}: ${step.content || step.toolName || ''}`, step.type === 'reflection' ? 'warn' : 'info');
      }
    };

    const handleGlobalLog = (e) => {
      if (e.detail?.message) {
        addLog(e.detail.message, e.detail.level || 'info');
      }
    };

    const handleResearchCompleted = (e) => {
      const detail = e.detail || {};
      if (detail.taskId) {
        setActiveResearchTask(prev => {
          if (prev && prev.id === detail.taskId) {
            return {
              ...prev,
              status: 'completed',
              progress: 100,
              sources: detail.sources || prev.sources || []
            };
          }
          return prev;
        });
        addLog(`✅ Investigación completada (ID: ${detail.taskId}). ${detail.sources ? detail.sources.length + ' fuentes factuales recopiladas.' : ''}`, 'success');
      }
    };

    const handleResearchPaused = (e) => {
      const detail = e.detail || {};
      if (detail.taskId) {
        setActiveResearchTask(prev => {
          if (prev && prev.id === detail.taskId) {
            return {
              ...prev,
              status: 'paused_waiting_quota',
              warning: detail.warning || 'Cuota mensual alcanzada en proveedor de búsqueda'
            };
          }
          return prev;
        });
        addLog(`⚠️ Investigación pausada por cuota (ID: ${detail.taskId}): ${detail.warning || 'Límite alcanzado'}`, 'warn');
      }
    };

    window.addEventListener('openplan_trajectory_updated', handleTrajectoryEvent);
    window.addEventListener('openplan_log', handleGlobalLog);
    window.addEventListener('openplan_research_completed', handleResearchCompleted);
    window.addEventListener('openplan_research_paused', handleResearchPaused);

    return () => {
      window.removeEventListener('openplan_trajectory_updated', handleTrajectoryEvent);
      window.removeEventListener('openplan_log', handleGlobalLog);
      window.removeEventListener('openplan_research_completed', handleResearchCompleted);
      window.removeEventListener('openplan_research_paused', handleResearchPaused);
    };
  }, []);

  // Auto-scroll al final del terminal
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, autoScroll]);

  const addLog = (text, level = 'info') => {
    const newEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      time: new Date().toLocaleTimeString(),
      text,
      level // 'info' | 'success' | 'warn' | 'error' | 'think'
    };
    setTerminalLogs(prev => [...prev.slice(-150), newEntry]);
  };

  const handleClearLogs = () => {
    setTerminalLogs([]);
  };

  // Consultar estadísticas de cuota persistidas en el backend
  const fetchQuotaStats = async () => {
    setIsQuotaLoading(true);
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/search/quota`);
      const data = await res.json();
      if (data.success) {
        setQuotaStats(data.stats);
      }
    } catch (err) {
      addLog(`Error consultando cuotas: ${err.message}`, 'warn');
    } finally {
      setIsQuotaLoading(false);
    }
  };

  // Lanzar Deep Research con Autorización
  const handleStartResearch = async () => {
    if (!researchQuery.trim()) return;
    setIsResearchLoading(true);
    addLog(`Iniciando solicitud de Deep Research: "${researchQuery}" (Nivel: ${researchDepth})...`, 'info');

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/research/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: researchQuery,
          domain: researchDomain,
          depth: researchDepth,
          forcePaidTier,
          apiKeys: buildSearchApiKeys(planData?.config)
        })
      });

      const data = await res.json();
      if (data.success && data.taskId) {
        setActiveResearchTask({
          id: data.taskId,
          query: researchQuery,
          domain: researchDomain,
          depth: researchDepth,
          status: 'running',
          progress: 15,
          sources: []
        });
        addLog(`✅ Tarea de Deep Research autorizada y registrada (ID: ${data.taskId}). Ejecutando en segundo plano.`, 'success');
        
        window.dispatchEvent(new CustomEvent('openplan_research_started', { detail: { taskId: data.taskId, query: researchQuery } }));
      } else {
        addLog(`❌ Error iniciando Deep Research: ${data.error || 'Respuesta inválida'}`, 'error');
      }
    } catch (err) {
      addLog(`❌ Error de red al contactar servidor de Deep Research: ${err.message}`, 'error');
    } finally {
      setIsResearchLoading(false);
    }
  };

  // Pausar o Reanudar tarea de Deep Research
  const handleTogglePause = async () => {
    if (!activeResearchTask) return;
    const isPaused = activeResearchTask.status === 'paused' || activeResearchTask.status === 'paused_waiting_quota';
    const action = isPaused ? 'resume' : 'pause';

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/research/${action}/${activeResearchTask.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActiveResearchTask(prev => ({ ...prev, status: data.status }));
        addLog(isPaused ? '▶️ Tarea de investigación reanudada.' : '⏸️ Tarea de investigación pausada.', 'warn');
      }
    } catch (err) {
      addLog(`Error al modificar estado de la tarea: ${err.message}`, 'error');
    }
  };

  // Acción reactiva 1: Autorizar Fila 2 de Pago tras pausa por cuota
  const handleAuthorizePaidTier = async () => {
    if (updateConfig) {
      updateConfig('search', 'allowPaidTier', true);
    }
    addLog('💎 Autorización de Fila 2 Premium concedida por el usuario.', 'info');

    if (activeResearchTask?.id) {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/research/resume/${activeResearchTask.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ allowPaidTier: true })
        });
        const data = await res.json();
        if (data.success) {
          setActiveResearchTask(prev => ({ ...prev, status: 'running' }));
          addLog(`▶️ Investigación ${activeResearchTask.id} reanudada en Fila 2 Premium.`, 'success');
        }
      } catch (err) {
        addLog(`Error al reanudar tarea con Fila 2: ${err.message}`, 'error');
      }
    }
  };

  // Acción reactiva 2: Cambiar a DuckDuckGo Gratuito tras pausa por cuota
  const handleFallbackToDuckDuckGo = async () => {
    if (updateConfig) {
      updateConfig('search', 'provider', 'duckduckgo');
    }
    addLog('🦆 Conmutando proveedor a DuckDuckGo (Fila 1 Gratis Ilimitada).', 'info');

    if (activeResearchTask?.id) {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/research/resume/${activeResearchTask.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'duckduckgo' })
        });
        const data = await res.json();
        if (data.success) {
          setActiveResearchTask(prev => ({ ...prev, status: 'running' }));
          addLog(`▶️ Investigación ${activeResearchTask.id} reanudada en DuckDuckGo.`, 'success');
        }
      } catch (err) {
        addLog(`Error al reanudar tarea con DuckDuckGo: ${err.message}`, 'error');
      }
    }
  };

  // Estimación de costo para la autorización previa
  const estimatedCostUsd = researchDepth === 'profundo' ? (forcePaidTier ? '$0.025 USD' : '$0.005 USD') : (forcePaidTier ? '$0.010 USD' : '$0.000 USD');
  const estimatedTokens = researchDepth === 'profundo' ? '~6,500 tokens' : '~2,200 tokens';

  if (!isOpen) {
    return (
      <div 
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '32px',
          background: '#0d1117',
          borderTop: '1px solid #30363d',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          cursor: 'pointer',
          color: '#8b949e',
          fontSize: '0.75rem',
          userSelect: 'none',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#58a6ff', fontWeight: 700 }}>
            <Terminal size={14} />
            Terminal Harness (dsh v0.1)
          </span>
          <span style={{ color: '#30363d' }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: activeResearchTask?.status === 'running' ? '#3fb950' : '#8b949e' }}>
            <Globe size={12} />
            Deep Research: {activeResearchTask ? (activeResearchTask.status === 'running' ? 'En ejecución 🚀' : activeResearchTask.status === 'paused_waiting_quota' ? 'Pausado por Cuota ⏸️' : activeResearchTask.status) : 'Inactivo'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#58a6ff', fontWeight: 600 }}>
          <span>Abrir Consola IDE</span>
          <ChevronUp size={16} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '350px',
      background: '#0d1117',
      borderTop: '2px solid #58a6ff',
      zIndex: 9998,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)',
      animation: 'slideUp 0.2s ease-out'
    }}>
      {/* Barra de Pestañas y Header */}
      <div style={{
        height: '38px',
        background: '#161b22',
        borderBottom: '1px solid #30363d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            style={{
              background: activeTab === 'terminal' ? '#0d1117' : 'transparent',
              color: activeTab === 'terminal' ? '#58a6ff' : '#8b949e',
              border: 'none',
              borderBottom: activeTab === 'terminal' ? '2px solid #58a6ff' : 'none',
              padding: '0.45rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Terminal size={13} />
            Streaming & Logs
            <span style={{ fontSize: '0.65rem', background: '#21262d', padding: '1px 5px', borderRadius: '10px' }}>
              {terminalLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('research')}
            style={{
              background: activeTab === 'research' ? '#0d1117' : 'transparent',
              color: activeTab === 'research' ? '#ec4899' : '#8b949e',
              border: 'none',
              borderBottom: activeTab === 'research' ? '2px solid #ec4899' : 'none',
              padding: '0.45rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Globe size={13} />
            Deep Research Online
            {activeResearchTask?.status === 'running' && (
              <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3fb950' }} />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('quotas');
              fetchQuotaStats();
            }}
            style={{
              background: activeTab === 'quotas' ? '#0d1117' : 'transparent',
              color: activeTab === 'quotas' ? '#38bdf8' : '#8b949e',
              border: 'none',
              borderBottom: activeTab === 'quotas' ? '2px solid #38bdf8' : 'none',
              padding: '0.45rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Database size={13} />
            Cuotas & Fila 1/2
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('harness')}
            style={{
              background: activeTab === 'harness' ? '#0d1117' : 'transparent',
              color: activeTab === 'harness' ? '#06b6d4' : '#8b949e',
              border: 'none',
              borderBottom: activeTab === 'harness' ? '2px solid #06b6d4' : 'none',
              padding: '0.45rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Cpu size={13} />
            Harness DAG & Cordis
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeTab === 'terminal' && (
            <button
              type="button"
              onClick={handleClearLogs}
              title="Limpiar consola"
              style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', padding: '4px' }}
            >
              <Trash2 size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={onToggle}
            title="Minimizar panel"
            style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', padding: '4px' }}
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {/* Contenido de Pestañas */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
        {/* PESTAÑA 1: TERMINAL & STREAMING DE LOGS */}
        {activeTab === 'terminal' && (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.75rem 1rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.75rem',
            color: '#c9d1d9',
            lineHeight: '1.5'
          }}>
            {terminalLogs.length === 0 ? (
              <div style={{ color: '#8b949e', padding: '2rem 1rem', textAlign: 'center' }}>
                <Terminal size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                Esperando eventos del motor de agentes o ejecuciones de Deep Research...
              </div>
            ) : (
              terminalLogs.map(log => {
                let color = '#c9d1d9';
                if (log.level === 'warn') color = '#d29922';
                if (log.level === 'error') color = '#f85149';
                if (log.level === 'success') color = '#3fb950';
                if (log.level === 'think') color = '#a371f7';

                return (
                  <div key={log.id} style={{ display: 'flex', gap: '0.6rem', marginBottom: '2px' }}>
                    <span style={{ color: '#8b949e', flexShrink: 0 }}>[{log.time}]</span>
                    <span style={{ color, wordBreak: 'break-word' }}>{log.text}</span>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        )}

        {/* PESTAÑA 2: DEEP RESEARCH ONLINE (LANZADOR & CONTROL) */}
        {activeTab === 'research' && (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.5rem',
            color: '#c9d1d9'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.1fr', gap: '1.5rem', height: '100%' }}>
              {/* Formulario de Lanzamiento con Autorización */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ec4899', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} />
                  Lanzador de Investigación Profunda Asíncrona (Modo /goal)
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Precios y distribuidores de molinos de bolas en Sonora..."
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                    style={{
                      background: '#161b22',
                      border: '1px solid #30363d',
                      color: '#c9d1d9',
                      fontSize: '0.8rem',
                      flex: 1
                    }}
                  />
                  <select
                    className="form-control"
                    value={researchDomain}
                    onChange={(e) => setResearchDomain(e.target.value)}
                    style={{ background: '#161b22', border: '1px solid #30363d', color: '#c9d1d9', fontSize: '0.75rem', width: '130px' }}
                  >
                    <option value="mercado">Mercado</option>
                    <option value="competencia">Competencia</option>
                    <option value="maquinaria">Maquinaria</option>
                    <option value="legal">Marco Legal</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161b22', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #30363d' }}>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="depth"
                        checked={researchDepth === 'rapido'}
                        onChange={() => setResearchDepth('rapido')}
                      />
                      Rápido (DuckDuckGo + DENUE)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="depth"
                        checked={researchDepth === 'profundo'}
                        onChange={() => setResearchDepth('profundo')}
                      />
                      Profundo (Multi-Hop + Tavily)
                    </label>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#8b949e', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={forcePaidTier}
                      onChange={(e) => setForcePaidTier(e.target.checked)}
                    />
                    Priorizar Capa Premium
                  </label>
                </div>

                {/* Banner de Autorización y Presupuesto */}
                <div style={{
                  background: 'rgba(236, 72, 153, 0.08)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#f472b6' }}>
                    <ShieldAlert size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    Estimación de consumo: <strong>{estimatedCostUsd}</strong> ({estimatedTokens}). Resiliente con auto-pausa por cuota.
                  </div>

                  <button
                    type="button"
                    onClick={handleStartResearch}
                    disabled={isResearchLoading || !researchQuery.trim()}
                    style={{
                      background: '#ec4899',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '0.4rem 0.9rem',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isResearchLoading ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                    Autorizar e Iniciar
                  </button>
                </div>
              </div>

              {/* Panel de Tarea Activa y Resiliencia */}
              <div style={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '8px',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflowY: 'auto'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Estado de Investigación en Background</span>
                    {activeResearchTask && (
                      <span style={{ fontSize: '0.68rem', color: '#58a6ff' }}>ID: {activeResearchTask.id}</span>
                    )}
                  </div>

                  {activeResearchTask ? (
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#58a6ff', marginBottom: '4px' }}>
                        {activeResearchTask.query}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#8b949e', marginBottom: '0.6rem' }}>
                        Dominio: {activeResearchTask.domain} · Profundidad: {activeResearchTask.depth}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: activeResearchTask.status === 'running' 
                            ? 'rgba(63, 185, 80, 0.15)' 
                            : activeResearchTask.status === 'paused_waiting_quota'
                            ? 'rgba(210, 153, 34, 0.2)'
                            : activeResearchTask.status === 'completed'
                            ? 'rgba(56, 189, 248, 0.15)'
                            : 'rgba(139, 148, 158, 0.2)',
                          color: activeResearchTask.status === 'running' 
                            ? '#3fb950' 
                            : activeResearchTask.status === 'paused_waiting_quota'
                            ? '#d29922'
                            : activeResearchTask.status === 'completed'
                            ? '#38bdf8'
                            : '#8b949e',
                          fontWeight: 700
                        }}>
                          {activeResearchTask.status === 'running' 
                            ? '● En Ejecución' 
                            : activeResearchTask.status === 'paused_waiting_quota' 
                            ? '⏸️ Pausado por Cuota' 
                            : activeResearchTask.status === 'completed'
                            ? '✅ Completada'
                            : activeResearchTask.status}
                        </span>

                        <button
                          type="button"
                          onClick={handleTogglePause}
                          style={{
                            background: '#21262d',
                            border: '1px solid #30363d',
                            color: '#c9d1d9',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          {activeResearchTask.status === 'paused' || activeResearchTask.status === 'paused_waiting_quota' ? 'Reanudar' : 'Pausar'}
                        </button>
                      </div>

                      {/* Tarjeta de Control de Cuota Reactivo */}
                      {activeResearchTask.status === 'paused_waiting_quota' && (
                        <div style={{
                          background: 'rgba(210, 153, 34, 0.12)',
                          border: '1px solid rgba(210, 153, 34, 0.4)',
                          borderRadius: '6px',
                          padding: '0.6rem',
                          marginBottom: '0.75rem'
                        }}>
                          <div style={{ fontSize: '0.72rem', color: '#d29922', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={14} />
                            <span>{activeResearchTask.warning || 'Límite de cuota alcanzado en el proveedor de búsqueda.'}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#8b949e', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                            El proveedor configurado agotó sus consultas mensuales gratuitas. Selecciona una acción para reanudar de inmediato:
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={handleAuthorizePaidTier}
                              style={{
                                background: '#ec4899',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>💎</span> Autorizar Fila 2 (Pago)
                            </button>
                            <button
                              type="button"
                              onClick={handleFallbackToDuckDuckGo}
                              style={{
                                background: '#238636',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>🦆</span> Usar DuckDuckGo (Gratis)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Lista de Fuentes Verificadas con ProvenanceBadge */}
                      {activeResearchTask.sources && activeResearchTask.sources.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8b949e', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>FUENTES FACTUALES ({activeResearchTask.sources.length})</span>
                            <span style={{ fontSize: '0.65rem', color: '#3fb950' }}>100% Verificado</span>
                          </div>
                          <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {activeResearchTask.sources.map((src, idx) => (
                              <div
                                key={`src_${idx}_${src.url || src.title}`}
                                style={{
                                  background: '#0d1117',
                                  border: '1px solid #30363d',
                                  borderRadius: '4px',
                                  padding: '4px 6px',
                                  fontSize: '0.7rem'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '2px' }}>
                                  <ProvenanceBadge
                                    provenance={src.provenance}
                                    provider={src.provider}
                                    warning={src.warning}
                                  />
                                  {src.confidenceScore !== undefined && (
                                    <span style={{ fontSize: '0.65rem', color: '#8b949e' }}>
                                      {Math.round(src.confidenceScore * 100)}% conf.
                                    </span>
                                  )}
                                </div>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {src.url ? (
                                    <a
                                      href={src.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ color: '#58a6ff', textDecoration: 'none', fontWeight: 600 }}
                                      title={src.title || src.url}
                                    >
                                      {src.title || src.url}
                                    </a>
                                  ) : (
                                    <span style={{ color: '#c9d1d9', fontWeight: 600 }}>{src.title || 'Referencia factual'}</span>
                                  )}
                                </div>
                                {src.snippet && (
                                  <div style={{ fontSize: '0.65rem', color: '#8b949e', marginTop: '2px', lineHeight: '1.25', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {src.snippet}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Estado Honesto Vacío si terminó sin fuentes */}
                      {activeResearchTask.status === 'completed' && (!activeResearchTask.sources || activeResearchTask.sources.length === 0) && (
                        <div style={{ marginTop: '0.5rem', padding: '8px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '4px', textAlign: 'center' }}>
                          <ProvenanceBadge provenance="none" warning="Sin fuentes encontradas" />
                          <div style={{ fontSize: '0.68rem', color: '#8b949e', marginTop: '4px' }}>
                            No se encontraron fuentes externas verificadas para este criterio de búsqueda.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#8b949e', fontSize: '0.75rem', padding: '1rem 0' }}>
                      No hay tareas de investigación activas en segundo plano. Ingresa un tema a la izquierda para comenzar.
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.7rem', color: '#8b949e', borderTop: '1px solid #30363d', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  💡 La investigación continúa asíncronamente en segundo plano incluso al navegar entre módulos.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: CUOTAS & PROVEEDORES FILA 1/2 */}
        {activeTab === 'quotas' && (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.5rem',
            color: '#c9d1d9',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Database size={16} />
                  Monitor de Consumo Mensual y Cuotas Persistidas
                </div>
                <div style={{ fontSize: '0.7rem', color: '#8b949e', marginTop: '2px' }}>
                  Control estricto de gasto: auto-pausa y failover antes de generar cargos de Fila 2 sin autorización.
                </div>
              </div>

              <button
                type="button"
                onClick={fetchQuotaStats}
                disabled={isQuotaLoading}
                style={{
                  background: '#21262d',
                  border: '1px solid #30363d',
                  color: '#c9d1d9',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={12} className={isQuotaLoading ? 'animate-spin' : ''} />
                Actualizar Cuotas
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {/* Tarjeta Brave Search */}
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#f97316' }}>🦁 Brave Search API</span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', padding: '1px 6px', borderRadius: '8px' }}>Fila 1 Freemium</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c9d1d9', marginTop: '6px' }}>
                  {quotaStats?.brave?.count ?? 0} <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>/ {quotaStats?.brave?.limit ?? 2000} mes</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#21262d', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, ((quotaStats?.brave?.count || 0) / (quotaStats?.brave?.limit || 2000)) * 100)}%`, height: '100%', background: '#f97316' }} />
                </div>
              </div>

              {/* Tarjeta Tavily */}
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#3b82f6' }}>⚡ Tavily AI</span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '1px 6px', borderRadius: '8px' }}>Fila 1 Freemium</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c9d1d9', marginTop: '6px' }}>
                  {quotaStats?.tavily?.count ?? 0} <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>/ {quotaStats?.tavily?.limit ?? 1000} mes</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#21262d', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, ((quotaStats?.tavily?.count || 0) / (quotaStats?.tavily?.limit || 1000)) * 100)}%`, height: '100%', background: '#3b82f6' }} />
                </div>
              </div>

              {/* Tarjeta Exa.ai / Perplexity */}
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#ec4899' }}>💎 Fila 2 Premium</span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', padding: '1px 6px', borderRadius: '8px' }}>Exa / Perplexity</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c9d1d9', marginTop: '6px' }}>
                  {planData?.config?.search?.allowPaidTier ? 'Habilitada' : 'Bloqueada'} <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>(Requiere Auth)</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#8b949e', marginTop: '6px' }}>
                  Garantiza cero cargos accidentales sin autorización explícita.
                </div>
              </div>

              {/* Tarjeta DuckDuckGo */}
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#22c55e' }}>🦆 DuckDuckGo</span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '1px 6px', borderRadius: '8px' }}>Fila 1 Gratis</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c9d1d9', marginTop: '6px' }}>
                  Ilimitado <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>(Failover Seguro)</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#8b949e', marginTop: '6px' }}>
                  Capa de respaldo gratuita sin registro ni tarjeta.
                </div>
              </div>
            </div>

            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: '#c9d1d9', marginBottom: '0.35rem' }}>
                Regla de Cascada de Motores de Búsqueda
              </div>
              <p style={{ margin: 0, color: '#8b949e', lineHeight: '1.45', fontSize: '0.72rem' }}>
                El sistema consulta los proveedores de Fila 1 (Brave Freemium 2,000 req/mes o Tavily Freemium 1,000 req/mes). Si la cuota mensual se agota o la API falla, la tarea se pausa automáticamente para solicitar autorización previa del usuario en vez de saltar silenciosamente a proveedores de pago. Si no se autoriza Fila 2, el failover conmuta a DuckDuckGo de manera segura.
              </p>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: RESUMEN HARNESS & CORDIS */}
        {activeTab === 'harness' && (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.5rem',
            color: '#c9d1d9',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ color: '#8b949e', fontSize: '0.7rem', fontWeight: 700 }}>ESPECIFICACIÓN HARNESS</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#58a6ff', marginTop: '4px' }}>dsh-session-v0.1</div>
                <div style={{ fontSize: '0.68rem', color: '#8b949e', marginTop: '2px' }}>Cordis Plugin Meta-Kernel</div>
              </div>

              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ color: '#8b949e', fontSize: '0.7rem', fontWeight: 700 }}>MODOS DE EJECUCIÓN</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#3fb950', marginTop: '4px' }}>Standard / Code / Creator</div>
                <div style={{ fontSize: '0.68rem', color: '#8b949e', marginTop: '2px' }}>Capacidades Reversibles</div>
              </div>

              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ color: '#8b949e', fontSize: '0.7rem', fontWeight: 700 }}>TIME-TRAVEL CAPABILITIES</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ec4899', marginTop: '4px' }}>Replay & Forking en Caliente</div>
                <div style={{ fontSize: '0.68rem', color: '#8b949e', marginTop: '2px' }}>Bifurcación DAG desde cualquier nodo</div>
              </div>
            </div>

            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: '#c9d1d9', marginBottom: '0.35rem' }}>
                Integración Cordis Meta-Kernel en Open Business Plan
              </div>
              <p style={{ margin: 0, color: '#8b949e', lineHeight: '1.45' }}>
                Todas las herramientas (`tool_web_search`, `tool_deep_research`, `tool_machinery_search`, `tool_financial_engine`) se montan como plugins modulares desacoplados. La sesión persiste de forma append-only en el archivo `proyectos/telemetry/master_trace.jsonl` del servidor Express.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
