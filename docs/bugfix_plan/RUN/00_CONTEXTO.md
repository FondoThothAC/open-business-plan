# 00 · CONTEXTO — leer antes de ejecutar cualquier fase

**Este archivo es obligatorio para toda sesión que ejecute una fase B1–B6.** Contiene lo que ya fue verificado contra el código, para que la sesión no tenga que re-auditar. Cada brief de fase repite en línea las anclas que usa.

---

## 0.1 Qué es esto

Open Business Plan (OBP) — Fondo Thoth A.C. Repo: `/Users/robertoeduardocelisrobles/Documents/Proyectos/OBP`. Backend Express en `server/`, frontend Vite+React en `src/`. Desplegado en VPS Oracle Cloud de 1 GB RAM (`https://fondothoth.com/obp`, Nginx + PM2 con `instances: 1`, ver `ecosystem.config.cjs:12`).

El trabajo es aplicar los fixes de la auditoría del 12-oct-2026 en 6 fases ordenadas por severidad. **Restricción del dueño del repo: no romper lo que está desplegado.** Ninguna decisión de este plan puede cambiar el comportamiento observable de la app para un usuario autenticado, ni requerir un deploy que él no haya autorizado.

Estado al momento de verificar: `main` en `de9db87`, **ningún fix de B1–B6 aplicado** (los últimos seis commits son calibración de contenido de planes de negocio, no código).

## 0.2 Cómo usar estas anclas

Los números de línea fueron confirmados el **12-oct-2026 sobre `de9db87`** con el working tree limpio en `server/` y `src/`. Si `git log` muestra commits de código entre esa verificación y tu sesión, las líneas pudieron desplazarse: **localiza por ruta de endpoint o nombre de función**, y da por hecho que el offset en `server/index.js` crece (ese archivo tiene ~5435 líneas y 134 rutas definidas en línea).

### 0.2.1 Deriva concurrente OBSERVADA mientras se escribían estos briefs

El dueño corre varias sesiones sobre este repo a la vez, y eso ya movió el suelo debajo de estas anclas. Medido a las 22:10 del 12-oct-2026, con otra sesión trabajando en la matriz PESTEL sobre el mismo `main` sin commitear:

| Archivo | Estado real | Efecto en las anclas |
|---|---|---|
| `server/index.js` | modificado, **+3 líneas** (5432 → 5435), mtime 22:00 | los 4 handlers de B1 ya no están en 3656/3702/3750/3793 sino en **3659/3705/3753/3796** (offset +3). Todo lo que cito después de la edición temprana corre +3 |
| `src/components/ModuleWrapper.jsx` | modificado, **+13 líneas** (1124 → 1137), mtime 22:07 | las anclas de B5 (typewriter L261-285) corren hasta +13 y el offset no es uniforme |
| `src/components/PestelAnalysis.jsx`, `src/modules/VistaPrevia.jsx` | modificadas / nuevas | `VistaPrevia.jsx` se cita en B4 y B5; sus líneas también corrieron |

**Precondición dura antes de abrir cualquier fase:** `git status --short` no debe mostrar `M` en `server/` ni `src/`. Si los aparecen (otra sesión en curso), **no arranques la fase**: espera, o pide al dueño que commitee ese trabajo aparte primero. Arrancar con el árbol sucio es exactamente cómo un commit de fase barre trabajo ajeno — y cómo se pisa una migración que otra sesión ya commiteó.

Consecuencia práctica: cuando un brief cite `L####`, tómatelo como aproximación dentro de ±15 y **verifica el ancla por nombre** antes de editar. Los comandos de re-anclaje siguen siendo la forma canónica:

```bash
git log --oneline -3
git status --short            # <— ademas: arbol limpio en server/ y src/
grep -n "app.post('/api/save'\|app.post('/api/logo/save'\|app.post('/api/log'" server/index.js
grep -n "RUTAS_PUBLICAS" server/middleware/authGuard.js
grep -n "export function calculateIRR" src/lib/finanzas/financial-calculations.js
```

## 0.3 Entorno y comandos

| Cosa | Valor verificado |
|---|---|
| Node en esta máquina | v25.2.1 (el repo **no** declara `engines`) |
| `npm test` | `node --test --test-concurrency=1 tests/*.test.js tests/swarm/*.test.js tests/integration/*.test.js tests/security/*.test.js` — 72 archivos, framework `node:test` + `node:assert` |
| `npm run lint` | `eslint src server tests` — **hoy sale con código 1** (4 errores `no-useless-assignment`) |
| `npm run server` | `node server/index.js` (puerto 3001) |
| `npm run dev` / `build` | `VITE_BASE_PATH=/ vite` / `vite build` |
| ES modules | `"type": "module"` en `package.json` |
| `npm test` **no** corre eslint | son scripts separados |

