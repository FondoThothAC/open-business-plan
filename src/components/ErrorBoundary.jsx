import React from 'react';

/**
 * Componente ErrorBoundary global y modular.
 * Captura excepciones no controladas en el árbol de componentes React,
 * muestra la traza de diagnóstico para soporte técnico y permite volver
 * a Semilla respetando el subpath base (/obp/) o recargar la aplicación.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const rawBase = import.meta.env.BASE_URL || '/obp/';
      const normalizedBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
      const targetSemillaUrl = `${normalizedBase}/semilla`;

      return (
        <div style={{
          padding: '2.5rem',
          background: 'linear-gradient(135deg, #1e1b2e 0%, #0f111a 100%)',
          color: '#f8fafc',
          borderRadius: '12px',
          margin: '2rem auto',
          maxWidth: '900px',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.8rem' }}>⚠️</span>
            <h2 style={{ margin: 0, color: '#f87171', fontSize: '1.4rem', fontWeight: 700 }}>
              Algo salió mal en este módulo
            </h2>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Se detectó una discrepancia en la ejecución del cliente o una versión en caché desincronizada.
            Puedes volver al módulo inicial o forzar la recarga limpia de la aplicación.
          </p>

          <details style={{
            whiteSpace: 'pre-wrap',
            marginBottom: '1.5rem',
            background: '#090b10',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fca5a5',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            overflowX: 'auto'
          }}>
            <summary style={{ cursor: 'pointer', color: '#38bdf8', fontWeight: 600, marginBottom: '0.5rem' }}>
              ▼ Ver detalles técnicos del error
            </summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => { window.location.href = targetSemillaUrl; }}
              style={{
                padding: '0.65rem 1.4rem',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
              }}
            >
              Volver a Semilla
            </button>
            <button 
              onClick={() => { window.location.reload(); }}
              style={{
                padding: '0.65rem 1.4rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
