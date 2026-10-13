# FASE B5 — Lógica financiera y UX de cálculo (Medio)

> Goal autocontenido. Proyecto: OBP. Antes de empezar: rama `fix/fase-b5` y `npm test` en verde. Estos bugs afectan **cifras que el usuario ve y exporta** — máxima verificación.

## Objetivo
Corregir los errores de cálculo financiero y los problemas de UX que distorsionan resultados.

## Bugs a corregir (auditoría 12-oct-2026)

**1. `calculateIRR` con bisection rota** — `src/lib/finanzas/financial-calculations.js` ~12-41 (función `calculateIRR`): cuando el bisection mueve `lowerBound` NO recalcula `npvAtLower` (líneas ~34-38), así que las iteraciones comparan contra un NPV obsoleto y convergen al intervalo equivocado → TIR incorrecta o `null` en casos válidos.

**2. Histograma Monte Carlo con doble conteo** — `src/lib/finanzas/montecarlo.js` ~128-131: el último bin usa `v === maxNPV` (igualdad exacta de flotantes contra valores ya redondeados) y los valores que coinciden ya fueron contados en el rango del bin previo → la suma de bins supera el total de iteraciones.

**3. Simulación síncrona en cada frame** — `src/components/MonteCarloSimulator.jsx` ~47-58: el `useMemo` corre hasta 10,000 iteraciones (con `sort` de 10,000 elementos por año) en cada cambio de slider; arrastrar congela la UI.

**4. Intervalo typewriter sin cleanup** — `src/components/ModuleWrapper.jsx` ~261-283: `setInterval(..., 35)` creado dentro de `handleAiGenerate` (async, no efecto): si el usuario navega mientras "escribe", el intervalo sigue llamando setState sobre el componente desmontado.

**5. Input vacío → 0 persistido** — `src/components/ModuloFinanciero.jsx` ~304-306: `Number('')` = 0 al borrar un campo; ese 0 entra en cálculos y persistencias.

**6. Asignaciones muertas de ESLint (indicios de bugs)** — `financial-calculations.js`: `midRate` inicial (~24), `amount` (~183) y `specificGrowthMultiplier` (~191) asignados y sobrescritos sin uso; `promptExporter.js` ~52 `directivaFormato`. ESLint los marca como `no-useless-assignment`: **no basta borrar la línea** — verificar la semántica: en cada caso preguntarse si el autor intentaba usar ese valor (p. ej. ¿`amount` del override mensual debería usarse?) y decidir; documentar la decisión en el commit.

## Instrucciones
1. **IRR:** corregir el bisection actualizando el NPV del extremo que se mueve (`if (npvAtLower * npvAtMid < 0) { upperBound = midRate } else { lowerBound = midRate; npvAtLower = npvAtMid }`). Agregar unit test con TIR conocida: `[-100, 60, 60]` → ≈ 13.1%, `[-100, 10, 10, 10, 200]` → valor de referencia calculado, y casos borde (sin solución → `null`).
2. **Histograma:** construir los bins con el último bin inclusivo (`v >= binMin && (v < binMax || esÚltimoBin && v <= maxNPV)`) y eliminar el `filter(v => v === maxNPV)` adicional; agregar test que la suma de bins === número de iteraciones.
3. **Debounce del simulador:** envolver el `useMemo` con debounce (~150-250 ms) o `useDeferredValue` en los inputs de sliders; mostrar "calculando…" mientras tanto. No mover a worker en esta fase (anotar como mejora futura si el debounce no basta).
4. **Typewriter:** guardar el id del intervalo en un ref y limpiarlo en el cleanup del componente (`useEffect(() => () => clearInterval(ref.current), [])`) además de al terminar el tipeo.
5. **Inputs numéricos:** en `handleDataChange`, si `value === ''` mantener el string vacío en el estado local (o null) y solo convertir con `Number` cuando haya entrada parseable; los cálculos tratan vacío/null como 0 sin escribirlo en el estado persistible.
6. **Asignaciones muertas:** resolver cada una por semántica (usar el valor si era la intención, eliminar si es vestigio) y dejar la decisión documentada en el commit.
7. Correr TODO el suite financiero: `node --test tests/financialSanityCheck.test.js tests/triProjectFinancialSanity.test.js tests/auditorCifras.test.js` además del suite completo.

## Criterio de aceptación (goal completado cuando…)
- [ ] Test de IRR con 3 casos (2 conocidos + borde) en verde.
- [ ] Test de suma de bins === iteraciones en verde.
- [ ] Arrastrar sliders del simulador no congela la UI (verificación manual) y muestra estado de cálculo.
- [ ] Borrar un input numérico no persiste 0 (verificación manual + test si es factible).
- [ ] `npx eslint src` sin los 4 `no-useless-assignment` y sin avisos nuevos.
- [ ] `npm test` completo en verde (incluye auditoría de cifras) y `/ultra-review` limpio.
