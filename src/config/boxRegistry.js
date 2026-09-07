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
    },
    {
      id: 'box_aarrr_pirata_5metricas',
      type: BOX_TYPES.BENCHMARK,
      title: 'Embudo de Crecimiento Pirata AARRR (5 Fases)',
      description: 'Métricas de Adquisición, Activación, Retención, Referencia e Ingresos con benchmarks de conversión.',
      source: { book: 'The Lean Startup & QuickStart Guide', page: 'Ch. 6 p. 114; Ch. 9 p. 205' }
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
    },
    {
      id: 'box_innovation_accounting_3metrics',
      type: BOX_TYPES.BENCHMARK,
      title: 'Contabilidad de la Innovación (Innovation Accounting)',
      description: 'Evaluación de tres niveles: métricas de referencia (Baseline), optimización de motor y decisión de pivote/perseverar.',
      source: { book: 'The Lean Startup', page: 'Ch. 8 p. 174' }
    },
    {
      id: 'box_experimento_lean_tdd',
      type: BOX_TYPES.CHECKLIST,
      title: 'Protocolo de Experimento Científico Lean TDD',
      description: 'Diseño riguroso de hipótesis H1/H0, criterio cuantitativo de falsación, tamaño muestral y duración.',
      source: { book: 'The Lean Startup & Burn the Business Plan', page: 'Ch. 6 p. 114; p. 67' }
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
      id: 'box_capex_csi_table_16div',
      type: BOX_TYPES.TABLE,
      title: 'Desglose Detallado de CAPEX por Divisiones MasterFormat CSI-16',
      description: 'Catálogo exhaustivo de conceptos, especificaciones técnicas, unidades y precios unitarios por división CSI.',
      source: { book: 'Anatomy of a Business Plan & Plan de Negocios VF', page: 'Ch. 7 p. 142; p. 86' }
    },
    {
      id: 'box_tornado_sensibilidad',
      type: BOX_TYPES.FORMULA,
      title: 'Análisis de Sensibilidad Tornado (1 Variable)',
      description: 'Impacto en el VAN ante oscilaciones de ±25% en precio, volumen y CAPEX.',
      source: { book: 'The Nature of Value', page: 'Ch. 6' }
    },
    {
      id: 'box_tornado_chart',
      type: BOX_TYPES.FORMULA,
      title: 'Gráfica de Tornado de Sensibilidad Multivariable',
      description: 'Jerarquización de impacto en el VAN ante desviaciones pesimistas y optimistas de las variables críticas.',
      source: { book: 'The Nature of Value & Plan de Negocios VF', page: 'Ch. 6 p. 108; p. 91' }
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
    },
    {
      id: 'box_tir_vpn_social_bid',
      type: BOX_TYPES.FORMULA,
      title: 'Evaluación Social Cuantitativa (TIR y VPN Social)',
      description: 'Cálculo de viabilidad socioeconómica mediante tasa de descuento social nacional (6-12%) y beneficios sociales monetizados.',
      source: { book: 'The Nature of Value & Manual de Panamá', page: 'Ch. 5 p. 92; p. 18' }
    },
    {
      id: 'box_zopp_mpp_4x4',
      type: BOX_TYPES.MATRIX,
      title: 'Matriz de Marco Lógico 4x4 (BID / ILPES)',
      description: 'Estructura lógica de 16 cuadrantes: Fin, Propósito, Componentes y Actividades con indicadores SMART y supuestos.',
      source: { book: 'Manual BID / PM4R de Proyectos Sociales', page: 'p. 58' }
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
    },
    {
      id: 'box_jtbd_job_statement',
      type: BOX_TYPES.FORMULA,
      title: 'Declaración de Trabajo a Realizar (Jobs-to-be-Done - JTBD)',
      description: 'Fórmula Christensen: Circunstancia de activación + Motivación funcional + Resultado emocional esperado.',
      source: { book: "The Innovator's Dilemma", page: 'Ch. 3 p. 72' }
    },
    {
      id: 'box_sustaining_vs_disruptive',
      type: BOX_TYPES.CHECKLIST,
      title: 'Evaluación Disruptiva vs Sostenedora (Modelo RPV)',
      description: 'Checklist de clasificación tecnológica: gama baja (low-end) vs nuevo mercado, evaluando Recursos, Procesos y Valores.',
      source: { book: "The Innovator's Dilemma", page: 'Ch. 4-5 p. 98' }
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
    },
    {
      id: 'box_punto_equilibrio_micro',
      type: BOX_TYPES.FORMULA,
      title: 'Punto de Equilibrio y Margen Unitario de Micronegocio',
      description: 'Fórmulas directas de unidades mínimas de venta diaria/mensual y margen de contribución para micronegocios locales.',
      source: { book: 'Starting a Business QuickStart Guide & Manual Panamá', page: 'Ch. 13 p. 270; p. 15' }
    }
  ],

  hoshin_kanri: [
    {
      id: 'box_matriz_x_hoshin',
      type: BOX_TYPES.MATRIX,
      title: 'Matriz X Hoshin Kanri (4 Cuadrantes)',
      description: 'Alineación de Norte Verdadero, objetivos anuales, prioridades y métricas.',
      source: { book: 'Creating a Business Plan For Dummies (Hoshin Edition)', page: 'Ch. 8' }
    },
    {
      id: 'box_catchball_nemawashi',
      type: BOX_TYPES.CHECKLIST,
      title: 'Protocolo de Negociación Catchball y Consenso Nemawashi',
      description: 'Checklist de diálogo bidireccional y negociación de recursos entre directivos y líderes de equipo.',
      source: { book: 'Creating a Business Plan For Dummies (Hoshin Edition)', page: 'Ch. 8; Akao' }
    },
    {
      id: 'box_a3_template_lean',
      type: BOX_TYPES.CANVAS,
      title: 'Plantilla de Despliegue Estratégico A3 Lean',
      description: 'Lienzo de resolución estructurada de problemas en 7 bloques: contexto, condición actual, meta, análisis causa-raíz y plan.',
      source: { book: 'The Lean Startup', page: 'Ch. 9 p. 198' }
    },
    {
      id: 'box_pdca_ciclo_hoshin',
      type: BOX_TYPES.CHECKLIST,
      title: 'Ciclo de Mejora Continua PDCA Hoshin (Plan-Do-Check-Act)',
      description: 'Supervisión y control trimestral de contramedidas operativas y estandarización de procesos exitosos.',
      source: { book: 'Creating a Business Plan For Dummies (Hoshin Edition)', page: 'Ch. 8' }
    },
    {
      id: 'box_okr_scorecard',
      type: BOX_TYPES.BENCHMARK,
      title: 'Scorecard de Alineación OKR y Bowler Semáforo',
      description: 'Tablero de seguimiento de Objetivos y Resultados Clave con bandas semafóricas mensuales de cumplimiento.',
      source: { book: 'Starting a Business QuickStart Guide', page: 'Ch. 7 p. 142' }
    }
  ],

  amoeba_management: [
    {
      id: 'box_rentabilidad_hora_amoeba',
      type: BOX_TYPES.BENCHMARK,
      title: 'Rentabilidad por Hora por Célula Amoeba',
      description: 'Fórmula Inamori: (Ingresos Amoeba - Costos no laborales) / Total Horas.',
      source: { book: 'The Nature of Value (Kyocera Case)', page: 'Ch. 4' }
    },
    {
      id: 'box_12_principios_inamori',
      type: BOX_TYPES.CHECKLIST,
      title: 'Checklist de los 12 Principios de Gestión de Kazuo Inamori',
      description: 'Auditoría de integridad moral, metas transparentes, precios óptimos y optimismo sin límites en la gestión celular.',
      source: { book: 'The Nature of Value & Inamori Kyocera Management', page: 'Ch. 4 p. 76' }
    },
    {
      id: 'box_horenso_protocolo_3pasos',
      type: BOX_TYPES.CHECKLIST,
      title: 'Protocolo de Comunicación Ho-Ren-So (3 Pasos)',
      description: 'Estandarización de Houkoku (reportar estado), Renraku (comunicar oportunamente) y Soudan (consultar antes de actuar).',
      source: { book: 'The Nature of Value (Kyocera Case)', page: 'Ch. 4 p. 82' }
    },
    {
      id: 'box_time_based_amoeba',
      type: BOX_TYPES.BENCHMARK,
      title: 'Gestión Basada en el Tiempo y Valor Agregado Horario',
      description: 'Monitoreo de horas directas e indirectas para maximizar el margen de valor agregado por persona-hora.',
      source: { book: 'The Nature of Value (Kyocera Case)', page: 'Ch. 4 p. 85' }
    }
  ],

  guanxi_plan: [
    {
      id: 'box_mapa_guanxi_mianzi',
      type: BOX_TYPES.CHECKLIST,
      title: 'Mapa de Relaciones Guanxi y Preservación de Mianzi',
      description: 'Estrategia de reciprocidad a largo plazo y alineación gubernamental.',
      source: { book: 'Negotiating South-South Trade Agreements', page: 'Ch. 3' }
    },
    {
      id: 'box_banquet_protocol_8pasos',
      type: BOX_TYPES.CHECKLIST,
      title: 'Protocolo de Banquete de Negocios y Etiqueta China (8 Pasos)',
      description: 'Reglas indispensables de asientos de honor, rondas de brindis (Ganbei), orden de platos y construcción de confianza.',
      source: { book: 'Negotiating South-South Regional Agreements', page: 'Ch. 3 p. 45' }
    },
    {
      id: 'box_mianzi_ladder_8niveles',
      type: BOX_TYPES.MATRIX,
      title: 'Escalera de Mianzi (Reputación, Prestigio y Salvar la Cara)',
      description: 'Matriz de 8 niveles para evitar confrontación pública, otorgar reconocimiento y proteger la dignidad de contrapartes.',
      source: { book: 'Negotiating South-South Regional Agreements', page: 'Ch. 3 p. 52' }
    },
    {
      id: 'box_gift_giving_mat',
      type: BOX_TYPES.CHECKLIST,
      title: 'Matriz de Cortesía y Regalos Estratégicos (Renqing)',
      description: 'Checklist de obsequios ceremoniales, tabúes culturales chinos y balance del libro mayor de favores.',
      source: { book: 'Negotiating South-South Regional Agreements', page: 'Ch. 3 p. 48' }
    },
    {
      id: 'box_tacticas_negociacion_china',
      type: BOX_TYPES.TABLE,
      title: 'Tácticas de Negociación y Estratagemas Comerciales',
      description: 'Catálogo de negociación intercultural basado en paciencia estratégica, contratos marco y flexibilidad pragmática.',
      source: { book: 'Negotiating South-South Regional Agreements', page: 'Ch. 4 p. 78' }
    }
  ],

  onudi_project: [
    {
      id: 'box_fcff_onudi_model',
      type: BOX_TYPES.FORMULA,
      title: 'Flujo de Caja Libre para la Firma (FCFF ONUDI)',
      description: 'Evaluación industrial con WACC internacional y sensibilidad.',
      source: { book: 'ONUDI Manual Industrial', page: 'Ch. 6' }
    },
    {
      id: 'box_riesgo_pais_mat',
      type: BOX_TYPES.MATRIX,
      title: 'Matriz de Riesgo País y Riesgo Cambiario ONUDI/COMFAR',
      description: 'Evaluación de primas soberanas, devaluación esperada e impacto en la tasa de corte internacional.',
      source: { book: 'Negotiating South-South Regional Agreements & ONUDI Manual', page: 'Ch. 5 p. 92' }
    },
    {
      id: 'box_matriz_localizacion_onudi',
      type: BOX_TYPES.MATRIX,
      title: 'Matriz Multicriterio de Localización Industrial',
      description: 'Ponderación de factores geográficos, costos logísticos, disponibilidad de energía, agua y mano de obra calificada.',
      source: { book: 'ONUDI Behrens & Hawranek & Anatomy of a Business Plan', page: 'Ch. 7 p. 138' }
    },
    {
      id: 'box_impacto_ambiental_onudi',
      type: BOX_TYPES.CHECKLIST,
      title: 'Evaluación de Impacto Ambiental y Mitigación Industrial (EIA)',
      description: 'Checklist de cumplimiento para control de efluentes, huella de carbono, manejo de residuos peligrosos y consulta comunitaria.',
      source: { book: 'The Role of Corporate Sustainability in Asian Development', page: 'p. 130' }
    }
  ],

  zopp: [
    {
      id: 'box_zopp_mpp_4x4',
      type: BOX_TYPES.MATRIX,
      title: 'Matriz de Planificación de Proyectos (MPP ZOPP 4x4)',
      description: 'Estructura alemana de objetivos, indicadores, medios de verificación y supuestos.',
      source: { book: 'Manual ZOPP GTZ', page: 'p. 28' }
    },
    {
      id: 'box_matriz_alternativas_zopp',
      type: BOX_TYPES.MATRIX,
      title: 'Matriz de Análisis y Selección de Alternativas ZOPP',
      description: 'Evaluación multicriterio para seleccionar la rama óptima del árbol de objetivos antes de la implementación.',
      source: { book: 'Manual ZOPP GTZ', page: 'p. 42' }
    },
    {
      id: 'box_gantt_actividades_zopp',
      type: BOX_TYPES.CANVAS,
      title: 'Cronograma de Actividades e Hitos ZOPP (EDT / Gantt)',
      description: 'Estructura de Desglose de Trabajo vinculada a responsables, duración e hitos verificables.',
      source: { book: 'Manual ZOPP GTZ', page: 'p. 56' }
    },
    {
      id: 'box_presupuesto_componentes',
      type: BOX_TYPES.TABLE,
      title: 'Presupuesto Desglosado por Componentes y Rubros ZOPP',
      description: 'Costeo por actividad agrupado en los componentes operativos del proyecto.',
      source: { book: 'Manual ZOPP GTZ', page: 'p. 68' }
    },
    {
      id: 'box_evaluacion_expost_lista',
      type: BOX_TYPES.CHECKLIST,
      title: 'Checklist de Evaluación Ex-Post y Factores de Sostenibilidad',
      description: 'Criterios de viabilidad técnica, institucional, financiera y ecológica tras el cierre del proyecto.',
      source: { book: 'Manual ZOPP GTZ', page: 'p. 84' }
    }
  ],

  horizon_europe: [
    {
      id: 'box_dnsh_ue_6',
      type: BOX_TYPES.CHECKLIST,
      title: 'Principio DNSH de la UE (6 Objetivos Medioambientales)',
      description: 'Do No Significant Harm: Clima, agua, economía circular, contaminación, biodiversidad.',
      source: { book: 'The Role of Corporate Sustainability in Asian Development', page: 'p. 89' }
    },
    {
      id: 'box_impacto_pathway_trl6_9',
      type: BOX_TYPES.CHECKLIST,
      title: 'Pathway de Impacto Horizon Europe y Escalamiento TRL 6-9',
      description: 'Hoja de ruta desde la validación de prototipo industrial hasta la comercialización y adopción en el mercado europeo.',
      source: { book: 'The Role of Corporate Sustainability in Asian Development', page: 'p. 76' }
    },
    {
      id: 'box_dmp_fair_checklist',
      type: BOX_TYPES.CHECKLIST,
      title: 'Checklist de Gestión de Datos FAIR y Data Management Plan (DMP)',
      description: 'Verificación de principios Findable, Accessible, Interoperable y Reusable para datos de investigación y repositorios abiertos.',
      source: { book: 'The Role of Corporate Sustainability in Asian Development', page: 'p. 102' }
    },
    {
      id: 'box_plan_diseminacion_eu',
      type: BOX_TYPES.TABLE,
      title: 'Matriz de Diseminación, Explotación y Comunicación Científica',
      description: 'Plan estructurado por grupo de interés (científicos, industria, decisores políticos y público en general) con KPIs de impacto.',
      source: { book: 'The Role of Corporate Sustainability in Asian Development', page: 'p. 115' }
    },
    {
      id: 'box_presupuesto_eu_categorias',
      type: BOX_TYPES.TABLE,
      title: 'Presupuesto por Categorías de Coste Horizon Europe',
      description: 'Desglose oficial: Costes de personal, subcontratación, compras, costes indirectos (25% flat rate) y contribución comunitaria.',
      source: { book: 'The Role of Corporate Sustainability in Asian Development', page: 'p. 118' }
    }
  ]
};

/**
 * Obtiene la lista de boxes para un tipo de documento con fallback
 */
export function getBoxesForDocType(docType = 'business') {
  return BOX_REGISTRY[docType] || BOX_REGISTRY.business || [];
}
