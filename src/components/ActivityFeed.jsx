import { useState, useEffect, useRef } from 'react';
import { Activity, X, Minimize2, Maximize2, Bot, CheckCircle, AlertTriangle, XCircle, Zap, Cloud, Save, Sparkles, Cpu, Clock, ChevronRight } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { getApiBase } from '../config/apiConfig';
import { getSavedTrajectories } from '../lib/agenticEngine';
import AgentTrajectoryViewer from './AgentTrajectoryViewer';

const TYPE_CONFIG = {
  connected: { icon: CheckCircle, color: '#10b981', label: 'Conectado' },
  start:     { icon: Zap,          color: '#6366f1', label: 'Inicio'   },
  thinking:  { icon: Bot,          color: '#a78bfa', label: 'Pensando' },
  stage:     { icon: Activity,     color: '#60a5fa', label: 'Proceso'  },
  success:   { icon: CheckCircle,  color: '#10b981', label: 'Éxito'    },
  warning:   { icon: AlertTriangle,color: '#f59e0b', label: 'Aviso'    },
  error:     { icon: XCircle,      color: '#ef4444', label: 'Error'    },
  fallback:  { icon: Cloud,        color: '#818cf8', label: 'Nube'     },
  save:      { icon: Save,         color: '#34d399', label: 'Guardado' },
};

function LogLine({ entry, index }) {
  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.stage;
  const Icon = cfg.icon;
  const elapsed = entry.elapsed ? ` · ${(entry.elapsed / 1000).toFixed(1)}s` : '';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.6rem',
        padding: '0.45rem 0.75rem',
        borderRadius: '8px',
        background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
        borderLeft: `3px solid ${cfg.color}`,
        animation: 'fadeInLog 0.3s ease-out',
      }}
    >
      <Icon style={{ color: cfg.color, flexShrink: 0, marginTop: '2px' }} size={13} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {entry.module && (
          <span style={{
            fontSize: '0.65rem', fontWeight: '700',
            color: cfg.color, textTransform: 'uppercase',
            letterSpacing: '0.05em', marginRight: '0.4rem'
          }}>
            {entry.module}
          </span>
        )}
        {entry.provider && (
          <span style={{
            fontSize: '0.6rem', background: 'rgba(255,255,255,0.08)',
            borderRadius: '4px', padding: '1px 5px', marginRight: '0.4rem',
            color: '#94a3b8', fontFamily: 'monospace'
          }}>
            {entry.provider.toUpperCase()}
          </span>
        )}
        <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
          {entry.message}
        </span>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: '0.4rem' }}>
          {entry.time}{elapsed}
        </span>
      </div>
    </div>
  );
}

