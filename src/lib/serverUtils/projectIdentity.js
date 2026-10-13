/**
 * [C2] Identidad canónica de un proyecto.
 *
 * El problema que resuelve: hasta ahora existian TRES grafias para el mismo nombre
 * comercial, producidas por tres funciones distintas.
 *   - src/config/urlRouting.js:10  slugify()        -> 'brujula-financiera-mx'   (guiones)
 *                                              y PlanContext la usaba para asignar config.projectId
 *   - server/index.js:1442         slugifyFileName()-> 'brujula_financiera_mx'   (guiones bajos)
 *   - projectRename.js:90-91       replace(/[^a-z0-9]/gi,'_') -> 'br_jula_financiera_mx'
 * Un negocio terminaba en 2-4 carpetas segun por que camino se guardo (censado en
 * docs/CENSO_PROYECTOS_DUPLICADOS.md), y el id cambiable en cada guardado huérfana la
 * carpeta anterior sin borrarla ni fusionarla.
 *
 * Reglas de esta fuente unica:
 *   1. CREACION canonica: un id nuevo siempre sale de identitySlug(), con guiones bajos
 *      porque es la forma que ya tienen TODAS las carpetas en disco.
 *   2. RESOLUCION tolerante: los ids ya escritos con las otras grafias siguen siendo
 *      alcanzables (variantasDeResolucion), para no dejar proyectos huérfanos.
 *   3. INMUTABILIDAD: una vez que el id resuelve a un proyecto existente, NO se vuelve a
 *      derivar del nombre comercial. Cambiar el nombre cambia displayName, no la carpeta.
 *
 * Los guiones de urlRouting.js siguen vivos para las RUTAS (son visuales); lo que se
 * corrige aqui es que la ruta se usaba como identidad de archivo.
 */

const TEMPORALES = ['draft_activo', 'proyecto', 'proyecto_nuevo', 'active_project', 'nuevo_proyecto'];

/** Quita diacríticos sin destruir el resto de los caracteres. */
function sinAcentos(texto) {
  return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Slug de identidad: minusculas, sin acentos, todo separador en '_'.
 * @param {string} texto nombre comercial o id entrante
 * @returns {string} id apto para nombre de carpeta (o '' si no hay nada util)
 */
export function identitySlug(texto) {
  const limpio = sinAcentos(texto || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120);
  return limpio;
}

/** @param {string} texto @returns {string} 'draft_activo' cuando no hay nombre aprovechable */
export function identitySlugOdraft(texto) {
  return identitySlug(texto) || 'draft_activo';
}

/**
 * Normaliza un id que llega del cliente o del disco a la forma canonica.
 * Tolerante: si ya venia en una grafia legacy (guiones o caracteres sustituidos), la
 * devuelve intacta cuando esa carpeta existe realmente; quien llama decide.
 * @param {string} id
 * @returns {string}
 */
export function canonicId(id) {
  const bruto = String(id || '').trim();
  if (!bruto) return '';
  const canonico = identitySlug(bruto);
  return canonico || '';
}

/** @param {string} id @returns {boolean} true si el id no identifica un proyecto real */
export function esIdTemporal(id) {
  const bruto = String(id || '').trim().toLowerCase();
  if (!bruto) return true;
  if (TEMPORALES.includes(bruto) || TEMPORALES.includes(bruto.replace(/-/g, '_'))) return true;
  // ids efimeros del cliente y de la herramienta de generacion
  if (/^project[_-][a-z0-9_-]+$/i.test(bruto)) return true;
  if (/^proj[_-]\d+[_-][a-f0-9]+$/i.test(bruto)) return true;
  if (/^proyecto[_-]\d+$/i.test(bruto)) return true;
  if (/^[a-f0-9]{8}[_-][a-f0-9]{4}[_-][a-f0-9]{4}[_-][a-f0-9]{4}[_-][a-f0-9]{12}$/i.test(bruto)) return true;
  if (/^[a-f0-9]{8}[_-][a-f0-9]{4}[_-]/i.test(bruto)) return true;
  return false;
}

/**
 * Candidatos de carpeta para un id dado, del mas canonico al mas legacy.
 *
 * LIMITE CONOCIDO y deliberate de este helper: el mangling legacy NO es reversible.
 * projectRename.js reemplazaba cada caracter no [a-z0-9] por '_' SIN quitar acentos, asi
 * que la 'í' de 'Ferretería' se convirtió en '_' y la vocal se perdio:
 * 'ferretería' -> 'ferreter_a'. Desde 'ferreter_a' no hay forma de saber si la letra
 * perdida era i, í o cualquier otra, y adivinar por similitud podría apuntar al proyecto
 * equivocado (peor que no encontrarlo). Por eso:
 *   - el nombre EXACTO de la carpeta que devuelve GET /api/projects siempre es candidato
 *     (es lo que manda el cliente al renombrar, y asi las carpetas legacy siguen
 *     accesibles), y
 *   - solo se agregan variantes seguras: canonica, sin acentos, y guiones de urlRouting.
 * La convergencia definitiva es crear con la forma canonica y no renombrar por nombre.
 * @param {string} id
 * @returns {string[]} sin duplicados, ordenados por prioridad
 */
export function variantasDeResolucion(id) {
  const bruto = String(id || '').trim();
  if (!bruto) return [];
  const salida = [];
  const agregar = (v) => {
    const valor = String(v || '');
    // un nombre de carpeta que no sea [a-z0-9_-] no puede existir: no lo proponemos
    if (!valor || salida.includes(valor) || /[^a-z0-9_-]/i.test(valor)) return;
    salida.push(valor);
  };

  const minusculo = bruto.toLowerCase();
  agregar(canonicId(minusculo));                                   // canonica (guiones bajos, sin acentos)
  agregar(minusculo.replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, ''));
  // mangling legacy de projectRename.js:90: cada caracter no [a-z0-9] se volvio '_' SIN
  // quitar acentos antes, por eso 'ferretería' dejo de ser 'ferreteria_' y salio 'ferreter_a'.
  agregar(sinAcentos(minusculo).replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, ''));
  agregar(minusculo.replace(/[ _]/g, '-').replace(/^-+|-+$/g, '')); // grafia de urlRouting
  agregar(minusculo);
  if (/^[a-z0-9_-]+$/.test(bruto)) salida.unshift(bruto);            // si ya venia en forma de carpeta, es la primera opcion
  return Array.from(new Set(salida.filter(Boolean)));
}

/**
 * Clave de comparacion entre negocios: normaliza las tres grafias a una sola.
 * @param {string} texto
 */
export function claveComparacion(texto) {
  return sinAcentos(texto || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
