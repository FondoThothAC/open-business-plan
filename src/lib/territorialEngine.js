/**
 * Motor de Geointeligencia Territorial, Clientes Potenciales B2B y Ubicación Óptima
 * Fondo Thoth AC — Open Business Plan
 * 
 * Funciones:
 * 1. Estimación de Facturación Anual basada en Estrato de Personal y Censo Económico INEGI.
 * 2. Cálculo de Ubicación Óptima (Centroide Ponderado por Demanda y Empleados).
 * 3. Clasificación y Matriz B2B (Competidores Directos, Clientes Potenciales, Proveedores).
 */

// Matriz de Facturación Promedio Anual (Censo Económico INEGI por Sector y Estrato de Empleados)
export const MATRIZ_FACTURACION_INEGI = {
  // Sector 21: Minería
  '21': {
    nombre: 'Minería y Extracción',
    estratos: {
      '0 a 5 personas': { min: 3500000, max: 12000000, avg: 6500000, personalPromedio: 3 },
      '6 a 10 personas': { min: 12000000, max: 35000000, avg: 22000000, personalPromedio: 8 },
      '11 a 30 personas': { min: 35000000, max: 120000000, avg: 70000000, personalPromedio: 20 },
      '31 a 50 personas': { min: 120000000, max: 280000000, avg: 180000000, personalPromedio: 40 },
      '51 a 100 personas': { min: 280000000, max: 650000000, avg: 450000000, personalPromedio: 75 },
      '101 a 250 personas': { min: 650000000, max: 1800000000, avg: 1100000000, personalPromedio: 175 },
      '251 y más personas': { min: 1800000000, max: 15000000000, avg: 4500000000, personalPromedio: 500 }
    }
  },
  // Sector 23: Construcción y Maquinaria Pesada
  '23': {
    nombre: 'Construcción y Obras de Ingeniería',
    estratos: {
      '0 a 5 personas': { min: 1200000, max: 4500000, avg: 2500000, personalPromedio: 3 },
      '6 a 10 personas': { min: 4500000, max: 15000000, avg: 8500000, personalPromedio: 8 },
      '11 a 30 personas': { min: 15000000, max: 48000000, avg: 28000000, personalPromedio: 20 },
      '31 a 50 personas': { min: 48000000, max: 110000000, avg: 72000000, personalPromedio: 40 },
      '51 a 100 personas': { min: 110000000, max: 280000000, avg: 180000000, personalPromedio: 75 },
      '101 a 250 personas': { min: 280000000, max: 750000000, avg: 450000000, personalPromedio: 175 },
      '251 y más personas': { min: 750000000, max: 4500000000, avg: 1600000000, personalPromedio: 500 }
    }
  },
  // Sector 31-33: Industrias Manufactureras (Maquinaria, Hidráulica, Metalmecánica)
  '33': {
    nombre: 'Industria Manufacturera y Metalmecánica',
    estratos: {
      '0 a 5 personas': { min: 1500000, max: 5500000, avg: 3000000, personalPromedio: 3 },
      '6 a 10 personas': { min: 5500000, max: 18000000, avg: 10500000, personalPromedio: 8 },
      '11 a 30 personas': { min: 18000000, max: 60000000, avg: 35000000, personalPromedio: 20 },
      '31 a 50 personas': { min: 60000000, max: 140000000, avg: 90000000, personalPromedio: 40 },
      '51 a 100 personas': { min: 140000000, max: 320000000, avg: 210000000, personalPromedio: 75 },
      '101 a 250 personas': { min: 320000000, max: 950000000, avg: 550000000, personalPromedio: 175 },
      '251 y más personas': { min: 950000000, max: 6000000000, avg: 2200000000, personalPromedio: 500 }
    }
  },
  // Sector 48-49: Transporte, Grúas, Carga y Logística
  '48': {
    nombre: 'Transporte, Carga y Servicios de Grúas',
    estratos: {
      '0 a 5 personas': { min: 900000, max: 3800000, avg: 2100000, personalPromedio: 3 },
      '6 a 10 personas': { min: 3800000, max: 12000000, avg: 7200000, personalPromedio: 8 },
      '11 a 30 personas': { min: 12000000, max: 38000000, avg: 22000000, personalPromedio: 20 },
      '31 a 50 personas': { min: 38000000, max: 85000000, avg: 55000000, personalPromedio: 40 },
      '51 a 100 personas': { min: 85000000, max: 200000000, avg: 130000000, personalPromedio: 75 },
      '101 a 250 personas': { min: 200000000, max: 550000000, avg: 340000000, personalPromedio: 175 },
      '251 y más personas': { min: 550000000, max: 2800000000, avg: 1100000000, personalPromedio: 500 }
    }
  },
  // Sector 46: Comercio al por mayor (Maquinaria, refacciones y equipo)
  '46': {
    nombre: 'Comercio Mayorista de Equipo y Maquinaria',
    estratos: {
      '0 a 5 personas': { min: 1800000, max: 7000000, avg: 3800000, personalPromedio: 3 },
      '6 a 10 personas': { min: 7000000, max: 24000000, avg: 14000000, personalPromedio: 8 },
      '11 a 30 personas': { min: 24000000, max: 75000000, avg: 42000000, personalPromedio: 20 },
      '31 a 50 personas': { min: 75000000, max: 160000000, avg: 105000000, personalPromedio: 40 },
      '51 a 100 personas': { min: 160000000, max: 380000000, avg: 240000000, personalPromedio: 75 },
      '101 a 250 personas': { min: 380000000, max: 1100000000, avg: 620000000, personalPromedio: 175 },
      '251 y más personas': { min: 1100000000, max: 5000000000, avg: 1900000000, personalPromedio: 500 }
    }
  },
  // General / Default Multisectorial
  'default': {
    nombre: 'Servicios y Comercio General',
    estratos: {
      '0 a 5 personas': { min: 600000, max: 2500000, avg: 1400000, personalPromedio: 3 },
      '6 a 10 personas': { min: 2500000, max: 7500000, avg: 4500000, personalPromedio: 8 },
      '11 a 30 personas': { min: 7500000, max: 24000000, avg: 14000000, personalPromedio: 20 },
      '31 a 50 personas': { min: 24000000, max: 55000000, avg: 36000000, personalPromedio: 40 },
      '51 a 100 personas': { min: 55000000, max: 130000000, avg: 85000000, personalPromedio: 75 },
      '101 a 250 personas': { min: 130000000, max: 350000000, avg: 210000000, personalPromedio: 175 },
      '251 y más personas': { min: 350000000, max: 1800000000, avg: 750000000, personalPromedio: 500 }
    }
  }
};

