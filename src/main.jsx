import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Interceptor global de fetch para inyectar autenticación en peticiones al backend.
// Soporta desarrollo (localhost:3001) y producción (/obp/api, /api).
// Inyecta: Authorization (JWT) + x-user-id (legacy compatibilidad).
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  const urlString = String(url);
  const esBackend = urlString.startsWith('http://localhost:3001')
    || urlString.startsWith('/api')
    || urlString.startsWith('/obp/api');
  if (esBackend) {
    options = options || {};
    options.headers = options.headers || {};

    // Inyectar JWT token si existe
    const token = localStorage.getItem('obp_auth_token');
    if (token) {
      if (options.headers instanceof Headers) {
        if (!options.headers.has('Authorization')) {
          options.headers.set('Authorization', `Bearer ${token}`);
        }
      } else {
        if (!options.headers['Authorization']) {
          options.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    // Inyectar x-user-id (legacy compatibilidad)
    const userId = localStorage.getItem('openplan_user_id');
    if (userId) {
      if (options.headers instanceof Headers) {
        options.headers.set('x-user-id', userId);
      } else {
        options.headers['x-user-id'] = userId;
      }
    }
  }
  return originalFetch.call(this, url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
