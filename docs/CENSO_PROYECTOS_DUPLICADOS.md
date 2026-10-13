# Censo de proyectos ambiguos/duplicados — 13-oct-2026

**Solo lectura. No se movió, renombró ni borró ningún archivo.** Generado antes de tocar
`/api/save` para que la decisión sobre el pasado la tomes tú con datos delante.

Origen: `proyectos/negocios/` y `proyectos/social/`, excluyendo `.archive/` y `.versions/`.
20 planes JSON leídos, **0 ilegibles**, **0 con `config.projectId` distinto al nombre de su
carpeta** (es decir: la ambigüedad no es que un archivo mienta sobre su id — es que
*varias* carpetas distintas contienen legítimamente el mismo negocio).

## 1. Cuatro negocios, once carpetas

### Ferretería y Suministros Kino — 4 carpetas, 3 identificadores

| Carpeta | `config.projectId` | `userOwner` | mtime |
|---|---|---|---|
| `negocios/ferreter_a_y_suministros_kino` | *(ausente)* | *(ausente)* | 2026-08-18 |
| `negocios/ferreteria_kino` | `ferreteria_kino` | *(ausente)* | 2026-08-18 |
| `negocios/user_edgarpzcz/ferreteria_y_suministros_kino` | `ferreteria_y_suministros_kino` | edgarpzcz | 2026-09-24 |
| `negocios/user_viktoracuna/ferreteria_y_suministros_kino` | `ferreteria_y_suministros_kino` | viktoracuna | 2026-09-23 |

`ferreter_a_...` es la grafía mutilada por el segundo slugificador; `ferreteria_kino` fue
nombrado a mano y su `projectId` no coincide con el slug de su propio
`companyName`. Las dos últimas son el mismo id en dos inquilinos distintos.

### Closets y Cocinas Corona — 4 carpetas, **ninguna** con `projectId`, las cuatro con `userOwner: viktoracuna`

| Carpeta | nota |
|---|---|
| `negocios/closets_y_cocinas_corona` | raíz |
| `negocios/user_viktoracuna/closets_y_cocinas_corona` | dueña declarada |
| `negocios/user_karely_otero/closets_y_cocinas_corona` | en carpeta de otra persona, pero el JSON dice que es de viktoracuna |
| `negocios/user_galiet_gastelum/closets_y_cocinas_corona` | ídem |

Como `GET /api/projects` decide el panel por `config.userOwner` (del JSON) y **no** por la
carpeta, estas cuatro apariciones caen en el panel de viktoracuna: el mismo negocio cuatro
veces para una misma usuaria, y las copas ajenas se le muestran como propias.

### Pizzería Siglo 21 — 2 carpetas, mismo `projectId`, misma dueña
`negocios/pizzeria_siglo_21` (raíz) y `negocios/user_yocine/pizzeria_siglo_21`.

### Brújula Financiera MX — 2 grafías que se cruzan
`negocios/brujula/` y `negocios/br_jula_financiera_mx/` — cada una lleva en su JSON el
`companyName` de la otra, así que ninguna es "la copia evidente".

## 2. Por qué pasa (mecanismo, no sospecha)

Tres funciones derivan el identificador del nombre comercial, con tres resultados
distintos para una misma cadena:

| Función | `Ferretería y Suministros Kino` produce |
|---|---|
| `src/config/urlRouting.js:10` `slugify()` — y **así se asigna `config.projectId` al crear** (`PlanContext.jsx:815`) | `ferreteria-y-suministros-kino` |
| `server/index.js:1442` `slugifyFileName()` — manda en `/api/save` | `ferreteria_y_suministros_kino` |
| `src/lib/serverUtils/projectRename.js:90-91` (y `index.js:2203` en el clon) | `ferreter_a_y_suministros_kino` |

Y `/api/save:1464-1474` **recalcula el id a partir del nombre en cada guardado**: cambiar
el nombre comercial en la Configuración crea una carpeta nueva y abandona la anterior, sin
borrarla, sin fusionarla y sin avisar.

## 3. Lo que ya existe y NO lo previene

- `REVISION_CONFLICT` (`index.js:1551`): compara revisiones **dentro de una** carpeta; ciego ante una hermana.
- `MODULE_COUNT_REGRESSION` (`saveVersioning.js:99-106`): volumen de módulos por carpeta, no identidad.
- `assertSafeProjectSegment` / `PROJECT_TYPES` (B1): traversal y tipos de carpeta, no duplicidad.
- `PROJECT_ALREADY_EXISTS`: solo en el endpoint de renombrado explícito.
- Candado de generación (`index.js:1999`): indexado por id, así que ids duplicados obtienen candados independientes.
- `scripts/archive_orphan_uuid_projects.js`: solo mira carpetas con nombre UUID, ignora duplicados por nombre; corre en `deploy_vps.sh:170` con `2>/dev/null || true`, o sea que sus fallos se tragan.
- `tests/ghostProjectsAndDeletion.test.js:24-53`: re-implementa la lógica del listado en vez de ejercitar la ruta, así que no detecta esto.

## 4. Archivos sueltos ya archivados (referencia histórica)

`negocios/.archive/ghost_backups/` = **110 archivos** (55 `.json` + 55 `.md`) con nombre
`proyecto_<epoca-ms>`, residuo de un esquema de id que **ningún código actual escribe**. Barrido
manualmente en el commit `df53f33` (2026-09-06), documentado en `SDD_MASTER.md §3.7`.
Además `proyectos/.archive/uuid_orphans` guarda 21 entradas movidas por el script anterior.
Un archivo suelto de logs vive fuera de cualquier proyecto: `negocios/user_viktoracuna/ferreteria_kino_logs.json`.

## 5. Decisión pendiente (tuya)

El arreglo de código (id canónico único + inmutable) evita **nuevos** duplicados pero no
decide cuál de las copias existentes es la buena. Sugerencia por grupo, sin ejecutarla:

- **Kino** → conservar `user_viktoracuna/ferreteria_y_suministros_kino` (la más reciente con id propio) o `user_edgarpzcz/...` si el autor real es Edgarp; las dos de raíz son del esquema viejo sin `userOwner`.
- **Corona** → conservar `user_viktoracuna/...` y retirar las otras tres tras confirmar que no tienen trabajo distinto dentro (revisar `revision`/`fechaActualización` módulo por módulo, no el mtime).
- **Pizzería** → conservar la del tenant `user_yocine`; la de raíz queda invisible para la propia dueña pero visible para el admin.
- **Brújula** → decidir por contenido: los dos JSON tienen el `companyName` del otro, así que ninguno es canónico por metadatos.

Antes de consolidar: respaldo de `proyectos/` y mover a `.archive/` en vez de borrar, como ya se hizo con `ghost_backups`.