No hay jsdom, ni vitest, ni @testing-library, ni framework de mock de `fs`. **No se instalan dependencias nuevas** (el disco de la Mac del dueño está casi lleno y el plan no lo requiere): los componentes se verifican en navegador y la lógica pura con `node:test`.

## 0.4 Modelo de autenticación y roles — supuestos válidos

- Sesión = cookie **HttpOnly `obp_auth_token`** (`server/index.js:192`), con fallback retrocompatible a header `Authorization: Bearer` (`authGuard.js:54-62`).
- `authGuard` se monta en `server/index.js:241` como `app.use('/api', authGuard)`. **No hay ninguna ruta antes de él.** Todo `/api/*` está autenticado salvo lo listado en `RUTAS_PUBLICAS` (`authGuard.js:16-31`).
- `req.user = { id, username, role, displayName, email, status }` (`authGuard.js:117-124`). Además `authGuard.js:126` hace `req.headers['x-user-id'] = usuario.username` — por eso en los handlers de logs `reqUserId` **es un username, no un id**.
- Roles reales: `server/auth.js:40` `ROLES_VALIDOS = new Set(['superadmin','revisor','user'])`. **El rol `admin` no existe.** El superadmin de arranque es `username: 'roberto'` con rol `superadmin` (`auth.js:87-91`), pero su `status` es `pending_bootstrap` **si no defines `BOOTSTRAP_SUPERADMIN_PASSWORD`** (`auth.js:84-93`), y `authGuard.js:100` responde **403** a cualquier cuenta que no esté en `status: 'active'`. Lo mismo aplica a los registros nuevos: `registrarUsuario` deja `status: 'pending'` (`auth.js:242`). **Para los tests con requests autenticados hay que usar `crearUsuarioAdmin`/`activarUsuario`, o arrancar el server con `BOOTSTRAP_SUPERADMIN_PASSWORD`** — si no, todo te devuelve 403 y parece que el fix falló. Middlewares de rol disponibles: `soloAdmin` (`authGuard.js:134`, exige `role === 'superadmin'`), `soloRevisorOSuperAdmin` (L147), `prohibirRevisorMutacion` (L161).
- El frontend inyecta credenciales en **todo** fetch al backend: `src/main.jsx:9-44` añade `Authorization` (desde `localStorage.obp_auth_token`) y `x-user-id` para cualquier URL que empiece con `/api`, `/obp/api` o `http://localhost:3001`. No hace falta tocar los callers para que una ruta deje de ser pública.
- Plantillas de estilo de casa a imitar: handler destructivo con verificación de propiedad → `server/index.js:2028-2032`; decisión de admin por rol → `index.js:1666`; lectura autorizada → `index.js:616`.

## 0.5 Hechos de deploy verificados (la base del "no romper producción")

1. **`deploy/deploy.sh:36-42`** copia `.env.production.example` → `.env.local` **únicamente si `.env.local` no existe**. Las variables del VPS sobreviven cualquier deploy. `deploy.sh` no borra datos; `deploy_vps.sh:69-77` hace rsync *hacia* el VPS.
2. **`deploy/nginx-obp.conf:122`** ya permite `client_max_body_size 50M` → los límites por ruta propuestos (8 MB) pasan por Nginx sin tocar esa configuración.
3. **`deploy.sh:82`** solo verifica salud con `curl … /api/health | grep '"status":"ok"'` → cambiar el formato de error de otras rutas (p. ej. 413 de HTML a JSON) no rompe el pipeline de deploy.
4. `GET /api/log/stream` (`index.js:1327`) ya está hoy detrás de `authGuard` y funciona desde `src/components/ActivityFeed.jsx:285` con `EventSource` simple → confirma que el patrón de sesión aplica también a SSE same-origin.
5. `config.brandKit.logoUrl` se consume **siempre como dataURL dentro del JSON del plan** (`src/modules/Configuracion.jsx:1811`, `src/modules/VistaPrevia.jsx:1967`, `src/modules/Semilla.jsx:408`). Ningún endpoint lee el archivo `logo.png` que `index.js:3675` escribe a disco → reubicar ese archivo en B1 es inocuo para la UI.
6. `src/config/keys.js:20-23` (`getServerEnvVar`) devuelve `''` en el navegador porque no existe `process`, y `denue: getServerEnvVar('DENUE_KEY')` (L37) por eso **la clave no viaja en el bundle**: `dist/` no contiene el literal. El bundle actual está limpio; no hay que regenerarlo como parte de ningún fix.

