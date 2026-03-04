# DocuDex — Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Docker)](#quick-start-docker)
3. [Seed the Demo User](#seed-the-demo-user)
4. [Local Development (No Docker)](#local-development-no-docker)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Production Hardening Checklist](#production-hardening-checklist)
7. [Deploying to a VPS / Cloud VM](#deploying-to-a-vps--cloud-vm)
8. [Deploying to a Managed Platform](#deploying-to-a-managed-platform)
9. [Port Conflict Reference](#port-conflict-reference)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Minimum version | Install |
|------|----------------|---------|
| Docker Desktop | 24+ | https://www.docker.com/products/docker-desktop |
| Docker Compose | v2 (bundled) | included with Docker Desktop |
| Node.js | 20 LTS | https://nodejs.org (only needed for local dev) |
| Python | 3.11+ | https://python.org (only needed for local AI service dev) |

---

## Quick Start (Docker)

All five services (Postgres, Redis, backend, AI service, frontend) are started with a single command.

### 1. Clone the repository

```bash
git clone https://github.com/atreyakamat/DocuDex.git
cd DocuDex
```

### 2. Create the backend environment file

```bash
cp apps/backend/.env.example apps/backend/.env
```

The defaults in `.env.example` match the Docker Compose service names and work out of the box.

### 3. Start all services

```bash
docker compose up --build -d
```

First run downloads base images and compiles the app (~3–5 min). Subsequent starts are fast.

### 4. Verify everything is running

```bash
docker compose ps
```

Expected output — all containers should show `Up` or `Up (healthy)`:

```
NAME               STATUS          PORTS
docudex-ai         Up              0.0.0.0:8000->8000/tcp
docudex-backend    Up              0.0.0.0:5001->5000/tcp
docudex-frontend   Up              0.0.0.0:3000->80/tcp
docudex-postgres   Up (healthy)    0.0.0.0:5433->5432/tcp
docudex-redis      Up (healthy)    0.0.0.0:6380->6379/tcp
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5001/api/v1 |
| AI Service | http://localhost:8000/docs |

---

## Seed the Demo User

After the containers are running, create the demo account by running this one-time Node script **from the project root**:

```bash
node -e "
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
(async () => {
  const hash = await bcrypt.hash('Demo@12345', 10);
  const c = new Client({ host:'localhost', port:5433, database:'docudex', user:'docudex', password:'docudex_secret' });
  await c.connect();
  await c.query(
    \`INSERT INTO users (email, full_name, password_hash, role, is_email_verified)
     VALUES (\$1,\$2,\$3,'user',true) ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash\`,
    ['demo@docudex.com','Demo User', hash]
  );
  console.log('Done — login: demo@docudex.com / Demo@12345');
  await c.end();
})();
"
```

> **Windows PowerShell users:** PowerShell interprets `$` as a variable. Use the cross-platform script below instead:

Save as `seed-demo.js` and run `node seed-demo.js`:

```js
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function main() {
  const hash = await bcrypt.hash('Demo@12345', 10);
  const client = new Client({
    host: 'localhost', port: 5433,
    database: 'docudex', user: 'docudex', password: 'docudex_secret',
  });
  await client.connect();
  await client.query(
    `INSERT INTO users (email, full_name, password_hash, role, is_email_verified)
     VALUES ($1, $2, $3, 'user', true)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    ['demo@docudex.com', 'Demo User', hash]
  );
  console.log('Created demo user: demo@docudex.com / Demo@12345');
  await client.end();
}
main();
```

**Demo credentials:**

| Field | Value |
|-------|-------|
| Email | `demo@docudex.com` |
| Password | `Demo@12345` |

---

## Local Development (No Docker)

Run services individually for hot-reload development.

### 1. Install dependencies

```bash
npm install
```

### 2. Start infrastructure (Postgres + Redis via Docker)

```bash
docker compose up -d postgres redis
```

### 3. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env — set DB_HOST=localhost, DB_PORT=5433
```

### 4. Start backend (port 5000)

```bash
npm run dev:backend
```

### 5. Start frontend (port 5173)

```bash
npm run dev:frontend
```

### 6. Start AI service (optional, port 8000)

```bash
cd apps/ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Environment Variables Reference

All variables live in `apps/backend/.env`. The Docker Compose file injects these directly into the container — no `.env` file is read by the container itself.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | `production` disables stack traces in API errors |
| `PORT` | No | `5000` | Internal port the Express server listens on |
| `DATABASE_URL` | Yes | — | Full Postgres connection string |
| `DB_HOST` | Yes | `localhost` | `postgres` when running inside Docker |
| `DB_PORT` | Yes | `5432` | |
| `DB_NAME` | Yes | `docudex` | |
| `DB_USER` | Yes | `docudex` | |
| `DB_PASSWORD` | Yes | — | |
| `REDIS_URL` | No | — | Omit to run without Redis (stateless JWT fallback) |
| `JWT_SECRET` | Yes | — | **Min 32 chars. Change in production.** |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | |
| `AI_SERVICE_URL` | No | `http://localhost:8000` | `http://ai-service:8000` inside Docker |
| `UPLOAD_DIR` | No | `./uploads` | `/app/uploads` inside Docker |
| `MAX_FILE_SIZE` | No | `52428800` | 50 MB in bytes |
| `FRONTEND_URL` | No | `http://localhost:5173` | Used in CORS allow-list |
| `CORS_ORIGIN` | No | — | Comma-separated additional CORS origins |
| `SMTP_HOST` | No | `smtp.gmail.com` | Only needed for email OTP |
| `SMTP_PORT` | No | `587` | |
| `SMTP_USER` | No | — | Gmail address |
| `SMTP_PASS` | No | — | Gmail App Password (not account password) |

---

## Production Hardening Checklist

Work through this list before exposing DocuDex to the internet.

### Secrets & credentials

- [ ] Replace `JWT_SECRET` with a random 64-char string:
  ```bash
  openssl rand -hex 32
  ```
- [ ] Replace `POSTGRES_PASSWORD` / `DB_PASSWORD` with a strong random password
- [ ] Remove default `demo@docudex.com` user or change its password
- [ ] Set `NODE_ENV=production`

### Networking

- [ ] Put Nginx or Caddy in front of both the frontend (port 80/443) and API (proxy `/api/`)
- [ ] Only expose ports 80 and 443 publicly — bind Postgres (5432) and Redis (6379) to `127.0.0.1` only:
  ```yaml
  # docker-compose.yml
  ports:
    - "127.0.0.1:5432:5432"
  ```
- [ ] Enable HTTPS (Caddy auto-TLS or Let's Encrypt via Certbot)
- [ ] Set `CORS_ORIGIN` to your exact production domain, not `*`

### Docker Compose (production overrides)

Create a `docker-compose.prod.yml` that overrides development defaults:

```yaml
services:
  backend:
    environment:
      NODE_ENV: production
      JWT_SECRET: <generated-secret>
      DB_PASSWORD: <strong-password>
      CORS_ORIGIN: "https://your-domain.com"

  postgres:
    ports:
      - "127.0.0.1:5432:5432"   # not exposed publicly
    environment:
      POSTGRES_PASSWORD: <strong-password>

  redis:
    ports:
      - "127.0.0.1:6379:6379"   # not exposed publicly
    command: redis-server --requirepass <redis-password>
```

Run with:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Persistence & backups

- [ ] Postgres data is in a named Docker volume (`postgres_data`). Back it up with:
  ```bash
  docker exec docudex-postgres pg_dump -U docudex docudex > backup_$(date +%F).sql
  ```
- [ ] Schedule automated backups with `cron` or a managed backup service
- [ ] Uploads volume (`uploads`) should be backed up or pointed to S3 (`STORAGE_TYPE=s3`)

### S3 file storage (recommended for production)

Set these in your production environment instead of using local disk:

```env
STORAGE_TYPE=s3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_S3_BUCKET=docudex-uploads
```

### Logging & monitoring

- [ ] Set up log aggregation (e.g. Loki + Grafana, or Datadog)
- [ ] Forward container logs: `docker compose logs -f` in development; production log driver in compose
- [ ] Add an uptime monitor (e.g. UptimeRobot) on `https://your-domain.com/api/v1/health`

---

## Deploying to a VPS / Cloud VM

Works on any Linux VM (Ubuntu 22.04+ recommended).

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# 2. Clone
git clone https://github.com/atreyakamat/DocuDex.git
cd DocuDex

# 3. Set production secrets
cp apps/backend/.env.example apps/backend/.env
# Edit .env — set strong JWT_SECRET, DB_PASSWORD, etc.

# 4. Build and start
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# 5. Seed demo user (optional)
docker exec docudex-backend node /app/create-demo-user.js

# 6. Install Caddy for HTTPS
sudo apt install caddy
# Edit /etc/caddy/Caddyfile:
#   your-domain.com {
#     reverse_proxy localhost:3000
#   }
sudo systemctl reload caddy
```

---

## Deploying to a Managed Platform

### Railway / Render

1. Push to GitHub
2. Create services for `postgres`, `redis`, `backend`, `ai-service`, `frontend`
3. Set the env vars from the reference table above
4. Point `DB_HOST` / `REDIS_URL` to the managed service hostnames
5. The `frontend` nginx image proxies `/api/` internally — set `VITE_API_URL` to the backend's public URL at build time

### Docker Hub + Watchtower (auto-updates)

```bash
# Tag and push images
docker tag docudex-backend youruser/docudex-backend:latest
docker push youruser/docudex-backend:latest

# On the server — Watchtower polls and redeploys automatically
docker run -d --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --interval 300
```

---

## Port Conflict Reference

Default host ports may conflict on developer machines. Change the **left** number in `ports:` to any free port — the internal service ports stay the same.

| Service | Default host port | Internal port | Common conflict |
|---------|-------------------|---------------|-----------------|
| Frontend | `3000` | `80` | Create React App, other web servers |
| Backend | `5001` | `5000` | IIS Express, AirPlay (macOS) |
| AI Service | `8000` | `8000` | Django, FastAPI dev servers |
| Postgres | `5433` | `5432` | Local Postgres installation |
| Redis | `6380` | `6379` | Local Redis, Docker Desktop's internal Redis |

Example — change backend host port to `5002`:
```yaml
# docker-compose.yml
backend:
  ports:
    - "5002:5000"
```

---

## Troubleshooting

### Backend crashes with `ECONNREFUSED` (DB connection)

The backend container started before Postgres was ready. The `depends_on: condition: service_healthy` in `docker-compose.yml` prevents this, but if it happens:

```bash
docker restart docudex-backend
```

Also check `DB_HOST` is `postgres` (Docker service name), not `localhost`, inside the container.

### Login returns 401 after first setup

The password hash may have been corrupted by shell variable interpolation. Re-run the seed script (see [Seed the Demo User](#seed-the-demo-user)).

### Login returns "Too many authentication attempts"

The Express in-memory rate limiter tripped. Reset it by restarting the backend:

```bash
docker restart docudex-backend
```

For production, configure a Redis-backed rate limiter so restarts aren't required.

### Port already allocated

Find and free the conflicting process, or remap to a different host port (see [Port Conflict Reference](#port-conflict-reference)):

```powershell
# Windows — find what's using port 5000
Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Get-Process -Id $_.OwningProcess }
```

```bash
# Linux/macOS
lsof -i :5000
```

### View live logs

```bash
docker compose logs -f               # all services
docker compose logs -f backend       # backend only
docker compose logs -f --tail=50 ai  # last 50 lines of AI service
```

### Rebuild a single service after code changes

```bash
docker compose up --build -d backend
```

### Full reset (wipe all data)

```bash
docker compose down -v   # removes containers AND volumes (data is deleted)
docker compose up --build -d
```
