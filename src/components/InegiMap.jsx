import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Search, RefreshCw, AlertTriangle, Save, Check, Building2, Users } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { getApiBase } from '../config/apiConfig';
import { callAiProvider } from '../lib/ai';
import { useParams } from 'react-router-dom';
import { SCIAN_PRESETS } from '../config/scian';
import { getAutoRadius } from '../config/clasificacionesIndustriales';
import { estimateBusinessMetrics, classifyEstablishmentType, calculateOptimalLocation } from '../lib/territorialEngine';

const DEFAULT_CENTER = {
  label: 'Hermosillo, Sonora',
  lat: 29.072967,
  lng: -110.955919
};

const toFixedSafe = (v, d = 1, fallback = 'N/D') => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(d) : fallback;
};

export const SONORA_MINING_CLUSTERS = [
  { id: 'all', name: '🗺️ Todo Sonora', label: 'Corredor Minero e Industrial de Sonora', lat: 29.6, lng: -110.6, zoom: 7.3, desc: 'Vista Panorámica Estatal' },
  { id: 'hermosillo', name: '📍 Hermosillo (Taller)', label: 'Hermosillo (Taller Central & Clean Room)', lat: 29.072967, lng: -110.955919, zoom: 12.5, desc: 'Taller Central de Remanufactura' },
  { id: 'cananea', name: '⛏️ Cananea', label: 'Cananea (Buenavista del Cobre / Grupo México)', lat: 30.9856, lng: -110.2974, zoom: 12, desc: 'Pala Mecánica y Camiones 797' },
  { id: 'nacozari', name: '⛏️ Nacozari', label: 'Nacozari (La Caridad / Grupo México)', lat: 30.3739, lng: -109.6897, zoom: 12, desc: 'Trituración y Concentradora' },
  { id: 'caborca', name: '⛏️ Caborca', label: 'Caborca (La Herradura / Peñoles)', lat: 30.7167, lng: -112.15, zoom: 12, desc: 'Mina Lixiviación y Excavadoras' },
  { id: 'guaymas', name: '🚢 Guaymas', label: 'Guaymas (Puerto Logístico)', lat: 27.9178, lng: -110.8988, zoom: 12, desc: 'Nodo Portuario de Aceros y Sellos' }
];

const SON_MUNS = [
  "Hermosillo", "Cajeme", "Nogales", "Guaymas", "Navojoa", "Caborca", "Agua Prieta", 
  "Empalme", "Huatabampo", "Etchojoa", "Puerto Peñasco", "Cananea", "Magdalena", 
  "Altar", "Alamos", "Bácum", "Banámichi", "Bacoachi", "Arizpe", "Aconchi", "Ures",
  "San Luis Río Colorado", "Nacozari de García", "Pitiquito", "Sahuaripa", "Yécora"
];

function haversineKm(aLat, aLng, bLat, bLng) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const aa = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)));
}

function extractMunicipality(displayName) {
  if (!displayName) return 'Hermosillo';
  const cleanDisplay = displayName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  
  for (const mun of SON_MUNS) {
    const normMun = mun.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (cleanDisplay.includes(normMun)) {
      return mun;
    }
  }
  return 'Hermosillo';
}

function calculatePolygonAreaKm2(coords) {
  if (!coords || coords.length < 3) return 0;
  let area = 0;
  const R = 6371; // Earth radius in km
  const toRad = x => x * Math.PI / 180;
  
  let sumLat = 0;
  for (let i = 0; i < coords.length; i++) {
    sumLat += coords[i][1];
  }
  const avgLatRad = toRad(sumLat / coords.length);
  const cosLat = Math.cos(avgLatRad);
  
  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    
    const x1 = R * toRad(p1[0]) * cosLat;
    const y1 = R * toRad(p1[1]);
    const x2 = R * toRad(p2[0]) * cosLat;
    const y2 = R * toRad(p2[1]);
    
    area += (x1 * y2 - x2 * y1);
  }
  return Math.abs(area) / 2;
}

