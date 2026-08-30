# 📋 Catálogo Maestro de Módulos, Textboxes y Prompts por Modelo

Este documento contiene la matriz completa de todos los **12 Modelos / Frameworks Documentales**, sus Pilares, Módulos, Campos de Entrada (Textboxes) y la estructura de Prompts e Instrucciones que utiliza la IA para cada uno.

> [!NOTE]
> Cada campo cuenta con una **Instrucción Principal**, **Ejemplo de Redacción**, **Benchmark / Criterio** y **Cita Metodológica**, los cuales ahora son 100% editables y personalizables desde el nuevo **PromptEditor Drawer** y persistentes en el `PlanContext`.

---

## 📑 Resumen General de Modelos y Cobertura

| ID Framework | Nombre del Modelo | Campos (Textboxes) | Enfoque Metodológico Principal |
|--------------|-------------------|--------------------|--------------------------------|
| `business` | Plan de Negocios Comercial | 105 campos | Tradicional integral, finanzas completas, estudio de mercado y técnico. |
| `social_bid` | Proyecto Social (Metodología BID) | 48 campos | Matriz de Marco Lógico (MML), árbol de problemas/objetivos, gobernanza. |
| `agile_startup` | Agile Startup (Lean MVP) | 37 campos | Lean Startup, hipótesis críticas, validación de experimentos, runway/burn rate. |
| `technology_id` | Plan de Negocios de Base Tecnológica e Innovación (I+D) | 27 campos | TRL (Technology Readiness Level), patentes IPC, transferencia tecnológica. |
| `micro_business` | Plan para Microempresa y Autoempleo (Simplificado) | 20 campos | Plan ágil de 30 días, micro-canvas de 3 bloques, costos simplificados. |
| `investment_project` | Proyecto de Inversión (Ingeniería y Finanzas) | 16 campos | CAPEX CSI, WACC/VAN/TIR estocástico, análisis Tornado y Monte Carlo. |
| `zopp` | ZOPP / Marco Lógico (Enfoque Alemán-BID) | 4 campos | Matriz de Planificación de Proyectos (MPP 4x4), análisis de involucrados. |
| `horizon_europe` | Horizon Europe (Unión Europea) | 4 campos | Principio DNSH (Do No Significant Harm), ciencia abierta, consorcios I+D. |
| `hoshin_kanri` | Hoshin Kanri (Japón - Planificación Estratégica) | 4 campos | Matriz X, despliegue de políticas, Norte Verdadero. |
| `amoeba_management` | Amoeba Management (Kyocera - Micro-Ganancias) | 5 campos | Células autónomas, rentabilidad por hora por empleado, micro-P&L. |
| `guanxi_plan` | Metodología Guanxi (China - Redes de Relaciones) | 4 campos | Mianzi (prestigio/reputación), favores recíprocos, alineación estatal. |
| `onudi_project` | Estudio de Factibilidad ONUDI (Industrial Global) | 5 campos | FCFF, costo de capital ponderado, viabilidad técnica-industrial. |

---

## 1. 🏢 Modelo: Plan de Negocios Comercial (`business`)

### 🏛️ Pilar: Naturaleza del Proyecto (`naturaleza`)

#### 📦 Módulo: **Justificación y Origen** (`introduccion`)
_Origen, necesidad que cubre, modelo y propuesta de valor inicial._

**Boxes asociados:** `box_resumen_ejecutivo_1p`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Origen** | `origen` | Cuenta la historia de cómo surgió la idea. ¿Fue experiencia personal, un hueco en el mercado o una investigación? | Ej: "La idea nació cuando el fundador detectó que sus colegas perdían dinero por falta de educación financiera básica." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Necesidad** | `necesidad` | Define el dolor no resuelto o la necesidad urgente que atiende el negocio. | Ej: Falta de monitoreo en tiempo real genera pérdidas millonarias por paros no programados. | **Bench:** Dolor cuantificable en dinero o tiempo.<br/>**Cita:** *The Lean Startup (Ries, p. 45)* |
| **Modelo Negocio** | `modelo_negocio` | Explica cómo la empresa captura valor y asegura rentabilidad a largo plazo. | Ej: Modelo híbrido de venta de equipo + póliza de mantenimiento preventivo mensual. | **Bench:** Margen bruto objetivo > 40%.<br/>**Cita:** *Creating a Business Plan For Dummies (Ch. 3)* |
| **Propuesta Valor** | `propuesta_valor` | Enuncia la propuesta de valor nuclear con beneficios medibles y diferenciales. | Ej: Mantenimiento predictivo inteligente que incrementa 20% la vida útil del equipo. | **Bench:** 1 frase concisa + 3 métricas de beneficio.<br/>**Cita:** *Value Proposition Design (p. 28)* |

#### 📦 Módulo: **Identidad Corporativa** (`identidad`)
_Misión, Visión, Valores y concepto de marca._

**Boxes asociados:** `box_resumen_ejecutivo_1p`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Mision** | `mision` | Propósito fundamental de la empresa. ¿Para qué existes HOY? Debe ser concreta y orientada a la acción. | Ej (Estilo Google): "Democratizar la asesoría patrimonial en el noroeste de México mediante herramientas accesibles." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Vision** | `vision` | Aspiración a futuro (3-5 años). ¿Qué quieres lograr? Debe ser ambiciosa pero alcanzable. | Ej (Estilo Tesla): "Ser la firma de consultoría patrimonial #1 en Sonora para 2028, con más de 5,000 clientes activos." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Valores** | `valores` | Principios éticos que guían las decisiones del equipo. Lista 3-5 valores con una breve explicación de cada uno. | Ej (Estilo Netflix): "Transparencia: Cero comisiones ocultas. Accesibilidad: Planes desde $500/mes." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Imagen** | `imagen` | Define el concepto de marca, personalidad visual y percepción deseada. | Ej: Marca con enfoque industrial, tecnológico y de máxima confiabilidad. | **Bench:** Coherencia estética B2B.<br/>**Cita:** *Brand Positioning (Keller, p. 95)* |

#### 📦 Módulo: **Objetivos y Metas** (`objetivos`)
_Objetivos SMART a corto, mediano y largo plazo._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **General** | `general` | Objetivo macro del proyecto. Debe ser SMART: Específico, Medible, Alcanzable, Relevante, con Tiempo definido. | Ej: "Alcanzar 500 clientes activos y $2M MXN en activos bajo gestión dentro de los primeros 18 meses de operación." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Especificos** | `especificos` | Desglose del objetivo general en 3-5 metas tácticas. Cada una debe tener un indicador claro. | Ej: "1) Lanzar la plataforma digital en Q1. 2) Captar 50 clientes/mes vía redes sociales. 3) Obtener certificación AMIB." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Metas** | `metas` | Números concretos con fecha. Ventas, clientes, ingresos, participación de mercado, etc. | Ej: "Mes 6: 150 clientes. Mes 12: $800K ingresos. Mes 18: Punto de equilibrio. Mes 24: Expansión a Baja California." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Análisis FODA** (`foda`)
_Fortalezas, Oportunidades, Debilidades y Amenazas._

**Boxes asociados:** `box_swot_foda`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Fortalezas** | `fortalezas` | Ventajas internas que te diferencian de la competencia. Recursos, talento, tecnología propia. | Ej: "Equipo con certificación AMIB, plataforma digital propia, alianzas con 3 aseguradoras líderes." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Oportunidades** | `oportunidades` | Factores externos favorables que puedes aprovechar. Tendencias, vacíos de mercado, regulaciones nuevas. | Ej: "Crecimiento del 23% anual en inversiones digitales en México. Nueva ley de educación financiera obligatoria." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Debilidades** | `debilidades` | Limitaciones internas actuales. Sé honesto: falta de capital, equipo pequeño, marca nueva. | Ej: "Marca sin reconocimiento regional. Presupuesto de marketing limitado a $15K/mes. Solo 2 asesores certificados." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Amenazas** | `amenazas` | Riesgos externos que podrían afectarte. Competencia agresiva, cambios regulatorios, crisis económica. | Ej: "Entrada de fintechs internacionales (Betterment, GBM+). Volatilidad en tasas de interés de Banxico." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Entorno (PESTEL)** (`pestel`)
_Factores Políticos, Económicos, Sociales, Tecnológicos, etc._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Politico** | `politico` | Leyes, regulaciones, estabilidad gubernamental y políticas fiscales que impactan tu operación. | Ej: "La reforma fiscal 2025 exige facturación 4.0, lo cual beneficia la formalización de servicios de consultoría." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Economico** | `economico` | Inflación, tipo de cambio, poder adquisitivo, tasas de interés y ciclo económico actual. | Ej: "Inflación del 4.2% con tasa Banxico al 10.5%. Clase media sonorense con ingreso promedio de $18K mensuales." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Social** | `social` | Demografía, tendencias culturales, hábitos de consumo y nivel educativo de tu mercado. | Ej: "Generación millennial (30-40 años) en Hermosillo muestra interés creciente en finanzas personales según encuesta INEGI 2024." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Tecnologico** | `tecnologico` | Infraestructura digital disponible, innovaciones del sector y nivel de adopción tecnológica. | Ej: "Penetración de smartphones del 89% en Sonora. APIs bancarias abiertas permiten integración en tiempo real." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Ecologico** | `ecologico` | Impacto ambiental de tu operación y tendencias de sustentabilidad relevantes. | Ej: "Operación 100% digital sin oficina física reduce huella de carbono. Cumplimos NOM-161 de residuos electrónicos." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Legal** | `legal` | Marco jurídico que regula tu industria. Permisos, certificaciones y obligaciones legales. | Ej: "Requiere registro ante CNBV y cumplimiento de la Ley del Mercado de Valores. NDA obligatorio con cada cliente." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Marco Legal y Socios** (`legal`)
_Estructura legal, constitución y permisos requeridos._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Constitucion** | `constitucion` | Tipo de persona moral o física. Régimen fiscal elegido y justificación. | Ej: "S.A. de C.V. bajo régimen general de ley. Capital social de $50,000 MXN con 3 socios fundadores." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Socios** | `socios` | Lista de inversionistas, socios fundadores y su porcentaje de participación. | Ej: "Roberto Celis (40%), Ana García (30%), Luis Acosta (30%). Inversionista ángel: FundSonora ($200K MXN)." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Permisos** | `permisos` | Licencias y trámites necesarios para operar legalmente. Incluye tiempos estimados. | Ej: "Licencia municipal de Hermosillo (3 semanas). RFC con actividad 5411 (inmediato). Registro IMSS patronal (5 días)." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Modelo de Negocio Canvas** (`canvas`)
_El lienzo del modelo de negocios (9 bloques esenciales) para planificar estratégicamente._

**Boxes asociados:** `box_canvas_osterwalder`, `box_lean_canvas`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Socios Clave** | `socios_clave` | Lista los socios estratégicos, proveedores clave y aliados institucionales indispensables para operar. | Ej: Distribuidores autorizados de maquinaria, despachos contables y proveedores de nube. | **Bench:** Mínimo 3 alianzas críticas.<br/>**Cita:** *Alexander Osterwalder — Business Model Generation (p. 38)* |
| **Actividades Clave** | `actividades_clave` | Define las acciones operativas y de entrega neurálgicas que hacen funcionar la propuesta de valor. | Ej: Diagnóstico técnico, desarrollo de software, control de calidad y soporte 24/7. | **Bench:** Enfocadas a la entrega de valor.<br/>**Cita:** *Business Model Generation (p. 36)* |
| **Recursos Clave** | `recursos_clave` | Detalla los activos físicos, intelectuales, humanos y financieros indispensables. | Ej: Taller certificado, ingenieros seniors, servidores dedicados y fondo de maniobra. | **Bench:** Activos difícilmente imitables.<br/>**Cita:** *Business Model Generation (p. 34)* |
| **Propuestas Valor** | `propuestas_valor` | Redacta el paquete de productos y servicios que resuelven el dolor específico del cliente. | Ej: Reducción del 35% en costos correctivos y garantía de disponibilidad del 99%. | **Bench:** Diferenciación cuantificada.<br/>**Cita:** *Value Proposition Design (p. 18)* |
| **Relaciones Clientes** | `relaciones_clientes` | Define el tipo de relación e interacción con cada segmento (dedicada, automatizada, autoservicio). | Ej: Asistencia personalizada con ejecutivos de cuenta B2B y revisiones trimestrales. | **Bench:** Retención / Churn < 5% anual.<br/>**Cita:** *Business Model Generation (p. 30)* |
| **Canales** | `canales` | Establece los canales de comunicación, venta, distribución y postventa. | Ej: Venta directa consultiva B2B, portal web de pedidos y soporte vía app móvil. | **Bench:** Estrategia omnicanal.<br/>**Cita:** *Business Model Generation (p. 28)* |
| **Segmentos Clientes** | `segmentos_clientes` | Segmenta a los clientes por industria, volumen de compra, geografía y necesidades. | Ej: Empresas mineras medianas y grandes en el noroeste de México con maquinaria pesada. | **Bench:** Segmentación B2B por capacidad de compra.<br/>**Cita:** *Business Model Generation (p. 22)* |
| **Estructura Costos** | `estructura_costos` | Identifica los costos fijos y variables más significativos que sustentan la operación. | Ej: Nómina técnica (45%), refacciones (25%), renta y servicios (15%), marketing (15%). | **Bench:** Costos fijos < 45% del ingreso proyectado.<br/>**Cita:** *Business Model Generation (p. 40)* |
| **Fuentes Ingresos** | `fuentes_ingresos` | Describe los flujos y mecanismos de monetización (suscripciones, venta directa, comisiones). | Ej: 60% contratos anuales de mantenimiento recurrente, 40% servicios por evento. | **Bench:** Mínimo 50% de ingresos recurrentes (ARR).<br/>**Cita:** *Business Model Generation (p. 32)* |

