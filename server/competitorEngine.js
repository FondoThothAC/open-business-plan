/**
 * Motor de Inteligencia Competitiva Multi-Fuente (v2.7.1)
 * 
 * Agente autónomo de investigación de mercado que:
 * 1. Consulta APIs oficiales primero (DENUE, Google Places, Bing)
 * 2. Si no hay API, usa headless browser conservador (DuckDuckGo, redes sociales)
 * 3. Cruza y fusiona resultados con score de confianza
 * 4. Peticiones concéntricas para superar el límite de 5km del DENUE
 * 5. Códigos de color por fuente para el mapa
 */

// ─────────────────────────────────────────────────────────
//  Configuración de fuentes y colores para el frontend
// ─────────────────────────────────────────────────────────
export const FUENTE = {
  DENUE: 'denue_inegi',
  GOOGLE: 'google_places',
  BING: 'bing_maps',
  OSM: 'openstreetmap',
  DDG: 'duckduckgo',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  TIKTOK: 'tiktok',
  IA: 'ia_synthetic',
};

// Colores por fuente — usados en el frontend para marcadores del mapa
export const COLORES_FUENTE = {
  [FUENTE.DENUE]: '#22c55e',      // Verde oficial gobierno
  [FUENTE.GOOGLE]: '#4285F4',      // Azul Google
  [FUENTE.BING]: '#008373',        // Teal Bing
  [FUENTE.OSM]: '#7B68EE',         // Violeta OSM
  [FUENTE.DDG]: '#DE5833',         // Naranja DuckDuckGo
  [FUENTE.INSTAGRAM]: '#E1306C',   // Rosa Instagram
  [FUENTE.FACEBOOK]: '#1877F2',    // Azul oscuro Facebook
  [FUENTE.TIKTOK]: '#010101',      // Negro TikTok
  [FUENTE.IA]: '#6366f1',          // Índigo IA Geospatial Synthesis
  comun: '#6B7280',                // Gris — aparece en múltiples fuentes
  ia_synthetic: '#6366f1',
};

const CONFIANZA = {
  ALTA: 'alta',
  MEDIA: 'media',
  BAJA: 'baja',
};

// Distancia en metros para deduplicar (mismo negocio)
const UMBRAL_DEDUPLICACION_METROS = 80;

// Límite de la API DENUE por petición
const DENUE_MAX_RADIUS = 5000;

// Rate limiting conservador para scraping (ms entre peticiones)
const SCRAPING_DELAY_MS = 3000;

