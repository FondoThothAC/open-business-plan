#!/usr/bin/env python3
"""Genera Actividad_Individual_PESTEL_VCV.docx a partir de los entregables de las Fases 1-3.
Cifras y fuentes tomadas sin recálculo de fase2_matriz_pestel.md / fase3_priorizacion_conclusion.md."""
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt

OUT = "/Users/robertoeduardocelisrobles/Documents/Proyectos/OBP/docs/pestel_plan/Actividad_Individual_PESTEL_VCV.docx"

# ---------- datos inmutables (idénticos a Fase 1/2/3) ----------
MATRIX = [
    ("P", "Revisión conjunta del T-MEC (1-jul-2026): ANETIF pide eliminar aranceles y cuotas a la carne mexicana (El País México, 2026; BM Editores, 2026)", "2", "+", "1", "0.60", "0.90", "O"),
    ("P", "Extorsión: 6,562 denuncias en el 1S-2026 y 45.6 % de empresas afectadas; seguro de transporte al alza (Infobae/SESNSP-Coparmex, 2026)", "3", "−", "3", "0.70", "2.10", "A"),
    ("E", "Res de $139 a $167/kg entre 2024 y 2025; carne +16.5 % en enero-2026 por recorte a importaciones (Forbes/COMECARNE, 2025; El Economista, 2026)", "3", "−", "3", "0.88", "2.64", "A"),
    ("E", "Inflación de 3.69 % al cierre 2025 y 3.85 % esperada 2026-2027, con peso en ~17.2 ¢/USD (El Financiero/INEGI, 2026; Banxico, 2026)", "2", "+", "3", "0.65", "1.63", "O"),
    ("S", "Consumo de carne de 85.3 kg per cápita en 2025, 6º mundial, con demanda sobre la oferta (Consejo Mexicano de la Carne, 2026)", "3", "+", "2", "0.80", "2.00", "O"),
    ("S", "Hermosillo: 962,020 habitantes (31.8 % de Sonora) y edad mediana de 30 a 32 años (INEGI, Encuesta Intercensal 2025)", "2", "+", "2", "0.85", "1.70", "O"),
    ("T", "E-commerce de 941 mil mdp en 2025 (+19.2 %), 77.2 millones de compradores; despensa ya en línea (AMVO, 2026)", "3", "+", "2", "0.60", "1.50", "O"),
    ("T", "CoDi en 3 pasos, $135,000 sin alta y SPEI sin comisiones desde diciembre de 2026 (Banxico, 2026)", "2", "+", "1", "0.75", "1.13", "O"),
    ("Ecol", "Presas de Sonora al 13.2 % y Abelardo L. Rodríguez vacía en 2025: menos ganado en pie (Milenio, 2025)", "3", "−", "3", "0.75", "2.25", "A"),
    ("Ecol", "Gusano barrenador: 14,321 casos, 870 focos y 1.2 millones de cabezas varadas (SENASICA, vía El Imparcial, 2026)", "3", "−", "2", "0.85", "2.13", "A"),
    ("Legal", "Reforma LFT: jornada máxima de 46 h en 2027 y 44 h en 2028 (Diario Oficial de la Federación, 2026)", "3", "−", "3", "0.92", "2.76", "A"),
    ("Legal", "NOM-051 Fase III desde el 1-ene-2026 en preenvasados: paquetes al vacío y aderezos (Secretaría de Economía, 2025)", "2", "−", "1", "0.55", "0.83", "A"),
]
PX_JUST = [
    ("1", "T-MEC", "0.60", "La revisión conjunta ya se realizó el 1 de julio de 2026 y sigue en conversación, pero no existe aún un acuerdo cárneo firmado que elimine aranceles o cuotas, de modo que el beneficio para un comprador mexicano de cortes es posible, no seguro."),
    ("2", "Extorsión", "0.70", "Es una tendencia instalada y en su máximo para un primer semestre en once años, con denuncias en aumento desde 2024; se descuenta una parte porque no se dispone de una serie confirmada específica de Sonora."),
    ("3", "Precio de la res", "0.88", "No es una previsión sino una condición ya observable: el kilo pasó de $139 a $167 y las cuotas de importación sustituyeron a las licencias automáticas; el residuo de incertidumbre es el margen de estabilización que daría una normalización del flujo de Brasil."),
    ("4", "Inflación y tipo de cambio", "0.65", "La trayectoria reportada por el Banco de México es consistente entre el informe trimestral y la encuesta de especialistas, pero depende de decisiones de política monetaria y del anclaje cambiario, que pueden revertirse en 2027."),
    ("5", "Consumo de carne", "0.80", "El crecimiento lleva dos años documentados y la demanda nacional continúa por encima de la oferta interna, por lo que es razonable esperar que el nivel de consumo se mantenga en el horizonte analizado."),
    ("6", "Demografía de Hermosillo", "0.85", "Se trata de un hecho censal ya medido por la Encuesta Intercensal 2025 y no de una proyección: la estructura de edad y el tamaño del mercado local difícilmente se revierten en dos años."),
    ("7", "E-commerce", "0.60", "El canal crece a doble dígito a nivel nacional, pero la penetración de la despensa en línea sigue en 17.7 % y VCV no opera hoy ese canal, de modo que su aprovechamiento depende de una decisión propia de inversión."),
    ("8", "CoDi/SPEI", "0.75", "La medida de Banco de México está publicada con vigencia desde diciembre de 2026 y no requiere inversión relevante; la única variable pendiente es la adopción por parte de los clientes de restaurante y distribuidor."),
    ("9", "Sequía", "0.75", "El déficit de las presas sonorenses es estructural y se repite desde 2023, aunque las lluvias del huracán Polo revirtieron parcialmente el indicador, por lo que se asigna una probabilidad alta pero no cercana a uno."),
    ("10", "Barrenador", "0.85", "El brote sigue activo con 870 focos abiertos y la planta de moscas estériles apenas se encuentra en aceleración, así que es previsible que el restrin ganadero acompañe a la empresa durante 2027."),
    ("11", "Jornada 46 h", "0.92", "La obligación está publicada en el Diario Oficial desde el 1 de mayo de 2026 con un calendario forzoso por año; el único riesgo residual sería una prórroga legislativa, no la existencia de la reforma."),
    ("12", "NOM-051", "0.55", "La fase III está vigente desde el 1 de enero de 2026, pero la carne fresca de un solo ingrediente queda fuera del etiquetado frontal: solo alcanza a la línea empacada al vacío y a los aderezos de la empresa."),
]
TOP3 = [
    ("1", "Jornada de 46 horas semanales en 2027 (DOF, 2026)", "2.76",
     "Reprogramar el ASADHOR para mantener los 5,184 kg/mes dentro del tope legal: cuatro jornadas de 8 h de lunes a viernes más un medio turno de 6 h del sábado (46 exactas), con un operario de medio tiempo ($11,000/mes) en lugar de horas extra y anexos de horario firmados. Pilotos en el 4T-2026; operación plena el 1-febrero-2027."),
    ("2", "Alza del precio de la res: $139 a $167/kg (El Economista, 2026)", "2.64",
     "Blindar el insumo que es ~75 % del costo: acuerdo trimestral de precio fijo con Núñez Carnes por 3,000 kg/mes con tope de 8 %, homologar a Premium Carnes con 1,500 kg/mes y sustituir la lista anual por tarifa semestral atada al precio medio de COMECARNE (ene/jul), con 60 % de anticipo a restaurantes. Firmar en noviembre-diciembre de 2026."),
    ("3", "Estrés hídrico de Sonora: presas al 13.2 % (Milenio, 2025)", "2.25",
     "Calificar un segundo origen de canales fuera de la cuenca del Yaqui (Sinaloa o Chihuahua) por 800 kg/mes y mover 25 % de la mezcla del Rib-Eye hacia cortes económicos (diezmillo, asado de paleta) en paquetes familiares de 400 g. Decidir la compra antes del 30-junio-2027 y relanzar la línea económica en el 3T-2027."),
]
CONCLUSION = ("El entorno 2027-2028 es desfavorable para VCV Cortes Finos, con ventanas de oportunidad reales. "
 "De los doce factores, seis son amenazas y seis oportunidades, pero el peso se concentra en las amenazas: los dos únicos "
 "impactos altos, la jornada de 46 horas desde 2027 (2.76) y el encarecimiento de la res de 139 a 167 pesos por kilo (2.64), "
 "junto con los medios de sequía (2.25), gusano barrenador (2.13) y extorsión (2.10), suman 12.71 puntos frente a 8.86 de las "
 "oportunidades, ninguna de las cuales supera 2.00. La presión recae de forma simultánea sobre el costo, que es 75 por ciento del "
 "producto, sobre la capacidad de 5,184 kilos mensuales y sobre la logística de frío. La implicación estratégica principal es que "
 "VCV no debe crecer por volumen: necesita proteger margen y asegurar suministro antes de escalar el canal digital.")
