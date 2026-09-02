# Tabla Módulo → Textbox → Prompt — 12 Modelos

> **Generado:** 2026-09-02T23:16:53.650Z — **Fuente:** `src/config/frameworks.js` + `src/lib/field_guides.js` + `src/config/moduleBoxMap.js`
> **Textboxes totales:** se calculan abajo · Cada campo ya está **dividido en 5 textboxes** en `PromptEditor.jsx` (Instrucción / Ejemplo / Benchmark / Cita / Placeholder) — no es un solo textbox.


## Resumen por modelo

| # | Modelo (`projectType`) | Nombre | Pilares | Módulos | Textboxes |
|---|-------------------------|--------|---------|---------|------------|
| 1 | `business` | Plan de Negocios Comercial | 5 | 28 | 104 |
| 2 | `social_bid` | Proyecto Social (Metodología BID) | 4 | 15 | 48 |
| 3 | `agile_startup` | Agile Startup (Lean MVP) | 5 | 9 | 37 |
| 4 | `technology_id` | Plan de Negocios de Base Tecnológica e Innovación (I+D) | 5 | 9 | 27 |
| 5 | `micro_business` | Plan para Microempresa y Autoempleo (Simplificado) | 4 | 10 | 20 |
| 6 | `investment_project` | Proyecto de Inversión (Ingeniería y Finanzas) | 6 | 11 | 16 |
| 7 | `zopp` | ZOPP / Marco Lógico (Enfoque Alemán-BID) | 2 | 4 | 4 |
| 8 | `horizon_europe` | Horizon Europe (Unión Europea) | 2 | 4 | 4 |
| 9 | `hoshin_kanri` | Hoshin Kanri (Japón - Planificación Estratégica) | 2 | 4 | 4 |
| 10 | `amoeba_management` | Amoeba Management (Kyocera - Micro-Ganancias) | 3 | 5 | 5 |
| 11 | `guanxi_plan` | Metodología Guanxi (China - Redes de Relaciones) | 2 | 4 | 4 |
| 12 | `onudi_project` | Estudio de Factibilidad ONUDI (Industrial Global) | 3 | 5 | 5 |

**TOTAL TEXTBOXES:** **278**

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

**Boxes asociados:** `box_swot_foda`

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

#### Módulo: Mapa de Calor y Densidad — `mapa` · _Visualización geográfica de la demanda y densidad de mercado._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `analisis_espacial` | texto | Analiza la concentración territorial de clientes y competidores con datos geoespaciales (DENUE/INEGI). | Ej: Concentración del 62% del mercado en el corredor industrial norte de Hermosillo. |

#### Módulo: Análisis de Competencia — `competencia` · _Competidores directos, indirectos y ventaja competitiva._

**Boxes asociados:** `box_swot_foda`

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

**Boxes asociados:** `box_kpi_otd_dso_dio_ccc`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `instalada` | texto | Calcula la capacidad instalada máxima vs la capacidad utilizada en turnos normales de operación (unidades/mes u horas de servicio). | Ej: Capacidad máxima: 80 overhauls de cilindros al mes (2 turnos de 8 hrs). Operación inicial al 45% (36 servicios/mes). |
| `inventarios` | texto | Método de control de existencias (PEPS, UEPS, ABC) y software utilizado. | Ej: "Para servicios: Control de citas vía Calendly. Para productos: Método PEPS en Excel con alerta de stock mínimo." |
| `mano_obra` | texto | Personal necesario por área con perfil, cantidad, turno y tipo de contratación. | Ej: "2 asesores financieros (planta). 1 community manager (medio tiempo). 1 contador (outsourcing). 1 desarrollador (freelance)." |
| `punto_reorden` | texto | Nivel mínimo de existencias de insumos que dispara automáticamente una nueva orden de compra. | Ej: "Mangueras de alta presión: Punto de reorden en 15 unidades (lead time de entrega de 5 días). Sellos hidráulicos: 50 sets." |

#### Módulo: Eficiencia Operativa — `operativa` · _Métricas de desempeño: OTD, Rotación, DSO, DPO y Ciclo de Efectivo._

**Boxes asociados:** `box_kpi_otd_dso_dio_ccc`

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

