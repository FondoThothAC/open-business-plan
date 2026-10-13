# B3 · Carreras y persistencia atómica — **Alto**

> **Antes de tocar nada:** leer [`00_CONTEXTO.md`](00_CONTEXTO.md) (§0.4 roles y `authGuard.js:88`, §0.8 aislamiento, §0.10 **correcciones 1 y 2 — este brief se aparta de la ficha a propósito**). Rama `fix/fase-b3` desde `main` (con B1 y B2 mergeados).

**Objetivo:** que ninguna escritura a los almacenes JSON pierda datos, que la revisión de `/api/save` sea autoritativa del servidor, y que guardar un proyecto nunca borre el borrador de otra persona.

---

## 0. La decisión que cambia la ficha

`FASE_B3.md` pide "una cola de exclusión en memoria (promise encadenada por archivo)" envolviendo **todas** las secuencias cargar→mutar→guardar de `auth.js`. **No lo hacemos así**, y hay que entender por qué para no rehacerlo:

Todo el camino de usuarios es **síncrono** (`bcrypt.hashSync`, `readFileSync`, `writeFileSync`) y PM2 corre con `instances: 1` (`ecosystem.config.cjs:12`). Un read-modify-write sin `await` en el medio ya es indivisible dentro de un proceso Node: hoy es físicamente imposible que dos requests interleaveen ahí. Meter un mutex async obligaría a awaitear en `buscarPorId`, que `authGuard.js:88` llama en **cada request autenticado**, y eso propaga asincronía a las 134 rutas del server por una ganancia nula — y con riesgo real de romper producción.

La exposición verdadera es otra y sí se corrige: (a) colisión y huérfanos del temp file `USERS_FILE + '.tmp.' + Date.now()`, (b) escrituras no atómicas que dejan JSON truncado si el proceso muere a mitad, (c) segundas escritoras (`scripts/`, solape de reinicio de PM2), (d) el TOCTOU **que sí hay `await` en medio**: la cuota (`checkSearchQuota` → `await safeDdgSearch` → `incrementSearchQuota`). Diseño: **atomicidad + invariantes + reserva**, no locks.

---

## Qué está mal, verificado hoy

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | `guardarUsuarios` escribe temp con solo `Date.now()` y re-nombra: dos escrituras en el mismo milisegundo colisionan; no hay `fsync`, no hay limpieza del temp si falla | `server/auth.js:127-135` (`const tempFile = USERS_FILE + '.tmp.' + Date.now()` → `writeFileSync` → `renameSync`) |
| 2 | `cargarUsuarios` **también escribe**: bootstrap del superadmin (L100) y backfill (L115) | `auth.js:77-121` |
| 3 | `buscarPorUsername` (L189-191) y `buscarPorId` (L200-202) pueden **escribir** vía `migrateApiKeys`, y `authGuard.js:88` llama `buscarPorId` en cada request | escritura en el camino de lectura |
| 4 | `/api/save` calcula `revision: Number(planData.config?.revision \|\| 0) + 1` — incrementa **el valor del cliente**, no el del disco | `index.js:1545` |
| 5 | El 409 `REVISION_CONFLICT` (L1514-1515) se salta si `baseRevision` no es finito: sin header ni campo, `NaN` → chequeo omitido → sobresciega | `index.js:1505` lee `if-match-revision` o body |
| 6 | Guardar con nombre nuevo hace `fs.rmSync(draft, {recursive:true, force:true})` con `ownerFolder` **re-punteado a la carpeta del dueño** en modos `administered`/`collaborator` → borra el `draft_activo` (con su `documentos/`) de otra persona; el `catch {}` traga el error | `index.js:1486-1497`, re-punteo en L1468-1475 |
| 7 | Cuota: check-then-write separados por un `await`. Contado en el archivo actual: **13** llamadas a `incrementSearchQuota` (L2250, 2291, 2322, 2335, 2354, 2382, 2395, 2414, 2447, 2460, 2499, 2533, 2551) y `checkSearchQuota` en L2237, L2473, L2510. El patrón es **un** `checkSearchQuota(normProvider, …)` en L2237, un `await` y luego hasta 13 puntos de incremento según la rama del cascade | `index.js:2237 → await safeDdgSearch (L2242) → incrementSearchQuota (L2250)` |
| 8 | `tokens_usage.json` tiene 3 RMW no atómicos | `index.js:4652-4716` (POST telemetry/tokens), L4739-4745 (GET), L5301-5335 (POST call-log) |
| 9 | `saveQuotaData` escribe con `writeFileSync` directo, sin temp+rename | `server/quotaTracker.js:41-51` |
| 10 | `saveWithVersioning` RMW del manifiesto de versiones y escritura del JSON principal no atómicas | `src/lib/serverUtils/saveVersioning.js`: `manifestPath` en L82, `writeFileSync` del archivo de versión en L111, del manifiesto en L142, y del JSON principal en L146 (este último sin temp ni rename) |
| 11 | Mismo anti-patrón de temp con `Date.now()` en almacenes hermanos | `server/auditLogger.js:50`, `promptFeedbackStore.js`, `generationJobStore.js`, `presenceTracker.js` |

