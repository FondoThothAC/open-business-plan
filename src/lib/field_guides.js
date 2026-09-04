/**
 * Guías de campos y prompts estructurados por Framework/Modelo (12 Tipos)
 * Fuente: 13 Libros de Referencia (Anatomy of a Business Plan, Lean Startup, Dummies, etc.)
 * Estructura: { instruccion, ejemplo, benchmark, cita, placeholder }
 */

export const BUSINESS_GUIDES = {
  "justificacion": {
    "instruccion": "Explica POR QUÉ existe tu negocio. ¿Qué problema real resuelves y por qué ahora es el momento correcto?",
    "ejemplo": "Ej: \"En Hermosillo, el 68% de profesionistas no tienen un plan patrimonial. Jubilus nace para cerrar esa brecha con asesoría accesible.\"",
    "benchmark": "Dolor de mercado validado con al menos 20 entrevistas o datos estadísticos oficiales.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2, p. 24)",
    "placeholder": "Explica el dolor del cliente, la oportunidad detectada y por qué ahora..."
  },
  "origen": {
    "instruccion": "Cuenta la historia de cómo surgió la idea. ¿Fue experiencia personal, un hueco en el mercado o una investigación?",
    "ejemplo": "Ej: \"La idea nació cuando el fundador detectó que sus colegas perdían dinero por falta de educación financiera básica.\"",
    "benchmark": "Narrativa creíble de experiencia fundadora o descubrimiento empírico.",
    "cita": "Ken Colwell — Starting a Business QuickStart Guide (Ch. 1, p. 18)",
    "placeholder": "Narra el momento eureka o la necesidad personal/laboral que originó el proyecto..."
  },
  "nombre": {
    "instruccion": "Nombre comercial y razón detrás de la elección. Debe ser memorable y reflejar la identidad del negocio.",
    "ejemplo": "Ej: \"Jubilus Consultores – del latín jubilum (alegría), evoca la tranquilidad de un futuro financiero seguro.\"",
    "benchmark": "Prueba de recordación fonética > 70% y dominio web/marca disponible.",
    "cita": "Creating a Business Plan For Dummies (Ch. 3, p. 42)",
    "placeholder": "Nombre comercial, etimología y mensaje que transmite..."
  },
  "descripcion": {
    "instruccion": "Resumen ejecutivo del negocio en 3-5 oraciones. Qué haces, para quién y cómo.",
    "ejemplo": "Ej: \"Firma de consultoría patrimonial dirigida a profesionistas de 25-45 años en Sonora, ofreciendo planes personalizados de inversión y protección.\"",
    "benchmark": "Elevator pitch comprensible en 30 segundos (máximo 75 palabras).",
    "cita": "Carl Schramm — Burn the Business Plan (Ch. 2, p. 35)",
    "placeholder": "Qué soluciona la empresa, a quién sirve y cuál es su modelo central..."
  },
  "mision": {
    "instruccion": "Propósito fundamental de la empresa. ¿Para qué existes HOY? Debe ser concreta y orientada a la acción.",
    "ejemplo": "Ej (Estilo Google): \"Democratizar la asesoría patrimonial en el noroeste de México mediante herramientas accesibles.\"",
    "benchmark": "1 sola oración de impacto centrada en el valor entregado HOY.",
    "cita": "Alexander Osterwalder — Business Model Generation (p. 28)",
    "placeholder": "Propósito fundamental presente y compromiso diario con el cliente..."
  },
  "vision": {
    "instruccion": "Aspiración a futuro (3-5 años). ¿Qué quieres lograr? Debe ser ambiciosa pero alcanzable.",
    "ejemplo": "Ej (Estilo Tesla): \"Ser la firma de consultoría patrimonial #1 en Sonora para 2028, con más de 5,000 clientes activos.\"",
    "benchmark": "Meta a 3-5 años con indicador numérico auditable (clientes, ingresos o cuota).",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 3, p. 55)",
    "placeholder": "Dónde estará posicionada la empresa en los próximos 3 a 5 años..."
  },
  "valores": {
    "instruccion": "Principios éticos que guían las decisiones del equipo. Lista 3-5 valores con una breve explicación de cada uno.",
    "ejemplo": "Ej (Estilo Netflix): \"Transparencia: Cero comisiones ocultas. Accesibilidad: Planes desde $500/mes.\"",
    "benchmark": "3 a 5 principios rectores no negociables que definen la cultura operativa.",
    "cita": "Plan de Negocios VF (Metodología Hispana, p. 32)",
    "placeholder": "Lista 3-5 valores éticos y cómo se reflejan en la toma de decisiones..."
  },
  "general": {
    "instruccion": "Objetivo macro del proyecto. Debe ser SMART: Específico, Medible, Alcanzable, Relevante, con Tiempo definido.",
    "ejemplo": "Ej: \"Alcanzar 500 clientes activos y $2M MXN en activos bajo gestión dentro de los primeros 18 meses de operación.\"",
    "benchmark": "1 objetivo macro SMART con meta financiera o de usuarios y fecha límite.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 3, p. 60)",
    "placeholder": "Objetivo global del plan con métrica SMART y plazo definido..."
  },
  "especificos": {
    "instruccion": "Desglose del objetivo general en 3-5 metas tácticas. Cada una debe tener un indicador claro.",
    "ejemplo": "Ej: \"1) Lanzar la plataforma digital en Q1. 2) Captar 50 clientes/mes vía redes sociales. 3) Obtener certificación AMIB.\"",
    "benchmark": "3 a 5 metas departamentales cuantificables que sustentan el objetivo general.",
    "cita": "Creating a Business Plan For Dummies (Ch. 4, p. 68)",
    "placeholder": "Desglosa 3 a 5 objetivos tácticos por área clave..."
  },
  "metas": {
    "instruccion": "Números concretos con fecha. Ventas, clientes, ingresos, participación de mercado, etc.",
    "ejemplo": "Ej: \"Mes 6: 150 clientes. Mes 12: $800K ingresos. Mes 18: Punto de equilibrio. Mes 24: Expansión a Baja California.\"",
    "benchmark": "Hitos semestrales o trimestrales con fechas y KPIs de volumen/ingresos.",
    "cita": "Ken Colwell — Starting a Business QuickStart Guide (Ch. 3, p. 62)",
    "placeholder": "Cronograma de hitos cuantitativos a 6, 12, 18 y 24 meses..."
  },
  "fortalezas": {
    "instruccion": "Ventajas internas que te diferencian de la competencia. Recursos, talento, tecnología propia.",
    "ejemplo": "Ej: \"Equipo con certificación AMIB, plataforma digital propia, alianzas con 3 aseguradoras líderes.\"",
    "benchmark": "Mínimo 3 capacidades internas críticas difícilmente replicables a corto plazo.",
    "cita": "Creating a Business Plan For Dummies (Ch. 5, p. 95)",
    "placeholder": "Ventajas internas: know-how, tecnología propia, licencias, equipo certificado..."
  },
  "oportunidades": {
    "instruccion": "Factores externos favorables que puedes aprovechar. Tendencias, vacíos de mercado, regulaciones nuevas.",
    "ejemplo": "Ej: \"Crecimiento del 23% anual en inversiones digitales en México. Nueva ley de educación financiera obligatoria.\"",
    "benchmark": "Tendencias macroeconómicas o regulatorias con crecimiento anual compuesto (CAGR) > 8%.",
    "cita": "Michael Porter — Competitive Strategy (Ch. 2, p. 48)",
    "placeholder": "Cambios en el entorno, vacíos de mercado o nuevas leyes favorables..."
  },
  "debilidades": {
    "instruccion": "Limitaciones internas actuales. Sé honesto: falta de capital, equipo pequeño, marca nueva.",
    "ejemplo": "Ej: \"Marca sin reconocimiento regional. Presupuesto de marketing limitado a $15K/mes. Solo 2 asesores certificados.\"",
    "benchmark": "Identificación honesta de brechas de capital, talento o tracción con plan de mitigación.",
    "cita": "Carl Schramm — Burn the Business Plan (Ch. 4, p. 72)",
    "placeholder": "Limitaciones internas actuales y cómo se compensarán en la fase inicial..."
  },
  "amenazas": {
    "instruccion": "Riesgos externos que podrían afectarte. Competencia agresiva, cambios regulatorios, crisis económica.",
    "ejemplo": "Ej: \"Entrada de fintechs internacionales (Betterment, GBM+). Volatilidad en tasas de interés de Banxico.\"",
    "benchmark": "Evaluación de riesgos externos con probabilidad e impacto asignados.",
    "cita": "Plan de Negocios VF (Metodología Hispana, p. 41)",
    "placeholder": "Riesgos de mercado, competidores agresivos o volatilidad económica..."
  },
  "politico": {
    "instruccion": "Leyes, regulaciones, estabilidad gubernamental y políticas fiscales que impactan tu operación.",
    "ejemplo": "Ej: \"La reforma fiscal 2025 exige facturación 4.0, lo cual beneficia la formalización de servicios de consultoría.\"",
    "benchmark": "Alineación con políticas públicas, programas sectoriales o incentivos fiscales.",
    "cita": "Starting a Business QuickStart Guide (Ch. 5, p. 102)",
    "placeholder": "Políticas gubernamentales, subsidios y estabilidad regulatoria..."
  },
  "economico": {
    "instruccion": "Inflación, tipo de cambio, poder adquisitivo, tasas de interés y ciclo económico actual.",
    "ejemplo": "Ej: \"Inflación del 4.2% con tasa Banxico al 10.5%. Clase media sonorense con ingreso promedio de $18K mensuales.\"",
    "benchmark": "Monitoreo de tasa libre de riesgo (Cetes/TIIE), inflación y poder adquisitivo regional.",
    "cita": "The Nature of Value (Ch. 2, p. 38)",
    "placeholder": "Inflación proyectada, tasas de interés, tipo de cambio e ingreso disponible..."
  },
  "social": {
    "instruccion": "Demografía, tendencias culturales, hábitos de consumo y nivel educativo de tu mercado.",
    "ejemplo": "Ej: \"Generación millennial (30-40 años) en Hermosillo muestra interés creciente en finanzas personales según encuesta INEGI 2024.\"",
    "benchmark": "Tendencias demográficas INEGI/CONAPO y evolución de hábitos de consumo.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 4, p. 74)",
    "placeholder": "Variables demográficas, nivel socioeconómico y cambios culturales del target..."
  },
  "tecnologico": {
    "instruccion": "Infraestructura digital disponible, innovaciones del sector y nivel de adopción tecnológica.",
    "ejemplo": "Ej: \"Penetración de smartphones del 89% en Sonora. APIs bancarias abiertas permiten integración en tiempo real.\"",
    "benchmark": "Nivel de digitalización del sector y adopción de herramientas en la nube.",
    "cita": "The Innovator's Dilemma (Christensen, p. 15)",
    "placeholder": "Plataformas tecnológicas, conectividad y automatizaciones aplicadas..."
  },
  "ecologico": {
    "instruccion": "Impacto ambiental de tu operación y tendencias de sustentabilidad relevantes.",
    "ejemplo": "Ej: \"Operación 100% digital sin oficina física reduce huella de carbono. Cumplimos NOM-161 de residuos electrónicos.\"",
    "benchmark": "Cumplimiento de normativas ambientales NOM/SEMARNAT o huella de carbono neutral.",
    "cita": "Corporate Sustainability in Asian Development (p. 64)",
    "placeholder": "Gestión de residuos, eficiencia energética y sustentabilidad ambiental..."
  },
  "legal": {
    "instruccion": "Marco jurídico que regula tu industria. Permisos, certificaciones y obligaciones legales.",
    "ejemplo": "Ej: \"Requiere registro ante CNBV y cumplimiento de la Ley del Mercado de Valores. NDA obligatorio con cada cliente.\"",
    "benchmark": "Dictamen legal previo y cumplimiento regulatorio del 100% de licencias primarias.",
    "cita": "Creating a Business Plan For Dummies (Ch. 12, p. 240)",
    "placeholder": "Marco legal regulatorio, licencias municipales, propiedad intelectual y contratos..."
  },
  "constitucion": {
    "instruccion": "Tipo de persona moral o física. Régimen fiscal elegido y justificación.",
    "ejemplo": "Ej: \"S.A. de C.V. bajo régimen general de ley. Capital social de $50,000 MXN con 3 socios fundadores.\"",
    "benchmark": "Régimen societario óptimo para captación de capital (S.A.P.I. de C.V. o S.A. de C.V.).",
    "cita": "Starting a Business QuickStart Guide (Ch. 12, p. 265)",
    "placeholder": "Tipo de sociedad mercantil, objeto social y justificación del régimen fiscal..."
  },
  "socios": {
    "instruccion": "Lista de inversionistas, socios fundadores y su porcentaje de participación.",
    "ejemplo": "Ej: \"Roberto Celis (40%), Ana García (30%), Luis Acosta (30%). Inversionista ángel: FundSonora ($200K MXN).\"",
    "benchmark": "Distribución accionaria con cláusulas de vesting (4 años con 1 año de cliff).",
    "cita": "Carl Schramm — Burn the Business Plan (Ch. 6, p. 110)",
    "placeholder": "Estructura de fundadores, porcentajes de participación y aportaciones..."
  },
  "permisos": {
    "instruccion": "Licencias y trámites necesarios para operar legalmente. Incluye tiempos estimados.",
    "ejemplo": "Ej: \"Licencia municipal de Hermosillo (3 semanas). RFC con actividad 5411 (inmediato). Registro IMSS patronal (5 días).\"",
    "benchmark": "Checklist de trámites municipales, estatales y federales con ruta crítica < 60 días.",
    "cita": "Manual de Plan de Negocios Panamá (p. 15)",
    "placeholder": "Lista de permisos requeridos, dependencias emisoras y tiempos estimados..."
  },
  "producto": {
    "instruccion": "Descripción técnica y funcional de tu producto o servicio. ¿Qué entregas exactamente?",
    "ejemplo": "Ej: \"Plan patrimonial personalizado que incluye: diagnóstico financiero, portafolio de inversión y seguro de vida.\"",
    "benchmark": "Ficha técnica completa con especificaciones de entrega y niveles de servicio (SLA).",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 4, p. 82)",
    "placeholder": "Descripción funcional detallada del producto o catálogo de servicios..."
  },
  "valor": {
    "instruccion": "Tu promesa única al cliente. ¿Por qué te elegirían sobre la competencia?",
    "ejemplo": "Ej: \"Asesoría sin conflicto de interés: cobramos honorarios fijos, no comisiones por producto vendido.\"",
    "benchmark": "Retorno de inversión para el cliente (ROI cliente) cuantificable > 2x su gasto.",
    "cita": "Alexander Osterwalder — Value Proposition Design (p. 48)",
    "placeholder": "Razón incontrovertible por la que el cliente elegirá tu solución..."
  },
  "demanda": {
    "instruccion": "Evidencia de que existe un mercado real dispuesto a pagar. Datos duros, encuestas, tendencias.",
    "ejemplo": "Ej: \"Según AMAFORE, solo 22% de trabajadores en Sonora tiene un plan de retiro privado. Encuesta propia: 78% de 200 encuestados pagaría por asesoría.\"",
    "benchmark": "Datos de intención de compra respaldados por cartas de intención o registros DENUE/INEGI.",
    "cita": "Plan de Negocios VF (Metodología Hispana, p. 52)",
    "placeholder": "Evidencia estadística y cualitativa de que existe un mercado comprador..."
  },
  "cliente": {
    "instruccion": "Perfil detallado de tu comprador ideal. Edad, ingreso, dolor principal, comportamiento.",
    "ejemplo": "Ej: \"Profesionista de 28-42 años, ingreso $20-50K/mes, preocupado por su retiro, busca opciones digitales y transparentes.\"",
    "benchmark": "Buyer Persona con datos demográficos, presupuesto promedio y dolores específicos.",
    "cita": "Ken Colwell — Starting a Business QuickStart Guide (Ch. 4, p. 88)",
    "placeholder": "Perfil psicográfico y conductual del cliente meta ideal..."
  },
  "tam": {
    "instruccion": "Mercado Total Direccionable. Todo el mercado posible si no tuvieras limitaciones.",
    "ejemplo": "Ej: \"3.2M de profesionistas en México que no tienen asesor financiero = $9.6B MXN anuales en fees potenciales.\"",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 4, p. 78)",
    "benchmark": "TAM = Población Total x Gasto Anual Promedio.",
    "placeholder": "Valor total del mercado si se alcanzara el 100% de la demanda teórica..."
  },
  "sam": {
    "instruccion": "Mercado Alcanzable. La porción del TAM que podrías servir con tu modelo actual.",
    "ejemplo": "Ej: \"185,000 profesionistas en Sonora con ingreso >$20K/mes = $370M MXN anuales en servicios de consultoría.\"",
    "cita": "Creating a Business Plan For Dummies (Ch. 5)",
    "benchmark": "SAM = TAM x Porcentaje de Segmento Geográfico / Económico.",
    "placeholder": "Mercado que realmente puedes atender con tu modelo y territorio actual..."
  },
  "som": {
    "instruccion": "Mercado Obtenible. La rebanada realista que planeas capturar en 1-3 años.",
    "ejemplo": "Ej: \"Capturar 0.5% del SAM = 925 clientes generando $5.5M MXN anuales en el tercer año.\"",
    "cita": "The Lean Startup (p. 89) & Starting a Business QuickStart Guide (p. 112)",
    "benchmark": "SOM esperado: entre 1% y 5% del SAM en etapas tempranas.",
    "placeholder": "Porción de mercado que planeas capturar concretamente en los años 1 a 3..."
  },
  "perfil": {
    "instruccion": "Características psicográficas: estilo de vida, valores, motivaciones y hábitos de compra.",
    "ejemplo": "Ej: \"Valora la seguridad sobre el riesgo. Investiga en YouTube antes de comprar. Prefiere apps sobre llamadas telefónicas.\"",
    "benchmark": "Mapa de empatía completo con 4 cuadrantes (piensa, ve, oye, hace).",
    "cita": "Alexander Osterwalder — Value Proposition Design (p. 16)",
    "placeholder": "Hábitos de compra, canales que consulta y criterios de decisión del cliente..."
  },
  "competidores": {
    "instruccion": "Lista de competidores directos e indirectos con sus fortalezas y debilidades.",
    "ejemplo": "Ej: \"Directos: GBM+ (digital, masivo), Actinver (premium). Indirectos: YouTube financiero, apps como Fintual.\"",
    "benchmark": "Mapeo de al menos 3 competidores directos y 2 sustitutos con su cuota estimada.",
    "cita": "Michael Porter — Competitive Strategy (Ch. 3, p. 74)",
    "placeholder": "Lista de competidores directos e indirectos, precios y fortalezas..."
  },
  "ventajas": {
    "instruccion": "Lo que te hace superior frente a cada competidor identificado.",
    "ejemplo": "Ej: \"vs GBM+: Asesoría personalizada humana. vs Actinver: Accesibilidad (monto mínimo de $500 vs $100K).\"",
    "benchmark": "Ventaja de costo o diferenciación clara demostrable en comparativa cabeza a cabeza.",
    "cita": "Michael Porter — Competitive Advantage (Ch. 2, p. 38)",
    "placeholder": "Puntos clave de superioridad frente a las alternativas actuales del cliente..."
  },
  "comparativa": {
    "instruccion": "Tabla comparativa entre tu negocio y los líderes del sector en variables clave.",
    "ejemplo": "Ej: \"Precio: Nosotros $500/mes vs Competidor A $2,000/mes. Personalización: Alta vs Media. Digital: 100% vs 40%.\"",
    "benchmark": "Matriz comparativa con al menos 6 variables de evaluación técnica y comercial.",
    "cita": "Creating a Business Plan For Dummies (Ch. 6, p. 125)",
    "placeholder": "Tabla cruzada evaluando precio, calidad, velocidad, soporte y tecnología..."
  },
  "matriz": {
    "instruccion": "Mapa visual donde posicionas tu marca frente a competidores en dos ejes estratégicos.",
    "ejemplo": "Ej: \"Eje X: Precio (bajo-alto). Eje Y: Personalización (masivo-premium). Nosotros: precio bajo + alta personalización.\"",
    "benchmark": "Cuadrante de posicionamiento estratégico en dos ejes clave (ej. Precio vs Personalización).",
    "cita": "Ken Colwell — Starting a Business QuickStart Guide (Ch. 4, p. 94)",
    "placeholder": "Ubicación en el mapa de posicionamiento frente a la competencia..."
  },
  "distribucion": {
    "instruccion": "Cómo llega tu producto al cliente. Canales físicos, digitales, directos o intermediarios.",
    "ejemplo": "Ej: \"Canal 1: App móvil propia (60%). Canal 2: Referidos de despachos contables (25%). Canal 3: Eventos empresariales (15%).\"",
    "benchmark": "Tiempos de entrega < 48 horas en digital o < 5 días en físico con costo logístico < 12%.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 4, p. 92)",
    "placeholder": "Logística de distribución, canales directos e intermediarios..."
  },
  "promocion": {
    "instruccion": "Estrategia de comunicación para atraer clientes. Medios, presupuesto, frecuencia y métricas.",
    "ejemplo": "Ej: \"Instagram Ads: $8K/mes, CTR esperado 2.5%. Webinars mensuales gratuitos. Programa de referidos: $500 por cliente nuevo.\"",
    "benchmark": "Ratio LTV/CAC > 3:1 y coste por lead calificado (CPL) medible.",
    "cita": "Eric Ries — El Método Lean Startup (p. 142)",
    "placeholder": "Estrategia de marketing digital, pauta publicitaria, eventos y alianzas..."
  },
  "identidad": {
    "instruccion": "Elementos visuales de la marca: logo, paleta de colores, tipografía, tono de comunicación.",
    "ejemplo": "Ej: \"Logo: Escudo dorado minimalista. Colores: Azul marino (#1e3a5f) + dorado (#d4a543). Tono: Profesional pero cercano.\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (identidad)..."
  },
  "precios": {
    "instruccion": "Estrategia de fijación de precios. Método usado (costo+margen, competencia, valor percibido).",
    "ejemplo": "Ej: \"Plan Básico: $500/mes. Plan Pro: $1,500/mes. Plan VIP: $3,500/mes. Basado en valor percibido con margen del 65%.\"",
    "benchmark": "Estrategia de fijación basada en valor percibido con margen bruto mínimo del 40%.",
    "cita": "Starting a Business QuickStart Guide (Ch. 7, p. 150)",
    "placeholder": "Estructura de precios, políticas de descuento y modelo de cobro..."
  },
  "estrategia": {
    "instruccion": "Tácticas de venta: embudo, ciclo de venta, guiones, CRM, seguimiento post-venta.",
    "ejemplo": "Ej: \"Embudo: Contenido orgánico → Webinar gratuito → Consulta 1:1 → Cierre. Ciclo promedio: 14 días. CRM: HubSpot Free.\"",
    "benchmark": "Tasa de conversión de embudo de ventas (lead a cliente) > 3%.",
    "cita": "Creating a Business Plan For Dummies (Ch. 7, p. 145)",
    "placeholder": "Etapas del embudo de ventas, guiones comerciales y política de seguimiento..."
  },
  "proyeccion_volumen": {
    "instruccion": "Estimación de unidades vendidas por mes/trimestre/año. Base el cálculo en datos reales.",
    "ejemplo": "Ej: \"Mes 1-3: 15 clientes/mes. Mes 4-6: 30/mes. Mes 7-12: 50/mes. Año 2: 80/mes. Total año 1: 350 clientes.\"",
    "benchmark": "Proyección de ventas a 3 años respaldada por capacidad operativa máxima instalada.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 180)",
    "placeholder": "Estimación mensual y anual de unidades/contratos colocados..."
  },
  "heatmap_data": {
    "instruccion": "Datos de densidad de clientes potenciales por zona. Puede ser geográfico o por segmento digital.",
    "ejemplo": "Ej: \"Zona Río: Densidad alta (35%). Centro: Media (20%). Sur Hermosillo: Baja (10%). Redes: LinkedIn 40%, IG 35%.\"",
    "benchmark": "Concentración geográfica validada con datos de censos económicos DENUE/INEGI.",
    "cita": "Plan de Negocios VF (p. 75)",
    "placeholder": "Polígonos territoriales de alta densidad de demanda y flujo peatonal/vehicular..."
  },
  "macro": {
    "instruccion": "Análisis de la región, estado o ciudad elegida. Justifica con datos económicos y logísticos.",
    "ejemplo": "Ej: \"Hermosillo, Sonora: PIB estatal de $430B MXN. Hub de servicios financieros del noroeste. Aeropuerto internacional.\"",
    "benchmark": "Selección de entidad/ciudad con PIB per cápita superior a la media y estabilidad logística.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 5, p. 115)",
    "placeholder": "Justificación de la ciudad o estado sede: infraestructura, conectividad y mercado..."
  },
  "micro": {
    "instruccion": "Ubicación exacta dentro de la ciudad. Colonia, calle, accesibilidad, competencia cercana.",
    "ejemplo": "Ej: \"Col. Villa de Seris, Blvd. Rosales #245. A 5 min del centro financiero. Renta: $12K/mes. Estacionamiento para 8 autos.\"",
    "benchmark": "Ubicación con vías de acceso principales, transporte público y servicios garantizados.",
    "cita": "Starting a Business QuickStart Guide (Ch. 6, p. 132)",
    "placeholder": "Dirección física, colonia, tipo de zona (industrial/comercial) y accesibilidad..."
  },
  "local": {
    "instruccion": "Distribución física del espacio de trabajo. Metros cuadrados, zonas y mobiliario.",
    "ejemplo": "Ej: \"Oficina de 80m²: Recepción (15m²), 2 oficinas privadas (12m² c/u), sala de juntas (20m²), coworking (21m²).\"",
    "benchmark": "Distribución de planta calculada según metros cuadrados requeridos por estación de trabajo.",
    "cita": "Creating a Business Plan For Dummies (Ch. 8, p. 165)",
    "placeholder": "Superficie total (m²), áreas de producción, oficinas, almacén y atención al público..."
  },
  "diagrama": {
    "instruccion": "Flujograma del proceso principal en formato Mermaid.js. Debe mostrar inicio, etapas y fin.",
    "ejemplo": "Ej: \"graph TD → A[Prospecto] → B[Diagnóstico] → C[Propuesta] → D[Firma contrato] → E[Implementación] → F[Seguimiento]\"",
    "benchmark": "Diagrama de flujo estándar en formato Mermaid.js con decisiones y responsables.",
    "cita": "Ken Colwell — Starting a Business QuickStart Guide (Ch. 6, p. 140)",
    "placeholder": "Código Mermaid (graph TD) que represente el proceso de punta a punta..."
  },
  "proceso": {
    "instruccion": "Explicación paso a paso de cómo se entrega el servicio o se fabrica el producto.",
    "ejemplo": "Ej: \"1. Cliente agenda cita (app). 2. Diagnóstico financiero (1hr). 3. Diseño de portafolio (48hrs). 4. Presentación y firma. 5. Monitoreo mensual.\"",
    "benchmark": "Tiempo de ciclo operativo (Takt Time) optimizado bajo metodología Lean Manufacturing.",
    "cita": "Plan de Negocios VF (p. 82)",
    "placeholder": "Flujo secuencial detallado desde la recepción de insumos hasta la entrega final..."
  },
  "maquinaria": {
    "instruccion": "Listado de equipo especializado con marca, modelo, costo y vida útil estimada.",
    "ejemplo": "Ej: \"2 MacBook Pro M3 ($45K c/u). 1 Servidor NAS Synology ($18K). Monitor 4K Dell ($12K). Total: $120K.\"",
    "benchmark": "Inversión en maquinaria con cálculo de depreciación acelerada y mantenimiento preventivo.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 5, p. 122)",
    "placeholder": "Inventario de maquinaria pesada/especializada, marcas, capacidades y costos..."
  },
  "equipo": {
    "instruccion": "Mobiliario de oficina, vehículos y equipo de cómputo general.",
    "ejemplo": "Ej: \"4 escritorios ejecutivos ($8K c/u). 6 sillas ergonómicas ($5K c/u). Proyector Epson ($15K). Total: $77K.\"",
    "benchmark": "Mobiliario y equipo auxiliar con vida útil estimada > 5 años.",
    "cita": "Plan de Negocios VF (p. 88)",
    "placeholder": "Listado de equipo de cómputo, transporte, herramientas auxiliares y mobiliario..."
  },
  "herramientas": {
    "instruccion": "Software, licencias, suscripciones y herramientas digitales necesarias.",
    "ejemplo": "Ej: \"HubSpot CRM ($0). Suite Adobe ($600/mes). Zoom Pro ($250/mes). Dominio + hosting ($2K/año). Bloomberg Terminal ($24K/año).\"",
    "benchmark": "Software y herramental con soporte técnico activo y póliza de actualización.",
    "cita": "Starting a Business QuickStart Guide (Ch. 6, p. 144)",
    "placeholder": "Software especializado, licencias, instrumental y herramientas menores..."
  },
  "materia_prima": {
    "instruccion": "Insumos principales para operar. En servicios: materiales de soporte, plataformas, data.",
    "ejemplo": "Ej: \"Datos de mercado (Reuters, $5K/mes). Papelería corporativa ($2K/mes). Bases de datos CNBV (gratuito).\"",
    "benchmark": "Especificaciones de insumos con ficha técnica y porcentaje de merma estimado < 3%.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 5, p. 128)",
    "placeholder": "Materias primas principales, consumibles e insumos requeridos por lote..."
  },
  "proveedores": {
    "instruccion": "Lista de proveedores clave con nombre, ubicación, condiciones de pago y alternativas.",
    "ejemplo": "Ej: \"Proveedor 1: AWS (hosting, crédito de $1K). Proveedor 2: Imprenta GraficSon (30 días crédito). Alternativa: DigitalOcean.\"",
    "benchmark": "Mínimo 2 proveedores calificados por insumo crítico para evitar riesgo de suministro.",
    "cita": "Creating a Business Plan For Dummies (Ch. 8, p. 180)",
    "placeholder": "Proveedores clave, plazos de crédito (30-60 días), ubicación y tiempos de entrega..."
  },
  "compras": {
    "instruccion": "Política de adquisiciones: frecuencia, volumen mínimo, control de calidad, inventario de seguridad.",
    "ejemplo": "Ej: \"Compras de papelería: mensual. Software: anual con descuento. Criterio: mínimo 3 cotizaciones. Pago a 30 días.\"",
    "benchmark": "Política de adquisiciones con lotes económicos de compra (EOQ) y compras consolidadas.",
    "cita": "Ken Colwell — Starting a Business QuickStart Guide (Ch. 6, p. 148)",
    "placeholder": "Procedimiento de cotización, autorización de compra y recepción en almacén..."
  },
  "capacidad": {
    "instruccion": "Cuántos clientes/productos puedes atender con tu infraestructura actual.",
    "ejemplo": "Ej: \"Capacidad actual: 200 clientes/mes con 2 asesores. Capacidad máxima: 500 clientes con 5 asesores y automatización.\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (capacidad)..."
  },
  "inventarios": {
    "instruccion": "Método de control de existencias (PEPS, UEPS, ABC) y software utilizado.",
    "ejemplo": "Ej: \"Para servicios: Control de citas vía Calendly. Para productos: Método PEPS en Excel con alerta de stock mínimo.\"",
    "benchmark": "Método de costeo de inventarios PEPS/Promedio y rotación de inventarios > 6 veces al año.",
    "cita": "Starting a Business QuickStart Guide (Ch. 8, p. 175)",
    "placeholder": "Sistema de gestión de inventarios, stock mínimo de seguridad y puntos de reorden..."
  },
  "mano_obra": {
    "instruccion": "Personal necesario por área con perfil, cantidad, turno y tipo de contratación.",
    "ejemplo": "Ej: \"2 asesores financieros (planta). 1 community manager (medio tiempo). 1 contador (outsourcing). 1 desarrollador (freelance).\"",
    "benchmark": "Costo de mano de obra directa no superior al 25% del costo total de producción.",
    "cita": "Plan de Negocios VF (p. 94)",
    "placeholder": "Personal operativo directo e indirecto, turnos de trabajo y perfil técnico..."
  },
  "impacto": {
    "instruccion": "Efectos de tu operación en el medio ambiente. Consumo energético, residuos, emisiones.",
    "ejemplo": "Ej: \"Oficina consume 450 kWh/mes. Operación digital reduce 80% de papel vs firma tradicional. Huella: 2.3 ton CO₂/año.\"",
    "benchmark": "Matriz de impacto ambiental con emisiones, vertidos y residuos cuantificados.",
    "cita": "Corporate Sustainability in Asian Development (p. 78)",
    "placeholder": "Diagnóstico de efectos directos e indirectos en el medio ambiente..."
  },
  "mitigacion": {
    "instruccion": "Acciones concretas para reducir tu impacto ambiental. Metas y plazos.",
    "ejemplo": "Ej: \"Meta 2025: 100% firmas digitales. 2026: Energía solar en oficina (-60% consumo). Reciclaje de e-waste con certificado.\"",
    "benchmark": "Plan de mitigación con metas concretas de reducción de consumo de agua y energía.",
    "cita": "Corporate Sustainability in Asian Development (p. 82)",
    "placeholder": "Acciones técnicas para neutralizar o minimizar los impactos ambientales..."
  },
  "normatividad": {
    "instruccion": "Leyes ambientales aplicables y tu nivel de cumplimiento actual.",
    "ejemplo": "Ej: \"Cumplimos NOM-161-SEMARNAT (residuos electrónicos). Exentos de Licencia Ambiental por ser servicio de bajo impacto.\"",
    "benchmark": "Checklist de cumplimiento de Normas Oficiales Mexicanas (NOMs) aplicables.",
    "cita": "Plan de Negocios VF (p. 102)",
    "placeholder": "Leyes ambientales, permisos SEMARNAT/PROFEPA y certificaciones ecológicas..."
  },
  "diagrama_visual": {
    "instruccion": "Código Mermaid.js para representar visualmente relaciones o árboles de problemas/objetivos. Debe conectar causas o medios (abajo) con el problema/objetivo central (centro) y efectos o fines (arriba) usando flechas -->.",
    "ejemplo": "Ej: \"flowchart TD\n  CI[Causa Indirecta] --> CD[Causa Directa]\n  CD --> PC[Problema Central]\n  PC --> E1[Efecto 1]\n  PC --> E2[Efecto 2]\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (diagrama_visual)..."
  },
  "organigrama_visual": {
    "instruccion": "Código Mermaid.js que genera el organigrama del equipo jerárquicamente.",
    "ejemplo": "Ej: \"graph TD → CEO → Dir. Financiero + Dir. Comercial → cada uno con sus subordinados\"",
    "benchmark": "Estructura organizacional escalable representada en sintaxis Mermaid.js.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 6, p. 148)",
    "placeholder": "Código Mermaid (graph TD) con la jerarquía institucional de puestos..."
  },
  "funciones": {
    "instruccion": "Tabla de responsabilidades de cada puesto clave. Qué hace, a quién reporta, KPIs.",
    "ejemplo": "Ej: \"Director Comercial: Captación de clientes, gestión de embudo, reporta a CEO. KPI: 50 clientes nuevos/mes.\"",
    "benchmark": "Manual de funciones con metas individuales (OKRs) y líneas de reporte claras.",
    "cita": "Ken Colwell — Starting a Business QuickStart Guide (Ch. 9, p. 190)",
    "placeholder": "Responsabilidades críticas de cada cargo y entregables esperados..."
  },
  "reclutamiento": {
    "instruccion": "Proceso de atracción y selección de talento. Fuentes, filtros y tiempos.",
    "ejemplo": "Ej: \"Publicación en LinkedIn + OCC. Filtro: CV → Entrevista técnica → Caso práctico → Contratación. Tiempo: 3 semanas.\"",
    "benchmark": "Proceso de selección estandarizado con tiempo de cobertura de vacante < 30 días.",
    "cita": "Plan de Negocios VF (p. 110)",
    "placeholder": "Canales de reclutamiento, filtros técnicos y entrevistas por competencias..."
  },
  "contratacion": {
    "instruccion": "Tipo de contrato, período de prueba, prestaciones y obligaciones patronales.",
    "ejemplo": "Ej: \"Contrato indeterminado con 3 meses de prueba. Prestaciones de ley + seguro de gastos médicos mayores (6to mes).\"",
    "benchmark": "Cumplimiento estricto de la Ley Federal del Trabajo, IMSS e INFONAVIT.",
    "cita": "Manual de Plan de Negocios Panamá (p. 20)",
    "placeholder": "Tipo de contratos (indeterminado, obra, prueba), prestaciones y marco laboral..."
  },
  "sueldos": {
    "instruccion": "Tabla salarial por puesto incluyendo sueldo bruto, neto, prestaciones y costo total.",
    "ejemplo": "Ej: \"Asesor Jr: $15K bruto + comisiones. Asesor Sr: $25K + bono. Dir. Comercial: $40K + 2% de ventas totales.\"",
    "benchmark": "Tabulador salarial competitivo contra medias del mercado regional (Mercer/INEGI).",
    "cita": "Starting a Business QuickStart Guide (Ch. 9, p. 198)",
    "placeholder": "Nómina presupuestada mensual, sueldos base, bonos y cargas patronales..."
  },
  "capex": {
    "instruccion": "[ANCLAJE OBLIGATORIO A SEMILLA] La inversión total en activos fijos y CAPEX debe estar estrictamente anclada a la cifra declarada en `semilla.inversion_esperada` (o inversión inicial). NO inventes cifras. Si el proyecto declara 20M MXN, desglosa los activos para cuadrar dicho monto.",
    "ejemplo": "Ej: \"semilla.inversion_esperada = $20,000,000 MXN → Equipo especializado y bancos de prueba: $10.5M. Instrumental y telemetría IoT: $4.5M. Mobiliario e infraestructura: $5.0M. Total CAPEX: $20.0M MXN.\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (capex)..."
  },
  "opex_inicial": {
    "instruccion": "[ANCLAJE OBLIGATORIO A SEMILLA] Capital de trabajo y fondo de maniobra derivado de la estructura de capital de `semilla.inversion_esperada` para cubrir los primeros 3 a 6 meses de operación.",
    "ejemplo": "Ej: \"De la inversión inicial de $20M MXN, se asignan $2,000,000 MXN a OPEX inicial: nómina preoperativa, seguros, rentas y reservas de contingencia.\"",
    "benchmark": "Fondo de maniobra / Capital de trabajo para cubrir entre 3 y 6 meses de costos fijos.",
    "cita": "Carl Schramm — Burn the Business Plan (Ch. 6, p. 125)",
    "placeholder": "Capital de trabajo necesario para operar mientras se alcanza el punto de equilibrio..."
  },
  "financiamiento": {
    "instruccion": "[ANCLAJE OBLIGATORIO A SEMILLA] Fuentes de capital estructuradas exactamente para fondear el monto canónico de `semilla.inversion_esperada`. Detalla capital propio, aportaciones y crédito bancario.",
    "ejemplo": "Ej: \"Financiamiento de $20M MXN totales: Serie A Fundadores 65% ($13M MXN), Serie B Inversionistas 35% ($7M MXN con dividendo preferente y recompra).\"",
    "benchmark": "Estructura de financiamiento balanceada (máximo 60% deuda / 40% capital propio).",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 172)",
    "placeholder": "Fuentes de financiamiento: aportaciones de socios, créditos bancarios o fondos públicos..."
  },
  "fijos": {
    "instruccion": "Gastos operativos que no varían con el volumen. Deben guardar congruencia con el tamaño de planta y capital de `semilla.inversion_esperada`.",
    "ejemplo": "Ej: \"Renta de nave industrial: $85K/mes. Nómina base administrativa: $240K/mes. Telecomunicaciones e IoT: $25K/mes. Total fijos: $350K/mes.\"",
    "benchmark": "Costos fijos mensuales cubiertos por el margen de contribución del 50% de la capacidad.",
    "cita": "Starting a Business QuickStart Guide (Ch. 10, p. 215)",
    "placeholder": "Desglose mensual de rentas, nóminas administrativas, servicios y seguros..."
  },
  "variables": {
    "instruccion": "Gastos que cambian según el número de clientes, reparaciones o servicios ejecutados.",
    "ejemplo": "Ej: \"Refacciones y mangueras por servicio: $4,500 MXN. Consumibles y fluidos: $1,200 MXN. Comisión técnica: $1,500 MXN.\"",
    "benchmark": "Costos variables unitarios perfectamente trazables a cada unidad vendida o servicio.",
    "cita": "Creating a Business Plan For Dummies (Ch. 10, p. 210)",
    "placeholder": "Costo por unidad de materia prima, comisiones, empaque y logística directa..."
  },
  "unitario": {
    "instruccion": "Cálculo del costo total de prestar una orden de servicio o unidad de producto comercializada.",
    "ejemplo": "Ej: \"Costo fijo unitario prorrateado: $8,750 MXN. Costo variable directo: $7,200 MXN. Costo total unitario: $15,950 MXN por servicio industrial.\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (unitario)..."
  },
  "resultados": {
    "instruccion": "[ANCLAJE OBLIGATORIO A SEMILLA] Proyección a 5 años sustentada en la capacidad instalada fondeada con `semilla.inversion_esperada`. Detalla ingresos, EBITDA y utilidades netas.",
    "ejemplo": "Ej: \"Año 1: Ingresos $18.5M - Costos/Gastos $14.2M = EBITDA $4.3M (Utilidad Neta $2.8M). Año 5: Ingresos $46.0M - EBITDA $14.8M.\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (resultados)..."
  },
  "balance": {
    "instruccion": "[ANCLAJE OBLIGATORIO A SEMILLA] Estado de Situación Financiera. El Activo Total en el Año 1 debe reflejar la aplicación íntegra del capital de `semilla.inversion_esperada` (Activos = Pasivos + Capital).",
    "ejemplo": "Ej: \"Año 1: Activos Totales $20,000,000 MXN (Fijo $15M + Circulante $5M) = Pasivos $6,000,000 MXN + Capital Social $14,000,000 MXN.\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (balance)..."
  },
  "flujo_caja": {
    "instruccion": "[ANCLAJE OBLIGATORIO A SEMILLA] Flujo de caja libre. El periodo 0 debe registrar el desembolso exacto del CAPEX canónico de `semilla.inversion_esperada`.",
    "ejemplo": "Ej: \"Año 0 (Inversión inicial): -$20,000,000 MXN. Año 1: +$3,850,000 MXN. Año 2: +$6,420,000 MXN. Flujo acumulado positivo a partir del mes 48.\"",
    "benchmark": "Flujo de efectivo operativo positivo de forma sostenida a partir del mes 9-12.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 202)",
    "placeholder": "Proyección de entradas y salidas de efectivo mensuales para evitar iliquidez..."
  },
  "punto_equilibrio": {
    "instruccion": "Volumen crítico en unidades monetarias y servicios para absorber costos fijos. Evita fórmulas con división por cero o símbolos infinitos (∞).",
    "ejemplo": "Ej: \"Punto de equilibrio mensual: $350K CF ÷ (1 - 0.42 CV) = $603,448 MXN mensuales en facturación (aprox. 18 servicios mayores al mes).\"",
    "benchmark": "Punto de Equilibrio alcanzable antes del mes 12 de operación.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 188)",
    "placeholder": "Volumen mínimo de ventas en unidades y dinero para no ganar ni perder..."
  },
  "indicadores": {
    "instruccion": "[ANCLAJE OBLIGATORIO A SEMILLA] Indicadores financieros maestros calculados a partir del desembolso de `semilla.inversion_esperada`. La TIR debe situarse en un rango plausible (15% a 40%) y el Payback corresponder al plazo de retorno.",
    "ejemplo": "Ej: \"Inversión Base: $20,000,000 MXN. TIR: 24.5%, VAN (tasa 12%): $3.42M MXN, Payback: 4.1 años (49 meses), ROI proyectado: 68% a 5 años.\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (indicadores)..."
  },
  "punto_reorden": {
    "instruccion": "Nivel mínimo de existencias de insumos que dispara automáticamente una nueva orden de compra.",
    "ejemplo": "Ej: \"Mangueras de alta presión: Punto de reorden en 15 unidades (lead time de entrega de 5 días). Sellos hidráulicos: 50 sets.\"",
    "benchmark": "Punto de Reorden = (Demanda diaria promedio x Tiempo de entrega del proveedor) + Stock de seguridad.",
    "cita": "Creating a Business Plan For Dummies (Ch. 8, p. 185)",
    "placeholder": "Umbrales numéricos de inventario que disparan una nueva orden de compra..."
  },
  "otd": {
    "instruccion": "On-Time Delivery: Porcentaje de entregas o servicios ejecutados a tiempo respecto al compromiso.",
    "ejemplo": "Ej: \"Meta OTD: 98.5% en contratos mineros Tier 1. Monitoreo semanal mediante sistema ERP.\"",
    "benchmark": "On-Time Delivery (OTD) objetivo > 95% de entregas a tiempo y en forma.",
    "cita": "Starting a Business QuickStart Guide (Ch. 6, p. 152)",
    "placeholder": "Métrica de entregas a tiempo y acciones correctivas ante demoras..."
  },
  "rotacion": {
    "instruccion": "Rotación de Inventarios: Veces que se renueva el stock en un periodo determinado.",
    "ejemplo": "Ej: \"Rotación objetivo: 6.0 veces al año (60 días de permanencia promedio en almacén).\"",
    "benchmark": "Rotación de inventarios acorde al sector (alta en perecederos > 24x, manufactura > 6x).",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 195)",
    "placeholder": "Frecuencia con la que se renueva el inventario en el periodo..."
  },
  "dso": {
    "instruccion": "Days Sales Outstanding: Días promedio de cobro a clientes corporativos.",
    "ejemplo": "Ej: \"DSO objetivo: 45 días para mineras y 30 días para contratistas locales.\"",
    "benchmark": "Días de Ventas Pendientes de Cobro (DSO) < 45 días.",
    "cita": "The Nature of Value (Ch. 4, p. 82)",
    "placeholder": "Plazo promedio real en el que los clientes pagan sus cuentas por cobrar..."
  },
  "dpo": {
    "instruccion": "Days Payable Outstanding: Días promedio de pago a proveedores clave.",
    "ejemplo": "Ej: \"DPO negociado: 60 días con fabricantes OEM de mangueras y conexiones.\"",
    "benchmark": "Días de Cuentas por Pagar a Proveedores (DPO) negociados a > 45 días (DPO >= DSO).",
    "cita": "The Nature of Value (Ch. 4, p. 85)",
    "placeholder": "Tiempo promedio otorgado por proveedores para liquidar facturas..."
  },
  "ccc": {
    "instruccion": "Cash Conversion Cycle (Ciclo de Conversión de Efectivo): Días que toma convertir inventario en flujo de caja.",
    "ejemplo": "Ej: \"CCC = Días Inventario (60) + DSO (45) - DPO (60) = 45 días de requerimiento de capital de trabajo.\"",
    "benchmark": "Ciclo de Conversión de Efectivo (CCC = Días Inventario + DSO - DPO) < 30 días o negativo.",
    "cita": "The Nature of Value (Ch. 4, p. 90)",
    "placeholder": "Tiempo total que tarda un peso invertido en producción en regresar como cobro efectivo..."
  },
  "puestos_lista": {
    "instruccion": "Matriz consolidada de capital humano y costo patronal acorde al tamaño de la organización presupuestada en la semilla.",
    "ejemplo": "Ej: \"Estructura de 14 especialistas: 1 Gerente General ($65K), 2 Líderes Técnicos ($45K c/u), 6 Técnicos Hidráulicos ($22K c/u), 3 Operadores IoT ($20K c/u), 2 Administrativos ($18K c/u). Costo patronal total: $480K/mes.\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (puestos_lista)..."
  },
  "inversion_fija": {
    "instruccion": "[ANCLAJE OBLIGATORIO A SEMILLA] Activos fijos tangibles. Su monto debe sumar armónicamente con la inversión diferida y el OPEX inicial para totalizar la cifra de `semilla.inversion_esperada`.",
    "ejemplo": "Ej: \"De $20,000,000 MXN totales de semilla: Banco de pruebas hidráulicas ($5.5M), instrumental de telemetría ($3.5M), nave y adecuaciones ($4.0M), flotilla de servicio móvil ($2.0M). Total fija: $15.0M MXN.\"",
    "benchmark": "Presupuesto CAPEX de activos fijos con cotizaciones formales por escrito.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 165)",
    "placeholder": "Inversión en terrenos, edificios, maquinaria y mobiliario duradero..."
  },
  "inversion_diferida": {
    "instruccion": "[ANCLAJE OBLIGATORIO A SEMILLA] Gastos preoperativos y patentes. Parte integral del desglose canónico de `semilla.inversion_esperada`.",
    "ejemplo": "Ej: \"De los $20M de semilla: Certificación ISO 4406 ($450K), constitución SAPI y registros IP ($350K), software y ERP ($1.2M). Total diferida: $2.0M MXN.\"",
    "benchmark": "Gastos preoperativos amortizables en un periodo máximo de 3 a 5 años.",
    "cita": "Plan de Negocios VF (p. 118)",
    "placeholder": "Gastos de constitución, licencias, patentes, capacitación inicial y proyectos..."
  },
  "amortizacion_creditos": {
    "instruccion": "Servicio de deuda para la porción apalancada declarada en el financiamiento de la inversión.",
    "ejemplo": "Ej: \"Crédito institucional por $7M MXN a 60 meses, tasa anual 13.5%, cuota mensual de $161,000 MXN con amortización creciente.\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (amortizacion_creditos)..."
  },
  "memorias_calculo": {
    "instruccion": "[ANCLAJE OBLIGATORIO A SEMILLA] Supuestos cuantitativos, precios de contratos y costos unitarios que soportan los ingresos proyectados a partir del despliegue de `semilla.inversion_esperada`.",
    "ejemplo": "Ej: \"Base de cálculo: 35 unidades mineras monitoreadas @ $48,000 MXN/mes + 12 mantenimientos mayores mensuales @ $95,000 MXN.\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (memorias_calculo)..."
  },
  "relacion_bc": {
    "instruccion": "Relación Beneficio-Costo (B/C). Valor presente de beneficios descontados entre la inversión inicial canónica.",
    "ejemplo": "Ej: \"Relación B/C de 1.42 (VPN positivo con inversión inicial de $20M MXN a tasa del 12%), ratificando viabilidad financiera sólida.\"",
    "benchmark": "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
    "placeholder": "Ingresa los detalles metodológicos de (relacion_bc)..."
  },
  "corrida_automatica": {
    "instruccion": "[ANCLAJE OBLIGATORIO A SEMILLA] Síntesis ejecutiva de la corrida financiera a 5 años sustentada en `semilla.inversion_esperada`.",
    "ejemplo": "Ej: \"Inversión: $20,000,000 MXN | WACC: 12% | TIR: 24.5% | VAN: $3,420,000 MXN | Payback: 4.1 años | Rentabilidad neta en año 3: 21%.\"",
    "benchmark": "Modelo financiero dinámico conectado a fórmulas maestras auditadas sin errores circulares.",
    "cita": "Plan de Negocios VF (p. 130)",
    "placeholder": "Parámetros y premisas de la corrida financiera automatizada..."
  },
  "necesidad": {
    "instruccion": "Define el dolor no resuelto o la necesidad urgente que atiende el negocio.",
    "ejemplo": "Ej: Falta de monitoreo en tiempo real genera pérdidas millonarias por paros no programados.",
    "benchmark": "Dolor cuantificable en dinero o tiempo.",
    "cita": "The Lean Startup (Ries, p. 45)",
    "placeholder": "Dolor del mercado, pérdidas actuales..."
  },
  "modelo_negocio": {
    "instruccion": "Explica cómo la empresa captura valor y asegura rentabilidad a largo plazo.",
    "ejemplo": "Ej: Modelo híbrido de venta de equipo + póliza de mantenimiento preventivo mensual.",
    "benchmark": "Margen bruto objetivo > 40%.",
    "cita": "Creating a Business Plan For Dummies (Ch. 3)",
    "placeholder": "Estructura transaccional y recurrencia..."
  },
  "propuesta_valor": {
    "instruccion": "Enuncia la propuesta de valor nuclear con beneficios medibles y diferenciales.",
    "ejemplo": "Ej: Mantenimiento predictivo inteligente que incrementa 20% la vida útil del equipo.",
    "benchmark": "1 frase concisa + 3 métricas de beneficio.",
    "cita": "Value Proposition Design (p. 28)",
    "placeholder": "Promesa central diferenciada..."
  },
  "imagen": {
    "instruccion": "Define el concepto de marca, personalidad visual y percepción deseada.",
    "ejemplo": "Ej: Marca con enfoque industrial, tecnológico y de máxima confiabilidad.",
    "benchmark": "Coherencia estética B2B.",
    "cita": "Brand Positioning (Keller, p. 95)",
    "placeholder": "Tono, personalidad y valores visuales..."
  },
  "socios_clave": {
    "instruccion": "Lista los socios estratégicos, proveedores clave y aliados institucionales indispensables para operar.",
    "ejemplo": "Ej: Distribuidores autorizados de maquinaria, despachos contables y proveedores de nube.",
    "benchmark": "Mínimo 3 alianzas críticas.",
    "cita": "Alexander Osterwalder — Business Model Generation (p. 38)",
    "placeholder": "Distribuidores, proveedores, alianzas..."
  },
  "actividades_clave": {
    "instruccion": "Define las acciones operativas y de entrega neurálgicas que hacen funcionar la propuesta de valor.",
    "ejemplo": "Ej: Diagnóstico técnico, desarrollo de software, control de calidad y soporte 24/7.",
    "benchmark": "Enfocadas a la entrega de valor.",
    "cita": "Business Model Generation (p. 36)",
    "placeholder": "Operación, desarrollo, soporte..."
  },
  "recursos_clave": {
    "instruccion": "Detalla los activos físicos, intelectuales, humanos y financieros indispensables.",
    "ejemplo": "Ej: Taller certificado, ingenieros seniors, servidores dedicados y fondo de maniobra.",
    "benchmark": "Activos difícilmente imitables.",
    "cita": "Business Model Generation (p. 34)",
    "placeholder": "Infraestructura, talento, capital..."
  },
  "propuestas_valor": {
    "instruccion": "Redacta el paquete de productos y servicios que resuelven el dolor específico del cliente.",
    "ejemplo": "Ej: Reducción del 35% en costos correctivos y garantía de disponibilidad del 99%.",
    "benchmark": "Diferenciación cuantificada.",
    "cita": "Value Proposition Design (p. 18)",
    "placeholder": "Promesa única cuantificada..."
  },
  "relaciones_clientes": {
    "instruccion": "Define el tipo de relación e interacción con cada segmento (dedicada, automatizada, autoservicio).",
    "ejemplo": "Ej: Asistencia personalizada con ejecutivos de cuenta B2B y revisiones trimestrales.",
    "benchmark": "Retención / Churn < 5% anual.",
    "cita": "Business Model Generation (p. 30)",
    "placeholder": "Asistencia dedicada, autoservicio..."
  },
  "canales": {
    "instruccion": "Establece los canales de comunicación, venta, distribución y postventa.",
    "ejemplo": "Ej: Venta directa consultiva B2B, portal web de pedidos y soporte vía app móvil.",
    "benchmark": "Estrategia omnicanal.",
    "cita": "Business Model Generation (p. 28)",
    "placeholder": "Canales directos e indirectos..."
  },
  "segmentos_clientes": {
    "instruccion": "Segmenta a los clientes por industria, volumen de compra, geografía y necesidades.",
    "ejemplo": "Ej: Empresas mineras medianas y grandes en el noroeste de México con maquinaria pesada.",
    "benchmark": "Segmentación B2B por capacidad de compra.",
    "cita": "Business Model Generation (p. 22)",
    "placeholder": "Perfil de empresas o consumidores..."
  },
  "estructura_costos": {
    "instruccion": "Identifica los costos fijos y variables más significativos que sustentan la operación.",
    "ejemplo": "Ej: Nómina técnica (45%), refacciones (25%), renta y servicios (15%), marketing (15%).",
    "benchmark": "Costos fijos < 45% del ingreso proyectado.",
    "cita": "Business Model Generation (p. 40)",
    "placeholder": "Nómina, insumos, infraestructura..."
  },
  "fuentes_ingresos": {
    "instruccion": "Describe los flujos y mecanismos de monetización (suscripciones, venta directa, comisiones).",
    "ejemplo": "Ej: 60% contratos anuales de mantenimiento recurrente, 40% servicios por evento.",
    "benchmark": "Mínimo 50% de ingresos recurrentes (ARR).",
    "cita": "Business Model Generation (p. 32)",
    "placeholder": "MaaS, venta puntual, suscripción..."
  },
  "ciclo_vida": {
    "instruccion": "Determina la fase del ciclo de vida de la industria y producto (introducción, crecimiento, madurez).",
    "ejemplo": "Ej: Industria en fase de crecimiento acelerado (18% CAGR) por electrificación minera.",
    "benchmark": "Justificación con datos de mercado.",
    "cita": "Competitive Strategy (Porter, p. 160)",
    "placeholder": "Etapa del ciclo de vida..."
  },
  "sensibilidad_demanda": {
    "instruccion": "Evalúa la elasticidad precio de la demanda y el impacto de cambios económicos.",
    "ejemplo": "Ej: Demanda inelástica (Ep = -0.4) debido a que el servicio es crítico para evitar paros.",
    "benchmark": "Elasticidad justificada.",
    "cita": "The Nature of Value (Ch. 3)",
    "placeholder": "Elasticidad y factores de riesgo..."
  },
  "analisis_espacial": {
    "instruccion": "Analiza la concentración territorial de clientes y competidores con datos geoespaciales (DENUE/INEGI).",
    "ejemplo": "Ej: Concentración del 62% del mercado en el corredor industrial norte de Hermosillo.",
    "benchmark": "Densidad geográfica validada.",
    "cita": "INEGI DENUE 2026",
    "placeholder": "Distribución espacial y densidad..."
  },
  "canales_intermediarios": {
    "instruccion": "Detalla acuerdos comerciales con distribuidores, comisionistas o integradores.",
    "ejemplo": "Ej: Comisión del 8% a distribuidores autorizados de equipo por referir contratos MaaS.",
    "benchmark": "Comisión < 12% del margen bruto.",
    "cita": "Anatomy of a Business Plan (Ch. 4)",
    "placeholder": "Comisiones y acuerdos de canal..."
  },
  "tacticas_precio": {
    "instruccion": "Estrategias de pricing dinámico, descuentos por pronto pago o paquetes escalonados.",
    "ejemplo": "Ej: 5% descuento por pago anual anticipado en contratos de mantenimiento.",
    "benchmark": "Optimización de flujo de caja.",
    "cita": "The Lean Startup (p. 98)",
    "placeholder": "Descuentos, paquetes y términos..."
  },
  "tecnologia": {
    "instruccion": "Detalla el paquete tecnológico, software de control, hardware especializado y nivel de automatización que sustentan la ventaja operativa.",
    "ejemplo": "Ej: Banco de pruebas de 300 HP con telemetría digital en tiempo real y software SCADA para diagnóstico de bombas hidráulicas.",
    "benchmark": "Nivel de madurez tecnológica TRL >= 7.",
    "cita": "The Innovator's Dilemma (Christensen, Ch. 1) & Operations Management (Slack, p. 140)",
    "placeholder": "Tecnología, software, patentes y automatización..."
  },
  "economias_escala": {
    "instruccion": "Explica cómo los costos unitarios decrecen a medida que aumenta el volumen de producción.",
    "ejemplo": "Ej: Compra de refacciones por contenedor reduce costo unitario en un 22%.",
    "benchmark": "Reducción de costo marginal comprobable.",
    "cita": "Competitive Strategy (Porter, p. 7)",
    "placeholder": "Curva de aprendizaje y escala..."
  },
  "tipo_proceso": {
    "instruccion": "Clasifica el tipo de manufactura o servicio (por proyecto, por lote, flujo continuo o células).",
    "ejemplo": "Ej: Producción híbrida: células de trabajo para diagnóstico y línea continua para maquinado.",
    "benchmark": "Eficiencia OEE >= 85%.",
    "cita": "Operations Management (Slack, p. 92)",
    "placeholder": "Por lotes, continuo, proyecto..."
  },
  "instalada": {
    "instruccion": "Calcula la capacidad instalada máxima vs la capacidad utilizada en turnos normales de operación (unidades/mes u horas de servicio).",
    "ejemplo": "Ej: Capacidad máxima: 80 overhauls de cilindros al mes (2 turnos de 8 hrs). Operación inicial al 45% (36 servicios/mes).",
    "benchmark": "Utilización inicial óptima entre 40% y 65% para permitir escalabilidad sin nuevo CAPEX.",
    "cita": "Operations Management (Slack, p. 280) & Anatomy of a Business Plan (Ch. 6)",
    "placeholder": "Capacidad máxima, turnos y nivel de utilización inicial..."
  },
  "puestos": {
    "instruccion": "Describe los perfiles, responsabilidades críticas, requisitos de experiencia y jerarquía de los puestos clave de la organización.",
    "ejemplo": "Ej: Gerente Técnico (Ing. Mecatrónico, 8+ años en minería), Técnico Hidráulico Senior (Certificación IFPS), Ejecutivo de Cuenta B2B.",
    "benchmark": "Modelo Atómico de 3 Áreas de Empresas Cuánticas (Finanzas, Operativo, Administrativo).",
    "cita": "Empresas Cuánticas (Fondo Thoth AC, Regla 13) & Anatomy of a Business Plan (Ch. 5)",
    "placeholder": "Perfiles de puesto, responsabilidades y competencias..."
  },
  "iframe_simulador": {
    "instruccion": "Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas.",
    "ejemplo": "Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio.",
    "benchmark": "Intervalo de confianza al 95%.",
    "cita": "The Nature of Value (Ch. 5)",
    "placeholder": "Parámetros del simulador y corridas..."
  },
  "ventaja_diferencial": {
    "instruccion": "Define la ventaja competitiva sostenible y diferenciador clave que hace que tu producto o servicio sea difícilmente imitable por los competidores.",
    "ejemplo": "Ej: \"Algoritmo de matching predictivo propietario con 40% menor latencia y convenios de exclusividad regional con proveedores clave.\"",
    "benchmark": "Barrera de entrada medible (patente, costo de cambio > 30%, o efecto de red).",
    "cita": "Michael Porter — Competitive Advantage (Ch. 1, p. 15)",
    "placeholder": "Describe el factor que protege tus márgenes y te diferencia radicalmente..."
  }
};

