/**
 * @file WikiPage.jsx
 * @description Vista del documento activo en el Wiki de Software OBP.
 * Renderiza la ficha canónica del módulo/modelo, campos con sus prompts reales,
 * cajas asociadas y secciones documentales mediante WikiMarkdown.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ExternalLink, 
  Layers, 
  Terminal, 
  Box, 
  FileText, 
  Quote, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import WikiMarkdown from './WikiMarkdown';

/**
 * Componente de renderizado de la página documental activa.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.page - Datos de la página activa.
 * @param {boolean} props.isLoading - Estado de carga de la página.
 * @param {string} [props.error] - Mensaje de error en caso de fallo.
 * @returns {JSX.Element}
 */
export default function WikiPage({ page, isLoading, error }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="wiki-page-loading" style={{ padding: '3rem 2rem', textAlign: 'center', opacity: 0.6 }}>
        <Clock className="animate-spin" size={28} style={{ margin: '0 auto 1rem auto' }} />
        <p>Cargando documentación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wiki-page-error glass-panel" style={{ margin: '2rem', padding: '2rem', borderLeft: '4px solid #ef4444' }}>
        <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>No se pudo cargar la página</h3>
        <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{error}</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="wiki-page-empty" style={{ padding: '4rem 2rem', textAlign: 'center', opacity: 0.5 }}>
        <HelpCircle size={36} style={{ margin: '0 auto 1rem auto' }} />
        <p>Selecciona un módulo o modelo en el árbol lateral para comenzar la lectura.</p>
      </div>
    );
  }

  const { title, summary, kind, audience, model, openUrl, fields = [], boxes = [], sections = [] } = page;

  return (
    <article className="wiki-page-content" style={{ padding: '2rem 2.5rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      {/* Encabezado Principal */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          {model && (
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 600 }}>
              {model.toUpperCase()}
            </span>
          )}
          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', opacity: 0.8 }}>
            {kind === 'modulo' ? 'Módulo de Plan' : (kind === 'modelo' ? 'Metodología / Modelo' : 'Referencia Técnica')}
          </span>
          {audience === 'tecnico' && (
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600 }}>
              SUPERADMIN TÉCNICO
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
          {title}
        </h1>

        {summary && (
          <p style={{ fontSize: '1.05rem', opacity: 0.8, margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
            {summary}
          </p>
        )}

        {/* Botón de Salto "Abrir este módulo en el plan" */}
        {openUrl && (
          <div style={{ marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate(openUrl)}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                background: 'var(--accent-color, #6366f1)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none'
              }}
            >
              <span>Abrir este módulo en el plan activo</span>
              <ExternalLink size={14} />
            </button>
          </div>
        )}
      </header>

      {/* Tabla Canónica de Campos y Prompts Reales (Si Aplica) */}
      {fields.length > 0 && (
        <section id="section-campos-resumen" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={18} style={{ color: 'var(--accent-color, #6366f1)' }} />
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Ficha Canónica de Campos ({fields.length})</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fields.map((f) => (
              <div
                key={f.key}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <code style={{ fontSize: '0.88rem', fontWeight: 700, color: '#818cf8' }}>{f.key}</code>
                  <span style={{ fontSize: '0.72rem', opacity: 0.5, fontFamily: 'monospace' }}>{f.address}</span>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase' }}>Prompt / Instrucción:</span>
                  <p style={{ margin: '0.2rem 0', fontSize: '0.88rem', lineHeight: 1.4 }}>{f.prompt}</p>
                </div>

                {f.ejemplo && (
                  <div style={{ marginBottom: '0.4rem', fontSize: '0.82rem', opacity: 0.8, fontStyle: 'italic' }}>
                    <span style={{ fontWeight: 600, fontStyle: 'normal', opacity: 0.7 }}>Ejemplo: </span>
                    {f.ejemplo}
                  </div>
                )}

                {(f.benchmark || f.cita) && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7, flexWrap: 'wrap' }}>
                    {f.benchmark && <span><strong>Criterio:</strong> {f.benchmark}</span>}
                    {f.cita && <span><Quote size={11} style={{ display: 'inline', marginRight: 2 }} /> {f.cita}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cajas y Herramientas del Módulo (Si Aplica) */}
      {boxes.length > 0 && (
        <section id="section-cajas-resumen" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Box size={18} style={{ color: '#10b981' }} />
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Herramientas Visuales del Módulo ({boxes.length})</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {boxes.map((b) => (
              <div
                key={b.id}
                className="glass-panel"
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.08))'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{b.title}</h4>
                  <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                    {b.type}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', opacity: 0.75, margin: '0 0 0.5rem 0' }}>{b.description}</p>
                {b.source && (
                  <span style={{ fontSize: '0.7rem', opacity: 0.5, fontStyle: 'italic' }}>
                    Fuente: {b.source}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Secciones Documentales Detalladas */}
      {sections.map((sec) => (
        <section
          key={sec.id}
          id={`section-${sec.id}`}
          style={{
            marginBottom: '3rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color, rgba(255,255,255,0.05))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 600 }}>{sec.title}</h2>
            {sec.audience === 'tecnico' && (
              <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                TÉCNICO
              </span>
            )}
          </div>

          <WikiMarkdown content={sec.markdown} />
        </section>
      ))}
    </article>
  );
}
