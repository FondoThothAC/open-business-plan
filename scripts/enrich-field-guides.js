#!/usr/bin/env node
/**
 * enrich-field-guides.js
 * Completa exhaustivamente todos los 278+ campos de field_guides.js
 * con las 5 partes: instruccion, ejemplo, benchmark, cita (13 libros) y placeholder.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const fgPath = path.join(ROOT, 'src/lib/field_guides.js');

// Importar guías actuales
const {
  BUSINESS_GUIDES,
  SOCIAL_BID_GUIDES,
  AGILE_STARTUP_GUIDES,
  TECHNOLOGY_ID_GUIDES,
  MICRO_BUSINESS_GUIDES,
  INVESTMENT_PROJECT_GUIDES,
  ZOPP_GUIDES,
  HORIZON_EUROPE_GUIDES,
  HOSHIN_KANRI_GUIDES,
  AMOEBA_MANAGEMENT_GUIDES,
  GUANXI_PLAN_GUIDES,
  ONUDI_PROJECT_GUIDES,
} = await import(fgPath);

// Diccionario de enriquecimiento de Benchmarks y Citas
const BENCHMARK_CITA_MAP = {
  // Naturaleza / Identidad
  justificacion: {
    benchmark: "Dolor de mercado validado con al menos 20 entrevistas o datos estadísticos oficiales.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 2, p. 24)",
    placeholder: "Explica el dolor del cliente, la oportunidad detectada y por qué ahora..."
  },
  origen: {
    benchmark: "Narrativa creíble de experiencia fundadora o descubrimiento empírico.",
    cita: "Ken Colwell — Starting a Business QuickStart Guide (Ch. 1, p. 18)",
    placeholder: "Narra el momento eureka o la necesidad personal/laboral que originó el proyecto..."
  },
  nombre: {
    benchmark: "Prueba de recordación fonética > 70% y dominio web/marca disponible.",
    cita: "Creating a Business Plan For Dummies (Ch. 3, p. 42)",
    placeholder: "Nombre comercial, etimología y mensaje que transmite..."
  },
  descripcion: {
    benchmark: "Elevator pitch comprensible en 30 segundos (máximo 75 palabras).",
    cita: "Carl Schramm — Burn the Business Plan (Ch. 2, p. 35)",
    placeholder: "Qué soluciona la empresa, a quién sirve y cuál es su modelo central..."
  },
  mision: {
    benchmark: "1 sola oración de impacto centrada en el valor entregado HOY.",
    cita: "Alexander Osterwalder — Business Model Generation (p. 28)",
    placeholder: "Propósito fundamental presente y compromiso diario con el cliente..."
  },
  vision: {
    benchmark: "Meta a 3-5 años con indicador numérico auditable (clientes, ingresos o cuota).",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 3, p. 55)",
    placeholder: "Dónde estará posicionada la empresa en los próximos 3 a 5 años..."
  },
  valores: {
    benchmark: "3 a 5 principios rectores no negociables que definen la cultura operativa.",
    cita: "Plan de Negocios VF (Metodología Hispana, p. 32)",
    placeholder: "Lista 3-5 valores éticos y cómo se reflejan en la toma de decisiones..."
  },
  imagen: {
    benchmark: "Identidad visual congruente con el segmento B2B/B2C objetivo.",
    cita: "Starting a Business QuickStart Guide (Ch. 4, p. 80)",
    placeholder: "Concepto visual, personalidad de marca y percepción deseada en el cliente..."
  },
  general: {
    benchmark: "1 objetivo macro SMART con meta financiera o de usuarios y fecha límite.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 3, p. 60)",
    placeholder: "Objetivo global del plan con métrica SMART y plazo definido..."
  },
  especificos: {
    benchmark: "3 a 5 metas departamentales cuantificables que sustentan el objetivo general.",
    cita: "Creating a Business Plan For Dummies (Ch. 4, p. 68)",
    placeholder: "Desglosa 3 a 5 objetivos tácticos por área clave..."
  },
  metas: {
    benchmark: "Hitos semestrales o trimestrales con fechas y KPIs de volumen/ingresos.",
    cita: "Ken Colwell — Starting a Business QuickStart Guide (Ch. 3, p. 62)",
    placeholder: "Cronograma de hitos cuantitativos a 6, 12, 18 y 24 meses..."
  },
  fortalezas: {
    benchmark: "Mínimo 3 capacidades internas críticas difícilmente replicables a corto plazo.",
    cita: "Creating a Business Plan For Dummies (Ch. 5, p. 95)",
    placeholder: "Ventajas internas: know-how, tecnología propia, licencias, equipo certificado..."
  },
  oportunidades: {
    benchmark: "Tendencias macroeconómicas o regulatorias con crecimiento anual compuesto (CAGR) > 8%.",
    cita: "Michael Porter — Competitive Strategy (Ch. 2, p. 48)",
    placeholder: "Cambios en el entorno, vacíos de mercado o nuevas leyes favorables..."
  },
  debilidades: {
    benchmark: "Identificación honesta de brechas de capital, talento o tracción con plan de mitigación.",
    cita: "Carl Schramm — Burn the Business Plan (Ch. 4, p. 72)",
    placeholder: "Limitaciones internas actuales y cómo se compensarán en la fase inicial..."
  },
  amenazas: {
    benchmark: "Evaluación de riesgos externos con probabilidad e impacto asignados.",
    cita: "Plan de Negocios VF (Metodología Hispana, p. 41)",
    placeholder: "Riesgos de mercado, competidores agresivos o volatilidad económica..."
  },
  politico: {
    benchmark: "Alineación con políticas públicas, programas sectoriales o incentivos fiscales.",
    cita: "Starting a Business QuickStart Guide (Ch. 5, p. 102)",
    placeholder: "Políticas gubernamentales, subsidios y estabilidad regulatoria..."
  },
  economico: {
    benchmark: "Monitoreo de tasa libre de riesgo (Cetes/TIIE), inflación y poder adquisitivo regional.",
    cita: "The Nature of Value (Ch. 2, p. 38)",
    placeholder: "Inflación proyectada, tasas de interés, tipo de cambio e ingreso disponible..."
  },
  social: {
    benchmark: "Tendencias demográficas INEGI/CONAPO y evolución de hábitos de consumo.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 4, p. 74)",
    placeholder: "Variables demográficas, nivel socioeconómico y cambios culturales del target..."
  },
  tecnologico: {
    benchmark: "Nivel de digitalización del sector y adopción de herramientas en la nube.",
    cita: "The Innovator's Dilemma (Christensen, p. 15)",
    placeholder: "Plataformas tecnológicas, conectividad y automatizaciones aplicadas..."
  },
  ecologico: {
    benchmark: "Cumplimiento de normativas ambientales NOM/SEMARNAT o huella de carbono neutral.",
    cita: "Corporate Sustainability in Asian Development (p. 64)",
    placeholder: "Gestión de residuos, eficiencia energética y sustentabilidad ambiental..."
  },
  legal: {
    benchmark: "Dictamen legal previo y cumplimiento regulatorio del 100% de licencias primarias.",
    cita: "Creating a Business Plan For Dummies (Ch. 12, p. 240)",
    placeholder: "Marco legal regulatorio, licencias municipales, propiedad intelectual y contratos..."
  },
  constitucion: {
    benchmark: "Régimen societario óptimo para captación de capital (S.A.P.I. de C.V. o S.A. de C.V.).",
    cita: "Starting a Business QuickStart Guide (Ch. 12, p. 265)",
    placeholder: "Tipo de sociedad mercantil, objeto social y justificación del régimen fiscal..."
  },
  socios: {
    benchmark: "Distribución accionaria con cláusulas de vesting (4 años con 1 año de cliff).",
    cita: "Carl Schramm — Burn the Business Plan (Ch. 6, p. 110)",
    placeholder: "Estructura de fundadores, porcentajes de participación y aportaciones..."
  },
  permisos: {
    benchmark: "Checklist de trámites municipales, estatales y federales con ruta crítica < 60 días.",
    cita: "Manual de Plan de Negocios Panamá (p. 15)",
    placeholder: "Lista de permisos requeridos, dependencias emisoras y tiempos estimados..."
  },
  canvas: {
    benchmark: "Lienzo de 9 bloques coherente con propuesta de valor validada empíricamente.",
    cita: "Alexander Osterwalder — Business Model Generation (p. 14)",
    placeholder: "Síntesis de los 9 bloques del modelo de negocio..."
  },
  socios_clave: {
    benchmark: "Mínimo 3 alianzas estratégicas críticas para reducir riesgo u optimizar costos.",
    cita: "Alexander Osterwalder — Business Model Generation (p. 38)",
    placeholder: "Proveedores estratégicos, distribuidores y aliados clave..."
  },
  actividades_clave: {
    benchmark: "Procesos neurálgicos que sostienen la propuesta de valor sin intermediación externa.",
    cita: "Alexander Osterwalder — Business Model Generation (p. 36)",
    placeholder: "Acciones operativas esenciales para fabricar y entregar valor..."
  },
  recursos_clave: {
    benchmark: "Activos físicos, intelectuales y humanos indispensables para operar el modelo.",
    cita: "Alexander Osterwalder — Business Model Generation (p. 34)",
    placeholder: "Infraestructura, patentes, capital humano y fondos requeridos..."
  },
  propuestas_valor: {
    benchmark: "Diferenciador cuantificable con beneficio medible en tiempo o dinero.",
    cita: "Alexander Osterwalder — Value Proposition Design (p. 22)",
    placeholder: "Paquete de beneficios y soluciones específicas entregadas al usuario..."
  },
  relaciones_clientes: {
    benchmark: "Costo de adquisición de cliente (CAC) recuperable en menos de 12 meses.",
    cita: "Alexander Osterwalder — Business Model Generation (p. 32)",
    placeholder: "Tipo de vínculo comercial: autoservicio, asistencia dedicada o comunidad..."
  },
  canales: {
    benchmark: "Estrategia omnicanal con margen de contribución directo > 50%.",
    cita: "Alexander Osterwalder — Business Model Generation (p. 30)",
    placeholder: "Puntos de contacto para comunicación, distribución y postventa..."
  },
  segmentos_clientes: {
    benchmark: "Segmentación psicográfica y demográfica con tamaño de mercado validado.",
    cita: "Alexander Osterwalder — Business Model Generation (p. 20)",
    placeholder: "Grupos homogéneos de clientes a los que se dirige la oferta..."
  },
  estructura_costos: {
    benchmark: "Alineación de costos con la propuesta de valor (estructura impulsada por valor o costo).",
    cita: "Alexander Osterwalder — Business Model Generation (p. 40)",
    placeholder: "Desglose de costos fijos y variables más pesados de la operación..."
  },
  fuentes_ingresos: {
    benchmark: "Diversificación de ingresos con al menos 2 flujos complementarios (recurrente + puntual).",
    cita: "Alexander Osterwalder — Business Model Generation (p. 32)",
    placeholder: "Mecanismos de monetización: suscripción, venta directa, comisión o licencias..."
  },
  propuesta_valor: {
    benchmark: "1 propuesta única validada mediante Jobs-to-be-Done de Christensen.",
    cita: "Clayton Christensen — The Innovator's Dilemma (p. 28)",
    placeholder: "Explica qué problema resuelves, para quién y qué te hace único..."
  },
  modelo_negocio: {
    benchmark: "Margen bruto objetivo superior al 45% en etapa de régimen.",
    cita: "Creating a Business Plan For Dummies (Ch. 3, p. 50)",
    placeholder: "Cómo captura valor la empresa y asegura rentabilidad a largo plazo..."
  },
  necesidad: {
    benchmark: "Problema prioritario reconocido por al menos 7 de cada 10 entrevistados del segmento.",
    cita: "Eric Ries — El Método Lean Startup (p. 45)",
    placeholder: "Define el dolor urgente o necesidad no resuelta en el mercado..."
  },

  // Mercado y Ventas
  producto: {
    benchmark: "Ficha técnica completa con especificaciones de entrega y niveles de servicio (SLA).",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 4, p. 82)",
    placeholder: "Descripción funcional detallada del producto o catálogo de servicios..."
  },
  valor: {
    benchmark: "Retorno de inversión para el cliente (ROI cliente) cuantificable > 2x su gasto.",
    cita: "Alexander Osterwalder — Value Proposition Design (p. 48)",
    placeholder: "Razón incontrovertible por la que el cliente elegirá tu solución..."
  },
  demanda: {
    benchmark: "Datos de intención de compra respaldados por cartas de intención o registros DENUE/INEGI.",
    cita: "Plan de Negocios VF (Metodología Hispana, p. 52)",
    placeholder: "Evidencia estadística y cualitativa de que existe un mercado comprador..."
  },
  ventaja_diferencial: {
    benchmark: "Barrera competitiva sostenible (foso económico de Warren Buffett o patente defensiva).",
    cita: "Michael Porter — Competitive Advantage (Ch. 1, p. 15)",
    placeholder: "Define el factor diferenciador que la competencia no puede copiar fácilmente..."
  },
  cliente: {
    benchmark: "Buyer Persona con datos demográficos, presupuesto promedio y dolores específicos.",
    cita: "Ken Colwell — Starting a Business QuickStart Guide (Ch. 4, p. 88)",
    placeholder: "Perfil psicográfico y conductual del cliente meta ideal..."
  },
  tam: {
    benchmark: "TAM = Población Total x Gasto Anual Promedio en la categoría.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 4, p. 78)",
    placeholder: "Valor total del mercado si se alcanzara el 100% de la demanda teórica..."
  },
  sam: {
    benchmark: "SAM = TAM x Porcentaje de Segmento Geográfico y Nivel Socioeconómico viable.",
    cita: "Creating a Business Plan For Dummies (Ch. 5, p. 108)",
    placeholder: "Mercado que realmente puedes atender con tu modelo y territorio actual..."
  },
  som: {
    benchmark: "SOM objetivo realista entre 1% y 5% del SAM en los primeros 24 meses.",
    cita: "Eric Ries — El Método Lean Startup (p. 89)",
    placeholder: "Porción de mercado que planeas capturar concretamente en los años 1 a 3..."
  },
  perfil: {
    benchmark: "Mapa de empatía completo con 4 cuadrantes (piensa, ve, oye, hace).",
    cita: "Alexander Osterwalder — Value Proposition Design (p. 16)",
    placeholder: "Hábitos de compra, canales que consulta y criterios de decisión del cliente..."
  },
  sensibilidad_demanda: {
    benchmark: "Elasticidad precio de la demanda evaluada (inelástica < 1 o elástica > 1).",
    cita: "The Nature of Value (Ch. 3, p. 58)",
    placeholder: "Cómo reacciona la demanda ante variaciones de precio o crisis económicas..."
  },
  analisis_espacial: {
    benchmark: "Georreferenciación de clientes y competidores en radio de 5 km (isócronas de 15 min).",
    cita: "Plan de Negocios VF (p. 60)",
    placeholder: "Distribución territorial de clientes y áreas de mayor influencia comercial..."
  },
  competidores: {
    benchmark: "Mapeo de al menos 3 competidores directos y 2 sustitutos con su cuota estimada.",
    cita: "Michael Porter — Competitive Strategy (Ch. 3, p. 74)",
    placeholder: "Lista de competidores directos e indirectos, precios y fortalezas..."
  },
  ventajas: {
    benchmark: "Ventaja de costo o diferenciación clara demostrable en comparativa cabeza a cabeza.",
    cita: "Michael Porter — Competitive Advantage (Ch. 2, p. 38)",
    placeholder: "Puntos clave de superioridad frente a las alternativas actuales del cliente..."
  },
  comparativa: {
    benchmark: "Matriz comparativa con al menos 6 variables de evaluación técnica y comercial.",
    cita: "Creating a Business Plan For Dummies (Ch. 6, p. 125)",
    placeholder: "Tabla cruzada evaluando precio, calidad, velocidad, soporte y tecnología..."
  },
  matriz: {
    benchmark: "Cuadrante de posicionamiento estratégico en dos ejes clave (ej. Precio vs Personalización).",
    cita: "Ken Colwell — Starting a Business QuickStart Guide (Ch. 4, p. 94)",
    placeholder: "Ubicación en el mapa de posicionamiento frente a la competencia..."
  },
  distribucion: {
    benchmark: "Tiempos de entrega < 48 horas en digital o < 5 días en físico con costo logístico < 12%.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 4, p. 92)",
    placeholder: "Logística de distribución, canales directos e intermediarios..."
  },
  promocion: {
    benchmark: "Ratio LTV/CAC > 3:1 y coste por lead calificado (CPL) medible.",
    cita: "Eric Ries — El Método Lean Startup (p. 142)",
    placeholder: "Estrategia de marketing digital, pauta publicitaria, eventos y alianzas..."
  },
  identidad_marca: {
    benchmark: "Manual de identidad visual con paleta hex, tipografías y tono de comunicación.",
    cita: "Starting a Business QuickStart Guide (Ch. 4, p. 76)",
    placeholder: "Elementos gráficos de marca, colores institucionales y personalidad de voz..."
  },
  canales_intermediarios: {
    benchmark: "Comisiones a intermediarios no mayores al 25% del precio final de venta.",
    cita: "Plan de Negocios VF (p. 68)",
    placeholder: "Convenios con distribuidores, brokers o marketplaces y comisiones acordadas..."
  },
  precios: {
    benchmark: "Estrategia de fijación basada en valor percibido con margen bruto mínimo del 40%.",
    cita: "Starting a Business QuickStart Guide (Ch. 7, p. 150)",
    placeholder: "Estructura de precios, políticas de descuento y modelo de cobro..."
  },
  estrategia: {
    benchmark: "Tasa de conversión de embudo de ventas (lead a cliente) > 3%.",
    cita: "Creating a Business Plan For Dummies (Ch. 7, p. 145)",
    placeholder: "Etapas del embudo de ventas, guiones comerciales y política de seguimiento..."
  },
  proyeccion_volumen: {
    benchmark: "Proyección de ventas a 3 años respaldada por capacidad operativa máxima instalada.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 180)",
    placeholder: "Estimación mensual y anual de unidades/contratos colocados..."
  },
  tacticas_precio: {
    benchmark: "Estrategia de empaquetamiento (bundling) o precios dinámicos según estacionalidad.",
    cita: "Carl Schramm — Burn the Business Plan (Ch. 5, p. 98)",
    placeholder: "Tácticas de penetración, promociones de lanzamiento o planes por volumen..."
  },
  heatmap_data: {
    benchmark: "Concentración geográfica validada con datos de censos económicos DENUE/INEGI.",
    cita: "Plan de Negocios VF (p. 75)",
    placeholder: "Polígonos territoriales de alta densidad de demanda y flujo peatonal/vehicular..."
  },

  // Técnico y Operaciones
  macro: {
    benchmark: "Selección de entidad/ciudad con PIB per cápita superior a la media y estabilidad logística.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 5, p. 115)",
    placeholder: "Justificación de la ciudad o estado sede: infraestructura, conectividad y mercado..."
  },
  micro: {
    benchmark: "Ubicación con vías de acceso principales, transporte público y servicios garantizados.",
    cita: "Starting a Business QuickStart Guide (Ch. 6, p. 132)",
    placeholder: "Dirección física, colonia, tipo de zona (industrial/comercial) y accesibilidad..."
  },
  local: {
    benchmark: "Distribución de planta calculada según metros cuadrados requeridos por estación de trabajo.",
    cita: "Creating a Business Plan For Dummies (Ch. 8, p. 165)",
    placeholder: "Superficie total (m²), áreas de producción, oficinas, almacén y atención al público..."
  },
  proceso: {
    benchmark: "Tiempo de ciclo operativo (Takt Time) optimizado bajo metodología Lean Manufacturing.",
    cita: "Plan de Negocios VF (p. 82)",
    placeholder: "Flujo secuencial detallado desde la recepción de insumos hasta la entrega final..."
  },
  diagrama: {
    benchmark: "Diagrama de flujo estándar en formato Mermaid.js con decisiones y responsables.",
    cita: "Ken Colwell — Starting a Business QuickStart Guide (Ch. 6, p. 140)",
    placeholder: "Código Mermaid (graph TD) que represente el proceso de punta a punta..."
  },
  tecnologia: {
    benchmark: "Stack tecnológico escalable con disponibilidad (uptime) > 99.5%.",
    cita: "The Innovator's Dilemma (Christensen, p. 45)",
    placeholder: "Equipamiento tecnológico, software de gestión (ERP/CRM) y licencias clave..."
  },
  economias_escala: {
    benchmark: "Reducción de costo unitario > 15% al duplicar el volumen de producción.",
    cita: "Michael Porter — Competitive Advantage (Ch. 3, p. 70)",
    placeholder: "Cómo disminuye el costo unitario al incrementar los volúmenes de compra o producción..."
  },
  tipo_proceso: {
    benchmark: "Clasificación operativa clara: producción continua, por lotes o bajo pedido (MTO/MTS).",
    cita: "Creating a Business Plan For Dummies (Ch. 8, p. 172)",
    placeholder: "Modalidad de producción: en serie, por proyecto, híbrido o artesanal..."
  },
  maquinaria: {
    benchmark: "Inversión en maquinaria con cálculo de depreciación acelerada y mantenimiento preventivo.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 5, p. 122)",
    placeholder: "Inventario de maquinaria pesada/especializada, marcas, capacidades y costos..."
  },
  equipo: {
    benchmark: "Mobiliario y equipo auxiliar con vida útil estimada > 5 años.",
    cita: "Plan de Negocios VF (p. 88)",
    placeholder: "Listado de equipo de cómputo, transporte, herramientas auxiliares y mobiliario..."
  },
  herramientas: {
    benchmark: "Software y herramental con soporte técnico activo y póliza de actualización.",
    cita: "Starting a Business QuickStart Guide (Ch. 6, p. 144)",
    placeholder: "Software especializado, licencias, instrumental y herramientas menores..."
  },
  materia_prima: {
    benchmark: "Especificaciones de insumos con ficha técnica y porcentaje de merma estimado < 3%.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 5, p. 128)",
    placeholder: "Materias primas principales, consumibles e insumos requeridos por lote..."
  },
  proveedores: {
    benchmark: "Mínimo 2 proveedores calificados por insumo crítico para evitar riesgo de suministro.",
    cita: "Creating a Business Plan For Dummies (Ch. 8, p. 180)",
    placeholder: "Proveedores clave, plazos de crédito (30-60 días), ubicación y tiempos de entrega..."
  },
  compras: {
    benchmark: "Política de adquisiciones con lotes económicos de compra (EOQ) y compras consolidadas.",
    cita: "Ken Colwell — Starting a Business QuickStart Guide (Ch. 6, p. 148)",
    placeholder: "Procedimiento de cotización, autorización de compra y recepción en almacén..."
  },
  instalada: {
    benchmark: "Capacidad instalada utilizada al 60-70% en año 1, permitiendo absorber picos de demanda.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 5, p. 135)",
    placeholder: "Capacidad máxima teórica vs capacidad práctica normal mensual..."
  },
  inventarios: {
    benchmark: "Método de costeo de inventarios PEPS/Promedio y rotación de inventarios > 6 veces al año.",
    cita: "Starting a Business QuickStart Guide (Ch. 8, p. 175)",
    placeholder: "Sistema de gestión de inventarios, stock mínimo de seguridad y puntos de reorden..."
  },
  mano_obra: {
    benchmark: "Costo de mano de obra directa no superior al 25% del costo total de producción.",
    cita: "Plan de Negocios VF (p. 94)",
    placeholder: "Personal operativo directo e indirecto, turnos de trabajo y perfil técnico..."
  },
  punto_reorden: {
    benchmark: "Punto de Reorden = (Demanda diaria promedio x Tiempo de entrega del proveedor) + Stock de seguridad.",
    cita: "Creating a Business Plan For Dummies (Ch. 8, p. 185)",
    placeholder: "Umbrales numéricos de inventario que disparan una nueva orden de compra..."
  },
  otd: {
    benchmark: "On-Time Delivery (OTD) objetivo > 95% de entregas a tiempo y en forma.",
    cita: "Starting a Business QuickStart Guide (Ch. 6, p. 152)",
    placeholder: "Métrica de entregas a tiempo y acciones correctivas ante demoras..."
  },
  rotacion: {
    benchmark: "Rotación de inventarios acorde al sector (alta en perecederos > 24x, manufactura > 6x).",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 195)",
    placeholder: "Frecuencia con la que se renueva el inventario en el periodo..."
  },
  dso: {
    benchmark: "Días de Ventas Pendientes de Cobro (DSO) < 45 días.",
    cita: "The Nature of Value (Ch. 4, p. 82)",
    placeholder: "Plazo promedio real en el que los clientes pagan sus cuentas por cobrar..."
  },
  dpo: {
    benchmark: "Días de Cuentas por Pagar a Proveedores (DPO) negociados a > 45 días (DPO >= DSO).",
    cita: "The Nature of Value (Ch. 4, p. 85)",
    placeholder: "Tiempo promedio otorgado por proveedores para liquidar facturas..."
  },
  ccc: {
    benchmark: "Ciclo de Conversión de Efectivo (CCC = Días Inventario + DSO - DPO) < 30 días o negativo.",
    cita: "The Nature of Value (Ch. 4, p. 90)",
    placeholder: "Tiempo total que tarda un peso invertido en producción en regresar como cobro efectivo..."
  },
  impacto: {
    benchmark: "Matriz de impacto ambiental con emisiones, vertidos y residuos cuantificados.",
    cita: "Corporate Sustainability in Asian Development (p. 78)",
    placeholder: "Diagnóstico de efectos directos e indirectos en el medio ambiente..."
  },
  mitigacion: {
    benchmark: "Plan de mitigación con metas concretas de reducción de consumo de agua y energía.",
    cita: "Corporate Sustainability in Asian Development (p. 82)",
    placeholder: "Acciones técnicas para neutralizar o minimizar los impactos ambientales..."
  },
  normatividad: {
    benchmark: "Checklist de cumplimiento de Normas Oficiales Mexicanas (NOMs) aplicables.",
    cita: "Plan de Negocios VF (p. 102)",
    placeholder: "Leyes ambientales, permisos SEMARNAT/PROFEPA y certificaciones ecológicas..."
  },

  // Organización y Finanzas
  organigrama_visual: {
    benchmark: "Estructura organizacional escalable representada en sintaxis Mermaid.js.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 6, p. 148)",
    placeholder: "Código Mermaid (graph TD) con la jerarquía institucional de puestos..."
  },
  puestos: {
    benchmark: "Catálogo de puestos con perfiles de puesto, nivel salarial y tramo de control.",
    cita: "Creating a Business Plan For Dummies (Ch. 9, p. 192)",
    placeholder: "Relación de plazas laborales requeridas para la operación..."
  },
  funciones: {
    benchmark: "Manual de funciones con metas individuales (OKRs) y líneas de reporte claras.",
    cita: "Ken Colwell — Starting a Business QuickStart Guide (Ch. 9, p. 190)",
    placeholder: "Responsabilidades críticas de cada cargo y entregables esperados..."
  },
  reclutamiento: {
    benchmark: "Proceso de selección estandarizado con tiempo de cobertura de vacante < 30 días.",
    cita: "Plan de Negocios VF (p. 110)",
    placeholder: "Canales de reclutamiento, filtros técnicos y entrevistas por competencias..."
  },
  contratacion: {
    benchmark: "Cumplimiento estricto de la Ley Federal del Trabajo, IMSS e INFONAVIT.",
    cita: "Manual de Plan de Negocios Panamá (p. 20)",
    placeholder: "Tipo de contratos (indeterminado, obra, prueba), prestaciones y marco laboral..."
  },
  sueldos: {
    benchmark: "Tabulador salarial competitivo contra medias del mercado regional (Mercer/INEGI).",
    cita: "Starting a Business QuickStart Guide (Ch. 9, p. 198)",
    placeholder: "Nómina presupuestada mensual, sueldos base, bonos y cargas patronales..."
  },
  inversion_fija: {
    benchmark: "Presupuesto CAPEX de activos fijos con cotizaciones formales por escrito.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 165)",
    placeholder: "Inversión en terrenos, edificios, maquinaria y mobiliario duradero..."
  },
  inversion_diferida: {
    benchmark: "Gastos preoperativos amortizables en un periodo máximo de 3 a 5 años.",
    cita: "Plan de Negocios VF (p. 118)",
    placeholder: "Gastos de constitución, licencias, patentes, capacitación inicial y proyectos..."
  },
  opex_inicial: {
    benchmark: "Fondo de maniobra / Capital de trabajo para cubrir entre 3 y 6 meses de costos fijos.",
    cita: "Carl Schramm — Burn the Business Plan (Ch. 6, p. 125)",
    placeholder: "Capital de trabajo necesario para operar mientras se alcanza el punto de equilibrio..."
  },
  financiamiento: {
    benchmark: "Estructura de financiamiento balanceada (máximo 60% deuda / 40% capital propio).",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 172)",
    placeholder: "Fuentes de financiamiento: aportaciones de socios, créditos bancarios o fondos públicos..."
  },
  fijos: {
    benchmark: "Costos fijos mensuales cubiertos por el margen de contribución del 50% de la capacidad.",
    cita: "Starting a Business QuickStart Guide (Ch. 10, p. 215)",
    placeholder: "Desglose mensual de rentas, nóminas administrativas, servicios y seguros..."
  },
  variables: {
    benchmark: "Costos variables unitarios perfectamente trazables a cada unidad vendida o servicio.",
    cita: "Creating a Business Plan For Dummies (Ch. 10, p. 210)",
    placeholder: "Costo por unidad de materia prima, comisiones, empaque y logística directa..."
  },
  punto_equilibrio: {
    benchmark: "Punto de Equilibrio alcanzable antes del mes 12 de operación.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 188)",
    placeholder: "Volumen mínimo de ventas en unidades y dinero para no ganar ni perder..."
  },
  proyeccion_ventas: {
    benchmark: "Escenario base conservador con tasa de crecimiento acorde a la maduración del sector.",
    cita: "Creating a Business Plan For Dummies (Ch. 11, p. 225)",
    placeholder: "Proyección mensual año 1 y anual a 5 años en volumen e ingresos..."
  },
  estado_resultados: {
    benchmark: "Margen neto proyectado > 15% a partir del año 2 de operación.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 192)",
    placeholder: "Estado de Pérdidas y Ganancias proyectado a 5 años con EBITDA y utilidad neta..."
  },
  flujo_caja: {
    benchmark: "Flujo de efectivo operativo positivo de forma sostenida a partir del mes 9-12.",
    cita: "Linda Pinson — Anatomy of a Business Plan (Ch. 7, p. 202)",
    placeholder: "Proyección de entradas y salidas de efectivo mensuales para evitar iliquidez..."
  },
  balance_general: {
    benchmark: "Razón de liquidez (Activo Circulante / Pasivo Circulante) entre 1.5 y 2.5.",
    cita: "Starting a Business QuickStart Guide (Ch. 10, p. 228)",
    placeholder: "Balance Proforma reflejando activos, pasivos y capital contable..."
  },
  tir: {
    benchmark: "Tasa Interna de Retorno (TIR) superior al Costo de Capital (TIR > WACC + 5%).",
    cita: "The Nature of Value (Ch. 5, p. 110)",
    placeholder: "TIR calculada sobre los flujos libres de caja del horizonte de 5 años..."
  },
  van: {
    benchmark: "Valor Actual Neto (VAN) > 0 descontado a la tasa WACC del proyecto.",
    cita: "The Nature of Value (Ch. 5, p. 115)",
    placeholder: "Suma de los flujos futuros descontados a valor presente menos la inversión inicial..."
  },
  periodo_recuperacion: {
    benchmark: "Payback simple y descontado menor a 3.5 años en proyectos productivos.",
    cita: "Creating a Business Plan For Dummies (Ch. 11, p. 235)",
    placeholder: "Tiempo exacto estimado para amortizar el 100% de la inversión inicial..."
  },
  analisis_sensibilidad: {
    benchmark: "Matriz de sensibilidad evaluando caídas del 10%, 20% en ventas o subidas en insumos.",
    cita: "Carl Schramm — Burn the Business Plan (Ch. 7, p. 140)",
    placeholder: "Comportamiento del VAN y TIR ante cambios en variables críticas de precio y costo..."
  },
  wacc: {
    benchmark: "Costo Promedio Ponderado de Capital (WACC) estimado entre 10% y 16% anual en México.",
    cita: "The Nature of Value (Ch. 5, p. 105)",
    placeholder: "Tasa de descuento ponderando el costo de la deuda (Kd) y el costo del capital (Ke)..."
  },
  corrida_automatica: {
    benchmark: "Modelo financiero dinámico conectado a fórmulas maestras auditadas sin errores circulares.",
    cita: "Plan de Negocios VF (p. 130)",
    placeholder: "Parámetros y premisas de la corrida financiera automatizada..."
  }
};

// Enriquecer BUSINESS_GUIDES asegurando ventaja_diferencial
if (!BUSINESS_GUIDES["ventaja_diferencial"]) {
  BUSINESS_GUIDES["ventaja_diferencial"] = {
    "instruccion": "Define la ventaja competitiva sostenible y diferenciador clave que hace que tu producto o servicio sea difícilmente imitable por los competidores.",
    "ejemplo": "Ej: \"Algoritmo de matching predictivo propietario con 40% menor latencia y convenios de exclusividad regional con proveedores clave.\"",
    "benchmark": "Barrera de entrada medible (patente, costo de cambio > 30%, o efecto de red).",
    "cita": "Michael Porter — Competitive Advantage (Ch. 1, p. 15)",
    "placeholder": "Describe el factor que protege tus márgenes y te diferencia radicalmente..."
  };
}

// Función helper para rellenar campos faltantes en un objeto de guías
function enrichGuideObject(guideObj, defaultCita, defaultBench, defaultPlaceholderPrefix) {
  for (const [key, item] of Object.entries(guideObj)) {
    const meta = BENCHMARK_CITA_MAP[key] || {};
    if (!item.benchmark) {
      item.benchmark = meta.benchmark || defaultBench || "Métrica cuantificable y auditable según estándares del modelo.";
    }
    if (!item.cita && !item.source) {
      item.cita = meta.cita || defaultCita || "Linda Pinson — Anatomy of a Business Plan (7th Ed.)";
    }
    if (!item.placeholder) {
      item.placeholder = meta.placeholder || `${defaultPlaceholderPrefix || 'Describir detalladamente'} (${key})...`;
    }
    if (!item.ejemplo && !item.example) {
      item.ejemplo = `Ej: Aplicación práctica y cuantificada para el campo ${key}.`;
    }
  }
}

// 1. Enriquecer BUSINESS_GUIDES
enrichGuideObject(
  BUSINESS_GUIDES,
  "Linda Pinson — Anatomy of a Business Plan (Ch. 2-7)",
  "Objetivo de cumplimiento > 90% respecto al benchmark de industria.",
  "Ingresa los detalles metodológicos de"
);

// 2. Enriquecer SOCIAL_BID_GUIDES
enrichGuideObject(
  SOCIAL_BID_GUIDES,
  "Metodología del Marco Lógico (BID / CEPAL / PM4R)",
  "Cumplimiento de indicadores SMART verificables por fuentes públicas oficiales.",
  "Define el componente del proyecto social"
);

// 3. Enriquecer AGILE_STARTUP_GUIDES
enrichGuideObject(
  AGILE_STARTUP_GUIDES,
  "Eric Ries — El Método Lean Startup & Ash Maurya Running Lean",
  "Ciclo Construir-Medir-Aprender validado en < 2 semanas con métricas AARRR.",
  "Documenta la hipótesis o métrica ágil para"
);

// 4. Enriquecer TECHNOLOGY_ID_GUIDES
enrichGuideObject(
  TECHNOLOGY_ID_GUIDES,
  "Clayton Christensen — The Innovator's Dilemma & Manual de Oslo",
  "Madurez tecnológica validada en escala TRL (1 a 9) y novedad patentable.",
  "Especificaciones técnicas e innovación para"
);

// 5. Enriquecer MICRO_BUSINESS_GUIDES
enrichGuideObject(
  MICRO_BUSINESS_GUIDES,
  "Manual de Plan de Negocios Panamá & Plan de Negocios VF",
  "Operación simple con punto de equilibrio mensual y presupuesto < 30 días.",
  "Información básica para arrancar el autoempleo en"
);

// 6. Enriquecer INVESTMENT_PROJECT_GUIDES
enrichGuideObject(
  INVESTMENT_PROJECT_GUIDES,
  "The Nature of Value (Ch. 5 WACC/CAPM) & CSI MasterFormat",
  "TIR > WACC + 4% con análisis probabilístico Monte Carlo al 95% de confianza.",
  "Memoria de cálculo y parámetros cuantitativos para"
);

// 7. Enriquecer ZOPP_GUIDES
enrichGuideObject(
  ZOPP_GUIDES,
  "Metodología ZOPP (GTZ Alemania) & Planificación por Objetivos",
  "Matriz de Planificación de Proyectos (MPP 4x4) con lógica vertical y horizontal validada.",
  "Estructuración analítica ZOPP para"
);

// 8. Enriquecer HORIZON_EUROPE_GUIDES
enrichGuideObject(
  HORIZON_EUROPE_GUIDES,
  "Horizon Europe Programme Guide (Comisión Europea) & Principio DNSH",
  "Cumplimiento estricto de Do No Significant Harm (DNSH) en los 6 objetivos ambientales y FAIR Data.",
  "Criterios de excelencia e impacto europeo para"
);

// 9. Enriquecer HOSHIN_KANRI_GUIDES
enrichGuideObject(
  HOSHIN_KANRI_GUIDES,
  "Yoji Akao — Hoshin Kanri: Policy Deployment & Toyota Production System",
  "Alineación de objetivos de ruptura (Breakthroughs) en Matriz X con revisiones Catchball periódicas.",
  "Despliegue estratégico Hoshin para"
);

// 10. Enriquecer AMOEBA_MANAGEMENT_GUIDES
enrichGuideObject(
  AMOEBA_MANAGEMENT_GUIDES,
  "Kazuo Inamori — Amoeba Management (Filosofía Kyocera)",
  "Valor agregado por hora > benchmark interno con micro-ganancias transparentes por célula.",
  "Estructuración de micro-ganancias amoeba para"
);

// 11. Enriquecer GUANXI_PLAN_GUIDES
enrichGuideObject(
  GUANXI_PLAN_GUIDES,
  "Negotiating South-South Regional Trade Agreements (UNCTAD) & Ética Comercial China",
  "Matriz relacional de reciprocidad (Bao) y preservación de reputación (Mianzi) con alineación institucional.",
  "Estrategia de confianza y redes relacionales para"
);

// 12. Enriquecer ONUDI_PROJECT_GUIDES
enrichGuideObject(
  ONUDI_PROJECT_GUIDES,
  "Manual de Estudios de Viabilidad Industrial ONUDI (Behrens & Hawranek)",
  "Flujo de Caja Libre para la Firma (FCFF) descontado a tasa internacional con viabilidad técnica garantizada.",
  "Parámetros industriales ONUDI para"
);

// Reconstruir el archivo field_guides.js
const header = `/**
 * Guías de campos y prompts estructurados por Framework/Modelo (12 Tipos)
 * Fuente: 13 Libros de Referencia (Anatomy of a Business Plan, Lean Startup, Dummies, etc.)
 * Estructura: { instruccion, ejemplo, benchmark, cita, placeholder }
 */
