# Plan por fases — Actividad Individual PESTEL (ejecutable en Qoder con Qwen, luego Antigravity)

> **⚠️ Versión ejecutable por goals:** este archivo es la vista general de lectura. La versión operativa, **un .md autocontenido por fase listo para pegar como goal**, está en [`docs/pestel_plan/`](pestel_plan/README.md) — usar esa carpeta con Qoder/Antigravity.

## Contexto para el modelo (pegar al inicio de la sesión en Qoder)

- Empresa seleccionada: **VCV Cortes Finos SA de CV** (carnicería de cortes finos, Hermosillo, Sonora, México). Microempresa del sector cárnico premium. Datos internos disponibles en el repositorio OBP (`vcv/`, `Carnes/`).
- Horizonte de análisis: **2027–2028** (uno a dos años).
- Entregable académico: 3–4 cuartillas (Word o PDF) + presentación PowerPoint/canvas. Estructura exigida: delimitación (párrafo 5–6 líneas), matriz PESTEL (≥2 factores por dimensión = 12 total), priorización top-3 con decisiones, conclusión (≤150 palabras), fuentes APA.
- Regla de calificación: Impacto = [(IP + Ir) / 2] × p(x). Interpretación: ≥2.5 alto, 1.5–2.49 medio, <1.5 bajo. Cada factor debe citar fuente verificable de los **últimos 24 meses** (octubre 2024 – octubre 2026).
- La matriz NO puede coincidir con la del ejemplo (uva de mesa en Sonora) ni con la de ningún compañero.

---

## Fase 0 — Preparación de insumos (en OBP / local)

**Objetivo:** extraer los datos de la empresa y las fuentes RAG ya recolectadas.

1. Extraer de `vcv/` y `Carnes/`: actividad económica, mercado atendido (B2C premium / restaurantes), ubicación, capacidad instalada, estructura de precios.
2. Listar fuentes de `Leyes/` y `leyes_md/` con fecha ≤24 meses: reforma laboral jornada 40 horas, salario mínimo 2026, inflación/Canasta Básica, normas de inocuidad (SENASICA/TIF), tipo de cambio.
3. Exportar el módulo PESTEL de OBP para VCV si ya tiene factores precargados (solo como semilla; se re-escribirán).

**Entregable:** `insumos_vcv.md` con: perfil de la empresa (5 líneas), lista de 15–18 candidatos a factor con fuente y fecha, enlaces/refs APA crudos.

---

## Fase 1 — Delimitación y candidatos a factores (Qoder/Qwen)

**Prompt sugerido:** "Con base en `insumos_vcv.md`, redacta: (a) la delimitación en un párrafo de 5–6 líneas (actividad, mercado, ubicación, horizonte 2027–2028); (b) una tabla de 15 factores candidatos (2–3 por dimensión PESTEL), cada uno con fuente verificable de los últimos 24 meses. Marca cuáles son amenazas (−) y cuáles oportunidades (+). No inventes fuentes: si no hay fuente verificable, escribe FUENTE-PENDIENTE."

**Reglas de control:**
- Toda fuente debe ser: oficial (DOF, INEGI, Banxico, Banco Mundial), informe sectorial (SIAP, COMECARNE) o prensa económica especializada.
- Verificar fecha de publicación de cada fuente (los modelos inventan años: exigir que se muestre la fecha textual).
- Descartar cualquier factor que repita el ejemplo de la uva (aranceles genéricos sin adaptar, Mundial como driver social).

**Entregable:** `fase1_delimitacion_y_candidatos.md`. Validación manual: 12+ factores con fuente real, 0 FUENTE-PENDIENTE críticos.

---

## Fase 2 — Matriz PESTEL calificada (Qoder/Qwen)

**Prompt sugerido:** "Califica los 12 factores seleccionados con la matriz: IP (1–3), T (+/−), Ir (1–3), p(x) (0–1). Impacto = [(IP + Ir)/2] × p(x). Para cada factor justifica en UNA línea el valor de p(x) (probabilidad razonada, no arbitraria). Marca O/A según el signo. Clasifica cada impacto: alto ≥2.5, medio 1.5–2.49, bajo <1.5. Formato tabla idéntico al de la rúbrica."

