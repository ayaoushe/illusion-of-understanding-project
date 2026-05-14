# Run from repo root so `backend` imports work. Double-click or: powershell -File start-api.ps1
Set-Location $PSScriptRoot
Write-Host "Starting API at http://127.0.0.1:8010 (Ctrl+C to stop)" -ForegroundColor Cyan
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8010
