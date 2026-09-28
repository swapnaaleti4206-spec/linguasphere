@echo off
title Supernova English AI Platform Launcher
color 0b

echo ======================================================================
echo           SUPERNOVA AI - PRIVATE ENGLISH LEARNING PLATFORM
echo ======================================================================
echo.
echo Initializing backend server and database...
cd /d "%~dp0backend"
start "Supernova English AI - Backend" cmd /k "python run_backend.py"

echo Waiting for backend to initialize on http://127.0.0.1:8000...
timeout /t 3 /nobreak >nul

echo Starting browser...
start http://127.0.0.1:8000

echo.
echo ======================================================================
echo Platform is running!
echo URL: http://127.0.0.1:8000
echo.
echo Authorized Demo Accounts:
echo 1) Admin:   learner1@example.com  (Passcode: english2026)
echo 2) Learner: learner2@example.com  (Passcode: english2026)
echo ======================================================================
echo.
pause
