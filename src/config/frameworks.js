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
          { key: 'analisis', title: 'Análisis de Producto y Valor', description: 'Descripción detallada del producto y beneficios.', fields: ['producto', 'valor', 'demanda', 'ventaja_diferencial'] },
          { key: 'segmentacion', title: 'Segmentación y Tamaño', description: 'TAM, SAM, SOM y perfil del buyer persona.', fields: ['tam', 'sam', 'som', 'perfil', 'sensibilidad_demanda'] },
          { key: 'metricas_aarrr', title: 'Métricas Pirata AARRR', description: 'Embudo cuantitativo: Adquisición, Activación, Retención, Referidos e Ingresos.', fields: ['adquisicion_aarrr', 'activacion_aarrr', 'retencion_aarrr', 'referidos_aarrr', 'ingresos_aarrr'] },
          { key: 'mapa', title: 'Mapa de Calor y Densidad', description: 'Visualización geográfica de la demanda y densidad de mercado.', fields: ['analisis_espacial'] },
          { key: 'competencia', title: 'Análisis de Competencia', description: 'Competidores directos, indirectos y ventaja competitiva.', fields: ['competidores', 'ventajas'] },
          { key: 'benchmarking', title: 'Benchmarking', description: 'Comparativa estructurada contra líderes del mercado.', fields: ['comparativa', 'matriz'] },
          { key: 'comercializacion', title: 'Estrategia de Comercialización', description: 'Canales de distribución, marketing e identidad de ventas.', fields: ['distribucion', 'promocion', 'identidad', 'canales_intermediarios'] },
          { key: 'ventas', title: 'Plan de Ventas y Precios', description: 'Estrategia de pricing y proyecciones de volumen.', fields: ['precios', 'estrategia', 'proyeccion_volumen', 'tacticas_precio'] },
          { key: 'inteligencia_mercado_cascada', title: 'Inteligencia de Mercado en Cascada', description: 'Investigación multinivel: Local INEGI DENUE, Scraping Nacional y APIs de Comercio Internacional.', fields: ['fuente_datos_local', 'consulta_web_scraping', 'consulta_internacional_api', 'validacion_cruzada'] }
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
          { key: 'evaluacion_social_cuantitativa', title: 'Evaluación Cuantitativa BID', description: 'Tasa social de descuento (8-12%), costos sombra y rentabilidad socioeconómica.', fields: ['tasa_descuento_social', 'beneficios_socioeconomicos', 'costos_sociales_sombra', 'tir_social_pct', 'vpn_social_monto'] },
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
          { key: 'critical_hypotheses', title: 'Hipótesis y Métricas', description: 'Identificación de las dos hipótesis más críticas de valor y crecimiento, y sus métricas.', fields: ['hipotesis_valor', 'hipotesis_crecimiento', 'metrica_exito', 'canal_validacion'] },
          { key: 'experimentos_tdd', title: 'Experimentos Lean TDD', description: 'Diseño riguroso de pruebas con criterios de falsificación, muestra y duración.', fields: ['hipotesis_h1_nula', 'criterio_falsificacion', 'tamano_muestra_minima', 'duracion_experimento_dias'] }
        ]
      },
      {
        key: 'aprendizaje',
        title: 'Tracción y Aprendizaje',
        modules: [
          { key: 'pilot_results', title: 'Resultados del Piloto', description: 'Resultados cuantitativos y cualitativos obtenidos durante las pruebas con clientes reales.', fields: ['datos_traccion', 'comentarios_early_adopters', 'aprendizajes_clave'] },
          { key: 'innovation_accounting', title: 'Contabilidad de Innovación', description: 'Evaluación cuantitativa de hitos: Línea base, optimizaciones y análisis de cohortes.', fields: ['metrica_linea_base', 'experimento_minimo_viable', 'analisis_cohortes', 'umbral_decision_pivote'] },
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
          { key: 'jobs_to_be_done', title: 'Jobs-to-be-Done (Christensen)', description: 'Declaración JTBD del cliente, circunstancia disparadora y dimensión funcional-emocional.', fields: ['job_statement_christensen', 'circunstancia_disparo', 'motivacion_funcional_emocional', 'resultado_deseado_criterio', 'alternativas_compensatorias'] },
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
          { key: 'disrupcion_sustaining', title: 'Disrupción vs Sostenimiento', description: 'Evaluación de trayectoria disruptiva (gama baja / nuevo mercado) y marco RPV organizacional.', fields: ['tipo_disrupcion_gama_baja_nuevo_mercado', 'evaluacion_rpv_recursos_procesos_valores', 'traccion_nichos_desatendidos', 'defensa_competitiva_incumbentes'] },
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
          { key: 'costos', title: 'Gastos de cada mes', description: 'Lista de pagos fijos como luz, agua, renta y sueldos.', fields: ['lista_gastos_mensuales', 'costos_por_producto'] },
          { key: 'punto_equilibrio_micro', title: 'Punto de Equilibrio Micro', description: 'Cálculo exacto de unidades mínimas de venta para cubrir costos fijos y variables.', fields: ['costos_fijos_mensuales', 'costo_variable_unitario', 'precio_venta_unitario', 'punto_equilibrio_unidades', 'margen_contribucion_ganancia'] }
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
          { key: 'oferta', title: 'Proyección de Oferta', description: 'Modelos de proyección para oferta, déficit y demanda futura.', fields: ['proyeccion_oferta'] },
          { key: 'inteligencia_mercado_cascada', title: 'Inteligencia de Mercado en Cascada', description: 'Investigación multinivel: Local INEGI DENUE, Scraping Nacional y APIs de Comercio Internacional.', fields: ['fuente_datos_local', 'consulta_web_scraping', 'consulta_internacional_api', 'validacion_cruzada'] }
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
          { key: 'capex_csi_16', title: 'Desglose CAPEX CSI-16', description: 'Estructuración según las 16 divisiones estándar CSI de construcción y maquinaria.', fields: ['division_csi_codigo', 'concepto_obra_maquinaria', 'unidad_medida_cantidad', 'costo_unitario_importe', 'total_inversion_csi'] },
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
          { key: 'tornado_sensibilidad', title: 'Diagrama Tornado de Riesgo', description: 'Variación de variables críticas (precio, volumen, CAPEX) sobre el VAN.', fields: ['variable_critica_analizada', 'rango_variacion_porcentual', 'van_escenario_pesimista', 'van_escenario_optimista', 'umbral_tolerancia_riesgo'] },
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
          { key: 'participacion', title: 'Matriz de Participación', description: 'Identificación, intereses y expectativas de involucrados.', fields: ['matriz_participacion'] },
          { key: 'problemas', title: 'Árbol de Problemas', description: 'Análisis causal de causas directas, indirectas y efectos.', fields: ['analisis_problemas'] }
        ]
      },
      {
        key: 'planificacion_mpp',
        title: 'Planificación Estratégica (MPP)',
        modules: [
          { key: 'objetivos', title: 'Árbol de Objetivos', description: 'Conversión de problemas a soluciones, medios y fines.', fields: ['analisis_objetivos'] },
          { key: 'analisis_alternativas_zopp', title: 'Análisis de Alternativas', description: 'Evaluación comparativa de estrategias según viabilidad técnica y financiera.', fields: ['alternativas_identificadas', 'criterios_evaluacion', 'alternativa_seleccionada'] },
          { key: 'matriz_logica', title: 'Matriz Lógica (MPP 4x4)', description: 'Resumen narrativo, indicadores verificables, fuentes y supuestos.', fields: ['mpp'] }
        ]
      },
      {
        key: 'cronograma_presupuesto',
        title: 'Operación y Recursos',
        modules: [
          { key: 'planificacion_actividades_cronograma', title: 'Plan de Actividades (Gantt)', description: 'Desglose de paquetes de trabajo, hitos y ruta crítica.', fields: ['paquetes_actividades', 'ruta_critica_gantt', 'responsables_hitos'] },
          { key: 'presupuesto_componentes', title: 'Presupuesto por Componentes', description: 'Asignación de costos de inversión y operación por resultado.', fields: ['costos_inversion_zopp', 'costos_operacion_zopp', 'fuentes_financiamiento_zopp'] }
        ]
      },
      {
        key: 'evaluacion_sostenibilidad',
        title: 'Evaluación y Sostenibilidad',
        modules: [
          { key: 'evaluacion_expost', title: 'Evaluación Ex-Post y Factores', description: 'Criterios de pertinencia, eficacia, impacto y continuidad operativa.', fields: ['pertinencia_evaluacion', 'eficacia_impacto', 'sostenibilidad_futura'] }
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
          { key: 'consorcio', title: 'Consorcio Transnacional', description: 'Estructura internacional de socios, capacidades y gobernanza.', fields: ['consorcio_multinacional'] },
          { key: 'ciencia_abierta', title: 'Open Science', description: 'Políticas de ciencia abierta y acceso libre a publicaciones.', fields: ['open_science'] },
          { key: 'gestion_datos_fair_dmp', title: 'Gestión de Datos FAIR (DMP)', description: 'Plan de gestión de datos: Localizables, Accesibles, Interoperables y Reutilizables.', fields: ['repositorios_fair', 'politica_acceso_abierto', 'plan_gestion_datos_dmp'] }
        ]
      },
      {
        key: 'impacto_sostenibilidad',
        title: 'Impacto y Sostenibilidad',
        modules: [
          { key: 'dnsh_principle', title: 'Principio DNSH (UE)', description: 'Garantía de no causar daño significativo a los 6 objetivos ambientales de la UE.', fields: ['dnsh'] },
          { key: 'impacto', title: 'Impacto Más Allá del SOTA', description: 'Avance científico sobre el estado del arte y beneficios para la UE.', fields: ['excelencia'] },
          { key: 'impacto_pathway_trl', title: 'Pathway de Impacto (TRL 6-9)', description: 'Ruta de maduración tecnológica desde prototipo hasta despliegue de mercado.', fields: ['pathway_hacia_mercado', 'trl_inicial_final', 'kpis_impacto_socioeconomico'] }
        ]
      },
      {
        key: 'implementacion_trabajo',
        title: 'Implementación y Presupuesto EU',
        modules: [
          { key: 'diseminacion_explotacion', title: 'Diseminación y Explotación', description: 'Estrategia de comunicación científica, patentes conjuntas y adopción comercial.', fields: ['medidas_diseminacion', 'propiedad_intelectual_consorcio', 'hoja_ruta_explotacion'] },
          { key: 'presupuesto_eu_microsoft', title: 'Presupuesto UE por Categorías', description: 'Costes de personal, equipamiento, subcontratación y 25% flat indirecto.', fields: ['costes_personal_wp', 'subcontratacion_equipo', 'gastos_indirectos_flat25'] }
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
          { key: 'norte_verdadero', title: 'True North (Norte Verdadero)', description: 'Visión de propósito inmutable a 5-10 años.', fields: ['true_north'] },
          { key: 'disrupcion', title: 'Objetivos Breakthrough', description: 'Metas de ruptura que transforman la competitividad del negocio.', fields: ['breakthroughs'] }
        ]
      },
      {
        key: 'alineacion_ejecucion',
        title: 'Alineación Estratégica',
        modules: [
          { key: 'matriz_x', title: 'Matriz X (4 Cuadrantes)', description: 'Correlación entre visión, objetivos anuales, prioridades y métricas.', fields: ['matriz_x'] },
          { key: 'catchball_nemawashi', title: 'Catchball & Nemawashi', description: 'Proceso bidireccional de consenso y negociación de recursos entre niveles.', fields: ['proceso_catchball', 'acuerdos_nemawashi', 'retroalimentacion_vertical'] },
          { key: 'a3_deployment', title: 'Despliegue de Informes A3', description: 'Estructuración concisa del problema, causa raíz, contramedidas y plan.', fields: ['antecedentes_a3', 'condicion_actual_a3', 'contramedidas_plan_accion'] }
        ]
      },
      {
        key: 'seguimiento_mejora',
        title: 'Seguimiento y Control Continuo',
        modules: [
          { key: 'seguimiento', title: 'Bowler Charts', description: 'Revisión mensual visual con semaforización de desviaciones.', fields: ['bowler'] },
          { key: 'pdca_hoshin', title: 'Ciclo PDCA de Mejora', description: 'Planear, Hacer, Verificar y Actuar para institucionalizar aprendizajes.', fields: ['ciclo_planear_hacer', 'auditoria_verificar', 'estandarizacion_actuar'] },
          { key: 'okrs_alineados', title: 'OKRs Alineados a la Matriz X', description: 'Objetivos trimestrales y resultados clave de equipos operativos.', fields: ['objetivos_trimestrales_okr', 'resultados_clave_medibles', 'scorecard_cumplimiento'] }
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
        title: 'Estructuración y Filosofía',
        modules: [
          { key: 'celulas', title: 'Mapeo de Células Amoeba', description: 'División de la organización en micro-unidades de ganancia autónomas.', fields: ['mapeo_celulas'] },
          { key: 'filosofia_corp', title: 'Filosofía Inamori', description: 'Principios de gestión basados en hacer lo correcto como ser humano.', fields: ['filosofia'] },
          { key: 'principios_inamori_12', title: '12 Principios de Gestión Inamori', description: 'Reglas fundamentales: fijar metas elevadas, precio óptimo y transparencia total.', fields: ['doce_principios_gestion', 'motivacion_empleados', 'gestion_transparente'] }
        ]
      },
      {
        key: 'economia_interna',
        title: 'Economía Interna y Productividad',
        modules: [
          { key: 'precios', title: 'Precios de Transferencia', description: 'Tarifas de compra-venta justa entre células internas sin márgenes ficticios.', fields: ['precios_transferencia'] },
          { key: 'rentabilidad', title: 'Rentabilidad por Hora', description: 'Cálculo de valor generado por hora: (Ventas Netas - Gastos) / Horas Totales.', fields: ['rentabilidad_hora'] },
          { key: 'time_based_management', title: 'Gestión Basada en el Tiempo', description: 'Eliminación sistemática de tiempos improductivos y maximización de valor/hora.', fields: ['control_horas_celula', 'minimizacion_desperdicio_tiempo', 'indicador_valor_agregado_hora'] }
        ]
      },
      {
        key: 'operaciones_comunicacion',
        title: 'Comunicación Operativa',
        modules: [
          { key: 'horenso_reportar_contactar_consultar', title: 'Protocolo Ho-Ren-So', description: 'Reglas de comunicación: Hokoku (Reportar), Renraku (Informar), Sodan (Consultar).', fields: ['protocolo_hokoku_informe', 'protocolo_renraku_comunicacion', 'protocolo_sodan_consulta'] }
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
        title: 'Conexiones y Alineación Estratégica',
        modules: [
          { key: 'mapa_relacional', title: 'Mapa Relacional Guanxi', description: 'Clasificación de círculos de confianza: familia, amigos, intermediarios y autoridades.', fields: ['mapa_relaciones'] },
          { key: 'alineacion_estado', title: 'Alineación al 14º Plan Quinquenal', description: 'Sintonía del proyecto con los objetivos prioritarios del gobierno central y local chino.', fields: ['alineacion_quinquenal'] }
        ]
      },
      {
        key: 'manejo_conflictos',
        title: 'Reciprocidad y Capital Social',
        modules: [
          { key: 'favores', title: 'Reciprocidad (Renqing)', description: 'Dinámica de intercambio ético de favores y equilibrio relacional.', fields: ['reciprocidad'] },
          { key: 'mianzi', title: 'Preservación de la Cara (Mianzi)', description: 'Estrategias para otorgar, mantener y nunca hacer perder la reputación pública.', fields: ['armonia'] },
          { key: 'gift_giving_renqing', title: 'Protocolo de Obsequios', description: 'Normas culturales sobre regalos adecuados, momentos idóneos y valor simbólico.', fields: ['protocolo_obsequios_renqing', 'registro_favores_intercambio', 'temporalidad_reciprocidad'] }
        ]
      },
      {
        key: 'protocolo_negociacion',
        title: 'Protocolo y Tácticas de Negociación',
        modules: [
          { key: 'banquet_protocol_ritual', title: 'Protocolo de Banquetes Chinos', description: 'Orden de asignación de asientos, rituales de brindis (Ganbei) y creación de confianza.', fields: ['protocolo_banquetes_orden', 'etiqueta_brindis_asientos', 'reglas_cortesia_empresarial'] },
          { key: 'mianzi_ladder_8niveles', title: 'Escala Mianzi de 8 Niveles', description: 'Jerarquía de preservación del estatus y gestión de desacuerdos indirectos.', fields: ['niveles_preservacion_mianzi', 'tacticas_dar_cara', 'prevencion_perdida_cara'] },
          { key: 'tacticas_negociacion_estrategica', title: 'Tácticas de Negociación China', description: 'Manejo de tiempos prolongados, concesiones graduales y pactos basados en la relación.', fields: ['estrategia_36_estratagemas', 'gestion_concesiones_paciencia', 'cierre_contratos_relacionales'] }
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
        title: 'Ingeniería y Emplazamiento',
        modules: [
          { key: 'tecnologia', title: 'Ingeniería Básica y Selección Tecnológica', description: 'Evaluación de patentes, licencias, rendimientos y capacidad instalada óptima.', fields: ['ingenieria_base'] },
          { key: 'localizacion_industrial', title: 'Matriz de Localización ONUDI', description: 'Evaluación multicriterio ponderada: materias primas, energía, agua y logística.', fields: ['matriz_localizacion_ponderada', 'disponibilidad_energia_agua', 'logistica_corredores_transporte'] },
          { key: 'impacto_ambiental_onudi', title: 'Evaluación de Impacto Ambiental (EIA)', description: 'Matriz de mitigación de emisiones, efluentes y residuos industriales.', fields: ['estudio_impacto_eia', 'gestion_efluentes_emisiones', 'plan_cumplimiento_ambiental'] }
        ]
      },
      {
        key: 'financiamiento_global',
        title: 'Evaluación Financiera Global (COMFAR)',
        modules: [
          { key: 'costo_capital', title: 'WACC ONUDI y Spread País', description: 'Costo de capital ponderado incorporando prima de riesgo soberano EMBI+.', fields: ['wacc_onudi'] },
          { key: 'flujo_firma', title: 'Flujo de Caja Libre (FCFF)', description: 'Flujo de caja para la firma antes de financiamiento y valor terminal.', fields: ['fcff'] },
          { key: 'riesgo_pais_cambiario', title: 'Riesgo País y Riesgo Cambiario', description: 'Evaluación de volatilidad cambiaria, convertibilidad y estrategias de cobertura.', fields: ['prima_riesgo_pais_embi', 'exposicion_tipo_cambio', 'cobertura_financiera_hedging'] },
          { key: 'riesgo', title: 'Análisis de Sensibilidad Tornado', description: 'Sensibilidad combinada precio-volumen y punto de quiebre industrial.', fields: ['sensibilidad_riesgo'] }
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
  },
  cafes: {
    id: 'cafes',
    name: 'Plan de Negocios CAFES (Emprendimiento Social y Familiar)',
    pillars: [
      {
        key: 'unidad_a',
        title: 'Unidad A · Resumen y Perfil del Emprendimiento',
        modules: [
          {
            key: 'resumen_ejecutivo',
            title: '0. Resumen Ejecutivo Integral',
            description: 'Síntesis ejecutiva de oportunidad, propuesta de valor, demanda, inversión y viabilidad.',
            fields: [
              'descripcion_situacion_actual',
              'problema_oportunidad',
              'propuesta_valor_diferencial',
              'cliente_objetivo_resumen',
              'validacion_demanda_resumen',
              'ventaja_competitiva',
              'modelo_ingresos_precios',
              'capital_semilla_resumen',
              'ventas_utilidades_resumen',
              'punto_equilibrio_resumen',
              'relacion_beneficio_costo_resumen',
              'impacto_social_familiar_resumen',
              'riesgos_mitigaciones_resumen',
              'cronograma_12_semanas_resumen'
            ]
          },
          {
            key: 'perfil_emprendedor',
            title: '1. Perfil del Emprendedor y Diagnóstico Cuántico',
            description: 'Identificación, historia, horario disponible, Modelo Atómico (3 Áreas) y ruta de independencia.',
            fields: [
              'datos_identificacion',
              'historia_motivacion',
              'experiencia_habilidades',
              'horario_apoyo_familiar',
              'diagnostico_capacitacion',
              'situacion_actual_negocio',
              'modelo_atomico_evaluacion',
              'plan_delegacion_cuantica',
              'ruta_independencia_fundador'
            ]
          }
        ]
      },
      {
        key: 'unidad_b',
        title: 'Unidad B · Mercado, Portafolio y Cliente',
        modules: [
          {
            key: 'idea_portafolio',
            title: '2. Idea de Negocio y Portafolio de Productos',
            description: 'Fichas técnicas, BOM de insumos, presentaciones, calidad e inocuidad alimentaria/comercial.',
            fields: [
              'descripcion_productos_servicios',
              'fichas_tecnicas_bom',
              'presentaciones_empaques',
              'requerimientos_inocuidad_calidad',
              'alcance_limitaciones_iniciales'
            ]
          },
          {
            key: 'estudio_mercado',
            title: '3. Estudio de Mercado Práctico y Demanda',
            description: 'Segmento, competencia local (3 mínimo), validación, estacionalidad y dimensionamiento TAM/SAM/SOM.',
            fields: [
              'segmento_capacidad_pago',
              'necesidades_criterios_compra',
              'competidores_locales_matriz',
              'diferenciadores_competencia',
              'validacion_demanda_piloto',
              'ubicacion_cobertura_rutas',
              'estacionalidad_picos_venta',
              'estimacion_demanda_tam_sam_som'
            ]
          }
        ]
      },
      {
        key: 'unidad_c',
        title: 'Unidad C · Operaciones, Capacidad y Producción',
        modules: [
          {
            key: 'plan_operaciones',
            title: '4. Plan de Operaciones, Cuello de Botella y Layout',
            description: 'Flujo del proceso, cuello de botella (TOC), programa productivo, proveedores, layout y logística.',
            fields: [
              'flujo_proceso_diagrama',
              'capacidad_cuello_botella_toc',
              'programa_produccion_metas',
              'aseguramiento_calidad_inocuidad',
              'lista_insumos_proveedores',
              'equipos_herramientas_catalogo',
              'layout_espacio_trabajo',
              'logistica_entregas_embalaje',
              'inventarios_rotacion_minimos',
              'manejo_residuos_seguridad'
            ]
          }
        ]
      },
      {
        key: 'unidad_d',
        title: 'Unidad D · Legal, Organización y Modelo Canvas',
        modules: [
          {
            key: 'aspectos_legales',
            title: '5. Aspectos Legales y Formalización Gradual',
            description: 'Transición a la formalidad, permisos de uso de suelo/salud, marca, contratos y régimen fiscal RESICO.',
            fields: [
              'esquema_operacion_transicion',
              'permisos_avisos_licencias',
              'propiedad_intelectual_marca',
              'contratos_esenciales',
              'cumplimiento_fiscal_resico'
            ]
          },
          {
            key: 'organizacion_talento',
            title: '6. Organización, Talento y Modelo Atómico',
            description: 'Estructura del equipo, tareas estándar, salarios con carga patronal, manuales y turnos familiares.',
            fields: [
              'estructura_equipo_organigrama',
              'perfiles_tareas_tiempos',
              'politica_sueldos_capacitacion',
              'manuales_operacion_calidad',
              'turnos_conciliacion_familiar'
            ]
          },
          {
            key: 'propuesta_valor_canvas',
            title: '7. Propuesta de Valor y Lienzo Canvas',
            description: 'Propuesta de valor, promesa de servicio, Canvas de 9 bloques, política de precios y pruebas piloto.',
            fields: [
              'propuesta_valor_beneficios',
              'promesa_experiencia_cliente',
              'lienzo_canvas_9bloques',
              'politica_precios_margen',
              'estrategia_pruebas_aprendizaje'
            ]
          }
        ]
      },
      {
        key: 'unidad_e',
        title: 'Unidad E · Marketing y Plan Comercial',
        modules: [
          {
            key: 'plan_comercial',
            title: '8. Plan Comercial, Canales y Lanzamiento 90 Días',
            description: 'Identidad de marca, canales (WhatsApp, ferias), promoción de bajo costo, garantías, alianzas y plan 90 días.',
            fields: [
              'marca_identidad_mensajes',
              'canales_venta_distribucion',
              'promocion_bajo_costo_referidos',
              'portafolio_paquetes_combos',
              'servicio_cliente_garantias',
              'metas_comerciales_kpis',
              'alianzas_locales_comunitarias',
              'plan_lanzamiento_90_dias'
            ]
          }
        ]
      },
      {
        key: 'unidad_f',
        title: 'Unidad F · Finanzas, Factibilidad y Corridas',
        modules: [
          {
            key: 'plan_financiero',
            title: '9. Plan Financiero, Proyecciones y Rentabilidad (B/C, TIR, VAN)',
            description: 'Inversión inicial, capital de trabajo, costos fijos/variables, BOM, punto de equilibrio, proyecciones a 12 meses y 3 años, rentabilidad (B/C, ROI, VAN, TIR), sensibilidad y capacidad de pago.',
            fields: [
              'supuestos_base_operativa',
              'presupuesto_inversion_inicial',
              'capital_trabajo_caja_chica',
              'costos_fijos_variables',
              'costeo_unitario_bom',
              'depreciacion_equipos',
              'politica_precios_margen_financiero',
              'punto_equilibrio_unidades_pesos',
              'proyeccion_ventas_1_3_anos',
              'estado_resultados_12_meses',
              'flujo_efectivo_12_meses',
              'balance_inicial_cierre_ano1',
              'indicadores_rentabilidad_bc_roi_van_tir',
              'analisis_sensibilidad_escenarios',
              'escenarios_pesimista_base_optimista',
              'capacidad_pago_credito'
            ]
          }
        ]
      },
      {
        key: 'unidad_g',
        title: 'Unidad G · Impacto Social, Familiar y Gestión de Riesgos',
        modules: [
          {
            key: 'impacto_social_ambiental',
            title: '10. Impacto Social, Familiar y Ambiental',
            description: 'Elevación del ingreso familiar, empleos generados, equidad de género, prácticas verdes y alineación a metas.',
            fields: [
              'aumento_ingreso_familiar',
              'empleos_directos_indirectos',
              'enfoque_inclusion_equidad',
              'practicas_ambientales_verdes',
              'alineacion_objetivos_comunitarios'
            ]
          },
          {
            key: 'matriz_riesgos',
            title: '11. Matriz de Riesgos y Plan B',
            description: 'Identificación de riesgos de mercado, operativos, financieros y legales, probabilidad/impacto, mitigación y gatillos Plan B.',
            fields: [
              'identificacion_riesgos_matriz',
              'probabilidad_impacto_calificacion',
              'medidas_mitigacion_preventiva',
              'plan_b_gatillos_accion'
            ]
          }
        ]
      },
      {
        key: 'unidad_h',
        title: 'Unidad H · Implementación y Solicitud al Financiador',
        modules: [
          {
            key: 'plan_implementacion',
            title: '12. Plan de Implementación (Ruta Crítica 12 Semanas)',
            description: 'Gantt de arranque, entregables semanales, responsables, KPIs de avance y contingencias.',
            fields: [
              'ruta_critica_gantt_12semanas',
              'hitos_entregables_semanales',
              'indicadores_avance_responsables',
              'plan_contingencias_arranque'
            ]
          },
          {
            key: 'requerimiento_capital',
            title: '13. Requerimiento de Capital Semilla e Inversión',
            description: 'Monto solicitado, desglose por rubro, aportación propia en especie/efectivo, cotizaciones, impacto marginal antes/después y comprobación.',
            fields: [
              'monto_solicitado_total',
              'desglose_rubros_destino',
              'aportacion_propia_fuentes',
              'evidencias_cotizaciones_proveedor',
              'impacto_capital_ventas_utilidad',
              'plan_uso_rendicion_cuentas'
            ]
          },
          {
            key: 'conclusiones_peticion',
            title: '14. Conclusiones y Petición Formal de Recursos',
            description: 'Argumento integral de factibilidad, compromisos del emprendedor y mentoría/capacitación requerida.',
            fields: [
              'argumento_factibilidad_sintesis',
              'compromisos_metas_emprendedor',
              'requerimientos_acompanamiento_mentoria'
            ]
          }
        ]
      },
      {
        key: 'unidad_i',
        title: 'Unidad I · Anexos y Expediente de Verificación',
        modules: [
          {
            key: 'expediente_anexos',
            title: 'Anexos (A1 a A22) y Checklist de Control',
            description: 'Expediente documental completo para comités de evaluación, convocatorias y financiamiento.',
            fields: [
              'checklist_expediente_completo',
              'identificaciones_comprobantes_a1',
              'curriculum_emprendedor_a2',
              'fotografias_productos_a3',
              'fichas_tecnicas_costeo_a4',
              'cotizaciones_equipo_insumos_a5',
              'directorio_proveedores_a6',
              'encuestas_validacion_a7',
              'registro_fotografico_espacio_a8',
              'diagramas_layout_a9',
              'permisos_avisos_contratos_a10',
              'tablas_financieras_impresas_a11',
              'tabla_amortizacion_credito_a12',
              'cartas_intencion_pedidos_a13',
              'manuales_operacion_atencion_a14',
              'politicas_calidad_inocuidad_a15',
              'bitacora_piloto_aprendizajes_a16',
              'evidencias_ventas_iniciales_a17',
              'carta_compromiso_metas_a18',
              'checklist_firmado_a19',
              'diagnostico_habilidades_capacitacion_a20',
              'convenio_convocatoria_a21',
              'constancias_capacitacion_a22'
            ]
          }
        ]
      },
      {
        key: 'simulador_financiero',
        title: 'Simulador Financiero y Corridas Cuánticas',
        modules: [
          {
            key: 'simulador',
            title: 'Simulador Financiero y Escenarios Monte Carlo',
            description: 'Simulador interactivo con cálculo automático de estados proforma, punto de equilibrio, B/C, TIR, VAN y análisis de estrés.',
            fields: ['iframe_simulador']
          }
        ]
      }
    ]
  }
};

