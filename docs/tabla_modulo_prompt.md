# Tabla Módulo → Textbox → Prompt — 12 Modelos

> **Generado:** 2026-09-07T06:01:11.750Z — **Fuente:** `src/config/frameworks.js` + `src/lib/field_guides.js` + `src/config/moduleBoxMap.js`
> **Textboxes totales:** se calculan abajo · Cada campo ya está **dividido en 5 textboxes** en `PromptEditor.jsx` (Instrucción / Ejemplo / Benchmark / Cita / Placeholder) — no es un solo textbox.


## Resumen por modelo

| # | Modelo (`projectType`) | Nombre | Pilares | Módulos | Textboxes |
|---|-------------------------|--------|---------|---------|------------|
| 1 | `business` | Plan de Negocios Comercial | 5 | 30 | 113 |
| 2 | `social_bid` | Proyecto Social (Metodología BID) | 4 | 16 | 53 |
| 3 | `agile_startup` | Agile Startup (Lean MVP) | 5 | 11 | 45 |
| 4 | `technology_id` | Plan de Negocios de Base Tecnológica e Innovación (I+D) | 5 | 11 | 36 |
| 5 | `micro_business` | Plan para Microempresa y Autoempleo (Simplificado) | 4 | 11 | 25 |
| 6 | `investment_project` | Proyecto de Inversión (Ingeniería y Finanzas) | 6 | 14 | 30 |
| 7 | `zopp` | ZOPP / Marco Lógico (Enfoque Alemán-BID) | 4 | 8 | 16 |
| 8 | `horizon_europe` | Horizon Europe (Unión Europea) | 3 | 8 | 16 |
| 9 | `hoshin_kanri` | Hoshin Kanri (Japón - Planificación Estratégica) | 3 | 8 | 16 |
| 10 | `amoeba_management` | Amoeba Management (Kyocera - Micro-Ganancias) | 4 | 8 | 14 |
| 11 | `guanxi_plan` | Metodología Guanxi (China - Redes de Relaciones) | 3 | 8 | 16 |
| 12 | `onudi_project` | Estudio de Factibilidad ONUDI (Industrial Global) | 3 | 8 | 14 |

**TOTAL TEXTBOXES:** **394**

---

## Leyenda

- **Textbox** = `field key` (un `<textarea>` o editor). En `PromptEditor.jsx:91` se abre como Drawer con 5 pestañas.
- **Prompt** = `instruccion` (antes `desc`) de `field_guides.js`. Cita/benchmark vienen de los 13 libros (ver `libros/INDICE_PROMPTS_BOXES.md`).
- **Box** = herramienta metodológica (`boxRegistry`/`moduleBoxMap`) que aparece **dentro** del módulo, no como módulo. Filtrado por `getBoxIdsForModule(moduleKey, projectType)`.


---

## Plan de Negocios Comercial — `business`

### Pilar: Naturaleza del Proyecto — `naturaleza`

#### Módulo: Justificación y Origen — `introduccion` · _Origen, necesidad que cubre, modelo y propuesta de valor inicial._

**Boxes asociados:** `box_resumen_ejecutivo_1p`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `origen` | texto | Cuenta la historia de cómo surgió la idea. ¿Fue experiencia personal, un hueco en el mercado o una investigación? | Ej: "La idea nació cuando el fundador detectó que sus colegas perdían dinero por falta de educación financiera básica." |
| `necesidad` | texto | Define el dolor no resuelto o la necesidad urgente que atiende el negocio. | Ej: Falta de monitoreo en tiempo real genera pérdidas millonarias por paros no programados. |
| `modelo_negocio` | texto | Explica cómo la empresa captura valor y asegura rentabilidad a largo plazo. | Ej: Modelo híbrido de venta de equipo + póliza de mantenimiento preventivo mensual. |
| `propuesta_valor` | texto | Enuncia la propuesta de valor nuclear con beneficios medibles y diferenciales. | Ej: Mantenimiento predictivo inteligente que incrementa 20% la vida útil del equipo. |

#### Módulo: Identidad Corporativa — `identidad` · _Misión, Visión, Valores y concepto de marca._

**Boxes asociados:** `box_resumen_ejecutivo_1p`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `mision` | texto | Propósito fundamental de la empresa. ¿Para qué existes HOY? Debe ser concreta y orientada a la acción. | Ej (Estilo Google): "Democratizar la asesoría patrimonial en el noroeste de México mediante herramientas accesibles." |
| `vision` | texto | Aspiración a futuro (3-5 años). ¿Qué quieres lograr? Debe ser ambiciosa pero alcanzable. | Ej (Estilo Tesla): "Ser la firma de consultoría patrimonial #1 en Sonora para 2028, con más de 5,000 clientes activos." |
| `valores` | texto | Principios éticos que guían las decisiones del equipo. Lista 3-5 valores con una breve explicación de cada uno. | Ej (Estilo Netflix): "Transparencia: Cero comisiones ocultas. Accesibilidad: Planes desde $500/mes." |
| `imagen` | texto | Define el concepto de marca, personalidad visual y percepción deseada. | Ej: Marca con enfoque industrial, tecnológico y de máxima confiabilidad. |

#### Módulo: Objetivos y Metas — `objetivos` · _Objetivos SMART a corto, mediano y largo plazo._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `general` | texto | Objetivo macro del proyecto. Debe ser SMART: Específico, Medible, Alcanzable, Relevante, con Tiempo definido. | Ej: "Alcanzar 500 clientes activos y $2M MXN en activos bajo gestión dentro de los primeros 18 meses de operación." |
| `especificos` | texto | Desglose del objetivo general en 3-5 metas tácticas. Cada una debe tener un indicador claro. | Ej: "1) Lanzar la plataforma digital en Q1. 2) Captar 50 clientes/mes vía redes sociales. 3) Obtener certificación AMIB." |
| `metas` | texto | Números concretos con fecha. Ventas, clientes, ingresos, participación de mercado, etc. | Ej: "Mes 6: 150 clientes. Mes 12: $800K ingresos. Mes 18: Punto de equilibrio. Mes 24: Expansión a Baja California." |

#### Módulo: Análisis FODA — `foda` · _Fortalezas, Oportunidades, Debilidades y Amenazas._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `fortalezas` | texto | Ventajas internas que te diferencian de la competencia. Recursos, talento, tecnología propia. | Ej: "Equipo con certificación AMIB, plataforma digital propia, alianzas con 3 aseguradoras líderes." |
| `oportunidades` | texto | Factores externos favorables que puedes aprovechar. Tendencias, vacíos de mercado, regulaciones nuevas. | Ej: "Crecimiento del 23% anual en inversiones digitales en México. Nueva ley de educación financiera obligatoria." |
| `debilidades` | texto | Limitaciones internas actuales. Sé honesto: falta de capital, equipo pequeño, marca nueva. | Ej: "Marca sin reconocimiento regional. Presupuesto de marketing limitado a $15K/mes. Solo 2 asesores certificados." |
| `amenazas` | texto | Riesgos externos que podrían afectarte. Competencia agresiva, cambios regulatorios, crisis económica. | Ej: "Entrada de fintechs internacionales (Betterment, GBM+). Volatilidad en tasas de interés de Banxico." |

#### Módulo: Entorno (PESTEL) — `pestel` · _Factores Políticos, Económicos, Sociales, Tecnológicos, etc._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `politico` | texto | Leyes, regulaciones, estabilidad gubernamental y políticas fiscales que impactan tu operación. | Ej: "La reforma fiscal 2025 exige facturación 4.0, lo cual beneficia la formalización de servicios de consultoría." |
| `economico` | texto | Inflación, tipo de cambio, poder adquisitivo, tasas de interés y ciclo económico actual. | Ej: "Inflación del 4.2% con tasa Banxico al 10.5%. Clase media sonorense con ingreso promedio de $18K mensuales." |
| `social` | texto | Demografía, tendencias culturales, hábitos de consumo y nivel educativo de tu mercado. | Ej: "Generación millennial (30-40 años) en Hermosillo muestra interés creciente en finanzas personales según encuesta INEGI 2024." |
| `tecnologico` | texto | Infraestructura digital disponible, innovaciones del sector y nivel de adopción tecnológica. | Ej: "Penetración de smartphones del 89% en Sonora. APIs bancarias abiertas permiten integración en tiempo real." |
| `ecologico` | texto | Impacto ambiental de tu operación y tendencias de sustentabilidad relevantes. | Ej: "Operación 100% digital sin oficina física reduce huella de carbono. Cumplimos NOM-161 de residuos electrónicos." |
| `legal` | texto | Marco jurídico que regula tu industria. Permisos, certificaciones y obligaciones legales. | Ej: "Requiere registro ante CNBV y cumplimiento de la Ley del Mercado de Valores. NDA obligatorio con cada cliente." |

#### Módulo: Marco Legal y Socios — `legal` · _Estructura legal, constitución y permisos requeridos._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `constitucion` | texto | Tipo de persona moral o física. Régimen fiscal elegido y justificación. | Ej: "S.A. de C.V. bajo régimen general de ley. Capital social de $50,000 MXN con 3 socios fundadores." |
| `socios` | texto | Lista de inversionistas, socios fundadores y su porcentaje de participación. | Ej: "Roberto Celis (40%), Ana García (30%), Luis Acosta (30%). Inversionista ángel: FundSonora ($200K MXN)." |
| `permisos` | texto | Licencias y trámites necesarios para operar legalmente. Incluye tiempos estimados. | Ej: "Licencia municipal de Hermosillo (3 semanas). RFC con actividad 5411 (inmediato). Registro IMSS patronal (5 días)." |

#### Módulo: Modelo de Negocio Canvas — `canvas` · _El lienzo del modelo de negocios (9 bloques esenciales) para planificar estratégicamente._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `socios_clave` | texto | Lista los socios estratégicos, proveedores clave y aliados institucionales indispensables para operar. | Ej: Distribuidores autorizados de maquinaria, despachos contables y proveedores de nube. |
| `actividades_clave` | texto | Define las acciones operativas y de entrega neurálgicas que hacen funcionar la propuesta de valor. | Ej: Diagnóstico técnico, desarrollo de software, control de calidad y soporte 24/7. |
| `recursos_clave` | texto | Detalla los activos físicos, intelectuales, humanos y financieros indispensables. | Ej: Taller certificado, ingenieros seniors, servidores dedicados y fondo de maniobra. |
| `propuestas_valor` | texto | Redacta el paquete de productos y servicios que resuelven el dolor específico del cliente. | Ej: Reducción del 35% en costos correctivos y garantía de disponibilidad del 99%. |
| `relaciones_clientes` | texto | Define el tipo de relación e interacción con cada segmento (dedicada, automatizada, autoservicio). | Ej: Asistencia personalizada con ejecutivos de cuenta B2B y revisiones trimestrales. |
| `canales` | texto | Establece los canales de comunicación, venta, distribución y postventa. | Ej: Venta directa consultiva B2B, portal web de pedidos y soporte vía app móvil. |
| `segmentos_clientes` | texto | Segmenta a los clientes por industria, volumen de compra, geografía y necesidades. | Ej: Empresas mineras medianas y grandes en el noroeste de México con maquinaria pesada. |
| `estructura_costos` | texto | Identifica los costos fijos y variables más significativos que sustentan la operación. | Ej: Nómina técnica (45%), refacciones (25%), renta y servicios (15%), marketing (15%). |
| `fuentes_ingresos` | texto | Describe los flujos y mecanismos de monetización (suscripciones, venta directa, comisiones). | Ej: 60% contratos anuales de mantenimiento recurrente, 40% servicios por evento. |

### Pilar: El Mercado — `mercado`

#### Módulo: Análisis de Producto y Valor — `analisis` · _Descripción detallada del producto y beneficios._

**Boxes asociados:** `box_tam_sam_som`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `producto` | texto | Descripción técnica y funcional de tu producto o servicio. ¿Qué entregas exactamente? | Ej: "Plan patrimonial personalizado que incluye: diagnóstico financiero, portafolio de inversión y seguro de vida." |
| `valor` | texto | Tu promesa única al cliente. ¿Por qué te elegirían sobre la competencia? | Ej: "Asesoría sin conflicto de interés: cobramos honorarios fijos, no comisiones por producto vendido." |
| `demanda` | texto | Evidencia de que existe un mercado real dispuesto a pagar. Datos duros, encuestas, tendencias. | Ej: "Según AMAFORE, solo 22% de trabajadores en Sonora tiene un plan de retiro privado. Encuesta propia: 78% de 200 encuestados pagaría por asesoría." |
| `ventaja_diferencial` | texto | Define la ventaja competitiva sostenible y diferenciador clave que hace que tu producto o servicio sea difícilmente imitable por los competidores. | Ej: "Algoritmo de matching predictivo propietario con 40% menor latencia y convenios de exclusividad regional con proveedores clave." |

#### Módulo: Segmentación y Tamaño — `segmentacion` · _TAM, SAM, SOM y perfil del buyer persona._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `tam` | texto | Mercado Total Direccionable. Todo el mercado posible si no tuvieras limitaciones. | Ej: "3.2M de profesionistas en México que no tienen asesor financiero = $9.6B MXN anuales en fees potenciales." |
| `sam` | texto | Mercado Alcanzable. La porción del TAM que podrías servir con tu modelo actual. | Ej: "185,000 profesionistas en Sonora con ingreso >$20K/mes = $370M MXN anuales en servicios de consultoría." |
| `som` | texto | Mercado Obtenible. La rebanada realista que planeas capturar en 1-3 años. | Ej: "Capturar 0.5% del SAM = 925 clientes generando $5.5M MXN anuales en el tercer año." |
| `perfil` | texto | Características psicográficas: estilo de vida, valores, motivaciones y hábitos de compra. | Ej: "Valora la seguridad sobre el riesgo. Investiga en YouTube antes de comprar. Prefiere apps sobre llamadas telefónicas." |
| `sensibilidad_demanda` | texto | Evalúa la elasticidad precio de la demanda y el impacto de cambios económicos. | Ej: Demanda inelástica (Ep = -0.4) debido a que el servicio es crítico para evitar paros. |

#### Módulo: Métricas Pirata AARRR — `metricas_aarrr` · _Embudo cuantitativo: Adquisición, Activación, Retención, Referidos e Ingresos._

**Boxes asociados:** `box_aarrr_pirata_5metricas`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `adquisicion_aarrr` | texto | Métrica y canales para atraer prospectos calificados al embudo. | Ej: Costo por lead de $45 MXN vía campañas de LinkedIn y búsqueda orgánica. |
| `activacion_aarrr` | texto | Momento 'Aha!' donde el usuario experimenta el valor del producto por primera vez. | Ej: Registro completo y primera cotización generada en menos de 3 minutos. |
| `retencion_aarrr` | texto | Frecuencia con la que los clientes regresan a usar o comprar el producto. | Ej: Recompra mensual del 78% en cuentas restauranteras HORECA. |
| `referidos_aarrr` | texto | Coeficiente viral y tasa con la que los clientes recomiendan a nuevos usuarios. | Ej: Coeficiente viral K = 0.35 impulsado por programa de descuento cruzado. |
| `ingresos_aarrr` | texto | Monetización y valor promedio de compra (Ticket promedio y Lifetime Value). | Ej: Ingreso promedio mensual por cuenta de $18,500 MXN con LTV a 24 meses de $380,000 MXN. |

#### Módulo: Mapa de Calor y Densidad — `mapa` · _Visualización geográfica de la demanda y densidad de mercado._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `analisis_espacial` | texto | Analiza la concentración territorial de clientes y competidores con datos geoespaciales (DENUE/INEGI). | Ej: Concentración del 62% del mercado en el corredor industrial norte de Hermosillo. |

#### Módulo: Análisis de Competencia — `competencia` · _Competidores directos, indirectos y ventaja competitiva._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `competidores` | texto | Lista de competidores directos e indirectos con sus fortalezas y debilidades. | Ej: "Directos: GBM+ (digital, masivo), Actinver (premium). Indirectos: YouTube financiero, apps como Fintual." |
| `ventajas` | texto | Lo que te hace superior frente a cada competidor identificado. | Ej: "vs GBM+: Asesoría personalizada humana. vs Actinver: Accesibilidad (monto mínimo de $500 vs $100K)." |

#### Módulo: Benchmarking — `benchmarking` · _Comparativa estructurada contra líderes del mercado._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `comparativa` | texto | Tabla comparativa entre tu negocio y los líderes del sector en variables clave. | Ej: "Precio: Nosotros $500/mes vs Competidor A $2,000/mes. Personalización: Alta vs Media. Digital: 100% vs 40%." |
| `matriz` | texto | Mapa visual donde posicionas tu marca frente a competidores en dos ejes estratégicos. | Ej: "Eje X: Precio (bajo-alto). Eje Y: Personalización (masivo-premium). Nosotros: precio bajo + alta personalización." |