## 0.6 Dónde está realmente la credencial INEGI/DENUE (medido, no asumido)

- **En el historial de git (6 archivos, esto sí es exposición):** `server/index.js:118`, `server/api/inegiAgebEngine.js:6-7`, `server/competitorEngine.js:137` y `:508`, `server/autonomousResearchEngine.js:165`, `encrypt_keys.cjs:18` (archivo **sin ninguna referencia** en todo el repo) y en prosa `Documentos IA DD/SDD_MASTER.md:461`.
- **Local y en su sitio correcto:** `.env.local` define `DENUE_KEY` (y `BANXICO_KEY`); `.gitignore:27-28` ignora `.env.local` y `.env*.local`.
- **Copias en datos, no rastreadas por git:** `config.externalApis.inegiToken` aparece dentro de ~50 JSON en `proyectos/` (incluidos `.versions/` y `.archive/ghost_backups/`). `.gitignore:16` (`proyectos/negocios/*/`) los mantiene fuera del índice, pero **existen en el VPS** porque `/api/save` los escribe ahí. `src/lib/serverUtils/sanitizeProjectConfig.js:5,10` borra `externalApis` al sanitizar, y `src/context/PlanContext.jsx:99,234,376` siembra `inegiToken: KEYS.denue` — que en el navegador es `''`.

**Consecuencia operativa que va en el commit de B2:** purgar el código no descompromete la clave (vive en el historial de git y en los JSON del VPS). **La rotación es la remediación real y la hace el dueño en el portal INEGI.** Limpiar los JSON es opcional y queda anotado, no se ejecuta en este plan.

## 0.7 Política de secretos

Nunca imprimir el valor de una API key en consola, en un commit, en un resumen ni en la respuesta al usuario. Para verificar presencia: `grep -oE '^[A-Z_]+=' .env.local` (solo nombres) o `!!process.env.DENUE_KEY` (solo booleano). La búsqueda de la clave usa el prefijo corto `1b9e230f`, que ya aparece en la ficha `FASE_B2` — no escribir el UUID completo en ningún archivo nuevo.

## 0.8 B0 — Aislamiento de datos ANTES de correr el suite (obligatorio, no se commitea)

**`npm test` escribe sobre datos reales.** Verificado: `tests/authAndMultiuser.test.js:10,44,80,106` corre `registrarUsuario`/`actualizarUsuarioAdmin`/`cambiarPassword`/`eliminarUsuario` contra el `server/data/users.json` de verdad; `tests/provenanceContract.test.js:314,322-333` llama `incrementSearchQuota` y hace **950 incrementos** sobre el `server/data/search_quota.json` real; `tests/telemetryAttribution.test.js:12-21` respalda y restaura `proyectos/telemetry/tokens_usage.json`. El dueño corre varias sesiones sobre este repo el mismo día: sin respaldo, dos sesiones se pisan los datos.

Procedimiento al inicio y al final de cada fase:

```bash
cp -a server/data /tmp/obp-data-bak-<fase>        # respaldo
# … npm test …
rm -rf server/data && cp -a /tmp/obp-data-bak-<fase> server/data   # restaurar
```

Y antes del suite: `pgrep -f "node server/index.js"` para confirmar que no hay un servidor local tuyo escribiendo los mismos archivos.

**Los tests HTTP nuevos van en cwd temporal**, no contra los datos reales. `path.resolve('proyectos', …)` es relativo al **cwd**, mientras que los imports resuelven relativo al archivo — así que un `cwd` en `os.tmpdir()` da un `proyectos/` y un `server/data/` pristine con el código real. Único precedente de este patrón en el repo: `tests/authPersistence.test.js:9-14` (`mkdtempSync` + `spawnSync(node, …, { cwd: dir })`).

## 0.9 Topología de ejecución: una sesión por fase

Cada fase es **un chat propio**, arrancando desde `main` con la fase anterior ya mergeada:

```
sesión B1: git checkout -b fix/fase-b1 main  → fix + tests → merge local a main
sesión B2: git checkout -b fix/fase-b2 main  → …
… hasta B6
```

