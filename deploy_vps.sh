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
echo "   Mensaje: $MSG"

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
# 3. Subir el backend server y librerías compartidas (src/)
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "📤 Actualizando server/ y src/ en VPS ..."
rsync -avz --delete \
  --exclude 'data/' \
  -e "ssh -i '$SSH_KEY' -o StrictHostKeyChecking=no" \
  server/ \
  "$VPS:$VPS_APP_DIR/server/"
rsync -avz --delete \
  -e "ssh -i '$SSH_KEY' -o StrictHostKeyChecking=no" \
  src/ \
  "$VPS:$VPS_APP_DIR/src/"
echo "   ✓ Backend y librerías src/ sincronizados"

# ──────────────────────────────────────────────────────────────────────────────
# 4. Sincronizar directorio canónico vcv/ y proyectos
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "📤 Sincronizando dossier VCV y proyectos canónicos hacia VPS ..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$VPS" "mkdir -p '$VPS_APP_DIR/vcv' '$VPS_APP_DIR/proyectos/negocios'"
rsync -avz \
  -e "ssh -i '$SSH_KEY' -o StrictHostKeyChecking=no" \
  vcv/ \
  "$VPS:$VPS_APP_DIR/vcv/"
rsync -avz \
  -e "ssh -i '$SSH_KEY' -o StrictHostKeyChecking=no" \
  proyectos/negocios/ \
  "$VPS:$VPS_APP_DIR/proyectos/negocios/"
echo "   ✓ Dossier VCV y proyectos sincronizados"

# ──────────────────────────────────────────────────────────────────────────────
# 5. Subir package.json (para npm ci en el VPS)
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "📤 Actualizando manifiestos en VPS ..."
rsync -avz \
  -e "ssh -i '$SSH_KEY' -o StrictHostKeyChecking=no" \
  package.json package-lock.json \
  "$VPS:$VPS_APP_DIR/"
echo "   ✓ package.json sincronizado"

# ──────────────────────────────────────────────────────────────────────────────
# 6. Validar y recargar Nginx en el VPS
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "⚙️  Validando y recargando Nginx ..."

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$VPS" 'bash -s' << 'SSHEOF'
set -e
sudo ln -sf /etc/nginx/sites-available/fondothoth-landing /etc/nginx/sites-enabled/fondothoth-landing
sudo nginx -t && sudo systemctl reload nginx
echo "✓ Nginx validado y recargado exitosamente"
SSHEOF

echo "   ✓ Nginx listo"

# ──────────────────────────────────────────────────────────────────────────────
# 7. Configuración de entorno, usuarios y reinicio PM2 en el VPS
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "⚙️  Configurando variables persistentes, dependencias y reiniciando PM2 ..."

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$VPS" 'bash -s' << 'SSHEOF'
set -e
cd /var/www/open-business-plan

# Asegurar variables de entorno requeridas en .env
if ! grep -q "NODE_ENV=" .env 2>/dev/null; then
  echo "NODE_ENV=production" >> .env
  echo "✓ NODE_ENV=production añadido a .env"
fi

if ! grep -q "JWT_SECRET=" .env 2>/dev/null; then
  SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
  echo "JWT_SECRET=$SECRET" >> .env
  echo "✓ JWT_SECRET generado y persistido en .env"
fi

if ! grep -q "API_KEYS_ENCRYPTION_KEY=" .env 2>/dev/null; then
  ENC_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  echo "API_KEYS_ENCRYPTION_KEY=$ENC_KEY" >> .env
  echo "✓ API_KEYS_ENCRYPTION_KEY generada y persistida en .env"
fi

# Asegurar existencia de audit_log.json
mkdir -p server/data
if [ ! -f server/data/audit_log.json ]; then
  echo "[]" > server/data/audit_log.json
  chmod 664 server/data/audit_log.json
  echo "✓ server/data/audit_log.json inicializado"
fi

# Asegurar existencia del usuario 'admin' manteniendo a 'roberto'
node -e "
const fs = require('fs');
const p = 'server/data/users.json';
if (fs.existsSync(p)) {
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const hasAdmin = data.users.some(u => u.username === 'admin');
  const roberto = data.users.find(u => u.username === 'roberto');
  if (!hasAdmin && roberto) {
    data.users.push({
      id: 'u_superadmin_admin',
      username: 'admin',
      email: 'admin@fondothoth.com',
      passwordHash: roberto.passwordHash,
      role: 'superadmin',
      displayName: 'Administrador Principal',
      status: 'active',
      apiKeys: {},
      createdAt: new Date().toISOString(),
      lastLogin: null
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    console.log('✓ Usuario admin creado con credencial compartida de superadmin');
  }
}
"

# Instalar dependencias de producción
npm ci --omit=dev --ignore-scripts 2>&1 | tail -5

# Reiniciar el proceso PM2
if pm2 describe obp-backend > /dev/null 2>&1; then
  pm2 restart obp-backend
  echo "✓ obp-backend reiniciado exitosamente"
else
  pm2 start server/index.js --name obp-backend
  echo "✓ obp-backend iniciado por primera vez"
fi

pm2 save
echo "✓ Estado PM2 persistido"
SSHEOF

echo "   ✓ Backend y servicios listos en VPS"

# ──────────────────────────────────────────────────────────────────────────────
# 8. Verificación HTTP y Healthcheck
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "🔍 Verificando estado en producción..."
sleep 8

HTTP_OBP=$(curl -o /dev/null -s -w "%{http_code}" "https://fondothoth.com/obp/" 2>/dev/null || echo "???")
HTTP_SEM=$(curl -o /dev/null -s -w "%{http_code}" "https://fondothoth.com/obp/semilla" 2>/dev/null || echo "???")
HTTP_API=$(curl -o /dev/null -s -w "%{http_code}" "https://fondothoth.com/obp/api/health" 2>/dev/null || echo "???")
HTTP_MAIN=$(curl -o /dev/null -s -w "%{http_code}" "https://fondothoth.com/" 2>/dev/null || echo "???")

echo "   https://fondothoth.com/             → HTTP $HTTP_MAIN (debe ser 200)"
echo "   https://fondothoth.com/obp/         → HTTP $HTTP_OBP (debe ser 200)"
echo "   https://fondothoth.com/obp/semilla  → HTTP $HTTP_SEM (debe ser 200)"
echo "   https://fondothoth.com/obp/api/     → HTTP $HTTP_API (debe ser 200)"

echo ""
echo "✅ ¡Despliegue al VPS completado con éxito!"
echo "   🌐 App principal:    https://fondothoth.com/obp/"
echo "   🌱 Semilla:          https://fondothoth.com/obp/semilla"
echo "   ⚙️  Configuración:    https://fondothoth.com/obp/configuracion"
echo "   📊 Lean Canvas:      https://fondothoth.com/obp/lean-canvas"
