# EDD MASTER — Event-Driven Development & Telemetría
**Proyecto:** Open Business Plan  

---

## 1. Catálogo de Eventos del Sistema

| Tipo de Evento | Emisor | Payload | Consumidor |
| :--- | :--- | :--- | :--- |
| `start` | `generateModuleContent` | `{ type: 'start', module, provider, elapsed }` | ActivityFeed / Terminal Monitor |
| `thinking` | `callAiProvider` | `{ type: 'thinking', message, provider, elapsed }` | Terminal Monitor (CoT Stream) |
| `warning` | `callAiProvider` | `{ type: 'warning', message: '⚠️ Rotando...', provider }` | Notificaciones / Monitor |
| `success` | Orquestador de Fase | `{ type: 'success', message: '✓ Completado', provider }` | Barra de Progreso Global |
| `error` | Fallback Handler | `{ type: 'error', message: 'Fallo...', provider }` | Toast Alerts / Error Boundary |

---

## 2. Flujo de Emisión y Desacoplamiento

Los eventos se publican mediante HTTP POST asíncrono hacia el endpoint local `/api/log` del servidor Express (`server/index.js`), que a su vez los distribuye vía Server-Sent Events (SSE) o WebSocket hacia el componente visual `ActivityFeed.jsx` y `BobChatModal.jsx`. Si el backend no está disponible, la emisión falla de manera silenciosa (`silent fail`), garantizando que la ejecución de la IA en el frontend nunca se bloquee.
