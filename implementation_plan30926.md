# Plan de Implementación: Deep Research Autónomo, Contrato de Procedencia Real y Conexión de Herramientas Desconectadas

Este plan aborda la resolución integral de las 4 directivas acordadas en la sesión de alineación `/grill-me`:
1. Renombrar la carpeta muerta `Open-Business-Plan-VPS` a `_OLD_no_tocar` (✅ ya ejecutado).
2. Dejar el despliegue al usuario (no tocar servidores de forma invasiva).
3. Conectar herramientas huérfanas (`deepResearchEngine.js`, `MachineryRfqModal.jsx`, `tool_machinery_search`) en el flujo de industrialización y en los módulos de la interfaz.
4. Establecer un **Contrato Estricto de Procedencia de Datos** (`verified_real` vs `synthetic_estimate`) para eliminar la alucinación de datos inventados, con cascada de búsqueda que agota primero la **Fila 1 Gratis/Freemium/Local** antes de recurrir a la **Fila 2 Premium**.

---

## Decisiones Clave Alineadas en `/grill-me`

1. **Jerarquía de Búsqueda:**
   - **Fila 1 (Gratis / Freemium / Hardware Local):** Se agota SIEMPRE en primer lugar.
     - APIs públicas oficiales: INEGI DENUE (token gratuito) y Banxico SIE.
     - Proveedores freemium: Tavily Free (1,000 req/mes) y Brave Search Free (2,000 req/mes).
     - Motores locales / Hardware: DuckDuckGo (`duck-duck-scrape`), scraping con Puppeteer/Chromium local cuando se corre en localhost/escritorio.
   - **Fila 2 (Premium):** Solo si el usuario lo activa explícitamente o si se autoriza tras agotar la Fila 1:
     - **Exa.ai:** Búsqueda neuronal semántica para competidores reales B2B, empresas y directorios.
     - **Perplexity Sonar / Sonar Pro:** Búsqueda en vivo con síntesis y citas estructuradas.
     - **Tavily Pro.**
2. **Contrato Estricto de Procedencia (Data Provenance):**
   - Todo resultado de herramienta devolverá:
     ```json
     {
       "provenance": "verified_real" | "synthetic_estimate" | "not_found",
       "sourceUrl": "https://...",
       "retrievedAt": "2026-09-04T...",
       "confidenceScore": 0.95,
       "warning": null | "Datos estimados por falta de fuentes web verificadas"
     }
     ```
   - Si no se obtienen datos reales de la web o de APIs: **NO inventar nombres de empresas ni cuotas de mercado en silencio**. El sistema reporta `provenance: 'not_found'` y ofrece al usuario la opción manual: *"Reintentar con otros términos"* o *"Aprobar estimación heurística"*. En el PDF y en la UI se marcan visiblemente con un badge de procedencia.
3. **Bucle Autónomo ReAct (Goal-Oriented Loop):**
   - En `agenticEngine.js`, la formulación no será un pipeline rígido de un solo tiro. El agente define una **meta de información** (ej. "Mínimo 3 competidores reales y rango de precios verificado"), ejecuta búsquedas iterativas (máximo 3 rondas), evalúa si la meta fue alcanzada, y para automáticamente al cumplirla o alcanzar el presupuesto.
4. **Puntos de Conexión de Herramientas Huérfanas:**
   - **Industrialización:** Configuración granular en `GenerationControls.jsx` para activar/desactivar Deep Research por módulo y submódulo.
   - **Módulos Individuales (`ModuleWrapper.jsx` / `DynamicModule.jsx`):** Botón visible de "Investigación Profunda" en módulos de Mercado, Competencia y Proveedores.
   - **Operaciones & Finanzas (`ModuloOperaciones.jsx` / `ModuloFinanciero.jsx`):** Botón para abrir `MachineryRfqModal.jsx` (Cotizador Formal de Maquinaria y RFQs B2B).
   - **Configuración (`Configuracion.jsx`):** Panel para gestionar llaves de Tavily, Brave Search, Exa.ai, Perplexity, INEGI y toggle de Hardware Local.

---

## Cambios Propuestos

### 1. Núcleo de Búsqueda y Procedencia (`src/lib/tools/`)

#### [MODIFY] [`src/lib/tools/deepResearchEngine.js`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/lib/tools/deepResearchEngine.js)
- Incorporar conectores para:
  - **Brave Search API** (`https://api.search.brave.com/res/v1/web/search`) con extracción de snippets y URLs reales.
  - **Exa.ai API** (`https://api.exa.ai/search`) con búsqueda semántica para empresas y competidores.
  - **Perplexity API** (`https://api.perplexity.ai/chat/completions` con modelo `sonar`).
- Implementar la cascada estricta: Fila 1 (INEGI/Banxico ➔ Tavily Free ➔ Brave Free ➔ DuckDuckGo/Local) y luego Fila 2 (Exa.ai ➔ Perplexity ➔ Tavily Pro).
- Retornar formalmente cada fuente y hallazgo con el contrato de procedencia `{ provenance, sourceUrl, retrievedAt, confidenceScore }`.

