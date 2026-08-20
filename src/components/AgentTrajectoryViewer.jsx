import { useState } from 'react';
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

  const toggleNode = (idx) => {
    setExpandedNodes(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const steps = trajectory.trajectoryDAG || trajectory.steps || [];
  
  const filteredSteps = steps.filter(step => {
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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(12px)',
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
          width: '900px',
          maxWidth: '96vw',
          maxHeight: '90vh',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5)',
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
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.04))'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={20} color="var(--accent-color)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Trayectoria Agéntica · DeepSeek Harness
              </h2>
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {trajectory.status || 'COMPLETADO'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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

        {/* Barra de Filtros y Métricas */}
        <div style={{
          padding: '0.6rem 1.5rem',
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

              return (
                <div
                  key={step.id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: cfg.bgColor,
                    border: `1px solid ${cfg.borderColor}`,
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
      </div>
    </div>
  );
}
