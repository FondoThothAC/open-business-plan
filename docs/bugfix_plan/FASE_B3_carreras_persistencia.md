# FASE B3 — Carreras y persistencia atómica (Alto)

> Goal autocontenido. Proyecto: OBP. Antes de empezar: rama `fix/fase-b3` y `npm test` en verde.

## Objetivo
Eliminar las condiciones de carrera read-modify-write sobre los almacenes JSON y el borrado no intencional de borradores ajenos.

## Bugs a corregir (auditoría 12-oct-2026)

**1. Store de usuarios sin lock** — `server/auth.js` ~77-135 (`cargarUsuarios`/`guardarUsuarios`) y todas las operaciones que las llaman (`registrarUsuario` ~229, `actualizarUsuarioAdmin` ~428, `cambiarPassword` ~650, `loginUsuario` ~299). Cada una lee el archivo completo, muta y reescribe: dos requests concurrentes hacen "last write wins" y se pierden usuarios/cambios. Además el temp file `USERS_FILE + '.tmp.' + Date.now()` colisiona si dos writes caen en el mismo milisegundo.

**2. Revisión de `/api/save` TOCTOU** — `server/index.js` ~1509-1546: la revisión se lee de disco y se escribe `revision + 1` en el mismo handler sin lock; dos guards concurrentes con el mismo `baseRevision` pasan ambos el chequeo y el segundo sobrescribe al primero (`REVISION_CONFLICT` no protege).

**3. Borrado de borrador ajeno** — `server/index.js` ~1487-1496: al guardar con nombre nuevo se hace `fs.rmSync(recursive, force)` de `proyectos/<type>/<ownerFolder>/draft_activo`; en casos `administered`/`collaborator` (~1468-1475) `ownerFolder` puede ser la carpeta de OTRO usuario y se destruye su borrador activo con carpeta `documentos/`.

**4. Cuotas no atómicas** — `server/quotaTracker.js` ~99-117 (`incrementSearchQuota`): check-then-write permite sobrepasar la cuota bajo concurrencia. Mismo patrón en `tokens_usage.json` (`server/index.js` ~4652-4716).

## Instrucciones
1. **Mutex por archivo:** implementar una cola de exclusión simple en memoria (una `Promise` encadenada por ruta de archivo — patrón single-flight) y envolver TODAS las secuencias cargar→mutar→guardar de `auth.js`, `quotaTracker.js` y `tokens_usage.json`. El temp file pasa a incluir pid + contador monótono (no solo `Date.now()`). Escritura con `fs.renameSync` sobre el temp (ya existe el patrón) dentro del mutex.
2. **Revisión en `/api/save`:** hacer el chequeo de revisión y el incremento DENTRO del mismo mutex/lock del archivo de proyecto (mismo single-flight por `safeName`), re-verificando la revisión justo antes de escribir.
3. **Draft ajeno:** antes del `rmSync`, comparar el dueño del draft (`ownerFolder` vs dueño efectivo del request): si el guardador no es el dueño de esa carpeta (modo administered/collaborator), NO borrar el draft del dueño — solo omitir el borrado o borrar el propio del guardador. No usar `force: true` a ciegas.
4. Tests de regresión: (a) dos `registrarUsuario` en paralelo → ambos usuarios persisten; (b) dos `/api/save` paralelos con el mismo `baseRevision` → exactamente uno termina con `REVISION_CONFLICT`; (c) guardar sobre proyecto administered no elimina el `draft_activo` del dueño original.

## Criterio de aceptación (goal completado cuando…)
- [ ] Ninguna secuencia cargar→mutar→guardar de usuarios/cuotas/tokens queda fuera del mutex (grep de llamadas directas a `guardarUsuarios`/escrituras de quota fuera de la cola).
- [ ] Los 3 tests de regresión de concurrencia en verde.
- [ ] El borrado de draft activo solo ocurre cuando el guardador es el dueño de la carpeta.
- [ ] `npm test` completo en verde y `/ultra-review` sin hallazgos críticos.
