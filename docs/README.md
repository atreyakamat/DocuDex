# DocuDex — AI-Powered Document Management System

<p align="center">
  <strong>Intelligent document storage, OCR classification, and workflow management</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.111+-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-ISC-green" alt="License" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (Local Development)](#quick-start-local-development)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [AI / OCR Pipeline](#ai--ocr-pipeline)
- [Frontend Pages](#frontend-pages)
- [Workflow Templates](#workflow-templates)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**DocuDex** is a full-stack monorepo application for managing personal and business documents with AI-powered intelligence. Upload any document (PDF, image, DOCX) and the system automatically:

1. **Performs OCR** — extracts text from scanned images and PDFs via Tesseract
2. **Classifies** — identifies document type (Aadhaar, PAN, Passport, etc.) using keyword rules
3. **Extracts fields** — pulls structured data like names, ID numbers, dates
4. **Generates a summary** — produces a concise AI-generated overview of the document contents
5. **Tracks expiry** — monitors expiry dates and sends alerts 30/7 days before

---

## Features

| Feature | Description |
|---|---|
| **AI Document Classification** | Automatic type & category detection via OCR + keyword rules |
| **OCR Text Extraction** | Tesseract-powered text extraction from images and PDFs |
| **AI Summary Generation** | Automatic concise summary of document contents after OCR |
| **Field Extraction** | Structured data extracted from Aadhaar, PAN, Passport, DL, Voter ID, Bank Statements, ITR, Salary Slips |
| **Expiry Tracking** | Automated cron job flags documents 90/30/7 days before expiry |
| **Workflow Templates** | Guided checklists for Home Loan, Business Incorporation, Passport Renewal, GST Registration, Driving License |
| **JWT Authentication** | Access + refresh token rotation with Redis-backed blacklist |
| **Document Sharing** | Time-limited shareable links with optional recipient email |
| **Bulk Upload** | Drag-and-drop multi-file upload with per-file progress |
| **Real-time Notifications** | Polling-based notification bell with mark-as-read |
| **Search & Filters** | Full-text search across document names, categories, statuses |
| **Star / Organize** | Star important documents, organize into folders |
| **Responsive UI** | Tailwind CSS design with sidebar navigation |

---

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Frontend   │─────▶│   Backend    │─────▶│   AI Service    │
│  React SPA   │ API  │  Express API │ HTTP │  FastAPI + OCR  │
│  Port 5173   │◀─────│  Port 5000   │◀─────│  Port 8000      │
└─────────────┘      └──────┬───────┘      └─────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
               ┌────▼────┐   ┌─────▼────┐
               │PostgreSQL│   │  Redis   │
               │Port 5432 │   │Port 6379 │
               └──────────┘   └──────────┘
```

**Request flow for document upload:**

```
User uploads file
    → Frontend sends POST /api/v1/documents/upload
    → Backend saves file to disk, creates DB record (status: PROCESSING)
    → Backend fires async call to AI Service (/process)
    → AI Service: OCR → Classify → Extract → Summarize
    → Backend updates DB with classification, fields, and summary
    → Frontend polls/refetches to show updated metadata & summary
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, TypeScript, Tailwind CSS 3.4, TanStack React Query v5, Zustand v4, React Router v6, react-hook-form, react-dropzone, lucide-react, date-fns |
| **Backend** | Node.js 20, Express 4, TypeScript, PostgreSQL 16 (pg), Redis 7 (ioredis), JWT (jsonwebtoken), multer, winston, node-cron, express-validator, helmet, cors |
| **AI Service** | Python 3.11+, FastAPI, Tesseract OCR (pytesseract), Pillow, Pydantic v2, httpx |
| **Shared Types** | TypeScript package (`@docudex/shared-types`) consumed by both frontend & backend |
| **Infrastructure** | Docker, Docker Compose, nginx (production frontend serving) |

---

## Project Structure

```
DocuDex/
├── apps/
│   ├── frontend/                 # React SPA
│   │   ├── src/
│   │   │   ├── components/       # Reusable UI components
│   │   │   │   ├── documents/    # DocumentCard, Grid, Viewer, ShareDialog, UploadZone
│   │   │   │   ├── layout/       # Header, Layout, Sidebar
│   │   │   │   └── ui/           # Toast notifications
│   │   │   ├── pages/            # Route pages (Dashboard, Documents, Workflows, etc.)
│   │   │   ├── services/         # API client (axios)
│   │   │   ├── store/            # Zustand stores (auth, toast)
│   │   │   └── utils/            # Helpers (cn, format)
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── vite.config.ts
│   │
│   ├── backend/                  # Express REST API
│   │   ├── src/
│   │   │   ├── config/           # database, env, redis
│   │   │   ├── controllers/      # auth, document controllers
│   │   │   ├── middleware/       # auth, errorHandler, upload
│   │   │   ├── routes/           # auth, documents, folders, workflows, notifications, shares
│   │   │   ├── services/         # auth, document, AI service proxy
│   │   │   └── utils/            # jwt, logger
│   │   ├── .env.example
│   │   └── Dockerfile
│   │
│   └── ai-service/               # FastAPI AI processing
│       ├── app/
│       │   ├── routes/           # health, process
│       │   └── services/         # ocr, classifier, extractor, summarizer
│       ├── main.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   └── shared-types/             # Shared TypeScript interfaces
│       └── src/index.ts
│
├── docker-compose.yml
├── tsconfig.base.json
└── package.json                  # npm workspaces root
```

---

## Prerequisites

- **Node.js** ≥ 18 (recommended: 20 LTS)
- **npm** ≥ 9
- **Python** ≥ 3.11
- **PostgreSQL** 14+ (or Docker)
- **Redis** 6+ (optional — app degrades gracefully without it)
- **Tesseract OCR** (optional — required for image OCR; installed automatically in Docker)

### Installing Tesseract locally (optional)

```bash
# macOS
brew install tesseract

# Ubuntu / Debian
sudo apt-get install tesseract-ocr tesseract-ocr-eng

# Windows — download installer from:
# https://github.com/UB-Mannheim/tesseract/wiki
```

---

## Quick Start (Local Development)

### 1. Clone the repository

```bash
git clone https://github.com/atreyakamat/DocuDex.git
cd DocuDex
```

### 2. Install npm dependencies

```bash
npm install
```

### 3. Build shared types

```bash
npx tsc --project packages/shared-types/tsconfig.json
```

### 4. Set up the database

**Option A — Docker (recommended):**
```bash
docker run -d --name docudex-pg \
  -e POSTGRES_USER=docudex \
  -e POSTGRES_PASSWORD=docudex_pass \
  -e POSTGRES_DB=docudex \
  -p 5432:5432 \
  postgres:16-alpine
```

**Option B — Existing PostgreSQL:**
```sql
CREATE USER docudex WITH PASSWORD 'docudex_pass';
CREATE DATABASE docudex OWNER docudex;
```

### 5. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env if your DB credentials differ
```

### 6. Start the backend

```bash
npm run dev:backend
# Server starts at http://localhost:5000
# Database tables are auto-created on first start
```

### 7. Start the frontend

```bash
npm run dev:frontend
# Opens at http://localhost:5173
# API requests are proxied to :5000 via Vite
```

### 8. Start the AI service (optional)

```bash
cd apps/ai-service
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> **Note:** If the AI service is not running, document uploads still work — documents stay in PROCESSING status with no classification/summary. No errors occur.

### 9. Or run everything together

```bash
npm run dev
# Runs backend + frontend concurrently
```

---

## Docker Deployment

### Full stack with Docker Compose

```bash
docker compose up --build
```

This starts **5 services**:

| Service | Port | Description |
|---|---|---|
| `postgres` | 5432 | PostgreSQL 16 database |
| `redis` | 6379 | Redis 7 cache (token blacklist) |
| `backend` | 5000 | Express API server |
| `ai-service` | 8000 | FastAPI + Tesseract OCR |
| `frontend` | 3000 | nginx serving the React SPA |

Access the app at **http://localhost:3000**

### Only infrastructure (for local dev)

```bash
docker compose up postgres redis -d
# Then run backend/frontend locally with npm
```

### Tear down

```bash
docker compose down -v     # removes volumes too
```

---

## Environment Variables

Create `apps/backend/.env` from the example:

```bash
cp apps/backend/.env.example apps/backend/.env
```

| Variable | Default | Required | Description |
|---|---|---|---|
| `NODE_ENV` | `development` | No | Environment mode |
| `PORT` | `5000` | No | Backend server port |
| `DATABASE_URL` | — | **Yes** | PostgreSQL connection string |
| `DB_HOST` | `localhost` | Yes | Database host |
| `DB_PORT` | `5432` | Yes | Database port |
| `DB_NAME` | `docudex` | Yes | Database name |
| `DB_USER` | `docudex` | Yes | Database user |
| `DB_PASSWORD` | `docudex_pass` | Yes | Database password |
| `REDIS_URL` | — | No | Redis URL (omit to skip Redis) |
| `JWT_SECRET` | — | **Yes** | JWT signing secret (change in prod!) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | No | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | No | Refresh token expiry |
| `STORAGE_TYPE` | `local` | No | File storage type |
| `UPLOAD_DIR` | `./uploads` | No | Local upload directory |
| `MAX_FILE_SIZE` | `52428800` | No | Max file size (50MB) |
| `AI_SERVICE_URL` | `http://localhost:8000` | No | AI service endpoint |
| `FRONTEND_URL` | `http://localhost:5173` | No | CORS origin |
| `SMTP_HOST` | — | No | Email host (for OTP) |
| `SMTP_PORT` | — | No | Email port |
| `SMTP_USER` | — | No | Email username |
| `SMTP_PASS` | — | No | Email password |

---

## API Reference

Base URL: `http://localhost:5000/api/v1`

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create account |
| `POST` | `/auth/login` | No | Login, receive tokens |
| `POST` | `/auth/refresh` | No | Refresh access token |
| `POST` | `/auth/logout` | Yes | Logout, blacklist token |
| `GET` | `/auth/me` | Yes | Get current user |
| `PUT` | `/auth/profile` | Yes | Update profile |
| `PUT` | `/auth/change-password` | Yes | Change password |
| `POST` | `/auth/send-otp` | Yes | Send email OTP |
| `POST` | `/auth/verify-otp` | Yes | Verify email OTP |

### Documents

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/documents/upload` | Yes | Upload single document |
| `POST` | `/documents/upload/bulk` | Yes | Upload multiple documents |
| `GET` | `/documents` | Yes | List documents (with filters) |
| `GET` | `/documents/stats` | Yes | Get document statistics |
| `GET` | `/documents/:id` | Yes | Get single document |
| `PATCH` | `/documents/:id` | Yes | Update document metadata |
| `DELETE` | `/documents/:id` | Yes | Delete document |
| `GET` | `/documents/:id/download` | Yes | Download file |
| `PATCH` | `/documents/:id/star` | Yes | Toggle star |

**Query parameters for GET `/documents`:**

| Param | Type | Description |
|---|---|---|
| `query` | string | Search by name, holder, doc number |
| `category` | string | Filter by category (IDENTITY, FINANCIAL, etc.) |
| `status` | string | Filter by status (PROCESSING, CURRENT, EXPIRING_SOON, EXPIRED) |
| `documentType` | string | Filter by document type |
| `isStarred` | boolean | Filter starred documents |
| `folderId` | string | Filter by folder |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

### Document Sharing

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/shares` | Yes | Create share link |
| `GET` | `/shares/access/:token` | No | Access shared document |

### Folders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/folders` | Yes | Create folder |
| `GET` | `/folders` | Yes | List folders |
| `PUT` | `/folders/:id` | Yes | Rename folder |
| `DELETE` | `/folders/:id` | Yes | Delete folder |

### Workflows

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/workflows/templates` | Yes | List workflow templates |
| `POST` | `/workflows` | Yes | Start a workflow |
| `GET` | `/workflows` | Yes | List my workflow instances |

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications` | Yes | List notifications |
| `PATCH` | `/notifications/:id/read` | Yes | Mark one as read |
| `PATCH` | `/notifications/read-all` | Yes | Mark all as read |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Backend health check |

---

## AI / OCR Pipeline

The AI service (`apps/ai-service`) processes documents through a 4-stage pipeline:

### 1. OCR — Text Extraction

- **Images** (JPG, PNG, TIFF, WebP): Processed via **Tesseract OCR** using `pytesseract`
- **PDFs**: Basic text extraction from PDF streams (no heavy dependencies)
- Returns: raw text + confidence score (0–1)
- Falls back gracefully if Tesseract is not installed

### 2. Classification — Document Type Detection

Rule-based keyword matching against 12 document types:

| Type | Category | Keywords |
|---|---|---|
| `AADHAAR` | ID | aadhaar, uid, uidai, unique identification |
| `PAN` | ID | pan, permanent account number, income tax |
| `PASSPORT` | ID | passport, republic of india, nationality |
| `DRIVING_LICENSE` | ID | driving licence, dl no, transport authority |
| `VOTER_ID` | ID | voter, election commission, epic |
| `BIRTH_CERTIFICATE` | ID | birth certificate, municipal |
| `BANK_STATEMENT` | Financial | bank statement, opening balance, closing balance |
| `ITR` | Financial | income tax return, assessment year |
| `SALARY_SLIP` | Financial | salary slip, pay slip, net salary |
| `PROPERTY_DEED` | Property | sale deed, conveyance, sub-registrar |
| `DEGREE_CERTIFICATE` | Educational | degree, bachelor, master, university |
| `MEDICAL_REPORT` | Medical | medical report, prescription, diagnosis |

Confidence formula: `min(0.5 + matched_keywords × 0.15, 0.95)`

### 3. Extraction — Structured Field Extraction

Per-document-type regex extractors pull:

| Document | Extracted Fields |
|---|---|
| Aadhaar | aadhaarNumber, dateOfBirth, name |
| PAN | panNumber, name, dateOfBirth |
| Passport | passportNumber, dateOfBirth, expiryDate, name |
| Driving License | dlNumber, expiryDate, name |
| Voter ID | epicNumber, name |
| Bank Statement | accountNumber, ifscCode |
| ITR | assessmentYear, panNumber |
| Salary Slip | netSalary, month |

### 4. Summary — AI Document Summary

After OCR and extraction, the **summarizer** generates a 2–4 sentence summary:

- **Classification sentence** — document type + confidence
- **Key fields** — holder name, document number, date of birth
- **Date information** — issue date and/or expiry date
- **Notable OCR content** — most informative lines from the raw text

**Example output:**
> This document has been identified as a **PAN Card** (confidence 80%). Key details: the holder name is **Rajesh Kumar**, document number **ABCDE1234F**. Additional info: INCOME TAX DEPARTMENT; Date of Birth 15/06/1985.

---

## Frontend Pages

| Page | Route | Description |
|---|---|---|
| **Landing** | `/` | Public marketing page with feature showcase |
| **Login** | `/login` | Email/password login form |
| **Register** | `/register` | Account registration with name, email, password |
| **Dashboard** | `/dashboard` | Stats cards, recent documents, expiry alerts |
| **Documents** | `/documents` | Document grid with search, filters, upload, viewer |
| **Workflows** | `/workflows` | Browse templates, start workflows, track progress |
| **Settings** | `/settings` | Profile, password, notification preferences |
| **Not Found** | `*` | 404 page |

### Key Components

- **UploadZone** — Drag & drop upload with multi-file progress
- **DocumentCard** — Card with type, status badge, AI summary snippet, actions
- **DocumentViewer** — Full-screen modal with preview, metadata, AI summary, extracted fields
- **ShareDialog** — Generate time-limited share links
- **Header** — Search bar, notification bell with popup
- **Sidebar** — Navigation with user profile

---

## Workflow Templates

DocuDex includes 5 pre-built workflow templates:

| Workflow | Required Documents | Estimated Time |
|---|---|---|
| **Home Loan Application** | PAN, Aadhaar, Salary Slips, Bank Statements, Property Deed, ITR | 2–4 weeks |
| **Business Incorporation** | PAN, Aadhaar, Address Proof, MOA/AOA, Board Resolution | 1–2 weeks |
| **Passport Renewal** | Passport, Aadhaar, Address Proof, Photo | 1–3 weeks |
| **GST Registration** | PAN, Aadhaar, Photo, Address Proof, Bank Statement, Incorporation Certificate | 3–7 days |
| **Driving License Renewal** | DL, Aadhaar, Address Proof, Medical Certificate, Photo | 1–2 weeks |

---

## Database Schema

The backend auto-creates these tables on first start:

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique |
| phone | VARCHAR(20) | Optional |
| full_name | VARCHAR(255) | |
| password_hash | VARCHAR(255) | bcrypt |
| role | VARCHAR(20) | `user` or `admin` |
| is_email_verified | BOOLEAN | |
| mfa_enabled | BOOLEAN | |
| created_at / updated_at | TIMESTAMPTZ | |

### `documents`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| folder_id | UUID | FK → folders (nullable) |
| file_name / original_name | VARCHAR | |
| mime_type | VARCHAR(100) | |
| file_size | BIGINT | |
| storage_key | VARCHAR(1000) | |
| status | VARCHAR(30) | PROCESSING, CURRENT, EXPIRING_SOON, EXPIRED |
| document_type | VARCHAR(50) | AI-classified |
| category | VARCHAR(30) | AI-classified |
| issue_date / expiry_date | DATE | Extracted by AI |
| holder_name | VARCHAR(255) | Extracted by AI |
| document_number | VARCHAR(100) | Extracted by AI |
| tags | TEXT[] | User-defined |
| extracted_fields | JSONB | All AI-extracted fields |
| classification_confidence | FLOAT | 0–1 |
| summary | TEXT | AI-generated document summary |
| is_starred | BOOLEAN | |
| created_at / updated_at | TIMESTAMPTZ | |

### Other tables
- **`folders`** — id, user_id, name, parent_id
- **`notifications`** — id, user_id, type, title, message, is_read, document_id
- **`workflow_instances`** — id, user_id, template_id/name, status, current_step, total_steps
- **`audit_logs`** — id, user_id, action, entity_type/id, details
- **`document_shares`** — id, document_id, user_id, token, expires_at, access_count

---

## Troubleshooting

### "Cannot find module '@docudex/shared-types'"
Build the shared types package first:
```bash
npx tsc --project packages/shared-types/tsconfig.json
```

### Backend can't connect to PostgreSQL
Ensure PostgreSQL is running and the connection string in `.env` is correct:
```bash
psql -h localhost -U docudex -d docudex
```

### AI service not classifying documents
1. Check the AI service is running: `curl http://localhost:8000/health`
2. If using images, ensure Tesseract is installed: `tesseract --version`
3. Without Tesseract, OCR returns empty text — classification still works on filenames

### Frontend shows blank page
Check that the Vite dev server is running and the backend is accessible:
```bash
npm run dev:frontend
curl http://localhost:5000/health
```

### Redis connection warnings
Redis is **optional**. Without it:
- Refresh tokens cannot be revoked on logout (stateless JWT fallback)
- Email OTP verification is unavailable

### Docker build fails for frontend
The frontend Dockerfile needs the monorepo root as build context. Ensure `docker-compose.yml` uses:
```yaml
frontend:
  build:
    context: .
    dockerfile: apps/frontend/Dockerfile
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run backend + frontend concurrently |
| `npm run dev:frontend` | Start Vite dev server (port 5173) |
| `npm run dev:backend` | Start backend with ts-node-dev (port 5000) |
| `npm run build` | Build backend + frontend for production |
| `npm run build:frontend` | Build frontend (tsc + vite build) |
| `npm run build:backend` | Build backend (tsc) |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

ISC License — see [package.json](package.json) for details.
