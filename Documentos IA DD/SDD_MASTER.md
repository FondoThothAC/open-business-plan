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

### 3.6 Visualización Territorial del Corredor Minero Estatal (`InegiMap.jsx`)
* **Activación de Cluster:** Al seleccionar el cluster `all` (Todo el Corredor Minero Sonora), `seedStatewideMiningCorridor()` puebla y dibuja de forma interactiva los nodos industriales clave (`corridorPoints`).
* **Categorización B2B:** Distinción cromática y semántica entre Proveedores Críticos (Hermosillo, Guaymas), Clientes B2B / Minas Insignia (Buenavista del Cobre en Cananea, La Caridad en Nacozari, Penmont en Caborca) y Competidores Locales con sus respectivos estratos de personal y ponderaciones de impacto.
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

### 3.9 Cumplimiento de Reglas de Hooks (React Error #300) y Motor RAG Financiero
* **Erradicación de React Error #300:**
  * Causa raíz: Retornos condicionales anticipados (`if (!trajectory) return null`, `if (!isOpen) return null`, `if (!promptData) return null`) situados antes de hooks de React (`useState`, `useEffect`, `useMemo`).
  * Componentes corregidos: `AgentTrajectoryViewer.jsx`, `BobChatModal.jsx`, `GrillMePromptModal.jsx`. Todos los hooks se declaran al inicio incondicionalmente.
* **Extracción Inteligente RAG y Proyecciones Realistas (`calculadoraFinanciera.js`):**
  * Extracción tabular por filas de documentos PDF adjuntos: Materia prima ($5.70), Mano de obra directa ($3.09), Empaque ($1.62), Energéticos ($0.03) y Costo Total de Producción ($10.44).
  * Correlación con proyecciones de mercado (15,000 unidades mensuales, margen bruto objetivo de 40%-42%, precio unitario de $18.00 MXN).
  * Inyección de desgloses JSON estructurados (`desglose_capex_json`, `desglose_opex_json`, `ingresos_json`) y erradicación de estados "No calculable" destructivos en corridas automáticas con evidencia de negocio.
  * Curva de despegue y ramp-up para Año 1 (~55% de capacidad promedio) garantizando métricas dentro del marco financiero plausible auditado por `financialSanityCheck` (TIR 35.0%, Payback 1.4 años, B/C 2.92).

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

### 5.6 Resumen Ejecutivo Formal, Dictamen de Viabilidad Real (2 Fases) e Integración INEGI DENUE (`src/components/ExecutiveSummarySection.jsx`, `src/modules/VistaPrevia.jsx`)
* **Ubicación en Documento Maestro:** Página 3 de la Vista Previa y PDF corporativo (entre el Índice General en P.2 y el Tablero Ejecutivo en P.4).
* **Estándar Metodológico:** Formulación según Linda Pinson (*Anatomy of a Business Plan*) y Modelo Atómico Cuántico de Fondo Thoth AC.
* **Elevator Pitch:** Formato de 30 segundos (Problema, Solución Tecnológica, Propuesta de Valor y Requerimiento de Capital).
* **Dictamen de Viabilidad para Comités de Inversión (Honestidad Técnica Radical):**
  * **Veredicto:** `VIABLE CONDICIONADO A ESTRATEGIA EN DOS FASES`.
  * **Fase 1 (Mercado Regional B2B):** $4,000,000 MXN. 100% Viable con capital solicitado para 5.1 ton/mes en 1 horno ASADHOR bajo aviso COFEPRIS y NOM-251-SSA1-2009.
  * **Fase 2 (Exportación Binacional EE.UU.):** Inviable con solo $4M MXN; requiere Ronda Serie A de $20,000,000 MXN para planta con certificación Tipo Inspección Federal (TIF / NOM-008-ZOO-1994), auditoría bilateral USDA/FSIS, túnel criogénico IQF y registro FDA.