#### Módulo: Estrategia de Comercialización — `comercializacion` · _Canales de distribución, marketing e identidad de ventas._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `distribucion` | texto | Cómo llega tu producto al cliente. Canales físicos, digitales, directos o intermediarios. | Ej: "Canal 1: App móvil propia (60%). Canal 2: Referidos de despachos contables (25%). Canal 3: Eventos empresariales (15%)." |
| `promocion` | texto | Estrategia de comunicación para atraer clientes. Medios, presupuesto, frecuencia y métricas. | Ej: "Instagram Ads: $8K/mes, CTR esperado 2.5%. Webinars mensuales gratuitos. Programa de referidos: $500 por cliente nuevo." |
| `identidad` | texto | Elementos visuales de la marca: logo, paleta de colores, tipografía, tono de comunicación. | Ej: "Logo: Escudo dorado minimalista. Colores: Azul marino (#1e3a5f) + dorado (#d4a543). Tono: Profesional pero cercano." |
| `canales_intermediarios` | texto | Detalla acuerdos comerciales con distribuidores, comisionistas o integradores. | Ej: Comisión del 8% a distribuidores autorizados de equipo por referir contratos MaaS. |

#### Módulo: Plan de Ventas y Precios — `ventas` · _Estrategia de pricing y proyecciones de volumen._

**Boxes asociados:** `box_unit_economics`, `box_benchmark_cac_ltv`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `precios` | texto | Estrategia de fijación de precios. Método usado (costo+margen, competencia, valor percibido). | Ej: "Plan Básico: $500/mes. Plan Pro: $1,500/mes. Plan VIP: $3,500/mes. Basado en valor percibido con margen del 65%." |
| `estrategia` | texto | Tácticas de venta: embudo, ciclo de venta, guiones, CRM, seguimiento post-venta. | Ej: "Embudo: Contenido orgánico → Webinar gratuito → Consulta 1:1 → Cierre. Ciclo promedio: 14 días. CRM: HubSpot Free." |
| `proyeccion_volumen` | texto | Estimación de unidades vendidas por mes/trimestre/año. Base el cálculo en datos reales. | Ej: "Mes 1-3: 15 clientes/mes. Mes 4-6: 30/mes. Mes 7-12: 50/mes. Año 2: 80/mes. Total año 1: 350 clientes." |
| `tacticas_precio` | texto | Estrategias de pricing dinámico, descuentos por pronto pago o paquetes escalonados. | Ej: 5% descuento por pago anual anticipado en contratos de mantenimiento. |

#### Módulo: Inteligencia de Mercado en Cascada — `inteligencia_mercado_cascada` · _Investigación multinivel: Local INEGI DENUE, Scraping Nacional y APIs de Comercio Internacional._

**Boxes asociados:** `box_cascada_mercado_3niveles`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `fuente_datos_local` | texto | Registra los datos censales locales obtenidos de INEGI DENUE. Especifica municipio, código SCIAN de actividad, estrato de personal y densidad competitiva territorial. | Ej: 'En Hermosillo, Sonora (SCIAN 311612 - Elaboración de embutidos y carnes preparadas), se censaron 14 establecimientos con estrato de 11 a 50 empleados'. |
| `consulta_web_scraping` | texto | Documenta los hallazgos de prospección y web scraping multi-fuente a nivel estatal y nacional (DuckDuckGo, Tavily Search, Google Maps/Knowledge Graph). Incluye precios públicos, presencia digital y reseñas. | Ej: 'Scraping en Sonora y Sinaloa identificó 6 distribuidores cárnicos mayoristas con precios de Rib-Eye envasado entre $340 y $420 MXN/kg sin certificación TIF'. |
| `consulta_internacional_api` | texto | Detalla los flujos arancelarios, cuotas y demanda internacional consultados en APIs y bases de comercio exterior (ITC Trade Map, UN Comtrade, USDA/FAS, World Bank). Registra fracción arancelaria y volumen transfronterizo. | Ej: 'Bajo la fracción arancelaria HS 0202.30 (Carne deshuesada congelada), el mercado de Arizona importó 34,200 ton en 2025 con arancel preferencial T-MEC del 0%'. |
| `validacion_cruzada` | texto | Sintetiza la triangulación entre la capa local (INEGI), nacional (Web Scraping) e internacional (APIs comerciales). Formula el dictamen de viabilidad comercial y la estrategia de posicionamiento escalable. | Ej: 'La triangulación valida viabilidad comercial regional inmediata (Fase 1) por déficit de oferta con valor agregado en Hermosillo, y respalda el salto a exportación (Fase 2) hacia Phoenix/Tucson'. |

### Pilar: Estudio Técnico de Producción — `tecnico`

#### Módulo: Localización y Ubicación — `ubicacion` · _Macro y micro localización del negocio._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `macro` | texto | Análisis de la región, estado o ciudad elegida. Justifica con datos económicos y logísticos. | Ej: "Hermosillo, Sonora: PIB estatal de $430B MXN. Hub de servicios financieros del noroeste. Aeropuerto internacional." |
| `micro` | texto | Ubicación exacta dentro de la ciudad. Colonia, calle, accesibilidad, competencia cercana. | Ej: "Col. Villa de Seris, Blvd. Rosales #245. A 5 min del centro financiero. Renta: $12K/mes. Estacionamiento para 8 autos." |
| `local` | texto | Distribución física del espacio de trabajo. Metros cuadrados, zonas y mobiliario. | Ej: "Oficina de 80m²: Recepción (15m²), 2 oficinas privadas (12m² c/u), sala de juntas (20m²), coworking (21m²)." |

#### Módulo: Operación y Procesos — `operacion` · _Diagrama de flujo de operaciones y tecnología._

**Boxes asociados:** `box_kpi_otd_dso_dio_ccc`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `proceso` | texto | Explicación paso a paso de cómo se entrega el servicio o se fabrica el producto. | Ej: "1. Cliente agenda cita (app). 2. Diagnóstico financiero (1hr). 3. Diseño de portafolio (48hrs). 4. Presentación y firma. 5. Monitoreo mensual." |
| `diagrama` | mermaid | Flujograma del proceso principal en formato Mermaid.js. Debe mostrar inicio, etapas y fin. | Ej: "graph TD → A[Prospecto] → B[Diagnóstico] → C[Propuesta] → D[Firma contrato] → E[Implementación] → F[Seguimiento]" |
| `tecnologia` | texto | Detalla el paquete tecnológico, software de control, hardware especializado y nivel de automatización que sustentan la ventaja operativa. | Ej: Banco de pruebas de 300 HP con telemetría digital en tiempo real y software SCADA para diagnóstico de bombas hidráulicas. |
| `economias_escala` | texto | Explica cómo los costos unitarios decrecen a medida que aumenta el volumen de producción. | Ej: Compra de refacciones por contenedor reduce costo unitario en un 22%. |
| `tipo_proceso` | texto | Clasifica el tipo de manufactura o servicio (por proyecto, por lote, flujo continuo o células). | Ej: Producción híbrida: células de trabajo para diagnóstico y línea continua para maquinado. |

#### Módulo: Maquinaria y Tecnología — `recursos` · _Equipamiento, hardware y herramientas necesarias._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `maquinaria` | texto | Listado de equipo especializado con marca, modelo, costo y vida útil estimada. | Ej: "2 MacBook Pro M3 ($45K c/u). 1 Servidor NAS Synology ($18K). Monitor 4K Dell ($12K). Total: $120K." |
| `equipo` | texto | Mobiliario de oficina, vehículos y equipo de cómputo general. | Ej: "4 escritorios ejecutivos ($8K c/u). 6 sillas ergonómicas ($5K c/u). Proyector Epson ($15K). Total: $77K." |
| `herramientas` | texto | Software, licencias, suscripciones y herramientas digitales necesarias. | Ej: "HubSpot CRM ($0). Suite Adobe ($600/mes). Zoom Pro ($250/mes). Dominio + hosting ($2K/año). Bloomberg Terminal ($24K/año)." |

#### Módulo: Insumos y Proveedores — `insumos` · _Materias primas y cadena de suministro._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `materia_prima` | texto | Insumos principales para operar. En servicios: materiales de soporte, plataformas, data. | Ej: "Datos de mercado (Reuters, $5K/mes). Papelería corporativa ($2K/mes). Bases de datos CNBV (gratuito)." |
| `proveedores` | texto | Lista de proveedores clave con nombre, ubicación, condiciones de pago y alternativas. | Ej: "Proveedor 1: AWS (hosting, crédito de $1K). Proveedor 2: Imprenta GraficSon (30 días crédito). Alternativa: DigitalOcean." |
| `compras` | texto | Política de adquisiciones: frecuencia, volumen mínimo, control de calidad, inventario de seguridad. | Ej: "Compras de papelería: mensual. Software: anual con descuento. Criterio: mínimo 3 cotizaciones. Pago a 30 días." |

#### Módulo: Capacidad e Inventarios — `capacidad` · _Capacidad instalada, manejo de stock y turnos._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `instalada` | texto | Calcula la capacidad instalada máxima vs la capacidad utilizada en turnos normales de operación (unidades/mes u horas de servicio). | Ej: Capacidad máxima: 80 overhauls de cilindros al mes (2 turnos de 8 hrs). Operación inicial al 45% (36 servicios/mes). |
| `inventarios` | texto | Método de control de existencias (PEPS, UEPS, ABC) y software utilizado. | Ej: "Para servicios: Control de citas vía Calendly. Para productos: Método PEPS en Excel con alerta de stock mínimo." |
| `mano_obra` | texto | Personal necesario por área con perfil, cantidad, turno y tipo de contratación. | Ej: "2 asesores financieros (planta). 1 community manager (medio tiempo). 1 contador (outsourcing). 1 desarrollador (freelance)." |
| `punto_reorden` | texto | Nivel mínimo de existencias de insumos que dispara automáticamente una nueva orden de compra. | Ej: "Mangueras de alta presión: Punto de reorden en 15 unidades (lead time de entrega de 5 días). Sellos hidráulicos: 50 sets." |

#### Módulo: Eficiencia Operativa — `operativa` · _Métricas de desempeño: OTD, Rotación, DSO, DPO y Ciclo de Efectivo._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `otd` | texto | On-Time Delivery: Porcentaje de entregas o servicios ejecutados a tiempo respecto al compromiso. | Ej: "Meta OTD: 98.5% en contratos mineros Tier 1. Monitoreo semanal mediante sistema ERP." |
| `rotacion` | texto | Rotación de Inventarios: Veces que se renueva el stock en un periodo determinado. | Ej: "Rotación objetivo: 6.0 veces al año (60 días de permanencia promedio en almacén)." |
| `dso` | texto | Days Sales Outstanding: Días promedio de cobro a clientes corporativos. | Ej: "DSO objetivo: 45 días para mineras y 30 días para contratistas locales." |
| `dpo` | texto | Days Payable Outstanding: Días promedio de pago a proveedores clave. | Ej: "DPO negociado: 60 días con fabricantes OEM de mangueras y conexiones." |
| `ccc` | texto | Cash Conversion Cycle (Ciclo de Conversión de Efectivo): Días que toma convertir inventario en flujo de caja. | Ej: "CCC = Días Inventario (60) + DSO (45) - DPO (60) = 45 días de requerimiento de capital de trabajo." |

#### Módulo: Impacto Ambiental — `ambiental` · _Sostenibilidad, manejo de residuos y normatividad._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `impacto` | texto | Efectos de tu operación en el medio ambiente. Consumo energético, residuos, emisiones. | Ej: "Oficina consume 450 kWh/mes. Operación digital reduce 80% de papel vs firma tradicional. Huella: 2.3 ton CO₂/año." |
| `mitigacion` | texto | Acciones concretas para reducir tu impacto ambiental. Metas y plazos. | Ej: "Meta 2025: 100% firmas digitales. 2026: Energía solar en oficina (-60% consumo). Reciclaje de e-waste con certificado." |
| `normatividad` | texto | Leyes ambientales aplicables y tu nivel de cumplimiento actual. | Ej: "Cumplimos NOM-161-SEMARNAT (residuos electrónicos). Exentos de Licencia Ambiental por ser servicio de bajo impacto." |

### Pilar: Organización y Finanzas — `organizacion`

#### Módulo: Estructura Organizativa — `estructura` · _Organigrama y descripción de puestos clave._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `organigrama_visual` | mermaid | Código Mermaid.js que genera el organigrama del equipo jerárquicamente. | Ej: "graph TD → CEO → Dir. Financiero + Dir. Comercial → cada uno con sus subordinados" |
| `puestos` | texto | Describe los perfiles, responsabilidades críticas, requisitos de experiencia y jerarquía de los puestos clave de la organización. | Ej: Gerente Técnico (Ing. Mecatrónico, 8+ años en minería), Técnico Hidráulico Senior (Certificación IFPS), Ejecutivo de Cuenta B2B. |
| `funciones` | texto | Tabla de responsabilidades de cada puesto clave. Qué hace, a quién reporta, KPIs. | Ej: "Director Comercial: Captación de clientes, gestión de embudo, reporta a CEO. KPI: 50 clientes nuevos/mes." |
| `puestos_lista` | texto | Matriz consolidada de capital humano y costo patronal acorde al tamaño de la organización presupuestada en la semilla. | Ej: "Estructura de 14 especialistas: 1 Gerente General ($65K), 2 Líderes Técnicos ($45K c/u), 6 Técnicos Hidráulicos ($22K c/u), 3 Operadores IoT ($20K c/u), 2 Administrativos ($18K c/u). Costo patronal total: $480K/mes." |

#### Módulo: Gestión de Recursos Humanos — `recursos_humanos` · _Políticas de contratación, capacitación y sueldos._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `reclutamiento` | texto | Proceso de atracción y selección de talento. Fuentes, filtros y tiempos. | Ej: "Publicación en LinkedIn + OCC. Filtro: CV → Entrevista técnica → Caso práctico → Contratación. Tiempo: 3 semanas." |
| `contratacion` | texto | Tipo de contrato, período de prueba, prestaciones y obligaciones patronales. | Ej: "Contrato indeterminado con 3 meses de prueba. Prestaciones de ley + seguro de gastos médicos mayores (6to mes)." |
| `sueldos` | texto | Tabla salarial por puesto incluyendo sueldo bruto, neto, prestaciones y costo total. | Ej: "Asesor Jr: $15K bruto + comisiones. Asesor Sr: $25K + bono. Dir. Comercial: $40K + 2% de ventas totales." |

#### Módulo: Inversión Inicial (CAPEX) — `inversion` · _Requerimientos de capital para arranque._

**Boxes asociados:** `box_wacc_van_tir`, `box_tornado_sensibilidad`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `inversion_fija` | texto | [ANCLAJE OBLIGATORIO A SEMILLA] Activos fijos tangibles. Su monto debe sumar armónicamente con la inversión diferida y el OPEX inicial para totalizar la cifra de `semilla.inversion_esperada`. | Ej: "De $20,000,000 MXN totales de semilla: Banco de pruebas hidráulicas ($5.5M), instrumental de telemetría ($3.5M), nave y adecuaciones ($4.0M), flotilla de servicio móvil ($2.0M). Total fija: $15.0M MXN." |
| `inversion_diferida` | texto | [ANCLAJE OBLIGATORIO A SEMILLA] Gastos preoperativos y patentes. Parte integral del desglose canónico de `semilla.inversion_esperada`. | Ej: "De los $20M de semilla: Certificación ISO 4406 ($450K), constitución SAPI y registros IP ($350K), software y ERP ($1.2M). Total diferida: $2.0M MXN." |
| `opex_inicial` | texto | [ANCLAJE OBLIGATORIO A SEMILLA] Capital de trabajo y fondo de maniobra derivado de la estructura de capital de `semilla.inversion_esperada` para cubrir los primeros 3 a 6 meses de operación. | Ej: "De la inversión inicial de $20M MXN, se asignan $2,000,000 MXN a OPEX inicial: nómina preoperativa, seguros, rentas y reservas de contingencia." |
| `financiamiento` | texto | [ANCLAJE OBLIGATORIO A SEMILLA] Fuentes de capital estructuradas exactamente para fondear el monto canónico de `semilla.inversion_esperada`. Detalla capital propio, aportaciones y crédito bancario. | Ej: "Financiamiento de $20M MXN totales: Serie A Fundadores 65% ($13M MXN), Serie B Inversionistas 35% ($7M MXN con dividendo preferente y recompra)." |

