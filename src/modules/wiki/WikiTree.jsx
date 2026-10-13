/**
 * @file WikiTree.jsx
 * @description Árbol de navegación jerárquico para el Wiki de Software OBP.
 * Proporciona un único nivel de acordeones colapsables, buscador reactivo en tiempo real
 * y resaltado de la página activa.
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
    const initial = new Set(['modelos', 'modelo.business']);
    return initial;
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
      if (node.id === 'referencia' || node.id === 'referencia-apis') {
        return <Terminal size={15} style={{ color: '#10b981', flexShrink: 0 }} />;
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.6rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: depth === 0 ? '0.88rem' : '0.82rem',
            fontWeight: depth === 0 || isSelected ? 600 : 400,
            color: isSelected ? 'var(--accent-color, #6366f1)' : 'var(--text-primary)',
            background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
            transition: 'background 0.15s ease',
            userSelect: 'none'
          }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'inherit'
              }}
              aria-label={isExpanded ? 'Colapsar rama' : 'Expandir rama'}
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
    <aside className="wiki-tree" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Buscador reactivo */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.65rem', opacity: 0.5, pointerEvents: 'none' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar módulo, modelo o API..."
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem 0.45rem 2rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
              background: 'var(--bg-input, rgba(0,0,0,0.2))',
              color: 'var(--text-primary, #fff)',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Lista del árbol scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
        {filteredTree.length > 0 ? (
          filteredTree.map((rootNode) => renderNode(rootNode, 0))
        ) : (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', opacity: 0.6, fontSize: '0.82rem' }}>
            No se encontraron módulos coincidentes con "{searchTerm}".
          </div>
        )}
      </div>

      {/* Pie del árbol con indicador de rol */}
      <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))', fontSize: '0.75rem', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Audiencia: <strong>{userRole === 'superadmin' ? 'Técnico / Admin' : 'Estándar'}</strong></span>
        {userRole === 'superadmin' && <Sparkles size={12} style={{ color: '#10b981' }} />}
      </div>
    </aside>
  );
}