* **Matriz de Permisos Sanitarios:** Desglose con costos oficiales en MXN, tiempos de trámite y autoridad regulatoria (COFEPRIS vs SENASICA vs USDA/FSIS vs FDA).
* **Integración Censal INEGI DENUE:** Consulta directa a la API oficial de INEGI DENUE (`/api/inegi/denue`) mapeando competidores reales en radio municipal con folio, razón social, estrato de personal y ventaja diferencial frente al producto termo-listo de VCV.

### 5.7 Motor Autónomo de Investigación Internacional & Escalamiento Cuántico (`server/autonomousResearchEngine.js`, `POST /api/research/autonomous-competitors`)
* **Cascada Geográfica Obligatoria:** Censo local/estatal (INEGI DENUE) $\rightarrow$ Búsqueda web nacional (DuckDuckGo) $\rightarrow$ Búsqueda de operadores internacionales (Google Serper / Tavily / Brave en EE.UU.).
* **Categorización Estratégica de Competidores:**
  * `AMENAZA_DIRECTA` (Rojo): Oferentes de producto terminado termo-listo o cocinado.
  * `OPORTUNIDAD_ALIANZA` (Verde): Plantas TIF, frigoríficos o distribuidores mayoristas con potencial de maquila o distribución.
  * `SUSTITUTO_INDIRECTO` (Ámbar): Carnicerías tradicionales de mostrador con producto crudo.
* **Flowchart Mermaid de Escalamiento Cuántico:** Representación gráfica visual de las fases con compuerta de decisión condicional (`GateDecision`).
* **Matriz de Compuertas de Decisión (KPIs Gate):** Criterios cuantitativos de tracción (EBITDA mensual $\ge$ $1.5M MXN, OTD $\ge$ 98%, retención $\ge$ 85%, validación HACCP y LOI firmada) requeridos para desbloquear la solicitud de fondos Serie A de $20M MXN.

### 5.8 Motor Deep Research "Método Perplexity" con Extracción Demográfica INEGI AGEB
* **Arquitectura de evidencia:** Descompone competencia, precio/canal y demanda en búsquedas separadas; conserva URL, extracto, fecha y estado de cada fuente antes de redactar el Markdown.
* **DENUE y Censo no se confunden:** `inegiAgebEngine.js` obtiene establecimientos, actividad, tamaño y ubicación desde DENUE. La población, edad, escolaridad y viviendas requieren el conjunto censal por AGEB/manzana versionado; nunca se infiere ingreso a partir del tamaño de los negocios.
* **Estimaciones explícitas:** Todo escenario conserva fuente, año, geografía, fórmula, supuestos y limitaciones. ENIGH sólo se usa en su dominio publicado; no se presenta como medición de una colonia.
* **Clasificación verificable:** Un establecimiento se marca como competencia directa, indirecta/sustituto, cliente potencial o pendiente con una razón y evidencia de producto, canal y cobertura.
* **Gobernanza UXDD:** La vista de rutas activas de Mercado persiste Markdown, evidencia, indicadores y pendientes. No utiliza Hermosillo ni coordenadas predeterminadas cuando falta el territorio confirmado.

### 5.10 Gestión Integral de Usuarios, Sesiones HttpOnly, Auditoría Inmutable y Dossier Canónico VCV (20 Páginas)
* **Arquitectura de Autenticación & Sesión Segura (`server/auth.js`, `server/middleware/authGuard.js`, `src/context/AuthContext.jsx`):**
  * Sustitución completa de tokens JWT en `localStorage` por cookies seguras `HttpOnly`, `Secure` (en producción/HTTPS) y `SameSite: 'Lax'`.
  * Opción "Recordarme" calibrada: sesión volátil (cerrar navegador) vs persistencia de 30 días con renovación controlada.
  * Migración automática con purga del navegador de tokens heredados `openplan_token` al iniciar sesión.
* **Modelo de Roles y Privilegios:**
  * `superadmin`: Acceso irrestricto, administración integral de usuarios, cambio de roles, auditoría, reseteo de contraseñas, y visualización exclusiva del módulo Comercio Cuántico TR.
  * `revisor`: Acceso a proyectos asignados y públicos para comentar y validar; sin permisos de aprobación final ni borrado.
  * `user`: Propietario de proyectos; puede crear, editar, solicitar revisión y archivar sus propios anteproyectos.
