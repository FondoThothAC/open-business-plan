import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

export default function SimuladorModal({ isOpen, onClose, onExport }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleMessage = (event) => {
        if (event.data && event.data.type === 'SIMULATOR_EXPORT') {
          if (onExport) {
            onExport(event.data.payload);
          }
          onClose();
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      return () => {
        window.removeEventListener('message', handleMessage);
        document.body.style.overflow = 'auto';
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, onClose, onExport]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        height: '56px', background: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          <ExternalLink size={18} className="text-accent" />
          <span>Simulador Avanzado (FAPPA / PROMETE)</span>
        </div>
        <button 
          onClick={onClose} 
          style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
            padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
          <X size={24} />
        </button>
      </div>
      <div style={{ flex: 1, position: 'relative', background: '#f8fafc' }}>
        <iframe 
          src="/simulador/index.html" 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          title="Simulador FAPPA Cibercafe"
        />
      </div>
    </div>
  );
}
