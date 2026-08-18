# Test-Driven Development (TDD) - Open Business Plan v2.7

## 1. Filosofía y Reglas de Pruebas
Las pruebas unitarias y de integración se ejecutan con el runner nativo de Node.js (`node --test`). Ningún módulo de cálculo o lógica de sincronización puede integrarse sin su suite de tests correspondiente.

---

## 2. Cobertura de Suites de Pruebas

### Suite 1: Preview & Print Formatting (`tests/previewFormat.test.js`)
- Cálculo de números de página en modo "module-per-page" y modo continuo.
- Verificación de reglas CSS de protección de tablas y salto de página.
- Integración de componentes `CorporatePrintHeader` y `CorporatePrintFooter`.

### Suite 2: Swarm & Intelligence Engine (`tests/swarm/*.test.js`)
- **`AgentStore.test.js`**: Persistencia, métricas de tokens y exportación de agentes.
- **`CriticValidator.test.js`**: Umbrales de auto-reflexión y score de calidad de prompts (Score >= 8.5).
- **`QuantumDiagnosticAgent.test.js`**: Detección de *Fusión Atómica* (Regla 13 Fondo Thoth AC) y saltos cuánticos de escala.
- **`SkillMatcher.test.js`**: Coincidencia semántica de tareas y auto-generación de agentes.
- **`competitorEngine.test.js`**: Consulta multi-fuente y competidores sintéticos (`ia_synthetic`).
- **`logoGenerator.test.js`**: Construcción de prompts de estilo y generador procedural SVG offline.

### Suite 3: Diff Review & Control de Cambios (`tests/diffReview.test.js`) [NUEVA]
- Cálculo exacto de diferencias de texto entre versión previa y versión generada por IA.
- Verificación del estado de aceptación de cambios (aplicación al plan y limpieza de comentarios).
- Verificación del estado de descarte (conservación intacta del valor previo).
- Limpieza y desinfección de markdown devuelto por los modelos de lenguaje.

### Suite 4: Widgets Especializados de Metodologías (`tests/specializedWidgets.test.js`) [NUEVA]
- Parseo y normalización de Árbol de Problemas y Objetivos (Causas / Efectos / Medios / Fines).
- Estructuración de datos para la Matriz X de Hoshin Kanri (4 cuadrantes y correlaciones).
- Cálculo de valor añadido y precios de transferencia en la Estructura Amoeba.

---

## 3. Comandos de Ejecución
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar una suite específica
node --test tests/diffReview.test.js
node --test tests/specializedWidgets.test.js
```
