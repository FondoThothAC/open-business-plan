# CDD MASTER — Component-Driven Development (Atomic Architecture)
**Proyecto:** Open Business Plan  

---

## 1. Arquitectura de Componentes (Atomic Design)

### Átomos
* `Button`: Botones primarios, secundarios, de IA y estados de carga.
* `Badge`: Indicadores de estado de proveedores (`ApiStatusBadge.jsx`), semáforos de viabilidad y tags de área atómica.
* `Input` / `Select`: Entradas de texto sanitizadas, campos de clave y selectores de modelo.

### Moléculas
* `DiffReviewModal`: Comparador visual de texto sugerido vs. actual con botones de Aceptar/Rechazar.
* `ActivityFeed`: Monitor dual con pestañas de logs en vivo SSE y lista de trayectorias.
* `FodaMatrix`: Cuadrícula interactiva de 4 cuadrantes con adición y eliminación dinámica de viñetas.
* `CorporatePrintHeader` / `CorporatePrintFooter`: Encabezados y pies de página corporativos para exportación de documentos.
* `NotificationsBell`: Campana de notificaciones en el encabezado con badge de alertas y menú desplegable para eventos de tareas en background (Deep Research finalizada, pausa por cuota agotada).

### Organismos
* `AgentTrajectoryViewer`: Modal interactivo y visor DAG compatible con `dsh-session-v0.1` (meta-kernel Cordis), con controles de Replay interactivo (Play/Pause, scrub lineal, velocidad 1x/2x/5x), modal de Hot Forking para bifurcación en caliente desde cualquier nodo, inspector JSON y métricas.
* `TerminalDrawer`: Consola inferior retráctil estilo IDE con pestañas de logs streaming SSE en vivo, visor de trayectorias Harness/Cordis, lanzador de Deep Research Online con autorización de presupuesto y monitor de tareas activas.
* `BobChatModal`: Modal interactivo de copiloto con soporte de reconocimiento de voz y debate estratégico.
* `InegiMap`: Mapa geoespacial interactivo con capas de competidores DENUE y cálculo de densidad.
* `FinancialCharts`: Gráficas interactivas de punto de equilibrio, estados proforma y corrida financiera.
* `PrintableFinancialReports`: Subcomponente de reportes financieros expandidos para impresión y vista previa, con soporte defensivo `planData = {}` y cálculos de rentabilidad industrial/minera.
* `Anteproyecto`: Formulario estructurado para captura de la Semilla del proyecto y diagnóstico cuántico inicial.

### Vistas / Páginas
* `DynamicModule` / `ModuleWrapper`: Vista modular con botón de trazabilidad agéntica y controles de edición.
* `VistaPrevia`: Renderizador de documento completo con paginación modular y continua, protegido por `ErrorBoundary` y guard de hidratación asíncrona de `planData`.
* `Configuracion`: Panel de administración con presets de B.AI (GPT-5.2 / Qwen 3.8 / GLM 5.3), Minimax-M3 Cloud, Groq, Gemini, OpenRouter y pools de API Keys con indicadores de estado en tiempo real (`ApiQuotaMeter` y `ApiStatusBadge`).