FUENTES = [
    "Asociación Mexicana de Ventas Online. (2026). Estudio de Venta Online 2026. https://amvo.org.mx/descarga-evo-2026",
    "Banco de México. (2026). Informe trimestral abril-junio 2026. https://www.banxico.org.mx/publicaciones-y-prensa/resumenes-visuales/informe-trimestral-html/informe-trimestral-abr-jun-00005.html",
    "BM Editores. (2026). Propuestas del sector cárnico para optimizar el T-MEC. https://bmeditores.mx/entorno-pecuario/propuestas-del-sector-carnico-para-optimizar-el-t-mec/",
    "Consejo Mexicano de la Carne. (2026). Compendio estadístico 2026. https://comecarne.org/compendio26",
    "Diario Oficial de la Federación. (2026, 1 de mayo). Decreto por el que se reforman los artículos 59, 61, 66, 68, 69 y 71 de la Ley Federal del Trabajo, en materia de reducción de la jornada laboral. https://dof.gob.mx/nota_detalle.php?codigo=5786537&fecha=01/05/2026",
    "El Economista. (2026, 19 de febrero). Precio de la carne se dispara 16.5 % en enero; seguirá afectando el bolsillo del consumidor. https://www.eleconomista.com.mx/empresas/precio-carne-dispara-16-5-enero-seguira-afectando-bolsillo-consumidor-20260219-800697.html",
    "El Economista. (2026, 24 de septiembre). Pagos digitales: nuevo impulso a CoDi, cuentas de mayor monto desde diciembre. https://www.eleconomista.com.mx/sectorfinanciero/pagos-digitales-nuevo-impulso-codi-cuentas-mayor-monto-diciembre-20260924-835183.html",
    "El Financiero. (2026, 9 de enero). Inflación en México se desacelera a 3.69 % al cierre de 2025. https://www.elfinanciero.com.mx/economia/2026/01/09/inflacion-en-mexico-se-desacelera-a-369-al-cierre-de-2025/",
    "El Imparcial. (2026, 23 de enero). México acumula más de 14 mil casos de gusano barrenador del ganado y 870 focos activos. https://www.elimparcial.com/mexico/2026/01/23/mexico-acumula-mas-de-14-mil-casos-de-gusano-barrenador-del-ganado-y-870-focos-activos-senasica-acelera-una-planta-de-moscas-esteriles-en-chiapas-mientras-el-cierre-con-estados-unidos-impacta-al-sector/",
    "El País México. (2026, 1 de julio). México se juega su ventaja comercial en la revisión del T-MEC ante la renovada ofensiva de Trump. https://elpais.com/mexico/2026-07-01/mexico-se-juega-su-ventaja-comercial-en-la-revision-del-tmec-ante-la-renovada-ofensiva-de-trump.html",
    "Expreso. (2026). Sonora supera 3 millones de habitantes y envejece su población. https://www.expreso.com.mx/noticias/sonora/sonora-supera-3-millones-de-habitantes-y-envejece-su-poblacion/264995",
    "Forbes México. (2025). Precio de la carne de res ha subido más que el salario mínimo. https://forbes.com.mx/precio-de-la-carne-de-res-ha-subido-mas-que-el-salario-minimo-empresas/",
    "Infobae. (2026, 23 de septiembre). La extorsión ya condiciona decisiones de empresas: Coparmex reporta máximo de casos en 2026. https://www.infobae.com/mexico/2026/09/23/la-extorsion-ya-condiciona-decisiones-de-empresas-coparmex-reporta-record-de-casos-en-2026/",
    "Instituto Nacional de Estadística y Geografía. (2026). Encuesta Intercensal 2025: principales resultados por entidad (Boletín EIC2025). https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/ei/EIC2025-def_RR.pdf",
    "López, A. (2025). Sequía y cierre fronterizo golpea a sector ganadero en Sonora. Milenio. https://www.milenio.com/estados/sequia-cierre-fronterizo-golpea-sector-ganadero-sonora",
    "Secretaría de Economía y Secretaría de Salud. (2025, 9 de mayo). Amplían plazo de implementación sobre etiquetado nutrimental (NOM-051). https://www.gob.mx/se/prensa/secretaria-de-economia-y-la-secretaria-de-salud-amplian-plazo-de-implementacion-sobre-etiquetado-nutrimental?idiom=es-MX",
]