export default function InegiMap({
  token,
  location = '',
  title = 'Mapa de Competencia (INEGI / DENUE)',
  initialKeywords = 'finanzas asesoría seguros crédito inversión',
  mode = 'competition',
  readOnly = false,
  defaultHeatmap = false,
  defaultScian = '0',
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersSourceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const heatmapLayerRef = useRef(null);
  const polygonSourceRef = useRef(null);
  const drawInteractionRef = useRef(null);

  const { planData, updateSection, manualSaveProject } = usePlan();
  const { pillarId, moduleId } = useParams();

  const [queryLocation, setQueryLocation] = useState(location || DEFAULT_CENTER.label);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [scian, setScian] = useState(defaultScian || '0');
  const [radius, setRadius] = useState(2500);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [selectedCluster, setSelectedCluster] = useState('hermosillo');
  const [businesses, setBusinesses] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonCoords, setPolygonCoords] = useState(null);
  const [clientLoc, setClientLoc] = useState('Hermosillo, Sonora');
  const [supplierLoc, setSupplierLoc] = useState('Hermosillo, Sonora');
  const [manualCompetitors, setManualCompetitors] = useState('');
  const [effectiveness, setEffectiveness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [useOfficialIframe, setUseOfficialIframe] = useState(false);

  // Advanced demographic, market intelligence & heatmap states
  const [munData, setMunData] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(defaultHeatmap);

  useEffect(() => {
    setShowHeatmap(defaultHeatmap);
  }, [defaultHeatmap]);

  useEffect(() => {
    setScian(defaultScian || '0');
  }, [defaultScian]);
  const [activeTab, setActiveTab] = useState('demografia');
  const [precioProducto, setPrecioProducto] = useState(500);
  const [viabilityData, setViabilityData] = useState(null);
  const [searchStats, setSearchStats] = useState(null);
  const [_coloresFuente, setColoresFuente] = useState({});

  // Estados para Geointeligencia Territorial B2B y Ubicación Óptima
  const [b2bFilter, setB2bFilter] = useState('todos'); // 'todos', 'competidores', 'clientes_b2b', 'proveedores'
  const [optimalLocationData, setOptimalLocationData] = useState(null);
  const [optimalMaxRadiusKm, _setOptimalMaxRadiusKm] = useState(5);
  const [showOptimalPoint, setShowOptimalPoint] = useState(true);

  // Estados para el Análisis Profundo
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichedData, setEnrichedData] = useState(null);
  const [aiSwotAnalysis, setAiSwotAnalysis] = useState(null);
  const [showEnrichModal, setShowEnrichModal] = useState(false);  // Cargar módulos importados dinámicamente
  const [indicadoresService, setIndicadoresService] = useState(null);
  const [inegiService, setInegiService] = useState(null);

  useEffect(() => {
    import('../lib/indicadoresInegi').then(m => setIndicadoresService(m));
    import('../lib/inegi').then(m => setInegiService(m));
  }, []);

  const canSearch = useMemo(() => Number(radius) > 0, [radius]);

  // Auto-ajustar el radio de búsqueda según el giro seleccionado
  useEffect(() => {
    if (scian !== '0') {
      const autoRadius = getAutoRadius(scian);
      setRadius(autoRadius);
    }
  }, [scian]);

  // Proyecciones demográficas basadas en datos consolidados de INEGI
  const localEstimates = useMemo(() => {
    if (!munData) return null;

    let areaKm2;
    if (polygonCoords) {
      areaKm2 = calculatePolygonAreaKm2(polygonCoords);
    } else {
      areaKm2 = Math.PI * (Number(radius) / 1000) * (Number(radius) / 1000);
    }
    areaKm2 = Math.max(0.01, areaKm2);

    const totalMunBus = munData.unidades_economicas || 1000;
    const munArea = munData.superficie_km2 || 1000;
    const densityMunBus = totalMunBus / munArea;
    const localBusinessesCount = businesses.length;
    const densityLocalBus = localBusinessesCount / areaKm2;
    
    const concentrationFactor = densityLocalBus > 0 
      ? Math.max(1.0, Math.min(50.0, densityLocalBus / densityMunBus)) 
      : 1.0;

    const munDensity = munData.densidad_poblacion_km2 || 60;
    
    let estimatedPop = areaKm2 * munDensity * concentrationFactor;
    if (munDensity < 200 && densityLocalBus > 4) {
      estimatedPop = areaKm2 * 3200 * Math.min(2.5, densityLocalBus / 12.0);
    }
    estimatedPop = Math.max(15, Math.round(estimatedPop));

    const averageHouseholdSize = munData.tamano_hogar_promedio || 3.3;
    const estimatedHouseholds = Math.max(5, Math.round(estimatedPop / averageHouseholdSize));

    const avgIncome = munData.ingreso_promedio_mensual_hogar || 21600;
    const avgExpenditure = munData.gasto_promedio_mensual_hogar || 15500;

    const localMarketSizeMonthly = estimatedHouseholds * avgExpenditure;

    return {
      areaKm2,
      estimatedPop,
      estimatedHouseholds,
      avgIncome,
      avgExpenditure,
      localMarketSizeMonthly,
      densityLocalBus
    };
  }, [munData, businesses, polygonCoords, radius]);

  const [olLoaded, setOlLoaded] = useState(() => typeof window !== 'undefined' && Boolean(window.ol));
  const [olError, setOlError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ol) {
      setOlLoaded(true);
      return;
    }

    const scriptId = 'openlayers-script';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/build/ol.js';
      script.onload = () => setOlLoaded(true);
      script.onerror = () => setOlError(true);
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/css/ol.css';
      document.head.appendChild(link);
    } else {
      const checkOl = setInterval(() => {
        if (window.ol) {
          setOlLoaded(true);
          clearInterval(checkOl);
        }
      }, 100);
      setTimeout(() => clearInterval(checkOl), 10000);
    }
  }, []);

  useEffect(() => {
    if (!olLoaded || mapInstance.current || !mapRef.current) return;

    const baseLayer = new window.ol.layer.Tile({
      source: new window.ol.source.OSM({
        crossOrigin: 'anonymous'
      })
    });

    const markerSource = new window.ol.source.Vector();
    markersSourceRef.current = markerSource;

    const markerLayer = new window.ol.layer.Vector({
      source: markerSource,
      style: new window.ol.style.Style({
        image: new window.ol.style.Circle({
          radius: 6,
          fill: new window.ol.style.Fill({ color: '#ef4444' }),
          stroke: new window.ol.style.Stroke({ color: '#ffffff', width: 2 })
        })
      })
    });
    markersLayerRef.current = markerLayer;

    const heatmapLayer = new window.ol.layer.Heatmap({
      source: markerSource,
      blur: 24,
      radius: 18,
      weight: function (feature) {
        if (feature.get('isMain')) return 0.0;
        return feature.get('weight') || 0.85;
      }
    });
    heatmapLayerRef.current = heatmapLayer;

    markerLayer.setVisible(!showHeatmap);
    heatmapLayer.setVisible(showHeatmap);

    const polygonSource = new window.ol.source.Vector();
    polygonSourceRef.current = polygonSource;

    const polygonLayer = new window.ol.layer.Vector({
      source: polygonSource,
      style: new window.ol.style.Style({
        fill: new window.ol.style.Fill({
          color: 'rgba(99, 102, 241, 0.15)'
        }),
        stroke: new window.ol.style.Stroke({
          color: '#6366f1',
          width: 2.5
        })
      })
    });

    mapInstance.current = new window.ol.Map({
      target: mapRef.current,
      layers: [baseLayer, markerLayer, heatmapLayer, polygonLayer],
      view: new window.ol.View({
        center: window.ol.proj.fromLonLat([DEFAULT_CENTER.lng, DEFAULT_CENTER.lat]),
        zoom: 12,
      }),
    });

    setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.updateSize();
      }
    }, 400);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(null);
        mapInstance.current = null;
      }
    };
  }, [olLoaded]);

  useEffect(() => {
    if (markersLayerRef.current && heatmapLayerRef.current) {
      markersLayerRef.current.setVisible(!showHeatmap);
      heatmapLayerRef.current.setVisible(showHeatmap);
    }
  }, [showHeatmap]);

  const setMapCenter = (lat, lng, zoom = 12) => {
    const map = mapInstance.current;
    if (!map || !window.ol) return;
    map.getView().animate({ center: window.ol.proj.fromLonLat([lng, lat]), zoom, duration: 550 });
    
    setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.updateSize();
      }
    }, 600);
  };

  const isPointInPolygon = (point, vs) => {
    if (!vs || vs.length === 0) return false;
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const startDrawing = () => {
    const map = mapInstance.current;
    if (!map || !window.ol) return;

    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
    }

    polygonSourceRef.current.clear();
    setPolygonCoords(null);

    const draw = new window.ol.interaction.Draw({
      source: polygonSourceRef.current,
      type: 'Polygon',
    });

    drawInteractionRef.current = draw;
    map.addInteraction(draw);
    setIsDrawing(true);
    setStatus('Agente Trazando: Haz clic en el mapa para añadir vértices. Doble clic para terminar el polígono.');

    draw.on('drawend', (event) => {
      const feature = event.feature;
      const geom = feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326');
      const coords = geom.getCoordinates()[0]; // [[lng, lat], ...]
      
      setPolygonCoords(coords);
      setIsDrawing(false);
      map.removeInteraction(draw);
      drawInteractionRef.current = null;
      
      setStatus('Zona delimitada correctamente. Aplicando filtro de negocios...');
      setTimeout(() => runSearchWithPolygon(coords), 100);
    });
  };

  const clearDrawing = () => {
    const map = mapInstance.current;
    if (!map) return;

    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }

    polygonSourceRef.current.clear();
    setPolygonCoords(null);
    setIsDrawing(false);
    setStatus('Zona despejada. Restaurando radio de búsqueda estándar.');
    
    setTimeout(() => runSearch(), 100);
  };

  const runSearchWithPolygon = async (coords) => {
    if (!canSearch || !inegiService || !indicadoresService) return;
    setLoading(true);
    setError('');
    setStatus('Filtrando competencia en la zona dibujada...');
    try {
      const targetCenter = await resolveCenter();
      const tokenToUse = token || planData.config?.externalApis?.inegiToken || '';
      const googleApiKey = planData.config?.externalApis?.googleApiKey || '';
      const bingApiKey = planData.config?.externalApis?.bingApiKey || '';

      setStatus('Agente de Investigación: Consultando base de datos unificada multi-fuente...');
      const result = await inegiService.getMarketCompetitors({
        lat: targetCenter.lat,
        lng: targetCenter.lng,
        query: keywords || 'todos',
        radius: 5000,
        denueToken: tokenToUse,
        googleApiKey,
        bingApiKey,
        allowSynthetic: true
      });

      if (!result.success) throw new Error(result.error || 'Error consultando competidores');

      const fullList = result.competidores || [];
      const inside = fullList.filter(b => isPointInPolygon([b.lng, b.lat], coords));
      setBusinesses(inside);
      setSearchStats(result.estadisticas || null);
      setColoresFuente(result.coloresFuente || {});
      drawBusinesses(inside, targetCenter.lat, targetCenter.lng);

      // Cargar Indicadores Macroeconómicos Reales del INEGI para el Estado
      const cleanDisplay = targetCenter.label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const stateCode = Object.keys(indicadoresService.ENTIDADES_INEGI).find(code => {
        const stateName = indicadoresService.ENTIDADES_INEGI[code].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return cleanDisplay.includes(stateName);
      }) || '0700';

      setStatus(`Agente de Investigación: Extrayendo indicadores macroeconómicos del INEGI para ${indicadoresService.ENTIDADES_INEGI[stateCode] || 'México'}...`);
      const [indRes, perfRes] = await Promise.all([
        indicadoresService.getViabilidadMercado(tokenToUse, stateCode).catch(() => ({ success: false })),
        indicadoresService.getPerfilSocioeconomico(tokenToUse, stateCode).catch(() => ({ success: false }))
      ]);

      let apiMunData = null;
      if (indRes.success && perfRes.success) {
        const pop = indRes.data.poblacionTotal?.valor || 100000;
        const avgIncome = stateCode === '09' ? 29500 : (stateCode === '26' ? 21600 : 18500);
        const avgExpenditure = avgIncome * 0.72;
        apiMunData = {
          desc_municipio: targetCenter.label.split(',')[0],
          cve_municipio: stateCode,
          poblacion_total: pop,
          poblacion_hombres: pop * 0.488,
          poblacion_mujeres: pop * 0.512,
          edad_mediana: 30,
          escolaridad_promedio: perfRes.data.escolaridadPromedio?.valor || 10.0,
          superficie_km2: 1200,
          pct_internet: perfRes.data.hogaresConInternet?.valor || 70.4,
          pct_computadora: 50.0,
          pct_celular: perfRes.data.hogaresConCelular?.valor || 95.0,
          tamano_hogar_promedio: perfRes.data.promedioOcupantesPorVivienda?.valor || 3.3,
          ingreso_promedio_mensual_hogar: avgIncome,
          gasto_promedio_mensual_hogar: avgExpenditure,
          distribucion_gasto_porcentaje: {
            alimentos_bebidas: 35, transporte_comunicaciones: 19, vivienda_servicios: 10,
            educacion_esparcimiento: 12, cuidados_personales: 8, vestido_calzado: 5,
            transferencias_gasto: 6, salud: 3, otros: 2
          },
          gasto_mensual_pesos_por_categoria: {
            alimentos_bebidas: avgExpenditure * 0.35, transporte_comunicaciones: avgExpenditure * 0.19,
            vivienda_servicios: avgExpenditure * 0.10, educacion_esparcimiento: avgExpenditure * 0.12,
            cuidados_personales: avgExpenditure * 0.08, vestido_calzado: avgExpenditure * 0.05,
            transferencias_gasto: avgExpenditure * 0.06, salud: avgExpenditure * 0.03, otros: avgExpenditure * 0.02
          }
        };
      } else {
        const munName = extractMunicipality(targetCenter.label);
        const munRes = await inegiService.getInegiMunicipio(munName);
        if (munRes.success) apiMunData = munRes.data;
      }
      setMunData(apiMunData);

      // Calcular viabilidad
      setStatus('Agente de Investigación: Evaluando saturación competitiva y viabilidad...');
      const viabilityRes = await inegiService.getMarketViability({
        competidores: inside,
        indicadores: {
          ingresoMensualPromedio: apiMunData?.ingreso_promedio_mensual_hogar || 18500
        },
        precioProducto: Number(precioProducto),
        radioKm: 5
      });
      if (viabilityRes.success) setViabilityData(viabilityRes);

      setStatus(`Zona trazada: se detectaron ${inside.length} competidores en la zona delimitada.`);

      const [clientGeo, supplierGeo] = await Promise.all([
        inegiService.geocodeMx(clientLoc),
        inegiService.geocodeMx(supplierLoc),
      ]);

      const clientDistanceKm = clientGeo?.success ? haversineKm(targetCenter.lat, targetCenter.lng, clientGeo.lat, clientGeo.lng) : null;
      const supplierDistanceKm = supplierGeo?.success ? haversineKm(targetCenter.lat, targetCenter.lng, supplierGeo.lat, supplierGeo.lng) : null;

      const competitionScore = Math.max(0, 100 - inside.length * 5);
      const clientProximityScore = clientDistanceKm == null ? 50 : Math.max(0, 100 - clientDistanceKm * 8);
      const supplierProximityScore = supplierDistanceKm == null ? 50 : Math.max(0, 100 - supplierDistanceKm * 8);
      const effectivenessScore = (competitionScore * 0.45) + (clientProximityScore * 0.35) + (supplierProximityScore * 0.20);

      setEffectiveness({
        competitionScore,
        clientProximityScore,
        supplierProximityScore,
        effectivenessScore,
        clientDistanceKm,
        supplierDistanceKm,
      });
    } catch (e) {
      setError(e.message || 'No se pudo filtrar espacialmente.');
    } finally {
      setLoading(false);
    }
  };

  const resolveCenter = async (targetLoc = queryLocation) => {
    if (!inegiService) return center;
    setLoadingGeo(true);
    setError('');
    try {
      let geo = await inegiService.geocodeMx(targetLoc || DEFAULT_CENTER.label);
      if (!geo || !geo.success) {
        // Intentar con la ubicación de la semilla o fallback a DEFAULT_CENTER
        const fallbackCity = planData?.semilla?.negocio?.ubicacion || DEFAULT_CENTER.label;
        geo = await inegiService.geocodeMx(fallbackCity).catch(() => null);
      }
      
      const lat = (geo && geo.success && geo.lat) ? geo.lat : DEFAULT_CENTER.lat;
      const lng = (geo && geo.success && geo.lng) ? geo.lng : DEFAULT_CENTER.lng;
      const label = (geo && geo.success && geo.displayName) ? geo.displayName : (targetLoc || DEFAULT_CENTER.label);
      
      const next = { lat, lng, label };
      setCenter(next);
      setStatus(`Zona cargada: ${next.label}`);
      setMapCenter(next.lat, next.lng);
      return next;
    } catch (e) {
      console.warn('Geocoding fallback to DEFAULT_CENTER:', e.message);
      const next = { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng, label: targetLoc || DEFAULT_CENTER.label };
      setCenter(next);
      setMapCenter(next.lat, next.lng);
      return next;
    } finally {
      setLoadingGeo(false);
    }
  };

  const handleDeepAnalysis = async (competitor) => {
    setSelectedCompetitor(competitor);
    setEnriching(true);
    setEnrichedData(null);
    setAiSwotAnalysis(null);
    setShowEnrichModal(true);

    try {
      const apiBase = getApiBase();
      // 1. Llamar al backend para hacer el enriquecimiento
      const response = await fetch(`${apiBase}/api/market/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: competitor.nombre,
          address: competitor.direccion || '',
          category: competitor.actividad || '',
          keyword: keywords?.split(' ')?.[0] || 'negocio',
        }),
      });

      const enrichResult = await response.json();
      if (!enrichResult.success) {
        throw new Error(enrichResult.error || 'Error al enriquecer competidor');
      }

      setEnrichedData(enrichResult);

      // 2. Generar el análisis FODA con IA (usando la config de IA del planData)
      const aiConfig = planData?.config?.ai;
      if (aiConfig) {
        const prompt = `Genera un análisis FODA rápido (Fortalezas, Debilidades) para el competidor local de nuestro proyecto de negocio:
Competidor: "${competitor.nombre}".
Dirección física: "${competitor.direccion || 'No especificada'}".
Actividad comercial: "${competitor.actividad || 'No especificada'}".

Datos digitales recuperados mediante búsqueda en tiempo real:
- Enlaces oficiales: ${JSON.stringify(enrichResult.profiles)}
- Respuestas de scrapers (seguidores, precios promedio o reseñas): ${JSON.stringify(enrichResult.scrapedData)}

Por favor, devuélvelo en formato JSON con la siguiente estructura exacta (responde ÚNICAMENTE el JSON y nada más):
{
  "fortalezas": ["F1", "F2", "F3"],
  "debilidades": ["D1", "D2", "D3"],
  "estrategiaRecomendada": "Estrategia concreta para que el negocio ${planData?.semilla?.negocio?.nombre_marca || 'nuestro plan'} compita de manera directa y gane clientes."
}`;

        const swot = await callAiProvider(aiConfig, prompt, true, ['fortalezas', 'debilidades', 'estrategiaRecomendada']);
        setAiSwotAnalysis(swot);
      } else {
        // Fallback si no hay IA configurada
        setAiSwotAnalysis({
          fortalezas: ['Presencia de marca establecida localmente', 'Registro oficial completo ante INEGI', 'Ubicación identificada geográficamente'],
          debilidades: ['Presencia digital limitada o nula en buscadores principales', 'Sin canales oficiales de atención interactivos', 'Vulnerabilidad a competidores con propuesta omnicanal'],
          estrategiaRecomendada: 'Establecer una fuerte presencia en redes sociales y delivery rápido para captar al público local.'
        });
      }
    } catch (err) {
      console.error('[DeepAnalysis] Error:', err);
      setAiSwotAnalysis({
        fortalezas: ['Presencia de marca establecida localmente', 'Registro oficial completo ante INEGI', 'Ubicación identificada geográficamente'],
        debilidades: ['Presencia digital limitada o nula en buscadores principales', 'Sin canales oficiales de atención interactivos', 'Vulnerabilidad a competidores con propuesta omnicanal'],
        estrategiaRecomendada: 'Establecer una fuerte presencia en redes sociales y delivery rápido para captar al público local.'
      });
    } finally {
      setEnriching(false);
    }
  };

  const drawBusinesses = (list, centerLat, centerLng, optimalLoc = optimalLocationData) => {
    if (!window.ol || !markersSourceRef.current) return;
    markersSourceRef.current.clear();

    const features = [];

    // 1. Ubicación Actual / Centro de Referencia
    if (centerLat != null && centerLng != null && Number.isFinite(centerLat) && Number.isFinite(centerLng)) {
      const centerFeature = new window.ol.Feature({
        geometry: new window.ol.geom.Point(window.ol.proj.fromLonLat([centerLng, centerLat])),
        name: 'Ubicación de Consulta / Referencia',
      });
      centerFeature.setStyle(new window.ol.style.Style({
        image: new window.ol.style.Circle({
          radius: 9,
          fill: new window.ol.style.Fill({ color: '#4f46e5' }), 
          stroke: new window.ol.style.Stroke({ color: '#ffffff', width: 2.2 })
        })
      }));
      centerFeature.set('isMain', true);
      features.push(centerFeature);
    }

    // 2. Ubicación Óptima Recomendada (Centroide Ponderado por Demanda)
    if (showOptimalPoint && optimalLoc?.optimalCoords && Number.isFinite(optimalLoc.optimalCoords.lat)) {
      const optLat = optimalLoc.optimalCoords.lat;
      const optLng = optimalLoc.optimalCoords.lng;
      const optimalFeature = new window.ol.Feature({
        geometry: new window.ol.geom.Point(window.ol.proj.fromLonLat([optLng, optLat])),
        name: '🎯 Ubicación Óptima Sugerida (Centroide de Cobertura)',
      });
      optimalFeature.setStyle(new window.ol.style.Style({
        image: new window.ol.style.RegularShape({
          fill: new window.ol.style.Fill({ color: '#f59e0b' }),
          stroke: new window.ol.style.Stroke({ color: '#ffffff', width: 2.5 }),
          points: 5,
          radius: 12,
          radius2: 5,
          angle: 0
        })
      }));
      optimalFeature.set('isOptimal', true);
      features.push(optimalFeature);
    }

    // 3. Establecimientos (Competidores, Clientes B2B, Proveedores)
    list
      .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
      .forEach((item) => {
        const feat = new window.ol.Feature({
          geometry: new window.ol.geom.Point(window.ol.proj.fromLonLat([item.lng, item.lat])),
          name: item.nombre,
        });

        // Color coding por relación B2B o fuente
        const markerColor = item.colorBadge || item.color || '#ef4444';

        feat.setStyle(new window.ol.style.Style({
          image: new window.ol.style.Circle({
            radius: item.categoriaB2B === 'cliente_b2b' ? 7.5 : (item.posibleZombie ? 4.5 : 6),
            fill: new window.ol.style.Fill({ 
              color: item.posibleZombie ? 'rgba(107,114,128,0.5)' : markerColor 
            }),
            stroke: new window.ol.style.Stroke({ 
              color: item.posibleZombie ? '#4b5563' : '#ffffff', 
              width: item.categoriaB2B === 'cliente_b2b' ? 2.5 : 1.5,
              lineDash: item.posibleZombie ? [4, 4] : undefined
            })
          })
        }));
        feat.set('isMain', false);
        feat.set('weight', item.weight || 0.85);
        features.push(feat);
      });

    markersSourceRef.current.addFeatures(features);
  };

  const seedStatewideMiningCorridor = () => {
    const corridorPoints = [
      // Hermosillo (Taller Central y Proveedores)
      { id: 'hmo_1', nombre: 'Taller Central CCI (Parque Industrial Norte)', lat: 29.112, lng: -110.965, categoriaB2B: 'proveedor', colorBadge: '#10b981', weight: 1.0, estrato: '251 y más personas' },
      { id: 'hmo_2', nombre: 'Distribuidora Parker Hannifin Sonora', lat: 29.085, lng: -110.942, categoriaB2B: 'proveedor', colorBadge: '#10b981', weight: 0.9, estrato: '51 a 100 personas' },
      { id: 'hmo_3', nombre: 'Tornería y Maquinados Industriales del Noroeste', lat: 29.065, lng: -110.978, categoriaB2B: 'competidor', colorBadge: '#ef4444', weight: 0.7, estrato: '31 a 50 personas' },
      { id: 'hmo_4', nombre: 'Mantenimiento Hidráulico de Hermosillo', lat: 29.074, lng: -110.935, categoriaB2B: 'competidor', colorBadge: '#ef4444', weight: 0.6, estrato: '11 a 30 personas' },
      
      // Cananea (Buenavista del Cobre / Grupo México)
      { id: 'can_1', nombre: 'Buenavista del Cobre (Grupo México) - Palas P&H', lat: 30.988, lng: -110.285, categoriaB2B: 'cliente_b2b', colorBadge: '#8b5cf6', weight: 1.0, estrato: '251 y más personas' },
      { id: 'can_2', nombre: 'Mina María Cananea - Flota CAT 797', lat: 31.012, lng: -110.312, categoriaB2B: 'cliente_b2b', colorBadge: '#8b5cf6', weight: 0.9, estrato: '251 y más personas' },
      { id: 'can_3', nombre: 'Servicios Mineros de Cananea S.A.', lat: 30.975, lng: -110.295, categoriaB2B: 'competidor', colorBadge: '#ef4444', weight: 0.5, estrato: '11 a 30 personas' },
      
      // Nacozari (La Caridad / Mexicana de Cobre)
      { id: 'nac_1', nombre: 'Mina La Caridad (Mexicana de Cobre) - Trituradora', lat: 30.375, lng: -109.685, categoriaB2B: 'cliente_b2b', colorBadge: '#8b5cf6', weight: 1.0, estrato: '251 y más personas' },
      { id: 'nac_2', nombre: 'Concentradora de Cobre Nacozari', lat: 30.362, lng: -109.698, categoriaB2B: 'cliente_b2b', colorBadge: '#8b5cf6', weight: 0.85, estrato: '101 a 250 personas' },
      { id: 'nac_3', nombre: 'Taller de Soldadura y Mantenimiento El Sauz', lat: 30.382, lng: -109.674, categoriaB2B: 'competidor', colorBadge: '#ef4444', weight: 0.4, estrato: '6 a 10 personas' },
      
      // Caborca (La Herradura / Fresnillo / Peñoles)
      { id: 'cab_1', nombre: 'Minera Penmont (La Herradura / Fresnillo PLC)', lat: 30.718, lng: -112.145, categoriaB2B: 'cliente_b2b', colorBadge: '#8b5cf6', weight: 1.0, estrato: '251 y más personas' },
      { id: 'cab_2', nombre: 'Mina Noche Buena (Fresnillo PLC)', lat: 30.742, lng: -112.185, categoriaB2B: 'cliente_b2b', colorBadge: '#8b5cf6', weight: 0.9, estrato: '251 y más personas' },
      { id: 'cab_3', nombre: 'Perforaciones y Mantenimiento Pesado Caborca', lat: 30.705, lng: -112.128, categoriaB2B: 'competidor', colorBadge: '#ef4444', weight: 0.6, estrato: '31 a 50 personas' },
      
      // Guaymas (Puerto Logístico & Importaciones)
      { id: 'gym_1', nombre: 'Terminal Portuaria de Importación de Aceros Guaymas', lat: 27.919, lng: -110.895, categoriaB2B: 'proveedor', colorBadge: '#10b981', weight: 0.8, estrato: '101 a 250 personas' },
      { id: 'gym_2', nombre: 'Almacén Fiscal y Logística de Fluidos del Pacífico', lat: 27.932, lng: -110.882, categoriaB2B: 'proveedor', colorBadge: '#10b981', weight: 0.75, estrato: '51 a 100 personas' },
      { id: 'gym_3', nombre: 'Servicios Marítimos e Hidráulicos de Sonora', lat: 27.912, lng: -110.908, categoriaB2B: 'competidor', colorBadge: '#ef4444', weight: 0.5, estrato: '11 a 30 personas' }
    ];

    setBusinesses(corridorPoints);
    drawBusinesses(corridorPoints, 29.6, -110.6);
    setStatus('Corredor Minero e Industrial de Sonora: 16 nodos activos cargados en 5 polos estratégicos.');
  };

  const handleSelectCluster = (c) => {
    setSelectedCluster(c.id);
    if (c.id === 'all') {
      setQueryLocation('Sonora, México');
      setMapCenter(c.lat, c.lng, c.zoom);
      setRadius(15000);
      seedStatewideMiningCorridor();
    } else {
      const cleanName = c.name.replace(/[^a-zA-ZáéíóúÁÉÍÓÚ\s]/g, '').trim();
      setQueryLocation(`${cleanName}, Sonora`);
      setMapCenter(c.lat, c.lng, c.zoom);
      setRadius(5000);
      runSearch(`${cleanName}, Sonora`);
    }
  };

  const runSearch = async (locOverride) => {
    if (!canSearch || !inegiService || !indicadoresService) {
      if (!canSearch) setError('Configura un radio válido para analizar competencia.');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Agente de Investigación: Inicializando análisis espacial de mercado...');

    try {
      const targetCenter = await resolveCenter(locOverride || queryLocation);
      const tokenToUse = token || planData.config?.externalApis?.inegiToken || '';
      const googleApiKey = planData.config?.externalApis?.googleApiKey || '';
      const bingApiKey = planData.config?.externalApis?.bingApiKey || '';

      setStatus('Agente de Investigación: Consultando base de datos unificada multi-fuente...');
      const result = await inegiService.getMarketCompetitors({
        lat: targetCenter.lat,
        lng: targetCenter.lng,
        query: keywords || 'todos',
        radius: Number(radius),
        denueToken: tokenToUse,
        googleApiKey,
        bingApiKey,
        allowSynthetic: true
      });

      if (!result.success) throw new Error(result.error || 'Error consultando competidores');

      let rawBusinesses = result.competidores || [];
      setSearchStats(result.estadisticas || null);
      setColoresFuente(result.coloresFuente || {});
      
      if (polygonCoords) {
        rawBusinesses = rawBusinesses.filter(b => isPointInPolygon([b.lng, b.lat], polygonCoords));
        setStatus(`Zona delimitada: se detectaron ${rawBusinesses.length} competidores en el área dibujada.`);
      }

      // Enriquecimiento B2B & Estimación Financiera de cada empresa
      const enriched = rawBusinesses.map(item => {
        const b2b = classifyEstablishmentType(item, keywords);
        const fin = estimateBusinessMetrics(item.estrato || item.Estrato, item.scianClase || item.scian || '');
        return {
          ...item,
          tipoRelacion: b2b.tipo,
          categoriaB2B: b2b.categoria,
          colorBadge: b2b.color,
          financiero: fin
        };
      });

      // Cálculo de la Ubicación Óptima (Centroide Ponderado)
      const optimalResult = calculateOptimalLocation(enriched, optimalMaxRadiusKm);
      setOptimalLocationData(optimalResult);

      setBusinesses(enriched);
      drawBusinesses(enriched, targetCenter.lat, targetCenter.lng, optimalResult);

      // Cargar Indicadores Macroeconómicos Reales del INEGI para el Estado
      const cleanDisplay = targetCenter.label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const stateCode = Object.keys(indicadoresService.ENTIDADES_INEGI).find(code => {
        const stateName = indicadoresService.ENTIDADES_INEGI[code].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return cleanDisplay.includes(stateName);
      }) || '0700';

      setStatus(`Agente de Investigación: Extrayendo indicadores macroeconómicos del INEGI para ${indicadoresService.ENTIDADES_INEGI[stateCode] || 'México'}...`);
      const [indRes, perfRes] = await Promise.all([
        indicadoresService.getViabilidadMercado(tokenToUse, stateCode).catch(() => ({ success: false })),
        indicadoresService.getPerfilSocioeconomico(tokenToUse, stateCode).catch(() => ({ success: false }))
      ]);

      let apiMunData = null;
      if (indRes.success && perfRes.success) {
        const pop = indRes.data.poblacionTotal?.valor || 100000;
        const avgIncome = stateCode === '09' ? 29500 : (stateCode === '26' ? 21600 : 18500);
        const avgExpenditure = avgIncome * 0.72;
        apiMunData = {
          desc_municipio: targetCenter.label.split(',')[0],
          cve_municipio: stateCode,
          poblacion_total: pop,
          poblacion_hombres: pop * 0.488,
          poblacion_mujeres: pop * 0.512,
          edad_mediana: 30,
          escolaridad_promedio: perfRes.data.escolaridadPromedio?.valor || 10.0,
          superficie_km2: 1200,
          pct_internet: perfRes.data.hogaresConInternet?.valor || 70.4,
          pct_computadora: 50.0,
          pct_celular: perfRes.data.hogaresConCelular?.valor || 95.0,
          tamano_hogar_promedio: perfRes.data.promedioOcupantesPorVivienda?.valor || 3.3,
          ingreso_promedio_mensual_hogar: avgIncome,
          gasto_promedio_mensual_hogar: avgExpenditure,
          distribucion_gasto_porcentaje: {
            alimentos_bebidas: 35, transporte_comunicaciones: 19, vivienda_servicios: 10,
            educacion_esparcimiento: 12, cuidados_personales: 8, vestido_calzado: 5,
            transferencias_gasto: 6, salud: 3, otros: 2
          },
          gasto_mensual_pesos_por_categoria: {
            alimentos_bebidas: avgExpenditure * 0.35, transporte_comunicaciones: avgExpenditure * 0.19,
            vivienda_servicios: avgExpenditure * 0.10, educacion_esparcimiento: avgExpenditure * 0.12,
            cuidados_personales: avgExpenditure * 0.08, vestido_calzado: avgExpenditure * 0.05,
            transferencias_gasto: avgExpenditure * 0.06, salud: avgExpenditure * 0.03, otros: avgExpenditure * 0.02
          }
        };
      } else {
        const munName = extractMunicipality(targetCenter.label);
        const munRes = await inegiService.getInegiMunicipio(munName);
        if (munRes.success) apiMunData = munRes.data;
      }
      setMunData(apiMunData);

      // Calcular viabilidad de mercado
      setStatus('Agente de Investigación: Evaluando saturación competitiva y viabilidad...');
      const viabilityRes = await inegiService.getMarketViability({
        competidores: rawBusinesses,
        indicadores: {
          ingresoMensualPromedio: apiMunData?.ingreso_promedio_mensual_hogar || 18500
        },
        precioProducto: Number(precioProducto),
        radioKm: Number(radius) / 1000
      });
      if (viabilityRes.success) setViabilityData(viabilityRes);

      if (mode === 'location') {
        setStatus(`Zona validada para localización: ${targetCenter.label}. Se detectaron ${rawBusinesses.length} competidores.`);
        const densityScore = Math.min(100, rawBusinesses.length * 5);
        setEffectiveness({
          competitionScore: densityScore, clientProximityScore: 100, supplierProximityScore: 100,
          effectivenessScore: densityScore, clientDistanceKm: null, supplierDistanceKm: null,
        });
        return;
      }

      setStatus(`Competidores detectados: ${rawBusinesses.length} en radio ${radius}m.`);

      const [clientGeo, supplierGeo] = await Promise.all([
        inegiService.geocodeMx(clientLoc),
        inegiService.geocodeMx(supplierLoc),
      ]);

      const clientDistanceKm = clientGeo?.success ? haversineKm(targetCenter.lat, targetCenter.lng, clientGeo.lat, clientGeo.lng) : null;
      const supplierDistanceKm = supplierGeo?.success ? haversineKm(targetCenter.lat, targetCenter.lng, supplierGeo.lat, supplierGeo.lng) : null;

      const manualCount = Number(manualCompetitors);
      const compCount = Number.isFinite(manualCount) && manualCount >= 0 ? manualCount : rawBusinesses.length;
      const competitionScore = Math.max(0, 100 - compCount * 5); 
      const clientProximityScore = clientDistanceKm == null ? 50 : Math.max(0, 100 - clientDistanceKm * 8);
      const supplierProximityScore = supplierDistanceKm == null ? 50 : Math.max(0, 100 - supplierDistanceKm * 8);

      const effectivenessScore = (competitionScore * 0.45) + (clientProximityScore * 0.35) + (supplierProximityScore * 0.20);

      setEffectiveness({
        competitionScore, clientProximityScore, supplierProximityScore,
        effectivenessScore, clientDistanceKm, supplierDistanceKm,
      });
    } catch (e) {
      setError(e.message || 'No se pudo consultar competidores');
      setStatus('');
      setBusinesses([]);
      drawBusinesses([], center.lat, center.lng);
      setEffectiveness(null);
    } finally {
      setLoading(false);
    }
  };

  const saveToPlan = () => {
    let content = `### Análisis de Inteligencia Competitiva y Ubicación Geoespacial Multi-Fuente\n\n`;
    content += `- **Ubicación de referencia (Centro):** ${center.label || `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`}\n`;
    
    if (polygonCoords) {
      content += `- **Método de delimitación comercial:** Polígono personalizado de trazado manual (${polygonCoords.length} vértices)\n`;
    } else {
      content += `- **Radio de búsqueda:** ${radius} metros\n`;
    }

    if (mode === 'competition') {
      const selectedScian = SCIAN_PRESETS.find(s => s.value === scian)?.label || scian;
      content += `- **Giro / Sector SCIAN analizado:** ${selectedScian}\n`;
      if (keywords) content += `- **Palabras clave de búsqueda:** ${keywords}\n`;
      content += `- **Ubicación de clientes promedio:** ${clientLoc}\n`;
      content += `- **Ubicación de proveedores clave:** ${supplierLoc}\n`;
      if (manualCompetitors !== '') content += `- **Competidores manuales declarados:** ${manualCompetitors}\n`;
    }

    if (effectiveness) {
      content += `\n#### Índice de Efectividad Territorial\n\n`;
      content += `- **Puntaje Global de Efectividad:** **${effectiveness.effectivenessScore.toFixed(1)}/100**\n`;
      content += `- **Nivel de Competencia:** ${effectiveness.competitionScore.toFixed(1)}/100\n`;
      content += `- **Cercanía/Accesibilidad a Clientes:** ${effectiveness.clientProximityScore.toFixed(1)}/100\n`;
      content += `- **Cercanía/Logística con Proveedores:** ${effectiveness.supplierProximityScore.toFixed(1)}/100\n`;
      content += `- **Distancia estimada a Clientes:** ${effectiveness.clientDistanceKm == null ? 'N/D' : `${effectiveness.clientDistanceKm.toFixed(2)} km`}\n`;
      content += `- **Distancia estimada a Proveedores:** ${effectiveness.supplierDistanceKm == null ? 'N/D' : `${effectiveness.supplierDistanceKm.toFixed(2)} km`}\n`;
    }

    if (viabilityData) {
      content += `\n#### Diagnóstico de Viabilidad de Mercado (Precio vs Ingreso Local)\n\n`;
      content += `- **Precio del Producto/Servicio:** $${precioProducto} MXN\n`;
      content += `- **Veredicto del Diagnóstico:** **${viabilityData.veredicto}** (Score: ${viabilityData.viabilityScore}/100)\n`;
      content += `- **Densidad Comercial Activa:** ${viabilityData.competencia?.densidadPorKm2} competidores/km² (${viabilityData.competencia?.total} total, ${viabilityData.competencia?.posiblesZombies} zombies)\n`;
      content += `- **Saturación en la Zona:** ${viabilityData.competencia?.saturacion}\n`;
      if (viabilityData.asequibilidad) {
        content += `- **Nivel de Asequibilidad:** ${viabilityData.asequibilidad.nivel} (${viabilityData.asequibilidad.porcentajeIngreso.toFixed(1)}% del ingreso promedio)\n`;
      }
      content += `\n**Recomendaciones Estratégicas:**\n`;
      viabilityData.recomendaciones?.forEach(rec => {
        content += `- ${rec}\n`;
      });
    }

    if (munData && localEstimates) {
      content += `\n#### Perfil Socio-Demográfico Estimado en la Zona (INEGI)\n\n`;
      content += `- **Población total estimada en la zona:** ${localEstimates.estimatedPop.toLocaleString()} habitantes\n`;
      content += `- **Hogares estimados en la zona:** ${localEstimates.estimatedHouseholds.toLocaleString()} hogares\n`;
      content += `- **Grado promedio de escolaridad:** ${toFixedSafe(munData.escolaridad_promedio, 1, '10.0')} años cursados\n`;
      content += `- **Internet en los hogares:** ${toFixedSafe(munData.pct_internet, 1, '70.4')}%\n`;
      content += `- **Ingreso promedio mensual por hogar:** $${localEstimates.avgIncome.toLocaleString('es-MX')} MXN\n`;
      content += `- **Potencial de Consumo Mensual de la Zona (Market Size):** **$${localEstimates.localMarketSizeMonthly.toLocaleString('es-MX')} MXN/mes**\n`;
    }

    if (businesses.length > 0) {
      content += `\n#### Listado de Competidores Detectados (Multi-Fuente)\n\n`;
      content += `| Establecimiento | Actividad / Giro | Fuentes | Estado | Dirección |\n`;
      content += `| :--- | :--- | :--- | :--- | :--- |\n`;
      businesses.slice(0, 35).forEach(b => {
        const cleanNombre = (b.nombre || 'Sin nombre').replace(/\|/g, '\\|');
        const cleanAct = (b.actividad || 'N/D').replace(/\|/g, '\\|');
        const cleanSources = (b.fuentes || [b.fuente || 'N/D']).join(', ').toUpperCase();
        const cleanStatus = b.posibleZombie ? 'ZOMBIE (Inactivo)' : 'Activo';
        const cleanDir = (b.direccion || 'N/D').replace(/\|/g, '\\|');
        content += `| ${cleanNombre} | ${cleanAct} | ${cleanSources} | ${cleanStatus} | ${cleanDir} |\n`;
      });
    }

    let targetPillar = pillarId || 'mercado';
    let targetModule = moduleId || (mode === 'location' ? 'ubicacion' : 'competencia');
    let targetField = 'competidores';

    if (pillarId === 'tecnico') {
      targetField = 'local';
    } else if (moduleId === 'mapa') {
      targetField = 'analisis_espacial';
    } else if (moduleId === 'competencia') {
      targetField = 'competidores';
    }

    updateSection(targetPillar, targetModule, targetField, content);

    // Auto-guardar y persistir inmediatamente en el backend
    if (manualSaveProject) {
      const updatedPlan = {
        ...planData,
        [targetPillar]: {
          ...(planData[targetPillar] || {}),
          [targetModule]: {
            ...(planData[targetPillar]?.[targetModule] || {}),
            [targetField]: content
          }
        }
      };
      manualSaveProject(updatedPlan);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const hasResults = mode === 'location' ? center.label !== DEFAULT_CENTER.label : (businesses.length > 0 || effectiveness);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (location) {
      setQueryLocation(location);
      if (initializedRef.current) {
        runSearch(location);
      }
    }
  }, [location]);

  useEffect(() => {
    if (inegiService && indicadoresService) {
      runSearch(location || queryLocation);
      initializedRef.current = true;
    }
  }, [token, inegiService, indicadoresService]);

  return (
    <div className={readOnly ? "" : "glass-panel"} style={{ padding: readOnly ? '0' : '1rem', marginTop: '1rem', position: 'relative' }}>
      {!readOnly && (
        <>
          {/* [SONORA MINING CORRIDOR] Selector de Polos Mineros y Logísticos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem', padding: '0.5rem 0.75rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(245,158,11,0.06))', borderRadius: '10px', border: '1px solid rgba(79,70,229,0.2)' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> Corredor Sonora:
            </span>
            {SONORA_MINING_CLUSTERS.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCluster(c)}
                style={{
                  padding: '3px 9px',
                  fontSize: '0.72rem',
                  borderRadius: '6px',
                  border: selectedCluster === c.id ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                  background: selectedCluster === c.id ? '#4f46e5' : '#ffffff',
                  color: selectedCluster === c.id ? '#ffffff' : '#475569',
                  fontWeight: selectedCluster === c.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={c.label}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 0.7fr auto', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <input
              className="form-control"
              value={queryLocation}
              onChange={(e) => setQueryLocation(e.target.value)}
              placeholder="Ej: Col. Roma Norte, CDMX"
            />
            {mode === 'competition' ? (
              <select className="form-control" value={scian} onChange={(e) => setScian(e.target.value)}>
                {SCIAN_PRESETS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            ) : (
              <input
                className="form-control"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Descripción de zona"
              />
            )}
            <input
              type="number"
              className="form-control"
              value={radius}
              min={200}
              max={15000}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="Radio (m)"
            />
            <button className="btn btn-secondary" onClick={() => runSearch()} disabled={loading || loadingGeo} title="Buscar competidores">
              {(loading || loadingGeo) ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              <span>{mode === 'competition' ? 'Analizar' : 'Ubicar'}</span>
            </button>
          </div>
          {mode === 'competition' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <input
                className="form-control"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Giro o palabra clave"
              />
              <input
                className="form-control"
                value={clientLoc}
                onChange={(e) => setClientLoc(e.target.value)}
                placeholder="Ubicación clientes"
              />
              <input
                className="form-control"
                value={supplierLoc}
                onChange={(e) => setSupplierLoc(e.target.value)}
                placeholder="Ubicación proveedores"
              />
              <input
                type="number"
                className="form-control"
                value={precioProducto}
                min={0}
                onChange={(e) => setPrecioProducto(e.target.value)}
                placeholder="Precio prod (MXN)"
                title="Precio estimado de tu producto/servicio"
              />
              <input
                type="number"
                className="form-control"
                value={manualCompetitors}
                min={0}
                onChange={(e) => setManualCompetitors(e.target.value)}
                placeholder="Comp. Manuales"
              />
            </div>
          )}

          {/* [B2B GEOINTELLIGENCE] Filtro Multimodal & Ubicación Óptima */}
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem', padding: '0.6rem 0.8rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontWeight: 800, fontSize: '0.76rem' }}>
              <Building2 size={16} /> Clúster Territorial:
            </div>
            
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setB2bFilter('todos')}
                style={{
                  padding: '3px 10px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer',
                  background: b2bFilter === 'todos' ? '#4f46e5' : 'rgba(255,255,255,0.05)',
                  color: b2bFilter === 'todos' ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)', fontWeight: 600
                }}
              >
                🌐 Todos ({businesses.length})
              </button>

              <button
                type="button"
                onClick={() => setB2bFilter('clientes_b2b')}
                style={{
                  padding: '3px 10px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer',
                  background: b2bFilter === 'clientes_b2b' ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                  color: b2bFilter === 'clientes_b2b' ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)', fontWeight: 600
                }}
              >
                🎯 Clientes Potenciales B2B ({businesses.filter(b => b.categoriaB2B === 'cliente_b2b').length})
              </button>

              <button
                type="button"
                onClick={() => setB2bFilter('competidores')}
                style={{
                  padding: '3px 10px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer',
                  background: b2bFilter === 'competidores' ? '#ef4444' : 'rgba(255,255,255,0.05)',
                  color: b2bFilter === 'competidores' ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)', fontWeight: 600
                }}
              >
                ⚔️ Competidores ({businesses.filter(b => b.categoriaB2B === 'competidor').length})
              </button>

              <button
                type="button"
                onClick={() => setB2bFilter('proveedores')}
                style={{
                  padding: '3px 10px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer',
                  background: b2bFilter === 'proveedores' ? '#10b981' : 'rgba(255,255,255,0.05)',
                  color: b2bFilter === 'proveedores' ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)', fontWeight: 600
                }}
              >
                📦 Proveedores / Cadena ({businesses.filter(b => b.categoriaB2B === 'proveedor').length})
              </button>
            </div>

            {optimalLocationData && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🎯 Punto Óptimo: Cobertura {optimalLocationData.clientsWithinRadius} clientes ({optimalLocationData.totalNearbyRevenueFormatted})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !showOptimalPoint;
                    setShowOptimalPoint(next);
                    drawBusinesses(businesses, center.lat, center.lng, next ? optimalLocationData : null);
                  }}
                  style={{
                    padding: '2px 8px', fontSize: '0.66rem', borderRadius: '4px',
                    background: showOptimalPoint ? '#f59e0b' : 'transparent',
                    color: showOptimalPoint ? '#0f172a' : '#f59e0b',
                    border: '1px solid #f59e0b', cursor: 'pointer', fontWeight: 700
                  }}
                >
                  {showOptimalPoint ? '📍 Centroide Visible' : 'Ocultar Centroide'}
                </button>
              </div>
            )}
          </div>

          {/* Color Codes Legend */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.75rem', fontSize: '0.7rem', padding: '0.4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Fuentes del Agente:</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span> DENUE (INEGI)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4285F4' }}></span> Google Places
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#008373' }}></span> Bing Maps
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7B68EE' }}></span> OSM
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DE5833' }}></span> DuckDuckGo (Scraper)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6B7280' }}></span> Común
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(107,114,128,0.3)', border: '1px dashed #4b5563' }}></span> Posible Zombie (Inactivo)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Análisis Espacial:</span>
            <button
              className={`btn ${isDrawing ? 'btn-ia' : 'btn-secondary'}`}
              onClick={startDrawing}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
            >
              <span>✏️</span>
              <span>{isDrawing ? 'Dibujando...' : 'Trazar Zona (Polígono)'}</span>
            </button>
            {polygonCoords && (
              <button
                className="btn btn-secondary"
                onClick={clearDrawing}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: '#ef4444', color: '#ef4444', cursor: 'pointer' }}
              >
                <span>🗑️</span>
                <span>Borrar Polígono ({polygonCoords.length} pts)</span>
              </button>
            )}
            <button
              className={`btn ${showHeatmap ? 'btn-ia' : 'btn-secondary'}`}
              onClick={() => setShowHeatmap(!showHeatmap)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                background: showHeatmap ? 'linear-gradient(135deg, #ef4444, #f59e0b)' : '',
                color: showHeatmap ? '#ffffff' : '',
                border: '1px solid var(--accent-color)',
                fontWeight: 600
              }}
              title="Alternar entre marcadores individuales y mapa de calor de densidad"
            >
              <span>🔥</span>
              <span>{showHeatmap ? 'Capa: Mapa de Calor (Activa)' : 'Activar Mapa de Calor'}</span>
            </button>
            <button
              className={`btn ${useOfficialIframe ? 'btn-ia' : 'btn-secondary'}`}
              onClick={() => setUseOfficialIframe(!useOfficialIframe)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', marginLeft: 'auto', background: useOfficialIframe ? '#1e40af' : '' }}
            >
              <span>🌐</span>
              <span>{useOfficialIframe ? 'Volver al Mapa' : 'Ver DENUE INEGI Oficial'}</span>
            </button>
          </div>

          {!token && !useOfficialIframe && (
            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.8rem' }}>
              <AlertTriangle size={14} /> Token INEGI no detectado en Configuración. Se usará fallback local (Hermosillo).
              <a href="https://www.inegi.org.mx/servicios/api_denue.html" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline', marginLeft: '4px' }}>Adquirir API Key</a>
            </div>
          )}

          {(status || error) && (
            <div style={{ marginBottom: '0.65rem', fontSize: '0.78rem', color: error ? '#ef4444' : '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {loading && <RefreshCw size={12} className="animate-spin" />}
              <span>{error || status}</span>
            </div>
          )}
        </>
      )}

      {useOfficialIframe ? (
        <div style={{ width: '100%', height: readOnly ? '380px' : '550px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(148,163,184,0.22)' }}>
          <iframe 
            src="https://www.inegi.org.mx/app/mapa/denue/default.aspx" 
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="DENUE Oficial"
          />
        </div>
      ) : !olLoaded ? (
        <div style={{ width: '100%', height: readOnly ? '380px' : '340px', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', border: '1px solid rgba(148,163,184,0.22)' }}>
          {olError ? (
            <>
              <AlertTriangle size={32} style={{ color: '#ef4444', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>Error al cargar motor cartográfico</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Revisa tu conexión o desactiva tu adblocker (CDN bloqueado).</p>
            </>
          ) : (
            <>
              <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>Montando Motor Cartográfico...</p>
            </>
          )}
        </div>
      ) : (
        <div
          ref={mapRef}
          style={{ width: '100%', height: readOnly ? '380px' : '340px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(148,163,184,0.22)' }}
        ></div>
      )}

      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><MapPin size={13} style={{ verticalAlign: 'text-bottom' }} /> {title}</span>
        <span>Centro: {center.label || `${center.lat}, ${center.lng}`}</span>
      </div>

      {!readOnly && hasResults && (
        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn" 
            style={{ 
              background: saveSuccess ? 'var(--success-color)' : 'var(--accent-color)', 
              color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600',
              border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }} 
            onClick={saveToPlan}
          >
            {saveSuccess ? <Check size={14} /> : <Save size={14} />}
            <span>{saveSuccess ? '¡Guardado en el Plan!' : 'Guardar en el Plan'}</span>
          </button>
        </div>
      )}

      {/* Advanced Demographic & Viability Dashboard */}
      {!readOnly && munData && localEstimates && (
        <div className="glass-panel" style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.55)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📊 Agente de Inteligencia de Mercado Multi-Fuente (INEGI + Web)
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Zona: <strong>{munData.desc_municipio}</strong>
            </span>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
            {['demografia', 'ingresos', 'mercado', 'viabilidad'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none', border: 'none', color: activeTab === tab ? '#38bdf8' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab ? 'bold' : 'normal', borderBottom: activeTab === tab ? '2px solid #38bdf8' : 'none',
                  paddingBottom: '0.2rem', fontSize: '0.76rem', cursor: 'pointer', textTransform: 'capitalize'
                }}
              >
                {tab === 'demografia' && '👥 Demografía'}
                {tab === 'ingresos' && '💵 Ingresos y Gastos'}
                {tab === 'mercado' && '📈 Potencial de Consumo'}
                {tab === 'viabilidad' && '🎯 Viabilidad y Recomendación'}
              </button>
            ))}
          </div>

          {/* Tab Content 1: Demografia */}
          {activeTab === 'demografia' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Población Estimada en Radio de Búsqueda</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: '4px 0' }}>
                  {localEstimates.estimatedPop.toLocaleString()} hab
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Área analizada: {localEstimates.areaKm2.toFixed(3)} km²
                </div>
                
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Hombres: 48.8%</span>
                    <span>Mujeres: 51.2%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: '48.8%', height: '100%', background: '#3b82f6' }}></div>
                    <div style={{ width: '51.2%', height: '100%', background: '#ec4899' }}></div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Edad Mediana (Estatal):</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'white' }}>{munData.edad_mediana || '30'} años</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Escolaridad Promedio:</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'white' }}>{munData.escolaridad_promedio != null ? Number(munData.escolaridad_promedio).toFixed(1) : '10.0'} años</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Hogares con Internet:</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'white' }}>{munData.pct_internet != null ? Number(munData.pct_internet).toFixed(1) : '70.4'}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Hogares con Celular:</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'white' }}>{munData.pct_celular != null ? Number(munData.pct_celular).toFixed(1) : '95.0'}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Ingresos y Gastos */}
          {activeTab === 'ingresos' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Ingreso Promedio Hogar/Mes (INEGI)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', margin: '4px 0' }}>
                  ${localEstimates.avgIncome.toLocaleString('es-MX')} MXN
                </div>
                
                <div style={{ marginTop: '0.85rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Gasto Promedio Hogar/Mes (Est.)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>
                  ${localEstimates.avgExpenditure.toLocaleString('es-MX')} MXN
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  Poder de Ahorro / Excedente: 28%
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '130px', overflowY: 'auto' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '2px' }}>Distribución del Gasto Mensual (ENIGH):</span>
                {[
                  { label: "🍔 Alimentos y Bebidas (35%)", val: munData.gasto_mensual_pesos_por_categoria?.alimentos_bebidas },
                  { label: "🚗 Transporte y Comunicación (19%)", val: munData.gasto_mensual_pesos_por_categoria?.transporte_comunicaciones },
                  { label: "🏠 Vivienda y Servicios (10%)", val: munData.gasto_mensual_pesos_por_categoria?.vivienda_servicios },
                  { label: "🎓 Educación y Esparcimiento (12%)", val: munData.gasto_mensual_pesos_por_categoria?.educacion_esparcimiento },
                  { label: "💆 Cuidados Personales (8%)", val: munData.gasto_mensual_pesos_por_categoria?.cuidados_personales }
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', background: 'rgba(255,255,255,0.02)', padding: '2px 4px', borderRadius: '3px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>${Math.round(item.val || 0).toLocaleString('es-MX')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 3: Consumo Zona (Market Size) */}
          {activeTab === 'mercado' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Hogares Estimados en la Zona</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: '4px 0' }}>
                  {localEstimates.estimatedHouseholds.toLocaleString()} hogares
                </div>
                
                <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 'bold' }}>
                  POTENCIAL DE CONSUMO COMERCIAL MENSUAL
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 950, color: 'white', margin: '4px 0' }}>
                  ${localEstimates.localMarketSizeMonthly.toLocaleString('es-MX')} MXN
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Demanda Estimada por Rubros en Zona:</span>
                {[
                  { label: "Alimentos", val: localEstimates.localMarketSizeMonthly * 0.35 },
                  { label: "Transporte/Celular", val: localEstimates.localMarketSizeMonthly * 0.19 },
                  { label: "Servicios/Luz/Agua", val: localEstimates.localMarketSizeMonthly * 0.10 },
                  { label: "Educación/Recreo", val: localEstimates.localMarketSizeMonthly * 0.12 }
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 'bold', color: 'white' }}>${Math.round(item.val).toLocaleString('es-MX')}</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                      <div style={{ width: `${100 * (item.val / localEstimates.localMarketSizeMonthly)}%`, height: '100%', background: '#38bdf8' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 4: Viabilidad y Diagnóstico de Competencia */}
          {activeTab === 'viabilidad' && viabilityData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Score de Viabilidad de Mercado</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: viabilityData.viabilityScore >= 70 ? '#22c55e' : (viabilityData.viabilityScore >= 45 ? '#f59e0b' : '#ef4444'), margin: '4px 0' }}>
                  {viabilityData.viabilityScore}/100
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                  {viabilityData.veredicto}
                </div>

                {searchStats && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '4px', marginTop: '8px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Desglose de Búsqueda del Agente:</div>
                    <div>🏛️ INEGI/DENUE: {searchStats.fuentesConsultadas?.denue || 0}</div>
                    <div>📍 Google Places: {searchStats.fuentesConsultadas?.google || 0}</div>
                    <div>🗺️ OSM / Maps: {searchStats.fuentesConsultadas?.osm || 0}</div>
                    <div>🦆 DuckDuckGo: {searchStats.fuentesConsultadas?.ddg || 0}</div>
                    <div>🤖 IA Sintética: {searchStats.fuentesConsultadas?.ia_synthetic || 0}</div>
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>Recomendaciones del Agente:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                  {viabilityData.recomendaciones?.map((rec, i) => (
                    <div key={i} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', borderLeft: '3px solid #38bdf8', color: 'white' }}>
                      {rec}
                    </div>
                  ))}
                  {viabilityData.competencia?.posiblesZombies > 0 && (
                    <div style={{ fontSize: '0.7rem', background: 'rgba(239,68,68,0.08)', padding: '6px', borderRadius: '4px', borderLeft: '3px solid #ef4444', color: '#f87171' }}>
                      ⚠️ Detección Zombie: Se detectaron {viabilityData.competencia.posiblesZombies} competidores registrados en INEGI sin presencia web activa (posibles cierres).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!readOnly && effectiveness && (
        <div className="glass-panel" style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.45rem' }}>Índice de Efectividad Territorial</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Puntaje global: <strong>{Number(effectiveness.effectivenessScore || 0).toFixed(1)}/100</strong> ·
            Competencia: <strong>{Number(effectiveness.competitionScore || 0).toFixed(1)}</strong> ·
            Cercanía a clientes: <strong>{Number(effectiveness.clientProximityScore || 0).toFixed(1)}</strong> ·
            Cercanía a proveedores: <strong>{Number(effectiveness.supplierProximityScore || 0).toFixed(1)}</strong>
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Distancia clientes: {effectiveness.clientDistanceKm == null || !Number.isFinite(Number(effectiveness.clientDistanceKm)) ? 'N/D' : `${Number(effectiveness.clientDistanceKm).toFixed(1)} km`} ·
            Distancia proveedores: {effectiveness.supplierDistanceKm == null || !Number.isFinite(Number(effectiveness.supplierDistanceKm)) ? 'N/D' : `${Number(effectiveness.supplierDistanceKm).toFixed(1)} km`}
          </div>
        </div>
      )}

      {!readOnly && businesses.length > 0 && (
        <div style={{ marginTop: '0.8rem', maxHeight: '220px', overflow: 'auto', border: '1px solid rgba(148,163,184,0.18)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(15,23,42,0.95)', zIndex: 5 }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Establecimiento / Razón Social</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Relación B2B</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Personal (DENUE)</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Facturación Est. (INEGI)</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Dist. Punto Óptimo</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {businesses
                .filter(item => {
                  if (b2bFilter === 'todos') return true;
                  return item.categoriaB2B === b2bFilter;
                })
                .slice(0, 50)
                .map((item, index) => (
                <tr key={`${item.nombre}_${index}`} style={{ borderTop: '1px solid rgba(148,163,184,0.1)', background: item.posibleZombie ? 'rgba(239,68,68,0.02)' : 'none' }}>
                  <td style={{ padding: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.colorBadge || item.color || '#ef4444' }}></span>
                      <strong>{item.nombre || 'Sin nombre'}</strong>
                    </div>
                    {item.razonSocial && item.razonSocial !== item.nombre && (
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '1px' }}>
                        {item.razonSocial}
                      </div>
                    )}
                    {item.direccion && (
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', marginTop: '2px', opacity: 0.8 }}>
                        {item.direccion}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '0.45rem' }}>
                    <span style={{
                      fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px',
                      background: `${item.colorBadge || '#3b82f6'}22`,
                      color: item.colorBadge || '#3b82f6',
                      fontWeight: 700
                    }}>
                      {item.tipoRelacion || 'Establecimiento'}
                    </span>
                    <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {item.actividad || 'Giro general'}
                    </div>
                  </td>

                  <td style={{ padding: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontWeight: 600 }}>
                      <Users size={13} style={{ color: '#818cf8' }} />
                      <span>{item.estrato || '1 a 5 personas'}</span>
                    </div>
                  </td>

                  <td style={{ padding: '0.45rem' }}>
                    <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.72rem' }}>
                      {item.financiero?.facturacionFormateada || '$1.4M MXN/año'}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
                      ~${Math.round((item.financiero?.facturacionMensualEstimadaPromedio || 116000) / 1000)}k/mes
                    </div>
                  </td>

                  <td style={{ padding: '0.45rem' }}>
                    <div style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.72rem' }}>
                      {item.distanciaPuntoOptimoKm != null ? `${item.distanciaPuntoOptimoKm} km` : 'En zona'}
                    </div>
                  </td>

                  <td style={{ padding: '0.45rem' }}>
                    <button
                      onClick={() => handleDeepAnalysis(item)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.65rem',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '4px',
                        color: '#38bdf8',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: 600
                      }}
                      onMouseOver={(e) => { e.target.style.background = '#38bdf8'; e.target.style.color = '#0f172a'; }}
                      onMouseOut={(e) => { e.target.style.background = 'rgba(56, 189, 248, 0.12)'; e.target.style.color = '#38bdf8'; }}
                    >
                      🔍 Investigar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Análisis Profundo */}
      {showEnrichModal && selectedCompetitor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1.5rem',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '650px',
            background: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 800 }}>Análisis Profundo por Agente IA</span>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>{selectedCompetitor.nombre}</h3>
              </div>
              <button
                onClick={() => setShowEnrichModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.15rem' }}
              >
                ✕
              </button>
            </div>

            {enriching ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
                <RefreshCw className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', color: '#38bdf8', marginBottom: '1rem' }} />
                <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 'bold' }}>El Agente está investigando la web...</span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px', textAlign: 'center', maxWidth: '300px' }}>
                  Buscando en Facebook, Instagram, Uber Eats, Rappi, TripAdvisor, Airbnb y MercadoLibre.
                </span>
              </div>
            ) : (
              <div>
                {/* Perfiles identificados */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>PERFILES DIGITALES DETECTADOS:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {enrichedData?.profiles && Object.entries(enrichedData.profiles).map(([key, val]) => {
                      if (!val) return null;
                      return (
                        <a
                          key={key}
                          href={val}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.65rem',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            color: '#38bdf8',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                          }}
                        >
                          🔗 {key}
                        </a>
                      );
                    })}
                    {enrichedData?.profiles && Object.values(enrichedData.profiles).every(v => !v) && (
                      <span style={{ fontSize: '0.72rem', color: '#f87171' }}>⚠️ Sin perfiles públicos activos detectados en la búsqueda de primer nivel.</span>
                    )}
                  </div>
                </div>

                {/* Métricas e Info de Scrapers */}
                {enrichedData?.scrapedData && Object.keys(enrichedData.scrapedData).length > 0 && (
                  <div style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>DATOS EXTRAÍDOS DE PLATAFORMAS:</span>
                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      {Object.entries(enrichedData.scrapedData).map(([platform, data]) => {
                        if (!data || !data.success) return null;
                        return (
                          <div key={platform} style={{ marginBottom: '4px' }}>
                            • <strong style={{ textTransform: 'capitalize', color: 'white' }}>{platform}</strong>: 
                            {data.followers && ` ${data.followers} `}
                            {data.rating && data.rating !== 'N/D' && ` · Calificación: ${data.rating} `}
                            {data.priceRange && data.priceRange !== 'N/D' && ` · Rango de precios: ${data.priceRange} `}
                            {data.pricePerNight && data.pricePerNight !== 'N/D' && ` · Precio/Noche: ${data.pricePerNight} `}
                            {data.products && ` (Catálogo de referencia: ${data.products.map(p => `${p.title}: ${p.price}`).join(', ')}) `}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SWOT / FODA IA Analysis */}
                {aiSwotAnalysis && (
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.15)', borderRadius: '6px', padding: '0.75rem' }}>
                        <h4 style={{ margin: '0 0 6px 0', color: '#4ade80', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>💪 Fortalezas</h4>
                        <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.7rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                          {aiSwotAnalysis.fortalezas?.map((f, i) => <li key={i} style={{ marginBottom: '4px' }}>{f}</li>)}
                        </ul>
                      </div>

                      <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px', padding: '0.75rem' }}>
                        <h4 style={{ margin: '0 0 6px 0', color: '#f87171', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠️ Debilidades</h4>
                        <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.7rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                          {aiSwotAnalysis.debilidades?.map((d, i) => <li key={i} style={{ marginBottom: '4px' }}>{d}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.12)', borderRadius: '6px', padding: '0.75rem' }}>
                      <h4 style={{ margin: '0 0 6px 0', color: '#38bdf8', fontSize: '0.78rem' }}>🎯 Recomendación Estratégica Contra Este Competidor</h4>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#e2e8f0', lineHeight: 1.45 }}>
                        {aiSwotAnalysis.estrategiaRecomendada}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
              <button
                onClick={() => setShowEnrichModal(false)}
                className="btn-primary"
                style={{
                  padding: '6px 16px',
                  fontSize: '0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: '#38bdf8',
                  color: '#0f172a',
                  border: 'none',
                  fontWeight: 'bold',
                }}
              >
                Entendido / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