### 🏛️ Pilar: El Mercado (`mercado`)

#### 📦 Módulo: **Análisis de Producto y Valor** (`analisis`)
_Descripción detallada del producto y beneficios._

**Boxes asociados:** `box_tam_sam_som`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Producto** | `producto` | Descripción técnica y funcional de tu producto o servicio. ¿Qué entregas exactamente? | Ej: "Plan patrimonial personalizado que incluye: diagnóstico financiero, portafolio de inversión y seguro de vida." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Valor** | `valor` | Tu promesa única al cliente. ¿Por qué te elegirían sobre la competencia? | Ej: "Asesoría sin conflicto de interés: cobramos honorarios fijos, no comisiones por producto vendido." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Demanda** | `demanda` | Evidencia de que existe un mercado real dispuesto a pagar. Datos duros, encuestas, tendencias. | Ej: "Según AMAFORE, solo 22% de trabajadores en Sonora tiene un plan de retiro privado. Encuesta propia: 78% de 200 encuestados pagaría por asesoría." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Cliente** | `cliente` | Perfil detallado de tu comprador ideal. Edad, ingreso, dolor principal, comportamiento. | Ej: "Profesionista de 28-42 años, ingreso $20-50K/mes, preocupado por su retiro, busca opciones digitales y transparentes." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Ciclo Vida** | `ciclo_vida` | Determina la fase del ciclo de vida de la industria y producto (introducción, crecimiento, madurez). | Ej: Industria en fase de crecimiento acelerado (18% CAGR) por electrificación minera. | **Bench:** Justificación con datos de mercado.<br/>**Cita:** *Competitive Strategy (Porter, p. 160)* |

#### 📦 Módulo: **Segmentación y Tamaño** (`segmentacion`)
_TAM, SAM, SOM y perfil del buyer persona._

**Boxes asociados:** `box_tam_sam_som`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Tam** | `tam` | Mercado Total Direccionable. Todo el mercado posible si no tuvieras limitaciones. | Ej: "3.2M de profesionistas en México que no tienen asesor financiero = $9.6B MXN anuales en fees potenciales." | **Bench:** TAM = Población Total x Gasto Anual Promedio.<br/>**Cita:** *Linda Pinson — Anatomy of a Business Plan (Ch. 4, p. 78)* |
| **Sam** | `sam` | Mercado Alcanzable. La porción del TAM que podrías servir con tu modelo actual. | Ej: "185,000 profesionistas en Sonora con ingreso >$20K/mes = $370M MXN anuales en servicios de consultoría." | **Bench:** SAM = TAM x Porcentaje de Segmento Geográfico / Económico.<br/>**Cita:** *Creating a Business Plan For Dummies (Ch. 5)* |
| **Som** | `som` | Mercado Obtenible. La rebanada realista que planeas capturar en 1-3 años. | Ej: "Capturar 0.5% del SAM = 925 clientes generando $5.5M MXN anuales en el tercer año." | **Bench:** SOM esperado: entre 1% y 5% del SAM en etapas tempranas.<br/>**Cita:** *The Lean Startup (p. 89) & Starting a Business QuickStart Guide (p. 112)* |
| **Perfil** | `perfil` | Características psicográficas: estilo de vida, valores, motivaciones y hábitos de compra. | Ej: "Valora la seguridad sobre el riesgo. Investiga en YouTube antes de comprar. Prefiere apps sobre llamadas telefónicas." | **Bench:** Persona validada con entrevistas.<br/>**Cita:** *Lean Customer Development* |
| **Sensibilidad Demanda** | `sensibilidad_demanda` | Evalúa la elasticidad precio de la demanda y el impacto de cambios económicos. | Ej: Demanda inelástica (Ep = -0.4) debido a que el servicio es crítico para evitar paros. | **Bench:** Elasticidad justificada.<br/>**Cita:** *The Nature of Value (Ch. 3)* |

#### 📦 Módulo: **Mapa de Calor y Densidad** (`mapa`)
_Visualización geográfica de la demanda y densidad de mercado._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Analisis Espacial** | `analisis_espacial` | Analiza la concentración territorial de clientes y competidores con datos geoespaciales (DENUE/INEGI). | Ej: Concentración del 62% del mercado en el corredor industrial norte de Hermosillo. | **Bench:** Densidad geográfica validada.<br/>**Cita:** *INEGI DENUE 2026* |

#### 📦 Módulo: **Análisis de Competencia** (`competencia`)
_Competidores directos, indirectos y ventaja competitiva._

**Boxes asociados:** `box_swot_foda`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Competidores** | `competidores` | Lista de competidores directos e indirectos con sus fortalezas y debilidades. | Ej: "Directos: GBM+ (digital, masivo), Actinver (premium). Indirectos: YouTube financiero, apps como Fintual." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Ventajas** | `ventajas` | Lo que te hace superior frente a cada competidor identificado. | Ej: "vs GBM+: Asesoría personalizada humana. vs Actinver: Accesibilidad (monto mínimo de $500 vs $100K)." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Benchmarking** (`benchmarking`)
_Comparativa estructurada contra líderes del mercado._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Comparativa** | `comparativa` | Tabla comparativa entre tu negocio y los líderes del sector en variables clave. | Ej: "Precio: Nosotros $500/mes vs Competidor A $2,000/mes. Personalización: Alta vs Media. Digital: 100% vs 40%." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Matriz** | `matriz` | Mapa visual donde posicionas tu marca frente a competidores en dos ejes estratégicos. | Ej: "Eje X: Precio (bajo-alto). Eje Y: Personalización (masivo-premium). Nosotros: precio bajo + alta personalización." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Estrategia de Comercialización** (`comercializacion`)
_Canales de distribución, marketing e identidad de ventas._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Distribucion** | `distribucion` | Cómo llega tu producto al cliente. Canales físicos, digitales, directos o intermediarios. | Ej: "Canal 1: App móvil propia (60%). Canal 2: Referidos de despachos contables (25%). Canal 3: Eventos empresariales (15%)." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Promocion** | `promocion` | Estrategia de comunicación para atraer clientes. Medios, presupuesto, frecuencia y métricas. | Ej: "Instagram Ads: $8K/mes, CTR esperado 2.5%. Webinars mensuales gratuitos. Programa de referidos: $500 por cliente nuevo." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Identidad** | `identidad` | Elementos visuales de la marca: logo, paleta de colores, tipografía, tono de comunicación. | Ej: "Logo: Escudo dorado minimalista. Colores: Azul marino (#1e3a5f) + dorado (#d4a543). Tono: Profesional pero cercano." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Canales Intermediarios** | `canales_intermediarios` | Detalla acuerdos comerciales con distribuidores, comisionistas o integradores. | Ej: Comisión del 8% a distribuidores autorizados de equipo por referir contratos MaaS. | **Bench:** Comisión < 12% del margen bruto.<br/>**Cita:** *Anatomy of a Business Plan (Ch. 4)* |

#### 📦 Módulo: **Plan de Ventas y Precios** (`ventas`)
_Estrategia de pricing y proyecciones de volumen._

**Boxes asociados:** `box_unit_economics`, `box_benchmark_cac_ltv`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Precios** | `precios` | Estrategia de fijación de precios. Método usado (costo+margen, competencia, valor percibido). | Ej: "Plan Básico: $500/mes. Plan Pro: $1,500/mes. Plan VIP: $3,500/mes. Basado en valor percibido con margen del 65%." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Estrategia** | `estrategia` | Tácticas de venta: embudo, ciclo de venta, guiones, CRM, seguimiento post-venta. | Ej: "Embudo: Contenido orgánico → Webinar gratuito → Consulta 1:1 → Cierre. Ciclo promedio: 14 días. CRM: HubSpot Free." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Proyeccion Volumen** | `proyeccion_volumen` | Estimación de unidades vendidas por mes/trimestre/año. Base el cálculo en datos reales. | Ej: "Mes 1-3: 15 clientes/mes. Mes 4-6: 30/mes. Mes 7-12: 50/mes. Año 2: 80/mes. Total año 1: 350 clientes." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Tacticas Precio** | `tacticas_precio` | Estrategias de pricing dinámico, descuentos por pronto pago o paquetes escalonados. | Ej: 5% descuento por pago anual anticipado en contratos de mantenimiento. | **Bench:** Optimización de flujo de caja.<br/>**Cita:** *The Lean Startup (p. 98)* |

### 🏛️ Pilar: Estudio Técnico de Producción (`tecnico`)

#### 📦 Módulo: **Localización y Ubicación** (`ubicacion`)
_Macro y micro localización del negocio._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Macro** | `macro` | Análisis de la región, estado o ciudad elegida. Justifica con datos económicos y logísticos. | Ej: "Hermosillo, Sonora: PIB estatal de $430B MXN. Hub de servicios financieros del noroeste. Aeropuerto internacional." | **Bench:** Datos INEGI/BANXICO.<br/>**Cita:** *Anatomy Ch.5* |
| **Micro** | `micro` | Ubicación exacta dentro de la ciudad. Colonia, calle, accesibilidad, competencia cercana. | Ej: "Col. Villa de Seris, Blvd. Rosales #245. A 5 min del centro financiero. Renta: $12K/mes. Estacionamiento para 8 autos." | **Bench:** Accesibilidad y costo.<br/>**Cita:** *Anatomy Ch.5* |
| **Local** | `local` | Distribución física del espacio de trabajo. Metros cuadrados, zonas y mobiliario. | Ej: "Oficina de 80m²: Recepción (15m²), 2 oficinas privadas (12m² c/u), sala de juntas (20m²), coworking (21m²)." | **Bench:** Eficiencia m²/persona.<br/>**Cita:** *QuickStart Ch.7* |

#### 📦 Módulo: **Operación y Procesos** (`operacion`)
_Diagrama de flujo de operaciones y tecnología._

**Boxes asociados:** `box_kpi_otd_dso_dio_ccc`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Proceso** | `proceso` | Explicación paso a paso de cómo se entrega el servicio o se fabrica el producto. | Ej: "1. Cliente agenda cita (app). 2. Diagnóstico financiero (1hr). 3. Diseño de portafolio (48hrs). 4. Presentación y firma. 5. Monitoreo mensual." | **Bench:** SLA por etapa.<br/>**Cita:** *Operations Management* |
| **Diagrama** | `diagrama` | Flujograma del proceso principal en formato Mermaid.js. Debe mostrar inicio, etapas y fin. | Ej: "graph TD → A[Prospecto] → B[Diagnóstico] → C[Propuesta] → D[Firma contrato] → E[Implementación] → F[Seguimiento]" | **Bench:** 5-7 nodos clave.<br/>**Cita:** *BPMN 2.0* |
| **Tecnologia** | `tecnologia` | Redacta con rigor metodológico, analítico y cuantitativo el campo tecnologia para el modelo Plan de Negocios Comercial. | Ejemplo corporativo específico para tecnologia en el sector seleccionado. | **Bench:** Alineado a mejores prácticas y fuentes oficiales.<br/>**Cita:** *Plan de Negocios Comercial — Guía Metodológica de Formulación* |
| **Economias Escala** | `economias_escala` | Explica cómo los costos unitarios decrecen a medida que aumenta el volumen de producción. | Ej: Compra de refacciones por contenedor reduce costo unitario en un 22%. | **Bench:** Reducción de costo marginal comprobable.<br/>**Cita:** *Competitive Strategy (Porter, p. 7)* |
| **Tipo Proceso** | `tipo_proceso` | Clasifica el tipo de manufactura o servicio (por proyecto, por lote, flujo continuo o células). | Ej: Producción híbrida: células de trabajo para diagnóstico y línea continua para maquinado. | **Bench:** Eficiencia OEE >= 85%.<br/>**Cita:** *Operations Management (Slack, p. 92)* |

