import React, { useEffect, useMemo, useRef, useState } from 'react';
import { geocodeMx, searchCompetenciaDENUE, getInegiMunicipio } from '../lib/inegi';
import { MapPin, Search, RefreshCw, AlertTriangle, Save, Check } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { useParams } from 'react-router-dom';

const DEFAULT_CENTER = { lat: 29.072967, lng: -110.955919, label: 'Hermosillo, Sonora' };
const SCIAN_PRESETS = [
  { label: '0 · Todos los sectores', value: '0' },
  { label: '11 · Agricultura, cría y explotación de animales, silvicultura', value: '11' },
  { label: '21 · Minería', value: '21' },
  { label: '22 · Generación de energía, agua y gas', value: '22' },
  { label: '23 · Construcción', value: '23' },
  { label: '31-33 · Industrias manufactureras', value: '31-33' },
  { label: '311 · Industria alimentaria', value: '311' },
  { label: '312 · Industria de las bebidas y del tabaco', value: '312' },
  { label: '315 · Fabricación de prendas de vestir', value: '315' },
  { label: '321 · Industria de la madera', value: '321' },
  { label: '322 · Industria del papel', value: '322' },
  { label: '325 · Industria química', value: '325' },
  { label: '332 · Fabricación de productos metálicos', value: '332' },
  { label: '333 · Fabricación de maquinaria y equipo', value: '333' },
  { label: '336 · Fabricación de equipo de transporte', value: '336' },
  { label: '43 · Comercio al por mayor', value: '43' },
  { label: '431 · Abarrotes, alimentos, bebidas, hielo y tabaco', value: '431' },
  { label: '46 · Comercio al por menor', value: '46' },
  { label: '461 · Comercio al por menor de abarrotes y alimentos', value: '461' },
  { label: '462 · Tiendas de autoservicio y departamentales', value: '462' },
  { label: '463 · Comercio al por menor de artículos para la salud', value: '463' },
  { label: '464 · Comercio al por menor de papelería y esparcimiento', value: '464' },
  { label: '465 · Comercio al por menor de ropa y calzado', value: '465' },
  { label: '466 · Comercio de artículos para el hogar', value: '466' },
  { label: '467 · Comercio de ferretería y tlapalería', value: '467' },
  { label: '468 · Comercio de vehículos, refacciones, combustibles', value: '468' },
  { label: '48-49 · Transportes, correos y almacenamiento', value: '48-49' },
  { label: '484 · Autotransporte de carga', value: '484' },
  { label: '51 · Información en medios masivos', value: '51' },
  { label: '511 · Edición de software y publicaciones', value: '511' },
  { label: '512 | Industria fílmica y de sonido', value: '512' },
  { label: '52 · Servicios financieros y de seguros', value: '52' },
  { label: '522 · Instituciones de intermediación crediticia y financiera', value: '522' },
  { label: '524 · Seguros, fianzas, y administración de fondos', value: '524' },
  { label: '53 · Servicios inmobiliarios y de alquiler de bienes muebles', value: '53' },
  { label: '531 · Servicios inmobiliarios', value: '531' },
  { label: '54 · Servicios profesionales, científicos y técnicos', value: '54' },
  { label: '541 · Servicios legales, contables, arquitectura e ingeniería', value: '541' },
  { label: '55 · Corporativos', value: '55' },
  { label: '56 · Servicios de apoyo a los negocios y manejo de residuos', value: '56' },
  { label: '561 · Servicios de apoyo a los negocios', value: '561' },
  { label: '61 · Servicios educativos', value: '61' },
  { label: '611 · Servicios educativos', value: '611' },
  { label: '62 · Servicios de salud y de asistencia social', value: '62' },
  { label: '621 · Servicios médicos de consulta externa y servicios relacionados', value: '621' },
  { label: '622 · Hospitales', value: '622' },
  { label: '71 · Servicios artísticos, culturales y deportivos', value: '71' },
  { label: '711 · Servicios artísticos, culturales y deportivos, y otros servicios', value: '711' },
  { label: '72 · Servicios de alojamiento temporal y de preparación de alimentos', value: '72' },
  { label: '722 · Servicios de preparación de alimentos y bebidas', value: '722' },
  { label: '81 · Otros servicios excepto actividades gubernamentales', value: '81' },
  { label: '811 · Servicios de reparación y mantenimiento', value: '811' },
  { label: '812 · Servicios personales (estéticas, lavanderías, etc.)', value: '812' },
  { label: '813 · Asociaciones y organizaciones', value: '813' },
  { label: '93 · Actividades legislativas, gubernamentales, impartición de justicia', value: '93' }
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
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersSourceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const heatmapLayerRef = useRef(null);
  const polygonSourceRef = useRef(null);
  const drawInteractionRef = useRef(null);

  const { updateSection } = usePlan();
  const { pillarId, moduleId } = useParams();

  const [queryLocation, setQueryLocation] = useState(location || DEFAULT_CENTER.label);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [scian, setScian] = useState('52');
  const [radius, setRadius] = useState(2500);
  const [center, setCenter] = useState(DEFAULT_CENTER);
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

  // Advanced demographic & heatmap states
  const [munData, setMunData] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(defaultHeatmap);
  const [activeTab, setActiveTab] = useState('demografia');

  const canSearch = useMemo(() => Number(radius) > 0, [radius]);

  // Dynamically calculate local estimates based on municipality data, search geometry, and business density
  const localEstimates = useMemo(() => {
    if (!munData) return null;

    let areaKm2 = 0;
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
    
    // Density scaling factor
    const concentrationFactor = densityLocalBus > 0 
      ? Math.max(1.0, Math.min(50.0, densityLocalBus / densityMunBus)) 
      : 1.0;

    const munDensity = munData.densidad_poblacion_km2 || 60;
    
    let estimatedPop = areaKm2 * munDensity * concentrationFactor;
    // Scale population based on urban average baseline (Hermosillo urban ~3200 people/km2) if dense commercial activity detected
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

  useEffect(() => {
    if (!window.ol || mapInstance.current || !mapRef.current) return;

    const baseLayer = new window.ol.layer.Tile({ source: new window.ol.source.OSM() });
    const inegiSource = new window.ol.source.TileWMS({
      url: 'https://mapaserver.inegi.org.mx/wms/mapabase/c611',
      params: { LAYERS: 'limite_estatal,limite_municipal', TILED: true },
      serverType: 'geoserver',
      transition: 0,
    });

    const inegiLayer = new window.ol.layer.Tile({ source: inegiSource, opacity: 0.55 });

    const markerSource = new window.ol.source.Vector();
    markersSourceRef.current = markerSource;

    const markerLayer = new window.ol.layer.Vector({
      source: markerSource,
      style: new window.ol.style.Style({
        image: new window.ol.style.Circle({
          radius: 5,
          fill: new window.ol.style.Fill({ color: '#ef4444' }),
          stroke: new window.ol.style.Stroke({ color: '#ffffff', width: 1.5 })
        })
      })
    });
    markersLayerRef.current = markerLayer;

    // Create OpenLayers Heatmap layer pointing to the same Vector source
    const heatmapLayer = new window.ol.layer.Heatmap({
      source: markerSource,
      blur: 18,
      radius: 14,
      weight: function (feature) {
        // Exclude the user's business pin from the heatmap distribution
        return feature.get('isMain') ? 0.0 : 0.8;
      }
    });
    heatmapLayerRef.current = heatmapLayer;

    // Set initial layer visibilities
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
      layers: [baseLayer, inegiLayer, markerLayer, heatmapLayer, polygonLayer],
      view: new window.ol.View({
        center: window.ol.proj.fromLonLat([DEFAULT_CENTER.lng, DEFAULT_CENTER.lat]),
        zoom: 11,
      }),
    });

    setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.updateSize();
      }
    }, 800);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(null);
        mapInstance.current = null;
      }
    };
  }, []);

  // Update layer visibility when showHeatmap state changes
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
    setStatus('Trazando: Haz clic en el mapa para añadir vértices. Doble clic para terminar el polígono.');

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
    if (!canSearch) return;
    setLoading(true);
    setError('');
    setStatus('Filtrando competencia en la zona dibujada...');
    try {
      const targetCenter = await resolveCenter();
      const query = (scian && scian !== '0')
        ? `${scian} ${keywords || ''}`.trim()
        : (keywords || 'todos');
      
      const result = await searchCompetenciaDENUE(token, targetCenter.lat, targetCenter.lng, 5000, query);
      if (!result.success) throw new Error(result.error || 'Error consultando DENUE');

      const inside = (result.businesses || []).filter(b => isPointInPolygon([b.lng, b.lat], coords));
      setBusinesses(inside);
      drawBusinesses(inside, targetCenter.lat, targetCenter.lng);

      // Fetch Demographics
      const munName = extractMunicipality(targetCenter.label);
      const munRes = await getInegiMunicipio(munName);
      if (munRes.success) {
        setMunData(munRes.data);
      } else {
        setMunData(null);
      }

      setStatus(`Zona trazada: se detectaron ${inside.length} establecimientos dentro de la zona.`);
      
      const [clientGeo, supplierGeo] = await Promise.all([
        geocodeMx(clientLoc),
        geocodeMx(supplierLoc),
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
    setLoadingGeo(true);
    setError('');
    try {
      const geo = await geocodeMx(targetLoc || DEFAULT_CENTER.label);
      if (!geo.success) throw new Error(geo.error || 'No se pudo geocodificar la ubicación.');
      const next = { lat: geo.lat, lng: geo.lng, label: geo.displayName || targetLoc };
      setCenter(next);
      setStatus(`Zona cargada: ${next.label}`);
      setMapCenter(next.lat, next.lng);
      return next;
    } catch (e) {
      setError(e.message || 'Error geocodificando ubicación');
      return center;
    } finally {
      setLoadingGeo(false);
    }
  };

  const drawBusinesses = (list, centerLat, centerLng) => {
    if (!window.ol || !markersSourceRef.current) return;
    markersSourceRef.current.clear();

    const features = [];

    if (centerLat != null && centerLng != null && Number.isFinite(centerLat) && Number.isFinite(centerLng)) {
      const centerFeature = new window.ol.Feature({
        geometry: new window.ol.geom.Point(window.ol.proj.fromLonLat([centerLng, centerLat])),
        name: 'Ubicación de Mi Negocio',
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

    list
      .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
      .forEach((item) => {
        const feat = new window.ol.Feature({
          geometry: new window.ol.geom.Point(window.ol.proj.fromLonLat([item.lng, item.lat])),
          name: item.nombre,
        });
        feat.setStyle(new window.ol.style.Style({
          image: new window.ol.style.Circle({
            radius: 5,
            fill: new window.ol.style.Fill({ color: '#ef4444' }),
            stroke: new window.ol.style.Stroke({ color: '#ffffff', width: 1.5 })
          })
        }));
        feat.set('isMain', false);
        features.push(feat);
      });

    markersSourceRef.current.addFeatures(features);
  };

  const runSearch = async (locOverride) => {
    if (!canSearch) {
      setError('Configura un radio válido para analizar competencia.');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Consultando DENUE...');

    try {
      const targetCenter = await resolveCenter(locOverride || queryLocation);

      const query = (scian && scian !== '0')
        ? `${scian} ${keywords || ''}`.trim()
        : (keywords || 'todos');
      const result = await searchCompetenciaDENUE(token, targetCenter.lat, targetCenter.lng, Number(radius), query);

      if (!result.success) throw new Error(result.error || 'Error consultando DENUE');

      let rawBusinesses = result.businesses || [];
      
      if (polygonCoords) {
        rawBusinesses = rawBusinesses.filter(b => isPointInPolygon([b.lng, b.lat], polygonCoords));
        setStatus(`Zona delimitada: se detectaron ${rawBusinesses.length} establecimientos en el área dibujada.`);
      }

      setBusinesses(rawBusinesses);
      drawBusinesses(rawBusinesses, targetCenter.lat, targetCenter.lng);

      // Fetch Demographics
      const munName = extractMunicipality(targetCenter.label);
      const munRes = await getInegiMunicipio(munName);
      if (munRes.success) {
        setMunData(munRes.data);
      } else {
        setMunData(null);
      }

      if (mode === 'location') {
        setStatus(`Zona validada para localización: ${targetCenter.label}. Se detectaron ${rawBusinesses.length} establecimientos en el área.`);
        const densityScore = Math.min(100, rawBusinesses.length * 5);
        setEffectiveness({
          competitionScore: densityScore,
          clientProximityScore: 100,
          supplierProximityScore: 100,
          effectivenessScore: densityScore,
          clientDistanceKm: null,
          supplierDistanceKm: null,
        });
        return;
      }

      setStatus(`Competencia detectada: ${rawBusinesses.length} negocios dentro de ${radius}m.`);

      const [clientGeo, supplierGeo] = await Promise.all([
        geocodeMx(clientLoc),
        geocodeMx(supplierLoc),
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
        competitionScore,
        clientProximityScore,
        supplierProximityScore,
        effectivenessScore,
        clientDistanceKm,
        supplierDistanceKm,
      });
    } catch (e) {
      setError(e.message || 'No se pudo consultar DENUE');
      setStatus('');
      setBusinesses([]);
      drawBusinesses([], center.lat, center.lng);
      if (mode === 'competition' && manualCompetitors !== '') {
        const manualCount = Number(manualCompetitors);
        const fallbackCount = Number.isFinite(manualCount) && manualCount >= 0 ? manualCount : 0;
        const competitionScore = Math.max(0, 100 - fallbackCount * 5);
        setEffectiveness({
          competitionScore,
          clientProximityScore: 50,
          supplierProximityScore: 50,
          effectivenessScore: (competitionScore * 0.45) + (50 * 0.35) + (50 * 0.2),
          clientDistanceKm: null,
          supplierDistanceKm: null,
        });
        setStatus(`API DENUE no disponible. Se usó competidores manuales: ${fallbackCount}.`);
      } else {
        setEffectiveness(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveToPlan = () => {
    let content = `### Análisis de Competencia y Ubicación Geoespacial (INEGI - DENUE)\n\n`;
    content += `- **Ubicación de referencia (Centro):** ${center.label || `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`}\n`;
    
    if (polygonCoords) {
      content += `- **Método de delimitación comercial:** Polígono personalizado de trazado manual (${polygonCoords.length} vértices)\n`;
    } else {
      content += `- **Radio de búsqueda de competencia:** ${radius} metros\n`;
    }

    if (mode === 'competition') {
      const selectedScian = SCIAN_PRESETS.find(s => s.value === scian)?.label || scian;
      content += `- **Giro / Sector SCIAN analizado:** ${selectedScian}\n`;
      if (keywords) content += `- **Palabras clave de búsqueda:** ${keywords}\n`;
      content += `- **Ubicación de clientes promedio:** ${clientLoc}\n`;
      content += `- **Ubicación de proveedores clave:** ${supplierLoc}\n`;
      if (manualCompetitors !== '') content += `- **Competidores manuales declarados:** ${manualCompetitors}\n`;
    } else {
      if (keywords) content += `- **Descripción de la zona / Giro:** ${keywords}\n`;
    }

    if (effectiveness) {
      content += `\n#### Índice de Efectividad Territorial\n\n`;
      content += `El análisis geoespacial arroja una viabilidad territorial con los siguientes indicadores ponderados:\n\n`;
      content += `- **Puntaje Global de Efectividad:** **${effectiveness.effectivenessScore.toFixed(1)}/100**\n`;
      content += `- **Nivel de Competencia (Baja saturación):** ${effectiveness.competitionScore.toFixed(1)}/100\n`;
      content += `- **Cercanía/Accesibilidad a Clientes:** ${effectiveness.clientProximityScore.toFixed(1)}/100\n`;
      content += `- **Cercanía/Logística con Proveedores:** ${effectiveness.supplierProximityScore.toFixed(1)}/100\n`;
      content += `- **Distancia estimada a Clientes:** ${effectiveness.clientDistanceKm == null ? 'N/D' : `${effectiveness.clientDistanceKm.toFixed(2)} km`}\n`;
      content += `- **Distancia estimada a Proveedores:** ${effectiveness.supplierDistanceKm == null ? 'N/D' : `${effectiveness.supplierDistanceKm.toFixed(2)} km`}\n`;
      content += `\n*Fórmula del Índice: 45% competencia + 35% cercanía a clientes + 20% cercanía a proveedores.*\n`;
    }

    if (munData && localEstimates) {
      content += `\n#### Perfil Socio-Demográfico Estimado en la Zona (INEGI CPV 2020)\n\n`;
      content += `Basado en los indicadores consolidados del municipio de **${munData.desc_municipio}**:\n\n`;
      content += `- **Área de la zona delimitada:** ${localEstimates.areaKm2.toFixed(3)} km²\n`;
      content += `- **Población total estimada en la zona:** ${localEstimates.estimatedPop.toLocaleString()} habitantes\n`;
      content += `- **Hogares estimados en la zona:** ${localEstimates.estimatedHouseholds.toLocaleString()} hogares (promedio de ${munData.tamano_hogar_promedio?.toFixed(1) || '3.3'} personas por hogar)\n`;
      content += `- **Edad mediana de la población:** ${munData.edad_mediana || '30'} años\n`;
      content += `- **Grado promedio de escolaridad:** ${munData.escolaridad_promedio?.toFixed(1) || '11.3'} años cursados (nivel preparatoria/bachillerato)\n`;
      content += `- **Conectividad en los hogares de la zona:**\n`;
      content += `  - Disponibilidad de Internet: **${munData.pct_internet?.toFixed(1) || '70.4'}%**\n`;
      content += `  - Disponibilidad de Computadora/PC: **${munData.pct_computadora?.toFixed(1) || '53.7'}%**\n`;
      content += `  - Disponibilidad de Celular: **${munData.pct_celular?.toFixed(1) || '95.0'}%**\n`;

      content += `\n#### Estimación de Ingresos y Gasto Mensual (ENIGH 2024)\n\n`;
      content += `- **Ingreso promedio mensual por hogar:** $${localEstimates.avgIncome.toLocaleString('es-MX')} MXN\n`;
      content += `- **Gasto promedio mensual por hogar:** $${localEstimates.avgExpenditure.toLocaleString('es-MX')} MXN (72% del ingreso)\n`;
      content += `- **Potencial de Consumo Mensual de la Zona (Market Size):** **$${localEstimates.localMarketSizeMonthly.toLocaleString('es-MX')} MXN/mes**\n\n`;
      
      content += `Distribución estimada del gasto corriente mensual en la zona:\n\n`;
      content += `| Categoría de Gasto | % del Gasto | Gasto Promedio por Hogar | Gasto Total Estimado en la Zona |\n`;
      content += `| :--- | :---: | :---: | :---: |\n`;
      
      const cats = {
        "alimentos_bebidas": "Alimentos, Bebidas y Tabaco",
        "transporte_comunicaciones": "Transporte y Comunicaciones",
        "vivienda_servicios": "Vivienda y Servicios (Luz, agua, gas)",
        "educacion_esparcimiento": "Educación y Esparcimiento",
        "cuidados_personales": "Cuidados Personales",
        "vestido_calzado": "Vestido y Calzado",
        "transferencias_gasto": "Transferencias de Gasto",
        "salud": "Cuidados de la Salud",
        "otros": "Regalos y Otros"
      };

      Object.entries(cats).forEach(([key, label]) => {
        const pct = munData.distribucion_gasto_porcentaje[key];
        const pesosHogar = munData.gasto_mensual_pesos_por_categoria[key];
        const pesosTotalZona = pesosHogar * localEstimates.estimatedHouseholds;
        content += `| ${label} | ${pct}% | $${pesosHogar.toLocaleString('es-MX')} | $${pesosTotalZona.toLocaleString('es-MX')} |\n`;
      });
      content += `\n*Fórmula del Gasto: Proyecciones basadas en encuestas ENIGH 2024 de INEGI del estado de Sonora.*\n`;
    }

    if (businesses.length > 0) {
      content += `\n#### Establecimientos y Competidores en el Área\n\n`;
      content += `Se detectaron **${businesses.length}** establecimientos comerciales o de servicios en la zona de influencia. A continuación se listan los principales:\n\n`;
      content += `| Establecimiento | Actividad / Giro | Clase SCIAN | Estrato (Empleados) | Dirección / Razón Social |\n`;
      content += `| :--- | :--- | :--- | :--- | :--- |\n`;
      businesses.slice(0, 30).forEach(b => {
        const cleanNombre = (b.nombre || 'Sin nombre').replace(/\|/g, '\\|');
        const cleanActividad = (b.actividad || 'N/D').replace(/\|/g, '\\|');
        const cleanScian = (b.scianClase || b.scianSector || 'N/D').replace(/\|/g, '\\|');
        const cleanEstrato = (b.estrato || 'N/D').replace(/\|/g, '\\|');
        const cleanDir = (b.direccion || 'N/D').replace(/\|/g, '\\|');
        content += `| ${cleanNombre} | ${cleanActividad} | ${cleanScian} | ${cleanEstrato} | ${cleanDir} |\n`;
      });
      if (businesses.length > 30) {
        content += `\n*Nota: Se muestran los primeros 30 de ${businesses.length} establecimientos detectados.*\n`;
      }
    } else {
      content += `\n*No se detectaron otros competidores directos/indirectos en el radio especificado.*\n`;
    }

    let targetPillar = pillarId || 'tecnico';
    let targetModule = moduleId || 'ubicacion';
    let targetField = 'local';

    if (targetPillar === 'tecnico' && targetModule === 'ubicacion') {
      targetField = 'local';
    } else if (targetPillar === 'mercado' && targetModule === 'competencia') {
      targetField = 'competidores';
    } else if (targetPillar === 'mercado' && targetModule === 'mapa') {
      targetField = 'analisis_espacial';
    } else {
      if (mode === 'location') {
        targetPillar = 'tecnico';
        targetModule = 'ubicacion';
        targetField = 'local';
      } else {
        targetPillar = 'mercado';
        targetModule = 'competencia';
        targetField = 'competidores';
      }
    }

    updateSection(targetPillar, targetModule, targetField, content);
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
    runSearch(location || queryLocation);
    initializedRef.current = true;
  }, [token]);

  return (
    <div className={readOnly ? "" : "glass-panel"} style={{ padding: readOnly ? '0' : '1rem', marginTop: '1rem', position: 'relative' }}>
      {!readOnly && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 0.7fr auto', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <input
              className="form-control"
              value={queryLocation}
              onChange={(e) => setQueryLocation(e.target.value)}
              placeholder="Ej: Hermosillo, Sonora"
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
            <button className="btn btn-secondary" onClick={() => runSearch()} disabled={loading || loadingGeo} title="Consultar DENUE">
              {(loading || loadingGeo) ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              <span>{mode === 'competition' ? 'Analizar' : 'Ubicar'}</span>
            </button>
          </div>
          {mode === 'competition' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.8fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
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
                placeholder="Ubicación promedio de clientes"
              />
              <input
                className="form-control"
                value={supplierLoc}
                onChange={(e) => setSupplierLoc(e.target.value)}
                placeholder="Ubicación de proveedores clave"
              />
              <input
                type="number"
                className="form-control"
                value={manualCompetitors}
                min={0}
                onChange={(e) => setManualCompetitors(e.target.value)}
                placeholder="Competidores (manual)"
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Herramientas de Análisis Espacial:</span>
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
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', border: '1px solid var(--accent-color)' }}
            >
              <span>🔥</span>
              <span>{showHeatmap ? 'Ver Pines Individuales' : 'Ver Mapa de Calor'}</span>
            </button>
            <button
              className={`btn ${useOfficialIframe ? 'btn-ia' : 'btn-secondary'}`}
              onClick={() => setUseOfficialIframe(!useOfficialIframe)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', marginLeft: 'auto', background: useOfficialIframe ? '#1e40af' : '' }}
            >
              <span>🌐</span>
              <span>{useOfficialIframe ? 'Volver al Mapa Básico' : 'Abrir DENUE Oficial (Polígonos y Población)'}</span>
            </button>
          </div>

          {!token && !useOfficialIframe && (
            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.8rem' }}>
              <AlertTriangle size={14} /> Token INEGI/DENUE no configurado. Se usará la base de datos local (Hermosillo).
            </div>
          )}

          {(status || error) && (
            <div style={{ marginBottom: '0.65rem', fontSize: '0.78rem', color: error ? '#ef4444' : 'var(--text-secondary)' }}>
              {error || status}
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
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
              transition: 'background-color 0.3s ease'
            }} 
            onClick={saveToPlan}
          >
            {saveSuccess ? <Check size={14} /> : <Save size={14} />}
            <span>{saveSuccess ? '¡Guardado en el Plan!' : 'Guardar Análisis en el Plan'}</span>
          </button>
        </div>
      )}

      {/* Advanced Demographic Dashboard */}
      {!readOnly && munData && localEstimates && (
        <div className="glass-panel" style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📊 Dashboard Geo-Demográfico y Económico (INEGI)
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Municipio: <strong>{munData.desc_municipio}</strong>
            </span>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
            <button 
              onClick={() => setActiveTab('demografia')}
              style={{
                background: 'none', border: 'none', color: activeTab === 'demografia' ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'demografia' ? 'bold' : 'normal', borderBottom: activeTab === 'demografia' ? '2px solid var(--accent-color)' : 'none',
                paddingBottom: '0.2rem', fontSize: '0.76rem', cursor: 'pointer'
              }}
            >
              👥 Demografía
            </button>
            <button 
              onClick={() => setActiveTab('ingresos')}
              style={{
                background: 'none', border: 'none', color: activeTab === 'ingresos' ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'ingresos' ? 'bold' : 'normal', borderBottom: activeTab === 'ingresos' ? '2px solid var(--accent-color)' : 'none',
                paddingBottom: '0.2rem', fontSize: '0.76rem', cursor: 'pointer'
              }}
            >
              💵 Ingresos y Gastos
            </button>
            <button 
              onClick={() => setActiveTab('mercado')}
              style={{
                background: 'none', border: 'none', color: activeTab === 'mercado' ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'mercado' ? 'bold' : 'normal', borderBottom: activeTab === 'mercado' ? '2px solid var(--accent-color)' : 'none',
                paddingBottom: '0.2rem', fontSize: '0.76rem', cursor: 'pointer'
              }}
            >
              📈 Consumo de la Zona
            </button>
          </div>

          {/* Tab Content 1: Demografia */}
          {activeTab === 'demografia' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Población Estimada en Zona</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: '4px 0' }}>
                  {localEstimates.estimatedPop.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Área: {localEstimates.areaKm2.toFixed(3)} km²
                </div>
                
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Hombres: {(100 * (munData.poblacion_hombres / (munData.poblacion_total || 1))).toFixed(1)}%</span>
                    <span>Mujeres: {(100 * (munData.poblacion_mujeres / (munData.poblacion_total || 1))).toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${100 * (munData.poblacion_hombres / (munData.poblacion_total || 1))}%`, height: '100%', background: '#3b82f6' }}></div>
                    <div style={{ width: `${100 * (munData.poblacion_mujeres / (munData.poblacion_total || 1))}%`, height: '100%', background: '#ec4899' }}></div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Edad Mediana:</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'white' }}>{munData.edad_mediana || '30'} años</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Escolaridad Promedio:</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'white' }}>{munData.escolaridad_promedio?.toFixed(1) || '11.3'} años</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Viviendas con Internet:</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'white' }}>{munData.pct_internet?.toFixed(1) || '70.4'}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Viviendas con PC/Laptop:</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'white' }}>{munData.pct_computadora?.toFixed(1) || '53.7'}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Ingresos y Gastos */}
          {activeTab === 'ingresos' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Ingreso Promedio Hogar/Mes</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-color)', margin: '4px 0' }}>
                  ${localEstimates.avgIncome.toLocaleString('es-MX')} MXN
                </div>
                
                <div style={{ marginTop: '0.85rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Gasto Promedio Hogar/Mes</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>
                  ${localEstimates.avgExpenditure.toLocaleString('es-MX')} MXN
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  Ahorro/Otros: 28%
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '130px', overflowY: 'auto' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '2px' }}>Gasto Mensual por Hogar (ENIGH 2024):</span>
                {[
                  { label: "🍔 Alimentos y Bebidas (35%)", val: munData.gasto_mensual_pesos_por_categoria.alimentos_bebidas },
                  { label: "🚗 Transporte y Comunicación (19%)", val: munData.gasto_mensual_pesos_por_categoria.transporte_comunicaciones },
                  { label: "🏠 Vivienda y Servicios (10%)", val: munData.gasto_mensual_pesos_por_categoria.vivienda_servicios },
                  { label: "🎓 Educación y Esparcimiento (12%)", val: munData.gasto_mensual_pesos_por_categoria.educacion_esparcimiento },
                  { label: "💆 Cuidados Personales (8%)", val: munData.gasto_mensual_pesos_por_categoria.cuidados_personales }
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', background: 'rgba(255,255,255,0.02)', padding: '2px 4px', borderRadius: '3px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>${item.val.toLocaleString('es-MX')}</span>
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
                
                <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                  POTENCIAL DE CONSUMO MENSUAL (Zona)
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'white', margin: '4px 0' }}>
                  ${localEstimates.localMarketSizeMonthly.toLocaleString('es-MX')} MXN
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Consumo comercial total estimado mensual en el área
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Demanda en la Zona por Rubro:</span>
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
                      <div style={{ width: `${100 * (item.val / localEstimates.localMarketSizeMonthly)}%`, height: '100%', background: 'var(--accent-color)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!readOnly && effectiveness && (
        <div className="glass-panel" style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.45rem' }}>Índice de Efectividad Territorial</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Puntaje global: <strong>{effectiveness.effectivenessScore.toFixed(1)}/100</strong> ·
            Competencia: <strong>{effectiveness.competitionScore.toFixed(1)}</strong> ·
            Cercanía a clientes: <strong>{effectiveness.clientProximityScore.toFixed(1)}</strong> ·
            Cercanía a proveedores: <strong>{effectiveness.supplierProximityScore.toFixed(1)}</strong>
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Distancia clientes: {effectiveness.clientDistanceKm == null ? 'N/D' : `${effectiveness.clientDistanceKm.toFixed(1)} km`} ·
            Distancia proveedores: {effectiveness.supplierDistanceKm == null ? 'N/D' : `${effectiveness.supplierDistanceKm.toFixed(1)} km`}
          </div>
          <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', opacity: 0.85 }}>
            Fórmula: 45% baja competencia + 35% cercanía a clientes + 20% cercanía a proveedores.
          </div>
        </div>
      )}

      {!readOnly && businesses.length > 0 && (
        <div style={{ marginTop: '0.8rem', maxHeight: '180px', overflow: 'auto', border: '1px solid rgba(148,163,184,0.18)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(15,23,42,0.9)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.45rem' }}>Negocio</th>
                <th style={{ textAlign: 'left', padding: '0.45rem' }}>Actividad</th>
                <th style={{ textAlign: 'left', padding: '0.45rem' }}>SCIAN</th>
                <th style={{ textAlign: 'left', padding: '0.45rem' }}>Estrato</th>
              </tr>
            </thead>
            <tbody>
              {businesses.slice(0, 30).map((item, index) => (
                <tr key={`${item.nombre}_${index}`} style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>
                  <td style={{ padding: '0.4rem' }}>
                    <strong>{item.nombre || 'Sin nombre'}</strong>
                    {item.direccion && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px', opacity: 0.8 }}>
                        {item.direccion}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.4rem' }}>{item.actividad || 'N/D'}</td>
                  <td style={{ padding: '0.4rem' }}>{item.scianClase || item.scianSector || 'N/D'}</td>
                  <td style={{ padding: '0.4rem' }}>{item.estrato || 'N/D'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
