# EDD MASTER — Event-Driven Development & Telemetría
**Proyecto:** Open Business Plan  

---

## 1. Catálogo de Eventos del Sistema

| Tipo de Evento | Emisor | Payload | Consumidor |
| :--- | :--- | :--- | :--- |
| `start` | `runAgenticModuleGeneration` | `{ type: 'start', module, provider, elapsed }` | ActivityFeed / Terminal Monitor |
| `thinking` | `callAiProvider` | `{ type: 'thinking', message, provider, elapsed }` | Terminal Monitor (CoT Stream) |
| `warning` | `callAiProvider` | `{ type: 'warning', message: '⚠️ Rotando...', provider }` | Notificaciones / Monitor |
| `openplan_trajectory_updated` | `TrajectoryRecorder` | CustomEvent con snapshot de trayectoria | ActivityFeed, ModuleWrapper |
| `openplan_new_trajectory` | `runAgenticModuleGeneration` | CustomEvent con trayectoria completada | ActivityFeed, AgentTrajectoryViewer |
| `openplan_module_completed` | `PlanContext` (Industrialización) | `{ moduleTitle, moduleKey, pillar, progress, tokens, provider, model }` | ActivityFeed, Barra de Progreso |
| `openplan_navigate` | `PlanContext` / `BobChatModal` | `{ detail: '/modulo/pilar/modulo' }` | `Layout.jsx` (Navegación reactiva) |
| `openplan_research_started` | `TerminalDrawer` / `deepResearchEngine` | `{ taskId, query, budgetLimitUsd }` | `Layout.jsx` (Campana de Notificaciones) |
| `openplan_research_completed` | `TerminalDrawer` / `deepResearchEngine` | `{ taskId, query, sourcesCount, status, sources }` | `TerminalDrawer.jsx`, `Layout.jsx` (Notificaciones) |
| `openplan_research_paused` | `TerminalDrawer` / `quotaTracker` | `{ taskId, query, warning, status: 'paused_waiting_quota' }` | `TerminalDrawer.jsx`, `Layout.jsx` (Alerta reactiva) |
| `openplan_paid_model_warning` | `callAiProvider` / `paidModelGovernance` | `{ provider, model, estimatedCostUSD, message, timestamp }` | `TerminalDrawer.jsx`, Monitor de IA (Gobernanza de costos) |
| `project_status_changed` | `server/index.js` (Proyectos) | `{ projectId, oldStatus, newStatus, changedBy, timestamp }` | Auditoría inmutable, `ProjectWorkspaceModal` |
| `project_auto_reverted_to_review` | `server/index.js` (Guardado) | `{ projectId, previousStatus: 'Aprobado', newStatus: 'En revisión', reason }` | Auditoría inmutable, `ProjectWorkspaceModal` |
| `project_comment_added` | `server/index.js` (Revisiones) | `{ projectId, commentId, author, role, text, timestamp }` | `ProjectWorkspaceModal`, Historial editorial |
| `audit_event_logged` | `server/auditLogger.js` | `{ id, timestamp, actor, action, target, metadata, ip }` | `server/data/audit_log.json`, `AdminUsersPanel` |
| `session_expired` | `server/middleware/authGuard.js` | `{ reason: 'invalid_or_expired_cookie', redirect: '/login' }` | `AuthContext.jsx`, `LoginScreen.jsx` |
| `success` | Orquestador de Fase | `{ type: 'success', message: '✓ Completado', provider }` | Barra de Progreso Global |
| `error` | Fallback Handler | `{ type: 'error', message: 'Fallo...', provider }` | Toast Alerts / Error Boundary |

---

## 2. Flujo de Emisión y Desacoplamiento

1. **Telemetría y Logs SSE:** Los eventos de telemetría y logs se publican mediante HTTP POST asíncrono hacia el endpoint local `/api/log` del servidor Express (`server/index.js`), distribuyéndose vía Server-Sent Events (SSE) a través de `GET /api/log/stream` hacia `ActivityFeed.jsx`.
2. **Eventos DOM y Navegación Reactiva:** El motor agéntico emite eventos en el DOM (`openplan_trajectory_updated`, `openplan_new_trajectory`, `openplan_navigate`, `openplan_module_completed`) y persiste snapshots en `localStorage` y en IndexedDB (`OpenBusinessPlanDB`), permitiendo que el visor `AgentTrajectoryViewer` y la interfaz de navegación reaccionen instantáneamente sin recargar la página.
3. **Flujo de Auditoría Inmutable Append-Only:** Toda mutación administrativa y editorial invoca a `server/auditLogger.js`, el cual escribe de forma atómica en `server/data/audit_log.json` preservando la integridad histórica sin posibilidad de sobrescritura destructiva.
4. **Comandos BOB HITL:** El copiloto BOB (`BobChatModal.jsx`) despacha comandos de acción directa (`NAVIGATE`, `UPDATE_FIELD`, `UPDATE_CAPEX`, `CONFIGURE_MULTIBRANCH`, `TRIGGER_INDUSTRIALIZE`) hacia el componente raíz `Layout.jsx` desacoplando el procesamiento conversacional del estado global de React.