#### 📦 Módulo: **Maquinaria y Tecnología** (`recursos`)
_Equipamiento, hardware y herramientas necesarias._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Maquinaria** | `maquinaria` | Listado de equipo especializado con marca, modelo, costo y vida útil estimada. | Ej: "2 MacBook Pro M3 ($45K c/u). 1 Servidor NAS Synology ($18K). Monitor 4K Dell ($12K). Total: $120K." | **Bench:** Vida útil 3-5 años.<br/>**Cita:** *Anatomy Ch.6* |
| **Equipo** | `equipo` | Mobiliario de oficina, vehículos y equipo de cómputo general. | Ej: "4 escritorios ejecutivos ($8K c/u). 6 sillas ergonómicas ($5K c/u). Proyector Epson ($15K). Total: $77K." | **Bench:** CAPEX mueble.<br/>**Cita:** *Anatomy Ch.6* |
| **Herramientas** | `herramientas` | Software, licencias, suscripciones y herramientas digitales necesarias. | Ej: "HubSpot CRM ($0). Suite Adobe ($600/mes). Zoom Pro ($250/mes). Dominio + hosting ($2K/año). Bloomberg Terminal ($24K/año)." | **Bench:** OPEX digital.<br/>**Cita:** *Burn p.67* |

#### 📦 Módulo: **Insumos y Proveedores** (`insumos`)
_Materias primas y cadena de suministro._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Materia Prima** | `materia_prima` | Insumos principales para operar. En servicios: materiales de soporte, plataformas, data. | Ej: "Datos de mercado (Reuters, $5K/mes). Papelería corporativa ($2K/mes). Bases de datos CNBV (gratuito)." | **Bench:** Stock seguridad 15 días.<br/>**Cita:** *SCM* |
| **Proveedores** | `proveedores` | Lista de proveedores clave con nombre, ubicación, condiciones de pago y alternativas. | Ej: "Proveedor 1: AWS (hosting, crédito de $1K). Proveedor 2: Imprenta GraficSon (30 días crédito). Alternativa: DigitalOcean." | **Bench:** ≥2 proveedores críticos.<br/>**Cita:** *Fisher* |
| **Compras** | `compras` | Política de adquisiciones: frecuencia, volumen mínimo, control de calidad, inventario de seguridad. | Ej: "Compras de papelería: mensual. Software: anual con descuento. Criterio: mínimo 3 cotizaciones. Pago a 30 días." | **Bench:** EOQ.<br/>**Cita:** *SCM* |

#### 📦 Módulo: **Capacidad e Inventarios** (`capacidad`)
_Capacidad instalada, manejo de stock y turnos._

**Boxes asociados:** `box_kpi_otd_dso_dio_ccc`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Instalada** | `instalada` | Redacta con rigor metodológico, analítico y cuantitativo el campo instalada para el modelo Plan de Negocios Comercial. | Ejemplo corporativo específico para instalada en el sector seleccionado. | **Bench:** Alineado a mejores prácticas y fuentes oficiales.<br/>**Cita:** *Plan de Negocios Comercial — Guía Metodológica de Formulación* |
| **Inventarios** | `inventarios` | Método de control de existencias (PEPS, UEPS, ABC) y software utilizado. | Ej: "Para servicios: Control de citas vía Calendly. Para productos: Método PEPS en Excel con alerta de stock mínimo." | **Bench:** Rotación >6x.<br/>**Cita:** *SCM* |
| **Mano Obra** | `mano_obra` | Personal necesario por área con perfil, cantidad, turno y tipo de contratación. | Ej: "2 asesores financieros (planta). 1 community manager (medio tiempo). 1 contador (outsourcing). 1 desarrollador (freelance)." | **Bench:** Productividad p/empleado.<br/>**Cita:** *Human Capital* |
| **Punto Reorden** | `punto_reorden` | Nivel mínimo de existencias de insumos que dispara automáticamente una nueva orden de compra. | Ej: "Mangueras de alta presión: Punto de reorden en 15 unidades (lead time de entrega de 5 días). Sellos hidráulicos: 50 sets." | **Bench:** ROP = d·L + SS.<br/>**Cita:** *SCM* |

#### 📦 Módulo: **Eficiencia Operativa** (`operativa`)
_Métricas de desempeño: OTD, Rotación, DSO, DPO y Ciclo de Efectivo._

**Boxes asociados:** `box_kpi_otd_dso_dio_ccc`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Otd** | `otd` | On-Time Delivery: Porcentaje de entregas o servicios ejecutados a tiempo respecto al compromiso. | Ej: "Meta OTD: 98.5% en contratos mineros Tier 1. Monitoreo semanal mediante sistema ERP." | **Bench:** OTD ≥95%.<br/>**Cita:** *QuickStart Ch.8* |
| **Rotacion** | `rotacion` | Rotación de Inventarios: Veces que se renueva el stock en un periodo determinado. | Ej: "Rotación objetivo: 6.0 veces al año (60 días de permanencia promedio en almacén)." | **Bench:** >4x.<br/>**Cita:** *SCM* |
| **Dso** | `dso` | Days Sales Outstanding: Días promedio de cobro a clientes corporativos. | Ej: "DSO objetivo: 45 días para mineras y 30 días para contratistas locales." | **Bench:** <45d.<br/>**Cita:** *QuickStart* |
| **Dpo** | `dpo` | Days Payable Outstanding: Días promedio de pago a proveedores clave. | Ej: "DPO negociado: 60 días con fabricantes OEM de mangueras y conexiones." | **Bench:** >45d.<br/>**Cita:** *SCM* |
| **Ccc** | `ccc` | Cash Conversion Cycle (Ciclo de Conversión de Efectivo): Días que toma convertir inventario en flujo de caja. | Ej: "CCC = Días Inventario (60) + DSO (45) - DPO (60) = 45 días de requerimiento de capital de trabajo." | **Bench:** <60d.<br/>**Cita:** *Brealey & Myers* |

#### 📦 Módulo: **Impacto Ambiental** (`ambiental`)
_Sostenibilidad, manejo de residuos y normatividad._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Impacto** | `impacto` | Efectos de tu operación en el medio ambiente. Consumo energético, residuos, emisiones. | Ej: "Oficina consume 450 kWh/mes. Operación digital reduce 80% de papel vs firma tradicional. Huella: 2.3 ton CO₂/año." | **Bench:** Huella <2 ton/empleado.<br/>**Cita:** *SEMARNAT NOM-161* |
| **Mitigacion** | `mitigacion` | Acciones concretas para reducir tu impacto ambiental. Metas y plazos. | Ej: "Meta 2025: 100% firmas digitales. 2026: Energía solar en oficina (-60% consumo). Reciclaje de e-waste con certificado." | **Bench:** Science Based Targets.<br/>**Cita:** *GRI* |
| **Normatividad** | `normatividad` | Leyes ambientales aplicables y tu nivel de cumplimiento actual. | Ej: "Cumplimos NOM-161-SEMARNAT (residuos electrónicos). Exentos de Licencia Ambiental por ser servicio de bajo impacto." | **Bench:** 100% cumplimiento.<br/>**Cita:** *LGEEPA* |

### 🏛️ Pilar: Organización y Finanzas (`organizacion`)

#### 📦 Módulo: **Estructura Organizativa** (`estructura`)
_Organigrama y descripción de puestos clave._

**Boxes asociados:** `box_unit_economics`, `box_benchmark_cac_ltv`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Organigrama Visual** | `organigrama_visual` | Código Mermaid.js que genera el organigrama del equipo jerárquicamente. | Ej: "graph TD → CEO → Dir. Financiero + Dir. Comercial → cada uno con sus subordinados" | **Bench:** 5-7 niveles máx.<br/>**Cita:** *Mintzberg* |
| **Puestos** | `puestos` | Redacta con rigor metodológico, analítico y cuantitativo el campo puestos para el modelo Plan de Negocios Comercial. | Ejemplo corporativo específico para puestos en el sector seleccionado. | **Bench:** Alineado a mejores prácticas y fuentes oficiales.<br/>**Cita:** *Plan de Negocios Comercial — Guía Metodológica de Formulación* |
| **Funciones** | `funciones` | Tabla de responsabilidades de cada puesto clave. Qué hace, a quién reporta, KPIs. | Ej: "Director Comercial: Captación de clientes, gestión de embudo, reporta a CEO. KPI: 50 clientes nuevos/mes." | **Bench:** RACI.<br/>**Cita:** *Human Capital* |
| **Puestos Lista** | `puestos_lista` | Matriz consolidada de capital humano, niveles salariales, prestaciones de ley (IMSS/ISN) y organigrama. | Ej: "14 puestos distribuidos en 4 Gerencias: Operaciones, Calidad/IoT, Finanzas y B2B, con costo patronal total de $5.6M MXN/año." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Gestión de Recursos Humanos** (`recursos_humanos`)
_Políticas de contratación, capacitación y sueldos._

**Boxes asociados:** `box_unit_economics`, `box_benchmark_cac_ltv`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Reclutamiento** | `reclutamiento` | Proceso de atracción y selección de talento. Fuentes, filtros y tiempos. | Ej: "Publicación en LinkedIn + OCC. Filtro: CV → Entrevista técnica → Caso práctico → Contratación. Tiempo: 3 semanas." | **Bench:** Time-to-hire <30d.<br/>**Cita:** *SHRM* |
| **Contratacion** | `contratacion` | Tipo de contrato, período de prueba, prestaciones y obligaciones patronales. | Ej: "Contrato indeterminado con 3 meses de prueba. Prestaciones de ley + seguro de gastos médicos mayores (6to mes)." | **Bench:** Rotación <15%.<br/>**Cita:** *LFT* |
| **Sueldos** | `sueldos` | Tabla salarial por puesto incluyendo sueldo bruto, neto, prestaciones y costo total. | Ej: "Asesor Jr: $15K bruto + comisiones. Asesor Sr: $25K + bono. Dir. Comercial: $40K + 2% de ventas totales." | **Bench:** Compensación mercado +10%.<br/>**Cita:** *Mercer* |

#### 📦 Módulo: **Inversión Inicial (CAPEX)** (`inversion`)
_Requerimientos de capital para arranque._

**Boxes asociados:** `box_wacc_van_tir`, `box_tornado_sensibilidad`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Inversion Fija** | `inversion_fija` | Activos tangibles no corrientes indispensables para la operación (bancos de prueba, vehículos, maquinaria). | Ej: "Taller central en Hermosillo ($4.5M), banco de pruebas hidráulicas ($2.5M), instrumental de telemetría IoT ($1.8M)." | **Bench:** CAPEX tangible >60% inversión.<br/>**Cita:** *Anatomy Ch.7* |
| **Inversion Diferida** | `inversion_diferida` | Activos intangibles y gastos pre-operativos (constitución legal, certificaciones ISO, software ERP). | Ej: "Certificación ISO 9001/4406 ($350K), constitución legal y patentes ($150K), licencias de software ($250K)." | **Bench:** <15% inversión.<br/>**Cita:** *Anatomy Ch.7* |
| **Opex Inicial** | `opex_inicial` | Capital necesario para cubrir gastos operativos mientras el negocio no genera ingresos suficientes. | Ej: "6 meses de nómina: $300K. Renta: $72K. Marketing: $48K. Servicios: $18K. Total capital de trabajo: $438K." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Financiamiento** | `financiamiento` | De dónde viene el dinero. Proporción de capital propio, préstamos e inversión externa. | Ej: "Capital propio: 60% ($430K). Crédito PyME Bancomext: 30% ($215K) a 5 años, tasa 12%. Inversionista ángel: 10% ($72K)." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Costos y Gastos (OPEX)** (`costos`)
_Estructura de costos fijos y variables mensuales._

