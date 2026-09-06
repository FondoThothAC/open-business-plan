import { Layout, ShieldAlert } from 'lucide-react';

/**
 * Parsea texto de FODA (viñetas, saltos de línea o comas) en un array de cadenas limpias.
 * @param {string|Array} text 
 * @returns {string[]}
 */
function parseFodaTextToItems(text) {
  if (!text) return [];
  if (Array.isArray(text)) return text.map(t => String(t).trim()).filter(Boolean);
  if (typeof text !== 'string') return [String(text)];
  
  const parsed = text
    .split(/\r?\n|•|- |\* |;/)
    .map(s => s.trim().replace(/^[-*•\d.)\s]+/, ''))
    .filter(s => s.length > 2);

  return parsed.length > 0 ? parsed : [text.trim()];
}

/**
 * Componente BoxMatrix - Renderiza matrices bidimensionales (FODA, Porter 5F, ZOPP 4x4, Matriz X)
 * Totalmente sincronizado con datos reales del plan para evitar texto simulado ("lore")
 */
export function BoxMatrix({ definition = {}, values = {} }) {
  const fodaSource = values.foda || values.planData?.naturaleza?.foda;

  let quadrants = values.quadrants;
  if (!quadrants && fodaSource && (fodaSource.fortalezas || fodaSource.oportunidades || fodaSource.debilidades || fodaSource.amenazas)) {
    quadrants = [
      {
        title: 'Fortalezas (Internas)',
        items: parseFodaTextToItems(fodaSource.fortalezas)
      },
      {
        title: 'Oportunidades (Externas)',
        items: parseFodaTextToItems(fodaSource.oportunidades)
      },
      {
        title: 'Debilidades (Internas)',
        items: parseFodaTextToItems(fodaSource.debilidades)
      },
      {
        title: 'Amenazas (Externas)',
        items: parseFodaTextToItems(fodaSource.amenazas)
      }
    ];
  }

  if (!quadrants) {
    quadrants = [
      { title: 'Fortalezas (Internas)', items: ['Capacidades clave del equipo y propuesta de valor única.'] },
      { title: 'Oportunidades (Externas)', items: ['Tendencias favorables y nichos de mercado desatendidos.'] },
      { title: 'Debilidades (Internas)', items: ['Áreas operativas iniciales a fortalecer con delegación.'] },
      { title: 'Amenazas (Externas)', items: ['Factores macroeconómicos o competencia a mitigar.'] }
    ];
  }

  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e4e4e7)',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(245,158,11,0.12)', borderRadius: '8px', color: '#f59e0b' }}>
            <Layout size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #09090b)', fontWeight: 700 }}>
              {definition.title || 'Matriz Estratégica Bidimensional'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
              Fuente: {definition.source?.book || 'Metodología Estratégica'} ({definition.source?.page || ''})
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {quadrants.map((q, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-panel-hover, rgba(0,0,0,0.02))',
            border: '1px solid var(--border-color, #e4e4e7)',
            borderRadius: '8px',
            padding: '14px'
          }}>
            <h5 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: 'var(--text-primary, #09090b)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} style={{ color: idx % 2 === 0 ? '#10b981' : '#f59e0b' }} />
              {q.title}
            </h5>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)', lineHeight: 1.6 }}>
              {q.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
