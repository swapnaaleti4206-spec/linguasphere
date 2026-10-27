@echo off
title LinguaSphere AI - Fast Local Launcher
color 0b

echo ======================================================================
echo             LINGUASPHERE AI - 1-CLICK LOCAL LAUNCHER
echo ======================================================================
echo.
echo [1/3] Starting LinguaSphere Backend (FastAPI / Port 8000)...
cd /d "%~dp0backend"
start "LinguaSphere Backend (Port 8000)" cmd /k "python run_backend.py"

echo [2/3] Starting LinguaSphere Frontend (React + Vite / Port 5173)...
cd /d "%~dp0frontend"
start "LinguaSphere Frontend (Port 5173)" cmd /k "npm.cmd run dev"

echo [3/3] Opening browser at http://localhost:5173 ...
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173

echo.
echo ======================================================================
echo   LINGUASPHERE LOCAL DEV ENVIRONMENT IS READY!
echo ======================================================================
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://127.0.0.1:8000
echo   - API Docs: http://127.0.0.1:8000/docs
echo ======================================================================
echo.
echo Press any key to exit this launcher window (servers will stay running).
pause >nul
