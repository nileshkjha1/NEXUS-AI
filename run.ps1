Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "          Starting NEXUS AI Platform               " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start Backend in new process
Write-Host "[1/2] Starting FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { .\.venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 }"

Start-Sleep -Seconds 2

# 2. Start Frontend in new process
Write-Host "[2/2] Starting React Vite Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { Set-Location frontend; npm run dev }"

Start-Sleep -Seconds 3

# 3. Launch Default Browser
Write-Host "Opening http://localhost:5173 in browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "NEXUS AI is running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Cyan

