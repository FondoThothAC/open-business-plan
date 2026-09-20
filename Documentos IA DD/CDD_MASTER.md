# CDD MASTER — Component-Driven Development (Atomic Architecture)
**Proyecto:** Open Business Plan  

---

## 1. Arquitectura de Componentes (Atomic Design)

### Átomos
* `Button`: Botones primarios, secundarios, de IA y estados de carga con tokens dark mode.
* `Badge`: Indicadores de estado de proveedores (`ApiStatusBadge.jsx`), semáforos de viabilidad, tags de área atómica cuántica.
* `ProvenanceBadge`: Badge atómico de procedencia de datos (`real` / `verified_real`, `local_offline`, `synthetic` / `synthetic_estimate`, `none`) con iconos distintivos (🟢, 🟡, 🔴, ⚪), tooltips contextuales y colores de alto contraste dark mode.
* `StatusPill`: Píldora de estado editorial del proyecto (`Borrador` en gris, `En revisión` en ámbar, `Aprobado` en esmeralda, `Archivado` en púrpura).
* `Input` / `Select`: Entradas de texto sanitizadas, campos de contraseña protegidos, selectores de rol y selectores de modelo.
* `ToggleSwitch`: Interruptor accesible para opciones booleanas (ej. Recordarme en pantalla de inicio de sesión).

### Moléculas
* `DiffReviewModal`: Comparador visual de texto sugerido vs. actual con botones de Aceptar/Rechazar.
* `ActivityFeed`: Monitor dual con pestañas de logs en vivo SSE y lista de trayectorias.
* `FodaMatrix`: Cuadrícula interactiva de 4 cuadrantes con adición y eliminación dinámica de viñetas.
* `CorporatePrintHeader` / `CorporatePrintFooter`: Encabezados y pies de página corporativos para exportación de documentos con foliado dinámico `Página X de Y`.
* `NotificationsBell`: Campana de notificaciones en el encabezado con badge de alertas y menú desplegable para eventos de tareas en background (Deep Research finalizada, pausa por cuota agotada).
* `IndustrializeDeepResearchToggle`: Control interactivo granular en el modal de Industrialización que permite conmutar Deep Research por módulo/submódulo.
* `SupervisorBanner`: Banner informativo superior visible cuando un superadmin visualiza o edita proyectos ajenos, previniendo suplantaciones accidentales.
* `ProjectProgressBar`: Barra de avance porcentual desacoplada del estado editorial, con desglose de campos completados.

### Organismos
* `AgentTrajectoryViewer`: Modal interactivo y visor DAG compatible con `dsh-session-v0.1` (meta-kernel Cordis), con controles de Replay interactivo (Play/Pause, scrub lineal, velocidad 1x/2x/5x), modal de Hot Forking para bifurcación en caliente desde cualquier nodo, inspector JSON y métricas.
* `TerminalDrawer`: Consola inferior retráctil estilo IDE con pestañas de logs streaming SSE en vivo, visor de trayectorias Harness/Cordis, lanzador de Deep Research Online con autorización de presupuesto, panel de fuentes factuales verificadas (`ProvenanceBadge`), control reactivo de auto-pausa por cuotas y monitor dedicado de cuotas mensuales persistidas (`Cuotas & Fila 1/2`).
* `ExecutiveFinancialDashboard`: Tablero directivo de 6 KPIs clave (Inversión Inicial, Ventas Proyectadas Año 5, Utilidad Neta Año 5, Margen Bruto, Punto de Equilibrio, Indicadores TIR/VPN) con semaforización condicional y diferenciación explícita entre Fase 1 ($4M MXN) y Escenario de Expansión ($16.8M MXN).
* `DecisionFlow`: Diagrama interactivo del roadmap de inversión y expansión con modo vertical enriquecido y modo horizontal compacto (`isCompact=true`, 185px) optimizado para impresión ejecutiva Letter.
* `ProjectWorkspaceModal`: Gestor integral de proyectos con filtrado por propietario, avance, estado editorial, detección de módulos faltantes, botón de continuación directa y acciones de duplicar, archivar, restaurar y exportar.
* `AdminUsersPanel`: Panel de control de administración con 3 pestañas principales: Gestión de Usuarios (CRUD, roles, reseteo de claves), Proyectos por Propietario (supervisión global con acción `onOpenProject` para navegación directa) y Registro de Auditoría Inmutable (inspección de eventos del sistema).
* `MachineryRfqModal`: Modal formal para cotización de maquinaria pesada B2B conectado directamente a `ModuloOperaciones`, con descarga de paquetes RFQ, envío de correos a distribuidores autorizados y actualización automática de CAPEX/VAN/TIR.
* `BobChatModal`: Modal interactivo de copiloto con soporte de reconocimiento de voz y debate estratégico.
* `InegiMap`: Mapa geoespacial interactivo con capas de competidores DENUE y cálculo de densidad.
* `FinancialCharts`: Gráficas interactivas de punto de equilibrio, estados proforma y corrida financiera.
* `PrintableFinancialReports`: Subcomponente de reportes financieros expandidos para impresión y vista previa, con soporte defensivo `planData = {}` y cálculos de rentabilidad industrial/minera.
* `Anteproyecto`: Formulario estructurado para captura de la Semilla del proyecto y diagnóstico cuántico inicial.

### Vistas / Páginas
* `LoginScreen`: Pantalla de acceso con selector de credenciales, autenticación por cookies seguras, interruptor de Recordarme y validación de sesiones activas.
* `DynamicModule` / `ModuleWrapper`: Vista modular con botón de trazabilidad agéntica, botón dedicado de "Deep Research" y badges de procedencia verificada.
* `ModuloOperaciones`: Módulo de ingeniería y planta con botón de acción para invocar `MachineryRfqModal` y coordinar cotizaciones CAPEX.
* `VistaPrevia`: Renderizador de documento completo con paginación modular y continua, modo dossier ejecutivo (20–25 páginas, objetivo 20), deduplicación de bloques repetidos, protegido por `ErrorBoundary` y guard de hidratación asíncrona de `planData`. Incorpora botón "Compartir para revisión" con creación automática de enlace temporal de lectura.
* `ReviewPage`: Vista pública/restringida accesible mediante `/review/:token` para revisores, inversionistas y clientes externos. Ofrece renderizado de documento sanitizado, selector de anclas por bloque o módulo, captura de comentarios contextuales y visualización del historial de notas sin requerir cuenta interna.
* `Configuracion`: Panel de administración con gestión de proveedores de IA y panel dedicado de Motores de Búsqueda Web estratificados en Fila 1 y Fila 2.
