# Integración del PESTEL calificado como módulo en OBP

Fecha: 2026-10-13 · Empresa sembrada: **VCV Cortes Finos SA de CV**

El plan de fases (`FASE_0`…`FASE_5`) producía el análisis para entregarlo a la escuela. Este documento describe el paso adicional: que **la app misma** guarde y muestre la matriz calificada, no solo prosa por dimensión.

## Qué existía antes

`naturaleza.pestel` tenía seis cadenas de texto libre (`politico`, `economico`, `social`, `tecnologico`, `ecologico`, `legal`) y `PestelAnalysis.jsx` las pintaba como seis tarjetas markdown. No había dónde expresar IP, tendencia, Ir, p(x), impacto, ni la fuente con fecha de cada factor.

## Qué hay ahora

El mismo objeto acepta una capa estructurada opcional. Si `pestel.matriz` existe y trae filas, el módulo renderiza la **vista de matriz calificada**; si no existe, renderiza exactamente la infografía de texto de siempre. Los cinco proyectos que hoy solo tienen texto no cambian de aspecto.

```js
naturaleza.pestel = {
  politico: '• …(El País México / BM Editores (ANETIF), 2026) — impacto 0.90 · oportunidad',
  // …los seis textos legacy se DERIVAN de la matriz, no se escriben a mano
  matriz: [{ n, dim, factor, fuente, fecha, url, ip, tendencia, ir, px, impacto, clasificacion, oa, justificacion_px }],
  priorizacion: [{ orden, factor_n, impacto, que, como, cuando }],
  conclusion, conclusion_palabras, horizonte, formula, umbrales, ventanaFuentes, fuentes, pestelOrigen, pestelVersion
}
```

| Pieza | Rol |
|---|---|
| `src/lib/pestelMatrix.js` | Núcleo puro: `computeImpact`, `classifyImpact`, `impactColor`, `groupByDimension`, `rankByImpact`, `summarize`, `deriveDimensionTexts`, `validateMatriz`, `hasMatrix`. |
| `src/lib/pestelResearch.js` | Procedencia e investigación: `clasificarFuente`, `selloProcedencia`, `enriquecerMatriz`, `construirConsultas`, `normalizarCandidatos`, `dentroDeVentana`, `clasificarCandidatos`, `candidatoAFactor`. |
| `src/components/PestelAnalysis.jsx` | Dos vistas: `PestelMatrixView` (nueva) y `PestelCardsView` (original, intacta). Cada factor muestra su sello de procedencia. |
| `src/components/PestelResearchPanel.jsx` | Botón "Buscar con Tavily": propone candidatos por dimensión y solo escribe lo que tú calificas. |
| `src/components/ModuleWrapper.jsx` | Cablea `onActualizar`: al aprobar un factor reescribe `matriz` y regenera los seis textos. |
| `src/modules/VistaPrevia.jsx` | Densidad de impresión del módulo: 3.4 páginas con matriz, 0.8 sin ella. |
| `server/index.js` | `/api/search` ahora devuelve `publishedDate` (Tavily `published_date`, Brave `page_age`, Serper `date`). Sin fecha no hay ventana que verificar. |
| `docs/pestel_plan/pestel_vcv_matrix.json` | Fuente de verdad legible por humanos y por máquina. |
| `scripts/injectVcvPestelMatrix.js` | Siembra el proyecto con respaldo automático en `.versions/`. |

## Sello de procedencia

Cada factor sale etiquetado con el vocabulario que la app ya usaba para mercado y competencia (`tagReal` y `getProvenanceBadgeConfig` de `src/lib/tools/provenance.js`): `provenance`, `provider`, `sourceUrl`, `confidenceScore`, `tipoFuente`. La confianza la fija el tipo de medio, no el discurso: oficial 0.98, sectorial 0.90, prensa 0.80, desconocida 0.50 — y **sin URL no existe 'real'**: se marca `FUENTE-PENDIENTE`.

En las 12 fuentes de VCV: 3 oficiales (DOF, SE, INEGI), 2 sectoriales (COMECARNE, AMVO) y 7 de prensa económica. El sello también se calcula en el render, así que un proyecto sembrado antes del inyector sigue mostrando su badge.

## Investigación de candidatos

