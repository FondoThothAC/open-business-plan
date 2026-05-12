@echo off
SETLOCAL EnableDelayedExpansion
TITLE OpenPlan v2.5.12 - Industrial Control Center
COLOR 0A

:: [SDD] Script de arranque industrial con verificación de dependencias y auto-start
:: [TDD] Verifica: Node.js, NPM, Ollama y node_modules

echo ==========================================================
echo    OPENPLAN v2.5.12 - SISTEMA DE INDUSTRIALIZACION
echo ==========================================================
echo.

cd /d "%~dp0"

:: 1. VERIFICAR DEPENDENCIAS CORE
echo [+] Verificando entorno...

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no detectado. Instala Node.js desde https://nodejs.org/
    pause
    exit
)

npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] NPM no detectado.
    pause
    exit
)

:: 2. VERIFICAR NODE_MODULES (Instalación automática)
if not exist "node_modules\" (
    echo [!] Dependencias no encontradas. Instalando...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Fallo la instalacion de dependencias. Revisa tu conexion.
        pause
        exit
      )
)

:: 3. VERIFICAR OLLAMA
echo [+] Verificando IA Local (Ollama)...
ollama -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Ollama no detectado en el PATH. La IA Local podria no funcionar.
    echo Descarga Ollama en https://ollama.com/
)

:: 4. LOGICA DE AUTO-ARRANQUE (Solo primera vez)
if not exist ".installed" (
    echo.
    echo ==========================================================
    echo    CONFIGURACION DE PRIMERA VEZ
    echo ==========================================================
    set /p choice="¿Deseas habilitar el arranque automatico con Windows? (s/n): "
    if /i "!choice!"=="s" (
        echo [+] Creando acceso directo en la carpeta de Inicio...
        set SCRIPT_PATH=%~f0
        set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
        powershell "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%STARTUP_FOLDER%\OpenPlan.lnk');$s.TargetPath='%SCRIPT_PATH%';$s.WorkingDirectory='%~dp0';$s.Save()"
        echo [OK] OpenPlan se iniciara al encender tu PC.
    )
    echo. > .installed
)

:: 5. INICIAR SISTEMA
echo.
echo [+] Levantando Infraestructura...

:: Iniciar Ollama y Modelos
echo [1/3] Preparando Cerebro...
start /b call activar_cerebro.bat

:: Iniciar Backend
echo [2/3] Iniciando Servidor de Datos (Puerto 3001)...
start /b cmd /c "npm run server"

:: Iniciar Frontend
echo [3/3] Iniciando Interface Industrial (Vite)...
echo.
echo ==========================================================
echo    SISTEMA ACTIVO. ACCEDE EN: http://localhost:5173
echo ==========================================================
echo.

npm run dev

pause
