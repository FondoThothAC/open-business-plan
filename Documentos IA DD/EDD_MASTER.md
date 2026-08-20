# EDD MASTER — Event-Driven Development & Telemetría
**Proyecto:** Open Business Plan  

---

## 1. Catálogo de Eventos del Sistema

| Tipo de Evento | Emisor | Payload | Consumidor |
| :--- | :--- | :--- | :--- |
| `start` | `runAgenticModuleGeneration` | `{ type: 'start', module, provider, elapsed }` | ActivityFeed / Terminal Monitor |
| `thinking` | `callAiProvider` | `{ type: 'thinking', message, provider, elapsed }` | Terminal Monitor (CoT Stream) |
| `warning` | `callAiProvider` | `{ type: 'warning', message: '⚠️ Rotando...', provider }` | Notificaciones / Monitor |
| `openplan_trajectory_updated` | `TrajectoryRecorder` | CustomEvent con snapshot actualizado de la trayectoria | ActivityFeed, ModuleWrapper |
| `success` | Orquestador de Fase | `{ type: 'success', message: '✓ Completado', provider }` | Barra de Progreso Global |
| `error` | Fallback Handler | `{ type: 'error', message: 'Fallo...', provider }` | Toast Alerts / Error Boundary |

---

## 2. Flujo de Emisión y Desacoplamiento

Los eventos de telemetría y logs se publican mediante HTTP POST asíncrono hacia el endpoint local `/api/log` del servidor Express (`server/index.js`), distribuyéndose vía Server-Sent Events (SSE) hacia `ActivityFeed.jsx`.

Simultáneamente, el motor agéntico emite eventos en el DOM (`openplan_trajectory_updated`) y persiste snapshots en `localStorage`, permitiendo que el visor `AgentTrajectoryViewer` reaccione instantáneamente y actualice el árbol DAG en tiempo real.
