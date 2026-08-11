# SDD v3.0: Arquitectura de Agent Swarm Evolutivo (Estilo Kimi 3) & Swarm Intelligence Hub

**Proyecto:** Open Business Plan  
**Metodología:** TDD, BDD, ATDD, SDD, DDD, MDD, IDD, ADD, EDD, CDD, PDD, UXDD & Empresas Cuánticas (Fondo Thoth AC)  
**Versión:** 3.0.0-SWARM-EVO  
**Estado:** Especificación Aprobada tras sesión `/grill-me`

---

## 1. Visión y Objetivos del Sistema

Inspirado en la arquitectura **Agent Swarm de Kimi 3 (Moonshot AI)** y las metodologías propietarias de **Fondo Thoth AC**, este sistema implementa un enjambre multi-agente dinámico, auto-evolutivo y altamente eficiente para la generación, análisis y refinamiento de planes de negocio.

### Principios Fundamentales:
1. **Orquestación Híbrida Dinámica con Ejecución Paralela:** Un *Lead Orchestrator* descompone el anteproyecto en sub-objetivos y ejecuta agentes especialistas concurrentemente con streaming granular vía Server-Sent Events (SSE).
2. **Auto-Generación y Reutilización Inteligente de Agentes (Agent Store & Skill Matcher):**
   - **Match Exacto (≥90%):** Reutiliza agentes existentes del catálogo (ahorro del 100% en tokens de definición).
   - **Match Parcial (50% - 89%):** Especializa y adapta dinámicamente un agente base con prompt patching y herramientas ampliadas.
   - **Match Bajo (<50%):** Sintetiza al vuelo un nuevo Agente Especialista (`SKILL.md` + JSON Spec), valida su calidad mediante un *Critic Agent* con auto-reflexión (umbral ≥8.5/10) y lo almacena permanentemente en `server/swarm/agent_store/`.
3. **Sincronización y Exportación Periódica:**
   - Endpoint de sincronización `/api/v1/swarm/sync-skills` para telemetría central con el servidor de Fondo Thoth.
   - Generación de paquetes de exportación (`.json` / `.zip`) desde la UI para compilación mensual del catálogo oficial.
   - Integración de Webhooks / Notificaciones automáticas ante nuevos agentes certificados.
4. **Motor Multi-Proveedor Local-First:** Soporte prioritario para Ollama (modelos locales DeepSeek, Qwen, Llama) con auto-fallback resiliente a Gemini, Groq, OpenAI y Kimi API.
5. **Capa Transversal de Empresas Cuánticas (Regla 13):** Evaluación obligatoria del Modelo Atómico de 3 Áreas (Finanzas, Operaciones, Administración), detección de fusión atómica, cálculo de saltos cuánticos de escala y recomendaciones de delegación profesional inyectadas en los planes generados.

---

## 2. Diagrama de Arquitectura del Swarm Evolutivo

```mermaid
graph TD
    User([Usuario / Anteproyecto]) --> Lead[Lead Orchestrator / Meta-Agent]
    
    subgraph Swarm Intelligence Core
        Lead --> Matcher[Skill Matcher Semántico]
        Matcher -->|Match >= 90%| Store[(Agent Store / Catalog)]
        Matcher -->|50-89%| Adapter[Agent Adapter / Specializer]
        Matcher -->|< 50%| Generator[Agent Generator LLM]
        
        Generator --> Critic[Critic Agent / Auto-Reflexión]
        Critic -->|Calificación >= 8.5| Store
        Critic -->|Calificación < 8.5| Generator
    end
    
    subgraph Ejecución Concurrente en Paralelo
        Store --> ExPool[Worker Pool Concurrente]
        Adapter --> ExPool
        
        ExPool --> Mkt[MarketAgent + Tools DENUE/Scraper]
        ExPool --> Fin[FinancialAgent + CalcFinanciera]
        ExPool --> Qtm[QuantumDiagnosticAgent - Regla 13]
        ExPool --> Dyn[Dynamic Specialists Auto-Generados]
    end
    
    ExPool -->|SSE Event Stream| UI[Pixel Swarm Office & Progress Stream]
    ExPool --> Synth[Synthesizer / Auditor Agent]
    Synth --> FinalPlan([Plan de Negocio Compilado & Estructurado])
    
    subgraph Telemetría y Exportación
        Store --> SyncEndpoint[/api/v1/swarm/sync-skills]
        Store --> ExportZip[Exportación Mensual ZIP/JSON UI]
        Store --> Webhook[Webhook / Email Alert]
    end
```

