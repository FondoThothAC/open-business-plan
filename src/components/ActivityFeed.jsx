import React, { useState, useEffect, useRef } from 'react';
import { Activity, X, Minimize2, Maximize2, Bot, CheckCircle, AlertTriangle, XCircle, Zap, Cloud, Save } from 'lucide-react';
import { usePlan } from '../context/PlanContext';

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

export default function ActivityFeed() {
  const { planData } = usePlan();
  
  const rawName = planData?.semilla?.negocio?.nombre_marca || planData?.config?.brandKit?.companyName || '';
  const activeProjectId = planData?.config?.projectId || (rawName ? rawName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : '');
  const activeProjectType = planData?.config?.projectType === 'social_bid' ? 'social' : 'negocios';

  const [logs, setLogs] = useState([]);
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

  // Cargar historial de logs al iniciar o cambiar de proyecto
  useEffect(() => {
    if (!activeProjectId) {
      setLogs([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/projects/${activeProjectType}/${activeProjectId}/logs`);
        if (res.ok) {
          const history = await res.json();
          setLogs(history);
        } else {
          setLogs([]);
        }
      } catch (_) {
        setLogs([]);
      }
    };

    fetchHistory();
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
    const MAX_RETRIES = 3;
    
    const connect = () => {
      if (retriesRef.current >= MAX_RETRIES) {
        setIsConnected(false);
        return;
      }

      try {
        const es = new EventSource('http://localhost:3001/api/log/stream');
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
          } catch (_) {}
        };

        es.onerror = () => {
          setIsConnected(false);
          es.close();
          retriesRef.current++;
          if (retriesRef.current < MAX_RETRIES) {
            setTimeout(connect, 10000);
          }
        };
      } catch (_) {}
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
        await fetch(`http://localhost:3001/api/projects/${activeProjectType}/${activeProjectId}/logs`, {
          method: 'DELETE'
        });
      } catch (_) {}
      setLogs([]);
    }
  };

  // Botón flotante
  const FloatButton = () => (
    <button
      className="no-print"
      onClick={() => { setIsOpen(true); setIsMinimized(false); setHasNew(false); }}
      title="Monitor de IA"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
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
        zIndex: 999,
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Bot size={22} color="white" />
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
  );

  return (
    <>
      <style>{`
        @keyframes fadeInLog {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUpStatus {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes spinMini {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Floating Action Button (Solo mostrar si la ventana de logs está cerrada y no hay barra de tareas activa) */}
      {!isOpen && !activeTask.active && <FloatButton />}

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
              {logs.length > 0 && (
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  {logs.length} eventos
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={e => { e.stopPropagation(); setIsMinimized(m => !m); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
              <button
                onClick={e => { e.stopPropagation(); setIsOpen(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Log Feed */}
          {!isMinimized && (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <Bot size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                  {isConnected ? (
                    <p style={{ fontSize: '0.8rem' }}>
                      Esperando actividad de IA...<br />
                      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                        Pulsa ✨ IA en cualquier módulo para empezar
                      </span>
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.8rem' }}>
                      Servidor no detectado<br />
                      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                        Ejecuta <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px' }}>bash run_mac.sh</code> en tu terminal
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

          {/* Footer - Limpiar */}
          {!isMinimized && logs.length > 0 && (
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
    </>
  );
}