**Boxes asociados:** `box_unit_economics`, `box_benchmark_cac_ltv`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `organigrama_visual` | mermaid | Código Mermaid.js que genera el organigrama del equipo jerárquicamente. | Ej: "graph TD → CEO → Dir. Financiero + Dir. Comercial → cada uno con sus subordinados" |
| `puestos` | texto | Describe los perfiles, responsabilidades críticas, requisitos de experiencia y jerarquía de los puestos clave de la organización. | Ej: Gerente Técnico (Ing. Mecatrónico, 8+ años en minería), Técnico Hidráulico Senior (Certificación IFPS), Ejecutivo de Cuenta B2B. |
| `funciones` | texto | Tabla de responsabilidades de cada puesto clave. Qué hace, a quién reporta, KPIs. | Ej: "Director Comercial: Captación de clientes, gestión de embudo, reporta a CEO. KPI: 50 clientes nuevos/mes." |
| `puestos_lista` | texto | Matriz consolidada de capital humano, niveles salariales, prestaciones de ley (IMSS/ISN) y organigrama. | Ej: "14 puestos distribuidos en 4 Gerencias: Operaciones, Calidad/IoT, Finanzas y B2B, con costo patronal total de $5.6M MXN/año." |

#### Módulo: Gestión de Recursos Humanos — `recursos_humanos` · _Políticas de contratación, capacitación y sueldos._

**Boxes asociados:** `box_unit_economics`, `box_benchmark_cac_ltv`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `reclutamiento` | texto | Proceso de atracción y selección de talento. Fuentes, filtros y tiempos. | Ej: "Publicación en LinkedIn + OCC. Filtro: CV → Entrevista técnica → Caso práctico → Contratación. Tiempo: 3 semanas." |
| `contratacion` | texto | Tipo de contrato, período de prueba, prestaciones y obligaciones patronales. | Ej: "Contrato indeterminado con 3 meses de prueba. Prestaciones de ley + seguro de gastos médicos mayores (6to mes)." |
| `sueldos` | texto | Tabla salarial por puesto incluyendo sueldo bruto, neto, prestaciones y costo total. | Ej: "Asesor Jr: $15K bruto + comisiones. Asesor Sr: $25K + bono. Dir. Comercial: $40K + 2% de ventas totales." |

#### Módulo: Inversión Inicial (CAPEX) — `inversion` · _Requerimientos de capital para arranque._

**Boxes asociados:** `box_wacc_van_tir`, `box_tornado_sensibilidad`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `inversion_fija` | texto | Activos tangibles no corrientes indispensables para la operación (bancos de prueba, vehículos, maquinaria). | Ej: "Taller central en Hermosillo ($4.5M), banco de pruebas hidráulicas ($2.5M), instrumental de telemetría IoT ($1.8M)." |
| `inversion_diferida` | texto | Activos intangibles y gastos pre-operativos (constitución legal, certificaciones ISO, software ERP). | Ej: "Certificación ISO 9001/4406 ($350K), constitución legal y patentes ($150K), licencias de software ($250K)." |
| `opex_inicial` | texto | Capital necesario para cubrir gastos operativos mientras el negocio no genera ingresos suficientes. | Ej: "6 meses de nómina: $300K. Renta: $72K. Marketing: $48K. Servicios: $18K. Total capital de trabajo: $438K." |
| `financiamiento` | texto | De dónde viene el dinero. Proporción de capital propio, préstamos e inversión externa. | Ej: "Capital propio: 60% ($430K). Crédito PyME Bancomext: 30% ($215K) a 5 años, tasa 12%. Inversionista ángel: 10% ($72K)." |

#### Módulo: Costos y Gastos (OPEX) — `costos` · _Estructura de costos fijos y variables mensuales._

**Boxes asociados:** `box_unit_economics`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `fijos` | texto | Gastos que no cambian sin importar el volumen de ventas: renta, nómina, servicios, seguros. | Ej: "Renta: $12K. Nómina: $95K. Luz/Internet: $3K. Software: $5K. Contador: $8K. Total fijos: $123K/mes." |
| `variables` | texto | Gastos que cambian según el número de clientes o unidades producidas. | Ej: "Comisión por cliente: $200. Impresión de reportes: $50/cliente. Café y amenidades: $30/cita. Costo variable: $280/cliente." |
| `unitario` | texto | Cálculo del costo total de atender a un solo cliente o producir una unidad. | Ej: "Costo fijo unitario: $123K ÷ 200 clientes = $615. Costo variable: $280. Costo total unitario: $895/cliente." |