**Reglas de control:**
- p(x) debe variar entre factores (si todos son 0.7–0.8, el modelo copió el patrón del ejemplo).
- Verificar aritmética de Impacto re-calculando 3 filas al azar.
- Conservar la fórmula textual del ejemplo como nota al pie.

**Entregable:** `fase2_matriz_pestel.md` con la tabla final de 12 filas.

---

## Fase 3 — Priorización, decisiones y conclusión (Qoder/Qwen)

**Prompt sugerido:** "Con la matriz de `fase2_matriz_pestel.md`: (1) ordena por Impacto y toma el top-3; (2) para cada uno propón UNA decisión concreta y accionable para VCV (evita genericidades tipo 'monitorear el entorno'; cada decisión debe mencionar qué, cómo y cuándo); (3) redacta la conclusión en ≤150 palabras: ¿el entorno 2027–2028 es favorable o desfavorable para VCV? Debe derivarse de los 12 impactos, mencionando el balance oportunidades/amenazas."

**Reglas de control:**
- Las decisiones deben ser coherentes con la capacidad real de una microempresa (nada de "abrir 5 sucursales").
- Contar palabras de la conclusión (≤150).
- El veredicto debe ser consistente con la suma de impactos (si 8 de 12 son amenazas, no puede concluir "favorable" sin justificación fuerte).

**Entregable:** `fase3_priorizacion_conclusion.md`.

---

## Fase 4 — Documento final (Qoder/Qwen)

**Prompt sugerido:** "Integra fases 1–3 en un documento de 3–4 cuartillas con la estructura exacta: (1) Delimitación, (2) Matriz PESTEL, (3) Priorización y decisiones, (4) Conclusión, (5) Fuentes en APA 7. Genera el archivo Word (.docx) con tablas formateadas y portada aparte."

**Reglas de control:**
- Contar cuartillas: 3–4 sin portada ni fuentes.
- APA 7: autor, año, título, medio/URL para cada fuente; orden alfabético.
- Revisar que ningún texto provenga textualmente del ejemplo del profesor (las "matrices coincidentes se considerarán copia": asegurar que p(x), IP e Ir difieran de cualquier compañero).

**Entregable:** `Actividad_Individual_PESTEL_VCV.docx`.

---

## Fase 5 — Presentación y pulido (Antigravity)

**Subir a Antigravity:** el .docx final + `fase2_matriz_pestel.md`.

**Prompt sugerido:** "Crea una presentación PowerPoint de 8 diapositivas para exponer este análisis PESTEL: (1) portada, (2) empresa y delimitación, (3–4) matriz PESTEL dividida en dos (P-E-S / T-E-L) con semáforo de color por impacto (alto=rojo, medio=amarillo, bajo=verde), (5) top-3 factores con su impacto, (6) decisiones propuestas, (7) conclusión, (8) fuentes. Estilo limpio, sin texto denso; exportar también a PDF."

**Reglas de control:**
- Máximo 30 palabras por diapositiva (excepto matriz y fuentes).
- Los colores del semáforo deben coincidir exactamente con la clasificación numérica.
- Exportar .pptx y .pdf.

**Entregable final:** `PESTEL_VCV.pptx` + `PESTEL_VCV.pdf` + `Actividad_Individual_PESTEL_VCV.docx`.

---

## Checklist final antes de entregar

- [ ] Empresa ≠ Ford Hermosillo y ≠ ejemplo (VCV cumple).
- [ ] 12 factores, ≥2 por dimensión, todos con fuente de los últimos 24 meses.
- [ ] p(x) justificado en una línea por factor.
- [ ] Aritmética de impacto verificada en las 12 filas.
- [ ] Top-3 con decisión concreta cada uno.
- [ ] Conclusión ≤150 palabras y consistente con los resultados.
- [ ] 3–4 cuartillas sin portada ni fuentes; APA 7.
- [ ] Presentación 8 diapositivas + PDF.
- [ ] Ninguna coincidencia con matrices de compañeros (revisar p(x) e IP/Ir propios).
