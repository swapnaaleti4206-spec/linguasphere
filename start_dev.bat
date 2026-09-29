@echo off
title LinguaSphere AI Platform - Dev Mode
color 0a

echo ======================================================================
echo       LINGUASPHERE AI - LOCAL DEVELOPMENT LAUNCHER
echo ======================================================================
echo.

cd /d "%~dp0backend"
start "LinguaSphere Backend (Port 8000)" cmd /k "python run_backend.py"

cd /d "%~dp0frontend"
start "LinguaSphere Frontend (Port 5173)" cmd /k "npm.cmd run dev"

timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ======================================================================
echo Local servers launched!
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000
echo Docs:     http://127.0.0.1:8000/docs
echo ======================================================================
echo.
pause
