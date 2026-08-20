# TDD MASTER — Test-Driven Development & Quality Assurance
**Proyecto:** Open Business Plan  
**Framework:** Node.js Native Test Runner (`node:test` + `node:assert/strict`)  

---

## 1. Matriz de Pruebas Unitarias e Integración

| Suite de Prueba | Archivo | Cobertura / Objetivo | Estado |
| :--- | :--- | :--- | :--- |
| **CELIS Agentic Engine & DeepSeek Harness** | `tests/agenticEngine.test.js` | Manifiesto de tools, web search, cálculo financiero, regla 13 cuántica, mermaid y árbol DAG DeepSeek Harness | ✅ Pass (6 tests) |
| **Rotación de IA & Failover** | `tests/aiRotation.test.js` | Key pool, fast fail en 429, rotación de modelos y cascade multi-proveedor | ✅ Pass (5 tests) |
| **Control de Cambios** | `tests/diffReview.test.js` | Algoritmo de diffs, limpieza de markdown y merge de sugerencias | ✅ Pass (3 tests) |
| **Paginación & Impresión** | `tests/previewFormat.test.js` | Cálculo de páginas continuo/modular, reglas CSS y headers | ✅ Pass (5 tests) |
| **Widgets Especializados** | `tests/specializedWidgets.test.js` | Árbol de problemas, Amoeba Management y diagramas Mermaid | ✅ Pass (2 tests) |
| **Persistencia de Agentes** | `tests/swarm/agentStore.test.js` | Almacenamiento, exportación mensual y métricas de tokens | ✅ Pass (4 tests) |
| **Validación de Agentes** | `tests/swarm/criticValidator.test.js` | Aprobación/Rechazo por score analítico (umbral 8.5) | ✅ Pass (2 tests) |
| **Diagnóstico Cuántico** | `tests/swarm/quantumDiagnosticAgent.test.js` | Detección de Fusión Atómica y umbrales cuánticos de escala | ✅ Pass (3 tests) |
| **Skill Matcher** | `tests/swarm/skillMatcher.test.js` | Coincidencia semántica de agentes base y especialistas | ✅ Pass (3 tests) |
| **Competidores & Heatmap** | `tests/swarm/competitorHeatmap.test.js` | Generación sintética y cálculo de viabilidad de mercado | ✅ Pass (3 tests) |
| **Generador de Logos** | `tests/swarm/aiLogoGenerator.test.js` | Generación de prompts y SVG procedural como fallback | ✅ Pass (5 tests) |
| **Voz & Grill-Me** | `tests/voiceAndGrillMe.test.js` | Comandos de voz y generación de opciones interactivas | ✅ Pass (3 tests) |

**Total de Pruebas:** 48 ejecutadas | 48 aprobadas (100% éxito) | 0 fallos.

---

## 2. Estrategia de Mocking y Fixtures

* **Mocking de Fetch:** Se intercepta `globalThis.fetch` en entornos de prueba para simular respuestas HTTP 429 (Rate Limit), cuotas agotadas y respuestas JSON válidas de proveedores como Minimax, Groq, Gemini y OpenRouter sin consumir tokens reales.
* **Aislamiento:** Las pruebas no dependen de variables de entorno de producción ni servicios externos activos.
