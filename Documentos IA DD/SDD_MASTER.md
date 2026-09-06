# SDD MASTER — Software Design Document & API Contracts
**Proyecto:** Open Business Plan (Fondo Thoth AC)  
**Versión:** 3.1.0 (UX Swarm Dual + Deep Research Híbrido + RFQ Asíncrono de Maquinaria + Gemelo Digital Temporal)  
**Estado:** Activo / Especificación Integral  

---

## 1. Arquitectura de 3 Niveles y Ecosistema de Agentes

Open Business Plan implementa una arquitectura escalonada orientada a rendimiento, control de costos y capacidad de ingeniería institucional:

```mermaid
graph TD
    subgraph "Nivel 1: UX Ágil & Swarm Onboarding (Inmediato / Local / Gratis)"
        ChatUI[Chat Conversacional Swarm] <--> SyncBridge[Puente de Sincronización Bidireccional]
        SyncBridge <--> WizardUI[Wizard Guiado por Pasos]
        Onboarding60[Onboarding Express 60s] --> SyncBridge
        SyncBridge --> LiveSwarm[Live Swarm Hub: CFO, COO, CMO, Risk Agentes]
    end

    subgraph "Nivel 2: Deep Research Swarm (Capa Híbrida Base vs Premium)"
        RouterSearch[Enrutador de Búsqueda Inteligente]
        LiveSwarm --> RouterSearch
        RouterSearch --> FreeTier[Capa Base Gratis: DuckDuckGo + Scraping Local + INEGI/Banxico Público]
        RouterSearch --> PaidTier[Capa Premium: Tavily API + Perplexity + Serper + Gemini 2.5 Pro / Claude 3.5]
        PaidTier --> CostQuotaMonitor[Monitor de Cuotas y Costos en Tiempo Real]
    end

    subgraph "Nivel 3: Agente Asíncrono de Maquinaria Pesada & RFQ B2B"
        HeavyMachineryReq[Requerimiento de Maquinaria Pesada / CAPEX Industrial]
        HeavyMachineryReq --> RFQGenerator[Generador Formal de RFQ / Ficha Técnica]
        RFQGenerator --> EmailDispatcher[Despachador de Correos a Distribuidores Autorizados]
        RFQGenerator --> ManualPkg[Descarga de Paquete RFQ para Trámite Manual]
        EmailDispatcher --> InboxWatcher[Bandeja de Recepción / Webhook / Upload PDF]
        ManualPkg --> InboxWatcher
        InboxWatcher --> DocOCR[Parser Documental OCR & Extracción de Cotización]
        DocOCR --> CapexRecalc[Recálculo Automático de CAPEX, VAN, TIR y Viabilidad]
    end

    subgraph "Gobernanza Continua: Gemelo Digital & Forking Temporal"
        MacroWatch[Vigilancia Periódica PESTEL, Banxico, Inflación, Insumos]
        MacroWatch --> AutoForkEngine[Motor de Forking Temporal: 'Gemelo Digital [Fecha]']
        AutoForkEngine --> DiffVisualizer[Visualizador Diff de Viabilidad & Semáforo de Impacto]
        CapexRecalc --> AutoForkEngine
    end
```

---

## 2. Contratos de API y Servicios del Sistema

### 2.1 Módulo Dual de Entrada (Chat Swarm + Wizard Sincronizado)
* **`useDualInputSync(initialSeed)`**: Hook de sincronización en tiempo real entre el chat de agentes y los formularios del Wizard.
* **Payload**: `{ seedData: Object, activeStep: number, pendingQuestions: Array, agentVotes: Object, confidenceScore: number }`.

### 2.2 Motor de Deep Research Híbrido (`src/lib/tools/deepResearchEngine.js`)
* **`runDeepResearch({ query, domain, depth, forcePaidTier, budgetLimitUsd })`**:
  * Si `forcePaidTier === false`: ejecuta scraping local + DuckDuckGo + INEGI/DENUE.
  * Si `forcePaidTier === true` o complejidad alta: orquesta llamada a Tavily/Perplexity/Serper + modelo de síntesis con registro de costo en `ApiQuotaMeter`.