export const SOCIAL_BID_GUIDES = {
  "diagrama_visual": {
    "instruccion": "Código Mermaid.js para el Árbol de Problemas u Objetivos. Debe conectar causas o medios (abajo) con el problema/objetivo central (centro) y efectos o fines (arriba) usando flechas -->.",
    "ejemplo": "Ej: \"flowchart TD\n  CI[Causa Indirecta] --> CD[Causa Directa]\n  CD --> PC[Problema Central]\n  PC --> E1[Efecto 1]\n  PC --> E2[Efecto 2]\"",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (diagrama_visual)..."
  },
  "organigrama_visual": {
    "instruccion": "Código Mermaid.js que genera el organigrama de gobernanza jerárquicamente.",
    "ejemplo": "Ej: \"flowchart TD\n  CD[Comité Directivo] --> UE[Unidad Ejecutora]\n  UE --> C[Coordinador]\n  UE --> T[Técnicos]\"",
    "benchmark": "Estructura organizacional escalable representada en sintaxis Mermaid.js.",
    "cita": "Linda Pinson — Anatomy of a Business Plan (Ch. 6, p. 148)",
    "placeholder": "Código Mermaid (graph TD) con la jerarquía institucional de puestos..."
  },
  "beneficiarios": {
    "instruccion": "¿A quiénes ayuda exactamente este proyecto? (Población objetivo)",
    "ejemplo": "Ej: 500 jóvenes de 15 a 18 años en rezago educativo en la colonia X.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (beneficiarios)..."
  },
  "aliados": {
    "instruccion": "Instituciones, ONGs o líderes comunitarios que apoyarán el proyecto.",
    "ejemplo": "Ej: Fundación Y, Secretaría de Educación, Junta de Vecinos.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (aliados)..."
  },
  "oponentes": {
    "instruccion": "Actores que podrían oponerse al proyecto o verse afectados negativamente.",
    "ejemplo": "Ej: Sindicato de maestros locales (riesgo de rechazo por nuevos métodos).",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (oponentes)..."
  },
  "matriz_interes": {
    "instruccion": "Clasificación de actores por su nivel de poder e interés en el proyecto.",
    "ejemplo": "Ej: Gobierno local (Alto Poder, Bajo Interés) -> Estrategia: Mantener informado.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (matriz_interes)..."
  },
  "problema_central": {
    "instruccion": "El problema público o social que busca resolverse (en negativo).",
    "ejemplo": "Ej: Alto índice de deserción escolar en educación media superior en la zona sur.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (problema_central)..."
  },
  "causas_directas": {
    "instruccion": "Por qué ocurre el problema central de manera inmediata.",
    "ejemplo": "Ej: 1. Falta de recursos económicos. 2. Desinterés por el currículo tradicional.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (causas_directas)..."
  },
  "causas_indirectas": {
    "instruccion": "Causas subyacentes o de raíz que generan las causas directas.",
    "ejemplo": "Ej: Desempleo de los padres, falta de escuelas técnicas cercanas.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (causas_indirectas)..."
  },
  "efectos": {
    "instruccion": "Consecuencias de que el problema no se resuelva.",
    "ejemplo": "Ej: Aumento de la delincuencia juvenil, empleos precarizados a futuro.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (efectos)..."
  },
  "objetivo_central": {
    "instruccion": "El problema central convertido en estado positivo alcanzado.",
    "ejemplo": "Ej: Reducida la deserción escolar en educación media superior en la zona sur.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (objetivo_central)..."
  },
  "medios": {
    "instruccion": "Las soluciones (causas en positivo) para lograr el objetivo.",
    "ejemplo": "Ej: 1. Becas de transporte. 2. Talleres extracurriculares atractivos.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (medios)..."
  },
  "fines": {
    "instruccion": "Los impactos a largo plazo (efectos en positivo).",
    "ejemplo": "Ej: Disminución de la delincuencia, mayor inserción laboral formal.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (fines)..."
  },
  "estrategias_posibles": {
    "instruccion": "Opciones de solución derivadas del árbol de objetivos.",
    "ejemplo": "Ej: Estrategia A (Becas económicas) vs Estrategia B (Creación de talleres técnicos).",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (estrategias_posibles)..."
  },
  "criterios_seleccion": {
    "instruccion": "Criterios usados para elegir la mejor estrategia (costo, impacto, viabilidad).",
    "ejemplo": "Ej: Se eligió la Estrategia B por mayor sostenibilidad e impacto a largo plazo.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (criterios_seleccion)..."
  },
  "alternativa_elegida": {
    "instruccion": "La estrategia final que conformará el proyecto.",
    "ejemplo": "Ej: Creación de 3 talleres técnicos extracurriculares con equipo donado.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (alternativa_elegida)..."
  },
  "fin": {
    "instruccion": "Impacto a largo plazo al que el proyecto contribuye.",
    "ejemplo": "Ej: Contribuir a la reducción de la pobreza y marginación urbana en 5 años.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (fin)..."
  },
  "proposito": {
    "instruccion": "El objetivo específico que el proyecto logrará (el objetivo central).",
    "ejemplo": "Ej: Jóvenes de 15-18 años completan capacitación técnica y se insertan laboralmente.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (proposito)..."
  },
  "indicadores_fin": {
    "instruccion": "Cómo se medirá el impacto a largo plazo.",
    "ejemplo": "Ej: % de reducción de pobreza en la colonia en 5 años (Fuente: CONEVAL).",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (indicadores_fin)..."
  },
  "indicadores_proposito": {
    "instruccion": "Cómo se medirá el éxito inmediato del proyecto.",
    "ejemplo": "Ej: Al menos 300 jóvenes graduados en 12 meses, 40% con empleo a los 6 meses.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (indicadores_proposito)..."
  },
  "lista_componentes": {
    "instruccion": "Bienes, servicios o productos tangibles que entrega el proyecto.",
    "ejemplo": "Ej: 1. Centro de cómputo equipado. 2. Manuales de robótica impresos.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (lista_componentes)..."
  },
  "indicadores_componentes": {
    "instruccion": "Métricas de los productos entregados.",
    "ejemplo": "Ej: 20 computadoras instaladas operando. 500 manuales distribuidos.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (indicadores_componentes)..."
  },
  "supuestos": {
    "instruccion": "Riesgos externos que DEBEN cumplirse para el éxito (fuera de control).",
    "ejemplo": "Ej: El gobierno mantiene el subsidio de luz. Los jóvenes no migran por violencia.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (supuestos)..."
  },
  "descripcion_actividades": {
    "instruccion": "Las tareas necesarias para entregar los componentes.",
    "ejemplo": "Ej: Para el Componente 1: a) Cotizar equipos b) Comprar c) Instalar d) Probar.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (descripcion_actividades)..."
  },
  "cronograma_macro": {
    "instruccion": "Resumen de tiempos de las actividades principales.",
    "ejemplo": "Ej: Mes 1-2: Compras. Mes 3: Instalación. Mes 4-12: Talleres.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (cronograma_macro)..."
  },
  "medios_verificacion": {
    "instruccion": "Dónde se buscarán los datos para comprobar los indicadores.",
    "ejemplo": "Ej: Listas de asistencia, registros de calificaciones, recibos de compra.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (medios_verificacion)..."
  },
  "linea_base": {
    "instruccion": "El estado del indicador antes del proyecto.",
    "ejemplo": "Ej: Actualmente 0 jóvenes capacitados. Deserción actual: 25%.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (linea_base)..."
  },
  "frecuencia_medicion": {
    "instruccion": "Cada cuánto se evaluarán los indicadores.",
    "ejemplo": "Ej: Asistencia: Semanal. Inserción laboral: Trimestral posterior al egreso.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (frecuencia_medicion)..."
  },
  "comite_directivo": {
    "instruccion": "Quién toma las decisiones macro del proyecto.",
    "ejemplo": "Ej: Mesa conformada por el Director de la ONG, un donante y un líder vecinal.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (comite_directivo)..."
  },
  "unidad_ejecutora": {
    "instruccion": "El equipo que opera el proyecto día a día.",
    "ejemplo": "Ej: 1 Coordinador, 3 profesores técnicos, 1 trabajador social.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (unidad_ejecutora)..."
  },
  "paquetes_trabajo": {
    "instruccion": "Agrupación de actividades en bloques manejables (EDT).",
    "ejemplo": "Ej: Paquete 1: Infraestructura. Paquete 2: Currícula. Paquete 3: Difusión.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (paquetes_trabajo)..."
  },
  "hitos_principales": {
    "instruccion": "Momentos clave de éxito en el cronograma.",
    "ejemplo": "Ej: Hito 1: Aula terminada (Mes 3). Hito 2: Inicio de clases (Mes 4).",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (hitos_principales)..."
  },
  "riesgos_identificados": {
    "instruccion": "Posibles eventos que amenacen el proyecto (Sociales, Políticos, etc.).",
    "ejemplo": "Ej: Robo de equipo de cómputo en la escuela comunitaria.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (riesgos_identificados)..."
  },
  "plan_mitigacion": {
    "instruccion": "Qué se hará para prevenir o reaccionar a esos riesgos.",
    "ejemplo": "Ej: Instalar protecciones de herrería y crear comité de vigilancia vecinal.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (plan_mitigacion)..."
  },
  "matriz_probabilidad": {
    "instruccion": "Clasificación de riesgos (Impacto x Probabilidad).",
    "ejemplo": "Ej: Robo (Probabilidad Alta, Impacto Alto) -> Prioridad Crítica.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (matriz_probabilidad)..."
  },
  "audiencias": {
    "instruccion": "Grupos clave que deben recibir información del avance.",
    "ejemplo": "Ej: Donantes (BID), Padres de familia, Autoridades educativas.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (audiencias)..."
  },
  "canales": {
    "instruccion": "Medios a través de los cuales se enviará la información.",
    "ejemplo": "Ej: Reporte trimestral PDF para BID. Grupo de WhatsApp para padres.",
    "benchmark": "Estrategia omnicanal con margen de contribución directo > 50%.",
    "cita": "Alexander Osterwalder — Business Model Generation (p. 30)",
    "placeholder": "Puntos de contacto para comunicación, distribución y postventa..."
  },
  "mensajes_clave": {
    "instruccion": "Lo que se quiere comunicar a cada audiencia.",
    "ejemplo": "Ej: A los padres: \"Su hijo está adquiriendo habilidades para el futuro\".",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (mensajes_clave)..."
  },
  "costos_directos": {
    "instruccion": "Dinero gastado directamente en la intervención social.",
    "ejemplo": "Ej: Pago a instructores ($150k), Computadoras ($200k), Materiales ($50k).",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (costos_directos)..."
  },
  "costos_indirectos": {
    "instruccion": "Gastos de administración y logística (overhead).",
    "ejemplo": "Ej: Sueldo del director ($50k), Papelería de oficina ($10k), Contador ($15k).",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (costos_indirectos)..."
  },
  "fuentes_financiamiento": {
    "instruccion": "Quién aporta el dinero (donantes, contrapartida local, etc.).",
    "ejemplo": "Ej: BID aporta 70% ($350k). Contrapartida local en especie (local prestado) 30%.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (fuentes_financiamiento)..."
  },
  "beneficios_sociales": {
    "instruccion": "Valorización monetaria del impacto (Ej. incremento de sueldo futuro).",
    "ejemplo": "Ej: Los graduados ganarán $30,000 extra al año. En 500 jóvenes = $15M anuales.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (beneficios_sociales)..."
  },
  "tir_social": {
    "instruccion": "Tasa Interna de Retorno pero midiendo beneficios a la sociedad, no ganancias.",
    "ejemplo": "Ej: TIR Social estimada: 25% (muy superior a la tasa de descuento social del 10%).",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (tir_social)..."
  },
  "vpn_social": {
    "instruccion": "Valor Presente Neto de los beneficios sociales menos el costo del proyecto.",
    "ejemplo": "Ej: Valor Presente Neto Social: +$4.5 Millones a 5 años.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (vpn_social)..."
  },
  "sostenibilidad_institucional": {
    "instruccion": "Cómo se hará cargo de administrar el proyecto a futuro.",
    "ejemplo": "Ej: La asociación de padres asumirá el control directivo en el Año 3.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (sostenibilidad_institucional)..."
  },
  "sostenibilidad_financiera": {
    "instruccion": "Estrategia de ingresos propios, cuotas de recuperación o patrocinios para operar sin depender de fondos iniciales.",
    "ejemplo": "Ej: 40% ingresos por cuotas simbólicas de talleres vespertinos, 60% donaciones recurrentes.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (sostenibilidad_financiera)..."
  },
  "apropiacion_comunitaria": {
    "instruccion": "Cómo asegurar que la comunidad defienda y mantenga el proyecto.",
    "ejemplo": "Ej: Involucrar a los jóvenes en pintar y decorar el aula para generar sentido de pertenencia.",
    "benchmark": "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
    "cita": "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
    "placeholder": "Define el componente del proyecto social (apropiacion_comunitaria)..."
  }
};

