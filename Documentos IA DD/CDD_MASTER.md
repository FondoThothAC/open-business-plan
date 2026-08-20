# CDD MASTER — Component-Driven Development (Atomic Architecture)
**Proyecto:** Open Business Plan  

---

## 1. Arquitectura de Componentes (Atomic Design)

### Átomos
* `Button`: Botones primarios, secundarios, flotantes y estados de carga.
* `Badge`: Indicadores de estado de proveedores (`ApiStatusBadge.jsx`), semáforos de viabilidad y tags de área atómica.
* `Input` / `Select`: Entradas de texto sanitizadas, campos de clave y selectores de modelo.

### Moléculas
* `DiffReviewModal`: Comparador visual de texto sugerido vs. actual con botones de Aceptar/Rechazar.
* `ActivityFeed`: Línea de tiempo con scroll automático de eventos del motor de IA.
* `FodaMatrix`: Cuadrícula interactiva de 4 cuadrantes con adición y eliminación dinámica de viñetas.
* `CorporatePrintHeader` / `CorporatePrintFooter`: Encabezados y pies de página corporativos para exportación de documentos.

### Organismos
* `BobChatModal`: Modal interactivo de copiloto con soporte de reconocimiento de voz y debate estratégico.
* `InegiMap`: Mapa geoespacial interactivo con capas de competidores DENUE y cálculo de densidad.
* `FinancialCharts`: Gráficas interactivas de punto de equilibrio, estados proforma y corrida financiera.
* `Anteproyecto`: Formulario estructurado para captura de la Semilla del proyecto.

### Vistas / Páginas
* `ModuloGenerico`: Vista dinámica de edición y generación de pilares académicos.
* `VistaPrevia`: Renderizador de documento completo de 100 páginas con modo modular y continuo.
* `Configuracion`: Panel de administración de proveedores de IA, llaves, endpoints y preferencias de marca.