* **Retorno**: `{ synthesizedReport: string, sources: Array<{ title, url, snippet, reliability }>, costUsd: number, executionTimeMs: number }`.

### 2.3 Agente Asíncrono de Maquinaria y RFQ (`src/lib/tools/machineryRfqEngine.js`)
* **`generateRfqPackage({ machineryItem, specs, targetDistributors, deliveryLocation })`**:
  * Genera documento formal RFQ (PDF/Markdown), ficha técnica, carta de intención y cuerpo de correo para proveedores.
* **`dispatchRfqEmails({ rfqId, recipients, smtpConfig })`**: Envía las solicitudes formales y registra la tarea en estado `PENDING_SUPPLIER_RESPONSE`.
* **`processIncomingQuote({ rfqId, quoteFile, manualData })`**: Procesa cotización en PDF vía OCR/LLM o entrada manual, extrae precio unitario, flete, garantías y tiempo de entrega, y actualiza el plan financiero automáticamente.

### 2.4 Motor de Forking Temporal y Gemelo Digital (`src/lib/digitalTwinEngine.js`)
* **`createTemporalFork({ projectId, triggerReason, newMacroData, newCostData })`**:
  * Clona el estado del proyecto bajo una nueva versión ramificada `Gemelo Digital — YYYY-MM-DD`.
  * Recalcula VAN, TIR, ROI, Punto de Equilibrio y PESTEL.
  * Retorna matriz comparativa `{ baseMetrics, forkMetrics, deltaPercentage, impactTrafficLight: 'GREEN' | 'YELLOW' | 'RED' }`.

---

## 3. Topología de Despliegue en Producción & Enrutamiento Subfolder (`/obp/`)

```mermaid
flowchart LR
    Client[Navegador del Usuario] -->|HTTPS fondothoth.com| Nginx[Nginx Reverse Proxy en VPS]
    
    subgraph "VPS Ubuntu 22.04 LTS (129.146.213.8)"
        Nginx -->|/ (sitio raíz)| LandingApp[Landing Fondo Thoth :8080]
        Nginx -->|/obp/ (Frontend SPA)| StaticDist["/var/www/open-business-plan/dist/\ntry_files $uri $uri/ /obp/index.html;"]
        Nginx -->|/obp/api/ (API Proxy)| ExpressServer["Express Backend PM2 (:3001)\nGET /api/health\nPOST /api/chat-stream\nGET /api/log/stream (SSE)"]
    end
```

### Contratos de Enrutamiento y Base Path:
* **Base Path del Frontend:** `VITE_BASE_PATH=/obp/` inyectado en tiempo de compilación para que React Router opere con `basename="/obp/"` y todos los assets apunten a `/obp/assets/`.
* **Contrato de Salud:** `GET /obp/api/health` retorna `{ status: "ok", version: string, service: string, uptime: string }`.
* **Aislamiento Total:** El sitio raíz `https://fondothoth.com` no es alterado; las directivas de OBP se integran exclusivamente bajo el prefijo `/obp/`.

### 3.1 Políticas de Caché HTTP (Nginx) y Caché en Memoria (Backend)
* **HTML (`/obp/index.html`):** Cabeceras `Cache-Control: no-cache, no-store, must-revalidate`. Garantiza que el cliente descargue siempre el HTML más reciente con los hashes JS vigentes.
* **Assets Estáticos (`/obp/assets/*`):** Cabeceras `Cache-Control: public, max-age=31536000, immutable`. Carga instantánea desde el disco/memoria del navegador (0 ms).
* **Backend In-Memory Cache con TTL:**
  * Endpoint `GET /api/inegi/denue`: TTL 6 horas.
  * Endpoint `GET /api/inegi/indicadores`: TTL 12 horas.
  * Endpoint `GET /api/banxico/indicators`: TTL 6 horas.
  * Protección: Máximo 1,000 llaves concurrentes con política de desalojo FIFO/LRU.

