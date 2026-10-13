---
name: obp-hardening
description: Corrige los bugs de seguridad y lógica encontrados en la auditoría del 12-oct-2026 del proyecto OBP (Open Business Plan) — path traversal en server/index.js, API key embebida, endpoints públicos que gastan cuota, carreras read-modify-write en auth.js, crashes del módulo financiero, bug de TIR (bisection), doble conteo en histograma Monte Carlo y SSRF en scraper. Úsala cuando se pida corregir bugs, hacer hardening o auditar OBP. Incluye reglas de seguridad, patrón de referencia y criterios de aceptación.
---

# Skill OBP Hardening — corrección de bugs por fases

## Reglas de cada fase
1. Rama `fix/fase-b<N>` antes de empezar; un commit por fase.
2. `npm test` en verde antes (baseline: 381 tests) y después de cada fase.
3. `npx eslint src server` sin errores nuevos; cerrar cada fase con `/ultra-review` antes del commit.
4. No cambiar contratos de API pública salvo indicación expresa de la fase.
5. Los números de línea vienen de la auditoría 12-oct-2026: localizar código por ruta/nombre de función, no por línea.
6. Patrones de referencia ya existentes: `assertSafeProjectSegment` y `resolveReadableProject` en `/api/save` para validación de rutas y propiedad.

## Fases (en orden, una goal por fase; detalle completo en docs/bugfix_plan/)

### B1 — Path traversal (Crítico): `/api/logo/save`, `POST /api/log`, `GET/DELETE /api/projects/:type/:id/logs` en server/index.js. Whitelist de projectType + assertSafeProjectSegment en ids + propiedad por dueño/rol (NO username) + eliminar fallback a logs raíz. Tests: `../` → 400, proyecto ajeno → 404.

### B2 — Credenciales (Crítico): key DENUE literal en `resolveInegiToken` (server/index.js ~118) → solo `process.env` (rotar la expuesta); `/api/ai/account-chat` + swarm interview/industrialize fuera de la lista pública de authGuard.js, fallback `OLLAMA_KEY` solo autenticados; `express.json` 100mb → 1mb global + límites por ruta para payloads grandes (logo/proyectos).

### B3 — Carreras (Alto): mutex single-flight (Promise encadenada por archivo) alrededor de cargar→mutar→guardar en auth.js, quotaTracker.js, tokens_usage.json; revisión de `/api/save` verificada dentro del lock; NO borrar `draft_activo` de carpeta de otro dueño (administered/collaborator); temp file con pid+contador. Tests: registros paralelos persisten; saves paralelos → uno REVISION_CONFLICT.

### B4 — Frontend (Alto): listener `message` de ModuloFinanciero con try/catch + validación de tipos + `event.origin`; división por cero → solo persistir si `isFinite`; Layout.jsx comprobar `res.ok` y `Array.isArray` antes de setSavedProjects; ReviewPage try/catch con error visible + guard de fecha; stale closures de `runCalculations` → useCallback con deps reales.

### B5 — Lógica financiera (Medio): `calculateIRR` — actualizar NPV del extremo que se mueve en el bisection (+test [-100,60,60] ≈ 13.1%); histograma montecarlo — último bin inclusivo sin doble conteo (+test suma === iteraciones); simulador con debounce/useDeferredValue; typewriter de ModuleWrapper con cleanup en ref; input vacío ≠ 0 persistido; resolver los 4 `no-useless-assignment` de ESLint POR SEMÁNTICA (decidir si el valor debía usarse, no solo borrar).

### B6 — SSRF + cierre (Medio): scraper.js — launch dentro de try, close con guard en finally; validador de URL antes de page.goto (solo http/https, bloquear IPs privadas/localhost/file://); rate limiter DDG asignando timestamp ANTES del await; verificación integral final: suite completo + eslint 0 errores + ultra-review del diff completo + smoke manual (login, guardar proyecto/logo, módulo financiero, Monte Carlo).

## Entregable final
Tabla bug → fase → commit + suite verde + smoke manual sin errores de consola.
