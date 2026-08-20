import { useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { getApiBase } from '../config/apiConfig';
import { fetchPlaces, fetchSocialMedia } from '../utils/googleApi';
import { Search, Loader2, Globe, PlusCircle, AlertCircle, MapPin, Star, DollarSign, ExternalLink } from 'lucide-react';

export default function AnalisisCompetenciaGoogle() {
  const { planData, updateSection } = usePlan();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingSocialsFor, setLoadingSocialsFor] = useState(null);

  // E-commerce state
  const [ecomQuery, setEcomQuery] = useState('');
  const [loadingEcom, setLoadingEcom] = useState(false);
  const [ecomResults, setEcomResults] = useState([]);

  const apiKey = planData?.config?.externalApis?.googleApiKey;
  const cx = planData?.config?.externalApis?.googleCx;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const places = await fetchPlaces(query, apiKey);
      const mapped = places.map((p, idx) => ({
        id: p.id || idx,
        name: p.displayName?.text || 'Desconocido',
        address: p.formattedAddress || '',
        rating: p.rating || 0,
        reviews: p.userRatingCount || 0,
        priceLevel: p.priceLevel || 'PRICE_LEVEL_UNSPECIFIED',
        website: p.websiteUri || '',
        socials: null
      }));
      setResults(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFindSocials = async (competitorIndex, companyName) => {
    setLoadingSocialsFor(competitorIndex);
    try {
      const engine = planData?.config?.externalApis?.scraperEngine || 'local';
      const links = await fetchSocialMedia(companyName, apiKey, cx);
      
      let deepData = null;
      if (engine === 'local' && links.length > 0) {
        const targetUrl = links.find(l => l.link.includes('instagram.com') || l.link.includes('x.com') || l.link.includes('facebook.com'))?.link || links[0].link;
        try {
          const apiBase = getApiBase();
          const res = await fetch(`${apiBase}/api/scrape/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: targetUrl })
          });
          const data = await res.json();
          if (data.success) {
            deepData = { followers: data.followers, metadata: data.metadata };
          }
        } catch (e) {
          console.error("Deep scrape failed", e);
        }
      }

      setResults(prev => prev.map((item, idx) => 
        idx === competitorIndex ? { ...item, socials: links, deepData } : item
      ));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingSocialsFor(null);
    }
  };

  const formatPrice = (level) => {
    switch(level) {
      case 'PRICE_LEVEL_INEXPENSIVE': return '$';
      case 'PRICE_LEVEL_MODERATE': return '$$';
      case 'PRICE_LEVEL_EXPENSIVE': return '$$$';
      case 'PRICE_LEVEL_VERY_EXPENSIVE': return '$$$$';
      default: return '-';
    }
  };

  const handleAddToPlan = (competitor) => {
    const currentCompText = planData?.mercado?.competencia?.competidores || '';
    let socialText = competitor.socials 
      ? competitor.socials.map(s => `- ${s.title}: ${s.link}`).join('\n') 
      : (competitor.website ? `- Web: ${competitor.website}` : '');
    
    if (competitor.deepData) {
      socialText += `\n- Seguidores Extraídos (Bot): ${competitor.deepData.followers}`;
    }
    
    const newEntry = `\n\n### ${competitor.name}\n- Dirección: ${competitor.address}\n- Rating: ${competitor.rating}⭐ (${competitor.reviews} reseñas)\n- Nivel de Precio: ${formatPrice(competitor.priceLevel)}\n${socialText}`;
    
    updateSection('mercado', 'competencia', 'competidores', currentCompText + newEntry);
    alert(`${competitor.name} añadido a tu análisis de competencia en el módulo respectivo.`);
  };

  const handleScrapeEcommerce = async () => {
    if (!ecomQuery.trim()) return;
    setLoadingEcom(true);
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/scrape/ecommerce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: ecomQuery })
      });
      const data = await res.json();
      if (data.success) {
        setEcomResults(data.products);
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Error de conexión con el scraper: " + e.message);
    } finally {
      setLoadingEcom(false);
    }
  };

  const handleAddEcomToPlan = () => {
    const currentCompText = planData?.mercado?.competencia?.competidores || '';
    const ecomText = ecomResults.map(p => `- ${p.price}: ${p.title} (${p.rating})`).join('\n');
    const newEntry = `\n\n### Benchmarking E-Commerce: ${ecomQuery}\n${ecomText}`;
    updateSection('mercado', 'competencia', 'competidores', currentCompText + newEntry);
    alert('Benchmarking de precios añadido al plan.');
  };

  if (!apiKey) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
          <AlertCircle size={18} /> API de Google no configurada
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          Para habilitar el descubrimiento inteligente de competencia, ingresa tu API Key de Google (Places API y Custom Search) en el módulo de <strong>Configuración Maestro</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Globe className="text-blue-400" />
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Inteligencia de Mercado (Google)</h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Busca negocios similares en tu zona para descubrir sus precios, calificación y presencia digital.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Ej: Cafeterías de especialidad en Madrid" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={handleSearch} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          <span>Buscar</span>
        </button>
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ overflowX: 'auto', background: 'var(--bg-panel-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', fontSize: '0.85rem', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Negocio</th>
                <th style={{ padding: '0.75rem 1rem' }}>Rating / Precio</th>
                <th style={{ padding: '0.75rem 1rem' }}>Huella Digital</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.25rem', marginTop: '0.4rem' }}>
                      <MapPin size={12} style={{ marginTop: '2px', flexShrink: 0 }} /> 
                      <span>{r.address}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem' }}>
                      <Star size={14} fill="currentColor" /> {r.rating} 
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.75rem', marginLeft: '0.2rem' }}>({r.reviews})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', marginTop: '0.4rem', color: '#10b981', fontWeight: 600 }}>
                      <DollarSign size={14} /> Nivel: {formatPrice(r.priceLevel)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {r.socials ? (
                      <div>
                        <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {r.socials.map((s, i) => (
                            <li key={i} style={{ marginBottom: '0.25rem' }}>
                              <a href={s.link} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none' }} title={s.title}>
                                {s.title.length > 25 ? s.title.substring(0,25) + '...' : s.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                        {r.deepData && (
                          <div style={{ marginTop: '0.5rem', padding: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', fontSize: '0.7rem', color: '#10b981' }}>
                            <strong>Deep Scan:</strong> {r.deepData.followers}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {r.website && (
                          <a href={r.website} target="_blank" rel="noreferrer" title="Website Oficial" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ExternalLink size={16} /> Web
                          </a>
                        )}
                        {cx ? (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem', height: 'auto', borderRadius: '20px' }}
                            onClick={() => handleFindSocials(idx, r.name)}
                            disabled={loadingSocialsFor === idx}
                          >
                            {loadingSocialsFor === idx ? 'Scrapeando...' : 'Deep Scan'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>CX no config.</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => handleAddToPlan(r)}
                      title="Añadir a mi Matriz de Competencia"
                    >
                      <PlusCircle size={16} /> Añadir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* E-Commerce Scraper Section */}
      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Rastreo de Precios E-Commerce (Amazon)</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          El bot extraerá los precios reales de los productos más relevantes simulando navegación humana.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Ej: Café en grano 1kg" 
            value={ecomQuery}
            onChange={(e) => setEcomQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScrapeEcommerce()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-secondary" onClick={handleScrapeEcommerce} disabled={loadingEcom} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {loadingEcom ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Rastrear</span>
          </button>
        </div>
        {ecomResults.length > 0 && (
           <div style={{ background: 'var(--bg-panel-hover)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
             <ul style={{ fontSize: '0.85rem', paddingLeft: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
               {ecomResults.map((p, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#10b981' }}>{p.price}</strong> - {p.title} <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>{p.rating}</span>
                  </li>
               ))}
             </ul>
             <button className="btn btn-primary" onClick={handleAddEcomToPlan} style={{ marginTop: '1rem', padding: '4px 12px', fontSize: '0.8rem' }}>
                <PlusCircle size={14} style={{ marginRight: '0.3rem', display: 'inline' }} /> Añadir Precios al Plan
             </button>
           </div>
        )}
      </div>

    </div>
  );
}