**Boxes asociados:** `box_unit_economics`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Fijos** | `fijos` | Gastos que no cambian sin importar el volumen de ventas: renta, nómina, servicios, seguros. | Ej: "Renta: $12K. Nómina: $95K. Luz/Internet: $3K. Software: $5K. Contador: $8K. Total fijos: $123K/mes." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Variables** | `variables` | Gastos que cambian según el número de clientes o unidades producidas. | Ej: "Comisión por cliente: $200. Impresión de reportes: $50/cliente. Café y amenidades: $30/cita. Costo variable: $280/cliente." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Unitario** | `unitario` | Cálculo del costo total de atender a un solo cliente o producir una unidad. | Ej: "Costo fijo unitario: $123K ÷ 200 clientes = $615. Costo variable: $280. Costo total unitario: $895/cliente." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Estados Financieros** (`estados_financieros`)
_Proyecciones de resultados, balance y flujo._

**Boxes asociados:** `box_wacc_van_tir`, `box_tornado_sensibilidad`, `box_montecarlo_sim`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Resultados** | `resultados` | Proyección de ingresos menos gastos por mes/año. Muestra cuándo serás rentable. | Ej: "Año 1: Ingresos $1.2M - Gastos $1.8M = Pérdida ($600K). Año 2: Ingresos $3.6M - Gastos $2.1M = Utilidad $1.5M." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Balance** | `balance` | Foto financiera: Activos = Pasivos + Capital. Proyectado a 3-5 años. | Ej: "Año 1: Activos $710K \| Pasivos $430K \| Capital $280K. Año 3: Activos $2.8M \| Pasivos $180K \| Capital $2.62M." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Flujo Caja** | `flujo_caja` | Entradas y salidas de efectivo reales por mes. Crucial para no quedarte sin liquidez. | Ej: "Mes 1: Entrada $30K, Salida $150K, Saldo -$120K. Mes 6: Entrada $180K, Salida $135K, Saldo +$45K." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Amortizacion Creditos** | `amortizacion_creditos` | Tabla y estrategia de servicio de deuda: capital, tasa de interés, amortización y saldo insoluto. | Ej: "Crédito bancario de $5M MXN a 48 meses con tasa TIIE+3.5% fija, amortizaciones mensuales de $135K MXN." | **Bench:** DSCR >1.3x.<br/>**Cita:** *Brealey & Myers* |
| **Memorias Calculo** | `memorias_calculo` | Bases cuantitativas, supuestos de costos unitarios, tarifas por servicio y fórmulas de proyección. | Ej: "Tarifa MaaS: $68,000 MXN/mes por camión minero monitoreado. Costo marginal de reparación: $18,500 MXN." | **Bench:** Supuestos trazables.<br/>**Cita:** *ONUDI* |

#### 📦 Módulo: **Rentabilidad y Análisis** (`rentabilidad`)
_TIR, VPN, Punto de Equilibrio y ROI._

**Boxes asociados:** `box_wacc_van_tir`, `box_unit_economics`, `box_benchmark_cac_ltv`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Punto Equilibrio** | `punto_equilibrio` | Número de clientes o ventas necesarias para cubrir todos los costos. Fórmula: CF ÷ (PVU - CVU). | Ej: "$123K ÷ ($1,500 - $280) = 101 clientes/mes para cubrir costos. Meta: alcanzarlo en el mes 8." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Indicadores** | `indicadores` | VAN (Valor Actual Neto) y TIR (Tasa Interna de Retorno) del proyecto a 5 años. | Ej: "VAN a 5 años (tasa 12%): $1.8M MXN (positivo = viable). TIR: 34% (superior al costo de capital). Payback: 22 meses." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Relacion Bc** | `relacion_bc` | Relación Beneficio-Costo (B/C): Valor presente de beneficios dividido entre valor presente de costos. | Ej: "Relación B/C de 1.38 a tasa de descuento del 12%, lo que indica que por cada peso invertido se generan $1.38 MXN en valor presente." | **Bench:** B/C >1.2.<br/>**Cita:** *ONUDI* |

### 🏛️ Pilar: Simulador y Corridas (`simulador_financiero`)

#### 📦 Módulo: **Simulador Financiero** (`simulador`)
_Simulador interactivo avanzado con corridas dinámicas a 5 años._

**Boxes asociados:** `box_wacc_van_tir`, `box_montecarlo_sim`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Iframe Simulador** | `iframe_simulador` | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. | **Bench:** Intervalo de confianza al 95%.<br/>**Cita:** *The Nature of Value (Ch. 5)* |


## 2. 🚀 Modelo: Proyecto Social (Metodología BID) (`social_bid`)

### 🏛️ Pilar: Identificación del Problema (`identificacion`)

#### 📦 Módulo: **Análisis de Involucrados** (`involucrados`)
_Mapeo de actores, beneficiarios, aliados y oponentes._

**Boxes asociados:** `box_matriz_interes_poder`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Beneficiarios** | `beneficiarios` | ¿A quiénes ayuda exactamente este proyecto? (Población objetivo) | Ej: 500 jóvenes de 15 a 18 años en rezago educativo en la colonia X. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Aliados** | `aliados` | Instituciones, ONGs o líderes comunitarios que apoyarán el proyecto. | Ej: Fundación Y, Secretaría de Educación, Junta de Vecinos. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Oponentes** | `oponentes` | Actores que podrían oponerse al proyecto o verse afectados negativamente. | Ej: Sindicato de maestros locales (riesgo de rechazo por nuevos métodos). | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Matriz Interes** | `matriz_interes` | Clasificación de actores por su nivel de poder e interés en el proyecto. | Ej: Gobierno local (Alto Poder, Bajo Interés) -> Estrategia: Mantener informado. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Árbol de Problemas** (`arbol_problemas`)
_Identificación del problema central, sus causas (raíces) y efectos (ramas)._

**Boxes asociados:** `box_arbol_problemas_mml`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Problema Central** | `problema_central` | El problema público o social que busca resolverse (en negativo). | Ej: Alto índice de deserción escolar en educación media superior en la zona sur. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Causas Directas** | `causas_directas` | Por qué ocurre el problema central de manera inmediata. | Ej: 1. Falta de recursos económicos. 2. Desinterés por el currículo tradicional. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Causas Indirectas** | `causas_indirectas` | Causas subyacentes o de raíz que generan las causas directas. | Ej: Desempleo de los padres, falta de escuelas técnicas cercanas. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Efectos** | `efectos` | Consecuencias de que el problema no se resuelva. | Ej: Aumento de la delincuencia juvenil, empleos precarizados a futuro. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Diagrama Visual** | `diagrama_visual` | Código Mermaid.js para el Árbol de Problemas u Objetivos. Debe conectar causas o medios (abajo) con el problema/objetivo central (centro) y efectos o fines (arriba) usando flechas -->. | Ej: "flowchart TD<br>  CI[Causa Indirecta] --> CD[Causa Directa]<br>  CD --> PC[Problema Central]<br>  PC --> E1[Efecto 1]<br>  PC --> E2[Efecto 2]" | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Árbol de Objetivos** (`arbol_objetivos`)
_Conversión del problema en objetivo central, medios y fines._

**Boxes asociados:** `box_arbol_problemas_mml`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Objetivo Central** | `objetivo_central` | El problema central convertido en estado positivo alcanzado. | Ej: Reducida la deserción escolar en educación media superior en la zona sur. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Medios** | `medios` | Las soluciones (causas en positivo) para lograr el objetivo. | Ej: 1. Becas de transporte. 2. Talleres extracurriculares atractivos. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Fines** | `fines` | Los impactos a largo plazo (efectos en positivo). | Ej: Disminución de la delincuencia, mayor inserción laboral formal. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Diagrama Visual** | `diagrama_visual` | Código Mermaid.js para el Árbol de Problemas u Objetivos. Debe conectar causas o medios (abajo) con el problema/objetivo central (centro) y efectos o fines (arriba) usando flechas -->. | Ej: "flowchart TD<br>  CI[Causa Indirecta] --> CD[Causa Directa]<br>  CD --> PC[Problema Central]<br>  PC --> E1[Efecto 1]<br>  PC --> E2[Efecto 2]" | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Análisis de Alternativas** (`alternativas`)
_Estrategias posibles y selección de la alternativa óptima._

**Boxes asociados:** `box_arbol_problemas_mml`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Estrategias Posibles** | `estrategias_posibles` | Opciones de solución derivadas del árbol de objetivos. | Ej: Estrategia A (Becas económicas) vs Estrategia B (Creación de talleres técnicos). | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Criterios Seleccion** | `criterios_seleccion` | Criterios usados para elegir la mejor estrategia (costo, impacto, viabilidad). | Ej: Se eligió la Estrategia B por mayor sostenibilidad e impacto a largo plazo. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Alternativa Elegida** | `alternativa_elegida` | La estrategia final que conformará el proyecto. | Ej: Creación de 3 talleres técnicos extracurriculares con equipo donado. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Diseño del Proyecto (MML) (`diseno`)

#### 📦 Módulo: **Fin y Propósito** (`fin_proposito`)
_Impacto a largo plazo y objetivo específico del proyecto._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Fin** | `fin` | Impacto a largo plazo al que el proyecto contribuye. | Ej: Contribuir a la reducción de la pobreza y marginación urbana en 5 años. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Proposito** | `proposito` | El objetivo específico que el proyecto logrará (el objetivo central). | Ej: Jóvenes de 15-18 años completan capacitación técnica y se insertan laboralmente. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Indicadores Fin** | `indicadores_fin` | Cómo se medirá el impacto a largo plazo. | Ej: % de reducción de pobreza en la colonia en 5 años (Fuente: CONEVAL). | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Indicadores Proposito** | `indicadores_proposito` | Cómo se medirá el éxito inmediato del proyecto. | Ej: Al menos 300 jóvenes graduados en 12 meses, 40% con empleo a los 6 meses. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Componentes (Productos)** (`componentes`)
_Bienes o servicios que entregará el proyecto._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Lista Componentes** | `lista_componentes` | Bienes, servicios o productos tangibles que entrega el proyecto. | Ej: 1. Centro de cómputo equipado. 2. Manuales de robótica impresos. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Indicadores Componentes** | `indicadores_componentes` | Métricas de los productos entregados. | Ej: 20 computadoras instaladas operando. 500 manuales distribuidos. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Supuestos** | `supuestos` | Riesgos externos que DEBEN cumplirse para el éxito (fuera de control). | Ej: El gobierno mantiene el subsidio de luz. Los jóvenes no migran por violencia. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Actividades Clave** (`actividades`)
_Tareas necesarias para producir cada componente._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Descripcion Actividades** | `descripcion_actividades` | Las tareas necesarias para entregar los componentes. | Ej: Para el Componente 1: a) Cotizar equipos b) Comprar c) Instalar d) Probar. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Cronograma Macro** | `cronograma_macro` | Resumen de tiempos de las actividades principales. | Ej: Mes 1-2: Compras. Mes 3: Instalación. Mes 4-12: Talleres. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Sistema de Monitoreo** (`monitoreo`)
_Medios de verificación y línea base._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Medios Verificacion** | `medios_verificacion` | Dónde se buscarán los datos para comprobar los indicadores. | Ej: Listas de asistencia, registros de calificaciones, recibos de compra. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Linea Base** | `linea_base` | El estado del indicador antes del proyecto. | Ej: Actualmente 0 jóvenes capacitados. Deserción actual: 25%. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Frecuencia Medicion** | `frecuencia_medicion` | Cada cuánto se evaluarán los indicadores. | Ej: Asistencia: Semanal. Inserción laboral: Trimestral posterior al egreso. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Ejecución y Gobernanza (PM4R) (`ejecucion`)

#### 📦 Módulo: **Estructura de Gobernanza** (`gobernanza`)
_Directorio, comité ejecutor y roles._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Comite Directivo** | `comite_directivo` | Quién toma las decisiones macro del proyecto. | Ej: Mesa conformada por el Director de la ONG, un donante y un líder vecinal. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Unidad Ejecutora** | `unidad_ejecutora` | El equipo que opera el proyecto día a día. | Ej: 1 Coordinador, 3 profesores técnicos, 1 trabajador social. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Organigrama Visual** | `organigrama_visual` | Código Mermaid.js que genera el organigrama de gobernanza jerárquicamente. | Ej: "flowchart TD<br>  CD[Comité Directivo] --> UE[Unidad Ejecutora]<br>  UE --> C[Coordinador]<br>  UE --> T[Técnicos]" | **Bench:** 5-7 niveles máx.<br/>**Cita:** *Mintzberg* |

