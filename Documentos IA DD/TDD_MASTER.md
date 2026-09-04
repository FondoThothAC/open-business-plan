# TDD MASTER — Test-Driven Development & Quality Matrix
**Proyecto:** Open Business Plan (Fondo Thoth AC)  
**Versión:** 3.1.0  
**Cobertura Mínima Requerida:** 85% Lógica de Negocio y Finanzas | 80% Integración Agéntica  

---

## 1. Matriz de Suites de Prueba

| ID Suite | Módulo / Componente | Tipo de Prueba | Criterio de Aprobación |
|---|---|---|---|
| **TDD-01** | `DualInputSyncEngine` | Unitaria / Integración | La entrada en el Chat actualiza el Wizard en <50ms y viceversa sin bucles infinitos de render. |
| **TDD-02** | `DeepResearchRouter` | Unitaria / Mocking | Si no hay API key premium o se excede cuota, degrada limpiamente a DuckDuckGo + Scraping local sin romper la ejecución. |
| **TDD-03** | `ApiQuotaMeter` | Unitaria | Calcula correctamente el costo acumulado en USD por llamadas a Tavily / Serper / LLMs de razonamiento. |
| **TDD-04** | `MachineryRfqEngine` | Unitaria / Integración | Genera el documento formal RFQ con especificaciones completas, valida correos de destinatarios y gestiona el estado `PENDING_RESPONSE`. |
| **TDD-05** | `QuoteIngestionParser` | Unitaria / OCR Mock | Extrae montos de cotización de PDFs o inputs manuales e impacta el CAPEX del `ModuloFinanciero` recalculando VAN/TIR. |
| **TDD-06** | `DigitalTwinForkEngine` | Unitaria / Regresión | Genera un fork temporal independiente preservando el plan original y calcula el Delta de VAN/TIR con semáforo correcto. |
| **TDD-07** | `QuantumProfileDiagnostic` | Unitaria | Detecta anti-patrones del fundador (micromanagement, dinero rápido) y emite perfiles de puesto con bandas salariales válidas. |
| **TDD-08** | `PrintableFinancialReports & VistaPrevia` | Unitaria / Render | Renderiza todos los sub-reportes financieros sin lanzar ReferenceError cuando `planData` se hidrata de forma asíncrona o con props parciales. |
| **TDD-09** | `MemoryCache & HTTP Cache Policy` | Integración / Headers | Las consultas repetidas a INEGI y Banxico se resuelven desde memoria en <1ms; Nginx entrega index.html con no-cache y assets con immutable. |
| **TDD-10** | `Semantic URLs & Slug Routing (Opción A)` | Unitaria / Enrutamiento | Resuelve rutas canónicas /:tipoDoc/:modulo/:slug, normaliza cadenas con slugify, deduce pilares e hidrata proyectos de forma transparente. |
| **TDD-11** | `IndexedDB Storage Engine & Migration` | Unitaria / Almacenamiento | Almacena y recupera proyectos completos sin el límite de 5MB de localStorage, con soporte para anexos masivos y migración automática de datos legacy. |
| **TDD-12** | `Safe Web Search & Anomaly Handling` | Unitaria / Resiliencia | `safeDdgSearch` aplica ventana mínima de 1200ms, backoff ante rate limit y fallback limpio sin arrojar error 500 al cliente. |
| **TDD-13** | `Vite Build Consistency & Clean Chunking` | Integración / Build | Cero advertencias de importaciones mixtas en `apiConfig.js`, `ai.js` y `agenticEngine.js`; compilación limpia en <6s. |
| **TDD-14** | `Microempresa y Autoempleo (micro_business) Integrity` | Unitaria / Dominio | Cobertura total de 20 campos en 4 pilares, guías metodológicas completas, datos demo en Sové/MixRoom, enrutamiento semántico, modo Micro Canvas, y Diseñador Interactivo de Croquis 2D (`MicroCroquisEditor`) con cálculo de m² y prompts de IA. |
| **TDD-15** | `B.AI (B ia) Provider & GPT-5.2 / Qwen 3.8 Suite` | Unitaria / Integración | Valida registro en `MODEL_REGISTRY`, invocación compatible con OpenAI v1, extracción de tokens de razonamiento (`reasoning_content`) y fallback automático ante cuota/errores. |
| **TDD-16** | `DeepSeek Harness dsh v0.1 & Deep Research Engine` | Unitaria / Integración | Valida especificación `dsh-session-v0.1` Cordis, forking de sesión con preservación de linaje (`forkAtNode`), timeline de replay (`getReplayTimeline`), registro de `tool_deep_research`, ejecución con capa gratuita y auto-pausa por cuota (`paused_waiting_quota`). |
| **TDD-17** | `Data Provenance Contract & Goal-Oriented Loop` | Unitaria / Integración | Valida contrato estricto de procedencia (`verified_real`, `synthetic_estimate`, `not_found`), prohibición de alucinación silenciosa en `tool_web_search` e `tool_inegi_denue`, priorización de Fila 1 (Freemium/Local) sobre Fila 2 (Premium), y bucle ReAct autónomo con criterios de parada. |
| **TDD-18** | `Search Config Canonical Schema & Provenance Library` | Unitaria / Integración | Valida normalización de `config.search`, migración de aliases legacy (`tavilyApiKey` -> `apiKey`, `duckDuckGoEnabled` -> `enableDdg`), funciones puras de procedencia y estado honesto vacío. |

**Estado de Ejecución:** 150 tests pasando al 100% (26 suites, 0 fallos).

---

## 2. Fixtures y Mocking Strategy

* **Mock APIs Externas**: Interceptar llamadas a Tavily, Serper, Banxico SieAPI e INEGI mediante handlers controlados en `tests/mocks/`.
* **Mock OCR / Documentos**: Fixtures de cotizaciones en PDF de maquinaria (ej. Torno CNC Haas ST-20, Montacargas CAT 5000lbs) con datos conocidos para validar precisión de extracción.
* **Mock Estado Financiero**: Fixtures de proyecciones a 5 años (`previewFinancialData`) con estados de resultados, flujos de caja y métricas de proyectos industriales/mineros.
