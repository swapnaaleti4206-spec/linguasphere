@echo off
title Supernova English AI - Dev Mode
color 0a

echo ======================================================================
echo       SUPERNOVA AI - DEVELOPMENT MODE (HOT RELOAD)
echo ======================================================================
echo.

cd /d "%~dp0backend"
start "Backend API (Port 8000)" cmd /k "python run_backend.py"

cd /d "%~dp0frontend"
start "Frontend Vite (Port 5173)" cmd /k "npm.cmd run dev"

timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Dev servers launched!
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000
echo.
pause
