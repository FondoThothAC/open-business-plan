/**
 * @file UserProfileModal.jsx
 * @description Modal de Perfil de Usuario y Gestión de API Keys para Open Business Plan.
 * Permite a cada usuario configurar sus propias API Keys (OpenRouter, Groq, Ollama, Gemini, etc.)
 * y cambiar su contraseña de acceso personal.
 * 
 * [CDD] Componente modal autocontenido.
 * [UXDD] Diseño premium con tabs, feedback visual de guardado y visibilidad segura de claves.
 * [SECDD] Las claves se envían autenticadas y se guardan asociadas a la cuenta del usuario.
 */

import React, { useState, useEffect } from 'react';
import { User, Key, Lock, Eye, EyeOff, Save, CheckCircle, AlertTriangle, X, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getApiBase } from '../config/apiConfig';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, updateKeys, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('keys'); // 'keys' | 'password'
  
  // Estado de API Keys
  const [apiKeys, setApiKeys] = useState({
    openrouter: '',
    groq: '',
    ollamaCloud: '',
    gemini: '',
    openai: '',
    claude: '',
    mistral: '',
    nvidia: '',
    tavily: '',
    brave: ''
  });
  const [configuredKeys, setConfiguredKeys] = useState({});

  // Visibilidad de contraseñas/keys
  const [visibleKeys, setVisibleKeys] = useState({});
  const [keysLoading, setKeysLoading] = useState(false);
  const [keysSuccess, setKeysSuccess] = useState(false);
  const [keysError, setKeysError] = useState(null);

  // Estado de cambio de contraseña
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState(null);

  const apiBase = getApiBase();

  // Cargar keys actuales del usuario
  useEffect(() => {
    if (isOpen && user) {
      if (user.apiKeys) setConfiguredKeys(user.apiKeys);
      setApiKeys(prev => Object.fromEntries(Object.keys(prev).map(key => [key, ''])));
      setKeysSuccess(false);
      setKeysError(null);
      setPassSuccess(false);
      setPassError(null);
    }
  }, [isOpen, user]);

  const toggleKeyVisibility = (keyName) => {
    setVisibleKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const handleKeyChange = (keyName, value) => {
    setApiKeys(prev => ({ ...prev, [keyName]: value }));
  };

  const handleSaveKeys = async (e) => {
    e.preventDefault();
    setKeysLoading(true);
    setKeysError(null);
    setKeysSuccess(false);

    try {
      const changes = Object.fromEntries(Object.entries(apiKeys).filter(([, value]) => value.trim()));
      const res = await updateKeys(changes);
      if (res.success) {
        setKeysSuccess(true);
        setTimeout(() => setKeysSuccess(false), 3500);
      } else {
        setKeysError(res.error || 'Error al guardar las API Keys.');
      }
    } catch (err) {
      setKeysError(`Error: ${err.message}`);
    } finally {
      setKeysLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError(null);
    setPassSuccess(false);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassError('La nueva contraseña y su confirmación no coinciden.');
      setPassLoading(false);
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPassError('La nueva contraseña debe tener al menos 6 caracteres.');
      setPassLoading(false);
      return;
    }

    try {
      const res = await authFetch(`${apiBase}/api/auth/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPassSuccess(true);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPassSuccess(false), 3500);
      } else {
        setPassError(data.error || 'Error al cambiar la contraseña.');
      }
    } catch (err) {
      setPassError(`Error de conexión: ${err.message}`);
    } finally {
      setPassLoading(false);
    }
  };

  if (!isOpen || !user) return null;

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
          width: '720px', maxWidth: '94vw', maxHeight: '88vh',
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
              background: 'rgba(99, 102, 241, 0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)'
            }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Mi Perfil y Credenciales
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                {user.displayName || user.username} ({user.role === 'superadmin' ? 'Superadmin' : 'Usuario'}) · {user.email || 'Sin correo'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs de navegación */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('keys')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
              background: activeTab === 'keys' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'keys' ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Key size={15} /> Mis API Keys (IA & Búsqueda)
          </button>
          <button
            onClick={() => setActiveTab('password')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
              background: activeTab === 'password' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'password' ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Lock size={15} /> Seguridad y Contraseña
          </button>
        </div>

        {/* Contenido: Tab API Keys */}
        {activeTab === 'keys' && (
          <form onSubmit={handleSaveKeys} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--bg-panel-hover)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              💡 <strong>Aislamiento de Costos:</strong> Configura aquí tus propias credenciales. Cada llamada que realices en tus proyectos utilizará tus API keys personales, manteniendo tus consumos completamente independientes.
            </div>

            {keysError && (
              <div style={{
                padding: '0.65rem 0.85rem', borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <AlertTriangle size={15} />
                <span>{keysError}</span>
              </div>
            )}

            {keysSuccess && (
              <div style={{
                padding: '0.65rem 0.85rem', borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <CheckCircle size={15} />
                <span>API Keys guardadas exitosamente en tu perfil.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {[
                { key: 'openrouter', label: 'OpenRouter (Recomendado Gratuito)', placeholder: 'sk-or-v1-...', guide: 'https://openrouter.ai/settings/keys' },
                { key: 'groq', label: 'Groq Cloud (Ultra Rápido)', placeholder: 'gsk_...', guide: 'https://console.groq.com/keys' },
                { key: 'ollamaCloud', label: 'MiniMax / Ollama Cloud', placeholder: 'Key de nube...', guide: 'https://ollama.com/settings/keys' },
                { key: 'gemini', label: 'Google Gemini', placeholder: 'AIzaSy...', guide: 'https://aistudio.google.com/app/apikey' },
                { key: 'openai', label: 'OpenAI (GPT-4o / GPT-5)', placeholder: 'sk-...', guide: 'https://platform.openai.com/api-keys' },
                { key: 'claude', label: 'Anthropic Claude', placeholder: 'sk-ant-...', guide: 'https://console.anthropic.com/settings/keys' },
                { key: 'mistral', label: 'Mistral AI', placeholder: 'Key Mistral...', guide: 'https://console.mistral.ai/api-keys' },
                { key: 'nvidia', label: 'NVIDIA NIM (Nemotron)', placeholder: 'nvapi-...', guide: 'https://build.nvidia.com/settings/api-keys' },
                { key: 'tavily', label: 'Tavily Search (Búsqueda Web)', placeholder: 'tvly-...', guide: 'https://app.tavily.com/home' },
                { key: 'brave', label: 'Brave Search API', placeholder: 'BSA...', guide: 'https://api-dashboard.search.brave.com/app/keys' },
              ].map(item => {
                const isVisible = visibleKeys[item.key];
                return (
                  <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', gap: '0.4rem' }}>
                      <span>{item.label}</span>
                      <a href={item.guide} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Obtener clave ↗</a>
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={isVisible ? 'text' : 'password'}
                        className="form-control"
                        placeholder={configuredKeys[item.key]?.configured ? `Configurada: ${configuredKeys[item.key].masked}` : item.placeholder}
                        value={apiKeys[item.key] || ''}
                        onChange={e => handleKeyChange(item.key, e.target.value)}
                        style={{ fontSize: '0.78rem', paddingRight: '2rem', width: '100%' }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(item.key)}
                        style={{
                          position: 'absolute', right: '8px', background: 'transparent',
                          border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', padding: 0
                        }}
                        title={isVisible ? "Ocultar" : "Mostrar"}
                      >
                        {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={keysLoading}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.5rem', fontSize: '0.85rem' }}
              >
                {keysLoading ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                <span>{keysLoading ? 'Guardando...' : 'Guardar mis API Keys'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Contenido: Tab Seguridad */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, padding: '0.5rem 0' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--bg-panel-hover)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              🔒 <strong>Seguridad de Cuenta:</strong> Actualiza periódicamente tu contraseña. Debe contener al menos 6 caracteres.
            </div>

            {passError && (
              <div style={{
                padding: '0.65rem 0.85rem', borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <AlertTriangle size={15} />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div style={{
                padding: '0.65rem 0.85rem', borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <CheckCircle size={15} />
                <span>Contraseña actualizada correctamente.</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '400px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  required
                  className="form-control"
                  placeholder="Tu contraseña actual"
                  value={passwords.currentPassword}
                  onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-control"
                  placeholder="Mínimo 6 caracteres"
                  value={passwords.newPassword}
                  onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  className="form-control"
                  placeholder="Repite la nueva contraseña"
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={passLoading}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.5rem', fontSize: '0.85rem' }}
              >
                {passLoading ? <RefreshCw size={15} className="animate-spin" /> : <Lock size={15} />}
                <span>{passLoading ? 'Actualizando...' : 'Cambiar Contraseña'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Pie */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '0.45rem 1.25rem', fontSize: '0.8rem' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
