# DocuDex — AI-Powered Document Management System

A full-stack monorepo application for intelligent document storage, classification, and workflow management.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, Zustand |
| Backend | Node.js, Express, TypeScript, PostgreSQL, Redis, JWT |
| AI Service | Python, FastAPI, Tesseract OCR |
| Infrastructure | Docker, Docker Compose |

## Project Structure

```
DocuDex/
├── apps/
│   ├── frontend/         # React SPA (port 3000)
│   ├── backend/          # Express REST API (port 5000)
│   └── ai-service/       # FastAPI AI processing (port 8000)
├── packages/
│   └── shared-types/     # Shared TypeScript types
├── docker-compose.yml
└── package.json          # npm workspaces root
```

## Quick Start (Development)

### 1. Start infrastructure
```bash
docker compose up postgres redis -d
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run all services concurrently
```bash
npm run dev
```

Or run individually:
```bash
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:5000
```

### 4. Run AI service (optional — backend degrades gracefully without it)
```bash
cd apps/ai-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Full Docker Deploy

```bash
docker compose up --build
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- AI Service: http://localhost:8000
- Health: http://localhost:5000/health

## Environment Variables

Copy `.env.example` to `.env` in `apps/backend/`:
```bash
cp apps/backend/.env.example apps/backend/.env
```

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` — Change before production!
- `AI_SERVICE_URL` — AI service endpoint

## API Overview

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET  /api/v1/auth/me`

### Documents
- `GET    /api/v1/documents` — list with filters
- `POST   /api/v1/documents/upload` — single file
- `POST   /api/v1/documents/upload/bulk` — multiple files
- `GET    /api/v1/documents/:id`
- `PATCH  /api/v1/documents/:id`
- `DELETE /api/v1/documents/:id`
- `GET    /api/v1/documents/:id/download`
- `GET    /api/v1/documents/stats`

### Workflows
- `GET  /api/v1/workflows/templates`
- `POST /api/v1/workflows` — start workflow
- `GET  /api/v1/workflows` — my instances

### Notifications
- `GET   /api/v1/notifications`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/read-all`

## Features

- **AI Document Classification** — automatic type/category detection via OCR + keyword rules
- **Field Extraction** — structured data extracted from Aadhaar, PAN, Passport, etc.
- **Expiry Tracking** — automated cron job flags expiring documents 30/7 days before
- **Workflow Templates** — guided checklists for Home Loan, Passport, GST, DL, etc.
- **JWT Auth** — access + refresh token rotation with Redis blacklist
- **Bulk Upload** — drag-and-drop multi-file upload with progress
