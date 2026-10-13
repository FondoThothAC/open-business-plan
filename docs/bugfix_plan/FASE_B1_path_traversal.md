# FASE B1 — Path traversal y autorización en logo y logs (Crítico)

> Goal autocontenido. Proyecto: OBP (`/Users/robertoeduardocelisrobles/Documents/Proyectos/OBP`). Antes de empezar: rama `fix/fase-b1` y `npm test` en verde.

## Objetivo
Eliminar los 3 path traversals y los fallos de autorización en los endpoints de logo y logs de `server/index.js`.

## Bugs a corregir (de la auditoría 12-oct-2026)

**1. `POST /api/logo/save` (~línea 3656-3693).** `projectType` llega del body sin whitelist y se usa en `path.resolve('proyectos', projectType, safeName)`: con `"../../server/data"` se escribe fuera de `proyectos/`. Además no verifica propiedad del proyecto (cualquier usuario autenticado sobrescribe el logo y `config.brandKit.logoUrl` de proyectos ajenos).

**2. `POST /api/log` (~línea 3715-3727).** `projectId` del body se interpola sin sanitizar en `path.join(dirPath, `${projectId}_logs.json`)` y `projectType` tampoco se valida: escritura de JSON fuera de `proyectos/`.

**3. `GET/DELETE /api/projects/:type/:id/logs` (~línea 3750-3834).** `type` e `id` de `req.params` van directo a `path.resolve` sin validación: lectura y **borrado** (`fs.unlinkSync`) de archivos arbitrarios. Además: si el archivo específico del usuario no existe, el código cae al path compartido raíz y lo lee/borra (cualquier usuario autenticado accede a logs de proyectos ajenos), y el admin se decide por `reqUserId === 'roberto'` (nombre, no rol).

## Patrón de referencia (ya existe en el repo)
`/api/save` usa `assertSafeProjectSegment(...)` y `resolveReadableProject(...)` para validar segmentos de ruta y propiedad. Reutilizar esas funciones — no inventar sanitización nueva.

## Instrucciones
1. Localizar los tres handlers por ruta (`/api/logo/save`, `/api/log`, `/api/projects/:type/:id/logs`).
2. Validar `projectType`/`type` contra una whitelist de tipos válidos (extraer la lista de las que `/api/save` acepta). Ante valor fuera de lista → `400`.
3. Pasar `projectId`/`id` por `assertSafeProjectSegment` (o equivalente): si contiene `/`, `..`, `\` o segmentos vacíos → `400`. Construir la ruta final y verificar con `path.resolve` que queda dentro de `proyectos/` antes de cualquier `fs` call (defensa en profundidad).
4. Verificar propiedad: solo el dueño del proyecto, un admin real (campo `role === 'admin'` del usuario, no comparación de username) o colaborador registrado puede escribir/leer/borrar. Reemplazar el chequeo `reqUserId === 'roberto'` por rol.
5. Eliminar el fallback al path raíz compartido en GET/DELETE de logs: si el archivo del usuario no existe → `404`, sin caer al compartido.
6. Agregar tests de regresión en `tests/` (patrón de los existentes): petición con `projectType: "../server/data"` → 400; usuario no dueño leyendo logs ajenos → 404; `id` con `../` → 400.

## Criterio de aceptación (goal completado cuando…)
- [ ] Ninguno de los 3 endpoints construye rutas de archivo con input sin validar (grep: ninguna interpolación directa de `req.params`/`req.body` en `path.resolve`/`path.join` de estos handlers).
- [ ] Tests de regresión en verde cubriendo traversal (`../`), tipo inválido y acceso ajeno.
- [ ] El chequeo de admin usa rol, no username.
- [ ] No hay fallback a logs raíz para no-admins.
- [ ] `npm test` completo en verde y `/ultra-review` sin hallazgos críticos en los cambios.