#### Módulo: Costos y Gastos (OPEX) — `costos` · _Estructura de costos fijos y variables mensuales._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `fijos` | texto | Gastos operativos que no varían con el volumen. Deben guardar congruencia con el tamaño de planta y capital de `semilla.inversion_esperada`. | Ej: "Renta de nave industrial: $85K/mes. Nómina base administrativa: $240K/mes. Telecomunicaciones e IoT: $25K/mes. Total fijos: $350K/mes." |
| `variables` | texto | Gastos que cambian según el número de clientes, reparaciones o servicios ejecutados. | Ej: "Refacciones y mangueras por servicio: $4,500 MXN. Consumibles y fluidos: $1,200 MXN. Comisión técnica: $1,500 MXN." |
| `unitario` | texto | Cálculo del costo total de prestar una orden de servicio o unidad de producto comercializada. | Ej: "Costo fijo unitario prorrateado: $8,750 MXN. Costo variable directo: $7,200 MXN. Costo total unitario: $15,950 MXN por servicio industrial." |

#### Módulo: Estados Financieros — `estados_financieros` · _Proyecciones de resultados, balance y flujo._

**Boxes asociados:** `box_montecarlo_sim`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `resultados` | texto | [ANCLAJE OBLIGATORIO A SEMILLA] Proyección a 5 años sustentada en la capacidad instalada fondeada con `semilla.inversion_esperada`. Detalla ingresos, EBITDA y utilidades netas. | Ej: "Año 1: Ingresos $18.5M - Costos/Gastos $14.2M = EBITDA $4.3M (Utilidad Neta $2.8M). Año 5: Ingresos $46.0M - EBITDA $14.8M." |
| `balance` | texto | [ANCLAJE OBLIGATORIO A SEMILLA] Estado de Situación Financiera. El Activo Total en el Año 1 debe reflejar la aplicación íntegra del capital de `semilla.inversion_esperada` (Activos = Pasivos + Capital). | Ej: "Año 1: Activos Totales $20,000,000 MXN (Fijo $15M + Circulante $5M) = Pasivos $6,000,000 MXN + Capital Social $14,000,000 MXN." |
| `flujo_caja` | texto | [ANCLAJE OBLIGATORIO A SEMILLA] Flujo de caja libre. El periodo 0 debe registrar el desembolso exacto del CAPEX canónico de `semilla.inversion_esperada`. | Ej: "Año 0 (Inversión inicial): -$20,000,000 MXN. Año 1: +$3,850,000 MXN. Año 2: +$6,420,000 MXN. Flujo acumulado positivo a partir del mes 48." |
| `amortizacion_creditos` | texto | Servicio de deuda para la porción apalancada declarada en el financiamiento de la inversión. | Ej: "Crédito institucional por $7M MXN a 60 meses, tasa anual 13.5%, cuota mensual de $161,000 MXN con amortización creciente." |
| `memorias_calculo` | texto | [ANCLAJE OBLIGATORIO A SEMILLA] Supuestos cuantitativos, precios de contratos y costos unitarios que soportan los ingresos proyectados a partir del despliegue de `semilla.inversion_esperada`. | Ej: "Base de cálculo: 35 unidades mineras monitoreadas @ $48,000 MXN/mes + 12 mantenimientos mayores mensuales @ $95,000 MXN." |

#### Módulo: Rentabilidad y Análisis — `rentabilidad` · _TIR, VPN, Punto de Equilibrio y ROI._

**Boxes asociados:** `box_wacc_van_tir`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `punto_equilibrio` | texto | Volumen crítico en unidades monetarias y servicios para absorber costos fijos. Evita fórmulas con división por cero o símbolos infinitos (∞). | Ej: "Punto de equilibrio mensual: $350K CF ÷ (1 - 0.42 CV) = $603,448 MXN mensuales en facturación (aprox. 18 servicios mayores al mes)." |
| `indicadores` | texto | [ANCLAJE OBLIGATORIO A SEMILLA] Indicadores financieros maestros calculados a partir del desembolso de `semilla.inversion_esperada`. La TIR debe situarse en un rango plausible (15% a 40%) y el Payback corresponder al plazo de retorno. | Ej: "Inversión Base: $20,000,000 MXN. TIR: 24.5%, VAN (tasa 12%): $3.42M MXN, Payback: 4.1 años (49 meses), ROI proyectado: 68% a 5 años." |
| `relacion_bc` | texto | Relación Beneficio-Costo (B/C). Valor presente de beneficios descontados entre la inversión inicial canónica. | Ej: "Relación B/C de 1.42 (VPN positivo con inversión inicial de $20M MXN a tasa del 12%), ratificando viabilidad financiera sólida." |

### Pilar: Simulador y Corridas — `simulador_financiero`

#### Módulo: Simulador Financiero — `simulador` · _Simulador interactivo avanzado con corridas dinámicas a 5 años._

**Boxes asociados:** `box_montecarlo_sim`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `iframe_simulador` | texto | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. |


---

## Proyecto Social (Metodología BID) — `social_bid`

### Pilar: Identificación del Problema — `identificacion`

#### Módulo: Análisis de Involucrados — `involucrados` · _Mapeo de actores, beneficiarios, aliados y oponentes._

**Boxes asociados:** `box_matriz_interes_poder`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `beneficiarios` | texto | ¿A quiénes ayuda exactamente este proyecto? (Población objetivo) | Ej: 500 jóvenes de 15 a 18 años en rezago educativo en la colonia X. |
| `aliados` | texto | Instituciones, ONGs o líderes comunitarios que apoyarán el proyecto. | Ej: Fundación Y, Secretaría de Educación, Junta de Vecinos. |
| `oponentes` | texto | Actores que podrían oponerse al proyecto o verse afectados negativamente. | Ej: Sindicato de maestros locales (riesgo de rechazo por nuevos métodos). |
| `matriz_interes` | texto | Clasificación de actores por su nivel de poder e interés en el proyecto. | Ej: Gobierno local (Alto Poder, Bajo Interés) -> Estrategia: Mantener informado. |

#### Módulo: Árbol de Problemas — `arbol_problemas` · _Identificación del problema central, sus causas (raíces) y efectos (ramas)._

**Boxes asociados:** `box_arbol_problemas_mml`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `problema_central` | texto | El problema público o social que busca resolverse (en negativo). | Ej: Alto índice de deserción escolar en educación media superior en la zona sur. |
| `causas_directas` | texto | Por qué ocurre el problema central de manera inmediata. | Ej: 1. Falta de recursos económicos. 2. Desinterés por el currículo tradicional. |
| `causas_indirectas` | texto | Causas subyacentes o de raíz que generan las causas directas. | Ej: Desempleo de los padres, falta de escuelas técnicas cercanas. |
| `efectos` | texto | Consecuencias de que el problema no se resuelva. | Ej: Aumento de la delincuencia juvenil, empleos precarizados a futuro. |
| `diagrama_visual` | mermaid | Código Mermaid.js para el Árbol de Problemas u Objetivos. Debe conectar causas o medios (abajo) con el problema/objetivo central (centro) y efectos o fines (arriba) usando flechas -->. | Ej: "flowchart TD<br>  CI[Causa Indirecta] --> CD[Causa Directa]<br>  CD --> PC[Problema Central]<br>  PC --> E1[Efecto 1]<br>  PC --> E2[Efecto 2]" |

#### Módulo: Árbol de Objetivos — `arbol_objetivos` · _Conversión del problema en objetivo central, medios y fines._

**Boxes asociados:** `box_arbol_problemas_mml`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `objetivo_central` | texto | El problema central convertido en estado positivo alcanzado. | Ej: Reducida la deserción escolar en educación media superior en la zona sur. |
| `medios` | texto | Las soluciones (causas en positivo) para lograr el objetivo. | Ej: 1. Becas de transporte. 2. Talleres extracurriculares atractivos. |
| `fines` | texto | Los impactos a largo plazo (efectos en positivo). | Ej: Disminución de la delincuencia, mayor inserción laboral formal. |
| `diagrama_visual` | mermaid | Código Mermaid.js para el Árbol de Problemas u Objetivos. Debe conectar causas o medios (abajo) con el problema/objetivo central (centro) y efectos o fines (arriba) usando flechas -->. | Ej: "flowchart TD<br>  CI[Causa Indirecta] --> CD[Causa Directa]<br>  CD --> PC[Problema Central]<br>  PC --> E1[Efecto 1]<br>  PC --> E2[Efecto 2]" |

#### Módulo: Análisis de Alternativas — `alternativas` · _Estrategias posibles y selección de la alternativa óptima._

**Boxes asociados:** `box_arbol_problemas_mml`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `estrategias_posibles` | texto | Opciones de solución derivadas del árbol de objetivos. | Ej: Estrategia A (Becas económicas) vs Estrategia B (Creación de talleres técnicos). |
| `criterios_seleccion` | texto | Criterios usados para elegir la mejor estrategia (costo, impacto, viabilidad). | Ej: Se eligió la Estrategia B por mayor sostenibilidad e impacto a largo plazo. |
| `alternativa_elegida` | texto | La estrategia final que conformará el proyecto. | Ej: Creación de 3 talleres técnicos extracurriculares con equipo donado. |

### Pilar: Diseño del Proyecto (MML) — `diseno`

#### Módulo: Fin y Propósito — `fin_proposito` · _Impacto a largo plazo y objetivo específico del proyecto._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `fin` | texto | Impacto a largo plazo al que el proyecto contribuye. | Ej: Contribuir a la reducción de la pobreza y marginación urbana en 5 años. |
| `proposito` | texto | El objetivo específico que el proyecto logrará (el objetivo central). | Ej: Jóvenes de 15-18 años completan capacitación técnica y se insertan laboralmente. |
| `indicadores_fin` | texto | Cómo se medirá el impacto a largo plazo. | Ej: % de reducción de pobreza en la colonia en 5 años (Fuente: CONEVAL). |
| `indicadores_proposito` | texto | Cómo se medirá el éxito inmediato del proyecto. | Ej: Al menos 300 jóvenes graduados en 12 meses, 40% con empleo a los 6 meses. |

#### Módulo: Componentes (Productos) — `componentes` · _Bienes o servicios que entregará el proyecto._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `lista_componentes` | texto | Bienes, servicios o productos tangibles que entrega el proyecto. | Ej: 1. Centro de cómputo equipado. 2. Manuales de robótica impresos. |
| `indicadores_componentes` | texto | Métricas de los productos entregados. | Ej: 20 computadoras instaladas operando. 500 manuales distribuidos. |
| `supuestos` | texto | Riesgos externos que DEBEN cumplirse para el éxito (fuera de control). | Ej: El gobierno mantiene el subsidio de luz. Los jóvenes no migran por violencia. |

#### Módulo: Actividades Clave — `actividades` · _Tareas necesarias para producir cada componente._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `descripcion_actividades` | texto | Las tareas necesarias para entregar los componentes. | Ej: Para el Componente 1: a) Cotizar equipos b) Comprar c) Instalar d) Probar. |
| `cronograma_macro` | texto | Resumen de tiempos de las actividades principales. | Ej: Mes 1-2: Compras. Mes 3: Instalación. Mes 4-12: Talleres. |

#### Módulo: Sistema de Monitoreo — `monitoreo` · _Medios de verificación y línea base._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `medios_verificacion` | texto | Dónde se buscarán los datos para comprobar los indicadores. | Ej: Listas de asistencia, registros de calificaciones, recibos de compra. |
| `linea_base` | texto | El estado del indicador antes del proyecto. | Ej: Actualmente 0 jóvenes capacitados. Deserción actual: 25%. |
| `frecuencia_medicion` | texto | Cada cuánto se evaluarán los indicadores. | Ej: Asistencia: Semanal. Inserción laboral: Trimestral posterior al egreso. |

### Pilar: Ejecución y Gobernanza (PM4R) — `ejecucion`

#### Módulo: Estructura de Gobernanza — `gobernanza` · _Directorio, comité ejecutor y roles._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `comite_directivo` | texto | Quién toma las decisiones macro del proyecto. | Ej: Mesa conformada por el Director de la ONG, un donante y un líder vecinal. |
| `unidad_ejecutora` | texto | El equipo que opera el proyecto día a día. | Ej: 1 Coordinador, 3 profesores técnicos, 1 trabajador social. |
| `organigrama_visual` | mermaid | Código Mermaid.js que genera el organigrama de gobernanza jerárquicamente. | Ej: "flowchart TD<br>  CD[Comité Directivo] --> UE[Unidad Ejecutora]<br>  UE --> C[Coordinador]<br>  UE --> T[Técnicos]" |

#### Módulo: Estructura Desglosada (EDT) — `edt` · _División del trabajo y cronograma detallado._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `paquetes_trabajo` | texto | Agrupación de actividades en bloques manejables (EDT). | Ej: Paquete 1: Infraestructura. Paquete 2: Currícula. Paquete 3: Difusión. |
| `hitos_principales` | texto | Momentos clave de éxito en el cronograma. | Ej: Hito 1: Aula terminada (Mes 3). Hito 2: Inicio de clases (Mes 4). |

#### Módulo: Matriz de Riesgos — `riesgos` · _Identificación, probabilidad y mitigación de riesgos sociales/ambientales._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `riesgos_identificados` | texto | Posibles eventos que amenacen el proyecto (Sociales, Políticos, etc.). | Ej: Robo de equipo de cómputo en la escuela comunitaria. |
| `plan_mitigacion` | texto | Qué se hará para prevenir o reaccionar a esos riesgos. | Ej: Instalar protecciones de herrería y crear comité de vigilancia vecinal. |
| `matriz_probabilidad` | texto | Clasificación de riesgos (Impacto x Probabilidad). | Ej: Robo (Probabilidad Alta, Impacto Alto) -> Prioridad Crítica. |

#### Módulo: Plan de Comunicaciones — `comunicaciones` · _Estrategia para mantener informados a los stakeholders._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `audiencias` | texto | Grupos clave que deben recibir información del avance. | Ej: Donantes (BID), Padres de familia, Autoridades educativas. |
| `canales` | texto | Medios a través de los cuales se enviará la información. | Ej: Reporte trimestral PDF para BID. Grupo de WhatsApp para padres. |
| `mensajes_clave` | texto | Lo que se quiere comunicar a cada audiencia. | Ej: A los padres: "Su hijo está adquiriendo habilidades para el futuro". |

### Pilar: Presupuesto y Evaluación — `presupuesto`

#### Módulo: Presupuesto por Componentes — `presupuesto_detallado` · _Costo total desglosado por actividad y componente._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `costos_directos` | texto | Dinero gastado directamente en la intervención social. | Ej: Pago a instructores ($150k), Computadoras ($200k), Materiales ($50k). |
| `costos_indirectos` | texto | Gastos de administración y logística (overhead). | Ej: Sueldo del director ($50k), Papelería de oficina ($10k), Contador ($15k). |
| `fuentes_financiamiento` | texto | Quién aporta el dinero (donantes, contrapartida local, etc.). | Ej: BID aporta 70% ($350k). Contrapartida local en especie (local prestado) 30%. |

#### Módulo: Evaluación Ex-ante — `evaluacion_exante` · _Costo-Beneficio Social y análisis de costo-eficiencia._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `beneficios_sociales` | texto | Valorización monetaria del impacto (Ej. incremento de sueldo futuro). | Ej: Los graduados ganarán $30,000 extra al año. En 500 jóvenes = $15M anuales. |
| `tir_social` | texto | Tasa Interna de Retorno pero midiendo beneficios a la sociedad, no ganancias. | Ej: TIR Social estimada: 25% (muy superior a la tasa de descuento social del 10%). |
| `vpn_social` | texto | Valor Presente Neto de los beneficios sociales menos el costo del proyecto. | Ej: Valor Presente Neto Social: +$4.5 Millones a 5 años. |

#### Módulo: Evaluación Cuantitativa BID — `evaluacion_social_cuantitativa` · _Tasa social de descuento (8-12%), costos sombra y rentabilidad socioeconómica._

**Boxes asociados:** `box_tir_vpn_social_bid`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `tasa_descuento_social` | texto | Tasa social de descuento recomendada por organismos multilaterales (BID / CEPAL / Banco Mundial). | Ej: Tasa social de descuento del 10.0% anual según parámetros del BID para proyectos comunitarios. |
| `beneficios_socioeconomicos` | texto | Monetización de externalidades positivas: ahorro de tiempo, mejoras en salud, reducción de emisiones o incremento de ingresos. | Ej: Ahorro de 45 horas/mes por familia valoradas a salario mínimo sombra ($3.2M MXN anuales acumulados). |
| `costos_sociales_sombra` | texto | Costos de inversión y operación ajustados por factores de conversión a precios sociales. | Ej: Factor de conversión de mano de obra no calificada = 0.75 sobre el salario nominal. |
| `tir_social_pct` | texto | Tasa Interna de Retorno Social del proyecto considerando el flujo de beneficios socioeconómicos netos. | Ej: TIR Social proyectada de 16.4% anual, superando ampliamente la tasa de corte del 10.0%. |
| `vpn_social_monto` | texto | Valor Presente Neto Social que representa la ganancia de bienestar colectivo aportada por el proyecto. | Ej: VPN Social de +$4,850,000 MXN descontado al 10.0% en un horizonte de 10 años. |

