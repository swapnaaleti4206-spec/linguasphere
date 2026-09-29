@echo off
title LinguaSphere AI Platform Launcher
color 0b

echo ======================================================================
echo           LINGUASPHERE AI - PRIVATE LEARNING STUDIO
echo ======================================================================
echo.
echo Initializing backend server and database...
cd /d "%~dp0backend"
start "LinguaSphere AI - Backend" cmd /k "python run_backend.py"

echo Waiting for backend to initialize on http://127.0.0.1:8000...
timeout /t 3 /nobreak >nul

echo Starting browser...
start http://127.0.0.1:8000

echo.
echo ======================================================================
echo Platform is running!
echo URL: http://127.0.0.1:8000
echo Docs: http://127.0.0.1:8000/docs
echo ======================================================================
echo.
pause
