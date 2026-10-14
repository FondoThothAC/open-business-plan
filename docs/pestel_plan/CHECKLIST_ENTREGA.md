# CHECKLIST FINAL — antes de entregar (validación manual)

Requisitos duros de la rúbrica (Actividad individual, Análisis PESTEL de una empresa real).
**Estado: ejecutado y verificado el 2026-10-13.** La casilla queda marcada solo cuando hubo evidencia comprobable (archivo, cálculo o render), no por intención.

## Empresa y alcance
- [x] Empresa real que opera en México (VCV Cortes Finos SA de CV ✔); no es Ford Hermosillo ni el ejemplo de la uva.
- [x] Delimitación en párrafo de 5–6 líneas: actividad, mercado, ubicación, horizonte 1–2 años (2027–2028). → `fase1_delimitacion_y_candidatos.md` §1 y docx p. 2.

## Factores y matriz
- [x] 12 factores exactos, 2 por dimensión (P/E/S/T/E/L). → docx Tabla 1, 12 filas × 8 columnas.
- [x] Cada factor sustentado en fuente verificable publicada entre oct-2024 y oct-2026. → 16 fuentes en `insumos_vcv.md` §2.2 con fecha textual; 4 abiertas y leídas en la fuente primaria (DOF 01/05/2026, CONASAMI 09/12/2025, El Economista 19/02/2026, gob.mx SE 09/05/2025).
- [x] Impacto = [(IP + Ir)/2] × p(x), recalculado con dos decimales en las 12 filas. → verificado con `Decimal` de `python3` (no a mano): 0.83 · 0.90 · 1.13 · 1.50 · 1.63 · 1.70 · 2.00 · 2.10 · 2.13 · 2.25 · 2.64 · 2.76; total 21.57.
- [x] p(x) justificado en una línea por factor. → docx §2.1 y `fase2_matriz_pestel.md`.
- [x] Clasificación correcta: ≥2.5 alto (2.76, 2.64), 1.5–2.49 medio (7 factores), <1.5 bajo (1.13, 0.90, 0.83).
- [x] Valores propios: p(x) entre 0.55 y 0.92 con nueve valores distintos; **ninguna fila coincide con la fila de ejemplo de la rúbrica** `[(3+3)/2]×0.9 = 2.70` (el factor 3 se recalibró a 0.88 → 2.64 precisamente para eso; ver `recalibrar_factor3.py`).

## Priorización y conclusión
- [x] Top-3 por impacto con UNA decisión concreta cada uno (qué/cómo/cuándo): jornada 46 h (2.76), precio de la res (2.64), presas de Sonora (2.25). Cero verbos de monitoreo.
- [x] Conclusión ≤ 150 palabras: **140 palabras** (contadas con `python3`), veredicto "desfavorable con ventanas de oportunidad" consistente con 12.71 de 21.57 puntos en amenazas y los dos únicos altos siendo amenazas.

## Formato
- [x] 3 cuartillas de cuerpo sin portada ni fuentes: docx = 5 páginas → p. 1 portada, pp. 2-4 cuerpo, p. 5 fuentes (medido sobre el PDF generado con LibreOffice).
- [x] Estructura: delimitación → matriz → priorización y decisiones → conclusión → fuentes APA, en ese orden y en esas páginas.
- [x] Presentación PowerPoint de 8 diapositivas exportada también a PDF (`PESTEL_VCV.pptx`, `PESTEL_VCV.pdf`), revisada página por página en render.
- [x] APA 7: autor/organismo, año, título y URL en las 16 entradas, orden alfabético verificado y sangría francesa aplicada en el docx.

## Anti-copia
- [x] Ningún enunciado de factor copiado textualmente del documento de la actividad (los 12 enunciados son propios y traen una cifra del sector cárnico sonorense).
- [x] Ninguna cifra idéntica fila por fila a la del ejemplo (verificado tras la recalibración; el texto del docx ya no contiene 2.70, 12.77 ni 21.63).

## Entregables en esta carpeta
| Archivo | Fase | Verificación hecha |
|---|---|---|
| `insumos_vcv.md` | 0 | perfil con paths del repo; 22 fuentes con fecha; 21 candidatos |
| `fase1_delimitacion_y_candidatos.md` | 1 | 12 factores, 0 FUENTE-PENDIENTE, 12 descartados con motivo |
| `fase2_matriz_pestel.md` | 2 | aritmética recalculada con `Decimal`, fila de ejemplo desglosada |
| `fase3_priorizacion_conclusion.md` | 3 | top-3, decisiones con fecha, conclusión de 140 palabras |
| `Actividad_Individual_PESTEL_VCV.docx` (+ `.pdf`) | 4 | 5 páginas, estructura 1-5, cifras idénticas a las fases previas |
| `PESTEL_VCV.pptx` (+ `.pdf`) | 5 | 8 diapositivas, semáforo con leyenda, ≤30 palabras fuera de matrices/fuentes |
| `build_docx_pestel.py`, `build_pptx_pestel.py`, `recalibrar_factor3.py` | — | re-generan los dos entregables sin pasos manuales |

## Pendientes que sí dependen de ti (no verificables desde aquí)
1. **Portada**: confirma nombre completo, materia, grupo y la fecha de entrega real del curso (pusimos "Roberto Celis · 13 de octubre de 2026").
2. **Comparación con compañeros**: la regla "matrices coincidentes se considerarán copia" solo puede cerrarse viendo las matrices de los demás; los valores son propios y atípicos (p(x) 0.55–0.92, dos IP/Ir bajos conviviendo con tres 3/3).
3. **Apertura del .docx y del .pptx en Word/PowerPoint reales**: se validaron renderizados con LibreOffice; al abrirlos, revisa que la Tabla 1 no se mueva al editar texto.
4. Dos cifras quedaron en fuentes de prensa que citan al organismo (COMECARNE 85.3 kg per cápita vía porcicultura/Compendio 2026; INEGI 3.69 % vía El Financiero). Si tu profesor exige el boletín primario, sustituye la cita por el PDF del COMECARNE/INEGI correspondiente.
