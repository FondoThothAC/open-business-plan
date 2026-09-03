import { BOX_TYPES } from './boxes.js';

/**
 * Registro central de Boxes por tipo de documento (12 tipos de frameworks).
 * Mapea la metodología de los 13 libros a componentes interactivos y visuales.
 */
export const BOX_REGISTRY = {
  business: [
    {
      id: 'box_resumen_ejecutivo_1p',
      type: BOX_TYPES.TABLE,
      title: 'Resumen Ejecutivo de 1 Página',
      description: 'Estructura compacta: Problema, Solución, Mercado, Tracción, Ask.',
      source: { book: 'Anatomy of a Business Plan', page: 'p. 12' }
    },
    {
      id: 'box_tam_sam_som',
      type: BOX_TYPES.FORMULA,
      title: 'Mercado Total, Alcanzable y Obtenible (TAM/SAM/SOM)',
      description: 'Cálculo de dimensionamiento de mercado con 3 metodologías.',
      source: { book: 'Anatomy of a Business Plan', page: 'p. 78' }
    },
    {
      id: 'box_swot_foda',
      type: BOX_TYPES.MATRIX,
      title: 'Matriz FODA Cuantitativa',
      description: 'Fortalezas, Oportunidades, Debilidades y Amenazas cruzadas.',
      source: { book: 'Creating a Business Plan For Dummies', page: 'Ch. 4' }
    },
    {
      id: 'box_unit_economics',
      type: BOX_TYPES.BENCHMARK,
      title: 'Unit Economics y Ratio CAC / LTV',
      description: 'Métricas unitarias con regla dorada LTV >= 3x CAC.',
      source: { book: 'The Lean Startup', page: 'Ch. 6' }
    },
    {
      id: 'box_wacc_van_tir',
      type: BOX_TYPES.FORMULA,
      title: 'Evaluación Financiera Maestra (WACC, VAN, TIR)',
      description: 'Modelo de descuento de flujos con costo de capital CAPM.',
      source: { book: 'The Nature of Value', page: 'Ch. 5' }
    },
    {
      id: 'box_canvas_osterwalder',
      type: BOX_TYPES.CANVAS,
      title: 'Business Model Canvas (Alexander Osterwalder — 9 Bloques)',
      description: 'Lienzo clásico de modelo de negocio con los 9 bloques estratégicos.',
      source: { book: 'Business Model Generation (Osterwalder)', page: 'p. 14' }
    },
    {
      id: 'box_benchmark_cac_ltv',
      type: BOX_TYPES.BENCHMARK,
      title: 'Benchmark Sectorial CAC / LTV / Churn Rate',
      description: 'Evaluación de eficiencia comercial contra estándares de la industria.',
      source: { book: 'Starting a Business QuickStart Guide', page: 'p. 112' }
    },
    {
      id: 'box_kpi_otd_dso_dio_ccc',
      type: BOX_TYPES.BENCHMARK,
      title: 'Indicadores de Eficiencia Operativa (OTD, DSO, DPO, CCC)',
      description: 'Métricas de cadena de suministro y ciclo de conversión de efectivo.',
      source: { book: 'Operations Management (Slack)', page: 'p. 210' }
    }
  ],
  agile_startup: [
    {
      id: 'box_lean_canvas',
      type: BOX_TYPES.CANVAS,
      title: 'Lean Canvas (Ash Maurya — 9 Bloques)',
      description: 'Lienzo ágil enfocado en problema, solución, métricas clave y ventaja injusta.',
      source: { book: 'The Lean Startup & Burn the Business Plan', page: 'Ch. 4' }
    },
    {
      id: 'box_mvp_protocol',
      type: BOX_TYPES.CHECKLIST,
      title: 'Protocolo de Validación de MVP (Concierge / Wizard of Oz)',
      description: 'Checklist de hipótesis de valor y crecimiento antes del desarrollo.',
      source: { book: 'The Lean Startup', page: 'p. 114' }
    },
    {
      id: 'box_burn_runway',
      type: BOX_TYPES.BENCHMARK,
      title: 'Burn Rate & Runway de Supervivencia',
      description: 'Monitoreo de meses de pista financiera con alerta de Kill Switch.',
      source: { book: 'Starting a Business QuickStart Guide', page: 'Ch. 9' }
    }
  ],
  investment_project: [
    {
      id: 'box_layout_industrial',
      type: BOX_TYPES.CANVAS,
      title: 'Generador y Visualizador de Lay-out de Planta (Distribución Física)',
      description: 'Modelado interactivo de zonas de planta, áreas en m², equipos y flujo de proceso.',
      source: { book: 'Operations Management (Slack)', page: 'Ch. 7' }
    },
    {
      id: 'box_capex_csi_table',
      type: BOX_TYPES.TABLE,
      title: 'Catálogo de Conceptos y CAPEX de Obra (División CSI 16)',
      description: 'Presupuesto base de infraestructura y equipamiento industrial.',
      source: { book: 'Anatomy of a Business Plan', page: 'Ch. 7' }
    },
    {
      id: 'box_tornado_sensibilidad',
      type: BOX_TYPES.FORMULA,
      title: 'Análisis de Sensibilidad Tornado (1 Variable)',
      description: 'Impacto en el VAN ante oscilaciones de ±25% en precio, volumen y CAPEX.',
      source: { book: 'The Nature of Value', page: 'Ch. 6' }
    },
    {
      id: 'box_montecarlo_sim',
      type: BOX_TYPES.FORMULA,
      title: 'Simulación Estocástica de Monte Carlo (10,000 Iteraciones)',
      description: 'Distribución de probabilidad de VAN y TIR bajo incertidumbre.',
      source: { book: 'ONUDI Manual Industrial', page: 'p. 142' }
    }
  ],
  social_bid: [
    {
      id: 'box_arbol_problemas_mml',
      type: BOX_TYPES.MATRIX,
      title: 'Árbol de Problemas y Objetivos (Marco Lógico BID)',
      description: 'Jerarquía causa-efecto y medios-fines visualizada en diagrama.',
      source: { book: 'Manual BID / PM4R de Proyectos Sociales', page: 'p. 34' }
    },
    {
      id: 'box_matriz_interes_poder',
      type: BOX_TYPES.MATRIX,
      title: 'Matriz de Involucrados (Poder vs Interés)',
      description: 'Clasificación estratégica de aliados, oponentes y beneficiarios.',
      source: { book: 'Negotiating South-South Regional Agreements', page: 'p. 45' }
    }
  ],
  technology_id: [
    {
      id: 'box_trl_assessment',
      type: BOX_TYPES.CHECKLIST,
      title: 'Evaluación de Nivel de Madurez Tecnológica (TRL 1-9)',
      description: 'Checklist de validación desde principio básico hasta despliegue operativo.',
      source: { book: "The Innovator's Dilemma", page: 'Ch. 3' }
    },
    {
      id: 'box_ipc_classifier',
      type: BOX_TYPES.TABLE,
      title: 'Clasificación Internacional de Patentes (IPC)',
      description: 'Mapeo de tecnologías a categorías A61K, C12N, G06F, H01L.',
      source: { book: 'Anatomy of a Business Plan (IPC Edition)', page: 'p. 210' }
    }
  ],
  micro_business: [
    {
      id: 'box_apertura_30dias',
      type: BOX_TYPES.CHECKLIST,
      title: 'Checklist de Apertura Legal en 30 Días',
      description: 'RFC, régimen fiscal simplificado, licencias municipales y apertura.',
      source: { book: 'Plan de Negocios VF & Manual Panamá', page: 'p. 15' }
    },
    {
      id: 'box_micro_canvas_3b',
      type: BOX_TYPES.CANVAS,
      title: 'Micro-Canvas de 3 Bloques (Clientes, Oferta, Finanzas)',
      description: 'Lienzo simplificado para negocios locales de autoempleo.',
      source: { book: 'Starting a Business QuickStart Guide', page: 'Ch. 3' }
    },
    {
      id: 'box_micro_croquis_2d',
      type: BOX_TYPES.CANVAS,
      title: 'Diseñador de Croquis 2D y Distribución con IA',
      description: 'Plano interactivo con bloques de equipamiento comercial y renders arquitectónicos.',
      source: { book: 'Manual de Plan de Negocios Panamá (Cap. 9)', page: 'p. 24' }
    }
  ],
  hoshin_kanri: [
    {
      id: 'box_matriz_x_hoshin',
      type: BOX_TYPES.MATRIX,
      title: 'Matriz X Hoshin Kanri (4 Cuadrantes)',
      description: 'Alineación de Norte Verdadero, objetivos anuales, prioridades y métricas.',
      source: { book: 'Creating a Business Plan For Dummies (Hoshin Edition)', page: 'Ch. 8' }
    }
  ],
  amoeba_management: [
    {
      id: 'box_rentabilidad_hora_amoeba',
      type: BOX_TYPES.BENCHMARK,
      title: 'Rentabilidad por Hora por Célula Amoeba',
      description: 'Fórmula Inamori: (Ingresos Amoeba - Costos no laborales) / Total Horas.',
      source: { book: 'The Nature of Value (Kyocera Case)', page: 'Ch. 4' }
    }
  ],
  guanxi_plan: [
    {
      id: 'box_mapa_guanxi_mianzi',
      type: BOX_TYPES.CHECKLIST,
      title: 'Mapa de Relaciones Guanxi y Preservación de Mianzi',
      description: 'Estrategia de reciprocidad a largo plazo y alineación gubernamental.',
      source: { book: 'Negotiating South-South Trade Agreements', page: 'Ch. 3' }
    }
  ],
  onudi_project: [
    {
      id: 'box_fcff_onudi_model',
      type: BOX_TYPES.FORMULA,
      title: 'Flujo de Caja Libre para la Firma (FCFF ONUDI)',
      description: 'Evaluación industrial con WACC internacional y sensibilidad.',
      source: { book: 'ONUDI Manual Industrial', page: 'Ch. 6' }
    }
  ],
  zopp: [
    {
      id: 'box_zopp_mpp_4x4',
      type: BOX_TYPES.MATRIX,
      title: 'Matriz de Planificación de Proyectos (MPP ZOPP 4x4)',
      description: 'Estructura alemana de objetivos, indicadores, medios de verificación y supuestos.',
      source: { book: 'Manual ZOPP GTZ', page: 'p. 28' }
    }
  ],
  horizon_europe: [
    {
      id: 'box_dnsh_ue_6',
      type: BOX_TYPES.CHECKLIST,
      title: 'Principio DNSH de la UE (6 Objetivos Medioambientales)',
      description: 'Do No Significant Harm: Clima, agua, economía circular, contaminación, biodiversidad.',
      source: { book: 'The Role of Corporate Sustainability in Asian Development', page: 'p. 89' }
    }
  ]
};

/**
 * Obtiene la lista de boxes para un tipo de documento con fallback
 */
export function getBoxesForDocType(docType = 'business') {
  return BOX_REGISTRY[docType] || BOX_REGISTRY.business || [];
}
