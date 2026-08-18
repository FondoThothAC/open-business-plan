import { Target, MapPin, Globe } from 'lucide-react';
import { safeStr } from '../utils/formatters';

export default function TamSamSom({ data }) {
  if (!data) return null;

  const extractNumber = (text) => {
    const s = safeStr(text);
    if (!s) return null;
    const match = s.match(/\d+(?:[.,]\d+)*(?:\s*[kKmMbB]|(?:\s*millones|\s*miles|%))?/i);
    return match ? match[0] : null;
  };

  const parseOrRender = (text, defaultVal) => {
    const s = safeStr(text);
    if (!s || s.trim() === '') return defaultVal;
    return s;
  };

  const tamText = parseOrRender(data.tam, 'Mercado Total Direccionable (TAM). Demanda total de un producto o servicio.');
  const samText = parseOrRender(data.sam, 'Mercado Disponible Direccionable (SAM). La parte del TAM a la que puedes llegar con tu modelo de negocio.');
  const somText = parseOrRender(data.som, 'Mercado Obtenible (SOM). La porción del SAM que realmente puedes capturar.');
  
  const tamNum = extractNumber(data.tam) || '100%';
  const samNum = extractNumber(data.sam) || '---';
  const somNum = extractNumber(data.som) || '---';

  return (
    <div 
      className="tam-sam-som-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '2rem',
        background: 'var(--bg-panel)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        marginBottom: '2.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center', width: '100%' }}>
        Dimensionamiento del Mercado
      </h3>
      
      <div className="tam-sam-som-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
        
        {/* TAM */}
        <div 
          className="tam-sam-som-card"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe className="w-6 h-6" style={{ color: '#818cf8' }} />
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>TAM</h4>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#818cf8' }}>{tamNum}</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {tamText}
          </p>
        </div>

        {/* SAM */}
        <div 
          className="tam-sam-som-card"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin className="w-6 h-6" style={{ color: '#34d399' }} />
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>SAM</h4>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#34d399' }}>{samNum}</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {samText}
          </p>
        </div>

        {/* SOM */}
        <div 
          className="tam-sam-som-card"
          style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0.05) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target className="w-6 h-6" style={{ color: '#fb7185' }} />
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>SOM</h4>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fb7185' }}>{somNum}</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {somText}
          </p>
        </div>

      </div>

      <div className="tam-sam-som-funnel" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', width: '100%', height: '180px', position: 'relative' }}>
        {/* Diagrama de círculos concéntricos para representar visualmente el embudo de mercado */}
        <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', border: '2px dashed rgba(99, 102, 241, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ position: 'absolute', top: '10px', fontSize: '0.78rem', color: '#818cf8', fontWeight: 'bold' }}>TAM</span>
          <div style={{ width: '125px', height: '125px', borderRadius: '50%', border: '2px dashed rgba(16, 185, 129, 0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 'bold' }}>SAM</span>
            <div style={{ position: 'absolute', top: '60px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.2)', border: '2px solid #fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(244, 63, 94, 0.3)' }}>
               <span style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 'bold' }}>SOM</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .tam-sam-som-container {
            padding: 1rem !important;
            margin-bottom: 1rem !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            background: #ffffff !important;
            border: 1.5px solid #cbd5e1 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .tam-sam-som-grid {
            gap: 0.5rem !important;
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .tam-sam-som-card {
            padding: 0.85rem !important;
            border-radius: 8px !important;
          }
          .tam-sam-som-card p {
            font-size: 0.75rem !important;
            line-height: 1.3 !important;
          }
          .tam-sam-som-funnel {
            height: 140px !important;
            margin-top: 0.75rem !important;
          }
          .tam-sam-som-funnel > div {
            width: 140px !important;
            height: 140px !important;
          }
          .tam-sam-som-funnel > div > div {
            width: 95px !important;
            height: 95px !important;
          }
          .tam-sam-som-funnel > div > div > div {
            top: 45px !important;
            width: 50px !important;
            height: 50px !important;
          }
        }
      `}</style>
    </div>
  );
}
