# FASE 2 — Matriz PESTEL calificada (Qoder / Qwen)

> Pegar este archivo completo como goal en Qoder. Requiere el entregable de la Fase 1: `fase1_delimitacion_y_candidatos.md`.

## Objetivo
Calificar los 12 factores con la matriz de la unidad y calcular el impacto de cada uno.

## Contexto base (fórmula de la unidad)
- **Impacto = [(IP + Ir) / 2] × p(x)**
- IP = importancia (1–3), T = tendencia (+/−), Ir = incidencia/repercusión (1–3), p(x) = probabilidad (0–1).
- Interpretación del impacto: **≥ 2.5 alto · 1.5–2.49 medio · < 1.5 bajo**.
- O/A se asigna según el signo de T (o de la naturaleza del factor).
- Empresa: VCV Cortes Finos SA de CV, Hermosillo, Sonora. Horizonte 2027–2028.

## Instrucciones para el modelo
1. Lee `fase1_delimitacion_y_candidatos.md` y toma la tabla de 12 factores tal cual (no cambies enunciados ni fuentes).
2. Asigna a cada factor: IP (1–3), T (+/−), Ir (1–3), p(x) (0–1).
3. **Justifica el valor de p(x) en UNA línea** por factor (razonamiento de probabilidad: qué tan instalada está la medida/tendencia en la agenda pública o en los datos). Prohibido el p(x) arbitrario.
4. Calcula Impacto = [(IP + Ir)/2] × p(x) con **dos decimales**, mostrando la operación.
5. Clasifica cada impacto (alto/medio/bajo) y marca O/A.
6. Genera la tabla final con las columnas exactas: Dimensión | Factor y fuente | IP | T | Ir | p(x) | Impacto | O/A.

## Reglas de control (el modelo debe autocumplirlas; tú las verificas)
- p(x) debe variar razonablemente entre factores: si 10 de 12 caen en 0.7–0.8, rehaz (patrón del ejemplo = riesgo de copia).
- Muestra el cálculo completo de una fila como ejemplo, igual que la rúbrica: `[(3 + 3) / 2] × 0.9 = 2.70`.
- Recalcula las 12 filas una a una; corrige cualquier error aritmético antes de cerrar.

## Entregable
`fase2_matriz_pestel.md`: tabla de 12 filas + nota al pie con la fórmula y los umbrales + fila de ejemplo desglosada.

## Criterio de aceptación (goal completado cuando…)
- [ ] 12 filas completas con las 8 columnas.
- [ ] Cada p(x) con justificación de una línea.
- [ ] Aritmética verificada fila por fila (recalcula 3 al azar en la revisión manual).
- [ ] Distribución de impactos creíble: mezcla de altos, medios y al menos un bajo; no los 12 "altos".
- [ ] p(x) con variación real (no todos en 0.7–0.8).