### 3.2 Estructura Canónica de URLs Semánticas (Opción A)
* **Patrón Canónico de Módulo:** `https://fondothoth.com/obp/:tipoDoc/:modulo/:slug`
  * Ejemplo: `https://fondothoth.com/obp/proyecto-inversion/demanda/comercio-cuantico`
* **Patrón Canónico de Secciones:** `https://fondothoth.com/obp/:tipoDoc/:seccion/:slug`
  * Ejemplo: `https://fondothoth.com/obp/proyecto-inversion/vista-previa/comercio-cuantico`
* **Resolución Automática de Pilar:** El enrutador deduce el pilar contenedor a partir del módulo mediante `resolvePillarFromModule` sin requerir que el usuario lo escriba en la URL.
* **Hidratación por Slug:** Si el parámetro `:slug` cambia o se ingresa por enlace externo, `loadProjectBySlug` localiza e hidrata automáticamente el proyecto correspondiente (plantilla de demostración o proyecto guardado en disco del VPS).

### 3.3 Persistencia de Alta Capacidad en Cliente (IndexedDB Nativo)
* **Base de Datos:** `OpenBusinessPlanDB` (Versión 1).
* **Object Stores:**
  * `projects`: Almacena el `planData` completo con resolución original de imágenes, planos, diagramas Mermaid y documentos RAG (soporta cientos de megabytes).
  * `project_meta`: Índices ligeros (`updatedAt`, `projectType`, `name`) para navegación y listados rápidos.
  * `settings`: Configuraciones de tema y variables de sesión.
* **Resiliencia y Fallback:** `localStorage` se utiliza exclusivamente para almacenar punteros ultraligeros (<5KB) protegidos con `try/catch`. En caso de saturación, el estado íntegro se mantiene garantizado en IndexedDB.
* **Migración Automática:** Al iniciar la app, `migrateFromLocalStorage` traspasa de forma transparente cualquier dato preexistente de `openplan_v2_data` hacia IndexedDB.

### 3.4 Motor de Búsqueda Web Resiliente (`safeDdgSearch`), Chunking Limpio de Vite y Comandos Agénticos
* **Búsqueda Web Resiliente (`safeDdgSearch`):**
  * Rate limiter estricto con ventana mínima de 1,200 ms entre consultas consecutivas.
  * Captura de anomalías por saturación de peticiones de DuckDuckGo con backoff automático de 2,500 ms y hasta 2 reintentos.
  * Manejo de fallo elegante (fallback silencioso): En caso de limitación irreversible, retorna array vacío sin arrojar error HTTP 500 ni interrumpir el proceso de enriquecimiento de competidores ni de industrialización.
* **Consistencia de Empaquetado y Eliminación de Advertencias en Vite:**
  * Estandarización de importaciones estáticas para módulos del núcleo compartido (`apiConfig.js`, `ai.js` y `agenticEngine.js`).
  * Supresión total de advertencias de Rollup por mezcla de `import(...)` dinámico y estático.
  * Tiempos de compilación de producción verificados: 5.86s con 0 errores y 0 advertencias de imports mixtos.
* **Comandos Agénticos del Asistente BOB (`Layout.jsx` & `BobChatModal.jsx`):**
  * `NAVIGATE`: Navega directamente a cualquier módulo del plan de negocios vía React Router o `openplan_navigate`.
  * `UPDATE_FIELD`: Resuelve dinámicamente el pilar y actualiza el campo del plan de negocios en el estado central.
  * `UPDATE_CAPEX`: Ajusta el monto de inversión inicial y recalcula los indicadores financieros.
  * `CONFIGURE_MULTIBRANCH`: Configura parámetros de expansión de sucursales y escalamiento cuántico.
  * `TRIGGER_INDUSTRIALIZE`: Inicia la cola de auto-llenado industrial agéntico.