* **Bitácora de Auditoría Inmutable (`server/auditLogger.js`, `server/data/audit_log.json`):**
  * Registro inmutable de eventos críticos: logins, cambios de rol, aprobación/rechazo de proyectos, reseteo de claves y exportaciones.
  * Consulta centralizada protegida por rol `superadmin` mediante `GET /api/admin/audit`.
* **Gobernanza de Proyectos & Proyectos Incompletos (`ProjectWorkspaceModal.jsx`, `Layout.jsx`):**
  * Desacoplamiento explícito entre avance cuantitativo (`avance`) y estado editorial (`Borrador`, `En revisión`, `Aprobado`, `Archivado`).
  * Visualización de módulos faltantes, responsable, última edición y botón **Continuar**.
  * Apertura de proyectos de otros usuarios en modo supervisor/revisor con banner superior informativo, sin suplantación de identidad.
* **Calibración Canónica de Exportación VCV a 20 Páginas (`scripts/generate_vcv_dossier.js`, `VistaPrevia.jsx`):**
  * Dossier ejecutivo consolidado en orientación vertical Letter (`612 x 792 pts`) en exactamente 20 páginas sin páginas en blanco.
  * Respaldo histórico del PDF de 114 páginas en `vcv/historico-114p-vcv-cortes-finos.pdf` (8.4 MB) y generación del nuevo PDF ejecutivo de 2.1 MB.
  * Sincronización fiel de cifras canónicas: Inversión $4M MXN, Ventas $59.9M MXN, Utilidad Neta $12.7M MXN, TIR 38.4%, VPN $6.85M MXN, Payback 18 meses, B/C 1.45.
### 5.11 Módulo de Revisión Externa Temporal, Sanitización de Secretos y Revocación de Sesiones
* **Enlaces Temporales de Revisión (`server/reviewStore.js`, `server/index.js`, `src/components/ReviewPage.jsx`):**
  * `POST /api/projects/:type/:id/review-invites`: Crea un enlace temporal con token criptográfico único (SHA-256 en reposo), alcance configurable (`executive` | `full`) y duración de 1 a 30 días (7 por defecto).
  * `GET /api/review/:token`: Permite el acceso sin sesión interna al documento del proyecto, expurgando 100% las API keys, contraseñas, configuraciones sensibles e identificadores de infraestructura interna.
  * `POST /api/review/:token/comments`: Almacena observaciones y notas del revisor externo con timestamp ISO, correo de contacto, versión del plan y ancla a nivel de módulo o bloque.
  * `DELETE /api/projects/:type/:id/review-invites/:inviteId`: Revocación inmediata del enlace; cualquier acceso subsecuente es bloqueado con HTTP 404 / 410.
* **Revocación Proactiva de Sesiones JWT (`server/auth.js`, `server/middleware/authGuard.js`):**
  * Toda modificación crítica de credenciales (cambio de contraseña, reseteo administrativo, cambio de rol RBAC o desactivación de cuenta) incrementa atómicamente el campo `sessionVersion` del usuario en `server/data/users.json`.
  * El middleware `authGuard` verifica que `Number(payload.sessionVersion) === Number(usuario.sessionVersion)`. Ante discrepancias, responde de inmediato con HTTP 401 (`code: 'SESSION_REVOKED'`), forzando nuevo inicio de sesión e impidiendo el secuestro de tokens obsoletos.
* **Integración y Flujo de Interfaz (`VistaPrevia.jsx`, `Layout.jsx`, `AdminUsersPanel.jsx`):**
  * En `VistaPrevia`, el botón "Compartir para revisión" genera el enlace, lo copia al portapapeles y despliega la URL temporal generada.
  * En `AdminUsersPanel`, la acción `onOpenProject` carga el proyecto seleccionado e interactúa con el enrutador semántico para dirigir al administrador a la vista correspondiente sin pérdida de estado.

