# SECDD MASTER — Security-Driven Development & DevSecOps
**Proyecto:** Open Business Plan  

---

## 1. Modelo de Seguridad y Protección de Credenciales

* **Client-Side Secret Isolation:** Las API keys ingresadas por el usuario residen exclusivamente en su sesión local (`localStorage` / memoria del cliente) y nunca se transmiten a servidores de terceros que no sean los endpoints oficiales de cada proveedor de IA (Google, Groq, NVIDIA, OpenRouter).
* **Sanitización de LLM Outputs:** Todo texto devuelto por los modelos se pasa por sanitizadores que remueven scripts maliciosos, etiquetas `<think>` no deseadas y carácteres de escape problemáticos antes de inyectarlo en el DOM.
* **Network Failover Seguro:** Las peticiones a proveedores locales (Ollama/LM Studio) pasan por un proxy local de loopback (`localhost:3001/api/ai/proxy`) evitando problemas de CORS y bloqueos de red interna.
