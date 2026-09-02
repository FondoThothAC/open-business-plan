#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BackstageRED MASTER COMPLETO v4
- Formas nativas yEd: flowchart.process, flowchart.decision, flowchart.database,
  flowchart.document, flowchart.manualInput, flowchart.predefinedProcess, flowchart.terminator
- 3 nodos por boton: Vista -> Boton -> Resultado
- 7 tipos de decision: API, fondos, JWT, reintento, KYC, RBAC, offline
- Cilindros de BD separados por cada INSERT/UPDATE/SELECT
- SEC 11: Feed CREAR | SEC 12: Incubadora Patito Feo | SEC 13: Cabinas de Doblaje
- 86 perfiles en 6 clusters
"""
import os

OUTPUT = "/Users/robertoeduardocelisrobles/Documents/Proyectos/backstage-red/diagrams/BackstageRED_MASTER_COMPLETO_v4.graphml"

# ── POSICIONES ────────────────────────────────────────────────
X_C  = 30     # Contratante
X_B  = 520    # Backend + BD
X_T  = 1010   # Contratado
X_A  = 1500   # Admin Fondo Thoth
W    = 340    # Ancho de nodo
HDR  = 70     # Alto del header de carril

# ── PALETA ───────────────────────────────────────────────────
# Carril Contratante (Azul Neón)
CC = {"fill":"#0d2035","border":"#00b4d8","font":"#cceeff","fill2":"#0a3050"}
# Carril Backend (Verde Neón)
CB = {"fill":"#091a14","border":"#06d6a0","font":"#ccffe8","fill2":"#0a2820"}
# Carril Contratado (Magenta Neón)
CT = {"fill":"#1a0830","border":"#c020ff","font":"#f0ccff","fill2":"#280a40"}
# Carril Admin (Dorado)
CA = {"fill":"#1a1200","border":"#ffd000","font":"#fff8cc","fill2":"#2a1e00"}
# Pendiente (Rojo)
CP = {"fill":"#2a0808","border":"#ff3333","font":"#ffcccc"}
# BD Cilindro (Gris Azulado)
CDB= {"fill":"#0a1a2a","border":"#4488cc","font":"#aaccee"}
# Externo (Naranja Dorado)
CEX= {"fill":"#1a1000","border":"#ff8800","font":"#ffe0aa"}
# Error (Rojo suave)
CER= {"fill":"#200808","border":"#ff4444","font":"#ffaaaa"}
# Éxito (Verde suave)
CSK= {"fill":"#081808","border":"#44cc44","font":"#aaffaa"}

nc=[0]; ec=[0]; NX=[]; EX=[]

def nid(): nc[0]+=1; return f"n{nc[0]}"
def eid(): ec[0]+=1; return f"e{ec[0]}"

def esc(s): return str(s).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

def gn(lbl,x,y,w=W,h=50,cfg="com.yworks.flowchart.process",
       fill="#0a1628",border="#06d6a0",font="#e0fff8",fs=9,bold=False,pending=False):
    """GenericNode (formas nativas yEd flowchart)."""
    _id=nid()
    if pending: fill,border,font=CP["fill"],CP["border"],CP["font"]
    fw="bold" if bold else "plain"
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
    return _id, y+h

def db(lbl,x,y,w=W,h=55,pending=False):
    """Nodo base de datos (cilindro flowchart.database)."""
    fill=CDB["fill"]; border=CDB["border"]; font=CDB["font"]
    if pending: fill,border,font=CP["fill"],CP["border"],CP["font"]
    return gn(lbl,x,y,w,h,"com.yworks.flowchart.dataBase",fill,border,font)

def doc(lbl,x,y,w=W,h=50,ok=True):
    """Nodo documento/respuesta JSON (flowchart.document)."""
    p=CSK if ok else CER
    return gn(lbl,x,y,w,h,"com.yworks.flowchart.document",p["fill"],p["border"],p["font"])

def inp(lbl,x,y,w=W,h=50,pal=None,pending=False,bold=False):
    """Nodo entrada manual usuario (flowchart.manualInput = paralelogramo)."""
    p=pal or CC
    if pending: return gn(lbl,x,y,w,h,"com.yworks.flowchart.manualInput","#2a0808","#ff3333","#ffcccc",bold=bold)
    return gn(lbl,x,y,w,h,"com.yworks.flowchart.manualInput",p["fill"],p["border"],p["font"],bold=bold)

def ext(lbl,x,y,w=W,h=50,pending=False):
    """Nodo servicio externo (flowchart.predefinedProcess)."""
    if pending: return gn(lbl,x,y,w,h,"com.yworks.flowchart.predefinedProcess","#2a0808","#ff3333","#ffcccc")
    return gn(lbl,x,y,w,h,"com.yworks.flowchart.predefinedProcess",CEX["fill"],CEX["border"],CEX["font"])

def term(lbl,x,y,w=W,h=45,pal=None):
    """Nodo inicio/fin (flowchart.terminator = capsula)."""
    p=pal or CB
    return gn(lbl,x,y,w,h,"com.yworks.flowchart.terminator",p["fill"],p["border"],p["font"],bold=True)

def dec(lbl,x,y,w=200,h=65,pal=None):
    """Nodo decision (flowchart.decision = diamante)."""
    p=pal or CB
    cx=x+W/2-w/2
    return gn(lbl,cx,y,w,h,"com.yworks.flowchart.decision",p["fill"],p["border"],p["font"],fs=9,bold=True)

def proc(lbl,x,y,w=W,h=55,pal=None,pending=False):
    """Nodo proceso principal (flowchart.process)."""
    p=pal or CB
    return gn(lbl,x,y,w,h,"com.yworks.flowchart.process",p["fill"],p["border"],p["font"],pending=pending)

def sec_hdr(label,x,y,w=W,pal=None):
    """Encabezado de sección."""
    p=pal or CB
    _id=nid()
    NX.append(
        f'<node id="{_id}"><data key="d6"><y:GenericNode configuration="BevelNode2">'
        f'<y:Geometry x="{x}" y="{y}" width="{w}" height="32"/>'
        f'<y:Fill color="{p["fill2"]}" color2="{p["fill"]}" transparent="false"/>'
        f'<y:BorderStyle color="{p["border"]}" raised="false" type="line" width="2.5"/>'
        f'<y:NodeLabel alignment="center" fontFamily="Courier New" fontSize="11" fontStyle="bold" '
        f'textColor="{p["border"]}" modelName="internal" modelPosition="c" '
        f'autoSizePolicy="node_width"><![CDATA[{esc(label)}]]></y:NodeLabel>'
        f'</y:GenericNode></data></node>'
    )
    return _id, y+32

def lane_hdr(title,x,y,w=W,pal=None):
    """Encabezado principal del carril (swimlane)."""
    p=pal or CB
    _id=nid()
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

def clu_hdr(label,x,y,w=W,cf="#1a2a1a",cb="#2a6a2a"):
    """Encabezado cluster hexagonal."""
    _id=nid()
    NX.append(
        f'<node id="{_id}"><data key="d6"><y:GenericNode configuration="com.yworks.flowchart.display">'
        f'<y:Geometry x="{x}" y="{y}" width="{w}" height="40"/>'
        f'<y:Fill color="{cf}" color2="{cf}" transparent="false"/>'
        f'<y:BorderStyle color="{cb}" raised="false" type="line" width="2.5"/>'
        f'<y:NodeLabel alignment="center" fontFamily="Courier New" fontSize="12" fontStyle="bold" '
        f'textColor="#e8ffe8" modelName="internal" modelPosition="c">'
        f'<![CDATA[{esc(label)}]]></y:NodeLabel>'
        f'</y:GenericNode></data></node>'
    )
    return _id, y+40

def ed(src,tgt,lbl="",async_=False,color="#4a9a7a",thick=False):
    """Arista de conexión."""
    _id=eid(); lt="dashed" if async_ else "line"; lw="2.5" if thick else "1.5"
    ll=f'<y:EdgeLabel fontFamily="Courier New" fontSize="8" textColor="#99ccaa" modelName="two_pos" modelPosition="head" visible="true"><![CDATA[{esc(lbl)}]]></y:EdgeLabel>' if lbl else ""
    EX.append(
        f'<edge id="{_id}" source="{src}" target="{tgt}"><data key="d10">'
        f'<y:PolyLineEdge>'
        f'<y:LineStyle color="{color}" type="{lt}" width="{lw}"/>'
        f'<y:Arrows source="none" target="standard"/>'
        f'<y:BendStyle smoothed="true"/>{ll}'
        f'</y:PolyLineEdge></data></edge>'
    )

# ──────────────────────────────────────────────────
# PATRÓN TRIPLE: Vista -> Botón -> Resultado
# ──────────────────────────────────────────────────
def triple(vista_lbl, btn_lbl, result_ok_lbl, result_err_lbl,
           x, y, pal=None, api_lbl="", pending=False):
    """
    Genera 3 nodos + 1 decision de exito:
    [Vista/Pantalla] -> [Boton/Accion] -> <Respuesta exitosa?> -> [Exito] / [Error]
    Retorna: (id_vista, id_btn, id_ok, id_err, y_final)
    """
    p=pal or CC
    v_id, yv = proc(vista_lbl, x, y, pal=p, pending=pending)
    b_id, yb = inp(btn_lbl, x, yv+5, pal=p, pending=pending)
    d_id, yd = dec("Respuesta\nexitosa?", x, yb+5, pal=p)
    ok_id, yo = doc(result_ok_lbl, x, yd+5, ok=True)
    er_id, ye = doc(result_err_lbl, x, yo+5, ok=False)
    ed(v_id, b_id, color=p["border"])
    ed(b_id, d_id, api_lbl, color=p["border"])
    ed(d_id, ok_id, "SI 2xx", color=CSK["border"])
    ed(d_id, er_id, "NO 4xx/5xx", color=CER["border"])
    return v_id, b_id, ok_id, er_id, ye+5

def token_check(x, y, pal=None):
    """Decision JWT valido -> SI: continuar | NO: redirect login."""
    p=pal or CB
    d_id, yd = dec("JWT valido?", x, y, pal=p)
    er_id, ye = proc("[TokenExpiredModal.jsx]\nSesion expirada\n-> Redirect a Login\nDELETE localStorage.jwt", x, yd+5, pal={"fill":CER["fill"],"border":CER["border"],"font":CER["font"],"fill2":CER["fill"]})
    ed(d_id, er_id, "NO / 401", color=CER["border"])
    return d_id, yd, er_id

def offline_check(x, y, pal=None):
    """Decision conectividad -> SI: API | NO: cache PWA."""
    p=pal or CC
    d_id, yd = dec("Hay\nconexion?", x, y, pal=p)
    off_id, yoff = proc("[OfflineMode.jsx]\nModo Offline PWA\nCache local IndexedDB\n-> Sincronizar al reconectar", x, yd+5,
                        pal={"fill":"#101828","border":"#6688aa","font":"#aabbcc","fill2":"#101828"})
    ed(d_id, off_id, "NO / sin internet", color="#6688aa")
    return d_id, yd, off_id

def rbac_check(x, y, role_required, pal=None):
    """Decision de permisos RBAC."""
    p=pal or CC
    d_id, yd = dec(f"Rol\nautorizado?\n({role_required})", x, y, pal=p)
    err_id, ye = proc("[AccessDenied.jsx]\n403 Acceso Denegado\nRol insuficiente\n-> Redirect a Dashboard", x, yd+5,
                      pal={"fill":CER["fill"],"border":CER["border"],"font":CER["font"],"fill2":CER["fill"]})
    ed(d_id, err_id, "NO / 403", color=CER["border"])
    return d_id, yd, err_id

def retry_dec(x, y, pal=None):
    """Decision de reintentos max 3."""
    p=pal or CB
    d_id, yd = dec("Reintentos\n< 3?", x, y, pal=p)
    final_err, ye = proc("[ErrorFinal.jsx]\nError irrecuperable\nContactar soporte\nPOST /api/v1/support/ticket", x, yd+5,
                         pal={"fill":CER["fill"],"border":CER["border"],"font":CER["font"],"fill2":CER["fill"]})
    ed(d_id, final_err, "NO / max intentos", color=CER["border"])
    return d_id, yd, final_err

def kyc_check(x, y, pal=None):
    """Decision KYC para montos mayores a $50,000 MXN."""
    p=pal or CC
    d_id, yd = dec("Monto >\n$50,000 MXN?", x, y, pal=p)
    kyc_id, ykyc = proc("[KYCModal.jsx]\nVerificacion KYC Requerida\nID oficial + selfie + comprobante\nPOST /api/v1/kyc/submit\n⚠ PENDIENTE", x, yd+5,
                         pal={"fill":"#1a1000","border":"#ff8800","font":"#ffe0aa","fill2":"#1a1000"},pending=True)
    ed(d_id, kyc_id, "SI / monto alto", color="#ff8800")
    return d_id, yd, kyc_id

def funds_check(x, y, pal=None):
    """Decision fondos suficientes."""
    p=pal or CC
    d_id, yd = dec("Fondos\nsuficientes?", x, y, pal=p)
    err_id, ye = proc("[InsufficientFunds.jsx]\nSaldo insuficiente\nBTN: Recargar Saldo\nBTN: Cambiar metodo pago", x, yd+5,
                      pal={"fill":CER["fill"],"border":CER["border"],"font":CER["font"],"fill2":CER["fill"]})
    ed(d_id, err_id, "NO / sin fondos", color=CER["border"])
    return d_id, yd, err_id

# ──────────────────────────────────────────────────────────────
# CONSTRUCCIÓN DEL DIAGRAMA
# ──────────────────────────────────────────────────────────────

# Headers de carriles
lane_hdr("CONTRATANTE\n(Quien contrata y paga)", X_C, 0, W, CC)
lane_hdr("BACKEND + BD\nAPI Go | PostgreSQL 16", X_B, 0, W, CB)
lane_hdr("CONTRATADO\n(Artista / Tecnico / Venue)", X_T, 0, W, CT)
lane_hdr("ADMIN FONDO THOTH AC\n(Modo Dios - Panel Master)", X_A, 0, W, CA)

# Leyenda
proc("LEYENDA v4\n"
     "AZUL=Contratante | VERDE=Backend+BD | MAGENTA=Contratado | DORADO=Admin\n"
     "ROJO=PENDIENTE BACKLOG | Cilindro=BD | Paralelo=Input Usuario | Doble-rect=Servicio Ext\n"
     "3 nodos/boton: [Vista]->[Boton]->[Exito/Error] | Decisiones: API,JWT,Fondos,KYC,RBAC,Retry,Offline",
     X_A+W+80, 10, w=380, h=70,
     pal={"fill":"#050d14","border":"#2a5a7a","font":"#80bbdd","fill2":"#050d14"})

Y = HDR + 30

# =========================================================
# SECCION 1: AUTENTICACION (con todas las decisiones)
# =========================================================
sec_hdr("[ SEC 1 ] AUTENTICACION",X_C,Y,W,CC); sec_hdr("[ SEC 1 ] AUTH API",X_B,Y,W,CB)
sec_hdr("[ SEC 1 ] AUTENTICACION",X_T,Y,W,CT); sec_hdr("[ SEC 1 ] ACCESO ADMIN",X_A,Y,W,CA)
Y+=42

# Offline check PRIMERO (ambos usuarios)
do_c, Ydo_c, off_c = offline_check(X_C, Y, CC)
do_t, Ydo_t, off_t = offline_check(X_T, Y, CT)
Y=max(Ydo_c,Ydo_t)+5

# Inicio App
c_start,Ycs = term("INICIO APP\n[SplashScreen.jsx]",X_C,Y,W,pal=CC)
t_start,Yts = term("INICIO APP\n[SplashScreen.jsx]",X_T,Y,W,pal=CT)
a_start,Yas = term("ACCESO ADMIN\n/admin/login",X_A,Y,W,pal=CA)

b_health,Yb = db("GET /api/health\nBD:SELECT 1 FROM pg_stat_activity\n->200{status:ok,version:1.0.0}",X_B,Y)
ed(do_c, c_start,"SI",color=CC["border"]); ed(do_t, t_start,"SI",color=CT["border"])
ed(c_start,b_health,"GET /api/health",color=CC["border"]); ed(t_start,b_health,"GET /api/health",color=CT["border"])
Y=max(Ycs,Yts,Yas,Yb)+10

# Decision tiene cuenta (Contratante)
d_has_c,Ydh_c = dec("Tiene\ncuenta?",X_C,Y,pal=CC)
d_has_t,Ydh_t = dec("Tiene\ncuenta?",X_T,Y,pal=CT)
Y=max(Ydh_c,Ydh_t)+10

# ── REGISTRO CONTRATANTE ──
c_reg_v,Ycr = proc("[RegisterPage.jsx]\nFormulario de Registro\nnombre | email | password\nseleccion de rol: CONTRATANTE",X_C,Y,pal=CC)
c_reg_b,Ycr = inp("[BTN] CREAR CUENTA\nPOST /api/v1/auth/register",X_C,Ycr+5,pal=CC)
b_reg1,Ybr = db("INSERT INTO usuarios(nombre,email,hash_pwd,rol='CONTRATANTE')\nINSERT INTO configuracion(user_id,idioma='es')",X_B,Y)
b_reg2,Ybr = doc("201 {user_id, token_jwt, expires_in:3600}\nEmail bienvenida enviado",X_B,Ybr+5,ok=True)
b_reg_err,Ybr = doc("409 email ya registrado\n400 campos invalidos\n422 password debil",X_B,Ybr+5,ok=False)
d_reg,Ydrd = dec("Registro\nexitoso?",X_C,Ycr+5,pal=CC)
ed(c_reg_b,b_reg1,"POST",color=CC["border"]); ed(c_reg_v,c_reg_b,color=CC["border"])
ed(d_has_c,c_reg_v,"NO",color=CC["border"]); ed(c_reg_b,d_reg,color=CC["border"])
ed(d_reg,b_reg2,"SI 201",color=CSK["border"]); ed(d_reg,b_reg_err,"NO 409/400",color=CER["border"])
Ycr=Ydrd+10

# ── REGISTRO CONTRATADO ──
t_reg_v,Ytr = proc("[RegisterPage.jsx]\nFormulario de Registro Talento\nnombre | email | password\nSELECCION DE OFICIO (86 opciones)",X_T,Y,pal=CT)
t_reg_b,Ytr = inp("[BTN] CREAR CUENTA TALENTO\nPOST /api/v1/auth/register\nBody:{rol:CONTRATADO,oficio_id,cluster_id}",X_T,Ytr+5,pal=CT)
b_treg1,Ybtr = db("INSERT INTO usuarios(nombre,email,hash_pwd,rol='CONTRATADO')\nINSERT INTO perfiles(user_id,oficio_id,division_id=1,horas_vuelo=0)",X_B,Ybr+5)
b_treg2,Ybtr = doc("201 {user_id,token_jwt,perfil_id}\nEmail verificacion enviado",X_B,Ybtr+5,ok=True)
d_treg,Ydtrd = dec("Registro\nexitoso?",X_T,Ytr+5,pal=CT)
ed(t_reg_b,b_treg1,"POST",color=CT["border"]); ed(t_reg_v,t_reg_b,color=CT["border"])
ed(d_has_t,t_reg_v,"NO",color=CT["border"]); ed(t_reg_b,d_treg,color=CT["border"])
ed(d_treg,b_treg2,"SI 201",color=CSK["border"])
Ytr=Ydtrd+10
Y=max(Ycr,Ytr,Ybtr)+10

# ── LOGIN + JWT ──
c_log_v,Ycl = proc("[LoginPage.jsx]\nFormulario de Login\nemail | password | [BTN] ojo/ocultar",X_C,Y,pal=CC)
c_log_b,Ycl = inp("[BTN] INICIAR SESION\nPOST /api/v1/auth/login",X_C,Ycl+5,pal=CC)
t_log_v,Ytl = proc("[LoginPage.jsx]\nFormulario de Login\nemail | password",X_T,Y,pal=CT)
t_log_b,Ytl = inp("[BTN] INICIAR SESION\nPOST /api/v1/auth/login",X_T,Ytl+5,pal=CT)
b_log1,Ybl = db("SELECT id,email,hash_pwd,rol,status FROM usuarios WHERE email=?\nBcrypt.CompareHashAndPassword(hash,pwd)",X_B,Y)
b_log2,Ybl = db("UPDATE usuarios SET last_login=NOW()\nINSERT INTO sesiones(user_id,token_jwt,expires_at,device_info)",X_B,Ybl+5)
b_log_ok,Ybl = doc("200 {token_jwt,user_id,rol,nombre,perfil_id}\nSet-Cookie: session_token=...",X_B,Ybl+5,ok=True)
b_log_err,Ybl = doc("401 credenciales invalidas\n403 cuenta suspendida\n429 demasiados intentos (rate limit)",X_B,Ybl+5,ok=False)
d_log_c,_ = dec("Login\nexitoso?",X_C,Ycl+5,pal=CC)
d_log_t,_ = dec("Login\nexitoso?",X_T,Ytl+5,pal=CT)
ed(c_log_v,c_log_b,color=CC["border"]); ed(d_has_c,c_log_v,"SI",color=CC["border"])
ed(t_log_v,t_log_b,color=CT["border"]); ed(d_has_t,t_log_v,"SI",color=CT["border"])
ed(c_log_b,b_log1,"POST login",color=CC["border"]); ed(t_log_b,b_log1,"POST login",color=CT["border"])
ed(b_log1,b_log2,color=CB["border"]); ed(b_log2,b_log_ok,color=CSK["border"]); ed(b_log2,b_log_err,color=CER["border"])
ed(c_log_b,d_log_c,color=CC["border"]); ed(d_log_c,b_log_ok,"SI 200",color=CSK["border"]); ed(d_log_c,b_log_err,"NO 401",color=CER["border"])
ed(t_log_b,d_log_t,color=CT["border"])
Y=max(Ybl,max(Ycl,Ytl))+15

# ── 2FA ──
d_2fa_c,Yd2c = dec("2FA\nactivo?",X_C,Y,pal=CC)
d_2fa_t,Yd2t = dec("2FA\nactivo?",X_T,Y,pal=CT)
Y=max(Yd2c,Yd2t)+10

c_otp_v,Yco = proc("[TwoFactorModal.jsx]\nIngresa codigo OTP de 6 digitos\nExpira en 5 min | Reenviar SMS",X_C,Y,pal=CC)
c_otp_b,Yco = inp("[BTN] VERIFICAR OTP\nPOST /api/v1/auth/verify-2fa",X_C,Yco+5,pal=CC,pending=True)
t_otp_v,Yto = proc("[TwoFactorModal.jsx]\nIngresa codigo OTP de 6 digitos",X_T,Y,pal=CT)
t_otp_b,Yto = inp("[BTN] VERIFICAR OTP\nPOST /api/v1/auth/verify-2fa",X_T,Yto+5,pal=CT,pending=True)
b_otp,Ybo = db("SELECT totp_secret FROM usuarios WHERE id=?\nVerify TOTP(secret,code,window=1)\n-> 200{sesion_activa:true}\n✖401 codigo incorrecto(max 3)\n✖423 cuenta bloqueada 30min\nPENDIENTE: libreria TOTP en Go",X_B,Y,pending=True)
ed(d_2fa_c,c_otp_v,"SI",color=CC["border"]); ed(c_otp_v,c_otp_b,color=CC["border"]); ed(c_otp_b,b_otp,"POST",color=CC["border"])
ed(d_2fa_t,t_otp_v,"SI",color=CT["border"]); ed(t_otp_v,t_otp_b,color=CT["border"]); ed(t_otp_b,b_otp,"POST",color=CT["border"])
Y=max(Yco,Yto,Ybo)+10

# ── Dashboards ──
c_dash,Ycd = proc("[DashboardContratante.jsx]\nDASHBOARD CONTRATANTE\nKPIs | Bookings activos | Wallet | Notif",X_C,Y,pal=CC,pending=False)
t_dash,Ytd = proc("[DashboardContratado.jsx]\nDASHBOARD CONTRATADO\nKPIs | Ofertas entrantes | Horas de vuelo | Saldo",X_T,Y,pal=CT)
a_log_v,Yal = proc("[AdminLoginPage.jsx]\nLogin Especial Admin\nemail | password | ADMIN_SECRET_KEY",X_A,Y,pal=CA)
a_log_b,Yal = inp("[BTN] ACCESO ADMIN\nPOST /api/v1/admin/auth",X_A,Yal+5,pal=CA)
a_dash,Yad = proc("[AdminDashboard.jsx]\nPANEL ADMIN MASTER\nKPIs globales | Alertas | Accesos rapidos",X_A,Yal+5,pal=CA)

ed(d_2fa_c,c_dash,"NO",color=CC["border"]); ed(d_2fa_t,t_dash,"NO",color=CT["border"])
ed(a_log_v,a_log_b,color=CA["border"]); ed(a_log_b,a_dash,color=CA["border"])
Y=max(Ycd,Ytd,Yad)+25

# =========================================================
# SECCION 2: BUSQUEDA & DESCUBRIMIENTO
# =========================================================
sec_hdr("[ SEC 2 ] BUSQUEDA Y DESCUBRIMIENTO",X_C,Y,W,CC)
sec_hdr("[ SEC 2 ] SEARCH API",X_B,Y,W,CB)
sec_hdr("[ SEC 2 ] PERFIL PUBLICO",X_T,Y,W,CT)
Y+=42

# JWT check antes de buscar
d_jwt,Ydj,err_jwt = token_check(X_C,Y,CC)
ed(c_dash,d_jwt,color=CC["border"])
Y=Ydj+5

c_srch_v,Ycs = proc("[SearchPage.jsx]\nBarra de Busqueda\nq=texto | filtro tipo_oficio\nBuscar por nombre, oficio, ciudad",X_C,Y,pal=CC)
c_srch_b,Ycs = inp("[BTN] BUSCAR\nGET /api/v1/search?q=&tipo=&division=&precio_max=&lat=&lng=&radio_km=",X_C,Ycs+5,pal=CC)
b_srch1,Ybs = db("SELECT p.id,p.nombre,p.precio_base,p.division_id,p.horas_vuelo,\n  o.nombre as oficio,u.avatar_url\nFROM perfiles p\nJOIN oficios o ON p.oficio_id=o.id\nJOIN usuarios u ON p.user_id=u.id\nWHERE o.nombre ILIKE '%q%'\n  AND p.division_id <= :div\n  AND p.activo = true\nORDER BY p.horas_vuelo DESC\nLIMIT 20 OFFSET :page*20",X_B,Y)
b_srch_ok,Ybs = doc("200 {resultados:[{id,nombre,oficio,division,precio_base,avatar,estrellas}],total,pagina}",X_B,Ybs+5,ok=True)
b_srch_err,Ybs = doc("400 parametros invalidos\n404 sin resultados\n429 rate limit busqueda",X_B,Ybs+5,ok=False)
ed(d_jwt,c_srch_v,"SI / JWT valido",color=CC["border"]); ed(c_srch_v,c_srch_b,color=CC["border"])
ed(c_srch_b,b_srch1,"GET",color=CC["border"]); ed(b_srch1,b_srch_ok,color=CSK["border"]); ed(b_srch1,b_srch_err,color=CER["border"])
Y=max(Ycs,Ybs)+10

# Filtros
c_filt,Ycf = proc("[SearchFilters.jsx]\nFiltros activos:\nDivision 1-5 | Precio max | GPS radio\nDisponibilidad fecha | Calificacion min",X_C,Y,pal=CC)

# Ver perfil
c_vperf_v,Ycvp = proc("[TalentProfilePage.jsx]\nVer Perfil Completo del Talento\n> reel, demos, fotos, reviews\n> precio base, disponibilidad",X_C,Ycf+5,pal=CC)
c_vperf_b,Ycvp = inp("[BTN] VER PERFIL\nGET /api/v1/perfiles/{id}",X_C,Ycvp+5,pal=CC)
b_perf,Ybp = db("SELECT p.*,u.nombre,u.avatar_url,\n  COUNT(b.id) as trabajos_completados,\n  AVG(r.estrellas) as rating\nFROM perfiles p\nJOIN usuarios u ON p.user_id=u.id\nLEFT JOIN bookings b ON b.contratado_id=p.user_id\nLEFT JOIN reviews r ON r.contratado_id=p.user_id\nWHERE p.id=? AND p.activo=true",X_B,Y)
b_perf_ok,Ybp = doc("200 {perfil_completo,reviews[],demos[],horas_vuelo,division}",X_B,Ybp+5,ok=True)
ed(c_filt,c_vperf_v,color=CC["border"]); ed(c_vperf_v,c_vperf_b,color=CC["border"])
ed(c_vperf_b,b_perf,"GET",color=CC["border"]); ed(b_perf,b_perf_ok,color=CSK["border"])
Y=max(Ycvp,Ybp)+10

# Decision disponible?
d_disp,Ydd = dec("Disponible\nen fecha?",X_C,Y,pal=CC)
Y=Ydd+10

# Fila Virtual (Waitlist)
c_wait_v,Ycw = proc("[WaitlistModal.jsx]\nArtista NO disponible\nFila Virtual: posicion actual, estimacion",X_C,Y,pal=CC)
c_wait_b,Ycw = inp("[BTN] UNIRSE A FILA VIRTUAL\nPOST /api/v1/waitlist\nBody:{perfil_id,fecha_evento,contacto}",X_C,Ycw+5,pal=CC,pending=True)
b_wait1,Ybw = db("INSERT INTO fila_virtual(user_id,perfil_id,fecha_evento,posicion=\n  (SELECT COUNT(*)+1 FROM fila_virtual WHERE perfil_id=? AND fecha_evento=?))",X_B,Y,pending=True)
b_wait_ok,Ybw = doc("201 {waitlist_id,posicion_en_fila:3,\n  estimacion_liberacion:'2025-03-15'}\nPUSH: Notif cuando se libere",X_B,Ybw+5,ok=True)
ed(d_disp,c_wait_v,"NO / ocupado",color="#ff8800"); ed(c_wait_v,c_wait_b,color=CC["border"])
ed(c_wait_b,b_wait1,"POST",color=CC["border"]); ed(b_wait1,b_wait_ok,color=CSK["border"])
Y=max(Ycw,Ybw)+10

# Perfil publico (Contratado actualiza su perfil)
t_pub_v,Ytp = proc("[PublicProfileEditor.jsx]\nEditor de Perfil Publico\nbio | precio_base | reel_url | fotos",X_T,Y-100,pal=CT)
t_pub_b,Ytp = inp("[BTN] ACTUALIZAR PERFIL\nPUT /api/v1/perfiles/{id}",X_T,Ytp+5,pal=CT)
b_pub1,Ybpu = db("UPDATE perfiles SET bio=?,precio_base=?,reel_url=?,updated_at=NOW()\nWHERE id=? AND user_id=?\n(verificar que es el dueno del perfil)",X_B,Ybw)
b_pub_ok,Ybpu = doc("200 {updated:true,perfil_id}\nCache invalidado\n-> Reindex busqueda",X_B,Ybpu+5,ok=True)
ed(t_dash,t_pub_v,color=CT["border"]); ed(t_pub_v,t_pub_b,color=CT["border"])
ed(t_pub_b,b_pub1,"PUT",color=CT["border"]); ed(b_pub1,b_pub_ok,color=CSK["border"])
Y=max(Ycw,Ybpu)+25

# =========================================================
# SECCION 3: CONTRATACION Y ESCROW
# =========================================================
sec_hdr("[ SEC 3 ] CONTRATACION Y ESCROW 2 HITOS",X_C,Y,W,CC)
sec_hdr("[ SEC 3 ] ESCROW API + PAGOS",X_B,Y,W,CB)
sec_hdr("[ SEC 3 ] OFERTA ENTRANTE",X_T,Y,W,CT)
Y+=42

# KYC check antes de monto grande
d_kyc,Ydkyc,kyc_req = kyc_check(X_C,Y,CC)
ed(d_disp,d_kyc,"SI / disponible",color=CC["border"])
Y=Ydkyc+10

# Fondos suficientes?
d_funds,Ydf,no_funds = funds_check(X_C,Y,CC)
ed(d_kyc,d_funds,"KYC ok / monto normal",color=CC["border"])
Y=Ydf+10

# Modal de contratacion
c_book_v,Ycb = proc("[BookingEscrowModal.jsx]\nFormulario de Contratacion\nFecha | Duracion | Lugar | Detalles tecnicos",X_C,Y,pal=CC)
c_book_b,Ycb = inp("[BTN] CALCULAR PRECIO\nGET /api/v1/pricing/calculate\n?perfil_id=&horas=&fecha=",X_C,Ycb+5,pal=CC)
b_price,Ybpr = db("SELECT precio_base,tarifa_hora,descuento_temporada\nFROM perfiles WHERE id=?\nCALCULAR: subtotal=precio_base+(tarifa_hora*horas)\n  anticipo_50=subtotal*0.50\n  comision=subtotal*0.20\n  iva=subtotal*0.16\n  total_con_iva=subtotal*1.16",X_B,Y)
b_price_ok,Ybpr = doc("200 {subtotal,anticipo_50,finiquito_50,comision_plataforma,iva,total}",X_B,Ybpr+5,ok=True)
ed(d_funds,c_book_v,"SI / fondos ok",color=CC["border"]); ed(c_book_v,c_book_b,color=CC["border"])
ed(c_book_b,b_price,"GET pricing",color=CC["border"]); ed(b_price,b_price_ok,color=CSK["border"])
Y=max(Ycb,Ybpr)+10

# Metodo de pago + crear booking
c_pay_v,Ycp = proc("[PaymentMethodSelector.jsx]\nSeleccion de metodo de pago\nTarjeta (Stripe) | SPEI | Transferencia",X_C,Y,pal=CC)
c_pay_b,Ycp = inp("[BTN] PAGAR ANTICIPO 50%\nPOST /api/v1/bookings/create\nBody:{perfil_id,fecha,horas,monto_total,metodo_pago}",X_C,Ycp+5,pal=CC)
b_book1,Ybb = db("BEGIN TRANSACTION\nINSERT INTO bookings(contratante_id,contratado_id,fecha,horas,monto_total,status='PENDING')\nINSERT INTO escrow_movements(booking_id,tipo='ENTRADA',monto=anticipo_50,status='FONDOS_RETENIDOS')\nCOMMIT",X_B,Y)
b_book2,Ybb = ext("Stripe/Conekta: charge(monto,card_token)\nSPEI: generar CLABE temporal de deposito\n-> webhook de confirmacion de pago",X_B,Ybb+5)
b_book_ok,Ybb = doc("201 {booking_id,codigo_reserva:BKG-XXXXX,\n  escrow_id,status:PENDING_ACCEPTANCE}",X_B,Ybb+5,ok=True)
b_book_err,Ybb = doc("402 pago rechazado (tarjeta)\n409 artista ya contratado en esa fecha\n503 servicio de pagos no disponible",X_B,Ybb+5,ok=False)
d_book_ok,Ydbo = dec("Pago\nprocesado?",X_C,Ycp+5,pal=CC)
ed(c_pay_v,c_pay_b,color=CC["border"]); ed(c_book_b,c_pay_v,color=CC["border"])
ed(c_pay_b,b_book1,"POST",color=CC["border"]); ed(b_book1,b_book2,color=CB["border"]); ed(b_book2,b_book_ok,color=CSK["border"]); ed(b_book2,b_book_err,color=CER["border"])
ed(c_pay_b,d_book_ok,color=CC["border"]); ed(d_book_ok,b_book_ok,"SI 201",color=CSK["border"]); ed(d_book_ok,b_book_err,"NO 402",color=CER["border"])
Y=max(Ycp,Ybb)+10

# Confirmacion
c_conf_v,Ycc = proc("[BookingConfirmationPage.jsx]\nReserva Confirmada!\nCodigo: BKG-XXXXX\nStatus: Esperando aceptacion del artista",X_C,Y,pal=CC)
c_conf_b,Ycc = inp("[BTN] VER CONTRATO PDF\nGET /api/v1/bookings/{id}/pdf",X_C,Ycc+5,pal=CC,pending=True)

# Push al Contratado
t_notif_v,Ytn = proc("[NotificationCenter.jsx]\nPUSH: Nueva Propuesta de Trabajo!\nContratante: {nombre}\nMonto: ${anticipo} | Fecha: {fecha}",X_T,Y,pal=CT)
t_notif_b,Ytn = inp("[BTN] VER OFERTA COMPLETA\nGET /api/v1/bookings/{id}",X_T,Ytn+5,pal=CT)
b_notif1,Ybn = db("SELECT b.*,u.nombre,p.precio_base,\n  e.monto as escrow_anticipo\nFROM bookings b\nJOIN usuarios u ON b.contratante_id=u.id\nJOIN perfiles p ON b.contratado_id=p.user_id\nJOIN escrow_movements e ON e.booking_id=b.id\nWHERE b.id=?",X_B,Y)
b_notif_push,Ybn = ext("FCM Push Notification al contratado\nPOST /api/v1/notificaciones/push\n{titulo:'Nueva propuesta',data:{booking_id}}",X_B,Ybn+5)
ed(b_book_ok,t_notif_v,"PUSH FCM",color=CT["border"],async_=True)
ed(t_notif_v,t_notif_b,color=CT["border"]); ed(t_notif_b,b_notif1,"GET",color=CT["border"]); ed(b_notif1,b_notif_push,color=CB["border"])
Y=max(Ycc,Ytn,Ybn)+10

# Artista decide
d_accept,Yda = dec("El artista\nacepta la\noferta?",X_T,Y,pal=CT)
Y=Yda+10

# Aceptar
t_acc_v,Yta = proc("[BookingDetailPage.jsx]\nVer Detalle Completo de la Oferta\ncondiciones | monto | fecha | lugar",X_T,Y,pal=CT)
t_acc_b,Yta = inp("[BTN] ACEPTAR CONTRATO\nPOST /api/v1/bookings/{id}/accept",X_T,Yta+5,pal=CT)
b_acc1,Yba = db("UPDATE bookings SET status='ACCEPTED',accepted_at=NOW()\nUPDATE escrow_movements SET status='ACTIVO'",X_B,Y)
b_acc2,Yba = ext("FCM Push al Contratante\n'Tu artista acepto! Nos vemos el {fecha}'",X_B,Yba+5)
b_acc_ok,Yba = doc("200 {status:ACCEPTED,escrow_activo:true}\nAmbas partes notificadas",X_B,Yba+5,ok=True)
ed(d_accept,t_acc_v,"SI / acepta",color=CT["border"]); ed(t_acc_v,t_acc_b,color=CT["border"])
ed(t_acc_b,b_acc1,"POST",color=CT["border"]); ed(b_acc1,b_acc2,color=CB["border"]); ed(b_acc2,b_acc_ok,color=CSK["border"])

# Rechazar
t_dec_v,Ytd = proc("[BookingDetailPage.jsx]\nRechazar Propuesta\nmotivo de rechazo",X_T,Yta+5,pal=CT)
t_dec_b,Ytd = inp("[BTN] RECHAZAR OFERTA\nPOST /api/v1/bookings/{id}/decline\nBody:{motivo:string}",X_T,Ytd+5,pal=CT)
b_dec1,Ybd = db("UPDATE bookings SET status='DECLINED'\nTRIGGER: ROLLBACK escrow\n-> reembolso anticipo al contratante\n  en 1-3 dias habiles",X_B,Yba+5)
b_dec_ok,Ybd = doc("200 {reembolso_programado:true,fecha_reembolso}\nNotif al contratante: artista declino",X_B,Ybd+5,ok=True)
ed(d_accept,t_dec_v,"NO / rechaza",color="#ff6666"); ed(t_dec_v,t_dec_b,color=CT["border"])
ed(t_dec_b,b_dec1,"POST",color=CT["border"]); ed(b_dec1,b_dec_ok,color=CSK["border"])
Y=max(Yta,Ytd,Ybd)+25

# =========================================================
# SECCION 4: 86 PERFILES EN 6 CLUSTERS
# =========================================================
sec_hdr("[ SEC 4 ] 86 PERFILES PROFESIONALES - 6 CLUSTERS + QUANTUM",X_T,Y,W,CT)
sec_hdr("[ SEC 4 ] BD OFICIOS + QUANTUM ENGINE",X_B,Y,W,CB)
Y+=42

b_quantum,Ybq = proc("QUANTUM ENGINE - Sistema de 5 Divisiones\nGET /api/v1/quantum/perfiles/{id}/nivel\nBD:SELECT horas_vuelo,division_actual FROM perfiles\nDiv1=0-100h | Div2=100-500h | Div3=500-2000h\nDiv4=2000-10000h | Div5=10000h+\n->{nivel,horas_para_siguiente,insignia,beneficios}",X_B,Y,pal=CB)
ed(b_acc1,b_quantum,"booking aceptado",color=CB["border"],async_=True)

CLUSTERS=[
    ("MUSICA (16)","#0a1a0a","#00ff88","#0d2a0d",[
        ("Musico/Instrumentista","setlist,rider tecnico","RiderTecnicoUploader.jsx","POST /api/v1/perfiles/{id}/rider",False),
        ("Cantante Solista","demo reel,fragmentos audio","AudioDemoPlayer.jsx","POST /api/v1/perfiles/{id}/demos",False),
        ("DJ / Productor Musical","tracklist,equipo tecnico","DJEquipmentForm.jsx","POST /api/v1/perfiles/{id}/equipment",False),
        ("Banda / Conjunto Musical","integrantes,riders multiples","BandManagerForm.jsx","POST /api/v1/perfiles/{id}/banda",False),
        ("Compositor / Letrista","portfolio obras,INDAUTOR","CompositorPortfolio.jsx","POST /api/v1/indautor/registrar",False),
        ("Arreglista Musical","arreglos,DAW preferido","ArregistaForm.jsx","PUT /api/v1/perfiles/{id}/skills",False),
        ("Productor Contenido Musical","reel produccion,creditos","ProductorReelUpload.jsx","POST /api/v1/perfiles/{id}/reel",False),
        ("Manager Artistico","roster artistas","ManagerRosterForm.jsx","GET /api/v1/manager/{id}/roster",False),
        ("Road/Tour Manager","historial tours,refs","TourManagerCV.jsx","PUT /api/v1/perfiles/{id}/historial",False),
        ("Locutor de Radio","demos locucion,franja","LocutorDemoPlayer.jsx","POST /api/v1/perfiles/{id}/demos",False),
        ("Productor de Radio","programas producidos","RadioProductorPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio",False),
        ("Influencer Musical","stats redes sociales","InfluencerStats.jsx","GET /api/v1/perfiles/{id}/socials",False),
        ("Podcaster Entretenimiento","episodios,metricas","PodcastEpisodes.jsx","GET /api/v1/perfiles/{id}/podcast",False),
        ("Community Manager Artistico","engagement,cuentas","CommunityMetrics.jsx","GET /api/v1/perfiles/{id}/community",False),
        ("Compositor OST Videojuegos","soundtrack,video","OSTPortfolio.jsx","POST /api/v1/perfiles/{id}/ost",False),
        ("Agente IA Musical","demos IA,parametros","AIAgentConfig.jsx","POST /api/v1/ai/music/demo",True),
    ]),
    ("CINE & TV (14)","#1a0a00","#ff8800","#2a1500",[
        ("Director de Cine/TV","filmografia,reel","DirectorReel.jsx","POST /api/v1/perfiles/{id}/reel",False),
        ("Actor / Actriz","book fotografico,reel","ActorBook.jsx","POST /api/v1/perfiles/{id}/book",False),
        ("Extra / Figurante","disponibilidad,fisico","ExtraDisponibilidad.jsx","PUT /api/v1/perfiles/{id}/fisico",False),
        ("Director de Fotografia","portfolio rodajes,camara","DFPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio",False),
        ("Operador de Camara","marcas de camara","CamaraOperatorForm.jsx","PUT /api/v1/perfiles/{id}/equipment",False),
        ("Editor de Video","reel edicion,software","EditorReel.jsx","POST /api/v1/perfiles/{id}/reel",False),
        ("Maquillador/Estilista Set","book producciones","MakeupBook.jsx","POST /api/v1/perfiles/{id}/book",False),
        ("Director de Arte","portfolio disenos set","DirectorArtePortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio",False),
        ("Escenografo","plans set,materiales","EscenografiaUpload.jsx","POST /api/v1/perfiles/{id}/escenografia",False),
        ("Actor de Teatro","curriculum obras,fotos","TeatroActorCV.jsx","PUT /api/v1/perfiles/{id}/teatro",False),
        ("Director Teatral","producciones,metodologia","DirectorTeatralForm.jsx","PUT /api/v1/perfiles/{id}/metodologia",False),
        ("Escenografo 3D Mapping","demos mapping,3D","Mapping3DUpload.jsx","POST /api/v1/perfiles/{id}/mapping3d",True),
        ("Fotografo de Eventos","galeria,equipo foto","FotoEventosGallery.jsx","POST /api/v1/perfiles/{id}/galeria",False),
        ("Videografo/Camarografo","reel cobertura,dron","VideografiaReel.jsx","POST /api/v1/perfiles/{id}/reel",False),
    ]),
    ("DOBLAJE & VOZ (9)","#0a0a1a","#aa88ff","#14143a",[
        ("Actor de Doblaje","demos voz,registros","VoiceActorDemos.jsx","POST /api/v1/perfiles/{id}/voice_demos",False),
        ("Actriz de Doblaje","demos voz,personajes","VoiceActressForm.jsx","POST /api/v1/perfiles/{id}/voice_demos",False),
        ("Director de Doblaje","producciones,estudio","DoblajeDirForm.jsx","PUT /api/v1/perfiles/{id}/estudio",False),
        ("Ingeniero Sonido Doblaje","cabinas DAW","CabinaConectaForm.jsx","POST /api/v1/cabinas/connect",True),
        ("Locutor Comercial","demos spots,tonos","LocutorSpotDemos.jsx","POST /api/v1/perfiles/{id}/demos",False),
        ("Narrador Audiolibros","narracion,generos","NarradorSamples.jsx","POST /api/v1/perfiles/{id}/samples",False),
        ("Coacher Vocal","coaching,testimonios","CoacherForm.jsx","PUT /api/v1/perfiles/{id}/metodologia",False),
        ("Adaptador Guiones Doblaje","adaptaciones,idiomas","AdaptadorPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio",False),
        ("Instructor Teatro Corporal","tecnicas,disponibilidad","TeatroCorpForm.jsx","PUT /api/v1/perfiles/{id}/tecnicas",False),
    ]),
    ("STAFF TECNICO (13)","#001a10","#00ff99","#002a18",[
        ("Ingeniero Sonido Live","rider PA,referencias","SoundEngineerRider.jsx","POST /api/v1/perfiles/{id}/rider",False),
        ("Tecnico Iluminacion","luces,software","IluminacionForm.jsx","PUT /api/v1/perfiles/{id}/equipment",False),
        ("Tecnico Video/LED","LED,control video","VideoTecForm.jsx","PUT /api/v1/perfiles/{id}/specs",False),
        ("Rigger de Escenario","certificaciones,estructuras","RiggerCertForm.jsx","PUT /api/v1/perfiles/{id}/certificaciones",False),
        ("Asistente de Produccion","habilidades,software","APHabilidades.jsx","PUT /api/v1/perfiles/{id}/skills",False),
        ("Coordinador de Produccion","producciones,CV","CoordProdForm.jsx","PUT /api/v1/perfiles/{id}/historial",False),
        ("Technical Director TD","specs tecnicas,reel","TDReel.jsx","POST /api/v1/perfiles/{id}/reel",False),
        ("Prompter Operator","software,referencias","PrompterForm.jsx","PUT /api/v1/perfiles/{id}/skills",False),
        ("VJ Video Jockey Live","demos VJ,Resolume","VJDemosUpload.jsx","POST /api/v1/perfiles/{id}/demos",True),
        ("Tecnologo Audio Dolby","Dolby Atmos,proyectos","DolbyAtmosPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio",True),
        ("Coordinador Catering","menus eventos,refs","CateringMenuForm.jsx","POST /api/v1/perfiles/{id}/menu",False),
        ("Artista NFT Metaverso","coleccion,wallet","NFTArtistWallet.jsx","POST /api/v1/nft/connect_wallet",True),
        ("Supervisor Seguridad VIP","certificaciones,personal","SeguridadVIPForm.jsx","PUT /api/v1/perfiles/{id}/certificaciones",False),
    ]),
    ("CREATIVOS & ARTES (16)","#1a0a15","#ff44cc","#2a1028",[
        ("Ilustrador Concept Artist","portfolio,software","IllustratorPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio",False),
        ("Disenador Grafico Escenico","disenos,formatos","GraphicDesignerForm.jsx","POST /api/v1/perfiles/{id}/portfolio",False),
        ("Escritor Contenido PR","articulos,medios","WriterPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio",False),
        ("Publicista Artistico","campanas,ROI","PublicistaStats.jsx","PUT /api/v1/perfiles/{id}/campanas",False),
        ("Artista Circo/Acrobata","actos,seguro","CircoActosUpload.jsx","POST /api/v1/perfiles/{id}/actos",False),
        ("Mago/Ilusionista","show,tipo magia","MagoShowUpload.jsx","POST /api/v1/perfiles/{id}/shows",False),
        ("Bailarin/Coreografo","reel danza,generos","DanzaReel.jsx","POST /api/v1/perfiles/{id}/reel",False),
        ("Stand Up Comedian","clips,temas","StandUpClips.jsx","POST /api/v1/perfiles/{id}/clips",False),
        ("Disenador Modas Shows","colecciones escena","ModaShowForm.jsx","POST /api/v1/perfiles/{id}/colecciones",False),
        ("Estilista de Artistas","portfolio estilismo","EstilistaPortfolio.jsx","POST /api/v1/perfiles/{id}/portfolio",False),
        ("Animador Eventos Infantiles","personajes,seguros","AnimadorForm.jsx","PUT /api/v1/perfiles/{id}/personajes",False),
        ("Maestro Ceremonias MC","presentaciones,idiomas","MCVideos.jsx","POST /api/v1/perfiles/{id}/videos",False),
        ("Periodista Entretenimiento","publicaciones,medios","PeriodistaPortfolio.jsx","PUT /api/v1/perfiles/{id}/medios",False),
        ("Critico Musical/Resenista","publicaciones,plataformas","CriticoLinks.jsx","PUT /api/v1/perfiles/{id}/publicaciones",False),
        ("Entrenador Fisico Artistas","metodo,certificaciones","TrainerForm.jsx","PUT /api/v1/perfiles/{id}/certificaciones",False),
        ("Psicologo/Coach Artistas","cedula,especialidad","CoachPsicForm.jsx","PUT /api/v1/perfiles/{id}/cedula",False),
    ]),
    ("VENUES & LEGAL (7)","#0a1515","#00ddcc","#0a2a28",[
        ("Venue Manager","capacidad,planos,rider","VenueConfigForm.jsx","PUT /api/v1/venues/{id}/config",False),
        ("Promoter de Eventos","historial,garantias","PromoterHistorial.jsx","PUT /api/v1/perfiles/{id}/historial",False),
        ("Booker de Artistas","roster,comision","BookerRosterForm.jsx","GET /api/v1/booker/{id}/roster",False),
        ("Agente de Talento","representados,contratos","TalentoAgenteForm.jsx","GET /api/v1/agente/{id}/contratos",False),
        ("Abogado Derechos Autor","cedula,casos","AbogadoCedula.jsx","PUT /api/v1/perfiles/{id}/cedula",False),
        ("Contador Industria Entret","cedula,fiscal,CFDI","ContadorFiscalForm.jsx","PUT /api/v1/perfiles/{id}/fiscal",False),
        ("Coord Logistica Eventos","experiencia,equipo","LogisticaForm.jsx","PUT /api/v1/perfiles/{id}/logistica",False),
    ]),
]

prev_clu=None
for cname,cf,cb,cf2,perfs in CLUSTERS:
    cid,Y=clu_hdr(cname,X_T,Y,W,cf,cb)
    if prev_clu: ed(prev_clu,cid,color="#555577")
    prev_clu=cid
    for pnom,pdesc,pcomp,pendpt,is_p in perfs:
        meth=pendpt.split(" ")[0]
        # Triple patron por perfil: Vista -> Boton -> BD
        p_v,Ypv = proc(f"[{pcomp}]\n{pnom}\n{pdesc[:45]}",X_T,Y,pal={"fill":cf,"border":cb,"font":"#e0ffe0","fill2":cf2},pending=is_p)
        p_b,Ypv = inp(f"[BTN] SUBIR/ACTUALIZAR\n{pendpt}",X_T,Ypv+3,pal={"fill":cf,"border":cb,"font":"#e0ffe0","fill2":cf2},pending=is_p)
        bp,Ybp = db(f"{meth} {pendpt.split(' ')[-1]}\nBD:UPDATE perfiles SET datos_oficio=jsonb_set(datos_oficio,'{pcomp}',?)\nWHERE id=? AND user_id=?\n{'->PENDIENTE' if is_p else '->200{updated:true,timestamp}'}",X_B,Y,pending=is_p)
        ed(p_v,p_b,color=cb); ed(p_b,bp,meth,color=cb)
        Y=max(Ypv,Ybp)+5
    Y+=8

# =========================================================
# SECCION 5: EVENTO EN VIVO (PIN + FINIQUITO)
# =========================================================
sec_hdr("[ SEC 5 ] DIA DEL EVENTO - PIN FINIQUITO + SPLITS",X_C,Y,W,CC)
sec_hdr("[ SEC 5 ] ESCROW RELEASE",X_B,Y,W,CB)
sec_hdr("[ SEC 5 ] CONFIRMACION SERVICIO",X_T,Y,W,CT)
Y+=42

# Checkin del artista
t_chk_v,Ytc = proc("[EventDayContratado.jsx]\nDia del Evento - Registro de Llegada\nubicacion GPS activa | hora de llegada",X_T,Y,pal=CT)
t_chk_b,Ytc = inp("[BTN] REGISTRAR LLEGADA (GPS)\nPOST /api/v1/events/{id}/checkin",X_T,Ytc+5,pal=CT)
b_chk1,Ybc = db("INSERT INTO event_checkins(booking_id,timestamp=NOW(),gps_lat,gps_lng)\nUPDATE bookings SET status='EN_SERVICIO'",X_B,Y)
b_chk_ok,Ybc = doc("201 {checkin_confirmado:true,hora_llegada}\nPUSH al contratante: Artista llego!",X_B,Ybc+5,ok=True)
b_chk_err,Ybc = doc("409 ya registro llegada\n400 GPS fuera de rango permitido",X_B,Ybc+5,ok=False)
d_chk,Ydch = dec("Checkin\nvalido?",X_T,Ytc+5,pal=CT)
ed(t_chk_v,t_chk_b,color=CT["border"]); ed(t_chk_b,b_chk1,"POST",color=CT["border"]); ed(t_chk_b,d_chk,color=CT["border"])
ed(d_chk,b_chk_ok,"SI",color=CSK["border"]); ed(d_chk,b_chk_err,"NO",color=CER["border"]); ed(b_chk1,b_chk_ok,color=CSK["border"])
Y=max(Ytc,Ybc)+10

# Ver QR de identificacion (Contratante)
c_qr_v,Ycq = proc("[EventDayHome.jsx]\nDia del Evento - Panel del Contratante\nVer QR de Identificacion | Cronometro",X_C,Y,pal=CC)
c_qr_b,Ycq = inp("[BTN] VER MI QR DE PAGO\nGET /api/v1/bookings/{id}/qr\n->QR con booking_id+token efimero",X_C,Ycq+5,pal=CC)
b_qr1,Ybq2 = db("SELECT booking_id,contratante_id,escrow_id FROM bookings WHERE id=?\nGEN: QR token=UUID()+exp=+8h\nINSERT INTO qr_tokens(token,booking_id,expires_at)",X_B,Y)
b_qr_ok,Ybq2 = doc("200 {qr_url,qr_token,expires_at}\nQR se muestra en pantalla del contratante",X_B,Ybq2+5,ok=True)
ed(c_qr_v,c_qr_b,color=CC["border"]); ed(c_qr_b,b_qr1,"GET",color=CC["border"]); ed(b_qr1,b_qr_ok,color=CSK["border"])
Y=max(Ycq,Ybq2)+10

# PIN de 4 digitos - FLUJO CRITICO
c_pin_v,Ycp2 = proc("[GatePOSModal.jsx]\nIngreso de PIN de Finiquito\n4 digitos secretos del contratante\nEl artista no conoce el PIN",X_C,Y,pal=CC)
c_pin_b,Ycp2 = inp("[BTN] CONFIRMAR PIN Y LIBERAR PAGO\nPOST /api/v1/escrow/finalize\nBody:{booking_id,pin_4digit}",X_C,Ycp2+5,pal=CC,bold=True)

d_pin,Ydpin = dec("PIN\ncorrecto?",X_C,Ycp2+5,pal=CC)
d_intentos,Ydint = dec("Intentos\n< 3?",X_C,Ydpin+5,pal={"fill":CER["fill"],"border":CER["border"],"font":CER["font"],"fill2":CER["fill"]})

# PIN incorrecto - bloqueo
pin_freeze,Ypf = proc("[PINBlockedModal.jsx]\nPIN incorrecto 3 veces\nEscrow CONGELADO por seguridad\nContactar soporte: POST /api/v1/support/ticket",X_C,Ydint+5,
                       pal={"fill":CER["fill"],"border":CER["border"],"font":CER["font"],"fill2":CER["fill"]})

b_pin1,Ybpin = db("SELECT pin_hash FROM bookings WHERE id=? AND status='EN_SERVICIO'\nBcrypt.CompareHashAndPassword(pin_hash,pin_4digit)\nIF intentos >= 3: UPDATE escrow SET status='CONGELADO'",X_B,Y)
b_pin_split,Ybpin = db("BEGIN TRANSACTION\nUPDATE escrow_movements SET status='LIBERADO',liberado_at=NOW()\nINSERT INTO splits:\n  artista: escrow.monto_total * 0.70\n  plataforma: escrow.monto_total * 0.20\n  reserva_fondo: escrow.monto_total * 0.10\nUPDATE bookings SET status='COMPLETADO'\nCOMMIT",X_B,Ybpin+5)
b_pin_ok,Ybpin = doc("200 {liberado:true,monto_artista,monto_plataforma,\n  monto_reserva,timestamp_liberacion}\nPUSH a ambas partes",X_B,Ybpin+5,ok=True)
b_pin_err,Ybpin = doc("401 PIN incorrecto\n423 escrow bloqueado por seguridad\n410 escrow ya fue liberado",X_B,Ybpin+5,ok=False)

ed(c_pin_v,c_pin_b,color=CC["border"]); ed(c_pin_b,d_pin,color=CC["border"])
ed(d_pin,b_pin1,"POST PIN",color=CC["border"])
ed(d_pin,b_pin_split,"SI correcto",color=CSK["border"]); ed(b_pin_split,b_pin_ok,color=CSK["border"])
ed(d_pin,d_intentos,"NO / error",color=CER["border"]); ed(d_intentos,pin_freeze,"NO / max",color=CER["border"])
ed(d_intentos,c_pin_v,"SI / reintentar",color="#ffaa00")
ed(b_pin1,b_pin_err,color=CER["border"])

# Notificacion al Contratado: pago liberado
t_pay_notif,Ytpn = proc("[WalletNotif.jsx]\nPUSH: PAGO FINAL LIBERADO!\nMonto recibido: ${monto_artista}\nSaldo disponible actualizado",X_T,Y,pal=CT)
t_wallet_v,Ytw = proc("[WalletPage.jsx]\nBilletera Digital\nSaldo disponible | Movimientos | Retiros",X_T,Ytpn+5,pal=CT)
t_wallet_b,Ytw = inp("[BTN] RETIRAR FONDOS (SPEI)\nPOST /api/v1/wallet/withdraw\nBody:{monto,clabe,concepto}\n(PENDIENTE: Kushki/STP)",X_T,Ytw+5,pal=CT,pending=True)
b_retiro,Ybr = db("INSERT INTO retiros(user_id,monto,clabe,status='PROCESANDO')\nINSEG: SPEI via STP API\n->202{retiro_id,tiempo_estimado:'1-3 dias'}\n(PENDIENTE: webhook confirmacion bancaria)",X_B,Ybpin)
b_retiro_ok,Ybr = doc("202 {retiro_id,tiempo_estimado}\nPUSH: 'Retiro iniciado!'",X_B,Ybr+5,ok=True)

ed(b_pin_ok,t_pay_notif,"PUSH liberacion",color=CT["border"],async_=True)
ed(t_pay_notif,t_wallet_v,color=CT["border"]); ed(t_wallet_v,t_wallet_b,color=CT["border"])
ed(t_wallet_b,b_retiro,"POST SPEI",color=CT["border"]); ed(b_retiro,b_retiro_ok,color=CSK["border"])

# Quantum: sumar horas
b_horas,Ybh = db("QUANTUM ENGINE - Sumar Horas\nUPDATE perfiles SET horas_vuelo=horas_vuelo+:h\nWHERE user_id=?\nIF horas_vuelo >= siguiente_umbral:\n  UPDATE perfiles SET division_id=division_id+1\n  INSERT INTO insignias(user_id,tipo,fecha)",X_B,Ybr)
ed(b_pin_split,b_horas,"horas completadas",color=CB["border"],async_=True)

Y=max(Ycp2,Ytw,Ybh)+25

# =========================================================
# SECCION 6: TAQUILLA POS
# =========================================================
sec_hdr("[ SEC 6 ] TAQUILLA POS - MODULO VENUES",X_C,Y,W,CC)
sec_hdr("[ SEC 6 ] TAQUILLA API + NIF B-3",X_B,Y,W,CB)
sec_hdr("[ SEC 6 ] CONTROL PUERTA (VENUE MGR)",X_T,Y,W,CT)
Y+=42

# RBAC para Venue Manager
d_rbac_v,Ydrv,err_rbac = rbac_check(X_T,Y,"VENUE_MANAGER",CT)
ed(t_dash,d_rbac_v,color=CT["border"])

c_taq_v,Yct = proc("[TaquillaHomePage.jsx]\nGestion de Taquilla\nEventos del venue | Tipos de boleto | Precios",X_C,Y,pal=CC)
c_taq_b,Yct = inp("[BTN] VER MIS EVENTOS DE TAQUILLA\nGET /api/v1/taquilla/events\n?venue_id=&fecha_desde=&fecha_hasta=",X_C,Yct+5,pal=CC)
b_taq1,Ybt = db("SELECT e.id,e.nombre,e.fecha,e.aforo_total,\n  COUNT(b.id) as boletos_vendidos\nFROM eventos e\nLEFT JOIN boletos b ON b.evento_id=e.id\nWHERE e.venue_id=?\nGROUP BY e.id",X_B,Y)
b_taq_ok,Ybt = doc("200 [{evento_id,nombre,fecha,aforo_total,vendidos,disponibles}]",X_B,Ybt+5,ok=True)
ed(c_taq_v,c_taq_b,color=CC["border"]); ed(c_taq_b,b_taq1,"GET",color=CC["border"]); ed(b_taq1,b_taq_ok,color=CSK["border"])
Y=max(Yct,Ybt)+10

# Venta de boleto
c_sell_v,Ycs2 = proc("[TicketSaleForm.jsx]\nVender Boleto en Taquilla\ntipo_boleto | cantidad | metodo_pago",X_C,Y,pal=CC)
c_sell_b,Ycs2 = inp("[BTN] VENDER BOLETO(S)\nPOST /api/v1/taquilla/tickets/sell",X_C,Ycs2+5,pal=CC)
d_aforo,Ydf = dec("Aforo\ndisponible?",X_C,Ycs2+5,pal=CC)
b_sell1,Ybs2 = db("INSERT INTO boletos(evento_id,tipo,status='ACTIVO',qr_token=gen_random_uuid())\nINSERT INTO taquilla_corte(evento_id,monto,concepto,timestamp=NOW())\nNIF B-3: split 70/20/10 automatico",X_B,Y)
b_sell2,Ybs2 = ext("Stripe/Conekta: charge(monto)\nENVIAR QR por Email/WhatsApp\nPOST /api/v1/tickets/send",X_B,Ybs2+5)
b_sell_ok,Ybs2 = doc("201 {boleto_id,qr_url,folio_fiscal,split_artista,split_plataforma}",X_B,Ybs2+5,ok=True)
b_aforo_err,Ybs2 = doc("409 AFORO AGOTADO\n-> Oferta de lista de espera\nBTN: Waitlist taquilla",X_B,Ybs2+5,ok=False)
ed(c_sell_v,c_sell_b,color=CC["border"]); ed(c_sell_b,d_aforo,color=CC["border"])
ed(d_aforo,b_sell1,"SI / hay lugar",color=CSK["border"]); ed(d_aforo,b_aforo_err,"NO / agotado",color=CER["border"])
ed(b_sell1,b_sell2,color=CB["border"]); ed(b_sell2,b_sell_ok,color=CSK["border"])
Y=max(Ycs2,Ybs2)+10

# Control de puerta (QR scan)
t_gate_v,Ytg = proc("[GateControl.jsx]\nControl de Entrada (Venue Manager)\nEscanear QR del asistente",X_T,Y,pal=CT)
t_gate_b,Ytg = inp("[BTN] ESCANEAR QR\nPOST /api/v1/tickets/validate\nBody:{qr_token}",X_T,Ytg+5,pal=CT)
d_qr_valid,Ydqv = dec("QR\nvalido?",X_T,Ytg+5,pal=CT)
b_gate1,Ybg = db("SELECT b.id,b.status,b.evento_id,b.tipo,u.nombre\nFROM boletos b JOIN usuarios u ON b.comprador_id=u.id\nWHERE b.qr_token=? AND b.status='ACTIVO'\n  AND b.evento_id=:evento_actual",X_B,Ybs2)
b_gate_ok,Ybg = doc("200 {acceso:PERMITIDO,nombre_asistente,tipo_boleto}\nBD:UPDATE boletos SET status='USADO',used_at=NOW()",X_B,Ybg+5,ok=True)
b_gate_err,Ybg = doc("404 QR no encontrado\n409 boleto ya utilizado\n403 boleto de otro evento",X_B,Ybg+5,ok=False)
ed(d_rbac_v,t_gate_v,"SI / autorizado",color=CT["border"]); ed(t_gate_v,t_gate_b,color=CT["border"])
ed(t_gate_b,d_qr_valid,color=CT["border"]); ed(d_qr_valid,b_gate1,"POST",color=CT["border"])
ed(d_qr_valid,b_gate_ok,"SI",color=CSK["border"]); ed(d_qr_valid,b_gate_err,"NO",color=CER["border"])
ed(b_gate1,b_gate_ok,color=CSK["border"])
Y=max(Ytg,Ybg)+25

# =========================================================
# SECCION 7: DISPUTAS & SOPORTE
# =========================================================
sec_hdr("[ SEC 7 ] QUEJAS, DISPUTAS Y SOPORTE",X_C,Y,W,CC)
sec_hdr("[ SEC 7 ] DISPUTES API + FREEZE",X_B,Y,W,CB)
sec_hdr("[ SEC 7 ] DEFENSA DEL CASO",X_T,Y,W,CT)
sec_hdr("[ SEC 7 ] RESOLUCION ADMIN",X_A,Y,W,CA)
Y+=42

c_disp_v,Ycd2 = proc("[DisputeForm.jsx]\nReportar Problema con el Servicio\nmotivo | descripcion | evidencias (fotos,video)",X_C,Y,pal=CC)
c_disp_b,Ycd2 = inp("[BTN] ENVIAR REPORTE\nPOST /api/v1/disputes/create",X_C,Ycd2+5,pal=CC)
b_disp1,Ybdis = db("BEGIN TRANSACTION\nINSERT INTO disputes(booking_id,estado='ABIERTA',reportado_por=contratante_id)\nUPDATE escrow_movements SET status='CONGELADO'\nINSERT INTO notificaciones(tipo='DISPUTA',user_id=admin_id)\nCOMMIT",X_B,Y)
b_disp_ok,Ybdis = doc("201 {dispute_id,escrow_status:FROZEN}\nPUSH al Admin y al Contratado",X_B,Ybdis+5,ok=True)
t_def_v,Ytdef = proc("[DisputeResponse.jsx]\nResponder Disputa\nargumentos | evidencias | plazo 72h",X_T,Y,pal=CT)
t_def_b,Ytdef = inp("[BTN] ENVIAR RESPUESTA\nPOST /api/v1/disputes/{id}/respond",X_T,Ytdef+5,pal=CT)
a_res_v,Yadr = proc("[DisputesPanel.jsx]\nPanel Admin: Disputas Abiertas\nver evidencias | historial | timeline",X_A,Y,pal=CA)
a_res_b,Yadr = inp("[BTN] RESOLVER DISPUTA\nPUT /api/v1/admin/disputes/{id}/resolve\nBody:{fallo:'CONTRATANTE'|'CONTRATADO',nota}",X_A,Yadr+5,pal=CA)
b_res1,Ybres = db("UPDATE disputes SET estado='RESUELTA',fallo=?,resuelto_at=NOW()\nIF fallo=CONTRATANTE:\n  UPDATE escrow: liberar->contratado\nIF fallo=CONTRATADO:\n  UPDATE escrow: reembolsar->contratante",X_B,Ybdis+5)
b_res_ok,Ybres = doc("200 {dispute_id,fondos_liberados_a,monto}\nPUSH a ambas partes con resultado",X_B,Ybres+5,ok=True)
ed(c_disp_v,c_disp_b,color=CC["border"]); ed(c_disp_b,b_disp1,"POST",color=CC["border"])
ed(b_disp1,b_disp_ok,color=CSK["border"]); ed(b_disp_ok,t_def_v,"PUSH notif",color=CT["border"],async_=True)
ed(t_def_v,t_def_b,color=CT["border"]); ed(t_def_b,b_disp1,"POST respond",color=CT["border"])
ed(b_disp_ok,a_res_v,"PUSH admin",color=CA["border"],async_=True); ed(a_dash,a_res_v,color=CA["border"])
ed(a_res_v,a_res_b,color=CA["border"]); ed(a_res_b,b_res1,"PUT",color=CA["border"]); ed(b_res1,b_res_ok,color=CSK["border"])
Y=max(Ycd2,Ytdef,Yadr,Ybres)+25

# =========================================================
# SECCION 8: NOTIFICACIONES MULTICANAL
# =========================================================
sec_hdr("[ SEC 8 ] NOTIFICACIONES MULTICANAL",X_B,Y,W,CB)
Y+=42
b_push,Ybpush = ext("PUSH FCM / Firebase Cloud Messaging\nPOST /api/v1/notificaciones/push\nBody:{user_id,titulo,mensaje,data,priority}\nBD:INSERT INTO notificaciones(tipo='PUSH',status='ENVIADO')\n(PENDIENTE: FCM service account en Go)",X_B,Y,pending=True)
b_email,Ybem = ext("EMAIL SendGrid/SMTP\nPOST /api/v1/notificaciones/email\nBody:{to,template_id,variables{}}\nTemplates: bienvenida,booking_ok,pago_liberado,disputa\n(PENDIENTE: SendGrid API key)",X_B,Ybpush+5)
b_whapp,Ybwp = ext("WHATSAPP BUSINESS Meta/Twilio\nPOST /api/v1/notificaciones/whatsapp\nBody:{to,template,vars{}}\n(PENDIENTE: aprobacion Meta)\n(PENDIENTE: implementar en Go)",X_B,Ybem+5)
b_sms,Ybsms = ext("SMS Twilio (fallback)\nPOST /api/v1/notificaciones/sms\nBody:{to,mensaje}\n(PENDIENTE: Twilio credentials)",X_B,Ybwp+5,pending=True)
d_canal,Ydcan = dec("Canal de\nnotif?",X_B,Y-30,pal=CB)
ed(d_canal,b_push,"PUSH",color=CB["border"]); ed(d_canal,b_email,"EMAIL",color=CB["border"])
ed(d_canal,b_whapp,"WHATSAPP",color=CB["border"]); ed(d_canal,b_sms,"SMS",color=CB["border"])
Y=max(Ybpush,Ybem,Ybwp,Ybsms)+25

# =========================================================
# SECCION 9: ADMIN PANEL COMPLETO
# =========================================================
sec_hdr("[ SEC 9 ] ADMIN PANEL FONDO THOTH AC - MODO DIOS",X_A,Y,W,CA)
sec_hdr("[ SEC 9 ] ADMIN API + ANALYTICS",X_B,Y,W,CB)
Y+=42

# RBAC Admin
d_rbac_a,Ydra,err_rbac_a = rbac_check(X_A,Y,"SUPER_ADMIN",CA)
ed(a_dash,d_rbac_a,color=CA["border"])
Y=Ydra+10

admin_panels=[
    ("Auditoria Escrow Total",
     "[EscrowAuditPanel.jsx]\nTodos los escrow activos/historicos\nFiltros: status,fecha,monto,usuario\nExportar CSV",
     "GET /api/v1/admin/escrow/all\nBD:SELECT e.*,b.*,u_c.nombre,u_t.nombre\nFROM escrow_movements e\nJOIN bookings b ON e.booking_id=b.id\nJOIN usuarios u_c ON b.contratante_id=u_c.id\nJOIN usuarios u_t ON b.contratado_id=u_t.id\nORDER BY e.created_at DESC\nLIMIT 100 OFFSET :page*100",False),
    ("Gestion de Usuarios (RBAC)",
     "[UserManagementPanel.jsx]\n[BTN] Suspender -> PUT /api/v1/admin/users/{id}/suspend\n[BTN] Verificar Identidad -> PUT .../verify\n[BTN] Elevar Rol -> PUT .../role\n[BTN] Borrar (RGPD) -> DELETE .../users/{id}",
     "PUT /api/v1/admin/users/{id}/suspend\nBD:UPDATE usuarios SET status='SUSPENDIDO',motivo=?\nDELETE /api/v1/admin/users/{id}\nBD:UPDATE usuarios SET status='ELIMINADO'\nANONIMIZAR: nombre,email,telefono\nCONSERVAR: registros fiscales 5 anos (SAT)",False),
    ("Taquilla Master Global",
     "[TaquillaMasterPanel.jsx]\nCortes de caja TODOS los venues\nFiltros: fecha,venue,evento\n[BTN] Cerrar Corte Manual",
     "GET /api/v1/admin/taquilla/global\nBD:SELECT v.nombre,SUM(tc.monto) as total,\n  SUM(tc.monto)*0.70 as artista,\n  SUM(tc.monto)*0.20 as plataforma,\n  SUM(tc.monto)*0.10 as reserva\nFROM taquilla_corte tc\nJOIN venues v ON tc.venue_id=v.id\nGROUP BY v.id,DATE(tc.timestamp)",False),
    ("Quantum Engine - Gestionar Divisiones",
     "[QuantumEngineAdmin.jsx]\n[BTN] Editar Regla Division\n[BTN] Aprobar Ascenso Manual\n[BTN] Recalcular Todos los Perfiles",
     "PUT /api/v1/admin/divisions/rules/{id}\nBD:UPDATE division_rules SET horas_min=?,horas_max=?,beneficios=?\nTRIGGER: recalcular todos los perfiles\n->200{perfiles_recalculados:N}\n(Actualizacion masiva async)",False),
    ("Fondo Thoth - Incubadora Patito Feo",
     "[IncubadoraPanel.jsx]\n[BTN] Revisar Postulacion\n[BTN] Aprobar Coinversion -> POST .../aprobar\n[BTN] Rechazar -> POST .../rechazar\n[BTN] Programar Entrevista",
     "POST /api/v1/admin/incubadora/{id}/aprobar\nBD:UPDATE postulaciones SET status='APROBADA'\nBD:INSERT INTO inversiones(empresa_id,monto_semilla,%equity)\nGENERAR: contrato de coinversion PDF\n(PENDIENTE: modulo completo Fondo Thoth)",True),
    ("Reportes SAT + CFDI 4.0",
     "[SATReportsPanel.jsx]\n[BTN] Generar Reporte SAT\n[BTN] Exportar CFDI XML\n[BTN] Timbrar via PAC\nFiltros: periodo,tipo_cfdi",
     "GET /api/v1/admin/reports/sat\nBD:SELECT * FROM transacciones WHERE fecha BETWEEN ?\nGENERAR XML CFDI 4.0 (schema SAT)\nTIMBRAR: POST a PAC certificado (Finkok/SAT)\n(PENDIENTE: PAC certificado + credenciales CSD)",True),
    ("Analytics & KPIs en Tiempo Real",
     "[AnalyticsPanel.jsx]\nUsuarios activos | Bookings/mes\nVolumen escrow | Tasa conversion\nDisputas abiertas | Revenue MRR\n[BTN] Heatmap Geografico",
     "GET /api/v1/admin/analytics/kpis\nBD: multiples SELECTs con COUNT,SUM,AVG\n->{\n  usuarios_activos_30d,\n  bookings_mes_actual,\n  volumen_escrow_total,\n  tasa_conversion_busqueda,\n  nps_promedio,revenue_mrr\n}\n(PENDIENTE: caching Redis 5min)",True),
    ("Monitor Sistema & Logs",
     "[SystemMonitor.jsx]\nCPU | Memoria | Conexiones BD\nErrores ultimas 24h | Uptime\n[BTN] Ver Logs de Error\n[BTN] Limpiar Cache Redis",
     "GET /api/v1/admin/system/health\nGO:runtime.ReadMemStats()\nBD:pg_stat_database,pg_stat_activity\n->{\n  cpu_uso_pct,memoria_mb,\n  conexiones_bd,errores_24h,uptime\n}\n(PENDIENTE: alertas Prometheus/Grafana)",True),
    ("Gestion de Oficios (86+)",
     "[OfficiosAdmin.jsx]\n[BTN] Agregar Oficio -> POST /api/v1/admin/oficios\n[BTN] Editar -> PUT .../oficios/{id}\n[BTN] Asignar Cluster -> PUT .../cluster\n[BTN] Desactivar -> DELETE .../oficios/{id}",
     "POST /api/v1/admin/oficios\nBD:INSERT INTO oficios(nombre,cluster_id,descripcion,activo=true)\n->201{oficio_id}\nREINDEX: busqueda de perfiles\n(PENDIENTE: webhook de actualizacion de busqueda)",True),
]

prev_a=a_dash
for ptit,pui,papi,is_p in admin_panels:
    a_node,Ya2 = proc(pui,X_A,Y,pal=CA)
    b_node,Yb2 = db(papi,X_B,Y,pending=is_p)
    d_rbac_panel,Ydrp,err_p = rbac_check(X_A,Y-20,"SUPER_ADMIN",CA)
    ed(prev_a,a_node,color=CA["border"]); ed(a_node,b_node,"API",color=CA["border"])
    prev_a=a_node; Y=max(Ya2,Yb2)+15

# =========================================================
# SECCION 10: CONFIG & LOGOUT
# =========================================================
sec_hdr("[ SEC 10 ] CONFIGURACION, PRIVACIDAD Y LOGOUT",X_C,Y,W,CC)
sec_hdr("[ SEC 10 ] CONFIG API",X_B,Y,W,CB)
sec_hdr("[ SEC 10 ] PERFIL Y PREFERENCIAS",X_T,Y,W,CT)
Y+=42

c_cfg_v,Ycc2 = proc("[SettingsPage.jsx]\nConfiguracion del Contratante\nIdioma | Moneda | Modo visual\nMetodos de pago | Privacidad RGPD",X_C,Y,pal=CC)
c_cfg_b,Ycc2 = inp("[BTN] GUARDAR CONFIGURACION\nPUT /api/v1/users/{id}/config",X_C,Ycc2+5,pal=CC)
t_cfg_v,Ytcfg = proc("[SettingsPage.jsx]\nConfiguracion del Contratado\nDisponibilidad | Notificaciones | Precio base\nCertificaciones | Vacaciones",X_T,Y,pal=CT)
t_cfg_b,Ytcfg = inp("[BTN] GUARDAR PREFERENCIAS\nPUT /api/v1/users/{id}/config",X_T,Ytcfg+5,pal=CT)
b_cfg1,Ybcfg = db("UPDATE usuarios SET configuracion=jsonb_set(configuracion,'{key}',?)\nWHERE id=?\n->200{actualizado:true}",X_B,Y)
ed(c_cfg_v,c_cfg_b,color=CC["border"]); ed(t_cfg_v,t_cfg_b,color=CT["border"])
ed(c_cfg_b,b_cfg1,"PUT",color=CC["border"]); ed(t_cfg_b,b_cfg1,"PUT",color=CT["border"])
Y=max(Ycc2,Ytcfg,Ybcfg)+15

c_out,Yco2 = term("CERRAR SESION\n[BTN] Logout\nDELETE /api/v1/auth/session",X_C,Y,W,pal=CC)
t_out,Yto2 = term("CERRAR SESION\n[BTN] Logout\nDELETE /api/v1/auth/session",X_T,Y,W,pal=CT)
b_out,Ybo2 = db("DELETE FROM sesiones WHERE token=jwt_actual\n->200{logout:true}\nCliente: borrar JWT de localStorage y cookies",X_B,Y)
ed(c_out,b_out,"DELETE",color=CC["border"]); ed(t_out,b_out,"DELETE",color=CT["border"])
Y=max(Yco2,Yto2,Ybo2)+15

c_del_v,Ycdel = proc("[DeleteAccountModal.jsx]\nBorrar Cuenta Permanentemente\nAdvertencia RGPD | Periodo cooldown 30 dias",X_C,Y,pal=CC)
c_del_b,Ycdel = inp("[BTN] CONFIRMAR BORRADO\nDELETE /api/v1/users/{id}\n(PENDIENTE: anonimizacion RGPD)",X_C,Ycdel+5,pal=CC,pending=True)
b_del,Ybdel = db("UPDATE usuarios SET status='ELIMINADO',nombre='Usuario Eliminado',\n  email=CONCAT('del_',id,'@eliminado.local')\nCONSERVAR: transacciones fiscales 5 anos\nPENDIENTE: proceso RGPD completo",X_B,Y,pending=True)
ed(c_del_v,c_del_b,color=CC["border"]); ed(c_del_b,b_del,"DELETE RGPD",color=CC["border"])
Y=max(Ycdel,Ybdel)+25

# =========================================================
# SECCION 11: FEED CREAR (RED SOCIAL)
# =========================================================
sec_hdr("[ SEC 11 ] FEED CREAR - RED SOCIAL DEL ECOSISTEMA",X_C,Y,W,CC)
sec_hdr("[ SEC 11 ] FEED API",X_B,Y,W,CB)
sec_hdr("[ SEC 11 ] PUBLICACIONES TALENTO",X_T,Y,W,CT)
Y+=42

t_feed_v,Ytfv = proc("[FeedCrearPage.jsx]\nFeed del Ecosistema\nPublicaciones de artistas | Reel de trabajos\nNoticias de la industria",X_T,Y,pal=CT)
t_feed_post,Ytfp = inp("[BTN] CREAR PUBLICACION\nPOST /api/v1/feed/post\nBody:{texto,imagenes[],video_url,tipo_contenido}\n(PENDIENTE)",X_T,Ytfv+5,pal=CT,pending=True)
b_feed1,Ybf = db("INSERT INTO publicaciones(user_id,tipo,contenido,media_urls[],status='PUBLICADO')\nINDEXAR en busqueda de feed\n->201{publicacion_id}",X_B,Y,pending=True)
c_feed_v,Ycfv = proc("[FeedPage.jsx]\nVer Feed del Ecosistema\n'Para ti' | 'Siguiendo' | 'Tendencias'\nFiltrar por oficio,ciudad,division",X_C,Y,pal=CC)
c_feed_b,Ycfb = inp("[BTN] CARGAR FEED\nGET /api/v1/feed?tipo=para_ti&pagina=1\n(PENDIENTE: algoritmo de recomendacion)",X_C,Ycfv+5,pal=CC,pending=True)
b_feed2,Ybf = db("SELECT p.*,u.nombre,u.avatar,\n  COUNT(l.id) as likes,\n  COUNT(c.id) as comentarios\nFROM publicaciones p\nJOIN usuarios u ON p.user_id=u.id\nLEFT JOIN likes l ON l.publicacion_id=p.id\nLEFT JOIN comentarios c ON c.publicacion_id=p.id\nWHERE p.status='PUBLICADO'\nORDER BY p.created_at DESC\nLIMIT 20",X_B,Ybf+5,pending=True)
c_like_b,Yclb = inp("[BTN] DAR ME GUSTA\nPOST /api/v1/feed/{id}/like\n[BTN] COMENTAR\nPOST /api/v1/feed/{id}/comment\n[BTN] COMPARTIR\nPOST /api/v1/feed/{id}/share",X_C,Ycfb+5,pal=CC,pending=True)
b_interact,Ybi = db("INSERT INTO likes(user_id,publicacion_id)\nINSERT INTO comentarios(user_id,publicacion_id,texto)\n->PUSH al autor: 'Le gusto tu post'",X_B,Ybf+5,pending=True)
ed(t_feed_v,t_feed_post,color=CT["border"]); ed(t_feed_post,b_feed1,"POST",color=CT["border"])
ed(c_feed_v,c_feed_b,color=CC["border"]); ed(c_feed_b,b_feed2,"GET",color=CC["border"])
ed(c_feed_b,c_like_b,color=CC["border"]); ed(c_like_b,b_interact,"POST",color=CC["border"])
Y=max(Ytfp,Ycfb,Ybi)+25

# =========================================================
# SECCION 12: INCUBADORA PATITO FEO (Fondo Thoth AC)
# =========================================================
sec_hdr("[ SEC 12 ] INCUBADORA PATITO FEO - FONDO THOTH AC",X_T,Y,W,CT)
sec_hdr("[ SEC 12 ] INCUBADORA API + EVALUACION",X_B,Y,W,CB)
sec_hdr("[ SEC 12 ] ADMIN FONDO THOTH",X_A,Y,W,CA)
Y+=42

t_inc_v,Ytiv = proc("[IncubadoraApplyPage.jsx]\nPostular a Incubadora Patito Feo\nDocumento de proyecto | CV | Pitch deck\nEvaluacion cuantica del perfil fundador",X_T,Y,pal=CT)
t_inc_b,Ytib = inp("[BTN] ENVIAR POSTULACION\nPOST /api/v1/incubadora/postular\nBody:{proyecto,cv_url,pitch_url,modelo_negocio}\n(PENDIENTE)",X_T,Ytiv+5,pal=CT,pending=True)
b_inc1,Ybinc = db("INSERT INTO postulaciones(user_id,proyecto,estado='ENVIADA',\n  evaluacion_cuantica=NULL)\nEVALUACION: modelo atomico 3 areas (Fondo Thoth)\n  ->score Finanzas,Operativo,Admin\n(PENDIENTE: motor de evaluacion cuantica)",X_B,Y,pending=True)
a_inc_v,Yaiv = proc("[AdminIncubadoraPanel.jsx]\nEvaluar Postulaciones\nScore cuantico | Fortalezas/debilidades\nRecomendaciones de delegacion",X_A,Y,pal=CA)
a_inc_b,Yaib = inp("[BTN] APROBAR COINVERSION\nPOST /api/v1/admin/incubadora/{id}/aprobar\nBody:{monto_semilla,equity_pct,condiciones}\n(PENDIENTE)",X_A,Yaiv+5,pal=CA,pending=True)
b_inc2,Ybinc = db("UPDATE postulaciones SET estado='APROBADA',monto_semilla=?,equity_pct=?\nINSERT INTO inversiones(empresa_id,monto,equity,fecha_firma)\nGENERAR PDF contrato de coinversion\n(PENDIENTE: integracion firma digital)",X_B,Ybinc+5,pending=True)

# Evaluacion cuantica Fondo Thoth
d_cuant,Ydc = dec("Perfil\ncuantico\napto?",X_A,Yaib+5,pal=CA)
t_no_cuant,_ = proc("[DiagnosticoCuantico.jsx]\nDiagnostico: Perfil no apto\nRecomendaciones especificas:\n- Delegacion de area debil\n- Perfil profesional recomendado\n- Rango salarial sugerido",X_T,Yaib+5,pal=CT)
ed(t_inc_v,t_inc_b,color=CT["border"]); ed(t_inc_b,b_inc1,"POST",color=CT["border"])
ed(b_inc1,a_inc_v,"revision admin",color=CA["border"],async_=True)
ed(a_inc_v,a_inc_b,color=CA["border"]); ed(a_inc_b,d_cuant,color=CA["border"])
ed(d_cuant,b_inc2,"SI / apto",color=CSK["border"]); ed(d_cuant,t_no_cuant,"NO / no apto",color=CER["border"])
Y=max(Ytib,Ydc)+25

# =========================================================
# SECCION 13: CABINAS DE DOBLAJE (FLUJO DEDICADO)
# =========================================================
sec_hdr("[ SEC 13 ] CABINAS DE DOBLAJE - FLUJO DEDICADO",X_C,Y,W,CC)
sec_hdr("[ SEC 13 ] CABINAS API + STREAMING",X_B,Y,W,CB)
sec_hdr("[ SEC 13 ] WORKFLOW ACTOR DE DOBLAJE",X_T,Y,W,CT)
Y+=42

# Contratante inicia sesion de doblaje
c_dob_v,Ycdv = proc("[DubbingSessionPage.jsx]\nSession de Doblaje Remoto\nSolicitar cabina disponible\nFecha | Duracion | Tipo de proyecto",X_C,Y,pal=CC)
c_dob_b,Ycdv = inp("[BTN] RESERVAR CABINA\nPOST /api/v1/cabinas/reservar\nBody:{actor_id,fecha,horas,proyecto_tipo}\n(PENDIENTE)",X_C,Ycdv+5,pal=CC,pending=True)
d_cab,Ydcab = dec("Cabina\ndisponible?",X_C,Ycdv+5,pal=CC)

# Actor de doblaje: preparacion
t_dob_v,Ytdv = proc("[DubbingActorPanel.jsx]\nPanel del Actor de Doblaje\nVer sesiones agendadas\nDescargar guion ADR previo",X_T,Y,pal=CT)
t_guion,Ytg2 = inp("[BTN] DESCARGAR GUION ADR\nGET /api/v1/cabinas/sesion/{id}/guion\nBody: {sesion_id}\n(PENDIENTE)",X_T,Ytdv+5,pal=CT,pending=True)
b_dob1,Ybdob = db("SELECT s.guion_url,s.notes_directora,\n  s.lineas_por_actor\nFROM sesiones_doblaje s\nWHERE s.id=? AND s.actor_id=user_id\n(PENDIENTE: tabla sesiones_doblaje)",X_B,Y,pending=True)

# Session live
t_live,Ytlv = proc("[CabinaLiveSession.jsx]\nSesion de Grabacion en Vivo\nStream de video bidireccional (WebRTC)\nControl de takes | Marcador de errores",X_T,Ytg2+5,pal=CT)
t_live_b,Ytlb = inp("[BTN] INICIAR SESION LIVE\nPOST /api/v1/cabinas/sesion/{id}/start\nWebSocket: ws://api/v1/cabinas/ws/{sesion_id}\n(PENDIENTE: WebRTC + WebSocket)",X_T,Ytlv+5,pal=CT,pending=True)
b_dob2,Ybdob = ext("WebRTC Signaling Server\nICE candidates | STUN/TURN\nBidireccional: actor <-> director\n(PENDIENTE: media server)",X_B,Ybdob+5,pending=True)

# ADR Toma -> Validar -> Entregar
d_take,Ydtake = dec("Toma\naprobada\npor director?",X_T,Ytlb+5,pal=CT)
t_take_ok,_ = proc("[ADRConfirmModal.jsx]\nToma APROBADA\nMarcar como completada\nPOST /api/v1/cabinas/toma/{id}/aprobar",X_T,Ydtake+5,pal=CT,pending=True)
t_take_err,_ = proc("[ADRRetryModal.jsx]\nToma RECHAZADA\nNota del director | Reintento\nRegistrar feedback de toma",X_T,Ydtake+5,pal={"fill":CER["fill"],"border":CER["border"],"font":CER["font"],"fill2":CER["fill"]},pending=True)

# Entrega final
t_entrega,Yte = proc("[DubbingDeliveryPage.jsx]\nEntrega de Sesion Completada\nArchivos WAV master\nBTN: DESCARGAR ENTREGABLE\nGET /api/v1/cabinas/sesion/{id}/entrega",X_T,Ydtake+5,pal=CT,pending=True)
b_entrega,Ybe = db("UPDATE sesiones_doblaje SET status='COMPLETADA'\nGENERAR: paquete WAV 24bit/48kHz\nINSERT INTO entregas(sesion_id,archivos_url[],timestamp)\n->200{descarga_url,sha256_checksum}\n(PENDIENTE: storage S3/GCS)",X_B,Ybdob+5,pending=True)

ed(c_dob_v,c_dob_b,color=CC["border"]); ed(c_dob_b,d_cab,color=CC["border"])
ed(d_cab,t_dob_v,"SI / disponible",color=CT["border"])
ed(t_dob_v,t_guion,color=CT["border"]); ed(t_guion,b_dob1,"GET",color=CT["border"]); ed(b_dob1,b_dob2,color=CB["border"])
ed(t_live,t_live_b,color=CT["border"]); ed(t_guion,t_live,color=CT["border"]); ed(t_live_b,d_take,color=CT["border"])
ed(d_take,t_take_ok,"SI / OK",color=CSK["border"]); ed(d_take,t_take_err,"NO / error",color=CER["border"])
ed(t_take_err,t_live,"reintentar",color="#ffaa00"); ed(t_take_ok,t_entrega,color=CT["border"])
ed(t_entrega,b_entrega,"GET entrega",color=CT["border"])

Yfinal = max(Ytlb,Ybe)+25

# =========================================================
# ENSAMBLAR GRAPHML
# =========================================================
HDR="""<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
  xmlns:java="http://www.yworks.com/xml/yfiles-common/1.0/java"
  xmlns:sys="http://www.yworks.com/xml/yfiles-common/markup/primitives/2.0"
  xmlns:x="http://www.yworks.com/xml/yfiles-common/markup/2.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:y="http://www.yworks.com/xml/graphml"
  xmlns:yed="http://www.yworks.com/xml/yed/3"
  xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd">
  <!--Created by BackstageRED Generator v4 (Fondo Thoth AC)-->
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
  <data key="d0" xml:space="preserve">BackstageRED MASTER v4 | 4 Carriles | 86 Perfiles | 13 Secciones | 3 Nodos/Boton | 7 Tipos Decision | Backlog marcado</data>
"""
FTR="  </graph>\n</graphml>\n"

with open(OUTPUT,"w",encoding="utf-8") as f:
    f.write(HDR)
    for n in NX: f.write(n+"\n")
    for e in EX: f.write(e+"\n")
    f.write(FTR)

sz=os.path.getsize(OUTPUT)/1024
print(f"DIAGRAMA v4 GENERADO!")
print(f"Archivo: {OUTPUT}")
print(f"Nodos: {nc[0]} | Aristas: {ec[0]} | Tamano: {sz:.1f} KB")
print(f"Canvas: 1900 x {Yfinal:.0f} px")
