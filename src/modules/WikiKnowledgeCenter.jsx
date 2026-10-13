import { useState, useMemo, useEffect } from 'react';
import { Search, BookOpen, Layers, Atom, TrendingUp, Database, ArrowRight, Sparkles, Send, Copy, Check, Clock, User, Tag, HelpCircle, ChevronRight, X } from 'lucide-react';
import { WIKI_CATEGORIES, WIKI_ARTICLES } from '../data/wikiArticles';
import { getApiBase } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';

/**
 * Mapeo de iconos dinámicos para categorías
 */
const ICON_MAP = {
  Atom,
  Layers,
  TrendingUp,
  Database,
  BookOpen
};

/**
 * Renderizador de Markdown simple y seguro sin dependencias externas pesadas
 */
function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Procesamiento básico de bloques de Markdown en HTML semántico
  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = '';
  let inTable = false;
  let tableRows = [];

  const flushTable = (key) => {
    if (tableRows.length === 0) return null;
    const header = tableRows[0];
    const body = tableRows.slice(1).filter(r => !r.every(c => /^[-:\s]+$/.test(c)));
    const el = (
      <div key={`table-${key}`} style={{ overflowX: 'auto', margin: '1.25rem 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-panel-hover)', borderBottom: '2px solid var(--border-color)' }}>
              {header.map((col, idx) => (
                <th key={idx} style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {col.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
    return el;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bloques de código (Mermaid o sintaxis)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        const fullCode = codeBuffer.join('\n');
        elements.push(
          <div key={`code-${i}`} style={{
            background: '#0f172a',
            color: '#e2e8f0',
            padding: '1rem',
            borderRadius: '8px',
            margin: '1.25rem 0',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            overflowX: 'auto',
            border: '1px solid #1e293b'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 700 }}>
              {codeLang ? `Código / Diagrama (${codeLang})` : 'Código'}
            </div>
            <pre style={{ margin: 0 }}>{fullCode}</pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Tablas Markdown
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.split('|').slice(1, -1);
      tableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      const tableEl = flushTable(i);
      if (tableEl) elements.push(tableEl);
    }

    // Alertas GitHub Markdown: > [!IMPORTANT], > [!NOTE], > [!TIP]
    if (line.startsWith('> [!')) {
      const alertType = line.match(/> \[!([A-Z]+)\]/)?.[1] || 'NOTE';
      const alertLines = [];
      while (i + 1 < lines.length && lines[i + 1].startsWith('>')) {
        i++;
        alertLines.push(lines[i].replace(/^>\s?/, ''));
      }
      
      const alertStyles = {
        NOTE: { bg: 'rgba(59, 130, 246, 0.08)', border: '#3b82f6', color: '#3b82f6', title: 'Nota Informativa' },
        TIP: { bg: 'rgba(16, 185, 129, 0.08)', border: '#10b981', color: '#10b981', title: 'Consejo Práctico' },
        IMPORTANT: { bg: 'rgba(139, 92, 246, 0.08)', border: '#8b5cf6', color: '#8b5cf6', title: 'Regla Crítica' },
        WARNING: { bg: 'rgba(239, 68, 68, 0.08)', border: '#ef4444', color: '#ef4444', title: 'Advertencia' }
      };
      const style = alertStyles[alertType] || alertStyles.NOTE;

      elements.push(
        <div key={`alert-${i}`} style={{
          background: style.bg,
          borderLeft: `4px solid ${style.border}`,
          borderRadius: '4px 8px 8px 4px',
          padding: '0.85rem 1.1rem',
          margin: '1.25rem 0',
          fontSize: '0.85rem',
          color: 'var(--text-primary)'
        }}>
          <div style={{ fontWeight: 800, color: style.color, marginBottom: '0.35rem', fontSize: '0.78rem', textTransform: 'uppercase' }}>
            {style.title}
          </div>
          <div>{alertLines.join(' ')}</div>
        </div>
      );
      continue;
    }

    // Encabezados
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontSize: '1.6rem', fontWeight: 800, margin: '1.5rem 0 0.75rem', color: 'var(--text-primary)' }}>{line.replace('# ', '')}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: '1.25rem', fontWeight: 700, margin: '1.25rem 0 0.5rem', color: 'var(--text-primary)' }}>{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('---')) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.3rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
          {line.replace(/^[-*]\s+/, '')}
        </li>
      );
    } else if (line.trim().length > 0) {
      elements.push(
        <p key={i} style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          {line}
        </p>
      );
    }
  }

  if (inTable) {
    const tableEl = flushTable('end');
    if (tableEl) elements.push(tableEl);
  }

  return <div>{elements}</div>;
}

