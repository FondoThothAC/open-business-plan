# B2 · Credencial embebida, endpoints públicos que gastan cuota y body limit — **Crítico**

> **Antes de tocar nada:** leer [`00_CONTEXTO.md`](00_CONTEXTO.md) (§0.4 auth, §0.5 deploy, §0.6 dónde está la clave, §0.7 política de secretos, §0.8 aislamiento, §0.10 corrección 7). Rama `fix/fase-b2` desde `main` (con B1 mergeado).

**Objetivo:** que el repo no contenga la credencial, que nadie sin sesión haga gastar las credenciales del servidor, y que un request de 100 MB no sea aceptable en cualquier ruta.

**Restricción del dueño:** no romper lo desplegado. Por eso el purge va **con guard 503** y con respaldo reversible antes de editar (§paso 1), y por eso cerrar las rutas de IA es seguro: los callers ya mandan credenciales.

---

## Estado verificado hoy

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | La clave DENUE/INEGI está en **6 sitios rastreados por git**, no uno | `server/index.js:118` (último fallback de `resolveInegiToken` L110-120), `server/api/inegiAgebEngine.js:6-7`, `server/competitorEngine.js:137` y `:508`, `server/autonomousResearchEngine.js:165`, `encrypt_keys.cjs:18`, `Documentos IA DD/SDD_MASTER.md:461` |
| 2 | `/api/ai/account-chat`, `/api/swarm/interview`, `/api/swarm/industrialize` están en `RUTAS_PUBLICAS` (`authGuard.js:16-31`), y el matcher usa `===` **o** `startsWith(rutaNorm + '/')` (L44-51) → `GET /api/swarm/stream/:sessionId` queda pública con `Access-Control-Allow-Origin: *` (`index.js:4514`) | sin sesión, `req.user` es `undefined` y los handlers no lo comproban |
| 3 | `account-chat` (`index.js:389-440`) cae a `process.env.OLLAMA_KEY` si el body no trae key (L398-406), **persiste en silencio** la key del body al perfil del usuario si hay `userId` (L416-422), y no aplica cuota; `maxTokens` llega del body (hasta 16384) | — |
| 4 | swarm no usa `req.user` ni cuota: `interview` L4497-4506, `industrialize` L4525-4544 (fire-and-forget, responde 200 de inmediato). Las credenciales reales se queman en `server/swarm/LlmExecutionEngine.js:43-45` (`VITE_BAI_KEY`/`BAI_KEY`), `:75-77` (`VITE_GROQ_KEY`) | — |
| 5 | `aiConfig` llega del body (`src/components/Anteproyecto.jsx:339` manda `aiConfig: planData.config.ai`) y `server/swarm/LlmExecutionEngine.js:137-176` usa `aiConfig.endpoint` para `tryOllama` **sin validar** → SSRF-adyacente en ruta pública | — |
| 6 | `express.json({ limit: '100mb' })` y `urlencoded` 100mb en `index.js:147-148`, montados **antes** de `authGuard` (L241) → se buferan 100 MB pre-autenticación. **No hay ningún límite por ruta** en todo el repo (grep de `express.json\|bodyParser\|multer` solo da esas dos líneas) | — |
| 7 | `tests/security/noHardcodedKeys.test.js` (50 l) solo regexa `sk-`/`tvly-`/`BSA` → no detecta una key formato UUID | — |

**Nombres de variable de entorno ya en uso:** `DENUE_KEY`, `INEGI_KEY`, `VITE_DENUE_KEY`, `VITE_INEGI_KEY`. `.env.local` **ya define `DENUE_KEY`** (verificado listando solo nombres). `.env.production.example:34-40` solo documenta las variantes `VITE_*`, así que una instalación nueva no puede satisfacer `resolveInegiToken`.

---

## Pasos

### 1 · Respaldo reversible ANTES de editar (sin imprimir el secreto)

Verificar que `.env.local` está gitignored (`.gitignore:27-28` ya lo hace) y asegurar que contenga `DENUE_KEY` **e** `INEGI_KEY` con el valor que hoy está literal en `server/index.js:118`. Hacerlo con un script que lea el literal del archivo y lo escriba en `.env.local`, **sin `echo` del valor a consola ni al resumen** (§0.7). El valor queda además en el historial de git: ese es el rollback largo.

