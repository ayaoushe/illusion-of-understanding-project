# start-dev.ps1
# Run from the repository root:
# powershell -File .\start-dev.ps1
$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "Starting development environment..." -ForegroundColor Cyan
Write-Host ""

# Install Python dependencies if needed
python -c "import uvicorn, fastapi" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    python -m pip install -r requirements.txt
}

# Install frontend dependencies if needed
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install --prefix frontend
}

Write-Host ""
Write-Host "Starting backend..." -ForegroundColor Green
$backend = Start-Process powershell -ArgumentList `
    "-NoExit", "-Command", `
    "Set-Location '$PSScriptRoot'; python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8010" `
    -PassThru

Write-Host "Starting frontend..." -ForegroundColor Green
$frontend = Start-Process powershell -ArgumentList `
    "-NoExit", "-Command", `
    "Set-Location '$PSScriptRoot\frontend'; npm run dev" `
    -PassThru

Write-Host ""
Write-Host "Backend:  http://127.0.0.1:8010" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Close this window to stop the services." -ForegroundColor Yellow
Write-Host ""

try {
    Wait-Process -Id $backend.Id, $frontend.Id
}
finally {
    Write-Host "Stopping services..." -ForegroundColor Yellow

    if (!$backend.HasExited) {
        Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    }

    if (!$frontend.HasExited) {
        Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
    }
}