import { useState, useEffect } from 'react';
import { 
  FolderGit2, Search, Plus, Key, CheckCircle, 
  ArrowRight, X, AlertCircle, RefreshCw, Send 
} from 'lucide-react';
import { getApiBase } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';

/**
 * @file ProjectCatalogModal.jsx
 * @description Catálogo Comunitario de Proyectos Estudiantiles y Conexión de Equipos.
 * Permite a los alumnos:
 * 1. Explorar proyectos de sus compañeros de clase.
 * 2. Enviar solicitudes de colaboración ("Solicitar Unirme").
 * 3. Unirse al instante mediante Código de Equipo (ej. EQUIPO-XXXX-YYYY).
 * 
 * [UXDD] Diseño tipo cuadrícula moderna con estados claros de membresía.
 * [SDD] Mecanismo de conexión descentralizada entre alumnos.
 */
export default function ProjectCatalogModal({ isOpen, onClose, onProjectJoined }) {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('explorar'); // 'explorar' | 'codigo'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Estados para solicitud de unión
  const [requestingProject, setRequestingProject] = useState(null);
  const [requestNote, setRequestNote] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Estados para unión por código
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [submittingCode, setSubmittingCode] = useState(false);

  const apiBase = getApiBase();

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${apiBase}/api/projects/explore`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'No se pudo cargar el catálogo de proyectos.');
      }
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCatalog();
      setError(null);
      setSuccessMessage(null);
      setRequestingProject(null);
      setInviteCodeInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    if (!requestingProject) return;

    setSubmittingRequest(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await authFetch(`${apiBase}/api/projects/${requestingProject.type}/${requestingProject.id}/join-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: requestNote.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Solicitud enviada al equipo de "${requestingProject.name}". Te avisarán cuando la aprueben.`);
        setRequestingProject(null);
        setRequestNote('');
        fetchCatalog();
      } else {
        setError(data.error || 'Error al enviar la solicitud.');
      }
    } catch (err) {
      setError(`Error de red: ${err.message}`);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    setSubmittingCode(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await authFetch(`${apiBase}/api/projects/join-by-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCodeInput.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || '¡Te has unido exitosamente al proyecto!');
        setInviteCodeInput('');
        fetchCatalog();
        if (onProjectJoined && data.projectId) {
          onProjectJoined(data.projectId, data.projectType || 'negocios');
        }
      } else {
        setError(data.error || 'Código de equipo no encontrado o inválido.');
      }
    } catch (err) {
      setError(`Error de red: ${err.message}`);
    } finally {
      setSubmittingCode(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q)) ||
      (p.owner && p.owner.toLowerCase().includes(q))
    );
  });

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99980,
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '850px',
          height: '85vh',
          maxHeight: '750px',
          background: 'linear-gradient(145deg, #0f172a, #1e293b)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 35px rgba(56, 189, 248, 0.12)',
          color: '#f8fafc',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <FolderGit2 size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                Catálogo de Proyectos & Conexión de Equipos
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Conéctate con proyectos de tus compañeros para trabajar colaborativamente en equipos de 2 a 3 personas.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div style={{
          padding: '0.75rem 1.75rem',
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <button
            onClick={() => setActiveTab('explorar')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'explorar' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeTab === 'explorar' ? '#38bdf8' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={15} /> Explorar Proyectos ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab('codigo')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'codigo' ? 'rgba(129, 140, 248, 0.2)' : 'transparent',
              color: activeTab === 'codigo' ? '#818cf8' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Key size={15} /> Unirme por Código de Equipo
          </button>
        </div>

        {/* Notificaciones de error o éxito */}
        {error && (
          <div style={{
            margin: '1rem 1.75rem 0',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            margin: '1rem 1.75rem 0',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#86efac',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Contenido Principal */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.75rem' }}>
          {activeTab === 'explorar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Barra de Búsqueda y Refrescar */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '0.4rem 0.85rem',
                  gap: '0.5rem'
                }}>
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre de proyecto, ID o titular..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.84rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
                <button
                  onClick={fetchCatalog}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                    cursor: 'pointer'
                  }}
                  title="Actualizar catálogo"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Lista de Proyectos */}
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
                  <div>Cargando proyectos de la comunidad...</div>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  No se encontraron proyectos disponibles para colaborar.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
                  {filteredProjects.map(proj => (
                    <div
                      key={proj.id}
                      style={{
                        padding: '1.15rem',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        transition: 'transform 0.2s ease, border-color 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc' }}>
                            {proj.name}
                          </h4>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: proj.relationship === 'owner' 
                              ? 'rgba(16, 185, 129, 0.2)' 
                              : proj.relationship === 'collaborator' 
                                ? 'rgba(168, 85, 247, 0.2)' 
                                : proj.relationship === 'pending'
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(255, 255, 255, 0.08)',
                            color: proj.relationship === 'owner' 
                              ? '#34d399' 
                              : proj.relationship === 'collaborator' 
                                ? '#c084fc' 
                                : proj.relationship === 'pending'
                                  ? '#fbbf24'
                                  : '#94a3b8'
                          }}>
                            {proj.relationship === 'owner' 
                              ? 'Mi Proyecto' 
                              : proj.relationship === 'collaborator' 
                                ? 'Ya Colaboras' 
                                : proj.relationship === 'pending'
                                  ? 'Solicitud Enviada'
                                  : 'Disponible'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                          Titular: <strong style={{ color: '#cbd5e1' }}>@{proj.owner}</strong> • Equipo: {proj.collaboratorsCount + 1} integrantes
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          ID: <code style={{ color: '#38bdf8' }}>{proj.id}</code>
                        </span>

                        {proj.relationship === 'none' && (
                          <button
                            onClick={() => setRequestingProject(proj)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              background: 'rgba(56, 189, 248, 0.15)',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              color: '#38bdf8',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Plus size={13} /> Solicitar Unirme
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'codigo' && (
            <div style={{ maxWidth: '480px', margin: '2rem auto', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(129, 140, 248, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <Key size={28} />
              </div>
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem', color: '#fff' }}>
                Unirse con Código de Invitación
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 1.5rem' }}>
                Si tu compañero de equipo te compartió un código de invitación (ej. <code>EQUIPO-XXXX-YYYY</code>), ingrésalo aquí para integrarte directamente como coautor del plan.
              </p>

              <form onSubmit={handleJoinByCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Ej: EQUIPO-COSI-7B9X"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(129, 140, 248, 0.3)',
                    color: '#fff',
                    fontSize: '1rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={submittingCode || !inviteCodeInput.trim()}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #818cf8, #38bdf8)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: submittingCode || !inviteCodeInput.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ArrowRight size={16} /> Unirme al Equipo
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Secundario para Escribir Nota de Solicitud */}
        {requestingProject && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 10, 20, 0.9)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '460px',
              background: '#1e293b',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '14px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>
                  Solicitar unirse a "{requestingProject.name}"
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  Titular: @{requestingProject.owner}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Mensaje para el equipo o profesor (opcional):
                </label>
                <textarea
                  rows={3}
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="Ej: Hola, me gustaría encargarme del pilar financiero y análisis de costos..."
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setRequestingProject(null)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSendJoinRequest}
                  disabled={submittingRequest}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: submittingRequest ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Send size={13} /> Enviar Solicitud
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
