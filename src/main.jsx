import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Interceptor de fetch para inyectar header de usuario en peticiones al backend.
// Soporta desarrollo (localhost:3001) y producción (/obp/api, /api).
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  const urlString = String(url);
  const esBackend = urlString.startsWith('http://localhost:3001')
    || urlString.startsWith('/api')
    || urlString.startsWith('/obp/api');
  if (esBackend) {
    const userId = localStorage.getItem('openplan_user_id');
    if (userId) {
      options = options || {};
      options.headers = options.headers || {};
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