#### Módulo: Estados Financieros — `estados_financieros` · _Proyecciones de resultados, balance y flujo._

**Boxes asociados:** `box_wacc_van_tir`, `box_tornado_sensibilidad`, `box_montecarlo_sim`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `resultados` | texto | Proyección de ingresos menos gastos por mes/año. Muestra cuándo serás rentable. | Ej: "Año 1: Ingresos $1.2M - Gastos $1.8M = Pérdida ($600K). Año 2: Ingresos $3.6M - Gastos $2.1M = Utilidad $1.5M." |
| `balance` | texto | Foto financiera: Activos = Pasivos + Capital. Proyectado a 3-5 años. | Ej: "Año 1: Activos $710K \| Pasivos $430K \| Capital $280K. Año 3: Activos $2.8M \| Pasivos $180K \| Capital $2.62M." |
| `flujo_caja` | texto | Entradas y salidas de efectivo reales por mes. Crucial para no quedarte sin liquidez. | Ej: "Mes 1: Entrada $30K, Salida $150K, Saldo -$120K. Mes 6: Entrada $180K, Salida $135K, Saldo +$45K." |
| `amortizacion_creditos` | texto | Tabla y estrategia de servicio de deuda: capital, tasa de interés, amortización y saldo insoluto. | Ej: "Crédito bancario de $5M MXN a 48 meses con tasa TIIE+3.5% fija, amortizaciones mensuales de $135K MXN." |
| `memorias_calculo` | texto | Bases cuantitativas, supuestos de costos unitarios, tarifas por servicio y fórmulas de proyección. | Ej: "Tarifa MaaS: $68,000 MXN/mes por camión minero monitoreado. Costo marginal de reparación: $18,500 MXN." |

#### Módulo: Rentabilidad y Análisis — `rentabilidad` · _TIR, VPN, Punto de Equilibrio y ROI._

**Boxes asociados:** `box_wacc_van_tir`, `box_unit_economics`, `box_benchmark_cac_ltv`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `punto_equilibrio` | texto | Número de clientes o ventas necesarias para cubrir todos los costos. Fórmula: CF ÷ (PVU - CVU). | Ej: "$123K ÷ ($1,500 - $280) = 101 clientes/mes para cubrir costos. Meta: alcanzarlo en el mes 8." |
| `indicadores` | texto | VAN (Valor Actual Neto) y TIR (Tasa Interna de Retorno) del proyecto a 5 años. | Ej: "VAN a 5 años (tasa 12%): $1.8M MXN (positivo = viable). TIR: 34% (superior al costo de capital). Payback: 22 meses." |
| `relacion_bc` | texto | Relación Beneficio-Costo (B/C): Valor presente de beneficios dividido entre valor presente de costos. | Ej: "Relación B/C de 1.38 a tasa de descuento del 12%, lo que indica que por cada peso invertido se generan $1.38 MXN en valor presente." |

### Pilar: Simulador y Corridas — `simulador_financiero`

#### Módulo: Simulador Financiero — `simulador` · _Simulador interactivo avanzado con corridas dinámicas a 5 años._

**Boxes asociados:** `box_wacc_van_tir`, `box_montecarlo_sim`

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

### Pilar: Tracción y Aprendizaje — `aprendizaje`

#### Módulo: Resultados del Piloto — `pilot_results` · _Resultados cuantitativos y cualitativos obtenidos durante las pruebas con clientes reales._

**Boxes asociados:** `box_burn_runway`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `datos_traccion` | texto | Resumen de métricas reales de clientes, ventas o registros obtenidos. | Ej: 24 clientes pagaron la suscripción en la preventa, logrando $28,800 MXN en ventas brutas en 14 días. |
| `comentarios_early_adopters` | texto | Retroalimentación directa de los primeros usuarios de tu MVP. | Ej: "La comida es deliciosa y el empaque térmico es excelente, pero me gustaría poder elegir opciones sin gluten". |
| `aprendizajes_clave` | texto | Conclusiones principales que obtuviste del piloto práctico. | Ej: Validamos que hay intención de pago inmediata. Sin embargo, la logística de reparto requiere optimizar zonas. |

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

