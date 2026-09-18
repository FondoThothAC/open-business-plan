/**
 * @file AdminUsersPanel.jsx
 * @description Panel de Administración de Usuarios para Open Business Plan.
 * Permite al superadmin listar, activar, desactivar y eliminar cuentas de usuario.
 * 
 * [CDD] Componente modal autocontenido y reutilizable.
 * [UXDD] Diseño glassmorphism premium con estados visuales y feedback claro.
 * [SECDD] Solo accesible para usuarios con rol superadmin.
 */

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Trash2, Shield, UserCheck, UserX, Clock, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getApiBase } from '../config/apiConfig';

export default function AdminUsersPanel({ isOpen, onClose }) {
  const { isAdmin, authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const apiBase = getApiBase();

  const cargarUsuarios = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${apiBase}/api/auth/users`);
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

  useEffect(() => {
    if (isOpen && isAdmin) {
      cargarUsuarios();
    }
  }, [isOpen, isAdmin]);

  const handleActivar = async (userId) => {
    setActionLoading(userId);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await authFetch(`${apiBase}/api/auth/users/${userId}/activate`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Usuario activado correctamente.`);
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
    setActionLoading(userId);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await authFetch(`${apiBase}/api/auth/users/${userId}/disable`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Usuario desactivado correctamente.`);
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

  const handleEliminar = async (userId, username) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente al usuario "${username}"?`)) {
      return;
    }
    setActionLoading(userId);
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
        background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(10px)',
        zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '800px', maxWidth: '94vw', maxHeight: '85vh',
          padding: '2rem', background: 'var(--bg-panel)',
          borderRadius: '16px', border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#ef4444'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Control de Usuarios y Accesos
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Gestión centralizada de solicitudes de registro, estados y permisos de Superadmin.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={cargarUsuarios}
              disabled={loading}
              className="icon-btn-rounded"
              title="Recargar lista"
              style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
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
            color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tabla de Usuarios */}
        <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-panel-hover)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Usuario</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Email</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Rol</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Estado</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Registro</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 700, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                    <div>Cargando usuarios...</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const isSuperadmin = u.role === 'superadmin';
                  const isPending = u.status === 'pending';
                  const isActive = u.status === 'active';
                  const isBusy = actionLoading === u.id;

                  return (
                    <tr 
                      key={u.id}
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        background: isPending ? 'rgba(245, 158, 11, 0.04)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{u.displayName || u.username}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>({u.username})</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                        {u.email || '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700,
                          background: isSuperadmin ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                          color: isSuperadmin ? '#ef4444' : 'var(--accent-color)',
                          border: `1px solid ${isSuperadmin ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`
                        }}>
                          {isSuperadmin ? 'Superadmin' : 'Usuario'}
                        </span>
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
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        {!isSuperadmin && (
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            {u.status !== 'active' ? (
                              <button
                                onClick={() => handleActivar(u.id)}
                                disabled={isBusy}
                                className="btn btn-secondary"
                                style={{
                                  padding: '4px 8px', fontSize: '0.7rem',
                                  background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                                  border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px'
                                }}
                                title="Aprobar y activar cuenta"
                              >
                                <UserCheck size={13} style={{ marginRight: '3px' }} /> Activar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDesactivar(u.id)}
                                disabled={isBusy}
                                className="btn btn-secondary"
                                style={{
                                  padding: '4px 8px', fontSize: '0.7rem',
                                  background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b',
                                  border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px'
                                }}
                                title="Desactivar acceso temporalmente"
                              >
                                <UserX size={13} style={{ marginRight: '3px' }} /> Desactivar
                              </button>
                            )}
                            <button
                              onClick={() => handleEliminar(u.id, u.username)}
                              disabled={isBusy}
                              className="btn btn-secondary"
                              style={{
                                padding: '4px 6px', fontSize: '0.7rem',
                                background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px'
                              }}
                              title="Eliminar usuario definitivamente"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                        {isSuperadmin && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Protegido
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div>
            Total de usuarios: <strong style={{ color: 'var(--text-primary)' }}>{users.length}</strong> · Pendientes: <strong style={{ color: '#f59e0b' }}>{users.filter(u => u.status === 'pending').length}</strong>
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