#### Módulo: Estrategia de Sostenibilidad — `sostenibilidad` · _Cómo sobrevivirá el proyecto al terminar el financiamiento del BID._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `sostenibilidad_financiera` | texto | Estrategia de ingresos propios, cuotas de recuperación o patrocinios para operar sin depender de fondos iniciales. | Ej: 40% ingresos por cuotas simbólicas de talleres vespertinos, 60% donaciones recurrentes. |
| `sostenibilidad_institucional` | texto | Cómo se hará cargo de administrar el proyecto a futuro. | Ej: La asociación de padres asumirá el control directivo en el Año 3. |
| `apropiacion_comunitaria` | texto | Cómo asegurar que la comunidad defienda y mantenga el proyecto. | Ej: Involucrar a los jóvenes en pintar y decorar el aula para generar sentido de pertenencia. |


---

## Agile Startup (Lean MVP) — `agile_startup`

### Pilar: Validación y Lienzo (Lean Canvas) — `validacion`

#### Módulo: Lienzo Lean Canvas — `canvas` · _Los 9 bloques simplificados del modelo de negocios ágil para enfocar la propuesta de valor._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `problema` | texto | Identifica los 3 principales problemas que resolverás para tu cliente. | Ej: 1. Falta de tiempo para cocinar sano. 2. Precios elevados de restaurantes saludables. 3. Poca variedad de comida a domicilio. |
| `segmentos_clientes` | texto | Define quiénes son tus adoptantes tempranos (Early Adopters) y tu mercado meta. | Ej: Profesionistas de 25-40 años que trabajan en oficinas corporativas y no tienen tiempo de cocinar. |
| `propuesta_valor` | texto | Explica tu propuesta única de valor. ¿Por qué eres diferente y vale la pena prestarte atención? | Ej (Estilo Uber/Airbnb): Comida saludable gourmet preparada por chefs locales y entregada en menos de 20 minutos por suscripción. |
| `solucion` | texto | Describe las 3 características principales de tu solución o MVP. | Ej: 1. App móvil de pedidos express. 2. Menú rotativo de 5 platos diarios. 3. Red de micro-cocinas locales distribuidas. |
| `canales` | texto | ¿Cómo vas a dar a conocer y entregar tu solución a tus clientes? | Ej: Campañas de marketing local en Instagram, códigos de referido de oficina y entrega vía repartidores propios. |
| `flujos_ingresos` | texto | ¿Cómo ganarás dinero? Suscripción, venta directa, comisiones, publicidad. | Ej (Estilo Netflix/Spotify): Planes semanales de suscripción ($1,200 MXN/semana) y catering corporativo para eventos de oficina. |
| `estructura_costos` | texto | ¿Cuáles son tus costos fijos y variables más significativos para arrancar? | Ej: Costo de ingredientes (materia prima), comisión del procesador de pagos, y marketing digital de adquisición. |
| `metricas_clave` | texto | Métricas críticas que demuestran la salud y crecimiento de tu negocio. | Ej: Costo de Adquisición de Cliente (CAC), Tasa de Retención Semanal, y Valor de Vida del Cliente (LTV). |
| `ventaja_especial` | texto | ¿Qué tienes que no pueda ser copiado o comprado fácilmente? | Ej (Estilo Amazon Logistics): Algoritmo propio de ruteo y distribución que reduce tiempos de entrega a la mitad frente a UberEats. |

#### Módulo: Cliente y Empatía — `buyer_persona` · _Creación detallada del Buyer Persona o avatar de cliente y su mapa de empatía._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `avatar_cliente` | texto | Detalla el perfil del Buyer Persona: edad, ocupación, metas e intereses. | Ej: Sandra, 32 años, gerente de marketing, soltera, apasionada del fitness pero trabaja 10 horas diarias. |
| `que_piensa` | texto | ¿Qué pasa por la mente del cliente ideal? Sus deseos, preocupaciones y aspiraciones financieras/personales. | Ej: Piensa que debería comer mejor para cuidar su salud, pero le aburre preparar comida y le da pereza lavar platos. |
| `que_ve` | texto | ¿Qué observa en su entorno diario? Ofertas de la competencia, comportamiento de amigos, etc. | Ej: Ve que sus compañeros de oficina piden pizzas o comida rápida grasosa por falta de opciones saludables cerca. |
| `que_oye` | texto | ¿Qué le dicen sus amigos, familia o influenciadores que afecta su decisión? | Ej: Oye constantemente en podcasts de bienestar la importancia de la nutrición, y de sus amigas que preparar ensaladas toma mucho tiempo. |
| `que_dice_hace` | texto | ¿Cómo se comporta y qué expresa en público el cliente? | Ej: Dice que quiere empezar la dieta el lunes, pero termina pidiendo comida rápida el miércoles debido a juntas de última hora. |
| `dolores` | texto | Frustraciones, obstáculos y miedos del cliente. | Ej: Miedo a ganar peso, frustración de gastar demasiado en apps de delivery tradicionales con comida fría. |
| `necesidades` | texto | Lo que realmente desea conseguir o lograr el cliente. | Ej: Conveniencia extrema: comida rica, saludable, que llegue caliente y a un precio predecible. |

### Pilar: Diseño de Experimentos y MVP — `experimento`

#### Módulo: Diseño del MVP — `mvp_design` · _Especificación técnica y operativa del Producto Mínimo Viable a construir._

**Boxes asociados:** `box_mvp_protocol`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `especificacion_mvp` | texto | Define de forma concreta qué funcionalidades o entregables incluirá la primera versión (MVP). | Ej: Una Landing Page sencilla en Webflow con botón de pago de Stripe para pre-vender el plan semanal, sin App móvil aún. |
| `recursos_construccion` | texto | Lista de herramientas no-code, software y recursos mínimos requeridos. | Ej: Webflow para diseño, Stripe para pagos, Google Sheets para base de datos y un chef de cocina local contratado. |
| `tiempo_estimado_desarrollo` | texto | Duración estimada para el lanzamiento del piloto al mercado. | Ej: 3 semanas para diseño de Landing Page, pruebas de menú y lanzamiento de pauta en redes. |

#### Módulo: Hipótesis y Métricas — `critical_hypotheses` · _Identificación de las dos hipótesis más críticas de valor y crecimiento, y sus métricas._

**Boxes asociados:** `box_mvp_protocol`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `hipotesis_valor` | texto | La suposición crítica de por qué los clientes valorarán y usarán tu producto. | Ej: Los profesionistas están dispuestos a pagar una suscripción de $1,200/semana por no tener que planificar su comida. |
| `hipotesis_crecimiento` | texto | La suposición crítica de cómo adquirirás clientes recurrentes a bajo costo. | Ej: Cada cliente activo recomendará el servicio a al menos 1 colega de su misma oficina en el primer mes. |
| `metrica_exito` | texto | Números específicos que validarán las hipótesis del experimento. | Ej: Conseguir 20 suscriptores de pago en las primeras 2 semanas de la preventa. |
| `canal_validacion` | texto | Dónde o cómo pondrás a prueba el experimento de tracción. | Ej: Publicaciones orgánicas en grupos locales de LinkedIn y distribución de flyers físicos en 3 torres corporativas. |

#### Módulo: Experimentos Lean TDD — `experimentos_tdd` · _Diseño riguroso de pruebas con criterios de falsificación, muestra y duración._

**Boxes asociados:** `box_experimento_lean_tdd`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `hipotesis_h1_nula` | texto | Formulación de la hipótesis de valor/crecimiento (H1) frente a la hipótesis nula (H0) de no impacto. | Ej: H1: 'Al menos 15 de 50 restaurantes adoptarán el pedido recurrente si ofrecemos 0% merma'. H0: 'Adopción < 5%'. |
| `criterio_falsificacion` | texto | Umbral cuantitativo que demuestra de forma inequívoca que la hipótesis es falsa. | Ej: Si menos del 20% de los usuarios de prueba completan la orden en 7 días, la hipótesis queda descartada. |
| `tamano_muestra_minima` | texto | Número mínimo de sujetos o clientes necesarios para alcanzar significancia estadística en la prueba. | Ej: Muestra mínima de 40 clientes B2B HORECA con poder de decisión de compra. |
| `duracion_experimento_dias` | texto | Tiempo límite (timebox) en días asignado para ejecutar la prueba y recopilar datos. | Ej: Ciclo estricto de 14 días naturales para medir conversión y activación. |

### Pilar: Tracción y Aprendizaje — `aprendizaje`

#### Módulo: Resultados del Piloto — `pilot_results` · _Resultados cuantitativos y cualitativos obtenidos durante las pruebas con clientes reales._

**Boxes asociados:** `box_burn_runway`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `datos_traccion` | texto | Resumen de métricas reales de clientes, ventas o registros obtenidos. | Ej: 24 clientes pagaron la suscripción en la preventa, logrando $28,800 MXN en ventas brutas en 14 días. |
| `comentarios_early_adopters` | texto | Retroalimentación directa de los primeros usuarios de tu MVP. | Ej: "La comida es deliciosa y el empaque térmico es excelente, pero me gustaría poder elegir opciones sin gluten". |
| `aprendizajes_clave` | texto | Conclusiones principales que obtuviste del piloto práctico. | Ej: Validamos que hay intención de pago inmediata. Sin embargo, la logística de reparto requiere optimizar zonas. |

#### Módulo: Contabilidad de Innovación — `innovation_accounting` · _Evaluación cuantitativa de hitos: Línea base, optimizaciones y análisis de cohortes._

**Boxes asociados:** `box_innovation_accounting_3metrics`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `metrica_linea_base` | texto | Valor actual inicial del indicador antes de aplicar cualquier optimización (Innovation Accounting). | Ej: Conversión actual de visitante a lead del 2.8% con tasa de rebote del 64%. |
| `experimento_minimo_viable` | texto | Intervención o cambio más pequeño posible implementado para intentar mover la aguja de la métrica. | Ej: Lanzamiento de landing page concierge con video explicativo de 45 segundos y checkout en 1 clic. |
| `analisis_cohortes` | texto | Comportamiento del indicador segmentado por grupos de clientes adquiridos en diferentes semanas/meses. | Ej: Cohorte semana 1: 18% retención; Cohorte semana 2 (con nuevo onboarding): 31% retención. |
| `umbral_decision_pivote` | texto | Criterio estructurado de la junta de decisión para determinar si se pivota el modelo o se escala. | Ej: Si tras 3 iteraciones el costo de adquisición supera el 40% del LTV, se pivota de B2C a B2B institucional. |

#### Módulo: Pivotar o Perseverar — `pivot_persevere` · _Decisión estratégica de negocio basada en datos reales de tracción para pivotar o seguir escalando._

**Boxes asociados:** `box_burn_runway`, `box_mvp_protocol`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `decision_estrategica` | texto | Determina si continuarás con el plan actual (perseverar) o si realizarás un cambio de rumbo (pivotar). | Ej: Perseverar con el modelo de suscripción, pero pivotando el canal de distribución a un esquema de entrega concentrada por corporativo. |
| `justificacion_datos` | texto | Justifica la decisión estratégica usando métricas reales del piloto. | Ej: El 85% de las quejas fueron por retrasos de reparto. Agrupar entregas por edificio reduce el costo logístico en 40%. |
| `siguientes_pasos` | texto | Plan de acción inmediato tras tomar la decisión estratégica. | Ej: 1. Integrar pasarela de pago recurrente. 2. Cerrar convenio de entrega con 2 corporativos. 3. Diseñar menú sin gluten. |

### Pilar: Finanzas y Métricas Unitarias — `finanzas_agiles`

#### Módulo: Unit Economics — `unit_economics` · _Estructura detallada de costos e ingresos unitarios._

**Boxes asociados:** `box_unit_economics`, `box_benchmark_cac_ltv`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `cac_adquisicion` | texto | Costo de Adquisición de Cliente. ¿Cuánto dinero gastas en promedio para obtener un cliente de pago? | Ej: Gastamos $3,000 en anuncios y obtuvimos 15 clientes de pago = CAC de $200 MXN. |
| `ltv_vida_cliente` | texto | Valor del tiempo de vida del cliente. Ingresos estimados que un cliente generará antes de darse de baja. | Ej: Suscripción promedio dura 8 semanas a $1,200 MXN/semana = LTV de $9,600 MXN por cliente. |
| `margen_contribucion_unitario` | texto | Ingreso unitario menos el costo variable unitario de entrega. | Ej: Precio del menú $200 - Ingredientes $70 - Entrega $40 = Margen de Contribución de $90 MXN (45%). |
| `retorno_inversion_marketing` | texto | Mide la eficiencia del gasto de marketing (LTV / CAC). Lo ideal es una relación mayor a 3. | Ej: LTV ($9,600) / CAC ($200) = Relación de 48x (Altamente rentable). |

#### Módulo: Runway y Burn Rate — `burn_rate` · _Monitoreo de flujo mensual y supervivencia de caja._

**Boxes asociados:** `box_burn_runway`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `burn_rate_mensual` | texto | Flujo de caja negativo neto promedio mensual (dinero consumido al mes). | Ej: Aplicación práctica y cuantificada para el campo burn_rate_mensual. |
| `runway_meses` | texto | Meses de supervivencia con el capital disponible actual. Caja actual / Burn Rate. | Ej: Caja disponible $270,000 / Burn Rate $45,000 = 6 meses de Runway restante. |
| `capital_supervivencia` | texto | Monto de dinero mínimo en caja que se mantendrá como reserva estratégica. | Ej: Mantener un fondo de reserva de $90,000 MXN equivalente a 2 meses de operación. |

### Pilar: Simulador y Corridas — `simulador_financiero`

#### Módulo: Simulador Financiero — `simulador` · _Simulador interactivo avanzado con corridas dinámicas y unit economics a 5 años._

**Boxes asociados:** `box_burn_runway`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `iframe_simulador` | texto | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. |


---

## Plan de Negocios de Base Tecnológica e Innovación (I+D) — `technology_id`

### Pilar: Innovación y Propiedad Intelectual — `innovacion`

#### Módulo: Tecnología e Invención — `tech_invention` · _Descripción detallada de la tecnología, su novedad científica y nivel de maduración TRL (Technology Readiness Level)._

**Boxes asociados:** `box_trl_assessment`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `descripcion_tecnologia` | texto | Explica detalladamente en qué consiste la innovación tecnológica y sus componentes. | Ej (Estilo Nvidia/OpenAI): Algoritmo de visión artificial basado en redes neuronales convolucionales para control de calidad en tiempo real. |
| `novedad_cientifica` | texto | ¿Qué descubrimientos científicos, fórmulas o patentes previas sustentan tu desarrollo? | Ej: Patrón de optimización matemática patentado que reduce el procesamiento de imágenes en un 35%. |
| `nivel_trl` | texto | Nivel de Maduración Tecnológica (TRL 1 al 9). Clasifica el estado actual de tu desarrollo. | Ej: TRL 4: Validación de componentes tecnológicos en entorno de laboratorio. |
| `ventaja_tecnologica` | texto | ¿Por qué tu tecnología es sustancialmente mejor que las soluciones comerciales existentes? | Ej (Estilo Apple Silicon): Opera sin requerir conexión a internet y requiere 70% menos poder de cómputo que el competidor líder. |

#### Módulo: Jobs-to-be-Done (Christensen) — `jobs_to_be_done` · _Declaración JTBD del cliente, circunstancia disparadora y dimensión funcional-emocional._

**Boxes asociados:** `box_jtbd_job_statement`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `job_statement_christensen` | texto | Declaración sintética Jobs-to-be-Done: 'Cuando [circunstancia], quiero [motivación], para poder [resultado esperado]'. | Ej: 'Cuando una línea de ensamble falla, quiero diagnosticar en < 3 min la causa hidráulica, para evitar penalizaciones por paro de planta'. |
| `circunstancia_disparo` | texto | Contexto temporal, ambiental o situacional específico que detona la necesidad imperiosa de contratación. | Ej: Alarma de caída de presión en turno nocturno sin ingenieros senior en piso. |
| `motivacion_funcional_emocional` | texto | Desglose de la dimensión funcional (tarea práctica) y dimensión emocional/social (estatus, tranquilidad). | Ej: Funcional: Restablecer caudal a 4,500 PSI. Emocional: Eliminar la ansiedad del gerente de mantenimiento ante la auditoría corporativa. |
| `resultado_deseado_criterio` | texto | Métrica estricta de satisfacción mediante la cual el cliente evalúa el éxito del trabajo realizado. | Ej: Tiempo total de parada no programada inferior a 15 minutos por turno mensual. |
| `alternativas_compensatorias` | texto | Soluciones sustitutas, 'parches' caseros o competidores indirectos actualmente contratados para el trabajo. | Ej: Hojas de cálculo manuales combinadas con llamadas de emergencia por WhatsApp a técnicos externos. |

