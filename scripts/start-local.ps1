# =============================================================================
# DocuDex — Local Dev Startup Script (Windows PowerShell)
# Usage:  .\scripts\start-local.ps1
#         npm run start:local
# =============================================================================

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

Write-Host ""
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "  DocuDex — Local Dev Startup  " -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# ── 1. PostgreSQL ────────────────────────────────────────────────────────────
Write-Host "[1/4] Checking PostgreSQL..." -ForegroundColor Yellow

$pgService = Get-Service -Name "postgresql-x64-16" -ErrorAction SilentlyContinue
if ($null -eq $pgService) {
    foreach ($v in @("18","17","16","15","14")) {
        $pgService = Get-Service -Name "postgresql-x64-$v" -ErrorAction SilentlyContinue
        if ($pgService) { break }
    }
}

if ($null -eq $pgService) {
    Write-Host "  ERROR: No PostgreSQL Windows service found." -ForegroundColor Red
    Write-Host "  Install from https://www.postgresql.org/download/windows/ then re-run." -ForegroundColor Red
    exit 1
}

if ($pgService.Status -ne "Running") {
    Write-Host "  Starting $($pgService.Name)..." -ForegroundColor Gray
    Start-Service $pgService.Name
    Start-Sleep -Seconds 3
}
Write-Host "  PostgreSQL is running ($($pgService.Name))" -ForegroundColor Green

# ── 2. Redis ─────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[2/4] Checking Redis..." -ForegroundColor Yellow

$redisRunning = $false
try {
    $conn = New-Object System.Net.Sockets.TcpClient("127.0.0.1", 6379)
    $conn.Close()
    $redisRunning = $true
} catch {}

if (-not $redisRunning) {
    $redisPaths = @(
        "C:\Redis\redis-server.exe",
        "C:\Program Files\Redis\redis-server.exe",
        (Get-Command redis-server -ErrorAction SilentlyContinue)?.Source
    ) | Where-Object { $_ -and (Test-Path $_) }

    if ($redisPaths.Count -eq 0) {
        Write-Host "  WARNING: redis-server not found. Running without Redis." -ForegroundColor Yellow
        Write-Host "  Download: https://github.com/tporadowski/redis/releases" -ForegroundColor Gray
        Write-Host "  Extract to C:\Redis and re-run." -ForegroundColor Gray
    } else {
        Write-Host "  Starting Redis from $($redisPaths[0])..." -ForegroundColor Gray
        Start-Process -FilePath $redisPaths[0] -ArgumentList "--port 6379" -WindowStyle Hidden
        Start-Sleep -Seconds 2
        Write-Host "  Redis started on port 6379" -ForegroundColor Green
    }
} else {
    Write-Host "  Redis already running on port 6379" -ForegroundColor Green
}

# ── 3. Seed demo user ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[3/4] Seeding demo user..." -ForegroundColor Yellow

Set-Location $root
node scripts\seed-demo.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "  WARNING: Seed script failed. You may need to create the DB first." -ForegroundColor Yellow
    Write-Host "  Run: psql -U postgres -c `"CREATE USER docudex WITH PASSWORD 'docudex_pass';`"" -ForegroundColor Gray
    Write-Host "  Run: psql -U postgres -c `"CREATE DATABASE docudex OWNER docudex;`"" -ForegroundColor Gray
}

# ── 4. Start dev servers ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "[4/4] Starting backend + frontend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Frontend  -> http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend   -> http://localhost:5002/api/v1" -ForegroundColor Cyan
Write-Host "  Login     -> demo@docudex.com  /  Demo@12345" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C to stop all services." -ForegroundColor Gray
Write-Host ""

npm run dev
