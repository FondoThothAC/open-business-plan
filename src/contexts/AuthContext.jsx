/**
 * @file AuthContext.jsx
 * @description Contexto de autenticación para React.
 * Gestiona el estado de sesión, JWT, login/logout, y perfil del usuario.
 * 
 * [CDD] Componente proveedor reutilizable que envuelve toda la app.
 * [SECDD] El JWT se almacena en localStorage con key 'obp_auth_token'.
 * [DDD] Entidad User: { id, username, role, displayName, email, apiKeys }
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiBase } from '../config/apiConfig.js';

const AuthContext = createContext(null);

// Key de localStorage para persistir la sesión
const TOKEN_KEY = 'obp_auth_token';
const USER_KEY = 'obp_auth_user';

/**
 * Hook para acceder al contexto de autenticación.
 * @returns {{ user, token, isAuthenticated, isAdmin, login, logout, register, updateKeys, refreshProfile, loading }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}

/**
 * Proveedor de autenticación que envuelve la app.
 * Verifica el JWT al cargar y expone funciones de login/logout/registro.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBase = getApiBase();

  /**
   * Realiza un fetch autenticado con el JWT.
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<Response>}
   */
  const authFetch = useCallback(async (url, options = {}) => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (currentToken) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${currentToken}`
      };
    }
    return fetch(url, options);
  }, []);

  /**
   * Verifica el token almacenado al cargar la app.
   * Si el token es válido, carga el perfil del usuario.
   */
  useEffect(() => {
    const verificarSesion = async () => {
      const tokenGuardado = localStorage.getItem(TOKEN_KEY);
      if (!tokenGuardado) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiBase}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${tokenGuardado}` }
        });

        if (res.ok) {
          const datos = await res.json();
          setUser(datos);
          setToken(tokenGuardado);
          // Compatibilidad: setear también el user_id para el interceptor legacy
          localStorage.setItem('openplan_user_id', datos.username);
        } else {
          // Token inválido o expirado — limpiar sesión
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem('openplan_user_id');
        }
      } catch {
        // Error de red — mantener sesión local si existe
        const userGuardado = localStorage.getItem(USER_KEY);
        if (userGuardado) {
          try {
            setUser(JSON.parse(userGuardado));
            setToken(tokenGuardado);
          } catch {
            // JSON corrupto
          }
        }
      }

      setLoading(false);
    };

    verificarSesion();
  }, [apiBase]);

  /**
   * Inicia sesión con username y password.
   * @param {string} username
   * @param {string} password
   * @returns {{ success: boolean, error?: string }}
   */
  const login = async (username, password) => {
    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const datos = await res.json();

      if (!res.ok) {
        return { success: false, error: datos.error || 'Error de autenticación.' };
      }

      // Guardar sesión
      localStorage.setItem(TOKEN_KEY, datos.token);
      localStorage.setItem(USER_KEY, JSON.stringify(datos.user));
      localStorage.setItem('openplan_user_id', datos.user.username);
      setToken(datos.token);
      setUser(datos.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: `Error de conexión: ${error.message}` };
    }
  };

  /**
   * Registra un nuevo usuario (queda pendiente de aprobación).
   * @param {{ username, email, password, displayName }} datos
   * @returns {{ success: boolean, message?: string, error?: string }}
   */
  const register = async ({ username, email, password, displayName }) => {
    try {
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, displayName })
      });

      const datos = await res.json();

      if (!res.ok) {
        return { success: false, error: datos.error || 'Error de registro.' };
      }

      return { success: true, message: datos.message };
    } catch (error) {
      return { success: false, error: `Error de conexión: ${error.message}` };
    }
  };

  /**
   * Cierra la sesión actual.
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('openplan_user_id');
    setToken(null);
    setUser(null);
  };

  /**
   * Actualiza las API keys del usuario actual.
   * @param {Object} keys — { openrouter: 'sk-...', groq: 'gsk-...' }
   * @returns {{ success: boolean, error?: string }}
   */
  const updateKeys = async (keys) => {
    try {
      const res = await authFetch(`${apiBase}/api/auth/me/keys`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys)
      });

      const datos = await res.json();
      if (res.ok && datos.apiKeys) {
        setUser(prev => ({ ...prev, apiKeys: datos.apiKeys }));
        localStorage.setItem(USER_KEY, JSON.stringify({ ...user, apiKeys: datos.apiKeys }));
      }

      return res.ok ? { success: true } : { success: false, error: datos.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Refresca el perfil del usuario desde el servidor.
   */
  const refreshProfile = async () => {
    try {
      const res = await authFetch(`${apiBase}/api/auth/me`);
      if (res.ok) {
        const datos = await res.json();
        setUser(datos);
        localStorage.setItem(USER_KEY, JSON.stringify(datos));
      }
    } catch {
      // Silencioso
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'superadmin',
    login,
    logout,
    register,
    updateKeys,
    refreshProfile,
    authFetch,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