**Boxes asociados:** `box_burn_runway`, `box_benchmark_cac_ltv`

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

**Boxes asociados:** `box_micro_canvas_3b`

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

#### Módulo: Matriz de Participación — `participacion` · _Identificación de involucrados._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `matriz_participacion` | texto | Análisis de involucrados, sus intereses y problemas percibidos. | Ej: Comunidad local (Alta influencia, Alto impacto). |

#### Módulo: Árbol de Problemas — `problemas` · _Análisis de causas y efectos._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `analisis_problemas` | texto | Árbol de problemas enfocándose en la causa raíz moderada. | Ej: Alta incidencia de enfermedades gastrointestinales. |

### Pilar: Matriz de Planificación (MPP) — `planificacion_mpp`

#### Módulo: Árbol de Objetivos — `objetivos` · _De problemas a soluciones._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `analisis_objetivos` | texto | Conversión de problemas a estados positivos alcanzables. | Ej: Reducción del 50% en enfermedades gastrointestinales. |

#### Módulo: Matriz Lógica — `matriz_logica` · _Resumen narrativo y supuestos._

**Boxes asociados:** `box_zopp_mpp_4x4`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `mpp` | texto | Matriz de Planificación del Proyecto (equivalente a Marco Lógico). | Ej: Objetivo general, propósito, resultados, actividades. |


---

## Horizon Europe (Unión Europea) — `horizon_europe`

### Pilar: Excelencia y Ciencia Abierta — `excelencia_cientifica`

#### Módulo: Consorcio — `consorcio` · _Estructura de partners._

**Boxes asociados:** `box_dnsh_ue_6`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `consorcio_multinacional` | texto | Estructura de partners internacionales y división de roles científicos. | Ej (Estilo Airbus/BioNTech): Instituto Fraunhofer (Líder WP1-I+D), SAP (WP2-Software). |

#### Módulo: Open Science — `ciencia_abierta` · _Plan de gestión de datos._

**Boxes asociados:** `box_dnsh_ue_6`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `open_science` | texto | Plan de gestión de datos FAIR y diseminación en repositorios abiertos. | Ej (Estilo CERN): Publicación de datasets de simulación en Zenodo con licencia CC-BY. |

### Pilar: Impacto y Sostenibilidad — `impacto_sostenibilidad`

#### Módulo: Principio DNSH — `dnsh_principle` · _No causar daño significativo._

**Boxes asociados:** `box_dnsh_ue_6`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `dnsh` | texto | Principio Do No Significant Harm. Demostrar que el proyecto no daña ninguno de los 6 objetivos medioambientales. | Ej (Estilo Northvolt): El proceso de reciclaje reduce 80% emisiones de CO2 sin generar efluentes tóxicos. |

#### Módulo: Impacto Global — `impacto` · _Impacto más allá del estado del arte._

**Boxes asociados:** `box_dnsh_ue_6`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `excelencia` | texto | Impacto más allá del estado del arte. | Ej: Eficiencia cuántica 20% superior al referente actual comercializado por IBM. |


---

## Hoshin Kanri (Japón - Planificación Estratégica) — `hoshin_kanri`

### Pilar: Visión y Breakthroughs — `vision_largo_plazo`

#### Módulo: True North — `norte_verdadero` · _Visión a largo plazo._

**Boxes asociados:** `box_matriz_x_hoshin`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `true_north` | texto | Visión a 10 años. El propósito inalterable de la organización. | Ej (Estilo Toyota/Honda): "Cero emisiones y cero colisiones para 2040". |

#### Módulo: Breakthroughs — `disrupcion` · _Objetivos disruptivos._

**Boxes asociados:** `box_matriz_x_hoshin`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `breakthroughs` | texto | Objetivos disruptivos anuales que cambian el status quo. | Ej (Estilo Nissan): Reducir el tiempo de ensamble de baterías de 4 horas a 45 minutos. |

### Pilar: Alineación y Ejecución — `alineacion_ejecucion`

#### Módulo: Matriz X — `matriz_x` · _Despliegue de objetivos._

