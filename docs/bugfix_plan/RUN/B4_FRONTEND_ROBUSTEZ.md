# B4 · Robustez del frontend — **Alto**

> **Antes de tocar nada:** leer [`00_CONTEXTO.md`](00_CONTEXTO.md) (§0.3 sin jsdom, §0.8 aislamiento, §0.9 ramas). Rama `fix/fase-b4` desde `main` (con B1–B3 mergeados).

**Objetivo:** que ni un `postMessage` incompleto ni un error de red tumben o ensucien el plan del usuario.

**Archivos:** `src/components/ModuloFinanciero.jsx` (602 l), `src/components/Layout.jsx` (2030 l), `src/components/ReviewPage.jsx` (15 l), `src/context/PlanContext.jsx` (referencia, quizá 1 guard).

---

## 0. Por qué esto importa más de lo que parece

`updateSection(pillar, module, field, value)` (`src/context/PlanContext.jsx:659`) **solo** hace `setPlanData`. La durabilidad llega en un `useEffect` keyed en `planData` (L424-478) que con debounce de 1500 ms escribe IndexedDB + `localStorage.openplan_v2_data` + `POST /api/save`.

Consecuencia: cuando el handler arma un string con `Infinity`, `NaN` o texto incompleto, **no hay excepción** — el valor corrupto ya es string, se serializa bien y queda guardado en el plan del usuario en el VPS. El modo de falla es dato sucio persistido, no crash. Tenlo presente al estimar la severidad.

## Qué está mal, verificado hoy

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | El handler `message` usa `payload.tir * 100`, `payload.benefitCostRatio.toFixed(2)` y `payload.payback.toFixed(1)` sin validar tipos; sin `try/catch`; **no** valida `event.origin`. Un `SIMULATOR_EXPORT` incompleto lanza `TypeError` fuera del listener | `ModuloFinanciero.jsx:360-385`, la aritmética en L364; el `if` solo mira `event.data.type` (L362). El `try/catch` interno de L350-352 protege `runCalculations`, **no** a L364-376 |
| 2 | `(payload.programInvestment / payload.totalInvestment * 100).toFixed(1)` con `totalInvestment` 0 o ausente → `"Infinity"` / `"NaN"` en el texto que se persiste con `updateSection('organizacion','inversion','financiamiento',…)` | L369-372; el `if` solo comprueba que las dos primeras existan |
| 3 | `fetchProjects` llama `res.json()` sin comprobar `res.ok`; tiene `.catch` (L344) pero solo `console.error` → un 401/500 se traga en silencio. **Ojo:** la respuesta de `GET /api/projects` es un **objeto** `{ negocios: [], social: [] }` (`index.js:1662`) y L339 **ya** guarda con `typeof data === 'object'`; el consumo real es `savedProjects.negocios` (`Layout.jsx:277,288,1040`). El único hueco es el `res.ok`, **no** la forma del dato | `Layout.jsx:333-347` (json en L338). En el mismo archivo `checkAi` (L321) y `openIndustrializeConfig` (L358) **sí** comprueban `res.ok` |
| 4 | El fetch de clonado también hace `res.json()` sin `res.ok` (aunque se protege por `data.success` y try/catch) | `Layout.jsx:1456-1460` |
| 5 | `ReviewPage.jsx`: la carga (L8-10) ya tiene `.catch` con estado de error; el **`submit` (L13)** es un `await fetch` sin `try/catch` y su re-fetch hace `.then(x => x.json())` sin `x.ok`; `new Date(state.expiresAt).toLocaleDateString()` (L14) muestra "Invalid Date" con el campo vacío | Verificado: sí es el archivo de 15 líneas, no hay otro ReviewPage |
| 6 | `runCalculations` es función de render scope que lee `financeData`/`planData` del closure (L346) y persiste vía `persistProjection` (L308-340); los efectos no declaran esas dependencias → se calcula y **se persiste** con parámetros viejos | efectos en L355-357 (deps `[moduleKey, activeCorridaRaw]`) y L360-385 (deps `[activeCorrida]`) |

---

## Pasos

### 1 · Listener `message` (`ModuloFinanciero.jsx:360-385`)

Orden dentro del handler: (a) `if (event.origin !== window.location.origin) return` — el simulador es same-origin; (b) `try/catch` alrededor de todo el cuerpo; (c) validar cada campo antes de usarlo: `typeof payload.tir === 'number' && Number.isFinite(payload.tir)`, igual para `benefitCostRatio`, `payback`, `van`, y `typeof payload.scenarioName === 'string'`. Con campos faltantes → `console.warn` y salir **sin persistir nada**. Nunca lanzar desde un listener.

