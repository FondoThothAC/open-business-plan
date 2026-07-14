#!/bin/bash
# ============================================================
#  OpenBusinessPlan v3.0 — Lanzador Inteligente Mac/Linux
#  [SDD] Script de arranque con auto-instalación de dependencias
#  [TDD] Verifica: Node.js, NPM, node_modules, Ollama
#  [UXDD] Colores ANSI, progreso visual, apertura automática de browser
# ============================================================

# ── Colores ANSI ─────────────────────────────────────────────
RESET='\033[0m'
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'

# ── Detección de OS ──────────────────────────────────────────
OS_TYPE="linux"
if [[ "$OSTYPE" == "darwin"* ]]; then
  OS_TYPE="mac"
fi

# ── Ruta base del proyecto ───────────────────────────────────
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# ── Banner ───────────────────────────────────────────────────
clear
echo ""
echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${BLUE}║${RESET}  ${BOLD}${CYAN}📊  OpenBusinessPlan  v3.0${RESET}                          ${BOLD}${BLUE}║${RESET}"
echo -e "${BOLD}${BLUE}║${RESET}  ${MAGENTA}Sistema de Planeación Empresarial con IA${RESET}            ${BOLD}${BLUE}║${RESET}"
echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""

# ── Función: instalar Node.js automáticamente ────────────────
install_node() {
  echo -e "${YELLOW}[!] Node.js no encontrado. Instalando automáticamente...${RESET}"
  echo ""

  if [[ "$OS_TYPE" == "mac" ]]; then
    # Intentar con Homebrew primero
    if command -v brew &>/dev/null; then
      echo -e "${CYAN}[+] Usando Homebrew para instalar Node.js...${RESET}"
      brew install node
    elif command -v curl &>/dev/null; then
      # Instalar NVM y luego Node.js
      echo -e "${CYAN}[+] Instalando NVM y Node.js LTS...${RESET}"
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
      export NVM_DIR="$HOME/.nvm"
      # shellcheck source=/dev/null
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
      nvm install --lts
      nvm use --lts
    else
      echo -e "${RED}[ERROR] No se pudo instalar Node.js automáticamente.${RESET}"
      echo -e "  Descarga manualmente: ${BOLD}https://nodejs.org/es/download/${RESET}"
      open "https://nodejs.org/es/download/" 2>/dev/null || true
      exit 1
    fi

  else
    # Linux: usar apt, dnf o nvm
    if command -v apt &>/dev/null; then
      echo -e "${CYAN}[+] Instalando Node.js via apt (Ubuntu/Debian)...${RESET}"
      curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
      sudo apt-get install -y nodejs
    elif command -v dnf &>/dev/null; then
      echo -e "${CYAN}[+] Instalando Node.js via dnf (Fedora/RHEL)...${RESET}"
      sudo dnf install -y nodejs
    elif command -v pacman &>/dev/null; then
      echo -e "${CYAN}[+] Instalando Node.js via pacman (Arch)...${RESET}"
      sudo pacman -S --noconfirm nodejs npm
    elif command -v curl &>/dev/null; then
      echo -e "${CYAN}[+] Instalando NVM y Node.js LTS...${RESET}"
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
      nvm install --lts
      nvm use --lts
    else
      echo -e "${RED}[ERROR] No se pudo instalar Node.js automáticamente.${RESET}"
      echo -e "  Descarga manualmente: ${BOLD}https://nodejs.org/es/download/${RESET}"
      exit 1
    fi
  fi

  # Recargar PATH
  export PATH="$PATH:/usr/local/bin:/usr/bin"
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
}

# ── Función: abrir browser ───────────────────────────────────
open_browser() {
  local url="$1"
  sleep 2
  if [[ "$OS_TYPE" == "mac" ]]; then
    open "$url"
  elif command -v xdg-open &>/dev/null; then
    xdg-open "$url"
  elif command -v sensible-browser &>/dev/null; then
    sensible-browser "$url"
  fi
}

# ─────────────────────────────────────────────────────────────
#  PASO 1: Verificar Node.js
# ─────────────────────────────────────────────────────────────
echo -e "${BOLD}[1/4] Verificando entorno...${RESET}"

# Cargar NVM si existe (instalaciones previas)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if ! command -v node &>/dev/null; then
  install_node
fi

if ! command -v node &>/dev/null; then
  echo -e "${RED}[ERROR] Node.js sigue sin encontrarse. Instálalo manualmente: https://nodejs.org${RESET}"
  exit 1