### 3.5 Integración del Proveedor B.AI (B ia) y Modelos Flagship GPT-5.2 / Qwen 3.8 Flash
* **Endpoint Canónico:** `https://api.b.ai/v1/chat/completions` (Arquitectura compatible OpenAI v1).
* **Modelos Registrados:**
  * `gpt-5.2`: Modelo insignia insignia de alta capacidad para formulación estratégica profunda.
  * `qwen3.8-flash`: Modelo ultra-rápido con soporte de tokens de razonamiento (`reasoning_content`) transformados a etiquetas `<think>` para visualización interactiva.
  * `glm-5.3-flash` y `kimi-k3`: Modelos complementarios de alto rendimiento y bajo costo.
* **Proxy de Servidor Seguro:** `/api/ai/proxy` intercepta llamadas con target `https://api.b.ai/` e inyecta dinámicamente `BAI_KEY` desde variables de entorno de servidor en caso de omisión en cliente.
* **Endpoint de Diagnóstico en Tiempo Real:** `POST /api/test/bai` para verificación de conectividad y latencia mediante handshake instantáneo.
* **Soporte Agéntico Multi-Rol:** Integrado en el motor de ejecución Swarm (`LlmExecutionEngine.js`) y orquestador cliente (`callAiProvider` en `ai.js`).

### 3.6 DeepSeek Harness dsh v0.1 (Meta-Kernel Cordis), Replay Interactivo, Forking en Caliente y Deep Research Online
* **Especificación Oficial DeepSeek Harness (`dsh-session-v0.1`):**
  * Basado en la arquitectura del meta-kernel **Cordis** de DeepSeek, estructurado sobre registros inmutables append-only y DAGs causales.
  * **Modos de Operación Soportados:** `standard`, `code`, `minimal`, `creator`.
  * **Estructura del Nodo:** `{ id: 'node_X', parent: 'node_Y' | null, type: 'thought'|'tool_call'|'observation'|'reflection', title, content, toolName, toolArgs, toolResult, isApproved, durationMs, timestamp }`.
  * **Contexto Cordis:** Metadatos de kernel `{ kernel: 'cordis-v1', runtime: 'openplan-agentic-sandbox', securityLevel: 'isolated', lineage: [...] }`.
* **Replay Interactivo Paso a Paso (`getReplayTimeline` & `AgentTrajectoryViewer.jsx`):**
  * Extracción cronológica ordenada de la trayectoria para depuración visual.
  * Controles de reproducción interactiva: Play, Pause, Scrubber deslizable, selector de velocidad (1x, 2x, 5x) y foco visual en el nodo activo.
* **Bifurcación en Caliente (Hot Forking de Sesión):**
  * Método `forkAtNode(nodeId, newParams)` en `TrajectoryRecorder`: clona los nodos exactos hasta el punto de bifurcación, asigna un nuevo `sessionId`, preserva `parentSessionId` y `forkedFromNodeId`.
  * Interfaz de usuario en `AgentTrajectoryViewer.jsx` que despliega modal de bifurcación para cambiar el modelo (ej. conmutar de Ollama a B.AI GPT-5.2) o refinar el prompt antes de relanzar la rama hija.
* **Motor de Deep Research Online Resiliente & Background Tasks (`server/index.js` y `src/lib/tools/deepResearchEngine.js`):**
  * **Endpoints de Servidor Registrados:**
    * `POST /api/research/start`: Inicia investigación asíncrona en segundo plano con validación de presupuesto.
    * `GET /api/research/status/:taskId`: Consulta el progreso porcentual, estado (`running`, `paused_waiting_quota`, `completed`) y logs.
    * `POST /api/research/pause/:taskId` y `POST /api/research/resume/:taskId`: Control manual de pausa y reactivación.
    * `GET /api/research/history`: Listado de tareas históricas persistidas en disco (`proyectos/research/`).
  * **Gobernanza de Cuotas y Resiliencia:** Si las APIs de búsqueda o inferencia exceden el límite de tasa o saldo, el motor transiciona automáticamente a `paused_waiting_quota`, programa auto-reintento con backoff y emite un evento persistente en la interfaz.
  * **TerminalDrawer (`src/components/TerminalDrawer.jsx`):** Consola inferior deslizable con estética de IDE para desarrolladores, con pestañas de Streaming/Logs en vivo, Visualizador de Trayectorias Harness/Cordis, Lanzador de Investigación con autorización presupuestaria y Gestión de Tareas/Cuotas.
  * **Centro de Notificaciones en Cabecera (`Layout.jsx`):** Campana de notificaciones con badge de conteo no leído y menú desplegable para alertar al usuario cuando las tareas finalizan o entran en espera de cuota.

