/**
 * @file useWikiCatalog.js
 * @description Hook de React para la gestión del estado, fetching y navegación del catálogo Wiki OBP.
 * Implementa caché en memoria por página, resolución de slugs semánticos y sincronización de URL.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getApiBase } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import { REVERSE_FRAMEWORK_SLUG_MAP } from '../../config/urlRouting';

/**
 * Hook maestro del catálogo de la Wiki.
 *
 * @param {string} [initialPageId] - ID o ruta inicial de la página a cargar.
 * @returns {Object} Estado del catálogo, árbol, página activa y métodos de selección.
 */
export function useWikiCatalog(initialPageId = null) {
  const { authFetch, user } = useAuth();
  const [tree, setTree] = useState([]);
  const [pagesIndex, setPagesIndex] = useState({});
  const [totals, setTotals] = useState(null);
  const [userRole, setUserRole] = useState(user?.role || 'user');
  const [activePageId, setActivePageId] = useState(initialPageId);
  const [activePage, setActivePage] = useState(null);
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [error, setError] = useState(null);

  // Caché en memoria para evitar peticiones redundantes
  const cacheRef = useRef(new Map());

  // Cargar el árbol de navegación jerárquico
  useEffect(() => {
    let isMounted = true;
    const fetchTree = async () => {
      setIsLoadingTree(true);
      setError(null);
      try {
        const apiBase = getApiBase();
        const res = await (authFetch || fetch)(`${apiBase}/api/wiki/tree`);

        if (!res.ok) {
          throw new Error(`Error al cargar el catálogo de la wiki (${res.status})`);
        }

        const data = await res.json();
        if (isMounted) {
          setTree(data.tree || []);
          setPagesIndex(data.pagesIndex || data.pages || {});
          setTotals(data.totals || null);
          setUserRole(data.userRole || user?.role || 'user');

          // Si no hay página activa seleccionada, seleccionar la primera por defecto
          if (!activePageId) {
            const primerModelo = data.tree?.find((n) => n.id === 'modelos')?.children?.[0];
            const defaultId = primerModelo?.pageId || 'modelo.business';
            setActivePageId(defaultId);
          }
        }
      } catch (err) {
        console.error('[useWikiCatalog] Error obteniendo árbol:', err);
        if (isMounted) {
          setError(err.message || 'Error de conexión con el catálogo.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingTree(false);
        }
      }
    };

    fetchTree();

    return () => {
      isMounted = false;
    };
  }, [authFetch, user?.role]);

  /**
   * Resuelve identificadores semánticos en el ID canónico de página.
   * Ej: 'modulo/business/introduccion' -> 'modulo.business.introduccion'
   *     'plan-negocios/introduccion' -> 'modulo.business.introduccion'
   */
  const normalizarPageId = useCallback((rawId) => {
    if (!rawId) return null;
    let clean = String(rawId).replace(/^\/+/, '').replace(/\/+$/, '');

    // Reemplazo de diagonales por puntos
    clean = clean.replace(/\//g, '.');

    // Traducir slug de URL si corresponde (ej. plan-negocios -> business)
    for (const [slug, internalKey] of Object.entries(REVERSE_FRAMEWORK_SLUG_MAP)) {
      if (clean.includes(slug)) {
        clean = clean.replace(slug, internalKey);
      }
    }

    // Prefijar 'modulo.' si tiene la forma 'business.introduccion'
    const partes = clean.split('.');
    if (partes.length === 2 && !partes[0].startsWith('modelo') && !partes[0].startsWith('modulo')) {
      clean = `modulo.${clean}`;
    }

    return clean;
  }, []);

  /**
   * Carga una página por su identificador único.
   */
  const selectPage = useCallback(
    async (rawPageId) => {
      const pageId = normalizarPageId(rawPageId);
      if (!pageId) return;

      setActivePageId(pageId);

      // Si ya está en caché en memoria, resolver instantáneamente
      if (cacheRef.current.has(pageId)) {
        setActivePage(cacheRef.current.get(pageId));
        return;
      }

      setIsLoadingPage(true);
      setError(null);

      try {
        const apiBase = getApiBase();
        const res = await (authFetch || fetch)(`${apiBase}/api/wiki/page/${encodeURIComponent(pageId)}`);

        if (!res.ok) {
          if (res.status === 403) {
            throw new Error('Esta sección contiene información técnica interna reservada para administradores.');
          }
          if (res.status === 404) {
            throw new Error(`La página "${pageId}" no existe en el catálogo.`);
          }
          throw new Error(`Error en el servidor (${res.status})`);
        }

        const data = await res.json();
        cacheRef.current.set(pageId, data);
        setActivePage(data);
      } catch (err) {
        console.error(`[useWikiCatalog] Error cargando página ${pageId}:`, err);
        setError(err.message || 'No fue posible cargar el documento.');
        setActivePage(null);
      } finally {
        setIsLoadingPage(false);
      }
    },
    [authFetch, normalizarPageId]
  );

  // Efecto para sincronizar cuando activePageId cambia
  useEffect(() => {
    if (activePageId && (!activePage || activePage.id !== activePageId)) {
      selectPage(activePageId);
    }
  }, [activePageId, activePage, selectPage]);

  return {
    tree,
    pagesIndex,
    totals,
    userRole,
    activePageId,
    activePage,
    isLoadingTree,
    isLoadingPage,
    error,
    selectPage,
    setActivePageId
  };
}