# ---------- helpers ----------
def shade(cell, hexcolor):
    el = OxmlElement("w:shd"); el.set(qn("w:val"), "clear"); el.set(qn("w:fill"), hexcolor)
    cell._tc.get_or_add_tcPr().append(el)

def repeat_header(row):
    trPr = row._tr.get_or_add_trPr()
    el = OxmlElement("w:tblHeader"); el.set(qn("w:val"), "true"); trPr.append(el)

def no_split(row):
    trPr = row._tr.get_or_add_trPr()
    el = OxmlElement("w:cantSplit"); trPr.append(el)

def cell_text(cell, text, size, bold=False, align=WD_ALIGN_PARAGRAPH.LEFT):
    p = cell.paragraphs[0]; p.text = ""
    run = p.add_run(text); run.font.size = Pt(size); run.bold = bold
    run.font.name = "Calibri"
    p.alignment = align
    p.paragraph_format.space_after = Pt(0); p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.line_spacing = 1.0
    return p

def fixed_layout(t, widths):
    """Forza anchos de columna reales (sin esto Word/LO autofit fragmenta el texto)."""
    tbl = t._tbl
    tblPr = tbl.tblPr
    layout = tblPr.find(qn("w:tblLayout"))
    if layout is None:
        layout = tblPr.makeelement(qn("w:tblLayout"), {})
        tblPr.append(layout)
    layout.set(qn("w:type"), "fixed")
    tblW = tblPr.find(qn("w:tblW"))
    if tblW is None:
        tblW = tblPr.makeelement(qn("w:tblW"), {})
        tblPr.append(tblW)
    tblW.set(qn("w:w"), str(int(sum(widths) * 1440))); tblW.set(qn("w:type"), "dxa")
    grid = tbl.find(qn("w:tblGrid"))
    if grid is not None:
        for gc, w in zip(grid.findall(qn("w:gridCol")), widths):
            gc.set(qn("w:w"), str(int(w * 1440)))
    for row in t.rows:
        for cell, w in zip(row.cells, widths):
            cell.width = Inches(w)


