/**
 * @file AuthContext.jsx
 * @description Contexto de autenticación para React con soporte para cookies HttpOnly y Recordarme.
 * Gestiona el estado de sesión del usuario, verificación de roles (superadmin, revisor, user)
 * y migración transparente de tokens heredados desde localStorage.
 * 
 * [CDD] Componente proveedor reutilizable que envuelve la aplicación.
 * [SECDD] El JWT se almacena exclusivamente en cookies HttpOnly y SameSite; ya no se expone a localStorage.
 * [DDD] Entidad User: { id, username, role, displayName, email, apiKeys, status }
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiBase } from '../config/apiConfig.js';

const AuthContext = createContext(null);

// Keys legadas de localStorage para migración y compatibilidad
const TOKEN_KEY = 'obp_auth_token';
const USER_KEY = 'obp_auth_user';

/**
 * Hook para acceder al contexto de autenticación en cualquier componente.
 * @returns {{
 *   user: Object|null,
 *   isAuthenticated: boolean,
 *   isAdmin: boolean,
 *   isRevisor: boolean,
 *   isRegularUser: boolean,
 *   login: Function,
 *   logout: Function,
 *   register: Function,
 *   updateKeys: Function,
 *   refreshProfile: Function,
 *   authFetch: Function,
 *   loading: boolean
 * }}
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
 * Gestiona ciclo de vida de sesiones basadas en cookies HttpOnly con migración transparente.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBase = getApiBase();

  /**
   * Realiza un fetch autenticado incluyendo credenciales de cookies HttpOnly.
   * Si existiera un token legado en localStorage, lo añade como fallback de migración.
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<Response>}
   */
  const authFetch = useCallback(async (url, options = {}) => {
    const fetchOptions = {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {})
      }
    };

    const tokenLegado = localStorage.getItem(TOKEN_KEY);
    if (tokenLegado && !fetchOptions.headers['Authorization']) {
      fetchOptions.headers['Authorization'] = `Bearer ${tokenLegado}`;
    }

    return fetch(url, fetchOptions);
  }, []);

  /**
   * Verifica la sesión activa al arrancar la app.
   * Si existe un token heredado en localStorage, lo envía una sola vez para que el servidor
   * establezca la cookie HttpOnly y luego lo elimina permanentemente del navegador.
   */
  useEffect(() => {
    const verificarSesion = async () => {
      const tokenLegado = localStorage.getItem(TOKEN_KEY);
      const headers = {};
      if (tokenLegado) {
        headers['Authorization'] = `Bearer ${tokenLegado}`;
      }

      try {
        const res = await fetch(`${apiBase}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers
        });

        if (res.ok) {
          const datos = await res.json();
          setUser(datos);
          localStorage.setItem('openplan_user_id', datos.username);

          // Si el servidor aceptó la sesión y había un token legado en localStorage, purgarlo
          if (tokenLegado) {
            localStorage.removeItem(TOKEN_KEY);
            console.log('[Auth] Sesión migrada con éxito a cookie HttpOnly. Token legado eliminado de localStorage.');
          }
        } else {
          // Sesión no válida o expirada
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem('openplan_user_id');
        }
      } catch {
        // En caso de corte de red, intentar cargar caché visual temporal de usuario
        const userGuardado = localStorage.getItem(USER_KEY);
        if (userGuardado) {
          try {
            setUser(JSON.parse(userGuardado));
          } catch {
            // JSON corrupto
          }
        }
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, [apiBase]);

  /**
   * Inicia sesión con credenciales y opción Recordarme.
   * El token se gestiona exclusivamente por cookie HttpOnly del servidor.
   * @param {string} username
   * @param {string} password
   * @param {boolean} [rememberMe=false]
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const login = async (username, password, rememberMe = false) => {
    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe })
      });

      const datos = await res.json();

      if (!res.ok) {
        return { success: false, error: datos.error || 'Error de autenticación.' };
      }

      // La sesión ahora viaja en cookie HttpOnly. Purgar cualquier token legado
      localStorage.removeItem(TOKEN_KEY);
      localStorage.setItem(USER_KEY, JSON.stringify(datos.user));
      localStorage.setItem('openplan_user_id', datos.user.username);
      setUser(datos.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: `Error de conexión: ${error.message}` };
    }
  };

  /**
   * Registra un nuevo usuario en estado pendiente de aprobación.
   * @param {{ username: string, email?: string, password: string, displayName?: string }} datos
   * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
   */
  const register = async ({ username, email, password, displayName }) => {
    try {
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
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
   * Cierra la sesión activa en el servidor eliminando la cookie HttpOnly y limpiando el estado.
   */
  const logout = async () => {
    try {
      await fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // Ignorar errores de red al cerrar sesión
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('openplan_user_id');
      setUser(null);
    }
  };

  /**
   * Actualiza las API keys del usuario autenticado.
   * @param {Object} keys
   * @returns {Promise<{ success: boolean, error?: string }>}
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
    isAuthenticated: !!user,
    isAdmin: user?.role === 'superadmin',
    isRevisor: user?.role === 'revisor',
    isRegularUser: user?.role === 'user',
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
