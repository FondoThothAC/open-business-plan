@echo off
SETLOCAL EnableDelayedExpansion
TITLE OpenBusinessPlan v2.6 - Centro de Control Industrial
COLOR 0A

:: [SDD] Script de arranque industrial con autocorrección de entorno y verificación de componentes
:: [TDD] Verifica: Node.js, NPM, Ollama, Chromium y node_modules

echo ==========================================================
echo    OPENBUSINESSPLAN v2.6 - SISTEMA INDUSTRIAL DE IA
echo ==========================================================
echo.

cd /d "%~dp0"

:: 1. VERIFICACION DE PRIMERA VEZ O FALTANTE DE DEPENDENCIAS
if not exist ".installed" (
    echo [!] Primera instalacion o configuracion incompleta detectada.
    echo [*] Ejecutando asistente de instalacion automatizado...
    call install_windows.bat
    if %errorlevel% neq 0 (
        echo [ERROR] La instalacion automatica no pudo completarse.
        pause
        exit /b 1
    )
)

:: 2. VERIFICAR DEPENDENCIAS CORE
echo [+] Verificando entorno de ejecucion...

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Node.js no detectado en el PATH.
    call install_windows.bat
)

if not exist "node_modules\" (
    echo [ADVERTENCIA] node_modules no encontrado. Instalando dependencias...
    call npm install
)

:: 3. PREPARAR CEREBRO DE IA (OLLAMA)
echo [+] Verificando Inteligencia Artificial Local (Ollama)...
start /b cmd /c "activar_cerebro.bat"

:: 4. INICIAR BACKEND NODE.JS
echo [+] Iniciando Servidor de Datos Backend (Puerto 3001)...
start /b cmd /c "npm run server"

:: 5. INICIAR FRONTEND INDUSTRIAL
echo [+] Levantando Interfaz Web (Vite)...
echo.
echo ==========================================================
echo    SISTEMA ACTIVO. ACCEDE EN: http://localhost:5173
echo ==========================================================
echo.

npm run dev

pause
