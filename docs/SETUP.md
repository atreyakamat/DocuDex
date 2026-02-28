# DocuDex — Setup & Credentials Manual

> Complete reference for running, testing, and deploying DocuDex locally and via Docker.

---

## Table of Contents

1. [Quick Reference — All Credentials](#1-quick-reference--all-credentials)
2. [System Requirements](#2-system-requirements)
3. [Option A: Docker Deploy (Recommended)](#3-option-a-docker-deploy-recommended)
4. [Option B: Local Development](#4-option-b-local-development)
5. [Seeding Test Data](#5-seeding-test-data)
6. [Running the API Smoke Test](#6-running-the-api-smoke-test)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Service Ports & URLs](#8-service-ports--urls)
9. [Database Setup Manual](#9-database-setup-manual)
10. [Redis Setup Manual](#10-redis-setup-manual)
11. [AI Service Setup Manual](#11-ai-service-setup-manual)
12. [Frontend Configuration](#12-frontend-configuration)
13. [Authentication & JWT Details](#13-authentication--jwt-details)
14. [API Quick Reference](#14-api-quick-reference)
15. [File Upload & Storage](#15-file-upload--storage)
16. [Common Issues & Troubleshooting](#16-common-issues--troubleshooting)
17. [Production Checklist](#17-production-checklist)

---

## 1. Quick Reference — All Credentials

### Database (PostgreSQL)

| Key            | Value                                                     |
|----------------|-----------------------------------------------------------|
| Host           | `localhost`                                               |
| Port           | `5432`                                                    |
| Database       | `docudex`                                                 |
| Username       | `docudex`                                                 |
| Password       | `docudex_pass` (local) / `docudex_secret` (Docker)       |
| Connection URL | `postgresql://docudex:docudex_pass@localhost:5432/docudex`|

### Redis

| Key            | Value                       |
|----------------|-----------------------------|
| Host           | `localhost`                  |
| Port           | `6379`                       |
| URL            | `redis://localhost:6379`     |
| Password       | *(none — default)*           |

### Demo User (created by seed)

| Key      | Value              |
|----------|--------------------|
| Email    | `demo@docudex.com` |
| Password | `Demo@12345`       |
| Role     | `user`             |

### JWT Secrets

| Key              | Dev Value (change in prod!)                        |
|------------------|----------------------------------------------------|
| JWT_SECRET       | `fallback_secret_change_in_production`              |
| Docker JWT       | `super_secret_jwt_key_change_in_prod_min_32_chars`  |
| Refresh Secret   | `super_secret_refresh_key_change_in_prod_32ch`      |
| Access Expiry    | `15m`                                               |
| Refresh Expiry   | `7d`                                                |

### Service URLs

| Service     | Local Dev                  | Docker                     |
|-------------|----------------------------|----------------------------|
| Frontend    | http://localhost:5173       | http://localhost:3000       |
| Backend API | http://localhost:5000       | http://localhost:5000       |
| AI Service  | http://localhost:8000       | http://localhost:8000       |
| PostgreSQL  | localhost:5432              | localhost:5432              |
| Redis       | localhost:6379              | localhost:6379              |

---

## 2. System Requirements

### Required

- **Node.js** ≥ 18 (recommended: 20 LTS)
- **npm** ≥ 9
- **PostgreSQL** 14+ (or via Docker)

### Optional

- **Redis** 6+ — app works without it (token blacklisting + OTP disabled)
- **Python** ≥ 3.11 — only for AI service (OCR / classification)
- **Tesseract OCR** — only for AI service image processing
- **Docker** + **Docker Compose** — for containerized deployment

### Quick Install (macOS)

```bash
# Node.js (via nvm)
nvm install 20
nvm use 20

# PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Redis (optional)
brew install redis
brew services start redis

# Tesseract (optional — for AI service)
brew install tesseract

# Python (optional — for AI service)
brew install python@3.11
```

### Quick Install (Ubuntu/Debian)

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt-get install -y postgresql-16 postgresql-client-16

# Redis (optional)
sudo apt-get install -y redis-server

# Tesseract + Python (optional)
sudo apt-get install -y tesseract-ocr tesseract-ocr-eng python3.11 python3.11-venv
```

---

## 3. Option A: Docker Deploy (Recommended)

The fastest way to get everything running. This starts all 5 services (Postgres, Redis, Backend, AI Service, Frontend) and seeds 100 sample documents.

```bash
# 1. Clone and enter project
git clone https://github.com/atreyakamat/DocuDex.git
cd DocuDex

# 2. One-click deploy
chmod +x deploy.sh
./deploy.sh
```

**What `deploy.sh` does:**

1. Builds all Docker images in parallel
2. Starts all 5 services (`docker compose up -d`)
3. Waits for PostgreSQL to be healthy
4. Waits 5 seconds for backend schema auto-migration
5. Runs seed script (100 documents + demo user + 6 folders + 8 notifications)

**After deploy:**

```
Frontend:   http://localhost:3000
Backend:    http://localhost:5000
AI Service: http://localhost:8000

Demo Login:
  Email:    demo@docudex.com
  Password: Demo@12345
```

**Docker management commands:**

```bash
# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f ai-service

# Stop all services
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v

# Restart backend only
docker compose restart backend

# Re-seed (after initial deploy)
docker compose exec backend node /app/dist/seed.js

# Connect to database
docker exec -it docudex-postgres psql -U docudex -d docudex
```

### Docker Credentials (from `docker-compose.yml`)

| Variable          | Docker Value                              |
|-------------------|-------------------------------------------|
| POSTGRES_USER     | `docudex`                                 |
| POSTGRES_PASSWORD | `docudex_secret`                          |
| POSTGRES_DB       | `docudex`                                 |
| DATABASE_URL      | `postgresql://docudex:docudex_secret@postgres:5432/docudex` |
| REDIS_URL         | `redis://redis:6379`                      |
| JWT_SECRET        | `super_secret_jwt_key_change_in_prod_min_32_chars` |
| CORS_ORIGIN       | `http://localhost:3000`                   |
| AI_SERVICE_URL    | `http://ai-service:8000`                  |

---

## 4. Option B: Local Development

For active development with hot-reload on both frontend and backend.

### Step 1: Install dependencies

```bash
cd DocuDex
npm install
```

### Step 2: Build shared types

```bash
npm run build --workspace=packages/shared-types
```

### Step 3: Set up PostgreSQL

**Option A — Docker container (easiest):**

```bash
docker run -d --name docudex-pg \
  -e POSTGRES_USER=docudex \
  -e POSTGRES_PASSWORD=docudex_pass \
  -e POSTGRES_DB=docudex \
  -p 5432:5432 \
  postgres:16-alpine
```

**Option B — Existing PostgreSQL instance:**

```sql
-- Run as PostgreSQL superuser (psql -U postgres):
CREATE USER docudex WITH PASSWORD 'docudex_pass';
CREATE DATABASE docudex OWNER docudex;
GRANT ALL PRIVILEGES ON DATABASE docudex TO docudex;
```

### Step 4: Set up Redis (optional)

```bash
# Docker
docker run -d --name docudex-redis -p 6379:6379 redis:7-alpine

# Or use Homebrew
brew services start redis
```

> **Without Redis:** The app works fine. Token blacklisting on logout and OTP verification will be disabled. JWT refresh tokens still work (stateless fallback).

### Step 5: Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env if your DB credentials differ from defaults
```

**Minimum .env to start:**

```dotenv
DATABASE_URL=postgresql://docudex:docudex_pass@localhost:5432/docudex
JWT_SECRET=any_string_at_least_32_characters_long_here
```

### Step 6: Start the backend

```bash
npm run dev:backend
# → DocuDex API running on http://localhost:5000
# → Database tables auto-created on first start
```

### Step 7: Start the frontend

```bash
npm run dev:frontend
# → Opens at http://localhost:5173
# → API calls proxied to http://localhost:5000 via Vite
```

**Or start both concurrently:**

```bash
npm run dev
# Starts backend + frontend in parallel
```

### Step 8: (Optional) Start the AI service

```bash
cd apps/ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> **Without AI service:** Document uploads will succeed but stay in `PROCESSING` status. No crash — the backend gracefully handles connection refusal to the AI service.

---

## 5. Seeding Test Data

The seed script creates **100 realistic sample documents** across 12 document types, plus a demo user, 6 folders, and 8 notifications.

### Local seeding

```bash
# Make sure PostgreSQL is running and backend .env is configured
npm run seed
```

### Docker seeding

```bash
# If backend is running in Docker
docker compose exec backend node /app/dist/seed.js
```

### What the seed creates

| Item               | Count | Details                                       |
|--------------------|-------|-----------------------------------------------|
| Demo User          | 1     | `demo@docudex.com` / `Demo@12345`             |
| Folders            | 6     | Identity, Financial, Education, Property, Business, Utility Bills |
| Documents          | 100   | Mixed types: Aadhaar, PAN, Passport, DL, Voter ID, Bank Statement, Salary Slip, ITR, Degree, Property Deed, GST Registration, Electricity Bill |
| Notifications      | 8     | Mix of expiry warnings, processed alerts, system tips |

### Re-seeding (idempotent)

Running the seed again **replaces** all demo data — it deletes existing documents, folders, and notifications for `demo@docudex.com` and inserts fresh data. Other users' data is untouched.

---

## 6. Running the API Smoke Test

A cURL-based test script that verifies the backend is working correctly.

```bash
# Make sure backend is running (npm run dev:backend or docker compose up)
chmod +x test-api.sh
./test-api.sh
```

**What it tests (8 checks):**

1. `GET /health` — Backend reachability + DB/Redis status check
2. `POST /auth/register` — Creates a random test user
3. `POST /auth/login` — Logs in with the test user
4. `GET /auth/me` — Fetches current user profile (JWT auth)
5. `GET /documents` — Lists documents (empty for new user)
6. `GET /documents/stats` — Document statistics
7. `POST /auth/login` (demo) — Checks if demo seed data is present
8. `POST /auth/refresh` — Token refresh flow

**Expected output (all passing):**

```
[1/8] Health Check
  ✓ GET /health → 200
[2/8] Register Test User
  ✓ POST /auth/register → 201 (test12345@docudex.com)
[3/8] Login
  ✓ POST /auth/login → 200
[4/8] Get Current User
  ✓ GET /auth/me → 200
[5/8] List Documents
  ✓ GET /documents → 200
[6/8] Document Stats
  ✓ GET /documents/stats → 200
[7/8] Login Demo User (seed data)
  ✓ POST /auth/login (demo) → 200
  ✓ Demo user has 100 documents in DB
[8/8] Refresh Token
  ✓ POST /auth/refresh → 200

Passed: 9   Failed: 0
All tests passed! ✅
```

---

## 7. Environment Variables Reference

All environment variables are defined in `apps/backend/.env.example`. Here's the complete list:

| Variable                | Required | Default                                        | Description                              |
|-------------------------|----------|------------------------------------------------|------------------------------------------|
| `NODE_ENV`              | No       | `development`                                   | `development` / `production` / `test`    |
| `PORT`                  | No       | `5000`                                          | Backend API port                         |
| `DATABASE_URL`          | **Yes**  | `postgresql://docudex:docudex_pass@localhost:5432/docudex` | Full PostgreSQL connection string |
| `DB_HOST`               | No       | `localhost`                                     | DB host (alt to DATABASE_URL)            |
| `DB_PORT`               | No       | `5432`                                          | DB port                                  |
| `DB_NAME`               | No       | `docudex`                                       | DB name                                  |
| `DB_USER`               | No       | `docudex`                                       | DB username                              |
| `DB_PASSWORD`           | No       | `docudex_pass`                                  | DB password                              |
| `REDIS_URL`             | No       | `redis://localhost:6379`                        | Redis URL (remove to skip Redis)         |
| `JWT_SECRET`            | **Yes**  | `fallback_secret_change_in_production`          | JWT signing secret (min 32 chars)        |
| `JWT_ACCESS_EXPIRES_IN` | No       | `15m`                                           | Access token lifetime                    |
| `JWT_REFRESH_EXPIRES_IN`| No       | `7d`                                            | Refresh token lifetime                   |
| `STORAGE_TYPE`          | No       | `local`                                         | `local` or `s3` (S3 not yet implemented) |
| `UPLOAD_DIR`            | No       | `./uploads`                                     | Directory for uploaded files             |
| `MAX_FILE_SIZE`         | No       | `52428800` (50 MB)                              | Max upload size in bytes                 |
| `AI_SERVICE_URL`        | No       | `http://localhost:8000`                         | AI/OCR service base URL                  |
| `FRONTEND_URL`          | No       | `http://localhost:5173`                         | CORS allowed origin                      |
| `SMTP_HOST`             | No       | `smtp.gmail.com`                                | Email server (for OTP)                   |
| `SMTP_PORT`             | No       | `587`                                           | SMTP port                                |
| `SMTP_USER`             | No       | *(empty)*                                       | SMTP username                            |
| `SMTP_PASS`             | No       | *(empty)*                                       | SMTP password / app password             |

### Minimal .env to start

```dotenv
DATABASE_URL=postgresql://docudex:docudex_pass@localhost:5432/docudex
JWT_SECRET=my_super_secret_32_char_key_here_x
```

---

## 8. Service Ports & URLs

| Service             | Local Dev Port | Docker Port | Internal Docker URL            |
|---------------------|----------------|-------------|--------------------------------|
| Frontend (Vite)     | 5173           | 3000        | —                              |
| Backend API         | 5000           | 5000        | http://backend:5000            |
| AI Service (FastAPI)| 8000           | 8000        | http://ai-service:8000         |
| PostgreSQL          | 5432           | 5432        | postgres:5432                  |
| Redis               | 6379           | 6379        | redis:6379                     |

### API Base URL

- **Local dev:** `http://localhost:5000/api/v1`
- **Docker:** `http://localhost:5000/api/v1`
- **Frontend:** Uses relative `/api/v1` (proxied by Vite dev server or nginx)

---

## 9. Database Setup Manual

### Tables (auto-created on backend start)

| Table               | Purpose                              |
|---------------------|--------------------------------------|
| `users`             | User accounts with hashed passwords  |
| `folders`           | User-specific document folders       |
| `documents`         | Document metadata + AI results       |
| `notifications`     | User notifications (expiry alerts, system) |
| `workflow_instances` | Guided workflow progress tracking    |
| `audit_logs`        | Activity audit trail                 |
| `document_shares`   | Shareable document links             |

### Indexes (15 total, auto-created)

| Index Name                      | Table             | Columns / Condition                        |
|---------------------------------|-------------------|--------------------------------------------|
| `idx_documents_user_id`         | documents         | `user_id`                                  |
| `idx_documents_status`          | documents         | `status`                                   |
| `idx_documents_category`        | documents         | `category`                                 |
| `idx_documents_expiry`          | documents         | `expiry_date`                              |
| `idx_documents_created_at`      | documents         | `created_at DESC`                          |
| `idx_documents_type`            | documents         | `document_type`                            |
| `idx_documents_holder`          | documents         | `holder_name`                              |
| `idx_documents_starred`         | documents         | `user_id, is_starred` WHERE `is_starred=true` |
| `idx_notifications_user_id`     | notifications     | `user_id`                                  |
| `idx_notifications_unread`      | notifications     | `user_id, is_read` WHERE `is_read=false`   |
| `idx_audit_logs_user_id`        | audit_logs        | `user_id`                                  |
| `idx_audit_logs_created_at`     | audit_logs        | `created_at DESC`                          |
| `idx_document_shares_token`     | document_shares   | `token`                                    |
| `idx_workflow_instances_user`   | workflow_instances | `user_id`                                  |
| `idx_folders_user`              | folders           | `user_id`                                  |

### Connecting to the database manually

```bash
# Local
psql -U docudex -d docudex -h localhost

# Docker
docker exec -it docudex-postgres psql -U docudex -d docudex

# Useful queries
SELECT count(*) FROM documents;                    -- total documents
SELECT document_type, count(*) FROM documents GROUP BY document_type;  -- by type
SELECT * FROM users;                               -- list users
SELECT * FROM notifications WHERE is_read = false;  -- unread notifications
```

---

## 10. Redis Setup Manual

Redis is **optional**. Without it:

- App starts normally (warning logged: "Redis unavailable")
- JWT refresh tokens work via stateless validation (no blacklisting)
- OTP email verification returns 503

### Verifying Redis connection

```bash
# Local
redis-cli ping
# → PONG

# Docker
docker exec docudex-redis redis-cli ping
# → PONG
```

### Health check includes Redis

```bash
curl -s http://localhost:5000/health | python3 -m json.tool
# {
#   "status": "healthy",
#   "checks": { "api": "ok", "database": "ok", "redis": "ok" },
#   "uptime": 123
# }
```

---

## 11. AI Service Setup Manual

The Python FastAPI service handles OCR, classification, field extraction, and summary generation.

### Local setup

```bash
cd apps/ai-service
python3 -m venv venv
source venv/bin/activate      # macOS/Linux
# .\venv\Scripts\activate     # Windows

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Verify AI service

```bash
curl http://localhost:8000/health
# {"status": "healthy"}

# Test document processing (with a PDF or image):
curl -X POST http://localhost:8000/process \
  -F "file=@/path/to/document.pdf"
```

### Without AI service

Upload still works — the document is saved with status `PROCESSING`. The backend catches the connection error gracefully (no crash). Once the AI service comes online, new uploads will be processed normally.

### Tesseract requirement

The AI service requires Tesseract OCR installed on the system:

```bash
# Verify installation
tesseract --version

# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-eng
```

---

## 12. Frontend Configuration

### Vite proxy (local dev)

In `apps/frontend/vite.config.ts`, all `/api/*` requests are proxied to `http://localhost:5000`:

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### Docker build (production)

The frontend is built with the `VITE_API_URL` build arg set in `docker-compose.yml`:

```yaml
args:
  VITE_API_URL: http://localhost:5000
```

The nginx container serves the built SPA at port 80 (mapped to `3000` externally).

### Path aliases

The frontend uses `@/` as alias for `src/`:

```typescript
import { useAuthStore } from '@/store/authStore';
// resolves to → src/store/authStore.ts
```

---

## 13. Authentication & JWT Details

### Registration requirements

| Field      | Rules                                                              |
|------------|--------------------------------------------------------------------|
| `email`    | Valid email format, normalized                                     |
| `fullName` | 2–100 characters, trimmed                                          |
| `password` | Min 8 chars, must contain: 1 lowercase, 1 uppercase, 1 digit, 1 special (`@$!%*?&`) |
| `phone`    | Optional, valid mobile format                                      |

### Token flow

1. **Register/Login** → Returns `{ accessToken, refreshToken }`
2. **API requests** → Send `Authorization: Bearer <accessToken>`
3. **Token expired (401)** → Frontend auto-calls `POST /auth/refresh` with `refreshToken`
4. **Logout** → `POST /auth/logout` with `refreshToken` (blacklisted in Redis if available)

### Rate limits

| Endpoint              | Limit                   |
|-----------------------|-------------------------|
| Auth (login/register) | 20 requests / 15 min    |
| All other API routes  | 200 requests / 15 min   |

### cURL example — full auth flow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MyPass@123",
    "fullName": "John Doe"
  }'

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"MyPass@123"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 3. Use the token
curl http://localhost:5000/api/v1/documents \
  -H "Authorization: Bearer $TOKEN"

# 4. Upload a document
curl -X POST http://localhost:5000/api/v1/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf"
```

---

## 14. API Quick Reference

Base URL: `http://localhost:5000/api/v1`

### Auth

| Method | Endpoint            | Auth | Description                |
|--------|---------------------|------|----------------------------|
| POST   | `/auth/register`    | No   | Create account             |
| POST   | `/auth/login`       | No   | Login, get tokens          |
| POST   | `/auth/refresh`     | No   | Refresh access token       |
| POST   | `/auth/logout`      | No   | Blacklist refresh token    |
| GET    | `/auth/me`          | Yes  | Get current user           |
| PUT    | `/auth/profile`     | Yes  | Update profile             |
| POST   | `/auth/change-password` | Yes | Change password        |
| POST   | `/auth/verify/send`  | Yes | Send OTP email            |
| POST   | `/auth/verify/confirm` | Yes | Verify OTP              |

### Documents

| Method | Endpoint                        | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| GET    | `/documents`                    | Yes  | List (with filters)      |
| GET    | `/documents/stats`              | Yes  | Statistics dashboard     |
| GET    | `/documents/:id`                | Yes  | Get single document      |
| POST   | `/documents/upload`             | Yes  | Upload file              |
| POST   | `/documents/upload/bulk`        | Yes  | Bulk upload              |
| PATCH  | `/documents/:id`                | Yes  | Update metadata          |
| DELETE | `/documents/:id`                | Yes  | Delete document          |
| GET    | `/documents/:id/download`       | Yes  | Download file            |
| POST   | `/documents/:id/share`          | Yes  | Create share link        |
| GET    | `/share/:token`                 | No   | Access shared document   |

### Folders

| Method | Endpoint           | Auth | Description          |
|--------|--------------------|------|----------------------|
| GET    | `/folders`         | Yes  | List user folders    |
| POST   | `/folders`         | Yes  | Create folder        |
| PUT    | `/folders/:id`     | Yes  | Update folder        |
| DELETE | `/folders/:id`     | Yes  | Delete folder        |

### Workflows

| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| GET    | `/workflows`         | Yes  | List workflow instances   |
| GET    | `/workflows/templates` | Yes | Get templates            |
| POST   | `/workflows`         | Yes  | Start workflow           |
| PATCH  | `/workflows/:id`     | Yes  | Update workflow step     |

### Notifications

| Method | Endpoint                    | Auth | Description            |
|--------|-----------------------------|------|------------------------|
| GET    | `/notifications`            | Yes  | List notifications     |
| PATCH  | `/notifications/:id/read`   | Yes  | Mark as read           |
| POST   | `/notifications/read-all`   | Yes  | Mark all as read       |

### Health

| Method | Endpoint    | Auth | Description                         |
|--------|-------------|------|-------------------------------------|
| GET    | `/health`   | No   | API + DB + Redis status check       |

---

## 15. File Upload & Storage

| Setting         | Default       | Env Var          |
|-----------------|---------------|------------------|
| Max file size   | 50 MB         | `MAX_FILE_SIZE`  |
| Storage type    | Local disk    | `STORAGE_TYPE`   |
| Upload directory| `./uploads`   | `UPLOAD_DIR`     |

### Supported file types

The backend accepts any file via multer. The AI service processes:

- **Images:** JPEG, PNG, TIFF, BMP, WebP
- **PDFs:** Extractable text or scanned (OCR)
- **Others:** Stored but not OCR-processed

### Upload flow

```
User drops file → Frontend sends multipart POST /api/v1/documents/upload
  → Backend: multer saves file to UPLOAD_DIR
  → Backend: creates DB record (status: PROCESSING)
  → Backend: async POST to AI service /process
  → AI service: OCR → Classify → Extract fields → Summarize
  → Backend: updates DB with results (status: CURRENT/EXPIRED/EXPIRING_SOON)
  → Frontend: polls/refetches to show results
```

---

## 16. Common Issues & Troubleshooting

### Backend won't start

| Symptom                          | Fix                                                |
|----------------------------------|----------------------------------------------------|
| `ECONNREFUSED ...5432`           | PostgreSQL not running. Start it or check DB_HOST   |
| `role "docudex" does not exist`  | Create user: `CREATE USER docudex WITH PASSWORD 'docudex_pass';` |
| `database "docudex" does not exist` | Create DB: `CREATE DATABASE docudex OWNER docudex;` |
| `JWT_SECRET` warning             | Set a proper JWT_SECRET in .env (min 32 chars)     |

### Frontend shows blank page

| Symptom                   | Fix                                              |
|---------------------------|--------------------------------------------------|
| Network errors in console | Backend not running or wrong proxy config        |
| 401 on every request      | Token expired / invalid — clear localStorage     |
| White screen              | ErrorBoundary should catch — check browser console |

### Docker issues

| Symptom                           | Fix                                              |
|-----------------------------------|--------------------------------------------------|
| `port 5432 already in use`        | Stop local PostgreSQL: `brew services stop postgresql` |
| `port 3000 already in use`        | Stop whatever is on 3000 or change docker-compose ports |
| Backend can't connect to postgres | Wait for healthcheck — or increase `sleep 5` in deploy.sh |
| Seed fails                        | Check `docker compose logs backend` for schema errors |

### AI service issues

| Symptom                           | Fix                                              |
|-----------------------------------|--------------------------------------------------|
| `tesseract not found`             | Install Tesseract: `brew install tesseract`      |
| Documents stuck in PROCESSING     | AI service not running — start it or check AI_SERVICE_URL |
| OCR returns empty text            | Image quality too low or Tesseract lang pack missing |

---

## 17. Production Checklist

Before deploying to production, change these:

- [ ] **JWT_SECRET** — Use a cryptographically random 64+ character string
- [ ] **JWT_REFRESH_SECRET** — Different random 64+ character string
- [ ] **POSTGRES_PASSWORD** — Strong unique password
- [ ] **CORS_ORIGIN** — Set to your actual domain (not `localhost`)
- [ ] **FRONTEND_URL** — Set to your actual production URL
- [ ] **NODE_ENV** — Set to `production`
- [ ] **SMTP credentials** — Configure real SMTP for email verification
- [ ] **HTTPS** — Add TLS termination (nginx/Caddy/load balancer)
- [ ] **Rate limits** — Adjust for production traffic
- [ ] **Backup** — Set up PostgreSQL backup schedule
- [ ] **Monitoring** — Hit `/health` endpoint from uptime monitor
- [ ] **Logs** — Pipe winston logs to a log aggregator

### Generate secure secrets

```bash
# Generate a random JWT secret
openssl rand -base64 48
# e.g.: K8f2a1bR7nPq...

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

---

## Quick Start Cheat Sheet

```bash
# ─── Docker (everything in one command) ─────
./deploy.sh
# → Open http://localhost:3000
# → Login: demo@docudex.com / Demo@12345

# ─── Local dev ──────────────────────────────
npm install
npm run build --workspace=packages/shared-types
cp apps/backend/.env.example apps/backend/.env
npm run dev          # starts backend + frontend
npm run seed         # populates 100 docs
./test-api.sh        # verifies everything works

# ─── Useful commands ────────────────────────
npm run dev:backend          # backend only (port 5000)
npm run dev:frontend         # frontend only (port 5173)
npm run build                # production build (all)
npm run seed                 # seed 100 sample documents
./test-api.sh                # API smoke test (8 checks)
```
