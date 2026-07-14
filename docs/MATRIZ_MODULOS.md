# Matriz Cruzada Exacta de Módulos (Código Fuente)

Esta tabla refleja exactamente los módulos declarados en `src/config/frameworks.js` más una proyección del 6to método (Proyecto de Inversión).

## Expectativa de Longitud y Evidencia (Páginas y Anexos)

Para evitar la "paja", cada método tiene un volumen esperado de lectura técnica directa (sin contar portadas gigantes o índices). Si un plan tiene muchas menos páginas que el mínimo, le falta profundidad; si tiene muchas más, probablemente esté divagando.

| Método / Framework | Módulos | Páginas Mínimas | Páginas Máximas | Anexos Promedio Recomendados |
| :--- | :---: | :---: | :---: | :--- |
| **1. Comercial (Clásico)** | 28 | 25 págs. | 50 págs. | **3 a 5** (Actas constitutivas, Cotizaciones de equipo, Contratos) |
| **2. Social (BID)** | 15 | 20 págs. | 35 págs. | **2 a 4** (Cartas de intención, Apoyo gubernamental, Fotos de comunidad) |
| **3. Agile Startup** | 8 | 8 págs. | 15 págs. | **1 a 2** (Mockups de la App, Resultados de encuestas) |
| **4. Tecnológico (I+D)**| 8 | 15 págs. | 25 págs. | **4 a 6** (Borradores de Patente, Pruebas de Lab, Diagramas técnicos) |
| **5. Microempresa** | 10 | 5 págs. | 10 págs. | **1 a 2** (Fotos del local físico, Permiso de uso de suelo) |
| **6. Proyecto Inversión** | 10 | 40 págs. | 80 págs. | **10+** (Planos arquitectónicos, Catálogo de conceptos, Corridas Excel) |
| **7. ZOPP (Marco Lógico)** | 4 | 15 págs. | 25 págs. | **2 a 4** (Matriz MPP, Mapas de involucrados, Fotografías de consulta) |
| **8. Horizon Europe** | 4 | 20 págs. | 40 págs. | **4 a 6** (Cartas de Consorcio, Repositorios Open Science, Tablas DNSH) |
| **9. Hoshin Kanri** | 4 | 10 págs. | 20 págs. | **1 a 3** (Matriz X, Bowler Charts en Excel) |
| **10. Amoeba Management** | 4 | 10 págs. | 20 págs. | **1 a 2** (Tabla de precios de transferencia internos, Estructura de Células) |
| **11. Metodología Guanxi** | 4 | 10 págs. | 20 págs. | **1 a 2** (Alineación a Plan Quinquenal, Mapeo de Stakeholders clave) |
| **12. Estándares ONUDI** | 4 | 40 págs. | 80 págs. | **10+** (Sensibilidad, Cálculos WACC/FCFF, Diagramas Base) |

---

## Desglose Exacto 1 a 1 de Módulos (12 Metodologías)

