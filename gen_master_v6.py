#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BackstageRED MASTER COMPLETO v6 - LA ARQUITECTURA QUINTA (5 CARRILES)
Fondo Thoth AC · Celis Engine · Visión 2016 Potenciada en 2026

5 CARRILES SWIMLANE:
1. 👤 CONTRATANTE (Azul Neón)
2. ⚙️ BACKEND + BD + CELIS ENGINE (Verde Neón)
3. 💼 MANAGER, AGENTE & DISQUERA DIGITAL (Ámbar / Naranja Neón) [NUEVO CARRIL]
4. 🎭 CONTRATADO (10 Clusters · 120+ Oficios · Perfil Social) (Magenta Neón)
5. 👑 ADMIN FONDO THOTH AC (Dorado Neón - Modo Dios)

INCORPORA:
- Super Manager IA + Copilot Interactivo con Switch [Piloto Automático | Radar InDriver]
- Portal de Agencia para Managers Humanos (Gestión de Roster y Split Automático de Comisiones en Escrow)
- Disquera Digital 360° (Distribución Spotify/Apple, Registro INDAUTOR SHA-256, Sync Vault para Cine/TV, Split Sheets)
- Tour Manager (Logística, Call Sheets, Viáticos GPS) & Business Manager (NIF B-3 y SAT)
- Doble Sistema de Gestión (Super Manager Artístico vs Asistente Comercial de Ventas)
- Progresión Cuántica por Divisiones (Desbloqueo permanente de herramientas)
- Perfil Social Instagram/FB + Calendario de Auditoría Inmutable (Penalización 20% + Strike por Cancelación)
- Escrow Polimórfico de 3 Modalidades (Shows 50/50, Bodas/Sociales 30/40/30, Cine/Streaming por Hitos)
- Matriz de 10 Clusters Industriales (120+ oficios de élite)
"""
import os
import xml.etree.ElementTree as ET

OUTPUT = "/Users/robertoeduardocelisrobles/Documents/Proyectos/backstage-red/diagrams/BackstageRED_MASTER_COMPLETO_v6.graphml"

# ── COORDENADAS X POR CARRIL (5 COLUMNAS) ─────────────────────
X_C  = 30     # 1. Contratante (Azul)
X_B  = 510    # 2. Backend + BD (Verde)
X_M  = 990    # 3. Manager, Agente & Disquera (Ámbar / Naranja) [NUEVO]
X_T  = 1470   # 4. Contratado / Talentos (Magenta)
X_A  = 1950   # 5. Admin Fondo Thoth AC (Dorado)
W    = 360    # Ancho estándar de nodo
HDR  = 75     # Alto del header de carril

# ── PALETA DE COLORES ─────────────────────────────────────────
CC  = {"fill":"#0a1f33","border":"#00b4d8","font":"#d0f0ff","fill2":"#061524"} # Contratante
CB  = {"fill":"#061a12","border":"#06d6a0","font":"#d0ffe8","fill2":"#03100b"} # Backend
CM  = {"fill":"#1f1200","border":"#ff9900","font":"#fff0d0","fill2":"#140a00"} # Manager / Disquera
CT  = {"fill":"#180628","border":"#c020ff","font":"#f4d4ff","fill2":"#0f031a"} # Contratado
CA  = {"fill":"#1a1400","border":"#ffd000","font":"#fffbd0","fill2":"#120e00"} # Admin
CP  = {"fill":"#280808","border":"#ff3333","font":"#ffcccc","fill2":"#1a0404"} # Pendiente
CDB = {"fill":"#081626","border":"#3a88d4","font":"#b0d4f8","fill2":"#040e1a"} # BD
CEX = {"fill":"#1a1000","border":"#ff9900","font":"#ffe6b8","fill2":"#100a00"} # Externo
CSK = {"fill":"#061806","border":"#38b000","font":"#b7ef8c","fill2":"#030f03"} # OK
CER = {"fill":"#200606","border":"#e63946","font":"#ffb3ba","fill2":"#140303"} # Error

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
    if isinstance(h, dict): pal = h; h = 45
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
        f'<y:NodeLabel alignment="center" fontFamily="Courier New" fontSize="12" fontStyle="bold" '
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

print("Compilando BackstageRED MASTER v6 (5 Carriles Swimlane)...")

# ── 1. CABECERAS DE LOS 5 CARRILES ───────────────────────────
lane_hdr("👤 CONTRATANTE\n(Novios, Productores, Organizadores, Público)", X_C, 0, W, CC)
lane_hdr("⚙️ BACKEND + BD\nAPI Go | PostgreSQL 16 | Ledger SHA-256", X_B, 0, W, CB)
lane_hdr("💼 MANAGER & DISQUERA\n(Super Manager IA · Roster · Sello 360°)", X_M, 0, W, CM)
lane_hdr("🎭 CONTRATADO\n(10 Clusters · 120+ Oficios · Perfil Social IG)", X_T, 0, W, CT)
lane_hdr("👑 ADMIN FONDO THOTH AC\n(Modo Dios · Disputas · Auditoría Negritos)", X_A, 0, W, CA)

proc("LEYENDA v6 (5 CARRILES QUINTA ARQUITECTURA)\n"
     "AZUL=Contratante | VERDE=Backend+BD | ÁMBAR=Manager & Disquera\n"
     "MAGENTA=Contratado/Artistas | DORADO=Admin Modo Dios Fondo Thoth\n"
     "SUPER MANAGER IA: Switch [Piloto Automático | Radar InDriver con Contraoferta]\n"
     "PORTAL AGENCIA: Roster Multi-Talento con Split Automático de Comisiones en Escrow\n"
     "DISQUERA DIGITAL: Distribución Spotify/Apple + INDAUTOR + Sync Vault Cine/TV\n"
     "ESCROW POLIMÓRFICO: [1] Shows 50/50 [2] Bodas 30/40/30 [3] Cine/Streaming Hitos",
     X_A + W + 80, 10, w=440, h=95,
     pal={"fill":"#050d14","border":"#2a5a7a","font":"#80bbdd","fill2":"#050d14"})

Y = HDR + 30

# =============================================================
# SECCIÓN 1: ONBOARDING & AUTENTICACIÓN MULTIRROL
# =============================================================
sec_hdr("[ SEC 1 ] ONBOARDING CONTRATANTE", X_C, Y, W, CC)
sec_hdr("[ SEC 1 ] AUTH API · JWT · RBAC", X_B, Y, W, CB)
sec_hdr("[ SEC 1 ] PORTAL ACCESO MANAGER", X_M, Y, W, CM)
sec_hdr("[ SEC 1 ] ONBOARDING TALENTO", X_T, Y, W, CT)
sec_hdr("[ SEC 1 ] ACCESO MODO DIOS", X_A, Y, W, CA)
Y += 42

c_start, Ycs = term("INICIO APP CONTRATANTE\n[SplashScreen.jsx]", X_C, Y, W, pal=CC)
t_start, Yts = term("INICIO APP TALENTO\n[SplashScreen.jsx]", X_T, Y, W, pal=CT)
m_start, Yms = term("PORTAL DE AGENCIA / MANAGER\n[ManagerLoginPortal.jsx]", X_M, Y, W, pal=CM)
a_start, Yas = term("ACCESO ADMIN FONDO THOTH\n/admin/login", X_A, Y, W, pal=CA)

b_auth_hub, Ybah = db(
    "POST /api/v1/auth/login-multirole\n"
    "BD: SELECT u.*, p.cluster_id, m.agency_id, m.commission_pct\n"
    "FROM usuarios u\n"
    "LEFT JOIN perfiles p ON u.id=p.user_id\n"
    "LEFT JOIN managers m ON u.id=m.user_id\n"
    "-> 200 {token_jwt, rol: ['CONTRATANTE'|'TALENTO'|'MANAGER'|'ADMIN']}",
    X_B, Y
)

ed(c_start, b_auth_hub, "LOGIN", color=CC["border"])
ed(t_start, b_auth_hub, "LOGIN", color=CT["border"])
ed(m_start, b_auth_hub, "LOGIN AGENCIA", color=CM["border"])
ed(a_start, b_auth_hub, "LOGIN DIOS", color=CA["border"])
Y = max(Ycs, Yts, Yms, Yas, Ybah) + 20

# =============================================================
# SECCIÓN 2: EL SUPER MANAGER IA & COPILOT INTERACTIVO
# =============================================================
sec_hdr("[ SEC 2 ] EXPLORADOR DE TALENTOS", X_C, Y, W, CC)
sec_hdr("[ SEC 2 ] CELIS ENGINE · MATCHMAKING IA", X_B, Y, W, CB)
sec_hdr("[ SEC 2 ] SUPER MANAGER IA & COPILOT", X_M, Y, W, CM)
sec_hdr("[ SEC 2 ] INTERFAZ COPILOT TALENTO", X_T, Y, W, CT)
Y += 42

m_copilot_view, Ymcv = proc(
    "[SuperManagerCopilot.jsx]\n"
    "🤖 Copilot Conversacional Interactivo 24/7\n"
    "Atiende en lenguaje natural al artista o manager:\n"
    "'Búscame fechas para el fin de semana en Monterrey'\n"
    "'¿Cuánto llevo generado en regalías y escrow este mes?'",
    X_M, Y, pal=CM, bold=True
)

m_switch_mode, Ymsm = proc(
    "[AgentModeSelector.jsx]\n"
    "🔀 SWITCH DE MODO DEL BOT AGENTE:\n"
    "🔘 [Modo 1: 🤖 Piloto Automático Total] -> Cierra contratos directos\n"
    "🔘 [Modo 2: 📡 Radar InDriver On-Demand] -> Alertas con contraoferta",
    X_M, Ymcv+5, pal=CM, bold=True
)

# Radar InDriver
m_radar_bids, Ymrb = inp(
    "[OpportunityRadar.jsx] (Estilo InDriver)\n"
    "📡 Oportunidad: 'Boda busca Mariachi - Presupuesto: $8,000'\n"
    "🔘 [ACEPTAR TARIFA: $8,000]\n"
    "🔘 [ENVIAR CONTRAOFERTA: $9,500 + Viáticos]\n"
    "POST /api/v1/manager/radar/bid",
    X_M, Ymsm+5, pal=CM
)

b_match_engine, Ybme = db(
    "CELIS ENGINE: MATCHMAKING & AUTO-BIDDING\n"
    "BD: SELECT c.* FROM convocatorias c\n"
    "WHERE c.fecha_evento NOT IN (SELECT fecha FROM calendario_artistas)\n"
    "AND c.monto >= p.tarifa_minima\n"
    "IF modo=PILOTO_AUTOMÁTICO: Enviar propuesta formal con 1 clic\n"
    "IF modo=RADAR: Disparar notificación push con botones de contraoferta",
    X_B, Y
)

t_copilot_ui, Ytcu = proc(
    "[TalentCopilotDrawer.jsx]\n"
    "Acceso rápido al Copilot desde la app del artista:\n"
    "• Estado del Radar: Activo (3 ofertas en radio de 25 km)\n"
    "• Horas de vuelo actuales y herramientas desbloqueadas",
    X_T, Y, pal=CT
)

ed(m_copilot_view, m_switch_mode, color=CM["border"])
ed(m_switch_mode, m_radar_bids, color=CM["border"])
ed(m_radar_bids, b_match_engine, "POST bid", color=CM["border"])
ed(t_copilot_ui, m_copilot_view, "SYNC COPILOT", color=CT["border"], async_=True)

Y = max(Ymrb, Ybme, Ytcu) + 20

# =============================================================
# SECCIÓN 3: PORTAL DE AGENCIA (MANAGERS HUMANOS & ROSTER)
# =============================================================
sec_hdr("[ SEC 3 ] CONTRATACIÓN DE AGENCIA", X_C, Y, W, CC)
sec_hdr("[ SEC 3 ] BÓVEDA SPLIT ESCROW AUTOMÁTICO", X_B, Y, W, CB)
sec_hdr("[ SEC 3 ] PORTAL AGENCIA & ROSTER MASTER", X_M, Y, W, CM)
sec_hdr("[ SEC 3 ] CONTROL DELEGADO Y VETO", X_T, Y, W, CT)
Y += 42

m_roster_view, Ymrv = proc(
    "[AgencyRosterMaster.jsx]\n"
    "🏢 Portal de Agencia de Representación Humana\n"
    "• Roster activo: 8 Artistas representados\n"
    "• Configuración de Comisión: 15% Manager / 10% Booking\n"
    "• Permisos: [x] Negociar tarifas  [x] Firmar con veto del artista",
    X_M, Y, pal=CM, bold=True
)

m_calendar_master, Ymcm = proc(
    "[AgencyConsolidatedCalendar.jsx]\n"
    "📅 Calendario Consolidado Multi-Artista\n"
    "Superposición de giras, llamados de cine y bodas del roster\n"
    "Detección automática de cruces de fechas",
    X_M, Ymrv+5, pal=CM
)

b_agency_split, Ybas = db(
    "POST /api/v1/escrow/split-contract\n"
    "BD: INSERT INTO booking_splits:\n"
    "• Artista: 75% del valor neto\n"
    "• Manager / Agencia: 15% (Transferencia directa a su CLABE)\n"
    "• Plataforma: 10%\n"
    "GARANTÍA FONDO THOTH: El manager cobra de inmediato al liberar con PIN\n"
    "sin tener que perseguir al artista para liquidar honorarios",
    X_B, Y
)

t_delegation_ctrl, Ytdc = proc(
    "[RepresentationAgreement.jsx]\n"
    "Contrato Digital de Representación con la Agencia\n"
    "Transparencia total: El artista ve cada peso cobrado y su porcentaje neto\n"
    "Botón de Veto de Emergencia en caso de desacuerdo de fecha",
    X_T, Y, pal=CT
)

ed(m_roster_view, m_calendar_master, color=CM["border"])
ed(m_roster_view, b_agency_split, "CONFIG SPLIT", color=CM["border"])
ed(t_delegation_ctrl, m_roster_view, "VÍNCULO ROSTER", color=CT["border"])

Y = max(Ymcm, Ybas, Ytdc) + 20

# =============================================================
# SECCIÓN 4: LA DISQUERA DIGITAL 360° & SELLO VIRTUAL
# =============================================================
sec_hdr("[ SEC 4 ] SYNC VAULT (LICENCIAS CINE/TV)", X_C, Y, W, CC)
sec_hdr("[ SEC 4 ] DISQUERA DIGITAL API · INDAUTOR", X_B, Y, W, CB)
sec_hdr("[ SEC 4 ] SELLO VIRTUAL 360° · REGALÍAS", X_M, Y, W, CM)
sec_hdr("[ SEC 4 ] MÁSTERS & SPLIT SHEETS", X_T, Y, W, CT)
Y += 42

m_label_dash, Ymld = proc(
    "[DigitalLabelDashboard.jsx]\n"
    "💿 DISQUERA DIGITAL & SELLO 360° (Patente 2016 / Potenciada 2026)\n"
    "1. Distribuidor Multicanal: Spotify, Apple Music, TikTok, Amazon\n"
    "2. Registro INDAUTOR Inmutable con Hash SHA-256\n"
    "3. Sync Vault: Bóveda de Sincronización para Cine, TV y Publicidad\n"
    "4. Smart Split Sheets: Reparto automático entre compositores y productores",
    X_M, Y, pal=CM, bold=True
)

m_sync_vault, Ymsv = proc(
    "[SyncVaultCatalog.jsx]\n"
    "🎬 Catálogo de Sincronización B2B\n"
    "Pistas clasificadas por mood, tempo, género e instrumentación\n"
    "Contratos de sincronización listos para firmar con 1 clic en Escrow",
    X_M, Ymld+5, pal=CM
)

c_cine_license, Yccl = inp(
    "[CinemaLicenseCheckout.jsx] (Director de Cine / Publicidad)\n"
    "Licenciar canción para cortometraje o serie de TV\n"
    "Pago de licencia de sincronización vía Escrow ($25,000 MXN)\n"
    "POST /api/v1/label/sync-license/buy",
    X_C, Y, pal=CC
)

b_label_db, Ybld = db(
    "POST /api/v1/label/distribute-and-protect\n"
    "1. Subir audio WAV 24bit/48kHz a CDN de distribución\n"
    "2. INSERT INTO indautor_certificates(obra_id, hash_sha256, folio)\n"
    "3. INSERT INTO sync_vault_items(obra_id, precio_sync, stems_url)\n"
    "4. INSERT INTO smart_splits(compositor_pct, letrista_pct, productor_pct)\n"
    "-> Dispersión automática de regalías cada corte de mes",
    X_B, Y
)

t_splits_view, Ytsv = proc(
    "[SmartSplitSheets.jsx]\n"
    "Acuerdo de Colaboración de Obra Musical\n"
    "• Letra: 50% (Autor A) | Música: 30% (Productor B) | Arreglo: 20% (Arreglista C)\n"
    "Firmado digitalmente sin pleitos legales posteriores",
    X_T, Y, pal=CT
)

ed(m_label_dash, m_sync_vault, color=CM["border"])
ed(c_cine_license, m_sync_vault, "BUSCA MÚSICA", color=CC["border"])
ed(c_cine_license, b_label_db, "POST license", color=CC["border"])
ed(m_label_dash, b_label_db, "POST distribution", color=CM["border"])
ed(t_splits_view, b_label_db, "ACUERDO SPLITS", color=CT["border"])

Y = max(Ymsv, Yccl, Ybld, Ytsv) + 20

# =============================================================
# SECCIÓN 5: TOUR MANAGER & LOGÍSTICA DE CARRETERA
# =============================================================
sec_hdr("[ SEC 5 ] MONITOREO DE ARRIBO EVENTO", X_C, Y, W, CC)
sec_hdr("[ SEC 5 ] TRACKING GPS & CALL SHEETS API", X_B, Y, W, CB)
sec_hdr("[ SEC 5 ] TOUR MANAGER & LOGÍSTICA", X_M, Y, W, CM)
sec_hdr("[ SEC 5 ] HOJA DE LLAMADO & RIDER", X_T, Y, W, CT)
Y += 42

m_tour_view, Ymtv = proc(
    "[TourManagerItinerary.jsx]\n"
    "🚐 Módulo de Giras y Logística de Carretera\n"
    "• Itinerario minuto a minuto: Vuelo -> Hotel -> Soundcheck -> Show\n"
    "• Hojas de llamado (Call Sheets) digitales con acuse de lectura\n"
    "• Bóveda de viáticos por GPS y cálculo de per diems",
    X_M, Y, pal=CM, bold=True
)

b_tour_api, Ybta = db(
    "POST /api/v1/manager/tours/call-sheets\n"
    "BD: INSERT INTO tour_legs(tour_id, ciudad, venue_id, fecha_arribo)\n"
    "BD: INSERT INTO call_sheets(staff_id, hora_llamado, locacion_gps)\n"
    "Cálculo automático de viáticos según distancia y zona hotelera",
    X_B, Y
)

t_call_sheet, Ytcs = proc(
    "[CallSheetMobileView.jsx]\n"
    "📱 Hoja de Llamado en el Celular del Artista / Músico\n"
    "Ubicación Waze/Google Maps | Hora de prueba de audio | Contacto en sitio",
    X_T, Y, pal=CT
)

ed(m_tour_view, b_tour_api, "POST tour", color=CM["border"])
ed(b_tour_api, t_call_sheet, "PUSH llamado", color=CT["border"], async_=True)

Y = max(Ymtv, Ybta, Ytcs) + 20

# =============================================================
# SECCIÓN 6: BUSINESS MANAGER & FINANZAS NIF B-3
# =============================================================
sec_hdr("[ SEC 6 ] BUSINESS MANAGER MASTER", X_M, Y, W, CM)
sec_hdr("[ SEC 6 ] REPORTE FISCAL SAT & NIF B-3", X_B, Y, W, CB)
Y += 42

m_biz_view, Ymbv = proc(
    "[BusinessManagerCashflow.jsx]\n"
    "📊 Business Manager Financiero & Fiscal\n"
    "• Flujo de caja proyectado a 3, 6 y 12 meses\n"
    "• Conciliación bancaria de cobros Escrow vs comisiones pagadas\n"
    "• Retenciones de ISR / IVA y fondo de retiro artístico",
    X_M, Y, pal=CM, bold=True
)

b_biz_api, Ybba = db(
    "GET /api/v1/manager/business/cashflow-summary\n"
    "BD: SELECT SUM(monto_total), SUM(comision_manager), SUM(impuestos_retenidos)\n"
    "FROM bookings WHERE manager_id=? GROUP BY DATE_TRUNC('month', fecha)\n"
    "Generación de reportes NIF B-3 listos para el contador",
    X_B, Y
)

ed(m_biz_view, b_biz_api, "GET cashflow", color=CM["border"])
Y = max(Ymbv, Ybba) + 20

# =============================================================
# SECCIÓN 7: PERFIL SOCIAL INSTAGRAM & LEDGER INMUTABLE
# =============================================================
sec_hdr("[ SEC 7 ] PERFIL SOCIAL TIPO INSTAGRAM/FB", X_T, Y, W, CT)
sec_hdr("[ SEC 7 ] LEDGER INMUTABLE SHA-256 · FEED", X_B, Y, W, CB)
sec_hdr("[ SEC 7 ] EXPLORACIÓN Y FAVORITOS", X_C, Y, W, CC)
Y += 42

t_soc_head, Ytsh = proc(
    "[UniversalProfileHeader.jsx]\n"
    "📸 Avatar & Banner | 🟢 Semáforo: VERDE (0 strikes)\n"
    "🔐 Sello Criptográfico SHA-256 Verificado\n"
    "⭐ Rating: 4.98 (87 eventos) | ❤️ 1,420 Likes | 👥 3.2k Seguidores",
    X_T, Y, pal=CT, bold=True
)

t_soc_tabs, Ytst = proc(
    "[ProfileTabNavigator.jsx]\n"
    "• Tab 1: Muro de Fotos & Reels (Estilo IG con likes/comentarios)\n"
    "• Tab 2: Calendario Público Inmutable de Auditoría\n"
    "• Tab 3: Reseñas Escrow Inmutables (No borrables, derecho a 1 réplica)\n"
    "• Tab 4: Especialidad Técnica (según Cluster)",
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
# SECCIÓN 8: CARPETAS DE PROYECTO / MOODBOARDS (GUARDAR PARA FUTURO)
# =============================================================
sec_hdr("[ SEC 8 ] CARPETAS DE EVENTO / MOODBOARDS", X_C, Y, W, CC)
sec_hdr("[ SEC 8 ] MOODBOARDS API · COMPARADOR", X_B, Y, W, CB)
Y += 42

c_save_modal, Ycsm = proc(
    "[SaveToProjectModal.jsx]\n"
    "📁 'Guardar en Carpeta de Evento' (Estilo Pinterest / Airbnb)\n"
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
# SECCIÓN 9: CALENDARIO DE AUDITORÍA & NEGRITOS EN EL ARROZ
# =============================================================
sec_hdr("[ SEC 9 ] CALENDARIO AUDITORÍA & NO-SHOWS", X_T, Y, W, CT)
sec_hdr("[ SEC 9 ] PENALIZACIÓN 20% · ALERTA MODO DIOS", X_B, Y, W, CB)
sec_hdr("[ SEC 9 ] MONITOR DE NEGRITOS EN EL ARROZ", X_A, Y, W, CA)
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
# SECCIÓN 10: MOTOR DE ESCROW POLIMÓRFICO (3 MODALIDADES)
# =============================================================
sec_hdr("[ SEC 10 ] CHECKOUT ESCROW POLIMÓRFICO", X_C, Y, W, CC)
sec_hdr("[ SEC 10 ] SMART ESCROW ENGINE · 3 MODOS", X_B, Y, W, CB)
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
# SECCIÓN 11: DÍA DEL EVENTO, PIN Y RETIROS SPEI
# =============================================================
sec_hdr("[ SEC 11 ] DÍA DEL EVENTO & PIN DE FINIQUITO", X_C, Y, W, CC)
sec_hdr("[ SEC 11 ] LIBERACIÓN ESCROW · SPLIT 70/20/10", X_B, Y, W, CB)
sec_hdr("[ SEC 11 ] BILLETERA TALENTO & SPEI", X_T, Y, W, CT)
Y += 42

c_pin_enter, Ycpe = proc(
    "[GatePOSModal.jsx]\n"
    "Contratante ingresa su PIN de 4 dígitos\n"
    "El talento confirma el servicio cumplido\n"
    "POST /api/v1/escrow/finalize",
    X_C, Y, pal=CC, bold=True
)

b_release_escrow, Ybre = db(
    "POST /api/v1/escrow/finalize\n"
    "BD: Validar bcrypt(PIN)\n"
    "SPLIT FINANCIERO CELIS ENGINE:\n"
    "• 70% Saldo disponible del artista / proveedor\n"
    "• 15% Comisión de Agencia / Manager\n"
    "• 15% Comisión plataforma BackstageRED + Reserva Fondo Thoth\n"
    "-> 200 {escrow_liberado: true}",
    X_B, Y
)

t_wallet_node, Ytwn = proc(
    "[WalletPage.jsx]\n"
    "🔔 PUSH: ¡Pago Liberado en Billetera!\n"
    "Saldo disponible actualizado\n"
    "[BTN] RETIRAR A CUENTA BANCARIA (SPEI)",
    X_T, Y, pal=CT, bold=True
)

t_spei_req, Ytsr = inp(
    "[WithdrawModal.jsx]\n"
    "POST /api/v1/wallet/withdraw\n"
    "Body: {monto, clabe_interbancaria}",
    X_T, Ytwn+5, pal=CT
)

b_spei_proc, Ybsp = ext(
    "CONEXIÓN BANCARIA SPEI (STP / Kushki)\n"
    "Dispersión automática en tiempo real\n"
    "-> 202 {folio_rastreo_cep, status: 'LIQUIDADO'}",
    X_B, Ybre+5
)

ed(c_pin_enter, b_release_escrow, "POST PIN", color=CC["border"])
ed(b_release_escrow, t_wallet_node, "PUSH liberación", color=CT["border"], async_=True)
ed(t_wallet_node, t_spei_req, color=CT["border"])
ed(t_spei_req, b_spei_proc, "POST SPEI", color=CT["border"])
Y = max(Ycpe, Ytsr, Ybsp) + 25

# =============================================================
# SECCIÓN 12: TAQUILLA POS & CONTROL DE ACCESO GATE QR
# =============================================================
sec_hdr("[ SEC 12 ] TAQUILLA POS · VENTAS", X_C, Y, W, CC)
sec_hdr("[ SEC 12 ] TAQUILLA API · NIF B-3 CORTE", X_B, Y, W, CB)
sec_hdr("[ SEC 12 ] CONTROL ACCESO QR GATE", X_T, Y, W, CT)
Y += 42

c_taq_home, Ycth = proc("[TaquillaPOS.jsx]\nVenta de Boletos en Sitio & Online\nEfectivo, Tarjeta, CoDi", X_C, Y, pal=CC)
b_taq_cut, Ybtc = db("POST /api/v1/taquilla/corte\nBD: INSERT INTO cortes_taquilla\nNIF B-3: Separación de flujo y comisión", X_B, Y)
t_gate_ctrl, Ytgc = proc("[GateScanner.jsx]\nEscáner de QR de Entrada\nValidación en < 200ms", X_T, Y, pal=CT)
b_gate_val, Ybgv = db("POST /api/v1/taquilla/validate-qr\nBD: UPDATE boletos SET status='USADO'\n-> 200 {acceso: PERMITIDO}", X_B, Ybtc+5)

ed(c_taq_home, b_taq_cut, "POST corte", color=CC["border"])
ed(t_gate_ctrl, b_gate_val, "POST validate", color=CT["border"])
Y = max(Ycth, Ytgc, Ybgv) + 25

# =============================================================
# SECCIÓN 13: DISPUTAS & CONGELAMIENTO DE BÓVEDA
# =============================================================
sec_hdr("[ SEC 13 ] REPORTE DE INCUMPLIMIENTO", X_C, Y, W, CC)
sec_hdr("[ SEC 13 ] DISPUTES API · FREEZE BÓVEDA", X_B, Y, W, CB)
sec_hdr("[ SEC 13 ] PANEL DE ARBITRAJE ADMIN", X_A, Y, W, CA)
Y += 42

c_disp_form, Ycdf = proc("[DisputeForm.jsx]\nReportar Incumplimiento o Abuso\nSubir fotos, videos, audios de evidencia", X_C, Y, pal=CC)
b_disp_freeze, Ybdf = db("POST /api/v1/disputes/create\nBD: UPDATE escrow SET status='FROZEN'\nDisparar Alerta P1 a Mesa de Arbitraje", X_B, Y)
a_disp_panel, Yadp = proc("[ArbitrationPanel.jsx] (Modo Dios)\nRevisión de Contrato, Bitácora y Evidencias\nFallo inapelable a favor de Contratante o Contratado", X_A, Y, pal=CA, bold=True)

ed(c_disp_form, b_disp_freeze, "POST disputa", color=CC["border"])
ed(b_disp_freeze, a_disp_panel, "PUSH P1", color=CA["border"], async_=True)
Y = max(Ycdf, Ybdf, Yadp) + 25

# =============================================================
# SECCIÓN 14: NOTIFICACIONES MULTICANAL
# =============================================================
sec_hdr("[ SEC 14 ] NOTIFICACIONES MULTICANAL", X_B, Y, W, CB)
Y += 42
b_notif_multi, Ybnm = ext(
    "DISPATCHER MULTICANAL DE ALERTAS:\n"
    "• Push FCM (Móvil / PWA)\n"
    "• WhatsApp Business API (Recordatorios de llamado y citas)\n"
    "• SendGrid (Facturas CFDI y Contratos PDF)",
    X_B, Y
)
Y = Ybnm + 25

# =============================================================
# SECCIÓN 15: MATRIZ DE 10 CLUSTERS Y 120+ OFICIOS DE ÉLITE
# =============================================================
sec_hdr("[ SEC 15 ] 10 CLUSTERS · 120+ OFICIOS DE ÉLITE", X_T, Y, W, CT)
sec_hdr("[ SEC 15 ] BD OFICIOS · APIs DE ESPECIALIDAD", X_B, Y, W, CB)
Y += 42

CLUSTERS_V6 = [
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

for c_title, c_fill, c_border, perfs in CLUSTERS_V6:
    clu_id, Y = clu_hdr(c_title, X_T, Y, W, c_fill, c_border)
    if prev_cluster: ed(prev_cluster, clu_id, color="#445566")
    prev_cluster = clu_id

    for p_name, p_desc, p_comp, p_end in perfs:
        total_profiles_count += 1
        meth = p_end.split(" ")[0]
        node_t, Yt = proc(
            f"[{p_comp}]\n"
            f"👤 {p_name}\n"
            f"📌 {p_desc[:44]}\n"
            f"🔗 {p_end}",
            X_T, Y, pal={"fill":c_fill,"border":c_border,"font":"#f0fff0","fill2":c_fill}
        )
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

# =============================================================
# SECCIÓN 16: FEED CREAR, INCUBADORA Y CABINAS
# =============================================================
sec_hdr("[ SEC 16 ] FEED CREAR · RED SOCIAL", X_C, Y, W, CC)
sec_hdr("[ SEC 16 ] INCUBADORA PATITO FEO (FONDO THOTH)", X_T, Y, W, CT)
sec_hdr("[ SEC 16 ] CABINAS DOBLAJE REMOTAS", X_M, Y, W, CM)
sec_hdr("[ SEC 16 ] COMITÉ COINVERSIÓN MODO DIOS", X_A, Y, W, CA)
Y += 42

c_feed_home, Ycfh = proc("[FeedHomePage.jsx]\nFeed Principal 'Para Ti' & Reels del Ecosistema", X_C, Y, pal=CC)
t_incub_apply, Ytia = proc("[IncubadoraApply.jsx]\nPostulación Capital Semilla Fondo Thoth AC\nEvaluación Cuántica Modelo Atómico 3 Áreas", X_T, Y, pal=CT)
m_dub_mgmt, Ymdm = proc("[DubbingSessionManager.jsx]\nSupervisión de Cabinas de Doblaje Remotas\nControl de ADR, Guiones labiales y Masters WAV", X_M, Y, pal=CM)
a_incub_rev, Yair = proc("[IncubadoraAdminPanel.jsx] (Modo Dios)\nAprobación de Contrato de Coinversión Cuántica", X_A, Y, pal=CA, bold=True)

ed(t_incub_apply, a_incub_rev, "EVALUAR", color=CA["border"], async_=True)
Y = max(Ycfh, Ytia, Ymdm, Yair) + 25

# =============================================================
# SECCIÓN 17: PANEL ADMIN MODO DIOS & SAT CFDI 4.0
# =============================================================
sec_hdr("[ SEC 17 ] PANEL ADMIN MODO DIOS (FONDO THOTH)", X_A, Y, W, CA)
sec_hdr("[ SEC 17 ] AUDITORÍA TOTAL · SAT CFDI 4.0", X_B, Y, W, CB)
Y += 42

a_admin_audit, Yaaa = proc(
    "[EscrowAuditMaster.jsx]\n"
    "👑 Bóveda Escrow Global en Tiempo Real\n"
    "Auditoría de Fondos Retenidos por Modalidad (1, 2 y 3)\n"
    "Saldo Artistas | Comisión Agencia (15%) | Comisión App | Fondo Reserva",
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
# ENSAMBLE GRAPHML v6 (5 CARRILES)
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
  <!--Created by BackstageRED Master Generator v6 (Fondo Thoth AC) - 5 Swimlanes Architecture-->
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
  <data key="d0" xml:space="preserve">BackstageRED MASTER v6 | 5 Carriles Swimlane | Super Manager IA &amp; Roster de Agencia | Disquera Digital 360 | 10 Clusters 120+ Oficios | Escrow Polimórfico</data>
"""
FTR_XML = "  </graph>\n</graphml>\n"

with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(HDR_XML)
    for n in NX: f.write(n + "\n")
    for e in EX: f.write(e + "\n")
    f.write(FTR_XML)

sz = os.path.getsize(OUTPUT) / 1024
print("DIAGRAMA MAESTRO v6 (5 CARRILES) COMPILADO EXITOSAMENTE!")
print(f"Ruta: {OUTPUT}")
print(f"Total Nodos: {nc[0]} | Total Aristas: {ec[0]} | Tamaño: {sz:.1f} KB")
print(f"Dimensiones de Canvas en yEd: {X_A + W + 100} x {Y_final:.0f} px")
