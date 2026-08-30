import { BOX_TYPES } from './boxes.js';

/**
 * Mapa selectivo: moduleKey → boxIds[]
 * Define qué boxes metodológicos aparecen en cada módulo específico.
 * Evita mostrar todos los boxes en todos los módulos.
 */
export const MODULE_BOX_MAP = {
  // ============ PLAN COMERCIAL (business) ============
  // Naturaleza
  introduccion: ['box_resumen_ejecutivo_1p'],
  identidad: ['box_resumen_ejecutivo_1p'],
  objetivos: [],
  foda: ['box_swot_foda'],
  pestel: [],
  legal: [],
  canvas: ['box_canvas_osterwalder', 'box_lean_canvas'],
  
  // Mercado
  analisis: ['box_tam_sam_som'],
  segmentacion: ['box_tam_sam_som'],
  mapa: [],
  competencia: ['box_swot_foda'],
  benchmarking: [],
  comercializacion: [],
  ventas: ['box_unit_economics', 'box_benchmark_cac_ltv'],
  
  // Técnico
  ubicacion: [],
  operacion: ['box_kpi_otd_dso_dio_ccc'],
  recursos: [],
  insumos: [],
  capacidad: ['box_kpi_otd_dso_dio_ccc'],
  operativa: ['box_kpi_otd_dso_dio_ccc'],
  ambiental: [],
  
  // Organización y Finanzas
  estructura: ['box_unit_economics', 'box_benchmark_cac_ltv'],
  recursos_humanos: ['box_unit_economics', 'box_benchmark_cac_ltv'],
  inversion: ['box_wacc_van_tir', 'box_tornado_sensibilidad'],
  costos: ['box_unit_economics'],
  estados_financieros: ['box_wacc_van_tir', 'box_tornado_sensibilidad', 'box_montecarlo_sim'],
  rentabilidad: ['box_wacc_van_tir', 'box_unit_economics', 'box_benchmark_cac_ltv'],
  simulador: ['box_wacc_van_tir', 'box_montecarlo_sim'],
  
  // ============ AGILE STARTUP ============
  // Validación
  canvas: ['box_lean_canvas', 'box_canvas_osterwalder'],
  buyer_persona: [],
  
  // Experimento
  mvp_design: ['box_mvp_protocol'],
  critical_hypotheses: ['box_mvp_protocol'],
  
  // Aprendizaje
  pilot_results: ['box_burn_runway'],
  pivot_persevere: ['box_burn_runway', 'box_mvp_protocol'],
  
  // Finanzas Ágiles
  unit_economics: ['box_unit_economics', 'box_benchmark_cac_ltv'],
  burn_rate: ['box_burn_runway', 'box_benchmark_cac_ltv'],
  simulador: ['box_burn_runway'],
  
  // ============ INVESTMENT PROJECT ============
  demanda: ['box_tam_sam_som'],
  oferta: [],
  ingenieria: [],
  layout: [],
  presupuesto: ['box_capex_csi_table'],
  cronograma: [],
  capital: ['box_wacc_van_tir'],
  deuda: ['box_wacc_van_tir'],
  sensibilidad: ['box_tornado_sensibilidad'],
  probabilidad: ['box_montecarlo_sim'],
  simulador: ['box_wacc_van_tir', 'box_montecarlo_sim'],
  
  // ============ SOCIAL BID ============
  involucrados: ['box_matriz_interes_poder'],
  arbol_problemas: ['box_arbol_problemas_mml'],
  arbol_objetivos: ['box_arbol_problemas_mml'],
  alternativas: ['box_arbol_problemas_mml'],
  fin_proposito: [],
  componentes: [],
  actividades: [],
  monitoreo: [],
  gobernanza: [],
  edt: [],
  riesgos: ['box_zopp_mpp_4x4'],
  comunicaciones: [],
  presupuesto_detallado: [],
  evaluacion_exante: [],
  sostenibilidad: [],
  
  // ============ TECHNOLOGY_ID ============
  tech_invention: ['box_trl_assessment'],
  property_intellectual: ['box_ipc_classifier'],
  technical_id: ['box_trl_assessment'],
  prototyping: ['box_trl_assessment'],
  tech_market: ['box_ipc_classifier'],
  transfer_model: ['box_ipc_classifier'],
  rse_impact: [],
  circular_economy: [],
  simulador: [],
  
  // ============ MICRO BUSINESS ============
  introduccion: ['box_apertura_30dias'],
  identidad: ['box_apertura_30dias'],
  clientes: ['box_apertura_30dias'],
  competencia: ['box_apertura_30dias'],
  comercializacion: ['box_apertura_30dias'],
  operacion: ['box_apertura_30dias'],
  recursos: ['box_apertura_30dias'],
  croquis: ['box_micro_canvas_3b'],
  inversion: ['box_apertura_30dias'],
  costos: ['box_micro_canvas_3b'],
  
  // ============ TECHNOLOGY_ID (duplicado, ya está arriba) ============
  // ... ya definido
  
  // ============ HOSHIN KANRI ============
  norte_verdadero: ['box_matriz_x_hoshin'],
  disrupcion: ['box_matriz_x_hoshin'],
  matriz_x: ['box_matriz_x_hoshin'],
  seguimiento: ['box_matriz_x_hoshin'],
  
  // ============ AMOEBA MANAGEMENT ============
  celulas: ['box_rentabilidad_hora_amoeba'],
  filosofia_corp: ['box_rentabilidad_hora_amoeba'],
  precios: ['box_rentabilidad_hora_amoeba'],
  rentabilidad: ['box_rentabilidad_hora_amoeba'],
  simulador: ['box_rentabilidad_hora_amoeba'],
  
  // ============ GUANXI PLAN ============
  mapa_relacional: ['box_mapa_guanxi_mianzi'],
  alineacion_estado: ['box_mapa_guanxi_mianzi'],
  favores: ['box_mapa_guanxi_mianzi'],
  mianzi: ['box_mapa_guanxi_mianzi'],
  
  // ============ ONUDI PROJECT ============
  tecnologia: [],
  costo_capital: ['box_fcff_onudi_model'],
  flujo_firma: ['box_fcff_onudi_model'],
  riesgo: ['box_fcff_onudi_model'],
  simulador: ['box_fcff_onudi_model'],
  
  // ============ ZOPP ============
  participacion: ['box_zopp_mpp_4x4'],
  problemas: ['box_zopp_mpp_4x4'],
  objetivos: ['box_zopp_mpp_4x4'],
  matriz_logica: ['box_zopp_mpp_4x4'],
  
  // ============ HORIZON EUROPE ============
  consorcio: ['box_dnsh_ue_6'],
  ciencia_abierta: ['box_dnsh_ue_6'],
  dnsh_principle: ['box_dnsh_ue_6'],
  impacto: ['box_dnsh_ue_6'],
};

