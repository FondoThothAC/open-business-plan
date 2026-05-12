export const FRAMEWORKS = {
  business: {
    id: 'business',
    name: 'Plan de Negocios Comercial',
    pillars: [
      {
        key: 'naturaleza',
        title: 'Naturaleza del Proyecto',
        modules: [
          { key: 'introduccion', title: 'Justificación y Origen', description: 'Origen, necesidad que cubre y propuesta de valor inicial.', fields: ['origen', 'necesidad', 'propuesta_valor'] },
          { key: 'identidad', title: 'Identidad Corporativa', description: 'Misión, Visión, Valores y concepto de marca.', fields: ['mision', 'vision', 'valores', 'imagen'] },
          { key: 'objetivos', title: 'Objetivos y Metas', description: 'Objetivos SMART a corto, mediano y largo plazo.', fields: ['general', 'especificos', 'metas'] },
          { key: 'foda', title: 'Análisis FODA', description: 'Fortalezas, Oportunidades, Debilidades y Amenazas.', fields: ['fortalezas', 'oportunidades', 'debilidades', 'amenazas'] },
          { key: 'pestel', title: 'Entorno (PESTEL)', description: 'Factores Políticos, Económicos, Sociales, Tecnológicos, etc.', fields: ['politico', 'economico', 'social', 'tecnologico', 'ecologico', 'legal'] },
          { key: 'legal', title: 'Marco Legal y Socios', description: 'Estructura legal, constitución y permisos requeridos.', fields: ['constitucion', 'socios', 'permisos'] }
        ]
      },
      {
        key: 'mercado',
        title: 'El Mercado',
        modules: [
          { key: 'analisis', title: 'Análisis de Producto y Valor', description: 'Descripción detallada del producto y beneficios.', fields: ['producto', 'valor', 'demanda', 'cliente'] },
          { key: 'segmentacion', title: 'Segmentación y Tamaño', description: 'TAM, SAM, SOM y perfil del buyer persona.', fields: ['tam', 'sam', 'som', 'perfil'] },
          { key: 'mapa', title: 'Mapa de Calor', description: 'Visualización geográfica de la demanda.', fields: ['heatmap_data'] },
          { key: 'competencia', title: 'Análisis de Competencia', description: 'Competidores directos, indirectos y ventaja competitiva.', fields: ['competidores', 'ventajas'] },
          { key: 'benchmarking', title: 'Benchmarking', description: 'Comparativa estructurada contra líderes del mercado.', fields: ['comparativa', 'matriz'] },
          { key: 'comercializacion', title: 'Estrategia de Comercialización', description: 'Canales de distribución, marketing e identidad de ventas.', fields: ['distribucion', 'promocion', 'identidad'] },
          { key: 'ventas', title: 'Plan de Ventas y Precios', description: 'Estrategia de pricing y proyecciones de volumen.', fields: ['precios', 'estrategia', 'proyeccion_volumen'] }
        ]
      },
      {
        key: 'tecnico',
        title: 'Estudio Técnico de Producción',
        modules: [
          { key: 'ubicacion', title: 'Localización y Ubicación', description: 'Macro y micro localización del negocio.', fields: ['macro', 'micro', 'local'] },
          { key: 'operacion', title: 'Operación y Procesos', description: 'Diagrama de flujo de operaciones y tecnología.', fields: ['proceso', 'diagrama', 'tecnologia'] },
          { key: 'recursos', title: 'Maquinaria y Tecnología', description: 'Equipamiento, hardware y herramientas necesarias.', fields: ['maquinaria', 'equipo', 'herramientas'] },
          { key: 'insumos', title: 'Insumos y Proveedores', description: 'Materias primas y cadena de suministro.', fields: ['materia_prima', 'proveedores', 'compras'] },
          { key: 'capacidad', title: 'Capacidad e Inventarios', description: 'Capacidad instalada, manejo de stock y turnos.', fields: ['instalada', 'inventarios', 'mano_obra'] },
          { key: 'ambiental', title: 'Impacto Ambiental', description: 'Sostenibilidad, manejo de residuos y normatividad.', fields: ['impacto', 'mitigacion', 'normatividad'] }
        ]
      },
      {
        key: 'organizacion',
        title: 'Organización y Finanzas',
        modules: [
          { key: 'estructura', title: 'Estructura Organizativa', description: 'Organigrama y descripción de puestos clave.', fields: ['organigrama_visual', 'puestos', 'funciones'] },
          { key: 'recursos_humanos', title: 'Gestión de Recursos Humanos', description: 'Políticas de contratación, capacitación y sueldos.', fields: ['reclutamiento', 'contratacion', 'sueldos'] },
          { key: 'inversion', title: 'Inversión Inicial (CAPEX)', description: 'Requerimientos de capital para arranque.', fields: ['capex', 'opex_inicial', 'financiamiento'] },
          { key: 'costos', title: 'Costos y Gastos (OPEX)', description: 'Estructura de costos fijos y variables mensuales.', fields: ['fijos', 'variables', 'unitario'] },
          { key: 'estados_financieros', title: 'Estados Financieros', description: 'Proyecciones de resultados, balance y flujo.', fields: ['resultados', 'balance', 'flujo_caja'] },
          { key: 'rentabilidad', title: 'Rentabilidad y Análisis', description: 'TIR, VPN, Punto de Equilibrio y ROI.', fields: ['punto_equilibrio', 'indicadores'] }
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
  }
};
