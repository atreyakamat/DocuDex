# DocuDex — Deployment Guide

## Table of Contents

1. [One-Command Start](#one-command-start)
2. [Prerequisites](#prerequisites)
3. [Option A — Local Dev (No Docker)](#option-a--local-dev-no-docker)
4. [Option B — Docker Compose](#option-b--docker-compose)
5. [Demo Credentials](#demo-credentials)
6. [Environment Variables Reference](#environment-variables-reference)
7. [Production Hardening Checklist](#production-hardening-checklist)
8. [Deploying to a VPS / Cloud VM](#deploying-to-a-vps--cloud-vm)
9. [Deploying to a Managed Platform](#deploying-to-a-managed-platform)
10. [Port Reference](#port-reference)
11. [Troubleshooting](#troubleshooting)

---

## One-Command Start

> **This is the fastest way to run DocuDex.** Prerequisites must be installed first — see [Option A](#option-a--local-dev-no-docker) or [Option B](#option-b--docker-compose).

### Local dev (Node + native Postgres/Redis)

```bash
npm run start:local
```

This single command will:
1. Verify PostgreSQL is running (starts the Windows service / Homebrew service if needed)
2. Start Redis if not already running (`C:\Redis\redis-server.exe` on Windows)
3. Seed the demo user (`demo@docudex.com / Demo@12345`) — safe to run repeatedly
4. Launch backend + frontend together with hot-reload via `concurrently`

Once running, open **http://localhost:5173**

### Docker (all services in containers)

```bash
docker compose up --build -d && node scripts/seed-demo.js
```

Once running, open **http://localhost:3000**

---

## Prerequisites

### Local dev

| Tool | Min version | Notes |
|------|------------|-------|
| Node.js | 20 LTS | https://nodejs.org |
| PostgreSQL | 14 – 18 | Windows: https://www.postgresql.org/download/windows · macOS: `brew install postgresql@16` |
| Redis | 5+ | Windows: extract https://github.com/tporadowski/redis/releases to `C:\Redis` · macOS: `brew install redis` |
| Python | 3.11+ | Only for the AI service |

### Docker

| Tool | Min version | Notes |
|------|------------|-------|
| Docker Desktop | 24+ | https://www.docker.com/products/docker-desktop |
| Docker Compose | v2 | Bundled with Docker Desktop |

---

## Option A — Local Dev (No Docker)

### 1. Clone and install

```bash
git clone https://github.com/atreyakamat/DocuDex.git
cd DocuDex
npm install
```

### 2. Create the database (one-time)

**Windows** — open PowerShell as Administrator and add Postgres to PATH:
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
psql -h 127.0.0.1 -U postgres -c "CREATE USER docudex WITH PASSWORD 'docudex_pass';"
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE docudex OWNER docudex;"
```

**macOS / Linux:**
```bash
psql -U postgres -c "CREATE USER docudex WITH PASSWORD 'docudex_pass';"
psql -U postgres -c "CREATE DATABASE docudex OWNER docudex;"
```

### 3. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
```

The `.env` file already has correct defaults for local dev. Key values:

```env
PORT=5002
DB_HOST=localhost
DB_PORT=5432
DB_USER=docudex
DB_PASSWORD=docudex_pass
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
```

> If port 5002 conflicts on your machine, change `PORT=` in `.env` and update the proxy target in `apps/frontend/vite.config.ts`.

### 4. Start everything (single command)

```bash
npm run start:local
```

Or start services individually:

```bash
# Terminal 1 — backend (hot-reload, port 5002)
npm run dev:backend

# Terminal 2 — frontend (Vite, port 5173)
npm run dev:frontend
```

### 5. (Optional) AI service

```bash
cd apps/ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Without this, uploaded documents stay in `PROCESSING` status — no crash.

### Running ports (local dev)

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:5002/api/v1 |
| AI Service | http://localhost:8000/docs |

---

## Option B — Docker Compose

All five services run in containers — no local Postgres or Redis needed.

### 1. Clone and configure

```bash
git clone https://github.com/atreyakamat/DocuDex.git
cd DocuDex
cp apps/backend/.env.example apps/backend/.env
```

### 2. Start all services

```bash
docker compose up --build -d
```

First run pulls base images and builds app layers (~3–5 min). Subsequent starts reuse the cache and take seconds.

### 3. Check status

```bash
docker compose ps
```

All containers should show `Up` or `Up (healthy)`:

```
NAME               STATUS            PORTS
docudex-ai         Up                0.0.0.0:8000->8000/tcp
docudex-backend    Up                0.0.0.0:5001->5000/tcp
docudex-frontend   Up                0.0.0.0:3000->80/tcp
docudex-postgres   Up (healthy)      0.0.0.0:5433->5432/tcp
docudex-redis      Up (healthy)      0.0.0.0:6380->6379/tcp
```

### 4. Seed the demo user

```bash
node scripts/seed-demo.js
```

> The script reads DB config from `apps/backend/.env`. For the Docker setup it connects on host port `5433`.
> Update `DB_PORT=5433` in your `.env` temporarily, or set env vars inline:
> ```bash
> DB_PORT=5433 DB_PASSWORD=docudex_secret node scripts/seed-demo.js
> ```

### Running ports (Docker)

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:5001/api/v1 |
| AI Service | http://localhost:8000/docs |

### Useful Docker commands

```bash
docker compose logs -f                  # live logs, all services
docker compose logs -f backend          # backend only
docker compose up --build -d backend    # rebuild one service after code change
docker compose restart backend          # restart without rebuild
docker compose down                     # stop and remove containers (data kept)
docker compose down -v                  # stop and wipe all data volumes
```

---

## Demo Credentials

| Field | Value |
|-------|-------|
| Email | `demo@docudex.com` |
| Password | `Demo@12345` |

**Password rules** (enforced by both frontend and backend):
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character from: `@$!%*?&`

To re-seed or reset the demo user at any time:
```bash
npm run seed:demo
```

---

## Environment Variables Reference

All variables live in `apps/backend/.env`.

| Variable | Required | Local default | Docker default | Description |
|----------|----------|--------------|----------------|-------------|
| `NODE_ENV` | Yes | `development` | `production` | `production` disables error stack traces |
| `PORT` | No | `5002` | `5000` | Express listen port |
| `DATABASE_URL` | Yes | `postgresql://docudex:docudex_pass@localhost:5432/docudex` | `postgresql://docudex:docudex_secret@postgres:5432/docudex` | Full connection string |
| `DB_HOST` | Yes | `localhost` | `postgres` | Docker uses service name, not localhost |
| `DB_PORT` | Yes | `5432` | `5432` | Internal Postgres port |
| `DB_NAME` | Yes | `docudex` | `docudex` | |
| `DB_USER` | Yes | `docudex` | `docudex` | |
| `DB_PASSWORD` | Yes | `docudex_pass` | `docudex_secret` | **Change in production** |
| `REDIS_URL` | No | `redis://localhost:6379` | `redis://redis:6379` | Omit to run without Redis |
| `JWT_SECRET` | Yes | `docudex_sample_jwt_secret_key_32chars!!` | see docker-compose.yml | **Must be ≥32 chars. Change in production** |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | `15m` | |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | `7d` | |
| `AI_SERVICE_URL` | No | `http://localhost:8000` | `http://ai-service:8000` | |
| `UPLOAD_DIR` | No | `./uploads` | `/app/uploads` | |
| `MAX_FILE_SIZE` | No | `52428800` | `52428800` | 50 MB in bytes |
| `FRONTEND_URL` | No | `http://localhost:5173` | `http://localhost:3000` | CORS allow-list origin |
| `CORS_ORIGIN` | No | — | `http://localhost:3000,http://localhost:5001` | Extra CORS origins, comma-separated |
| `SMTP_HOST` | No | `smtp.gmail.com` | — | Only needed for OTP email |
| `SMTP_PORT` | No | `587` | — | |
| `SMTP_USER` | No | — | — | Gmail address |
| `SMTP_PASS` | No | — | — | Gmail App Password |

---

## Production Hardening Checklist

Work through this before exposing DocuDex to the internet.

### Secrets

- [ ] Generate a strong JWT secret (min 64 chars):
  ```bash
  # Linux/macOS
  openssl rand -hex 32
  # Windows PowerShell
  -join ((1..32) | ForEach-Object { '{0:X2}' -f (Get-Random -Max 256) })
  ```
- [ ] Set a strong `DB_PASSWORD` — change it in both `docker-compose.yml` and `.env`
- [ ] Delete or change the `demo@docudex.com` account password
- [ ] Set `NODE_ENV=production`

### Networking

- [ ] Put Nginx or Caddy in front — expose only ports 80/443 publicly
- [ ] Bind Postgres and Redis to `127.0.0.1` so they aren't accessible from the internet:
  ```yaml
  # docker-compose.yml
  postgres:
    ports:
      - "127.0.0.1:5432:5432"
  redis:
    ports:
      - "127.0.0.1:6379:6379"
  ```
- [ ] Enable HTTPS (Caddy auto-TLS is the easiest option)
- [ ] Set `CORS_ORIGIN` and `FRONTEND_URL` to your exact production domain — never `*`

### Docker Compose production override

Create `docker-compose.prod.yml`:

```yaml
services:
  backend:
    environment:
      NODE_ENV: production
      JWT_SECRET: <64-char-random-string>
      DB_PASSWORD: <strong-password>
      CORS_ORIGIN: "https://your-domain.com"
      FRONTEND_URL: "https://your-domain.com"

  postgres:
    ports:
      - "127.0.0.1:5432:5432"
    environment:
      POSTGRES_PASSWORD: <strong-password>

  redis:
    ports:
      - "127.0.0.1:6379:6379"
    command: redis-server --requirepass <redis-password>
```

Deploy with:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### File storage

For production, use S3 instead of local disk so uploads survive container restarts:

```env
STORAGE_TYPE=s3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_S3_BUCKET=docudex-uploads
```

### Backups

```bash
# Postgres — dump to file
docker exec docudex-postgres pg_dump -U docudex docudex > backup_$(date +%F).sql

# Restore
docker exec -i docudex-postgres psql -U docudex docudex < backup_2026-01-01.sql
```

Schedule with `cron` (Linux) or Task Scheduler (Windows).

---

## Deploying to a VPS / Cloud VM

Ubuntu 22.04+ recommended.

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# 2. Clone
git clone https://github.com/atreyakamat/DocuDex.git
cd DocuDex

# 3. Configure
cp apps/backend/.env.example apps/backend/.env
# Edit .env — set strong JWT_SECRET, DB_PASSWORD, FRONTEND_URL

# 4. Start (with production overrides)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# 5. Seed demo user
node scripts/seed-demo.js

# 6. HTTPS with Caddy
sudo apt install -y caddy
sudo tee /etc/caddy/Caddyfile > /dev/null <<EOF
your-domain.com {
    reverse_proxy localhost:3000
}
EOF
sudo systemctl reload caddy
```

---

## Deploying to a Managed Platform

### Railway / Render

1. Push to GitHub
2. Create services: `postgres`, `redis`, `backend`, `ai-service`, `frontend`
3. Set the env vars from the reference table — use the managed service hostnames for `DB_HOST` and `REDIS_URL`
4. Set `VITE_API_URL` to the backend's public URL as a build arg for the frontend service

### Docker Hub + Watchtower (auto-updates on git push)

```bash
# Build and push
docker tag docudex-backend youruser/docudex-backend:latest
docker push youruser/docudex-backend:latest

# On the server — Watchtower checks every 5 min and redeploys on new images
docker run -d --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --interval 300
```

---

## Port Reference

### Local dev

| Service | Port | Config |
|---------|------|--------|
| Frontend (Vite) | `5173` | `apps/frontend/vite.config.ts` → `server.port` |
| Backend (Express) | `5002` | `apps/backend/.env` → `PORT` |
| AI Service | `8000` | `uvicorn --port` |
| PostgreSQL | `5432` | Windows service / local install |
| Redis | `6379` | `C:\Redis\redis-server.exe` |

### Docker Compose (host → container)

| Service | Host port | Container port | Change in |
|---------|-----------|----------------|-----------|
| Frontend | `3000` | `80` | `docker-compose.yml` → `frontend.ports` |
| Backend | `5001` | `5000` | `docker-compose.yml` → `backend.ports` |
| AI Service | `8000` | `8000` | `docker-compose.yml` → `ai-service.ports` |
| PostgreSQL | `5433` | `5432` | `docker-compose.yml` → `postgres.ports` |
| Redis | `6380` | `6379` | `docker-compose.yml` → `redis.ports` |

> Host ports are remapped from defaults to avoid conflicts with local Postgres (5432), Redis (6379), and Docker Desktop's internal Redis (6379).

To change a host port, edit the **left** number only:
```yaml
ports:
  - "NEW_HOST_PORT:CONTAINER_PORT"
```

---

## Troubleshooting

### `EADDRINUSE` — port already in use

```powershell
# Windows — find what's on port 5002
Get-Process -Id (Get-NetTCPConnection -LocalPort 5002).OwningProcess

# Kill it
Stop-Process -Id <PID>
```

```bash
# Linux/macOS
lsof -ti :5002 | xargs kill
```

Or just change `PORT=` in `.env` and update the `proxy.target` in `apps/frontend/vite.config.ts`.

### Login returns 401

The password hash stored in the database may be corrupted (common when inserting via PowerShell which swallows `$` signs). Reset it:

```bash
npm run seed:demo
```

### Login returns "Too many authentication attempts"

The rate limiter (in-memory, resets on restart) was triggered by repeated failed attempts. Restart the backend:

```bash
# Local dev — Ctrl+C the terminal then:
npm run dev:backend

# Docker
docker restart docudex-backend
```

### Backend crashes with `password authentication failed`

The `DB_PASSWORD` in `.env` doesn't match the Postgres user's actual password.

```bash
# Reset the password in Postgres to match .env
psql -U postgres -c "ALTER USER docudex WITH PASSWORD 'docudex_pass';"
```

### `pg_hba.conf` blocks connection

Postgres 16+ defaults to `scram-sha-256` which requires a valid password hash. If you see this error connecting from the host, the password was set before `scram-sha-256` was configured. Reset it (see above).

### Frontend shows blank page / network errors

Check the Vite proxy target matches your `PORT` in `.env`:

```ts
// apps/frontend/vite.config.ts
proxy: {
  '/api': { target: 'http://localhost:5002' }  // must match PORT in .env
}
```

### Docker: `failed to set up container networking: port already allocated`

A host port is taken. Remap it in `docker-compose.yml` (see [Port Reference](#port-reference)) then:

```bash
docker compose down
docker compose up -d
```
