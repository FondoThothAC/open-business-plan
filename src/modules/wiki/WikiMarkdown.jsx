/**
 * @file WikiMarkdown.jsx
 * @description Renderizador de Markdown de alto rendimiento para el Wiki de Software OBP.
 * Integra ReactMarkdown con remarkGfm, soporte para alertas documentales
 * y delegación de diagramas Mermaid interactivos a MermaidViewer.
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidViewer from '../../components/MermaidViewer';

/**
 * Componente renderizador de Markdown seguro y estilizado.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.content - Contenido en formato Markdown.
 * @param {string} [props.className] - Clases CSS adicionales.
 * @returns {JSX.Element}
 */
export default function WikiMarkdown({ content, className = '' }) {
  if (!content) return null;

  return (
    <div className={`wiki-markdown markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className: codeClass, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClass || '');
            const language = match ? match[1] : '';

            // Si es un bloque de diagrama Mermaid
            if (!inline && language === 'mermaid') {
              const chartSource = String(children).replace(/\n$/, '').trim();
              return (
                <div className="wiki-mermaid-block" style={{ margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden' }}>
                  <MermaidViewer chart={chartSource} />
                </div>
              );
            }

            // Si es un bloque de fórmula matemática
            if (!inline && (language === 'math' || language === 'latex' || language === 'formula')) {
              return (
                <div className="wiki-formula-box">
                  <code>{children}</code>
                </div>
              );
            }

            // Bloque de código normal o inline
            return (
              <code className={codeClass} {...props}>
                {children}
              </code>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote
                className="wiki-alert-box"
                style={{
                  borderLeft: '4px solid var(--accent-color, #6366f1)',
                  background: 'rgba(99, 102, 241, 0.08)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0 8px 8px 0',
                  margin: '1.25rem 0'
                }}
              >
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="wiki-table-container" style={{ overflowX: 'auto', margin: '1.25rem 0' }}>
                <table className="wiki-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  {children}
                </table>
              </div>
            );
          },
          a({ href, children }) {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                style={{ color: 'var(--accent-color, #6366f1)', textDecoration: 'underline' }}
              >
                {children}
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
