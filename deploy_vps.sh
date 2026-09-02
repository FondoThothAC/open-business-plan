#!/bin/bash
set -e

# ==============================================================================
# Script de Despliegue Automatizado — Open Business Plan
# VPS: ubuntu@129.146.213.8  →  https://fondothoth.com/obp/
# Clave SSH: ../claves_ssh/id_rsa_ampere
# NO toca el sitio principal de Fondo Thoth
# ==============================================================================

SSH_KEY="$(dirname "$0")/../claves_ssh/id_rsa_ampere"
VPS_USER="ubuntu"
VPS_HOST="129.146.213.8"
VPS="$VPS_USER@$VPS_HOST"
VPS_APP_DIR="/var/www/open-business-plan"
MSG="${1:-Actualización automática de Open Business Plan}"

# Asegurar permisos correctos en la clave SSH
chmod 600 "$SSH_KEY" 2>/dev/null || true

echo "🚀 Iniciando despliegue de Open Business Plan en fondothoth.com/obp..."
echo "   VPS: $VPS_HOST | Clave: $SSH_KEY"
echo "   Commit: $MSG"

# ──────────────────────────────────────────────────────────────────────────────
# 1. Compilar el frontend con la base path correcta
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "🏗️  Compilando bundle de producción con base=/obp/ ..."
VITE_BASE_PATH=/obp/ npm run build
echo "   ✓ Build completado en dist/"

# ──────────────────────────────────────────────────────────────────────────────
# 2. Subir dist/ al VPS via rsync
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "📤 Sincronizando dist/ → VPS ($VPS_APP_DIR/dist/) ..."
rsync -avz --delete \
  -e "ssh -i '$SSH_KEY' -o StrictHostKeyChecking=no" \
  dist/ \
  "$VPS:$VPS_APP_DIR/dist/"
echo "   ✓ Frontend sincronizado"

# ──────────────────────────────────────────────────────────────────────────────
# 3. Subir el backend server
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "📤 Actualizando server/ en VPS ..."
rsync -avz --delete \
  -e "ssh -i '$SSH_KEY' -o StrictHostKeyChecking=no" \
  server/ \
  "$VPS:$VPS_APP_DIR/server/"
echo "   ✓ Backend sincronizado"

# ──────────────────────────────────────────────────────────────────────────────
# 4. Subir package.json (para npm ci en el VPS)
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "📤 Actualizando manifiestos en VPS ..."
rsync -avz \
  -e "ssh -i '$SSH_KEY' -o StrictHostKeyChecking=no" \
  package.json package-lock.json \
  "$VPS:$VPS_APP_DIR/"
echo "   ✓ package.json sincronizado"

# ──────────────────────────────────────────────────────────────────────────────
# 5. Validar y recargar Nginx en el VPS
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "⚙️  Validando y recargando Nginx ..."

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$VPS" 'bash -s' << 'SSHEOF'
set -e
sudo nginx -t && sudo systemctl reload nginx
echo "✓ Nginx validado y recargado exitosamente"
SSHEOF

echo "   ✓ Nginx listo"

# ──────────────────────────────────────────────────────────────────────────────
# 6. Instalar dependencias del backend en el VPS y reiniciar PM2
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "⚙️  Instalando dependencias y reiniciando PM2 ..."

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$VPS" 'bash -s' << 'SSHEOF'
set -e
cd /var/www/open-business-plan

# Instalar solo dependencias de producción (sin devDependencies)
npm ci --omit=dev --ignore-scripts 2>&1 | tail -5

# Reiniciar o iniciar el proceso PM2
if pm2 describe obp-backend > /dev/null 2>&1; then
  pm2 restart obp-backend
  echo "✓ obp-backend reiniciado"
else
  pm2 start server/index.js --name obp-backend
  echo "✓ obp-backend iniciado"
fi

pm2 save
echo "✓ PM2 estado guardado"
SSHEOF

echo "   ✓ Backend reiniciado"

# ──────────────────────────────────────────────────────────────────────────────
# 7. Verificación HTTP
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "🔍 Verificando despliegue en producción ..."
sleep 4

HTTP_OBP=$(curl -o /dev/null -s -w "%{http_code}" "https://fondothoth.com/obp/" 2>/dev/null || echo "???")
HTTP_SEM=$(curl -o /dev/null -s -w "%{http_code}" "https://fondothoth.com/obp/semilla" 2>/dev/null || echo "???")
HTTP_API=$(curl -o /dev/null -s -w "%{http_code}" "https://fondothoth.com/obp/api/health" 2>/dev/null || echo "???")
HTTP_MAIN=$(curl -o /dev/null -s -w "%{http_code}" "https://fondothoth.com/" 2>/dev/null || echo "???")

echo "   https://fondothoth.com/             → HTTP $HTTP_MAIN (debe ser 200)"
echo "   https://fondothoth.com/obp/         → HTTP $HTTP_OBP (debe ser 200)"
echo "   https://fondothoth.com/obp/semilla  → HTTP $HTTP_SEM (debe ser 200)"
echo "   https://fondothoth.com/obp/api/     → HTTP $HTTP_API"

echo ""
echo "✅ ¡Despliegue completado exitosamente!"
echo "   🌐 App principal:    https://fondothoth.com/obp/"
echo "   🌱 Semilla:          https://fondothoth.com/obp/semilla"
echo "   ⚙️  Configuración:    https://fondothoth.com/obp/configuracion"
echo "   📊 Lean Canvas:      https://fondothoth.com/obp/lean-canvas"

