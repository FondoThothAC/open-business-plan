# XP & RAD MASTER — Extreme Programming & Rapid Application Development
**Proyecto:** Open Business Plan  

---

## 1. Prácticas de Ingeniería Ágil Aplicadas

* **Integración Continua Local (CI Loop):** Todo cambio en el código fuente debe validar automáticamente que `npm test` pase al 100% y que `npm run build` genere el bundle sin advertencias críticas antes de realizar cualquier commit.
* **Commits Atómicos y Reversibles (XP Single-Piece Flow):** Cada fase de desarrollo se encapsula en un commit único y verificable mediante `./git_sync.sh` con mensaje descriptivo en español, garantizando trazabilidad total y capacidad de reversión inmediata.
* **Refactorización Segura:** Las mejoras en la orquestación de IA y motores de búsqueda se prueban contra fixtures deterministas en milisegundos, garantizando cero regresiones.
* **Desacoplamiento de Datos (RAD Zero-Fabrication):** Desarrollo iterativo basado en contratos estrictos de datos reales; si una fuente externa no está lista, se implementa el contrato canónico con estado honesto vacío en lugar de insertar fixtures estáticas engañosas en el código de producción.
* **Prototipado Rápido (RAD):** Componentes visuales y badges se diseñan con feedback visual inmediato usando tokens CSS de alta fidelidad para máxima velocidad, accesibilidad y control.