#### 📦 Módulo: **Estructura Desglosada (EDT)** (`edt`)
_División del trabajo y cronograma detallado._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Paquetes Trabajo** | `paquetes_trabajo` | Agrupación de actividades en bloques manejables (EDT). | Ej: Paquete 1: Infraestructura. Paquete 2: Currícula. Paquete 3: Difusión. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Hitos Principales** | `hitos_principales` | Momentos clave de éxito en el cronograma. | Ej: Hito 1: Aula terminada (Mes 3). Hito 2: Inicio de clases (Mes 4). | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Matriz de Riesgos** (`riesgos`)
_Identificación, probabilidad y mitigación de riesgos sociales/ambientales._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Riesgos Identificados** | `riesgos_identificados` | Posibles eventos que amenacen el proyecto (Sociales, Políticos, etc.). | Ej: Robo de equipo de cómputo en la escuela comunitaria. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Plan Mitigacion** | `plan_mitigacion` | Qué se hará para prevenir o reaccionar a esos riesgos. | Ej: Instalar protecciones de herrería y crear comité de vigilancia vecinal. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Matriz Probabilidad** | `matriz_probabilidad` | Clasificación de riesgos (Impacto x Probabilidad). | Ej: Robo (Probabilidad Alta, Impacto Alto) -> Prioridad Crítica. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Plan de Comunicaciones** (`comunicaciones`)
_Estrategia para mantener informados a los stakeholders._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Audiencias** | `audiencias` | Grupos clave que deben recibir información del avance. | Ej: Donantes (BID), Padres de familia, Autoridades educativas. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Canales** | `canales` | Medios a través de los cuales se enviará la información. | Ej: Reporte trimestral PDF para BID. Grupo de WhatsApp para padres. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Mensajes Clave** | `mensajes_clave` | Lo que se quiere comunicar a cada audiencia. | Ej: A los padres: "Su hijo está adquiriendo habilidades para el futuro". | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Presupuesto y Evaluación (`presupuesto`)

#### 📦 Módulo: **Presupuesto por Componentes** (`presupuesto_detallado`)
_Costo total desglosado por actividad y componente._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Costos Directos** | `costos_directos` | Dinero gastado directamente en la intervención social. | Ej: Pago a instructores ($150k), Computadoras ($200k), Materiales ($50k). | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Costos Indirectos** | `costos_indirectos` | Gastos de administración y logística (overhead). | Ej: Sueldo del director ($50k), Papelería de oficina ($10k), Contador ($15k). | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Fuentes Financiamiento** | `fuentes_financiamiento` | Quién aporta el dinero (donantes, contrapartida local, etc.). | Ej: BID aporta 70% ($350k). Contrapartida local en especie (local prestado) 30%. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Evaluación Ex-ante** (`evaluacion_exante`)
_Costo-Beneficio Social y análisis de costo-eficiencia._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Beneficios Sociales** | `beneficios_sociales` | Valorización monetaria del impacto (Ej. incremento de sueldo futuro). | Ej: Los graduados ganarán $30,000 extra al año. En 500 jóvenes = $15M anuales. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Tir Social** | `tir_social` | Tasa Interna de Retorno pero midiendo beneficios a la sociedad, no ganancias. | Ej: TIR Social estimada: 25% (muy superior a la tasa de descuento social del 10%). | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Vpn Social** | `vpn_social` | Valor Presente Neto de los beneficios sociales menos el costo del proyecto. | Ej: Valor Presente Neto Social: +$4.5 Millones a 5 años. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Estrategia de Sostenibilidad** (`sostenibilidad`)
_Cómo sobrevivirá el proyecto al terminar el financiamiento del BID._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Sostenibilidad Financiera** | `sostenibilidad_financiera` | Estrategia de ingresos propios, cuotas de recuperación o patrocinios para operar sin depender de fondos iniciales. | Ej: 40% ingresos por cuotas simbólicas de talleres vespertinos, 60% donaciones recurrentes. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Sostenibilidad Institucional** | `sostenibilidad_institucional` | Cómo se hará cargo de administrar el proyecto a futuro. | Ej: La asociación de padres asumirá el control directivo en el Año 3. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Apropiacion Comunitaria** | `apropiacion_comunitaria` | Cómo asegurar que la comunidad defienda y mantenga el proyecto. | Ej: Involucrar a los jóvenes en pintar y decorar el aula para generar sentido de pertenencia. | **Bench:** —<br/>**Cita:** *Field Guides Map* |


## 3. 🌐 Modelo: Agile Startup (Lean MVP) (`agile_startup`)

### 🏛️ Pilar: Validación y Lienzo (Lean Canvas) (`validacion`)

#### 📦 Módulo: **Lienzo Lean Canvas** (`canvas`)
_Los 9 bloques simplificados del modelo de negocios ágil para enfocar la propuesta de valor._

**Boxes asociados:** `box_lean_canvas`, `box_canvas_osterwalder`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Problema** | `problema` | Identifica los 3 principales problemas que resolverás para tu cliente. | Ej: 1. Falta de tiempo para cocinar sano. 2. Precios elevados de restaurantes saludables. 3. Poca variedad de comida a domicilio. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Segmentos Clientes** | `segmentos_clientes` | Define quiénes son tus adoptantes tempranos (Early Adopters) y tu mercado meta. | Ej: Profesionistas de 25-40 años que trabajan en oficinas corporativas y no tienen tiempo de cocinar. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Propuesta Valor** | `propuesta_valor` | Explica tu propuesta única de valor. ¿Por qué eres diferente y vale la pena prestarte atención? | Ej (Estilo Uber/Airbnb): Comida saludable gourmet preparada por chefs locales y entregada en menos de 20 minutos por suscripción. | **Bench:** 1 frase + 3 beneficios medibles.<br/>**Cita:** *Value Proposition Design (Osterwalder, p.28)* |
| **Solucion** | `solucion` | Describe las 3 características principales de tu solución o MVP. | Ej: 1. App móvil de pedidos express. 2. Menú rotativo de 5 platos diarios. 3. Red de micro-cocinas locales distribuidas. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Canales** | `canales` | ¿Cómo vas a dar a conocer y entregar tu solución a tus clientes? | Ej: Campañas de marketing local en Instagram, códigos de referido de oficina y entrega vía repartidores propios. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Flujos Ingresos** | `flujos_ingresos` | ¿Cómo ganarás dinero? Suscripción, venta directa, comisiones, publicidad. | Ej (Estilo Netflix/Spotify): Planes semanales de suscripción ($1,200 MXN/semana) y catering corporativo para eventos de oficina. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Estructura Costos** | `estructura_costos` | ¿Cuáles son tus costos fijos y variables más significativos para arrancar? | Ej: Costo de ingredientes (materia prima), comisión del procesador de pagos, y marketing digital de adquisición. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Metricas Clave** | `metricas_clave` | Métricas críticas que demuestran la salud y crecimiento de tu negocio. | Ej: Costo de Adquisición de Cliente (CAC), Tasa de Retención Semanal, y Valor de Vida del Cliente (LTV). | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Ventaja Especial** | `ventaja_especial` | ¿Qué tienes que no pueda ser copiado o comprado fácilmente? | Ej (Estilo Amazon Logistics): Algoritmo propio de ruteo y distribución que reduce tiempos de entrega a la mitad frente a UberEats. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Cliente y Empatía** (`buyer_persona`)
_Creación detallada del Buyer Persona o avatar de cliente y su mapa de empatía._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Avatar Cliente** | `avatar_cliente` | Detalla el perfil del Buyer Persona: edad, ocupación, metas e intereses. | Ej: Sandra, 32 años, gerente de marketing, soltera, apasionada del fitness pero trabaja 10 horas diarias. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Que Piensa** | `que_piensa` | ¿Qué pasa por la mente del cliente ideal? Sus deseos, preocupaciones y aspiraciones financieras/personales. | Ej: Piensa que debería comer mejor para cuidar su salud, pero le aburre preparar comida y le da pereza lavar platos. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Que Ve** | `que_ve` | ¿Qué observa en su entorno diario? Ofertas de la competencia, comportamiento de amigos, etc. | Ej: Ve que sus compañeros de oficina piden pizzas o comida rápida grasosa por falta de opciones saludables cerca. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Que Oye** | `que_oye` | ¿Qué le dicen sus amigos, familia o influenciadores que afecta su decisión? | Ej: Oye constantemente en podcasts de bienestar la importancia de la nutrición, y de sus amigas que preparar ensaladas toma mucho tiempo. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Que Dice Hace** | `que_dice_hace` | ¿Cómo se comporta y qué expresa en público el cliente? | Ej: Dice que quiere empezar la dieta el lunes, pero termina pidiendo comida rápida el miércoles debido a juntas de última hora. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Dolores** | `dolores` | Frustraciones, obstáculos y miedos del cliente. | Ej: Miedo a ganar peso, frustración de gastar demasiado en apps de delivery tradicionales con comida fría. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Necesidades** | `necesidades` | Lo que realmente desea conseguir o lograr el cliente. | Ej: Conveniencia extrema: comida rica, saludable, que llegue caliente y a un precio predecible. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Diseño de Experimentos y MVP (`experimento`)

#### 📦 Módulo: **Diseño del MVP** (`mvp_design`)
_Especificación técnica y operativa del Producto Mínimo Viable a construir._

**Boxes asociados:** `box_mvp_protocol`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Especificacion Mvp** | `especificacion_mvp` | Define de forma concreta qué funcionalidades o entregables incluirá la primera versión (MVP). | Ej: Una Landing Page sencilla en Webflow con botón de pago de Stripe para pre-vender el plan semanal, sin App móvil aún. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Recursos Construccion** | `recursos_construccion` | Lista de herramientas no-code, software y recursos mínimos requeridos. | Ej: Webflow para diseño, Stripe para pagos, Google Sheets para base de datos y un chef de cocina local contratado. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Tiempo Estimado Desarrollo** | `tiempo_estimado_desarrollo` | Duración estimada para el lanzamiento del piloto al mercado. | Ej: 3 semanas para diseño de Landing Page, pruebas de menú y lanzamiento de pauta en redes. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Hipótesis y Métricas** (`critical_hypotheses`)
_Identificación de las dos hipótesis más críticas de valor y crecimiento, y sus métricas._

**Boxes asociados:** `box_mvp_protocol`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Hipotesis Valor** | `hipotesis_valor` | La suposición crítica de por qué los clientes valorarán y usarán tu producto. | Ej: Los profesionistas están dispuestos a pagar una suscripción de $1,200/semana por no tener que planificar su comida. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Hipotesis Crecimiento** | `hipotesis_crecimiento` | La suposición crítica de cómo adquirirás clientes recurrentes a bajo costo. | Ej: Cada cliente activo recomendará el servicio a al menos 1 colega de su misma oficina en el primer mes. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Metrica Exito** | `metrica_exito` | Números específicos que validarán las hipótesis del experimento. | Ej: Conseguir 20 suscriptores de pago en las primeras 2 semanas de la preventa. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Canal Validacion** | `canal_validacion` | Dónde o cómo pondrás a prueba el experimento de tracción. | Ej: Publicaciones orgánicas en grupos locales de LinkedIn y distribución de flyers físicos en 3 torres corporativas. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Tracción y Aprendizaje (`aprendizaje`)

#### 📦 Módulo: **Resultados del Piloto** (`pilot_results`)
_Resultados cuantitativos y cualitativos obtenidos durante las pruebas con clientes reales._

**Boxes asociados:** `box_burn_runway`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Datos Traccion** | `datos_traccion` | Resumen de métricas reales de clientes, ventas o registros obtenidos. | Ej: 24 clientes pagaron la suscripción en la preventa, logrando $28,800 MXN en ventas brutas en 14 días. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Comentarios Early Adopters** | `comentarios_early_adopters` | Retroalimentación directa de los primeros usuarios de tu MVP. | Ej: "La comida es deliciosa y el empaque térmico es excelente, pero me gustaría poder elegir opciones sin gluten". | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Aprendizajes Clave** | `aprendizajes_clave` | Conclusiones principales que obtuviste del piloto práctico. | Ej: Validamos que hay intención de pago inmediata. Sin embargo, la logística de reparto requiere optimizar zonas. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Pivotar o Perseverar** (`pivot_persevere`)
_Decisión estratégica de negocio basada en datos reales de tracción para pivotar o seguir escalando._