| Identificador del Módulo | Descripción Breve | **BUS** | **SOC** | **AGI** | **TEC** | **MIC** | **INV** | **ZOP** | **HOR** | **HOS** | **AMO** | **GUA** | **ONU** |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `introduccion` | Justificación y Origen | ✓ | | | | ✓ | | | | | | | |
| `identidad` | Identidad Corporativa | ✓ | | | | ✓ | | | | | | | |
| `objetivos` | Objetivos y Metas | ✓ | | | | | | ✓ | | | | | |
| `foda` | Análisis FODA | ✓ | | | | | | | | | | | |
| `pestel` | Entorno (PESTEL) | ✓ | | | | | | | | | | | |
| `legal` | Marco Legal y Socios | ✓ | | | | | | | | | | | |
| `canvas` | Modelo de Negocio Canvas | ✓ | | ✓ | | | | | | | | | |
| `analisis` | Análisis de Producto y Valor | ✓ | | | | | | | | | | | |
| `segmentacion` | Segmentación y Tamaño | ✓ | | | | | | | | | | | |
| `mapa` | Mapa de Calor y Densidad | ✓ | | | | | | | | | | | |
| `competencia` | Análisis de Competencia | ✓ | | | | ✓ | | | | | | | |
| `benchmarking` | Benchmarking | ✓ | | | | | | | | | | | |
| `comercializacion` | Estrategia de Comercialización | ✓ | | | | ✓ | | | | | | | |
| `ventas` | Plan de Ventas y Precios | ✓ | | | | | | | | | | | |
| `ubicacion` | Localización y Ubicación | ✓ | | | | | | | | | | | |
| `operacion` | Operación y Procesos | ✓ | | | | ✓ | | | | | | | |
| `recursos` | Maquinaria y Tecnología | ✓ | | | | ✓ | | | | | | | |
| `insumos` | Insumos y Proveedores | ✓ | | | | | | | | | | | |
| `capacidad` | Capacidad e Inventarios | ✓ | | | | | | | | | | | |
| `operativa` | Eficiencia Operativa | ✓ | | | | | | | | | | | |
| `ambiental` | Impacto Ambiental | ✓ | | | | | | | | | | | |
| `estructura` | Estructura Organizativa | ✓ | | | | | | | | | | | |
| `recursos_humanos` | Gestión de Recursos Humanos | ✓ | | | | | | | | | | | |
| `inversion` | Inversión Inicial (CAPEX) | ✓ | | | | ✓ | | | | | | | |
| `costos` | Costos y Gastos (OPEX) | ✓ | | | | ✓ | | | | | | | |
| `estados_financieros` | Estados Financieros | ✓ | | | | | | | | | | | |
| `rentabilidad` | Rentabilidad y Análisis | ✓ | | | | | | | | | ✓ | | |
| `simulador` | Simulador Financiero | ✓ | | | | | | | | | | | |
| `involucrados` | Análisis de Involucrados | | ✓ | | | | | | | | | | |
| `arbol_problemas` | Árbol de Problemas | | ✓ | | | | | | | | | | |
| `arbol_objetivos` | Árbol de Objetivos | | ✓ | | | | | | | | | | |
| `alternativas` | Análisis de Alternativas | | ✓ | | | | | | | | | | |
| `fin_proposito` | Fin y Propósito | | ✓ | | | | | | | | | | |
| `componentes` | Componentes (Productos) | | ✓ | | | | | | | | | | |
| `actividades` | Actividades Clave | | ✓ | | | | | | | | | | |
| `monitoreo` | Sistema de Monitoreo | | ✓ | | | | | | | | | | |
| `gobernanza` | Estructura de Gobernanza | | ✓ | | | | | | | | | | |
| `edt` | Estructura Desglosada (EDT) | | ✓ | | | | | | | | | | |
| `riesgos` | Matriz de Riesgos | | ✓ | | | | | | | | | | |
| `comunicaciones` | Plan de Comunicaciones | | ✓ | | | | | | | | | | |
| `presupuesto_detallado` | Presupuesto por Componentes | | ✓ | | | | | | | | | | |
| `evaluacion_exante` | Evaluación Ex-ante | | ✓ | | | | | | | | | | |
| `sostenibilidad` | Estrategia de Sostenibilidad | | ✓ | | | | | | | | | | |
| `buyer_persona` | Cliente y Empatía | | | ✓ | | | | | | | | | |
| `mvp_design` | Diseño del MVP | | | ✓ | | | | | | | | | |
| `critical_hypotheses` | Hipótesis y Métricas | | | ✓ | | | | | | | | | |
| `pilot_results` | Resultados del Piloto | | | ✓ | | | | | | | | | |
| `pivot_persevere` | Pivotar o Perseverar | | | ✓ | | | | | | | | | |
| `unit_economics` | Unit Economics | | | ✓ | | | | | | | | | |
| `burn_rate` | Runway y Burn Rate | | | ✓ | | | | | | | | | |
| `tech_invention` | Tecnología e Invención | | | | ✓ | | | | | | | | |
| `property_intellectual` | Propiedad Intelectual | | | | ✓ | | | | | | | | |
| `technical_id` | Ingeniería e I+D | | | | ✓ | | | | | | | | |
| `prototyping` | Prototipado y Pruebas | | | | ✓ | | | | | | | | |
| `tech_market` | Mercado Tecnológico | | | | ✓ | | | | | | | | |
| `transfer_model` | Modelo de Transferencia | | | | ✓ | | | | | | | | |
| `rse_impact` | Responsabilidad Social (RSE) | | | | ✓ | | | | | | | | |
| `circular_economy` | Economía Circular | | | | ✓ | | | | | | | | |
| `clientes` | ¿A quién le vendemos? | | | | | ✓ | | | | | | | |
| `croquis` | Croquis del Local | | | | | ✓ | | | | | | | |
| `demanda` | Análisis de Demanda | | | | | | ✓ | | | | | | |
| `oferta` | Proyección de Oferta | | | | | | ✓ | | | | | | |
| `ingenieria` | Ingeniería Básica | | | | | | ✓ | | | | | | |
| `layout` | Instalaciones y Lay-out | | | | | | ✓ | | | | | | |
| `presupuesto` | Catálogo y Costos | | | | | | ✓ | | | | | | |
| `cronograma` | Cronograma Físico-Financiero | | | | | | ✓ | | | | | | |
| `capital` | Costo de Capital (WACC) | | | | | | ✓ | | | | | | |
| `deuda` | Apalancamiento y Deuda | | | | | | ✓ | | | | | | |
| `sensibilidad` | Análisis de Sensibilidad | | | | | | ✓ | | | | | | |
| `probabilidad` | Simulación de Riesgo | | | | | | ✓ | | | | | | |
| `participacion` | Matriz de Participación | | | | | | | ✓ | | | | | |
| `problemas` | Árbol de Problemas | | | | | | | ✓ | | | | | |
| `matriz_logica` | Matriz Lógica | | | | | | | ✓ | | | | | |
| `consorcio` | Consorcio | | | | | | | | ✓ | | | | |
| `ciencia_abierta` | Open Science | | | | | | | | ✓ | | | | |
| `dnsh_principle` | Principio DNSH | | | | | | | | ✓ | | | | |
| `impacto` | Impacto Global | | | | | | | | ✓ | | | | |
| `norte_verdadero` | True North | | | | | | | | | ✓ | | | |
| `disrupcion` | Breakthroughs | | | | | | | | | ✓ | | | |
| `matriz_x` | Matriz X | | | | | | | | | ✓ | | | |
| `seguimiento` | Bowler Charts | | | | | | | | | ✓ | | | |
| `celulas` | Mapeo de Células | | | | | | | | | | ✓ | | |
| `filosofia_corp` | Filosofía | | | | | | | | | | ✓ | | |
| `precios` | Precios de Transferencia | | | | | | | | | | ✓ | | |
| `mapa_relacional` | Mapa de Relaciones | | | | | | | | | | | ✓ | |
| `alineacion_estado` | Plan Quinquenal | | | | | | | | | | | ✓ | |
| `favores` | Reciprocidad | | | | | | | | | | | ✓ | |
| `mianzi` | Armonía (Mianzi) | | | | | | | | | | | ✓ | |
| `tecnologia` | Ingeniería Base | | | | | | | | | | | | ✓ |
| `costo_capital` | WACC ONUDI | | | | | | | | | | | | ✓ |
| `flujo_firma` | FCFF | | | | | | | | | | | | ✓ |
| `riesgo` | Sensibilidad | | | | | | | | | | | | ✓ |


