# Implementation Gaps Report

## 1. Summary
**DocuDex** is an AI-powered document management system designed to intelligently store, classify (via OCR), and manage personal and professional documents, offering features like process workflows, sharing, and proactive alerts.

**Overall Implementation Status:**
The core infrastructure of the application has been built. The backend (Node/Express/PostgreSQL) and frontend (React/TypeScript) are structured well, with an AI service (Python) handling basic OCR classification. Basic user authentication, document upload (local file system), document sharing (temporary links), and rudimentary workflow tracking are in place. However, several advanced integrations—such as OAuth, MFA endpoints, cloud storage (S3), advanced search (Elasticsearch), automated submission APIs, and multi-channel uploads (WhatsApp/Email)—are entirely missing or only superficially scaffolded.

---

## 2. Missing Features

### Feature: OAuth and Biometric Authentication (FR-1.2)
**Description:**
User Authentication is supposed to support OAuth (Google/Microsoft) and Biometric authentication (FaceID/Fingerprint) for mobile/web platforms.

**Required Files:**
- `apps/backend/src/routes/oauth.routes.ts`
- `apps/backend/src/services/oauth.service.ts`

**Required Components:**
- Integration with Passport.js or a similar library for Google/Microsoft OAuth.
- WebAuthn integration for Biometric auth on supported devices.
- User model updates to store OAuth provider IDs.

**Implementation Notes:**
- Create new routes and hook them into `apps/backend/src/app.ts`.
- Link newly registered OAuth users to existing accounts if the email matches.

### Feature: Multi-Method Document Upload (FR-2.1)
**Description:**
The system needs to support document uploads via Email forwarding and WhatsApp integration, in addition to standard web/mobile uploads.

**Required Files:**
- `apps/backend/src/services/email-ingestion.service.ts`
- `apps/backend/src/services/whatsapp-ingestion.service.ts`
- `apps/backend/src/routes/webhook.routes.ts`

**Required Components:**
- IMAP listener or SendGrid/Mailgun inbound parse webhook for email processing.
- Twilio or Meta WhatsApp Business API webhook to receive messages/attachments.
- Route mapping to associate incoming attachments with registered user accounts.

**Implementation Notes:**
- Attachments should be passed into the existing `upload.ts` middleware logic or routed directly to S3 and the `document.service.ts`.

### Feature: Document Validation and Anomaly Detection (FR-3.3)
**Description:**
Format verification and cross-document consistency checks (e.g., verifying if the name on the PAN card matches the Aadhaar card).

**Required Files:**
- `apps/ai-service/app/services/validator.py`
- `apps/backend/src/services/validation.service.ts`

**Required Components:**
- Python service logic to compare extracted fields (name, DOB) across multiple documents owned by the user.
- Backend API endpoints to trigger validation and report anomalies.

**Implementation Notes:**
- Enhance the AI service (`apps/ai-service/main.py`) to accept an array of extracted metadata and return a consistency score.

### Feature: Intelligent Recommendations and Proactive Alerts (FR-3.4)
**Description:**
The system should proactively suggest missing documents needed for standard life events or workflows (e.g., suggesting a user upload a PAN card if they only have an Aadhaar card).

**Required Files:**
- `apps/backend/src/services/recommendation.service.ts`
- `apps/backend/src/routes/recommendation.routes.ts`

**Required Components:**
- Analysis function that compares the user's uploaded documents against required documents in `WORKFLOW_TEMPLATES`.
- API endpoint returning a list of recommended actions/documents.

**Implementation Notes:**
- Can be triggered by a node-cron job (similar to expiry alerts) or queried live when the user visits the dashboard.

### Feature: Automated Submission to Integrated Institutions (FR-6.3)
**Description:**
Direct API connections to partner institutions (banks, government portals) for automated document submission once a workflow is complete.

**Required Files:**
- `apps/backend/src/services/institution-api.service.ts`

**Required Components:**
- Mapping of institution endpoints and secure credential storage for third-party APIs.
- Logic to bundle documents into a secure payload and transmit them to the selected institution.

**Implementation Notes:**
- Should be executed as the final step in `workflow.routes.ts` when a workflow transitions to a `COMPLETED` state.

---

## 3. Partially Implemented Features

### Feature: Multi-Factor Authentication (FR-1.3)
**Current Implementation:**
- The PostgreSQL database schema (`apps/backend/src/config/database.ts`) includes an `mfa_enabled` boolean field.
- The `auth.service.ts` reads and returns this field.

