# B1 · Path traversal y autorización en logo y logs — **Crítico**

> **Antes de tocar nada:** leer [`00_CONTEXTO.md`](00_CONTEXTO.md) completo (§0.4 roles, §0.8 aislamiento de datos, §0.9 ramas, §0.10 correcciones 4 y 5). Rama `fix/fase-b1` desde `main`.

**Objetivo:** que ningún endpoint construya rutas de archivo con input sin validar, y que la propiedad de un proyecto se decida por rol real y no por username.

**Archivos:** `server/projectAccess.js` (357 l) y `server/index.js` (5432 l) — handlers `POST /api/logo/save` (L3656-3700), `POST /api/log` (L3702-3748), `GET /api/projects/:type/:id/logs` (L3750-3791), `DELETE /api/projects/:type/:id/logs` (L3793-3834).

---

## Qué está mal, verificado hoy

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | `projectType` del body entra crudo a `path.resolve('proyectos', projectType, safeName)` y además se hace `mkdirSync(recursive)` (L3666) → escribe y **crea** directorios fuera de `proyectos/`. Sin ninguna verificación de propiedad. | `index.js:3658` destructurea `projectType = 'negocios'`; L3664 construye el path; L3685-3688 escribe `config.brandKit.logoUrl` |
| 2 | `projectId` del body se interpola **sin sanitizar** en `` path.join(dirPath, `${projectId}_logs.json`) `` (L3727) y `projectType` tampoco se valida (L3720-3722). El bloque sí está condicionado por `if (projectId && projectType)` (L3715), lo que hace el vector **condicional pero alcanzable**: basta mandar ambos campos con `../` | `index.js:3703` destructurea sin validar; `fs.writeFileSync` en L3741 |
| 3 | `req.params.type`/`id` van directo a `path.resolve` (L3755/L3798); `filePath` se **inicializa en la raíz compartida** y solo se reemplaza si existe el archivo del usuario → cualquier autenticado puede **leer y borrar** (`fs.unlinkSync` L3826) logs ajenos. La rama de admin (L3763-3779 / L3806-3822) escanea **todas** las carpetas `user_*` y opera sobre la primera coincidencia | `index.js:3755,3757-3762` |
| 4 | Admin decidido por **username**: `const isTargetAdmin = reqUserId === 'admin' \|\| reqUserId === 'roberto'` (L3753, L3796). El rol `'admin'` no existe (`auth.js:40`) | — |
| 5 | `POST /api/log` toma identidad de `req.headers['x-user-id'] \|\| req.query.userId` (L3717). El header sí lo fija `authGuard.js:126` (confiable); el query es **código muerto verificado** (ningún llamador lo usa) | — |
| 6 | El `const userFolder` local (L3718, L3758, L3801) **ensombrece** el helper importado en L49 | `index.js:49` importa `userFolder` desde `projectAccess.js` |

