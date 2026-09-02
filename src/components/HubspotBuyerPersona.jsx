import { useMemo } from 'react';
import { User, Target, ShieldAlert, Sparkles, BookOpen, Heart } from 'lucide-react';

export default function HubspotBuyerPersona({ value = '' }) {
  // Intentar estructurar o parsear los datos de texto si la IA o el usuario escribió secciones del tipo Metas/Retos/Demografía.
  const structuredData = useMemo(() => {
    let text = '';
    if (typeof value === 'string') {
      text = value;
    } else if (value && typeof value === 'object') {
      text = JSON.stringify(value);
    } else {
      text = String(value || '');
    }
    
    const extractSection = (keywords, defaultVal = '') => {
      for (const kw of keywords) {
        const regex = new RegExp(`(?:^|\\n)\\s*[-*#]*\\s*${kw}[:\\n\\-\\s]*(.*?)(?=\\n\\s*[-*#]*\\s*(?:metas|retos|perfil|demografía|canales|comportamiento|obstáculos|propuesta)|$)`, 'is');
        const match = text.match(regex);
        if (match && match[1]) return match[1].trim();
      }
      return defaultVal;
    };

    const isB2B = /mina|minería|industrial|b2b|empresa|corporativ|contratista|maquinaria|hidráulic/i.test(text);
    const defaultNombre = isB2B ? 'Directores de Mina y Superintendentes de Mantenimiento B2B' : 'Cliente Ideal Promedio';
    const defaultDemografia = isB2B ? 'Sector: Minería e Industria Pesada de Sonora. Empresas con flotas de 10 a 50 equipos de gran tonelaje.' : 'Edad: 25-50 años. Ubicación: Zonas urbanas y residenciales.';
    const defaultMetas = isB2B ? 'Cero paros no programados, disponibilidad operativa 24/7 y contratos MaaS con SLAs garantizados.' : 'Obtener productos duraderos, de buena calidad y con servicio de asesoría personalizada.';
    const defaultRetos = isB2B ? 'Tiempos de entrega excesivos en talleres rústicos, contaminación de fluidos (ISO 4406) y paros de k-.2M MXN/hr.' : 'Falta de tiempo, desconocimiento técnico sobre herramientas e insumos de ferretería.';
    const defaultCanales = isB2B ? 'Venta consultiva técnica B2B, licitaciones mineras directas, visitas a tajo y convenios corporativos.' : 'Recomendaciones boca a boca, búsquedas en Google Maps y redes sociales locales (Facebook).';

    const nombre = extractSection(['nombre', 'buyer persona', 'buyer business', 'cliente ideal', 'avatar', 'empresa ideal'], defaultNombre);
    const demografia = extractSection(['demografía', 'perfil', 'edad', 'género', 'ubicación', 'sector', 'industria'], defaultDemografia);
    const metas = extractSection(['metas', 'objetivos', 'intereses', 'que busca', 'kpis'], defaultMetas);
    const retos = extractSection(['retos', 'problemas', 'obstáculos', 'dolores', 'puntos de dolor'], defaultRetos);
    const canales = extractSection(['canales', 'preferidos', 'medios', 'redes', 'adquisición'], defaultCanales);

    return { nombre, demografia, metas, retos, canales, isB2B };
  }, [value]);

  return (
    <div 
      style={{
        marginTop: '1.5rem',
        marginBottom: '2rem',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        background: '#ffffff'
      }}
    >
      {/* Encabezado */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #ff7a59, #ff9b7a)', // HubSpot Orange Gradient
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          color: '#ffffff'
        }}
      >
        <div 
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffffff'
          }}
        >
          <User size={28} />
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85, fontWeight: '700' }}>{structuredData.isB2B ? 'Perfil del Cliente Corporativo (Buyer Business B2B)' : 'Perfil del Buyer Persona (Cliente Ideal)'}</span>
          <h4 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '2px 0 0 0', fontFamily: 'var(--font-display)' }}>
            {structuredData.nombre}
          </h4>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.2)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 'bold' }}>
          <Sparkles size={13} />
          <span>Inspirado en HubSpot Persona</span>
        </div>
      </div>

      {/* Grid de Ficha */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          padding: '2rem'
        }}
      >
        {/* Demografia */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff7a59', fontWeight: 'bold', fontSize: '0.85rem' }}>
            <BookOpen size={16} />
            <span>{structuredData.isB2B ? 'DATOS FIRMOGRÁFICOS / SECTOR' : 'DATOS DEMOGRÁFICOS'}</span>
          </div>
          <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.6', background: '#fff8f6', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid #ff7a59', height: '100%' }}>
            {structuredData.demografia}
          </div>
        </div>

        {/* Metas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>
            <Target size={16} />
            <span>METAS Y OBJETIVOS</span>
          </div>
          <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.6', background: '#f0fdf4', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid #10b981', height: '100%' }}>
            {structuredData.metas}
          </div>
        </div>

        {/* Retos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>
            <ShieldAlert size={16} />
            <span>PRINCIPALES RETOS</span>
          </div>
          <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.6', background: '#fef2f2', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid #ef4444', height: '100%' }}>
            {structuredData.retos}
          </div>
        </div>

        {/* Canales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.85rem' }}>
            <Heart size={16} />
            <span>{structuredData.isB2B ? 'CANALES DE PROSPECCIÓN B2B' : 'CANALES PREFERIDOS'}</span>
          </div>
          <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.6', background: '#eff6ff', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid #3b82f6', height: '100%' }}>
            {structuredData.canales}
          </div>
        </div>
      </div>

      {/* Nota pie de página */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.75rem 2rem', background: '#f8fafc', fontSize: '0.74rem', color: '#94a3b8', textAlign: 'right' }}>
        * Puedes detallar metas, retos o canales en tu redacción del Perfil de Cliente para auto-llenar esta ficha.
      </div>
    </div>
  );
}