**Missing Parts:**
- No API endpoints to generate a TOTP secret, display a QR code, or verify the TOTP token.
- Login flow does not intercept the request to ask for an MFA code if `mfa_enabled` is true.

**Required Changes:**
- Modify `apps/backend/src/controllers/auth.controller.ts` to include `setupMFA` and `verifyMFA` endpoints.
- Update `apps/backend/src/services/auth.service.ts` to integrate a library like `otplib` and manage MFA secrets.

### Feature: Secure Cloud Document Storage (FR-2.2)
**Current Implementation:**
- `apps/backend/src/config/env.ts` has scaffolding for S3 configuration (AWS_REGION, S3_BUCKET).
- However, `apps/backend/src/services/document.service.ts` relies entirely on the local file system (`fs.existsSync`, `fs.unlinkSync`) and `process.env.UPLOAD_DIR`.

**Missing Parts:**
- Actual integration with AWS S3 (or compatible Blob storage) for uploading, downloading, and deleting files.
- The local `multer` storage in `apps/backend/src/middleware/upload.ts` needs to be swapped for `multer-s3`.

**Required Changes:**
- Update `apps/backend/src/middleware/upload.ts` to use S3.
- Update `apps/backend/src/services/document.service.ts` to delete and fetch from S3 rather than the local `fs`.

### Feature: Multi-Faceted Search (FR-4.1)
**Current Implementation:**
- Standard database queries are used for retrieving documents and workflows.

**Missing Parts:**
- Natural language search and Elasticsearch integration, as documented, are missing.

**Required Changes:**
- Create `apps/backend/src/services/search.service.ts` to sync PostgreSQL data with an Elasticsearch cluster.
- Implement a global search endpoint in `apps/backend/src/routes/document.routes.ts`.

---

## 4. File Creation Plan

| File Path | Purpose | Related Feature |
| --- | --- | --- |
| `apps/backend/src/routes/oauth.routes.ts` | Endpoints for Google/Microsoft login | FR-1.2 (OAuth) |
| `apps/backend/src/services/oauth.service.ts` | Logic for handling OAuth callbacks and user mapping | FR-1.2 (OAuth) |
| `apps/backend/src/routes/webhook.routes.ts` | Endpoints to receive data from WhatsApp/Email | FR-2.1 (Multi-upload) |
| `apps/backend/src/services/whatsapp-ingestion.service.ts` | Processing logic for incoming WhatsApp attachments | FR-2.1 (Multi-upload) |
| `apps/backend/src/services/email-ingestion.service.ts` | Processing logic for parsed inbound emails | FR-2.1 (Multi-upload) |
| `apps/backend/src/services/s3.service.ts` | AWS S3 wrapper for upload/delete/presigned URLs | FR-2.2 (Secure Storage) |
| `apps/backend/src/services/recommendation.service.ts` | Logic to suggest missing documents based on templates | FR-3.4 (Recommendations) |
| `apps/backend/src/services/search.service.ts` | Elasticsearch wrapper for complex document querying | FR-4.1 (Search) |
| `apps/backend/src/services/institution-api.service.ts` | Logic to dispatch documents to external third-party APIs | FR-6.3 (Automated Submissions) |

---

## 5. Recommended Implementation Order

To ensure a stable and logical progression of the system architecture, features should be implemented in the following order:

1. **Secure Cloud Document Storage (FR-2.2):**
   - **Why:** Local file system storage will break as soon as the app is containerized/scaled. Transitioning `multer` and `document.service.ts` to S3 is the most critical infrastructural gap.
2. **Multi-Factor Authentication (FR-1.3) & OAuth (FR-1.2):**
   - **Why:** Security and user onboarding are foundational. Implementing TOTP and OAuth will finalize the authentication layer.
3. **Multi-Method Document Upload (FR-2.1):**
   - **Why:** WhatsApp and Email ingestion provide huge UX value. Setting up the webhooks early ensures data ingestion pathways are robust.
4. **Intelligent Recommendations (FR-3.4) & Validation (FR-3.3):**
   - **Why:** Now that data is flowing securely, the AI capabilities can be expanded to cross-reference data and provide smart suggestions.
5. **Multi-Faceted Search (FR-4.1):**
   - **Why:** As the document volume grows via the new ingestion methods, advanced search (Elasticsearch) becomes necessary.
6. **Automated Submission to Integrated Institutions (FR-6.3):**
   - **Why:** This is the capstone feature. It requires all previous features (secure storage, intelligent validation, completed workflows) to function effectively.