export const AGILE_STARTUP_GUIDES = {
  "problema": {
    "instruccion": "Identifica los 3 principales problemas que resolverás para tu cliente.",
    "ejemplo": "Ej: 1. Falta de tiempo para cocinar sano. 2. Precios elevados de restaurantes saludables. 3. Poca variedad de comida a domicilio.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (problema)..."
  },
  "segmentos_clientes": {
    "instruccion": "Define quiénes son tus adoptantes tempranos (Early Adopters) y tu mercado meta.",
    "ejemplo": "Ej: Profesionistas de 25-40 años que trabajan en oficinas corporativas y no tienen tiempo de cocinar.",
    "benchmark": "Segmentación psicográfica y demográfica con tamaño de mercado validado.",
    "cita": "Alexander Osterwalder — Business Model Generation (p. 20)",
    "placeholder": "Grupos homogéneos de clientes a los que se dirige la oferta..."
  },
  "propuesta_valor": {
    "instruccion": "Explica tu propuesta única de valor. ¿Por qué eres diferente y vale la pena prestarte atención?",
    "ejemplo": "Ej (Estilo Uber/Airbnb): Comida saludable gourmet preparada por chefs locales y entregada en menos de 20 minutos por suscripción.",
    "benchmark": "1 propuesta única validada mediante Jobs-to-be-Done de Christensen.",
    "cita": "Clayton Christensen — The Innovator's Dilemma (p. 28)",
    "placeholder": "Explica qué problema resuelves, para quién y qué te hace único..."
  },
  "solucion": {
    "instruccion": "Describe las 3 características principales de tu solución o MVP.",
    "ejemplo": "Ej: 1. App móvil de pedidos express. 2. Menú rotativo de 5 platos diarios. 3. Red de micro-cocinas locales distribuidas.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (solucion)..."
  },
  "canales": {
    "instruccion": "¿Cómo vas a dar a conocer y entregar tu solución a tus clientes?",
    "ejemplo": "Ej: Campañas de marketing local en Instagram, códigos de referido de oficina y entrega vía repartidores propios.",
    "benchmark": "Estrategia omnicanal con margen de contribución directo > 50%.",
    "cita": "Alexander Osterwalder — Business Model Generation (p. 30)",
    "placeholder": "Puntos de contacto para comunicación, distribución y postventa..."
  },
  "flujos_ingresos": {
    "instruccion": "¿Cómo ganarás dinero? Suscripción, venta directa, comisiones, publicidad.",
    "ejemplo": "Ej (Estilo Netflix/Spotify): Planes semanales de suscripción ($1,200 MXN/semana) y catering corporativo para eventos de oficina.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (flujos_ingresos)..."
  },
  "estructura_costos": {
    "instruccion": "¿Cuáles son tus costos fijos y variables más significativos para arrancar?",
    "ejemplo": "Ej: Costo de ingredientes (materia prima), comisión del procesador de pagos, y marketing digital de adquisición.",
    "benchmark": "Alineación de costos con la propuesta de valor (estructura impulsada por valor o costo).",
    "cita": "Alexander Osterwalder — Business Model Generation (p. 40)",
    "placeholder": "Desglose de costos fijos y variables más pesados de la operación..."
  },
  "metricas_clave": {
    "instruccion": "Métricas críticas que demuestran la salud y crecimiento de tu negocio.",
    "ejemplo": "Ej: Costo de Adquisición de Cliente (CAC), Tasa de Retención Semanal, y Valor de Vida del Cliente (LTV).",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (metricas_clave)..."
  },
  "ventaja_especial": {
    "instruccion": "¿Qué tienes que no pueda ser copiado o comprado fácilmente?",
    "ejemplo": "Ej (Estilo Amazon Logistics): Algoritmo propio de ruteo y distribución que reduce tiempos de entrega a la mitad frente a UberEats.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (ventaja_especial)..."
  },
  "avatar_cliente": {
    "instruccion": "Detalla el perfil del Buyer Persona: edad, ocupación, metas e intereses.",
    "ejemplo": "Ej: Sandra, 32 años, gerente de marketing, soltera, apasionada del fitness pero trabaja 10 horas diarias.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (avatar_cliente)..."
  },
  "que_piensa": {
    "instruccion": "¿Qué pasa por la mente del cliente ideal? Sus deseos, preocupaciones y aspiraciones financieras/personales.",
    "ejemplo": "Ej: Piensa que debería comer mejor para cuidar su salud, pero le aburre preparar comida y le da pereza lavar platos.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (que_piensa)..."
  },
  "que_ve": {
    "instruccion": "¿Qué observa en su entorno diario? Ofertas de la competencia, comportamiento de amigos, etc.",
    "ejemplo": "Ej: Ve que sus compañeros de oficina piden pizzas o comida rápida grasosa por falta de opciones saludables cerca.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (que_ve)..."
  },
  "que_oye": {
    "instruccion": "¿Qué le dicen sus amigos, familia o influenciadores que afecta su decisión?",
    "ejemplo": "Ej: Oye constantemente en podcasts de bienestar la importancia de la nutrición, y de sus amigas que preparar ensaladas toma mucho tiempo.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (que_oye)..."
  },
  "que_dice_hace": {
    "instruccion": "¿Cómo se comporta y qué expresa en público el cliente?",
    "ejemplo": "Ej: Dice que quiere empezar la dieta el lunes, pero termina pidiendo comida rápida el miércoles debido a juntas de última hora.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (que_dice_hace)..."
  },
  "dolores": {
    "instruccion": "Frustraciones, obstáculos y miedos del cliente.",
    "ejemplo": "Ej: Miedo a ganar peso, frustración de gastar demasiado en apps de delivery tradicionales con comida fría.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (dolores)..."
  },
  "necesidades": {
    "instruccion": "Lo que realmente desea conseguir o lograr el cliente.",
    "ejemplo": "Ej: Conveniencia extrema: comida rica, saludable, que llegue caliente y a un precio predecible.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (necesidades)..."
  },
  "especificacion_mvp": {
    "instruccion": "Define de forma concreta qué funcionalidades o entregables incluirá la primera versión (MVP).",
    "ejemplo": "Ej: Una Landing Page sencilla en Webflow con botón de pago de Stripe para pre-vender el plan semanal, sin App móvil aún.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (especificacion_mvp)..."
  },
  "recursos_construccion": {
    "instruccion": "Lista de herramientas no-code, software y recursos mínimos requeridos.",
    "ejemplo": "Ej: Webflow para diseño, Stripe para pagos, Google Sheets para base de datos y un chef de cocina local contratado.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (recursos_construccion)..."
  },
  "tiempo_estimado_desarrollo": {
    "instruccion": "Duración estimada para el lanzamiento del piloto al mercado.",
    "ejemplo": "Ej: 3 semanas para diseño de Landing Page, pruebas de menú y lanzamiento de pauta en redes.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (tiempo_estimado_desarrollo)..."
  },
  "hipotesis_valor": {
    "instruccion": "La suposición crítica de por qué los clientes valorarán y usarán tu producto.",
    "ejemplo": "Ej: Los profesionistas están dispuestos a pagar una suscripción de $1,200/semana por no tener que planificar su comida.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (hipotesis_valor)..."
  },
  "hipotesis_crecimiento": {
    "instruccion": "La suposición crítica de cómo adquirirás clientes recurrentes a bajo costo.",
    "ejemplo": "Ej: Cada cliente activo recomendará el servicio a al menos 1 colega de su misma oficina en el primer mes.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (hipotesis_crecimiento)..."
  },
  "metrica_exito": {
    "instruccion": "Números específicos que validarán las hipótesis del experimento.",
    "ejemplo": "Ej: Conseguir 20 suscriptores de pago en las primeras 2 semanas de la preventa.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (metrica_exito)..."
  },
  "canal_validacion": {
    "instruccion": "Dónde o cómo pondrás a prueba el experimento de tracción.",
    "ejemplo": "Ej: Publicaciones orgánicas en grupos locales de LinkedIn y distribución de flyers físicos en 3 torres corporativas.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (canal_validacion)..."
  },
  "datos_traccion": {
    "instruccion": "Resumen de métricas reales de clientes, ventas o registros obtenidos.",
    "ejemplo": "Ej: 24 clientes pagaron la suscripción en la preventa, logrando $28,800 MXN en ventas brutas en 14 días.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (datos_traccion)..."
  },
  "comentarios_early_adopters": {
    "instruccion": "Retroalimentación directa de los primeros usuarios de tu MVP.",
    "ejemplo": "Ej: \"La comida es deliciosa y el empaque térmico es excelente, pero me gustaría poder elegir opciones sin gluten\".",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (comentarios_early_adopters)..."
  },
  "aprendizajes_clave": {
    "instruccion": "Conclusiones principales que obtuviste del piloto práctico.",
    "ejemplo": "Ej: Validamos que hay intención de pago inmediata. Sin embargo, la logística de reparto requiere optimizar zonas.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (aprendizajes_clave)..."
  },
  "decision_estrategica": {
    "instruccion": "Determina si continuarás con el plan actual (perseverar) o si realizarás un cambio de rumbo (pivotar).",
    "ejemplo": "Ej: Perseverar con el modelo de suscripción, pero pivotando el canal de distribución a un esquema de entrega concentrada por corporativo.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (decision_estrategica)..."
  },
  "justificacion_datos": {
    "instruccion": "Justifica la decisión estratégica usando métricas reales del piloto.",
    "ejemplo": "Ej: El 85% de las quejas fueron por retrasos de reparto. Agrupar entregas por edificio reduce el costo logístico en 40%.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (justificacion_datos)..."
  },
  "siguientes_pasos": {
    "instruccion": "Plan de acción inmediato tras tomar la decisión estratégica.",
    "ejemplo": "Ej: 1. Integrar pasarela de pago recurrente. 2. Cerrar convenio de entrega con 2 corporativos. 3. Diseñar menú sin gluten.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (siguientes_pasos)..."
  },
  "cac_adquisicion": {
    "instruccion": "Costo de Adquisición de Cliente. ¿Cuánto dinero gastas en promedio para obtener un cliente de pago?",
    "ejemplo": "Ej: Gastamos $3,000 en anuncios y obtuvimos 15 clientes de pago = CAC de $200 MXN.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (cac_adquisicion)..."
  },
  "ltv_vida_cliente": {
    "instruccion": "Valor del tiempo de vida del cliente. Ingresos estimados que un cliente generará antes de darse de baja.",
    "ejemplo": "Ej: Suscripción promedio dura 8 semanas a $1,200 MXN/semana = LTV de $9,600 MXN por cliente.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (ltv_vida_cliente)..."
  },
  "margen_contribucion_unitario": {
    "instruccion": "Ingreso unitario menos el costo variable unitario de entrega.",
    "ejemplo": "Ej: Precio del menú $200 - Ingredientes $70 - Entrega $40 = Margen de Contribución de $90 MXN (45%).",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (margen_contribucion_unitario)..."
  },
  "retorno_inversion_marketing": {
    "instruccion": "Mide la eficiencia del gasto de marketing (LTV / CAC). Lo ideal es una relación mayor a 3.",
    "ejemplo": "Ej: LTV ($9,600) / CAC ($200) = Relación de 48x (Altamente rentable).",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (retorno_inversion_marketing)..."
  },
  "burn_rate_mensual": {
    "instruccion": "Flujo de caja negativo neto promedio mensual (dinero consumido al mes).",
    "placeholder": "Ej: $45,000 MXN mensuales en salarios, servidores y marketing.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "ejemplo": "Ej: Aplicación práctica y cuantificada para el campo burn_rate_mensual."
  },
  "runway_meses": {
    "instruccion": "Meses de supervivencia con el capital disponible actual. Caja actual / Burn Rate.",
    "ejemplo": "Ej: Caja disponible $270,000 / Burn Rate $45,000 = 6 meses de Runway restante.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (runway_meses)..."
  },
  "capital_supervivencia": {
    "instruccion": "Monto de dinero mínimo en caja que se mantendrá como reserva estratégica.",
    "ejemplo": "Ej: Mantener un fondo de reserva de $90,000 MXN equivalente a 2 meses de operación.",
    "benchmark": "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
    "cita": "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
    "placeholder": "Documenta la hipótesis o métrica ágil para (capital_supervivencia)..."
  },
  "iframe_simulador": {
    "instruccion": "Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas.",
    "ejemplo": "Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio.",
    "benchmark": "Intervalo de confianza al 95%.",
    "cita": "The Nature of Value (Ch. 5)",
    "placeholder": "Parámetros del simulador y corridas..."
  }
};

