# SDD MASTER — Software Design Document & API Contracts
**Proyecto:** Open Business Plan (Fondo Thoth AC)  
**Versión:** 2.7.0 (Agéntico ReAct + DeepSeek Harness Trajectories)  
**Estado:** Activo / Producción  

---

## 1. Arquitectura del Sistema Agéntico ReAct & DeepSeek Harness

Open Business Plan implementa una arquitectura **Local-First con Resiliencia Cloud Híbrida, Agentes Autónomos ReAct y Trazabilidad Cognitiva DeepSeek Harness**.

```mermaid
graph TD
    UI[Frontend React 18 / Vite] --> PlanCtx[PlanContext.jsx State Management]
    PlanCtx --> AgenticEngine[CELIS Agentic Engine - src/lib/agenticEngine.js]
    
    subgraph "Motor de Trazabilidad DeepSeek Harness"
        AgenticEngine --> TrajRecorder[TrajectoryRecorder - DAG Nodes]
        TrajRecorder --> TrajViewer[AgentTrajectoryViewer.jsx Modal & Inspector]
        TrajRecorder --> LocalStorage[Persistencia Local & Events openplan_trajectory_updated]
    end

    subgraph "Suite de Herramientas Agénticas (agentTools.js)"
        AgenticEngine --> TSearch[tool_web_search]
        AgenticEngine --> TDenue[tool_inegi_denue]
        AgenticEngine --> TFin[tool_financial_engine]
        AgenticEngine --> TQtm[tool_quantum_diagnostic]
        AgenticEngine --> TMermaid[tool_mermaid_generator]
        AgenticEngine --> TCritic[tool_critic_validator]
    end

    subgraph "Jerarquía de Proveedores de IA con Fast Failover"
        AgenticEngine --> AIOrch[AI Provider Router - ai.js]
        AIOrch --> Minimax[1° Minimax: minimax-m3:cloud / API directa]
        AIOrch --> Groq[2° Groq: Qwen 27B / GPT-OSS 120B / Llama 3.3]
        AIOrch --> Gemini[3° Google Gemini: 3.6 Flash / 3.7 Flash]
        AIOrch --> OpenRouter[4° OpenRouter: Nemotron 3.5 Free]
        AIOrch --> Nvidia[5° NVIDIA NIM / Mistral / Ollama Local]
    end
```

---

## 2. Contratos de Funciones y Servicios de IA

### 2.1 `runAgenticModuleGeneration({ aiConfig, currentModule, planData, onStepUpdate, onLog })`
* **Entrada:** Configuración de IA, módulo a redactar, datos del plan, callbacks de actualización de pasos y logs.
* **Salida:** `{ result: Object, trajectory: Object (DeepSeek Harness v1.0) }`.
* **Garantía:** Ejecuta ciclo completo ReAct (Pensamiento ➔ Tool Call ➔ Observación ➔ Crítica ➔ Síntesis) persistiendo el DAG de ejecución en tiempo real.

### 2.2 `executeAgentTool(toolName, args)`
* **Entrada:** Nombre de herramienta (`tool_web_search`, `tool_financial_engine`, etc.) y parámetros JSON.
* **Salida:** `{ success: boolean, toolName: string, executionTimeMs: number, data: Object }`.

### 2.3 `TrajectoryRecorder(taskId, context)`
* **Métodos:**
  * `addStep(type, payload)`: Inserta nodo en el árbol DAG con `parentId`, `stepIndex`, `durationMs` y timestamp.
  * `finish(finalOutput, status)`: Sella la trayectoria con métricas acumuladas y estructura estándar `deepseek-harness-1.0`.

### 2.4 `callAiProvider(config, prompt, expectJson, expectedKeys, onThink)`
* **Entrada:** Configuración, prompt, parámetros JSON y callback de tokens de pensamiento.
* **Prioridad:** Minimax-M3 Cloud ➔ Groq ➔ Gemini Flash ➔ OpenRouter ➔ NVIDIA ➔ Ollama Local.

---

## 3. Niveles de Profundidad de la Mesa de Expertos

| Nivel | Nombre | Fases / Agentes | Modelos Típicos | Trazabilidad |
|---|---|---|---|---|
| **1 (⚡)** | Rápido | Analista ➔ Redactor | `minimax-m3:cloud` / Groq Qwen 27B | DAG 3 pasos (~15s) |
| **2 (🧠)** | Pro | Analista ➔ Crítico ➔ Tools ➔ Redactor | `minimax-m3:cloud` / GPT-OSS 120B | DAG 5-8 pasos (~45s) |
| **3 (🔬)** | Profundo | Mesa Completa (9 Agentes + 6 Tools) | Multi-Model Cascade | DAG 12-16 pasos (~120s) |