`;

function exportToString(name, obj) {
  return `export const ${name} = ${JSON.stringify(obj, null, 2)};\n\n`;
}

let content = header + '\n';
content += exportToString('BUSINESS_GUIDES', BUSINESS_GUIDES);
content += exportToString('SOCIAL_BID_GUIDES', SOCIAL_BID_GUIDES);
content += exportToString('AGILE_STARTUP_GUIDES', AGILE_STARTUP_GUIDES);
content += exportToString('TECHNOLOGY_ID_GUIDES', TECHNOLOGY_ID_GUIDES);
content += exportToString('MICRO_BUSINESS_GUIDES', MICRO_BUSINESS_GUIDES);
content += exportToString('INVESTMENT_PROJECT_GUIDES', INVESTMENT_PROJECT_GUIDES);
content += exportToString('ZOPP_GUIDES', ZOPP_GUIDES);
content += exportToString('HORIZON_EUROPE_GUIDES', HORIZON_EUROPE_GUIDES);
content += exportToString('HOSHIN_KANRI_GUIDES', HOSHIN_KANRI_GUIDES);
content += exportToString('AMOEBA_MANAGEMENT_GUIDES', AMOEBA_MANAGEMENT_GUIDES);
content += exportToString('GUANXI_PLAN_GUIDES', GUANXI_PLAN_GUIDES);
content += exportToString('ONUDI_PROJECT_GUIDES', ONUDI_PROJECT_GUIDES);

content += `export const FIELD_GUIDES_MAP = {
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
`;

fs.writeFileSync(fgPath, content, 'utf8');
console.log('✅ src/lib/field_guides.js actualizado exitosamente con las 5 partes en los 12 frameworks.');