export const TECHNOLOGY_ID_GUIDES = {
  "descripcion_tecnologia": {
    "instruccion": "Explica detalladamente en qué consiste la innovación tecnológica y sus componentes.",
    "ejemplo": "Ej (Estilo Nvidia/OpenAI): Algoritmo de visión artificial basado en redes neuronales convolucionales para control de calidad en tiempo real.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (descripcion_tecnologia)..."
  },
  "novedad_cientifica": {
    "instruccion": "¿Qué descubrimientos científicos, fórmulas o patentes previas sustentan tu desarrollo?",
    "ejemplo": "Ej: Patrón de optimización matemática patentado que reduce el procesamiento de imágenes en un 35%.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (novedad_cientifica)..."
  },
  "nivel_trl": {
    "instruccion": "Nivel de Maduración Tecnológica (TRL 1 al 9). Clasifica el estado actual de tu desarrollo.",
    "ejemplo": "Ej: TRL 4: Validación de componentes tecnológicos en entorno de laboratorio.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (nivel_trl)..."
  },
  "ventaja_tecnologica": {
    "instruccion": "¿Por qué tu tecnología es sustancialmente mejor que las soluciones comerciales existentes?",
    "ejemplo": "Ej (Estilo Apple Silicon): Opera sin requerir conexión a internet y requiere 70% menos poder de cómputo que el competidor líder.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (ventaja_tecnologica)..."
  },
  "estado_del_arte": {
    "instruccion": "Búsqueda sistemática de patentes y literatura científica para asegurar que no hay infracciones.",
    "ejemplo": "Ej: Búsqueda en USPTO y EPO localizando 3 patentes similares, diferenciándonos por la arquitectura de red ligera.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (estado_del_arte)..."
  },
  "estrategia_patentes": {
    "instruccion": "Plan legal para la solicitud de patentes, modelos de utilidad o protección de secretos industriales.",
    "ejemplo": "Ej: Registro de marca nacional en IMPI y solicitud de patente internacional vía tratado PCT en Q3.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (estrategia_patentes)..."
  },
  "clasificacion_patentes_ipc": {
    "instruccion": "Códigos de la Clasificación Internacional de Patentes (IPC) aplicables a tu desarrollo.",
    "ejemplo": "Ej: G06T 7/00 (Análisis de datos de imagen) y G06N 3/02 (Redes neuronales).",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (clasificacion_patentes_ipc)..."
  },
  "secretos_industriales": {
    "instruccion": "Medidas de seguridad y acuerdos legales (NDA) para proteger el conocimiento no patentable.",
    "ejemplo": "Ej: Código fuente fragmentado en servidores seguros y contratos laborales con cláusulas estrictas de confidencialidad.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (secretos_industriales)..."
  },
  "escalamiento_produccion": {
    "instruccion": "Cómo se escalará la producción tecnológica desde el laboratorio a la producción en masa.",
    "ejemplo": "Ej: Migración de servidores de prueba locales a una arquitectura balanceada en la nube (AWS autoscaling).",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (escalamiento_produccion)..."
  },
  "infraestructura_cientifica": {
    "instruccion": "Equipos de laboratorio, licencias de software de simulación y herramientas especializadas necesarias.",
    "ejemplo": "Ej: Servidores dedicados GPU NVIDIA A100 y licencias de simulación MATLAB/Simulink.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (infraestructura_cientifica)..."
  },
  "normativas_tecnicas_calidad": {
    "instruccion": "Estándares internacionales obligatorios de la industria (ISO, NOM, etc.).",
    "ejemplo": "Ej: Cumplimiento de la norma ISO/IEC 27001 de seguridad de información y NOM-024-SCFI de hardware.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (normativas_tecnicas_calidad)..."
  },
  "especificaciones_prototipo": {
    "instruccion": "Detalla las características funcionales y físicas de tu prototipo actual.",
    "ejemplo": "Ej: Prototipo beta funcional en contenedor Docker con interfaz web React de diagnóstico básico.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (especificaciones_prototipo)..."
  },
  "bitacora_pruebas": {
    "instruccion": "Registros de las pruebas técnicas realizadas, errores detectados y correcciones aplicadas.",
    "ejemplo": "Ej: Pruebas de estrés de 1,000 peticiones concurrentes: latencia media 120ms, 0.01% de tasa de error.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (bitacora_pruebas)..."
  },
  "certificaciones_necesarias": {
    "instruccion": "Sellos de calidad, validaciones de laboratorios de terceros o permisos sanitarios indispensables.",
    "ejemplo": "Ej: Certificación de seguridad eléctrica por la UL (Underwriters Laboratories) para distribución en EE.UU.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (certificaciones_necesarias)..."
  },
  "clientes_industriales": {
    "instruccion": "Perfil del comprador B2B, integrador tecnológico o dependencias de gobierno que adquirirán la tecnología.",
    "ejemplo": "Ej (Estilo TSMC/Intel B2B): Plantas ensambladoras automotrices Tier 1 que buscan automatizar sus líneas de ensamble.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (clientes_industriales)..."
  },
  "tamaño_mercado_tecnologico": {
    "instruccion": "TAM, SAM, SOM enfocados en licenciamiento o ventas corporativas.",
    "ejemplo": "Ej: SAM: 420 plantas maquiladoras en el norte de México con un valor estimado de mercado de $15M USD anuales.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (tamaño_mercado_tecnologico)..."
  },
  "alianzas_codesarrollo": {
    "instruccion": "Alianzas con centros de investigación, universidades o corporaciones para co-desarrollar o validar la tecnología.",
    "ejemplo": "Ej (Estilo MIT Media Lab): Convenio de co-desarrollo con el Instituto de Inteligencia Artificial de la Universidad de Sonora.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (alianzas_codesarrollo)..."
  },
  "esquema_royalties": {
    "instruccion": "Estructura de cobro de regalías: porcentaje sobre ventas, licenciamiento anual o pago por uso.",
    "ejemplo": "Ej (Estilo ARM): Licencia anual de software SaaS de $5,000 USD por línea de producción instalada + 1% de regalías por eficiencia.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (esquema_royalties)..."
  },
  "constitucion_spinoff": {
    "instruccion": "Estrategia para crear una empresa independiente (spin-off) de base tecnológica desde la universidad o empresa madre.",
    "ejemplo": "Ej (Estilo Stanford Spin-offs): Transferencia del derecho de explotación de la patente universitaria a la Spin-Off a cambio de 10% de participación accionaria.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (constitucion_spinoff)..."
  },
  "estrategia_comercializacion_id": {
    "instruccion": "Modelo comercial de comercialización: venta directa, licenciamiento de patentes o consultoría tecnológica especializada.",
    "ejemplo": "Ej: Licenciamiento de la patente a distribuidores autorizados en Sudamérica y venta directa en México.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (estrategia_comercializacion_id)..."
  },
  "impacto_socioambiental": {
    "instruccion": "Efectos directos e indirectos del uso de tu tecnología en la sociedad y el ecosistema.",
    "ejemplo": "Ej: Reducción de 20% en merma de producción disminuye la generación de residuos metálicos en 8 toneladas anuales.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (impacto_socioambiental)..."
  },
  "generacion_empleo_calificado": {
    "instruccion": "Proyecciones de contratación de ingenieros, científicos, doctores o técnicos especializados.",
    "ejemplo": "Ej: Contratación de 4 desarrolladores de IA senior y 2 ingenieros de automatización con salarios competitivos en la región.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (generacion_empleo_calificado)..."
  },
  "politica_rse": {
    "instruccion": "Principios éticos de la empresa de tecnología (ej. ética de inteligencia artificial, equidad de género en STEM).",
    "ejemplo": "Ej: Política estricta de no sesgo algorítmico y 40% de puestos técnicos ocupados por mujeres ingenieras.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (politica_rse)..."
  },
  "analisis_ciclo_vida": {
    "instruccion": "Evaluación del impacto del producto tecnológico desde la obtención de materia prima hasta su desecho final.",
    "ejemplo": "Ej: Diseño modular de hardware que facilita la sustitución de piezas individuales y reciclaje de baterías de litio.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (analisis_ciclo_vida)..."
  },
  "estrategia_economia_circular": {
    "instruccion": "Cómo reintegras materiales, reciclas dispositivos obsoletos o reduces el desperdicio electrónico.",
    "ejemplo": "Ej: Programa de recolección de sensores viejos a cambio de descuentos en la renovación del plan anual.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (estrategia_economia_circular)..."
  },
  "sustentabilidad_energetica": {
    "instruccion": "Consumo de energía de tus servidores, oficinas y procesos de manufactura, y el uso de fuentes renovables.",
    "ejemplo": "Ej: 100% de la infraestructura en la nube está alojada en centros de datos con certificación de neutralidad de carbono.",
    "benchmark": "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
    "cita": "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
    "placeholder": "Especificaciones técnicas e innovación para (sustentabilidad_energetica)..."
  },
  "iframe_simulador": {
    "instruccion": "Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas.",
    "ejemplo": "Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio.",
    "benchmark": "Intervalo de confianza al 95%.",
    "cita": "The Nature of Value (Ch. 5)",
    "placeholder": "Parámetros del simulador y corridas..."
  }
};

