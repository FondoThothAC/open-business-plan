import { useState, useEffect } from 'react';
import { Bot, Wrench, Eye, Scale, CheckCircle, Clock, Cpu, X, Copy, Download, ChevronDown, ChevronRight, Sparkles, Activity } from 'lucide-react';

const STEP_TYPE_CONFIG = {
  thought: {
    label: 'Pensamiento / CoT',
    icon: Bot,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)'
  },
  tool_call: {
    label: 'Invocación de Herramienta',
    icon: Wrench,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  observation: {
    label: 'Observación de Datos',
    icon: Eye,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  reflection: {
    label: 'Reflexión y Control Crítico',
    icon: Scale,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  synthesis: {
    label: 'Síntesis y Consolidación',
    icon: CheckCircle,
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.3)'
  }
};

export default function AgentTrajectoryViewer({ trajectory, onClose }) {
  if (!trajectory) return null;

  const [expandedNodes, setExpandedNodes] = useState({});
  const [filterType, setFilterType] = useState('all'); // 'all' | 'tools' | 'thoughts'
  
  // Estados para Replay interactivo
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1); // 1x, 2x, 5x

  // Estados para Modal de Forking en Caliente
  const [forkModalNode, setForkModalNode] = useState(null);
  const [forkModel, setForkModel] = useState(trajectory.modelUsed || 'gpt-5.2');
  const [forkProvider, setForkProvider] = useState(trajectory.providerUsed || 'bai');
  const [forkNote, setForkNote] = useState('');
  const [forkSuccessMsg, setForkSuccessMsg] = useState(null);

  const steps = trajectory.trajectoryDAG || trajectory.steps || [];

  // Temporizador para el Replay animado
  useEffect(() => {
    let timer = null;
    if (isReplaying) {
      const stepDuration = Math.max(300, (steps[replayIndex]?.durationMs || 1000) / replaySpeed);
      timer = setTimeout(() => {
        if (replayIndex < steps.length - 1) {
          setReplayIndex(prev => prev + 1);
        } else {
          setIsReplaying(false);
        }
      }, stepDuration);
    }
    return () => clearTimeout(timer);
  }, [isReplaying, replayIndex, steps, replaySpeed]);

  const toggleNode = (idx) => {
    setExpandedNodes(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const visibleSteps = isReplaying ? steps.slice(0, replayIndex + 1) : steps;

  const filteredSteps = visibleSteps.filter(step => {
    if (filterType === 'tools') return step.type === 'tool_call' || step.type === 'observation';
    if (filterType === 'thoughts') return step.type === 'thought' || step.type === 'reflection';
    return true;
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(trajectory, null, 2));
    alert('¡Trayectoria en formato DeepSeek Harness copiada al portapapeles!');
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(trajectory, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trajectory_${trajectory.pillar}_${trajectory.moduleKey}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartReplay = () => {
    setReplayIndex(0);
    setIsReplaying(true);
  };

  const handleExecuteFork = () => {
    if (!forkModalNode) return;

    // Disparar evento para reanudar la trayectoria con la bifurcación en caliente
    const forkedPayload = {
      parentSessionId: trajectory.id,
      forkedFromNodeId: forkModalNode.id || `node_${forkModalNode.stepIndex}`,
      targetModuleKey: trajectory.moduleKey,
      targetPillar: trajectory.pillar,
      model: forkModel,
      provider: forkProvider,
      branchNote: forkNote || `Bifurcación desde ${forkModalNode.title}`,
      inheritedStepsCount: forkModalNode.stepIndex
    };

    window.dispatchEvent(new CustomEvent('openplan_fork_trajectory', { detail: forkedPayload }));
    setForkSuccessMsg(`✅ Bifurcación creada exitosamente desde "${forkModalNode.title}". La nueva rama está activa.`);
    setTimeout(() => {
      setForkModalNode(null);
      setForkSuccessMsg(null);
    }, 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(14px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.25s ease'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '940px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleUp 0.25s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con Metadata estilo DeepSeek Harness */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.05))'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <Sparkles size={20} color="var(--accent-color)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                DeepSeek Harness · Trajectory DAG
              </h2>
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06b6d4',
                fontWeight: 800,
                border: '1px solid rgba(6, 182, 212, 0.3)'
              }}>
                {trajectory.harnessVersion || 'dsh-session-v0.1'}
              </span>
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#8b5cf6',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                Modo: {trajectory.mode || 'Standard'}
              </span>
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: trajectory.status === 'paused_waiting_quota' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                color: trajectory.status === 'paused_waiting_quota' ? '#f59e0b' : '#10b981',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {trajectory.status === 'paused_waiting_quota' ? '⏸️ PAUSADO POR CUOTA' : (trajectory.status || 'COMPLETADO')}
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span><strong>Módulo:</strong> {trajectory.moduleTitle || trajectory.moduleKey}</span>
              <span><strong>Pilar:</strong> {trajectory.pillar}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Cpu size={12} color="var(--accent-color)" />
                <strong>Modelo:</strong> {trajectory.modelUsed || 'minimax-m3:cloud'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={12} color="#60a5fa" />
                <strong>Duración:</strong> {((trajectory.totalDurationMs || 0) / 1000).toFixed(2)}s
              </span>
              {trajectory.parentSessionId && (
                <span style={{ color: '#ec4899', fontWeight: 700 }}>
                  🔀 Bifurcación de: {trajectory.parentSessionId.slice(0, 16)}... ({trajectory.forkedFromNodeId})
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleCopyJson}
              title="Copiar JSON DeepSeek Harness"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600
              }}
            >
              <Copy size={13} />
              <span>Copiar</span>
            </button>

            <button
              onClick={handleDownloadJson}
              title="Descargar Traza JSON"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600
              }}
            >
              <Download size={13} />
              <span>Descargar</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                padding: '0.4rem',
                cursor: 'pointer',
                borderRadius: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Barra de Replay & Time-Travel Controls */}
        <div style={{
          padding: '0.65rem 1.5rem',
          background: 'rgba(99, 102, 241, 0.06)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => isReplaying ? setIsReplaying(false) : handleStartReplay()}
              style={{
                background: isReplaying ? '#f59e0b' : 'var(--accent-color)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.8rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {isReplaying ? '⏸️ Pausar Replay' : '▶️ Iniciar Replay'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsReplaying(false);
                setReplayIndex(steps.length - 1);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.35rem 0.6rem',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              Saltar al Final
            </button>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Paso {replayIndex + 1} de {steps.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Velocidad:</span>
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                type="button"
                onClick={() => setReplaySpeed(spd)}
                style={{
                  background: replaySpeed === spd ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: replaySpeed === spd ? '#06b6d4' : 'var(--text-secondary)',
                  border: `1px solid ${replaySpeed === spd ? '#06b6d4' : 'var(--border-color)'}`,
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Barra de Filtros y Métricas */}
        <div style={{
          padding: '0.5rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.15)',
          fontSize: '0.75rem'
        }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['all', 'tools', 'thoughts'].map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                style={{
                  background: filterType === f ? 'var(--accent-color)' : 'transparent',
                  color: filterType === f ? 'white' : 'var(--text-secondary)',
                  border: filterType === f ? 'none' : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.25rem 0.65rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase'
                }}
              >
                {f === 'all' ? `Todos los Pasos (${steps.length})` : f === 'tools' ? 'Herramientas / Tools' : 'Razonamiento / CoT'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>🛠️ Tools: {trajectory.metrics?.totalToolCalls || 0}</span>
            <span>⚖️ Aprobación Crítica: {trajectory.metrics?.criticApprovals || 0}</span>
            <span>🌳 Nodos DAG: {steps.length}</span>
          </div>
        </div>

        {/* Línea de Tiempo del Árbol DAG de Pasos */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {filteredSteps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Activity size={36} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
              <p>No hay pasos que coincidan con el filtro seleccionado.</p>
            </div>
          ) : (
            filteredSteps.map((step, idx) => {
              const cfg = STEP_TYPE_CONFIG[step.type] || STEP_TYPE_CONFIG.thought;
              const Icon = cfg.icon;
              const isExpanded = !!expandedNodes[idx];
              const hasJsonData = !!(step.toolArgs || step.toolResult);
              const isCurrentReplayNode = isReplaying && idx === replayIndex;

              return (
                <div
                  key={step.id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: cfg.bgColor,
                    border: `1.5px solid ${isCurrentReplayNode ? '#38bdf8' : cfg.borderColor}`,
                    boxShadow: isCurrentReplayNode ? '0 0 16px rgba(56, 189, 248, 0.4)' : 'none',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Step Header */}
                  <div
                    onClick={() => toggleNode(idx)}
                    style={{
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: cfg.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={15} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: cfg.color, fontWeight: 700, textTransform: 'uppercase' }}>
                          {cfg.label} {step.toolName ? `· [${step.toolName}]` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {/* Botón Fork en Caliente */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForkModalNode(step);
                        }}
                        title="Bifurcar trayectoria desde este nodo"
                        style={{
                          background: 'rgba(236, 72, 153, 0.15)',
                          border: '1px solid rgba(236, 72, 153, 0.4)',
                          color: '#ec4899',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>🔀 Fork</span>
                      </button>

                      {step.durationMs > 0 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          +{step.durationMs}ms
                        </span>
                      )}
                      {hasJsonData && (
                        <span style={{
                          fontSize: '0.62rem',
                          background: 'rgba(255, 255, 255, 0.08)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)'
                        }}>
                          JSON
                        </span>
                      )}
                      {isExpanded ? <ChevronDown size={16} color="var(--text-secondary)" /> : <ChevronRight size={16} color="var(--text-secondary)" />}
                    </div>
                  </div>

                  {/* Step Content Details */}
                  <div style={{
                    padding: '0 1rem 0.85rem 1rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    lineHeight: '1.45'
                  }}>
                    <p style={{ margin: 0 }}>{step.content}</p>

                    {/* Collapsible JSON payload inspector */}
                    {isExpanded && hasJsonData && (
                      <div style={{
                        marginTop: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.4)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        fontSize: '0.72rem',
                        fontFamily: 'monospace',
                        overflowX: 'auto',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}>
                        {step.toolArgs && (
                          <div>
                            <strong style={{ color: '#60a5fa' }}>Argumentos de Invocación (Input):</strong>
                            <pre style={{ margin: '4px 0 8px', whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(step.toolArgs, null, 2)}
                            </pre>
                          </div>
                        )}
                        {step.toolResult && (
                          <div>
                            <strong style={{ color: '#34d399' }}>Resultado Devuelto (Observation Output):</strong>
                            <pre style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(step.toolResult, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal de Forking en Caliente */}
        {forkModalNode && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 100000
          }}>
            <div style={{
              background: 'var(--bg-panel)',
              border: '1.5px solid #ec4899',
              borderRadius: '14px',
              padding: '1.5rem',
              width: '520px',
              maxWidth: '92vw',
              boxShadow: '0 20px 50px rgba(236, 72, 153, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ec4899', fontWeight: 800 }}>
                  🔀 Bifurcar Trayectoria (Fork)
                </h3>
                <button
                  type="button"
                  onClick={() => setForkModalNode(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Se clonarán los primeros <strong>{forkModalNode.stepIndex} pasos</strong> hasta <em>"{forkModalNode.title}"</em>. La nueva rama continuará la ejecución con los parámetros que indiques a continuación:
              </p>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Proveedor y Modelo para la nueva rama:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <select
                    className="form-control"
                    value={forkProvider}
                    onChange={(e) => setForkProvider(e.target.value)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <option value="bai">⚡ B.AI</option>
                    <option value="groq">⚡ Groq</option>
                    <option value="gemini">🌐 Google Gemini</option>
                    <option value="ollama">💻 Ollama Local</option>
                  </select>
                  <select
                    className="form-control"
                    value={forkModel}
                    onChange={(e) => setForkModel(e.target.value)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <option value="gpt-5.2">gpt-5.2</option>
                    <option value="qwen3.8-flash">qwen3.8-flash</option>
                    <option value="llama-3.3-70b-versatile">llama-3.3-70b</option>
                    <option value="minimax-m3:cloud">minimax-m3:cloud</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Nota o hipótesis de la bifurcación:
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Ej. Simular escenario alternativo con mayor volumen de ventas o costos más bajos..."
                  value={forkNote}
                  onChange={(e) => setForkNote(e.target.value)}
                  style={{ fontSize: '0.8rem', width: '100%' }}
                />
              </div>

              {forkSuccessMsg && (
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, marginBottom: '1rem' }}>
                  {forkSuccessMsg}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setForkModalNode(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExecuteFork}
                  className="btn btn-primary"
                  style={{ background: '#ec4899', borderColor: '#ec4899', fontSize: '0.8rem', fontWeight: 800 }}
                >
                  Confirmar y Crear Fork
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