### 3.7 Arquitectura de Proveedores de Búsqueda (Fila 1 Freemium vs Fila 2 Premium), Contrato de Procedencia de Datos y Bucle ReAct Autónomo Orientado a Metas

* **Estratificación de Proveedores de Búsqueda (`SEARCH_TIERS`):**
  * **Fila 1 (Gratis / Freemium / Local):**
    * `tavily_free`: Tavily AI Search en modalidad gratuita (1,000 consultas/mes de cortesía).
    * `brave_search`: Brave Search API con cuota freemium de hasta 2,000 consultas/mes y privacidad estricta.
    * `duckduckgo`: Motor de búsqueda web sin costo y sin clave (`safeDdgSearch`).
    * `local_hardware_scrape`: Scraping local directo vía Puppeteer / Chromium sin costo de red externa.
    * `inegi_denue`: Directorio Estadístico Nacional de Unidades Económicas de México (datos oficiales abiertos).
    * `banxico_sie`: Sistema de Información Económica del Banco de México (series macroeconómicas oficiales abiertas).
  * **Fila 2 (Premium / Pago por Consumo):**
    * `exa_ai`: Búsqueda neuronal semántica y RAG web especializado ($0.010 USD / query).
    * `perplexity_sonar`: Sonar Pro y Sonar Reasoning con síntesis y citaciones directas ($0.008 USD / query).
    * `tavily_pro`: Búsqueda profunda en modo `advanced` para extracción exhaustiva ($0.005 USD / query).
  * **Política de Agotamiento de Cascada:** El orquestador ejecuta rigurosamente la Fila 1 (gratuitos y freemium) hasta agotar cuotas o detectar insuficiencia temática antes de disparar peticiones a la Fila 2 (APIs con costo), salvo indicación explícita del usuario (`tierPreference === 'tier2_first'`).

* **Contrato Estricto de Procedencia de Datos (Data Provenance Contract):**
  * Toda herramienta de recolección (`tool_web_search`, `tool_inegi_denue`, `deepResearchEngine`) debe retornar metadatos explícitos:
    * `provenance`: `'verified_real'` | `'synthetic_estimate'` | `'not_found'`.
    * `sourceUrl`: URL canónica verificada del hallazgo o `null`.
    * `retrievedAt`: Marca de tiempo ISO-8601 del momento de la consulta.
    * `confidenceScore`: Valor flotante entre 0.0 y 1.0 indicando certidumbre de los datos.
  * **Prohibición de Alucinación Silenciosa:** Si no se localizan registros reales o fallan los servicios externos, y `allowSyntheticEstimate` es `false`, las herramientas NO deben inventar competidores ni razones sociales ficticias; deben reportar limpiamente `provenance: 'not_found'` con `results: []` y `totalFound: 0`.
  * **Señalización en Interfaz:** Los resultados en la UI portan badges visuales distintivos:
    * Verde esmeralda: Datos Verificados Reales (`verified_real`).
    * Ámbar / Naranja: Estimación Heurística Sintética (`synthetic_estimate`), sujeta a confirmación manual del usuario.
    * Gris / Rojo: No encontrado (`not_found`).