export const MICRO_BUSINESS_GUIDES = {
  "idea_negocio": {
    "instruccion": "¿Qué vas a vender o qué servicio vas a dar? Explícalo de forma sencilla.",
    "ejemplo": "Ej: \"Voy a poner un puesto de tacos de carne asada por las noches frente al parque.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (idea_negocio)..."
  },
  "objetivo_basico": {
    "instruccion": "¿Cuánto quieres vender o lograr en los primeros meses?",
    "ejemplo": "Ej: \"Quiero vender al menos 50 órdenes diarias para sacar los gastos y mi sueldo.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (objetivo_basico)..."
  },
  "nombre": {
    "instruccion": "Nombre de tu negocio.",
    "ejemplo": "Ej: \"Tacos El Compadre\"",
    "benchmark": "Prueba de recordación fonética > 70% y dominio web/marca disponible.",
    "cita": "Creating a Business Plan For Dummies (Ch. 3, p. 42)",
    "placeholder": "Nombre comercial, etimología y mensaje que transmite..."
  },
  "quienes_somos": {
    "instruccion": "¿Quiénes van a trabajar en el negocio y qué experiencia tienen?",
    "ejemplo": "Ej: \"Mi esposa y yo. Yo trabajé 5 años en una taquería y ella sabe llevar las cuentas.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (quienes_somos)..."
  },
  "que_ofrecemos": {
    "instruccion": "Tu producto estrella o servicio principal.",
    "ejemplo": "Ej: \"Tacos, lorenzas y caramelos con tortillas hechas a mano y carne de calidad.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (que_ofrecemos)..."
  },
  "perfil_cliente": {
    "instruccion": "¿Quiénes te van a comprar? Vecinos, trabajadores, estudiantes.",
    "ejemplo": "Ej: \"Vecinos de la colonia y personas que regresan del trabajo después de las 7 PM.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (perfil_cliente)..."
  },
  "ubicacion_clientes": {
    "instruccion": "¿De dónde vienen tus clientes?",
    "ejemplo": "Ej: \"Principalmente de la colonia Modelo y colonias aledañas (radio de 2 km).\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (ubicacion_clientes)..."
  },
  "competidores_locales": {
    "instruccion": "¿Quién más vende lo mismo cerca de ti?",
    "ejemplo": "Ej: \"Hay un puesto de hot dogs a la vuelta y una pizzería a dos cuadras.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (competidores_locales)..."
  },
  "nuestra_ventaja": {
    "instruccion": "¿Por qué te van a comprar a ti en vez de a ellos?",
    "ejemplo": "Ej: \"Mis salsas son caseras, uso tortilla recién hecha y atiendo muy rápido.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (nuestra_ventaja)..."
  },
  "lista_precios": {
    "instruccion": "Precio de tus productos principales.",
    "ejemplo": "Ej: \"Taco: $35. Caramelo: $70. Refresco: $25.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (lista_precios)..."
  },
  "como_promocionamos": {
    "instruccion": "¿Cómo vas a conseguir clientes?",
    "ejemplo": "Ej: \"Pondré una lona luminosa grande, repartiré volantes en la colonia y abriré una página de Facebook.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (como_promocionamos)..."
  },
  "paso_a_paso_diario": {
    "instruccion": "¿Cómo es un día normal de trabajo desde que compras hasta que cierras?",
    "ejemplo": "Ej: \"1. A las 9 AM compro la carne y verduras. 2. A las 2 PM pico y marino la carne. 3. A las 5 PM pongo el carbón y arreglo las mesas. 4. De 6 PM a 12 AM atiendo clientes. 5. Limpieza.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (paso_a_paso_diario)..."
  },
  "herramientas_necesarias": {
    "instruccion": "Lista de equipo pesado o herramientas clave.",
    "ejemplo": "Ej: \"Asador grande, carreta de acero, hielera, mesas, sillas y una lona.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (herramientas_necesarias)..."
  },
  "materiales_basicos": {
    "instruccion": "Lo que compras seguido para poder vender.",
    "ejemplo": "Ej: \"Carne, tortillas, verduras, carbón, servilletas y refrescos.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (materiales_basicos)..."
  },
  "descripcion_espacio": {
    "instruccion": "¿Dónde te vas a ubicar y cuánto mide el lugar?",
    "ejemplo": "Ej: \"En la banqueta de mi casa, ocupando un espacio de 3x4 metros.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (descripcion_espacio)..."
  },
  "distribucion_areas": {
    "instruccion": "¿Cómo acomodarás las cosas?",
    "ejemplo": "Ej: \"La carreta de frente a la calle, la hielera a un lado del cajero y 4 mesas acomodadas en escuadra.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (distribucion_areas)..."
  },
  "total_inversion": {
    "instruccion": "¿Cuánto dinero ocupas para arrancar el primer día?",
    "ejemplo": "Ej: \"Ocupo $15,000 para comprar la carreta usada, $3,000 de permisos y $2,000 de mandado.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (total_inversion)..."
  },
  "de_donde_sale": {
    "instruccion": "¿Quién pondrá el dinero o de dónde se pedirá?",
    "ejemplo": "Ej: \"Tengo ahorrados $10,000 y pediré $10,000 de préstamo familiar.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (de_donde_sale)..."
  },
  "lista_gastos_mensuales": {
    "instruccion": "Pagos fijos mes a mes (renta, luz, ayudante).",
    "ejemplo": "Ej: \"Pago de luz $500, permiso de piso $1,000, sueldo del ayudante $4,000 al mes.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (lista_gastos_mensuales)..."
  },
  "costos_por_producto": {
    "instruccion": "¿Cuánto te cuesta hacer un producto y en cuánto lo vendes?",
    "ejemplo": "Ej: \"Hacer un taco me cuesta $15 (carne+tortilla+salsa) y lo vendo a $35. Ganancia: $20.\"",
    "benchmark": "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
    "cita": "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
    "placeholder": "Información básica para arrancar el autoempleo en (costos_por_producto)..."
  }
};

