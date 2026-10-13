/**
 * @file WikiShell.jsx
 * @description Shell maestro de pantalla completa para el Wiki de Software OBP.
 * Despliega un layout Docusaurus de 3 columnas (árbol jerárquico, contenido activo y TOC),
 * operando de forma autónoma fuera del Layout principal y gestionando deep-links por URL.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Menu, X, Sparkles, ShieldCheck } from 'lucide-react';
import { useWikiCatalog } from './useWikiCatalog';
import WikiTree from './WikiTree';
import WikiPage from './WikiPage';
import WikiToc from './WikiToc';

/**
 * Shell maestro de la Wiki a pantalla completa.
 *
 * @returns {JSX.Element}
 */
export default function WikiShell() {
  const { pageId: routePageId, '*': splatPageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // El identificador puede venir por param :pageId, por splat (*), o por query param ?page=
  const searchParams = new URLSearchParams(location.search);
  const queryPageId = searchParams.get('page');
  const targetId = routePageId || splatPageId || queryPageId || null;

  const {
    tree,
    pagesIndex,
    userRole,
    activePageId,
    activePage,
    isLoadingTree,
    isLoadingPage,
    error,
    selectPage
  } = useWikiCatalog(targetId);

  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);

  // Sincronizar selección de página y actualizar la URL sin recargar
  const handleSelectPage = (pageId) => {
    selectPage(pageId);
    setMobileTreeOpen(false);
    navigate(`/wiki/${pageId}`, { replace: true });
  };

  // Si la ruta cambia externamente (ej. navegación con historial del navegador)
  useEffect(() => {
    if (targetId && targetId !== activePageId) {
      selectPage(targetId);
    }
  }, [targetId, activePageId, selectPage]);

  return (
    <div className="wiki-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-main, #0f172a)', color: 'var(--text-primary, #f8fafc)' }}>
      {/* Barra Superior Institucional */}
      <header
        className="wiki-header"
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          background: 'var(--bg-panel, rgba(15, 23, 42, 0.95))',
          backdropFilter: 'blur(8px)',
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Botón de Menú Móvil */}
          <button
            type="button"
            className="wiki-mobile-toggle"
            onClick={() => setMobileTreeOpen(!mobileTreeOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
            aria-label="Abrir menú de navegación"
          >
            {mobileTreeOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo y Título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => handleSelectPage('modelo.business')}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={16} color="#fff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Wiki de Software OBP</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.5 }}>Fondo Thoth AC · Centro de Conocimiento Canónico</span>
            </div>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {userRole === 'superadmin' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600 }}>
              <ShieldCheck size={12} />
              <span>Modo Superadmin</span>
            </span>
          )}

          {/* Botón Volver al Plan */}
          <button
            type="button"
            onClick={() => navigate('/semilla')}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'inherit',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} />
            <span>Volver al Plan</span>
          </button>
        </div>
      </header>

      {/* Cuerpo del Layout (3 Columnas) */}
      <div className="wiki-body" style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Columna Izquierda: Árbol de Navegación */}
        <div
          className={`wiki-sidebar-left ${mobileTreeOpen ? 'open' : ''}`}
          style={{
            width: '320px',
            borderRight: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            background: 'var(--bg-panel, rgba(15, 23, 42, 0.6))',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          {isLoadingTree ? (
            <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>
              Cargando árbol de modelos...
            </div>
          ) : (
            <WikiTree
              tree={tree}
              activePageId={activePageId}
              onSelectPage={handleSelectPage}
              userRole={userRole}
            />
          )}
        </div>

        {/* Columna Central: Contenido de la Ficha Activa */}
        <main
          className="wiki-main-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--bg-main, #0f172a)'
          }}
        >
          <WikiPage
            page={activePage}
            isLoading={isLoadingPage}
            error={error}
          />
        </main>

        {/* Columna Derecha: Tabla de Contenidos (TOC) */}
        <div
          className="wiki-sidebar-right"
          style={{
            width: '240px',
            borderLeft: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            background: 'var(--bg-panel, rgba(15, 23, 42, 0.4))',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          <WikiToc sections={activePage?.sections || []} />
        </div>
      </div>
    </div>
  );
}
