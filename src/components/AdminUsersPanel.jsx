/**
 * @file AdminUsersPanel.jsx
 * @description Panel integral de Administración de Usuarios, Auditoría y Proyectos para Open Business Plan.
 * Permite al superadmin crear usuarios, asignar rol (superadmin, revisor, user),
 * cambiar estados (activo, pendiente, desactivado), restablecer contraseñas,
 * auditar la actividad del sistema, examinar el estado de avance de los proyectos por usuario,
 * y auditar el consumo y cuotas de tokens de IA por usuario.
 * 
 * [CDD] Componente modal autocontenido y reutilizable con pestañas especializadas.
 * [UXDD] Diseño glassmorphism premium con estados visuales claros, badges y animaciones fluidas.
 * [SECDD] Acceso exclusivo reservado para usuarios con rol superadmin.
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Trash2, Shield, UserCheck, UserX, 
  Clock, AlertTriangle, RefreshCw, X, Key, FolderGit2, History, Plus, 
  Search, ArrowRight, FileText, Check, Lock, Zap, Activity, Cpu, Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getApiBase } from '../config/apiConfig';

export default function AdminUsersPanel({ isOpen, onClose, onOpenProject }) {
  const { isAdmin, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'proyectos' | 'auditoria' | 'tokens'
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

  // Estados para telemetría de tokens
  const [tokenTelemetry, setTokenTelemetry] = useState(null);
  const [loadingTokens, setLoadingTokens] = useState(false);

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

  const cargarTelemetriaTokens = async () => {
    if (!isAdmin) return;
    setLoadingTokens(true);
    try {
      const res = await authFetch(`${apiBase}/api/telemetry/tokens`);
      if (res.ok) {
        const data = await res.json();
        setTokenTelemetry(data);
      }
    } catch (err) {
      console.error('[Admin] Error cargando telemetría de tokens:', err.message);
    } finally {
      setLoadingTokens(false);
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
      if (activeTab === 'tokens') cargarTelemetriaTokens();
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

  const handleSharedApiAccess = async (userId, enabled) => {
    setActionLoading(`apis_${userId}`);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await authFetch(`${apiBase}/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedApiAccessEnabled: enabled })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(enabled ? 'Acceso compartido habilitado por 30 días.' : 'Acceso compartido retirado.');
        setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
      } else {
        setError(data.error || 'No se pudo actualizar el acceso a las APIs compartidas.');
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

  // Cálculos para la vista de Telemetría
  const accTokens = tokenTelemetry?._accumulated || {};
  const usersTelemetry = tokenTelemetry?._byUser || {};
  const globalTotalTokens = Object.values(accTokens).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);

  const providerColors = {
    ollama: '#10b981',
    ollama_cloud: '#6366f1',
    groq: '#f59e0b',
    gemini: '#38bdf8',
    openai: '#10b981',
    claude: '#d97706',
    nvidia: '#22d3ee',
    mistral: '#ec4899',
    openrouter: '#f59e0b',
    tokenrouter: '#10b981',
    opencode: '#a78bfa',
    orcarouter: '#f97316',
    minimax: '#fbbf24',
    deepseek: '#3b82f6',
    bai: '#06b6d4',
  };

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
                Gestión de privilegios RBAC, proyectos por usuario, bitácora y auditoría de tokens por usuario.
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
              <button
                onClick={() => { setActiveTab('tokens'); cargarTelemetriaTokens(); }}
                style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  background: activeTab === 'tokens' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: activeTab === 'tokens' ? '#10b981' : 'rgba(255, 255, 255, 0.6)'
                }}
              >
                <Zap size={14} /> Consumo de Tokens
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
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>APIs compartidas</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Último Acceso</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && users.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                        <div>Cargando directorio de usuarios...</div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        No se encontraron usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{u.displayName || u.username}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>@{u.username}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                            disabled={actionLoading === `rol_${u.id}`}
                            style={{
                              background: '#1e293b', color: u.role === 'superadmin' ? '#f87171' : (u.role === 'revisor' ? '#38bdf8' : '#e2e8f0'),
                              border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600
                            }}
                          >
                            <option value="user">user (Estándar)</option>
                            <option value="revisor">revisor (Auditor)</option>
                            <option value="superadmin">superadmin (Control Total)</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                            background: u.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : (u.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
                            color: u.status === 'active' ? '#34d399' : (u.status === 'pending' ? '#fbbf24' : '#f87171')
                          }}>
                            {u.status === 'active' ? 'Activo' : (u.status === 'pending' ? 'Pendiente' : 'Desactivado')}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <button
                            onClick={() => handleSharedApiAccess(u.id, !u.sharedApiAccessEnabled)}
                            disabled={actionLoading === `apis_${u.id}`}
                            style={{
                              padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                              background: u.sharedApiAccessEnabled ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                              color: u.sharedApiAccessEnabled ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)'
                            }}
                          >
                            {u.sharedApiAccessEnabled ? 'Habilitado (30d)' : 'Deshabilitado'}
                          </button>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' }) : 'Nunca'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            {u.status !== 'active' ? (
                              <button
                                onClick={() => handleActivar(u.id)}
                                disabled={actionLoading === `act_${u.id}`}
                                title="Activar cuenta"
                                style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer' }}
                              >
                                <UserCheck size={14} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDesactivar(u.id)}
                                disabled={actionLoading === `des_${u.id}`}
                                title="Desactivar cuenta"
                                style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer' }}
                              >
                                <UserX size={14} />
                              </button>
                            )}

                            <button
                              onClick={() => { setPasswordResetUser(u); setNewPasswordValue(''); }}
                              title="Restablecer Contraseña"
                              style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer' }}
                            >
                              <Key size={14} />
                            </button>

                            <button
                              onClick={() => handleEliminar(u.id, u.username)}
                              disabled={actionLoading === `del_${u.id}`}
                              title="Eliminar permanentemente"
                              style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: PROYECTOS POR USUARIO */}
        {activeTab === 'proyectos' && (
          <div style={{ display: 'flex', flex: 1, gap: '1.25rem', overflow: 'hidden' }}>
            {/* Lista de Usuarios a la Izquierda */}
            <div style={{ width: '280px', borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Seleccionar Usuario
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {users.map(u => {
                  const isSelected = selectedUserForProjects?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUserForProjects(u);
                        cargarProyectosUsuario(u.id);
                      }}
                      style={{
                        textAlign: 'left', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: isSelected ? '#38bdf8' : '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{u.displayName || u.username}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>@{u.username} • {u.role}</div>
                      </div>
                      <ArrowRight size={14} opacity={isSelected ? 1 : 0.4} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel de Proyectos del Usuario Seleccionado */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden' }}>
              {selectedUserForProjects ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff' }}>
                        Planes de Negocio de {selectedUserForProjects.displayName || selectedUserForProjects.username}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Total registrados: {userProjects.length} proyectos
                      </span>
                    </div>
                    <button
                      onClick={() => cargarProyectosUsuario(selectedUserForProjects.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      <RefreshCw size={12} className={loadingProjects ? 'animate-spin' : ''} /> Refrescar
                    </button>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {loadingProjects ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                        <div>Consultando proyectos en base de datos...</div>
                      </div>
                    ) : userProjects.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
                        Este usuario no tiene ningún plan de negocio creado aún.
                      </div>
                    ) : (
                      userProjects.map(proj => (
                        <div 
                          key={proj.slug || proj.id}
                          style={{
                            padding: '1rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>
                              {proj.nombre || proj.title || proj.slug}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                              Slug: <code style={{ color: '#38bdf8' }}>{proj.slug}</code> • Modificado: {proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'N/A'}
                            </div>
                            {proj.progreso !== undefined && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${proj.progreso}%`, height: '100%', background: '#38bdf8', borderRadius: '3px' }} />
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>{proj.progreso}% completado</span>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {onOpenProject && (
                              <button
                                onClick={() => {
                                  onOpenProject(proj.slug);
                                  onClose();
                                }}
                                className="btn btn-ia"
                                style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}
                              >
                                Inspeccionar Plan
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  Selecciona un usuario de la lista izquierda para auditar sus proyectos.
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: BITÁCORA DE AUDITORÍA */}
        {activeTab === 'auditoria' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '400px' }}>
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Filtrar bitácora por actor, acción o proyecto..."
                  value={auditFilter}
                  onChange={e => setAuditFilter(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem'
                  }}
                />
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
                  ) : auditLogs
                    .filter(item => {
                      if (!auditFilter) return true;
                      const q = auditFilter.toLowerCase();
                      return (
                        (item.actorUsername || '').toLowerCase().includes(q) ||
                        (item.action || '').toLowerCase().includes(q) ||
                        (item.targetId || '').toLowerCase().includes(q)
                      );
                    })
                    .map(item => (
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

        {/* PESTAÑA 4: AUDITORÍA Y CONSUMO DE TOKENS POR USUARIO */}
        {activeTab === 'tokens' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', gap: '1rem' }}>
            {/* Tarjetas resumen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={14} /> Total Tokens Sistema
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                  {globalTotalTokens >= 1000000 ? `${(globalTotalTokens / 1000000).toFixed(2)}M` : globalTotalTokens >= 1000 ? `${(globalTotalTokens / 1000).toFixed(1)}k` : globalTotalTokens.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>Acumulado histórico</div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div style={{ fontSize: '0.7rem', color: '#7dd3fc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> Usuarios Auditados
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                  {Object.keys(usersTelemetry).length || users.length}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>Con actividad registrada</div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Cpu size={14} /> Proveedor Principal
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818cf8', marginTop: '4px', textTransform: 'capitalize' }}>
                  {Object.entries(accTokens).sort((a,b) => b[1]-a[1])[0]?.[0]?.replace('_', ' ') || 'Ollama Cloud'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>Mayor volumen de inferencia</div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#fde68a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity size={14} /> Actualización
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
                    En vivo desde backend
                  </div>
                </div>
                <button
                  onClick={cargarTelemetriaTokens}
                  disabled={loadingTokens}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <RefreshCw size={11} className={loadingTokens ? 'animate-spin' : ''} /> Refrescar Métricas
                </button>
              </div>
            </div>

            {/* Tabla de Consumo por Usuario */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Usuario</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Rol</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Tokens Totales</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>% Consumo</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Desglose por Proveedor</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Última Llamada IA</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTokens && !tokenTelemetry ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                        <div>Cargando telemetría de tokens por usuario...</div>
                      </td>
                    </tr>
                  ) : users.map(user => {
                    const userTel = usersTelemetry[user.username] || { totalTokens: 0, byProvider: {}, lastCall: null };
                    const userTokens = userTel.totalTokens || 0;
                    const pct = globalTotalTokens > 0 ? ((userTokens / globalTotalTokens) * 100).toFixed(1) : 0;
                    const byProv = userTel.byProvider || {};

                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{user.displayName || user.username}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>@{user.username}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700,
                            background: user.role === 'superadmin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: user.role === 'superadmin' ? '#f87171' : '#38bdf8'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: userTokens > 0 ? '#10b981' : '#64748b' }}>
                          {userTokens.toLocaleString()} tokens
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: '#10b981', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {Object.keys(byProv).length === 0 ? (
                              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Sin llamadas</span>
                            ) : (
                              Object.entries(byProv).map(([prov, tokens]) => (
                                <span 
                                  key={prov}
                                  style={{
                                    fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px',
                                    background: `${providerColors[prov] || '#64748b'}22`,
                                    color: providerColors[prov] || '#94a3b8',
                                    border: `1px solid ${providerColors[prov] || '#64748b'}44`
                                  }}
                                >
                                  {prov}: {tokens >= 1000 ? `${(tokens/1000).toFixed(1)}k` : tokens}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.72rem' }}>
                          {userTel.lastCall ? new Date(userTel.lastCall).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : 'Sin registro'}
                        </td>
                      </tr>
                    );
                  })}
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