#### Módulo: Propiedad Intelectual — `property_intellectual` · _Estrategia legal de registro de marcas, secretos industriales y patentes nacionales o internacionales._

**Boxes asociados:** `box_ipc_classifier`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `estado_del_arte` | texto | Búsqueda sistemática de patentes y literatura científica para asegurar que no hay infracciones. | Ej: Búsqueda en USPTO y EPO localizando 3 patentes similares, diferenciándonos por la arquitectura de red ligera. |
| `estrategia_patentes` | texto | Plan legal para la solicitud de patentes, modelos de utilidad o protección de secretos industriales. | Ej: Registro de marca nacional en IMPI y solicitud de patente internacional vía tratado PCT en Q3. |
| `clasificacion_patentes_ipc` | texto | Códigos de la Clasificación Internacional de Patentes (IPC) aplicables a tu desarrollo. | Ej: G06T 7/00 (Análisis de datos de imagen) y G06N 3/02 (Redes neuronales). |
| `secretos_industriales` | texto | Medidas de seguridad y acuerdos legales (NDA) para proteger el conocimiento no patentable. | Ej: Código fuente fragmentado en servidores seguros y contratos laborales con cláusulas estrictas de confidencialidad. |

### Pilar: Estudio de Viabilidad Técnica — `viabilidad_tecnica`

#### Módulo: Ingeniería e I+D — `technical_id` · _Escalamiento técnico de laboratorio a planta piloto y especificaciones científicas de producción._

**Boxes asociados:** `box_trl_assessment`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `escalamiento_produccion` | texto | Cómo se escalará la producción tecnológica desde el laboratorio a la producción en masa. | Ej: Migración de servidores de prueba locales a una arquitectura balanceada en la nube (AWS autoscaling). |
| `infraestructura_cientifica` | texto | Equipos de laboratorio, licencias de software de simulación y herramientas especializadas necesarias. | Ej: Servidores dedicados GPU NVIDIA A100 y licencias de simulación MATLAB/Simulink. |
| `normativas_tecnicas_calidad` | texto | Estándares internacionales obligatorios de la industria (ISO, NOM, etc.). | Ej: Cumplimiento de la norma ISO/IEC 27001 de seguridad de información y NOM-024-SCFI de hardware. |

#### Módulo: Prototipado y Pruebas — `prototyping` · _Cronograma y resultados de pruebas de concepto, maquetas físicas o prototipos alpha/beta._

**Boxes asociados:** `box_trl_assessment`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `especificaciones_prototipo` | texto | Detalla las características funcionales y físicas de tu prototipo actual. | Ej: Prototipo beta funcional en contenedor Docker con interfaz web React de diagnóstico básico. |
| `bitacora_pruebas` | texto | Registros de las pruebas técnicas realizadas, errores detectados y correcciones aplicadas. | Ej: Pruebas de estrés de 1,000 peticiones concurrentes: latencia media 120ms, 0.01% de tasa de error. |
| `certificaciones_necesarias` | texto | Sellos de calidad, validaciones de laboratorios de terceros o permisos sanitarios indispensables. | Ej: Certificación de seguridad eléctrica por la UL (Underwriters Laboratories) para distribución en EE.UU. |

### Pilar: Mercado Científico y Transferencia — `mercado_tecnologico`

#### Módulo: Mercado Tecnológico — `tech_market` · _Identificación de licenciatarios, análisis B2B o B2G, y alianzas estratégicas de co-desarrollo._

**Boxes asociados:** `box_ipc_classifier`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `clientes_industriales` | texto | Perfil del comprador B2B, integrador tecnológico o dependencias de gobierno que adquirirán la tecnología. | Ej (Estilo TSMC/Intel B2B): Plantas ensambladoras automotrices Tier 1 que buscan automatizar sus líneas de ensamble. |
| `tamaño_mercado_tecnologico` | texto | TAM, SAM, SOM enfocados en licenciamiento o ventas corporativas. | Ej: SAM: 420 plantas maquiladoras en el norte de México con un valor estimado de mercado de $15M USD anuales. |
| `alianzas_codesarrollo` | texto | Alianzas con centros de investigación, universidades o corporaciones para co-desarrollar o validar la tecnología. | Ej (Estilo MIT Media Lab): Convenio de co-desarrollo con el Instituto de Inteligencia Artificial de la Universidad de Sonora. |

#### Módulo: Disrupción vs Sostenimiento — `disrupcion_sustaining` · _Evaluación de trayectoria disruptiva (gama baja / nuevo mercado) y marco RPV organizacional._

**Boxes asociados:** `box_sustaining_vs_disruptive`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `tipo_disrupcion_gama_baja_nuevo_mercado` | texto | Clasificación estratégica: Disrupción de Gama Baja (clientes sobre-servidos) o de Nuevo Mercado (no-consumidores). | Ej: Disrupción de Gama Baja ofreciendo servicio MaaS con telemetría un 40% más accesible que los talleres tradicionales. |
| `evaluacion_rpv_recursos_procesos_valores` | texto | Auditoría del marco RPV (Recursos, Procesos y Valores) de la organización frente al vector de innovación. | Ej: Recursos: Algoritmos y bancos de prueba. Procesos: Soporte 24/7 en campo. Valores: Prioridad a contratos de servicio recurrente antes que venta única de fierros. |
| `traccion_nichos_desatendidos` | texto | Validación empírica en segmentos iniciales pequeños ignorados por los gigantes de la industria. | Ej: 12 mineras medianas en Sonora y Sinaloa operando con el sistema piloto sin competencia directa de OEM globales. |
| `defensa_competitiva_incumbentes` | texto | Asimetría de motivación: por qué a los líderes tradicionales les conviene ignorar o ceder este mercado. | Ej: Los grandes fabricantes prefieren vender maquinaria nueva de $500k USD y descuidan el mantenimiento preventivo descentralizado. |

#### Módulo: Modelo de Transferencia — `transfer_model` · _Esquema de monetización: cobro de royalties, cesión de patentes o constitución de spin-off._

**Boxes asociados:** `box_ipc_classifier`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `esquema_royalties` | texto | Estructura de cobro de regalías: porcentaje sobre ventas, licenciamiento anual o pago por uso. | Ej (Estilo ARM): Licencia anual de software SaaS de $5,000 USD por línea de producción instalada + 1% de regalías por eficiencia. |
| `constitucion_spinoff` | texto | Estrategia para crear una empresa independiente (spin-off) de base tecnológica desde la universidad o empresa madre. | Ej (Estilo Stanford Spin-offs): Transferencia del derecho de explotación de la patente universitaria a la Spin-Off a cambio de 10% de participación accionaria. |
| `estrategia_comercializacion_id` | texto | Modelo comercial de comercialización: venta directa, licenciamiento de patentes o consultoría tecnológica especializada. | Ej: Licenciamiento de la patente a distribuidores autorizados en Sudamérica y venta directa en México. |

### Pilar: Impacto Social y Ecológico (RSE) — `responsabilidad_social`

#### Módulo: Responsabilidad Social (RSE) — `rse_impact` · _Evaluación del impacto ético, social y ambiental directo del desarrollo tecnológico._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `impacto_socioambiental` | texto | Efectos directos e indirectos del uso de tu tecnología en la sociedad y el ecosistema. | Ej: Reducción de 20% en merma de producción disminuye la generación de residuos metálicos en 8 toneladas anuales. |
| `generacion_empleo_calificado` | texto | Proyecciones de contratación de ingenieros, científicos, doctores o técnicos especializados. | Ej: Contratación de 4 desarrolladores de IA senior y 2 ingenieros de automatización con salarios competitivos en la región. |
| `politica_rse` | texto | Principios éticos de la empresa de tecnología (ej. ética de inteligencia artificial, equidad de género en STEM). | Ej: Política estricta de no sesgo algorítmico y 40% de puestos técnicos ocupados por mujeres ingenieras. |

#### Módulo: Economía Circular — `circular_economy` · _Ecodiseño, ciclo de vida del producto tecnológico y manejo sostenible de insumos/residuos._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `analisis_ciclo_vida` | texto | Evaluación del impacto del producto tecnológico desde la obtención de materia prima hasta su desecho final. | Ej: Diseño modular de hardware que facilita la sustitución de piezas individuales y reciclaje de baterías de litio. |
| `estrategia_economia_circular` | texto | Cómo reintegras materiales, reciclas dispositivos obsoletos o reduces el desperdicio electrónico. | Ej: Programa de recolección de sensores viejos a cambio de descuentos en la renovación del plan anual. |
| `sustentabilidad_energetica` | texto | Consumo de energía de tus servidores, oficinas y procesos de manufactura, y el uso de fuentes renovables. | Ej: 100% de la infraestructura en la nube está alojada en centros de datos con certificación de neutralidad de carbono. |

### Pilar: Simulador y Corridas — `simulador_financiero`

#### Módulo: Simulador Financiero — `simulador` · _Simulador interactivo con proyecciones de I+D, VAN y TIR a 5 años._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `iframe_simulador` | texto | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. |


---

## Plan para Microempresa y Autoempleo (Simplificado) — `micro_business`

### Pilar: Presentación Básica — `naturaleza`

#### Módulo: Sumario Ejecutivo — `introduccion` · _Idea del negocio y objetivo principal._

**Boxes asociados:** `box_apertura_30dias`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `idea_negocio` | texto | ¿Qué vas a vender o qué servicio vas a dar? Explícalo de forma sencilla. | Ej: "Voy a poner un puesto de tacos de carne asada por las noches frente al parque." |
| `objetivo_basico` | texto | ¿Cuánto quieres vender o lograr en los primeros meses? | Ej: "Quiero vender al menos 50 órdenes diarias para sacar los gastos y mi sueldo." |

#### Módulo: Presentación de la Empresa — `identidad` · _Nombre, quiénes somos y qué ofrecemos._

**Boxes asociados:** `box_apertura_30dias`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `nombre` | texto | Nombre de tu negocio. | Ej: "Tacos El Compadre" |
| `quienes_somos` | texto | ¿Quiénes van a trabajar en el negocio y qué experiencia tienen? | Ej: "Mi esposa y yo. Yo trabajé 5 años en una taquería y ella sabe llevar las cuentas." |
| `que_ofrecemos` | texto | Tu producto estrella o servicio principal. | Ej: "Tacos, lorenzas y caramelos con tortillas hechas a mano y carne de calidad." |

### Pilar: Mercadeo Simplificado — `mercado`

#### Módulo: ¿A quién le vendemos? — `clientes` · _Quiénes son nuestros clientes y dónde están._

**Boxes asociados:** `box_apertura_30dias`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `perfil_cliente` | texto | ¿Quiénes te van a comprar? Vecinos, trabajadores, estudiantes. | Ej: "Vecinos de la colonia y personas que regresan del trabajo después de las 7 PM." |
| `ubicacion_clientes` | texto | ¿De dónde vienen tus clientes? | Ej: "Principalmente de la colonia Modelo y colonias aledañas (radio de 2 km)." |

#### Módulo: La Competencia Local — `competencia` · _Quién más hace lo mismo cerca de nosotros._

**Boxes asociados:** `box_apertura_30dias`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `competidores_locales` | texto | ¿Quién más vende lo mismo cerca de ti? | Ej: "Hay un puesto de hot dogs a la vuelta y una pizzería a dos cuadras." |
| `nuestra_ventaja` | texto | ¿Por qué te van a comprar a ti en vez de a ellos? | Ej: "Mis salsas son caseras, uso tortilla recién hecha y atiendo muy rápido." |

#### Módulo: Precios y Promoción — `comercializacion` · _Cómo calculamos el precio y cómo nos damos a conocer._

**Boxes asociados:** `box_apertura_30dias`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `lista_precios` | texto | Precio de tus productos principales. | Ej: "Taco: $35. Caramelo: $70. Refresco: $25." |
| `como_promocionamos` | texto | ¿Cómo vas a conseguir clientes? | Ej: "Pondré una lona luminosa grande, repartiré volantes en la colonia y abriré una página de Facebook." |

### Pilar: Producción y Operaciones — `tecnico`

#### Módulo: ¿Cómo trabajamos? — `operacion` · _Paso a paso de lo que hacemos en un día normal._

**Boxes asociados:** `box_apertura_30dias`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `paso_a_paso_diario` | texto | ¿Cómo es un día normal de trabajo desde que compras hasta que cierras? | Ej: "1. A las 9 AM compro la carne y verduras. 2. A las 2 PM pico y marino la carne. 3. A las 5 PM pongo el carbón y arreglo las mesas. 4. De 6 PM a 12 AM atiendo clientes. 5. Limpieza." |

#### Módulo: Equipos y Herramientas — `recursos` · _Lo que necesitamos comprar o tener para empezar._

**Boxes asociados:** `box_apertura_30dias`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `herramientas_necesarias` | texto | Lista de equipo pesado o herramientas clave. | Ej: "Asador grande, carreta de acero, hielera, mesas, sillas y una lona." |
| `materiales_basicos` | texto | Lo que compras seguido para poder vender. | Ej: "Carne, tortillas, verduras, carbón, servilletas y refrescos." |

#### Módulo: Croquis del Local — `croquis` · _Distribución física del espacio de trabajo._

**Boxes asociados:** `box_micro_croquis_2d`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `descripcion_espacio` | texto | ¿Dónde te vas a ubicar y cuánto mide el lugar? | Ej: "En la banqueta de mi casa, ocupando un espacio de 3x4 metros." |
| `distribucion_areas` | texto | ¿Cómo acomodarás las cosas? | Ej: "La carreta de frente a la calle, la hielera a un lado del cajero y 4 mesas acomodadas en escuadra." |

### Pilar: Plan Financiero Básico — `organizacion`

#### Módulo: ¿Cuánto ocupamos para iniciar? — `inversion` · _Dinero necesario para arrancar el negocio._

**Boxes asociados:** `box_apertura_30dias`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `total_inversion` | texto | ¿Cuánto dinero ocupas para arrancar el primer día? | Ej: "Ocupo $15,000 para comprar la carreta usada, $3,000 de permisos y $2,000 de mandado." |
| `de_donde_sale` | texto | ¿Quién pondrá el dinero o de dónde se pedirá? | Ej: "Tengo ahorrados $10,000 y pediré $10,000 de préstamo familiar." |

#### Módulo: Gastos de cada mes — `costos` · _Lista de pagos fijos como luz, agua, renta y sueldos._

**Boxes asociados:** `box_micro_canvas_3b`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `lista_gastos_mensuales` | texto | Pagos fijos mes a mes (renta, luz, ayudante). | Ej: "Pago de luz $500, permiso de piso $1,000, sueldo del ayudante $4,000 al mes." |
| `costos_por_producto` | texto | ¿Cuánto te cuesta hacer un producto y en cuánto lo vendes? | Ej: "Hacer un taco me cuesta $15 (carne+tortilla+salsa) y lo vendo a $35. Ganancia: $20." |

#### Módulo: Punto de Equilibrio Micro — `punto_equilibrio_micro` · _Cálculo exacto de unidades mínimas de venta para cubrir costos fijos y variables._

**Boxes asociados:** `box_punto_equilibrio_micro`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `costos_fijos_mensuales` | texto | Suma total de gastos obligatorios de cada mes que debes pagar vendas o no vendas (renta, luz, gas, permisos). | Ej: Total costos fijos: $8,500 MXN mensuales (Renta local $4,500 + Luz y gas $2,500 + Permiso municipal $1,500). |
| `costo_variable_unitario` | texto | Costo de materia prima, insumos directos y empaque que cuesta fabricar una sola unidad o atender un cliente. | Ej: $18.50 MXN por platillo (carne $12.00, verduras y salsas $4.00, desechables $2.50). |
| `precio_venta_unitario` | texto | Precio al que ofreces cada unidad al cliente final en el mostrador. | Ej: Precio de venta al público: $55.00 MXN por platillo. |
| `punto_equilibrio_unidades` | texto | Cantidad exacta de unidades que debes vender en el mes para quedar 'a mano' (sin ganar ni perder): CF / (P - CVu). | Ej: $8,500 / ($55 - $18.50) = 233 unidades al mes (promedio de 8 a 9 platillos diarios de martes a domingo). |
| `margen_contribucion_ganancia` | texto | Ganancia limpia por cada unidad vendida (Precio - Costo Variable) y porcentaje de contribución. | Ej: Margen de contribución: $36.50 MXN por unidad (66.4% del precio de venta). |


