#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────
# DocuDex — One-click deploy & seed
#
# This script:
#   1. Builds all Docker images via docker-compose
#   2. Starts all services (postgres, redis, backend, ai-service, frontend)
#   3. Waits for the database to be ready
#   4. Runs the seed script to populate 100 sample documents
#
# Usage:
#   chmod +x deploy.sh && ./deploy.sh
#
# Prerequisites:
#   - Docker & Docker Compose installed
#   - Ports 3000, 5000, 8000 available (configurable in docker-compose.yml)
# ──────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[DocuDex]${NC} $*"; }
warn() { echo -e "${YELLOW}[DocuDex]${NC} $*"; }
err()  { echo -e "${RED}[DocuDex]${NC} $*" >&2; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ── Pre-flight checks ──────────────────────────────────────
command -v docker >/dev/null 2>&1 || { err "Docker is required but not installed."; exit 1; }
command -v docker compose >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1 || {
  err "Docker Compose is required but not installed."
  exit 1
}

# Prefer 'docker compose' (v2) but fall back to 'docker-compose'
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
else
  DC="docker-compose"
fi

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       🛡️  DocuDex — Deploy & Seed         ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: Build ────────────────────────────────────────
log "Building Docker images..."
$DC build --parallel 2>/dev/null || $DC build

# ── Step 2: Start services ──────────────────────────────
log "Starting all services..."
$DC up -d

# ── Step 3: Wait for Postgres ───────────────────────────
log "Waiting for PostgreSQL to be ready..."
MAX_WAIT=60
WAITED=0
until docker exec docudex-postgres pg_isready -U docudex >/dev/null 2>&1; do
  sleep 1
  WAITED=$((WAITED + 1))
  if [ "$WAITED" -ge "$MAX_WAIT" ]; then
    err "PostgreSQL did not become ready within ${MAX_WAIT}s"
    exit 1
  fi
done
log "PostgreSQL is ready (took ${WAITED}s)"

# ── Step 4: Wait for backend to run migrations ─────────
log "Waiting for backend to initialize schema..."
sleep 5

# ── Step 5: Seed ─────────────────────────────────────────
log "Seeding database with 100 sample documents..."

# Check if we can run inside the backend container
if docker exec docudex-backend ls /app/dist/seed.js >/dev/null 2>&1; then
  docker exec docudex-backend node /app/dist/seed.js
elif command -v npx >/dev/null 2>&1 && [ -d "node_modules" ]; then
  # Run locally
  cd apps/backend
  npx ts-node --transpile-only src/seed.ts
  cd "$SCRIPT_DIR"
else
  warn "Seed script not available in container. Seeding locally..."
  npm install --workspace=apps/backend 2>/dev/null || true
  cd apps/backend
  npx ts-node --transpile-only src/seed.ts
  cd "$SCRIPT_DIR"
fi

# ── Done ─────────────────────────────────────────────────
echo ""
log "✅ DocuDex is running!"
echo ""
echo -e "  ${CYAN}Frontend:${NC}   http://localhost:3000"
echo -e "  ${CYAN}Backend:${NC}    http://localhost:5000"
echo -e "  ${CYAN}AI Service:${NC} http://localhost:8000"
echo ""
echo -e "  ${YELLOW}Demo Login:${NC}"
echo -e "    Email:    demo@docudex.com"
echo -e "    Password: Demo@12345"
echo ""
echo -e "  ${CYAN}Commands:${NC}"
echo -e "    Stop:     $DC down"
echo -e "    Logs:     $DC logs -f"
echo -e "    Re-seed:  $DC exec backend node /app/dist/seed.js"
echo ""