**El patrón bueno ya existe en el repo:** `server/reviewStore.js:12` usa `` `${STORE}.${process.pid}.${Date.now()}.tmp` ``. Copiar eso.

**Lo que NO sirve de ayuda:** `src/lib/serverUtils/generationLock.js` (122 l) es un `Map<projectId, sessionId>` **advisory** para las rutas de lock (`index.js:1127,1957,1978,1986`); no serializa nada y no es un mutex. No lo reutilices para esto.

---

## Pasos

### 1 · Sacar la escritura del camino de lectura

Quitar `migrateApiKeys` de `buscarPorUsername` (L191) y `buscarPorId` (L202) y llevarlo a un `migrarSiNecesario()` que corra **una vez** al cargar el módulo y dentro de los mutadores que de todas formas guardan. Resultado: `authGuard.js:88` pasa a ser lectura pura.

### 2 · `server/atomicJson.js` (nuevo)

```
export function writeJsonAtomic(file, data)   // tmp con pid+random → writeFileSync → fsyncSync(fd) → renameSync
export function limpiarTemps(dir)             // al cargar, borra *.tmp huérfanos
```

Adoptarlo (swap de una línea, misma semántica síncrona, mismos contratos) en: `guardarUsuarios` (`auth.js:127-135`), `saveQuotaData` (`quotaTracker.js:41-51`), `auditLogger.js:50`, `promptFeedbackStore.js`, `generationJobStore.js`, `presenceTracker.js`, los escritores de telemetry (`index.js:4716`, `:5335`) y `saveVersioning.js` (L111/142/146).

### 3 · Cuota: reserva antes del `await`, no lock

Implementado distinto a como lo decia esta ficha (y esta nota gana): no hay funcion `reservarCuota` exportada; la reserva esta **dentro de `checkSearchQuota`** (check-and-reserve en un solo paso sincronico) con expiracion de 5 min y `devolverCuota(provider)` al consumir, lo que evita reescribir los 13 puntos de incremento del cascade. Ademas `quotaTracker.js` respeta `process.env.QUOTA_FILE`, porque al resolver su archivo por `__dirname` un test estaba escribiendo el `server/data/search_quota.json` real del repositorio. Y `saveQuotaData` si usa `writeJsonAtomic` (en el primer commit de B3 se anunciaba sin haberse aplicado). Originalmente pedia: agregar `reservarCuota(provider)` que **decrementa el cupo disponible desde un contador en memoria autoritativo** y `devolverCuota(provider)` para el caso de fallo. Llamar `reservarCuota` **antes** del `await safeDdgSearch` y reemplazar los 13 `incrementSearchQuota` del punto 7 por la confirmación (o directamente por el confirm de la reserva). Esto mata el drift `L2237 → await → L2250` sin tocar el contrato de la respuesta. Ojo con los incrementos "secundarios" de las ramas de tavily/brave/serper (L2322, L2382, L2447, L2499, L2533): cada provider tiene su propio bucket en `DEFAULT_QUOTA_LIMITS` (`quotaTracker.js:15-20`), así que la reserva tiene que ser del provider que se va a llamar, no del de la cascada.

### 4 · Revisión autoritativa en `/api/save`

