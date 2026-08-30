export const FRAMEWORKS = {
  business: {
    id: 'business',
    name: 'Plan de Negocios Comercial',
    pillars: [
      {
        key: 'naturaleza',
        title: 'Naturaleza del Proyecto',
        modules: [
          { key: 'introduccion', title: 'Justificación y Origen', description: 'Origen, necesidad que cubre, modelo y propuesta de valor inicial.', fields: ['origen', 'necesidad', 'modelo_negocio', 'propuesta_valor'] },
          { key: 'identidad', title: 'Identidad Corporativa', description: 'Misión, Visión, Valores y concepto de marca.', fields: ['mision', 'vision', 'valores', 'imagen'] },
          { key: 'objetivos', title: 'Objetivos y Metas', description: 'Objetivos SMART a corto, mediano y largo plazo.', fields: ['general', 'especificos', 'metas'] },
          { key: 'foda', title: 'Análisis FODA', description: 'Fortalezas, Oportunidades, Debilidades y Amenazas.', fields: ['fortalezas', 'oportunidades', 'debilidades', 'amenazas'] },
          { key: 'pestel', title: 'Entorno (PESTEL)', description: 'Factores Políticos, Económicos, Sociales, Tecnológicos, etc.', fields: ['politico', 'economico', 'social', 'tecnologico', 'ecologico', 'legal'] },
          { key: 'legal', title: 'Marco Legal y Socios', description: 'Estructura legal, constitución y permisos requeridos.', fields: ['constitucion', 'socios', 'permisos'] },
          { key: 'canvas', title: 'Modelo de Negocio Canvas', description: 'El lienzo del modelo de negocios (9 bloques esenciales) para planificar estratégicamente.', fields: ['socios_clave', 'actividades_clave', 'recursos_clave', 'propuestas_valor', 'relaciones_clientes', 'canales', 'segmentos_clientes', 'estructura_costos', 'fuentes_ingresos'] }
        ]
      },
      {
        key: 'mercado',
        title: 'El Mercado',
        modules: [
          { key: 'analisis', title: 'Análisis de Producto y Valor', description: 'Descripción detallada del producto y beneficios.', fields: ['producto', 'valor', 'demanda', 'cliente', 'ciclo_vida'] },
          { key: 'segmentacion', title: 'Segmentación y Tamaño', description: 'TAM, SAM, SOM y perfil del buyer persona.', fields: ['tam', 'sam', 'som', 'perfil', 'sensibilidad_demanda'] },
          { key: 'mapa', title: 'Mapa de Calor y Densidad', description: 'Visualización geográfica de la demanda y densidad de mercado.', fields: ['analisis_espacial'] },
          { key: 'competencia', title: 'Análisis de Competencia', description: 'Competidores directos, indirectos y ventaja competitiva.', fields: ['competidores', 'ventajas'] },
          { key: 'benchmarking', title: 'Benchmarking', description: 'Comparativa estructurada contra líderes del mercado.', fields: ['comparativa', 'matriz'] },
          { key: 'comercializacion', title: 'Estrategia de Comercialización', description: 'Canales de distribución, marketing e identidad de ventas.', fields: ['distribucion', 'promocion', 'identidad', 'canales_intermediarios'] },
          { key: 'ventas', title: 'Plan de Ventas y Precios', description: 'Estrategia de pricing y proyecciones de volumen.', fields: ['precios', 'estrategia', 'proyeccion_volumen', 'tacticas_precio'] }
        ]
      },
      {
        key: 'tecnico',
        title: 'Estudio Técnico de Producción',
        modules: [
          { key: 'ubicacion', title: 'Localización y Ubicación', description: 'Macro y micro localización del negocio.', fields: ['macro', 'micro', 'local'] },
          { key: 'operacion', title: 'Operación y Procesos', description: 'Diagrama de flujo de operaciones y tecnología.', fields: ['proceso', 'diagrama', 'tecnologia', 'economias_escala', 'tipo_proceso'] },
          { key: 'recursos', title: 'Maquinaria y Tecnología', description: 'Equipamiento, hardware y herramientas necesarias.', fields: ['maquinaria', 'equipo', 'herramientas'] },
          { key: 'insumos', title: 'Insumos y Proveedores', description: 'Materias primas y cadena de suministro.', fields: ['materia_prima', 'proveedores', 'compras'] },
          { key: 'capacidad', title: 'Capacidad e Inventarios', description: 'Capacidad instalada, manejo de stock y turnos.', fields: ['instalada', 'inventarios', 'mano_obra', 'punto_reorden'] },
          { key: 'operativa', title: 'Eficiencia Operativa', description: 'Métricas de desempeño: OTD, Rotación, DSO, DPO y Ciclo de Efectivo.', fields: ['otd', 'rotacion', 'dso', 'dpo', 'ccc'] },
          { key: 'ambiental', title: 'Impacto Ambiental', description: 'Sostenibilidad, manejo de residuos y normatividad.', fields: ['impacto', 'mitigacion', 'normatividad'] }
        ]
      },
      {
        key: 'organizacion',
        title: 'Organización y Finanzas',
        modules: [
          { key: 'estructura', title: 'Estructura Organizativa', description: 'Organigrama y descripción de puestos clave.', fields: ['organigrama_visual', 'puestos', 'funciones', 'puestos_lista'] },
          { key: 'recursos_humanos', title: 'Gestión de Recursos Humanos', description: 'Políticas de contratación, capacitación y sueldos.', fields: ['reclutamiento', 'contratacion', 'sueldos'] },
          { key: 'inversion', title: 'Inversión Inicial (CAPEX)', description: 'Requerimientos de capital para arranque.', fields: ['inversion_fija', 'inversion_diferida', 'opex_inicial', 'financiamiento'] },
          { key: 'costos', title: 'Costos y Gastos (OPEX)', description: 'Estructura de costos fijos y variables mensuales.', fields: ['fijos', 'variables', 'unitario'] },
          { key: 'estados_financieros', title: 'Estados Financieros', description: 'Proyecciones de resultados, balance y flujo.', fields: ['resultados', 'balance', 'flujo_caja', 'amortizacion_creditos', 'memorias_calculo'] },
          { key: 'rentabilidad', title: 'Rentabilidad y Análisis', description: 'TIR, VPN, Punto de Equilibrio y ROI.', fields: ['punto_equilibrio', 'indicadores', 'relacion_bc'] }
        ]
      },
      {
        key: 'simulador_financiero',
        title: 'Simulador y Corridas',
        modules: [
          { key: 'simulador', title: 'Simulador Financiero', description: 'Simulador interactivo avanzado con corridas dinámicas a 5 años.', fields: ['iframe_simulador'] }
        ]
      }
    ]
  },
  social_bid: {
    id: 'social_bid',
    name: 'Proyecto Social (Metodología BID)',
    pillars: [
      {
        key: 'identificacion',
        title: 'Identificación del Problema',
        modules: [
          { key: 'involucrados', title: 'Análisis de Involucrados', description: 'Mapeo de actores, beneficiarios, aliados y oponentes.', fields: ['beneficiarios', 'aliados', 'oponentes', 'matriz_interes'] },
          { key: 'arbol_problemas', title: 'Árbol de Problemas', description: 'Identificación del problema central, sus causas (raíces) y efectos (ramas).', fields: ['problema_central', 'causas_directas', 'causas_indirectas', 'efectos', 'diagrama_visual'] },
          { key: 'arbol_objetivos', title: 'Árbol de Objetivos', description: 'Conversión del problema en objetivo central, medios y fines.', fields: ['objetivo_central', 'medios', 'fines', 'diagrama_visual'] },
          { key: 'alternativas', title: 'Análisis de Alternativas', description: 'Estrategias posibles y selección de la alternativa óptima.', fields: ['estrategias_posibles', 'criterios_seleccion', 'alternativa_elegida'] }
        ]
      },
      {
        key: 'diseno',
        title: 'Diseño del Proyecto (MML)',
        modules: [
          { key: 'fin_proposito', title: 'Fin y Propósito', description: 'Impacto a largo plazo y objetivo específico del proyecto.', fields: ['fin', 'proposito', 'indicadores_fin', 'indicadores_proposito'] },
          { key: 'componentes', title: 'Componentes (Productos)', description: 'Bienes o servicios que entregará el proyecto.', fields: ['lista_componentes', 'indicadores_componentes', 'supuestos'] },
          { key: 'actividades', title: 'Actividades Clave', description: 'Tareas necesarias para producir cada componente.', fields: ['descripcion_actividades', 'cronograma_macro'] },
          { key: 'monitoreo', title: 'Sistema de Monitoreo', description: 'Medios de verificación y línea base.', fields: ['medios_verificacion', 'linea_base', 'frecuencia_medicion'] }
        ]
      },
      {
        key: 'ejecucion',
        title: 'Ejecución y Gobernanza (PM4R)',
        modules: [
          { key: 'gobernanza', title: 'Estructura de Gobernanza', description: 'Directorio, comité ejecutor y roles.', fields: ['comite_directivo', 'unidad_ejecutora', 'organigrama_visual'] },
          { key: 'edt', title: 'Estructura Desglosada (EDT)', description: 'División del trabajo y cronograma detallado.', fields: ['paquetes_trabajo', 'hitos_principales'] },
          { key: 'riesgos', title: 'Matriz de Riesgos', description: 'Identificación, probabilidad y mitigación de riesgos sociales/ambientales.', fields: ['riesgos_identificados', 'plan_mitigacion', 'matriz_probabilidad'] },
          { key: 'comunicaciones', title: 'Plan de Comunicaciones', description: 'Estrategia para mantener informados a los stakeholders.', fields: ['audiencias', 'canales', 'mensajes_clave'] }
        ]
      },
      {
        key: 'presupuesto',
        title: 'Presupuesto y Evaluación',
        modules: [
          { key: 'presupuesto_detallado', title: 'Presupuesto por Componentes', description: 'Costo total desglosado por actividad y componente.', fields: ['costos_directos', 'costos_indirectos', 'fuentes_financiamiento'] },
          { key: 'evaluacion_exante', title: 'Evaluación Ex-ante', description: 'Costo-Beneficio Social y análisis de costo-eficiencia.', fields: ['beneficios_sociales', 'tir_social', 'vpn_social'] },
          { key: 'sostenibilidad', title: 'Estrategia de Sostenibilidad', description: 'Cómo sobrevivirá el proyecto al terminar el financiamiento del BID.', fields: ['sostenibilidad_financiera', 'sostenibilidad_institucional', 'apropiacion_comunitaria'] }
        ]
      }
    ]
  },
  agile_startup: {
    id: 'agile_startup',
    name: 'Agile Startup (Lean MVP)',
    pillars: [
      {
        key: 'validacion',
        title: 'Validación y Lienzo (Lean Canvas)',
        modules: [
          { key: 'canvas', title: 'Lienzo Lean Canvas', description: 'Los 9 bloques simplificados del modelo de negocios ágil para enfocar la propuesta de valor.', fields: ['problema', 'segmentos_clientes', 'propuesta_valor', 'solucion', 'canales', 'flujos_ingresos', 'estructura_costos', 'metricas_clave', 'ventaja_especial'] },
          { key: 'buyer_persona', title: 'Cliente y Empatía', description: 'Creación detallada del Buyer Persona o avatar de cliente y su mapa de empatía.', fields: ['avatar_cliente', 'que_piensa', 'que_ve', 'que_oye', 'que_dice_hace', 'dolores', 'necesidades'] }
        ]
      },
      {
        key: 'experimento',
        title: 'Diseño de Experimentos y MVP',
        modules: [
          { key: 'mvp_design', title: 'Diseño del MVP', description: 'Especificación técnica y operativa del Producto Mínimo Viable a construir.', fields: ['especificacion_mvp', 'recursos_construccion', 'tiempo_estimado_desarrollo'] },
          { key: 'critical_hypotheses', title: 'Hipótesis y Métricas', description: 'Identificación de las dos hipótesis más críticas de valor y crecimiento, y sus métricas.', fields: ['hipotesis_valor', 'hipotesis_crecimiento', 'metrica_exito', 'canal_validacion'] }
        ]
      },
      {
        key: 'aprendizaje',
        title: 'Tracción y Aprendizaje',
        modules: [
          { key: 'pilot_results', title: 'Resultados del Piloto', description: 'Resultados cuantitativos y cualitativos obtenidos durante las pruebas con clientes reales.', fields: ['datos_traccion', 'comentarios_early_adopters', 'aprendizajes_clave'] },
          { key: 'pivot_persevere', title: 'Pivotar o Perseverar', description: 'Decisión estratégica de negocio basada en datos reales de tracción para pivotar o seguir escalando.', fields: ['decision_estrategica', 'justificacion_datos', 'siguientes_pasos'] }
        ]
      },
      {
        key: 'finanzas_agiles',
        title: 'Finanzas y Métricas Unitarias',
        modules: [
          { key: 'unit_economics', title: 'Unit Economics', description: 'Estructura detallada de costos e ingresos unitarios.', fields: ['cac_adquisicion', 'ltv_vida_cliente', 'margen_contribucion_unitario', 'retorno_inversion_marketing'] },
          { key: 'burn_rate', title: 'Runway y Burn Rate', description: 'Monitoreo de flujo mensual y supervivencia de caja.', fields: ['burn_rate_mensual', 'runway_meses', 'capital_supervivencia'] }
        ]
      },
      {
        key: 'simulador_financiero',
        title: 'Simulador y Corridas',
        modules: [
          { key: 'simulador', title: 'Simulador Financiero', description: 'Simulador interactivo avanzado con corridas dinámicas y unit economics a 5 años.', fields: ['iframe_simulador'] }
        ]
      }
    ]
  },
  technology_id: {
    id: 'technology_id',
    name: 'Plan de Negocios de Base Tecnológica e Innovación (I+D)',
    pillars: [
      {
        key: 'innovacion',
        title: 'Innovación y Propiedad Intelectual',
        modules: [
          { key: 'tech_invention', title: 'Tecnología e Invención', description: 'Descripción detallada de la tecnología, su novedad científica y nivel de maduración TRL (Technology Readiness Level).', fields: ['descripcion_tecnologia', 'novedad_cientifica', 'nivel_trl', 'ventaja_tecnologica'] },
          { key: 'property_intellectual', title: 'Propiedad Intelectual', description: 'Estrategia legal de registro de marcas, secretos industriales y patentes nacionales o internacionales.', fields: ['estado_del_arte', 'estrategia_patentes', 'clasificacion_patentes_ipc', 'secretos_industriales'] }
        ]
      },
      {
        key: 'viabilidad_tecnica',
        title: 'Estudio de Viabilidad Técnica',
        modules: [
          { key: 'technical_id', title: 'Ingeniería e I+D', description: 'Escalamiento técnico de laboratorio a planta piloto y especificaciones científicas de producción.', fields: ['escalamiento_produccion', 'infraestructura_cientifica', 'normativas_tecnicas_calidad'] },
          { key: 'prototyping', title: 'Prototipado y Pruebas', description: 'Cronograma y resultados de pruebas de concepto, maquetas físicas o prototipos alpha/beta.', fields: ['especificaciones_prototipo', 'bitacora_pruebas', 'certificaciones_necesarias'] }
        ]
      },
      {
        key: 'mercado_tecnologico',
        title: 'Mercado Científico y Transferencia',
        modules: [
          { key: 'tech_market', title: 'Mercado Tecnológico', description: 'Identificación de licenciatarios, análisis B2B o B2G, y alianzas estratégicas de co-desarrollo.', fields: ['clientes_industriales', 'tamaño_mercado_tecnologico', 'alianzas_codesarrollo'] },
          { key: 'transfer_model', title: 'Modelo de Transferencia', description: 'Esquema de monetización: cobro de royalties, cesión de patentes o constitución de spin-off.', fields: ['esquema_royalties', 'constitucion_spinoff', 'estrategia_comercializacion_id'] }
        ]
      },
      {
        key: 'responsabilidad_social',
        title: 'Impacto Social y Ecológico (RSE)',
        modules: [
          { key: 'rse_impact', title: 'Responsabilidad Social (RSE)', description: 'Evaluación del impacto ético, social y ambiental directo del desarrollo tecnológico.', fields: ['impacto_socioambiental', 'generacion_empleo_calificado', 'politica_rse'] },
          { key: 'circular_economy', title: 'Economía Circular', description: 'Ecodiseño, ciclo de vida del producto tecnológico y manejo sostenible de insumos/residuos.', fields: ['analisis_ciclo_vida', 'estrategia_economia_circular', 'sustentabilidad_energetica'] }
        ]
      },
      {
        key: 'simulador_financiero',
        title: 'Simulador y Corridas',
        modules: [
          { key: 'simulador', title: 'Simulador Financiero', description: 'Simulador interactivo con proyecciones de I+D, VAN y TIR a 5 años.', fields: ['iframe_simulador'] }
        ]
      }
    ]
  },
  micro_business: {
    id: 'micro_business',
    name: 'Plan para Microempresa y Autoempleo (Simplificado)',
    pillars: [
      {
        key: 'naturaleza',
        title: 'Presentación Básica',
        modules: [
          { key: 'introduccion', title: 'Sumario Ejecutivo', description: 'Idea del negocio y objetivo principal.', fields: ['idea_negocio', 'objetivo_basico'] },
          { key: 'identidad', title: 'Presentación de la Empresa', description: 'Nombre, quiénes somos y qué ofrecemos.', fields: ['nombre', 'quienes_somos', 'que_ofrecemos'] }
        ]
      },
      {
        key: 'mercado',
        title: 'Mercadeo Simplificado',
        modules: [
          { key: 'clientes', title: '¿A quién le vendemos?', description: 'Quiénes son nuestros clientes y dónde están.', fields: ['perfil_cliente', 'ubicacion_clientes'] },
          { key: 'competencia', title: 'La Competencia Local', description: 'Quién más hace lo mismo cerca de nosotros.', fields: ['competidores_locales', 'nuestra_ventaja'] },
          { key: 'comercializacion', title: 'Precios y Promoción', description: 'Cómo calculamos el precio y cómo nos damos a conocer.', fields: ['lista_precios', 'como_promocionamos'] }
        ]
      },
      {
        key: 'tecnico',
        title: 'Producción y Operaciones',
        modules: [
          { key: 'operacion', title: '¿Cómo trabajamos?', description: 'Paso a paso de lo que hacemos en un día normal.', fields: ['paso_a_paso_diario'] },
          { key: 'recursos', title: 'Equipos y Herramientas', description: 'Lo que necesitamos comprar o tener para empezar.', fields: ['herramientas_necesarias', 'materiales_basicos'] },
          { key: 'croquis', title: 'Croquis del Local', description: 'Distribución física del espacio de trabajo.', fields: ['descripcion_espacio', 'distribucion_areas'] }
        ]
      },
      {
        key: 'organizacion',
        title: 'Plan Financiero Básico',
        modules: [
          { key: 'inversion', title: '¿Cuánto ocupamos para iniciar?', description: 'Dinero necesario para arrancar el negocio.', fields: ['total_inversion', 'de_donde_sale'] },
          { key: 'costos', title: 'Gastos de cada mes', description: 'Lista de pagos fijos como luz, agua, renta y sueldos.', fields: ['lista_gastos_mensuales', 'costos_por_producto'] }
        ]
      }
    ]
  },
  investment_project: {
    id: 'investment_project',
    name: 'Proyecto de Inversión (Ingeniería y Finanzas)',
    pillars: [
      {
        key: 'mercado_cuantitativo',
        title: 'Estudio de Mercado Cuantitativo',
        modules: [
          { key: 'demanda', title: 'Análisis de Demanda', description: 'Datos duros, elasticidad y comportamiento histórico.', fields: ['demanda_historica', 'elasticidad'] },
          { key: 'oferta', title: 'Proyección de Oferta', description: 'Modelos de proyección para oferta, déficit y demanda futura.', fields: ['proyeccion_oferta'] }
        ]
      },
      {
        key: 'ingenieria_tecnica',
        title: 'Ingeniería del Proyecto',
        modules: [
          { key: 'ingenieria', title: 'Ingeniería Básica', description: 'Diseño macro, tecnología y memorias de cálculo.', fields: ['ingenieria_basica', 'memoria_calculo'] },
          { key: 'layout', title: 'Instalaciones y Lay-out', description: 'Distribución física, terreno y obras.', fields: ['layout_industrial'] }
        ]
      },
      {
        key: 'presupuesto_obra',
        title: 'Presupuesto Base de Obra (CAPEX)',
        modules: [
          { key: 'presupuesto', title: 'Catálogo y Costos', description: 'Catálogo de conceptos y explosión de insumos físicos.', fields: ['catalogo_conceptos', 'explosion_insumos'] },
          { key: 'cronograma', title: 'Cronograma Físico-Financiero', description: 'Avance de obra vs. desembolso de capital mensual.', fields: ['cronograma_fisico_financiero'] }
        ]
      },
      {
        key: 'estructura_capital',
        title: 'Estructura de Capital',
        modules: [
          { key: 'capital', title: 'Costo de Capital (WACC)', description: 'Cálculo del Costo Promedio Ponderado de Capital.', fields: ['wacc'] },
          { key: 'deuda', title: 'Apalancamiento y Deuda', description: 'Estructura del crédito y amortizaciones.', fields: ['apalancamiento', 'servicio_deuda'] }
        ]
      },
      {
        key: 'riesgo_matematico',
        title: 'Riesgo Matemático y Sensibilidad',
        modules: [
          { key: 'sensibilidad', title: 'Análisis de Sensibilidad', description: 'Sensibilidad unidimensional y multivariable.', fields: ['sensibilidad_unidimensional', 'escenarios'] },
          { key: 'probabilidad', title: 'Simulación de Riesgo', description: 'Simulación probabilística tipo Monte Carlo.', fields: ['simulacion_montecarlo'] }
        ]
      },
      {
        key: 'simulador_financiero',
        title: 'Simulador y Corridas',
        modules: [
          { key: 'simulador', title: 'Simulador Financiero', description: 'Simulador interactivo avanzado con corridas dinámicas de inversión a 5 años.', fields: ['iframe_simulador'] }
        ]
      }
    ]
  },
  zopp: {
    id: 'zopp',
    name: 'ZOPP / Marco Lógico (Enfoque Alemán-BID)',
    pillars: [
      {
        key: 'analisis_situacion',
        title: 'Análisis de la Situación',
        modules: [
          { key: 'participacion', title: 'Matriz de Participación', description: 'Identificación de involucrados.', fields: ['matriz_participacion'] },
          { key: 'problemas', title: 'Árbol de Problemas', description: 'Análisis de causas y efectos.', fields: ['analisis_problemas'] }
        ]
      },
      {
        key: 'planificacion_mpp',
        title: 'Matriz de Planificación (MPP)',
        modules: [
          { key: 'objetivos', title: 'Árbol de Objetivos', description: 'De problemas a soluciones.', fields: ['analisis_objetivos'] },
          { key: 'matriz_logica', title: 'Matriz Lógica', description: 'Resumen narrativo y supuestos.', fields: ['mpp'] }
        ]
      }
    ]
  },
  horizon_europe: {
    id: 'horizon_europe',
    name: 'Horizon Europe (Unión Europea)',
    pillars: [
      {
        key: 'excelencia_cientifica',
        title: 'Excelencia y Ciencia Abierta',
        modules: [
          { key: 'consorcio', title: 'Consorcio', description: 'Estructura de partners.', fields: ['consorcio_multinacional'] },
          { key: 'ciencia_abierta', title: 'Open Science', description: 'Plan de gestión de datos.', fields: ['open_science'] }
        ]
      },
      {
        key: 'impacto_sostenibilidad',
        title: 'Impacto y Sostenibilidad',
        modules: [
          { key: 'dnsh_principle', title: 'Principio DNSH', description: 'No causar daño significativo.', fields: ['dnsh'] },
          { key: 'impacto', title: 'Impacto Global', description: 'Impacto más allá del estado del arte.', fields: ['excelencia'] }
        ]
      }
    ]
  },
  hoshin_kanri: {
    id: 'hoshin_kanri',
    name: 'Hoshin Kanri (Japón - Planificación Estratégica)',
    pillars: [
      {
        key: 'vision_largo_plazo',
        title: 'Visión y Breakthroughs',
        modules: [
          { key: 'norte_verdadero', title: 'True North', description: 'Visión a largo plazo.', fields: ['true_north'] },
          { key: 'disrupcion', title: 'Breakthroughs', description: 'Objetivos disruptivos.', fields: ['breakthroughs'] }
        ]
      },
      {
        key: 'alineacion_ejecucion',
        title: 'Alineación y Ejecución',
        modules: [
          { key: 'matriz_x', title: 'Matriz X', description: 'Despliegue de objetivos.', fields: ['matriz_x'] },
          { key: 'seguimiento', title: 'Bowler Charts', description: 'Revisión visual.', fields: ['bowler'] }
        ]
      }
    ]
  },
  amoeba_management: {
    id: 'amoeba_management',
    name: 'Amoeba Management (Kyocera - Micro-Ganancias)',
    pillars: [
      {
        key: 'estructuracion_celulas',
        title: 'Estructuración',
        modules: [
          { key: 'celulas', title: 'Mapeo de Células', description: 'Centros de ganancia independientes.', fields: ['mapeo_celulas'] },
          { key: 'filosofia_corp', title: 'Filosofía', description: 'Alineación de valores.', fields: ['filosofia'] }
        ]
      },
      {
        key: 'economia_interna',
        title: 'Economía Interna',
        modules: [
          { key: 'precios', title: 'Precios de Transferencia', description: 'Ventas entre células.', fields: ['precios_transferencia'] },
          { key: 'rentabilidad', title: 'Rentabilidad por Hora', description: 'Cálculo de utilidad.', fields: ['rentabilidad_hora'] }
        ]
      },
      {
        key: 'simulador_financiero',
        title: 'Simulador de Células',
        modules: [
          { key: 'simulador', title: 'Simulador Financiero', description: 'Simulador de rentabilidad por hora y micro-ganancias amoeba.', fields: ['iframe_simulador'] }
        ]
      }
    ]
  },
  guanxi_plan: {
    id: 'guanxi_plan',
    name: 'Metodología Guanxi (China - Redes de Relaciones)',
    pillars: [
      {
        key: 'redes_estado',
        title: 'Conexiones y Estado',
        modules: [
          { key: 'mapa_relacional', title: 'Mapa de Relaciones', description: 'Conexiones estratégicas.', fields: ['mapa_relaciones'] },
          { key: 'alineacion_estado', title: 'Plan Quinquenal', description: 'Alineación con el Estado.', fields: ['alineacion_quinquenal'] }
        ]
      },
      {
        key: 'manejo_conflictos',
        title: 'Reciprocidad y Armonía',
        modules: [
          { key: 'favores', title: 'Reciprocidad', description: 'Beneficios mutuos.', fields: ['reciprocidad'] },
          { key: 'mianzi', title: 'Armonía (Mianzi)', description: 'Resolución de conflictos.', fields: ['armonia'] }
        ]
      }
    ]
  },
  onudi_project: {
    id: 'onudi_project',
    name: 'Estudio de Factibilidad ONUDI (Industrial Global)',
    pillars: [
      {
        key: 'ingenieria_industrial',
        title: 'Ingeniería',
        modules: [
          { key: 'tecnologia', title: 'Ingeniería Base', description: 'Origen y viabilidad.', fields: ['ingenieria_base'] }
        ]
      },
      {
        key: 'financiamiento_global',
        title: 'Evaluación Financiera Global',
        modules: [
          { key: 'costo_capital', title: 'WACC ONUDI', description: 'Costo de capital internacional.', fields: ['wacc_onudi'] },
          { key: 'flujo_firma', title: 'FCFF', description: 'Flujo de caja para la firma.', fields: ['fcff'] },
          { key: 'riesgo', title: 'Sensibilidad', description: 'Análisis de riesgo global.', fields: ['sensibilidad_riesgo'] }
        ]
      },
      {
        key: 'simulador_financiero',
        title: 'Simulador y Factibilidad',
        modules: [
          { key: 'simulador', title: 'Simulador Financiero', description: 'Simulador cuantitativo de factibilidad industrial ONUDI a 5 años.', fields: ['iframe_simulador'] }
        ]
      }
    ]
  }
};
