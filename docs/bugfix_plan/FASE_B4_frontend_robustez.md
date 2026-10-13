# FASE B4 — Robustez del frontend (Alto)

> Goal autocontenido. Proyecto: OBP. Antes de empezar: rama `fix/fase-b4` y `npm test` en verde (los tests de frontend corren dentro del mismo suite).

## Objetivo
Eliminar los crashes y estados corruptos del frontend detectados en la auditoría.

## Bugs a corregir (auditoría 12-oct-2026)

**1. Crash en listener de `message`** — `src/components/ModuloFinanciero.jsx` ~361-364: el handler accede `payload.tir * 100`, `payload.benefitCostRatio.toFixed(2)`, `payload.payback.toFixed(1)` sin validar tipos/existencia. Un mensaje `SIMULATOR_EXPORT` incompleto tira `TypeError` y tumba el módulo. Tampoco valida `event.origin`.

**2. División por cero persistida** — `ModuloFinanciero.jsx` ~370: `payload.programInvestment / payload.totalInvestment * 100` con `totalInvestment === 0` produce `Infinity%` y se guarda en el plan vía `updateSection('organizacion', 'inversion', 'financiamiento', ...)`.

**3. `res.json()` sin `res.ok`** — `src/components/Layout.jsx` ~338-347: un 401/500 con body JSON `{error}` se asigna a `savedProjects` (no se comprueba `res.ok` ni `Array.isArray`).

**4. POST sin manejo de errores** — `src/components/ReviewPage.jsx` ~13: `fetch` sin try/catch → unhandled rejection, el botón "Enviar comentario" parece no hacer nada; `new Date(state.expiresAt).toLocaleDateString()` muestra "Invalid Date" con campo vacío.

**5. Stale closures que persisten cálculos viejos** — `ModuloFinanciero.jsx` ~355-385: `runCalculations` captura `financeData`/`planData` del render; los efectos con deps `[moduleKey, activeCorridaRaw]`/`[activeCorrida]` disparan cálculos con datos viejos y los persisten.

## Instrucciones
1. **Listener `message`:** envolver el handler en try/catch; validar `typeof payload.tir === 'number'`, etc. antes de usar; validar `event.origin` contra `window.location.origin` (el simulador es same-origin). Datos faltantes → ignorar el mensaje silenciosamente (o log de warning), nunca crash.
2. **División por cero:** guardar el porcentaje solo si `Number.isFinite(resultado)`; si no, omitir la persistencia de ese campo.
3. **Layout.jsx:** comprobar `res.ok` antes de `res.json()`; validar `Array.isArray(data)` antes del `setState`; en error → dejar `savedProjects` como estaba (o vacío) y mostrar el estado de error existente si hay.
4. **ReviewPage:** try/catch alrededor de los fetch con estado de error visible (mensaje en UI); render de fecha con guard (`expiresAt ? new Date(...) : null`).
5. **Stale closures:** refactor mínimo — mover `runCalculations` a `useCallback` con sus dependencias reales, y que los efectos dependan de esa callback (o usar un ref de últimos datos). Objetivo: que no se persistan proyecciones calculadas con parámetros anteriores. Mantener el cambio quirúrgico; no reescribir el componente.
6. Verificación manual además de tests: abrir el módulo financiero, enviar un `postMessage` incompleto desde la consola (`window.postMessage({type:'SIMULATOR_EXPORT'}, location.origin)`) y confirmar que no crashea.

## Criterio de aceptación (goal completado cuando…)
- [ ] postMessage incompleto no produce excepción (verificado en consola del navegador).
- [ ] No existe ninguna división sin guard `isFinite` antes de `updateSection` en ese handler.
- [ ] `savedProjects` nunca recibe un objeto de error; ReviewPage muestra error de red en UI.
- [ ] `npm test` en verde, `npx eslint src` sin errores/warnings nuevos, `/ultra-review` limpio.