* **Bucle Autónomo ReAct Orientado a Metas (Goal-Oriented Autonomous Loop):**
  * `runAgenticModuleGeneration` opera con hasta 3 rondas iterativas de refinamiento guiadas por objetivos (`goalCriteria`):
    1. **Fase de Evaluación de Evidencia:** Analiza la completitud y procedencia de los datos recopilados contra el objetivo de negocio.
    2. **Fase de Búsqueda Dirigida / Reformulación:** Si la información es insuficiente o no concluyente, genera queries especializadas adicionales aprovechando proveedores de Fila 1 y Fila 2.
    3. **Criterios de Parada:** El bucle concluye tempranamente cuando se satisface el objetivo, se alcanza la procedencia real requerida, o se agota el número máximo de rondas (evitando bucles infinitos y consumo excesivo de tokens).
    4. **Integración con Industrialización:** Activación granular de Deep Research por módulo o submódulo desde el modal de Industrialización, inyectando directivas estrictas de no-alucinación al modelo de síntesis final.

* **Arquitectura de Cuotas Persistidas y Failover Seguro (`server/quotaTracker.js`):**
  * Persistencia mensual en disco (`server/data/search_quota.json`) con llave temporal `YYYY-MM`.
  * Límites configurables: Brave Search Freemium (2,000 req/mes) y Tavily Freemium (1,000 req/mes).
  * Auto-pausa reactiva (`paused_waiting_quota`) cuando se alcanza el límite mensual y `allowPaidTier` está desactivado.
  * Failover seguro a DuckDuckGo (Fila 1 Gratis Ilimitada) para garantizar continuidad operativa sin cargos monetarios accidentales.
  * Endpoints de monitoreo: `GET /api/search/quota`, `GET /api/test/brave` y `GET /api/test/search`.

* **Endpoints Reales de Mercado y Proveedores (Erradicación de Alucinaciones):**
  * `ALL /api/market/search`: Scraping en tiempo real de cotizaciones industriales de maquinaria mediante DuckDuckGo industrial query builder y extracción limpia con Cheerio.
  * `ALL /api/market/suppliers`: Geocodificación y búsqueda combinada en fuentes abiertas de proveedores y distribuidores en la región solicitada.
  * Erradicación total de tablas y marcas hardcodeadas en `tool_machinery_search.js` y `tool_supplier_search.js`; estado honesto vacío `provenance: 'none'` cuando no existen cotizaciones verificadas.

* **Visualización de Procedencia y Control Reactivo en UI (`TerminalDrawer.jsx`):**
  * Componente `ProvenanceBadge` con codificación visual universal:
    * 🟢 `real`: Factual Verificado (Brave, Tavily, DENUE Oficial).
    * 🟡 `local_offline`: Hardware Local (Scraping local o caché offline).
    * 🔴 `synthetic`: Estimación Sintética Heurística (solo con autorización explícita).
    * ⚪ `none`: Sin Datos (Estado honesto vacío cuando no hay fuentes).
  * Pestaña dedicada `Cuotas & Fila 1/2` con barras de progreso de consumo mensual.
  * Control reactivo directo en tarjetas pausadas por cuota: botones para "💎 Autorizar Fila 2 (Pago)" o "🦆 Usar DuckDuckGo (Gratis)".

### 3.7 Erradicación de Proyectos Fantasmas y Endpoint DELETE Seguro (`server/index.js`)
* **Depuración de Archivos Huérfanos:**
  * 114 micro-archivos sueltos `proyecto_*.json` y `proyecto_*.md` en la raíz de `proyectos/negocios/` y `proyectos/social/` fueron archivados de manera segura en sus respectivos directorios `.archive/ghost_backups/`.
  * Modificación de `app.get('/api/projects')`: Se excluyeron explícitamente los archivos sueltos y directorios `.archive/` para asegurar que únicamente proyectos canónicos con estructura formal de carpeta sean listados.
* **Endpoint de Eliminación Segura:**
  * `DELETE /api/projects/:type/:id`: Mueve atómicamente el proyecto eliminado a `proyectos/:type/.archive/deleted_projects/:id_deleted_<timestamp>/`, preservando historial sin pérdida destructiva.

