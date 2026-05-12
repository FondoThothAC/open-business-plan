@echo off
TITLE Open Plan V2: Centro de Control
COLOR 0B

echo ===================================================
echo   INICIANDO OPEN PLAN BUSINESS V2 (NATIVO)
echo ===================================================
echo.

cd /d "%~dp0"

:: 1. Activar el Cerebro (Ollama)
call activar_cerebro.bat

:: 2. Iniciar Servidor Backend (Puerto 3001)
echo [1/2] Iniciando Backend (Node.js)...
start /b cmd /c "npm run server"
timeout /t 3

:: 3. Iniciar Servidor Frontend (Vite)
echo [2/2] Iniciando Frontend (Vite)...
start cmd /c "npm run dev"

echo.
echo ===================================================
echo   TODO LISTO. LA APP SE ABRIRA EN EL NAVEGADOR.
echo   (Si no abre, ve a http://localhost:5173)
echo ===================================================
timeout /t 10
exit
