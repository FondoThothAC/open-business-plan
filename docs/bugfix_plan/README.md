# Plan OBP Bugfix — índice

Corrección de los bugs encontrados en la auditoría del **12-oct-2026** sobre `server/` y `src/` de Open Business Plan.

## Ruta de ejecución: `RUN/`

La auditoría se verificó contra el código real el 12-oct-2026 (HEAD `de9db87`): **ningún fix está aplicado**. De esa verificación salieron correcciones factuales y exposición extra que las fichas `FASE_*.md` no traían, así que la ejecución sigue los briefs de `RUN/`, que ya incorporan lo verificado.

**Se ejecuta una fase por sesión** (rama + commit + merge local por fase), no todo en un solo chat. Razones y topología en `RUN/00_CONTEXTO.md` §0.9.

| # | Brief | Severidad | Área | Estado |
|---|---|---|---|---|
| 1 | [`RUN/B1_PATH_TRAVERSAL.md`](RUN/B1_PATH_TRAVERSAL.md) | Crítico | `projectAccess.js` + logo/logs en `index.js` | ✅ `680ef4e` |
| 2 | [`RUN/B2_CREDENCIALES_ENDPOINTS.md`](RUN/B2_CREDENCIALES_ENDPOINTS.md) | Crítico | credencial INEGI, `authGuard.js`, límites de body | ✅ `4fef73f` |
| 3 | [`RUN/B3_CARRERAS_PERSISTENCIA.md`](RUN/B3_CARRERAS_PERSISTENCIA.md) | Alto | `auth.js`, `/api/save`, cuotas, `draft_activo` | ✅ `e87169e` |
| 4 | [`RUN/B4_FRONTEND_ROBUSTEZ.md`](RUN/B4_FRONTEND_ROBUSTEZ.md) | Alto | `ModuloFinanciero`, `Layout`, `ReviewPage` | ✅ `639d539` |
| 5 | [`RUN/B5_LOGICA_FINANCIERA.md`](RUN/B5_LOGICA_FINANCIERA.md) | Medio | TIR, histograma Monte Carlo, inputs | ✅ `1e3c5e6` |
| 6 | [`RUN/B6_SSRF_CIERRE.md`](RUN/B6_SSRF_CIERRE.md) | Medio | `scraper.js`, limiter DDG + **verificación integral** | ✅ `2659d75` + `f996e86` |

**[`RUN/00_CONTEXTO.md`](RUN/00_CONTEXTO.md) es lectura obligatoria antes de cualquier fase.** Contiene: entorno y comandos, modelo de auth y roles reales, los 6 hechos de deploy que sostienen el "no romper producción", dónde está realmente la credencial, política de secretos, el paso B0 de aislamiento de `server/data` (porque `npm test` escribe datos reales), la topología de ramas, las 8 correcciones a las fichas, qué no se toca en ninguna fase y los pendientes que son del dueño.

Cada brief es autocontenido a propósito: repite en línea sus anclas verificadas, deja la decisión tomada con su porqué (para que la sesión no la re-liigite), y termina con criterio de aceptación y mensaje de commit.

## Las correcciones a las fichas `FASE_*.md`

Detalladas en `RUN/00_CONTEXTO.md` §0.10. Resumen:

1. **B3**: no se pone mutex de promesas — el código es síncrono y PM2 corre con `instances: 1`; asyncronizar tocaría las 134 rutas vía `authGuard.js:88`. Se logra la misma garantía con escrituras atómicas, invariantes y reserva de cuota.
2. **B3**: no se obliga `baseRevision` siempre — rompería el autoguardado con un bucle de 409.
3. **B6**: el timestamp del limiter **sí** se asigna antes del `await`; el defecto real es la concurrencia.
4. **B1**: `req.query.userId` es código muerto, y `projectId` en `/api/logo/save` **sí** está sanitizado hoy; el vector ahí es solo `projectType`.
5. **B1 nuevo**: el handler de logs tiene un cortocircuito `if (projectId && projectType)` (L3715) que sostiene el flujo de la Semilla — hay que conservarlo o se rompe el log de IA.
6. **B5**: los 4 `no-useless-assignment` son higiene, no bugs ocultos.
7. **B2 es más grande**: 6 sitios con la credencial (no 1), `aiConfig.endpoint` controlado por el request en swarm, y `GET /api/swarm/stream/:sessionId` pública con CORS `*` por el `startsWith` del matcher.
8. **El baseline de lint ya está roto** (`npm run lint` → exit 1); se repara en B5. Y `/ultra-review` no existe en este entorno → subagente de review de solo lectura.

## Estado de ejecución (12-oct-2026)

Las seis fases se ejecutaron, cada una en su rama `fix/fase-b<N>` con su commit y su merge
local a `main`. **Sin push y sin deploy**: eso sigue siendo decisión del dueño. Suite final
420/420 (baseline 402), ESLint 0 errores, `vite build` OK. Una revisión de código de solo
lectura sobre el diff completo encontró 2 bloqueadores en el propio B6 ya implementado y 8
ajustes; se corrigieron en `f996e86` y están documentados en `RUN/00_CONTEXTO.md` §0.16.

## Registro de la auditoría

`FASE_B1…B6.md` se conservan sin cambios como registro de lo que se encontró el 12-oct-2026. Si un brief y una ficha discrepan, **gana el brief** (fue el que se verificó contra el código).

## Skill empaquetada — desactualizada

`OBP-HARDENING-skill.zip` y `skill/obp-hardening/SKILL.md` son la versión de una página del plan, y repiten dos cosas que la verificación refutó: el mutex de promesas de B3 y el `/ultra-review`. Si se va a invocar la skill para ejecutar, **hay que regenerarla contra `RUN/`** primero; no la uses como fuente de verdad tal como está. (No la modifiqué porque quedó fuera del alcance autorizado.)

## Reglas que siguen vigentes de la ficha original

Rama por fase y un commit por fase · no cambiar contratos de API salvo indicación expresa · localizar código por ruta o nombre de función, no por número de línea · ante una decisión de producto sin resolver, elegir el valor conservador y anotarlo en el commit.

**Push, deploy y rotación de la credencial INEGI las ejecuta el dueño** (`RUN/00_CONTEXTO.md` §0.14).