**Utilidades que ya existen y hay que reutilizar** (todas en `server/projectAccess.js`, ya importadas en `index.js:49`): `SAFE_SEGMENT` (L31, `/^[a-z0-9][a-z0-9_-]{0,119}$/i` — bloquea `/`, `\`, `.`), `assertSafeProjectSegment(value, label)` (L39-44, **lanza** `Error('<label> inválido.')`), `userFolder(user)` (L51-55), `projectPaths(type, id)` (L64-71), `resolveReadableProject` (L80-182, devuelve `{path, owner, kind}` o `null`), `resolveWritableProject` (L191-211, `null` para rol `revisor`). **No inventes sanitización nueva.**

**No existe whitelist de tipos** — hoy son literales repetidos en `index.js:502,806,1004,1669`, `src/components/Layout.jsx:1405` y `scripts/archive_orphan_uuid_projects.js:20`. Y ojo: `assertSafeProjectSegment` / `resolveReadableProject` **no restringen** el nombre de carpeta, solo su sintaxis. Por eso hace el paso 1.

> **Fuera del alcance de esta fase, mismo patrón:** `GET /api/projects` (`index.js:1662-1665`) también acepta `req.query.userId` como identidad y usa `req.user?.username` antes que nada. No lo toques en B1 (no es path traversal, es selección de inquilino y su respuesta es un objeto con los dos tipos); anótalo como pendiente para una ronda de consistencia de identidad.

---

## Pasos

### 1 · Whitelist canónica en `server/projectAccess.js`

```
export const PROJECT_TYPES = Object.freeze(new Set(['negocios', 'social']))
export function assertSafeProjectType(type)  // lanza Error('tipo de proyecto inválido.')
```

Va en `projectAccess.js` porque ya es el módulo compartido por la capa de rutas y la de resolución, y ya está importado en `index.js:49` (no crea grafo nuevo). **Excluir `telemetry/` y `research/`:** son literales fijos del server (`research` en `index.js:4833`; telemetry en las rutas que lista §0.11), nunca input de usuario, y whitelistarlos solo amplía superficie. Carpeta `type` fuera de la lista → `400`.

### 2 · Mapeo de errores — las dos cosas, no una

`server/index.js` **no tiene** middleware `(err, req, res, next)` en ninguna parte, así que hoy un `throw` de `assertSafeProjectSegment` produce un 500 por defecto, no el 400 que pide la ficha.

- **(a) Validación inline** en los 4 handlers tocados, devolviendo `res.status(400).json({ error, code: 'INVALID_PROJECT_REF' })`. Determinista y testeable, y no toca las otras ~130 rutas.
- **(b) Un middleware terminal** añadido justo antes de `app.listen` que traduzca **solo** `err.message` con `/inválido\.$/` → 400 y `err.type === 'entity.too.large'` → 413, y haga `next(err)` para todo lo demás (Express 4 reproduce el 500 actual). Esto cubre los `throw` que se escapen y prepara el 413 de B2.

Consecuencia aceptada y anotada en el commit: el 413 pasa de HTML a JSON. Es inofensivo porque `deploy.sh:82` solo hace grep de `/api/health`.

> **Trampa que anula el punto (b) si no se cuida:** `POST /api/logo/save` tiene el cuerpo **entero** dentro de `try { … } catch { 500 }` (el `try` abre en L3657), y el bloque de escritura de `POST /api/log` está dentro de su propio `try { … } catch (err) { console.error }` (L3716-3744). Los helpers de `projectAccess.js` **lanzan**, así que si validas dentro de esos `try`, el `catch` se come el error y la respuesta es 500 (logo) o `{ok:true}` (log) — **nunca el 400** que piden los tests, y el middleware terminal tampoco lo llega a ver. Regla: **validar antes de entrar al `try` del handler** (o envolver solo la llamada al validator en un `try` propio que distinga el error de validación y responda 400 explícitamente).

### 3 · `POST /api/logo/save` (L3656-3700)

Validar tipo (`assertSafeProjectType`) y segmento (`assertSafeProjectSegment`), y derivar el directorio de **`resolveWritableProject(projectType, projectId, req.user)`** usando `path.dirname(result.path)` — no `path.resolve('proyectos', projectType, safeName)`. Quitar el `mkdirSync(…, { recursive: true })`. Gatear el payload con `^data:image\/(png|jpe?g|svg\+xml);base64,[A-Za-z0-9+/=]{1,3000000}$` y mantener **la respuesta idéntica**.

Si `resolveWritableProject` devuelve `null` → `403` con el mismo estilo de mensaje que `index.js:2028-2032`.

**Cambio de comportamiento a anotar en el commit:** el `logo.png` pasa de `proyectos/<tipo>/<id>/` a `proyectos/<tipo>/user_<x>/<id>/` — que es donde vive el JSON del plan (`/api/save` usa `userFolder`). Es una corrección, no una regresión: hoy la sincronización de `brandKit` en L3681-3693 **no opera** para la mayoría de proyectos porque apunta al path equivocado. La UI no se afecta: renderiza `config.brandKit.logoUrl` (el dataURL), nunca la ruta del archivo (verificado en §0.5.5). El llamador es `src/components/LogoGeneratorModal.jsx:140-148`.

> **Riesgo real de romper producción si usas `resolveWritableProject` sin red de seguridad.** `resolveWritableProject` (`projectAccess.js:191-211`) devuelve `null` para los kinds `example` y `shared`, y también cuando el proyecto no existe todavía en disco. Y el `projectId` que manda el cliente es efímero antes del primer guardado: nace como `''` (`PlanContext.jsx:63`), puede ser un id temporal tipo `proyecto_<timestamp>`, y solo se adopta del server después de guardar (`PlanContext.jsx:494` → `resData.projectId || resData.file`). Un 403 seco ahí rompe "Diseñar logotipo con IA" en proyectos de ejemplo y antes del primer guardado, que hoy funciona.
>
> Diseño correcto: **primario** `resolveWritableProject`; si devuelve `null`, **caer a la carpeta propia del usuario** (`userFolder(req.user)`) con el `projectId` pasado por `SAFE_SEGMENT` y un default de `draft_activo` — nunca escribir en una carpeta ajena y nunca `mkdirSync` fuera de `proyectos/<tipo>/user_<x>/`. 403 solo si no hay `req.user`. Verificar con el smoke del proyecto de ejemplo y con un logo guardado antes de guardar el proyecto por primera vez.

Si en cambio prefieres conservar `path.resolve('proyectos', projectType, safeName)`, entonces **hace falta igualmente** el guard de propiedad explícito (`owner` del JSON == `req.user.id`, o `superadmin`, o colaborador registrado en `config.collaborators`) — la elección es tuya, pero elige una y dilo en el commit.

### 4 · `POST /api/log` (L3702-3748)

**Los llamadores reales son `src/lib/ai.js:406` y `src/lib/ai.js:2210`.** El de L2210 manda `projectId: config?.projectId || ''` y **no manda `projectType`**; el de L406 sí manda ambos. Por eso el handler tiene el cortocircuito `if (projectId && projectType)` en **L3715**: cuando faltan, hoy no se persiste nada (el log va solo a consola y al SSE) y se responde `{ ok: true }`.

> **No perder ese cortocircuito.** Si validas antes de él, el log de la Semilla (que corre antes de que exista proyecto) pasa a devolver 400 y se rompe un flujo vivo. Orden correcto: mantener `if (projectId && projectType)` → y **dentro** del bloque validar `projectType` con `assertSafeProjectType` y `projectId` con `assertSafeProjectSegment(projectId, 'id de proyecto')` → malformed → `400`. Nota de compatibilidad: todo `projectId` que `/api/save` pueda guardar pasa el mismo validator, porque `index.js:1459` ya lo usa (UUIDs con guiones y slugs con underscore caben en `SAFE_SEGMENT`).

Además: **defensa en profundidad** — construir la ruta final y comprobar con `path.resolve` que queda dentro de `proyectos/` antes de cualquier `fs` call. Identidad solo desde `req.user` — quitar la lectura de `req.query.userId` (L3717). Renombrar el `const userFolder` local (L3718) a `folderUsuario` y usar el helper importado. El `mkdirSync(recursive)` de L3725 queda condicionado a la ruta ya validada.

### 5 · GET/DELETE `/api/projects/:type/:id/logs` (L3750-3834)

- Validar `type` con `assertSafeProjectType` e `id` con `assertSafeProjectSegment(id, 'id de proyecto')` → `400` si fallan.
- `const esSuperAdmin = req.user.role === 'superadmin'` (reemplaza L3753 y L3796 por completo; imita `index.js:1666`).
- **Eliminar la caída a la raíz compartida:** para no-superadmin, `let filePath = null` en vez de inicializarla al path raíz (L3755), asignar **solo** la ruta propia `proyectos/<type>/user_<x>/<id>_logs.json`, y **nunca** leer ni `unlinkSync` sobre la compartida.
- **Conservar los códigos de respuesta de hoy** (§0.11: no cambiar contratos). Verificado: GET responde `res.json([])` con **200** cuando el archivo no existe (L3788-3790), y `500` solo si el JSON está corrupto (L3786). **No meter un 404 nuevo**: la separación de inquilinos se demuestra con una respuesta **vacía**, no con un status distinto — cambiar el status rompería a `ActivityFeed.jsx:146-152`, que hoy decide en función de `res.ok`. Para un proyecto ajeno, simplemente no se asigna `filePath` → el camino existente de `200 []`.
- DELETE: misma lógica (actuar solo sobre la ruta propia; si no existe, responder como responde hoy).
- Para el superadmin, conservar el barrido de carpetas `user_*` (L3763-3779 / L3806-3822) pero **solo** después de validar segmentos, y limitándolo a rutas que queden dentro de `proyectos/<type>/`.

### 6 · Tests nuevos — `tests/projectLogsAccess.test.js`

Servidor en cwd temporal (§0.8, patrón de `tests/authPersistence.test.js:9-14`), con dos usuarios y un proyecto de cada uno.

**Cómo crear usuarios que pasen `authGuard`** (esto cuesta tiempo si no se sabe): `registrarUsuario` deja el usuario en `status: 'pending'` (`auth.js:242`) y `authGuard.js:100` responde **403** a cuentas no activas; y el superadmin de arranque nace en `pending_bootstrap` si no defines `BOOTSTRAP_SUPERADMIN_PASSWORD` (`auth.js:84-93`). Para los requests autenticados: arranca el server del test con `BOOTSTRAP_SUPERADMIN_PASSWORD` en el env, y para los usuarios normales usa `crearUsuarioAdmin` o `activarUsuario` después de registrar.

Casos:

- `POST /api/logo/save` con `projectType: "../server/data"` → **400**, y ningún archivo creado fuera de `proyectos/`.
- `POST /api/log` con `projectId: "../../evil"` y `projectType: "negocios"` → **400**.
- `POST /api/log` con `projectId: ''` y **sin** `projectType` (el flujo real de la Semilla, `src/lib/ai.js:2210`) → **200 `{ok:true}`** y sin archivo escrito. Este test existe para que nadie "arregle" la validación rompiendo el log de IA.
- `GET /api/projects/negocios/..%2F..%2Fetc/logs` → **400** (o el equivalente con `id` de dos puntos, según cómo Express decodifique `req.params`: verifica el valor real que llega, no asumas).
- Usuario A leyendo los logs de un proyecto de B → **200 con `[]`** (no 404: se conserva el contrato), y **el archivo de B sigue existiendo** con su contenido intacto.
- Usuario A borrando los logs de un proyecto de B → la respuesta es la que da hoy, y el archivo de B **sigue existiendo** (assert de `fs.existsSync` después).
- Usuario A con su propio proyecto y sus propios logs → devuelve el arreglo con sus entradas.
- Proyecto que solo existe en la raíz compartida → `[]` para usuario normal, contenido real para superadmin.
- Logo guardado por un usuario normal en un proyecto **de ejemplo** y en un proyecto **aún no guardado** → sin 403 (el fallback del paso 3).

---

## Criterio de aceptación

- [ ] Ninguno de los 4 handlers interpola `req.params`/`req.body` en `path.resolve`/`path.join` sin pasar por un validador. Revisar con: `grep -n "path.resolve('proyectos'" server/index.js` y confirmar que cada uso cerca de estos handlers sale de un resolver validado.
- [ ] Los tests de arriba en verde; `npm test` completo verde con el número real reportado.
- [ ] El chequeo de admin usa `role === 'superadmin'`; no queda ninguna comparación literal con `'roberto'` ni `'admin'` en estos handlers: `grep -n "=== 'roberto'\|=== 'admin'" server/index.js`.
- [ ] No hay fallback a logs de raíz compartida para no-superadmins.
- [ ] **Los códigos y formas de respuesta no cambiaron** para un usuario legítimo: GET de logs sigue devolviendo `200 []` cuando no hay archivo, `/api/log` sigue devolviendo `{ok:true}`, `/api/logo/save` sigue devolviendo `{success, file, message}`.
- [ ] `npx eslint src server tests` sin errores nuevos.
- [ ] Smoke local: guardar logo desde el modal y leer/borrar los logs del proyecto propio en el navegador. **Y** correr una generación de IA desde la Semilla sin proyecto guardado: el log en consola del server debe seguir apareciendo (el flujo `projectId: ''` sigue respondiendo `{ok:true}`, paso 4).
- [ ] Review de solo lectura del diff limpio.

**Mensaje de commit:** `B1: whitelist de tipos, segmentos validados y propiedad por rol en logo/logs` — cuerpo: vector real por handler, el cambio de ubicación de `logo.png` (§0.5.5), y que el `?userId=` era código muerto.
