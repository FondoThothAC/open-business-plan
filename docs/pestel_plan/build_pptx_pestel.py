#!/usr/bin/env python3
"""PESTEL_VCV.pptx — 8 diapositivas 16:9. Semáforo y cifras idénticos a fase2_matriz_pestel.md.
Reglas aplicadas: <=30 palabras por diapositiva (salvo matrices y fuentes) y cuerpo >=18 pt."""
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

OUT = "/Users/robertoeduardocelisrobles/Documents/Proyectos/OBP/docs/pestel_plan/PESTEL_VCV.pptx"
BG = RGBColor(0xF7, 0xF5, 0xF1); TEXT = RGBColor(0x1F, 0x2A, 0x38); NAVY = RGBColor(0x16, 0x32, 0x4F)
CARD = RGBColor(0xFF, 0xFF, 0xFF); BORDER = RGBColor(0xD8, 0xD3, 0xCB); MUTED = RGBColor(0x5B, 0x66, 0x72)
RED = RGBColor(0xC0, 0x39, 0x2B); AMBER = RGBColor(0xE0, 0xA3, 0x2E); GREEN = RGBColor(0x2E, 0x7D, 0x5B)
WHITE = RGBColor(0xFF, 0xFF, 0xFF); PALE = RGBColor(0xC9, 0xD7, 0xE4); NAVY2 = RGBColor(0x2C, 0x55, 0x7C)
PX = 1 / 96.0


def color_for(imp):
    return RED if imp >= 2.5 else (AMBER if imp >= 1.5 else GREEN)


def flat(shp):
    """Quita la sombra del estilo de tema (rubrica: sin efectos)."""
    shp.shadow.inherit = False
    style = shp._element.find(qn('p:style'))
    if style is None:
        style = shp._element.find(qn('a:style'))
    if style is not None:
        eff = style.find(qn('a:effectRef'))
        if eff is not None:
            eff.set('idx', '0')
    return shp


prs = Presentation(); prs.slide_width = Inches(1280 * PX); prs.slide_height = Inches(720 * PX)
blank = prs.slide_layouts[6]


def slide():
    s = prs.slides.add_slide(blank)
    r = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    r.fill.solid(); r.fill.fore_color.rgb = BG; r.line.fill.background(); flat(r)
    return s


def box(s, x, y, w, h, text=None, size=14, bold=False, color=TEXT, align=PP_ALIGN.LEFT,
        shape=None, fill=None, line=None, anchor=MSO_ANCHOR.TOP, spacing=1.05):
    shp = s.shapes.add_shape(shape or MSO_SHAPE.RECTANGLE, Inches(x * PX), Inches(y * PX), Inches(w * PX), Inches(h * PX))
    shp.fill.solid(); shp.fill.fore_color.rgb = fill if fill is not None else CARD
    if line is not None:
        shp.line.color.rgb = line; shp.line.width = Pt(0.75)
    else:
        shp.line.fill.background()
    flat(shp)
    tf = shp.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0.06); tf.margin_top = tf.margin_bottom = Inches(0.03)
    tf.vertical_anchor = anchor
    if text is not None:
        for i, ln in enumerate(text.split("\n")):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            p.alignment = align; p.line_spacing = spacing
            r = p.add_run(); r.text = ln
            r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color; r.font.name = "Calibri"
    return shp


def txt(s, x, y, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=1.05):
    shp = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x * PX), Inches(y * PX), Inches(w * PX), Inches(h * PX))
    shp.fill.background(); shp.line.fill.background(); flat(shp)
    tf = shp.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.line_spacing = spacing
        for spec in para:
            r = p.add_run(); r.text = spec["text"]
            r.font.size = Pt(spec.get("size", 18)); r.font.bold = spec.get("bold", False)
            r.font.color.rgb = spec.get("color", TEXT); r.font.name = spec.get("font", "Calibri")
            r.font.italic = spec.get("italic", False)
    return shp


def title(s, text, sub=None):
    txt(s, 70, 40, 900, 52, [[{"text": text, "size": 30, "bold": True, "color": NAVY}]])
    if sub:
        txt(s, 70, 92, 900, 30, [[{"text": sub, "size": 18, "color": MUTED}]])


