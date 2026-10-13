/**
 * @file WikiShell.jsx
 * @description Shell maestro de pantalla completa para el Wiki de Software OBP.
 * Despliega un layout Docusaurus de 3 columnas (árbol jerárquico, contenido activo y TOC),
 * operando de forma autónoma fuera del Layout principal y gestionando deep-links por URL.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Menu, X, ShieldCheck } from 'lucide-react';
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
    <div className="wiki-shell">
      {/* Barra Superior Institucional */}
      <header className="wiki-header" role="banner">
        <div className="wiki-header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Botón de Menú Móvil */}
          <button
            type="button"
            className="wiki-mobile-toggle"
            onClick={() => setMobileTreeOpen(!mobileTreeOpen)}
            aria-label={mobileTreeOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={mobileTreeOpen}
          >
            {mobileTreeOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo y Título */}
          <div
            className="wiki-header-brand"
            role="button"
            tabIndex={0}
            onClick={() => handleSelectPage('modelo.business')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleSelectPage('modelo.business');
            }}
          >
            <div className="wiki-brand-icon">
              <BookOpen size={16} />
            </div>
            <div className="wiki-brand-text">
              <span className="wiki-brand-title">Wiki de Software OBP</span>
              <span className="wiki-brand-sub">Fondo Thoth AC · Centro de Conocimiento Canónico</span>
            </div>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="wiki-header-actions">
          {userRole === 'superadmin' && (
            <span className="wiki-badge-admin" title="Visualizando arquitectura técnica completa">
              <ShieldCheck size={12} />
              <span>Modo Superadmin</span>
            </span>
          )}

          {/* Botón Volver al Plan */}
          <button
            type="button"
            onClick={() => navigate('/semilla')}
            className="btn btn-secondary"
            aria-label="Volver a la edición del plan de negocios"
          >
            <ArrowLeft size={14} />
            <span>Volver al Plan</span>
          </button>
        </div>
      </header>

      {/* Cuerpo del Layout (3 Columnas) */}
      <div className="wiki-body">
        {/* Columna Izquierda: Árbol de Navegación */}
        <div className={`wiki-sidebar-left ${mobileTreeOpen ? 'open' : ''}`}>
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
        <main className="wiki-main-content" role="main">
          <WikiPage
            page={activePage}
            isLoading={isLoadingPage}
            error={error}
          />
        </main>

        {/* Columna Derecha: Tabla de Contenidos (TOC) */}
        <div className="wiki-sidebar-right">
          <WikiToc sections={activePage?.sections || []} />
        </div>
      </div>
    </div>
  );
}