**Boxes asociados:** `box_matriz_x_hoshin`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `matriz_x` | texto | Herramienta que alinea visión a largo plazo, objetivos anuales, iniciativas y métricas. | Ej (Estilo Sony): Eje Sur (Iniciativa: Lente 8K) conectado con Eje Este (KPI: Reducir costo 15%). |

#### Módulo: Bowler Charts — `seguimiento` · _Revisión visual._

**Boxes asociados:** `box_matriz_x_hoshin`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `bowler` | texto | Indicadores de revisión visual mensual. | Ej: Gráfico de semáforo Andon para la línea de producción de motores. |


---

## Amoeba Management (Kyocera - Micro-Ganancias) — `amoeba_management`

### Pilar: Estructuración — `estructuracion_celulas`

#### Módulo: Mapeo de Células — `celulas` · _Centros de ganancia independientes._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `mapeo_celulas` | texto | División de la empresa en micro-centros de ganancia independientes. | Ej (Estilo Kyocera/Alibaba): Dividir operaciones en 50 células (Ej. Amoeba de Servidores, Amoeba de Logística). |

#### Módulo: Filosofía — `filosofia_corp` · _Alineación de valores._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `filosofia` | texto | Alineación de los miembros de la célula con los valores nucleares. | Ej (Estilo Inamori/Jack Ma): "Hacer lo correcto como ser humano" y priorizar al cliente antes que al accionista. |

### Pilar: Economía Interna — `economia_interna`

#### Módulo: Precios de Transferencia — `precios` · _Ventas entre células._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `precios_transferencia` | texto | Cómo una célula le "vende" internamente a otra. | Ej: Amoeba de Diseño le cobra $50 USD la hora a Amoeba de Manufactura por el plano CAD. |

#### Módulo: Rentabilidad por Hora — `rentabilidad` · _Cálculo de utilidad._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `rentabilidad_hora` | texto | Cálculo de la utilidad generada dividida por las horas trabajadas. | Ej: Rentabilidad por hora = (Ingreso Amoeba - Costos no laborales) / Total Horas del equipo. |

### Pilar: Simulador de Células — `simulador_financiero`

#### Módulo: Simulador Financiero — `simulador` · _Simulador de rentabilidad por hora y micro-ganancias amoeba._

**Boxes asociados:** `box_rentabilidad_hora_amoeba`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `iframe_simulador` | texto | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. |


---

## Metodología Guanxi (China - Redes de Relaciones) — `guanxi_plan`

### Pilar: Conexiones y Estado — `redes_estado`

#### Módulo: Mapa de Relaciones — `mapa_relacional` · _Conexiones estratégicas._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `mapa_relaciones` | texto | Mapeo de conexiones estratégicas con el Estado y otros partners clave. | Ej (Estilo Tencent/Baidu): Alianza estratégica con el Ministerio de Tecnología Provincial y Universidades Estatales. |

#### Módulo: Plan Quinquenal — `alineacion_estado` · _Alineación con el Estado._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `alineacion_quinquenal` | texto | Cómo el proyecto apoya los objetivos del Plan Quinquenal del Estado. | Ej: Apoya directamente el plan "Made in China 2025" en el sector de Semiconductores. |

### Pilar: Reciprocidad y Armonía — `manejo_conflictos`

#### Módulo: Reciprocidad — `favores` · _Beneficios mutuos._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `reciprocidad` | texto | Estrategia de favores y beneficios mutuos a largo plazo. | Ej (Estilo Huawei): Transferencia de tecnología 5G a cambio de acceso preferencial a redes municipales. |

#### Módulo: Armonía (Mianzi) — `mianzi` · _Resolución de conflictos._

**Boxes asociados:** `box_mapa_guanxi_mianzi`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `armonia` | texto | Manejo de conflictos para mantener el respeto y "salvar la cara" (Mianzi). | Ej: Resolución privada de disputas (Joint Ventures) sin litigios públicos. |


---

## Estudio de Factibilidad ONUDI (Industrial Global) — `onudi_project`

### Pilar: Ingeniería — `ingenieria_industrial`

#### Módulo: Ingeniería Base — `tecnologia` · _Origen y viabilidad._