### 3.8 Consolidación de 12 Metodologías Canónicas para Comercio Cuántico Internacional TR SAPI de CV
* **Población Exhaustiva 100%:**
  * Cobertura de 278 campos requeridos a lo largo de los 12 frameworks canónicos (`business`, `social_bid`, `agile_startup`, `technology_id`, `micro_business`, `investment_project`, `zopp`, `horizon_europe`, `hoshin_kanri`, `amoeba_management`, `guanxi_plan`, `onudi_project`).
  * 0 campos faltantes y 95 módulos canónicos poblados verificados mediante la suite automatizada `tests/cciTwelveFrameworks.test.js`.
* **Rigor y Blindaje Financiero:**
  * Anclaje riguroso a los 4 documentos RAG de CCI: Inversión inicial de $20,000,000 MXN (Serie B a 200 cupos preferentes), reserva líquida colateral de $7,000,000 MXN para absorción del ciclo minero a 90 días, WACC del 12%, TIR del 15.11%, VAN de $1,836,412.50 MXN y punto de equilibrio de $641,666 MXN/mes.
  * Matriz de capital humano formal de 14 puestos clave con desglose de nómina IMSS al 32% y alineación atómica con la Regla 13 de Empresas Cuánticas (Fondo Thoth AC).
  * Sincronización inmutable dual en `comercio_cu_ntico_internacional_tr_sapi_de_cv.json` y su versión exportable en Markdown `comercio_cu_ntico_internacional_tr_sapi_de_cv.md`.

---

## 4. Diagrama Maestro de Arquitectura y Flujos en yEd Graph Editor

Se cuenta con la especificación visual completa y formal en formato **GraphML estándar** para **yEd Graph Editor**, replicando la metodología de visualización de Backstage-RED pero adaptada a la complejidad multi-método de Open Business Plan:

