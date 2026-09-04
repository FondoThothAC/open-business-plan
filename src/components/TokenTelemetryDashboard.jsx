import { useState, useEffect } from 'react';
import { Activity, RefreshCw, Wifi, WifiOff, Database } from 'lucide-react';
import { getApiBase } from '../config/apiConfig';

// [SDD] Almacenamiento local de telemetría como fallback cuando el backend no responde.
// Cada vez que el backend devuelve datos, se cachean en localStorage para resiliencia.
const TELEMETRY_CACHE_KEY = 'obp_telemetry_tokens_cache';

function cacheTelemetry(data) {
  try {
    localStorage.setItem(TELEMETRY_CACHE_KEY, JSON.stringify({
      data,
      timestamp: new Date().toISOString()
    }));
  } catch {
    // Silencioso — localStorage lleno o no disponible
  }
}

function getCachedTelemetry() {
  try {
    const cached = localStorage.getItem(TELEMETRY_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { data: parsed.data, timestamp: parsed.timestamp };
    }
  } catch {
    // Fallback silencioso
  }
  return null;
}

export default function TokenTelemetryDashboard() {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('none'); // 'backend' | 'cache' | 'none'
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/telemetry/tokens`, {
        signal: AbortSignal.timeout(8000) // Timeout de 8 segundos
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTelemetry(data);
      setSource('backend');
      setLastUpdate(new Date().toISOString());
      cacheTelemetry(data); // Cachear para fallback
    } catch (err) {
      // Intentar fallback a datos cacheados
      const cached = getCachedTelemetry();
      if (cached && cached.data && Object.keys(cached.data).length > 0) {
        setTelemetry(cached.data);
        setSource('cache');
        setLastUpdate(cached.timestamp);
        setError(`Backend no disponible. Mostrando datos cacheados de ${new Date(cached.timestamp).toLocaleString()}`);
      } else {
        setError(err.message);
        setSource('none');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    // Auto-refrescar cada 2 minutos si el componente está montado
    const interval = setInterval(fetchTelemetry, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !telemetry) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto 0.5rem' }} />
        <p style={{ fontSize: '0.8rem' }}>Conectando con motor de telemetría...</p>
      </div>
    );
  }

  if (!telemetry || Object.keys(telemetry).length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Database size={20} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
        <p style={{ fontSize: '0.8rem' }}>Aún no hay datos de consumo de tokens.</p>
        <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Los datos se acumularán conforme uses la Mesa de Expertos y BOB Chat.</p>
        <button onClick={fetchTelemetry} className="btn btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '4px 8px' }}>
          <RefreshCw size={12} style={{ marginRight: '4px' }} /> Verificar
        </button>
      </div>
    );
  }

  // Calcular totales
  const totalTokens = Object.values(telemetry).reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);

  // Ordenar proveedores: más tokens primero
  const sortedEntries = Object.entries(telemetry)
    .filter(([, v]) => typeof v === 'number')
    .sort(([, a], [, b]) => b - a);

  // Colores por proveedor para visualización rica
  const providerColors = {
    ollama: '#10b981', ollama_cloud: '#6366f1', groq: '#f59e0b', gemini: '#38bdf8',
    openai: '#10b981', claude: '#d97706', nvidia: '#22d3ee', mistral: '#ec4899',
    openrouter: '#f59e0b', tokenrouter: '#10b981', opencode: '#a78bfa',
    orcarouter: '#f97316', minimax: '#fbbf24', deepseek: '#3b82f6', bai: '#06b6d4',
  };

  return (
    <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} color="var(--accent-color)" />
          <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Consumo de Tokens por Proveedor</h3>
          {source === 'backend' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.6rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: '8px' }}>
              <Wifi size={10} /> En vivo
            </span>
          )}
          {source === 'cache' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.6rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '1px 6px', borderRadius: '8px' }}>
              <WifiOff size={10} /> Caché
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {lastUpdate && (
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
          <button onClick={fetchTelemetry} disabled={loading} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} style={{ marginRight: '4px' }} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Banner de warning si los datos son de cache */}
      {error && source === 'cache' && (
        <div style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245,158,11,0.08)', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid rgba(245,158,11,0.2)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Total global */}
      <div style={{ textAlign: 'center', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(99,102,241,0.05)', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Acumulado</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-color)' }}>
          {totalTokens >= 1000000 ? `${(totalTokens / 1000000).toFixed(2)}M` : totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens.toLocaleString()}
          <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '4px' }}>tokens</span>
        </div>
      </div>

      {/* Grid de proveedores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        {sortedEntries.map(([provider, tokens]) => {
          const pct = totalTokens > 0 ? ((tokens / totalTokens) * 100) : 0;
          const color = providerColors[provider] || '#6366f1';
          
          const providerNames = {
            'bai': 'B.AI (B ia)',
            'ollama_cloud': 'Ollama Cloud / MiniMax',
            'minimax': 'MiniMax (Direct)',
            'gemini': 'Google Gemini',
            'groq': 'Groq',
            'openai': 'OpenAI',
            'claude': 'Anthropic',
            'openrouter': 'OpenRouter',
            'tokenrouter': 'TokenRouter'
          };
          
          const freemiumLimits = {
            'minimax': 1000000,
            'ollama_cloud': 1000000,
            'gemini': 1500000,
            'groq': 500000
          };
          const limit = freemiumLimits[provider];
          
          return (
            <div key={provider} style={{
              padding: '0.75rem',
              borderRadius: '10px',
              background: 'var(--bg-panel-hover)',
              border: `1px solid ${color}33`,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Barra de progreso de fondo */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0,
                width: `${Math.max(pct, 2)}%`, height: '3px',
                background: color, borderRadius: '0 3px 0 0',
                transition: 'width 0.5s ease',
              }} />
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', fontWeight: 600 }}>
                {providerNames[provider] || provider.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color }}>
                {tokens >= 1000000 ? `${(tokens / 1000000).toFixed(2)}M` : tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : tokens.toLocaleString()}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '0.25rem' }}>
                {totalTokens > 0 && (
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
                    {pct.toFixed(1)}% del total
                  </div>
                )}
                {limit && (
                  <div style={{ fontSize: '0.62rem', color: tokens > limit ? '#ef4444' : '#10b981', fontWeight: 500 }}>
                    {tokens > limit ? 'Límite diario superado' : `${((limit - tokens) / 1000).toFixed(0)}k restantes (aprox)`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