### 5.12 Enrutamiento Agéntico de BOB y Autoconfiguración Segura de API Keys
* **Endpoint de Chat Autenticado de BOB (`POST /api/ai/bob-chat`):**
  * Requiere autenticación de usuario activa (`authGuard`).
  * Desencripta en tiempo de ejecución las API keys privadas del usuario en memoria efímera mediante AES-256-GCM sin exponer los secretos en el cliente ni almacenarlos en historiales conversacionales.
  * Resuelve la cascada multi-proveedor: Ollama Cloud (o proveedor configurado por el usuario: Groq, OpenRouter, OpenAI) con fallback transparente a Ollama local (`localhost:11434`).
* **Autoconfiguración Guiada y Manuales Directos (`src/components/BobChatModal.jsx`, `src/components/UserProfileModal.jsx`):**
  * Botón contextual *"Configurar API"* embebido en la cabecera e interfaz conversacional de BOB.
  * Selector asistido de proveedor con manuales paso a paso y enlaces directos a las consolas oficiales para tramitar API keys (Ollama Cloud, Groq, OpenRouter, OpenAI, Mistral, Google Gemini, Anthropic, Cerebras, DeepSeek, SambaNova).
### 5.13 Blindaje de ErrorBoundary, Resolución de Base Path y Política Anti-Caché Nginx (RFC 7234)
* **Resolución Relativa de Subruta Base en ErrorBoundary (`src/components/ErrorBoundary.jsx`):**
  * Corrección crítica de navegación: se erradica el redireccionamiento estático y rígido a `/semilla` (que expulsaba al usuario al dominio raíz `fondothoth.com/semilla` provocando errores 404).
  * Inyección dinámica de `import.meta.env.BASE_URL` para respetar el subpath `/obp/` (`${normalizedBase}/semilla`), garantizando que la recuperación del usuario se mantenga dentro del contexto SPA.
  * Inclusión de acción dual: botón prioritario *"Volver a Semilla"* y botón secundario *"Recargar Aplicación"* (`window.location.reload()`) para resolver estados transitorios desincronizados.
  * Estilizado premium consistente con el tema oscuro de la plataforma, evitando fondos blancos invasivos y presentando detalles técnicos desplegables para soporte ágil.
### 5.14 Aislamiento Estricto de Credenciales de IA, Sanitización del Plan y Catálogo Dinámico Ollama Cloud
* **Sanitización del Objeto del Plan al Guardar (`src/lib/serverUtils/sanitizeProjectConfig.js`, `server/index.js`):**
  * Toda persistencia en disco depura automáticamente llaves y tokens (`externalApis`, `apiKeys`, `ai.*Key`, `ai.*Token`).
  * Los proyectos compartidos o exportados quedan completamente limpios de secretos.
* **Canal Seguro de Generación con Cuenta Personal (`/api/ai/account-chat`):**
  * Los modelos de Ollama Cloud (`gpt-oss:20b`, `gpt-oss:120b`, `nemotron-3-nano:30b`, `nemotron-3-super`, `nemotron-3-ultra`, `gemma4:31b`) se ejecutan a través del backend utilizando exclusivamente la clave cifrada del usuario conectado.
  * Se eliminan fallbacks hacia claves obsoletas alojadas en archivos JSON.
  * BOB muestra en cada respuesta el proveedor y modelo verificado por el backend.
  * Catálogo dinámico consultado en vivo contra `https://ollama.com/api/tags` con perfiles de contexto óptimos (32K/64K de trabajo) para balancear profundidad y velocidad de respuesta.

### 5.15 Resiliencia Integral en Anteproyecto, Swarm IA y Diagnóstico de Salud de Servidor
* **Diagnóstico de Salud de Servidor sin Falsos Positivos (`src/components/ServerHealthBanner.jsx`):**
  * Se sustituyó la consulta a `/api/projects` (que arrojaba código HTTP 401 para usuarios no autenticados) por `/api/health` con `credentials: 'include'`.
  * La verificación de salud confirma disponibilidad real de PM2 sin disparar cintillos rojos erróneos de reinicio ("pm2 restart obp-backend") ante sesiones públicas.
