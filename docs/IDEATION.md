# DocuDex — Ideation & Architecture Deep-Dive

> **Version**: 2.0 &nbsp;|&nbsp; **Date**: February 2026 &nbsp;|&nbsp; **Status**: Production-Ready

---

## Table of Contents

1. [Vision & Problem Statement](#vision--problem-statement)
2. [How DocuDex Works (End-to-End Flow)](#how-docudex-works-end-to-end-flow)
3. [Architecture Overview](#architecture-overview)
4. [AI / OCR Pipeline — Step by Step](#ai--ocr-pipeline--step-by-step)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Security Design](#security-design)
8. [Robustness & Resilience Features](#robustness--resilience-features)
9. [Guided Tour System](#guided-tour-system)
10. [Seed Data & Demo Mode](#seed-data--demo-mode)
11. [Database Design & Indexing Strategy](#database-design--indexing-strategy)
12. [Deployment Architecture](#deployment-architecture)
13. [Future Roadmap & Ideation](#future-roadmap--ideation)
14. [Performance Considerations](#performance-considerations)
15. [Testing Strategy](#testing-strategy)

---

## Vision & Problem Statement

### The Problem

Indian citizens and businesses deal with **dozens of critical documents** — Aadhaar, PAN, Passport, Driving License, Bank Statements, ITR, Property Deeds, GST certificates, and more. These documents:

- Are stored in scattered physical and digital locations
- Have **expiry dates** that are easily forgotten (passport, DL, insurance)
- Need to be collected in specific combinations for processes like **home loans** or **passport renewal**
- Have key data (holder name, document number, dates) that must be manually looked up each time

### The Solution

DocuDex is an **AI-powered document vault** that:

1. **Reads** every uploaded document using OCR
2. **Classifies** it automatically (Aadhaar, PAN, Passport, etc.)
3. **Extracts** structured fields (name, ID number, dates, amounts)
4. **Generates** a concise AI summary
5. **Tracks** expiry dates and sends proactive alerts
6. **Guides** users through real-world workflows with step-by-step checklists

---

## How DocuDex Works (End-to-End Flow)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        USER UPLOADS A DOCUMENT                       │
│                  (Drag & drop · PDF, JPG, PNG, DOCX)                 │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  STEP 1: File Storage                                                │
│  • File saved to disk with UUID filename                             │
│  • Database record created with status = "PROCESSING"                │
│  • Original filename, MIME type, and size recorded                   │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  STEP 2: OCR Text Extraction (AI Service — Tesseract)                │
│  • Image files → direct Tesseract OCR                                │
│  • PDF files → convert to images → OCR each page                     │
│  • DOCX files → extract embedded text directly                       │
│  • Result: Full raw text of the document                             │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  STEP 3: Document Classification (Keyword-Rule Engine)               │
│  • Score each document type by counting keyword matches              │
│    e.g., "PERMANENT ACCOUNT NUMBER" → PAN, "AADHAAR" → Aadhaar     │
│  • Confidence = top_score / total_keyword_matches                    │
│  • Category assigned: IDENTITY, FINANCIAL, EDUCATIONAL, etc.         │
│  • Fallback: "OTHER" if no keywords match                            │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  STEP 4: Field Extraction (Regex-based)                              │
│  • Aadhaar → 4-4-4 digit pattern, name after "Name:"                │
│  • PAN → XXXXX9999X pattern, name lines                              │
│  • Passport → [A-Z][0-9]{7} pattern, issue/expiry dates             │
│  • DL → state prefix + numbers, validity dates                       │
│  • Bank Statement → account number, IFSC, balance                    │
│  • Salary Slip → net pay, gross salary, deductions                   │
│  • ITR → PAN number, assessment year, total income                   │
│  • And more for each supported document type                         │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  STEP 5: AI Summary Generation                                       │
│  • Takes extracted text + classification + fields                    │
│  • Selects notable lines (keywords: total, name, date, amount)       │
│  • Generates 2-4 sentence summary with bold highlights               │
│  • Example: "This is a **PAN Card** (confidence 92%).                │
│    Holder: **Aditya Sharma**, Number: **BXYPK1234D**."              │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  STEP 6: Database Update                                             │
│  • Status changed from "PROCESSING" → "CURRENT" or "EXPIRED"        │
│  • All extracted fields stored as JSONB                               │
│  • Summary stored as TEXT                                            │
│  • Expiry date checked: if within 90 days → "EXPIRING_SOON"         │
│  • If already past → "EXPIRED"                                       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  STEP 7: User Sees Results                                           │
│  • Document card shows type badge, holder name, status               │
│  • Document viewer shows full extracted fields and AI summary        │
│  • Dashboard statistics update in real-time                          │
│  • Expiry alerts show countdown timer                                │
└──────────────────────────────────────────────────────────────────────┘
```

### The Nightly Expiry Cron Job

A `node-cron` job runs every night at midnight:

1. Queries all documents with expiry date within 90 days → marks `EXPIRING_SOON`
2. Queries all documents with expiry date in the past → marks `EXPIRED`
3. Creates notification records for documents expiring within 30 and 7 days
4. Users see these notifications in their bell icon

---

## Architecture Overview

```
                    ┌──────────────┐
                    │   Browser    │
                    │  React SPA   │
                    └──────┬───────┘
                           │ HTTPS
                    ┌──────▼───────┐
                    │    nginx     │  ← Static files + API reverse proxy
                    │  Port 3000   │
                    └──────┬───────┘
                           │ /api/* →
                    ┌──────▼───────┐        ┌─────────────────┐
                    │   Backend    │───────▶│   AI Service    │
                    │  Express.js  │  POST  │  FastAPI + OCR  │
                    │  Port 5000   │◀───────│  Port 8000      │
                    └──────┬───────┘        └─────────────────┘
                           │
                    ┌──────┴───────┐
               ┌────▼────┐   ┌────▼────┐
               │PostgreSQL│   │  Redis  │
               │Port 5432 │   │Port 6379│
               └──────────┘   └─────────┘
```

### Service Responsibilities

| Service | Responsibility |
|---------|---------------|
| **Frontend** (React) | SPA UI, client-side routing, API calls via Axios, state management with Zustand + TanStack Query |
| **nginx** | Serves static built files, proxies `/api/*` to backend, handles CORS |
| **Backend** (Express) | REST API, JWT auth, file upload/storage, database CRUD, cron jobs, calls AI service |
| **AI Service** (FastAPI) | OCR text extraction, document classification, field extraction, summary generation |
| **PostgreSQL** | Primary data store — users, documents, notifications, workflows, audit logs |
| **Redis** | Token blacklist for instant logout, rate limiting backing store |

---

## AI / OCR Pipeline — Step by Step

### OCR Engine (Tesseract)

```python
# Simplified flow in apps/ai-service/app/services/ocr.py
def extract_text(file_bytes, mime_type):
    if mime_type in ("image/jpeg", "image/png", "image/tiff"):
        image = Image.open(BytesIO(file_bytes))
        return pytesseract.image_to_string(image)
    elif mime_type == "application/pdf":
        images = convert_from_bytes(file_bytes)
        return "\n".join(pytesseract.image_to_string(img) for img in images)
    elif mime_type == "application/vnd.openxmlformats...":
        return extract_docx_text(file_bytes)
```

### Classifier (Keyword Scoring)

Each document type has a list of keywords with weights:

```python
DOCUMENT_KEYWORDS = {
    "AADHAAR": ["aadhaar", "unique identification", "uid", "uidai", "enrolment"],
    "PAN": ["permanent account number", "pan", "income tax department"],
    "PASSPORT": ["passport", "republic of india", "travel document"],
    "DRIVING_LICENSE": ["driving licence", "motor vehicle", "transport"],
    ...
}
```

The classifier counts matches, calculates confidence, and returns the highest-scoring type.

### Field Extractor (Regex)

Type-specific regex patterns pull out structured data:

```python
# Aadhaar UID: 4-4-4 digit pattern
r"\b\d{4}\s\d{4}\s\d{4}\b"

# PAN: 5 letters + 4 digits + 1 letter
r"\b[A-Z]{5}\d{4}[A-Z]\b"

# Passport: 1 letter + 7 digits
r"\b[A-Z]\d{7}\b"
```

### Summarizer

The summarizer takes the full pipeline output and generates a human-readable summary:

```
"This document has been identified as a **PAN Card** (confidence 92%).
Key details: the holder name is **Aarav Sharma**, document number **BXYPK1234D**."
```

---

## Frontend Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 | Component-based UI |
| Bundler | Vite 5 | Fast HMR, build optimization |
| Language | TypeScript | End-to-end type safety |
| Styling | Tailwind CSS 3.4 | Utility-first CSS |
| Routing | React Router v6 | Client-side navigation |
| Server State | TanStack React Query v5 | Caching, refetching, loading states |
| Client State | Zustand v4 | Lightweight stores (auth, toast, tour) |
| Forms | react-hook-form | Performant form handling |
| HTTP | Axios | API calls with interceptors |
| Icons | lucide-react | Consistent icon library |

### Component Hierarchy

```
App.tsx
├── ErrorBoundary (global)
├── ToastContainer
├── PublicRoute
│   ├── Landing
│   ├── Login
│   └── Register
└── ProtectedLayout
    └── Layout
        ├── Sidebar (navigation + tour trigger)
        ├── Header (search + notifications)
        ├── WelcomeModal (first-time)
        ├── GuidedTour (spotlight overlay)
        └── <Outlet> (page content)
            ├── Dashboard
            ├── Documents
            │   ├── UploadZone
            │   ├── DocumentGrid
            │   │   └── DocumentCard
            │   ├── DocumentViewer
            │   └── ShareDialog
            ├── Workflows
            └── Settings
```

### State Management Strategy

| Store | Library | Purpose |
|-------|---------|---------|
| `authStore` | Zustand | User session, tokens, login/logout |
| `toastStore` | Zustand | Toast notifications queue |
| `tourStore` | Zustand | Guided tour state, step tracking, welcome modal |
| Server data | TanStack Query | Documents, stats, notifications, workflows |

### Robustness Features

1. **ErrorBoundary** — Wraps each route + the entire app. Catches React rendering errors, shows a recovery UI with "Try Again" and "Go to Dashboard" actions. Shows stack trace in development.

2. **Skeleton Loaders** — Instead of spinners, content areas show animated skeleton placeholders that match the layout of real content (`StatCardSkeleton`, `DocumentRowSkeleton`, `DocumentCardSkeleton`, `WorkflowCardSkeleton`).

3. **Empty States** — Contextual illustrations and CTAs when there's no data (`NoDocuments`, `NoSearchResults`, `NoWorkflows`, `NoExpiringDocs`, `NoRecentDocs`).

4. **Network Status** — Detects offline/online transitions and shows toast notifications so users know when connectivity is lost or restored.

5. **Auto Token Refresh** — Axios interceptor catches 401 responses, refreshes the access token using the refresh token, and retries the original request transparently.

---

## Backend Architecture

### API Design (RESTful)

```
POST   /api/v1/auth/register       — Create account
POST   /api/v1/auth/login          — Login, returns access + refresh tokens
POST   /api/v1/auth/refresh        — Rotate access token
POST   /api/v1/auth/logout         — Blacklist tokens
GET    /api/v1/auth/me             — Current user profile

POST   /api/v1/documents/upload    — Upload single document
POST   /api/v1/documents/upload/bulk — Upload multiple documents
GET    /api/v1/documents           — List with search, filter, pagination
GET    /api/v1/documents/stats     — Aggregate counts
GET    /api/v1/documents/:id       — Single document
PATCH  /api/v1/documents/:id       — Update metadata / star
DELETE /api/v1/documents/:id       — Soft delete
GET    /api/v1/documents/:id/download — File download

POST   /api/v1/documents/:id/share — Create share link
GET    /api/v1/documents/:id/shares — List shares
DELETE /api/v1/shares/:token       — Revoke share

GET    /api/v1/workflows/templates — Available workflow templates
GET    /api/v1/workflows           — User's active workflows
POST   /api/v1/workflows/start     — Start a workflow

GET    /api/v1/notifications       — User's notifications
PATCH  /api/v1/notifications/:id   — Mark read
POST   /api/v1/notifications/mark-all-read

GET    /health                     — Health check (DB + Redis status)
```

### Middleware Stack

```
Request → helmet → CORS → rate-limit → compression → JSON parser → morgan → auth → route handler → error handler
```

### Health Check (Enhanced)

The `/health` endpoint now reports:
- **API** status: always OK if responding
- **Database** status: runs `SELECT 1` against PostgreSQL
- **Redis** status: sends `PING` command
- **Uptime**: seconds since process start
- Returns `200` for healthy, `503` for degraded

---

## Security Design

### Authentication Flow

```
Register → bcrypt hash password → save to DB
Login → verify password → generate access token (15 min) + refresh token (7 days)
Request → Bearer token in Authorization header → JWT verification → inject userId
Refresh → verify refresh token → issue new access token
Logout → blacklist both tokens in Redis → immediate invalidation
```

### Security Layers

1. **Helmet** — Sets secure HTTP headers (CSP, HSTS, X-Frame-Options)
2. **CORS** — Strict origin allowlist
3. **Rate Limiting** — 200 requests per 15 min globally, 20 per 15 min on auth endpoints
4. **Input Validation** — express-validator on all endpoints (email, password strength, etc.)
5. **File Validation** — MIME type + extension checks, 50MB size limit via multer
6. **SQL Injection Prevention** — Parameterized queries throughout (no string concatenation)
7. **JWT Best Practices** — Short-lived access tokens, server-side token blacklist

---

## Robustness & Resilience Features

### Backend

| Feature | Implementation |
|---------|---------------|
| Connection pooling | `pg` Pool with max 20 connections, 30s idle timeout |
| Graceful shutdown | SIGTERM/SIGINT handlers close HTTP server, await pending requests |
| Structured logging | Winston with JSON format, log levels, file + console transports |
| Error propagation | Global error handler catches all uncaught errors, returns standardized JSON |
| Database initialization | Auto-creates all tables and indexes on startup with IF NOT EXISTS |
| Enhanced health check | Reports DB, Redis, uptime with `200` / `503` status |

### Frontend

| Feature | Implementation |
|---------|---------------|
| Error Boundary | Class component catches React render errors, shows recovery UI |
| Skeleton loading | Animated placeholder content matching real layout |
| Empty states | Contextual illustrations + CTAs when no data exists |
| Network monitoring | Online/offline event listeners with toast notifications |
| Auto-retry | TanStack Query retries failed requests with exponential backoff |
| Token rotation | Axios interceptor transparently refreshes expired access tokens |

### Database

| Feature | Implementation |
|---------|---------------|
| Indexes | 15 targeted indexes on frequently queried columns |
| Partial indexes | `WHERE is_starred = true` and `WHERE is_read = false` for hot paths |
| Cascading deletes | User deletion cascades to documents, notifications, workflows |
| JSONB fields | Flexible extracted_fields storage without schema migrations |

---

## Guided Tour System

### Architecture

The guided tour is a **zero-dependency, custom-built** spotlight overlay system:

```
tourStore (Zustand)
├── 12 steps with target selectors, content, route, icon
├── State: isActive, showWelcome, currentStep, hasCompletedTour
├── Actions: openWelcome, startTour, nextStep, prevStep, skipTour
└── Persists completion in localStorage

WelcomeModal
├── Gradient header with DocuDex branding
├── 4 feature highlights (AI, Expiry, Workflows, Summaries)
├── "Take the Tour" → starts tour | "Skip for now" → marks complete
└── Auto-shows on first login (1.2s delay)

GuidedTour
├── Full-screen overlay with clip-path spotlight cutout
├── Animated border highlight around target element
├── Rich tooltip with gradient header, icon, title, content
├── Progress bar (gradient fill)
├── Keyboard navigation (← → Escape)
├── Auto-navigates between routes (Dashboard → Documents → Workflows → Settings)
└── Target measurement via getBoundingClientRect + resize/scroll listeners
```

### Tour Steps

| # | Target | Title | What User Learns |
|---|--------|-------|-----------------|
| 1 | Sidebar | Your Command Center | Navigation overview |
| 2 | Dashboard link | Dashboard Overview | What the dashboard shows |
| 3 | Stats cards | Real-Time Statistics | Document count metrics |
| 4 | Recent docs | Recent Activity Feed | How recently uploaded docs appear |
| 5 | Expiry alerts | Never Miss an Expiry | How the 90/30/7 day alert system works |
| 6 | Search bar | Intelligent Search | OCR-indexed search capability |
| 7 | Notification bell | Stay Informed | Alert types and notification system |
| 8 | Documents link | Document Library | Filtering, starring, organization |
| 9 | Upload button | How Uploading Works | Full 5-step AI pipeline explained |
| 10 | Document grid | Browse & Manage | Card anatomy and actions |
| 11 | Workflows link | Guided Workflows | Real-world workflow checklists |
| 12 | Settings link | Your Preferences | Profile, password, notifications |

---

## Seed Data & Demo Mode

### Seed Script (`apps/backend/src/seed.ts`)

Creates a fully-populated demo environment:

- **1 demo user**: `demo@docudex.com` / `Demo@12345`
- **6 folders**: Identity Documents, Financial Records, Education, Property, Business, Utility Bills
- **100 documents** across 12 types:
  - Aadhaar, PAN, Passport, Driving License, Voter ID
  - Bank Statement, Salary Slip, ITR
  - Degree Certificate, Property Deed, GST Registration, Electricity Bill
- **Realistic data**: Indian names, document numbers (PAN: XXXXX9999X format), varied dates
- **Status distribution**: ~50% Current, ~20% Expiring Soon, ~15% Expired, ~15% No expiry
- **AI summaries**: Pre-generated summaries matching the AI pipeline output format
- **8 notifications**: Mix of expiry warnings, processing confirmations, workflow updates, system tips

### Usage

```bash
# Via npm script
npm run seed --workspace=apps/backend

# Via deploy script (runs automatically)
./deploy.sh
```

---

## Database Design & Indexing Strategy

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | email, password_hash, role, MFA fields |
| `folders` | Document organization | user_id, name, parent_id (nested) |
| `documents` | Core document store | user_id, status, type, category, expiry_date, extracted_fields (JSONB), summary |
| `notifications` | User alerts | user_id, type, title, message, is_read |
| `workflow_instances` | Active workflow tracking | user_id, template_id, current_step, total_steps |
| `audit_logs` | Action history | user_id, action, resource_type, metadata (JSONB) |
| `document_shares` | Shareable links | document_id, token, expires_at, access_count |

### Index Strategy (15 indexes)

```sql
-- Hot path: user's documents (every page load)
idx_documents_user_id       ON documents(user_id)
idx_documents_created_at    ON documents(created_at DESC)

-- Filtering
idx_documents_status        ON documents(status)
idx_documents_category      ON documents(category)
idx_documents_type          ON documents(document_type)

-- Expiry cron job
idx_documents_expiry        ON documents(expiry_date)

-- Search
idx_documents_holder        ON documents(holder_name)

-- Partial index: only starred docs (high selectivity)
idx_documents_starred       ON documents(user_id, is_starred) WHERE is_starred = true

-- Notifications
idx_notifications_user_id   ON notifications(user_id)
idx_notifications_unread    ON notifications(user_id, is_read) WHERE is_read = false

-- Other tables
idx_audit_logs_user_id      ON audit_logs(user_id)
idx_audit_logs_created_at   ON audit_logs(created_at DESC)
idx_document_shares_token   ON document_shares(token)
idx_workflow_instances_user  ON workflow_instances(user_id)
idx_folders_user            ON folders(user_id)
```

---

## Deployment Architecture

### Docker Compose (5 services)

```yaml
services:
  postgres:     # PostgreSQL 16 Alpine — data persistence via named volume
  redis:        # Redis 7 Alpine — in-memory token blacklist
  backend:      # Node.js 20 — Express API + cron jobs
  ai-service:   # Python 3.11 + Tesseract — OCR + classification
  frontend:     # nginx 1.25 — serves React SPA + proxies API
```

### One-Click Deploy

```bash
chmod +x deploy.sh && ./deploy.sh
```

The script:
1. Checks for Docker & Docker Compose
2. Builds all images in parallel
3. Starts all services (`docker compose up -d`)
4. Waits for PostgreSQL to accept connections
5. Waits for backend to initialize schema
6. Runs the seed script (100 documents + demo user)
7. Prints service URLs and demo credentials

---

## Future Roadmap & Ideation

### Phase 1 — Near Term (Planned)

| Feature | Description | Effort |
|---------|-------------|--------|
| **Full-text search (PostgreSQL tsvector)** | Index OCR text with `to_tsvector`, enable phrase search with `to_tsquery` | Medium |
| **Document versioning** | Track revisions when a user re-uploads (passport renewal → v2) | Medium |
| **Folder sharing** | Share entire folders, not just single documents | Small |
| **Email notifications** | Send expiry alerts via SMTP (config already exists in env.ts) | Small |
| **Bulk download** | Select multiple documents, download as ZIP | Small |
| **Dark mode** | Tailwind dark: variants already partially set up | Small |

### Phase 2 — Medium Term

| Feature | Description | Effort |
|---------|-------------|--------|
| **DigiLocker integration** | Import documents directly from India's DigiLocker | Large |
| **ML-based classification** | Replace keyword rules with a trained BERT/LayoutLM model for 95%+ accuracy | Large |
| **OCR language support** | Add Hindi, Marathi, Tamil OCR via Tesseract language packs | Medium |
| **Calendar integration** | Sync expiry dates to Google Calendar / Outlook | Medium |
| **Webhook notifications** | POST events to external systems (Slack, Teams, Zapier) | Medium |
| **Mobile app (React Native)** | Camera-based document scanning + push notifications | Large |

### Phase 3 — Long Term Vision

| Feature | Description |
|---------|-------------|
| **AI-powered form filling** | Auto-populate government forms (passport renewal, bank KYC) using extracted fields |
| **Document similarity** | Detect duplicate or related documents using vector embeddings |
| **Smart reminders** | Context-aware reminders ("Your passport expires in 6 months — typical renewal takes 3 months, start now") |
| **Collaborative workspaces** | Family/team accounts with role-based access |
| **Blockchain verification** | Optional document hash verification for authenticity |
| **Plugin ecosystem** | Allow third-party integrations (banking APIs, government APIs) |

---

## Performance Considerations

### Current Optimizations

1. **Database connection pooling** — max 20 connections, 2s connection timeout
2. **Compression** — gzip for all API responses
3. **Static file caching** — nginx serves built frontend with cache headers
4. **Lazy loading** — React Router code-split per page
5. **TanStack Query caching** — server state cached in memory, stale-while-revalidate
6. **Partial indexes** — Only index rows that match common predicates (starred, unread)
7. **Skeleton loading** — Perceived performance improvement during data fetching

### Bottleneck Analysis

| Area | Bottleneck | Mitigation |
|------|-----------|------------|
| OCR | CPU-intensive Tesseract processing | Async processing, don't block upload response |
| File uploads | 50MB max file size | Stream-based upload with multer |
| Database | Complex queries with joins | Targeted indexes, denormalized fields in documents table |
| API | High request volume | Rate limiting (200/15min global, 20/15min auth) |

---

## Testing Strategy

### Recommended Testing Layers

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest / Jest | Service functions, utility functions, Zustand stores |
| Integration | Supertest | API endpoint testing with test database |
| E2E | Playwright / Cypress | Full user flows (login, upload, view, delete) |
| Component | React Testing Library | Individual component rendering and interaction |
| AI Pipeline | pytest | OCR accuracy, classification precision, extraction correctness |

### Key Test Scenarios

1. **Upload flow**: Upload file → verify status changes from PROCESSING → CURRENT
2. **OCR pipeline**: Provide known image → verify extracted text matches
3. **Classification**: Provide Aadhaar image → verify type = AADHAAR, confidence > 0.7
4. **Expiry tracking**: Create document with tomorrow's expiry → verify cron marks EXPIRING_SOON
5. **Auth flow**: Login → get tokens → access protected route → refresh → logout
6. **Tour flow**: New user → welcome modal → tour starts → completes all 12 steps → localStorage persists

---

*This document is auto-generated and should be kept in sync with the codebase. Last updated: February 2026.*
