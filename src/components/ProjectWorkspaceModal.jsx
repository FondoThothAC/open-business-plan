import React, { useState, useEffect } from 'react';
import { X, Folder, FileText, BarChart2, Activity, Play, Bot, RotateCcw, Clock, Trash2, Cpu } from 'lucide-react';
import { getApiBase } from '../config/apiConfig';

export default function ProjectWorkspaceModal({ isOpen, onClose, onLoadProject, onDeleteProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [trajectories, setTrajectories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/projects`);
      if (res.ok) {
        const data = await res.json();
        // Fusionar proyectos de negocios y sociales
        const all = [...(data.negocios || []), ...(data.social || [])];
        // Ordenar por fecha de modificación (más reciente primero)
        all.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime()).reverse();
        setProjects(all);
      }
    } catch (err) {
      console.error('Error fetching projects', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAiHistory = async (projectId) => {
    // Buscar trayectorias para este proyecto desde el backend o localStorage
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/telemetry/trajectories`);
      if (res.ok) {
        const data = await res.json();
        const list = data.trajectories || [];
        // Filtrar trayectorias globales recientes o locales
        setTrajectories(list);
      } else {
        // Fallback a localStorage
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

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#ffffff', width: '90%', maxWidth: '1000px', height: '80vh',
        borderRadius: '24px', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem', background: 'linear-gradient(to right, #1e293b, #334155)',
          color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <Folder size={24} color="#60a5fa" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Workspace</h2>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Gestor de Documentos y Proyectos Recientes</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
            width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#f8fafc' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <Activity className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
              Cargando proyectos...
            </div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              No se encontraron proyectos recientes.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {projects.map(proj => (
                <div key={proj.id} style={{
                  background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0',
                  padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: proj.projectType === 'social_bid' ? '#ecfdf5' : '#eff6ff',
                      color: proj.projectType === 'social_bid' ? '#10b981' : '#3b82f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: '#1e293b' }}>
                        {proj.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {new Date(proj.mtime).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', fontWeight: 600 }}>
                          <BarChart2 size={14} /> {proj.completion}% Completo
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1, justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <Cpu size={16} />
                        {proj.telemetry?.totalTokens ? (proj.telemetry.totalTokens / 1000).toFixed(1) + 'k' : '0k'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tokens Usados</div>
                    </div>
                    <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }}></div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <RotateCcw size={16} />
                        {proj.telemetry?.regenerations || 0}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Regeneraciones</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => loadAiHistory(proj.id)} style={{
                      padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569',
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>
                      <Bot size={16} /> Trazabilidad IA
                    </button>
                    <button onClick={() => { onLoadProject(proj.id, proj.projectType); onClose(); }} style={{
                      padding: '0.5rem 1.5rem', background: '#3b82f6', color: '#ffffff',
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                    }} onMouseOver={e => e.currentTarget.style.background = '#2563eb'} onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}>
                      <Play size={16} /> Abrir
                    </button>
                    <button onClick={() => onDeleteProject && onDeleteProject(proj.id, proj.projectType)} style={{
                      padding: '0.5rem', background: '#fee2e2', color: '#ef4444',
                      border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trazabilidad Sub-Modal */}
      {showHistoryModal && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div style={{
            background: '#fff', width: '80%', maxWidth: '800px', height: '70vh',
            borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bot color="#8b5cf6" size={24} />
                <h3 style={{ margin: 0, color: '#1e293b' }}>Historial de Prompts (Reciclaje y Depuración)</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {trajectories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No hay historial de IA registrado recientemente.
                </div>
              ) : (
                trajectories.map((traj, idx) => (
                  <div key={idx} style={{ background: '#f1f5f9', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>Módulo: {traj.moduleTitle || traj.moduleKey}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>
                        {traj.provider} / {traj.modelUsed || traj.model}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', background: '#fff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <strong>📝 Prompt Enviado:</strong><br/>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: '0.5rem 0 0 0' }}>
                        {traj.steps?.[0]?.systemPrompt || traj.trajectoryDAG?.[0]?.systemPrompt ? String(traj.steps?.[0]?.systemPrompt || traj.trajectoryDAG?.[0]?.systemPrompt).substring(0, 300) + '...' : 'No disponible'}
                      </pre>
                    </div>
                    {(traj.steps?.[0]?.thoughtProcess || traj.trajectoryDAG?.[0]?.thoughtProcess) && (
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <strong>🧠 Razonamiento (Thought Process):</strong><br/>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: '0.5rem 0 0 0' }}>
                          {String(traj.steps?.[0]?.thoughtProcess || traj.trajectoryDAG?.[0]?.thoughtProcess).substring(0, 300)}...
                        </pre>
                      </div>
                    )}
                    <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                      <span>Tokens: {traj.metrics?.promptTokens || 0} in / {traj.metrics?.completionTokens || 0} out</span>
                      <span>Tiempo: {(traj.totalDurationMs / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
