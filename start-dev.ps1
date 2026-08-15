# Run from repo root so `backend` imports work. Double-click or: powershell -File start-dev.ps1
Set-Location $PSScriptRoot
Write-Host "Starting backend and frontend (separate windows)." -ForegroundColor Cyan

Write-Host "Launching backend at http://127.0.0.1:8010..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "-m","uvicorn","backend.main:app","--reload","--host","127.0.0.1","--port","8010"

Write-Host "Launching frontend (Vite) from ./frontend..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "run","dev","--prefix","frontend"

Write-Host "Started backend and frontend. Close the spawned windows to stop them." -ForegroundColor Cyan
