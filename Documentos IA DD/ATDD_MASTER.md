# ATDD MASTER — Acceptance Test-Driven Development
**Proyecto:** Open Business Plan  
**Criterios de Aceptación Funcionales y QA**  

---

## 1. Criterios de Aceptación por Módulo

### Módulo: Generación Multi-Agente con Rotación Resiliente (Feature F01 & F12)
* **AC-01 (Detección de 429):** Cuando el proveedor activo (ej. Groq) retorne HTTP 429, el sistema NO debe congelar la interfaz ni esperar 60 segundos por modelo; debe rotar inmediatamente al siguiente modelo de la lista disponible en menos de 50ms.
* **AC-02 (Rotación Multi-Proveedor):** Si todos los modelos del proveedor activo están agotados, el orquestador debe conmutar automáticamente a Google Gemini o OpenRouter sin perder el progreso de las fases ya completadas en el modo Industrial (1/9 a 9/9).
* **AC-03 (Múltiples API Keys):** El sistema debe permitir ingresar listas de llaves separadas por comas en `Configuración` y rotar automáticamente entre ellas mediante Round-Robin.
* **AC-04 (Feedback Visual en Monitor):** El usuario debe ver en el `Monitor de IA` los eventos de rotación en tiempo real (`🔄 Rotando a modelo en Groq...` o `⚠️ Rotando automáticamente a Gemini...`).

---

## 2. Criterios de Calidad de Salida Académica
* **AC-05 (JSON Válido y Estructurado):** Todo módulo redactado por IA debe cumplir con el schema JSON de campos específicos definidos en el framework del proyecto, sin texto explicativo residual ni etiquetas `<think>`.
* **AC-06 (Diagnóstico Cuántico Obligatorio):** Todo plan debe incorporar el análisis atómico de las 3 áreas del fundador (Finanzas, Operaciones, Administración) conforme a la metodología de Fondo Thoth AC.