/**
 * Estima la facturación anual y personal promedio con base en el estrato y código SCIAN.
 */
export function estimateBusinessMetrics(estratoStr = '', scianCode = '') {
  const estratoNormalizado = (estratoStr || '').trim();
  const sectorKey = Object.keys(MATRIZ_FACTURACION_INEGI).find(k => k !== 'default' && (scianCode || '').startsWith(k)) || 'default';
  const sectorData = MATRIZ_FACTURACION_INEGI[sectorKey] || MATRIZ_FACTURACION_INEGI.default;

  // Buscar coincidencia en la clave de estratos
  const matchKey = Object.keys(sectorData.estratos).find(k => estratoNormalizado.includes(k) || k.includes(estratoNormalizado)) || '0 a 5 personas';
  const metrics = sectorData.estratos[matchKey] || sectorData.estratos['0 a 5 personas'];

  return {
    sectorNombre: sectorData.nombre,
    estrato: matchKey,
    empleadosEstimados: metrics.personalPromedio,
    facturacionAnualEstimadaMin: metrics.min,
    facturacionAnualEstimadaMax: metrics.max,
    facturacionAnualEstimadaPromedio: metrics.avg,
    facturacionMensualEstimadaPromedio: Math.round(metrics.avg / 12),
    facturacionFormateada: `$${(metrics.avg / 1000000).toFixed(1)}M MXN/año`
  };
}

/**
 * Clasifica si un establecimiento del DENUE actúa como Competidor, Cliente Potencial B2B o Proveedor.
 */
export function classifyEstablishmentType(item = {}, targetKeywords = '', targetSector = '') {
  const nombre = (item.nombre || item.Nombre || '').toLowerCase();
  const actividad = (item.actividad || item.Clase_actividad || item.tipoEstablecimiento || '').toLowerCase();
  const keywordsLower = (targetKeywords || '').toLowerCase();

  // Palabras clave de clientes B2B para sectores de minería, hidráulica, carga y construcción
  const clientClues = ['mina', 'minera', 'mineria', 'constructora', 'construccion', 'grúa', 'gruas', 'transporte de carga', 'fletes', 'maquinaria', 'concreto', 'obra civil', 'perforacion', 'triturados', 'cantera'];
  const competitorClues = ['mangueras', 'hidraulica', 'hidráulica', 'sellos hidraulicos', 'conexiones hidraulicas', 'reparacion hidraulica', 'suministros industriales'];
  const supplierClues = ['acero', 'distribuidora mayorista', 'importadora', 'ferreteria industrial', 'lubricantes', 'aceites industriales'];

  let esCompetidor = false;
  let esCliente = false;
  let esProveedor = false;

  if (competitorClues.some(c => nombre.includes(c) || actividad.includes(c))) {
    esCompetidor = true;
  }
  if (clientClues.some(c => nombre.includes(c) || actividad.includes(c))) {
    esCliente = true;
  }
  if (supplierClues.some(s => nombre.includes(s) || actividad.includes(s))) {
    esProveedor = true;
  }

  // Si no coincide con las listas fijas, evaluar si comparte palabras del giro
  if (!esCompetidor && !esCliente && keywordsLower) {
    const words = keywordsLower.split(/\s+/).filter(w => w.length > 3);
    const matches = words.some(w => nombre.includes(w) || actividad.includes(w));
    if (matches) esCompetidor = true;
  }

  // Si es minería / construcción grande, priorizar como Cliente Potencial B2B
  if (actividad.includes('minería') || actividad.includes('construcción') || actividad.includes('autotransporte')) {
    esCliente = true;
  }

  let tipo = 'Cliente Potencial B2B';
  let categoria = 'cliente_b2b';
  let color = '#3b82f6'; // Azul

  if (esCompetidor && !esCliente) {
    tipo = 'Competidor Directo';
    categoria = 'competidor';
    color = '#ef4444'; // Rojo
  } else if (esProveedor && !esCliente) {
    tipo = 'Cadena de Suministro / Proveedor';
    categoria = 'proveedor';
    color = '#10b981'; // Verde
  } else if (esCliente) {
    tipo = 'Cliente Potencial B2B';
    categoria = 'cliente_b2b';
    color = '#8b5cf6'; // Morado / Violeta
  }

  return { tipo, categoria, color };
}