export const INVESTMENT_PROJECT_GUIDES = {
  "demanda_historica": {
    "instruccion": "Análisis histórico de la demanda con datos duros y series de tiempo.",
    "ejemplo": "Ej: \"La demanda de energía en la región noroeste creció 4.5% anual de 2018 a 2024 (Fuente: CENACE).\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (demanda_historica)..."
  },
  "elasticidad": {
    "instruccion": "Cálculo de la elasticidad precio-demanda o sensibilidad del consumo ante variables macroeconómicas.",
    "ejemplo": "Ej: \"Elasticidad precio de -0.8; la demanda es relativamente inelástica ante incrementos tarifarios.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (elasticidad)..."
  },
  "proyeccion_oferta": {
    "instruccion": "Modelo econométrico de cómo se comportará la oferta y demanda en los próximos 10-20 años.",
    "ejemplo": "Ej: \"Se proyecta un déficit de 1,200 MW para 2030 debido al retiro de plantas de carbón.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (proyeccion_oferta)..."
  },
  "ingenieria_basica": {
    "instruccion": "Descripción técnica de nivel macro (planos conceptuales, tecnología seleccionada).",
    "ejemplo": "Ej: \"Planta fotovoltaica de 50 MW con paneles bifaciales monocristalinos y seguidores de un eje.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (ingenieria_basica)..."
  },
  "layout_industrial": {
    "instruccion": "Distribución física (Lay-out), requerimientos de terreno y obras de preparación.",
    "ejemplo": "Ej: \"Terreno de 100 hectáreas con compactación tipo B. Subestación elevadora en el cuadrante noreste.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (layout_industrial)..."
  },
  "memoria_calculo": {
    "instruccion": "Resumen de las memorias de cálculo de ingeniería civil, estructural y electromecánica.",
    "ejemplo": "Ej: \"Cálculo estructural para resistir ráfagas de viento de 150 km/h según normativa CFE 2024.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (memoria_calculo)..."
  },
  "catalogo_conceptos": {
    "instruccion": "Listado exhaustivo de todas las partidas de obra y equipamiento.",
    "ejemplo": "Ej: \"Partida 1: Terracerías. Partida 2: Cimentación. Partida 3: Montaje electromecánico.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (catalogo_conceptos)..."
  },
  "explosion_insumos": {
    "instruccion": "Resumen cuantitativo de los insumos físicos más relevantes a adquirir.",
    "ejemplo": "Ej: \"120,000 paneles solares de 600W, 400 toneladas de acero estructural, 25 inversores centrales.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (explosion_insumos)..."
  },
  "cronograma_fisico_financiero": {
    "instruccion": "Calendario de ejecución de obra cruzado con los desembolsos de capital requeridos.",
    "ejemplo": "Ej: \"Mes 1-3: Ingeniería 10% del CAPEX. Mes 4-8: Procura 60%. Mes 9-12: Construcción 30%.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (cronograma_fisico_financiero)..."
  },
  "wacc": {
    "instruccion": "Cálculo del Costo Promedio Ponderado de Capital (WACC / CPPC).",
    "ejemplo": "Ej (Estilo BlackRock): \"WACC del 11.5% asumiendo 40% Equity (costo 15%) y 60% Deuda (costo 9.1%).\"",
    "benchmark": "Costo Promedio Ponderado de Capital (WACC) estimado entre 10% y 16% anual en México.",
    "cita": "The Nature of Value (Ch. 5, p. 105)",
    "placeholder": "Tasa de descuento ponderando el costo de la deuda (Kd) y el costo del capital (Ke)..."
  },
  "apalancamiento": {
    "instruccion": "Estructura de la deuda: bancos involucrados, plazos, tasas y garantías.",
    "ejemplo": "Ej (Estilo JP Morgan): \"Crédito Sindicado a 15 años. Tasa SOFR + 3.5%. Garantía prendaria sobre los equipos.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (apalancamiento)..."
  },
  "servicio_deuda": {
    "instruccion": "Tabla de amortización proyectada, pagos de capital e intereses (DSCR).",
    "ejemplo": "Ej: \"DSCR mínimo esperado de 1.45x durante los primeros 5 años de operación.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (servicio_deuda)..."
  },
  "sensibilidad_unidimensional": {
    "instruccion": "Tornado de sensibilidad: cómo cambia la TIR si se altera una sola variable crítica (ej. CAPEX o Precio).",
    "ejemplo": "Ej: \"Si el costo del acero sube 20%, la TIR del proyecto baja de 14.5% a 12.1%.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (sensibilidad_unidimensional)..."
  },
  "escenarios": {
    "instruccion": "Análisis de escenarios consolidados: Caso Base, Caso Pesimista y Caso Optimista.",
    "ejemplo": "Ej: \"Caso Pesimista (Retraso de obra de 6 meses + inflación 8%): El proyecto mantiene VAN positivo.\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (escenarios)..."
  },
  "simulacion_montecarlo": {
    "instruccion": "Resultados de simulación probabilística (iteraciones) sobre la viabilidad del proyecto.",
    "ejemplo": "Ej (Estilo Goldman Sachs): \"Tras 10,000 iteraciones, existe un 92% de probabilidad de que la TIR supere el WACC (11.5%).\"",
    "benchmark": "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
    "cita": "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
    "placeholder": "Memoria de cálculo y parámetros cuantitativos para (simulacion_montecarlo)..."
  },
  "iframe_simulador": {
    "instruccion": "Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas.",
    "ejemplo": "Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio.",
    "benchmark": "Intervalo de confianza al 95%.",
    "cita": "The Nature of Value (Ch. 5)",
    "placeholder": "Parámetros del simulador y corridas..."
  }
};