fi

NODE_VER=$(node -v)
NPM_VER=$(npm -v)
echo -e "${GREEN}    ✔ Node.js ${NODE_VER} — NPM ${NPM_VER}${RESET}"

# ─────────────────────────────────────────────────────────────
#  PASO 2: Instalar dependencias si faltan
# ─────────────────────────────────────────────────────────────
echo -e "${BOLD}[2/4] Verificando dependencias del proyecto...${RESET}"

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}    [!] Instalando paquetes (primera vez, puede tardar ~3 min)...${RESET}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Falló la instalación de dependencias. Revisa tu conexión a internet.${RESET}"
    exit 1
  fi
fi
echo -e "${GREEN}    ✔ Dependencias listas${RESET}"

# ─────────────────────────────────────────────────────────────
#  PASO 3: Verificar Ollama (IA Local) — opcional
# ─────────────────────────────────────────────────────────────
echo -e "${BOLD}[3/4] Verificando IA Local (Ollama)...${RESET}"

if command -v ollama &>/dev/null; then
  echo -e "${GREEN}    ✔ Ollama detectado${RESET}"
  # Iniciar Ollama en background si no está corriendo
  if ! pgrep -x "ollama" > /dev/null 2>&1; then
    bash "$DIR/activar_cerebro.sh" &
    sleep 2
  fi
else
  echo -e "${YELLOW}    ⚠ Ollama no detectado — La IA Local no estará disponible.${RESET}"
  echo -e "    Descárgalo en: ${CYAN}https://ollama.com/${RESET}"
fi

# ─────────────────────────────────────────────────────────────
#  PASO 4: Configuración primera vez (auto-inicio)
# ─────────────────────────────────────────────────────────────
if [ ! -f ".installed" ]; then
  echo ""
  echo -e "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${BOLD}  🎉 ¡Primera vez! Configuración inicial${RESET}"
  echo -e "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo ""
  read -p "  ¿Habilitar arranque automático al iniciar sesión? (s/n): " choice
  if [[ "$choice" == "s" || "$choice" == "S" ]]; then
    if [[ "$OS_TYPE" == "mac" ]]; then
      PLIST_PATH="$HOME/Library/LaunchAgents/com.openplan.start.plist"
      cat <<PLIST_EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.openplan.start</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/open</string>
    <string>-a</string>
    <string>Terminal</string>
    <string>${DIR}/start_open_plan.sh</string>
  </array>
  <key>RunAtLoad</key><true/>
</dict>
</plist>
PLIST_EOF
      launchctl load "$PLIST_PATH" 2>/dev/null
      echo -e "${GREEN}  ✔ OpenPlan arrancará automáticamente en Mac.${RESET}"
    else
      mkdir -p ~/.config/autostart
      cat <<DESK_EOF > ~/.config/autostart/openplan.desktop
[Desktop Entry]
Type=Application
Exec=bash "${DIR}/start_open_plan.sh"
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=OpenPlan
Comment=Startup OpenPlan Business Engine
DESK_EOF
      echo -e "${GREEN}  ✔ OpenPlan arrancará automáticamente en Linux.${RESET}"
    fi
  fi
  touch .installed
fi

# ─────────────────────────────────────────────────────────────
#  INICIO DEL SISTEMA
# ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[4/4] Levantando sistema...${RESET}"
echo ""

APP_URL="http://localhost:5173"

# Iniciar backend en segundo plano
echo -e "${CYAN}  → Servidor de datos (Puerto 3001)...${RESET}"
npm run server &
SERVER_PID=$!
sleep 2

# Abrir browser automáticamente en segundo plano
open_browser "$APP_URL" &

# Iniciar frontend (Vite, bloquea el terminal)
echo -e "${CYAN}  → Interfaz web (Puerto 5173)...${RESET}"
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}║  ✅  SISTEMA ACTIVO                                  ║${RESET}"
echo -e "${BOLD}${GREEN}║  🌐  Abre tu browser en: ${CYAN}${APP_URL}${GREEN}        ║${RESET}"
echo -e "${BOLD}${GREEN}║  ⛔  Presiona Ctrl+C para detener                   ║${RESET}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""

# Trampa para limpiar al salir con Ctrl+C
trap "echo ''; echo -e '${YELLOW}Cerrando OpenPlan...${RESET}'; kill $SERVER_PID 2>/dev/null; exit 0" INT TERM

npm run dev
