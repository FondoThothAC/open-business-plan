@echo off
SETLOCAL EnableDelayedExpansion
TITLE OpenBusinessPlan - Asistente de Instalacion en Windows
COLOR 0B

echo ==========================================================
echo    OPENBUSINESSPLAN - ASISTENTE DE INSTALACION EN WINDOWS
echo ==========================================================
echo.
echo [1/5] Verificando Entorno Node.js...

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Node.js no esta instalado en este sistema.
    echo [*] Intentando instalacion automatica mediante Winget...
    winget --version >nul 2>&1
    if !errorlevel! equ 0 (
        echo [*] Ejecutando: winget install OpenJS.NodeJS.LTS
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
        if !errorlevel! equ 0 (
            echo [OK] Node.js instalado exitosamente. Reinicia la consola si es necesario.
        ) else (
            echo [ADVERTENCIA] Fallo la instalacion automatica de Node.js.
            start https://nodejs.org/
            pause
            exit /b 1
        )
    ) else (
        echo [!] Winget no disponible. Abriendo pagina oficial de Node.js...
        start https://nodejs.org/
        echo Descarga e instala Node.js LTS y vuelve a ejecutar este archivo.
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
    echo [OK] Node.js detectado: !NODE_VER!
)

echo.
echo [2/5] Instalando / Verificando Dependencias NPM...
cd /d "%~dp0"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion de paquetes npm. Revisa tu conexion a Internet.
    pause
    exit /b 1
)
echo [OK] Dependencias NPM instaladas.

echo.
echo [3/5] Configurando Motor de Web Scraping (Puppeteer Chromium)...
call npx puppeteer install
echo [OK] Naves de scraping Chromium verificadas.

echo.
echo [4/5] Verificando Motor de Inteligencia Artificial (Ollama)...
ollama -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Ollama no esta instalado en este sistema.
    echo [*] Intentando instalacion automatica de Ollama mediante Winget...
    winget --version >nul 2>&1
    if !errorlevel! equ 0 (
        echo [*] Ejecutando: winget install Ollama.Ollama
        winget install Ollama.Ollama --accept-package-agreements --accept-source-agreements
        if !errorlevel! equ 0 (
            echo [OK] Ollama instalado exitosamente.
        ) else (
            echo [ADVERTENCIA] No se pudo instalar Ollama mediante Winget.
            start https://ollama.com/download/OllamaSetup.exe
        )
    ) else (
        echo [!] Abriendo descarga oficial de Ollama...
        start https://ollama.com/download/OllamaSetup.exe
    )
) else (
    for /f "tokens=*" %%o in ('ollama -v') do set OLLAMA_VER=%%o
    echo [OK] Ollama detectado: !OLLAMA_VER!
)

echo.
echo [5/5] Creando Accesos Directos en el Sistema...
set SCRIPT_PATH=%~dp0start_open_plan.bat
set DESKTOP_FOLDER=%USERPROFILE%\Desktop

powershell -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%DESKTOP_FOLDER%\OpenBusinessPlan.lnk');$s.TargetPath='%SCRIPT_PATH%';$s.WorkingDirectory='%~dp0';$s.IconLocation='cmd.exe';$s.Save()" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Acceso directo creado en el Escritorio.
)

echo. > .installed

echo.
echo ==========================================================
echo    INSTALACION Y CONFIGURACION COMPLETADA EXITOSAMENTE!
echo ==========================================================
echo Puedes iniciar el sistema en cualquier momento usando el
echo acceso directo en tu Escritorio o ejecutando start_open_plan.bat
echo.
pause
