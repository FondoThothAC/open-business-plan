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
  Sparkles
} from 'lucide-react';
import { getApiBase } from '../config/apiConfig.js';
import { usePlan } from '../context/PlanContext.jsx';
import { buildSearchApiKeys } from '../lib/tools/provenance.js';

export default function TerminalDrawer({ isOpen, onToggle }) {
  const { planData } = usePlan();
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'research' | 'harness' | 'quotas'
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [activeResearchTask, setActiveResearchTask] = useState(null);
  const [isResearchLoading, setIsResearchLoading] = useState(false);
  const [researchQuery, setResearchQuery] = useState('');
  const [researchDomain, setResearchDomain] = useState('mercado');
  const [researchDepth, setResearchDepth] = useState('rapido');
  const [forcePaidTier, setForcePaidTier] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);

  // Escuchar eventos de telemetría y SSE
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

    window.addEventListener('openplan_trajectory_updated', handleTrajectoryEvent);
    window.addEventListener('openplan_log', handleGlobalLog);

    return () => {
      window.removeEventListener('openplan_trajectory_updated', handleTrajectoryEvent);
      window.removeEventListener('openplan_log', handleGlobalLog);
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
          progress: 15
        });
        addLog(`✅ Tarea de Deep Research autorizada y registrada (ID: ${data.taskId}). Ejecutando en segundo plano.`, 'success');
        
        // Disparar evento para campana de notificaciones
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
            Terminal DeepSeek Harness (dsh v0.1)
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
      height: '340px',
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
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', height: '100%' }}>
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
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Estado de Investigación en Background
                  </div>

                  {activeResearchTask ? (
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#58a6ff', marginBottom: '4px' }}>
                        {activeResearchTask.query}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#8b949e', marginBottom: '0.75rem' }}>
                        ID: {activeResearchTask.id} · Nivel: {activeResearchTask.depth}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: activeResearchTask.status === 'running' ? 'rgba(63, 185, 80, 0.15)' : 'rgba(210, 153, 34, 0.2)',
                          color: activeResearchTask.status === 'running' ? '#3fb950' : '#d29922',
                          fontWeight: 700
                        }}>
                          {activeResearchTask.status === 'running' ? '● En Ejecución' : activeResearchTask.status === 'paused_waiting_quota' ? '⏸️ Pausado por Cuota' : activeResearchTask.status}
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

                      {activeResearchTask.status === 'paused_waiting_quota' && (
                        <div style={{ fontSize: '0.72rem', color: '#d29922', background: 'rgba(210,153,34,0.1)', padding: '6px 8px', borderRadius: '6px' }}>
                          ⚠️ Proveedor saturado o rate limit alcanzado. Se reanudará automáticamente al liberarse la cuota.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#8b949e', fontSize: '0.75rem', padding: '1rem 0' }}>
                      No hay tareas de investigación activas en segundo plano. Ingresa un tema a la izquierda para comenzar.
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.7rem', color: '#8b949e', borderTop: '1px solid #30363d', paddingTop: '0.5rem' }}>
                  💡 La investigación continuará incluso si cierras este panel o navegas a otros módulos.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: RESUMEN HARNESS & CORDIS */}
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