* **Resiliencia de Extracción y Clasificación en Semilla (`src/components/Anteproyecto.jsx`, `src/lib/ai.js`):**
  * Incorporación de envoltorio con timeout preventivo (25s) y `Promise.all` resiliente para `extractSeedFromText`, `classifyProject` y `matchIndustry`.
  * Ante demoras de red o fallas de proveedores de IA, el sistema ejecuta una degradación elegante determinista hacia el perfil del proyecto, asegurando que el Paso 2 nunca se congele y avanzando siempre al Paso 3 de forma fluida.
  * Botón de escape explícito en la interfaz del Paso 2: *"Omitir espera y continuar al Paso 3"*.
* **Soporte Integral de Ollama Cloud (`gpt-oss:20b`) y Sincronización Automática (`server/index.js`, `src/modules/Configuracion.jsx`):**
  * `POST /api/ai/account-chat` admite explícitamente `apiKey` y `ollamaKey` en el cuerpo de la petición cuando el usuario las configura en el cliente, sincronizándolas de forma segura en `users.json` y resolviendo variables de entorno de respaldo.
  * `Configuracion.jsx` sincroniza proactivamente cualquier alta o modificación de llaves con `PUT /api/auth/me/keys`.
* **Habilitación de Swarm IA para Sesiones Públicas y Mixtas (`server/middleware/authGuard.js`, `src/components/swarm/SwarmInterviewModal.jsx`):**
  * Inclusión de `/api/swarm/interview`, `/api/swarm/stream` y `/api/swarm/industrialize` en `RUTAS_PUBLICAS` con enriquecimiento opcional de token.
  * Inyección de `credentials: 'include'` en peticiones fetch y `withCredentials: true` en `EventSource` para el flujo SSE de agentes enjambre.
  * Fallback conversacional local garantizado en `SwarmInterviewModal` en caso de contingencias de red.

### 5.16 Captura Explícita de Nombre de Proyecto en Semilla y Resiliencia de BOB con Ollama Cloud
* **Captura de Identidad en Paso 1 de Semilla (`src/components/Anteproyecto.jsx`):**
  * Se agregó un campo de entrada prioritario y visible en el Paso 1 para "Nombre del Proyecto o Marca Comercial" (`#nombre-proyecto-input`).
  * Persistencia inmediata y reactiva hacia `planData.semilla.nombre_proyecto` y actualización de estado local sincronizado.
  * La función `processText` respeta y prioriza el nombre provisto por el usuario, evitando que sea sobrescrito por títulos heurísticos o aproximaciones de IA.
* **Calibración y Resiliencia de BOB para Cuentas Gratuitas de Ollama Cloud (`server/index.js`, `src/lib/bobAgent.js`, `src/components/BobChatModal.jsx`):**
  * Normalización automática del modelo en `/api/ai/bob-chat`: los modelos con sufijo `:cloud` o `minimax-m3` (que devuelven HTTP 402 en cuentas gratuitas de Ollama Cloud) son mapeados automáticamente a `gpt-oss:20b`.
  * Detección activa de error HTTP 402 con reintento transparente inmediato en `gpt-oss:20b`.
  * Soporte en el cuerpo de la petición (`apiKey`, `ollamaKey`, `bobOllamaKey`, `groqKey`) y resolución hacia variables de entorno del servidor (`process.env.OLLAMA_KEY`, `process.env.GROQ_KEY`).
  * Resiliencia del lado cliente en `src/lib/bobAgent.js`: ante cualquier error de comunicación o rechazo del servidor, `sendBobMessage` ejecuta fallback transparente a `callAiProvider` en el cliente, permitiendo que la interacción continúe sin interrupciones.