---

## Proyecto de Inversión (Ingeniería y Finanzas) — `investment_project`

### Pilar: Estudio de Mercado Cuantitativo — `mercado_cuantitativo`

#### Módulo: Análisis de Demanda — `demanda` · _Datos duros, elasticidad y comportamiento histórico._

**Boxes asociados:** `box_tam_sam_som`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `demanda_historica` | texto | Análisis histórico de la demanda con datos duros y series de tiempo. | Ej: "La demanda de energía en la región noroeste creció 4.5% anual de 2018 a 2024 (Fuente: CENACE)." |
| `elasticidad` | texto | Cálculo de la elasticidad precio-demanda o sensibilidad del consumo ante variables macroeconómicas. | Ej: "Elasticidad precio de -0.8; la demanda es relativamente inelástica ante incrementos tarifarios." |

#### Módulo: Proyección de Oferta — `oferta` · _Modelos de proyección para oferta, déficit y demanda futura._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `proyeccion_oferta` | texto | Modelo econométrico de cómo se comportará la oferta y demanda en los próximos 10-20 años. | Ej: "Se proyecta un déficit de 1,200 MW para 2030 debido al retiro de plantas de carbón." |

#### Módulo: Inteligencia de Mercado en Cascada — `inteligencia_mercado_cascada` · _Investigación multinivel: Local INEGI DENUE, Scraping Nacional y APIs de Comercio Internacional._

**Boxes asociados:** `box_cascada_mercado_3niveles`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `fuente_datos_local` | texto | Registra los datos censales locales obtenidos de INEGI DENUE. Especifica municipio, código SCIAN de actividad, estrato de personal y densidad competitiva territorial. | Ej: 'En Hermosillo, Sonora (SCIAN 311612 - Elaboración de embutidos y carnes preparadas), se censaron 14 establecimientos con estrato de 11 a 50 empleados'. |
| `consulta_web_scraping` | texto | Documenta los hallazgos de prospección y web scraping multi-fuente a nivel estatal y nacional (DuckDuckGo, Tavily Search, Google Maps/Knowledge Graph). Incluye precios públicos, presencia digital y reseñas. | Ej: 'Scraping en Sonora y Sinaloa identificó 6 distribuidores cárnicos mayoristas con precios de Rib-Eye envasado entre $340 y $420 MXN/kg sin certificación TIF'. |
| `consulta_internacional_api` | texto | Detalla los flujos arancelarios, cuotas y demanda internacional consultados en APIs y bases de comercio exterior (ITC Trade Map, UN Comtrade, USDA/FAS, World Bank). Registra fracción arancelaria y volumen transfronterizo. | Ej: 'Bajo la fracción arancelaria HS 0202.30 (Carne deshuesada congelada), el mercado de Arizona importó 34,200 ton en 2025 con arancel preferencial T-MEC del 0%'. |
| `validacion_cruzada` | texto | Sintetiza la triangulación entre la capa local (INEGI), nacional (Web Scraping) e internacional (APIs comerciales). Formula el dictamen de viabilidad comercial y la estrategia de posicionamiento escalable. | Ej: 'La triangulación valida viabilidad comercial regional inmediata (Fase 1) por déficit de oferta con valor agregado en Hermosillo, y respalda el salto a exportación (Fase 2) hacia Phoenix/Tucson'. |

### Pilar: Ingeniería del Proyecto — `ingenieria_tecnica`

#### Módulo: Ingeniería Básica — `ingenieria` · _Diseño macro, tecnología y memorias de cálculo._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `ingenieria_basica` | texto | Descripción técnica de nivel macro (planos conceptuales, tecnología seleccionada). | Ej: "Planta fotovoltaica de 50 MW con paneles bifaciales monocristalinos y seguidores de un eje." |
| `memoria_calculo` | texto | Resumen de las memorias de cálculo de ingeniería civil, estructural y electromecánica. | Ej: "Cálculo estructural para resistir ráfagas de viento de 150 km/h según normativa CFE 2024." |

#### Módulo: Instalaciones y Lay-out — `layout` · _Distribución física, terreno y obras._

**Boxes asociados:** `box_layout_industrial`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `layout_industrial` | texto | Distribución física (Lay-out), requerimientos de terreno y obras de preparación. | Ej: "Terreno de 100 hectáreas con compactación tipo B. Subestación elevadora en el cuadrante noreste." |

### Pilar: Presupuesto Base de Obra (CAPEX) — `presupuesto_obra`

#### Módulo: Catálogo y Costos — `presupuesto` · _Catálogo de conceptos y explosión de insumos físicos._

**Boxes asociados:** `box_capex_csi_table`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `catalogo_conceptos` | texto | Listado exhaustivo de todas las partidas de obra y equipamiento. | Ej: "Partida 1: Terracerías. Partida 2: Cimentación. Partida 3: Montaje electromecánico." |
| `explosion_insumos` | texto | Resumen cuantitativo de los insumos físicos más relevantes a adquirir. | Ej: "120,000 paneles solares de 600W, 400 toneladas de acero estructural, 25 inversores centrales." |

#### Módulo: Desglose CAPEX CSI-16 — `capex_csi_16` · _Estructuración según las 16 divisiones estándar CSI de construcción y maquinaria._

**Boxes asociados:** `box_capex_csi_table_16div`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `division_csi_codigo` | texto | Código de división según el estándar CSI MasterFormat de 16 divisiones (ej. Div 02 Sitio, Div 03 Concreto, Div 11 Equipamiento). | Ej: 'División 11 - Equipamiento: Hornos ASADHOR, túnel de congelación criogénica y cuartos fríos'. |
| `concepto_obra_maquinaria` | texto | Descripción técnica detallada del concepto de obra civil, instalación industrial o maquinaria pesada. | Ej: 'Suministro e instalación de túnel criogénico IQF con capacidad de 1,200 kg/hora a -40°C en acero inoxidable 304'. |
| `unidad_medida_cantidad` | texto | Unidad de medida estándar (m², m³, lote, pza, kg) y volumen total cuantificado en proyecto. | Ej: '5 piezas de hornos rotativos ASADHOR industriales de 12 niveles'. |
| `costo_unitario_importe` | texto | Precio unitario antes de impuestos y desglose de mano de obra, equipo e insumos. | Ej: '$750,000 MXN precio unitario por horno ASADHOR puesto en planta Hermosillo'. |
| `total_inversion_csi` | texto | Suma acumulada del CAPEX por cada división CSI y porcentaje de participación sobre la inversión total. | Ej: 'División 11 Equipamiento: $8,000,000 MXN representando el 47.6% del CAPEX total'. |

#### Módulo: Cronograma Físico-Financiero — `cronograma` · _Avance de obra vs. desembolso de capital mensual._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `cronograma_fisico_financiero` | texto | Calendario de ejecución de obra cruzado con los desembolsos de capital requeridos. | Ej: "Mes 1-3: Ingeniería 10% del CAPEX. Mes 4-8: Procura 60%. Mes 9-12: Construcción 30%." |

### Pilar: Estructura de Capital — `estructura_capital`

#### Módulo: Costo de Capital (WACC) — `capital` · _Cálculo del Costo Promedio Ponderado de Capital._

**Boxes asociados:** `box_wacc_van_tir`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `wacc` | texto | Cálculo del Costo Promedio Ponderado de Capital (WACC / CPPC). | Ej (Estilo BlackRock): "WACC del 11.5% asumiendo 40% Equity (costo 15%) y 60% Deuda (costo 9.1%)." |

#### Módulo: Apalancamiento y Deuda — `deuda` · _Estructura del crédito y amortizaciones._

**Boxes asociados:** `box_wacc_van_tir`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `apalancamiento` | texto | Estructura de la deuda: bancos involucrados, plazos, tasas y garantías. | Ej (Estilo JP Morgan): "Crédito Sindicado a 15 años. Tasa SOFR + 3.5%. Garantía prendaria sobre los equipos." |
| `servicio_deuda` | texto | Tabla de amortización proyectada, pagos de capital e intereses (DSCR). | Ej: "DSCR mínimo esperado de 1.45x durante los primeros 5 años de operación." |

### Pilar: Riesgo Matemático y Sensibilidad — `riesgo_matematico`

#### Módulo: Análisis de Sensibilidad — `sensibilidad` · _Sensibilidad unidimensional y multivariable._

**Boxes asociados:** `box_tornado_sensibilidad`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `sensibilidad_unidimensional` | texto | Tornado de sensibilidad: cómo cambia la TIR si se altera una sola variable crítica (ej. CAPEX o Precio). | Ej: "Si el costo del acero sube 20%, la TIR del proyecto baja de 14.5% a 12.1%." |
| `escenarios` | texto | Análisis de escenarios consolidados: Caso Base, Caso Pesimista y Caso Optimista. | Ej: "Caso Pesimista (Retraso de obra de 6 meses + inflación 8%): El proyecto mantiene VAN positivo." |

#### Módulo: Diagrama Tornado de Riesgo — `tornado_sensibilidad` · _Variación de variables críticas (precio, volumen, CAPEX) sobre el VAN._

**Boxes asociados:** `box_tornado_chart`, `box_tornado_sensibilidad`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `variable_critica_analizada` | texto | Nombre del parámetro operativo o financiero sometido a prueba de sensibilidad extrema en el diagrama Tornado. | Ej: 'Precio promedio de venta por kg de corte ($220 MXN base) y costo de carne en canal ($82/kg base)'. |
| `rango_variacion_porcentual` | texto | Rango de variación estocástica aplicado en el análisis (ej. +/- 10%, +/- 20% o +/- 25%). | Ej: 'Variación de +/- 20% sobre el volumen de ventas y +/- 15% en costos de energía eléctrica'. |
| `van_escenario_pesimista` | texto | Valor Presente Neto resultante cuando la variable se deteriora hasta el límite inferior del rango. | Ej: 'Con caída del 20% en volumen, el VAN disminuye de +$12.5M a +$3.8M MXN (se mantiene viable)'. |
| `van_escenario_optimista` | texto | Valor Presente Neto proyectado cuando la variable alcanza el límite superior favorable. | Ej: 'Con incremento del 20% en demanda y captura de nicho premium, el VAN escala a +$21.4M MXN'. |
| `umbral_tolerancia_riesgo` | texto | Caída máxima porcentual que resiste el proyecto antes de que el VAN se vuelva cero (punto de quiebre financiero). | Ej: 'El proyecto resiste una caída de hasta 28.5% en el precio de venta antes de entrar en zona de destrucción de valor'. |

#### Módulo: Simulación de Riesgo — `probabilidad` · _Simulación probabilística tipo Monte Carlo._

**Boxes asociados:** `box_montecarlo_sim`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `simulacion_montecarlo` | texto | Resultados de simulación probabilística (iteraciones) sobre la viabilidad del proyecto. | Ej (Estilo Goldman Sachs): "Tras 10,000 iteraciones, existe un 92% de probabilidad de que la TIR supere el WACC (11.5%)." |

### Pilar: Simulador y Corridas — `simulador_financiero`

#### Módulo: Simulador Financiero — `simulador` · _Simulador interactivo avanzado con corridas dinámicas de inversión a 5 años._

**Boxes asociados:** `box_wacc_van_tir`, `box_montecarlo_sim`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `iframe_simulador` | texto | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. |


---

## ZOPP / Marco Lógico (Enfoque Alemán-BID) — `zopp`

### Pilar: Análisis de la Situación — `analisis_situacion`

#### Módulo: Matriz de Participación — `participacion` · _Identificación, intereses y expectativas de involucrados._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `matriz_participacion` | texto | Análisis de involucrados: grupos diana, aliados, oponentes, intereses y expectativas percibidas. | Ej: Pequeños ganaderos sonorenses (Aliados clave, alto interés, necesidad de precio justo en canal). |

#### Módulo: Árbol de Problemas — `problemas` · _Análisis causal de causas directas, indirectas y efectos._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `analisis_problemas` | texto | Árbol de problemas causa-efecto identificando el problema central focalizado y sus causas raíz. | Ej: Problema central: Elevada merma y bajo margen de ganancia de carnicerías locales frente a monopolios. |

### Pilar: Planificación Estratégica (MPP) — `planificacion_mpp`

#### Módulo: Árbol de Objetivos — `objetivos` · _Conversión de problemas a soluciones, medios y fines._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `analisis_objetivos` | texto | Árbol de objetivos convirtiendo los estados negativos del problema en estados positivos alcanzables. | Ej: Objetivo central: Incrementar la rentabilidad de las carnicerías eliminando el 30% de merma de cocción. |

#### Módulo: Análisis de Alternativas — `analisis_alternativas_zopp` · _Evaluación comparativa de estrategias según viabilidad técnica y financiera._

**Boxes asociados:** `box_matriz_alternativas_zopp`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `alternativas_identificadas` | texto | Descripción de las diferentes ramas y opciones de solución derivadas del árbol de objetivos. | Ej: Opción 1: Construcción de planta propia; Opción 2: Alianza de maquila TIF; Opción 3: Distribución directa. |
| `criterios_evaluacion` | texto | Factores de ponderación cuantitativa y cualitativa para evaluar cada alternativa identificada. | Ej: Costo financiero (30%), tiempo de implementación (25%), impacto social (25%) y riesgo operativo (20%). |
| `alternativa_seleccionada` | texto | Fundamentación de la alternativa ganadora seleccionada y justificación de descarte de las demás opciones. | Ej: Se selecciona la Opción 2 (Maquila TIF + Marca Propia) por maximizar el VAN y reducir el tiempo de salida al mercado. |

#### Módulo: Matriz Lógica (MPP 4x4) — `matriz_logica` · _Resumen narrativo, indicadores verificables, fuentes y supuestos._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `mpp` | texto | Matriz de Planificación del Proyecto (equivalente a Marco Lógico). | Ej: Objetivo general, propósito, resultados, actividades. |

### Pilar: Operación y Recursos — `cronograma_presupuesto`

#### Módulo: Plan de Actividades (Gantt) — `planificacion_actividades_cronograma` · _Desglose de paquetes de trabajo, hitos y ruta crítica._

**Boxes asociados:** `box_gantt_actividades_zopp`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `paquetes_actividades` | texto | Desglose estructurado de actividades requeridas para producir cada uno de los componentes. | Ej: Actividad 1.1: Instalación y comisionamiento del horno industrial. Actividad 1.2: Calibración térmica NOM-251. |
| `ruta_critica_gantt` | texto | Cronograma de ejecución identificando la secuencia de tareas críticas que determinan la duración total. | Ej: Ruta crítica: Obtención de licencia sanitaria COFEPRIS (mes 2) -> Llegada de horno (mes 3) -> Prueba piloto. |
| `responsables_hitos` | texto | Asignación unívoca de responsabilidades de gestión y auditoría para cada hito clave. | Ej: Hito 1 (Auditoría sanitaria): Director de Inocuidad. Hito 2 (Contratos HORECA): Gerente Comercial. |

#### Módulo: Presupuesto por Componentes — `presupuesto_componentes` · _Asignación de costos de inversión y operación por resultado._

**Boxes asociados:** `box_presupuesto_componentes`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `costos_inversion_zopp` | texto | Presupuesto de capital asignado para la adquisición de infraestructura y equipamiento de arranque. | Ej: Inversión en adecuación de taller piloto y 1 horno ASADHOR: $4,000,000 MXN. |
| `costos_operacion_zopp` | texto | Presupuesto de gasto recurrente necesario para mantener las actividades en funcionamiento continuo. | Ej: $320,000 MXN mensuales en nómina de operarios, gas natural, empaque al vacío y logística local. |
| `fuentes_financiamiento_zopp` | texto | Origen de los fondos asignados: aportes de socios, créditos de desarrollo o fondos multilaterales. | Ej: 60% aporte de socios fundadores ($2.4M) + 40% crédito blando estatal FIDESON ($1.6M). |

### Pilar: Evaluación y Sostenibilidad — `evaluacion_sostenibilidad`

#### Módulo: Evaluación Ex-Post y Factores — `evaluacion_expost` · _Criterios de pertinencia, eficacia, impacto y continuidad operativa._

