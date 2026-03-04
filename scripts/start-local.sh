#!/usr/bin/env bash
# =============================================================================
# DocuDex — Local Dev Startup Script (Linux / macOS)
# Usage:  bash scripts/start-local.sh
#         npm run start:local
# =============================================================================

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "==============================="
echo "  DocuDex — Local Dev Startup  "
echo "==============================="
echo ""

# ── 1. PostgreSQL ─────────────────────────────────────────────────────────────
echo "[1/4] Checking PostgreSQL..."

if command -v pg_isready &>/dev/null && pg_isready -q; then
    echo "  ✅ PostgreSQL is running"
else
    # macOS Homebrew
    if command -v brew &>/dev/null && brew services list | grep -q "postgresql.*started"; then
        echo "  ✅ PostgreSQL (Homebrew) already running"
    elif command -v brew &>/dev/null; then
        echo "  Starting PostgreSQL via Homebrew..."
        brew services start postgresql@16 2>/dev/null || brew services start postgresql
        sleep 3
        echo "  ✅ PostgreSQL started"
    # Linux systemd
    elif command -v systemctl &>/dev/null; then
        echo "  Starting PostgreSQL via systemctl..."
        sudo systemctl start postgresql
        sleep 3
        echo "  ✅ PostgreSQL started"
    else
        echo "  ❌ PostgreSQL not found. Install it first:"
        echo "     macOS:  brew install postgresql@16"
        echo "     Ubuntu: sudo apt install postgresql"
        exit 1
    fi
fi

# ── 2. Redis ───────────────────────────────────────────────────────────────────
echo ""
echo "[2/4] Checking Redis..."

if redis-cli ping &>/dev/null 2>&1; then
    echo "  ✅ Redis already running"
else
    if command -v brew &>/dev/null; then
        echo "  Starting Redis via Homebrew..."
        brew services start redis
        sleep 2
    elif command -v systemctl &>/dev/null; then
        echo "  Starting Redis via systemctl..."
        sudo systemctl start redis
        sleep 2
    elif command -v redis-server &>/dev/null; then
        redis-server --daemonize yes --port 6379
        sleep 2
    else
        echo "  ⚠️  Redis not found — running without it (stateless JWT fallback)"
        echo "     macOS:  brew install redis"
        echo "     Ubuntu: sudo apt install redis-server"
    fi
    echo "  ✅ Redis started"
fi

# ── 3. Seed demo user ──────────────────────────────────────────────────────────
echo ""
echo "[3/4] Seeding demo user..."
node scripts/seed-demo.js || {
    echo "  ⚠️  Seed failed. Create the DB first:"
    echo "     psql -U postgres -c \"CREATE USER docudex WITH PASSWORD 'docudex_pass';\""
    echo "     psql -U postgres -c \"CREATE DATABASE docudex OWNER docudex;\""
}

# ── 4. Start dev servers ───────────────────────────────────────────────────────
echo ""
echo "[4/4] Starting backend + frontend..."
echo ""
echo "  Frontend  -> http://localhost:5173"
echo "  Backend   -> http://localhost:5002/api/v1"
echo "  Login     -> demo@docudex.com  /  Demo@12345"
echo ""
echo "  Press Ctrl+C to stop."
echo ""

npm run dev
