import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { getApiBase } from '../config/apiConfig';

export default function TokenTelemetryDashboard() {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/telemetry/tokens`);
      if (!res.ok) throw new Error('Error al cargar telemetría');
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  if (loading && !telemetry) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto 0.5rem' }} />
        <p style={{ fontSize: '0.8rem' }}>Cargando datos de telemetría...</p>
      </div>
    );
  }

  if (error && !telemetry) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#ef4444' }}>
        <p style={{ fontSize: '0.8rem' }}>Error: {error}</p>
        <button onClick={fetchTelemetry} className="btn btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '4px 8px' }}>Reintentar</button>
      </div>
    );
  }

  if (!telemetry || Object.keys(telemetry).length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '0.8rem' }}>Aún no hay datos de consumo de tokens.</p>
        <button onClick={fetchTelemetry} className="btn btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '4px 8px' }}>
          <RefreshCw size={12} style={{ marginRight: '4px' }} /> Refrescar
        </button>
      </div>
    );
  }

  // Calculate total tokens
  const totalTokens = Object.values(telemetry).reduce((acc, val) => acc + val, 0);

  return (
    <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} color="var(--accent-color)" />
          <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Consumo Total de Tokens por API</h3>
        </div>
        <button onClick={fetchTelemetry} disabled={loading} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} style={{ marginRight: '4px' }} />
          Refrescar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {Object.entries(telemetry).map(([provider, tokens]) => (
          <div key={provider} style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-panel-hover)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              {provider}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: provider === 'ollama' ? '#10b981' : 'var(--text-primary)' }}>
              {tokens.toLocaleString()}
            </div>
            {totalTokens > 0 && (
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {((tokens / totalTokens) * 100).toFixed(1)}% del total
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
