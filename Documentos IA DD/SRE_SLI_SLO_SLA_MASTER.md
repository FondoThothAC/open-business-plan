# SRE MASTER — Service Reliability, SLIs, SLOs & SLAs
**Proyecto:** Open Business Plan  

---

## 1. Indicadores de Nivel de Servicio (SLIs)

* **SLI-01 (Tasa de Éxito de Fase Agéntica):** Porcentaje de ejecuciones ReAct completadas con éxito sin lanzar excepciones al usuario (Target: > 99.5%).
* **SLI-02 (Latencia de Conmutación en 429):** Tiempo transcurrido entre la recepción de un HTTP 429 y la invocación del modelo alternativo / Minimax-M3 (Target: < 100ms).
* **SLI-03 (Tasa de Validez JSON y Tool Execution):** Porcentaje de respuestas y llamadas a herramientas (web search, INEGI, finanzas) parseadas y ejecutadas correctamente (Target: > 99.0%).
* **SLI-04 (Latencia de Autenticación y Verificación de Cookie):** Tiempo transcurrido en procesar y verificar la cookie `obp_auth_token` en `authGuard.js` por petición (Target: < 15ms en p95).
* **SLI-05 (Disponibilidad Subfolder `/obp/` & API Health):** Porcentaje de sondeos exitosos (HTTP 200) a `https://fondothoth.com/obp/api/health` y assets estáticos (Target: > 99.9%).
* **SLI-06 (Persistencia de Sesiones tras Reinicio de Servidor):** Porcentaje de sesiones legítimas preservadas sin requerir re-login tras reinicio del proceso Express vía PM2 (Target: 100.0% con secreto persistente).
* **SLI-07 (Tiempo de Generación de Dossier Ejecutivo PDF/DOCX):** Tiempo total de compilación y renderizado del documento ejecutivo en formato Letter vertical (Target: < 12.0s en p95).
* **SLI-08 (Extensión Garantizada de Dossier Ejecutivo):** Número de páginas finales del dossier ejecutivo para comités de inversión (Target: exactamente 20 páginas, límite máximo permisible: 25 páginas).
* **SLI-09 (Durabilidad e Integridad de Auditoría):** Porcentaje de operaciones administrativas y editoriales asentadas exitosamente en `audit_log.json` (Target: 100.0%).
* **SLI-10 (Latencia de Entrega en Revisión Externa):** Tiempo de resolución y entrega de documento sanitizado vía `/api/review/:token` (Target: < 150ms en p95).
* **SLI-11 (Efectividad de Revocación de Sesión):** Tiempo de bloqueo de JWT ante incremento de `sessionVersion` (Target: 0ms, efectivo en la primera petición posterior).

---

## 2. Objetivos de Nivel de Servicio (SLOs)

* **SLO-01:** 99% de las generaciones en modo Industrial/Agéntico deben finalizar con éxito con Minimax-M3 o fallback multi-proveedor.
* **SLO-02:** 0 bloqueos o congelamientos de la interfaz de usuario durante la ejecución de los agentes o la renderización del visor DAG.
* **SLO-03:** 100% de persistencia de trazas agénticas accesibles para auditoría en el navegador.
* **SLO-04:** 0 errores 404/502 al navegar directamente a rutas internas (ej. `/obp/semilla`, `/obp/vista-previa`) gracias al fallback SPA en Nginx.
* **SLO-05:** 100% de cookies emitidas en producción deben contener directivas `HttpOnly`, `SameSite=Lax` y `Secure` sin exponer el JWT en el cuerpo de respuesta JSON.
* **SLO-06:** 0 fugas de acceso no autorizado al módulo de Comercio Cuántico TR por roles distintos a `superadmin`.
* **SLO-07:** 0 discrepancias de cifras financieras clave entre Vista Previa, DOCX y PDF para el caso canónico VCV (Inversión $4M / $16.8M, Ventas $59.9M, Utilidad $12.7M, Margen 31.13%, BEP 781.87 kg/mes).
* **SLO-08:** 0 filtraciones de API keys, hashes o secretos del proyecto en el endpoint `/api/review/:token` servido a revisores externos.
* **SLO-09:** 100% de coherencia en revocación inmediata de sesiones activas al cambiar/restablecer credenciales o alterar roles de usuario.
* **SLO-10:** 100% de persistencia inmutable en RAG de correcciones directas por Box ID (Feedback Loop Correction-as-Evidence) sin degradación de módulos no afectados.
* **SLI-10 (Latencia de Corrección Atómica):** Tiempo de respuesta de BOB al comando "el box <id> está mal" < 1,500 ms para actualización local y registro de hecho.

---

## 3. Acuerdos de Nivel de Servicio (SLAs)

* **Disponibilidad de la plataforma local en modo desconectado:** 100% (usando Ollama/LM Studio y motores matemáticos deterministas).
* **Resiliencia ante caídas de proveedores cloud:** Conmutación automática a través de hasta 6 capas de respaldo (Minimax Cloud ➔ Groq ➔ Gemini ➔ OpenRouter ➔ NVIDIA ➔ Ollama Local).
* **Aislamiento de infraestructura:** 100% de garantía de no impacto sobre el sitio web principal de Fondo Thoth (`https://fondothoth.com`) durante compilaciones, actualizaciones de dependencias o reinicios de PM2.
* **Protección de Datos y Privacidad:** Las claves de API personales (Tavily, Brave, INEGI) se almacenan localmente y cifradas; ninguna clave personal es compartida entre cuentas de usuario.
* **Integridad de Hechos de Negocio:** 0% de regresiones o contradicciones en regeneraciones de IA posteriores a una corrección validada por el usuario en cualquier Box.