def add_table(doc, header, rows, widths, size=8.5, header_size=8.5, center_cols=()):
    t = doc.add_table(rows=1, cols=len(header)); t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False
    for i, h in enumerate(header):
        shade(t.rows[0].cells[i], "D9E2F3")
        cell_text(t.rows[0].cells[i], h, header_size, bold=True,
                  align=WD_ALIGN_PARAGRAPH.CENTER if i in center_cols else WD_ALIGN_PARAGRAPH.LEFT)
    repeat_header(t.rows[0])
    for r in rows:
        cells = t.add_row().cells
        no_split(t.rows[-1])
        for i, v in enumerate(r):
            cell_text(cells[i], str(v), size,
                      align=WD_ALIGN_PARAGRAPH.CENTER if i in center_cols else WD_ALIGN_PARAGRAPH.LEFT)
    fixed_layout(t, widths)
    return t

def para(doc, text, size=11, bold=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, after=6, indent=None):
    p = doc.add_paragraph(); run = p.add_run(text)
    run.font.size = Pt(size); run.bold = bold; run.font.name = "Calibri"
    p.alignment = align; p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.15
    if indent is not None:
        p.paragraph_format.left_indent = Inches(indent[0]); p.paragraph_format.first_line_indent = Inches(indent[1])
    return p

def heading(doc, text):
    p = doc.add_paragraph(); run = p.add_run(text)
    run.bold = True; run.font.size = Pt(12); run.font.name = "Calibri"
    p.paragraph_format.space_before = Pt(10); p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True

def field(paragraph, code):
    r = paragraph.add_run(); fld = OxmlElement("w:fldSimple"); fld.set(qn("w:instr"), code)
    r._r.addnext(fld)

# ---------- documento ----------
doc = Document()
st = doc.styles["Normal"]; st.font.name = "Calibri"; st.font.size = Pt(11)

sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.5), Inches(11)  # Carta
sec.left_margin = sec.right_margin = Cm(2.0); sec.top_margin = sec.bottom_margin = Cm(2.0)
sec.different_first_page_header_footer = True

# numeración de página en pie (desde la página 2 en adelante)
footer_p = sec.footer.paragraphs[0]; footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
field(footer_p, "PAGE"); footer_p.runs[0].font.size = Pt(9)

# PORTADA
for _ in range(3):
    doc.add_paragraph()
para(doc, "Actividad Individual", 16, True, WD_ALIGN_PARAGRAPH.CENTER, 2)
para(doc, "Análisis PESTEL de una empresa real", 14, False, WD_ALIGN_PARAGRAPH.CENTER, 24)
para(doc, "VCV Cortes Finos SA de CV", 20, True, WD_ALIGN_PARAGRAPH.CENTER, 6)
para(doc, "Cortes finos de res · Hermosillo, Sonora · Horizonte 2027-2028", 11, False, WD_ALIGN_PARAGRAPH.CENTER, 36)
para(doc, "Materia: Gestión Empresarial", 12, False, WD_ALIGN_PARAGRAPH.CENTER, 6)
para(doc, "Autor: Roberto Eduardo Celis Robles", 12, False, WD_ALIGN_PARAGRAPH.CENTER, 6)
para(doc, "Fecha de entrega: 13 de octubre de 2026", 12, False, WD_ALIGN_PARAGRAPH.CENTER, 6)
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# 1. DELIMITACIÓN
heading(doc, "1. Delimitación de la empresa")
para(doc, "VCV Cortes Finos SA de CV es una microempresa de la industria cárnica que transforma cortes finos de res "
          "—Rib-Eye Prime de 400 g como producto ancla, más Tomahawk, Cowboy, T-Bone, New York y cortes económicos— mediante "
          "asado, pasteurización y empaque al alto vacío, en una sola máquina ASADHOR con capacidad instalada de 5,184 kg/mes. "
          "Atiende un mercado B2B premium: distribuidores y carnicerías gourmet aportan 64.6 % de su plan de ventas (3,348 kg/mes) "
          "y restaurantes 35.4 % (1,836 kg/mes), con venta adicional al público consumidor. Se ubica en la zona industrial de "
          "Hermosillo, Sonora, ciudad que concentra 962,020 habitantes según la Encuesta Intercensal 2025 del INEGI. El análisis "
          "cubre el horizonte 2027-2028, período en el que la empresa debe consolidar su planta y su cartera de clientes, con un "
          "precio de mayoreo de $963/kg sobre un costo total de $663/kg, donde la pieza básica representa alrededor de 75 %.")

# 2. MATRIZ
heading(doc, "1.1 Alcance y método")
para(doc, "El análisis cubre únicamente el entorno externo de la empresa en el horizonte 2027-2028 y no evalúa recursos, "
          "capacidades ni decisiones internas, salvo cuando sirven para dimensionar la repercusión de un factor. Se seleccionaron "
          "doce factores, dos por dimensión, priorizando aquellos con fuente pública verificable publicada entre octubre de 2024 y "
          "octubre de 2026: boletines oficiales (Diario Oficial de la Federación, INEGI, Banco de México, SENASICA, Secretaría de Economía), "
          "informes sectoriales (Consejo Mexicano de la Carne, AMVO) y prensa económica especializada. Cada candidato que no pudo "
          "sostenerse con una fecha y un medio verificables fue descartado antes de la calificación, y ningún enunciado se copió del "
          "ejemplo de la unidad. La calificación es propia: los valores de importancia, incidencia y probabilidad reflejan la escala "
          "de una microempresa con un solo equipo de cocción y dos proveedores de canales, no la de una procesadora industrial.")
heading(doc, "2. Matriz PESTEL")
para(doc, "Se identificaron doce factores, dos por cada dimensión. El impacto se calculó con la fórmula de la unidad: "
          "Impacto = [(IP + Ir) / 2] × p(x), donde IP es la importancia y Ir la incidencia o repercusión (escala de 1 a 3) y "
          "p(x) la probabilidad (de 0 a 1). Ejemplo de cálculo, correspondiente al factor 11: [(3 + 3) / 2] × 0.92 = 2.76. "
          "Clasificación: alto ≥ 2.50, medio 1.50-2.49, bajo < 1.50. O = oportunidad, A = amenaza.", 10, after=6)
