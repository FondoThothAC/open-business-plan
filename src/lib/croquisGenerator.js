/**
 * Motor de Generación y Métricas de Croquis Espacial (Open Business Plan v2.6)
 * Fondo Thoth AC — Arquitectura de Microempresa y Autoempleo
 * 
 * Permite modelar distribuciones físicas en 2D y construir prompts arquitectónicos
 * para renders mediante IA (Google Imagen / Pollinations Flux).
 */

export const CROQUIS_STYLES = {
  cad_blueprint: {
    id: 'cad_blueprint',
    name: 'Plano Técnico 2D (CAD Blueprint)',
    emoji: '📐',
    desc: 'Esquema cenital en blanco y negro con cotas, muros y zonificación técnica',
    promptSuffix: 'top-down 2D architectural blueprint floor plan, CAD technical line drawing, clean black lines on crisp white background, labeled workstations, dimensional annotations, modern architectural drawing, high resolution, no perspective angle'
  },
  isometric_3d: {
    id: 'isometric_3d',
    name: 'Render Isométrico 3D (HomeByMe)',
    emoji: '🏠',
    desc: 'Vista axonométrica en corte 3D con mobiliario, texturas e iluminación cálida',
    promptSuffix: 'cutaway 3D isometric architectural floor plan, furnished commercial small business space, warm natural lighting, modern finishes, stainless steel and wood textures, clean architectural visualization, 8k render, professional interior design'
  },
  interior_photo: {
    id: 'interior_photo',
    name: 'Fotografía Realista Interior',
    emoji: '📸',
    desc: 'Perspectiva humana fotorrealista del taller o local en operación limpia',
    promptSuffix: 'eye-level architectural photography of small commercial workshop interior, spotless organization, stainless steel prep surfaces, commercial appliances, natural warm ambient lighting, 8k resolution, editorial design magazine style'
  }
};

/**
 * Catálogo de bloques de equipamiento y mobiliario comercial para microempresas
 */
export const DEFAULT_EQUIPMENT_BLOCKS = [
  { id: 'mesa_inox', name: 'Mesa de Trabajo Acero Inox', category: 'preparacion', icon: '🪵', widthM: 1.8, lengthM: 0.8, color: '#3b82f6', desc: 'Isla central de preparación y ensamble' },
  { id: 'horno_coccion', name: 'Horno / Zona de Calor', category: 'calor', icon: '🔥', widthM: 1.0, lengthM: 0.9, color: '#ef4444', desc: 'Horno de convección o estufa industrial' },
  { id: 'refrigerador_frio', name: 'Refrigerador / Vitrina', category: 'frio', icon: '🧊', widthM: 1.2, lengthM: 0.8, color: '#06b6d4', desc: 'Conservación de perecederos y producto terminado' },
  { id: 'tarja_lavado', name: 'Tarja Doble Sanitaria', category: 'lavado', icon: '🧼', widthM: 1.4, lengthM: 0.7, color: '#10b981', desc: 'Lavado y sanitización según NOM de salubridad' },
  { id: 'estanteria_secos', name: 'Estante de Insumos Secos', category: 'almacen', icon: '📦', widthM: 1.5, lengthM: 0.5, color: '#8b5cf6', desc: 'Almacenamiento vertical de materias primas' },
  { id: 'mostrador_caja', name: 'Mostrador / Punto de Cobro', category: 'atencion', icon: '💳', widthM: 1.6, lengthM: 0.7, color: '#f59e0b', desc: 'Atención a clientes y caja de cobro' },
  { id: 'puerta_acceso', name: 'Puerta Principal / Acceso', category: 'acceso', icon: '🚪', widthM: 1.0, lengthM: 0.3, color: '#64748b', desc: 'Acceso principal de clientes o proveedores' },
  { id: 'sanitario', name: 'Sanitario / Baño Operativo', category: 'servicio', icon: '🚻', widthM: 1.5, lengthM: 1.5, color: '#a855f7', desc: 'Servicio sanitario para personal o clientes' }
];

/**
 * Calcula las métricas espaciales del croquis
 * 
 * @param {number} widthMeters - Ancho total del local
 * @param {number} lengthMeters - Largo total del local
 * @param {Array} elements - Lista de elementos colocados en el croquis
 * @returns {Object} - Métricas calculadas
 */
export function calculateLayoutMetrics(widthMeters = 4, lengthMeters = 3, elements = []) {
  const w = Math.max(1, Number(widthMeters) || 4);
  const l = Math.max(1, Number(lengthMeters) || 3);
  const totalM2 = Math.round((w * l) * 100) / 100;

  const occupiedM2 = elements.reduce((acc, el) => {
    const ew = Number(el.widthM) || 1;
    const elen = Number(el.lengthM) || 1;
    return acc + (ew * elen);
  }, 0);

  const roundedOccupied = Math.round(occupiedM2 * 100) / 100;
  const freeM2 = Math.max(0, Math.round((totalM2 - roundedOccupied) * 100) / 100);
  const freePercentage = totalM2 > 0 ? Math.round((freeM2 / totalM2) * 100) : 100;

  let circulationStatus = 'Optima';
  let circulationColor = '#10b981';
  let circulationRecommendation = 'Espacio de circulación adecuado para flujo continuo y seguridad operativa.';

  if (freePercentage < 30) {
    circulationStatus = 'Saturada';
    circulationColor = '#ef4444';
    circulationRecommendation = 'El espacio está sobrecargado. Riesgo de cuellos de botella y accidentes laborales.';
  } else if (freePercentage < 45) {
    circulationStatus = 'Aceptable';
    circulationColor = '#f59e0b';
    circulationRecommendation = 'Circulación funcional pero compacta. Asegurar despeje en pasillos principales.';
  }

  return {
    widthMeters: w,
    lengthMeters: l,
    totalM2,
    occupiedM2: roundedOccupied,
    freeM2,
    freePercentage,
    circulationStatus,
    circulationColor,
    circulationRecommendation,
    totalElements: elements.length
  };
}

/**
 * Construye el prompt técnico para generar el render con IA
 */
export function buildArchitecturalPrompt(spaceDetails = {}, elements = [], styleKey = 'cad_blueprint') {
  const style = CROQUIS_STYLES[styleKey] || CROQUIS_STYLES.cad_blueprint;
  const giro = spaceDetails.giro || spaceDetails.nombre || 'taller de microempresa';
  const widthM = spaceDetails.widthMeters || 4;
  const lengthM = spaceDetails.lengthMeters || 3;
  const totalM2 = widthM * lengthM;

  const elementsSummary = elements.map(e => e.name || e.desc).filter(Boolean);
  const elementsText = elementsSummary.length > 0 
    ? `featuring the following labeled stations: ${elementsSummary.join(', ')}`
    : 'with an ergonomic layout and designated preparation, storage and service stations';

  return `Commercial ${giro} layout, total floor area ${totalM2} square meters (${widthM}m x ${lengthM}m), ${elementsText}, ${style.promptSuffix}`;
}

/**
 * Construye la URL de Pollinations.ai para el render arquitectónico
 */
export function buildCroquisImageUrl(prompt, options = {}) {
  const {
    width = 1024,
    height = 768,
    seed = Math.floor(Math.random() * 1000000),
    model = 'flux',
    apiKey = ''
  } = options;

  const encoded = encodeURIComponent(prompt);
  let url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;
  if (apiKey && apiKey.trim()) {
    url += `&key=${encodeURIComponent(apiKey.trim())}`;
  }
  return url;
}
