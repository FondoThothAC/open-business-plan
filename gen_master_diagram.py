#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BACKSTAGE-RED — Generador de Diagrama Maestro COMPLETO v3
4 Carriles: CONTRATANTE | BACKEND+BD | CONTRATADO | ADMIN FONDO THOTH
86 Perfiles | Todos los flujos | HTTP + SQL + React + Pendientes marcados
"""
import os

X_C = 50; X_B = 550; X_T = 1050; X_A = 1550
W_NODE = 340; H_NODE = 55; H_TALL = 80; H_DEC = 60; W_DEC = 140; HDR_H = 70
C_FILL="#0d1b2a"; C_BORDER="#00b4d8"; C_FONT="#e0f7ff"
B_FILL="#0a1628"; B_BORDER="#06d6a0"; B_FONT="#e0fff8"
T_FILL="#1a0d2e"; T_BORDER="#b829ff"; T_FONT="#f0e0ff"
A_FILL="#1a1500"; A_BORDER="#ffd60a"; A_FONT="#fffbe0"
PEND_FILL="#2a0a0a"; PEND_BRD="#ff4d4d"; PEND_FONT="#ffe0e0"

nc=[0]; ec=[0]; NX=[]; EX=[]

def nid():
    nc[0]+=1; return f"n{nc[0]}"
def eid():
    ec[0]+=1; return f"e{ec[0]}"

def sn(label,x,y,w=W_NODE,h=H_NODE,fill=B_FILL,border=B_BORDER,font=B_FONT,shape="rectangle",fs=9,bold=False,pending=False):
    _id=nid()
    if pending: fill,border,font=PEND_FILL,PEND_BRD,PEND_FONT
    fw="bold" if bold else "plain"
    lbl=label.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
    NX.append(f'<node id="{_id}"><data key="d6"><y:ShapeNode>'
              f'<y:Geometry x="{x}" y="{y}" width="{w}" height="{h}"/>'
              f'<y:Fill color="{fill}" transparent="false"/>'
              f'<y:BorderStyle type="line" width="1.5" color="{border}"/>'
              f'<y:NodeLabel fontFamily="Courier New" fontSize="{fs}" fontStyle="{fw}" textColor="{font}" alignment="center" modelName="internal" modelPosition="c" autoSizePolicy="node_width"><![CDATA[{lbl}]]></y:NodeLabel>'
              f'<y:Shape type="{shape}"/></y:ShapeNode></data></node>')
    return _id, y+h

def dn(label,x,y,fill=B_FILL,border=B_BORDER,font=B_FONT):
    _id=nid(); cx=x+W_NODE/2-W_DEC/2
    lbl=label.replace("&","&amp;")
    NX.append(f'<node id="{_id}"><data key="d6"><y:ShapeNode>'
              f'<y:Geometry x="{cx}" y="{y}" width="{W_DEC}" height="{H_DEC}"/>'
              f'<y:Fill color="{fill}" transparent="false"/>'
              f'<y:BorderStyle type="line" width="2.0" color="{border}"/>'
              f'<y:NodeLabel fontFamily="Courier New" fontSize="9" fontStyle="bold" textColor="{font}" alignment="center" modelName="internal" modelPosition="c"><![CDATA[{lbl}]]></y:NodeLabel>'
              f'<y:Shape type="diamond"/></y:ShapeNode></data></node>')
    return _id, y+H_DEC

def tn(label,x,y,fill=B_FILL,border=B_BORDER,font=B_FONT):
    _id=nid(); cx=x+W_NODE/2-90
    lbl=label.replace("&","&amp;")
    NX.append(f'<node id="{_id}"><data key="d6"><y:ShapeNode>'
              f'<y:Geometry x="{cx}" y="{y}" width="180" height="45"/>'
              f'<y:Fill color="{fill}" transparent="false"/>'
              f'<y:BorderStyle type="line" width="2.5" color="{border}"/>'
              f'<y:NodeLabel fontFamily="Courier New" fontSize="10" fontStyle="bold" textColor="{font}" alignment="center" modelName="internal" modelPosition="c"><![CDATA[{lbl}]]></y:NodeLabel>'
              f'<y:Shape type="ellipse"/></y:ShapeNode></data></node>')
    return _id, y+45

def sh(label,x,y,w=W_NODE,role="B"):
    fills={"C":"#0a2540","B":"#0a2030","T":"#200a40","A":"#2a2000"}
    bords={"C":C_BORDER,"B":B_BORDER,"T":T_BORDER,"A":A_BORDER}
    fnts={"C":C_FONT,"B":B_FONT,"T":T_FONT,"A":A_FONT}
    _id=nid(); lbl=label.replace("&","&amp;")
    NX.append(f'<node id="{_id}"><data key="d6"><y:ShapeNode>'
              f'<y:Geometry x="{x}" y="{y}" width="{w}" height="30"/>'
              f'<y:Fill color="{fills[role]}" transparent="false"/>'
              f'<y:BorderStyle type="line" width="2.0" color="{bords[role]}"/>'
              f'<y:NodeLabel fontFamily="Courier New" fontSize="10" fontStyle="bold" textColor="{fnts[role]}" alignment="center" modelName="internal" modelPosition="c"><![CDATA[== {lbl} ==]]></y:NodeLabel>'
              f'<y:Shape type="roundrectangle"/></y:ShapeNode></data></node>')
    return _id, y+30

def lh(title,x,y,w=W_NODE,fill="#060e1a",border="#1a3a6a",font="#7aa8cc"):
    _id=nid(); lbl=title.replace("&","&amp;")
    NX.append(f'<node id="{_id}"><data key="d6"><y:ShapeNode>'
              f'<y:Geometry x="{x}" y="{y}" width="{w}" height="{HDR_H}"/>'
              f'<y:Fill color="{fill}" transparent="false"/>'
              f'<y:BorderStyle type="line" width="3.0" color="{border}"/>'
              f'<y:NodeLabel fontFamily="Courier New" fontSize="13" fontStyle="bold" textColor="{font}" alignment="center" modelName="internal" modelPosition="c"><![CDATA[{lbl}]]></y:NodeLabel>'
              f'<y:Shape type="roundrectangle"/></y:ShapeNode></data></node>')
    return _id

def clh(label,x,y,w=W_NODE,cf="#1a2a1a",cb="#2a6a2a"):
    _id=nid(); lbl=label.replace("&","&amp;")
    NX.append(f'<node id="{_id}"><data key="d6"><y:ShapeNode>'
              f'<y:Geometry x="{x}" y="{y}" width="{w}" height="38"/>'
              f'<y:Fill color="{cf}" transparent="false"/>'
              f'<y:BorderStyle type="line" width="2.5" color="{cb}"/>'
              f'<y:NodeLabel fontFamily="Courier New" fontSize="11" fontStyle="bold" textColor="#e0ffe0" alignment="center" modelName="internal" modelPosition="c"><![CDATA[{lbl}]]></y:NodeLabel>'
              f'<y:Shape type="hexagon"/></y:ShapeNode></data></node>')
    return _id, y+38

def ed(src,tgt,label="",async_=False,color="#4a9a7a"):
    _id=eid(); lt="dashed" if async_ else "line"
    lbl=label.replace("&","&amp;")
    lbl_xml=f'<y:EdgeLabel fontFamily="Courier New" fontSize="8" textColor="#aaccaa"><![CDATA[{lbl}]]></y:EdgeLabel>' if lbl else ""
    EX.append(f'<edge id="{_id}" source="{src}" target="{tgt}"><data key="d10"><y:PolyLineEdge>'
              f'<y:LineStyle type="{lt}" width="1.5" color="{color}"/>'
              f'<y:Arrows source="none" target="standard"/>'
              f'<y:BendStyle smoothed="true"/>{lbl_xml}'
              f'</y:PolyLineEdge></data></edge>')

# === LEYENDA ===
sn("LEYENDA BackstageRED MASTER v3\n"
   "AZUL=Contratante | VERDE=Backend+BD | MAGENTA=Contratado | DORADO=Admin\n"
   "ROJO=PENDIENTE BACKLOG Go | [] Proceso | <> Decision | () Inicio/Fin\n"
   "Flechas: linea=normal, guion=asincrona | Labels: [React.jsx] METODO /endpoint",
   X_A+W_NODE+60, 10, w=400, h=70, fill="#03080f", border="#2a5a7a", font="#90c8e8")

# === HEADERS DE CARRILES ===
lh("CONTRATANTE\n(Quien contrata y paga)", X_C, 0, W_NODE, "#061220", C_BORDER, C_FONT)
lh("BACKEND + BD\nAPI Go | PostgreSQL 16", X_B, 0, W_NODE, "#061a14", B_BORDER, B_FONT)
lh("CONTRATADO\n(Artista / Tecnico / Venue)", X_T, 0, W_NODE, "#120620", T_BORDER, T_FONT)
lh("ADMIN FONDO THOTH AC\n(Modo Dios - Panel Master)", X_A, 0, W_NODE, "#1a1400", A_BORDER, A_FONT)

Y = HDR_H + 30

# ===========================
# SECCION 1: AUTENTICACION
# ===========================
sh("SEC 1: AUTENTICACION",X_C,Y,W_NODE,"C"); sh("SEC 1: AUTH API",X_B,Y,W_NODE,"B")
sh("SEC 1: AUTENTICACION",X_T,Y,W_NODE,"T"); sh("SEC 1: ACCESO ADMIN",X_A,Y,W_NODE,"A")
Y+=45

c1,Yc=tn("INICIO APP\n[SplashScreen.jsx]",X_C,Y,C_FILL,C_BORDER,C_FONT)
b1,Yb=sn("GET /api/health\nBD: SELECT 1 FROM pg_stat_activity\n-> {status:ok, version:1.0}",X_B,Y,h=H_TALL,fill=B_FILL,border=B_BORDER,font=B_FONT)
t1,Yt=tn("INICIO APP\n[SplashScreen.jsx]",X_T,Y,T_FILL,T_BORDER,T_FONT)
a1,Ya=tn("ACCESO ADMIN\n/admin/login",X_A,Y,A_FILL,A_BORDER,A_FONT)
ed(c1,b1,"GET /api/health",color=C_BORDER); ed(t1,b1,"GET /api/health",color=T_BORDER)
Y=max(Yc,Yb,Yt,Ya)+15

d1c,_=dn("Tiene\ncuenta?",X_C,Y,C_FILL,C_BORDER,C_FONT)
d1t,_=dn("Tiene\ncuenta?",X_T,Y,T_FILL,T_BORDER,T_FONT)
Y+=H_DEC+15

creg,Yc=sn("[RegisterPage.jsx]\nBTN: Crear Cuenta\nPOST /api/v1/auth/register\nBody:{nombre,email,password,rol}",X_C,Y,h=H_TALL,fill=C_FILL,border=C_BORDER,font=C_FONT)
treg,Yt=sn("[RegisterPage.jsx]\nBTN: Crear Cuenta\nPOST /api/v1/auth/register\nBody:{nombre,email,password,rol,oficio_id}",X_T,Y,h=H_TALL,fill=T_FILL,border=T_BORDER,font=T_FONT)
breg,Yb=sn("POST /api/v1/auth/register\nBD:INSERT INTO usuarios(nombre,email,hash_pwd,rol)\nBD:INSERT INTO perfiles(user_id,oficio_id,division_id=1)\n->201{user_id,token_jwt}\n✖409 email ya registrado",X_B,Y,h=100,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(creg,breg,"POST",color=C_BORDER); ed(treg,breg,"POST",color=T_BORDER)
ed(d1c,creg,"NO",color=C_BORDER); ed(d1t,treg,"NO",color=T_BORDER)
Y=max(Yc,Yt,Yb)+15

clog,Yc=sn("[LoginPage.jsx]\nBTN: Iniciar Sesion\nPOST /api/v1/auth/login\nBody:{email,password}",X_C,Y,h=H_TALL,fill=C_FILL,border=C_BORDER,font=C_FONT)
tlog,Yt=sn("[LoginPage.jsx]\nBTN: Iniciar Sesion\nPOST /api/v1/auth/login\nBody:{email,password}",X_T,Y,h=H_TALL,fill=T_FILL,border=T_BORDER,font=T_FONT)
blog,Yb=sn("POST /api/v1/auth/login\nBD:SELECT * FROM usuarios WHERE email=? AND bcrypt.compare\n->200{token_jwt,user_id,rol,nombre}\n✖401 credenciales invalidas\n✖403 cuenta suspendida",X_B,Y,h=100,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(clog,blog,"POST",color=C_BORDER); ed(tlog,blog,"POST",color=T_BORDER)
ed(d1c,clog,"SI",color=C_BORDER); ed(d1t,tlog,"SI",color=T_BORDER)
Y=max(Yc,Yt,Yb)+15

d2c,_=dn("2FA\nactivo?",X_C,Y,C_FILL,C_BORDER,C_FONT)
d2t,_=dn("2FA\nactivo?",X_T,Y,T_FILL,T_BORDER,T_FONT)
Y+=H_DEC+15

c2fa,Yc=sn("[TwoFactorModal.jsx]\nBTN: Verificar Codigo OTP\nPOST /api/v1/auth/verify-2fa\nBody:{user_id,otp_code}",X_C,Y,h=H_TALL,fill=C_FILL,border=C_BORDER,font=C_FONT)
t2fa,Yt=sn("[TwoFactorModal.jsx]\nBTN: Verificar Codigo OTP\nPOST /api/v1/auth/verify-2fa\nBody:{user_id,otp_code}",X_T,Y,h=H_TALL,fill=T_FILL,border=T_BORDER,font=T_FONT)
b2fa,Yb=sn("POST /api/v1/auth/verify-2fa\nBD:SELECT totp_secret FROM usuarios WHERE id=?\n->200{sesion_activa:true}\n✖401 codigo incorrecto(3 intentos max)\nPENDIENTE: implementar TOTP en Go",X_B,Y,h=90,fill=B_FILL,border=B_BORDER,font=B_FONT,pending=True)
ed(d2c,c2fa,"SI",color=C_BORDER); ed(d2t,t2fa,"SI",color=T_BORDER)
ed(c2fa,b2fa,"POST",color=C_BORDER); ed(t2fa,b2fa,"POST",color=T_BORDER)
Y=max(Yc,Yt,Yb)+15

cdash,Yc=sn("DASHBOARD CONTRATANTE\n[DashboardContratante.jsx]\nGET /api/v1/dashboard/contratante\n->KPIs, bookings activos, wallet",X_C,Y,h=H_TALL,fill=C_FILL,border=C_BORDER,font=C_FONT,bold=True)
tdash,Yt=sn("DASHBOARD CONTRATADO\n[DashboardContratado.jsx]\nGET /api/v1/dashboard/contratado\n->KPIs, ofertas, horas de vuelo, saldo",X_T,Y,h=H_TALL,fill=T_FILL,border=T_BORDER,font=T_FONT,bold=True)
alog,Ya=sn("[AdminLoginPage.jsx]\nBTN: Acceso Admin\nPOST /api/v1/admin/auth\nBody:{email,password,admin_key}",X_A,Y,h=H_TALL,fill=A_FILL,border=A_BORDER,font=A_FONT)
adash,Ya2=sn("PANEL ADMIN MASTER\n[AdminDashboard.jsx]\nGET /api/v1/admin/metrics\n->usuarios,bookings,escrow,disputas",X_A,Ya,h=H_TALL,fill=A_FILL,border=A_BORDER,font=A_FONT,bold=True)
ed(d2c,cdash,"NO",color=C_BORDER); ed(d2t,tdash,"NO",color=T_BORDER)
ed(c2fa,cdash,"verificado",color=C_BORDER); ed(t2fa,tdash,"verificado",color=T_BORDER)
ed(a1,alog,color=A_BORDER); ed(alog,adash,color=A_BORDER)
Y=max(Yc,Yt,Ya2)+25

# ===========================
# SECCION 2: BUSQUEDA
# ===========================
sh("SEC 2: BUSQUEDA Y DESCUBRIMIENTO",X_C,Y,W_NODE,"C")
sh("SEC 2: SEARCH API",X_B,Y,W_NODE,"B")
sh("SEC 2: PERFIL PUBLICO",X_T,Y,W_NODE,"T")
Y+=45

csrch,Yc=sn("[SearchPage.jsx]\nBTN: Buscar Talento\nGET /api/v1/search\n?q=&tipo=&division=&precio_max=&lat=&lng=",X_C,Y,h=H_TALL,fill=C_FILL,border=C_BORDER,font=C_FONT)
bsrch,Yb=sn("GET /api/v1/search\nBD:SELECT p.* FROM perfiles p JOIN oficios o ON p.oficio_id=o.id\nWHERE o.nombre ILIKE '%q%' AND p.division_id<=:div\nORDER BY horas_vuelo DESC\n->200[{id,nombre,oficio,division,precio_base,avatar}]\n✖400 parametros invalidos",X_B,Y,h=110,fill=B_FILL,border=B_BORDER,font=B_FONT)
tpub,Yt=sn("[PublicProfilePage.jsx]\nActualizar Perfil Publico\nPUT /api/v1/perfiles/{id}\nBody:{bio,precio_base,reel_url,fotos[]}",X_T,Y,h=H_TALL,fill=T_FILL,border=T_BORDER,font=T_FONT)
ed(cdash,csrch,color=C_BORDER); ed(csrch,bsrch,"GET",color=C_BORDER); ed(tdash,tpub,color=T_BORDER)
Y=max(Yc,Yb,Yt)+15

cfilt,Yc=sn("[SearchFilters.jsx]\nBTN: Aplicar Filtros\nDivision(1-5) | Precio Max\nUbicacion GPS | Disponibilidad",X_C,Y,h=H_TALL,fill=C_FILL,border=C_BORDER,font=C_FONT)
cres,Yc=sn("[SearchResultsGrid.jsx]\nCards de resultados\nBTN: VER PERFIL -> GET /api/v1/perfiles/{id}\nBTN: GUARDAR -> POST /api/v1/favoritos",X_C,Yc,h=H_TALL,fill=C_FILL,border=C_BORDER,font=C_FONT)
ed(csrch,cfilt,color=C_BORDER); ed(cfilt,cres,color=C_BORDER)

ddisp,_=dn("Disponible\nen fecha?",X_C,Yc,C_FILL,C_BORDER,C_FONT)
Yc+=H_DEC+10
cwait,Yw=sn("[WaitlistModal.jsx]\nBTN: Unirse a Fila Virtual\nPOST /api/v1/waitlist\nBody:{perfil_id,fecha_evento,user_id}\nPENDIENTE: trigger de liberacion",X_C,Yc,h=90,fill=C_FILL,border=C_BORDER,font=C_FONT,pending=True)
bwait,_=sn("POST /api/v1/waitlist\nBD:INSERT INTO fila_virtual(user_id,perfil_id,fecha,posicion)\nTRIGGER:push cuando se libere slot\n->201{posicion_en_fila}\nPENDIENTE: trigger automatico",X_B,Yc,h=90,fill=B_FILL,border=B_BORDER,font=B_FONT,pending=True)
ed(ddisp,cwait,"NO",color=C_BORDER); ed(cwait,bwait,"POST",color=C_BORDER)
Y=max(Yw,Yb)+25

# ===========================
# SECCION 3: CONTRATACION Y ESCROW
# ===========================
sh("SEC 3: CONTRATACION Y ESCROW 2 HITOS",X_C,Y,W_NODE,"C")
sh("SEC 3: ESCROW API",X_B,Y,W_NODE,"B")
sh("SEC 3: GESTION DE OFERTA",X_T,Y,W_NODE,"T")
Y+=45

cmod,Yc=sn("[BookingEscrowModal.jsx]\nFecha del Evento | Duracion(horas)\nLugar/Venue | Detalles Tecnicos\nGET /api/v1/pricing/calculate\n->subtotal,anticipo_50,finiquito_50,total",X_C,Y,h=100,fill=C_FILL,border=C_BORDER,font=C_FILL)
bprice,Yb=sn("GET /api/v1/pricing/calculate\n?perfil_id=&horas=&fecha=\nBD:SELECT precio_base,tarifa_hora FROM perfiles\n->200{subtotal,anticipo_50pct,finiquito_50pct,comision,iva,total}\n✖404 perfil no encontrado",X_B,Y,h=100,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(ddisp,cmod,"SI",color=C_BORDER); ed(cmod,bprice,"GET pricing",color=C_BORDER)
Y=max(Yc,Yb)+15

cpay,Yc=sn("[PaymentMethodSelector.jsx]\nBTN: Pagar Anticipo 50%\nTarjeta(Stripe/Conekta)|SPEI|Transferencia\nPOST /api/v1/bookings/create",X_C,Y,h=90,fill=C_FILL,border=C_BORDER,font=C_FONT)
bbook,Yb=sn("POST /api/v1/bookings/create\nBody:{contratante_id,contratado_id,fecha,horas,monto_total}\nBD:INSERT INTO bookings(status=PENDING)\nBD:INSERT INTO escrow_movements(tipo=ENTRADA,monto=anticipo,status=FONDOS_RETENIDOS)\n->201{booking_id,codigo_reserva,escrow_id}\n✖402 pago rechazado | ✖409 ya contratado en esa fecha",X_B,Y,h=110,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(cmod,cpay,color=C_BORDER); ed(cpay,bbook,"POST",color=C_BORDER)
Y=max(Yc,Yb)+15

cconf,Yc=sn("[BookingConfirmationPage.jsx]\nReserva Confirmada\nCodigo: BKG-XXXXX | Status: ANTICIPO RETENIDO\nBTN: Ver Contrato PDF -> GET /api/v1/bookings/{id}/pdf",X_C,Y,h=H_TALL,fill=C_FILL,border=C_BORDER,font=C_FONT)
tnotif,Yt=sn("PUSH: Nueva Propuesta de Trabajo\n[NotificationCenter.jsx]\nGET /api/v1/bookings/{id}\n->contratante,fecha,monto,detalles",X_T,Y,h=H_TALL,fill=T_FILL,border=T_BORDER,font=T_FONT)
bnotif,Yb=sn("PUSH FCM al contratado\nGET /api/v1/bookings/{id}\nBD:SELECT b.*,u.nombre,p.precio_base FROM bookings b JOIN usuarios u\n->200{booking detallado}",X_B,Y,h=H_TALL,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(bbook,tnotif,"PUSH FCM",color=T_BORDER,async_=True); ed(tnotif,bnotif,"GET",color=T_BORDER)
Y=max(Yc,Yt,Yb)+15

daccept,_=dn("El artista\nacepta?",X_T,Y,T_FILL,T_BORDER,T_FONT)
Y+=H_DEC+15

taccept,Yt=sn("[BookingDetailPage.jsx]\nBTN: ACEPTAR CONTRATO\nPOST /api/v1/bookings/{id}/accept\n->status:ACCEPTED",X_T,Y,h=H_TALL,fill=T_FILL,border=T_BORDER,font=T_FONT)
baccept,Yb=sn("POST /api/v1/bookings/{id}/accept\nBD:UPDATE bookings SET status=ACCEPTED\nBD:UPDATE escrow_movements SET status=ACTIVO\n->200{escrow_activo:true}\nTRIGGER: push al contratante",X_B,Y,h=90,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(daccept,taccept,"SI",color=T_BORDER); ed(taccept,baccept,"POST",color=T_BORDER)

tdecl,_=sn("[BookingDetailPage.jsx]\nBTN: RECHAZAR\nPOST /api/v1/bookings/{id}/decline\nBody:{motivo} -> Reembolso 48h",X_T,Yt,h=H_TALL,fill=T_FILL,border=T_BORDER,font=T_FONT)
bdecl,_=sn("POST /api/v1/bookings/{id}/decline\nBD:UPDATE bookings SET status=DECLINED\nTRIGGER reembolso escrow->contratante\n->200{reembolso_programado}",X_B,Yb,h=H_TALL,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(daccept,tdecl,"NO",color="#ff6666"); ed(tdecl,bdecl,"POST",color=T_BORDER)
Y=max(Yt,Yb)+25

# ===========================
# SECCION 4: 86 PERFILES EN 6 CLUSTERS
# ===========================
sh("SEC 4: 86 PERFILES PROFESIONALES - 6 CLUSTERS",X_T,Y,W_NODE,"T")
sh("SEC 4: BD OFICIOS + QUANTUM ENGINE",X_B,Y,W_NODE,"B")
Y+=45

bquantum,Yb=sn("QUANTUM ENGINE - Sistema de Divisiones\nGET /api/v1/quantum/perfiles/{id}/nivel\nBD:SELECT horas_vuelo,division_actual FROM perfiles\nDiv1=0-100h Div2=100-500h Div3=500-2000h Div4=2000-10000h Div5=10000h+\n->{ nivel_actual,horas_para_siguiente,insignia}",X_B,Y,h=100,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(baccept,bquantum,"booking aceptado -> sumar horas",color=B_BORDER,async_=True)

CLUSTERS=[
    ("MUSICA (16 perfiles)","#0a1a0a","#00ff88",[
        ("Musico / Instrumentista","setlist upload,rider tecnico","RiderTecnicoUploader.jsx","POST /api/v1/perfiles/{id}/rider"),
        ("Cantante Solista","demo reel,fragmentos de audio","AudioDemoPlayer.jsx","POST /api/v1/perfiles/{id}/demos"),
        ("DJ / Productor Musical","tracklist,equipo tecnico requerido","DJEquipmentForm.jsx","POST /api/v1/perfiles/{id}/equipment"),
        ("Banda / Conjunto Musical","lista de integrantes,riders multiples","BandManagerForm.jsx","POST /api/v1/perfiles/{id}/banda"),
        ("Compositor / Letrista","portfolio de obras,INDAUTOR","CompositorPortfolio.jsx","POST /api/v1/indautor/registrar"),
        ("Arreglista Musical","muestras de arreglos,DAW preferido","ArregistaForm.jsx","PUT /api/v1/perfiles/{id}/skills"),
        ("Productor de Contenido Musical","reel de produccion,creditos","ProductorReelUpload.jsx","POST /api/v1/perfiles/{id}/reel"),
        ("Manager Artistico","roster de artistas representados","ManagerRosterForm.jsx","GET /api/v1/manager/{id}/roster"),
        ("Road Manager / Tour Manager","historial de tours,referencias","TourManagerCV.jsx","PUT /api/v1/perfiles/{id}/historial"),
        ("Locutor de Radio","demos de locucion,franja horaria","LocutorDemoPlayer.jsx","POST /api/v1/perfiles/{id}/demos"),
        ("Productor de Radio","muestras de programas producidos","RadioProductorPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio"),
        ("Influencer Musical","estadisticas de redes sociales","InfluencerStats.jsx","GET /api/v1/perfiles/{id}/socials"),
        ("Podcaster Entretenimiento","episodios publicados,metricas","PodcastEpisodes.jsx","GET /api/v1/perfiles/{id}/podcast"),
        ("Community Manager Artistico","metricas de engagement,cuentas","CommunityMetrics.jsx","GET /api/v1/perfiles/{id}/community"),
        ("Compositor OST Videojuegos","muestras de soundtrack,video","OSTPortfolio.jsx","POST /api/v1/perfiles/{id}/ost"),
        ("Agente IA Musical","demos IA musical,parametros","AIAgentConfig.jsx","POST /api/v1/ai/music/demo"),
    ]),
    ("CINE & TV (14 perfiles)","#1a0a00","#ff8800",[
        ("Director de Cine/TV","filmografia,demo reel de direccion","DirectorReel.jsx","POST /api/v1/perfiles/{id}/reel"),
        ("Actor / Actriz","book fotografico,reel de actuacion","ActorBook.jsx","POST /api/v1/perfiles/{id}/book"),
        ("Extra / Figurante","disponibilidad masiva,talla/fisico","ExtraDisponibilidad.jsx","PUT /api/v1/perfiles/{id}/fisico"),
        ("Director de Fotografia","portfolio de rodajes,camara","DFPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio"),
        ("Operador de Camara","marcas de camara manejadas","CamaraOperatorForm.jsx","PUT /api/v1/perfiles/{id}/equipment"),
        ("Editor de Video","reel de edicion,software dominado","EditorReel.jsx","POST /api/v1/perfiles/{id}/reel"),
        ("Maquillador Estilista Set","book de producciones previas","MakeupBook.jsx","POST /api/v1/perfiles/{id}/book"),
        ("Director de Arte","portfolio de disenos de set","DirectorArtePortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio"),
        ("Escenografo","plans de set,materiales requeridos","EscenografiaUpload.jsx","POST /api/v1/perfiles/{id}/escenografia"),
        ("Actor de Teatro","curriculum de obras,fotos de escena","TeatroActorCV.jsx","PUT /api/v1/perfiles/{id}/teatro"),
        ("Director Teatral","produciones dirigidas,metodologia","DirectorTeatralForm.jsx","PUT /api/v1/perfiles/{id}/metodologia"),
        ("Escenografo 3D Mapping","demos de mapping,software 3D","Mapping3DUpload.jsx","POST /api/v1/perfiles/{id}/mapping3d"),
        ("Fotografo de Eventos","galeria de eventos,equipo","FotoEventosGallery.jsx","POST /api/v1/perfiles/{id}/galeria"),
        ("Videografo Camarografo","reel de cobertura,dron","VideografiaReel.jsx","POST /api/v1/perfiles/{id}/reel"),
    ]),
    ("DOBLAJE & VOZ (9 perfiles)","#0a0a1a","#aa88ff",[
        ("Actor de Doblaje","demos de voz,rangos de registro","VoiceActorDemos.jsx","POST /api/v1/perfiles/{id}/voice_demos"),
        ("Actriz de Doblaje","demos de voz,personajes doblados","VoiceActressForm.jsx","POST /api/v1/perfiles/{id}/voice_demos"),
        ("Director de Doblaje","producciones dirigidas,estudio","DoblajeDirForm.jsx","PUT /api/v1/perfiles/{id}/estudio"),
        ("Ingeniero Sonido Doblaje","cabinas disponibles,equipos DAW","CabinaConectaForm.jsx","POST /api/v1/cabinas/connect"),
        ("Locutor Comercial","demos de spots,tonos disponibles","LocutorSpotDemos.jsx","POST /api/v1/perfiles/{id}/demos"),
        ("Narrador de Audiolibros","muestras de narracion,generos","NarradorSamples.jsx","POST /api/v1/perfiles/{id}/samples"),
        ("Coacher Vocal","metodologia de coaching,testimonios","CoacherForm.jsx","PUT /api/v1/perfiles/{id}/metodologia"),
        ("Adaptador Guiones Doblaje","portfolio de adaptaciones,idiomas","AdaptadorPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio"),
        ("Instructor Teatro Corporal","tecnicas impartidas,disponibilidad","TeatroCorpForm.jsx","PUT /api/v1/perfiles/{id}/tecnicas"),
    ]),
    ("STAFF TECNICO (13 perfiles)","#001a10","#00ff99",[
        ("Ingeniero Sonido Live","rider tecnico de PA,referencias","SoundEngineerRider.jsx","POST /api/v1/perfiles/{id}/rider"),
        ("Tecnico de Iluminacion","tipos de luz manejados,software","IluminacionForm.jsx","PUT /api/v1/perfiles/{id}/equipment"),
        ("Tecnico Video/LED","especificaciones LED,control video","VideoTecForm.jsx","PUT /api/v1/perfiles/{id}/specs"),
        ("Rigger de Escenario","certificaciones,tipos de estructura","RiggerCertForm.jsx","PUT /api/v1/perfiles/{id}/certificaciones"),
        ("Asistente de Produccion","habilidades,software de gestion","APHabilidades.jsx","PUT /api/v1/perfiles/{id}/skills"),
        ("Coordinador de Produccion","producciones coordinadas,CV","CoordProdForm.jsx","PUT /api/v1/perfiles/{id}/historial"),
        ("Technical Director TD","especificaciones tecnicas,reel","TDReel.jsx","POST /api/v1/perfiles/{id}/reel"),
        ("Prompter Operator","software manejado,referencias","PrompterForm.jsx","PUT /api/v1/perfiles/{id}/skills"),
        ("VJ Video Jockey Live","demos VJ,software Resolume","VJDemosUpload.jsx","POST /api/v1/perfiles/{id}/demos"),
        ("Tecnologo Audio Inmersivo Dolby","demos Dolby Atmos,proyectos","DolbyAtmosPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio"),
        ("Coordinador Catering Gourmet","menus de eventos,referencias","CateringMenuForm.jsx","POST /api/v1/perfiles/{id}/menu"),
        ("Artista NFT Metaverso","coleccion NFT,wallet,plataformas","NFTArtistWallet.jsx","POST /api/v1/nft/connect_wallet"),
        ("Supervisor Seguridad VIP","certificaciones,numero de personal","SeguridadVIPForm.jsx","PUT /api/v1/perfiles/{id}/certificaciones"),
    ]),
    ("CREATIVOS & ARTES ESCENICAS (16 perfiles)","#1a0a15","#ff44cc",[
        ("Ilustrador Concept Artist","portfolio digital,software","IllustratorPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio"),
        ("Disenador Grafico Escenico","portfolio de disenos,formatos","GraphicDesignerForm.jsx","POST /api/v1/perfiles/{id}/portfolio"),
        ("Escritor Contenido PR","muestras de articulos,medios","WriterPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio"),
        ("Publicista Artistico","campanas realizadas,ROI","PublicistaStats.jsx","PUT /api/v1/perfiles/{id}/campanas"),
        ("Artista de Circo Acrobata","video de actos,seguro de riesgo","CircoActosUpload.jsx","POST /api/v1/perfiles/{id}/actos"),
        ("Mago Ilusionista","video de show,tipo de magia","MagoShowUpload.jsx","POST /api/v1/perfiles/{id}/shows"),
        ("Bailarin Coreografo","reel de danza,generos dominados","DanzaReel.jsx","POST /api/v1/perfiles/{id}/reel"),
        ("Stand Up Comedian","clips de stand up,temas","StandUpClips.jsx","POST /api/v1/perfiles/{id}/clips"),
        ("Disenador Modas Shows","colecciones para escena,fotos","ModaShowForm.jsx","POST /api/v1/perfiles/{id}/colecciones"),
        ("Estilista de Artistas","portfolio de estilismo","EstilistaPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio"),
        ("Animador Eventos Infantiles","personajes disponibles,seguros","AnimadorForm.jsx","PUT /api/v1/perfiles/{id}/personajes"),
        ("Maestro de Ceremonias MC","videos de presentaciones,idiomas","MCVideos.jsx","POST /api/v1/perfiles/{id}/videos"),
        ("Periodista Entretenimiento","publicaciones,medios","PeriodistaPortfolio.jsx","PUT /api/v1/perfiles/{id}/medios"),
        ("Critico Musical Resenista","publicaciones,plataformas","CriticoLinks.jsx","PUT /api/v1/perfiles/{id}/publicaciones"),
        ("Entrenador Fisico Artistas","metodo,especialidad,certificaciones","TrainerForm.jsx","PUT /api/v1/perfiles/{id}/certificaciones"),
        ("Psicologo Coach Artistas","cedula profesional,especialidad","CoachPsicForm.jsx","PUT /api/v1/perfiles/{id}/cedula"),
    ]),
    ("VENUES & LEGAL (7 perfiles)","#0a1515","#00ddcc",[
        ("Venue Manager","capacidad,planos,rider tecnico","VenueConfigForm.jsx","PUT /api/v1/venues/{id}/config"),
        ("Promoter de Eventos","historial de eventos,garantias","PromoterHistorial.jsx","PUT /api/v1/perfiles/{id}/historial"),
        ("Booker de Artistas","roster que maneja,comision","BookerRosterForm.jsx","GET /api/v1/booker/{id}/roster"),
        ("Agente de Talento","artistas que representa,contratos","TalentoAgenteForm.jsx","GET /api/v1/agente/{id}/contratos"),
        ("Abogado Derechos de Autor","cedula,casos de entretenimiento","AbogadoCedula.jsx","PUT /api/v1/perfiles/{id}/cedula"),
        ("Contador Industria Entret","cedula,software fiscal,CFDI","ContadorFiscalForm.jsx","PUT /api/v1/perfiles/{id}/fiscal"),
        ("Coordinador Logistica Eventos","experiencia,equipo,referencias","LogisticaForm.jsx","PUT /api/v1/perfiles/{id}/logistica"),
    ]),
]

prev_clu=None
for cname,cf,cb,perfs in CLUSTERS:
    cid,Y=clh(cname,X_T,Y,W_NODE,cf,cb)
    if prev_clu: ed(prev_clu,cid,color="#444466")
    prev_clu=cid
    for pnom,pdesc,pcomp,pendpt in perfs:
        meth=pendpt.split(" ")[0]
        is_p="cabinas" in pendpt or "nft" in pendpt or "ai" in pendpt or "mapping3d" in pendpt
        nid_,Y=sn(f"[{pcomp}]\n{pnom}\n{pdesc[:45]}\n{pendpt}",X_T,Y,h=70,fill=cf,border=cb,font=PEND_FONT if is_p else "#e8ffe8",pending=is_p)
        bperf,_=sn(f"{meth} {pendpt.split(' ')[-1]}\nBD:UPDATE perfiles SET datos_oficio=? WHERE id=?\n{'PENDIENTE' if is_p else '->200{updated:true}'}",X_B,Y-70,h=70,fill=PEND_FILL if is_p else B_FILL,border=PEND_BRD if is_p else B_BORDER,font=PEND_FONT if is_p else B_FONT)
        ed(nid_,bperf,meth,color=cb)
    Y+=10

# ===========================
# SECCION 5: EVENTO EN VIVO
# ===========================
sh("SEC 5: DIA DEL EVENTO - PIN Y FINIQUITO",X_C,Y,W_NODE,"C")
sh("SEC 5: ESCROW RELEASE",X_B,Y,W_NODE,"B")
sh("SEC 5: CONFIRMACION SERVICIO",X_T,Y,W_NODE,"T")
Y+=45

cevt,Yc=sn("[EventDayHome.jsx]\nDia del Evento\nBTN: Ver QR de Identificacion\nGET /api/v1/bookings/{id}/qr\n->QR con booking_id+token efimero",X_C,Y,h=90,fill=C_FILL,border=C_BORDER,font=C_FONT)
tevt,Yt=sn("[EventDayContratado.jsx]\nDia del Evento\nBTN: Registrar Llegada\nPOST /api/v1/events/{id}/checkin\nBody:{booking_id,gps_lat,gps_lng}",X_T,Y,h=90,fill=T_FILL,border=T_BORDER,font=T_FONT)
bevt,Yb=sn("POST /api/v1/events/{id}/checkin\nBD:INSERT INTO event_checkins(booking_id,timestamp,gps)\nBD:UPDATE bookings SET status=EN_SERVICIO\n->201{checkin_confirmado:true}\n✖409 ya registro llegada",X_B,Y,h=90,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(cevt,bevt,"GET QR",color=C_BORDER); ed(tevt,bevt,"POST checkin",color=T_BORDER)
Y=max(Yc,Yt,Yb)+15

cpin,Yc=sn("[GatePOSModal.jsx]\nBTN: Ingresar PIN de 4 Digitos\nContratante ingresa su PIN secreto\nPOST /api/v1/escrow/finalize\nBody:{booking_id,pin_4digit}",X_C,Y,h=90,fill=C_FILL,border=C_BORDER,font=C_FONT,bold=True)
bpin,Yb=sn("POST /api/v1/escrow/finalize\nBD:SELECT pin_hash FROM bookings WHERE id=?\nBcrypt.compare(pin,pin_hash)\nBD:UPDATE escrow_movements SET status=LIBERADO\nBD:INSERT splits: artista=70pct plataforma=20pct reserva=10pct\n->200{liberado:true,monto_artista,monto_plataforma}\n✖401 PIN incorrecto(3 intentos->freeze)\n✖410 escrow ya liberado",X_B,Y,h=130,fill=B_FILL,border=B_BORDER,font=B_FONT,bold=True)
tpin,Yt=sn("PUSH: Pago Final Liberado!\n[WalletNotif.jsx]\nGET /api/v1/wallet/balance\n->{saldo_disponible,movimientos[]}\nBTN: Retirar Fondos -> SPEI",X_T,Y,h=90,fill=T_FILL,border=T_BORDER,font=T_FONT,bold=True)
ed(cpin,bpin,"POST PIN",color=C_BORDER); ed(bpin,tpin,"PUSH liberacion",color=T_BORDER,async_=True)
Y=max(Yc,Yt,Yb)+15

tretiro,Yt=sn("[WithdrawPage.jsx]\nBTN: Retirar a Cuenta Bancaria(SPEI)\nPOST /api/v1/wallet/withdraw\nBody:{monto,clabe_interbancaria,concepto}\nPENDIENTE: integracion bancaria",X_T,Y,h=90,fill=T_FILL,border=T_BORDER,font=T_FONT,pending=True)
bretiro,Yb=sn("POST /api/v1/wallet/withdraw\nBD:INSERT INTO retiros(user_id,monto,status=PROCESANDO)\nINTEG:SPEI via Kushki/STP API\n->202{retiro_id,tiempo_estimado}\nPENDIENTE: webhook de confirmacion bancaria",X_B,Y,h=90,fill=B_FILL,border=B_BORDER,font=B_FONT,pending=True)
ed(tretiro,bretiro,"POST SPEI",color=T_BORDER)

bhoras,Yb2=sn("QUANTUM ENGINE - Sumar Horas de Vuelo\nPOST /api/v1/quantum/horas\nBody:{user_id,horas_servicio,booking_id}\nBD:UPDATE perfiles SET horas_vuelo+=?\n?Umbral de division? -> POST /api/v1/quantum/ascender",X_B,Yb,h=90,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(bpin,bhoras,"horas completadas",color=B_BORDER,async_=True)
ed(bquantum,bhoras,"reglas de nivel",color=B_BORDER)
Y=max(Yt,Yb2)+25

# ===========================
# SECCION 6: TAQUILLA POS
# ===========================
sh("SEC 6: TAQUILLA POS - MODULO VENUES",X_C,Y,W_NODE,"C")
sh("SEC 6: TAQUILLA API + NIF B-3",X_B,Y,W_NODE,"B")
sh("SEC 6: CONTROL DE PUERTA",X_T,Y,W_NODE,"T")
Y+=45

ctaq,Yc=sn("[TaquillaHomePage.jsx]\nBTN: Gestionar Taquilla del Evento\nGET /api/v1/taquilla/events\n->[{evento_id,nombre,fecha,boletos_disponibles}]",X_C,Y,h=H_TALL,fill=C_FILL,border=C_BORDER,font=C_FONT)
csell,Yc=sn("[TicketSaleForm.jsx]\nBTN: Vender Boleto\nPOST /api/v1/taquilla/tickets/sell\nBody:{evento_id,tipo_boleto,cantidad,metodo_pago}\n->{ticket_ids[],qr_codes[]}",X_C,Yc,h=90,fill=C_FILL,border=C_BORDER,font=C_FONT)
btaq,Yb=sn("POST /api/v1/taquilla/tickets/sell\nBD:INSERT INTO boletos(evento_id,tipo,status=ACTIVO,qr_token=uuid)\nBD:INSERT INTO taquilla_corte(evento_id,monto,timestamp)\nNIF B-3: split automatico 70/20/10\n->201{boleto_id,qr_url,folio_fiscal}\n✖409 aforo agotado",X_B,Y,h=110,fill=B_FILL,border=B_BORDER,font=B_FONT)
tgate,Yt=sn("[GateControl.jsx](Venue Manager)\nBTN: Escanear QR de Entrada\nPOST /api/v1/tickets/validate\nBody:{qr_token}\n->{valido,nombre_asistente,tipo}",X_T,Y,h=90,fill=T_FILL,border=T_BORDER,font=T_FONT)
bgate,Yb2=sn("POST /api/v1/tickets/validate\nBD:SELECT * FROM boletos WHERE qr_token=?\nBD:UPDATE boletos SET status=USADO,used_at=NOW()\n->200{acceso:PERMITIDO}\n✖409 boleto ya usado | ✖404 QR invalido",X_B,Yb,h=90,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(ctaq,btaq,"GET",color=C_BORDER); ed(csell,btaq,"POST sell",color=C_BORDER); ed(tgate,bgate,"POST validate",color=T_BORDER)
Y=max(Yc,Yt,Yb2)+25

# ===========================
# SECCION 7: DISPUTAS
# ===========================
sh("SEC 7: QUEJAS, DISPUTAS Y SOPORTE",X_C,Y,W_NODE,"C")
sh("SEC 7: DISPUTES API + FREEZE ESCROW",X_B,Y,W_NODE,"B")
sh("SEC 7: DEFENSA DEL CASO",X_T,Y,W_NODE,"T")
sh("SEC 7: PANEL DE RESOLUCION ADMIN",X_A,Y,W_NODE,"A")
Y+=45

crep,Yc=sn("[DisputeForm.jsx]\nBTN: Reportar Problema\nPOST /api/v1/disputes/create\nBody:{booking_id,motivo,descripcion,evidencias[]}",X_C,Y,h=H_TALL,fill=C_FILL,border=C_BORDER,font=C_FONT)
trep,Yt=sn("[DisputeResponse.jsx]\nBTN: Responder Disputa\nPOST /api/v1/disputes/{id}/respond\nBody:{argumento,evidencias[]}",X_T,Y,h=H_TALL,fill=T_FILL,border=T_BORDER,font=T_FONT)
bdisp,Yb=sn("POST /api/v1/disputes/create\nBD:INSERT INTO disputes(booking_id,estado=ABIERTA)\nBD:UPDATE escrow_movements SET status=CONGELADO\n->201{dispute_id,escrow_status:FROZEN}\nPUSH al Admin\n✖409 disputa ya existe para este booking",X_B,Y,h=110,fill=B_FILL,border=B_BORDER,font=B_FONT)
adis,Ya=sn("[DisputesPanel.jsx](Admin)\nBTN: Ver Disputas Abiertas\nGET /api/v1/admin/disputes?status=ABIERTA\nBTN: Resolver -> PUT /api/v1/admin/disputes/{id}/resolve\nBody:{fallo:CONTRATANTE|CONTRATADO,nota_interna}",X_A,Y,h=100,fill=A_FILL,border=A_BORDER,font=A_FONT)
ed(crep,bdisp,"POST",color=C_BORDER); ed(trep,bdisp,"POST respond",color=T_BORDER)
ed(bdisp,adis,"PUSH admin",color=A_BORDER,async_=True); ed(adash,adis,color=A_BORDER)
Y=max(Yc,Yt,Yb,Ya)+15

bresolve,Yb2=sn("PUT /api/v1/admin/disputes/{id}/resolve\nBD:UPDATE disputes SET estado=RESUELTA,fallo=?\nIF fallo=CONTRATANTE: liberar escrow->contratado\nIF fallo=CONTRATADO: reembolsar->contratante\n->200{dispute_id,fondos_liberados_a}\nPUSH notif a ambas partes",X_B,Y,h=100,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(adis,bresolve,"PUT resolve",color=A_BORDER)
Y=Yb2+25

# ===========================
# SECCION 8: NOTIFICACIONES
# ===========================
sh("SEC 8: SISTEMA DE NOTIFICACIONES MULTICANAL",X_B,Y,W_NODE,"B")
Y+=45

bpush,Yb=sn("PUSH FCM/Firebase\nPOST /api/v1/notificaciones/push\nBody:{user_id,titulo,mensaje,data}\nBD:INSERT INTO notificaciones(user_id,tipo,status=ENVIADA)\n->FCM token lookup->send\nPENDIENTE: FCM credentials en Go",X_B,Y,h=90,fill=B_FILL,border=B_BORDER,font=B_FONT,pending=True)
bemail,Yb=sn("EMAIL SendGrid/SMTP\nPOST /api/v1/notificaciones/email\nBody:{to,template_id,variables{}}\nTemplates:bienvenida,booking_confirmado,disputa,pago_liberado\nPENDIENTE: integracion SendGrid",X_B,Yb,h=80,fill=B_FILL,border=B_BORDER,font=B_FONT,pending=True)
bwapp,Yb=sn("WHATSAPP BUSINESS Meta/Twilio\nPOST /api/v1/notificaciones/whatsapp\nBody:{to,template,vars{}}\nPENDIENTE: aprobacion de Meta\nPENDIENTE: implementar en Go",X_B,Yb,h=80,fill=B_FILL,border=B_BORDER,font=B_FONT,pending=True)
Y=Yb+25

# ===========================
# SECCION 9: PANEL ADMIN COMPLETO
# ===========================
sh("SEC 9: PANEL ADMIN - FONDO THOTH AC MODO DIOS",X_A,Y,W_NODE,"A")
sh("SEC 9: ADMIN API + ANALYTICS",X_B,Y,W_NODE,"B")
Y+=45

admin_panels=[
    ("Auditoria Escrow Total",
     "[EscrowAuditPanel.jsx]\nGET /api/v1/admin/escrow/all\n->[{booking_id,monto,status,fecha}]\nFiltros: status,fecha,monto_min",
     "GET /api/v1/admin/escrow/all\nBD:SELECT e.* FROM escrow_movements e JOIN bookings b\nORDER BY e.created_at DESC\n->escrow completo+booking detalle"),
    ("Gestion de Usuarios",
     "[UserManagementPanel.jsx]\nGET /api/v1/admin/users\nBTN:Suspender->PUT /api/v1/admin/users/{id}/suspend\nBTN:Verificar->PUT /api/v1/admin/users/{id}/verify\nBTN:Borrar->DELETE /api/v1/admin/users/{id}",
     "PUT /api/v1/admin/users/{id}/suspend\nBD:UPDATE usuarios SET status=SUSPENDIDO\nDELETE /api/v1/admin/users/{id}\nBD:DELETE CASCADE + anonimizar RGPD"),
    ("Taquilla Master Global",
     "[TaquillaMasterPanel.jsx]\nGET /api/v1/admin/taquilla/global\n->cortes de TODOS los venues\nFiltros: fecha,venue_id,evento_id",
     "GET /api/v1/admin/taquilla/global\nBD:SELECT SUM(monto) GROUP BY venue_id,fecha\nNIF B-3: validar splits 70/20/10\n->[{venue,total,split_artista,split_plataforma}]"),
    ("Quantum Engine - Reglas Division",
     "[QuantumEngineAdmin.jsx]\nGET /api/v1/admin/divisions/rules\nBTN:Editar Regla->PUT /api/v1/admin/divisions/rules/{id}\nBody:{horas_min,horas_max,insignia}",
     "PUT /api/v1/admin/divisions/rules/{id}\nBD:UPDATE division_rules SET horas_min=?,horas_max=?\nTRIGGER:recalcular divisiones de todos los perfiles\n->200{actualizados:N perfiles recalculados}"),
    ("Fondo Thoth Incubadora Patito Feo",
     "[IncubadoraPanel.jsx]\nGET /api/v1/admin/incubadora/postulaciones\nBTN:Aprobar->POST /api/v1/admin/incubadora/{id}/aprobar\nBTN:Rechazar->POST /api/v1/admin/incubadora/{id}/rechazar\nPENDIENTE: modulo Fondo Thoth",
     "POST /api/v1/admin/incubadora/{id}/aprobar\nBD:UPDATE postulaciones SET status=APROBADA\nBD:INSERT INTO inversiones(monto_semilla,equity_pct)\nPENDIENTE: coinversion estrategica"),
    ("Reportes SAT CFDI NIF",
     "[SATReportsPanel.jsx]\nGET /api/v1/admin/reports/sat\n?periodo=2024-Q4&tipo=CFDI\nBTN:Exportar XML->GET /api/v1/admin/reports/cfdi/export\nPENDIENTE: integracion SAT PAC",
     "GET /api/v1/admin/reports/sat\nBD:SELECT * FROM transacciones WHERE fecha BETWEEN ?\nGEN:XML CFDI 4.0\nPENDIENTE: PAC certificado"),
    ("Analytics y Metadatos KPIs",
     "[AnalyticsPanel.jsx]\nGET /api/v1/admin/analytics/kpis\n->{usuarios_activos,bookings_mes,volumen_escrow,tasa_conversion,disputas_abiertas}\nBTN:Heatmap->GET /api/v1/admin/analytics/geo",
     "GET /api/v1/admin/analytics/kpis\nBD: multiples SELECTs agregados\n->KPIs tiempo real\nPENDIENTE: caching Redis para consultas pesadas"),
    ("Gestion Perfiles y Oficios",
     "[OfficiosAdmin.jsx]\nGET /api/v1/admin/oficios\nBTN:Agregar Oficio->POST /api/v1/admin/oficios\nBTN:Editar->PUT /api/v1/admin/oficios/{id}\nBTN:Desactivar->DELETE /api/v1/admin/oficios/{id}",
     "POST /api/v1/admin/oficios\nBD:INSERT INTO oficios(nombre,cluster_id,descripcion,activo)\n->201{oficio_id}\nPENDIENTE: reindex busqueda"),
    ("Monitor de Sistema y Logs",
     "[SystemMonitor.jsx]\nGET /api/v1/admin/system/health\n->{cpu,memoria,conexiones_bd,errores_ultimas_24h}\nBTN:Logs->GET /api/v1/admin/logs?level=ERROR",
     "GET /api/v1/admin/system/health\nGO: runtime.ReadMemStats()\nBD: pg_stat_database\n->metricas de infra en tiempo real\nPENDIENTE: alertas automaticas Prometheus"),
]

prev_a=adash
for ptitulo,pui,papi in admin_panels:
    is_p="PENDIENTE" in papi or "PENDIENTE" in pui
    anode,Ya=sn(pui,X_A,Y,h=90,fill=A_FILL,border=A_BORDER,font=A_FONT)
    bnode,Yb=sn(papi,X_B,Y,h=90,fill=PEND_FILL if is_p else B_FILL,border=PEND_BRD if is_p else B_BORDER,font=PEND_FONT if is_p else B_FONT,pending=is_p)
    ed(prev_a,anode,color=A_BORDER); ed(anode,bnode,"API",color=A_BORDER)
    prev_a=anode
    Y=max(Ya,Yb)+15

# ===========================
# SECCION 10: CONFIG & LOGOUT
# ===========================
sh("SEC 10: CONFIGURACION Y CIERRE DE SESION",X_C,Y,W_NODE,"C")
sh("SEC 10: CONFIG API",X_B,Y,W_NODE,"B")
sh("SEC 10: PERFIL Y PREFERENCIAS",X_T,Y,W_NODE,"T")
Y+=45

ccfg,Yc=sn("[SettingsPage.jsx]\nConfiguracion Contratante\nIdioma/Moneda | Metodos Pago\nCambiar Contrasena | Modo OLED/Sol/EPaper\nPUT /api/v1/users/{id}/config",X_C,Y,h=90,fill=C_FILL,border=C_BORDER,font=C_FONT)
tcfg,Yt=sn("[SettingsPage.jsx]\nConfiguracion Contratado\nDisponibilidad(Calendario)\nNotificaciones ON/OFF | Precio Base\nPUT /api/v1/users/{id}/config",X_T,Y,h=90,fill=T_FILL,border=T_BORDER,font=T_FONT)
bcfg,Yb=sn("PUT /api/v1/users/{id}/config\nBD:UPDATE usuarios SET configuracion=jsonb_set()\n->200{actualizado:true}\n✖400 configuracion invalida",X_B,Y,h=H_TALL,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(ccfg,bcfg,"PUT",color=C_BORDER); ed(tcfg,bcfg,"PUT",color=T_BORDER)
Y=max(Yc,Yt,Yb)+15

cout,_=tn("CERRAR SESION\nBTN:Logout\nDELETE /api/v1/auth/session",X_C,Y,C_FILL,C_BORDER,C_FONT)
tout,_=tn("CERRAR SESION\nBTN:Logout\nDELETE /api/v1/auth/session",X_T,Y,T_FILL,T_BORDER,T_FONT)
bout,Yb=sn("DELETE /api/v1/auth/session\nBD:DELETE FROM sesiones WHERE token=?\n->200{logout:true}\nCliente: borrar JWT del storage",X_B,Y,h=H_TALL,fill=B_FILL,border=B_BORDER,font=B_FONT)
ed(cout,bout,"DELETE",color=C_BORDER); ed(tout,bout,"DELETE",color=T_BORDER)
Y=Yb+20

cdel,_=sn("[DeleteAccountModal.jsx]\nBTN: Borrar Cuenta Permanentemente\nDELETE /api/v1/users/{id}\nRGPD - 30 dias para reactivar\nPENDIENTE",X_C,Y,h=H_TALL,fill=C_FILL,border=C_BORDER,font=C_FONT,pending=True)
bdel,Yfin=sn("DELETE /api/v1/users/{id}\nBD:UPDATE usuarios SET status=ELIMINADO\nAnonimizar: nombre,email,telefono\nBD:Conservar registros fiscales 5 anos(SAT)\nPENDIENTE: proceso anonimizacion RGPD",X_B,Y,h=90,fill=B_FILL,border=B_BORDER,font=B_FONT,pending=True)
ed(cdel,bdel,"DELETE RGPD",color=C_BORDER)

# === ENSAMBLAR GRAPHML ===
OUTPUT="/Users/robertoeduardocelisrobles/Documents/Proyectos/backstage-red/diagrams/BackstageRED_MASTER_COMPLETO_v3.graphml"
HDR="""<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<graphml xmlns="http://graphml.graphdrawing.org/graphml"
  xmlns:java="http://www.yworks.com/xml/yfiles-common/1.0/java"
  xmlns:sys="http://www.yworks.com/xml/yfiles-common/markup/primitives/2.0"
  xmlns:x="http://www.yworks.com/xml/yfiles-common/markup/2.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:y="http://www.yworks.com/xml/graphml"
  xmlns:yed="http://www.yworks.com/xml/yed/3"
  xsi:schemaLocation="http://graphml.graphdrawing.org/graphml http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd">
  <key for="graphml" id="d0" yfiles.type="resources"/>
  <key for="port" id="d1" yfiles.type="portgraphics"/>
  <key for="port" id="d2" yfiles.type="portgeometry"/>
  <key for="node" id="d3" attr.name="url" attr.type="string"/>
  <key for="node" id="d4" attr.name="description" attr.type="string"/>
  <key for="node" id="d5" attr.name="url" attr.type="string"/>
  <key for="node" id="d6" yfiles.type="nodegraphics"/>
  <key for="graph" id="d7" attr.name="Description" attr.type="string"/>
  <key for="edge" id="d8" attr.name="url" attr.type="string"/>
  <key for="edge" id="d9" attr.name="description" attr.type="string"/>
  <key for="edge" id="d10" yfiles.type="edgegraphics"/>
  <graph edgedefault="directed" id="G">
  <data key="d7"><![CDATA[BackstageRED MASTER COMPLETO v3 | 4 Carriles Swimlane | 86 Perfiles | Flujos Completos | HTTP+SQL+React+Backlog]]></data>
"""
FTR="  </graph>\n</graphml>\n"

with open(OUTPUT,"w",encoding="utf-8") as f:
    f.write(HDR)
    for n in NX: f.write(n+"\n")
    for e in EX: f.write(e+"\n")
    f.write(FTR)

sz=os.path.getsize(OUTPUT)/1024
print(f"DIAGRAMA GENERADO: {OUTPUT}")
print(f"Nodos: {nc[0]} | Aristas: {ec[0]} | Tamano: {sz:.1f} KB")
print(f"Canvas estimado: 1900 x {Yfin:.0f} px")
