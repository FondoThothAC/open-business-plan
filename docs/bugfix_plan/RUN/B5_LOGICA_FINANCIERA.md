# B5 · Lógica financiera y UX de cálculo — **Medio**

> **Antes de tocar nada:** leer [`00_CONTEXTO.md`](00_CONTEXTO.md) (§0.3 tooling, §0.8 aislamiento, §0.10 **corrección 6 y 8**). Rama `fix/fase-b5` desde `main` (con B1–B4 mergeados).

**Afecta cifras que el usuario ve y exporta.** La verificación aquí es más estricta que en el resto de fases: todo cambio numérico lleva test con valor de referencia conocido.

---

## 0. Contexto que la ficha no traía

- **`src/lib/finanzas/` no tiene ni un test.** Ningún archivo de `tests/` importa `calculateIRR`, `calculateFinancialProjections` ni `runMonteCarloSimulation`. Lo que `tests/toolsSuite.test.js` prueba son **otras implementaciones**: `FinancialAnalyzer.calculateIRR` (`src/lib/tools/financial/FinancialAnalyzer.js:48`) y `RiskSimulator.runMonteCarlo` (`src/lib/tools/risk/RiskSimulator.js:24`), este último con histograma de **10** bins. El código de esta fase usa **20** bins. No confundirlos: arreglar el de `tools/` no arregla nada de lo de aquí.
- **Hay un gemelo `.ts`** de `financial-calculations.js` con el mismo bug. Verificado: solo `scripts/generate_closets_corona.js:10` importa el `.ts`; todo lo demás (`ModuloFinanciero.jsx:3`, `VistaPrevia.jsx:23`, `calculadoraFinanciera.js:1`) importa `'…/financial-calculations'` sin extensión, y **Vite resuelve `.js` primero** → el `.ts` no se navega en la app.
- **`npm run lint` sale con código 1 hoy** por 4 errores `no-useless-assignment`. Esta fase es donde se repara el baseline.

## Qué está mal, verificado hoy

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | `calculateIRR` bisection: `npvAtLower` se calcula **una sola vez** para `lowerBound = -0.99` y nunca se recalcula al mover `lowerBound` → las iteraciones comparan contra un NPV obsoleto, converge al intervalo equivocado y devuelve TIR incorrecta o `null` en casos válidos. No hay Newton-Raphson | `src/lib/finanzas/financial-calculations.js:12-41`: L18 inicializa, L34-38 mueve los extremos sin actualizar. Semántica de retorno: `null` si cashflows vacíos o `cashflows[0] >= 0` (L13), si no hay cambio de signo (L23) o si no converge (L40); si no, `midRate * 100` |
| 2 | Histograma Monte Carlo con **doble conteo**: bins `v >= binMin && v < binMax` más un parche `count += allNPVs.filter(v => v === maxNPV)`. Por error de flotante al reconstruir `binMax` del último bin, el máximo entra dos veces (igualdad exacta sobre flotantes ya redondeados). **Reproducido:** en 9 de 40 corridas con 5000 iteraciones, `Σ counts = 5001` | `src/lib/finanzas/montecarlo.js:123-133` (el parche en L132) |
| 3 | `useMemo` del simulador corre hasta 10,000 iteraciones con un `sort` de 10,000 elementos **por año**, en cada tick de slider → la UI se congela | `src/components/MonteCarloSimulator.jsx:47-58`; sliders L214-305; opciones de iteraciones L333 `[1000, 5000, 10000]`; los `sort` están en `montecarlo.js:83` y `:103` |
| 4 | Typewriter: `setInterval(…, 35)` creado dentro del handler async `handleAiGenerate` y `clearInterval` **solo** cuando `isFinished` → setState sobre componente desmontado si el usuario navega. El archivo no usa `useRef` en ninguna parte | `src/components/ModuleWrapper.jsx:261-285` (handler en L182). El patrón de cleanup sí existe en el mismo archivo para otra cosa: L134-138 |
| 5 | Input borrado → `Number('')` es `0` y ese 0 entra en cálculos **y** se persiste | `ModuloFinanciero.jsx:304-306` (`handleDataChange`), alimentado por inputs como L468. El archivo ya tiene un `parseNum` robusto (L18-43) que aquí no se usa |
| 6 | 4 asignaciones `no-useless-assignment` | `financial-calculations.js:24` (`midRate`), `:183` (`amount`), `:191` (`specificGrowthMultiplier`), `src/lib/promptExporter.js:52` (`directivaFormato`) |

---

## Pasos

### 1 · Corregir el bisection (`.js` **y** `.ts`)

Actualizar el NPV del extremo que se mueve, en cada iteración:

```js
if (npvAtLower * npvAtMid < 0) { upperBound = midRate; npvAtUpper = npvAtMid; }
else { lowerBound = midRate; npvAtLower = npvAtMid; }
```

Aplicar el parche idéntico en `financial-calculations.ts:16-49` (mismo bug: inicializa en L24, no actualiza en L45). **No borrar el `.ts`** en esta fase: mantendría vivas dos fuentes de verdad, pero rompería `scripts/generate_closets_corona.js`. Anotar en el commit que el `.ts` es candidato a eliminarse en una ronda aparte junto con `src/lib/finanzas/types.ts` (el otro `.ts` del repo, sin importadores).