/**
 * Componente principal de la Wiki de Conocimiento
 */
export default function WikiKnowledgeCenter() {
  const { authFetch } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeArticleId, setActiveArticleId] = useState(WIKI_ARTICLES[0].id);
  const [copied, setCopied] = useState(false);

  // Estados para el asistente de IA
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Filtrado reactivo de artículos
  const filteredArticles = useMemo(() => {
    return WIKI_ARTICLES.filter(art => {
      const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchExcerpt = art.excerpt.toLowerCase().includes(q);
      const matchTags = art.tags.some(t => t.toLowerCase().includes(q));
      const matchContent = art.content.toLowerCase().includes(q);

      return matchTitle || matchExcerpt || matchTags || matchContent;
    });
  }, [searchQuery, selectedCategory]);

  // Artículo activo actualmente
  const activeArticle = useMemo(() => {
    const found = WIKI_ARTICLES.find(a => a.id === activeArticleId);
    return found || filteredArticles[0] || WIKI_ARTICLES[0];
  }, [activeArticleId, filteredArticles]);

  // Si cambia el filtro y el artículo seleccionado ya no está en la lista, seleccionar el primero disponible
  useEffect(() => {
    if (filteredArticles.length > 0 && !filteredArticles.some(a => a.id === activeArticleId)) {
      setActiveArticleId(filteredArticles[0].id);
    }
  }, [filteredArticles, activeArticleId]);

  // Manejador para copiar contenido
  const handleCopy = () => {
    if (!activeArticle) return;
    navigator.clipboard.writeText(activeArticle.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Consulta al Asistente IA de la Wiki
  const handleAskAi = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAiLoading) return;

    setIsAiLoading(true);
    setAiError(null);
    setAiAnswer(null);

    try {
      const apiBase = getApiBase();
      const res = await (authFetch || fetch)(`${apiBase}/api/wiki/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: aiQuestion.trim(),
          articleContext: activeArticle ? {
            title: activeArticle.title,
            category: activeArticle.category,
            content: activeArticle.content.slice(0, 3000)
          } : null
        })
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor (${res.status})`);
      }

      const data = await res.json();
      setAiAnswer(data.answer || 'No se obtuvo una respuesta válida del asistente.');
    } catch (err) {
      console.error('Error consultando el asistente de la Wiki:', err);
      setAiError(err.message || 'Error de conexión con el motor de IA.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="wiki-knowledge-center" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header y Buscador Principal */}
      <div className="glass-panel" style={{
        padding: '2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={20} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-color)' }}>
                Base de Conocimiento Empresarial
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Wiki Knowledge Center
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0', maxWidth: '750px', lineHeight: 1.5 }}>
              Enciclopedia metodológica de Fondo Thoth AC: Modelo Atómico de Empresas Cuánticas, 12 marcos de formulación, matemáticas financieras y guías de uso.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-panel)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
              📚 {WIKI_ARTICLES.length} Artículos Canónicos
            </span>
          </div>
        </div>

        {/* Barra de Búsqueda */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por concepto, metodología, fórmula (ej. WACC, Modelo Atómico, ZOPP, CAPEX)..."
            style={{
              width: '100%',
              padding: '0.85rem 1rem 0.85rem 2.8rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-panel)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px'
              }}
              title="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Píldoras de Categorías */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedCategory === 'all' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
              background: selectedCategory === 'all' ? 'var(--accent-color)' : 'var(--bg-panel)',
              color: selectedCategory === 'all' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            Todas las Categorías
          </button>

          {WIKI_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.key;
            const IconComp = ICON_MAP[cat.icon] || BookOpen;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--border-color)',
                  background: isSelected ? `${cat.color}15` : 'var(--bg-panel)',
                  color: isSelected ? cat.color : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <IconComp size={14} color={cat.color} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Principal: Lista Lateral de Artículos y Visor de Contenido */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Columna Izquierda: Índice de Artículos */}
        <div className="glass-panel" style={{
          padding: '1rem',
          borderRadius: '14px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxHeight: 'calc(100vh - 280px)',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Índice Temático ({filteredArticles.length})
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No se encontraron artículos que coincidan con la búsqueda.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {filteredArticles.map(art => {
                const isSelected = art.id === activeArticle.id;
                const catObj = WIKI_CATEGORIES.find(c => c.key === art.category);
                const color = catObj?.color || 'var(--accent-color)';

                return (
                  <div
                    key={art.id}
                    onClick={() => setActiveArticleId(art.id)}
                    style={{
                      padding: '0.75rem 0.85rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: isSelected ? `1px solid ${color}` : '1px solid transparent',
                      background: isSelected ? `${color}12` : 'transparent',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-panel-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: `${color}18`,
                        color: color
                      }}>
                        {catObj?.name || art.category}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Clock size={11} /> {art.readTime}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.86rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? color : 'var(--text-primary)', lineHeight: 1.3 }}>
                      {art.title}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {art.excerpt}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Lector del Artículo y Asistente IA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Panel de Lectura */}
          <div className="glass-panel" style={{
            padding: '2.5rem',
            borderRadius: '16px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            {/* Metadatos Superiores del Artículo */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-color)'
                  }}>
                    {WIKI_CATEGORIES.find(c => c.key === activeArticle.category)?.name || activeArticle.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {activeArticle.readTime} de lectura
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={13} /> {activeArticle.author}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: copied ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-panel-hover)',
                    color: copied ? '#10b981' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Copiar contenido en formato Markdown"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copiado al portapapeles' : 'Copiar Texto'}</span>
                </button>
              </div>

              {/* Tags del Artículo */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {activeArticle.tags.map(t => (
                  <span
                    key={t}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'var(--bg-panel-hover)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Tag size={10} /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Contenido Renderizado */}
            <MarkdownRenderer content={activeArticle.content} />
          </div>

          {/* Asistente IA de la Wiki */}
          <div className="glass-panel" style={{
            padding: '1.75rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.03) 100%)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: '#ec4899', color: '#fff', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Consultar al Asesor de la Wiki (IA)
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Formula cualquier duda técnica o metodológica; el asesor responderá utilizando el corpus de conocimiento de OBP.
                </p>
              </div>
            </div>

            <form onSubmit={handleAskAi} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder={`Pregunta sobre "${activeArticle.title}" o conceptos generales...`}
                disabled={isAiLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-panel)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiQuestion.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  background: 'var(--accent-color)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: isAiLoading ? 'wait' : 'pointer',
                  opacity: (!aiQuestion.trim() || isAiLoading) ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <Send size={15} />
                <span>{isAiLoading ? 'Analizando...' : 'Preguntar'}</span>
              </button>
            </form>

            {aiError && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.8rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {aiError}
              </div>
            )}

            {aiAnswer && (
              <div style={{
                padding: '1.25rem',
                borderRadius: '10px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                animation: 'fadeIn 0.25s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  <Sparkles size={13} /> Dictamen del Asesor IA
                </div>
                <MarkdownRenderer content={aiAnswer} />
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
