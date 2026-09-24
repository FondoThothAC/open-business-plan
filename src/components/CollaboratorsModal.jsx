import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Trash2, X, AlertCircle, CheckCircle2, 
  Shield, Edit3, Crown, RefreshCw, Radio
} from 'lucide-react';
import { getApiBase } from '../config/apiConfig';

/**
 * Modal de Gestión de Colaboradores y Presencia Activa en Tiempo Real
 * Fondo Thoth AC — Open Business Plan
 * 
 * Permite invitar por username o email a otros usuarios del sistema,
 * revocar colaboraciones y monitorear qué colaboradores están editando ahora mismo.
 */
export default function CollaboratorsModal({ isOpen, onClose, projectId, projectType = 'negocios', isOwner = false }) {
  const [collaborators, setCollaborators] = useState([]);
  const [activePresence, setActivePresence] = useState([]);
  const [projectOwner, setProjectOwner] = useState('');
  const [newIdentifier, setNewIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchCollaborators = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/projects/${projectType}/${projectId}/collaborators`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data.collaborators || []);
        setActivePresence(data.activePresence || []);
        setProjectOwner(data.owner || '');
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Error al obtener colaboradores.');
      }
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      fetchCollaborators();
      const interval = setInterval(fetchCollaborators, 8000); // Polling suave de presencia
      return () => clearInterval(interval);
    }
  }, [isOpen, projectId, projectType]);

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!newIdentifier.trim()) return;

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/projects/${projectType}/${projectId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: newIdentifier.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Colaborador agregado correctamente.');
        setNewIdentifier('');
        fetchCollaborators();
      } else {
        setError(data.error || 'No se pudo agregar al colaborador.');
      }
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveCollaborator = async (identifier) => {
    if (!window.confirm(`¿Estás seguro de revocar el acceso de colaboración a @${identifier}?`)) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/projects/${projectType}/${projectId}/collaborators/${encodeURIComponent(identifier)}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Colaborador removido.');
        fetchCollaborators();
      } else {
        setError(data.error || 'No se pudo remover al colaborador.');
      }
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 10, 24, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1.25rem'
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          background: '#0f172a',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 25px rgba(56, 189, 248, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Cabecera */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.08), rgba(99, 102, 241, 0.05))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Equipo y Colaboradores
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Proyecto: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{projectId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.color = '#fff'}
            onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Notificaciones de Error / Éxito */}
        {error && (
          <div style={{
            margin: '1rem 1.5rem 0',
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#f87171',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            margin: '1rem 1.5rem 0',
            padding: '0.75rem 1rem',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            color: '#34d399',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Cuerpo */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Formulario de Invitación */}
          <form onSubmit={handleAddCollaborator} style={{ display: 'flex', gap: '0.6rem' }}>
            <input
              type="text"
              placeholder="Username o email del colaborador..."
              value={newIdentifier}
              onChange={e => setNewIdentifier(e.target.value)}
              disabled={actionLoading}
              style={{
                flex: 1,
                padding: '0.65rem 0.9rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={actionLoading || !newIdentifier.trim()}
              className="btn btn-ia"
              style={{
                padding: '0.65rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: actionLoading || !newIdentifier.trim() ? 0.6 : 1
              }}
            >
              <UserPlus size={16} />
              <span>Vincular</span>
            </button>
          </form>

          {/* Banner de Información de Permisos */}
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(56, 189, 248, 0.06)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '10px',
            fontSize: '0.75rem',
            color: '#cbd5e1',
            lineHeight: 1.4
          }}>
            <span style={{ fontWeight: 700, color: '#38bdf8' }}>Colaboración Simétrica:</span> Los colaboradores vinculados pueden formular campos, ejecutar la mesa de expertos con IA y guardar cambios directamente. Solo el dueño o administrador puede borrar el proyecto.
          </div>

          {/* Lista de Miembros */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Miembros con Acceso ({collaborators.length + 1})
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                <span>Consultando colaboradores...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Dueño Original */}
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(234, 179, 8, 0.15)',
                      color: '#eab308',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}>
                      <Crown size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>
                        @{projectOwner || 'admin'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Propietario Principal</div>
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: 'rgba(234, 179, 8, 0.15)',
                    color: '#facc15',
                    border: '1px solid rgba(234, 179, 8, 0.3)'
                  }}>
                    Dueño
                  </span>
                </div>

                {/* Colaboradores */}
                {collaborators.map(c => {
                  const isUserActive = activePresence.some(p => p.username === c.username);
                  const activeSession = activePresence.find(p => p.username === c.username);

                  return (
                    <div 
                      key={c.identifier}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: isUserActive ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isUserActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          position: 'relative'
                        }}>
                          {c.username ? c.username.slice(0, 2).toUpperCase() : 'CO'}
                          {isUserActive && (
                            <span style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#34d399',
                              border: '2px solid #0f172a'
                            }} />
                          )}
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>{c.displayName || `@${c.username}`}</span>
                            {c.email && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({c.email})</span>}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>Colaborador Autorizado</span>
                            {isUserActive && activeSession?.moduleKey && (
                              <span style={{ color: '#34d399', fontWeight: 600 }}>
                                • Editando {activeSession.moduleKey}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.25)'
                        }}>
                          Editor
                        </span>

                        <button
                          onClick={() => handleRemoveCollaborator(c.username || c.identifier)}
                          disabled={actionLoading}
                          title="Remover Colaborador"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '6px',
                            padding: '5px',
                            color: '#f87171',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {collaborators.length === 0 && (
                  <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                    No hay colaboradores adicionales vinculados a este plan de negocio.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pie */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
