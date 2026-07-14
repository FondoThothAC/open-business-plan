import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Intercept fetch calls to local backend and inject user-id header if set in localStorage
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  const urlString = String(url);
  if (urlString.startsWith('http://localhost:3001') || urlString.startsWith('/api')) {
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
