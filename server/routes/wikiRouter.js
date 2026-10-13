/**
 * @file wikiRouter.js
 * @description Router de Express para el catálogo del Wiki de Software OBP.
 * Sirve el árbol de navegación jerárquico y las fichas documentales por página,
 * aplicando filtrado estricto de audiencias (cliente vs. superadmin técnico).
 */

import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

const router = express.Router();
const CATALOG_DIR = path.resolve('server/wiki/catalog');
const INDEX_FILE = path.join(CATALOG_DIR, 'index.json');
const PAGES_DIR = path.join(CATALOG_DIR, 'pages');

/**
 * Filtra recursivamente un nodo del árbol según el rol del usuario y los metadatos de páginas.
 *
 * @param {Object} nodo - Nodo del árbol documental.
 * @param {boolean} esSuperadmin - Indica si el usuario autenticado tiene rol de superadmin.
 * @param {Record<string, Object>} pagesMap - Mapa de metadatos de páginas por ID.
 * @returns {Object|null} - Nodo filtrado o null si debe omitirse.
 */
function filtrarNodoPorRol(nodo, esSuperadmin, pagesMap = {}) {
  if (!nodo || typeof nodo !== 'object') return null;

  // Determinar audiencia del nodo o de la página que referencia
  const audience = nodo.audience || (nodo.pageId ? pagesMap[nodo.pageId]?.audience : 'cliente');

  // Si está marcado como técnico y el usuario no es superadmin, se oculta
  if (!esSuperadmin && audience === 'tecnico') {
    return null;
  }

  const copia = { ...nodo };

  if (Array.isArray(nodo.children)) {
    copia.children = nodo.children
      .map((hijo) => filtrarNodoPorRol(hijo, esSuperadmin, pagesMap))
      .filter(Boolean);

    // Si es un contenedor intermedio sin página propia y se quedó sin hijos visibles, omitir
    if (!copia.pageId && copia.children.length === 0) {
      return null;
    }
  }

  return copia;
}

/**
 * Endpoint GET /api/wiki/tree
 * Retorna el árbol de navegación jerárquico de la wiki, adaptado al rol del usuario.
 */
router.get('/tree', (req, res) => {
  try {
    if (!fs.existsSync(INDEX_FILE)) {
      return res.status(503).json({
        error: 'El catálogo de la wiki aún no ha sido generado. Ejecute npm run wiki:build.',
        code: 'CATALOG_NOT_BUILT'
      });
    }

    const catalogo = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    const esSuperadmin = req.user?.role === 'superadmin';
    const fuentePages = catalogo.pages || catalogo.pagesIndex || {};

    // Filtrar ramas del árbol según permisos y páginas visibles
    const treeFiltrado = (catalogo.tree || [])
      .map((nodo) => filtrarNodoPorRol(nodo, esSuperadmin, fuentePages))
      .filter(Boolean);

    // Filtrar índice plano de páginas para búsqueda
    const pagesIndex = {};
    for (const [pageId, meta] of Object.entries(fuentePages)) {
      if (esSuperadmin || meta.audience !== 'tecnico') {
        pagesIndex[pageId] = meta;
      }
    }

    return res.json({
      schemaVersion: catalogo.schemaVersion || 'wiki-catalog-v1',
      totals: {
        ...catalogo.totals,
        pagesVisibles: Object.keys(pagesIndex).length
      },
      tree: treeFiltrado,
      pages: pagesIndex,
      pagesIndex,
      userRole: req.user?.role || 'user'
    });
  } catch (err) {
    console.error('[WikiRouter] Error al leer árbol de navegación:', err);
    return res.status(500).json({ error: 'Error interno al cargar el índice de la wiki.' });
  }
});

/**
 * Endpoint GET /api/wiki/page/:id
 * Retorna la ficha documental de una página específica, sanitizada y filtrada por audiencia.
 */
router.get('/page/:id', (req, res) => {
  try {
    const rawId = req.params.id;

    // Sanitización estricta contra path traversal
    if (!rawId || typeof rawId !== 'string' || !/^[a-zA-Z0-9._-]+$/.test(rawId)) {
      return res.status(400).json({ error: 'Identificador de página no válido.' });
    }

    const filePath = path.join(PAGES_DIR, `${rawId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Página de la wiki no encontrada.' });
    }

    const pageData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const esSuperadmin = req.user?.role === 'superadmin';

    // Si la página completa está reservada para superadmin y el usuario no lo es
    if (pageData.audience === 'tecnico' && !esSuperadmin) {
      return res.status(403).json({
        error: 'Esta sección contiene información técnica interna reservada para administradores.',
        code: 'SUPERADMIN_REQUIRED'
      });
    }

    // Filtrar secciones internas si no es superadmin
    const sectionsFiltradas = Array.isArray(pageData.sections)
      ? pageData.sections.filter((sec) => esSuperadmin || sec.audience !== 'tecnico')
      : [];

    return res.json({
      ...pageData,
      sections: sectionsFiltradas
    });
  } catch (err) {
    console.error('[WikiRouter] Error al cargar página:', err);
    return res.status(500).json({ error: 'Error interno al cargar la página solicitada.' });
  }
});

export default router;