### 5.17 Calibración Financiera Realista para Microempresas y Depuración de Tabla de Maquinaria
* **Corrección de Inflación 12x en Ingresos y Ruptura de Retroalimentación (`src/lib/finanzas/calculadoraFinanciera.js`):**
  * Se eliminó el bucle de retroalimentación donde montos anuales extraídos de textos narrativos (`Año 1: Ventas $...`) eran tomados como ingresos mensuales, multiplicando artificialmente las ventas anuales por 12 (lo que elevaba proyectos barriales a $6,000,000 MXN en ventas y $11,000,000 MXN de VPN).
  * Se implementó anclaje directo a la absorción de mercado real (`SOM` / `SAM` en `planData.mercado.segmentacion`): para proyectos locales/microempresariales (ej. repostería, alimentos artesanales en colonias de 2,000 a 3,000 habitantes), el volumen mensual se calibra a una demanda factible de 1,200 a 2,500 piezas/mes ($21,600 a $45,000 MXN/mes).
  * Calibración proporcional de costos fijos (renta, servicios, administración) que no excedan el 30% del volumen de venta estimado en negocios artesanales/domiciliarios.
  * Inversión inicial calibrada a activos tangibles de microproducción ($35,000 a $45,000 MXN), resultando en un VPN plausible de ~$143,697 MXN, TIR de 35.7% y Payback de 9 meses.
* **Depuración de Tabla de Maquinaria y Equipo en Vista Previa (`src/modules/VistaPrevia.jsx`):**
  * En `MaquinariaTable({ data, planData, exportScope })`, se prioriza el desglose estructurado de activos (`planData.organizacion.inversion.desglose_capex_json`), visualizando equipos reales con sus costos unitarios y vidas útiles reales.
  * Filtro estricto contra oraciones narrativas en texto libre: oraciones explicativas que inician con *"Para la...", "La línea...", "Además...", "El proceso..."* son descartadas en lugar de ser interpretadas como máquinas con costo arbitrario de $180,000 MXN.
  * Sustitución de fallbacks de minería pesada ($1.85M en bancos hidráulicos) por equipos pertinentes al sector comercial/artesanal (horno de convección $14k, batidora $8k, mesas inox $4.5k, selladora $1.5k).
* **Formateo Limpio de Período de Recuperación (Payback) (`src/components/FinancialCharts.jsx`):**
  * Se sustituyó la visualización cruda con pipes (`0 año(s)|0 mes(es)|23 día(s)`) por el formateador semántico `formatearPayback`, el cual presenta cadenas legibles y profesionales como `"9 meses"`, `"8 meses 10 días"` o `"1.2 Años"`.
  * Sincronización bidireccional entre `corrida_automatica` y las tarjetas ejecutivas de KPI.
### 5.18 Conclusión de Formato Ultra-Conciso (FODA/Canvas/PESTEL), Exportador de Prompts Enriquecidos y Robustecimiento de INEGI DENUE
* **Directivas de Máxima Síntesis y Viñetas Cortas (`src/lib/verbosityManager.js`, `tests/verbosityConstraint.test.js`):**
  * Inclusión explícita de `foda` junto a `canvas`, `pestel` y `porter` en la directiva prioritaria de extensión (`buildVerbosityConstraint`, `isUltraConciseModule`).
  * Regla estricta obligatoria: Redactar únicamente de 3 a 5 viñetas (bullet points) concretas compuestas por oraciones cortas y directas al grano (15 a 25 palabras por viñeta).
  * PROHIBICIÓN categórica de redactar párrafos extensos de fundamentación, introducciones teóricas redundantes ("En el entorno actual...", "Es vital considerar...") o conclusiones de relleno narrativo.
  * Instrucción de campo adaptada (`getFieldFormatGuidance`): *"3 a 5 viñetas cortas, concisas y directas en oraciones breves (sin párrafo introductorio)"*.
