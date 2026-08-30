import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';
import { getApiBase, safeFetchJson } from '../config/apiConfig';

/**
 * Banner de Diagnóstico de Salud del Servidor Backend.
 * Supervisa reactivamente el estado de la API y ofrece orientación inmediata al usuario
 * cuando Nginx devuelve 502 o el servicio de PM2 en Node.js se encuentra inactivo.
 */
export default function ServerHealthBanner() {
  const [isDown, setIsDown] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    const apiBase = getApiBase();
    const result = await safeFetchJson(`${apiBase}/api/projects`);
    if (!result.ok && result.isServerDown) {
      setIsDown(true);
      setErrorMessage(result.error || 'Servidor backend no disponible.');
    } else {
      setIsDown(false);
      setErrorMessage('');
    }
    setChecking(false);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Verificación periódica cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const copyCommand = () => {
    navigator.clipboard.writeText('pm2 restart obp-backend');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isDown) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.95))',
      color: '#ffffff',
      padding: '0.6rem 1.2rem',
      borderRadius: '8px',
      margin: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
      fontSize: '0.85rem',
      animation: 'fadeIn 0.2s ease',
      zIndex: 1000,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <div>
          <span style={{ fontWeight: 700 }}>Aviso de Servidor Backend: </span>
          <span>{errorMessage}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        <button
          onClick={copyCommand}
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            padding: '0.3rem 0.6rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600
          }}
          title="Copiar comando de reinicio para PM2"
        >
          {copied ? <CheckCircle2 size={13} color="#86efac" /> : <Terminal size={13} />}
          <span>{copied ? '¡Copiado!' : 'pm2 restart'}</span>
        </button>

        <button
          onClick={checkHealth}
          disabled={checking}
          style={{
            background: '#ffffff',
            border: 'none',
            color: '#b91c1c',
            padding: '0.3rem 0.7rem',
            borderRadius: '6px',
            cursor: checking ? 'not-allowed' : 'pointer',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <RefreshCw size={13} className={checking ? 'spin' : ''} />
          <span>{checking ? 'Probando...' : 'Reintentar'}</span>
        </button>
      </div>
    </div>
  );
}