**Boxes asociados:** `box_burn_runway`, `box_mvp_protocol`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Decision Estrategica** | `decision_estrategica` | Determina si continuarás con el plan actual (perseverar) o si realizarás un cambio de rumbo (pivotar). | Ej: Perseverar con el modelo de suscripción, pero pivotando el canal de distribución a un esquema de entrega concentrada por corporativo. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Justificacion Datos** | `justificacion_datos` | Justifica la decisión estratégica usando métricas reales del piloto. | Ej: El 85% de las quejas fueron por retrasos de reparto. Agrupar entregas por edificio reduce el costo logístico en 40%. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Siguientes Pasos** | `siguientes_pasos` | Plan de acción inmediato tras tomar la decisión estratégica. | Ej: 1. Integrar pasarela de pago recurrente. 2. Cerrar convenio de entrega con 2 corporativos. 3. Diseñar menú sin gluten. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Finanzas y Métricas Unitarias (`finanzas_agiles`)

#### 📦 Módulo: **Unit Economics** (`unit_economics`)
_Estructura detallada de costos e ingresos unitarios._

**Boxes asociados:** `box_unit_economics`, `box_benchmark_cac_ltv`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Cac Adquisicion** | `cac_adquisicion` | Costo de Adquisición de Cliente. ¿Cuánto dinero gastas en promedio para obtener un cliente de pago? | Ej: Gastamos $3,000 en anuncios y obtuvimos 15 clientes de pago = CAC de $200 MXN. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Ltv Vida Cliente** | `ltv_vida_cliente` | Valor del tiempo de vida del cliente. Ingresos estimados que un cliente generará antes de darse de baja. | Ej: Suscripción promedio dura 8 semanas a $1,200 MXN/semana = LTV de $9,600 MXN por cliente. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Margen Contribucion Unitario** | `margen_contribucion_unitario` | Ingreso unitario menos el costo variable unitario de entrega. | Ej: Precio del menú $200 - Ingredientes $70 - Entrega $40 = Margen de Contribución de $90 MXN (45%). | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Retorno Inversion Marketing** | `retorno_inversion_marketing` | Mide la eficiencia del gasto de marketing (LTV / CAC). Lo ideal es una relación mayor a 3. | Ej: LTV ($9,600) / CAC ($200) = Relación de 48x (Altamente rentable). | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Runway y Burn Rate** (`burn_rate`)
_Monitoreo de flujo mensual y supervivencia de caja._

**Boxes asociados:** `box_burn_runway`, `box_benchmark_cac_ltv`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Burn Rate Mensual** | `burn_rate_mensual` | Flujo de caja negativo neto promedio mensual (dinero consumido al mes). | — | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Runway Meses** | `runway_meses` | Meses de supervivencia con el capital disponible actual. Caja actual / Burn Rate. | Ej: Caja disponible $270,000 / Burn Rate $45,000 = 6 meses de Runway restante. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Capital Supervivencia** | `capital_supervivencia` | Monto de dinero mínimo en caja que se mantendrá como reserva estratégica. | Ej: Mantener un fondo de reserva de $90,000 MXN equivalente a 2 meses de operación. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Simulador y Corridas (`simulador_financiero`)

#### 📦 Módulo: **Simulador Financiero** (`simulador`)
_Simulador interactivo avanzado con corridas dinámicas y unit economics a 5 años._

**Boxes asociados:** `box_burn_runway`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Iframe Simulador** | `iframe_simulador` | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. | **Bench:** Intervalo de confianza al 95%.<br/>**Cita:** *The Nature of Value (Ch. 5)* |


## 4. 🔬 Modelo: Plan de Negocios de Base Tecnológica e Innovación (I+D) (`technology_id`)

### 🏛️ Pilar: Innovación y Propiedad Intelectual (`innovacion`)

#### 📦 Módulo: **Tecnología e Invención** (`tech_invention`)
_Descripción detallada de la tecnología, su novedad científica y nivel de maduración TRL (Technology Readiness Level)._

**Boxes asociados:** `box_trl_assessment`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Descripcion Tecnologia** | `descripcion_tecnologia` | Explica detalladamente en qué consiste la innovación tecnológica y sus componentes. | Ej (Estilo Nvidia/OpenAI): Algoritmo de visión artificial basado en redes neuronales convolucionales para control de calidad en tiempo real. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Novedad Cientifica** | `novedad_cientifica` | ¿Qué descubrimientos científicos, fórmulas o patentes previas sustentan tu desarrollo? | Ej: Patrón de optimización matemática patentado que reduce el procesamiento de imágenes en un 35%. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Nivel Trl** | `nivel_trl` | Nivel de Maduración Tecnológica (TRL 1 al 9). Clasifica el estado actual de tu desarrollo. | Ej: TRL 4: Validación de componentes tecnológicos en entorno de laboratorio. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Ventaja Tecnologica** | `ventaja_tecnologica` | ¿Por qué tu tecnología es sustancialmente mejor que las soluciones comerciales existentes? | Ej (Estilo Apple Silicon): Opera sin requerir conexión a internet y requiere 70% menos poder de cómputo que el competidor líder. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Propiedad Intelectual** (`property_intellectual`)
_Estrategia legal de registro de marcas, secretos industriales y patentes nacionales o internacionales._

**Boxes asociados:** `box_ipc_classifier`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Estado Del Arte** | `estado_del_arte` | Búsqueda sistemática de patentes y literatura científica para asegurar que no hay infracciones. | Ej: Búsqueda en USPTO y EPO localizando 3 patentes similares, diferenciándonos por la arquitectura de red ligera. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Estrategia Patentes** | `estrategia_patentes` | Plan legal para la solicitud de patentes, modelos de utilidad o protección de secretos industriales. | Ej: Registro de marca nacional en IMPI y solicitud de patente internacional vía tratado PCT en Q3. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Clasificacion Patentes Ipc** | `clasificacion_patentes_ipc` | Códigos de la Clasificación Internacional de Patentes (IPC) aplicables a tu desarrollo. | Ej: G06T 7/00 (Análisis de datos de imagen) y G06N 3/02 (Redes neuronales). | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Secretos Industriales** | `secretos_industriales` | Medidas de seguridad y acuerdos legales (NDA) para proteger el conocimiento no patentable. | Ej: Código fuente fragmentado en servidores seguros y contratos laborales con cláusulas estrictas de confidencialidad. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Estudio de Viabilidad Técnica (`viabilidad_tecnica`)

#### 📦 Módulo: **Ingeniería e I+D** (`technical_id`)
_Escalamiento técnico de laboratorio a planta piloto y especificaciones científicas de producción._

**Boxes asociados:** `box_trl_assessment`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Escalamiento Produccion** | `escalamiento_produccion` | Cómo se escalará la producción tecnológica desde el laboratorio a la producción en masa. | Ej: Migración de servidores de prueba locales a una arquitectura balanceada en la nube (AWS autoscaling). | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Infraestructura Cientifica** | `infraestructura_cientifica` | Equipos de laboratorio, licencias de software de simulación y herramientas especializadas necesarias. | Ej: Servidores dedicados GPU NVIDIA A100 y licencias de simulación MATLAB/Simulink. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Normativas Tecnicas Calidad** | `normativas_tecnicas_calidad` | Estándares internacionales obligatorios de la industria (ISO, NOM, etc.). | Ej: Cumplimiento de la norma ISO/IEC 27001 de seguridad de información y NOM-024-SCFI de hardware. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Prototipado y Pruebas** (`prototyping`)
_Cronograma y resultados de pruebas de concepto, maquetas físicas o prototipos alpha/beta._

**Boxes asociados:** `box_trl_assessment`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Especificaciones Prototipo** | `especificaciones_prototipo` | Detalla las características funcionales y físicas de tu prototipo actual. | Ej: Prototipo beta funcional en contenedor Docker con interfaz web React de diagnóstico básico. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Bitacora Pruebas** | `bitacora_pruebas` | Registros de las pruebas técnicas realizadas, errores detectados y correcciones aplicadas. | Ej: Pruebas de estrés de 1,000 peticiones concurrentes: latencia media 120ms, 0.01% de tasa de error. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Certificaciones Necesarias** | `certificaciones_necesarias` | Sellos de calidad, validaciones de laboratorios de terceros o permisos sanitarios indispensables. | Ej: Certificación de seguridad eléctrica por la UL (Underwriters Laboratories) para distribución en EE.UU. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Mercado Científico y Transferencia (`mercado_tecnologico`)

#### 📦 Módulo: **Mercado Tecnológico** (`tech_market`)
_Identificación de licenciatarios, análisis B2B o B2G, y alianzas estratégicas de co-desarrollo._

**Boxes asociados:** `box_ipc_classifier`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Clientes Industriales** | `clientes_industriales` | Perfil del comprador B2B, integrador tecnológico o dependencias de gobierno que adquirirán la tecnología. | Ej (Estilo TSMC/Intel B2B): Plantas ensambladoras automotrices Tier 1 que buscan automatizar sus líneas de ensamble. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **TamañO Mercado Tecnologico** | `tamaño_mercado_tecnologico` | TAM, SAM, SOM enfocados en licenciamiento o ventas corporativas. | Ej: SAM: 420 plantas maquiladoras en el norte de México con un valor estimado de mercado de $15M USD anuales. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Alianzas Codesarrollo** | `alianzas_codesarrollo` | Alianzas con centros de investigación, universidades o corporaciones para co-desarrollar o validar la tecnología. | Ej (Estilo MIT Media Lab): Convenio de co-desarrollo con el Instituto de Inteligencia Artificial de la Universidad de Sonora. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Modelo de Transferencia** (`transfer_model`)
_Esquema de monetización: cobro de royalties, cesión de patentes o constitución de spin-off._

**Boxes asociados:** `box_ipc_classifier`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Esquema Royalties** | `esquema_royalties` | Estructura de cobro de regalías: porcentaje sobre ventas, licenciamiento anual o pago por uso. | Ej (Estilo ARM): Licencia anual de software SaaS de $5,000 USD por línea de producción instalada + 1% de regalías por eficiencia. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Constitucion Spinoff** | `constitucion_spinoff` | Estrategia para crear una empresa independiente (spin-off) de base tecnológica desde la universidad o empresa madre. | Ej (Estilo Stanford Spin-offs): Transferencia del derecho de explotación de la patente universitaria a la Spin-Off a cambio de 10% de participación accionaria. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Estrategia Comercializacion Id** | `estrategia_comercializacion_id` | Modelo comercial de comercialización: venta directa, licenciamiento de patentes o consultoría tecnológica especializada. | Ej: Licenciamiento de la patente a distribuidores autorizados en Sudamérica y venta directa en México. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Impacto Social y Ecológico (RSE) (`responsabilidad_social`)

#### 📦 Módulo: **Responsabilidad Social (RSE)** (`rse_impact`)
_Evaluación del impacto ético, social y ambiental directo del desarrollo tecnológico._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Impacto Socioambiental** | `impacto_socioambiental` | Efectos directos e indirectos del uso de tu tecnología en la sociedad y el ecosistema. | Ej: Reducción de 20% en merma de producción disminuye la generación de residuos metálicos en 8 toneladas anuales. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Generacion Empleo Calificado** | `generacion_empleo_calificado` | Proyecciones de contratación de ingenieros, científicos, doctores o técnicos especializados. | Ej: Contratación de 4 desarrolladores de IA senior y 2 ingenieros de automatización con salarios competitivos en la región. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Politica Rse** | `politica_rse` | Principios éticos de la empresa de tecnología (ej. ética de inteligencia artificial, equidad de género en STEM). | Ej: Política estricta de no sesgo algorítmico y 40% de puestos técnicos ocupados por mujeres ingenieras. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Economía Circular** (`circular_economy`)
_Ecodiseño, ciclo de vida del producto tecnológico y manejo sostenible de insumos/residuos._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Analisis Ciclo Vida** | `analisis_ciclo_vida` | Evaluación del impacto del producto tecnológico desde la obtención de materia prima hasta su desecho final. | Ej: Diseño modular de hardware que facilita la sustitución de piezas individuales y reciclaje de baterías de litio. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Estrategia Economia Circular** | `estrategia_economia_circular` | Cómo reintegras materiales, reciclas dispositivos obsoletos o reduces el desperdicio electrónico. | Ej: Programa de recolección de sensores viejos a cambio de descuentos en la renovación del plan anual. | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Sustentabilidad Energetica** | `sustentabilidad_energetica` | Consumo de energía de tus servidores, oficinas y procesos de manufactura, y el uso de fuentes renovables. | Ej: 100% de la infraestructura en la nube está alojada en centros de datos con certificación de neutralidad de carbono. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Simulador y Corridas (`simulador_financiero`)