export const ZOPP_GUIDES = {
  "matriz_participacion": {
    "instruccion": "Análisis de involucrados, sus intereses y problemas percibidos.",
    "ejemplo": "Ej: Comunidad local (Alta influencia, Alto impacto).",
    "benchmark": "Matriz de Planificación de Proyectos (MPP 4x4) con lógica vertical y horizontal validada.",
    "cita": "Metodología ZOPP (GTZ Alemania) & Planificación por Objetivos",
    "placeholder": "Estructuración analítica ZOPP para (matriz_participacion)..."
  },
  "analisis_problemas": {
    "instruccion": "Árbol de problemas enfocándose en la causa raíz moderada.",
    "ejemplo": "Ej: Alta incidencia de enfermedades gastrointestinales.",
    "benchmark": "Matriz de Planificación de Proyectos (MPP 4x4) con lógica vertical y horizontal validada.",
    "cita": "Metodología ZOPP (GTZ Alemania) & Planificación por Objetivos",
    "placeholder": "Estructuración analítica ZOPP para (analisis_problemas)..."
  },
  "analisis_objetivos": {
    "instruccion": "Conversión de problemas a estados positivos alcanzables.",
    "ejemplo": "Ej: Reducción del 50% en enfermedades gastrointestinales.",
    "benchmark": "Matriz de Planificación de Proyectos (MPP 4x4) con lógica vertical y horizontal validada.",
    "cita": "Metodología ZOPP (GTZ Alemania) & Planificación por Objetivos",
    "placeholder": "Estructuración analítica ZOPP para (analisis_objetivos)..."
  },
  "mpp": {
    "instruccion": "Matriz de Planificación del Proyecto (equivalente a Marco Lógico).",
    "ejemplo": "Ej: Objetivo general, propósito, resultados, actividades.",
    "benchmark": "Matriz de Planificación de Proyectos (MPP 4x4) con lógica vertical y horizontal validada.",
    "cita": "Metodología ZOPP (GTZ Alemania) & Planificación por Objetivos",
    "placeholder": "Estructuración analítica ZOPP para (mpp)..."
  }
};

