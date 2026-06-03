#!/bin/bash

# [SDD] Script de arranque industrial para Linux/Mac
# [TDD] Verifica: Node.js, NPM, Ollama y node_modules

echo "=========================================================="
echo "   OPENPLAN v2.5.12 - SISTEMA DE INDUSTRIALIZACION"
echo "=========================================================="
echo ""

# Obtener ruta del script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# 1. VERIFICAR DEPENDENCIAS CORE
echo "[+] Verificando entorno..."

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no detectado. Instala Node.js (v18+)."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "[ERROR] NPM no detectado."
    exit 1
fi

# 2. VERIFICAR NODE_MODULES
if [ ! -d "node_modules" ]; then
    echo "[!] Dependencias no encontradas. Instalando..."
    npm install
fi

# 3. VERIFICAR OLLAMA
if ! command -v ollama &> /dev/null; then
    echo "[ADVERTENCIA] Ollama no detectado. La IA Local no funcionará."
fi

# 4. CONFIGURACION DE PRIMERA VEZ (Auto-start opcional)
if [ ! -f ".installed" ]; then
    echo ""
    echo "=========================================================="
    echo "   CONFIGURACION DE PRIMERA VEZ"
    echo "=========================================================="
    read -p "¿Deseas habilitar el arranque automático al iniciar sesión? (s/n): " choice
    if [[ "$choice" == "s" || "$choice" == "S" ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # Mac Auto-start (LaunchAgent)
            PLIST_PATH="$HOME/Library/LaunchAgents/com.openplan.start.plist"
            cat <<EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.openplan.start</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/open</string>
        <string>-a</string>
        <string>Terminal</string>
        <string>$DIR/start_open_plan.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
EOF
            launchctl load "$PLIST_PATH"
            echo "[OK] OpenPlan configurado para arrancar en el inicio de sesión de Mac."
        else
            # Linux Auto-start (.desktop)
            mkdir -p ~/.config/autostart
            cat <<EOF > ~/.config/autostart/openplan.desktop
[Desktop Entry]
Type=Application
Exec=gnome-terminal -- bash -c "$DIR/start_open_plan.sh"
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=OpenPlan
Comment=Startup OpenPlan Business Engine
EOF
            echo "[OK] OpenPlan configurado para arrancar en el inicio de sesión de Linux."
        fi
    fi
    touch .installed
fi

# 5. INICIAR SISTEMA
echo ""
echo "[+] Levantando Infraestructura..."

# [1/3] Activar Cerebro IA (Ollama) en background
echo "[1/3] Activando Cerebro IA..."
bash "$DIR/activar_cerebro.sh" &
sleep 3

# [2/3] Iniciar Backend en segundo plano
echo "[2/3] Iniciando Servidor de Datos (Puerto 3001)..."
npm run server &

# [3/3] Iniciar Frontend
echo "[3/3] Iniciando Interface Industrial (Vite)..."
echo ""
echo "=========================================================="
echo "   SISTEMA ACTIVO. ACCEDE EN: http://localhost:5173"
echo "=========================================================="
echo ""

npm run dev
