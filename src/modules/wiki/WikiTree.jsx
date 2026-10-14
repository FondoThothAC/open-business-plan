/**
 * @file WikiTree.jsx
 * @description Árbol de navegación jerárquico para el Wiki de Software OBP.
 * Proporciona un único nivel de acordeones colapsables, buscador reactivo en tiempo real
 * y resaltado de la página activa cumpliendo estándares de accesibilidad WCAG.
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  FileText, 
  Terminal, 
  Search, 
  BookOpen, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

/**
 * Componente del árbol lateral de navegación.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Array} props.tree - Estructura jerárquica de nodos.
 * @param {string} props.activePageId - Identificador de la página actualmente seleccionada.
 * @param {Function} props.onSelectPage - Callback al seleccionar una página.
 * @param {string} [props.userRole] - Rol del usuario autenticado.
 * @returns {JSX.Element}
 */
export default function WikiTree({ tree = [], activePageId, onSelectPage, userRole }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(() => {
    // Expandir el primer modelo por defecto para inicio rápido
    return new Set(['modelos', 'modelo.business']);
  });

  const toggleExpand = (nodeId) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  /**
   * Filtra recursivamente el árbol por término de búsqueda.
   */
  const filteredTree = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return tree;

    const filterNode = (node) => {
      const matchTitle = node.title?.toLowerCase().includes(q);
      const matchId = node.id?.toLowerCase().includes(q);
      const matchPageId = node.pageId?.toLowerCase().includes(q);

      let matchedChildren = [];
      if (Array.isArray(node.children)) {
        matchedChildren = node.children.map(filterNode).filter(Boolean);
      }

      if (matchTitle || matchId || matchPageId || matchedChildren.length > 0) {
        return {
          ...node,
          children: matchedChildren
        };
      }
      return null;
    };

    return tree.map(filterNode).filter(Boolean);
  }, [tree, searchTerm]);

  /**
   * Renderiza recursivamente un nodo del árbol.
   */
  const renderNode = (node, depth = 0) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isExpanded = searchTerm.trim().length > 0 || expandedNodes.has(node.id);
    const isSelected = node.pageId && node.pageId === activePageId;

    // Iconografía contextual según la jerarquía
    const renderIcon = () => {
      if (node.id === 'referencia' || node.id?.startsWith('referencia')) {
        return <Terminal size={15} style={{ color: '#10b981', flexShrink: 0 }} />;
      }
      if (node.id === 'archivados' || node.id?.startsWith('archivado.')) {
        return <BookOpen size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />;
      }
      if (node.id?.startsWith('modelo.')) {
        return <Layers size={15} style={{ color: '#6366f1', flexShrink: 0 }} />;
      }
      if (node.id?.startsWith('pilar.')) {
        return <BookOpen size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />;
      }
      return <FileText size={14} style={{ opacity: 0.7, flexShrink: 0 }} />;
    };

    return (
      <div key={node.id} className="wiki-tree-node" style={{ marginLeft: depth > 0 ? `${depth * 0.75}rem` : 0 }}>
        <div
          role="button"
          tabIndex={0}
          aria-current={isSelected ? 'page' : undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
          onClick={() => {
            if (node.pageId) {
              onSelectPage(node.pageId);
            } else if (hasChildren) {
              toggleExpand(node.id);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (node.pageId) onSelectPage(node.pageId);
              else if (hasChildren) toggleExpand(node.id);
            }
          }}
          className={`wiki-tree-item ${isSelected ? 'active' : ''}`}
        >
          {hasChildren ? (
            <button
              type="button"
              className="wiki-expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'inherit' }}
              aria-label={isExpanded ? `Colapsar ${node.title}` : `Expandir ${node.title}`}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span style={{ width: 14 }} />
          )}

          {renderIcon()}

          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {node.title}
          </span>

          {node.pageId && isSelected && (
            <CheckCircle2 size={13} style={{ color: 'var(--accent-color, #6366f1)', flexShrink: 0 }} />
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="wiki-tree-children" style={{ borderLeft: '1px solid var(--border-color, rgba(255,255,255,0.08))', marginLeft: '0.65rem' }}>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="wiki-tree" aria-label="Navegación de modelos y módulos del plan" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Buscador reactivo */}
      <div className="wiki-search-box">
        <Search size={14} className="wiki-search-icon" />
        <input
          id="wiki-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar módulo, modelo o API..."
          className="wiki-search-input"
          aria-label="Buscar módulo, modelo o API en el catálogo"
        />
      </div>

      {/* Lista del árbol scrollable */}
      <div className="wiki-tree-scroll">
        {filteredTree.length > 0 ? (
          filteredTree.map((rootNode) => renderNode(rootNode, 0))
        ) : (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', opacity: 0.6, fontSize: '0.82rem' }}>
            No se encontraron módulos coincidentes con "{searchTerm}".
          </div>
        )}
      </div>

      {/* Pie del árbol con indicador de rol */}
      <div className="wiki-tree-footer">
        <span>Audiencia: <strong>{userRole === 'superadmin' ? 'Técnico / Admin' : 'Estándar'}</strong></span>
        {userRole === 'superadmin' && <Sparkles size={12} style={{ color: '#10b981' }} />}
      </div>
    </nav>
  );
}
