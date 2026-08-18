#!/bin/bash
set -e

# ==============================================================================
# Script de Despliegue Automatizado para Open Business Plan (fondothoth.com/obp)
# VPS: 129.146.213.8
# ==============================================================================

TARGET_DIR="/var/www/fondothoth/obp"
APP_DIR="/var/www/open-business-plan"

echo "🚀 Iniciando despliegue de Open Business Plan en fondothoth.com/obp..."

# 1. Asegurar dependencias
echo "📦 Instalando dependencias de Node..."
npm install --production=false

# 2. Ejecutar tests antes de compilar
echo "🧪 Ejecutando suite de pruebas TDD..."
npm test

# 3. Compilar el frontend con la base /obp/
echo "🏗️ Compilando bundle de producción (VITE_BASE_PATH=/obp/)..."
VITE_BASE_PATH=/obp/ npm run build

# 4. Copiar archivos al directorio servido por Nginx
echo "📂 Publicando archivos en $TARGET_DIR..."
sudo mkdir -p "$TARGET_DIR"
sudo cp -r dist/* "$TARGET_DIR/"
sudo chown -R www-data:www-data "$TARGET_DIR" 2>/dev/null || true

# 5. Iniciar o reiniciar el backend Express con PM2
echo "⚙️ Configurando servicio de backend con PM2..."
if command -v pm2 &> /dev/null; then
  pm2 describe obp-backend > /dev/null 2>&1 && pm2 reload obp-backend || pm2 start server/index.js --name "obp-backend"
  pm2 save
else
  echo "⚠️ PM2 no está instalado globalmente. Ejecutando npm run server en background..."
  nohup node server/index.js > server.log 2>&1 &
fi

# 6. Recargar Nginx si existe
if command -v nginx &> /dev/null; then
  echo "🔄 Verificando y recargando Nginx..."
  sudo nginx -t && sudo systemctl reload nginx
fi

echo "✅ ¡Despliegue completado con éxito en https://fondothoth.com/obp!"
