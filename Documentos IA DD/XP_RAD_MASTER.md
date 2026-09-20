# XP & RAD MASTER — Extreme Programming & Rapid Application Development
**Proyecto:** Open Business Plan  

---

## 1. Prácticas de Ingeniería Ágil Aplicadas

* **Integración Continua Local (CI Loop):** Todo cambio en el código fuente debe validar automáticamente que `npm test` pase al 100% (330/330 pruebas pasando) y que `npm run build` genere el bundle sin errores sintácticos ni advertencias de tipado antes de realizar cualquier sincronización.
* **Inspección Visual 100% de Salidas Renderizadas (RAD Visual QA):** Antes de certificar documentos de alta fidelidad (como el dossier ejecutivo VCV), cada página renderizada a PDF debe ser convertida a imágenes (`pdftoppm -png`) e inspeccionada visualmente al 100% para verificar la ausencia de saltos huérfanos, tablas partidas o páginas vacías.
* **Commits Atómicos y Reversibles (XP Single-Piece Flow):** Cada incremento funcional o sincronización metodológica se encapsula en una ejecución verificable mediante `./git_sync.sh` con mensaje descriptivo en español, garantizando trazabilidad total y capacidad de reversión inmediata.
* **Refactorización Segura con Pruebas Automatizadas:** Las mejoras en seguridad, autenticación basada en cookies, middleware RBAC y cálculo financiero se protegen con suites de test unitarias y de integración en `tests/`, garantizando cero regresiones.
* **Desacoplamiento de Datos y Modelo Canónico Único:** Desarrollo ágil guiado por un único modelo de datos compartido entre Vista Previa, exportador DOCX y exportador PDF, erradicando discrepancias de formato o cifras divergentes.
* **Prototipado Rápido con Componentes Atómicos (RAD):** Paneles administrativos y modales de gobernanza de proyectos se construyen reutilizando componentes atómicos (`Button`, `Badge`, `StatusPill`, `Input`) manteniendo coherencia visual dark mode inmediata.