**Antes del `git checkout -b`:** `git status --short` debe salir limpio en `server/` y `src/` (§0.2.1). Si hay `M` de otra sesión en curso, no abras la rama — un commit de fase barre ese trabajo ajeno.

Razones: `server/index.js` es tocado por B1, B2, B3 y B6 en zonas distintas y un solo contexto acumula cuatro diffs; `deploy.sh:46` hace `git pull origin main`, así que la unidad de rollback debe ser la fase (`git revert <sha>`); y el working tree sin commitear es justo como se pisan dos sesiones concurrentes.

**El `git push` y el deploy los ejecuta el dueño.** Ninguna sesión de este plan hace push, ni `deploy.sh`, ni tocamientos al VPS.

Cierre de fase (sustituto de `/ultra-review`, que no existe en este entorno): un subagente **de solo lectura** sobre el diff — `Agent` con `subagent_type: "general-purpose"` o `"Explore"`, con instrucción explícita de no editar — respondiendo: ¿quedan rutas que construyan paths con input sin validar?, ¿cambió la forma de alguna respuesta de API?, ¿algún fix puede devolver 401/403/404 a un usuario autenticado que antes pasaba?

## 0.10 Las 8 correcciones a la ficha original (`FASE_B1…B6.md`)

La ficha es mayormente correcta, pero esto está mal o incompleto. Si tu brief dice una de estas cosas, **este archivo gana**:

1. **B3: no se introduce mutex de promesas.** Todo el camino de `server/auth.js` es **síncrono** (`bcrypt.hashSync`, `readFileSync`) y PM2 corre con `instances: 1`, así que un read-modify-write sin `await` ya es indivisible. Envolverlo en async propagaría asincronía a `authGuard.js:88`, que llama `buscarPorId` en **cada request autenticado**, y de ahí a las 134 rutas. La misma garantía se logra con escrituras atómicas + invariantes + reserva de cuota.
2. **B3: no se obliga `baseRevision` siempre.** El autoguardado (`src/context/PlanContext.jsx:424-478`) no manda `if-match-revision` de forma fiable; exigirlo metería a los usuarios logueados en un bucle de 409.
3. **B6: el timestamp del limiter SÍ se asigna antes del `await`** (`index.js:78`, y el await real es L81). El defecto es otro: K llamadas concurrentes leen L74, calculan el mismo `elapsed`, duermen L76, despiertan juntas y todas estampan → solo espacia llamadas secuenciales.
4. **B1: el `req.query.userId` es código muerto**, no la vulnerabilidad activa. `authGuard` sobreescribe `x-user-id` (`authGuard.js:126`) y ningún llamador usa el query. Las vulnerables reales son: traversal de `projectType`/`projectId`, caída a la raíz compartida en GET/DELETE de logs, y admin decidido por username.
5. **B1: `projectId` en `/api/logo/save` sí está sanitizado** ya (`index.js:3663`, `replace(/[^a-z0-9]/gi,'_')`). El vector ahí es solo `projectType`. En `POST /api/log` (L3727) en cambio `projectId` entra **crudo**.
6. **B5: los 4 `no-useless-assignment` no ocultan bugs.** Verificado uno por uno: `midRate` (`financial-calculations.js:24`), `amount` (L183), `specificGrowthMultiplier` (L191) y `directivaFormato` (`src/lib/promptExporter.js:52`) se sobreescriben en **todas** las ramas antes de su primera lectura. Son higiene, no lógica.
7. **B2 es más grande que la ficha:** 6 sitios con la credencial (no 1), swarm sin `req.user` ni cuota usando `VITE_BAI_KEY`/`BAI_KEY`/`VITE_GROQ_KEY` (`server/swarm/LlmExecutionEngine.js:43-45,75-77`), `aiConfig.endpoint` controlado por el request (L137-176), y `GET /api/swarm/stream/:sessionId` pública con `Access-Control-Allow-Origin: *` por el `startsWith` del matcher (L44-51).
8. **El baseline de lint ya está roto hoy** (`npm run lint` → exit 1). La regla 4 del README ("sin errores nuevos") no es medible hasta B5, donde se resuelven los 4; el criterio real es **0 errores al cerrar B5**.

## 0.11 Qué NO se toca en ninguna fase