**Boxes asociados:** —

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `ingenieria_base` | texto | Tecnología elegida, origen y pruebas de viabilidad técnica industrial. | Ej: Línea de extrusión continua con tecnología alemana, TRL 9. |

### Pilar: Evaluación Financiera Global — `financiamiento_global`

#### Módulo: WACC ONUDI — `costo_capital` · _Costo de capital internacional._

**Boxes asociados:** `box_fcff_onudi_model`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `wacc_onudi` | texto | Costo Promedio Ponderado de Capital detallado con tasas internacionales. | Ej: RFR 4%, Beta 1.2, ERP 6%. WACC = 11.2%. |

#### Módulo: FCFF — `flujo_firma` · _Flujo de caja para la firma._

**Boxes asociados:** `box_fcff_onudi_model`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `fcff` | texto | Flujo de Caja Libre para la Firma (Free Cash Flow to the Firm). | Ej: FCFF proyectado al año 5: $2.5M USD. |

#### Módulo: Sensibilidad — `riesgo` · _Análisis de riesgo global._

**Boxes asociados:** `box_fcff_onudi_model`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `sensibilidad_riesgo` | texto | Simulación de riesgo (Monte Carlo) sobre variables críticas. | Ej: Variación de precios de acero de +/- 20% no destruye el VPN. |

### Pilar: Simulador y Factibilidad — `simulador_financiero`

#### Módulo: Simulador Financiero — `simulador` · _Simulador cuantitativo de factibilidad industrial ONUDI a 5 años._

**Boxes asociados:** `box_fcff_onudi_model`

| Textbox (`field key`) | Tipo Box | Prompt — Instrucción | Ejemplo / Placeholder |
|---|---|---|---|
| `iframe_simulador` | texto | Describe las variables y memorias de cálculo utilizadas en las simulaciones estocásticas. | Ej: Parámetros de Monte Carlo: 10,000 iteraciones con distribución triangular sobre volumen y precio. |


---

## Anexo — Diccionario de field_guides por tipo

Cada tipo usa su guía: `FIELD_GUIDES_MAP[projectType]`. Si un campo no tiene guía propia, cae a `BUSINESS_GUIDES` (fallback en `src/lib/ai.js:431`).

- `business`: **114** campos con guía (` justificacion, origen, nombre, descripcion, mision, vision, valores, general, …`)
- `social_bid`: **47** campos con guía (` diagrama_visual, organigrama_visual, beneficiarios, aliados, oponentes, matriz_interes, problema_central, causas_directas, …`)
- `agile_startup`: **37** campos con guía (` problema, segmentos_clientes, propuesta_valor, solucion, canales, flujos_ingresos, estructura_costos, metricas_clave, …`)
- `technology_id`: **27** campos con guía (` descripcion_tecnologia, novedad_cientifica, nivel_trl, ventaja_tecnologica, estado_del_arte, estrategia_patentes, clasificacion_patentes_ipc, secretos_industriales, …`)
- `micro_business`: **20** campos con guía (` idea_negocio, objetivo_basico, nombre, quienes_somos, que_ofrecemos, perfil_cliente, ubicacion_clientes, competidores_locales, …`)
- `investment_project`: **16** campos con guía (` demanda_historica, elasticidad, proyeccion_oferta, ingenieria_basica, layout_industrial, memoria_calculo, catalogo_conceptos, explosion_insumos, …`)
- `zopp`: **4** campos con guía (` matriz_participacion, analisis_problemas, analisis_objetivos, mpp`)
- `horizon_europe`: **4** campos con guía (` consorcio_multinacional, dnsh, open_science, excelencia`)
- `hoshin_kanri`: **4** campos con guía (` true_north, matriz_x, breakthroughs, bowler`)
- `amoeba_management`: **5** campos con guía (` mapeo_celulas, precios_transferencia, rentabilidad_hora, filosofia, iframe_simulador`)
- `guanxi_plan`: **4** campos con guía (` mapa_relaciones, alineacion_quinquenal, reciprocidad, armonia`)
- `onudi_project`: **5** campos con guía (` ingenieria_base, wacc_onudi, fcff, sensibilidad_riesgo, iframe_simulador`)

---

*Generado por `scripts/generate-tabla-modulo-prompt.js`. Para regenerar: `node scripts/generate-tabla-modulo-prompt.js`*
