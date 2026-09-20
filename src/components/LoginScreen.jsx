/**
 * @file LoginScreen.jsx
 * @description Pantalla de autenticación premium para Open Business Plan.
 * Soporta login y registro con aprobación manual.
 * Diseño: modo oscuro, glassmorphism, animaciones suaves.
 * 
 * [UXDD] Estética premium con transiciones fluidas.
 * [CDD] Componente independiente y autocontenido.
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * Pantalla de login/registro completa.
 * Se muestra cuando no hay sesión activa.
 */
export default function LoginScreen() {
  const { login, register } = useAuth();
  const [modo, setModo] = useState('login'); // 'login' | 'register' | 'pendiente'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeRegistro, setMensajeRegistro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const resultado = await login(username, password, rememberMe);
    if (!resultado.success) {
      setError(resultado.error);
    }
    setCargando(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const resultado = await register({ username, email, password, displayName });
    if (resultado.success) {
      setMensajeRegistro(resultado.message);
      setModo('pendiente');
    } else {
      setError(resultado.error);
    }
    setCargando(false);
  };

  // ─── Estilos inline (consistentes con el diseño dark del proyecto) ───
  const estilos = {
    contenedor: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #141b2d 40%, #1a1040 100%)',
      fontFamily: "'Inter', 'Outfit', sans-serif",
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    },
    fondo: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(ellipse at 20% 50%, rgba(56, 189, 248, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)',
      pointerEvents: 'none'
    },
    tarjeta: {
      background: 'rgba(20, 27, 45, 0.85)',
      backdropFilter: 'blur(20px)',
      borderRadius: '1.25rem',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '2.5rem 2rem',
      width: '100%',
      maxWidth: '420px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 100px rgba(56, 189, 248, 0.03)',
      position: 'relative',
      zIndex: 2,
      animation: 'loginFadeIn 0.6s ease-out'
    },
    logo: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    titulo: {
      fontSize: '1.5rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #38bdf8, #a855f7)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: '0.5rem 0 0.25rem',
      fontFamily: "'Outfit', sans-serif"
    },
    subtitulo: {
      fontSize: '0.8rem',
      color: 'rgba(255,255,255,0.4)',
      margin: 0,
      letterSpacing: '0.05em'
    },
    campo: {
      width: '100%',
      padding: '0.75rem 1rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '0.75rem',
      color: '#e2e8f0',
      fontSize: '0.9rem',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      marginBottom: '1rem',
      boxSizing: 'border-box',
      fontFamily: "'Inter', sans-serif"
    },
    label: {
      display: 'block',
      fontSize: '0.75rem',
      color: 'rgba(255,255,255,0.5)',
      marginBottom: '0.35rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    boton: {
      width: '100%',
      padding: '0.85rem',
      background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
      border: 'none',
      borderRadius: '0.75rem',
      color: '#fff',
      fontSize: '0.95rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'transform 0.15s, box-shadow 0.2s, opacity 0.2s',
      letterSpacing: '0.02em',
      fontFamily: "'Inter', sans-serif"
    },
    botonDeshabilitado: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    error: {
      background: 'rgba(239, 68, 68, 0.12)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '0.6rem',
      padding: '0.65rem 0.85rem',
      color: '#fca5a5',
      fontSize: '0.8rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    exito: {
      background: 'rgba(34, 197, 94, 0.12)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      borderRadius: '0.6rem',
      padding: '0.85rem',
      color: '#86efac',
      fontSize: '0.85rem',
      textAlign: 'center',
      lineHeight: 1.5
    },
    enlace: {
      color: '#38bdf8',
      cursor: 'pointer',
      fontSize: '0.8rem',
      textDecoration: 'none',
      fontWeight: 600,
      transition: 'color 0.2s'
    },
    separador: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      margin: '1.25rem 0',
      color: 'rgba(255,255,255,0.25)',
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    },
    linea: {
      flex: 1,
      height: '1px',
      background: 'rgba(255,255,255,0.1)'
    }
  };

  // ─── Pantalla de registro pendiente ───
  if (modo === 'pendiente') {
    return (
      <div style={estilos.contenedor}>
        <div style={estilos.fondo} />
        <div style={estilos.tarjeta}>
          <div style={estilos.logo}>
            <div style={{ fontSize: '3rem' }}>⏳</div>
            <h1 style={{ ...estilos.titulo, fontSize: '1.3rem' }}>Registro Enviado</h1>
          </div>
          <div style={estilos.exito}>
            {mensajeRegistro || 'Tu cuenta ha sido creada. El administrador debe aprobarla antes de que puedas iniciar sesión.'}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <span
              style={estilos.enlace}
              onClick={() => { setModo('login'); setError(''); }}
            >
              ← Volver al inicio de sesión
            </span>
          </div>
        </div>
        <style>{`@keyframes loginFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.fondo} />
      <div style={estilos.tarjeta}>
        {/* Logo y título */}
        <div style={estilos.logo}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🏭</div>
          <h1 style={estilos.titulo}>Open Business Plan</h1>
          <p style={estilos.subtitulo}>
            {modo === 'login' ? 'Motor de Planeación Empresarial' : 'Crear Nueva Cuenta'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={estilos.error}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Login */}
        {modo === 'login' && (
          <form onSubmit={handleLogin}>
            <label style={estilos.label}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu_usuario"
              style={estilos.campo}
              autoComplete="username"
              autoFocus
              required
            />

            <label style={estilos.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={estilos.campo}
              autoComplete="current-password"
              required
            />

            {/* Checkbox Recordarme */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              padding: '0.25rem 0.2rem'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    cursor: 'pointer',
                    width: '16px',
                    height: '16px',
                    accentColor: '#38bdf8'
                  }}
                />
                <span>Recordarme (30 días)</span>
              </label>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                {rememberMe ? 'Sesión extendida' : 'Sesión de navegador'}
              </span>
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{
                ...estilos.boton,
                ...(cargando ? estilos.botonDeshabilitado : {})
              }}
              onMouseEnter={(e) => { if (!cargando) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 25px rgba(56, 189, 248, 0.25)'; } }}
              onMouseLeave={(e) => { e.target.style.transform = ''; e.target.style.boxShadow = ''; }}
            >
              {cargando ? '⏳ Verificando...' : '🔐 Iniciar Sesión'}
            </button>

            <div style={estilos.separador}>
              <div style={estilos.linea} />
              <span>o</span>
              <div style={estilos.linea} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <span
                style={estilos.enlace}
                onClick={() => { setModo('register'); setError(''); }}
              >
                ¿No tienes cuenta? Solicitar acceso →
              </span>
            </div>
          </form>
        )}

        {/* Formulario de Registro */}
        {modo === 'register' && (
          <form onSubmit={handleRegister}>
            <label style={estilos.label}>Nombre de Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="mi_usuario"
              style={estilos.campo}
              autoComplete="username"
              autoFocus
              required
              minLength={3}
              maxLength={30}
            />

            <label style={estilos.label}>Nombre Completo</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Juan Pérez"
              style={estilos.campo}
            />

            <label style={estilos.label}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              style={estilos.campo}
              autoComplete="email"
            />

            <label style={estilos.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={estilos.campo}
              autoComplete="new-password"
              required
              minLength={6}
            />

            <button
              type="submit"
              disabled={cargando}
              style={{
                ...estilos.boton,
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                ...(cargando ? estilos.botonDeshabilitado : {})
              }}
              onMouseEnter={(e) => { if (!cargando) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.25)'; } }}
              onMouseLeave={(e) => { e.target.style.transform = ''; e.target.style.boxShadow = ''; }}
            >
              {cargando ? '⏳ Enviando...' : '📝 Solicitar Acceso'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span
                style={estilos.enlace}
                onClick={() => { setModo('login'); setError(''); }}
              >
                ← Ya tengo cuenta, iniciar sesión
              </span>
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '0.65rem 0.85rem',
              background: 'rgba(56, 189, 248, 0.08)',
              borderRadius: '0.6rem',
              border: '1px solid rgba(56, 189, 248, 0.15)',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.5
            }}>
              ℹ️ Tu cuenta será revisada por el administrador antes de ser activada.
              Recibirás acceso una vez aprobada.
            </div>
          </form>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.2)'
        }}>
          Fondo Thoth AC • Empresas Cuánticas
        </div>
      </div>

      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus {
          border-color: rgba(56, 189, 248, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