- Contratos de request/response (forma y status codes de las respuestas existentes), salvo lo que el brief autorice explícitamente.
- `proyectos/telemetry/*`: rutas hardcoded en `index.js:4614,4647,4738,4784,4818,4833,5051,5273,5347`. **No pasan por ninguna whitelist de tipos** y no deben hacerlo.
- El límite `client_max_body_size` de Nginx, ni `ecosystem.config.cjs`, ni scripts de deploy.
- `dist/` (generado), `node_modules/`, y los datos de `proyectos/`.
- Los literales `['negocios','social']` del lado cliente (`src/components/Layout.jsx:1405`) — son otro runtime; se anota como follow-up, no se unifican en estas fases.

## 0.12 Criterio de salida (plantilla que aplica a las 6 fases)

Una fase se cierra cuando, y solo cuando:

- [ ] Sus tests de regresión nuevos pasan y están en el suite.
- [ ] `npm test` completo en verde (con el número de tests reportado, y `server/data` restaurado después).
- [ ] `npx eslint src server tests` sin errores nuevos (0 errores desde B5).
- [ ] Review de solo lectura del diff sin hallazgos críticos.
- [ ] Verificación manual de que nada se rompió en el flujo afectado (navegador contra servidor **local**, nunca contra producción).
- [ ] Un solo commit en `fix/fase-b<N>` con el mensaje del brief, y merge local a `main` sin push.

## 0.13 Si ejecutas en otra máquina

- `npm ci`, no `npm install`. Node ≥ 20. En Node 20 puede fallar `scripts/generate_closets_corona.js` (importa un `.ts` y depende del type-stripping de Node 25); no es ruta crítica del plan.
- **No copies** `server/data/users.json` ni `proyectos/` reales para correr el suite: los tests los escriben. En máquina limpia `auth.js:87-91` crea el superadmin de arranque, pero con `status: 'pending_bootstrap'` si no defines `BOOTSTRAP_SUPERADMIN_PASSWORD` → los requests autenticados dan 403 (§0.4). Exporta esa variable en el entorno del test.
- `deploy/` y `.env*local` son específicos de cada máquina; el pre-vuelo del VPS (B2) se hace por SSH solo desde donde tengas la llave.
- B6 **no debe lanzar Chromium en sus tests**: el validador de URL se prueba en la entrada de la ruta, que devuelve 400 antes de `puppeteer.launch()`.

## 0.14 Pendientes que son del dueño, no del agente

- **Rotar la clave INEGI/DENUE** en el portal (razones en §0.6). Se anota en el commit de B2 y en el resumen final.
- **Pre-vuelo del `.env.local` del VPS** antes de llevar B2 a producción.
- **Push y deploy**, fase por fase, después de revisar el merge local.

## 0.15 Segunda pasada de verificación (misma fecha, sobre los propios briefs)

Después de escribirlos, los releí contra el código con un subagente de revisión de solo lectura. Cuatro afirmaciones mías habrían roto la ejecución o producción, y ya están corregidas en los briefs — tenlas presentes porque son fáciles de reintroducir:

1. **B4:** `GET /api/projects` devuelve un **objeto** `{negocios, social}` (`index.js:1662`), no un arreglo; y `Layout.jsx:339` ya hace `typeof data === 'object'`. El guard `Array.isArray` que yo proponía habría **vaciado la lista de proyectos** de todos los usuarios. Lo que faltaba era solo `res.ok`.
2. **B6:** `safeDdgSearch` devuelve un **arreglo** (`respuesta.results || []`, `index.js:82`), no `{results}`. Conservar el contrato real o se reshapean sus 10 call sites.
3. **B1:** los handlers de logo y logs ya envuelven su cuerpo en `try/catch` que traga todo → validar *dentro* de ese `try` produce 500 o `{ok:true}`, nunca el 400 que piden los tests. Hay que validar antes de entrar al `try`.
4. **B2:** la forma "obvia" de montar parsers por ruta (`app.post(path, parser, handler)` arriba de todo) registra la ruta **antes** de `app.use('/api', authGuard)` (L241) y la deja sin autenticar. Solo es válido `app.use(<prefijo>, parser)` antes del parser global.

También se corrigieron: el default real de Ollama local es `http://localhost:11434` (`LlmExecutionEngine.js:159`), no solo `127.0.0.1`; el vínculo de sesión de swarm debe reclamarse **al abrir el SSE** (el cliente abre el stream antes que `industrialize`); `RUTAS_PUBLICAS` tiene 8 entradas de IA/swarm, no 6; hay 13 `incrementSearchQuota`, no 9; `cors()` está en `index.js:138-145` y el bloque de `L152-159` es anti-CSRF; y los usuarios de test nacen en `status: 'pending'` (§0.4).