export default function ActivityFeed({ onOpenBob }) {
  const { planData } = usePlan();
  
  const rawName = planData?.semilla?.negocio?.nombre_marca || planData?.config?.brandKit?.companyName || '';
  const activeProjectId = planData?.config?.projectId || (rawName ? rawName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : '');
  const activeProjectType = planData?.config?.projectType === 'social_bid' ? 'social' : 'negocios';

  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'trajectories'
  const [trajectories, setTrajectories] = useState([]);
  const [selectedTrajectory, setSelectedTrajectory] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Real-time task tracking state
  const [activeTask, setActiveTask] = useState({
    active: false,
    module: '',
    message: '',
    progress: 0,
    type: ''
  });

  const bottomRef = useRef(null);
  const esRef = useRef(null);
  const retriesRef = useRef(0);
  const activeProjectIdRef = useRef(activeProjectId);

  // Sync ref with state to prevent closures in SSE
  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  // Cargar historial de logs y trayectorias agénticas al iniciar o cambiar de proyecto
  useEffect(() => {
    const loadTrajs = async () => {
      const list = await getSavedTrajectories();
      setTrajectories(list);
    };
    loadTrajs();

    const handleTrajectoryUpdate = () => {
      loadTrajs();
    };
    window.addEventListener('openplan_trajectory_updated', handleTrajectoryUpdate);

    if (!activeProjectId) {
      setLogs([]);
      return () => window.removeEventListener('openplan_trajectory_updated', handleTrajectoryUpdate);
    }

    const fetchHistory = async () => {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/projects/${activeProjectType}/${activeProjectId}/logs`);
        if (res.ok) {
          const history = await res.json();
          setLogs(history);
        } else {
          setLogs([]);
        }
      } catch {
        setLogs([]);
      }
    };

    fetchHistory();
    return () => window.removeEventListener('openplan_trajectory_updated', handleTrajectoryUpdate);
  }, [activeProjectId, activeProjectType]);

  // Helper to parse and update the active task progress
  const updateActiveTask = (entry) => {
    if (entry.type === 'start') {
      setActiveTask({
        active: true,
        module: entry.module || 'Proceso',
        message: entry.message,
        progress: 15,
        type: entry.type
      });
    } else if (entry.type === 'thinking' || entry.type === 'stage') {
      let prg = 45;
      const match = entry.message.match(/Fase\s+(\d+)\/(\d+)/i);
      if (match) {
        const current = parseInt(match[1], 10);
        const total = parseInt(match[2], 10);
        prg = Math.round((current / (total + 0.5)) * 100);
      } else if (entry.message.includes('Fase 1/2') || entry.message.includes('1/2')) {
        prg = 50;
      } else if (entry.message.includes('Fase 2/2') || entry.message.includes('2/2')) {
        prg = 85;
      } else if (entry.message.includes('Fase 1/3') || entry.message.includes('1/3')) {
        prg = 35;
      } else if (entry.message.includes('Fase 2/3') || entry.message.includes('2/3')) {
        prg = 65;
      } else if (entry.message.includes('Fase 3/3') || entry.message.includes('3/3')) {
        prg = 90;
      } else if (entry.message.includes('Fase 1/5')) {
        prg = 20;
      } else if (entry.message.includes('Fase 5/5')) {
        prg = 92;
      }
      setActiveTask(prev => ({
        active: true,
        module: entry.module || prev.module || 'Proceso',
        message: entry.message,
        progress: prg,
        type: entry.type
      }));
    } else if (entry.type === 'success') {
      setActiveTask(prev => ({
        active: true,
        module: entry.module || prev.module || 'Proceso',
        message: entry.message,
        progress: 100,
        type: entry.type
      }));
      // Auto-hide bottom status bar after 3 seconds on success
      setTimeout(() => {
        setActiveTask(prev => prev.progress === 100 && prev.type === 'success' ? { ...prev, active: false } : prev);
      }, 3000);
    } else if (entry.type === 'error') {
      setActiveTask(prev => ({
        active: true,
        module: entry.module || prev.module || 'Proceso',
        message: entry.message,
        progress: 100,
        type: entry.type
      }));
      // Auto-hide bottom status bar after 5 seconds on error
      setTimeout(() => {
        setActiveTask(prev => prev.type === 'error' ? { ...prev, active: false } : prev);
      }, 5000);
    }
  };

  // Conectar SSE al backend
  useEffect(() => {
    const MAX_RETRIES = 5;
    const apiBase = getApiBase();
    
    const connect = () => {
      if (retriesRef.current >= MAX_RETRIES) {
        setIsConnected(false);
        return;
      }

      try {
        const es = new EventSource(`${apiBase}/api/log/stream`);
        esRef.current = es;

        es.onopen = () => {
          setIsConnected(true);
          retriesRef.current = 0;
        };

        es.onmessage = (e) => {
          try {
            const entry = JSON.parse(e.data);
            
            // Agregar solo si no tiene ID de proyecto o si pertenece al activo
            if (!entry.projectId || entry.projectId === activeProjectIdRef.current) {
              setLogs(prev => {
                const isDup = prev.some(item => 
                  item.message === entry.message && 
                  item.time === entry.time && 
                  item.type === entry.type && 
                  item.module === entry.module
                );
                if (isDup) return prev;

                const next = [...prev, { ...entry, id: Date.now() + Math.random() }];
                return next.slice(-1000); // Permitir hasta 1000 eventos en pantalla
              });

              if (!isOpen || isMinimized) setHasNew(true);
              
              // Feed the status updater
              updateActiveTask(entry);
            }
          } catch {}
        };

        es.onerror = () => {
          setIsConnected(false);
          es.close();
          retriesRef.current++;
          if (retriesRef.current < MAX_RETRIES) {
            setTimeout(connect, 5000);
          }
        };
      } catch {}
    };

    connect();
    return () => esRef.current?.close();
  }, [isOpen, isMinimized]);

  // Scroll al fondo automáticamente
  useEffect(() => {
    if (isOpen && !isMinimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen, isMinimized]);

  // Limpiar el historial permanentemente en backend y frontend
  const handleClearLogs = async () => {
    if (!activeProjectId) {
      setLogs([]);
      return;
    }
    
    if (window.confirm('¿Estás seguro de que deseas eliminar permanentemente el historial de logs de este proyecto?')) {
      try {
        const apiBase = getApiBase();
        await fetch(`${apiBase}/api/projects/${activeProjectType}/${activeProjectId}/logs`, {
          method: 'DELETE'
        });
      } catch {}
      setLogs([]);
    }
  };

  return (
    <>
      {/* Floating Action Button (Siempre visible en todas las páginas y módulos) */}
      {!isOpen && (
        <div style={{ position: 'fixed', bottom: activeTask.active ? '3.5rem' : '1.5rem', right: '1.5rem', display: 'flex', gap: '0.75rem', zIndex: 1001, transition: 'bottom 0.3s ease' }} className="no-print">
          {/* Botón Asistente BOB / Voz */}
          <button
            onClick={() => onOpenBob && onOpenBob()}
            title="Asistente BOB (CELIS Engine & Control por Voz)"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(79, 70, 229, 0.5)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Bot size={24} color="white" />
          </button>

          {/* Botón Monitor de Actividad */}
          <button
            onClick={() => { setIsOpen(true); setIsMinimized(false); setHasNew(false); }}
            title="Monitor de Actividad e IA"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
              transition: 'transform 0.2s',
              position: 'relative'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Activity size={22} color="white" />
            {hasNew && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                width: '12px', height: '12px',
                background: '#ef4444', borderRadius: '50%',
                border: '2px solid var(--bg-dark)',
                animation: 'pulse 1.5s infinite',
              }} />
            )}
          </button>
        </div>
      )}

      {/* Barra de estado inferior (Status bar de progreso de la tarea activa) */}
      {activeTask.active && (
        <div
          className="no-print"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '40px',
            background: activeTask.type === 'success' 
              ? 'rgba(16, 185, 129, 0.95)' 
              : activeTask.type === 'error'
                ? 'rgba(239, 68, 68, 0.95)'
                : 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            cursor: 'pointer',
            boxShadow: '0 -4px 25px rgba(0,0,0,0.45)',
            animation: 'slideUpStatus 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            color: 'white',
            fontSize: '0.82rem',
            fontWeight: '500',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Línea superior de progreso */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '3px',
            background: activeTask.type === 'success' 
              ? '#34d399' 
              : activeTask.type === 'error'
                ? '#f87171'
                : 'linear-gradient(90deg, #6366f1, #a78bfa)',
            width: `${activeTask.progress}%`,
            transition: 'width 0.4s ease-out'
          }} />

          {/* Estado de la IA / Mensaje */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            {activeTask.type !== 'success' && activeTask.type !== 'error' && (
              <div className="spinner-mini" style={{
                width: '12px',
                height: '12px',
                border: '2px solid rgba(255,255,255,0.25)',
                borderTopColor: '#a78bfa',
                borderRadius: '50%',
                animation: 'spinMini 0.8s linear infinite',
                flexShrink: 0
              }} />
            )}
            {activeTask.type === 'success' && <CheckCircle size={14} style={{ flexShrink: 0 }} />}
            {activeTask.type === 'error' && <XCircle size={14} style={{ flexShrink: 0 }} />}
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ 
                color: activeTask.type === 'success' || activeTask.type === 'error' ? 'white' : '#a78bfa', 
                marginRight: '0.45rem',
                textTransform: 'uppercase',
                fontSize: '0.72rem',
                letterSpacing: '0.05em'
              }}>
                [{activeTask.module}]
              </strong>
              {activeTask.message}
            </span>
          </div>

          {/* Acciones e Indicador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: '700', fontFamily: 'monospace' }}>
              {activeTask.progress}%
            </span>
            <span style={{
              fontSize: '0.68rem',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}>
              Ver Historial
            </span>
          </div>
        </div>
      )}

      {/* Ventana flotante del Monitor de IA (Solo si está abierta) */}
      {isOpen && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            bottom: activeTask.active ? '2.9rem' : '1.5rem',
            right: '1.5rem',
            width: '420px',
            maxHeight: isMinimized ? '52px' : '400px',
            background: 'rgba(15, 17, 26, 0.97)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '14px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderBottom: isMinimized ? 'none' : '1px solid rgba(255,255,255,0.06)',
            background: 'linear-gradient(90deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
            flexShrink: 0,
            cursor: 'pointer',
          }}
            onClick={() => setIsMinimized(m => !m)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ position: 'relative' }}>
                <Bot size={16} color="#6366f1" />
                {isConnected && (
                  <span style={{
                    position: 'absolute', bottom: '-2px', right: '-2px',
                    width: '6px', height: '6px',
                    background: '#10b981', borderRadius: '50%',
                    boxShadow: '0 0 4px #10b981',
                  }} />
                )}
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'white' }}>
                Monitor de IA
              </span>
              <span style={{
                fontSize: '0.65rem',
                background: isConnected ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: isConnected ? '#10b981' : '#ef4444',
                borderRadius: '20px', padding: '2px 8px', fontWeight: '600'
              }}>
                {isConnected ? '● EN VIVO' : '○ Offline'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const textLogs = logs.map(l => `[${l.time || ''}] [${l.type || 'INFO'}] ${l.module ? `[${l.module}] ` : ''}${l.message || ''}`).join('\n');
                  navigator.clipboard.writeText(textLogs);
                  alert('¡Historial de logs copiado al portapapeles!');
                }}
                title="Copiar todo el historial"
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#94a3b8', fontSize: '0.65rem', padding: '2px 6px', fontWeight: 600 }}
              >
                Copiar
              </button>
              <button
                onClick={e => { e.stopPropagation(); setIsMinimized(m => !m); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                title={isMinimized ? "Maximizar" : "Minimizar"}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
              <button
                onClick={e => { e.stopPropagation(); setIsOpen(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                title="Cerrar"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Selector de Pestañas: Logs en Vivo vs Trayectorias Agénticas */}
          {!isMinimized && (
            <div style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.2)'
            }}>
              <button
                onClick={() => setActiveTab('logs')}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: 'none',
                  background: activeTab === 'logs' ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: activeTab === 'logs' ? 'var(--accent-color)' : '#94a3b8',
                  borderBottom: activeTab === 'logs' ? '2px solid var(--accent-color)' : 'none',
                  cursor: 'pointer'
                }}
              >
                📋 Eventos ({logs.length})
              </button>
              <button
                onClick={() => setActiveTab('trajectories')}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: 'none',
                  background: activeTab === 'trajectories' ? 'rgba(139,92,246,0.15)' : 'transparent',
                  color: activeTab === 'trajectories' ? '#a78bfa' : '#94a3b8',
                  borderBottom: activeTab === 'trajectories' ? '2px solid #a78bfa' : 'none',
                  cursor: 'pointer'
                }}
              >
                🔍 Trayectorias ({trajectories.length})
              </button>
            </div>
          )}

          {/* Tab 1: Log Feed */}
          {!isMinimized && activeTab === 'logs' && (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                  <Bot size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4, color: isConnected ? '#10b981' : '#6366f1' }} />
                  {isConnected ? (
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>
                      <strong style={{ color: '#10b981' }}>Servidor Conectado en Tiempo Real</strong><br />
                      <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>
                        Monitorizando procesos de IA (Nube y Local). Pulsa Industrializar o ✨ IA para ver la traza de ejecución.
                      </span>
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>
                      <strong style={{ color: '#38bdf8' }}>Conectando con el Servidor VPS...</strong><br />
                      <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>
                        Sincronizando flujo de eventos SSE en segundo plano.
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                logs.map((entry, i) => <LogLine key={entry.id || i} entry={entry} index={i} />)
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Tab 2: Trayectorias Agénticas DeepSeek Harness */}
          {!isMinimized && activeTab === 'trajectories' && (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.6rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              {trajectories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                  <Sparkles size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4, color: '#a78bfa' }} />
                  <p style={{ fontSize: '0.8rem', margin: 0 }}>
                    <strong style={{ color: '#a78bfa' }}>Sin Trayectorias Registradas Aún</strong><br />
                    <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>
                      Genera cualquier módulo o inicia la industrialización para trazar el árbol de razonamiento en DeepSeek Harness.
                    </span>
                  </p>
                </div>
              ) : (
                trajectories.map((traj) => (
                  <div
                    key={traj.id}
                    onClick={() => setSelectedTrajectory(traj)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '0.6rem 0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{traj.moduleTitle || traj.moduleKey}</span>
                        <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                          {traj.pillar}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px', display: 'flex', gap: '0.6rem' }}>
                        <span><Cpu size={10} style={{ display: 'inline', marginRight: '2px' }} />{traj.modelUsed || 'minimax-m3:cloud'}</span>
                        <span><Clock size={10} style={{ display: 'inline', marginRight: '2px' }} />{((traj.totalDurationMs || 0) / 1000).toFixed(1)}s</span>
                        <span>🌳 {traj.stepsCount || (traj.trajectoryDAG?.length || 0)} pasos</span>
                      </div>
                    </div>
                    <ChevronRight size={14} color="#94a3b8" />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer - Limpiar */}
          {!isMinimized && activeTab === 'logs' && logs.length > 0 && (
            <div style={{
              padding: '0.4rem 0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={handleClearLogs}
                style={{
                  fontSize: '0.65rem', color: '#94a3b8',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                Limpiar historial
              </button>
            </div>
          )}
        </div>
      )}

      {/* Visor Modal de Trayectoria Agéntica DeepSeek Harness */}
      {selectedTrajectory && (
        <AgentTrajectoryViewer
          trajectory={selectedTrajectory}
          onClose={() => setSelectedTrajectory(null)}
        />
      )}
    </>
  );
}
