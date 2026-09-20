# SECDD MASTER — Security-Driven Development & DevSecOps
**Proyecto:** Open Business Plan  

---

## 1. Modelo de Seguridad y Protección de Credenciales

* **Client-Side Secret Isolation:** Las API keys ingresadas por el usuario residen exclusivamente en su sesión local (`localStorage` / memoria del cliente) y nunca se transmiten a servidores de terceros que no sean los endpoints oficiales de cada proveedor de IA o motores de búsqueda autorizados.
* **Protección de Saldo y Facturación (Financial DevSecOps):** Bloqueo estricto por defecto de llamadas a APIs con costo (Exa.ai, Perplexity Sonar); la directiva `allowPaidTier` debe ser autorizada explícitamente por el usuario para evitar cargos accidentales en tarjetas de crédito o saldos de APIs.
* **Transmisión Segura de Tokens de Búsqueda:** Las claves de búsqueda (`braveApiKey`, `apiKey`) se transmiten únicamente por HTTPS en cabeceras especializadas (`X-Subscription-Token` para Brave Search, Bearer para Tavily/Exa) y nunca se imprimen en logs públicos ni en SSE broadcasts.
* **Erradicación Total de Secretos Hardcodeados:** Prohibición estricta de literales de API keys (`sk-...`, tokens DENUE) en el código fuente. Centralización obligatoria leyendo exclusivamente de variables de entorno (`import.meta.env` o `process.env`). En el backend Node.js (`server/index.js`), se implementa carga prioritaria y aislada de `.env.local` mediante `dotenv`. Auditoría automatizada vía tests de seguridad (`tests/security/hardcodedKeys.test.js`).
* **Compatibilidad de Identificadores Criptográficos:** Generación de identificadores de proyectos y trazas con fallback seguro (`crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex')`) garantizando interoperabilidad en cualquier runtime de Node.js.
* **Aislamiento de Guardado y Prevención de Corrupción (Concurrency Guard):** Mutex por `projectId` y rechazo HTTP 409 ante peticiones que intenten degradar el estado persistido de un proyecto.
* **Sanitización de LLM Outputs:** Todo texto devuelto por los modelos se pasa por sanitizadores que remueven scripts maliciosos, etiquetas `<think>` no deseadas y caracteres de escape problemáticos antes de inyectarlo en el DOM.
* **Network Failover Seguro:** Las peticiones a proveedores locales (Ollama/LM Studio) pasan por un proxy local de loopback (`localhost:3001/api/ai/proxy`) evitando problemas de CORS y bloqueos de red interna.
* **Sesiones Seguras con Cookies HttpOnly & SameSite:** Erradicación del almacenamiento de tokens JWT en `localStorage`. Las credenciales de sesión se gestionan mediante cookies con banderas `HttpOnly` (inmunes a XSS), `SameSite: 'Lax'` (protección contra CSRF) y `Secure` en HTTPS. La directiva Recordarme diferencia entre sesiones volátiles de navegador y renovaciones persistentes de 30 días.
* **Auditoría Inmutable (Append-Only Audit Trail):** Registro estricto de eventos críticos en `server/data/audit_log.json` con timestamp ISO, ID de usuario, IP de origen, acción ejecutada y metadata contextual. Las consultas están restringidas exclusivamente al rol `superadmin`.

---

## 2. Matriz de Control de Acceso Basado en Roles (RBAC)

| Recurso / Operación | superadmin | revisor | user |
| :--- | :---: | :---: | :---: |
| Autenticación con Cookies HttpOnly | ✅ | ✅ | ✅ |
| Gestión de Usuarios (CRUD, roles, reset clave) | ✅ | ❌ | ❌ |
| Consulta de Bitácora de Auditoría (`audit_log.json`) | ✅ | ❌ | ❌ |
| Módulo Avanzado: Comercio Cuántico TR | ✅ | ❌ | ❌ |
| Ver Proyectos Propios (Lectura y Edición) | ✅ | ✅ | ✅ |
| Ver Proyectos Ajenos (Modo Supervisor / Auditor) | ✅ (Banner Superior) | ✅ (Solo Lectura) | ❌ |
| Modificar Proyectos Ajenos | ✅ | ❌ | ❌ |
| Agregar Comentarios Editoriales a Proyectos | ✅ | ✅ | ✅ (Propios) |
| Cambiar Estado a `En revisión` | ✅ | ✅ | ✅ |
| Cambiar Estado a `Aprobado` | ✅ | ❌ (HTTP 403) | ❌ (HTTP 403) |
| Archivar / Restaurar Proyectos | ✅ | ❌ | ✅ (Propios) |
| Exportación de Dossier Ejecutivo (DOCX/PDF) | ✅ | ✅ | ✅ |

---

## 3. Configuración Criptográfica y Claves de Producción

* **`JWT_SECRET`:** Clave criptográfica simétrica de 64 bytes hexadecimales generada con `crypto.randomBytes(64)` y persistida en `/var/www/open-business-plan/.env`. Garantiza que los reinicios de PM2 o del servidor no invaliden las sesiones activas de los usuarios.
* **`API_KEYS_ENCRYPTION_KEY`:** Clave de cifrado AES-256-GCM de 32 bytes hexadecimales generada con `crypto.randomBytes(32)` para cifrar en reposo las API keys personales en `server/data/users.json` (prefijo `enc:v1:`).
* **Protección CSRF y Reverse Proxy:** Middleware de validación de origen en mutaciones autenticadas con `app.set('trust proxy', 1)` para resolver con precisión la IP del cliente y las cabeceras `X-Forwarded-Proto` entregadas por Nginx.