* **Ruta de Archivos GraphML / SVG:**
  * Archivo yEd: [`diagrams/OpenBusinessPlan_Master_Architecture.graphml`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/diagrams/OpenBusinessPlan_Master_Architecture.graphml)
  * Respaldo XML: [`diagrams/OpenBusinessPlan_Master_Architecture.graphml.xml`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/diagrams/OpenBusinessPlan_Master_Architecture.graphml.xml)
  * Render Vectorial: [`diagrams/OpenBusinessPlan_Master_Architecture.svg`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/diagrams/OpenBusinessPlan_Master_Architecture.svg)
  * Guía y Mapeo: [`diagrams/README_DIAGRAMA_OPENPLAN_YED.md`](file:///Users/robertoeduardocelisrobles/Documents/Proyectos/Open-Business-Plan/diagrams/README_DIAGRAMA_OPENPLAN_YED.md)
* **Métricas Estructurales:** 61 nodos y 67 aristas dirigidas cubriendo:
  1. *Entrada & Semilla Adaptativa:* `Anteproyecto.jsx`, `AdaptiveSeedForm.jsx`, `DualInputSyncHub.jsx`.
  2. *Empresas Cuánticas (Fondo Thoth AC):* Modelo Atómico de 3 Áreas (Finanzas, Operaciones, Administrativo), Principio Nuclear, Delegación Estructurada y Saltos Cuánticos de Escala.
  3. *Mesa de Expertos IA:* 4 Niveles de profundidad, cascada inteligente de fallback (Ollama Local-First ➔ NIM ➔ Groq/Gemini/OpenAI) y streaming SSE.
  4. *Los 12 Métodos de Industrialización:* Definidos en `src/config/frameworks.js`.

---

## 5. Contratos de Saneamiento, Coherencia Financiera y Endurecimiento Backend (v3.2.0)

Con base en el Plan de Saneamiento y Endurecimiento formalizado en `docs/architecture/OBP_SANITATION_DECISIONS.md`:

### 5.1 Contrato de Resolución de CAPEX Canónico (`src/lib/finanzas/canonicalCapex.js`)
* **Firma:** `resolveCanonicalCapex(planData, seed)`
* **Jerarquía de Resolución:**
  1. `seed.inversion_esperada` (numérico o texto monetario canónico).
  2. `seed.finanzas?.inversion_inicial`.
  3. Sumatoria de `inversion_fija + inversion_diferida + opex_inicial` en `planData.organizacion.inversion`.
  4. `planData.organizacion.inversion.monto_inversion`.
* **Políticas de Ejecución:**
  * **Modo Estricto (`OBP_STRICT_FINANCIALS=1`):** Lanza error `INVERSION_CANONICA_NO_ENCONTRADA` si no existe inversión declarada.
  * **Modo Permisivo (Default):** Retorna `null` o advertencia formal con bandera `requiere_revision: true`.

### 5.2 Validador de Cordura y Consistencia Financiera (`src/lib/finanzas/financialSanityCheck.js`)
* **Firma:** `validateFinancialConsistency(planData)`
* **Salida:** `{ valid: boolean, inconsistencies: Array<{ module: string, field: string, flag: string, expected: any, actual: any }>, warnings: Array<string> }`
* **Reglas:**
  * Discrepancia entre inversión declarada en semilla y balance general superior a $\pm 5\%$.
  * TIR fuera del rango plausible $[0\%, 100\%]$ o ROI fuera de $[-100\%, 1000\%]$.
  * Payback catalogado como `'Nunca'` o mayor a 10 años.
  * Punto de Equilibrio que contenga `'∞'` o división por cero.

### 5.3 Versionado Inmutable y Control de Concurrencia (`server/index.js`, `src/lib/serverUtils/`)
* **Directorio de Versiones:** `proyectos/<type>/<id>/.versions/<ISO_DATE>-<hash8>.json`.
* **Manifiesto:** `.versions/index.json` registrando metadatos `{ ts, hash, modulesCount, inversionTotal }`.
* **Límite FIFO:** Máximo 20 versiones históricas por proyecto.
* **Integridad Estricta:** Si una petición `POST /api/save` intenta persistir una cantidad de módulos poblados menor a la versión previa estable, el servidor emite un rechazo `HTTP 409 Conflict` requiriendo confirmación.
* **Mutex de Generación Agéntica (`generationLock.js`):**
  * `POST /api/projects/:type/:id/lock`: Bloqueo por sesión en memoria con expiración automática de 30 min. Rechaza llamadas concurrentes con `HTTP 423 Locked`.
  * `POST /api/projects/:type/:id/unlock`: Liberación por sesión o forzada.
  * `GET /api/projects/:type/:id/lock`: Consulta de estado activo del lock.
* **Endpoint de Renombrado Seguro (`projectRename.js`):**
  * `POST /api/projects/:type/:id/rename`: Valida origen y destino, consolida metadata, guarda con versionado inmutable, genera Markdown canónico y archiva el directorio previo en `proyectos/<type>/.archive/`.

### 5.4 Gobernanza de Costos y Human-in-the-Loop (`src/lib/paidModelGovernance.js`)
* **Firma de Verificación:** `isPaidProviderOrModel(provider, model)`
* **Estimación de Consumo:** `estimateCallCostUSD(provider, model, promptTokens, completionTokens)` basada en `src/config/pricing.js`.
* **Guardián de Fallback:** `shouldAllowPaidFallback(provider, model, config)`. Si la rotación de emergencia intenta conmutar a OpenAI, Claude, Grok o modelos no gratuitos de OpenRouter, pausa la conmutación y emite el evento reactivo `openplan_paid_model_warning` si `allowPaidTier` no está habilitado por el usuario.
* **Trazabilidad Dual:** Registro independiente de `requestedProvider` (solicitado) y `actualProvider` (real) en telemetría y en `AiTraceabilityPanel.jsx`.

### 5.5 Cascada Configurable de Búsqueda Fila 1 y Conector Serper (`deepResearchEngine.js`, `Configuracion.jsx`)
* **Prioridad Configurable:** `searchConfig.tier1Priority` permite ordenar dinámicamente entre DuckDuckGo, Google Serper, Tavily y Brave Search.
* **Conector Google Serper API:** 2,500 búsquedas gratuitas de resultados orgánicos de Google y Places/Maps para extracción de competidores reales.
* **Endpoint de Verificación:** `POST /api/test/serper` y soporte en `POST /api/test/search`.

