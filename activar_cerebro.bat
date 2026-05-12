@echo off
TITLE Open Plan: Activador de Cerebro IA
COLOR 0D

echo ===================================================
echo   ACTIVANDO CEREBRO DE IA (OLLAMA)
echo ===================================================
echo.

:: 1. Verificar si Ollama está instalado
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Ollama no esta instalado en este sistema.
    echo Por favor, descargalo de: https://ollama.com
    pause
    exit /b
)

:: 2. Intentar iniciar el servicio (si no esta corriendo)
echo [*] Verificando servicio Ollama...
ollama list >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Ollama no esta respondiendo. Iniciando servidor...
    start "" ollama serve
    timeout /t 5
)

:: 3. Configurar entorno optimizado para RTX A2000 12GB
set OLLAMA_FLASH_ATTENTION=1
set OLLAMA_KV_CACHE_TYPE=q4_0
set OLLAMA_NUM_PARALLEL=1

:: 4. Verificar el modelo especializado
echo [*] Verificando modelo gemma4:pro (256k ctx / RTX A2000 + 128GB RAM)...
ollama list | findstr "gemma4:pro" >nul
if %errorlevel% neq 0 (
    echo [!] El modelo especializado no existe. Creandolo con 256k de contexto...
    echo FROM gemma4:e4b > Modelfile.tmp
    echo PARAMETER num_ctx 262144 >> Modelfile.tmp
    echo PARAMETER stop "<|file_separator|>" >> Modelfile.tmp
    ollama create gemma4:pro -f Modelfile.tmp
    del Modelfile.tmp
    echo [OK] Modelo gemma4:pro creado con 256k tokens de contexto.
) else (
    echo [OK] Modelo gemma4:pro ya existe.
)

echo.
echo ===================================================
echo   [OK] EL CEREBRO ESTA LISTO Y CARGADO.
echo   Manten esta ventana abierta o minimizada.
echo ===================================================
timeout /t 5