// ─────────────────────────────────────────────────────────
//  Utilidades geográficas
// ─────────────────────────────────────────────────────────
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizarNombre(nombre) {
  if (!nombre) return '';
  return nombre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Genera puntos de búsqueda concéntricos para cubrir un radio mayor al límite de la API (5km).
 * Usa un patrón de cuadrícula hexagonal para minimizar solapamientos y vacíos.
 * @param {number} centerLat - Latitud del centro
 * @param {number} centerLng - Longitud del centro
 * @param {number} totalRadius - Radio total deseado en metros
 * @param {number} stepRadius - Radio por petición (máx 5000)
 * @returns {Array<{lat: number, lng: number}>} Array de puntos de búsqueda
 */
function generarPuntosConcéntricos(centerLat, centerLng, totalRadius, stepRadius = DENUE_MAX_RADIUS) {
  if (totalRadius <= stepRadius) {
    return [{ lat: centerLat, lng: centerLng }];
  }

  const puntos = [{ lat: centerLat, lng: centerLng }];
  // Grados por metro (aproximación para México ~20°N-30°N)
  const mPorGradoLat = 111320;
  const mPorGradoLng = 111320 * Math.cos(centerLat * Math.PI / 180);

  // Distancia entre centros = stepRadius * 1.5 (para cubrir sin huecos)
  const step = stepRadius * 1.4;
  const numAnillos = Math.ceil(totalRadius / step);

  for (let anillo = 1; anillo <= numAnillos; anillo++) {
    const distancia = anillo * step;
    // 6 puntos en cada anillo (patrón hexagonal)
    const numPuntos = 6 * anillo;
    for (let i = 0; i < numPuntos; i++) {
      const angulo = (2 * Math.PI * i) / numPuntos;
      const dLat = (distancia * Math.cos(angulo)) / mPorGradoLat;
      const dLng = (distancia * Math.sin(angulo)) / mPorGradoLng;
      const pLat = centerLat + dLat;
      const pLng = centerLng + dLng;

      // Solo incluir si el punto está dentro del radio total
      if (haversineDistance(centerLat, centerLng, pLat, pLng) <= totalRadius) {
        puntos.push({ lat: pLat, lng: pLng });
      }
    }
  }

  console.log(`[Concéntricos] Radio ${totalRadius}m → ${puntos.length} puntos de búsqueda generados.`);
  return puntos;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────
//  Fuente 1: DENUE (INEGI) — Con peticiones concéntricas
// ─────────────────────────────────────────────────────────
async function buscarDENUE(lat, lng, query, radius, token) {
  if (!token) {
    console.log('[CompetitorEngine] Sin token DENUE, omitiendo fuente INEGI.');
    return [];
  }

  try {
    // Generar puntos de búsqueda si el radio excede 5km
    const puntos = generarPuntosConcéntricos(lat, lng, radius, DENUE_MAX_RADIUS);
    const radioPerPeticion = Math.min(radius, DENUE_MAX_RADIUS);
    const todosResultados = [];
    const idsVistos = new Set();

    console.log(`[DENUE] Ejecutando ${puntos.length} petición(es) concéntrica(s) para radio ${radius}m...`);

    for (const punto of puntos) {
      try {
        const params = new URLSearchParams({
          token,
          lat: String(punto.lat),
          lng: String(punto.lng),
          radius: String(radioPerPeticion),
          keywords: query || 'todos',
          scian: '0',
        });

        const response = await fetch(`http://localhost:3001/api/inegi/denue?${params.toString()}`, {
          signal: AbortSignal.timeout(15000),
        });
        const data = await response.json();

        if (data?.success && Array.isArray(data.businesses)) {
          for (const b of data.businesses) {
            // Deduplicar por ID o nombre+coordenadas dentro de la misma fuente
            const key = b.id || `${normalizarNombre(b.nombre)}_${b.lat}_${b.lng}`;
            if (!idsVistos.has(key)) {
              idsVistos.add(key);
              todosResultados.push({
                id: b.id || '',
                nombre: b.nombre || 'Sin nombre',
                actividad: b.actividad || '',
                direccion: b.direccion || '',
                lat: Number(b.lat) || 0,
                lng: Number(b.lng) || 0,
                telefono: b.telefono || '',
                correo: b.correo || '',
                web: b.web || '',
                estrato: b.estrato || '',
                fuente: FUENTE.DENUE,
                color: COLORES_FUENTE[FUENTE.DENUE],
                rating: null,
                reviews: null,
                horarios: null,
                precioRango: null,
              });
            }
          }
        }

        // Rate limiting entre peticiones concéntricas
        if (puntos.length > 1) await sleep(500);
      } catch (e) {
        console.warn(`[DENUE] Error en punto (${punto.lat}, ${punto.lng}):`, e.message);
      }
    }

    console.log(`[DENUE] Total deduplicado: ${todosResultados.length} establecimientos únicos.`);
    return todosResultados;
  } catch (error) {
    console.error('[CompetitorEngine] Error en DENUE:', error.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────
//  Fuente 2: OpenStreetMap (Overpass API) — Gratuita
// ─────────────────────────────────────────────────────────
async function buscarOSM(lat, lng, query, radius) {
  try {
    const overpassQuery = `
      [out:json][timeout:15];
      (
        node["shop"](around:${radius},${lat},${lng});
        node["amenity"~"restaurant|cafe|bar|pharmacy|bank|hospital|school|clinic|supermarket|fuel"](around:${radius},${lat},${lng});
        node["office"](around:${radius},${lat},${lng});
        way["shop"](around:${radius},${lat},${lng});
        way["amenity"~"restaurant|cafe|bar|pharmacy|bank|hospital|school|clinic|supermarket|fuel"](around:${radius},${lat},${lng});
      );
      out center body;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: AbortSignal.timeout(20000),
    });
    const data = await response.json();

    if (!data?.elements || !Array.isArray(data.elements)) return [];

    const queryNorm = normalizarNombre(query);

    return data.elements
      .filter(el => {
        if (!el.tags?.name) return false;
        if (queryNorm) {
          const nombreNorm = normalizarNombre(el.tags.name);
          const tipoNorm = normalizarNombre(el.tags.shop || el.tags.amenity || el.tags.office || '');
          return nombreNorm.includes(queryNorm) || tipoNorm.includes(queryNorm);
        }
        return true;
      })
      .slice(0, 50)
      .map(el => ({
        nombre: el.tags.name || 'Sin nombre',
        actividad: el.tags.shop || el.tags.amenity || el.tags.office || 'N/D',
        direccion: [el.tags['addr:street'], el.tags['addr:housenumber'], el.tags['addr:city']].filter(Boolean).join(' ') || '',
        lat: el.lat || el.center?.lat || 0,
        lng: el.lon || el.center?.lon || 0,
        telefono: el.tags.phone || el.tags['contact:phone'] || '',
        correo: el.tags.email || el.tags['contact:email'] || '',
        web: el.tags.website || el.tags['contact:website'] || '',
        estrato: '',
        fuente: FUENTE.OSM,
        color: COLORES_FUENTE[FUENTE.OSM],
        rating: null,
        reviews: null,
        horarios: el.tags.opening_hours || null,
        precioRango: null,
      }));
  } catch (error) {
    console.error('[CompetitorEngine] Error en OSM/Overpass:', error.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────
//  Fuente 3: DuckDuckGo (scraping conservador vía API interna)
// ─────────────────────────────────────────────────────────
async function buscarDDG(lat, lng, query) {
  try {
    const searchQuery = `${query} negocios cerca de ${lat},${lng} México`;
    const response = await fetch('http://localhost:3001/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: searchQuery, provider: 'duckduckgo' }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json();

    if (!data?.success || !Array.isArray(data.results)) return [];

    return data.results.map(r => ({
      nombre: r.title || 'Sin nombre',
      actividad: '',
      direccion: '',
      lat: lat,
      lng: lng,
      telefono: '',
      correo: '',
      web: r.url || '',
      estrato: '',
      fuente: FUENTE.DDG,
      color: COLORES_FUENTE[FUENTE.DDG],
      rating: null,
      reviews: null,
      horarios: null,
      precioRango: null,
      snippet: r.snippet || '',
    }));
  } catch (error) {
    console.error('[CompetitorEngine] Error en DuckDuckGo:', error.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────
//  Fuente 4: Google Places API (opcional, requiere API Key)
// ─────────────────────────────────────────────────────────
async function buscarGooglePlaces(lat, lng, query, radius, apiKey) {
  if (!apiKey) return [];

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radius}&language=es&key=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    const data = await response.json();

    if (data.status !== 'OK' || !Array.isArray(data.results)) {
      console.warn('[CompetitorEngine] Google Places:', data.status, data.error_message || '');
      return [];
    }

    return data.results.map(place => ({
      nombre: place.name || 'Sin nombre',
      actividad: (place.types || []).join(', '),
      direccion: place.formatted_address || '',
      lat: place.geometry?.location?.lat || 0,
      lng: place.geometry?.location?.lng || 0,
      telefono: '',
      correo: '',
      web: '',
      estrato: '',
      fuente: FUENTE.GOOGLE,
      color: COLORES_FUENTE[FUENTE.GOOGLE],
      rating: place.rating || null,
      reviews: place.user_ratings_total || null,
      horarios: place.opening_hours?.open_now != null ? (place.opening_hours.open_now ? 'Abierto ahora' : 'Cerrado') : null,
      precioRango: place.price_level ? '$'.repeat(place.price_level) : null,
      googlePlaceId: place.place_id || '',
      // Indicador de actividad: si tiene datos recientes, probablemente sigue operando
      ultimaActividad: place.business_status === 'OPERATIONAL' ? 'activo' : (place.business_status || 'desconocido'),
    }));
  } catch (error) {
    console.error('[CompetitorEngine] Error en Google Places:', error.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────
//  Fuente 5: Bing Maps Local Search (alternativa a Google)
// ─────────────────────────────────────────────────────────
async function buscarBingMaps(lat, lng, query, radius, apiKey) {
  if (!apiKey) return [];

  try {
    // Bing Maps Local Search API
    const url = `https://dev.virtualearth.net/REST/v1/LocalSearch/?query=${encodeURIComponent(query)}&userLocation=${lat},${lng}&maxResults=20&key=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    const data = await response.json();

    if (!data?.resourceSets?.[0]?.resources) return [];

    return data.resourceSets[0].resources.map(place => ({
      nombre: place.name || 'Sin nombre',
      actividad: place.entityType || '',
      direccion: place.Address?.formattedAddress || '',
      lat: place.point?.coordinates?.[0] || 0,
      lng: place.point?.coordinates?.[1] || 0,
      telefono: place.PhoneNumber || '',
      correo: '',
      web: place.Website || '',
      estrato: '',
      fuente: FUENTE.BING,
      color: COLORES_FUENTE[FUENTE.BING],
      rating: null,
      reviews: null,
      horarios: null,
      precioRango: null,
    }));
  } catch (error) {
    console.error('[CompetitorEngine] Error en Bing Maps:', error.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────
//  Motor de cruce, deduplicación y asignación de colores
// ─────────────────────────────────────────────────────────
function cruzarResultados(resultadosPorFuente) {
  const todos = resultadosPorFuente.flat();
  const fusionados = [];

  for (const item of todos) {
    if (!item.nombre || item.nombre === 'Sin nombre') continue;

    // Buscar registro existente cercano y con nombre similar
    const existente = fusionados.find(f => {
      const distancia = haversineDistance(f.lat, f.lng, item.lat, item.lng);
      const n1 = normalizarNombre(f.nombre);
      const n2 = normalizarNombre(item.nombre);
      const nombreSimilar = n1.includes(n2) || n2.includes(n1);
      return distancia < UMBRAL_DEDUPLICACION_METROS && nombreSimilar;
    });

    if (existente) {
      // Fusionar: enriquecer con datos de la nueva fuente
      if (!existente.fuentes.includes(item.fuente)) {
        existente.fuentes.push(item.fuente);
      }
      // Rellenar campos vacíos con datos de la nueva fuente
      if (!existente.telefono && item.telefono) existente.telefono = item.telefono;
      if (!existente.correo && item.correo) existente.correo = item.correo;
      if (!existente.web && item.web) existente.web = item.web;
      if (!existente.horarios && item.horarios) existente.horarios = item.horarios;
      if (!existente.rating && item.rating) existente.rating = item.rating;
      if (!existente.reviews && item.reviews) existente.reviews = item.reviews;
      if (!existente.precioRango && item.precioRango) existente.precioRango = item.precioRango;
      if (!existente.actividad && item.actividad) existente.actividad = item.actividad;
      if (!existente.direccion && item.direccion) existente.direccion = item.direccion;
      if (!existente.estrato && item.estrato) existente.estrato = item.estrato;
      if (item.googlePlaceId) existente.googlePlaceId = item.googlePlaceId;
      if (item.snippet) existente.snippet = item.snippet;
      if (item.ultimaActividad) existente.ultimaActividad = item.ultimaActividad;
    } else {
      fusionados.push({
        ...item,
        fuentes: [item.fuente],
      });
    }
  }

  // Calcular confianza y asignar color final
  for (const registro of fusionados) {
    const numFuentes = new Set(registro.fuentes).size;

    if (numFuentes >= 3) {
      registro.confianza = CONFIANZA.ALTA;
    } else if (numFuentes === 2) {
      registro.confianza = CONFIANZA.MEDIA;
    } else {
      registro.confianza = CONFIANZA.BAJA;
    }
    registro.numFuentes = numFuentes;

    // Color: si aparece en múltiples fuentes → gris (común),
    // si solo una fuente → color de esa fuente
    if (numFuentes > 1) {
      registro.color = COLORES_FUENTE.comun;
      registro.colorLabel = 'Múltiples fuentes';
    } else {
      registro.color = COLORES_FUENTE[registro.fuente] || '#6B7280';
      registro.colorLabel = registro.fuente;
    }

    // Detección de "negocio zombie" — si solo aparece en DENUE (datos oficiales de gobierno
    // que pueden estar desactualizados) y NO en ninguna fuente "viva" (Google, OSM, DDG)
    const fuentesVivas = [FUENTE.GOOGLE, FUENTE.OSM, FUENTE.DDG, FUENTE.BING];
    const tienePresenciaViva = registro.fuentes.some(f => fuentesVivas.includes(f));
    const soloDenue = registro.fuentes.length === 1 && registro.fuentes[0] === FUENTE.DENUE;

    if (soloDenue && !tienePresenciaViva) {
      registro.posibleZombie = true;
      registro.alertaZombie = 'Solo aparece en registros oficiales del INEGI. Puede haber cerrado. Verificar presencia en redes sociales.';
    } else if (registro.ultimaActividad === 'CLOSED_PERMANENTLY') {
      registro.posibleZombie = true;
      registro.alertaZombie = 'Google reporta este negocio como cerrado permanentemente.';
    } else {
      registro.posibleZombie = false;
    }
  }

  // Ordenar: mayor confianza primero, zombies al final
  fusionados.sort((a, b) => {
    if (a.posibleZombie !== b.posibleZombie) return a.posibleZombie ? 1 : -1;
    return b.numFuentes - a.numFuentes;
  });

  return fusionados;
}

// ─────────────────────────────────────────────────────────
//  Función principal: búsqueda multi-fuente
// ─────────────────────────────────────────────────────────
/**
 * Ejecuta búsqueda de competidores en paralelo en todas las fuentes disponibles,
 * cruza y deduplica los resultados con códigos de color por fuente.
 * 
 * Estrategia: APIs primero → Scraping conservador como fallback
 * 
 * @param {Object} opciones
 * @param {number} opciones.lat - Latitud del punto de búsqueda
 * @param {number} opciones.lng - Longitud del punto de búsqueda
 * @param {string} opciones.query - Término de búsqueda
 * @param {number} opciones.radius - Radio en metros (soporta >5000 con peticiones concéntricas)
 * @param {string} opciones.denueToken - Token del DENUE/INEGI
 * @param {string} opciones.googleApiKey - API Key de Google Places (opcional)
 * @param {string} opciones.bingApiKey - API Key de Bing Maps (opcional)
 * @returns {Promise<Object>} Resultados fusionados con metadata
 */
export async function busquedaMultiFuente({ lat, lng, query, radius = 2000, denueToken, googleApiKey, bingApiKey, allowSynthetic = false }) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  🕵️  AGENTE DE INVESTIGACIÓN DE MERCADO`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  📍 Coordenadas: ${lat}, ${lng}`);
  console.log(`  🔎 Búsqueda: "${query}"`);
  console.log(`  📏 Radio: ${radius}m ${radius > DENUE_MAX_RADIUS ? `(${Math.ceil(radius / DENUE_MAX_RADIUS)} peticiones concéntricas DENUE)` : ''}`);
  console.log(`  🔑 Fuentes disponibles:`);
  console.log(`     DENUE (INEGI): ${denueToken ? '✅' : '❌'}`);
  console.log(`     Google Places: ${googleApiKey ? '✅' : '⏭️  Usando gratuitas'}`);
  console.log(`     Bing Maps:     ${bingApiKey ? '✅' : '⏭️  Omitido'}`);
  console.log(`     OSM/Overpass:  ✅ (siempre activo)`);
  console.log(`     DuckDuckGo:    ✅ (siempre activo)`);
  console.log(`     Sintéticos:    ${allowSynthetic ? 'Autorizados' : 'Bloqueados (solo datos reales)'}`);
  console.log(`${'─'.repeat(60)}`);

  const inicio = Date.now();

  // Fase 1: Consultar APIs oficiales en paralelo
  const [resDenue, resOSM, resGoogle, resBing] = await Promise.allSettled([
    buscarDENUE(lat, lng, query, radius, denueToken),
    buscarOSM(lat, lng, query, radius),
    buscarGooglePlaces(lat, lng, query, radius, googleApiKey),
    buscarBingMaps(lat, lng, query, radius, bingApiKey),
  ]);

  // Fase 2: Fallback con scraping conservador (DuckDuckGo)
  await sleep(SCRAPING_DELAY_MS); // Rate limiting conservador
  const resDDG = await buscarDDG(lat, lng, query).then(r => ({ status: 'fulfilled', value: r })).catch(e => ({ status: 'rejected', reason: e }));

  const resultados = {
    denue: resDenue.status === 'fulfilled' ? resDenue.value : [],
    osm: resOSM.status === 'fulfilled' ? resOSM.value : [],
    google: resGoogle.status === 'fulfilled' ? resGoogle.value : [],
    bing: resBing.status === 'fulfilled' ? resBing.value : [],
    ddg: resDDG.status === 'fulfilled' ? resDDG.value : [],
  };

  console.log(`\n  📊 Resultados por fuente:`);
  console.log(`     🏛️  DENUE:   ${resultados.denue.length} establecimientos`);
  console.log(`     🗺️  OSM:     ${resultados.osm.length} POIs`);
  console.log(`     📍 Google:  ${resultados.google.length} places`);
  console.log(`     🔵 Bing:    ${resultados.bing.length} places`);
  console.log(`     🦆 DDG:     ${resultados.ddg.length} resultados web`);

  // Cruzar y deduplicar todas las fuentes
  let fusionados = cruzarResultados([
    resultados.denue,
    resultados.osm,
    resultados.google,
    resultados.bing,
    resultados.ddg,
  ]);

  // Si las APIs externas no devolvieron resultados suficientes:
  // Solo generar competidores sintéticos si allowSynthetic === true (ej. para InegiMap heatmap)
  if (fusionados.length < 4 && allowSynthetic) {
    console.log(`\n  ⚡ [Generador Geoespacial IA] Fuentes externas devolvieron ${fusionados.length} resultados. Generando competidores sintéticos para visualización...`);
    const sintetizados = generarCompetidoresSinteticos(lat, lng, query, 'Hermosillo, Sonora', 16);
    fusionados = [...fusionados, ...sintetizados];
  }

  const duracion = Date.now() - inicio;

  // Estadísticas de la fusión
  const stats = {
    total: fusionados.length,
    altaConfianza: fusionados.filter(f => f.confianza === 'alta').length,
    mediaConfianza: fusionados.filter(f => f.confianza === 'media').length,
    bajaConfianza: fusionados.filter(f => f.confianza === 'baja').length,
    posiblesZombies: fusionados.filter(f => f.posibleZombie).length,
  };

  console.log(`\n  ✅ Fusión completada en ${duracion}ms:`);
  console.log(`     📊 ${stats.total} registros únicos`);
  console.log(`     🟢 Alta confianza:  ${stats.altaConfianza}`);
  console.log(`     🟡 Media confianza: ${stats.mediaConfianza}`);
  console.log(`     🔴 Baja confianza:  ${stats.bajaConfianza}`);
  console.log(`     👻 Posibles zombies: ${stats.posiblesZombies}`);
  console.log(`${'═'.repeat(60)}\n`);

  return {
    success: fusionados.length > 0,
    total: fusionados.length,
    duracionMs: duracion,
    fuentesConsultadas: {
      denue: resultados.denue.length,
      osm: resultados.osm.length,
      google: resultados.google.length,
      bing: resultados.bing.length,
      ddg: resultados.ddg.length,
      ia_synthetic: fusionados.filter(f => f.fuente === FUENTE.IA).length,
    },
    coloresFuente: COLORES_FUENTE,
    estadisticas: stats,
    competidores: fusionados,
    reason: fusionados.length === 0 ? 'Sin competidores verificados en las fuentes consultadas' : undefined
  };
}

/**
 * Genera competidores sintéticos hiper-realistas basados en la ciudad y el giro
 */
export function generarCompetidoresSinteticos(centerLat, centerLng, query = '', cityName = 'Hermosillo, Sonora', count = 16) {
  const qClean = (query || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let defaultActivity = 'Servicios profesionales y comerciales';
  let nameTemplates = ['Centro Profesional de {giro}', 'Grupo {giro} del Noroeste', '{giro} Express', '{giro} y Soluciones Integrales', 'Especialistas en {giro} Master', '{giro} Prime', 'Corporativo {giro}'];

  if (qClean.includes('vet') || qClean.includes('mascot') || qClean.includes('animal') || qClean.includes('perr') || qClean.includes('gat')) {
    defaultActivity = 'Servicios veterinarios y cuidado de mascotas';
    nameTemplates = [
      'Clínica Veterinaria San Francisco',
      'Hospital Veterinario Pet Care 24/7',
      'Veterinaria y Estética Canina Huellitas',
      'Centro Médico Veterinario del Sol',
      'Veterinaria Animalia & Pet Shop',
      'Consultorio Veterinario La Mascota Feliz',
      'Hospital Veterinario Cruz Azul Animal',
      'Veterinaria Guadalupe & Cirugía',
      'Pet Clinic & Farmacia Veterinaria',
      'Veterinaria Integral del Noroeste',
      'Mundo Animal Clínica y Spa',
      'Veterinaria San Martín de Porres',
      'Amigos de 4 Patas Veterinaria',
      'Clínica Veterinaria El Rodeo',
      'Veterinaria Country Club Pets',
      'Doctor Mascotas Hospital Veterinario'
    ];
  } else if (qClean.includes('abarrot') || qClean.includes('tiend') || qClean.includes('super') || qClean.includes('viver')) {
    defaultActivity = 'Comercio al por menor en tiendas de abarrotes';
    nameTemplates = [
      'Super y Abarrotes El Güero',
      'Abarrotes y Frutería San Judas',
      'Mini Super La Esperanza',
      'Abarrotes y Carnicería Don Lupe',
      'Super Abarrotes del Río',
      'Tienda y Abarrotes La Guadalupana',
      'Abarrotes y Cremería La Fama',
      'Super Express Los Sauces',
      'Abarrotes y Novedades San José',
      'Abarrotes Mi Tiendita de la Esquina',
      'Mini Super y Frutería La Herradura',
      'Abarrotes y Carnes San Antonio',
      'Super del Barrio Abarrotes',
      'Abarrotes y Dulcería El Porvenir',
      'Abarrotes Las Palmas',
      'Super y Ultramarinos Reforma'
    ];
  } else if (qClean.includes('manten') || qClean.includes('ferret') || qClean.includes('taller') || qClean.includes('herram') || qClean.includes('electr')) {
    defaultActivity = 'Servicios de reparación y mantenimiento residencial e industrial';
    nameTemplates = [
      'MultiServicios y Mantenimiento Express',
      'Técnicos Unidos Mantenimiento Residencial',
      'Mantenimiento e Instalaciones ProMaster',
      'Soluciones Técnicas y Mantenimiento del Norte',
      'Mantenimiento Eléctrico y Plomería Integral',
      'Servicios de Climas y Mantenimiento Refrigeración',
      'Expertos en Mantenimiento y Pintura Total',
      'Mantenimiento Preventivo y Correctivo Industrial',
      'Taller de Mantenimiento y Herrería El Roble',
      'Servicios Integrales de Mantenimiento FixIt',
      'Mantenimiento General y Acabados de Sonora',
      'Grupo MantenPro Ingeniería y Soporte',
      'Mantenimiento y Reparación Hogar Seguro',
      'Técnicos en Mantenimiento Hidráulico y Gas',
      'Mantenimiento Express y Climas Fríos',
      'Mantenimiento y Remodelaciones del Valle'
    ];
  }

  const streetNames = [
    'Blvd. Luis Encinas #402', 'Av. Morelos #128', 'Calle Benito Juárez #89', 'Blvd. Kino #510',
    'Calle Reforma #230', 'Av. Revolución #45', 'Blvd. Solidaridad #1105', 'Calle Rosales #67',
    'Av. Serdán #312', 'Blvd. Rodríguez #780', 'Calle Matamoros #15', 'Av. Veracruz #540',
    'Blvd. Progreso #890', 'Calle Garmendia #112', 'Av. Sonora #204', 'Blvd. García Morales #650'
  ];

  const cityBase = cityName ? cityName.split(',')[0].trim() : 'Hermosillo';

  const syntheticList = [];
  for (let i = 0; i < count; i++) {
    const rawName = nameTemplates[i % nameTemplates.length];
    const name = rawName.includes('{giro}') ? rawName.replace('{giro}', query || 'Comercial') : rawName;
    const street = streetNames[i % streetNames.length];
    
    // Distribuir en un radio de 300m a 2800m
    const angle = (2 * Math.PI * i) / count + (Math.random() * 0.4 - 0.2);
    const distMeters = 400 + Math.random() * 2200;
    
    const dLat = (distMeters * Math.cos(angle)) / 111320;
    const dLng = (distMeters * Math.sin(angle)) / (111320 * Math.cos((centerLat * Math.PI) / 180));
    
    const pLat = Number((centerLat + dLat).toFixed(6));
    const pLng = Number((centerLng + dLng).toFixed(6));
    
    const distKm = Number((distMeters / 1000).toFixed(1));
    const rating = Number((3.6 + Math.random() * 1.3).toFixed(1));
    const reviews = Math.floor(18 + Math.random() * 190);
    const priceLevel = rating > 4.4 ? '$$$' : (rating > 4.0 ? '$$' : '$');
    
    syntheticList.push({
      id: `syn-${i + 1}`,
      nombre: name,
      actividad: defaultActivity,
      direccion: `${street}, ${cityBase}`,
      lat: pLat,
      lng: pLng,
      telefono: `(662) ${Math.floor(200 + Math.random() * 700)}-${Math.floor(1000 + Math.random() * 8999)}`,
      correo: `contacto@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.mx`,
      web: `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.mx`,
      estrato: '1 a 10 personas',
      fuente: FUENTE.IA,
      color: COLORES_FUENTE[FUENTE.IA],
      confianza: CONFIANZA.BAJA,
      provenance: 'synthetic',
      numFuentes: 1,
      rating,
      reviews,
      horarios: 'Lun-Sáb: 08:00 - 19:00',
      precioRango: priceLevel,
      distanciaKm: distKm,
      posibleZombie: false
    });
  }

  return syntheticList;
}

// ─────────────────────────────────────────────────────────
//  Análisis de viabilidad de mercado
// ─────────────────────────────────────────────────────────
/**
 * Analiza la viabilidad de lanzar un producto/servicio en una zona específica.
 * Cruza datos de competidores con indicadores socioeconómicos del INEGI.
 * @param {Object} opciones
 * @param {Array} opciones.competidores - Lista de competidores fusionados
 * @param {Object} opciones.indicadores - Datos de indicadores INEGI
 * @param {number} opciones.precioProducto - Precio del producto/servicio
 * @param {number} opciones.radioKm - Radio de análisis en km
 * @returns {Object} Análisis de viabilidad con score 0-100
 */
export function analizarViabilidad({ competidores = [], indicadores = {}, precioProducto = 0, radioKm = 2 }) {
  const numCompetidores = competidores.length;
  const activos = competidores.filter(c => !c.posibleZombie);
  const zombies = competidores.filter(c => c.posibleZombie);
  const competidoresConRating = activos.filter(c => c.rating);
  const ratingPromedio = competidoresConRating.length > 0
    ? competidoresConRating.reduce((sum, c) => sum + c.rating, 0) / competidoresConRating.length
    : null;

  // Densidad competitiva (solo negocios activos)
  const areaBusquedaKm2 = Math.PI * (radioKm ** 2);
  const densidadCompetidores = activos.length / areaBusquedaKm2;

  let saturacion;
  let saturacionScore;
  if (densidadCompetidores > 20) { saturacion = 'alta'; saturacionScore = 90; }
  else if (densidadCompetidores > 10) { saturacion = 'media-alta'; saturacionScore = 70; }
  else if (densidadCompetidores > 5) { saturacion = 'media'; saturacionScore = 50; }
  else if (densidadCompetidores > 2) { saturacion = 'baja'; saturacionScore = 30; }
  else { saturacion = 'muy baja'; saturacionScore = 10; }

  // Asequibilidad
  let asequibilidad = null;
  if (indicadores?.ingresoMensualPromedio && precioProducto > 0) {
    const porcentajeIngreso = (precioProducto / indicadores.ingresoMensualPromedio) * 100;
    if (porcentajeIngreso > 30) {
      asequibilidad = { nivel: 'inaccesible', porcentajeIngreso, alerta: `El producto representa ${porcentajeIngreso.toFixed(1)}% del ingreso mensual promedio. Muy alto para la zona.` };
    } else if (porcentajeIngreso > 15) {
      asequibilidad = { nivel: 'difícil', porcentajeIngreso, alerta: `El producto representa ${porcentajeIngreso.toFixed(1)}% del ingreso. Posible pero difícil.` };
    } else if (porcentajeIngreso > 5) {
      asequibilidad = { nivel: 'accesible', porcentajeIngreso, alerta: `Representa ${porcentajeIngreso.toFixed(1)}% del ingreso. Accesible para la mayoría.` };
    } else {
      asequibilidad = { nivel: 'muy accesible', porcentajeIngreso, alerta: `Solo ${porcentajeIngreso.toFixed(1)}% del ingreso. Muy accesible.` };
    }
  }

  // Score de viabilidad (0-100)
  let viabilidadScore = 50;
  if (activos.length === 0) viabilidadScore += 10;
  else if (activos.length <= 5) viabilidadScore += 20;
  else if (activos.length <= 15) viabilidadScore += 5;
  else viabilidadScore -= 15;

  if (ratingPromedio !== null && ratingPromedio < 3.5) viabilidadScore += 10;

  if (asequibilidad) {
    if (asequibilidad.nivel === 'inaccesible') viabilidadScore -= 30;
    else if (asequibilidad.nivel === 'difícil') viabilidadScore -= 10;
    else if (asequibilidad.nivel === 'accesible') viabilidadScore += 10;
    else viabilidadScore += 15;
  }

  // Bonus: si hay muchos zombies, hay espacio
  if (zombies.length > 3) viabilidadScore += 5;

  viabilidadScore = Math.max(0, Math.min(100, viabilidadScore));

  let veredicto;
  if (viabilidadScore >= 70) veredicto = '🟢 Viable — Buena oportunidad de mercado';
  else if (viabilidadScore >= 45) veredicto = '🟡 Moderado — Posible con estrategia adecuada';
  else veredicto = '🔴 Riesgoso — Condiciones desfavorables';

  return {
    viabilidadScore,
    veredicto,
    competencia: {
      total: numCompetidores,
      activos: activos.length,
      posiblesZombies: zombies.length,
      densidadPorKm2: Math.round(densidadCompetidores * 100) / 100,
      saturacion,
      saturacionScore,
      ratingPromedio: ratingPromedio ? Math.round(ratingPromedio * 10) / 10 : null,
    },
    asequibilidad,
    recomendaciones: generarRecomendaciones(activos.length, zombies.length, saturacion, asequibilidad, ratingPromedio),
  };
}

function generarRecomendaciones(numActivos, numZombies, saturacion, asequibilidad, ratingPromedio) {
  const recomendaciones = [];

  if (numActivos === 0) {
    recomendaciones.push('📌 No se encontraron competidores activos. Investiga si hay demanda real antes de invertir.');
  }
  if (numZombies > 3) {
    recomendaciones.push(`👻 Se detectaron ${numZombies} negocios posiblemente cerrados. Puede indicar que el mercado es difícil en esta zona.`);
  }
  if (saturacion === 'alta' || saturacion === 'media-alta') {
    recomendaciones.push('⚡ Zona saturada. Diferénciate con un servicio superior o un nicho específico.');
  }
  if (asequibilidad && asequibilidad.nivel === 'inaccesible') {
    recomendaciones.push('💰 Precio muy alto para el ingreso de la zona. Ajusta precio o busca zona de mayor poder adquisitivo.');
  }
  if (asequibilidad && asequibilidad.nivel === 'difícil') {
    recomendaciones.push('💳 Producto caro para la zona. Implementa planes de pago o financiamiento.');
  }
  if (ratingPromedio !== null && ratingPromedio < 3.5) {
    recomendaciones.push('⭐ La competencia tiene bajo rating. Oportunidad de captar clientes insatisfechos.');
  }
  if (ratingPromedio !== null && ratingPromedio > 4.5) {
    recomendaciones.push('🏆 Competencia con alto rating. Necesitarás un diferenciador fuerte.');
  }

  if (recomendaciones.length === 0) {
    recomendaciones.push('✅ Condiciones favorables. Asegura buena estrategia de marketing local.');
  }

  return recomendaciones;
}
