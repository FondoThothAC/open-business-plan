import { useState, useEffect, useMemo } from 'react';
import { 
  X, Folder, FileText, BarChart2, Activity, Play, Bot, RotateCcw, 
  Clock, Trash2, Cpu, Copy, Archive, ArchiveRestore, Search, 
  AlertCircle, CheckCircle2, ArrowRight, UserCheck, Shield, ChevronDown, ChevronUp, Users
} from 'lucide-react';
import { getApiBase } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';
import CollaboratorsModal from './CollaboratorsModal';

/**
 * Gestor Central de Proyectos y Workspace
 * Controla el ciclo de vida de proyectos, módulos faltantes, progreso calculado,
 * estados de trabajo (Borrador, En revisión, Aprobado, Archivado) y trazabilidad IA.
 */
export default function ProjectWorkspaceModal({ isOpen, onClose, onLoadProject, onDeleteProject, onNavigateToModule }) {
  const { user, isAdmin, isRevisor } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_selectedProject, setSelectedProject] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [trajectories, setTrajectories] = useState([]);
  const [expandedMissingProjectId, setExpandedMissingProjectId] = useState(null);
  const [managingCollabsProject, setManagingCollabsProject] = useState(null);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | Borrador | En revisión | Aprobado | Archivado
  const [progressFilter, setProgressFilter] = useState('all'); // all | incomplete | in_progress | completed
  const [typeFilter, setTypeFilter] = useState('all'); // all | negocios | social

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/projects`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const negocios = (data.negocios || []).map(p => ({ ...p, projectType: p.projectType || 'business', category: 'negocios' }));
        const social = (data.social || []).map(p => ({ ...p, projectType: p.projectType || 'social_bid', category: 'social' }));
        const all = [...negocios, ...social];
        all.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
        setProjects(all);
      }
    } catch (err) {
      console.error('Error al obtener proyectos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (proj) => {
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/projects/${proj.category}/${proj.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        await fetchProjects();
      } else {
        alert('No fue posible duplicar el proyecto');
      }
    } catch (err) {
      console.error('Error al duplicar proyecto:', err);
      alert('Error de conexión al duplicar el proyecto');
    }
  };

  const handleArchive = async (proj) => {
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/projects/${proj.category}/${proj.id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        await fetchProjects();
      } else {
        alert('No fue posible archivar el proyecto');
      }
    } catch (err) {
      console.error('Error al archivar proyecto:', err);
      alert('Error de conexión al archivar');
    }
  };

  const handleRestore = async (proj) => {
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/projects/${proj.category}/${proj.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        await fetchProjects();
      } else {
        alert('No fue posible restaurar el proyecto');
      }
    } catch (err) {
      console.error('Error al restaurar proyecto:', err);
      alert('Error de conexión al restaurar');
    }
  };

  const handleStatusChange = async (proj, newStatus) => {
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/projects/${proj.category}/${proj.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchProjects();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'No fue posible cambiar el estado');
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al comunicar con el servidor');
    }
  };

  const loadAiHistory = async (projectId) => {
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/telemetry/trajectories`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTrajectories(data.trajectories || []);
      } else {
        const local = JSON.parse(localStorage.getItem('openplan_trajectories') || '[]');
        setTrajectories(local);
      }
    } catch {
      const local = JSON.parse(localStorage.getItem('openplan_trajectories') || '[]');
      setTrajectories(local);
    }
    setSelectedProject(projectId);
    setShowHistoryModal(true);
  };

  const handleContinueProject = (proj) => {
    onLoadProject(proj.id, proj.category);
    onClose();
    if (proj.missingModules && proj.missingModules.length > 0 && onNavigateToModule) {
      const firstMissing = proj.missingModules[0];
      onNavigateToModule(firstMissing.moduleKey, proj.projectType);
    }
  };

  // Filtrado reactivo de proyectos
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.responsible && p.responsible.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || p.workflowStatus === statusFilter;

      let matchesProgress = true;
      const comp = Number(p.completion || 0);
      if (progressFilter === 'incomplete') matchesProgress = comp < 50;
      else if (progressFilter === 'in_progress') matchesProgress = comp >= 50 && comp < 100;
      else if (progressFilter === 'completed') matchesProgress = comp >= 100;

      const matchesType = typeFilter === 'all' || p.category === typeFilter;

      return matchesSearch && matchesStatus && matchesProgress && matchesType;
    });
  }, [projects, searchQuery, statusFilter, progressFilter, typeFilter]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#ffffff', width: '92%', maxWidth: '1100px', height: '85vh',
        borderRadius: '24px', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)', overflow: 'hidden'
      }}>
        {/* Header Superior */}
        <div style={{
          padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              padding: '0.75rem', borderRadius: '14px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <Folder size={26} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Workspace & Proyectos
                </h2>
                <span style={{
                  fontSize: '0.75rem', padding: '3px 8px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.12)', color: '#93c5fd', fontWeight: 600
                }}>
                  {filteredProjects.length} de {projects.length}
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Gestión canónica de avance, estado editorial, módulos incompletos y trazabilidad
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
              width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div style={{
          padding: '1rem 2rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
          display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Input de Búsqueda */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff',
            border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.45rem 0.8rem',
            minWidth: '260px', flex: 1
          }}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text"
              placeholder="Buscar por nombre, ID o responsable..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', color: '#1e293b' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Selectores de Filtro */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#ffffff', fontSize: '0.8rem', fontWeight: 600, color: '#334155', cursor: 'pointer'
              }}
            >
              <option value="all">Estado: Todos</option>
              <option value="Borrador">Borrador</option>
              <option value="En revisión">En revisión</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Archivado">Archivado</option>
            </select>

            <select
              value={progressFilter}
              onChange={e => setProgressFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#ffffff', fontSize: '0.8rem', fontWeight: 600, color: '#334155', cursor: 'pointer'
              }}
            >
              <option value="all">Avance: Todos</option>
              <option value="incomplete">Incompletos (&lt;50%)</option>
              <option value="in_progress">En progreso (50-99%)</option>
              <option value="completed">Completos (100%)</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#ffffff', fontSize: '0.8rem', fontWeight: 600, color: '#334155', cursor: 'pointer'
              }}
            >
              <option value="all">Metodología: Todas</option>
              <option value="negocios">Plan Maestro Comercial</option>
              <option value="social">Proyecto Social (BID)</option>
            </select>
          </div>
        </div>

        {/* Lista de Proyectos */}
        <div style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto', background: '#f1f5f9' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              <Activity className="animate-spin" size={36} style={{ margin: '0 auto 1rem', color: '#3b82f6' }} />
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>Cargando catálogo de proyectos...</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <AlertCircle size={40} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#334155', marginBottom: '0.5rem' }}>No se encontraron proyectos</div>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Prueba ajustando los filtros de búsqueda o el estado editorial.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredProjects.map(proj => {
                const missingCount = proj.missingModules ? proj.missingModules.length : 0;
                const isExpandedMissing = expandedMissingProjectId === proj.id;
                const isArchived = proj.workflowStatus === 'Archivado';

                // Colores según estado de trabajo
                const statusColors = {
                  'Borrador': { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },
                  'En revisión': { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
                  'Aprobado': { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
                  'Archivado': { bg: '#faf5ff', border: '#e9d5ff', text: '#6b21a8' }
                }[proj.workflowStatus] || { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' };

                return (
                  <div key={`${proj.category}_${proj.id}`} style={{
                    background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0',
                    padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)', opacity: isArchived ? 0.8 : 1
                  }}>
                    {/* Fila Principal de la Tarjeta */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
                      {/* Información de Identificación */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1.5 }}>
                        <div style={{
                          width: '46px', height: '46px', borderRadius: '12px',
                          background: proj.category === 'social' ? '#ecfdf5' : '#eff6ff',
                          color: proj.category === 'social' ? '#10b981' : '#3b82f6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <FileText size={24} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {proj.name}
                            </h3>
                            {proj.isPrivateAdmin && (
                              <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: '#fef2f2', color: '#b91c1c', fontWeight: 800 }}>
                                PRIVADO
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', color: '#64748b', fontSize: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={13} /> {new Date(proj.mtime).toLocaleDateString()} {new Date(proj.mtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <UserCheck size={13} /> Propietario: <strong style={{ color: '#334155' }}>{proj.responsible || proj.userOwner || 'Sin asignar'}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Estado Editorial y Avance Calculado */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                        {/* Badge de Estado */}
                        <div style={{
                          padding: '0.35rem 0.75rem', borderRadius: '20px',
                          background: statusColors.bg, border: `1px solid ${statusColors.border}`,
                          color: statusColors.text, fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap'
                        }}>
                          {proj.workflowStatus}
                        </div>

                        {/* Barra de Avance */}
                        <div style={{ flex: 1, minWidth: '100px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                            <span>Avance</span>
                            <span style={{ color: proj.completion >= 100 ? '#059669' : '#2563eb' }}>{proj.completion}%</span>
                          </div>
                          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${proj.completion}%`, height: '100%',
                              background: proj.completion >= 100 ? 'linear-gradient(to right, #10b981, #059669)' : 'linear-gradient(to right, #3b82f6, #2563eb)',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Botón Continuar (Destacado) */}
                        <button 
                          onClick={() => handleContinueProject(proj)}
                          style={{
                            padding: '0.55rem 1.1rem', background: '#2563eb', color: '#ffffff',
                            border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem',
                            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)', transition: 'all 0.2s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
                          onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
                          title={missingCount > 0 ? `Continuar directo a: ${proj.missingModules[0].moduleTitle}` : 'Abrir proyecto completo'}
                        >
                          <Play size={15} /> <span>Continuar</span>
                        </button>

                        {/* Duplicar */}
                        <button 
                          onClick={() => handleDuplicate(proj)}
                          style={{
                            padding: '0.55rem', background: '#f8fafc', color: '#475569',
                            border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer'
                          }}
                          title="Duplicar Proyecto"
                        >
                          <Copy size={16} />
                        </button>

                        {/* Colaboradores */}
                        <button 
                          onClick={() => setManagingCollabsProject(proj)}
                          style={{
                            padding: '0.55rem', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7',
                            border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '10px', cursor: 'pointer'
                          }}
                          title="Gestionar Equipo y Colaboradores"
                        >
                          <Users size={16} />
                        </button>

                        {/* Trazabilidad IA */}
                        <button 
                          onClick={() => loadAiHistory(proj.id)}
                          style={{
                            padding: '0.55rem', background: '#f8fafc', color: '#8b5cf6',
                            border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer'
                          }}
                          title="Trazabilidad y Prompts IA"
                        >
                          <Bot size={16} />
                        </button>

                        {/* Archivar / Restaurar */}
                        {isArchived ? (
                          <button 
                            onClick={() => handleRestore(proj)}
                            style={{
                              padding: '0.55rem', background: '#f3e8ff', color: '#7e22ce',
                              border: 'none', borderRadius: '10px', cursor: 'pointer'
                            }}
                            title="Restaurar Proyecto"
                          >
                            <ArchiveRestore size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleArchive(proj)}
                            style={{
                              padding: '0.55rem', background: '#f1f5f9', color: '#64748b',
                              border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer'
                            }}
                            title="Archivar Proyecto"
                          >
                            <Archive size={16} />
                          </button>
                        )}

                        {/* Eliminar (Solo si tiene permisos) */}
                        {onDeleteProject && !isRevisor && (
                          <button 
                            onClick={() => onDeleteProject(proj.id, proj.category)}
                            style={{
                              padding: '0.55rem', background: '#fee2e2', color: '#ef4444',
                              border: 'none', borderRadius: '10px', cursor: 'pointer'
                            }}
                            title="Eliminar de forma recuperable"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Fila Secundaria: Módulos Incompletos y Próxima Acción */}
                    <div style={{
                      padding: '0.6rem 1rem', background: '#f8fafc', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: '0.8rem', border: '1px solid #edf2f7'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Siguiente Acción:</span>
                        <span style={{ color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ArrowRight size={14} color="#3b82f6" /> {proj.nextAction || 'Continuar edición'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {missingCount > 0 ? (
                          <button
                            onClick={() => setExpandedMissingProjectId(isExpandedMissing ? null : proj.id)}
                            style={{
                              background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309',
                              padding: '2px 8px', borderRadius: '6px', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700
                            }}
                          >
                            <AlertCircle size={13} /> {missingCount} módulos incompletos
                            {isExpandedMissing ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        ) : (
                          <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                            <CheckCircle2 size={14} /> Plan al 100% completo
                          </span>
                        )}

                        {/* Control de Transición de Estado Editorial */}
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '0.3rem', marginLeft: '0.5rem' }}>
                            {proj.workflowStatus !== 'Aprobado' && (
                              <button
                                onClick={() => handleStatusChange(proj, 'Aprobado')}
                                style={{
                                  padding: '2px 8px', background: '#dcfce7', border: '1px solid #86efac',
                                  color: '#15803d', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                                }}
                                title="Aprobar para Comité de Inversión (Exclusivo Superadmin)"
                              >
                                Aprobar
                              </button>
                            )}
                            {proj.workflowStatus !== 'En revisión' && (
                              <button
                                onClick={() => handleStatusChange(proj, 'En revisión')}
                                style={{
                                  padding: '2px 8px', background: '#dbeafe', border: '1px solid #93c5fd',
                                  color: '#1e40af', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                                }}
                              >
                                Enviar a Revisión
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desglose de Módulos Incompletos al Expandir */}
                    {isExpandedMissing && proj.missingModules && (
                      <div style={{
                        padding: '0.75rem 1rem', background: '#fffbeb', borderRadius: '8px',
                        border: '1px solid #fde68a', display: 'flex', flexWrap: 'wrap', gap: '0.5rem'
                      }}>
                        <div style={{ width: '100%', fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>
                          Módulos pendientes por completar:
                        </div>
                        {proj.missingModules.map((m, idx) => (
                          <span 
                            key={idx}
                            style={{
                              background: '#ffffff', padding: '3px 8px', borderRadius: '6px',
                              fontSize: '0.72rem', color: '#78350f', border: '1px solid #fef3c7', fontWeight: 600
                            }}
                          >
                            {m.moduleTitle}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sub-Modal de Trazabilidad y Depuración de IA */}
      {showHistoryModal && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div style={{
            background: '#ffffff', width: '80%', maxWidth: '850px', height: '75vh',
            borderRadius: '18px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '18px 18px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bot color="#8b5cf6" size={24} />
                <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>Historial de Prompts y Trazabilidad IA</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#f1f5f9' }}>
              {trajectories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No hay trayectorias de IA registradas recientemente.
                </div>
              ) : (
                trajectories.map((traj, idx) => (
                  <div key={idx} style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>Módulo: {traj.moduleTitle || traj.moduleKey}</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                        {traj.provider} / {traj.modelUsed || traj.model}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#0f172a' }}>📝 Prompt Enviado:</strong><br/>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
                        {traj.steps?.[0]?.systemPrompt || traj.trajectoryDAG?.[0]?.systemPrompt ? String(traj.steps?.[0]?.systemPrompt || traj.trajectoryDAG?.[0]?.systemPrompt).substring(0, 350) + '...' : 'No disponible'}
                      </pre>
                    </div>
                    {(traj.steps?.[0]?.thoughtProcess || traj.trajectoryDAG?.[0]?.thoughtProcess) && (
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <strong style={{ color: '#475569' }}>🧠 Razonamiento (Thought Process):</strong><br/>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
                          {String(traj.steps?.[0]?.thoughtProcess || traj.trajectoryDAG?.[0]?.thoughtProcess).substring(0, 350)}...
                        </pre>
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', gap: '1.25rem', marginTop: '0.75rem', fontWeight: 600 }}>
                      <span>Tokens: {traj.metrics?.promptTokens || 0} in / {traj.metrics?.completionTokens || 0} out</span>
                      <span>Duración: {(traj.totalDurationMs / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal de Gestión de Colaboradores */}
      {managingCollabsProject && (
        <CollaboratorsModal
          isOpen={Boolean(managingCollabsProject)}
          onClose={() => {
            setManagingCollabsProject(null);
            fetchProjects();
          }}
          projectId={managingCollabsProject.id}
          projectType={managingCollabsProject.category || managingCollabsProject.projectType || 'negocios'}
          isOwner={managingCollabsProject.roleInProject === 'Propietario' || isAdmin}
        />
      )}
    </div>
  );
}