add_table(doc,
          ["Dim.", "Factor y fuente", "IP", "T", "Ir", "p(x)", "Impacto", "O/A"],
          MATRIX, [0.45, 3.83, 0.35, 0.30, 0.35, 0.50, 0.75, 0.45],
          size=9, header_size=9, center_cols=(0, 2, 3, 4, 5, 6, 7))
para(doc, "Tabla 1. Matriz PESTEL de VCV Cortes Finos SA de CV. Fuente: elaboración propia con las fuentes citadas.", 8.5,
     align=WD_ALIGN_PARAGRAPH.LEFT, after=8)
para(doc, "La lectura de la matriz muestra un entorno asimétrico: seis factores son amenazas y seis son oportunidades, pero las "
          "amenazas concentran 12.71 de los 21.57 puntos totales de impacto y aportan los dos únicos casos clasificados como altos "
          "(2.76 y 2.64). Ninguna oportunidad alcanza ese nivel: la de mayor impacto es el consumo récord de carne, con 2.00. Los "
          "tres factores bajos corresponden a medidas aún sin efecto operativo para la empresa —la revisión del T-MEC, los pagos "
          "digitales y la fase III de la NOM-051 aplicada a preenvasados—, mientras que los siete medios dibujan una presión de "
          "costos y de abasto sostenida a lo largo de todo el horizonte. Las probabilidades se calcularon de forma diferenciada: "
          "oscilan entre 0.55 y 0.92 y son más altas cuando el hecho ya está medido o publicado y más bajas cuando depende de una "
          "decisión de política pública o de adopción comercial.")

heading(doc, "2.1 Justificación de la probabilidad p(x)")
add_table(doc, ["N.º", "Factor", "p(x)", "Justificación"],
          [(a, b, c, d) for a, b, c, d in PX_JUST], [0.40, 1.50, 0.50, 4.50], size=9, center_cols=(0, 2))

# 3. PRIORIZACIÓN
heading(doc, "3. Priorización y decisiones")
para(doc, "Los factores se ordenaron por impacto descendente. Los dos únicos impactos altos y el más alto de los medios "
          "concentran la presión sobre el costo del insumo, la capacidad de la planta y el abasto, por lo que definen la agenda "
          "de la microempresa en 2027-2028.", 10, after=6)
add_table(doc, ["N.º", "Factor", "Impacto", "Decisión propuesta"],
          TOP3, [0.40, 1.60, 0.60, 4.30], size=9, center_cols=(0, 2))
para(doc, "Tabla 2. Top-3 de factores y decisiones. Las tres son ejecutables con un solo ASADHOR, 5-7 puestos y dos "
          "proveedores ya identificados en el plan de negocios; no requieren abrir sucursales ni endeudamiento mayor.", 8.5, after=8)
para(doc, "Las tres decisiones comparten un mismo criterio: atacar el factor y no el síntoma. La jornada de 46 horas no se atiende "
          "reduciendo producción, sino rediseñando el calendario para conservar los 5,184 kg/mes dentro del tope legal; el precio de "
          "la res no se traslada de inmediato al cliente, sino que se cubre con precio fijo, segunda fuente y tarifa indexada; y la "
          "sequía no se espera, se anticipa con un origen fuera de la cuenca del Yaqui y una mezcla de producto menos expuesta al "
          "corte ancla. El orden no cambia el diagnóstico: los tres factores golpean en 2027, por lo que las acciones se programan "
          "entre el cuarto trimestre de 2026 y el tercer trimestre de 2027.")

# 4. CONCLUSIÓN
heading(doc, "4. Conclusión")
para(doc, CONCLUSION, 11)
para(doc, "(140 palabras)", 9, align=WD_ALIGN_PARAGRAPH.RIGHT, after=0)

# 5. FUENTES (comienza en página aparte para que el cuerpo ocupe sus 3 cuartillas completas)
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
heading(doc, "5. Fuentes")
for f in FUENTES:
    para(doc, f, 10, align=WD_ALIGN_PARAGRAPH.LEFT, after=4, indent=(0.5, -0.5))

doc.save(OUT)
print("OK ->", OUT)
PY_LINES = None