* **Exportador y Botón de Copiado de Prompts con Contexto Completo para IA Externa (`src/lib/promptExporter.js`, `src/components/ModuleWrapper.jsx`, `src/components/PromptEditor.jsx`, `tests/promptExporter.test.js`):**
  * Creación del módulo centralizado `promptExporter.js` con las funciones `buildExternalPrompt` y `copyPromptToClipboard`.
  * Ensambla en formato Markdown estructurado:
    1. Rol y objetivo del consultor estratégico (Fondo Thoth AC).
    2. Contexto integral de la Semilla del negocio (Nombre de Proyecto, Giro, Ubicación precisa, Problema, Solución, Mercado Objetivo, Modelo de Ingresos, Ventaja Competitiva, Inversión).
    3. Documentos de evidencia y RAG acumulados.
    4. Módulo, Pilar y Campo específico a redactar con su instrucción metodológica, ejemplos corporativos, benchmarks y citas.
    5. Regla estricta de concisión en viñetas cortas de oraciones directas sin preámbulos conversacionales.
  * Botón interactivo de copiado en cada campo de `ModuleWrapper.jsx` (junto al botón de prompt y bloqueo de IA) con feedback visual temporal (`Check` verde por 2.5s).
  * Botón destacado en `PromptEditor.jsx` (*"Copiar Prompt para ChatGPT / Claude (con Semilla)"*).
* **Robustecimiento de Fallback y Resiliencia en la API de INEGI DENUE (`server/index.js`, `server/competitorEngine.js`, `server/autonomousResearchEngine.js`, `server/api/inegiAgebEngine.js`):**
  * Implementación de `resolveInegiToken(req)` en el backend central, garantizando fallback automático a las variables del servidor (`process.env.DENUE_KEY`, `process.env.INEGI_KEY`) o token oficial verificado (`1b9e230f-2ae0-48db-bd20-8810b1db575e`) incluso cuando el usuario no envíe token en la query o no tenga sesión activa.
  * Cobertura completa en todas las rutas de INEGI: `/api/inegi/denue`, `/api/inegi/denue/ficha/:id`, `/api/inegi/denue/nombre`, `/api/inegi/denue/entidad`, `/api/inegi/denue/area`, `/api/inegi/denue/cuantificar`, `/api/inegi/indicadores`, `/api/mercado` y `/api/test/inegi`.
  * Eliminación de términos hardcodeados en `autonomousResearchEngine.js` (sustituyendo `/carne/` por el giro y keywords dinámicas del proyecto).
  * Verificación en vivo: 105 establecimientos comerciales recuperados exitosamente en tiempo real desde la API oficial de INEGI.

### 5.19 Arquitectura de Corrección Atómica por Box ID, Trazabilidad DeepSeek Harness y RAG de Entrevistas Diarizadas
* **Diarización y Normalización Semántica del Audio de Entrevistas (`Vic/entrevista_estructurada_rag.md`, `scripts/structure_interview_audio.js`):**
  * Procesa la transcripción continua de audio clasificando las participaciones entre `[Pregunta Consultores: Viktor/Karely/Alisson]` y `[Hecho Real / Respuesta: María Alejandra Aray Roa]`.
  * Organiza la información en 6 núcleos temáticos inmutables:
    1. Historia y Fundación (Col. Balderrama, inicio 2008 informal, SAT en 2020).
    2. Segmentación y Clientes (San Carlos, colonias de alto valor en Hermosillo, cero showrooms, referidos y WhatsApp).
    3. Operaciones y Ubicación Física (Taller en planta baja, residencia arriba, consumo CFE conjunto de $6,000 MXN).
    4. Modelo de Ingresos y Cobranza (50% anticipo y saldo semanal por hito, eliminación de retrabajos no cobrados).
    5. Herramental e Inversión (Enchapadora de cantos $80k para evitar cuellos de botella por maquila externa, $25k aislamiento, $45k capital de trabajo).
    6. Análisis Competitivo (Corderosa: renders y gama alta; Masarino: maquila y sala de exhibición).
  * Inyección en `planData.config.documents` con metadatos de máxima prioridad: `{ classification: "project_evidence", status: "processed", isImmutableConstraint: true }`.
* **Identificación Unívoca de Boxes (`src/lib/boxIdManager.js`):**
  * Cada herramienta analítica y bloque matricial cuenta con un ID correlativo visible `#BOX-XXX` (ej. `#BOX-512` para Layout Industrial) mapeado a su clave canónica de registro (`box_layout_industrial`).
  * Los comandos de BOB aceptan tanto identificadores numéricos como semánticos (`el box 512 está mal`, `en el box de layout industrial`).
