#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────
# DocuDex — API Smoke Test
#
# Sends a sequence of cURL calls against the running backend
# to verify auth, document CRUD, and seeded data.
#
# Usage:
#   chmod +x test-api.sh && ./test-api.sh
#
# Prerequisites:
#   - Backend running at http://localhost:5000
#   - PostgreSQL running (tables auto-created on backend boot)
# ──────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

API="http://localhost:5000/api/v1"
PASS=0
FAIL=0

pass() { echo -e "  ${GREEN}✓${NC} $1"; PASS=$((PASS + 1)); }
fail() { echo -e "  ${RED}✗${NC} $1 — $2"; FAIL=$((FAIL + 1)); }

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        🧪 DocuDex — API Smoke Test            ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Health check ──────────────────────────────────────
echo -e "${YELLOW}[1/8] Health Check${NC}"
HEALTH=$(curl -s -o /dev/null -w '%{http_code}' "$API/../health" 2>/dev/null || echo "000")
if [[ "$HEALTH" == "200" ]]; then
  pass "GET /health → 200"
  HEALTH_BODY=$(curl -s "$API/../health")
  echo "        $HEALTH_BODY" | head -1
else
  fail "GET /health → $HEALTH" "Backend not reachable at localhost:5000"
  echo -e "\n${RED}Backend is not running. Start it first:${NC}"
  echo "  npm run dev:backend"
  echo ""
  exit 1
fi

# ── 2. Register a test user ─────────────────────────────
echo -e "${YELLOW}[2/8] Register Test User${NC}"
RAND=$(( RANDOM % 99999 ))
TEST_EMAIL="test${RAND}@docudex.com"        
TEST_PASS="Test@${RAND}x"
TEST_NAME="Test User ${RAND}"

REG_RESP=$(curl -s -w "\n%{http_code}" -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASS\",
    \"fullName\": \"$TEST_NAME\"
  }" 2>/dev/null)
REG_CODE=$(echo "$REG_RESP" | tail -1)
REG_BODY=$(echo "$REG_RESP" | sed '$d')

if [[ "$REG_CODE" == "201" ]]; then
  pass "POST /auth/register → 201 ($TEST_EMAIL)"
  ACCESS_TOKEN=$(echo "$REG_BODY" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)
  REFRESH_TOKEN=$(echo "$REG_BODY" | grep -o '"refreshToken":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  fail "POST /auth/register → $REG_CODE" "$REG_BODY"
  ACCESS_TOKEN=""
fi

# ── 3. Login ─────────────────────────────────────────────
echo -e "${YELLOW}[3/8] Login${NC}"
LOGIN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASS\"}" 2>/dev/null)
LOGIN_CODE=$(echo "$LOGIN_RESP" | tail -1)
LOGIN_BODY=$(echo "$LOGIN_RESP" | sed '$d')

if [[ "$LOGIN_CODE" == "200" ]]; then
  pass "POST /auth/login → 200"
  ACCESS_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)
  REFRESH_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"refreshToken":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  fail "POST /auth/login → $LOGIN_CODE" "$LOGIN_BODY"
fi

# ── 4. Get current user (me) ────────────────────────────
echo -e "${YELLOW}[4/8] Get Current User${NC}"
if [[ -n "${ACCESS_TOKEN:-}" ]]; then
  ME_RESP=$(curl -s -w "\n%{http_code}" "$API/auth/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN" 2>/dev/null)
  ME_CODE=$(echo "$ME_RESP" | tail -1)
  ME_BODY=$(echo "$ME_RESP" | sed '$d')
  if [[ "$ME_CODE" == "200" ]]; then
    pass "GET /auth/me → 200"
  else
    fail "GET /auth/me → $ME_CODE" "$ME_BODY"
  fi
else
  fail "GET /auth/me" "No access token available"
fi