export const HORIZON_EUROPE_GUIDES = {
  "consorcio_multinacional": {
    "instruccion": "Estructura de partners internacionales y división de roles científicos.",
    "ejemplo": "Ej (Estilo Airbus/BioNTech): Instituto Fraunhofer (Líder WP1-I+D), SAP (WP2-Software).",
    "benchmark": "Cumplimiento estricto de Do No Significant Harm (DNSH) en los 6 objetivos ambientales y FAIR Data.",
    "cita": "Horizon Europe Programme Guide (Comisión Europea) & Principio DNSH",
    "placeholder": "Criterios de excelencia e impacto europeo para (consorcio_multinacional)..."
  },
  "dnsh": {
    "instruccion": "Principio Do No Significant Harm. Demostrar que el proyecto no daña ninguno de los 6 objetivos medioambientales.",
    "ejemplo": "Ej (Estilo Northvolt): El proceso de reciclaje reduce 80% emisiones de CO2 sin generar efluentes tóxicos.",
    "benchmark": "Cumplimiento estricto de Do No Significant Harm (DNSH) en los 6 objetivos ambientales y FAIR Data.",
    "cita": "Horizon Europe Programme Guide (Comisión Europea) & Principio DNSH",
    "placeholder": "Criterios de excelencia e impacto europeo para (dnsh)..."
  },
  "open_science": {
    "instruccion": "Plan de gestión de datos FAIR y diseminación en repositorios abiertos.",
    "ejemplo": "Ej (Estilo CERN): Publicación de datasets de simulación en Zenodo con licencia CC-BY.",
    "benchmark": "Cumplimiento estricto de Do No Significant Harm (DNSH) en los 6 objetivos ambientales y FAIR Data.",
    "cita": "Horizon Europe Programme Guide (Comisión Europea) & Principio DNSH",
    "placeholder": "Criterios de excelencia e impacto europeo para (open_science)..."
  },
  "excelencia": {
    "instruccion": "Impacto más allá del estado del arte.",
    "ejemplo": "Ej: Eficiencia cuántica 20% superior al referente actual comercializado por IBM.",
    "benchmark": "Cumplimiento estricto de Do No Significant Harm (DNSH) en los 6 objetivos ambientales y FAIR Data.",
    "cita": "Horizon Europe Programme Guide (Comisión Europea) & Principio DNSH",
    "placeholder": "Criterios de excelencia e impacto europeo para (excelencia)..."
  }
};

export const HOSHIN_KANRI_GUIDES = {
  "true_north": {
    "instruccion": "Visión a 10 años. El propósito inalterable de la organización.",
    "ejemplo": "Ej (Estilo Toyota/Honda): \"Cero emisiones y cero colisiones para 2040\".",
    "benchmark": "Alineación de objetivos de ruptura (Breakthroughs) en Matriz X con revisiones Catchball periódicas.",
    "cita": "Yoji Akao — Hoshin Kanri: Policy Deployment & Toyota Production System",
    "placeholder": "Despliegue estratégico Hoshin para (true_north)..."
  },
  "matriz_x": {
    "instruccion": "Herramienta que alinea visión a largo plazo, objetivos anuales, iniciativas y métricas.",
    "ejemplo": "Ej (Estilo Sony): Eje Sur (Iniciativa: Lente 8K) conectado con Eje Este (KPI: Reducir costo 15%).",
    "benchmark": "Alineación de objetivos de ruptura (Breakthroughs) en Matriz X con revisiones Catchball periódicas.",
    "cita": "Yoji Akao — Hoshin Kanri: Policy Deployment & Toyota Production System",
    "placeholder": "Despliegue estratégico Hoshin para (matriz_x)..."
  },
  "breakthroughs": {
    "instruccion": "Objetivos disruptivos anuales que cambian el status quo.",
    "ejemplo": "Ej (Estilo Nissan): Reducir el tiempo de ensamble de baterías de 4 horas a 45 minutos.",
    "benchmark": "Alineación de objetivos de ruptura (Breakthroughs) en Matriz X con revisiones Catchball periódicas.",
    "cita": "Yoji Akao — Hoshin Kanri: Policy Deployment & Toyota Production System",
    "placeholder": "Despliegue estratégico Hoshin para (breakthroughs)..."
  },
  "bowler": {
    "instruccion": "Indicadores de revisión visual mensual.",
    "ejemplo": "Ej: Gráfico de semáforo Andon para la línea de producción de motores.",
    "benchmark": "Alineación de objetivos de ruptura (Breakthroughs) en Matriz X con revisiones Catchball periódicas.",
    "cita": "Yoji Akao — Hoshin Kanri: Policy Deployment & Toyota Production System",
    "placeholder": "Despliegue estratégico Hoshin para (bowler)..."
  }
};

export const AMOEBA_MANAGEMENT_GUIDES = {
  "mapeo_celulas": {
    "instruccion": "División de la empresa en micro-centros de ganancia independientes.",
    "ejemplo": "Ej (Estilo Kyocera/Alibaba): Dividir operaciones en 50 células (Ej. Amoeba de Servidores, Amoeba de Logística).",
    "benchmark": "Valor agregado por hora > benchmark interno con micro-ganancias transparentes por célula.",
    "cita": "Kazuo Inamori — Amoeba Management (Filosofía Kyocera)",
    "placeholder": "Estructuración de micro-ganancias amoeba para (mapeo_celulas)..."
  },
  "precios_transferencia": {
    "instruccion": "Cómo una célula le \"vende\" internamente a otra.",
    "ejemplo": "Ej: Amoeba de Diseño le cobra $50 USD la hora a Amoeba de Manufactura por el plano CAD.",
    "benchmark": "Valor agregado por hora > benchmark interno con micro-ganancias transparentes por célula.",
    "cita": "Kazuo Inamori — Amoeba Management (Filosofía Kyocera)",
    "placeholder": "Estructuración de micro-ganancias amoeba para (precios_transferencia)..."
  },
  "rentabilidad_hora": {
    "instruccion": "Cálculo de la utilidad generada dividida por las horas trabajadas.",
    "ejemplo": "Ej: Rentabilidad por hora = (Ingreso Amoeba - Costos no laborales) / Total Horas del equipo.",
    "benchmark": "Valor agregado por hora > benchmark interno con micro-ganancias transparentes por célula.",
    "cita": "Kazuo Inamori — Amoeba Management (Filosofía Kyocera)",
    "placeholder": "Estructuración de micro-ganancias amoeba para (rentabilidad_hora)..."
  },
  "filosofia": {
    "instruccion": "Alineación de los miembros de la célula con los valores nucleares.",
    "ejemplo": "Ej (Estilo Inamori/Jack Ma): \"Hacer lo correcto como ser humano\" y priorizar al cliente antes que al accionista.",
    "benchmark": "Valor agregado por hora > benchmark interno con micro-ganancias transparentes por célula.",
    "cita": "Kazuo Inamori — Amoeba Management (Filosofía Kyocera)",
    "placeholder": "Estructuración de micro-ganancias amoeba para (filosofia)..."
  },
  "iframe_simulador": {
    "instruccion": "Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas.",
    "ejemplo": "Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio.",
    "benchmark": "Intervalo de confianza al 95%.",
    "cita": "The Nature of Value (Ch. 5)",
    "placeholder": "Parámetros del simulador y corridas..."
  }
};

export const GUANXI_PLAN_GUIDES = {
  "mapa_relaciones": {
    "instruccion": "Mapeo de conexiones estratégicas con el Estado y otros partners clave.",
    "ejemplo": "Ej (Estilo Tencent/Baidu): Alianza estratégica con el Ministerio de Tecnología Provincial y Universidades Estatales.",
    "benchmark": "Matriz relacional de reciprocidad (Bao) y preservación de reputación (Mianzi) con alineación institucional.",
    "cita": "Negotiating South-South Regional Trade Agreements (UNCTAD) & Ética Comercial China",
    "placeholder": "Estrategia de confianza y redes relacionales para (mapa_relaciones)..."
  },
  "alineacion_quinquenal": {
    "instruccion": "Cómo el proyecto apoya los objetivos del Plan Quinquenal del Estado.",
    "ejemplo": "Ej: Apoya directamente el plan \"Made in China 2025\" en el sector de Semiconductores.",
    "benchmark": "Matriz relacional de reciprocidad (Bao) y preservación de reputación (Mianzi) con alineación institucional.",
    "cita": "Negotiating South-South Regional Trade Agreements (UNCTAD) & Ética Comercial China",
    "placeholder": "Estrategia de confianza y redes relacionales para (alineacion_quinquenal)..."
  },
  "reciprocidad": {
    "instruccion": "Estrategia de favores y beneficios mutuos a largo plazo.",
    "ejemplo": "Ej (Estilo Huawei): Transferencia de tecnología 5G a cambio de acceso preferencial a redes municipales.",
    "benchmark": "Matriz relacional de reciprocidad (Bao) y preservación de reputación (Mianzi) con alineación institucional.",
    "cita": "Negotiating South-South Regional Trade Agreements (UNCTAD) & Ética Comercial China",
    "placeholder": "Estrategia de confianza y redes relacionales para (reciprocidad)..."
  },
  "armonia": {
    "instruccion": "Manejo de conflictos para mantener el respeto y \"salvar la cara\" (Mianzi).",
    "ejemplo": "Ej: Resolución privada de disputas (Joint Ventures) sin litigios públicos.",
    "benchmark": "Matriz relacional de reciprocidad (Bao) y preservación de reputación (Mianzi) con alineación institucional.",
    "cita": "Negotiating South-South Regional Trade Agreements (UNCTAD) & Ética Comercial China",
    "placeholder": "Estrategia de confianza y redes relacionales para (armonia)..."
  }
};

export const ONUDI_PROJECT_GUIDES = {
  "ingenieria_base": {
    "instruccion": "Tecnología elegida, origen y pruebas de viabilidad técnica industrial.",
    "ejemplo": "Ej: Línea de extrusión continua con tecnología alemana, TRL 9.",
    "benchmark": "Flujo de Caja Libre para la Firma (FCFF) descontado a tasa internacional con viabilidad técnica garantizada.",
    "cita": "Manual de Estudios de Viabilidad Industrial ONUDI (Behrens & Hawranek)",
    "placeholder": "Parámetros industriales ONUDI para (ingenieria_base)..."
  },
  "wacc_onudi": {
    "instruccion": "Costo Promedio Ponderado de Capital detallado con tasas internacionales.",
    "ejemplo": "Ej: RFR 4%, Beta 1.2, ERP 6%. WACC = 11.2%.",
    "benchmark": "Flujo de Caja Libre para la Firma (FCFF) descontado a tasa internacional con viabilidad técnica garantizada.",
    "cita": "Manual de Estudios de Viabilidad Industrial ONUDI (Behrens & Hawranek)",
    "placeholder": "Parámetros industriales ONUDI para (wacc_onudi)..."
  },
  "fcff": {
    "instruccion": "Flujo de Caja Libre para la Firma (Free Cash Flow to the Firm).",
    "ejemplo": "Ej: FCFF proyectado al año 5: $2.5M USD.",
    "benchmark": "Flujo de Caja Libre para la Firma (FCFF) descontado a tasa internacional con viabilidad técnica garantizada.",
    "cita": "Manual de Estudios de Viabilidad Industrial ONUDI (Behrens & Hawranek)",
    "placeholder": "Parámetros industriales ONUDI para (fcff)..."
  },
  "sensibilidad_riesgo": {
    "instruccion": "Simulación de riesgo (Monte Carlo) sobre variables críticas.",
    "ejemplo": "Ej: Variación de precios de acero de +/- 20% no destruye el VPN.",
    "benchmark": "Flujo de Caja Libre para la Firma (FCFF) descontado a tasa internacional con viabilidad técnica garantizada.",
    "cita": "Manual de Estudios de Viabilidad Industrial ONUDI (Behrens & Hawranek)",
    "placeholder": "Parámetros industriales ONUDI para (sensibilidad_riesgo)..."
  },
  "iframe_simulador": {
    "instruccion": "Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas.",
    "ejemplo": "Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio.",
    "benchmark": "Intervalo de confianza al 95%.",
    "cita": "The Nature of Value (Ch. 5)",
    "placeholder": "Parámetros del simulador y corridas..."
  }
};

export const FIELD_GUIDES_MAP = {
  business: BUSINESS_GUIDES,
  social_bid: SOCIAL_BID_GUIDES,
  agile_startup: AGILE_STARTUP_GUIDES,
  technology_id: TECHNOLOGY_ID_GUIDES,
  micro_business: MICRO_BUSINESS_GUIDES,
  investment_project: INVESTMENT_PROJECT_GUIDES,
  zopp: ZOPP_GUIDES,
  horizon_europe: HORIZON_EUROPE_GUIDES,
  hoshin_kanri: HOSHIN_KANRI_GUIDES,
  amoeba_management: AMOEBA_MANAGEMENT_GUIDES,
  guanxi_plan: GUANXI_PLAN_GUIDES,
  onudi_project: ONUDI_PROJECT_GUIDES,
};