def legend(s, y=644):
    box(s, 70, y + 5, 14, 14, shape=MSO_SHAPE.OVAL, fill=RED)
    txt(s, 90, y, 130, 26, [[{"text": "Alto", "size": 18, "color": TEXT}]])
    box(s, 180, y + 5, 14, 14, shape=MSO_SHAPE.OVAL, fill=AMBER)
    txt(s, 200, y, 140, 26, [[{"text": "Medio", "size": 18, "color": TEXT}]])
    box(s, 300, y + 5, 14, 14, shape=MSO_SHAPE.OVAL, fill=GREEN)
    txt(s, 320, y, 130, 26, [[{"text": "Bajo", "size": 18, "color": TEXT}]])
    txt(s, 700, y, 510, 26, [[{"text": "Impacto = [(IP+Ir)/2] × p(x)", "size": 18, "color": MUTED}]], align=PP_ALIGN.RIGHT)


# ---------- 1. PORTADA (26 palabras) ----------
s = slide()
box(s, 800, 0, 480, 720, fill=NAVY)
txt(s, 90, 150, 660, 40, [[{"text": "Actividad individual", "size": 20, "color": MUTED}]])
txt(s, 90, 196, 680, 130, [[{"text": "Análisis PESTEL", "size": 54, "bold": True, "color": NAVY}]])
txt(s, 90, 300, 680, 56, [[{"text": "VCV Cortes Finos SA de CV", "size": 30, "bold": True, "color": TEXT}]])
txt(s, 90, 362, 680, 40, [[{"text": "Hermosillo, Sonora", "size": 22, "color": TEXT}]])
box(s, 90, 420, 610, 1, fill=BORDER)
txt(s, 90, 440, 680, 40, [[{"text": "Horizonte 2027-2028", "size": 22, "bold": True, "color": NAVY2}]])
txt(s, 90, 500, 680, 40, [[{"text": "12 factores", "size": 22, "color": TEXT}]])
txt(s, 90, 620, 680, 60, [[{"text": "Roberto Celis", "size": 18, "color": MUTED}],
                          [{"text": "Octubre 2026", "size": 18, "color": MUTED}]])
