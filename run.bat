@echo off
REM Batch script to launch OpenWindowsBusinessPlan from packaged binary if available, otherwise fall back to dev mode.

REM Get the directory of this batch file
set "SCRIPT_DIR=%~dp0"
rem Remove trailing backslash
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

set "APP_DIR=%SCRIPT_DIR%\dist_electron"

REM Check if we are on Windows (this batch file only runs on Windows, but just in case)
if not exist "%APP_DIR%\win-unpacked\OpenBusinessPlan.exe" (
    echo Packaged executable not found. Falling back to development mode.
    cd /d "%SCRIPT_DIR%"
    npm run start
    exit /b 0
)

echo Launching packaged application...
start "" "%APP_DIR%\win-unpacked\OpenBusinessPlan.exe"
exit /b 0