Comprobación de que el respaldo quedó (solo longitudes, nunca el valor):

```bash
awk -F= '/^(DENUE|INEGI)_KEY=/{print $1" presente, "length($2)" chars"}' .env.local
```

Esperado: las dos líneas con un length > 20. Si `INEGI_KEY` no existía antes, crea la línea con el valor copiado del literal de `server/index.js:118` (el script del paso 2 lo lee de ahí; `.env.local` ya tiene `DENUE_KEY`, verificado).

### 2 · Purga con guard 503

Crear `server/inegiCredentials.js`:

```
export function inegiToken()  // process.env.INEGI_KEY || process.env.DENUE_KEY || ''
```

Sustituir el literal en los 5 sitios de código: `resolveInegiToken` (`index.js:110-120`) delegando en este módulo, `api/inegiAgebEngine.js:6-7`, `competitorEngine.js:137,508`, `autonomousResearchEngine.js:165`. **`encrypt_keys.cjs`: cero referencias en todo el repo (verificado) → eliminar el archivo** y anotarlo en el commit. Redactar el valor en `Documentos IA DD/SDD_MASTER.md:461` (dejar la frase sin el UUID).

Donde el token vacío hoy produciría un 401 confuso de upstream, responder `503 { error, code: 'INEGI_TOKEN_NOT_CONFIGURED' }` en los handlers que dependen de INEGI/DENUE. **El server arranca igual sin la variable**: eso es lo que hace este purge seguro para el deploy.

### 3 · Documentar la variable y dejar el pre-vuelo

Agregar `DENUE_KEY` / `INEGI_KEY` al bloque `# ─── APIs de Datos Mexicanos ───` de `.env.production.example:34-40`. **No** crear `VITE_*` para esto: `src/config/keys.js:19-23` tiene la regla de casa explícita de que estas credenciales son solo de servidor porque Vite las incrustaría en el navegador.

Checklist para el dueño, en el cuerpo del commit (imprime solo presente/ausente):

```bash
cd /opt/obp && node -e "import('./server/loadEnvironment.js').then(()=>console.log('DENUE:',!!process.env.DENUE_KEY,'INEGI:',!!process.env.INEGI_KEY))"
pm2 restart obp-backend && sleep 2 && curl -s -X POST http://127.0.0.1:3001/api/market/enrich -H 'Content-Type: application/json' -d '{"projectId":"prueba"}' | head -c 200
```

### 4 · Test anti-fuga

Extender `tests/security/noHardcodedKeys.test.js` con una regla anclada al contexto, no al formato suelto (si no, rompe por los UUIDs que son ids de proyecto):

```js
/(?:key|token|secret|denue|inegi)["'\s:=]{1,4}["']?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
```

Mantén el conjunto de archivos que el test ya escanea y **agrega** esta regla encima, en lugar de reducir el barrido: la regex está anclada al contexto (`key|token|secret|denue|inegi` antes del valor), así que **no** choca con los UUID que hay en `scripts/` — verificado: los de `scripts/capture_competencia_heatmap.js:38` y `capture_vista_previa_mapa.js:36` son rutas de trabajo de Windows, sin palabra clave delante, y la regla no los marca. Lo que sí hay que dejar fuera es `proyectos/` (ids de proyecto y `ghost_backups` llenos de UUID) y los `.md`, y conservar el filtro de extensión `.js|.jsx|.ts|.tsx` que el test ya usa.

### 5 · Cerrar las rutas públicas de IA

Borrar de `RUTAS_PUBLICAS` (`authGuard.js:16-31`) las **8** entradas de IA/swarm: `/ai/account-chat`, `/api/ai/account-chat`, `/swarm/interview`, `/swarm/stream`, `/swarm/industrialize`, `/api/swarm/interview`, `/api/swarm/stream`, `/api/swarm/industrialize`. Quedan solo login/register/health. Como el matcher hace `startsWith` (L44-51), quitar `/api/swarm/stream` cierra también `GET /api/swarm/stream/:sessionId`.

