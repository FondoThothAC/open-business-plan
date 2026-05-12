@echo off
cd /d %~dp0
echo Starting OpenPlan V2 - Industrial Edition...
echo Directory: %cd%
echo Checking dependencies...

if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo.
echo Launching Vite Development Server...
npm run dev
pause