### 2 · División con guard (L369-372)

`const ratio = payload.totalInvestment ? (payload.programInvestment / payload.totalInvestment) * 100 : NaN` y persistir **solo** si `Number.isFinite(ratio)`; si no, omitir la escritura de `financiamiento` (no escribir un valor por defecto).

### 3 · `Layout.jsx:333-347`

El guard de forma de datos **ya existe** (L339 hace `typeof data === 'object'`) y la respuesta de `GET /api/projects` es un objeto `{ negocios, social }`, no un arreglo: **no metas `Array.isArray`, vaciaría la lista de proyectos** (el consumo real es `savedProjects.negocios`, `Layout.jsx:277,288,1040`). Lo que falta es solo el `res.ok`:

```js
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();
if (data && typeof data === 'object') setSavedProjects(data);
```

En error: **dejar `savedProjects` como estaba** y usar el canal de error que ya existe en el archivo (`alert` como en L362/L367, o el indicador `saveStatus` del contexto; nota que L336 usa `authFetch || fetch`). No hay sistema de toasts: no inventar uno. Aplicar el mismo chequeo de `res.ok` al fetch de clonado (L1456-1460), que hoy se protege solo por `data.success`.

### 4 · `ReviewPage.jsx`

`submit` envuelto en `try/catch` con un estado de error visible en la UI (aprovechar el `state.error` que la carga ya usa en L8-10), `x.ok` antes del `.json()` del re-fetch, y guard de fecha: `{state.expiresAt ? new Date(state.expiresAt).toLocaleDateString() : '—'}`.

### 5 · Stale closures (L342-357) — refactor **mínimo**

Convertir `runCalculations` en `useCallback` con sus dependencias reales: `financeData`, `planData`, `activeCorrida`, `pillarId`, `moduleKey`, `updateSection`. Los efectos pasan a depender de la callback. **Cuidado con el efecto de L360-385:** hoy tiene deps `[activeCorrida]` porque registra/deregistra el listener de `message`; si metes la callback ahí, el listener se desregistra y re-registra en cada cambio de datos. Solución: separar en dos efectos — uno solo para el `addEventListener`/`removeEventListener`, otro para el cálculo — o mantener el listener leyendo la callback desde un ref. El objetivo funcional es uno: **que no se persistan proyecciones calculadas con parámetros anteriores**. No reescribir el componente.

### 6 · Verificación (no hay tests de componentes)

Sin jsdom/testing-library y sin disco para instalarlos (§0.3), la verificación de B4 es **en navegador contra el servidor local**:

1. `npm run server` + `npm run dev` (o el build local que uses).
2. Abrir el módulo financiero, y en la consola de la pestaña:
   ```js
   window.postMessage({ type: 'SIMULATOR_EXPORT', payload: {} }, location.origin)
   window.postMessage({ type: 'SIMULATOR_EXPORT', payload: { tir: 0.13, van: 100, programInvestment: 5, totalInvestment: 0, partnersInvestment: 5 } }, location.origin)
   ```
   Esperado: dos `console.warn`, **cero excepciones**, y el campo `financiamiento` del plan **no** cambia (verificar en Configuración → organización → inversión).
3. Forzar el error de red: detener el server y recargar la lista de proyectos → debe verse el aviso de error, no una lista vacía silenciosa.
4. `npx eslint src` sin errores/warnings nuevos.

---

## Criterio de aceptación

- [ ] El `postMessage` incompleto no produce excepción (captura de consola como evidencia).
- [ ] No existe ninguna división sin guard `Number.isFinite` antes de un `updateSection` en ese handler.
- [ ] `savedProjects` nunca recibe un objeto de error; `ReviewPage` muestra error de red en la UI.
- [ ] Tras cambiar un input del módulo financiero, el valor persistido corresponde al cálculo nuevo (prueba manual: cambiar, esperar el debounce de 1500 ms, recargar y confirmar).
- [ ] `npm test` completo verde y `npx eslint src` sin avisos nuevos + review de solo lectura limpio.

**Mensaje de commit:** `B4: guards de mensaje, origen y errores de red en el frontend` — cuerpo: el punto 0 (por qué un string corrupto se persiste sin error), y que la verificación fue manual en navegador porque no hay jsdom.