**Boxes asociados:** `box_evaluacion_expost_lista`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `pertinencia_evaluacion` | texto | Evaluación ex-post de congruencia: si los objetivos del proyecto respondieron adecuadamente a la necesidad real. | Ej: 100% de pertinencia al resolver la escasez de mano de obra calificada en cocinas restauranteras. |
| `eficacia_impacto` | texto | Grado de consecución del propósito y medición del impacto socioeconómico generado a mediano plazo. | Ej: Se alcanzó el 104% de la meta de producción y los restaurantes redujeron costos en 22% promedio. |
| `sostenibilidad_futura` | texto | Capacidad institucional, tecnológica y financiera del proyecto para continuar operando sin apoyos externos. | Ej: Flujo de caja libre positivo mensual de $1.5M MXN garantiza autofinanciamiento y reinversión continua. |


---

## Horizon Europe (Unión Europea) — `horizon_europe`

### Pilar: Excelencia y Ciencia Abierta — `excelencia_cientifica`

#### Módulo: Consorcio Transnacional — `consorcio` · _Estructura internacional de socios, capacidades y gobernanza._

**Boxes asociados:** `box_dnsh_ue_6`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `consorcio_multinacional` | texto | Estructura de partners internacionales y división de roles científicos. | Ej (Estilo Airbus/BioNTech): Instituto Fraunhofer (Líder WP1-I+D), SAP (WP2-Software). |

#### Módulo: Open Science — `ciencia_abierta` · _Políticas de ciencia abierta y acceso libre a publicaciones._

**Boxes asociados:** `box_dnsh_ue_6`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `open_science` | texto | Plan de gestión de datos FAIR y diseminación en repositorios abiertos. | Ej (Estilo CERN): Publicación de datasets de simulación en Zenodo con licencia CC-BY. |

#### Módulo: Gestión de Datos FAIR (DMP) — `gestion_datos_fair_dmp` · _Plan de gestión de datos: Localizables, Accesibles, Interoperables y Reutilizables._

**Boxes asociados:** `box_dmp_fair_checklist`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `repositorios_fair` | texto | Plataformas y repositorios certificados donde se depositarán los conjuntos de datos científicos (Zenodo, Dryad). | Ej: Datasets genómicos y espectroscópicos depositados en Zenodo con DOI asignado de acceso abierto. |
| `politica_acceso_abierto` | texto | Régimen de publicación científica de acceso abierto inmediato bajo licencia Creative Commons (CC-BY). | Ej: Todas las publicaciones científicas revisadas por pares serán publicadas en revistas Q1 Open Access sin embargo temporal. |
| `plan_gestion_datos_dmp` | texto | Data Management Plan (DMP): tipos de datos generados, preservación a largo plazo y curaduría ética. | Ej: DMP vivo actualizado en M6 y M18 con protocolos de cifrado y anonimización de datos sensibles. |

### Pilar: Impacto y Sostenibilidad — `impacto_sostenibilidad`

#### Módulo: Principio DNSH (UE) — `dnsh_principle` · _Garantía de no causar daño significativo a los 6 objetivos ambientales de la UE._

**Boxes asociados:** `box_dnsh_ue_6`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `dnsh` | texto | Principio Do No Significant Harm. Demostrar que el proyecto no daña ninguno de los 6 objetivos medioambientales. | Ej (Estilo Northvolt): El proceso de reciclaje reduce 80% emisiones de CO2 sin generar efluentes tóxicos. |

#### Módulo: Impacto Más Allá del SOTA — `impacto` · _Avance científico sobre el estado del arte y beneficios para la UE._

**Boxes asociados:** `box_dnsh_ue_6`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `excelencia` | texto | Impacto más allá del estado del arte. | Ej: Eficiencia cuántica 20% superior al referente actual comercializado por IBM. |

#### Módulo: Pathway de Impacto (TRL 6-9) — `impacto_pathway_trl` · _Ruta de maduración tecnológica desde prototipo hasta despliegue de mercado._

**Boxes asociados:** `box_impacto_pathway_trl6_9`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `pathway_hacia_mercado` | texto | Ruta de adopción y escalamiento: pasos concretos para transferir el resultado de investigación a la industria y sociedad. | Ej: Validación en entorno industrial simulado (M12) -> Licenciamiento piloto a socio del consorcio (M24) -> Comercialización global (M36). |
| `trl_inicial_final` | texto | Nivel de madurez tecnológica inicial al arranque de la propuesta y nivel TRL objetivo garantizado al cierre. | Ej: TRL inicial = 5 (validación en entorno relevante) -> TRL final = 8 (sistema completo y cualificado). |
| `kpis_impacto_socioeconomico` | texto | Indicadores cuantitativos de impacto en empleo, competitividad europea, reducción de huella de carbono y salud. | Ej: Reducción de 12,000 tCO2e anuales, creación de 85 empleos de alta cualificación y ahorro de $15M EUR en costes hospitalarios. |

### Pilar: Implementación y Presupuesto EU — `implementacion_trabajo`

#### Módulo: Diseminación y Explotación — `diseminacion_explotacion` · _Estrategia de comunicación científica, patentes conjuntas y adopción comercial._

**Boxes asociados:** `box_plan_diseminacion_eu`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `medidas_diseminacion` | texto | Plan de comunicación para audiencias no científicas: web pública, notas de prensa, redes, webinars y talleres. | Ej: Portal web multilingüe, 6 notas de prensa europeas, 4 workshops para PyMEs y campaña en LinkedIn con alcance > 50,000 profesionales. |
| `propiedad_intelectual_consorcio` | texto | Consortium Agreement (CA): régimen de propiedad del 'Background' previo y titularidad del 'Foreground' conjunto. | Ej: Acuerdo DESCA: Cada socio retiene la propiedad de sus patentes previas; las patentes conjuntas se licencian con regalías proporcionales. |
| `hoja_ruta_explotacion` | texto | Modelo de negocio y plan de explotación comercial o institucional post-proyecto por los socios industriales. | Ej: Socio industrial A adquiere la opción exclusiva de explotación comercial en Europa pagando 3% royalties a las universidades asociadas. |

#### Módulo: Presupuesto UE por Categorías — `presupuesto_eu_microsoft` · _Costes de personal, equipamiento, subcontratación y 25% flat indirecto._

**Boxes asociados:** `box_presupuesto_eu_categorias`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `costes_personal_wp` | texto | Presupuesto de meses-persona (Person-Months) valorados según tarifas horarias institucionales auditadas. | Ej: 140 Person-Months totales distribuidos entre 6 socios: €980,000 EUR en personal investigador y técnico. |
| `subcontratacion_equipo` | texto | Costes de adquisición y depreciación de equipamiento científico especializado y tareas menores subcontratadas. | Ej: Depreciación de cromatógrafo de gases (€45,000 EUR) + Subcontratación de secuenciación genética (€30,000 EUR). |
| `gastos_indirectos_flat25` | texto | Cálculo automático de costes indirectos (overhead) como tasa fija del 25% sobre los costes directos elegibles. | Ej: Costes directos elegibles: €1,200,000 EUR -> 25% Flat Indirect Costs: €300,000 EUR. Total: €1,500,000 EUR. |


---

## Hoshin Kanri (Japón - Planificación Estratégica) — `hoshin_kanri`

### Pilar: Visión y Breakthroughs — `vision_largo_plazo`

#### Módulo: True North (Norte Verdadero) — `norte_verdadero` · _Visión de propósito inmutable a 5-10 años._

**Boxes asociados:** `box_matriz_x_hoshin`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `true_north` | texto | Visión a 10 años. El propósito inalterable de la organización. | Ej (Estilo Toyota/Honda): "Cero emisiones y cero colisiones para 2040". |

#### Módulo: Objetivos Breakthrough — `disrupcion` · _Metas de ruptura que transforman la competitividad del negocio._

**Boxes asociados:** `box_matriz_x_hoshin`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `breakthroughs` | texto | Objetivos disruptivos anuales que cambian el status quo. | Ej (Estilo Nissan): Reducir el tiempo de ensamble de baterías de 4 horas a 45 minutos. |

### Pilar: Alineación Estratégica — `alineacion_ejecucion`

#### Módulo: Matriz X (4 Cuadrantes) — `matriz_x` · _Correlación entre visión, objetivos anuales, prioridades y métricas._

**Boxes asociados:** `box_matriz_x_hoshin`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `matriz_x` | texto | Herramienta que alinea visión a largo plazo, objetivos anuales, iniciativas y métricas. | Ej (Estilo Sony): Eje Sur (Iniciativa: Lente 8K) conectado con Eje Este (KPI: Reducir costo 15%). |

#### Módulo: Catchball & Nemawashi — `catchball_nemawashi` · _Proceso bidireccional de consenso y negociación de recursos entre niveles._

**Boxes asociados:** `box_catchball_nemawashi`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `proceso_catchball` | texto | Mecanismo bidireccional 'lanzar y atrapar la pelota' entre alta dirección y mandos medios para acordar metas y recursos. | Ej: Dirección propone reducir mermas 50%; operaciones responde que requiere $400k en mantenimiento para comprometer la meta. |
| `acuerdos_nemawashi` | texto | Proceso informal de consulta previa (Nemawashi: 'preparar las raíces') para crear consenso antes de reuniones formales. | Ej: Sesiones uno a uno con líderes sindicales y jefes de turno para alinear la implementación de turnos rotativos. |
| `retroalimentacion_vertical` | texto | Canal formal para que los colaboradores de primera línea reporten impedimentos del sistema a la dirección. | Ej: Sistema diario de paradas Andon y buzón de kaizen donde el 80% de sugerencias se resuelven en < 48 horas. |

#### Módulo: Despliegue de Informes A3 — `a3_deployment` · _Estructuración concisa del problema, causa raíz, contramedidas y plan._

**Boxes asociados:** `box_a3_template_lean`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `antecedentes_a3` | texto | Sección 1 del informe A3: Contexto estratégico y justificación de por qué este problema debe resolverse ahora. | Ej: 'Las devoluciones por cocción irregular aumentaron 8% en el último trimestre, arriesgando contratos con 3 cadenas'. |
| `condicion_actual_a3` | texto | Sección 2 del informe A3: Mapeo visual del estado actual del proceso (Value Stream Map) y cuantificación del dolor. | Ej: 'Tiempo de ciclo actual de 180 min con desviación estándar de 45 min debido a fallas en quemadores'. |
| `contramedidas_plan_accion` | texto | Secciones 3 y 4 del A3: Acciones correctivas a la causa raíz (5 Porqués), responsables, fechas y verificación. | Ej: 'Instalación de pirómetros digitales (responsable: Mantenimiento, fecha: 15 Oct, meta: dispersión < 2°C)'. |

### Pilar: Seguimiento y Control Continuo — `seguimiento_mejora`

#### Módulo: Bowler Charts — `seguimiento` · _Revisión mensual visual con semaforización de desviaciones._

**Boxes asociados:** `box_matriz_x_hoshin`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `bowler` | texto | Indicadores de revisión visual mensual. | Ej: Gráfico de semáforo Andon para la línea de producción de motores. |

#### Módulo: Ciclo PDCA de Mejora — `pdca_hoshin` · _Planear, Hacer, Verificar y Actuar para institucionalizar aprendizajes._

**Boxes asociados:** `box_pdca_ciclo_hoshin`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `ciclo_planear_hacer` | texto | Etapas Plan y Do del ciclo Deming: formulación de hipótesis operativas y ejecución piloto controlada. | Ej: Plan: Estandarizar receta térmica en horno 1. Do: Procesar 50 lotes piloto registrando tiempos y temperaturas. |
| `auditoria_verificar` | texto | Etapa Check: Comparación cuantitativa rigurosa entre el resultado obtenido y el objetivo planeado. | Ej: De los 50 lotes, 48 cumplieron la textura deseada (96% de eficacia frente a la meta del 95%). |
| `estandarizacion_actuar` | texto | Etapa Act: Actualización de procedimientos operativos estándar (SOP), manuales de trabajo y capacitación. | Ej: Registro del procedimiento SOP-COC-04 y capacitación del 100% de los operadores en el nuevo protocolo térmico. |

#### Módulo: OKRs Alineados a la Matriz X — `okrs_alineados` · _Objetivos trimestrales y resultados clave de equipos operativos._

**Boxes asociados:** `box_okr_scorecard`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `objetivos_trimestrales_okr` | texto | Objetivos cualitativos ambiciosos y motivadores (Objectives) fijados para un horizonte de 90 días. | Ej: 'Convertir la planta en el referente de inocuidad del noroeste de México durante el Q4'. |
| `resultados_clave_medibles` | texto | Resultados clave cuantitativos (Key Results) que miden si el objetivo fue alcanzado de forma inequívoca. | Ej: 'KR1: 0 hallazgos en auditoría COFEPRIS. KR2: 100% lotes con trazabilidad QR. KR3: OTD >= 98%'. |
| `scorecard_cumplimiento` | texto | Tablero de evaluación final del trimestre con calificación del 0.0 al 1.0 por resultado clave. | Ej: 'Calificación promedio Q4: 0.82 (Verde / Éxito sobresaliente según escala OKR de Google)'. |


---

## Amoeba Management (Kyocera - Micro-Ganancias) — `amoeba_management`

### Pilar: Estructuración y Filosofía — `estructuracion_celulas`

#### Módulo: Mapeo de Células Amoeba — `celulas` · _División de la organización en micro-unidades de ganancia autónomas._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `mapeo_celulas` | texto | División de la empresa en micro-centros de ganancia independientes. | Ej (Estilo Kyocera/Alibaba): Dividir operaciones en 50 células (Ej. Amoeba de Servidores, Amoeba de Logística). |

#### Módulo: Filosofía Inamori — `filosofia_corp` · _Principios de gestión basados en hacer lo correcto como ser humano._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `filosofia` | texto | Alineación de los miembros de la célula con los valores nucleares. | Ej (Estilo Inamori/Jack Ma): "Hacer lo correcto como ser humano" y priorizar al cliente antes que al accionista. |

#### Módulo: 12 Principios de Gestión Inamori — `principios_inamori_12` · _Reglas fundamentales: fijar metas elevadas, precio óptimo y transparencia total._

**Boxes asociados:** `box_12_principios_inamori`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `doce_principios_gestion` | texto | Implementación de los 12 principios de gestión de Kazuo Inamori (propósito altruista, fijar metas elevadas, ventas máximas con gastos mínimos). | Ej: 'Principio 6: La fijación del precio es la gestión directiva (hallar el punto máximo que el cliente pagará gustosamente)'. |
| `motivacion_empleados` | texto | Estrategias para que cada líder de célula y operador actúe y tome decisiones con mentalidad de dueño y socio. | Ej: Reuniones diarias de arranque donde el líder de célula expone los ingresos y costos del día previo a todo el equipo. |
| `gestion_transparente` | texto | Política de 'vidrio transparente': cuentas contables abiertas y visibles para todos los integrantes de la célula sin secretos. | Ej: Pantalla en taller donde se actualizan en tiempo real las horas trabajadas, los insumos consumidos y el margen del día. |

### Pilar: Economía Interna y Productividad — `economia_interna`

#### Módulo: Precios de Transferencia — `precios` · _Tarifas de compra-venta justa entre células internas sin márgenes ficticios._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `precios_transferencia` | texto | Cómo una célula le "vende" internamente a otra. | Ej: Amoeba de Diseño le cobra $50 USD la hora a Amoeba de Manufactura por el plano CAD. |

#### Módulo: Rentabilidad por Hora — `rentabilidad` · _Cálculo de valor generado por hora: (Ventas Netas - Gastos) / Horas Totales._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `rentabilidad_hora` | texto | Cálculo de la utilidad generada dividida por las horas trabajadas. | Ej: Rentabilidad por hora = (Ingreso Amoeba - Costos no laborales) / Total Horas del equipo. |

#### Módulo: Gestión Basada en el Tiempo — `time_based_management` · _Eliminación sistemática de tiempos improductivos y maximización de valor/hora._

**Boxes asociados:** `box_time_based_amoeba`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `control_horas_celula` | texto | Registro estricto y auditoría del total de horas hombre dedicadas a la producción para el denominador de rentabilidad. | Ej: 4 operadores x 40 horas/semana = 160 horas semanales registradas por biometría digital sin horas muertas no imputadas. |
| `minimizacion_desperdicio_tiempo` | texto | Detección y erradicación de las 7 mudas de tiempo: esperas, traslados innecesarios y retrabajos en la célula. | Ej: Reorganización del herramental en células de trabajo en 'U' redujo traslados en 25 minutos por turno. |
| `indicador_valor_agregado_hora` | texto | Métrica maestra de Inamori: Valor Agregado por Hora = (Ventas Netas - Gastos Directos sin nómina) / Total Horas. | Ej: ($180,000 MXN ingresos - $60,000 gastos) / 480 horas = $250 MXN de valor neto generado por hora hombre. |

### Pilar: Comunicación Operativa — `operaciones_comunicacion`

#### Módulo: Protocolo Ho-Ren-So — `horenso_reportar_contactar_consultar` · _Reglas de comunicación: Hokoku (Reportar), Renraku (Informar), Sodan (Consultar)._