**Por qué no rompe el deploy** (§0.4, §0.5): `account-chat` se llama con `credentials:'include'` (`src/lib/ai.js:985`) **y** con `Authorization` inyectada por `src/main.jsx:9-44`; swarm interview/industrialize igual (`SwarmInterviewModal.jsx:39`, `Anteproyecto.jsx:339`); y el SSE ya pasa `{ withCredentials: true }` (`Anteproyecto.jsx:287`). Además `ai.js:1002-1004` ya tolera que `account-chat` falle y cae al canal directo.

En los handlers:
- **stream (`index.js:4509-4522`):** quitar el `Access-Control-Allow-Origin: '*'` explícito (L4514) — `cors()` ya está montado en `index.js:138-145` con `credentials: true` y ecosistema de `configuredOrigins`, así que el header del handler es redundante y peligroso. (El bloque de `L152-159` es otra cosa: es el chequeo de origin anti-CSRF, no CORS.)
- **Vínculo de sesión — el orden importa y la ficha lo tenía al revés.** El cliente abre el `EventSource` de stream (`Anteproyecto.jsx:287`) **antes** de hacer `POST /api/swarm/industrialize` (`:339`). Si registras `sessionId → usuario` solo en industrialize, el mapa está vacío cuando llega el stream y la verificación es código muerto. Registro correcto: **quien reclama el `sessionId` es el primero que lo toca** — al abrir `GET /api/swarm/stream/:sessionId`, si no está reclamado se reclama para `userFolder(req.user)`; si ya está reclamado por otro, `403`. En `industrialize` se aplica la misma regla (puede ser quien reclame primero, o debe coincidir con el reclamador). **Fail-open documentado:** el mapa vive en memoria, así que tras un reinicio de PM2 una sesión legítima puede reclamar su propio `sessionId` otra vez; anótalo en el código, no lo "arregles" con disco.
- **account-chat (L389-440):** eliminar la persistencia silenciosa de la key del body al perfil (L416-422) — para eso existe su propia ruta de API keys. Conservar el fallback a `process.env.OLLAMA_KEY` **solo para autenticados**, gateado con el patrón de casa `obtenerEstadoApisCompartidas(buscarPorId(req.user.id)).active` (`auth.js:50`, ya se usa así en `index.js:102`). Topar `maxTokens` conservando el piso que ya existe: hoy hay un `Math.max(64, …)`, así que `Math.min(Math.max(Number(body.maxTokens) || 4096, 64), 8192)` — y el único caller manda 8192/4096 (`src/lib/ai.js:993`), así que el techo no lo afecta.
- **swarm (`index.js:4497-4544`):** usar `req.user` para el registro/telemetría; no cambiar la forma de la respuesta.

### 6 · Validar `aiConfig.endpoint`

Extraer a `server/aiEndpointAllowlist.js` el `Set` de hosts que ya existe en `index.js:3523-3531` (`/api/ai/proxy`) y hacerlo obligatorio en `LlmExecutionEngine.js:137-176`: hostname exacto en la lista **y** protocolo `https:`, permitiendo además `process.env.OLLAMA_TUNNEL_URL` si está definida **y el Ollama local que el código ya usa por defecto**: `http://localhost:11434` **y** `http://127.0.0.1:11434` — verifica el default real en `LlmExecutionEngine.js:159` (`tryOllama(systemPrompt, userPrompt, endpoint = 'http://localhost:11434')`). Si solo permites la forma `127.0.0.1`, **el camino local pretendido queda rechazado**, que es justo lo que este paso prohíbe. **No** apliques el bloqueador de IPs privadas de B6 aquí: Ollama en loopback es intencional y se rompería.

### 7 · Límites de body

Global en `index.js:147-148`: `100mb` → **`1mb`** para `express.json` y `express.urlencoded`.

**Trampa de montaje — hay una sola forma segura, y la que parece obvia está prohibida.** body-parser hace cortocircuito si `req._body` ya está puesto, así que un parser por ruta montado *después* del global jamás re-parsea. Y la alternativa natural —escribir `app.post('/api/save', express.json({limit:'8mb'}), handler)` arriba de todo— **deja esas 9 rutas sin autenticar**: Express ejecuta las capas en orden de registro, y si la ruta se registra antes que `app.use('/api', authGuard)` (L241) su handler corre sin guard y sin el chequeo anti-CSRF de `L152-159`.

