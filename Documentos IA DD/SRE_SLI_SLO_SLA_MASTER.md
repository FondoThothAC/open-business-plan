# SRE MASTER — Service Reliability, SLIs, SLOs & SLAs
**Proyecto:** Open Business Plan  

---

## 1. Indicadores de Nivel de Servicio (SLIs)

* **SLI-01 (Tasa de Éxito de Fase):** Porcentaje de fases de IA completadas con éxito sin lanzar excepciones al usuario (Target: > 99.5%).
* **SLI-02 (Latencia de Conmutación en 429):** Tiempo transcurrido entre la recepción de un HTTP 429 y la invocación del modelo/proveedor alternativo (Target: < 100ms).
* **SLI-03 (Tasa de Validez JSON):** Porcentaje de respuestas de IA parseadas correctamente sin recurrir a fallback de emergencia (Target: > 99.0%).

---

## 2. Objetivos de Nivel de Servicio (SLOs)

* **SLO-01:** 99% de las generaciones en modo Industrial deben finalizar con éxito incluso si un proveedor individual sufre degradación de cuotas o rate limits.
* **SLO-02:** 0 bloqueos o congelamientos de la interfaz del usuario durante la ejecución de los agentes.

---

## 3. Acuerdos de Nivel de Servicio (SLAs)

* Disponibilidad de la plataforma local en modo desconectado: 100% (usando Ollama/LM Studio y motores matemáticos deterministas).
* Resiliencia ante caídas de proveedores cloud: Conmutación automática a través de hasta 5 capas de respaldo.
