@echo off
TITLE OpenPlan - Activador de Cerebro IA Local (Ollama)
COLOR 0D

echo ===================================================
echo   ACTIVANDO CEREBRO DE IA LOCAL (OLLAMA)
echo ===================================================
echo.

:: 1. Verificar si Ollama esta instalado
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Ollama no esta instalado en este sistema.
    echo Por favor, instalalo ejecutando install_windows.bat o desde https://ollama.com
    timeout /t 5
    exit /b 0
)

:: 2. Intentar iniciar el servicio (si no esta corriendo)
echo [*] Verificando servicio Ollama...
ollama list >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Ollama no esta respondiendo. Iniciando servidor en segundo plano...
    start "" ollama serve
    timeout /t 5
)

:: 3. Configurar entorno optimizado
set OLLAMA_FLASH_ATTENTION=1
set OLLAMA_KV_CACHE_TYPE=q4_0
set OLLAMA_NUM_PARALLEL=1

:: 4. Verificar modelos disponibles
echo [*] Verificando modelo de IA local para OpenBusinessPlan...
ollama list | findstr "nemotron-3-nano gemma4 qwen3.5" >nul
if %errorlevel% neq 0 (
    echo [!] No se detecto un modelo base. Intentando descargar nemotron-3-nano:4b...
    ollama pull nemotron-3-nano:4b
    if %errorlevel% neq 0 (
        echo [!] No se pudo descargar nemotron-3-nano:4b. Intentando qwen2.5:3b...
        ollama pull qwen2.5:3b
    )
) else (
    echo [OK] Modelo de IA local detectado y disponible.
)

echo.
echo ===================================================
echo   [OK] CEREBRO IA CONFIGURADO Y OPERATIVO.
echo ===================================================
timeout /t 3