- `revision: currentRevision + 1` usando el valor leído en disco en L1511, en vez de L1545. **Cuidado con el alcance:** el primer proyecto no existe en disco todavía, así que la lectura condicional de L1511 deja `currentRevision` sin valor — inicialízalo a `0` y Sácalo del bloque `if (fs.existsSync(...))` para que L1545 pueda verlo en los dos caminos. Un guardado nuevo debe quedar en `revision: 1`, igual que hoy.
- **Conservar** el 409 `REVISION_CONFLICT` solo cuando `Number.isFinite(baseRevision)` (L1514-1515). No hacerlo obligatorio: el autoguardado de `src/context/PlanContext.jsx:424-478` (debounce 1500 ms) no manda `if-match-revision` de forma fiable, y exigirlo metería a los usuarios logueados en un bucle de 409. La ficha lo insinuaba; **no**.
- Comentario de invariante en el handler: *"sin `await` entre la lectura de revisión y la escritura; si algún día esto se vuelve async, hace falta un mutex"*.

### 5 · Nunca borrar el borrador de otro dueño

En `index.js:1486-1497`, el borrado solo si el draft está en la carpeta de **quien guarda**: `if (safeName !== 'draft_activo' && ownerFolder === userFolder(req.user))`. Y en vez de `fs.rmSync(recursive, force)`:

```
fs.renameSync(oldDraftDir, path.resolve('proyectos', '.archive', 'drafts', `${new Date().toISOString()}-${ownerFolder}-${projectType}`))
```

`fs.renameSync` **no crea directorios padre**: hay que hacer `fs.mkdirSync(path.dirname(destino), { recursive: true })` antes del move, o el primer draft archivado lanza `ENOENT` (y hoy ese bloque está dentro de un `try {} catch {}` que lo tragaría en silencio, dejando el draft viejo sin archivar y el bug invisible).

El precedente `.archive/` ya existe en el repo (`proyectos/.archive`, con `ghost_backups/` dentro). Loggear el movimiento en vez de tragarlo en un `catch {}` vacío. Mismo tratamiento para `projectAccess.js:345` (`transferProjectOwnership`), que tiene la misma forma destructiva.

### 6 · Tests nuevos — `tests/concurrencyAndDrafts.test.js`

Servidor/archivo aislado en cwd temporal (§0.8). **Cuatro casos, no uno:**

- (a) dos `registrarUsuario` disparados concurrentes → **ambos** usuarios quedan en el store.
- (b) dos `POST /api/save` paralelos con el mismo `baseRevision` → exactamente uno termina en `REVISION_CONFLICT` y el `revision` final en disco es `baseRevision + 1`, no `+2`.
- (c) un superadmin guardando un proyecto modo `administered` **no** elimina el `draft_activo` del dueño (afirmar `fs.existsSync` del draft del dueño después del guardado).
- (d) tras 50 escrituras por `writeJsonAtomic`, no queda ningún `*.tmp` residual y el JSON es parseable.

---

## Criterio de aceptación

- [ ] Ninguna escritura de JSON del server usa `'.tmp.' + Date.now()` sin pid: `grep -rn "'.tmp.' + Date.now()" server src` → sin resultados.
- [ ] `buscarPorId`/`buscarPorUsername` no escriben (`grep -n "guardarUsuarios\|migrateApiKeys" server/auth.js` dentro de esas dos funciones → vacío).
- [ ] Los 4 tests nuevos en verde; `npm test` completo verde.
- [ ] Ningún `fs.rmSync(..., { recursive: true, force: true })` sobre `draft_activo` fuera del guard de `ownerFolder === userFolder(req.user)`.
- [ ] La respuesta de `/api/save` no cambió de forma (mismos campos; solo el número de `revision` es ahora autoritativo).
- [ ] `npx eslint src server tests` sin errores nuevos + review de solo lectura limpio.
- [ ] Smoke local: editar un proyecto con dos sesiones de navegador abiertas y ver que el segundo guardado no pisa ciegamente al primero.

**Mensaje de commit:** `B3: escrituras atomicas, revision autoritativa y proteccion del draft ajeno` — cuerpo: por qué **no** se puso mutex async (código síncrono + `instances: 1` + `authGuard.js:88`), qué es `reservarCuota`, y que el draft ahora se archiva en `proyectos/.archive/drafts/` en vez de borrarse.