---

## 3. Modelo de Dominio y Contratos de Interfaces (DDD / IDD)

### 3.1 Estructura de un Skill / Agente (`server/swarm/agent_store/`)
```json
{
  "id": "dark_kitchen_specialist",
  "version": "1.0.0",
  "name": "Especialista en Dark Kitchens y Delivery Virtual",
  "avatar": "🍳",
  "role": "Optimización de Cocinas Ocultas, Costeo por Ración y Logística Apps",
  "domain": ["gastronomia", "delivery", "dark_kitchen", "restaurantes"],
  "systemPrompt": "Eres un consultor de élite en modelos de cocinas ocultas...",
  "toolsRequired": ["denue_food_search", "uber_eats_scraper", "calculadora_costeo"],
  "evaluationCriteria": {
    "completeness": 9.0,
    "financialRigor": 8.8,
    "quantumDelegation": 9.2
  },
  "metrics": {
    "usageCount": 12,
    "tokensSaved": 48500,
    "averageRating": 9.1
  },
  "createdAt": "2026-08-11T12:00:00Z"
}
```

### 3.2 Contrato de Eventos SSE (EDD)
- `swarm_started`: Metadatos del enjambre y lista de agentes asignados (incluyendo badge de reutilización).
- `agent_matching_status`: `{ agentId, status: 'reused' | 'specialized' | 'generated_new', matchScore, tokensSaved }`.
- `agent_thought_stream`: Stream granular de razonamiento CoT y ejecución de herramientas.
- `agent_progress`: Progreso numérico (0-100%) y mensaje de estado.
- `agent_completed`: Resultado parcial estructurado del agente especialista.
- `quantum_diagnostic_alert`: Diagnóstico cuántico de áreas atómicas y umbrales de escala detectados.
- `swarm_completed`: Documento final compilado y sincronizado con `PlanContext`.

---

## 4. Componentes Visuales UI (CDD / UXDD)

1. **Pixel Swarm Viewer Dinámico (`PixelSwarmViewer.jsx`):**
   - Renderizado en canvas 2D pixel-art de cada agente activo en su escritorio virtual.
   - Indicadores sobre las cabezas de los personajes: "🧠 Pensando", "🔍 Scraping DENUE", "⚡ Reutilizado (0 tokens)", "✨ Nuevo Agente".
2. **Swarm Intelligence Hub (`SwarmIntelligenceHub.jsx`):**
   - Vista de catálogo de todos los agentes almacenados y auto-generados.
   - Métricas globales de ahorro de tokens y efectividad.
   - Botón interactivo `Exportar Agentes del Mes (ZIP/JSON)`.
   - Botón `Sincronizar Catálogo con Fondo Thoth`.

---

## 5. Plan de Pruebas (TDD / ATDD)

- **Unit Tests (`tests/swarm/`):**
  - `SkillMatcher.test.js`: Verificación de algoritmos de coincidencia (≥90% reuse, 50-89% adapt, <50% create).
  - `AgentStore.test.js`: Persistencia en disco, validación de schemas JSON/Markdown y exportación.
  - `CriticValidator.test.js`: Evaluación de calidad y umbrales de auto-reflexión.
  - `QuantumDiagnosticAgent.test.js`: Reglas de 3 áreas atómicas, cálculo de delegación y umbrales cuánticos de escala.
  - `SwarmOrchestrator.test.js`: Ejecución paralela resiliente, manejo de fallbacks de LLM y emisión SSE.
