#!/bin/bash
# ==========================================================
#   OPENPLAN v2.5.12 — Activador de Cerebro IA (Mac/Linux)
#   Equivalente a activar_cerebro.bat para Windows
# ==========================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=================================================="
echo "   ACTIVANDO CEREBRO DE IA (OLLAMA)"
echo "   Mac / Apple Silicon Edition"
echo "=================================================="
echo ""

# 1. Verificar si Ollama está instalado
if ! command -v ollama &> /dev/null; then
    echo "[ERROR] Ollama no está instalado en este sistema."
    echo "        Descárgalo en: https://ollama.com"
    exit 1
fi
echo "[OK] Ollama detectado: $(ollama --version)"

# 2. Verificar si el servidor Ollama está corriendo (intenta 'ollama list')
echo "[*] Verificando servicio Ollama..."
if ! ollama list &> /dev/null; then
    echo "[!] Ollama no está respondiendo. Iniciando servidor..."
    ollama serve &
    sleep 5
    echo "[OK] Servidor Ollama iniciado."
else
    echo "[OK] Servidor Ollama ya está activo."
fi

# 3. Configuración optimizada para Apple Silicon (Metal unifica RAM/VRAM)
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KV_CACHE_TYPE=q4_0
export OLLAMA_NUM_PARALLEL=1

echo ""
echo "[*] Modelos disponibles localmente:"
ollama list

# 4. Verificar modelo principal (gemma4:e2b-mlx)
echo ""
echo "[*] Verificando modelo principal: gemma4:e2b-mlx..."
if ollama list | grep -q "gemma4:e2b-mlx"; then
    echo "[OK] Modelo gemma4:e2b-mlx encontrado y listo."
else
    echo "[!] El modelo gemma4:e2b-mlx no existe. Descargando..."
    ollama pull gemma4:e2b-mlx
    echo "[OK] Modelo descargado."
fi

# 5. Verificar modelo de respaldo (qwen3.5:2b-mlx)
echo "[*] Verificando modelo secundario: qwen3.5:2b-mlx..."
if ollama list | grep -q "qwen3.5:2b-mlx"; then
    echo "[OK] Modelo qwen3.5:2b-mlx encontrado y listo."
else
    echo "[ADVERTENCIA] qwen3.5:2b-mlx no encontrado. Los niveles Pro/Profundo usarán gemma4:e2b-mlx."
fi

echo ""
echo "=================================================="
echo "   [OK] EL CEREBRO ESTÁ LISTO."
echo "   Ollama activo en: http://localhost:11434"
echo "   Mantén esta terminal abierta o minimizada."
echo "=================================================="
echo ""