# ── 5. List documents ───────────────────────────────────
echo -e "${YELLOW}[5/8] List Documents${NC}"
if [[ -n "${ACCESS_TOKEN:-}" ]]; then
  DOCS_RESP=$(curl -s -w "\n%{http_code}" "$API/documents" \
    -H "Authorization: Bearer $ACCESS_TOKEN" 2>/dev/null)
  DOCS_CODE=$(echo "$DOCS_RESP" | tail -1)
  if [[ "$DOCS_CODE" == "200" ]]; then
    pass "GET /documents → 200"
  else
    fail "GET /documents → $DOCS_CODE" "$(echo "$DOCS_RESP" | sed '$d')"
  fi
else
  fail "GET /documents" "No access token"
fi

# ── 6. Document stats ───────────────────────────────────
echo -e "${YELLOW}[6/8] Document Stats${NC}"
if [[ -n "${ACCESS_TOKEN:-}" ]]; then
  STATS_RESP=$(curl -s -w "\n%{http_code}" "$API/documents/stats" \
    -H "Authorization: Bearer $ACCESS_TOKEN" 2>/dev/null)
  STATS_CODE=$(echo "$STATS_RESP" | tail -1)
  if [[ "$STATS_CODE" == "200" ]]; then
    pass "GET /documents/stats → 200"
  else
    fail "GET /documents/stats → $STATS_CODE" "$(echo "$STATS_RESP" | sed '$d')"
  fi
else
  fail "GET /documents/stats" "No access token"
fi

# ── 7. Login with demo user (if seeded) ─────────────────
echo -e "${YELLOW}[7/8] Login Demo User (seed data)${NC}"
DEMO_RESP=$(curl -s -w "\n%{http_code}" -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@docudex.com","password":"Demo@12345"}' 2>/dev/null)
DEMO_CODE=$(echo "$DEMO_RESP" | tail -1)
DEMO_BODY=$(echo "$DEMO_RESP" | sed '$d')

if [[ "$DEMO_CODE" == "200" ]]; then
  pass "POST /auth/login (demo) → 200"
  DEMO_TOKEN=$(echo "$DEMO_BODY" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)

  # Grab demo document count
  DEMO_DOCS_RESP=$(curl -s "$API/documents?limit=1" \
    -H "Authorization: Bearer $DEMO_TOKEN" 2>/dev/null)
  DOC_TOTAL=$(echo "$DEMO_DOCS_RESP" | grep -o '"total":[0-9]*' | head -1 | cut -d: -f2)
  if [[ -n "${DOC_TOTAL:-}" && "$DOC_TOTAL" -gt 0 ]]; then
    pass "Demo user has $DOC_TOTAL documents in DB"
  else
    echo -e "        ${YELLOW}ℹ  Demo user has no documents yet. Run:${NC} npm run seed"
  fi
else
  echo -e "        ${YELLOW}ℹ  Demo user not found (not seeded). Run:${NC} npm run seed"
fi

# ── 8. Refresh token ────────────────────────────────────
echo -e "${YELLOW}[8/8] Refresh Token${NC}"
if [[ -n "${REFRESH_TOKEN:-}" ]]; then
  REF_RESP=$(curl -s -w "\n%{http_code}" -X POST "$API/auth/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" 2>/dev/null)
  REF_CODE=$(echo "$REF_RESP" | tail -1)
  if [[ "$REF_CODE" == "200" ]]; then
    pass "POST /auth/refresh → 200"
  else
    fail "POST /auth/refresh → $REF_CODE" "$(echo "$REF_RESP" | sed '$d')"
  fi
else
  fail "POST /auth/refresh" "No refresh token"
fi

# ── Summary ──────────────────────────────────────────────
echo ""
echo -e "───────────────────────────────────────────────"
echo -e "  ${GREEN}Passed: $PASS${NC}   ${RED}Failed: $FAIL${NC}"
echo -e "───────────────────────────────────────────────"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo -e "${GREEN}All tests passed! ✅${NC}"
else
  echo -e "${YELLOW}Some tests failed. Check the output above.${NC}"
fi
echo ""
echo -e "${CYAN}Test credentials saved:${NC}"
echo -e "  Email:    $TEST_EMAIL"
echo -e "  Password: $TEST_PASS"
echo ""

exit "$FAIL"