--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Pilar: Naturaleza / Identificación** | | | | | | |
| `introduccion` | ✓ | ✓ | | | | Justificación, origen y modelo básico. |
| `identidad` | ✓ | ✓ | | | | Misión, visión, valores y nombre. |
| `objetivos` | ✓ | | | | | Objetivos SMART y metas. |
| `foda` | ✓ | | | | | Fortalezas, Oportunidades, Debilidades, Amenazas. |
| `pestel` | ✓ | | | | | Análisis Político, Económico, Social, Tecnológico. |
| `legal` | ✓ | | | | | Marco legal, constitución y socios. |
| `canvas` | ✓ | | ✓ | | | Modelo de Negocio Canvas (Lean en Agile). |
| `involucrados` | | | | | ✓ | (BID) Mapeo de actores y beneficiarios. |
| `arbol_problemas` | | | | | ✓ | (BID) Causas y efectos del problema social. |
| `arbol_objetivos` | | | | | ✓ | (BID) Medios y fines para resolver el problema. |
| `alternativas` | | | | | ✓ | (BID) Estrategias posibles de intervención. |
| **Pilar: Mercado / Validación** | | | | | | |
| `analisis` | ✓ | | | | | Producto, ciclo de vida y demanda. |
| `segmentacion` | ✓ | | | | | TAM, SAM, SOM y perfil del cliente. |
| `buyer_persona` | | | ✓ | | | (Agile) Mapa de empatía y avatar detallado. |
| `clientes` | | ✓ | | | | (Micro) Perfil simplificado de a quién le vendemos. |
| `mapa` | ✓ | | | | | Análisis espacial y densidad geográfica. |
| `competencia` | ✓ | ✓ | | | | Análisis de competidores y ventajas. |
| `benchmarking` | ✓ | | | | | Comparativa estructurada contra líderes. |
| `comercializacion` | ✓ | ✓ | | | | Canales de distribución y promoción. |
| `ventas` | ✓ | | | | | Estrategia de pricing y volumen proyectado. |
| **Pilar: Técnico / Operaciones / MVP** | | | | | | |
| `ubicacion` | ✓ | | | | | Macro y micro localización. |
| `operacion` | ✓ | ✓ | | | | Diagrama de flujo de procesos y paso a paso. |
| `recursos` | ✓ | ✓ | | | | Maquinaria, equipo y herramientas. |
| `insumos` | ✓ | | | | | Materias primas y proveedores. |
| `capacidad` | ✓ | | | | | Capacidad instalada e inventarios. |
| `operativa` | ✓ | | | | | Eficiencia (DSO, DPO, Rotación, OTD). |
| `ambiental` | ✓ | | | | | Impacto ecológico y manejo de residuos. |
| `croquis` | | ✓ | | | | (Micro) Distribución del local. |
| `mvp_design` | | | ✓ | | | (Agile) Diseño y especificación del prototipo. |
| `critical_hypotheses`| | | ✓ | | | (Agile) Hipótesis de crecimiento y valor. |
| `pilot_results` | | | ✓ | | | (Agile) Datos y métricas de tracción. |
| `pivot_persevere` | | | ✓ | | | (Agile) Decisión basada en métricas del piloto. |
| **Pilar: Org, Finanzas y Presupuesto** | | | | | | |
| `estructura` | ✓ | | | | | Organigrama y funciones. |
| `recursos_humanos` | ✓ | | | | | Contratación, políticas y capacitación. |
| `inversion` | ✓ | ✓ | | | | Requerimientos de capital (CAPEX) o arranque. |
| `costos` | ✓ | ✓ | | | | Gastos fijos y variables mensuales (OPEX). |
| `estados_financieros`| ✓ | | | | | Proyección de resultados, balance y flujo. |
| `rentabilidad` | ✓ | | | | | TIR, VPN, Punto de Equilibrio y ROI. |
| `simulador` | ✓ | | | | | Simulador de corridas interactivas. |
| `unit_economics` | | | ✓ | | | (Agile) CAC, LTV y márgenes unitarios. |
| `burn_rate` | | | ✓ | | | (Agile) Runway y supervivencia de caja. |
| **Pilar Exclusivo: Base Tecnológica (I+D)**| | | | | | |
| `tech_invention` | | | | ✓ | | Descripción de TRL y novedad científica. |
| `property_intellectual`| | | | ✓ | | Estrategia de patentes y secretos. |
| `technical_id` | | | | ✓ | | Escalamiento y normativas científicas. |
| `prototyping` | | | | ✓ | | Bitácora de pruebas alfa/beta de laboratorio. |
| `tech_market` | | | | ✓ | | Clientes B2B/B2G y alianzas de codesarrollo. |
| `transfer_model` | | | | ✓ | | Modelo de royalties o creación de spin-off. |
| `rse_impact` | | | | ✓ | | Impacto ético/social del desarrollo tecnológico. |
| `circular_economy` | | | | ✓ | | Ecodiseño y ciclo de vida de materiales. |
| **Pilar Exclusivo: Proyecto Social (BID)** | | | | | | |
| `fin_proposito` | | | | | ✓ | Impacto a largo plazo y objetivo del proyecto. |
| `componentes` | | | | | ✓ | Bienes o servicios entregables. |
| `actividades` | | | | | ✓ | Tareas necesarias para entregar los componentes. |
| `monitoreo` | | | | | ✓ | Línea base y medios de verificación. |
| `gobernanza` | | | | | ✓ | Comité directivo y unidad ejecutora. |
| `edt` | | | | | ✓ | Estructura Desglosada de Trabajo (WBS/EDT). |
| `riesgos` | | | | | ✓ | Matriz de mitigación de riesgos. |
| `comunicaciones` | | | | | ✓ | Estrategia hacia los stakeholders. |
| `presupuesto_detallado`| | | | | ✓ | Costo desglosado por componente de Marco Lógico. |
| `evaluacion_exante` | | | | | ✓ | Costo-beneficio y TIR Social (no monetaria). |
| `sostenibilidad` | | | | | ✓ | Cómo sobrevive el proyecto al terminar el fondo. |

