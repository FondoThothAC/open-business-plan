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


---

## 2. Fixtures y Mocking Strategy

* **Mock APIs Externas**: Interceptar llamadas a Tavily, Serper, Banxico SieAPI e INEGI mediante handlers controlados en `tests/mocks/`.
* **Mock OCR / Documentos**: Fixtures de cotizaciones en PDF de maquinaria (ej. Torno CNC Haas ST-20, Montacargas CAT 5000lbs) con datos conocidos para validar precisión de extracción.
* **Mock Estado Financiero**: Fixtures de proyecciones a 5 años (`previewFinancialData`) con estados de resultados, flujos de caja y métricas de proyectos industriales/mineros.