**Boxes asociados:** `box_horenso_protocolo_3pasos`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `protocolo_hokoku_informe` | texto | Hokoku (Informar): Deber inmediato de reportar hechos objetivos, incidentes y avances al superior jerárquico sin demora. | Ej: Si un corte sale de temperatura, el operador informa en < 5 minutos al líder de célula antes de continuar la tanda. |
| `protocolo_renraku_comunicacion` | texto | Renraku (Contactar/Comunicar): Compartir información relevante y cambios de estatus con los compañeros de célula y áreas adyacentes. | Ej: Notificación anticipada a la célula de logística sobre el despacho de 120 cajas para coordinar el camión frigorífico. |
| `protocolo_sodan_consulta` | texto | Sodan (Consultar): Solicitar asesoría o consejo antes de tomar decisiones dudosas que comprometan recursos o calidad. | Ej: Si el proveedor entrega carne con 2°C de variación, se consulta al Director de Calidad antes de rechazar el embarque. |

### Pilar: Simulador de Células — `simulador_financiero`

#### Módulo: Simulador Financiero — `simulador` · _Simulador de rentabilidad por hora y micro-ganancias amoeba._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `iframe_simulador` | texto | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. |


---

## Metodología Guanxi (China - Redes de Relaciones) — `guanxi_plan`

### Pilar: Conexiones y Alineación Estratégica — `redes_estado`

#### Módulo: Mapa Relacional Guanxi — `mapa_relacional` · _Clasificación de círculos de confianza: familia, amigos, intermediarios y autoridades._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `mapa_relaciones` | texto | Mapeo de conexiones estratégicas con el Estado y otros partners clave. | Ej (Estilo Tencent/Baidu): Alianza estratégica con el Ministerio de Tecnología Provincial y Universidades Estatales. |

#### Módulo: Alineación al 14º Plan Quinquenal — `alineacion_estado` · _Sintonía del proyecto con los objetivos prioritarios del gobierno central y local chino._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `alineacion_quinquenal` | texto | Cómo el proyecto apoya los objetivos del Plan Quinquenal del Estado. | Ej: Apoya directamente el plan "Made in China 2025" en el sector de Semiconductores. |

### Pilar: Reciprocidad y Capital Social — `manejo_conflictos`

#### Módulo: Reciprocidad (Renqing) — `favores` · _Dinámica de intercambio ético de favores y equilibrio relacional._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `reciprocidad` | texto | Estrategia de favores y beneficios mutuos a largo plazo. | Ej (Estilo Huawei): Transferencia de tecnología 5G a cambio de acceso preferencial a redes municipales. |

#### Módulo: Preservación de la Cara (Mianzi) — `mianzi` · _Estrategias para otorgar, mantener y nunca hacer perder la reputación pública._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `armonia` | texto | Manejo de conflictos para mantener el respeto y "salvar la cara" (Mianzi). | Ej: Resolución privada de disputas (Joint Ventures) sin litigios públicos. |

#### Módulo: Protocolo de Obsequios — `gift_giving_renqing` · _Normas culturales sobre regalos adecuados, momentos idóneos y valor simbólico._

**Boxes asociados:** `box_gift_giving_mat`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `protocolo_obsequios_renqing` | texto | Reglas de cortesía sobre obsequios empresariales: selección de objetos representativos, presentación formal con dos manos y evitar tabúes culturales. | Ej: Obsequio de artesanía regional mexicana de plata de alta gama entregada al líder de la delegación en privado al término del viaje. |
| `registro_favores_intercambio` | texto | Renqing (Deuda de afecto y favor): Libro de reciprocidad relacional para registrar gestiones, contactos facilitados y compromisos éticos mutuos. | Ej: Gestión facilitada para homologación aduanal en Manzanillo correspondida con introducción directa a compradores en Shanghái. |
| `temporalidad_reciprocidad` | texto | Comprensión del tiempo en el Guanxi: la devolución inmediata de un favor se percibe como frialdad; debe cultivarse con paciencia a lo largo de los años. | Ej: Acompañamiento a la contraparte china durante 18 meses de intercambio técnico antes de formalizar la primera orden de compra. |

### Pilar: Protocolo y Tácticas de Negociación — `protocolo_negociacion`

#### Módulo: Protocolo de Banquetes Chinos — `banquet_protocol_ritual` · _Orden de asignación de asientos, rituales de brindis (Ganbei) y creación de confianza._

**Boxes asociados:** `box_banquet_protocol_8pasos`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `protocolo_banquetes_orden` | texto | Protocolo de mesa redonda en banquetes de negocios: el anfitrión principal frente a la puerta de entrada y el invitado de honor a su derecha. | Ej: Ubicación del CEO invitado a la derecha del anfitrión corporativo chino con menú de 12 tiempos simbolizando prosperidad. |
| `etiqueta_brindis_asientos` | texto | Ritual del brindis (Ganbei): sostener la copa con ambas manos y situar el borde ligeramente por debajo de la copa del interlocutor en señal de respeto. | Ej: Brindis formal por la amistad binacional con copa sostenida por debajo del presidente de la empresa estatal anfitriona. |
| `reglas_cortesia_empresarial` | texto | Entrega de tarjetas de presentación (Biaozhi) con ambas manos y reverencia leve, lectura atenta antes de guardarla y uso de títulos profesionales. | Ej: Tarjetas bilingües español-mandarín impresas en oro entregadas formalmente con ambas manos a cada miembro de la comitiva. |

#### Módulo: Escala Mianzi de 8 Niveles — `mianzi_ladder_8niveles` · _Jerarquía de preservación del estatus y gestión de desacuerdos indirectos._

**Boxes asociados:** `box_mianzi_ladder_8niveles`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `niveles_preservacion_mianzi` | texto | Escala de 8 niveles de la reputación social (Mianzi): desde 'tener cara' (you mianzi) hasta 'luchar por la cara' (zheng mianzi). | Ej: Reconocimiento público explícito al liderazgo de la contraparte china durante el anuncio oficial conjunto a la prensa. |
| `tacticas_dar_cara` | texto | Mecanismos para otorgar prestigio y honor público (gei mianzi) a los líderes del proyecto mediante reconocimientos y ceremonias. | Ej: Invitación como orador magistral en congreso industrial internacional con entrega de placa conmemorativa. |
| `prevencion_perdida_cara` | texto | Protocolo para evitar hacer perder la cara (diu mianzi): nunca corregir, contradecir o rechazar una propuesta en público. | Ej: Ante una discrepancia contractual, se convocó a una reunión técnica privada y se utilizó lenguaje condicional indirecto. |

#### Módulo: Tácticas de Negociación China — `tacticas_negociacion_estrategica` · _Manejo de tiempos prolongados, concesiones graduales y pactos basados en la relación._

**Boxes asociados:** `box_tacticas_negociacion_china`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `estrategia_36_estratagemas` | texto | Comprensión y aplicación defensiva de los 36 estratagemas clásicos chinos en la mesa de negociación internacional. | Ej: Identificación de la estratagema 'hacer ruido en el este para atacar en el oeste' cuando presionaron por plazos para ocultar concesiones de precio. |
| `gestion_concesiones_paciencia` | texto | Manejo de la paciencia estratégica: las negociaciones chinas son circulares y las concesiones solo deben otorgarse al final. | Ej: Reserva de un 5% de descuento por pronto pago para la ronda final tras semanas de discusión sobre condiciones técnicas. |
| `cierre_contratos_relacionales` | texto | Naturaleza del contrato en China: no es el final de la negociación sino el acta de nacimiento de una relación viva y adaptable. | Ej: Inclusión de cláusulas de renegociación de buena fe ante contingencias arancelarias basadas en el espíritu del acuerdo. |


---

## Estudio de Factibilidad ONUDI (Industrial Global) — `onudi_project`

### Pilar: Ingeniería y Emplazamiento — `ingenieria_industrial`

#### Módulo: Ingeniería Básica y Selección Tecnológica — `tecnologia` · _Evaluación de patentes, licencias, rendimientos y capacidad instalada óptima._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `ingenieria_base` | texto | Tecnología elegida, origen y pruebas de viabilidad técnica industrial. | Ej: Línea de extrusión continua con tecnología alemana, TRL 9. |

#### Módulo: Matriz de Localización ONUDI — `localizacion_industrial` · _Evaluación multicriterio ponderada: materias primas, energía, agua y logística._

**Boxes asociados:** `box_matriz_localizacion_onudi`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `matriz_localizacion_ponderada` | texto | Evaluación multicriterio formal de localización industrial ONUDI: ponderación de materia prima, energía, agua, mano de obra y logística. | Ej: Opción Parque Industrial Hermosillo Norte (Puntaje 88.5/100) seleccionada frente a Guaymas (74.2/100) por cercanía a gasoducto y agua tratada. |
| `disponibilidad_energia_agua` | texto | Factibilidad de suministro de servicios industriales: demanda máxima en KVA, presión de gas natural y caudal de agua en litros/segundo. | Ej: Factibilidad CFE de 750 KVA en media tensión y contrato con Organismo Operador de Agua por 2.5 lps de agua industrial. |
| `logistica_corredores_transporte` | texto | Conectividad con corredores multimodales de transporte: carreteras federales, espuelas de ferrocarril, puertos y aduanas fronterizas. | Ej: Acceso inmediato a Carretera Federal 15 México-Nogales (a 260 km de la frontera con EE.UU.) y a 135 km del Puerto de Guaymas. |

#### Módulo: Evaluación de Impacto Ambiental (EIA) — `impacto_ambiental_onudi` · _Matriz de mitigación de emisiones, efluentes y residuos industriales._

**Boxes asociados:** `box_impacto_ambiental_onudi`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `estudio_impacto_eia` | texto | Manifestación de Impacto Ambiental (MIA / EIA): identificación de impactos físicos, biológicos y socioeconómicos de la planta industrial. | Ej: MIA modalidad particular aprobada por SEMARNAT con 14 condicionantes de mitigación ambiental y monitoreo de ruido. |
| `gestion_efluentes_emisiones` | texto | Tecnología de tratamiento de aguas residuales industriales, trampas de grasa, filtros de mangas y control de emisiones a la atmósfera. | Ej: Planta de tratamiento de efluentes cárnicos mediante flotación DAF y reactor biológico con descarga en norma NOM-002-SEMARNAT. |
| `plan_cumplimiento_ambiental` | texto | Plan de gestión y monitoreo ambiental continuo (PMA) con calendario de muestreos de laboratorio acreditado y auditorías. | Ej: Muestreo trimestral de descargas por laboratorio acreditado EMA y auditoría ambiental para certificación de Industria Limpia PROFEPA. |

### Pilar: Evaluación Financiera Global (COMFAR) — `financiamiento_global`

#### Módulo: WACC ONUDI y Spread País — `costo_capital` · _Costo de capital ponderado incorporando prima de riesgo soberano EMBI+._

**Boxes asociados:** `box_fcff_onudi_model`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `wacc_onudi` | texto | Costo Promedio Ponderado de Capital detallado con tasas internacionales. | Ej: RFR 4%, Beta 1.2, ERP 6%. WACC = 11.2%. |

#### Módulo: Flujo de Caja Libre (FCFF) — `flujo_firma` · _Flujo de caja para la firma antes de financiamiento y valor terminal._

**Boxes asociados:** `box_fcff_onudi_model`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `fcff` | texto | Proyección del Flujo de Caja Libre para la Firma (FCFF = EBIT*(1-t) + D&A - CAPEX - Delta NWC) conforme al estándar COMFAR de ONUDI. | Ej: FCFF Año 1: $1,420,000 MXN; Año 2: $2,850,000 MXN; Año 3: $3,600,000 MXN a capacidad estabilizada. |

#### Módulo: Riesgo País y Riesgo Cambiario — `riesgo_pais_cambiario` · _Evaluación de volatilidad cambiaria, convertibilidad y estrategias de cobertura._

**Boxes asociados:** `box_riesgo_pais_mat`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `prima_riesgo_pais_embi` | texto | Incorporación del spread soberano (Emerging Markets Bond Index - EMBI+) en la tasa de descuento de capital internacional. | Ej: Tasa libre de riesgo EE.UU. (4.2%) + Spread EMBI México (2.6%) + Beta desapalancada ajustada = Ke de 14.8%. |
| `exposicion_tipo_cambio` | texto | Análisis de descalce cambiario entre ingresos (moneda local o dólares de exportación) y deuda/CAPEX (maquinaria importada). | Ej: 100% de la maquinaria cotizada en USD mientras el 80% de las ventas del taller piloto son en MXN (riesgo de devaluación). |
| `cobertura_financiera_hedging` | texto | Instrumentos financieros de mitigación de riesgo cambiario y de tasa de interés: forwards, opciones o swaps de cobertura. | Ej: Contrato forward tipo de cambio USD/MXN a 12 meses fijando el 70% del valor de la maquinaria importada. |

#### Módulo: Análisis de Sensibilidad Tornado — `riesgo` · _Sensibilidad combinada precio-volumen y punto de quiebre industrial._

**Boxes asociados:** `box_fcff_onudi_model`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `sensibilidad_riesgo` | texto | Análisis de sensibilidad multivariable Tornado sobre variables críticas industriales (precio, volumen, CAPEX, costo de insumos). | Ej: El VAN resiste caídas de hasta -18% en el precio de venta mayorista y alzas del +22% en el costo de materia prima cárnica. |

### Pilar: Simulador y Factibilidad — `simulador_financiero`

#### Módulo: Simulador Financiero — `simulador` · _Simulador cuantitativo de factibilidad industrial ONUDI a 5 años._

**Boxes asociados:** `box_fcff_onudi_model`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `iframe_simulador` | texto | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. |


---

## Anexo — Diccionario de field_guides por tipo

Cada tipo usa su guía: `FIELD_GUIDES_MAP[projectType]`. Si un campo no tiene guía propia, cae a `BUSINESS_GUIDES` (fallback en `src/lib/ai.js:431`).

- `business`: **123** campos con guía (` justificacion, origen, nombre, descripcion, mision, vision, valores, general, …`)
- `social_bid`: **52** campos con guía (` diagrama_visual, organigrama_visual, beneficiarios, aliados, oponentes, matriz_interes, problema_central, causas_directas, …`)
- `agile_startup`: **45** campos con guía (` problema, segmentos_clientes, propuesta_valor, solucion, canales, flujos_ingresos, estructura_costos, metricas_clave, …`)
- `technology_id`: **36** campos con guía (` descripcion_tecnologia, novedad_cientifica, nivel_trl, ventaja_tecnologica, estado_del_arte, estrategia_patentes, clasificacion_patentes_ipc, secretos_industriales, …`)
- `micro_business`: **25** campos con guía (` idea_negocio, objetivo_basico, nombre, quienes_somos, que_ofrecemos, perfil_cliente, ubicacion_clientes, competidores_locales, …`)
- `investment_project`: **30** campos con guía (` demanda_historica, elasticidad, proyeccion_oferta, ingenieria_basica, layout_industrial, memoria_calculo, catalogo_conceptos, explosion_insumos, …`)
- `zopp`: **18** campos con guía (` matriz_participacion, analisis_problemas, analisis_objetivos, analisis_alternativas_zopp, alternativas_identificadas, criterios_evaluacion, alternativa_seleccionada, matriz_logica, …`)
- `horizon_europe`: **16** campos con guía (` consorcio_multinacional, dnsh, open_science, excelencia, repositorios_fair, politica_acceso_abierto, plan_gestion_datos_dmp, pathway_hacia_mercado, …`)
- `hoshin_kanri`: **16** campos con guía (` true_north, matriz_x, breakthroughs, bowler, proceso_catchball, acuerdos_nemawashi, retroalimentacion_vertical, antecedentes_a3, …`)
- `amoeba_management`: **14** campos con guía (` mapeo_celulas, precios_transferencia, rentabilidad_hora, filosofia, doce_principios_gestion, motivacion_empleados, gestion_transparente, control_horas_celula, …`)
- `guanxi_plan`: **16** campos con guía (` mapa_relaciones, alineacion_quinquenal, reciprocidad, armonia, protocolo_obsequios_renqing, registro_favores_intercambio, temporalidad_reciprocidad, protocolo_banquetes_orden, …`)
- `onudi_project`: **16** campos con guía (` ingenieria_base, matriz_localizacion_ponderada, disponibilidad_energia_agua, logistica_corredores_transporte, estudio_impacto_eia, gestion_efluentes_emisiones, plan_cumplimiento_ambiental, wacc_onudi, …`)

---

*Generado por `scripts/generate-tabla-modulo-prompt.js`. Para regenerar: `node scripts/generate-tabla-modulo-prompt.js`*
