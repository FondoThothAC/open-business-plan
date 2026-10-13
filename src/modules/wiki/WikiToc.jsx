/**
 * @file WikiToc.jsx
 * @description Tabla de contenidos reactiva ("En esta página") para el Wiki de Software OBP.
 * Extrae las secciones del documento activo y permite navegación por saltos suaves.
 */

import React from 'react';
import { AlignLeft, Hash } from 'lucide-react';

/**
 * Componente de Tabla de Contenidos (TOC).
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Array} props.sections - Secciones de la página activa.
 * @param {string} [props.activeSectionId] - ID de la sección visible.
 * @returns {JSX.Element}
 */
export default function WikiToc({ sections = [], activeSectionId }) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="wiki-toc" aria-label="Tabla de contenidos de la página" style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6, marginBottom: '0.85rem' }}>
        <AlignLeft size={13} />
        <span>En esta página</span>
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {sections.map((sec) => {
          const isCurrent = sec.id === activeSectionId;
          return (
            <li key={sec.id}>
              <button
                type="button"
                onClick={() => scrollToSection(sec.id)}
                aria-label={`Saltar a la sección ${sec.title}`}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.4rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  color: isCurrent ? 'var(--accent-color, #6366f1)' : 'var(--text-secondary, rgba(255,255,255,0.7))',
                  fontWeight: isCurrent ? 600 : 400,
                  transition: 'color 0.15s ease'
                }}
              >
                <Hash size={12} style={{ opacity: 0.4, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sec.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
