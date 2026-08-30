import { getBoxesForDocType } from './boxRegistry.js';

/**
 * Mapa selectivo: moduleKey → boxIds[]
 * Define qué boxes metodológicos aparecen en cada módulo específico.
 * Evita mostrar todos los boxes en todos los módulos.
 * 
 * Las claves usan el formato "tipoDoc:moduleKey" para evitar colisiones
 * entre frameworks que comparten nombres de módulos (ej. "business:canvas" vs "agile_startup:canvas")
 */
export const MODULE_BOX_MAP = {
  // ============ PLAN COMERCIAL (business) ============
  // Naturaleza
  'business:introduccion': ['box_resumen_ejecutivo_1p'],
  'business:identidad': ['box_resumen_ejecutivo_1p'],
  'business:objetivos': [],
  'business:foda': ['box_swot_foda'],
  'business:pestel': [],
  'business:legal': [],
  'business:canvas': ['box_canvas_osterwalder', 'box_lean_canvas'],
  
  // Mercado
  'business:analisis': ['box_tam_sam_som'],
  'business:segmentacion': ['box_tam_sam_som'],
  'business:mapa': [],
  'business:competencia': ['box_swot_foda'],
  'business:benchmarking': [],
  'business:comercializacion': [],
  'business:ventas': ['box_unit_economics', 'box_benchmark_cac_ltv'],
  
  // Técnico
  'business:ubicacion': [],
  'business:operacion': ['box_kpi_otd_dso_dio_ccc'],
  'business:recursos': [],
  'business:insumos': [],
  'business:capacidad': ['box_kpi_otd_dso_dio_ccc'],
  'business:operativa': ['box_kpi_otd_dso_dio_ccc'],
  'business:ambiental': [],
  
  // Organización y Finanzas
  'business:estructura': ['box_unit_economics', 'box_benchmark_cac_ltv'],
  'business:recursos_humanos': ['box_unit_economics', 'box_benchmark_cac_ltv'],
  'business:inversion': ['box_wacc_van_tir', 'box_tornado_sensibilidad'],
  'business:costos': ['box_unit_economics'],
  'business:estados_financieros': ['box_wacc_van_tir', 'box_tornado_sensibilidad', 'box_montecarlo_sim'],
  'business:rentabilidad': ['box_wacc_van_tir', 'box_unit_economics', 'box_benchmark_cac_ltv'],
  'business:simulador': ['box_wacc_van_tir', 'box_montecarlo_sim'],
  
  // ============ AGILE STARTUP ============
  // Validación
  'agile_startup:canvas': ['box_lean_canvas', 'box_canvas_osterwalder'],
  'agile_startup:buyer_persona': [],
  
  // Experimento
  'agile_startup:mvp_design': ['box_mvp_protocol'],
  'agile_startup:critical_hypotheses': ['box_mvp_protocol'],
  
  // Aprendizaje
  'agile_startup:pilot_results': ['box_burn_runway'],
  'agile_startup:pivot_persevere': ['box_burn_runway', 'box_mvp_protocol'],
  
  // Finanzas Ágiles
  'agile_startup:unit_economics': ['box_unit_economics', 'box_benchmark_cac_ltv'],
  'agile_startup:burn_rate': ['box_burn_runway', 'box_benchmark_cac_ltv'],
  'agile_startup:simulador': ['box_burn_runway'],
  
  // ============ INVESTMENT PROJECT ============
  'investment_project:demanda': ['box_tam_sam_som'],
  'investment_project:oferta': [],
  'investment_project:ingenieria': [],
  'investment_project:layout': ['box_layout_industrial'],
  'investment_project:presupuesto': ['box_capex_csi_table'],
  'investment_project:cronograma': [],
  'investment_project:capital': ['box_wacc_van_tir'],
  'investment_project:deuda': ['box_wacc_van_tir'],
  'investment_project:sensibilidad': ['box_tornado_sensibilidad'],
  'investment_project:probabilidad': ['box_montecarlo_sim'],
  'investment_project:simulador': ['box_wacc_van_tir', 'box_montecarlo_sim'],
  
  // ============ SOCIAL BID ============
  'social_bid:involucrados': ['box_matriz_interes_poder'],
  'social_bid:arbol_problemas': ['box_arbol_problemas_mml'],
  'social_bid:arbol_objetivos': ['box_arbol_problemas_mml'],
  'social_bid:alternativas': ['box_arbol_problemas_mml'],
  'social_bid:fin_proposito': [],
  'social_bid:componentes': [],
  'social_bid:actividades': [],
  'social_bid:monitoreo': [],
  'social_bid:gobernanza': [],
  'social_bid:edt': [],
  'social_bid:riesgos': ['box_zopp_mpp_4x4'],
  'social_bid:comunicaciones': [],
  'social_bid:presupuesto_detallado': [],
  'social_bid:evaluacion_exante': [],
  'social_bid:sostenibilidad': [],
  
  // ============ TECHNOLOGY_ID ============
  'technology_id:tech_invention': ['box_trl_assessment'],
  'technology_id:property_intellectual': ['box_ipc_classifier'],
  'technology_id:technical_id': ['box_trl_assessment'],
  'technology_id:prototyping': ['box_trl_assessment'],
  'technology_id:tech_market': ['box_ipc_classifier'],
  'technology_id:transfer_model': ['box_ipc_classifier'],
  'technology_id:rse_impact': [],
  'technology_id:circular_economy': [],
  'technology_id:simulador': [],
  
  // ============ MICRO BUSINESS ============
  'micro_business:introduccion': ['box_apertura_30dias'],
  'micro_business:identidad': ['box_apertura_30dias'],
  'micro_business:clientes': ['box_apertura_30dias'],
  'micro_business:competencia': ['box_apertura_30dias'],
  'micro_business:comercializacion': ['box_apertura_30dias'],
  'micro_business:operacion': ['box_apertura_30dias'],
  'micro_business:recursos': ['box_apertura_30dias'],
  'micro_business:croquis': ['box_micro_canvas_3b'],
  'micro_business:inversion': ['box_apertura_30dias'],
  'micro_business:costos': ['box_micro_canvas_3b'],
  
  // ============ HOSHIN KANRI ============
  'hoshin_kanri:norte_verdadero': ['box_matriz_x_hoshin'],
  'hoshin_kanri:disrupcion': ['box_matriz_x_hoshin'],
  'hoshin_kanri:matriz_x': ['box_matriz_x_hoshin'],
  'hoshin_kanri:seguimiento': ['box_matriz_x_hoshin'],
  
  // ============ AMOEBA MANAGEMENT ============
  'amoeba_management:celulas': ['box_rentabilidad_hora_amoeba'],
  'amoeba_management:filosofia_corp': ['box_rentabilidad_hora_amoeba'],
  'amoeba_management:precios': ['box_rentabilidad_hora_amoeba'],
  'amoeba_management:rentabilidad': ['box_rentabilidad_hora_amoeba'],
  'amoeba_management:simulador': ['box_rentabilidad_hora_amoeba'],
  
  // ============ GUANXI PLAN ============
  'guanxi_plan:mapa_relacional': ['box_mapa_guanxi_mianzi'],
  'guanxi_plan:alineacion_estado': ['box_mapa_guanxi_mianzi'],
  'guanxi_plan:favores': ['box_mapa_guanxi_mianzi'],
  'guanxi_plan:mianzi': ['box_mapa_guanxi_mianzi'],
  
  // ============ ONUDI PROJECT ============
  'onudi_project:tecnologia': [],
  'onudi_project:costo_capital': ['box_fcff_onudi_model'],
  'onudi_project:flujo_firma': ['box_fcff_onudi_model'],
  'onudi_project:riesgo': ['box_fcff_onudi_model'],
  'onudi_project:simulador': ['box_fcff_onudi_model'],
  
  // ============ ZOPP ============
  'zopp:participacion': ['box_zopp_mpp_4x4'],
  'zopp:problemas': ['box_zopp_mpp_4x4'],
  'zopp:objetivos': ['box_zopp_mpp_4x4'],
  'zopp:matriz_logica': ['box_zopp_mpp_4x4'],
  
  // ============ HORIZON EUROPE ============
  'horizon_europe:consorcio': ['box_dnsh_ue_6'],
  'horizon_europe:ciencia_abierta': ['box_dnsh_ue_6'],
  'horizon_europe:dnsh_principle': ['box_dnsh_ue_6'],
  'horizon_europe:impacto': ['box_dnsh_ue_6'],
};

/**
 * Obtiene los boxes para un módulo específico (solo los específicos, sin fallback global)
 * @param {string} moduleKey - Clave del módulo (formato "tipoDoc:moduleKey")
 * @param {string} docType - Tipo de documento (fallback)
 * @returns {Array} Array de boxIds
 */
export function getBoxIdsForModule(moduleKey, docType = 'business') {
  // Primero buscar en el mapa específico con clave compuesta
  const compositeKey = `${docType}:${moduleKey}`;
  const specificBoxes = MODULE_BOX_MAP[compositeKey];
  if (specificBoxes && specificBoxes.length > 0) {
    return specificBoxes;
  }
  
  // Fallback: intentar sin prefijo (compatibilidad hacia atrás)
  const legacyBoxes = MODULE_BOX_MAP[moduleKey];
  if (legacyBoxes && legacyBoxes.length > 0) {
    return legacyBoxes;
  }
  
  // Fallback: usar boxes por tipo de documento (existente)
  return [];
}

/**
 * Obtiene los boxes para un tipo de documento (fallback global)
 * @param {string} docType 
 * @returns {Array}
 */
export function getGlobalBoxesForDocType(docType = 'business') {
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