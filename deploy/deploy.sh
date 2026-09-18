#!/bin/bash
# ─────────────────────────────────────────────────────────
#  deploy.sh — Script de despliegue para OBP en VPS
#  Ejecutar desde la raíz del proyecto en el VPS:
#    cd /opt/obp && bash deploy/deploy.sh
#
#  Pre-requisitos:
#    - Node.js 20+ instalado
#    - PM2 instalado globalmente (npm i -g pm2)
#    - Nginx configurado (ver deploy/nginx-obp.conf)
#    - .env.local con las API keys configuradas
# ─────────────────────────────────────────────────────────

set -euo pipefail

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║     🚀  OBP Deploy — VPS Oracle Cloud           ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json. Ejecuta desde la raíz del proyecto.${NC}"
    exit 1
fi

# Verificar .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  No se encontró .env.local. Copiando desde plantilla...${NC}"
    cp .env.production.example .env.local
    echo -e "${YELLOW}   → Edita .env.local con tus API keys antes de iniciar:${NC}"
    echo -e "${YELLOW}     nano .env.local${NC}"
    exit 1
fi

# Paso 1: Obtener últimos cambios de Git
echo -e "${CYAN}📥 Paso 1: Actualizando código desde GitHub...${NC}"
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "⚠️ No se pudo hacer git pull (¿rama diferente?)"

# Paso 2: Instalar dependencias
echo -e "${CYAN}📦 Paso 2: Instalando dependencias...${NC}"
npm ci --omit=dev

# Paso 3: Build de producción
echo -e "${CYAN}🔨 Paso 3: Compilando frontend de producción...${NC}"
npm run build

# Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: El directorio dist/ no se creó. Revisa los errores de build.${NC}"
    exit 1
fi

echo -e "${GREEN}   ✅ Build completado: $(du -sh dist | cut -f1)${NC}"

# Paso 4: Crear directorio de logs si no existe
mkdir -p logs

# Paso 5: Reiniciar PM2
echo -e "${CYAN}🔄 Paso 4: Reiniciando backend con PM2...${NC}"
if pm2 describe obp-backend > /dev/null 2>&1; then
    pm2 restart ecosystem.config.cjs
    echo -e "${GREEN}   ✅ Proceso reiniciado${NC}"
else
    pm2 start ecosystem.config.cjs
    pm2 save
    echo -e "${GREEN}   ✅ Proceso iniciado por primera vez${NC}"
fi

# Paso 6: Verificar que el backend responde
echo -e "${CYAN}🏥 Paso 5: Verificando salud del backend...${NC}"
sleep 2
HEALTH=$(curl -s http://127.0.0.1:3001/api/health 2>/dev/null || echo "ERROR")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}   ✅ Backend respondiendo correctamente${NC}"
else
    echo -e "${RED}   ❌ El backend no responde. Revisa logs: pm2 logs obp-backend${NC}"
fi

# Paso 7: Recargar Nginx
echo -e "${CYAN}🌐 Paso 6: Recargando Nginx...${NC}"
if sudo nginx -t 2>/dev/null; then
    sudo systemctl reload nginx
    echo -e "${GREEN}   ✅ Nginx recargado${NC}"
else
    echo -e "${RED}   ❌ Error en configuración de Nginx. Ejecuta: sudo nginx -t${NC}"
fi

# Resumen
echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║     ✅  Despliegue completado                    ║"
echo "║                                                  ║"
echo "║     🌐 https://fondothoth.com/obp               ║"
echo "║     📊 API: https://fondothoth.com/obp/api/health║"
echo "║     📋 Logs: pm2 logs obp-backend                ║"
echo "║     🔄 Status: pm2 status                        ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"
