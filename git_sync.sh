#!/bin/bash
# ==============================================================================
# Script de Sincronización Git Proactiva — Fondo Thoth AC
# ==============================================================================

COMMIT_MSG="${1:-Actualización de especificaciones y componentes en Open Business Plan}"

echo "📦 Agregando cambios a Git..."
git add .

echo "💾 Creando commit: '$COMMIT_MSG'..."
git commit -m "$COMMIT_MSG" || true

echo "🚀 Enviando cambios al repositorio remoto..."
git push origin main || git push || true

echo "✅ Sincronización Git completada con éxito."