/**
 * Calcula la distancia en kilómetros entre dos coordenadas geográficas (Haversine).
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 100) / 100;
}

/**
 * Calcula la Ubicación Óptima (Centroide Ponderado por Empleados y Demanda).
 * 
 * La fórmula minimiza la distancia total ponderada hacia los clientes potenciales
 * y empresas que concentran mayor personal y actividad.
 */
export function calculateOptimalLocation(establishments = [], maxRadiusKm = 5) {
  if (!establishments || establishments.length === 0) {
    return null;
  }

  const validItems = establishments.filter(e => {
    const lat = Number(e.lat || e.Latitud);
    const lng = Number(e.lng || e.Longitud);
    return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
  });

  if (validItems.length === 0) return null;

  let totalWeight = 0;
  let weightedLatSum = 0;
  let weightedLngSum = 0;
  let totalEstimatedEmployees = 0;
  let totalEstimatedRevenue = 0;

  validItems.forEach(item => {
    const lat = Number(item.lat || item.Latitud);
    const lng = Number(item.lng || item.Longitud);
    const metrics = estimateBusinessMetrics(item.estrato || item.Estrato, item.scianClase || item.scian || '');
    
    // Peso proporcional a la escala de la empresa (mínimo 1, proporcional a empleados)
    const weight = Math.max(1, Math.sqrt(metrics.empleadosEstimados || 3));

    totalWeight += weight;
    weightedLatSum += lat * weight;
    weightedLngSum += lng * weight;

    totalEstimatedEmployees += metrics.empleadosEstimados;
    totalEstimatedRevenue += metrics.facturacionAnualEstimadaPromedio;
  });

  const optimalLat = weightedLatSum / totalWeight;
  const optimalLng = weightedLngSum / totalWeight;

  // Calcular métricas de cobertura alrededor del punto óptimo
  let clientsWithinRadius = 0;
  let competitorsWithinRadius = 0;
  let totalNearbyRevenue = 0;

  validItems.forEach(item => {
    const lat = Number(item.lat || item.Latitud);
    const lng = Number(item.lng || item.Longitud);
    const dist = calculateDistanceKm(optimalLat, optimalLng, lat, lng);
    item.distanciaPuntoOptimoKm = dist;

    if (dist <= maxRadiusKm) {
      const { categoria } = classifyEstablishmentType(item);
      const metrics = estimateBusinessMetrics(item.estrato || item.Estrato, item.scianClase || '');
      
      if (categoria === 'cliente_b2b') clientsWithinRadius++;
      if (categoria === 'competidor') competitorsWithinRadius++;
      totalNearbyRevenue += metrics.facturacionAnualEstimadaPromedio;
    }
  });

  return {
    optimalCoords: {
      lat: Math.round(optimalLat * 100000) / 100000,
      lng: Math.round(optimalLng * 100000) / 100000
    },
    totalAnalyzed: validItems.length,
    radiusKm: maxRadiusKm,
    clientsWithinRadius,
    competitorsWithinRadius,
    totalNearbyRevenue,
    totalNearbyRevenueFormatted: `$${(totalNearbyRevenue / 1000000).toFixed(1)}M MXN`,
    totalEstimatedEmployees,
    scoreAccesibilidad: clientsWithinRadius >= 3 ? 'Óptima (Clúster Activo)' : 'Media (Zona en Desarrollo)',
    recomendacionOperativa: `Ubicarse en este centroide ponderado permite dar cobertura en menos de ${(maxRadiusKm * 2.5).toFixed(0)} minutos a ${clientsWithinRadius} clientes industriales/mineros clave en un radio de ${maxRadiusKm} km.`
  };
}
