#!/bin/bash
set -e

# ==============================================================================
# Script de Despliegue Automatizado para Open Business Plan
# VPS: ubuntu@129.146.213.8  →  https://fondothoth.com/obp/
# Clave SSH: ../claves_ssh/id_rsa_ampere
# ==============================================================================

SSH_KEY="$(dirname "$0")/../claves_ssh/id_rsa_ampere"
VPS_USER="ubuntu"
VPS_HOST="129.146.213.8"
VPS="$VPS_USER@$VPS_HOST"
VPS_APP_DIR="/var/www/open-business-plan"

echo "🚀 Iniciando despliegue de Open Business Plan en fondothoth.com/obp..."
echo "   VPS: $VPS_HOST | Clave: $SSH_KEY"

# 1. Compilar el frontend
echo ""
echo "🏗️  Compilando bundle de producción..."
VITE_BASE_PATH=/obp/ npm run build

# 2. Subir dist/ al VPS via rsync
echo ""
echo "📤 Sincronizando dist/ → VPS..."
rsync -avz --delete \
  -e "ssh -i '$SSH_KEY' -o StrictHostKeyChecking=no" \
  dist/ \
  "$VPS:$VPS_APP_DIR/dist/"

# 3. Aplicar configuración Nginx para SPA fallback
echo ""
echo "⚙️  Verificando configuración Nginx..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$VPS" \
  "sudo bash -c 'cat > /etc/nginx/conf.d/obp.conf <<EOF
location /obp/ {
    alias $VPS_APP_DIR/dist/;
    try_files \$uri \$uri/ /obp/index.html;
}
EOF
nginx -t && systemctl reload nginx'"

# 4. Subir el backend server
echo ""
echo "📤 Actualizando server/index.js en VPS..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
  server/index.js \
  "$VPS:$VPS_APP_DIR/server/index.js"

# 5. Reiniciar backend PM2
echo ""
echo "⚙️  Reiniciando servicio PM2 (obp-backend)..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$VPS" \
  "cd $VPS_APP_DIR && pm2 restart obp-backend 2>/dev/null || pm2 start server/index.js --name obp-backend && pm2 save"

echo ""
echo "✅ ¡Despliegue completado con éxito!"
echo "   🌐 https://fondothoth.com/obp/"
echo "   🔧 https://fondothoth.com/obp/configuracion"