#### 📦 Módulo: **Simulador Financiero** (`simulador`)
_Simulador interactivo con proyecciones de I+D, VAN y TIR a 5 años._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Iframe Simulador** | `iframe_simulador` | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. | **Bench:** Intervalo de confianza al 95%.<br/>**Cita:** *The Nature of Value (Ch. 5)* |


## 5. 🏪 Modelo: Plan para Microempresa y Autoempleo (Simplificado) (`micro_business`)

### 🏛️ Pilar: Presentación Básica (`naturaleza`)

#### 📦 Módulo: **Sumario Ejecutivo** (`introduccion`)
_Idea del negocio y objetivo principal._

**Boxes asociados:** `box_apertura_30dias`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Idea Negocio** | `idea_negocio` | ¿Qué vas a vender o qué servicio vas a dar? Explícalo de forma sencilla. | Ej: "Voy a poner un puesto de tacos de carne asada por las noches frente al parque." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Objetivo Basico** | `objetivo_basico` | ¿Cuánto quieres vender o lograr en los primeros meses? | Ej: "Quiero vender al menos 50 órdenes diarias para sacar los gastos y mi sueldo." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Presentación de la Empresa** (`identidad`)
_Nombre, quiénes somos y qué ofrecemos._

**Boxes asociados:** `box_apertura_30dias`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Nombre** | `nombre` | Nombre de tu negocio. | Ej: "Tacos El Compadre" | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Quienes Somos** | `quienes_somos` | ¿Quiénes van a trabajar en el negocio y qué experiencia tienen? | Ej: "Mi esposa y yo. Yo trabajé 5 años en una taquería y ella sabe llevar las cuentas." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Que Ofrecemos** | `que_ofrecemos` | Tu producto estrella o servicio principal. | Ej: "Tacos, lorenzas y caramelos con tortillas hechas a mano y carne de calidad." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Mercadeo Simplificado (`mercado`)

#### 📦 Módulo: **¿A quién le vendemos?** (`clientes`)
_Quiénes son nuestros clientes y dónde están._

**Boxes asociados:** `box_apertura_30dias`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Perfil Cliente** | `perfil_cliente` | ¿Quiénes te van a comprar? Vecinos, trabajadores, estudiantes. | Ej: "Vecinos de la colonia y personas que regresan del trabajo después de las 7 PM." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Ubicacion Clientes** | `ubicacion_clientes` | ¿De dónde vienen tus clientes? | Ej: "Principalmente de la colonia Modelo y colonias aledañas (radio de 2 km)." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **La Competencia Local** (`competencia`)
_Quién más hace lo mismo cerca de nosotros._

**Boxes asociados:** `box_apertura_30dias`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Competidores Locales** | `competidores_locales` | ¿Quién más vende lo mismo cerca de ti? | Ej: "Hay un puesto de hot dogs a la vuelta y una pizzería a dos cuadras." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Nuestra Ventaja** | `nuestra_ventaja` | ¿Por qué te van a comprar a ti en vez de a ellos? | Ej: "Mis salsas son caseras, uso tortilla recién hecha y atiendo muy rápido." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Precios y Promoción** (`comercializacion`)
_Cómo calculamos el precio y cómo nos damos a conocer._

**Boxes asociados:** `box_apertura_30dias`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Lista Precios** | `lista_precios` | Precio de tus productos principales. | Ej: "Taco: $35. Caramelo: $70. Refresco: $25." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Como Promocionamos** | `como_promocionamos` | ¿Cómo vas a conseguir clientes? | Ej: "Pondré una lona luminosa grande, repartiré volantes en la colonia y abriré una página de Facebook." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Producción y Operaciones (`tecnico`)

#### 📦 Módulo: **¿Cómo trabajamos?** (`operacion`)
_Paso a paso de lo que hacemos en un día normal._

**Boxes asociados:** `box_apertura_30dias`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Paso A Paso Diario** | `paso_a_paso_diario` | ¿Cómo es un día normal de trabajo desde que compras hasta que cierras? | Ej: "1. A las 9 AM compro la carne y verduras. 2. A las 2 PM pico y marino la carne. 3. A las 5 PM pongo el carbón y arreglo las mesas. 4. De 6 PM a 12 AM atiendo clientes. 5. Limpieza." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Equipos y Herramientas** (`recursos`)
_Lo que necesitamos comprar o tener para empezar._

**Boxes asociados:** `box_apertura_30dias`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Herramientas Necesarias** | `herramientas_necesarias` | Lista de equipo pesado o herramientas clave. | Ej: "Asador grande, carreta de acero, hielera, mesas, sillas y una lona." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Materiales Basicos** | `materiales_basicos` | Lo que compras seguido para poder vender. | Ej: "Carne, tortillas, verduras, carbón, servilletas y refrescos." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Croquis del Local** (`croquis`)
_Distribución física del espacio de trabajo._

**Boxes asociados:** `box_micro_canvas_3b`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Descripcion Espacio** | `descripcion_espacio` | ¿Dónde te vas a ubicar y cuánto mide el lugar? | Ej: "En la banqueta de mi casa, ocupando un espacio de 3x4 metros." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Distribucion Areas** | `distribucion_areas` | ¿Cómo acomodarás las cosas? | Ej: "La carreta de frente a la calle, la hielera a un lado del cajero y 4 mesas acomodadas en escuadra." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Plan Financiero Básico (`organizacion`)

#### 📦 Módulo: **¿Cuánto ocupamos para iniciar?** (`inversion`)
_Dinero necesario para arrancar el negocio._

**Boxes asociados:** `box_apertura_30dias`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Total Inversion** | `total_inversion` | ¿Cuánto dinero ocupas para arrancar el primer día? | Ej: "Ocupo $15,000 para comprar la carreta usada, $3,000 de permisos y $2,000 de mandado." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **De Donde Sale** | `de_donde_sale` | ¿Quién pondrá el dinero o de dónde se pedirá? | Ej: "Tengo ahorrados $10,000 y pediré $10,000 de préstamo familiar." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Gastos de cada mes** (`costos`)
_Lista de pagos fijos como luz, agua, renta y sueldos._

**Boxes asociados:** `box_micro_canvas_3b`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Lista Gastos Mensuales** | `lista_gastos_mensuales` | Pagos fijos mes a mes (renta, luz, ayudante). | Ej: "Pago de luz $500, permiso de piso $1,000, sueldo del ayudante $4,000 al mes." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Costos Por Producto** | `costos_por_producto` | ¿Cuánto te cuesta hacer un producto y en cuánto lo vendes? | Ej: "Hacer un taco me cuesta $15 (carne+tortilla+salsa) y lo vendo a $35. Ganancia: $20." | **Bench:** —<br/>**Cita:** *Field Guides Map* |


## 6. 🏗️ Modelo: Proyecto de Inversión (Ingeniería y Finanzas) (`investment_project`)

### 🏛️ Pilar: Estudio de Mercado Cuantitativo (`mercado_cuantitativo`)

#### 📦 Módulo: **Análisis de Demanda** (`demanda`)
_Datos duros, elasticidad y comportamiento histórico._

**Boxes asociados:** `box_tam_sam_som`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Demanda Historica** | `demanda_historica` | Análisis histórico de la demanda con datos duros y series de tiempo. | Ej: "La demanda de energía en la región noroeste creció 4.5% anual de 2018 a 2024 (Fuente: CENACE)." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Elasticidad** | `elasticidad` | Cálculo de la elasticidad precio-demanda o sensibilidad del consumo ante variables macroeconómicas. | Ej: "Elasticidad precio de -0.8; la demanda es relativamente inelástica ante incrementos tarifarios." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Proyección de Oferta** (`oferta`)
_Modelos de proyección para oferta, déficit y demanda futura._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Proyeccion Oferta** | `proyeccion_oferta` | Modelo econométrico de cómo se comportará la oferta y demanda en los próximos 10-20 años. | Ej: "Se proyecta un déficit de 1,200 MW para 2030 debido al retiro de plantas de carbón." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Ingeniería del Proyecto (`ingenieria_tecnica`)

#### 📦 Módulo: **Ingeniería Básica** (`ingenieria`)
_Diseño macro, tecnología y memorias de cálculo._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Ingenieria Basica** | `ingenieria_basica` | Descripción técnica de nivel macro (planos conceptuales, tecnología seleccionada). | Ej: "Planta fotovoltaica de 50 MW con paneles bifaciales monocristalinos y seguidores de un eje." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Memoria Calculo** | `memoria_calculo` | Resumen de las memorias de cálculo de ingeniería civil, estructural y electromecánica. | Ej: "Cálculo estructural para resistir ráfagas de viento de 150 km/h según normativa CFE 2024." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Instalaciones y Lay-out** (`layout`)
_Distribución física, terreno y obras._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Layout Industrial** | `layout_industrial` | Distribución física (Lay-out), requerimientos de terreno y obras de preparación. | Ej: "Terreno de 100 hectáreas con compactación tipo B. Subestación elevadora en el cuadrante noreste." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Presupuesto Base de Obra (CAPEX) (`presupuesto_obra`)

#### 📦 Módulo: **Catálogo y Costos** (`presupuesto`)
_Catálogo de conceptos y explosión de insumos físicos._

**Boxes asociados:** `box_capex_csi_table`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Catalogo Conceptos** | `catalogo_conceptos` | Listado exhaustivo de todas las partidas de obra y equipamiento. | Ej: "Partida 1: Terracerías. Partida 2: Cimentación. Partida 3: Montaje electromecánico." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Explosion Insumos** | `explosion_insumos` | Resumen cuantitativo de los insumos físicos más relevantes a adquirir. | Ej: "120,000 paneles solares de 600W, 400 toneladas de acero estructural, 25 inversores centrales." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Cronograma Físico-Financiero** (`cronograma`)
_Avance de obra vs. desembolso de capital mensual._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Cronograma Fisico Financiero** | `cronograma_fisico_financiero` | Calendario de ejecución de obra cruzado con los desembolsos de capital requeridos. | Ej: "Mes 1-3: Ingeniería 10% del CAPEX. Mes 4-8: Procura 60%. Mes 9-12: Construcción 30%." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Estructura de Capital (`estructura_capital`)

#### 📦 Módulo: **Costo de Capital (WACC)** (`capital`)
_Cálculo del Costo Promedio Ponderado de Capital._

**Boxes asociados:** `box_wacc_van_tir`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Wacc** | `wacc` | Cálculo del Costo Promedio Ponderado de Capital (WACC / CPPC). | Ej (Estilo BlackRock): "WACC del 11.5% asumiendo 40% Equity (costo 15%) y 60% Deuda (costo 9.1%)." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Apalancamiento y Deuda** (`deuda`)
_Estructura del crédito y amortizaciones._

**Boxes asociados:** `box_wacc_van_tir`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Apalancamiento** | `apalancamiento` | Estructura de la deuda: bancos involucrados, plazos, tasas y garantías. | Ej (Estilo JP Morgan): "Crédito Sindicado a 15 años. Tasa SOFR + 3.5%. Garantía prendaria sobre los equipos." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Servicio Deuda** | `servicio_deuda` | Tabla de amortización proyectada, pagos de capital e intereses (DSCR). | Ej: "DSCR mínimo esperado de 1.45x durante los primeros 5 años de operación." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Riesgo Matemático y Sensibilidad (`riesgo_matematico`)

#### 📦 Módulo: **Análisis de Sensibilidad** (`sensibilidad`)
_Sensibilidad unidimensional y multivariable._

**Boxes asociados:** `box_tornado_sensibilidad`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Sensibilidad Unidimensional** | `sensibilidad_unidimensional` | Tornado de sensibilidad: cómo cambia la TIR si se altera una sola variable crítica (ej. CAPEX o Precio). | Ej: "Si el costo del acero sube 20%, la TIR del proyecto baja de 14.5% a 12.1%." | **Bench:** —<br/>**Cita:** *Field Guides Map* |
| **Escenarios** | `escenarios` | Análisis de escenarios consolidados: Caso Base, Caso Pesimista y Caso Optimista. | Ej: "Caso Pesimista (Retraso de obra de 6 meses + inflación 8%): El proyecto mantiene VAN positivo." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Simulación de Riesgo** (`probabilidad`)
_Simulación probabilística tipo Monte Carlo._

