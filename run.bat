@echo off
title NEXUS AI Platform Launcher
echo ===================================================
echo           Starting NEXUS AI Platform
echo ===================================================
echo.

echo [1/2] Launching FastAPI Backend on port 8000...
start "NEXUS AI Backend" cmd /k "call .\.venv\Scripts\activate.bat && python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Launching React Vite Frontend on port 5173...
start "NEXUS AI Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo.
echo ===================================================
echo NEXUS AI is running!
echo Frontend:  http://localhost:5173
echo API Docs:  http://localhost:8000/docs
echo ===================================================

