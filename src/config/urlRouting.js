import { FRAMEWORKS } from './frameworks.js';

/**
 * Convierte un texto (ej. nombre de proyecto o empresa) a un slug seguro para URLs.
 * Elimina acentos, caracteres especiales y reemplaza espacios por guiones.
 *
 * @param {string} text - Texto a convertir
 * @returns {string} - Cadena formateada para URL
 */
export const slugify = (text) => {
  if (!text) return 'proyecto';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')     // Reemplazar caracteres no alfanuméricos por guión
    .replace(/^-+|-+$/g, '');        // Limpiar guiones en extremos
};

/**
 * Mapeo entre los slugs legibles en URL y las claves internas de cada Framework
 */
export const FRAMEWORK_SLUG_MAP = {
  'plan-negocios': 'business',
  'business': 'business',
  'proyecto-inversion': 'investment_project',
  'investment_project': 'investment_project',
  'social-bid': 'social_bid',
  'social_bid': 'social_bid',
  'lean-startup': 'agile_startup',
  'agile_startup': 'agile_startup',
  'innovacion-id': 'technology_id',
  'technology_id': 'technology_id',
  'microempresa': 'micro_business',
  'micro_business': 'micro_business',
  'marco-logico': 'zopp',
  'zopp': 'zopp',
  'horizon-europe': 'horizon_europe',
  'horizon_europe': 'horizon_europe',
  'hoshin-kanri': 'hoshin_kanri',
  'amoeba': 'amoeba_management',
  'amoeba_management': 'amoeba_management',
  'guanxi': 'guanxi_plan',
  'guanxi_plan': 'guanxi_plan',
  'onudi': 'onudi_project',
  'onudi_project': 'onudi_project'
};

/**
 * Mapeo inverso: de clave interna de Framework a slug legible en URL
 */
export const REVERSE_FRAMEWORK_SLUG_MAP = {
  business: 'plan-negocios',
  investment_project: 'proyecto-inversion',
  social_bid: 'social-bid',
  agile_startup: 'lean-startup',
  technology_id: 'innovacion-id',
  micro_business: 'microempresa',
  zopp: 'marco-logico',
  horizon_europe: 'horizon-europe',
  hoshin_kanri: 'hoshin-kanri',
  amoeba_management: 'amoeba',
  guanxi_plan: 'guanxi',
  onudi_project: 'onudi'
};

/**
 * Alias cortos conocidos para proyectos de demostración y pruebas rápidas
 */
export const KNOWN_PROJECT_SLUGS = {
  'comercio-cuantico': 'hidraulica_minera',
  'comercio-cuantico-tr': 'hidraulica_minera',
  'comercio-cuantico-internacional-tr-sapi-de-cv': 'hidraulica_minera',
  'hidraulica-minera': 'hidraulica_minera',
  'brujula': 'brujula',
  'brujula-financiera': 'brujula',
  'brujula-financiera-mx': 'brujula',
  'ferreteria': 'ferreteria',
  'ferreteria-kino': 'ferreteria',
  'agrorio': 'agrorio',
  'assetmanager': 'assetmanager',
  'sove': 'sove',
  'mixroom': 'mixroom',
  'gtcapital': 'gtcapital',
  'juvicred': 'juvicred',
  'jubilus': 'jubilus',
  'patriplan': 'patriplan',
  'mexitaco': 'mexitaco',
  'hipocredito': 'hipocredito',
  'impulsa': 'impulsa',
  'edufin': 'edufin',
  'fincontrol': 'fincontrol',
  'cibercafe': 'cibercafe'
};

/**
 * Resuelve el pilar correspondiente para un módulo dentro de un marco de trabajo.
 *
 * @param {string} frameworkKey - Clave interna o slug del framework
 * @param {string} moduleKey - Clave del módulo (ej. 'demanda', 'analisis')
 * @returns {string|null} - Clave del pilar encontrado o null
 */
export const resolvePillarFromModule = (frameworkKey, moduleKey) => {
  const fwKey = FRAMEWORK_SLUG_MAP[frameworkKey] || frameworkKey || 'business';
  const framework = FRAMEWORKS[fwKey];
  if (framework && Array.isArray(framework.pillars)) {
    for (const pillar of framework.pillars) {
      if (pillar.modules?.some(m => m.key === moduleKey)) {
        return pillar.key;
      }
    }
  }

  // Búsqueda global de respaldo en todos los frameworks
  for (const [key, fw] of Object.entries(FRAMEWORKS)) {
    if (key === fwKey) continue;
    for (const pillar of (fw.pillars || [])) {
      if (pillar.modules?.some(m => m.key === moduleKey)) {
        return pillar.key;
      }
    }
  }

  return null;
};

/**
 * Construye una URL semántica institucional normalizada.
 * Formato: /:tipoDoc/:modulo/:slug o /:tipoDoc/:seccion/:slug
 *
 * @param {Object} params - Parámetros de la URL
 * @param {string} [params.projectType] - Tipo de proyecto o framework interno
 * @param {string} [params.moduleId] - Clave del módulo académico
 * @param {string} [params.section] - Sección no modular (ej. 'semilla', 'vista-previa', 'lean-canvas')
 * @param {string} [params.slug] - Slug del proyecto
 * @returns {string} - Ruta semántica
 */
export const buildSemanticUrl = ({ projectType = 'business', moduleId, section, slug = 'proyecto' }) => {
  const docSlug = REVERSE_FRAMEWORK_SLUG_MAP[projectType] || 'plan-negocios';
  const cleanSlug = slugify(slug);

  if (section) {
    return `/${docSlug}/${section}/${cleanSlug}`;
  }

  if (moduleId) {
    return `/${docSlug}/${moduleId}/${cleanSlug}`;
  }

  return `/${docSlug}/semilla/${cleanSlug}`;
};