Antes de tocar: decidir y anotar si además conviene devolver el último `midRate` cuando el loop se agota dentro de tolerancia en vez de `null` — la ficha lo sugería; es un cambio de semántica de retorno que puede afectar a quien ya maneje `null`. **Si hay dudas, no cambiar la semántica**: solo arreglar la convergencia.

### 2 · Histograma con último bin inclusivo

Último bin: `v >= binMin && v <= maxNPV` (o equivalentemente `v < binMax || esUltimoBin && v <= maxNPV`) y **eliminar** la línea del parche (L132). Sin `filter` adicional.

### 3 · Tests nuevos — `tests/financialCalculations.test.js`

Será el **primer** test del repo que importa `src/lib/finanzas` directo (ESM puro, corre en Node sin jsdom):

- **TIR:** `[-100, 60, 60]` → `≈ 13.06 %` (usar tolerancia de 0.01). Segundo caso con valor de referencia calculado aparte — **verificar el número contra una fuente independiente** (`FinancialAnalyzer.calculateIRR` o XIRR conocido) antes de fijarlo en el assert; no inventar el esperado.
- **Bordes:** cashflows vacíos → `null`; `[-100, -50]` sin cambio de signo → `null`; un caso con raíz alta (`[-100, 5, 5, 5, 200]`) para forzar el camino que hoy falla.
- **Histograma:** `Σ bins === iterations` para 1000, 5000 y 10000 iteraciones, en **corridas repetidas** (el generador usa `Math.random()` sin parámetro de semilla — `montecarlo.js:10-11` — así que no hay seeds que fijar; corre el bin por lo menos 10 veces y afirma que **ninguna** excede el total, que es justo el bug intermitente reproducido en 9 de 40 corridas).
- Si el `.ts` queda vivo, un assert extra que verifique que ambas implementaciones devuelvan el mismo TIR para el mismo input (evita divergencia futura).

### 4 · Debounce del simulador, sin dependencias nuevas

Envolver el objeto de parámetros del `useMemo` (L47-58) en **`useDeferredValue`** (React 18.2 lo soporta, cero dependencias, sin temporizadores) y mantenerlo en las deps, con un indicador `"calculando…"` mientras el valor diferido es distinto del actual. No mover a Worker en esta fase; anotarlo como mejora futura si con 10,000 iteraciones el frame sigue caro.

### 5 · Cleanup del typewriter

Guardar el id del intervalo en un `useRef` y agregar `useEffect(() => () => clearInterval(ref.current), [])` además del `clearInterval` existente al terminar el tipeo (`ModuleWrapper.jsx:279`). Imitar el cleanup que ya está en L134-138 para el ping de presencia.

### 6 · Input vacío ≠ 0 persistido

En `handleDataChange` (`ModuloFinanciero.jsx:304-306`): si `value === ''` mantener el string vacío (o `null`) en el estado local y convertir con `Number` solo cuando haya entrada parseable. Los cálculos tratan vacío/null como 0 **sin escribirlo** en el estado persistible. Reutilizar `parseNum` (L18-43) en vez de reimplementar.

### 7 · Las 4 asignaciones: son higiene, no bugs

Verificado una por una — en los cuatro casos el inicializador se sobreescribe en **todas** las ramas antes de la primera lectura (`midRate` se reasigna en L26; `amount` en las ramas L185/L197 antes de leerse en L199-203; `specificGrowthMultiplier` en L193/L195 antes de L197; `directivaFormato` en L54/L58 y se usa en L105). La ficha pedía sospechar que ocultaran intención no implementada; **no es el caso**. Fix: quitar el inicializador (`let x;`). Escribir en el commit el juicio de cada una, para que nadie createa que se perdió un fix.

### 8 · Suite numérico completo

```bash
node --test tests/financialCalculations.test.js tests/financialSanityCheck.test.js \
  tests/triProjectFinancialSanity.test.js tests/auditorCifras.test.js \
  tests/integration/financialConsistency.test.js
npm test          # con el respaldo B0 de 00_CONTEXTO.md
npm run lint      # objetivo: 0 errores — aquí se repara el baseline roto
```

**Regla de oro:** si al arreglar la TIR o el histograma cambia alguna cifra de un proyecto guardado, no es un crash — es un **número distinto exportado a un documento de negocio**. Reportar en la respuesta qué cambió y en qué orden de magnitud.

---

## Criterio de aceptación

- [ ] Tests de TIR (2 casos conocidos + bordes) en verde.
- [ ] Test `Σ bins === iteraciones` en verde para 1000/5000/10000.
- [ ] Arrastrar los sliders del simulador no congela la UI y muestra estado de cálculo (verificación en navegador local).
- [ ] Borrar un input numérico no persiste `0` (verificado en el plan guardado tras el debounce, no solo en el DOM).
- [ ] Navegar fuera del módulo mientras el typewriter escribe no produce warning de setState sobre componente desmontado en consola.
- [ ] `npm run lint` → **0 errores** (se cierra el baseline roto).
- [ ] `npm test` completo verde (incluida la auditoría de cifras) + review de solo lectura limpio.

**Mensaje de commit:** `B5: convergencia de TIR, histograma sin doble conteo y UX de calculo` — cuerpo: el efecto numérico observable del fix de TIR (qué tipo de proyectos cambian y cuánto), la decisión sobre el `.ts` gemelo, y el juicio de cada asignación muerta.
