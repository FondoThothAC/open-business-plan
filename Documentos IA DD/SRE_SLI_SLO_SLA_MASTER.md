# SRE MASTER — Service Reliability, SLIs, SLOs & SLAs
**Proyecto:** Open Business Plan  

---

## 1. Indicadores de Nivel de Servicio (SLIs)

* **SLI-01 (Tasa de Éxito de Fase Agéntica):** Porcentaje de ejecuciones ReAct completadas con éxito sin lanzar excepciones al usuario (Target: > 99.5%).
* **SLI-02 (Latencia de Conmutación en 429):** Tiempo transcurrido entre la recepción de un HTTP 429 y la invocación del modelo alternativo / Minimax-M3 (Target: < 100ms).
* **SLI-03 (Tasa de Validez JSON y Tool Execution):** Porcentaje de respuestas y llamadas a herramientas (web search, INEGI, finanzas) parseadas y ejecutadas correctamente (Target: > 99.0%).
* **SLI-04 (Latencia de Registro de Trayectoria DeepSeek Harness):** Tiempo de cálculo y persistencia del DAG de razonamiento por paso (Target: < 15ms).
* **SLI-05 (Disponibilidad Subfolder `/obp/` & API Health):** Porcentaje de sondeos exitosos (HTTP 200) a `https://fondothoth.com/obp/api/health` y assets estáticos (Target: > 99.9%).

---

## 2. Objetivos de Nivel de Servicio (SLOs)

* **SLO-01:** 99% de las generaciones en modo Industrial/Agéntico deben finalizar con éxito con Minimax-M3 o fallback multi-proveedor.
* **SLO-02:** 0 bloqueos o congelamientos de la interfaz de usuario durante la ejecución de los agentes o la renderización del visor DAG.
* **SLO-03:** 100% de persistencia de trazas agénticas accesibles para auditoría en el navegador.
* **SLO-04:** 0 errores 404/502 al navegar directamente a rutas internas (ej. `/obp/semilla`, `/obp/vista-previa`) gracias al fallback SPA en Nginx.

---

## 3. Acuerdos de Nivel de Servicio (SLAs)

* Disponibilidad de la plataforma local en modo desconectado: 100% (usando Ollama/LM Studio y motores matemáticos deterministas).
* Resiliencia ante caídas de proveedores cloud: Conmutación automática a través de hasta 6 capas de respaldo (Minimax Cloud ➔ Groq ➔ Gemini ➔ OpenRouter ➔ NVIDIA ➔ Ollama Local).
* Aislamiento de infraestructura: 100% de garantía de no impacto sobre el sitio web principal de Fondo Thoth (`https://fondothoth.com`) durante compilaciones, actualizaciones de dependencias o reinicios de PM2.