---

## 🌍 Fase 2: Arquitectura de Metodologías Internacionales (Implementadas)

Esta sección detalla los 6 marcos de trabajo avanzados globales que **ya han sido integrados en el código** (`src/config/frameworks.js`) con soporte técnico de integraciones de APIs externas del Gemelo Digital (Yahoo Finance, FRED, etc.).

| Metodología / Origen | Enfoque Principal | Módulos Clave Requeridos | Integración de APIs Externas (Sugeridas) |
| :--- | :--- | :--- | :--- |
| **ZOPP**<br>*(Alemania/GTZ)* | Planeación Orientada a Objetivos. Similar al BID pero con énfasis estricto en la moderación y participación comunitaria. | - Matriz de Participación<br>- Análisis de Problemas<br>- Análisis de Objetivos<br>- Matriz de Planificación (MPP) | - **API Demográfica Local** (INEGI) para validar el impacto social en tiempo real y vulnerabilidad de zonas. |
| **Horizon Europe**<br>*(Unión Europea)* | Subvenciones de investigación científica de la UE. Basado en "Ciencia Abierta" y sustentabilidad extrema. | - Consorcios Multinacionales<br>- Principio DNSH (Do No Significant Harm)<br>- Explotación (Open Science)<br>- Impacto Ecológico Cero | - **Copernicus API** (Datos de monitoreo ambiental europeo).<br>- **OpenAIRE API** (Validación de publicaciones científicas abiertas). |
| **Hoshin Kanri**<br>*(Japón)* | Despliegue de políticas (Policy Deployment). Visión a largo plazo (10-100 años) alineada con ejecución diaria en piso de planta. | - Visión a 10 años (True North)<br>- Matriz X (Alineación estratégica)<br>- Breakthroughs (Objetivos Anuales)<br>- Indicadores Bowler | No requiere APIs financieras. Es introspectivo. Posible integración con **Jira/Asana APIs** para medir ejecución diaria de las células. |
| **Amoeba Management**<br>*(Japón - Kyocera)* | Divide la empresa en micro-células de ganancia independientes. Mide la rentabilidad "por hora" del empleado. | - Mapeo de Células (Amebas)<br>- Transferencia Interna de Precios<br>- Rentabilidad por Hora-Hombre<br>- Reporte de Célula (Diario) | - Integración directa con el **ERP/Reloj Checador del cliente** vía Webhooks para actualizar la contabilidad por hora. |
| **Guanxi (Relacional)**<br>*(China)* | Negocios basados en redes de confianza, alineación gubernamental y reciprocidad estratégica. | - Mapa de Relaciones (Stakeholders)<br>- Alineación Estatal Quinquenal<br>- Reciprocidad Comercial<br>- Trazabilidad de Cadena | - **Google Trends / Baidu API** para análisis de sentimiento de mercado.<br>- **NewsAPI / GDELT** para escaneo de tendencias y nuevas leyes gubernamentales chinas. |
| **Estándares ONUDI**<br>*(Naciones Unidas)* | Evaluación financiera y de riesgo para proyectos industriales pesados en países en vías de desarrollo. | - Ingeniería Base<br>- Costo de Capital (WACC)<br>- Flujo de Caja Libre (FCFF/FCFE)<br>- Análisis Montecarlo y Sensibilidad | - **Yahoo Finance API** (Para Tasa Libre de Riesgo, Betas de la Industria y Costo de Capital en tiempo real).<br>- **World Bank Open Data API** (Indicadores macroeconómicos de riesgo país y PIB). |

