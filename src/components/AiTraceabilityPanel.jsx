import { useState, useEffect, useMemo, Fragment } from 'react';
import { 
  Activity, RefreshCw, Trash2, Download, Search, Filter, 
  Clock, DollarSign, Cpu, CheckCircle2, AlertCircle, Database, 
  ChevronDown, ChevronRight, Zap 
} from 'lucide-react';
import { getApiBase } from '../config/apiConfig';
import { calculateCost } from '../config/pricing';

export default function AiTraceabilityPanel() {
  const [entries, setEntries] = useState([]);
  const [_stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchCallLog = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/telemetry/call-log`, {
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setEntries(data.entries || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.warn('[Traceability] Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLog();
    let timer;
    if (autoRefresh) {
      timer = setInterval(fetchCallLog, 15000); // Refresco cada 15s si está activo
    }
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const handlePurge = async () => {
    if (!window.confirm('¿Seguro que deseas purgar el historial de llamadas y telemetría?')) return;
    try {
      const base = getApiBase();
      await fetch(`${base}/api/telemetry/trajectories`, { method: 'DELETE' });
      setEntries([]);
      setStats({});
    } catch (e) {
      alert('Error purgando historial: ' + e.message);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obp_telemetry_trace_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtrado y búsqueda
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesProv = selectedProvider === 'all' || entry.provider === selectedProvider;
      const matchesSearch = !searchQuery || 
        (entry.model && entry.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (entry.promptPreview && entry.promptPreview.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (entry.module && entry.module.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesProv && matchesSearch;
    });
  }, [entries, selectedProvider, searchQuery]);

  // Cálculos globales
  const totalTokensGlobal = useMemo(() => {
    return entries.reduce((acc, e) => acc + (e.totalTokens || 0), 0);
  }, [entries]);

  const totalCostGlobal = useMemo(() => {
    return entries.reduce((acc, e) => {
      return acc + calculateCost(e.model, e.promptTokens || 0, e.completionTokens || 0);
    }, 0);
  }, [entries]);

  const avgLatencyGlobal = useMemo(() => {
    const valid = entries.filter(e => e.latencyMs > 0);
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((acc, e) => acc + e.latencyMs, 0) / valid.length);
  }, [entries]);

  const uniqueProviders = useMemo(() => {
    const set = new Set(entries.map(e => e.provider).filter(Boolean));
    return Array.from(set);
  }, [entries]);

  return (
    <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--accent-color)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Trazabilidad y Análisis de IA</h3>
            <span style={{ fontSize: '0.65rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
              Live Telemetry Engine
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Registro en tiempo real de prompts, tokens, latencias, costos y llamadas de la Mesa de Expertos y BOB Chat.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 10px', background: autoRefresh ? 'rgba(16,185,129,0.1)' : 'var(--bg-panel-hover)', color: autoRefresh ? '#10b981' : 'var(--text-secondary)' }}
            title="Activar/Desactivar auto-refresco cada 15 segundos"
          >
            <Zap size={13} style={{ marginRight: '4px' }} />
            {autoRefresh ? 'Auto 15s' : 'Pausado'}
          </button>
          <button onClick={fetchCallLog} disabled={loading} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} style={{ marginRight: '4px' }} />
            Refrescar
          </button>
          <button onClick={handleExportJson} disabled={entries.length === 0} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
            <Download size={13} style={{ marginRight: '4px' }} />
            Exportar JSON
          </button>
          <button onClick={handlePurge} disabled={entries.length === 0} className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
            <Trash2 size={13} style={{ marginRight: '4px' }} />
            Purgar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} color="#6366f1" /> Total Invocaciones
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {entries.length.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Llamadas registradas
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color="#10b981" /> Tokens Totales
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {totalTokensGlobal >= 1000000 ? `${(totalTokensGlobal / 1000000).toFixed(2)}M` : totalTokensGlobal >= 1000 ? `${(totalTokensGlobal / 1000).toFixed(1)}k` : totalTokensGlobal.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Entrada + Salida
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={14} color="#f59e0b" /> Costo Estimado
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            ${totalCostGlobal.toFixed(4)} <span style={{ fontSize: '0.7rem', fontWeight: 400 }}>USD</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Tarifas oficiales
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1px solid rgba(56,189,248,0.2)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="#38bdf8" /> Latencia Promedio
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            {avgLatencyGlobal > 0 ? `${avgLatencyGlobal}ms` : '—'}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Tiempo de respuesta
          </div>
        </div>
      </div>

      {/* Controles de filtro y búsqueda */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-control"
            placeholder="Buscar por modelo, contenido de prompt o módulo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select 
            className="form-control"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            style={{ fontSize: '0.8rem', minWidth: '150px' }}
          >
            <option value="all">Todos los Proveedores</option>
            {uniqueProviders.map(p => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de registros */}
      {filteredEntries.length === 0 ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-panel-hover)', borderRadius: '12px' }}>
          <Database size={28} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No hay llamadas registradas en esta vista</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Genera contenido con la Mesa de Expertos o chatea con BOB para ver las métricas en vivo.
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-panel-hover)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 12px', width: '30px' }}></th>
                <th style={{ padding: '8px 12px' }}>Hora</th>
                <th style={{ padding: '8px 12px' }}>Proyecto</th>
                <th style={{ padding: '8px 12px' }}>Módulo</th>
                <th style={{ padding: '8px 12px' }}>Proveedor (Real / Solicitado)</th>
                <th style={{ padding: '8px 12px' }}>Modelo</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Tokens Prompt</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Tokens Salida</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Costo USD</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, idx) => {
                const isExpanded = expandedRow === idx;
                const cost = calculateCost(entry.model, entry.promptTokens || 0, entry.completionTokens || 0);
                const timeStr = entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '—';
                const isErr = entry.status === 'error';
                const hasRotated = entry.requestedProvider && entry.requestedProvider !== entry.provider;

                return (
                  <Fragment key={idx}>
                    <tr 
                      onClick={() => setExpandedRow(isExpanded ? null : idx)}
                      style={{ 
                        borderBottom: '1px solid var(--border-color)', 
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(99,102,241,0.06)' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {timeStr}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.projectId || 'general'}
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.module || 'general'}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--accent-color)' }}>
                        <div>{entry.provider}</div>
                        {hasRotated && (
                          <div style={{ fontSize: '0.62rem', color: '#f59e0b', fontWeight: 400 }}>
                            ↩ rotado de {entry.requestedProvider}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                        {entry.model}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {(entry.promptTokens || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {(entry.completionTokens || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                        {(entry.totalTokens || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#f59e0b', fontFamily: 'monospace' }}>
                        ${cost.toFixed(5)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {isErr ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#ef4444', fontSize: '0.68rem' }}>
                            <AlertCircle size={12} /> Error
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#10b981', fontSize: '0.68rem' }}>
                            <CheckCircle2 size={12} /> OK
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Detalle expandido */}
                    {isExpanded && (
                      <tr style={{ background: 'rgba(99,102,241,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                        <td colSpan={9} style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.72rem' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                Vista Previa del Prompt:
                              </div>
                              <div style={{ 
                                padding: '8px', 
                                background: 'var(--bg-card)', 
                                borderRadius: '8px', 
                                fontFamily: 'monospace', 
                                maxHeight: '120px', 
                                overflowY: 'auto',
                                whiteSpace: 'pre-wrap',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)'
                              }}>
                                {entry.promptPreview || 'Sin vista previa disponible'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                Metadata de la Invocación:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                <li>Módulo de origen: <strong style={{ color: 'var(--text-primary)' }}>{entry.module || 'General'}</strong></li>
                                <li>Latencia registrada: <strong style={{ color: 'var(--text-primary)' }}>{entry.latencyMs ? `${entry.latencyMs}ms` : 'No medida'}</strong></li>
                                <li>Timestamp ISO: <strong style={{ color: 'var(--text-primary)' }}>{entry.timestamp || 'N/A'}</strong></li>
                                {entry.error && <li style={{ color: '#ef4444' }}>Error: {entry.error}</li>}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