* **Trazabilidad del Harness DeepSeek por Box (`src/components/BoxTrajectoryModal.jsx`, `ModuleWrapper.jsx`):**
  * Inspección en vivo del System Prompt, RAG Context inyectado, fuentes verificadas y árbol de razonamiento ReAct para cada box.
  * Botón directo `[🔍 Ver Trazabilidad]` en el encabezado de cada herramienta analítica.
* **Control de Versiones y Auditoría por Box (`planData.config.boxHistory`):**
  * Registro de cada mutación: autor (`viktoracuna`, `karely_otero`, `galiet_gastelum`), origen (`AI` o `Manual`), marca temporal, diff de cambios y justificación.
  * Acordeón colapsable en la interfaz de usuario para inspeccionar versiones pasadas y restaurar estados previos.
* **Feedback Loop "Correction-as-Evidence" (`src/lib/bobAgent.js`, `src/lib/evidenceContext.js`):**
  * Al corregir un box desde el chat o formulario, el hecho real expresado por el usuario se guarda en el documento sintético `Hechos y Restricciones Validadas del Proyecto`.
  * Este documento se inyecta en el System Prompt de cualquier regeneración posterior como una restricción dura inviolable, garantizando que futuras generaciones de la IA nunca contradigan las correcciones del usuario.


## 13. Arquitectura de Proyectos Multi-Usuario, Planes de Alumnos y Consola RBAC (v2.6.26.8.18)
* **Gestión de Planes de Alumnos en Servidor y Local:**
  * **Pizzería Siglo XXI (`pizzeria_siglo_21`):** Asignada a Edwin Domínguez (`yocine` / `a219212538@unison.mx`) y su equipo (Carlos Robledo, Oscar Villanueva). Plan inclusivo con personas con síndrome de Down.
  * **Restaurant Marisco Isla (`mariscos_isla`):** Gastronomía ribereña en Bahía del Tobari con pescadores locales.
  * **Cositas Technologies (`cositas_technologies`):** Marketplace hiperlocal para MiPymes (Búho Innova-T).
  * **AgroRío Capital (`agrorio_capital`):** Asignado a Raúl Gutiérrez (`ragv` / `rg597816@gmail.com`). Crowdfunding e inversión rural en Sonora.
  * **Sové (`sove`):** Repostería creativa asignada a Edgar Pérez (`edgarpzcz` / `perezmexa3@gmail.com`).
  * **Closets y Cocinas Corona (`closets_y_cocinas_corona`):** Proyecto colaborativo compartido entre Viktor Acuña (`viktoracuna`), Alisson Gastélum (`galiet_gastelum`), Karely Otero (`karely_otero`) y Roberto Celis (`roberto`).
  * **Ferretería y Suministros Kino (`ferreteria_y_suministros_kino`):** Proyecto de Viktor Acuña preservado independientemente de la colaboración en Closets Corona.
* **Escaneo Exhaustivo en `/api/admin/users/:id/projects`:**
  * Búsqueda por ID y por Username.
  * Detección cruzada de carpetas de usuario (`user_<username>`), proyectos en raíz y colaboraciones (`collaborators`).
  * Clasificación explícita de rol en el proyecto: `Propietario` vs `Colaborador`.
* **Sincronización Autenticada en `Layout.jsx`:**
  * El hook de listado de proyectos usa `authFetch` con `credentials: "include"` y token JWT, garantizando que cada estudiante vea todos los proyectos de los que es dueño o colaborador sin perder ninguno al cambiar de vista.
* **Consola Central de Administración Blindada (`AdminUsersPanel.jsx`):**
  * Fondo oscuro explícito `#0f172a` y paleta de alto contraste para evitar textos invisibles en cualquier tema.
  * Botón directo de inspección de proyectos por fila de usuario y navegación inmediata entre gestión de usuarios y proyectos.