for i, d in enumerate(["P", "E", "S", "T", "E", "L"]):
    box(s, 840 + (i % 2) * 210, 120 + (i // 2) * 170, 190, 140, d, size=44, bold=True, color=WHITE,
        shape=MSO_SHAPE.ROUNDED_RECTANGLE, fill=NAVY2, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# ---------- 2. EMPRESA Y DELIMITACIÓN (24 palabras) ----------
s = slide(); title(s, "Delimitación")
txt(s, 70, 120, 1140, 130, [[{"text": "Microempresa cárnica premium", "size": 26, "bold": True, "color": TEXT}],
                            [{"text": "Cortes finos de res al alto vacío", "size": 26, "bold": True, "color": TEXT}],
                            [{"text": "Hermosillo, Sonora", "size": 26, "bold": True, "color": TEXT}]], spacing=1.25)
chips = [("5,184", "kg/mes"), ("64.6 %", "distribuidores"), ("35.4 %", "restaurantes"), ("962,020", "Hermosillo")]
for i, (big, small) in enumerate(chips):
    x = 70 + i * 291
    box(s, x, 330, 271, 210, shape=MSO_SHAPE.ROUNDED_RECTANGLE, fill=CARD, line=BORDER)
    txt(s, x + 20, 372, 231, 56, [[{"text": big, "size": 34, "bold": True, "color": NAVY}]], align=PP_ALIGN.CENTER)
    txt(s, x + 20, 446, 231, 60, [[{"text": small, "size": 18, "color": MUTED}]], align=PP_ALIGN.CENTER)
txt(s, 70, 588, 1140, 40, [[{"text": "Horizonte 2027-2028", "size": 22, "bold": True, "color": NAVY2}]])

# ---------- 3 y 4. MATRICES (exentas de límite de palabras) ----------
MATRIZ = [
    ("P", "Revisión T-MEC: ANETIF pide quitar aranceles cárnicos", 0.60, 0.90, "O", "El País, 2026"),
    ("P", "Extorsión: 6,562 denuncias en el primer semestre", 0.70, 2.10, "A", "SESNSP-Coparmex, 2026"),
    ("E", "Res de $139 a $167/kg; carne +16.5 % en enero", 0.88, 2.64, "A", "El Economista, 2026"),
    ("E", "Inflación 3.69 % y peso en ~17.2 por dólar", 0.65, 1.63, "O", "INEGI-Banxico, 2026"),
    ("S", "85.3 kg de carne por persona: 6º consumidor mundial", 0.80, 2.00, "O", "COMECARNE, 2026"),
    ("S", "Edad mediana de Hermosillo sube de 30 a 32 años", 0.85, 1.70, "O", "INEGI, 2026"),
    ("T", "E-commerce de 941 mil mdp; despensa ya en línea", 0.60, 1.50, "O", "AMVO, 2026"),
    ("T", "CoDi en 3 pasos y SPEI sin comisiones", 0.75, 1.13, "O", "Banxico, 2026"),
    ("Ec", "Presas de Sonora al 13.2 %; Hermosillo, vacía", 0.75, 2.25, "A", "Milenio, 2025"),
    ("Ec", "Barrenador: 14,321 casos y 1.2 millones de cabezas", 0.85, 2.13, "A", "SENASICA, 2026"),
    ("L", "Jornada de 46 horas en 2027 y 44 en 2028", 0.92, 2.76, "A", "Diario Oficial, 2026"),
    ("L", "NOM-051 Fase III en preenvasados y aderezos", 0.55, 0.83, "A", "Economía, 2025"),
]
for lbl, subset in [("Matriz P · E · S", MATRIZ[0:6]), ("Matriz T · E · L", MATRIZ[6:12])]:
    s = slide(); title(s, lbl)
    legend(s)
    for i, (dim, factor, px, imp, oa, src) in enumerate(subset):
        col, row = i % 3, i // 3
        x, y = 70 + col * 388, 116 + row * 246
        box(s, x, y, 368, 240, shape=MSO_SHAPE.ROUNDED_RECTANGLE, fill=CARD, line=BORDER)
        box(s, x + 18, y + 16, 46, 34, dim, size=16, bold=True, color=WHITE, shape=MSO_SHAPE.ROUNDED_RECTANGLE,
            fill=NAVY, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        txt(s, x + 72, y + 20, 278, 30, [[{"text": ("amenaza" if oa == "A" else "oportunidad") + f" · p(x) {px:.2f}",
            "size": 15, "bold": True, "color": RED if oa == "A" else GREEN}]], align=PP_ALIGN.RIGHT)
        txt(s, x + 18, y + 60, 332, 80, [[{"text": factor, "size": 15, "color": TEXT}]], spacing=1.1)
        txt(s, x + 18, y + 150, 332, 26, [[{"text": src, "size": 14, "italic": True, "color": MUTED}]])
        box(s, x + 18, y + 184, 332, 40, shape=MSO_SHAPE.ROUNDED_RECTANGLE, fill=color_for(imp))
        cls = "alto" if imp >= 2.5 else ("medio" if imp >= 1.5 else "bajo")
        txt(s, x + 30, y + 190, 120, 28, [[{"text": f"{imp:.2f}", "size": 18, "bold": True, "color": WHITE}]])
        txt(s, x + 150, y + 192, 192, 28, [[{"text": cls, "size": 16, "color": WHITE}]], align=PP_ALIGN.RIGHT)

# ---------- 5. TOP-3 (28 palabras) ----------
s = slide(); title(s, "Top-3 por impacto")
for i, (n, factor, imp, src) in enumerate([("1", "Jornada de 46 horas", 2.76, "Legal"),
                                           ("2", "Precio de la res", 2.64, "Económico"),
                                           ("3", "Sequía en Sonora", 2.25, "Ecológico")]):
    y = 140 + i * 176
    box(s, 70, y, 1140, 152, shape=MSO_SHAPE.ROUNDED_RECTANGLE, fill=CARD, line=BORDER)
    box(s, 70, y, 130, 152, n, size=48, bold=True, color=WHITE, shape=MSO_SHAPE.RECTANGLE, fill=NAVY,
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    txt(s, 232, y + 30, 640, 50, [[{"text": factor, "size": 28, "bold": True, "color": TEXT}]])
    txt(s, 232, y + 88, 640, 36, [[{"text": src + " · amenaza", "size": 18, "color": MUTED}]])
    box(s, 950, y + 26, 230, 100, f"{imp:.2f}", size=40, bold=True, color=WHITE, shape=MSO_SHAPE.ROUNDED_RECTANGLE,
        fill=color_for(imp), align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# ---------- 6. DECISIONES (27 palabras) ----------
s = slide(); title(s, "Decisiones")
for i, (tag, dec) in enumerate([("2.76", "Reprogramar el ASADHOR a 46 horas desde febrero"),
                                ("2.64", "Precio fijo con dos proveedores y tarifa semestral"),
                                ("2.25", "Segundo origen de canales y línea económica")]):
    y = 150 + i * 164
    box(s, 70, y, 1140, 140, shape=MSO_SHAPE.ROUNDED_RECTANGLE, fill=CARD, line=BORDER)
    box(s, 92, y + 34, 150, 72, tag, size=24, bold=True, color=WHITE, shape=MSO_SHAPE.ROUNDED_RECTANGLE,
        fill=color_for(float(tag)), align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    txt(s, 268, y + 44, 920, 60, [[{"text": dec, "size": 24, "bold": True, "color": TEXT}]])

# ---------- 7. CONCLUSIÓN (22 palabras) ----------
s = slide()
box(s, 0, 0, 1280, 720, fill=NAVY)
txt(s, 90, 170, 1100, 60, [[{"text": "Entorno 2027-2028", "size": 28, "color": PALE}]])
txt(s, 90, 238, 1100, 130, [[{"text": "Desfavorable,", "size": 54, "bold": True, "color": WHITE}],
                            [{"text": "con ventanas de oportunidad", "size": 44, "bold": True, "color": PALE}]], spacing=1.1)
box(s, 90, 420, 1100, 1, fill=NAVY2)
txt(s, 90, 450, 1100, 120, [[{"text": "Seis amenazas concentran 12.71 de 21.57 puntos.", "size": 24, "color": WHITE}],
                            [{"text": "Proteger margen y suministro antes de escalar.", "size": 24, "color": WHITE}]], spacing=1.35)

# ---------- 8. FUENTES (exenta) ----------
s = slide(); title(s, "Fuentes (APA 7)")
FUENTES = ["Asociación Mexicana de Ventas Online. (2026). Estudio de Venta Online 2026.",
"BM Editores. (2026). Propuestas del sector cárnico para optimizar el T-MEC.",
"Consejo Mexicano de la Carne. (2026). Compendio estadístico 2026.",
"Diario Oficial de la Federación. (2026, 1 de mayo). Decreto que reforma los arts. 59, 61, 66, 68, 69 y 71 de la LFT.",
"El Economista. (2026, 19 de febrero). Precio de la carne se dispara 16.5 % en enero.",
"El Economista. (2026, 24 de septiembre). Pagos digitales: nuevo impulso a CoDi.",
"El Financiero. (2026, 9 de enero). Inflación se desacelera a 3.69 % al cierre de 2025.",
"El Imparcial. (2026, 23 de enero). Más de 14 mil casos de gusano barrenador.",
"El País México. (2026, 1 de julio). México se juega su ventaja comercial en la revisión del T-MEC.",
"Expreso. (2026). Sonora supera 3 millones de habitantes y envejece su población.",
"Forbes México. (2025). Precio de la carne de res ha subido más que el salario mínimo.",
"Infobae. (2026, 23 de septiembre). La extorsión ya condiciona decisiones de empresas.",
"Banco de México. (2026). Informe trimestral abril-junio 2026.",
"Instituto Nacional de Estadística y Geografía. (2026). Encuesta Intercensal 2025.",
"López, A. (2025). Sequía y cierre fronterizo golpean al sector ganadero de Sonora.",
"Secretaría de Economía. (2025, 9 de mayo). Amplían plazo del etiquetado nutrimental (NOM-051)."]
for col in range(2):
    paras = [[{"text": t, "size": 13, "color": TEXT}] for t in FUENTES[col * 8:(col + 1) * 8]]
    txt(s, 70 + col * 580, 120, 545, 540, paras, spacing=1.15)
txt(s, 70, 664, 1140, 30, [[{"text": "URL completas en el documento Word, sección 5.", "size": 13, "italic": True, "color": MUTED}]])

prs.save(OUT)
print("OK ->", OUT, "| diapositivas:", len(prs.slides._sldIdLst))