/**
 * Obtiene los boxes para un módulo específico (solo los específicos, sin fallback global)
 * @param {string} moduleKey - Clave del módulo
 * @param {string} docType - Tipo de documento (fallback)
 * @returns {Array} Array de boxIds
 */
export function getBoxIdsForModule(moduleKey, docType = 'business') {
  // Primero buscar en el mapa específico
  const specificBoxes = MODULE_BOX_MAP[moduleKey];
  if (specificBoxes && specificBoxes.length > 0) {
    return specificBoxes;
  }
  
  // Fallback: usar boxes por tipo de documento (existente)
  // Esto se importa dinámicamente para evitar dependencias circulares
  return [];
}

/**
 * Obtiene los boxes para un tipo de documento (fallback global)
 * @param {string} docType 
 * @returns {Array}
 */
export function getGlobalBoxesForDocType(docType = 'business') {
  // Se resuelve dinámicamente para evitar import circular
  const { getBoxesForDocType } = require('./boxRegistry');
  return getBoxesForDocType(docType);
}

/**
 * Combina boxes específicos del módulo + fallback global
 * @param {string} moduleKey
 * @param {string} docType
 * @returns {Array} Box IDs únicos
 */
export function getCombinedBoxesForModule(moduleKey, docType = 'business') {
  const specific = getBoxIdsForModule(moduleKey, docType);
  const global = getGlobalBoxesForDocType(docType);
  
  // Combinar y deduplicar
  const combined = [...new Set([...specific, ...global])];
  return combined;
}