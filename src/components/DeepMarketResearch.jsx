import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePlan } from '../context/PlanContext';
import { getApiBase } from '../config/apiConfig';
import { Search, Loader2, Sparkles } from 'lucide-react';

export default function DeepMarketResearch({ locationHint = '' }) {
  const { planData, updateSection } = usePlan();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // States para la configuración de búsqueda
  const [businessIdea, setBusinessIdea] = useState(planData?.semilla?.negocio?.giro || planData?.semilla?.negocio?.nombre || planData?.mercado?.analisis?.producto || '');
  const [marketLocation, setMarketLocation] = useState(locationHint);
  const [channel, setChannel] = useState(planData?.mercado?.comercializacion?.canal || '');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('3000');

  const handleGenerateReport = async () => {
    if (!businessIdea.trim() || !marketLocation.trim() || !lat.trim() || !lng.trim()) {
      setError('Indica producto, mercado y coordenadas confirmadas. El sistema no usará una ubicación predeterminada.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/mercado/deep-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: { product: businessIdea, marketLocation, channel, projectId: planData?.config?.projectId || '' },
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius: parseInt(radius, 10)
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al generar el reporte profundo.');
      }

      if (data.success && data.reportMarkdown) {
        // Guardar en el plan
        updateSection('mercado', 'inteligencia_mercado_cascada', 'reporte_profundo', data.reportMarkdown, { provenance: 'research', source: 'market-research-v2' });
        updateSection('mercado', 'inteligencia_mercado_cascada', 'reporte_evidencia', data.report, { provenance: 'research', source: 'market-research-v2' });
      } else {
        throw new Error('El reporte se generó pero llegó vacío.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentReport = planData?.mercado?.inteligencia_mercado_cascada?.reporte_profundo;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Sparkles className="text-indigo-400" />
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Investigación de Mercado Profunda (AI + INEGI)</h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Separa establecimientos observados, fuentes web, estimaciones y datos pendientes. DENUE no se utiliza para inferir ingreso de los hogares.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Giro / Idea de Negocio</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Ej: Cafeterías de especialidad" 
            value={businessIdea}
            onChange={(e) => setBusinessIdea(e.target.value)}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Mercado de venta confirmado</label><input className="form-control" value={marketLocation} onChange={(e) => setMarketLocation(e.target.value)} placeholder="Ej: Monterrey, Nuevo León" /></div>
          <div><label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Canal</label><input className="form-control" value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Ej: B2B distribuidores" /></div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Latitud</label>
            <input type="number" className="form-control" value={lat} onChange={(e) => setLat(e.target.value)} step="0.00001" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Longitud</label>
            <input type="number" className="form-control" value={lng} onChange={(e) => setLng(e.target.value)} step="0.00001" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Radio (metros)</label>
            <input type="number" className="form-control" value={radius} onChange={(e) => setRadius(e.target.value)} step="100" />
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleGenerateReport} 
          disabled={loading || !businessIdea.trim() || !marketLocation.trim() || !lat.trim() || !lng.trim()}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', marginTop: '0.5rem' }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          <span>{loading ? 'Sintetizando Reporte Profundo...' : 'Generar Reporte de Mercado'}</span>
        </button>
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}

      {currentReport && (
        <div style={{ 
          background: 'var(--bg-panel-hover)', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)',
          marginTop: '1rem',
          color: 'var(--text-primary)'
        }}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 style={{ fontSize: '1.5rem', marginTop: '1rem', marginBottom: '1rem', color: 'var(--accent-color)' }} {...props} />,
              h2: ({node, ...props}) => <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }} {...props} />,
              h3: ({node, ...props}) => <h3 style={{ fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }} {...props} />,
              p: ({node, ...props}) => <p style={{ marginBottom: '1rem', lineHeight: '1.6', fontSize: '0.9rem' }} {...props} />,
              ul: ({node, ...props}) => <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem', fontSize: '0.9rem' }} {...props} />,
              li: ({node, ...props}) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
              table: ({node, ...props}) => <div style={{ overflowX: 'auto', marginBottom: '1rem' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} {...props} /></div>,
              th: ({node, ...props}) => <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border-color)', textAlign: 'left', background: 'rgba(0,0,0,0.02)' }} {...props} />,
              td: ({node, ...props}) => <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }} {...props} />
            }}
          >
            {currentReport}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