**Boxes asociados:** `box_montecarlo_sim`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Simulacion Montecarlo** | `simulacion_montecarlo` | Resultados de simulación probabilística (iteraciones) sobre la viabilidad del proyecto. | Ej (Estilo Goldman Sachs): "Tras 10,000 iteraciones, existe un 92% de probabilidad de que la TIR supere el WACC (11.5%)." | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Simulador y Corridas (`simulador_financiero`)

#### 📦 Módulo: **Simulador Financiero** (`simulador`)
_Simulador interactivo avanzado con corridas dinámicas de inversión a 5 años._

**Boxes asociados:** `box_wacc_van_tir`, `box_montecarlo_sim`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Iframe Simulador** | `iframe_simulador` | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. | **Bench:** Intervalo de confianza al 95%.<br/>**Cita:** *The Nature of Value (Ch. 5)* |


## 7. 🎯 Modelo: ZOPP / Marco Lógico (Enfoque Alemán-BID) (`zopp`)

### 🏛️ Pilar: Análisis de la Situación (`analisis_situacion`)

#### 📦 Módulo: **Matriz de Participación** (`participacion`)
_Identificación de involucrados._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Matriz Participacion** | `matriz_participacion` | Análisis de involucrados, sus intereses y problemas percibidos. | Ej: Comunidad local (Alta influencia, Alto impacto). | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Árbol de Problemas** (`problemas`)
_Análisis de causas y efectos._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Analisis Problemas** | `analisis_problemas` | Árbol de problemas enfocándose en la causa raíz moderada. | Ej: Alta incidencia de enfermedades gastrointestinales. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Matriz de Planificación (MPP) (`planificacion_mpp`)

#### 📦 Módulo: **Árbol de Objetivos** (`objetivos`)
_De problemas a soluciones._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Analisis Objetivos** | `analisis_objetivos` | Conversión de problemas a estados positivos alcanzables. | Ej: Reducción del 50% en enfermedades gastrointestinales. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Matriz Lógica** (`matriz_logica`)
_Resumen narrativo y supuestos._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Mpp** | `mpp` | Matriz de Planificación del Proyecto (equivalente a Marco Lógico). | Ej: Objetivo general, propósito, resultados, actividades. | **Bench:** —<br/>**Cita:** *Field Guides Map* |


## 8. 🧬 Modelo: Horizon Europe (Unión Europea) (`horizon_europe`)

### 🏛️ Pilar: Excelencia y Ciencia Abierta (`excelencia_cientifica`)

#### 📦 Módulo: **Consorcio** (`consorcio`)
_Estructura de partners._

**Boxes asociados:** `box_dnsh_ue_6`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Consorcio Multinacional** | `consorcio_multinacional` | Estructura de partners internacionales y división de roles científicos. | Ej (Estilo Airbus/BioNTech): Instituto Fraunhofer (Líder WP1-I+D), SAP (WP2-Software). | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Open Science** (`ciencia_abierta`)
_Plan de gestión de datos._

**Boxes asociados:** `box_dnsh_ue_6`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Open Science** | `open_science` | Plan de gestión de datos FAIR y diseminación en repositorios abiertos. | Ej (Estilo CERN): Publicación de datasets de simulación en Zenodo con licencia CC-BY. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Impacto y Sostenibilidad (`impacto_sostenibilidad`)

#### 📦 Módulo: **Principio DNSH** (`dnsh_principle`)
_No causar daño significativo._

**Boxes asociados:** `box_dnsh_ue_6`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Dnsh** | `dnsh` | Principio Do No Significant Harm. Demostrar que el proyecto no daña ninguno de los 6 objetivos medioambientales. | Ej (Estilo Northvolt): El proceso de reciclaje reduce 80% emisiones de CO2 sin generar efluentes tóxicos. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Impacto Global** (`impacto`)
_Impacto más allá del estado del arte._

**Boxes asociados:** `box_dnsh_ue_6`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Excelencia** | `excelencia` | Impacto más allá del estado del arte. | Ej: Eficiencia cuántica 20% superior al referente actual comercializado por IBM. | **Bench:** —<br/>**Cita:** *Field Guides Map* |


## 9. 🤝 Modelo: Hoshin Kanri (Japón - Planificación Estratégica) (`hoshin_kanri`)

### 🏛️ Pilar: Visión y Breakthroughs (`vision_largo_plazo`)

#### 📦 Módulo: **True North** (`norte_verdadero`)
_Visión a largo plazo._

**Boxes asociados:** `box_matriz_x_hoshin`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **True North** | `true_north` | Visión a 10 años. El propósito inalterable de la organización. | Ej (Estilo Toyota/Honda): "Cero emisiones y cero colisiones para 2040". | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Breakthroughs** (`disrupcion`)
_Objetivos disruptivos._

**Boxes asociados:** `box_matriz_x_hoshin`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Breakthroughs** | `breakthroughs` | Objetivos disruptivos anuales que cambian el status quo. | Ej (Estilo Nissan): Reducir el tiempo de ensamble de baterías de 4 horas a 45 minutos. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Alineación y Ejecución (`alineacion_ejecucion`)

#### 📦 Módulo: **Matriz X** (`matriz_x`)
_Despliegue de objetivos._

**Boxes asociados:** `box_matriz_x_hoshin`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Matriz X** | `matriz_x` | Herramienta que alinea visión a largo plazo, objetivos anuales, iniciativas y métricas. | Ej (Estilo Sony): Eje Sur (Iniciativa: Lente 8K) conectado con Eje Este (KPI: Reducir costo 15%). | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Bowler Charts** (`seguimiento`)
_Revisión visual._

**Boxes asociados:** `box_matriz_x_hoshin`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Bowler** | `bowler` | Indicadores de revisión visual mensual. | Ej: Gráfico de semáforo Andon para la línea de producción de motores. | **Bench:** —<br/>**Cita:** *Field Guides Map* |


## 10. 🏭 Modelo: Amoeba Management (Kyocera - Micro-Ganancias) (`amoeba_management`)

### 🏛️ Pilar: Estructuración (`estructuracion_celulas`)

#### 📦 Módulo: **Mapeo de Células** (`celulas`)
_Centros de ganancia independientes._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Mapeo Celulas** | `mapeo_celulas` | División de la empresa en micro-centros de ganancia independientes. | Ej (Estilo Kyocera/Alibaba): Dividir operaciones en 50 células (Ej. Amoeba de Servidores, Amoeba de Logística). | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Filosofía** (`filosofia_corp`)
_Alineación de valores._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Filosofia** | `filosofia` | Alineación de los miembros de la célula con los valores nucleares. | Ej (Estilo Inamori/Jack Ma): "Hacer lo correcto como ser humano" y priorizar al cliente antes que al accionista. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Economía Interna (`economia_interna`)

#### 📦 Módulo: **Precios de Transferencia** (`precios`)
_Ventas entre células._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Precios Transferencia** | `precios_transferencia` | Cómo una célula le "vende" internamente a otra. | Ej: Amoeba de Diseño le cobra $50 USD la hora a Amoeba de Manufactura por el plano CAD. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Rentabilidad por Hora** (`rentabilidad`)
_Cálculo de utilidad._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Rentabilidad Hora** | `rentabilidad_hora` | Cálculo de la utilidad generada dividida por las horas trabajadas. | Ej: Rentabilidad por hora = (Ingreso Amoeba - Costos no laborales) / Total Horas del equipo. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Simulador de Células (`simulador_financiero`)

#### 📦 Módulo: **Simulador Financiero** (`simulador`)
_Simulador de rentabilidad por hora y micro-ganancias amoeba._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Iframe Simulador** | `iframe_simulador` | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. | **Bench:** Intervalo de confianza al 95%.<br/>**Cita:** *The Nature of Value (Ch. 5)* |


## 11. ⚖️ Modelo: Metodología Guanxi (China - Redes de Relaciones) (`guanxi_plan`)

### 🏛️ Pilar: Conexiones y Estado (`redes_estado`)

#### 📦 Módulo: **Mapa de Relaciones** (`mapa_relacional`)
_Conexiones estratégicas._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Mapa Relaciones** | `mapa_relaciones` | Mapeo de conexiones estratégicas con el Estado y otros partners clave. | Ej (Estilo Tencent/Baidu): Alianza estratégica con el Ministerio de Tecnología Provincial y Universidades Estatales. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Plan Quinquenal** (`alineacion_estado`)
_Alineación con el Estado._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Alineacion Quinquenal** | `alineacion_quinquenal` | Cómo el proyecto apoya los objetivos del Plan Quinquenal del Estado. | Ej: Apoya directamente el plan "Made in China 2025" en el sector de Semiconductores. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Reciprocidad y Armonía (`manejo_conflictos`)

#### 📦 Módulo: **Reciprocidad** (`favores`)
_Beneficios mutuos._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Reciprocidad** | `reciprocidad` | Estrategia de favores y beneficios mutuos a largo plazo. | Ej (Estilo Huawei): Transferencia de tecnología 5G a cambio de acceso preferencial a redes municipales. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Armonía (Mianzi)** (`mianzi`)
_Resolución de conflictos._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Armonia** | `armonia` | Manejo de conflictos para mantener el respeto y "salvar la cara" (Mianzi). | Ej: Resolución privada de disputas (Joint Ventures) sin litigios públicos. | **Bench:** —<br/>**Cita:** *Field Guides Map* |


## 12. 🇪🇺 Modelo: Estudio de Factibilidad ONUDI (Industrial Global) (`onudi_project`)

### 🏛️ Pilar: Ingeniería (`ingenieria_industrial`)

#### 📦 Módulo: **Ingeniería Base** (`tecnologia`)
_Origen y viabilidad._

**Boxes asociados:** —

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Ingenieria Base** | `ingenieria_base` | Tecnología elegida, origen y pruebas de viabilidad técnica industrial. | Ej: Línea de extrusión continua con tecnología alemana, TRL 9. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Evaluación Financiera Global (`financiamiento_global`)

#### 📦 Módulo: **WACC ONUDI** (`costo_capital`)
_Costo de capital internacional._

**Boxes asociados:** `box_fcff_onudi_model`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Wacc Onudi** | `wacc_onudi` | Costo Promedio Ponderado de Capital detallado con tasas internacionales. | Ej: RFR 4%, Beta 1.2, ERP 6%. WACC = 11.2%. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **FCFF** (`flujo_firma`)
_Flujo de caja para la firma._

**Boxes asociados:** `box_fcff_onudi_model`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Fcff** | `fcff` | Flujo de Caja Libre para la Firma (Free Cash Flow to the Firm). | Ej: FCFF proyectado al año 5: $2.5M USD. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

#### 📦 Módulo: **Sensibilidad** (`riesgo`)
_Análisis de riesgo global._

**Boxes asociados:** `box_fcff_onudi_model`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Sensibilidad Riesgo** | `sensibilidad_riesgo` | Simulación de riesgo (Monte Carlo) sobre variables críticas. | Ej: Variación de precios de acero de +/- 20% no destruye el VPN. | **Bench:** —<br/>**Cita:** *Field Guides Map* |

### 🏛️ Pilar: Simulador y Factibilidad (`simulador_financiero`)

#### 📦 Módulo: **Simulador Financiero** (`simulador`)
_Simulador cuantitativo de factibilidad industrial ONUDI a 5 años._

**Boxes asociados:** `box_fcff_onudi_model`

| Campo / Textbox | Clave | Instrucción del Prompt | Ejemplo / Guía | Benchmark / Cita |
|---|---|---|---|---|
| **Iframe Simulador** | `iframe_simulador` | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. | **Bench:** Intervalo de confianza al 95%.<br/>**Cita:** *The Nature of Value (Ch. 5)* |

---

*Generado: 2026-08-30T08:09:48.698Z — 279 textboxes en 12 modelos — Fuente: `FRAMEWORKS` + `FIELD_GUIDES_MAP` + `MODULE_BOX_MAP` (108 entradas) — **279 textboxes, ~27 boxes**. Cada prompt es editable en 5 campos (Instrucción/Ejemplo/Benchmark/Cita/Placeholder) vía PromptEditor Drawer.*