#### [MODIFY] [`src/lib/agentTools.js`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/lib/agentTools.js)
- Refactorizar `tool_web_search` y `tool_inegi_denue`:
  - Si fallan las consultas reales o devuelven 0 resultados, **NO** retornar competidores falsos como verdaderos.
  - Retornar `{ success: true, provenance: 'not_found', requiresManualEstimateApproval: true, competitorsFound: 0, results: [] }`.
  - Si el usuario aprueba explícitamente la estimación heurística (`allowSyntheticEstimate: true`), generar la estimación pero con `provenance: 'synthetic_estimate'`, badge de advertencia y aviso explícito en la directiva del LLM.

---

### 2. Motor Agéntico Autónomo (`src/lib/agenticEngine.js`)

#### [MODIFY] [`src/lib/agenticEngine.js`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/lib/agenticEngine.js)
- Transformar la ejecución fija en un **Bucle Orientado a Metas (Goal-Oriented ReAct Loop)**:
  - Definición de meta por módulo (`goalDefinition`).
  - Soporte para ejecutar `tool_deep_research` cuando el módulo tenga activado el flag de investigación profunda.
  - Hasta 3 iteraciones de refinamiento de búsqueda si los primeros resultados tienen baja confianza o procedencia insuficiente.
  - Parada anticipada si se satisfacen los criterios de la meta.
  - Registro de cada iteración en el DAG Cordis `dsh-session-v0.1` para trazabilidad completa.

---

### 3. Conexión en Interfaz de Usuario y Flujos de Módulos

#### [MODIFY] [`src/components/GenerationControls.jsx`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/components/GenerationControls.jsx) y [`src/context/PlanContext.jsx`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/context/PlanContext.jsx)
- Añadir en el modal de configuración de Industrialización la opción de habilitar "Deep Research" por pilar o módulo (checkboxes interactivos).
- Propagar `deepResearchConfig` en `startIndustrialization`.

#### [MODIFY] [`src/components/ModuleWrapper.jsx`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/components/ModuleWrapper.jsx) y [`src/components/DynamicModule.jsx`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/components/DynamicModule.jsx)
- Añadir botón de acción rápida: **"Investigación Profunda (Deep Research)"** con modal de consulta/presupuesto y selector de procedencia.
- Indicador visual (Badge) en los campos generados: Verde para `Dato Verificado en Web` con enlace a la fuente, Ámbar para `Estimación Heurística Aprobada`.

#### [MODIFY] [`src/components/ModuloOperaciones.jsx`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/components/ModuloOperaciones.jsx) y [`src/components/Layout.jsx`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/components/Layout.jsx)
- Importar y montar `MachineryRfqModal.jsx`.
- Colocar botón "Cotizador de Maquinaria y RFQ B2B" en las secciones de Operaciones, Maquinaria e Inversión para activar la gestión asíncrona de cotizaciones.

#### [MODIFY] [`src/modules/Configuracion.jsx`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/src/modules/Configuracion.jsx)
- Añadir tarjeta de administración de **Proveedores de Búsqueda e Investigación**:
  - Inputs para API Keys: Tavily, Brave Search, Exa.ai, Perplexity Sonar.
  - Toggle de "Aprovechar Hardware Local (Scraping con Puppeteer y Ollama)".
  - Selector de Fila por defecto: Fila 1 (Gratis/Freemium/Local) vs Fila 2 (Premium).

---

### 4. Actualización de Especificaciones Vivas (`Documentos IA DD/`)

- `SDD_MASTER.md`: Documentar arquitectura de búsqueda Fila 1 vs Fila 2, contrato de procedencia y bucle Goal-Oriented.
- `TDD_MASTER.md`: Registrar nuevas pruebas para Brave Search, Exa.ai, contrato de procedencia y bucle ReAct de metas.
- `BDD_MASTER.md`: Escenarios Gherkin para procedencia real y detención de alucinaciones.
- `CDD_MASTER.md`: Documentar integración de `MachineryRfqModal` y botones de Deep Research en `ModuleWrapper`.

---

## Plan de Verificación

### Pruebas Automatizadas (TDD)
1. Crear `tests/dataProvenanceAndGoalLoop.test.js`:
   - Validar que `tool_web_search` y `tool_inegi_denue` devuelvan `provenance: 'not_found'` en caso de fallo, sin inventar empresas ficticias a menos que se apruebe `allowSyntheticEstimate: true`.
   - Validar integración de conectores Brave Search y Exa.ai con mocks y fallbacks.
   - Validar que el bucle ReAct en `agenticEngine.js` itere hasta cumplir la meta o alcanzar el límite de rondas.
2. Ejecutar suite completa con `npm test` (verificando que pasen los 131+ tests).
3. Compilación de producción: `npm run build` (0 errores).

### Verificación Manual en Interfaz
1. Abrir un módulo de mercado en el navegador (`npm run dev`), presionar "Investigación Profunda" y verificar que las fuentes web reales aparezcan con sus enlaces clicables.
2. Desconectar internet o simular fallo de API y verificar que el sistema no invente empresas ficticias, sino que alerte al usuario con el modal de aprobación manual.
3. Abrir Operaciones y verificar que el botón "Cotizador de Maquinaria RFQ" despliegue el modal `MachineryRfqModal`.
