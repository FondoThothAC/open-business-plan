/**
 * @file AdminUsersPanel.jsx
 * @description Panel integral de Administración de Usuarios, Auditoría y Proyectos para Open Business Plan.
 * Permite al superadmin crear usuarios, asignar rol (superadmin, revisor, user),
 * cambiar estados (activo, pendiente, desactivado), restablecer contraseñas,
 * auditar la actividad del sistema y examinar el estado de avance de los proyectos por usuario.
 * 
 * [CDD] Componente modal autocontenido y reutilizable con pestañas especializadas.
 * [UXDD] Diseño glassmorphism premium con estados visuales claros, badges y animaciones fluidas.
 * [SECDD] Acceso exclusivo reservado para usuarios con rol superadmin.
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Trash2, Shield, UserCheck, UserX, 
  Clock, AlertTriangle, RefreshCw, X, Key, FolderGit2, History, Plus, 
  Search, ArrowRight, FileText, Check, Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getApiBase } from '../config/apiConfig';

export default function AdminUsersPanel({ isOpen, onClose, onOpenProject }) {
  const { isAdmin, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'proyectos' | 'auditoria'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Estados para creación de usuario
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    role: 'user',
    status: 'active'
  });

  // Estados para reseteo de contraseña
  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Estados para proyectos de usuario
  const [selectedUserForProjects, setSelectedUserForProjects] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Estados para auditoría
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditFilter, setAuditFilter] = useState('');

  const apiBase = getApiBase();

  const cargarUsuarios = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${apiBase}/api/admin/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Error al cargar la lista de usuarios.');
      }
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cargarAuditoria = async () => {
    if (!isAdmin) return;
    setLoadingAudit(true);
    try {
      const res = await authFetch(`${apiBase}/api/admin/audit?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.audit || []);
      }
    } catch (err) {
      console.error('[Admin] Error cargando auditoría:', err.message);
    } finally {
      setLoadingAudit(false);
    }
  };

  const cargarProyectosUsuario = async (userId) => {
    setLoadingProjects(true);
    setError(null);
    try {
      const res = await authFetch(`${apiBase}/api/admin/users/${userId}/projects`);
      if (res.ok) {
        const data = await res.json();
        setUserProjects(data.projects || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'No se pudieron obtener los proyectos del usuario.');
      }
    } catch (err) {
      setError(`Error al consultar proyectos: ${err.message}`);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      cargarUsuarios();
      if (activeTab === 'auditoria') cargarAuditoria();
    }
  }, [isOpen, isAdmin, activeTab]);

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setActionLoading('crear');
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await authFetch(`${apiBase}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Usuario "${newUser.username}" creado exitosamente.`);
        setShowCreateModal(false);
        setNewUser({ username: '', email: '', password: '', displayName: '', role: 'user', status: 'active' });
        cargarUsuarios();
      } else {
        setError(data.error || 'Error al crear usuario.');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCambiarRol = async (userId, nuevoRol) => {
    setActionLoading(`rol_${userId}`);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await authFetch(`${apiBase}/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nuevoRol })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Rol actualizado a ${nuevoRol}.`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nuevoRol } : u));
      } else {
        setError(data.error || 'No se pudo actualizar el rol.');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivar = async (userId) => {
    setActionLoading(`act_${userId}`);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await authFetch(`${apiBase}/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Cuenta de usuario activada.`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' } : u));
      } else {
        setError(data.error || 'No se pudo activar el usuario.');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDesactivar = async (userId) => {
    setActionLoading(`des_${userId}`);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await authFetch(`${apiBase}/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'disabled' })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Usuario desactivado.`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'disabled' } : u));
      } else {
        setError(data.error || 'No se pudo desactivar el usuario.');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestablecerPassword = async (e) => {
    e.preventDefault();
    if (!passwordResetUser) return;
    setActionLoading('reset_pass');
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await authFetch(`${apiBase}/api/admin/users/${passwordResetUser.id}/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPasswordValue })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Contraseña actualizada para el usuario "${passwordResetUser.username}".`);
        setPasswordResetUser(null);
        setNewPasswordValue('');
      } else {
        setError(data.error || 'No se pudo restablecer la contraseña.');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEliminar = async (userId, username) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente al usuario "${username}"?`)) {
      return;
    }
    setActionLoading(`del_${userId}`);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await authFetch(`${apiBase}/api/auth/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Usuario "${username}" eliminado.`);
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        setError(data.error || 'No se pudo eliminar el usuario.');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen || !isAdmin) return null;

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)',
        zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '1050px', maxWidth: '96vw', maxHeight: '90vh',
          background: 'var(--bg-panel, #0f172a)',
          borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
          padding: '2rem', overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera y Navegación de Pestañas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(168, 85, 247, 0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171'
            }}>
              <Shield size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', margin: 0 }}>
                Consola Central de Administración
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', margin: '3px 0 0 0' }}>
                Gestión de privilegios RBAC, proyectos por usuario y bitácora de auditoría inmutable.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Selector de Pestañas */}
            <div style={{
              display: 'flex', background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px', padding: '3px', border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                onClick={() => setActiveTab('usuarios')}
                style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  background: activeTab === 'usuarios' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: activeTab === 'usuarios' ? '#38bdf8' : 'rgba(255, 255, 255, 0.6)'
                }}
              >
                <Users size={14} /> Usuarios ({users.length})
              </button>
              <button
                onClick={() => { setActiveTab('proyectos'); if (users.length > 0 && !selectedUserForProjects) { setSelectedUserForProjects(users[0]); cargarProyectosUsuario(users[0].id); } }}
                style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  background: activeTab === 'proyectos' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: activeTab === 'proyectos' ? '#38bdf8' : 'rgba(255, 255, 255, 0.6)'
                }}
              >
                <FolderGit2 size={14} /> Proyectos por Usuario
              </button>
              <button
                onClick={() => { setActiveTab('auditoria'); cargarAuditoria(); }}
                style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  background: activeTab === 'auditoria' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: activeTab === 'auditoria' ? '#38bdf8' : 'rgba(255, 255, 255, 0.6)'
                }}
              >
                <History size={14} /> Auditoría
              </button>
            </div>

            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer', padding: '0.5rem' }}
              title="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#86efac', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* PESTAÑA 1: GESTIÓN DE USUARIOS */}
        {activeTab === 'usuarios' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Total: <strong>{users.length}</strong> usuarios | Pendientes de aprobación: <strong style={{ color: '#f59e0b' }}>{users.filter(u => u.status === 'pending').length}</strong>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-ia"
                style={{
                  padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'linear-gradient(135deg, #38bdf8, #818cf8)', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700
                }}
              >
                <Plus size={15} /> Crear Usuario Directo
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Usuario</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Email</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Rol (RBAC)</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Estado</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Último Acceso</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && users.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                        <div>Cargando directorio de usuarios...</div>
                      </td>
                    </tr>
                  ) : users.map(u => {
                    const isSuperadmin = u.role === 'superadmin';
                    const isPending = u.status === 'pending';
                    const isActive = u.status === 'active';
                    const isBusy = actionLoading?.includes(u.id);

                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: isPending ? 'rgba(245, 158, 11, 0.04)' : 'transparent' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{u.displayName || u.username}</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>@{u.username}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>
                          {u.email || '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <select
                            value={u.role}
                            disabled={isSuperadmin && users.filter(usr => usr.role === 'superadmin').length <= 1}
                            onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '6px', color: u.role === 'superadmin' ? '#f87171' : (u.role === 'revisor' ? '#38bdf8' : '#a855f7'),
                              padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            <option value="user" style={{ background: '#1e293b', color: '#fff' }}>Usuario</option>
                            <option value="revisor" style={{ background: '#1e293b', color: '#fff' }}>Revisor</option>
                            <option value="superadmin" style={{ background: '#1e293b', color: '#fff' }}>Superadmin</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {isActive && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.72rem', fontWeight: 700 }}>
                              <CheckCircle size={13} /> Activo
                            </span>
                          )}
                          {isPending && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.72rem', fontWeight: 700 }}>
                              <Clock size={13} /> Pendiente
                            </span>
                          )}
                          {u.status === 'disabled' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '0.72rem', fontWeight: 700 }}>
                              <XCircle size={13} /> Desactivado
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.72rem' }}>
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                            <button
                              onClick={() => {
                                setSelectedUserForProjects(u);
                                setActiveTab('proyectos');
                                cargarProyectosUsuario(u.id);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '3px 8px', fontSize: '0.68rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                              title="Ver proyectos de este usuario"
                            >
                              <FolderGit2 size={12} style={{ marginRight: '3px' }} /> Proyectos
                            </button>

                            <button
                              onClick={() => setPasswordResetUser(u)}
                              className="btn btn-secondary"
                              style={{ padding: '3px 7px', fontSize: '0.68rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#e2e8f0', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                              title="Restablecer contraseña"
                            >
                              <Key size={12} />
                            </button>

                            {!isSuperadmin && (
                              <>
                                {u.status !== 'active' ? (
                                  <button
                                    onClick={() => handleActivar(u.id)}
                                    disabled={isBusy}
                                    style={{ padding: '3px 8px', fontSize: '0.68rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'pointer' }}
                                    title="Activar cuenta"
                                  >
                                    <UserCheck size={12} style={{ marginRight: '2px' }} /> Activar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDesactivar(u.id)}
                                    disabled={isBusy}
                                    style={{ padding: '3px 8px', fontSize: '0.68rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', cursor: 'pointer' }}
                                    title="Desactivar temporalmente"
                                  >
                                    <UserX size={12} style={{ marginRight: '2px' }} /> Desactivar
                                  </button>
                                )}

                                <button
                                  onClick={() => handleEliminar(u.id, u.username)}
                                  disabled={isBusy}
                                  style={{ padding: '3px 6px', fontSize: '0.68rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer' }}
                                  title="Eliminar permanentemente"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: PROYECTOS POR USUARIO */}
        {activeTab === 'proyectos' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Filtrar por usuario:</span>
              <select
                value={selectedUserForProjects?.id || ''}
                onChange={(e) => {
                  const sel = users.find(u => u.id === e.target.value);
                  setSelectedUserForProjects(sel);
                  if (sel) cargarProyectosUsuario(sel.id);
                }}
                style={{
                  background: 'rgba(20, 27, 45, 0.9)', border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px', color: '#fff', padding: '6px 12px', fontSize: '0.85rem'
                }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.displayName || u.username} (@{u.username})</option>
                ))}
              </select>
              <button
                onClick={() => selectedUserForProjects && cargarProyectosUsuario(selectedUserForProjects.id)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <RefreshCw size={13} className={loadingProjects ? 'animate-spin' : ''} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
              {loadingProjects ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                  <div>Cargando proyectos del usuario...</div>
                </div>
              ) : userProjects.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  El usuario no cuenta con proyectos registrados en esta categoría.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Proyecto</th>
                      <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Tipo</th>
                      <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Avance Sustantivo</th>
                      <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Estado Editorial</th>
                      <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Siguiente Acción</th>
                      <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', textAlign: 'right' }}>Abrir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userProjects.map(proj => (
                      <tr key={proj.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                          <div>{proj.name}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{proj.id}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>
                          {proj.type}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                              <div style={{ height: '100%', width: `${proj.completion}%`, background: proj.completion >= 80 ? '#10b981' : (proj.completion >= 40 ? '#f59e0b' : '#38bdf8') }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{proj.completion}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                            background: proj.workflowStatus === 'Aprobado' ? 'rgba(16, 185, 129, 0.15)' : (proj.workflowStatus === 'En revisión' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)'),
                            color: proj.workflowStatus === 'Aprobado' ? '#10b981' : (proj.workflowStatus === 'En revisión' ? '#f59e0b' : '#38bdf8'),
                            border: `1px solid ${proj.workflowStatus === 'Aprobado' ? 'rgba(16, 185, 129, 0.3)' : (proj.workflowStatus === 'En revisión' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(56, 189, 248, 0.3)')}`
                          }}>
                            {proj.workflowStatus}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.74rem' }}>
                          {proj.nextAction}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          {onOpenProject ? (
                            <button
                              onClick={() => onOpenProject(proj.id, proj.type)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px' }}
                            >
                              Abrir <ArrowRight size={12} style={{ marginLeft: '3px' }} />
                            </button>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: AUDITORÍA */}
        {activeTab === 'auditoria' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Registro inmutable de actividades administrativas, aprobaciones y accesos a proyectos ajenos.
              </div>
              <button
                onClick={cargarAuditoria}
                className="btn btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={13} className={loadingAudit ? 'animate-spin' : ''} /> Actualizar Bitácora
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '0.6rem 0.8rem', color: '#94a3b8' }}>Fecha y Hora</th>
                    <th style={{ padding: '0.6rem 0.8rem', color: '#94a3b8' }}>Actor</th>
                    <th style={{ padding: '0.6rem 0.8rem', color: '#94a3b8' }}>Acción</th>
                    <th style={{ padding: '0.6rem 0.8rem', color: '#94a3b8' }}>Destino</th>
                    <th style={{ padding: '0.6rem 0.8rem', color: '#94a3b8' }}>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        No hay eventos registrados en la bitácora aún.
                      </td>
                    </tr>
                  ) : auditLogs.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.6rem 0.8rem', color: '#cbd5e1' }}>
                        {new Date(item.timestamp).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                        @{item.actorUsername} <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>({item.actorRole})</span>
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700,
                          background: item.action.includes('DELETE') || item.action.includes('DISABLE') ? 'rgba(239, 68, 68, 0.15)' : (item.action.includes('STATUS') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)'),
                          color: item.action.includes('DELETE') || item.action.includes('DISABLE') ? '#ef4444' : (item.action.includes('STATUS') ? '#f59e0b' : '#38bdf8')
                        }}>
                          {item.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', color: '#94a3b8' }}>
                        {item.targetType}:{item.targetId || 'N/A'}
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', color: '#64748b', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {JSON.stringify(item.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL CREAR USUARIO DIRECTO */}
        {showCreateModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001
          }}>
            <form onSubmit={handleCrearUsuario} style={{
              background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px',
              padding: '1.75rem', width: '420px', display: 'flex', flexDirection: 'column', gap: '0.85rem'
            }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Crear Nuevo Usuario</h3>
              
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Nombre de Usuario *</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Nombre Completo</label>
                <input
                  type="text"
                  value={newUser.displayName}
                  onChange={e => setNewUser({ ...newUser, displayName: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Correo Electrónico</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Contraseña Inicial *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Rol Asignado</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="user">Usuario</option>
                    <option value="revisor">Revisor</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Estado</label>
                  <select
                    value={newUser.status}
                    onChange={e => setNewUser({ ...newUser, status: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="active">Activo</option>
                    <option value="pending">Pendiente</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'crear'}
                  className="btn btn-ia"
                  style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#38bdf8', color: '#fff' }}
                >
                  {actionLoading === 'crear' ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL RESTABLECER CONTRASEÑA */}
        {passwordResetUser && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001
          }}>
            <form onSubmit={handleRestablecerPassword} style={{
              background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px',
              padding: '1.75rem', width: '380px', display: 'flex', flexDirection: 'column', gap: '0.85rem'
            }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Restablecer Contraseña</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                Usuario: <strong>@{passwordResetUser.username}</strong>
              </p>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Nueva Contraseña *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={newPasswordValue}
                  onChange={e => setNewPasswordValue(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => { setPasswordResetUser(null); setNewPasswordValue(''); }}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'reset_pass'}
                  className="btn btn-ia"
                  style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#ef4444', color: '#fff' }}
                >
                  {actionLoading === 'reset_pass' ? 'Guardando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pie del Panel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          <div>
            Sesión activa como Superadministrador • Open Business Plan
          </div>
          <button 
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