---

## ⚙️ Arquitectura para el Perfeccionamiento de la Calculadora Financiera

Para soportar de manera profesional el "Proyecto de Inversión" y los "Estándares ONUDI", el código de la calculadora financiera actual (`src/lib/finanzas/calculadoraFinanciera.js`) deberá someterse a una actualización profunda:

1. **Automatización del WACC (Costo de Capital) y APIs:**
   - La calculadora dejará de usar tasas de descuento estáticas (ej. 10%). Se conectará a **APIs financieras (Yahoo Finance / FRED)** para leer los Bonos del Tesoro de EE. UU. a 10 años (Tasa libre de riesgo) y las "Betas" bursátiles de la industria para calcular matemáticamente qué rendimiento deben exigir los accionistas en tiempo real.
2. **Tablas de Amortización Dinámicas:**
   - Generación automática de cuadros de amortización (cuotas niveladas vs. amortización constante a capital), conectados a las tasas de referencia interbancarias en vivo (SOFR o TIIE).
3. **Motor de Riesgo (Simulación Probabilística Montecarlo):**
   - Incorporación de un script matemático de estadística para correr miles de escenarios virtuales sobre el proyecto, entregando un veredicto de inteligencia artificial: *"Existe un 85% de probabilidad de éxito si la inflación se mantiene debajo del 6%"*.
