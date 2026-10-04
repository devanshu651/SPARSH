@echo off
title SPARSH Launcher
echo ===================================================
echo             Starting SPARSH Platform
echo ===================================================
echo.

echo Starting FastAPI Backend on port 8000...
start "SPARSH Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

echo Starting Vite Frontend on port 5173...
start "SPARSH Frontend" cmd /k "cd /d "%~dp0" && npm.cmd run dev"

echo Waiting for services to initialize...
timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo All services launched!
