#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BackstageRED MASTER COMPLETO v5 (Definitivo)
- 4 Carriles Swimlane: Contratante, Backend+BD, Contratado, Admin Fondo Thoth AC
- Perfil Estilo Instagram / Facebook con Universal Header (Avatar, Banner, Semáforo de Reputación,
  Badge SHA-256 inmutable, Feed de publicaciones/Reels, Likes, Eventos Verificados)
- Carpetas de Proyecto / Moodboards Inteligentes (Guardar para un futuro, comparar precios, bundle checkout)
- Calendario de Auditoría Inmutable (Penalización del 20% por cancelación + Strike visible + Sello permanente)
- Escrow Polimórfico de 3 Modalidades:
    1. Shows en vivo / Conciertos: 2 Hitos (50/50 + PIN 4 dígitos)
    2. Bodas / Bautizos / Sociales: 3 Hitos (30% apartado / 40% insumos 15d antes / 30% finiquito con PIN)
    3. Cine / TV / Streaming / Doblaje: Pagos por Hitos de Entrega (Milestones) y Jornadas
- 10 CLUSTERS de la Industria del Entretenimiento con 125 oficios de élite.
- Nodos nativos yEd (flowchart.process, decision, database, document, manualInput, predefinedProcess, terminator)
"""
import os
import xml.etree.ElementTree as ET

OUTPUT = "/Users/robertoeduardocelisrobles/Documents/Proyectos/backstage-red/diagrams/BackstageRED_MASTER_COMPLETO_v5.graphml"

# ── COORDENADAS X POR CARIL ──────────────────────────────────
X_C  = 30     # Contratante
X_B  = 530    # Backend + BD
X_T  = 1030   # Contratado
X_A  = 1530   # Admin Fondo Thoth AC
W    = 360    # Ancho estándar de nodo
HDR  = 75     # Alto del header de carril

# ── PALETA DE COLORES ─────────────────────────────────────────
CC  = {"fill":"#0a1f33","border":"#00b4d8","font":"#d0f0ff","fill2":"#061524"} # Contratante (Azul Neón)
CB  = {"fill":"#061a12","border":"#06d6a0","font":"#d0ffe8","fill2":"#03100b"} # Backend (Verde Neón)
CT  = {"fill":"#180628","border":"#c020ff","font":"#f4d4ff","fill2":"#0f031a"} # Contratado (Magenta Neón)
CA  = {"fill":"#1a1400","border":"#ffd000","font":"#fffbd0","fill2":"#120e00"} # Admin (Dorado)
CP  = {"fill":"#280808","border":"#ff3333","font":"#ffcccc","fill2":"#1a0404"} # Pendiente Backlog (Rojo)
CDB = {"fill":"#081626","border":"#3a88d4","font":"#b0d4f8","fill2":"#040e1a"} # BD Cilindro (Azul Base)
CEX = {"fill":"#1a1000","border":"#ff9900","font":"#ffe6b8","fill2":"#100a00"} # Servicio Externo (Naranja)
CSK = {"fill":"#061806","border":"#38b000","font":"#b7ef8c","fill2":"#030f03"} # Éxito / OK
CER = {"fill":"#200606","border":"#e63946","font":"#ffb3ba","fill2":"#140303"} # Error / Fallo
CGOLD={"fill":"#2a1f00","border":"#ffb703","font":"#fff3b0","fill2":"#181200"} # Ledger / Cripto

nc = [0]; ec = [0]; NX = []; EX = []

def nid(): nc[0] += 1; return f"n{nc[0]}"
def eid(): ec[0] += 1; return f"e{ec[0]}"
def esc(s): return str(s).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

def gn(lbl, x, y, w=W, h=52, cfg="com.yworks.flowchart.process",
       fill="#061a12", border="#06d6a0", font="#d0ffe8", fs=9, bold=False, pending=False):
    _id = nid()
    if pending: fill, border, font = CP["fill"], CP["border"], CP["font"]
    fw = "bold" if bold else "plain"
    NX.append(
        f'<node id="{_id}"><data key="d6">'
        f'<y:GenericNode configuration="{cfg}">'
        f'<y:Geometry x="{x}" y="{y}" width="{w}" height="{h}"/>'
        f'<y:Fill color="{fill}" color2="{fill}" transparent="false"/>'
        f'<y:BorderStyle color="{border}" raised="false" type="line" width="2.0"/>'
        f'<y:NodeLabel alignment="center" autoSizePolicy="node_width" fontFamily="Courier New" '
        f'fontSize="{fs}" fontStyle="{fw}" hasBackgroundColor="false" hasLineColor="false" '
        f'height="{h-4}" horizontalTextPosition="center" iconTextGap="4" modelName="internal" '
        f'modelPosition="c" textColor="{font}" verticalTextPosition="center" '
        f'visible="true" xml:space="preserve"><![CDATA[{esc(lbl)}]]></y:NodeLabel>'
        f'</y:GenericNode></data></node>'
    )
    return _id, y + h

def db(lbl, x, y, w=W, h=56, pending=False):
    fill = CDB["fill"]; border = CDB["border"]; font = CDB["font"]
    if pending: fill, border, font = CP["fill"], CP["border"], CP["font"]
    return gn(lbl, x, y, w, h, "com.yworks.flowchart.dataBase", fill, border, font)

def doc(lbl, x, y, w=W, h=50, ok=True):
    p = CSK if ok else CER
    return gn(lbl, x, y, w, h, "com.yworks.flowchart.document", p["fill"], p["border"], p["font"])

def inp(lbl, x, y, w=W, h=50, pal=None, pending=False, bold=False):
    p = pal or CC
    fill = CP["fill"] if pending else p["fill"]
    border = CP["border"] if pending else p["border"]
    font = CP["font"] if pending else p["font"]
    return gn(lbl, x, y, w, h, "com.yworks.flowchart.manualInput", fill, border, font, bold=bold)

def ext(lbl, x, y, w=W, h=50, pending=False):
    fill = CP["fill"] if pending else CEX["fill"]
    border = CP["border"] if pending else CEX["border"]
    font = CP["font"] if pending else CEX["font"]
    return gn(lbl, x, y, w, h, "com.yworks.flowchart.predefinedProcess", fill, border, font)

def term(lbl, x, y, w=W, h=45, pal=None):
    if isinstance(h, dict):
        pal = h
        h = 45
    p = pal or CB
    return gn(lbl, x, y, w, h, "com.yworks.flowchart.terminator", p["fill"], p["border"], p["font"], bold=True)

def dec(lbl, x, y, w=220, h=65, pal=None):
    p = pal or CB
    cx = x + W/2 - w/2
    return gn(lbl, cx, y, w, h, "com.yworks.flowchart.decision", p["fill"], p["border"], p["font"], fs=9, bold=True)

def proc(lbl, x, y, w=W, h=54, pal=None, pending=False, bold=False):
    p = pal or CB
    return gn(lbl, x, y, w, h, "com.yworks.flowchart.process", p["fill"], p["border"], p["font"], pending=pending, bold=bold)

def sec_hdr(label, x, y, w=W, pal=None):
    p = pal or CB
    _id = nid()
    NX.append(
        f'<node id="{_id}"><data key="d6"><y:GenericNode configuration="BevelNode2">'
        f'<y:Geometry x="{x}" y="{y}" width="{w}" height="32"/>'
        f'<y:Fill color="{p["fill2"]}" color2="{p["fill"]}" transparent="false"/>'
        f'<y:BorderStyle color="{p["border"]}" raised="false" type="line" width="2.5"/>'
        f'<y:NodeLabel alignment="center" fontFamily="Courier New" fontSize="10" fontStyle="bold" '
        f'textColor="{p["border"]}" modelName="internal" modelPosition="c" '
        f'autoSizePolicy="node_width"><![CDATA[{esc(label)}]]></y:NodeLabel>'
        f'</y:GenericNode></data></node>'
    )
    return _id, y + 32

def lane_hdr(title, x, y, w=W, pal=None):
    p = pal or CB
    _id = nid()
    NX.append(
        f'<node id="{_id}"><data key="d6"><y:GenericNode configuration="BevelNode3">'
        f'<y:Geometry x="{x}" y="{y}" width="{w}" height="{HDR}"/>'
        f'<y:Fill color="{p["fill2"]}" color2="{p["fill"]}" transparent="false"/>'
        f'<y:BorderStyle color="{p["border"]}" raised="false" type="line" width="3.0"/>'
        f'<y:NodeLabel alignment="center" fontFamily="Courier New" fontSize="13" fontStyle="bold" '
        f'textColor="{p["border"]}" modelName="internal" modelPosition="c" '
        f'xml:space="preserve"><![CDATA[{esc(title)}]]></y:NodeLabel>'
        f'</y:GenericNode></data></node>'
    )
    return _id

def clu_hdr(label, x, y, w=W, cf="#1a2a1a", cb="#2a6a2a"):
    _id = nid()
    NX.append(
        f'<node id="{_id}"><data key="d6"><y:GenericNode configuration="com.yworks.flowchart.display">'
        f'<y:Geometry x="{x}" y="{y}" width="{w}" height="42"/>'
        f'<y:Fill color="{cf}" color2="{cf}" transparent="false"/>'
        f'<y:BorderStyle color="{cb}" raised="false" type="line" width="2.5"/>'
        f'<y:NodeLabel alignment="center" fontFamily="Courier New" fontSize="11" fontStyle="bold" '
        f'textColor="#e8ffe8" modelName="internal" modelPosition="c">'
        f'<![CDATA[{esc(label)}]]></y:NodeLabel>'
        f'</y:GenericNode></data></node>'
    )
    return _id, y + 42

def ed(src, tgt, lbl="", async_=False, color="#4a9a7a", thick=False):
    _id = eid(); lt = "dashed" if async_ else "line"; lw = "2.5" if thick else "1.5"
    ll = f'<y:EdgeLabel fontFamily="Courier New" fontSize="8" textColor="#99ccaa" modelName="two_pos" modelPosition="head" visible="true"><![CDATA[{esc(lbl)}]]></y:EdgeLabel>' if lbl else ""
    EX.append(
        f'<edge id="{_id}" source="{src}" target="{tgt}"><data key="d10">'
        f'<y:PolyLineEdge>'
        f'<y:LineStyle color="{color}" type="{lt}" width="{lw}"/>'
        f'<y:Arrows source="none" target="standard"/>'
        f'<y:BendStyle smoothed="true"/>{ll}'
        f'</y:PolyLineEdge></data></edge>'
    )

print("Iniciando construcción del Diagrama Maestro BackstageRED v5...")

# ── 1. CABECERAS DE CARRILES ─────────────────────────────────
lane_hdr("👤 CONTRATANTE\n(Quien contrata, novios, productores, público)", X_C, 0, W, CC)
lane_hdr("⚙️ BACKEND + BD\nAPI Go | PostgreSQL 16 | Ledger SHA-256", X_B, 0, W, CB)
lane_hdr("🎭 CONTRATADO\n(10 Clusters · 125 Oficios · Perfil Social)", X_T, 0, W, CT)
lane_hdr("👑 ADMIN FONDO THOTH AC\n(Modo Dios · Disputas · Auditoría Negritos en Arroz)", X_A, 0, W, CA)

proc("LEYENDA v5 (MASTER INTEGRAL)\n"
     "AZUL=Contratante | VERDE=Backend+BD | MAGENTA=Contratado | DORADO=Admin\n"
     "10 CLUSTERS (125 oficios): Conciertos, Cine/TV, Doblaje, Bodas/Sociales,\n"
     "Alfombras Rojas, Streaming/Internet, Circo/Teatro, Staff, Venues, Legal\n"
     "INMUTABILIDAD: Reseñas Escrow SHA-256 | Semáforo Reputación | Penalización 20% y Strike\n"
     "ESCROW POLIMÓRFICO: [1] Shows 50/50 [2] Social 30/40/30 [3] Cine/Streaming Hitos",
     X_A + W + 80, 10, w=420, h=85,
     pal={"fill":"#050d14","border":"#2a5a7a","font":"#80bbdd","fill2":"#050d14"})

Y = HDR + 30

# =============================================================
# SECCIÓN 1: AUTENTICACIÓN & CHECK CONECTIVIDAD
# =============================================================
sec_hdr("[ SEC 1 ] AUTENTICACIÓN MULTIRROL & PWA", X_C, Y, W, CC)
sec_hdr("[ SEC 1 ] AUTH API · JWT · 2FA", X_B, Y, W, CB)
sec_hdr("[ SEC 1 ] ONBOARDING DE TALENTO", X_T, Y, W, CT)
sec_hdr("[ SEC 1 ] ACCESO MODO DIOS", X_A, Y, W, CA)
Y += 42

c_start, Ycs = term("INICIO APP\n[SplashScreen.jsx]", X_C, Y, W, CC)
t_start, Yts = term("INICIO APP\n[SplashScreen.jsx]", X_T, Y, W, CT)
a_start, Yas = term("ACCESO ADMIN\n/admin/login", X_A, Y, W, CA)
b_health, Yb = db("GET /api/health\nBD: SELECT 1 FROM pg_stat_activity\n-> 200 {status:ok, cluster_nodes:3}", X_B, Y)
ed(c_start, b_health, "GET /health", color=CC["border"])
ed(t_start, b_health, "GET /health", color=CT["border"])
Y = max(Ycs, Yts, Yas, Yb) + 12

# Decisiones de cuenta
d_has_c, Ydhc = dec("¿Tiene cuenta\nactiva?", X_C, Y, pal=CC)
d_has_t, Ydht = dec("¿Tiene cuenta\nactiva?", X_T, Y, pal=CT)
Y = max(Ydhc, Ydht) + 10

# Registros
c_reg_v, Ycrv = proc("[RegisterPage.jsx]\nFormulario Contratante\nNombre, Email, WhatsApp, Preferencias", X_C, Y, pal=CC)
c_reg_b, Ycrb = inp("[BTN] REGISTRARSE\nPOST /api/v1/auth/register", X_C, Ycrv+5, pal=CC)
t_reg_v, Ytrv = proc("[TalentRegisterPage.jsx]\nFormulario de Talento\nSelección de Vertical (10 Clusters) + Oficio", X_T, Y, pal=CT)
t_reg_b, Ytrb = inp("[BTN] CREAR PERFIL PROFESIONAL\nPOST /api/v1/auth/register-talent", X_T, Ytrv+5, pal=CT)
b_reg1, Ybr = db("INSERT INTO usuarios(nombre,email,hash_pwd,rol)\nINSERT INTO perfiles(user_id,oficio_id,cluster_id,reputacion='VERDE',strikes=0)\nINSERT INTO ledger_reputacion(user_id,sha256_hash)", X_B, Y)
b_reg_ok, Ybr = doc("201 {user_id, token_jwt, ledger_address}\nEmail de bienvenida y verificación enviado", X_B, Ybr+5, ok=True)

ed(d_has_c, c_reg_v, "NO", color=CC["border"]); ed(c_reg_v, c_reg_b, color=CC["border"])
ed(d_has_t, t_reg_v, "NO", color=CT["border"]); ed(t_reg_v, t_reg_b, color=CT["border"])
ed(c_reg_b, b_reg1, "POST", color=CC["border"]); ed(t_reg_b, b_reg1, "POST", color=CT["border"])
ed(b_reg1, b_reg_ok, color=CSK["border"])
Y = max(Ycrb, Ytrb, Ybr) + 12

# Logins
c_log_v, Yclv = proc("[LoginPage.jsx]\nLogin Contratante\nEmail / WhatsApp + Password", X_C, Y, pal=CC)
c_log_b, Yclb = inp("[BTN] INICIAR SESIÓN\nPOST /api/v1/auth/login", X_C, Yclv+5, pal=CC)
t_log_v, Ytlv = proc("[LoginPage.jsx]\nLogin Talento\nEmail + Password", X_T, Y, pal=CT)
t_log_b, Ytlb = inp("[BTN] INICIAR SESIÓN\nPOST /api/v1/auth/login", X_T, Ytlv+5, pal=CT)
b_log1, Ybl = db("SELECT u.*, p.cluster_id, p.reputacion, p.strikes\nFROM usuarios u LEFT JOIN perfiles p ON u.id=p.user_id\nWHERE u.email=? AND bcrypt(password)", X_B, Y)
b_log_ok, Ybl = doc("200 {token_jwt, user_id, rol, semaforo:VERDE, strikes:0}", X_B, Ybl+5, ok=True)
ed(d_has_c, c_log_v, "SÍ", color=CC["border"]); ed(c_log_v, c_log_b, color=CC["border"])
ed(d_has_t, t_log_v, "SÍ", color=CT["border"]); ed(t_log_v, t_log_b, color=CT["border"])
ed(c_log_b, b_log1, "POST", color=CC["border"]); ed(t_log_b, b_log1, "POST", color=CT["border"])
ed(b_log1, b_log_ok, color=CSK["border"])

# Admin login
a_log_v, Yalv = proc("[AdminLoginPage.jsx]\nAcceso Modo Dios Fondo Thoth\nCredenciales + Llave Criptográfica", X_A, Y, pal=CA)
a_log_b, Yalb = inp("[BTN] VALIDAR MODO DIOS\nPOST /api/v1/admin/auth", X_A, Yalv+5, pal=CA)
a_dash, Yad = proc("[AdminMasterDashboard.jsx]\nPANEL MASTER FONDO THOTH AC\nMonitor de Negritos en Arroz · Escrow · Disputas", X_A, Yalb+5, pal=CA, bold=True)
ed(a_start, a_log_v, color=CA["border"]); ed(a_log_v, a_log_b, color=CA["border"]); ed(a_log_b, a_dash, color=CA["border"])

Y = max(Yclb, Ytlb, Ybl, Yad) + 20

# =============================================================
# SECCIÓN 2: PERFIL SOCIAL ESTILO INSTAGRAM / FACEBOOK
# =============================================================
sec_hdr("[ SEC 2 ] PERFIL SOCIAL TIPO INSTAGRAM/FB", X_T, Y, W, CT)
sec_hdr("[ SEC 2 ] LEDGER INMUTABLE SHA-256 · FEED API", X_B, Y, W, CB)
sec_hdr("[ SEC 2 ] EXPLORACIÓN Y FAVORITOS", X_C, Y, W, CC)
Y += 42

t_soc_head, Ytsh = proc(
    "[UniversalProfileHeader.jsx]\n"
    "📸 Avatar & Banner | 🟢 Semáforo: VERDE (0 strikes)\n"
    "🔐 Sello Criptográfico SHA-256 Verificado\n"
    "⭐ Rating: 4.98 (87 eventos) | ❤️ 1,420 Likes",
    X_T, Y, pal=CT, bold=True
)

t_soc_tabs, Ytst = proc(
    "[ProfileTabNavigator.jsx]\n"
    "Pestaña 1: Muro de Fotos & Reels (Estilo IG)\n"
    "Pestaña 2: Calendario Público de Eventos\n"
    "Pestaña 3: Reseñas Escrow Inmutables (No borrables)\n"
    "Pestaña 4: Especialidad Técnica (según Cluster)",
    X_T, Ytsh+5, pal=CT
)

b_soc_api, Ybsoc = db(
    "GET /api/v1/perfiles/{id}/social-feed\n"
    "BD: SELECT p.*, u.avatar, l.sha256_hash, l.strikes_count\n"
    "FROM perfiles p JOIN ledger_reputacion l ON p.id=l.perfil_id\n"
    "BD: SELECT * FROM publicaciones WHERE perfil_id=? ORDER BY created_at DESC\n"
    "BD: SELECT * FROM escrow_reviews WHERE perfil_id=? (INMUTABLE)",
    X_B, Y
)

# Interacción del Contratante con el Perfil Social
c_view_soc, Ycvs = proc(
    "[TalentSocialView.jsx]\n"
    "Navegando perfil del talento estilo Instagram\n"
    "Ver videos, escuchar demos, revisar opiniones reales",
    X_C, Y, pal=CC
)

c_btn_like, Ycbl = inp(
    "[BTN] DAR LIKE A PUBLICACIÓN\n"
    "POST /api/v1/perfiles/{id}/posts/{post_id}/like",
    X_C, Ycvs+5, pal=CC
)

ed(t_soc_head, t_soc_tabs, color=CT["border"])
ed(t_soc_head, b_soc_api, "GET social", color=CT["border"])
ed(c_view_soc, c_btn_like, color=CC["border"])
ed(c_btn_like, b_soc_api, "POST like", color=CC["border"])

Y = max(Ytst, Ybsoc, Ycbl) + 15

# =============================================================
# SECCIÓN 3: CARPETAS DE PROYECTO / MOODBOARDS (GUARDAR PARA FUTURO)
# =============================================================
sec_hdr("[ SEC 3 ] CARPETAS DE EVENTO / MOODBOARDS", X_C, Y, W, CC)
sec_hdr("[ SEC 3 ] MOODBOARDS API · COMPARADOR", X_B, Y, W, CB)
Y += 42

c_save_modal, Ycsm = proc(
    "[SaveToProjectModal.jsx]\n"
    "📁 'Guardar en Carpeta de Evento'\n"
    "Seleccionar o crear: 'Mi Boda 2027', 'Casting Película', 'Bautizo Mateo'\n"
    "Añadir nota interna privada del cliente",
    X_C, Y, pal=CC
)

c_save_btn, Ycsb = inp(
    "[BTN] GUARDAR EN CARPETA\n"
    "POST /api/v1/moodboards/{id}/talents\n"
    "Body: {perfil_id, notas_privadas, categoria_evento}",
    X_C, Ycsm+5, pal=CC
)

b_mood_db, Ybmd = db(
    "INSERT INTO moodboard_items(moodboard_id, perfil_id, notas)\n"
    "SELECT precio_base, semaforo, division FROM perfiles WHERE id=?\n"
    "-> 201 {moodboard_item_id, total_guardados: 6}",
    X_B, Y
)

c_mood_board, Ycmb = proc(
    "[EventMoodboardView.jsx]\n"
    "📊 Comparador de Presupuesto Lado a Lado\n"
    "Mariachi A ($8,000) vs Mariachi B ($9,500)\n"
    "Semáforo de cada uno | Disponibilidad cruzada\n"
    "🔘 [BTN] COTIZAR / CONTRATAR PAQUETE EN BUNDLE",
    X_C, Ycsb+5, pal=CC, bold=True
)

ed(c_save_modal, c_save_btn, color=CC["border"])
ed(c_save_btn, b_mood_db, "POST", color=CC["border"])
ed(c_save_btn, c_mood_board, color=CC["border"])

Y = max(Ycmb, Ybmd) + 20

# =============================================================
# SECCIÓN 4: CALENDARIO DE AUDITORÍA & NEGRITOS EN EL ARROZ
# =============================================================
sec_hdr("[ SEC 4 ] CALENDARIO AUDITORÍA & NO-SHOWS", X_T, Y, W, CT)
sec_hdr("[ SEC 4 ] MOTOR DE INTEGRIDAD · PENALIZACIÓN 20%", X_B, Y, W, CB)
sec_hdr("[ SEC 4 ] MONITOREO DE DISPUTAS Y STRIKES", X_A, Y, W, CA)
Y += 42

t_cal_view, Ytcv = proc(
    "[PublicAuditCalendar.jsx]\n"
    "📅 Calendario Público Inalterable\n"
    "🟩 Fechas Verificadas (Eventos cumplidos)\n"
    "🟥 Cancelación / No-Show ('Negrito en el arroz')\n"
    "⬜ Días disponibles para contratación",
    X_T, Y, pal=CT, bold=True
)

d_cancel_event, Ydce = dec(
    "¿Artista cancela\no falta al evento?",
    X_T, Ytcv+5, pal=CT
)

t_cancel_trigger, Ytct = inp(
    "[BTN] CANCELAR EVENTO CONFIRMADO\n"
    "POST /api/v1/calendar/event/{id}/cancel\n"
    "Advertencia: Aplica penalización financiera y strike público",
    X_T, Ydce+5, pal=CP, pending=True
)

b_penalty_db, Ybpd = db(
    "TRANSACCIÓN ATÓMICA DE INDEMNIZACIÓN:\n"
    "1. Descontar 20% del valor del contrato de la Bóveda del Artista\n"
    "2. Transferir el 20% al Contratante como reparación inmediata\n"
    "3. Reembolsar el 100% del Escrow retenido al cliente\n"
    "4. Marcar fecha: 'CANCELACIÓN DE ÚLTIMO MOMENTO / NO-SHOW'\n"
    "5. INSERT INTO strikes(perfil_id, motivo, fecha)\n"
    "6. Actualizar Semáforo: Si strikes >= 3 -> ROJO (SUSPENSIÓN)",
    X_B, Y
)

a_negritos_alert, Yana = proc(
    "[BadAppleMonitor.jsx] (Modo Dios Admin)\n"
    "🚨 Alerta de Negrito en el Arroz disparada\n"
    "Artista con Strike #2 registrado\n"
    "Botón: Suspender Cuenta | Solicitar Justificación Médica",
    X_A, Y, pal=CA, bold=True
)

ed(t_cal_view, d_cancel_event, color=CT["border"])
ed(d_cancel_event, t_cancel_trigger, "SÍ cancela", color=CER["border"])
ed(t_cancel_trigger, b_penalty_db, "POST cancel", color=CER["border"])
ed(b_penalty_db, a_negritos_alert, "PUSH alerta", color=CA["border"], async_=True)

Y = max(Ytct, Ybpd, Yana) + 25

# =============================================================
# SECCIÓN 5: MOTOR DE ESCROW POLIMÓRFICO (3 MODALIDADES)
# =============================================================
sec_hdr("[ SEC 5 ] CHECKOUT ESCROW POLIMÓRFICO", X_C, Y, W, CC)
sec_hdr("[ SEC 5 ] SMART ESCROW ENGINE · 3 MODOS", X_B, Y, W, CB)
Y += 42

c_checkout_type, Ycct = proc(
    "[PolymorphicEscrowModal.jsx]\n"
    "Detección automática de la modalidad según el tipo de servicio:\n"
    "• Show / Concierto -> Modalidad 1 (50/50)\n"
    "• Boda / Fiesta / Bautizo -> Modalidad 2 (30/40/30)\n"
    "• Cine / TV / Streaming / Doblaje -> Modalidad 3 (Hitos)",
    X_C, Y, pal=CC, bold=True
)

# Modalidad 1
m1_node, Ym1 = proc(
    "MODALIDAD 1: SHOW EN VIVO / CONCIERTOS (2 Hitos)\n"
    "• 50% Anticipo al reservar (Bóveda Escrow protegida)\n"
    "• 50% Finiquito en el evento con PIN de 4 dígitos",
    X_C, Ycct+5, pal=CC
)

# Modalidad 2
m2_node, Ym2 = proc(
    "MODALIDAD 2: BODAS, BAUTIZOS Y SOCIALES (3 Hitos)\n"
    "• 30% Apartado de fecha (Garantía de bloqueo)\n"
    "• 40% Pago de insumos y logística (15 días antes)\n"
    "• 30% Finiquito al arribo del festejo con PIN 4 dígitos",
    X_C, Ym1+5, pal=CC, bold=True
)

# Modalidad 3
m3_node, Ym3 = proc(
    "MODALIDAD 3: CINE, TV, STREAMING Y AUDIO (Por Hitos)\n"
    "• Hito 1: Aprobación de casting / Scouting\n"
    "• Hito 2: Jornadas de rodaje / Grabación en cabina\n"
    "• Hito 3: Entrega de corte máster / WAV 24bit auditado",
    X_C, Ym2+5, pal=CC
)

b_escrow_poly_db, Ybep = db(
    "POST /api/v1/escrow/polymorphic/create\n"
    "BD: INSERT INTO bookings(contratante_id, contratado_id, modalidad_escrow)\n"
    "BD: INSERT INTO escrow_milestones(booking_id, hito_num, porcentaje, status)\n"
    "IF modalidad=2 (Social): crear 3 hitos con fechas automáticas\n"
    "IF modalidad=3 (Producción): crear hitos ligados a entregables S3\n"
    "-> 201 {booking_id, escrow_id, plan_pagos: []}",
    X_B, Y
)

ed(c_checkout_type, m1_node, color=CC["border"])
ed(c_checkout_type, m2_node, color=CC["border"])
ed(c_checkout_type, m3_node, color=CC["border"])
ed(m2_node, b_escrow_poly_db, "POST checkout", color=CC["border"])

Y = max(Ym3, Ybep) + 25

# =============================================================
# SECCIÓN 6: MATRIZ DE 10 CLUSTERS Y 125 OFICIOS DE ÉLITE
# =============================================================
sec_hdr("[ SEC 6 ] 10 CLUSTERS · 125 OFICIOS DE ÉLITE", X_T, Y, W, CT)
sec_hdr("[ SEC 6 ] BD OFICIOS · APIs DE ESPECIALIDAD", X_B, Y, W, CB)
Y += 42

CLUSTERS_V5 = [
    ("1. MÚSICA EN VIVO & CONCIERTOS (16 oficios)", "#0a1f0a", "#00ff88", [
        ("Músico / Instrumentista", "setlist, rider técnico", "RiderTecnicoUploader.jsx", "POST /api/v1/music/rider"),
        ("Cantante Solista", "demo reel, registro vocal", "AudioDemoPlayer.jsx", "POST /api/v1/music/demos"),
        ("DJ / Productor Musical", "tracklist, rider DJ", "DJEquipmentForm.jsx", "POST /api/v1/music/dj-setup"),
        ("Banda / Conjunto Musical", "integrantes, stage plot", "BandManagerForm.jsx", "POST /api/v1/music/band-roster"),
        ("Compositor / Letrista", "catálogo obras, INDAUTOR", "CompositorPortfolio.jsx", "POST /api/v1/music/indautor"),
        ("Arreglista Musical", "partituras, DAW preferido", "ArreglistaForm.jsx", "PUT /api/v1/music/skills"),
        ("Productor Musical de Estudio", "créditos discográficos, reel", "ProductorReelUpload.jsx", "POST /api/v1/music/studio-reel"),
        ("Manager Artístico", "roster representado", "ManagerRosterForm.jsx", "GET /api/v1/music/roster"),
        ("Road Manager / Tour Manager", "historial de giras, visas", "TourManagerCV.jsx", "PUT /api/v1/music/tour-cv"),
        ("Locutor de Radio Comercial", "demo locución, franjas", "LocutorDemoPlayer.jsx", "POST /api/v1/music/radio-demos"),
        ("Productor de Estación de Radio", "parrilla programas producidos", "RadioProductorPortfolio.jsx", "POST /api/v1/music/radio-portfolio"),
        ("Influencer Musical", "métricas Spotify / TikTok", "InfluencerStats.jsx", "GET /api/v1/music/socials"),
        ("Podcaster de Entretenimiento", "episodios, demografía", "PodcastEpisodes.jsx", "GET /api/v1/music/podcast-stats"),
        ("Community Manager Artístico", "estrategias de lanzamiento", "CommunityMetrics.jsx", "GET /api/v1/music/community"),
        ("Compositor de OST Videojuegos", "soundtracks dinámicos, audio", "OSTPortfolio.jsx", "POST /api/v1/music/ost-games"),
        ("Agente de IA Musical", "modelos entrenados, prompts", "AIAgentConfig.jsx", "POST /api/v1/music/ai-demo"),
    ]),
    ("2. CINE, TV & SERIES (PRODUCCIÓN & SINDICATOS) (16 oficios)", "#1f0d00", "#ff8800", [
        ("Director de Cine / TV", "filmografía, reel dramático", "DirectorReel.jsx", "POST /api/v1/cinema/director-reel"),
        ("Actor / Actriz (Casting)", "book, medidas, self-tapes", "ActorBook.jsx", "POST /api/v1/cinema/actor-profile"),
        ("Coordinador de Intimidad", "protocolos consentimiento", "IntimacyProtocol.jsx", "POST /api/v1/cinema/intimacy-plan"),
        ("Coordinador de Stunts / Dobles", "seguro de riesgo, dobles", "StuntSafetyChecklist.jsx", "POST /api/v1/cinema/stunts-safety"),
        ("Location Manager (Locacionista)", "catálogo locaciones, permisos", "LocationScoutingMap.jsx", "POST /api/v1/cinema/locations"),
        ("Director de Fotografía (DF)", "lookbook visual, cámaras", "DFPortfolio.jsx", "POST /api/v1/cinema/df-portfolio"),
        ("Operador de Cámara / Steadicam", "equipos estabilizados, carrete", "CamaraOperatorForm.jsx", "PUT /api/v1/cinema/camera-crew"),
        ("Gaffer (Jefe de Luces)", "camión de luces, generador", "GafferLightingOrder.jsx", "POST /api/v1/cinema/gaffer-order"),
        ("Key Grip & Dolly", "maquinaria, rieles, grúas", "GripEquipmentForm.jsx", "PUT /api/v1/cinema/grip-crew"),
        ("Script Supervisor (Continuista)", "hojas de reporte, notas tomas", "ScriptSupervisionLog.jsx", "POST /api/v1/cinema/continuity-log"),
        ("Editor de Cine / TV", "cortes, software offline/online", "EditorReel.jsx", "POST /api/v1/cinema/editor-reel"),
        ("Director de Arte / Set Dresser", "bocetos, paleta de color", "DirectorArtePortfolio.jsx", "POST /api/v1/cinema/art-direction"),
        ("Diseñador de Efectos Especiales", "SFX prácticos, pirotecnia", "SFXPracticalForm.jsx", "POST /api/v1/cinema/sfx-practical"),
        ("Artista de VFX / CGI", "breakdown VFX, modelado 3D", "VFXReelUpload.jsx", "POST /api/v1/cinema/vfx-reel"),
        ("Catering Móvil de Rodaje", "menús para llamado, dietas", "FilmCateringPlan.jsx", "POST /api/v1/cinema/catering-plan"),
        ("Extra / Figurante Masivo", "tallas, disponibilidad llamados", "ExtraDisponibilidad.jsx", "PUT /api/v1/cinema/extras-call"),
    ]),
    ("3. DOBLAJE, LOCUCIÓN & AUDIO INMERSIVO (9 oficios)", "#0a0a28", "#9d4edd", [
        ("Actor de Doblaje", "banco de voces, sincronía ADR", "VoiceActorDemos.jsx", "POST /api/v1/dubbing/voice-actor"),
        ("Actriz de Doblaje", "voces infantiles/animé, ADR", "VoiceActressForm.jsx", "POST /api/v1/dubbing/voice-actress"),
        ("Director de Doblaje", "reparto voces, control sala", "DoblajeDirForm.jsx", "PUT /api/v1/dubbing/director-setup"),
        ("Ingeniero de Sala de Doblaje", "cabinas SourceConnect / DAW", "CabinaConectaForm.jsx", "POST /api/v1/dubbing/remote-booth"),
        ("Locutor Comercial de Marca", "spots publicitarios, tonos", "LocutorSpotDemos.jsx", "POST /api/v1/dubbing/commercial-spots"),
        ("Narrador de Audiolibros", "resistencia vocal, acentos", "NarradorSamples.jsx", "POST /api/v1/dubbing/audiobook-demos"),
        ("Coacher Vocal de Actores", "técnicas colocación de voz", "CoacherForm.jsx", "PUT /api/v1/dubbing/vocal-coaching"),
        ("Adaptador de Guiones Doblaje", "métrica labial, traducción", "AdaptadorPortfolio.jsx", "POST /api/v1/dubbing/lip-sync-scripts"),
        ("Tecnólogo de Audio Inmersivo", "mezcla Dolby Atmos 7.1.4", "DolbyAtmosPortfolio.jsx", "POST /api/v1/dubbing/dolby-atmos"),
    ]),
    ("4. EVENTOS SOCIALES, BODAS & BAUTIZOS (15 oficios)", "#260a1f", "#ff4d6d", [
        ("Mariachi Tradicional de Gala", "repertorio serenata, trajes", "FolkMusicBandModal.jsx", "POST /api/v1/social/mariachi"),
        ("Wedding & Event Planner", "cronograma nupcial, minuto a min", "EventPlannerTimeline.jsx", "PUT /api/v1/social/wedding-plan"),
        ("Banda Versátil para Bodas", "tandas baile, vals, souvernirs", "WeddingBandRider.jsx", "POST /api/v1/social/wedding-band"),
        ("Trío Romántico / Acústico", "música sacra para misa, cóctel", "TrioAcousticForm.jsx", "POST /api/v1/social/trio-acoustic"),
        ("Grupo Norteño / Sierreño", "cancionero, equipo audio propio", "NortenoBandForm.jsx", "POST /api/v1/social/norteno-band"),
        ("Fotocabina 360 / Photobooth", "videos 360, marcos con logo", "PhotoboothBooking.jsx", "POST /api/v1/social/photobooth"),
        ("Animador Infantil / Payaso Show", "rutinas familiares, magia niños", "KidsShowCatalog.jsx", "GET /api/v1/social/kids-show"),
        ("Show de Botargas Oficiales", "coreografías infantiles, fotos", "BotargasShowForm.jsx", "POST /api/v1/social/character-show"),
        ("Bartender & Mixólogo de Fiesta", "barra libre móvil, cristalería", "MixologyBarConfig.jsx", "POST /api/v1/social/mixology-bar"),
        ("Maestro de Vals (XV Años)", "10 ensayos, edición de vals", "ChoreographerBooking.jsx", "PUT /api/v1/social/quince-waltz"),
        ("Pistas Iluminadas & Pirotecnia", "pista cristal LED, chisperos fríos", "PartyEquipmentRental.jsx", "POST /api/v1/social/dancefloor-sfx"),
        ("Letras Gigantes 3D & Decoración", "letras luminosas LOVE/XV, arcos", "GiantLettersDecor.jsx", "POST /api/v1/social/letters-decor"),
        ("Mago para Bautizos y Comunión", "magia de cerca, humor familiar", "FamilyMagicianForm.jsx", "POST /api/v1/social/family-magic"),
        ("Chef Banquetero de Bodas", "degustación menú 3 tiempos", "WeddingBanquetForm.jsx", "POST /api/v1/social/banquet-menu"),
        ("Fotógrafo de Bodas y XV Años", "trash the dress, álbum de piel", "WeddingPhotoBook.jsx", "POST /api/v1/social/wedding-photos"),
    ]),
    ("5. ALFOMBRAS ROJAS, GALAS & PROTOCOLO VIP (10 oficios)", "#261a00", "#ffb703", [
        ("Coordinador de Alfombra Roja", "runsheet llegadas, vallas, orden", "RedCarpetRunsheet.jsx", "POST /api/v1/gala/red-carpet-run"),
        ("Jefe de Prensa & Junkets (EPK)", "acreditación medios, media kit", "PressCredentialHub.jsx", "POST /api/v1/gala/press-accredit"),
        ("Fotógrafo de Photocall / Step", "fotos en alta sincronizadas", "PhotocallLiveFeed.jsx", "POST /api/v1/gala/photocall-sync"),
        ("Stylist de Celebridades", "préstamo joyería y alta costura", "CelebrityWardrobe.jsx", "PUT /api/v1/gala/celebrity-style"),
        ("Escolta VIP Blindado", "resguardo en traslados, armas", "VIPTransportSecurity.jsx", "POST /api/v1/gala/vip-escort"),
        ("Chofer Ejecutivo de Gala", "vehículos suburban / blindaje", "ExecutiveDriverForm.jsx", "POST /api/v1/gala/executive-driver"),
        ("Host / Conductor de Alfombra", "entrevistas en vivo, idiomas", "RedCarpetHostCard.jsx", "GET /api/v1/gala/red-carpet-hosts"),
        ("Asistente Personal de Celebridad", "coordinación camerino, agenda", "PersonalAssistantForm.jsx", "PUT /api/v1/gala/celebrity-assistant"),
        ("Maquillador de Alta Gama / Gala", "retoques en vivo, aerografía", "CelebrityMakeupForm.jsx", "POST /api/v1/gala/celebrity-makeup"),
        ("Agente de RP (Relaciones Públicas)", "colocación de talento en notas", "PublicRelationsAgent.jsx", "POST /api/v1/gala/pr-placement"),
    ]),
    ("6. INTERNET, STREAMING & DIGITAL (12 oficios)", "#001a26", "#00b4d8", [
        ("Streamer (Twitch / YouTube)", "estadísticas viewers, sponsors", "StreamerHireModal.jsx", "POST /api/v1/digital/streamer-hire"),
        ("VTuber (Avatar 2D / 3D Rigged)", "tracking facial, modelo live2d", "VTuberPortfolio.jsx", "POST /api/v1/digital/vtuber-assets"),
        ("Operador OBS / vMix Broadcast", "RTMP multicámara, transiciones", "StreamEngineerForm.jsx", "POST /api/v1/digital/broadcast-setup"),
        ("Editor de Shorts / TikToks Exprés", "entrega <2h de clips virales", "ShortsEditorQueue.jsx", "POST /api/v1/digital/fast-clips"),
        ("Diseñador de Overlays & Emotes", "paquetes Twitch, alertas animadas", "StreamAssetsUploader.jsx", "POST /api/v1/digital/stream-assets"),
        ("Moderador Profesional de Live Chat", "defensa contra raids/bots, reglas", "ChatModeratorHire.jsx", "POST /api/v1/digital/moderator-hire"),
        ("Productor Técnico de Esports", "servidores dedicados, casters", "EsportsProducerForm.jsx", "POST /api/v1/digital/esports-producer"),
        ("Ingeniero de Audio para Stream", "VST plugins, compresión en vivo", "StreamAudioSetup.jsx", "PUT /api/v1/digital/stream-audio"),
        ("Community Manager de Directos", "clip management, engagement", "StreamCommunityManager.jsx", "GET /api/v1/digital/stream-community"),
        ("Operador de Multistreaming Restream", "retransmisión 5 plataformas", "RestreamConfigForm.jsx", "POST /api/v1/digital/restream-setup"),
        ("Creador de Filtros AR (IG / TikTok)", "efectos realidad aumentada 3D", "ARFiltersPortfolio.jsx", "POST /api/v1/digital/ar-filters"),
        ("Iluminador de Set para Streamers", "luces RGB, keylights, difusores", "StreamLightingSetup.jsx", "PUT /api/v1/digital/stream-lights"),
    ]),
    ("7. ARTES ESCÉNICAS, CIRCO & COMEDIA (12 oficios)", "#1a0026", "#d90429", [
        ("Artista de Circo / Acróbata Aéreo", "telas, trapecio, póliza seguro", "CircoActosUpload.jsx", "POST /api/v1/stage/circus-acts"),
        ("Mago / Ilusionista de Escenario", "grandes ilusiones, asistentes", "MagoShowUpload.jsx", "POST /api/v1/stage/stage-magic"),
        ("Bailarín / Coreógrafo Escénico", "repertorio contemporáneo/urbano", "DanzaReel.jsx", "POST /api/v1/stage/choreography-reel"),
        ("Stand Up Comedian Profesional", "rutina 45min, temas a la medida", "StandUpClips.jsx", "POST /api/v1/stage/standup-clips"),
        ("Mimo / Estatua Viviente", "performance silente, vestuario oro", "MimoPerformanceForm.jsx", "POST /api/v1/stage/mime-acts"),
        ("Titiritero / Marionetista", "teatrino móvil, obras educativas", "PuppetShowForm.jsx", "POST /api/v1/stage/puppet-show"),
        ("Malabarista con Fuego y LED", "show nocturno, extintores listos", "FireJugglerSafety.jsx", "POST /api/v1/stage/fire-safety"),
        ("Drag Queen / Performer de Gala", "shows temáticos, lipsync, glamour", "DragPerformerShow.jsx", "POST /api/v1/stage/drag-performance"),
        ("Comediante de Imitaciones", "parodias de artistas famosos", "ImpersonatorClips.jsx", "POST /api/v1/stage/impersonator-demos"),
        ("Hipnotista de Entretenimiento", "show sugestión colectiva", "HypnotistShowForm.jsx", "POST /api/v1/stage/hypnosis-show"),
        ("Actor de Café Teatro / Monólogos", "textos dramáticos breves", "MonologueActorForm.jsx", "PUT /api/v1/stage/monologue-catalog"),
        ("Músico Callejero / Busker Pro", "amplificador a batería, folclor", "BuskerPortfolio.jsx", "POST /api/v1/stage/busker-audio"),
    ]),
    ("8. STAFF TÉCNICO, MONTAJE & SEGURIDAD (13 oficios)", "#001a14", "#06d6a0", [
        ("Ingeniero de Sonido Live (FOH)", "rider PA, consolas digitales", "SoundEngineerRider.jsx", "POST /api/v1/tech/foh-engineer"),
        ("Técnico de Iluminación DMX / Avolites", "parches DMX, diseño luces show", "IluminacionForm.jsx", "PUT /api/v1/tech/dmx-lighting"),
        ("Técnico de Pantallas LED / Novastar", "calibración procesadores LED", "VideoTecForm.jsx", "PUT /api/v1/tech/novastar-led"),
        ("Rigger de Escenario Certificado", "cálculos de carga en truss, arnés", "RiggerCertForm.jsx", "PUT /api/v1/tech/rigging-cert"),
        ("Stage Manager (Jefe de Escenario)", "coordinación backstage, cambios", "StageManagerPanel.jsx", "POST /api/v1/tech/stage-management"),
        ("Asistente de Producción (Runner)", "logística en sitio, compras exprés", "APHabilidades.jsx", "PUT /api/v1/tech/production-runner"),
        ("Technical Director (TD de Gira)", "dirección técnica integral del tour", "TDReel.jsx", "POST /api/v1/tech/technical-director"),
        ("Operador de Teleprompter", "velocidad lectura, espejos cámara", "PrompterForm.jsx", "PUT /api/v1/tech/prompter-operator"),
        ("VJ (Video Jockey en Vivo)", "Resolume Arena, visuales generativos", "VJDemosUpload.jsx", "POST /api/v1/tech/vj-live-visuals"),
        ("Coordinador de Catering de Gira", "dietas de artistas y staff 24/7", "CateringMenuForm.jsx", "POST /api/v1/tech/tour-catering"),
        ("Supervisor de Seguridad de Masivos", "arcos detectores, vallas antimotín", "SeguridadVIPForm.jsx", "PUT /api/v1/tech/event-security"),
        ("Paramédico de Eventos Masivos", "ambulancia terapia intensiva, DEA", "ParamedicSafetyForm.jsx", "POST /api/v1/tech/event-medical"),
        ("Operador de Planta de Luz Generador", "KVA de potencia, transferencias", "GeneratorOperatorForm.jsx", "POST /api/v1/tech/generator-power"),
    ]),
    ("9. VENUES, AUDITORIOS & BANQUETERAS (9 oficios)", "#0a1a1f", "#118ab2", [
        ("Venue Manager (Salón / Auditorio)", "capacidad, planos técnicos, fecha", "VenueConfigForm.jsx", "PUT /api/v1/venues/facility-config"),
        ("Promoter de Espectáculos Masivos", "garantías de taquilla, boletera", "PromoterHistorial.jsx", "PUT /api/v1/venues/promoter-events"),
        ("Booker de Talento / Conciertos", "agenda de fechas de recinto", "BookerRosterForm.jsx", "GET /api/v1/venues/talent-booking"),
        ("Agente de Talento & Representación", "contratos exclusivos de agencia", "TalentoAgenteForm.jsx", "GET /api/v1/venues/agent-contracts"),
        ("Gerente de Jardín de Bodas", "permisos vecinales, horario límite", "GardenVenueForm.jsx", "PUT /api/v1/venues/wedding-garden"),
        ("Sommelier de Evento Privado", "maridaje, cata vinos y licores", "SommelierBooking.jsx", "POST /api/v1/venues/sommelier-service"),
        ("Coordinador de Mobiliario y Montaje", "mesas redondas, salas lounge, sillas", "FurnitureRentalForm.jsx", "POST /api/v1/venues/furniture-rental"),
        ("Capitán de Meseros para Banquetes", "brigada de meseros y garroteros", "WaitersBrigadeForm.jsx", "POST /api/v1/venues/waiters-brigade"),
        ("Supervisor de Control de Aforo y Taquilla", "torniquetes, validación de boletos", "GateControl.jsx", "POST /api/v1/venues/gate-control"),
    ]),
    ("10. LEGAL, MANAGEMENT, SAT & FONDO THOTH AC (8 oficios)", "#1a1600", "#ffd166", [
        ("Abogado de Derechos de Autor (INDAUTOR)", "registro obras, cesión derechos", "AbogadoCedula.jsx", "PUT /api/v1/legal/copyright-filing"),
        ("Contador Fiscal de Entretenimiento (SAT)", "timbrado CFDI 4.0, NIF B-3", "ContadorFiscalForm.jsx", "PUT /api/v1/legal/sat-accounting"),
        ("Asesor Cuántico Fondo Thoth AC", "evaluación modelo atómico 3 áreas", "QuantumAdvisorForm.jsx", "POST /api/v1/legal/quantum-assessment"),
        ("Evaluador de Capital Semilla Patito Feo", "comité de coinversión artística", "IncubadoraPanel.jsx", "POST /api/v1/legal/seed-capital-review"),
        ("Perito Valuador de Catálogos Musicales", "valuación regalías y streaming", "MusicCatalogValuation.jsx", "POST /api/v1/legal/catalog-valuation"),
        ("Auditor de Contratos Escrow y Disputas", "dictámenes de liberación fondos", "EscrowAuditorForm.jsx", "POST /api/v1/legal/escrow-adjudication"),
        ("Agente de Seguros de Cancelación", "pólizas clima, enfermedad, huelgas", "EventInsuranceForm.jsx", "POST /api/v1/legal/event-insurance"),
        ("Especialista en Cobranza y Contratos ANDA", "cumplimiento contratos sindicales", "UnionComplianceForm.jsx", "POST /api/v1/legal/union-contracts"),
    ]),
]

prev_cluster = None
total_profiles_count = 0

for c_title, c_fill, c_border, perfs in CLUSTERS_V5:
    clu_id, Y = clu_hdr(c_title, X_T, Y, W, c_fill, c_border)
    if prev_cluster: ed(prev_cluster, clu_id, color="#445566")
    prev_cluster = clu_id

    for p_name, p_desc, p_comp, p_end in perfs:
        total_profiles_count += 1
        meth = p_end.split(" ")[0]
        # Nodo UI Talento
        node_t, Yt = proc(
            f"[{p_comp}]\n"
            f"👤 {p_name}\n"
            f"📌 {p_desc[:44]}\n"
            f"🔗 {p_end}",
            X_T, Y, pal={"fill":c_fill,"border":c_border,"font":"#f0fff0","fill2":c_fill}
        )
        # Nodo Backend BD
        node_b, Yb = db(
            f"{meth} {p_end.split(' ')[-1]}\n"
            f"BD: UPDATE perfiles SET tabs_data=jsonb_set(tabs_data,'{{{p_name}}}',?)\n"
            f"BD: INSERT INTO ledger_reputacion(perfil_id, evento='PORTFOLIO_UPDATE')\n"
            f"-> 200 {{status: 'UPDATED', sha256_hash: '3f7a1c...'}}",
            X_B, Y
        )
        ed(node_t, node_b, meth, color=c_border)
        Y = max(Yt, Yb) + 6
    Y += 10

print(f"Total de perfiles mapeados en v5: {total_profiles_count}")

# =============================================================
# SECCIÓN 7: PANEL MODO DIOS & REPORTES SAT NIF B-3
# =============================================================
sec_hdr("[ SEC 7 ] PANEL ADMIN MODO DIOS (FONDO THOTH)", X_A, Y, W, CA)
sec_hdr("[ SEC 7 ] AUDITORÍA TOTAL · SAT CFDI 4.0", X_B, Y, W, CB)
Y += 42

a_admin_audit, Yaaa = proc(
    "[EscrowAuditMaster.jsx]\n"
    "👑 Bóveda Escrow Global en Tiempo Real\n"
    "Auditoría de Fondos Retenidos por Modalidad (1, 2 y 3)\n"
    "Saldo Artistas | Comisión Plataforma (20%) | Reserva Fondo (10%)",
    X_A, Y, pal=CA, bold=True
)

b_admin_audit, Ybaa = db(
    "GET /api/v1/admin/escrow/audit-vault\n"
    "BD: SELECT modalidad_escrow, SUM(monto_retenido), SUM(monto_liberado)\n"
    "FROM escrow_milestones GROUP BY modalidad_escrow\n"
    "NIF B-3: Conciliación automática de flujo de efectivo",
    X_B, Y
)

a_sat_report, Yasa = proc(
    "[SATCompliancePanel.jsx]\n"
    "🧾 Generador CFDI 4.0 & Facturación Automática\n"
    "Emisión de comprobantes por comisión y retenciones ISR/IVA\n"
    "[BTN] TIMBRAR CON PAC CERTIFICADO",
    X_A, Yaaa+5, pal=CA
)

b_sat_db, Ybsd = ext(
    "TIMBRADO FISCAL SAT CFDI 4.0\n"
    "POST /api/v1/admin/sat/timbrar\n"
    "Generar XML firmado con CSD Fondo Thoth AC -> Timbre Fiscal Digital (UUID)",
    X_B, Ybaa+5
)

ed(a_admin_audit, b_admin_audit, color=CA["border"])
ed(a_sat_report, b_sat_db, color=CA["border"])

Y_final = max(Yasa, Ybsd) + 30

# =============================================================
# ENSAMBLE GRAPHML v5
# =============================================================
HDR_XML = """<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
  xmlns:java="http://www.yworks.com/xml/yfiles-common/1.0/java"
  xmlns:sys="http://www.yworks.com/xml/yfiles-common/markup/primitives/2.0"
  xmlns:x="http://www.yworks.com/xml/yfiles-common/markup/2.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:y="http://www.yworks.com/xml/graphml"
  xmlns:yed="http://www.yworks.com/xml/yed/3"
  xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd">
  <!--Created by BackstageRED Master Generator v5 (Fondo Thoth AC)-->
  <key attr.name="Description" attr.type="string" for="graph" id="d0"/>
  <key for="port" id="d1" yfiles.type="portgraphics"/>
  <key for="port" id="d2" yfiles.type="portgeometry"/>
  <key for="port" id="d3" yfiles.type="portuserdata"/>
  <key attr.name="url" attr.type="string" for="node" id="d4"/>
  <key attr.name="description" attr.type="string" for="node" id="d5"/>
  <key for="node" id="d6" yfiles.type="nodegraphics"/>
  <key for="graphml" id="d7" yfiles.type="resources"/>
  <key attr.name="url" attr.type="string" for="edge" id="d8"/>
  <key attr.name="description" attr.type="string" for="edge" id="d9"/>
  <key for="edge" id="d10" yfiles.type="edgegraphics"/>
  <graph edgedefault="directed" id="G">
  <data key="d0" xml:space="preserve">BackstageRED MASTER v5 | 4 Carriles | 125 Oficios en 10 Clusters | Perfil Social Instagram + SHA-256 | Calendario Inmutable Negritos en Arroz | Escrow Polimórfico 3 Modos</data>
"""
FTR_XML = "  </graph>\n</graphml>\n"

with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(HDR_XML)
    for n in NX: f.write(n + "\n")
    for e in EX: f.write(e + "\n")
    f.write(FTR_XML)

sz = os.path.getsize(OUTPUT) / 1024
print("DIAGRAMA MAESTRO v5 COMPILADO EXITOSAMENTE!")
print(f"Ruta: {OUTPUT}")
print(f"Total Nodos: {nc[0]} | Total Aristas: {ec[0]} | Tamaño: {sz:.1f} KB")
print(f"Dimensiones de Canvas en yEd: {X_A + W + 100} x {Y_final:.0f} px")
