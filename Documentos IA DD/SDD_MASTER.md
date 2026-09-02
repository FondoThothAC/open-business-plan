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
