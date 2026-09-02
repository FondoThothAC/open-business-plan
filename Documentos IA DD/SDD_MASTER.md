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
  5. *Hubs Especializados:* Mercado Territorial (DENUE/INEGI), Operaciones & Lay-out, Motor Financiero (NIF B-2/B-3/B-6, Monte Carlo 10,000 runs) y Gobernanza.
  6. *Persistencia & Exportación:* `PlanContext.jsx`, sistema de archivos local y exportación ejecutiva a Word/PDF.