"Buscar con Tavily" lanza una consulta por dimensión contra `/api/search` (respetando cuota y failover del servidor) y reparte lo que vuelve en cuatro cajones: **aptos**, **sin fecha o sin ventana**, **fuera de ventana** y **repetidos o ya en la matriz**. Solo los aptos traen campos editables; para entrar a la matriz hay que escribir IP, Ir, p(x) y O/A a mano. Sin calificación, sin fecha o sin URL, el botón devuelve el motivo y no escribe nada. Antes de guardar, la matriz resultante pasa por `validateMatriz`; si algo no cuadra, se muestra la objeción y se aborta la escritura.

## Cómo se aplica a otro proyecto

1. Research con fuentes dentro de la ventana exigida y matriz calificada → un JSON con la forma de `pestel_vcv_matrix.json`.
2. `node scripts/injectVcvPestelMatrix.js` para ver el diff sin escribir; `--write` para aplicar. Para otra empresa hay que cambiar `ARCHIVO_PROYECTO` (o generalizar el script a un argumento `--proyecto=`).

El inyector **falla antes de escribir** si la matriz no pasa su propia auditoría: aritmética recalculada, clasificación coherente, dos factores por dimensión, O/A presente y fechas dentro de la ventana.

## Verificación hecha

- `tests/pestelMatrix.test.js` — 13 pruebas: fórmula, umbrales en los bordes exactos (2.50 / 2.49 / 1.50 / 1.49), auditoría de las 12 filas, balance 21.57 = 12.71 amenazas + 8.86 oportunidades, top-3 coherente con el orden, **anti-copia** (ninguna fila igual a `[(3+3)/2]×0.9 = 2.70`), textos derivados, y que el JSON de VCV en disco ya trae la matriz.
- `tests/pestelResearch.test.js` — 8 pruebas: clasificación de medios, sello honesto cuando falta URL o fecha, las 12 fuentes de VCV sin pendientes, las seis consultas con año explícito, la ventana aceptando ISO y timestamp unix, los cuatro cajones de candidatos y que aprobar exija calificación humana.
- `tests/browser/pestelMatrix.test.js` — 5 pruebas con esbuild + puppeteer sobre el componente real: 6 tarjetas, 12 factores, tabla de 8 columnas × 12 filas, 16 fuentes, sin desborde horizontal, sin errores de JS; colores del semáforo leídos del CSS computado (2.76 y 2.64 rojos, 2.25 ámbar, 1.13 y 0.83 verdes); impresión con tarjetas en fondo blanco, sin partir factores y **con las fuentes visibles**; 12 sellos de procedencia renderizados; y el panel de investigación con la búsqueda simulada: 1 apto / 1 sin fecha / 1 fuera de ventana tras deduplicar por URL, rechazo con motivo al aprobar sin calificar, y escritura de la fila 13 con impacto 2.00 cuando sí se califica.
- `npm test` completo: **402 pruebas, 0 fallos**. `npm run build`: correcto en ~15 s. `eslint`: sin errores nuevos (queda el aviso preexistente de `import React`, convención del repo).
- Render revisado a ojo: pantalla, impresión A4 de 4 páginas y panel de investigación (`/tmp/pestel_vista_matriz.png`, `/tmp/pestel_impresion.pdf`, `/tmp/pestel_panel_investigacion.png`).

## Límites conocidos

1. **Solo VCV está sembrado.** Los otros proyectos con PESTEL (`Brújula Financiera`, `Jula Financiera MX`, `Comercio Cuántico`, `Ferretería Kino` ×2) conservan viñetas sin fuente ni fecha y se ven igual que antes. Sustituirlas exige la misma investigación por empresa: no se rellenan con cifras inventadas.
2. **El cambio de `server/index.js` no está desplegado.** Hasta que se suba y reinicie el backend, `/api/search` seguirá devolviendo resultados sin `publishedDate` y el panel clasificará todo como "sin fecha". El resto (matriz, procedencia, impresión) es frontend y funciona ya.
3. **"Editar Campos" puede desincronizar.** El editor de texto escribe solo los seis campos; la matriz sobrevive (PlanContext.jsx:667 hace spread por campo), pero si alguien edita un texto a mano, la divergencia queda visible hasta que se vuelva a derivar.
4. **Regenerar con IA sobrescribe los textos**, no la matriz. Después de una industrialización, la vista de matriz seguirá mostrando los factores calificados mientras los campos de texto traigan prosa nueva sin fuente.
5. El módulo no calcula impacto al vuelo: `impacto` se guarda y `validateMatriz` lo audita. Si alguien edita `ip`/`px` a mano, la auditoría lo detecta en el siguiente `--write` o en `npm test`, pero la app no lo corrige sola.
