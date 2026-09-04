# SECDD MASTER — Security-Driven Development & DevSecOps
**Proyecto:** Open Business Plan  

---

## 1. Modelo de Seguridad y Protección de Credenciales

* **Client-Side Secret Isolation:** Las API keys ingresadas por el usuario residen exclusivamente en su sesión local (`localStorage` / memoria del cliente) y nunca se transmiten a servidores de terceros que no sean los endpoints oficiales de cada proveedor de IA o motores de búsqueda autorizados.
* **Protección de Saldo y Facturación (Financial DevSecOps):** Bloqueo estricto por defecto de llamadas a APIs con costo (Exa.ai, Perplexity Sonar); la directiva `allowPaidTier` debe ser autorizada explícitamente por el usuario para evitar cargos accidentales en tarjetas de crédito o saldos de APIs.
* **Transmisión Segura de Tokens de Búsqueda:** Las claves de búsqueda (`braveApiKey`, `apiKey`) se transmiten únicamente por HTTPS en cabeceras especializadas (`X-Subscription-Token` para Brave Search, Bearer para Tavily/Exa) y nunca se imprimen en logs públicos ni en SSE broadcasts.
* **Erradicación Total de Secretos Hardcodeados:** Prohibición estricta de literales de API keys (`sk-...`) en el código fuente. Centralización obligatoria en `src/config/keys.js` leyendo exclusivamente de variables de entorno (`import.meta.env` o `process.env`). Auditoría automatizada vía tests de seguridad.
* **Aislamiento de Guardado y Prevención de Corrupción (Concurrency Guard):** Mutex por `projectId` y rechazo HTTP 409 ante peticiones que intenten degradar el estado persistido de un proyecto.
* **Sanitización de LLM Outputs:** Todo texto devuelto por los modelos se pasa por sanitizadores que remueven scripts maliciosos, etiquetas `<think>` no deseadas y carácteres de escape problemáticos antes de inyectarlo en el DOM.
* **Network Failover Seguro:** Las peticiones a proveedores locales (Ollama/LM Studio) pasan por un proxy local de loopback (`localhost:3001/api/ai/proxy`) evitando problemas de CORS y bloqueos de red interna.
