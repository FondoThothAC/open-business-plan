# ATDD MASTER — Acceptance Test-Driven Development
**Proyecto:** Open Business Plan  
**Criterios de Aceptación Funcionales y QA**  

---

## 1. Criterios de Aceptación por Módulo

### Módulo: Motor Agéntico ReAct y Visor DeepSeek Harness
* **AC-01 (Prioridad Minimax-M3):** Al ejecutar la generación o industrialización, el sistema debe consultar en primer lugar `minimax-m3:cloud` (vía Ollama Cloud o API directa) para evitar agotamientos tempranos de cuotas.
* **AC-02 (Ejecución de Herramientas en Vivo):** Los agentes deben invocar herramientas contextuales (`tool_web_search`, `tool_financial_engine`, `tool_quantum_diagnostic`, etc.) devolviendo datos verídicos antes de la redacción ejecutiva.
* **AC-03 (Visor de Trayectorias DeepSeek Harness):** El usuario debe poder hacer clic en "🔍 Trayectoria" en cualquier módulo y visualizar el árbol DAG interactivo con pasos, duraciones, argumentos JSON y métricas.
* **AC-04 (Detección de 429 y Fast Failover):** Cuando cualquier proveedor retorne HTTP 429, el sistema conmuta inmediatamente sin demoras innecesarias hacia el siguiente proveedor de la jerarquía.
* **AC-05 (Exportación de Trazas):** El visor debe permitir copiar y descargar la trayectoria en formato JSON estándar compatible con DeepSeek Harness v1.0.

---

## 2. Criterios de Calidad de Salida Académica
* **AC-06 (JSON Válido y Estructurado):** Todo módulo redactado por IA debe cumplir con el schema JSON de campos específicos definidos en el framework del proyecto, sin texto residual ni etiquetas `<think>`.
* **AC-07 (Diagnóstico Cuántico Obligatorio):** Todo plan debe incorporar el análisis atómico de las 3 áreas del fundador (Finanzas, Operaciones, Administración) conforme a la metodología de Fondo Thoth AC (Regla 13).
