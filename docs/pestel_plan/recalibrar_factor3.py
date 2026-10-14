#!/usr/bin/env python3
"""Recalibra el factor 3 (0.90 -> 0.88, 2.70 -> 2.64) para que ninguna fila coincida
con la fila de ejemplo de la rúbrica, y propaga el cambio a todos los entregables."""
import sys

BASE = "/Users/robertoeduardocelisrobles/Documents/Proyectos/OBP/docs/pestel_plan/"
JOBS = {
"fase2_matriz_pestel.md": [
    ("| 3 | − | 3 | 0.90 | **2.70** | A |", "| 3 | − | 3 | 0.88 | **2.64** | A |"),
    ("| 3 | Precio de la res | 0.90 — es una condición ya observable (los precios subieron y las cuotas de importación se mantienen), no una previsión. |",
     "| 3 | Precio de la res | 0.88 — los precios ya subieron y las cuotas de importación se mantienen; el residuo es el margen de estabilización, no la tendencia. |"),
    ("| 3 | (3+3)/2 = 3.00 · 3.00 × 0.90 | 2.70 | **alto** |", "| 3 | (3+3)/2 = 3.00 · 3.00 × 0.88 | 2.64 | **alto** |"),
    ("suma total de impactos = 21.63 · amenazas = 12.77", "suma total de impactos = 21.57 · amenazas = 12.71"),
    ("- **Altos (2):** factor 11 (2.76) y factor 3 (2.70)", "- **Altos (2):** factor 11 (2.76) y factor 3 (2.64)"),
    ("- p(x) va de 0.55 a 0.92 con ocho valores distintos (solo 3 factores caen en la banda 0.70–0.80), y la matriz combina IP/Ir bajos con altos, por lo que no reproduce el patrón del ejemplo.",
     "- p(x) va de 0.55 a 0.92 con nueve valores distintos (solo cuatro factores caen en la banda 0.70–0.80), y la matriz combina IP/Ir bajos con altos.\n"
     "- **Anti-copia:** ninguna fila coincide con la fila de ejemplo de la rúbrica, `[(3 + 3) / 2] × 0.9 = 2.70`. El factor 3, único junto al 11 con IP 3 e Ir 3, usa p(x) = 0.88 y arroja 2.64."),
],
"fase3_priorizacion_conclusion.md": [
    ("| 2 | 3 | Económica | Res de $139 a $167/kg y carne +16.5 % en enero-2026 | 2.70 | A | alto |",
     "| 2 | 3 | Económica | Res de $139 a $167/kg y carne +16.5 % en enero-2026 | 2.64 | A | alto |"),
    ("| 2 | Alza del precio de la res: de $139 a $167/kg y +16.5 % en enero-2026 | 2.70 (alto, A) |",
     "| 2 | Alza del precio de la res: de $139 a $167/kg y +16.5 % en enero-2026 | 2.64 (alto, A) |"),
    ("de 139 a 167 pesos por kilo (2.70)", "de 139 a 167 pesos por kilo (2.64)"),
    ("suman 12.77 puntos frente a 8.86", "suman 12.71 puntos frente a 8.86"),
    ("dos decimales: 2.76 · 2.70 · 2.25", "dos decimales: 2.76 · 2.64 · 2.25"),
    ("6 amenazas concentran 12.77 de 21.63 puntos (59 %)", "6 amenazas concentran 12.71 de 21.57 puntos (59 %)"),
],
"build_docx_pestel.py": [
    ('"3", "−", "3", "0.90", "2.70", "A"', '"3", "−", "3", "0.88", "2.64", "A"'),
    ('("3", "Precio de la res", "0.90", "Alza ya observable en precio y en cuotas de importación, no previsión.")',
     '("3", "Precio de la res", "0.88", "Alza ya observable en precio y cuotas; el residuo es el margen de estabilización.")'),
    ('("2", "Alza del precio de la res: $139 a $167/kg (El Economista, 2026)", "2.70",',
     '("2", "Alza del precio de la res: $139 a $167/kg (El Economista, 2026)", "2.64",'),
    ("de 139 a 167 pesos por kilo (2.70)", "de 139 a 167 pesos por kilo (2.64)"),
    ("suman 12.77 puntos frente a 8.86 de las", "suman 12.71 puntos frente a 8.86 de las"),
],
"build_pptx_pestel.py": [
    ('("E", "Res de $139 a $167/kg; carne +16.5 % en enero", 0.90, 2.70, "A", "El Economista, 2026"),',
     '("E", "Res de $139 a $167/kg; carne +16.5 % en enero", 0.88, 2.64, "A", "El Economista, 2026"),'),
    ('("2", "Precio de la res", 2.70, "Económico"),', '("2", "Precio de la res", 2.64, "Económico"),'),
    ('("2.70", "Precio fijo con dos proveedores y tarifa semestral"),',
     '("2.64", "Precio fijo con dos proveedores y tarifa semestral"),'),
    ("Seis amenazas concentran 12.77 de 21.63 puntos.", "Seis amenazas concentran 12.71 de 21.57 puntos."),
],
}

fail = False
for fn, reps in JOBS.items():
    path = BASE + fn
    t = open(path, encoding="utf-8").read()
    for a, b in reps:
        if a not in t:
            print(f"  !! NO ENCONTRADO en {fn}: {a[:60]}...")
            fail = True
        else:
            t = t.replace(a, b, 1)
    open(path, "w", encoding="utf-8").write(t)
    print(f"  aplicado -> {fn}")
if fail:
    sys.exit(1)

c = ("El entorno 2027-2028 es desfavorable para VCV Cortes Finos, con ventanas de oportunidad reales. De los doce factores, seis son "
     "amenazas y seis oportunidades, pero el peso se concentra en las amenazas: los dos únicos impactos altos, la jornada de 46 horas "
     "desde 2027 (2.76) y el encarecimiento de la res de 139 a 167 pesos por kilo (2.64), junto con los medios de sequía (2.25), gusano "
     "barrenador (2.13) y extorsión (2.10), suman 12.71 puntos frente a 8.86 de las oportunidades, ninguna de las cuales supera 2.00. La "
     "presión recae de forma simultánea sobre el costo, que es 75 por ciento del producto, sobre la capacidad de 5,184 kilos mensuales y "
     "sobre la logística de frío. La implicación estratégica principal es que VCV no debe crecer por volumen: necesita proteger margen y "
     "asegurar suministro antes de escalar el canal digital.")
n = len(c.split())
print("conteo de palabras de la conclusión:", n)
for fn, a, b in [("fase3_priorizacion_conclusion.md", "**Conteo de palabras: 140**", f"**Conteo de palabras: {n}**"),
                 ("build_docx_pestel.py", 'para(doc, "(140 palabras)"', f'para(doc, "({n} palabras)"')]:
    t = open(BASE + fn, encoding="utf-8").read()
    if a not in t:
        print(f"  !! NO ENCONTRADO en {fn}: {a}")
        sys.exit(1)
    open(BASE + fn, "w", encoding="utf-8").write(t.replace(a, b, 1))
    print(f"  aplicado -> {fn} ({n} palabras)")