Forma correcta: declarar los parsers de las rutas grandes con `app.use(<prefijo>, express.json({limit}))` **justo antes** del parser global de `L147`. `app.use` con prefijo solo ejecuta el parser, no el handler, así que `authGuard` (registrado más abajo, L241) sigue aplicando; y como el parser global posterior ve `req._body` puesto, no duplica trabajo.

```js
// insertar ANTES del actual app.use(express.json({ limit: '1mb' })) de L147
app.use('/api/save',       express.json({ limit: '8mb' }));
app.use('/api/logo/save',  express.json({ limit: '8mb' }));
app.use('/api/ai/proxy',   express.json({ limit: '8mb' }));
// … igual para /api/ai/bob-chat y /api/ai/account-chat, y los 4mb del paso siguiente
app.use(express.json({ limit: '1mb' }));                          // global
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
```

Verifica el orden con un request real, no por lectura del código: un body de 2 MB a `/api/save` **sin sesión** debe dar **401** (el guard aplica), y con sesión **200** (el límite de 8 MB aplica). Si da 413 sin sesión, el parser se montó antes que el guard de forma efectiva y hay que revisar.

Valores medidos en el repo: el plan JSON más grande en disco ≈ **320 KB** y el `data:image` embebido mayor ≈ **137 KB**; Nginx permite 50 M (`nginx-obp.conf:122`).

| Límite | Rutas |
|---|---|
| 8mb | `/api/save` (L1438), `/api/logo/save` (L3656), `/api/ai/bob-chat` (L331), `/api/ai/account-chat` (L389), `/api/ai/proxy` (L3520) |
| 4mb | `/api/logo/generate` (L3632), `/api/market/competitors` (L3303), `/api/market/enrich` (L3345), `/api/market/viability` (L3333), `/api/research/start` (L4842) |
| 1mb | el resto, global |

### 8 · Tests nuevos

`tests/publicRoutesAndLimits.test.js` (servidor aislado, §0.8):

- Sin cookie y sin Bearer → `POST /api/ai/account-chat`, `/api/swarm/interview`, `/api/swarm/industrialize`, `GET /api/swarm/stream/abc` → **401**.
- Con Bearer de un usuario real → los mismos → **no** 401 (camino feliz).
- Body de >1 MB a una ruta genérica → **413**, y en JSON.
- Body de entre 1 MB y 8 MB a `/api/save` → **200**.
- `/api/logo/save` con un dataURL grande (≈500 KB) y `projectType` válido → **200**.
- `POST /api/ai/proxy` con un host fuera del allowlist → 400; `LlmExecutionEngine` con `aiConfig.endpoint` externo → rechazado.
- El test anti-fuga del paso 4 en verde.

---

## Criterio de aceptación

- [ ] `grep -rn "1b9e230f" server src` sin resultados. (No se reproduce el UUID completo en ningún archivo nuevo.)
- [ ] `grep -n "account-chat\|swarm" server/middleware/authGuard.js` ya no muestra esas rutas en `RUTAS_PUBLICAS`.
- [ ] Sin sesión → 401 en las 4 rutas (test en verde).
- [ ] Body >1 MB en ruta genérica → 413; las rutas con payload grande documentadas con su límite.
- [ ] **End-to-end en local:** guardar un proyecto y guardar un logo siguen funcionando después del cambio de límites (este es el check que evita el deploy roto).
- [ ] Enriquecimiento INEGI: con `DENUE_KEY` puesta responde como antes; sin ella, 503 con `INEGI_TOKEN_NOT_CONFIGURED` y el server arrancando normal.
- [ ] `npm test` completo verde + `npx eslint src server tests` sin errores nuevos + review de solo lectura limpio.

**Mensaje de commit:** `B2: credencial fuera del codigo, rutas de IA autenticadas y limite de body por ruta` — cuerpo: **la key ya está comprometida, hay que rotarla en el portal INEGI** (vive en el historial de git y en `config.externalApis.inegiToken` de los JSON del VPS; purgar ≠ remediación), qué variables de entorno se añadieron, y la lista de límites por ruta.
