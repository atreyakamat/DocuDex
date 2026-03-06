# DocuDex Edge Case Handling Framework

## 1. Core Principles
To provide a resilient, user-friendly experience, DocuDex must gracefully handle failures across all layers—Network, AI Processing, Storage, and User Input. 

1. **Graceful Degradation:** If a non-critical subsystem fails (e.g., Elasticsearch search), the system must fallback to a basic method (e.g., SQL ILIKE search) rather than failing the entire request.
2. **Idempotency & Retries:** External calls (AI OCR, webhooks, S3 uploads) must be retried with exponential backoff before being marked as failed.
3. **Transparent User Feedback:** Never leave a document stuck in `PROCESSING`. If a background job fails permanently, it must update the document status to `CURRENT` or `FAILED` and notify the user via the `notifications` table.
4. **Data Integrity:** Operations spanning multiple tables or services (e.g., creating a workflow and submitting it) must handle partial failures gracefully.

## 2. Infrastructure Edge Cases

### 2.1 AI Service Unavailable or Timeout
**Scenario:** The Python FastAPI AI service is down or takes too long to process a heavy PDF.
**Handling Framework:**
- **Retry Mechanism:** Implement `axios-retry` in `ai.service.ts` to retry failed requests up to 3 times with exponential backoff.
- **Circuit Breaker:** If the AI service is consistently failing, stop sending requests immediately and queue them in Redis/BullMQ to be processed later.
- **Fallback State:** If all retries fail, update the document to status `CURRENT` with an empty extraction payload, and alert the user: "Upload successful, but AI text extraction failed. Please enter details manually."

### 2.2 S3/Cloud Storage Failure
**Scenario:** AWS S3 rejects an upload or goes down.
**Handling Framework:**
- **Local Fallback:** If S3 upload fails during the `uploadS3Object` execution, fallback to local disk storage if configured, or return a clear `503 Service Unavailable` before inserting into the database, avoiding orphaned DB records without backing files.

### 2.3 Redis/Database Connection Loss
**Scenario:** The database or Redis drops connections.
**Handling Framework:**
- `setup.ts` and `redis.ts` must use standard driver reconnections.
- In authentication, if Redis (used for JWT blacklisting and OTPs) is down, bypass the blacklist check securely to allow logins to continue, rather than blocking the whole platform (already implemented).

## 3. Application & User Edge Cases

### 3.1 Uploading Corrupted or Password-Protected PDFs
**Scenario:** A user uploads a bank statement that requires a password.
**Handling Framework:**
- The Python AI service should detect `PyPDF2.errors.FileNotDecryptedError`.
- Catch this specifically in the Python backend, returning a `422 Unprocessable Entity` with a custom error code `PASSWORD_PROTECTED`.
- The Node backend catches this code, triggers a user Notification ("Your document requires a password"), and flags the document in the UI to prompt the user for the password.

### 3.2 Inconsistent Document Validations
**Scenario:** The OCR extracts slightly different names (e.g., "John Doe" vs "John H. Doe").
**Handling Framework:**
- The `validator.py` cross-references these. If the fuzzy match score is below 90%, it triggers a `NAME_MISMATCH` anomaly. 
- The UI should surface this as a "Warning" rather than a hard blocker, allowing the user to explicitly "Acknowledge and Override" the discrepancy.

### 3.3 Partial Multi-File Upload Failures
**Scenario:** User uploads 10 files, but 2 fail validation (e.g., too large).
**Handling Framework:**
- Return a `207 Multi-Status` response. Save the 8 successful documents, and return specific error strings for the 2 failed files so the user doesn't have to re-upload everything.

## 4. Implementation Checklist
- [x] Redis fallback for Authentication (Implemented)
- [x] S3 local fallback structure (Implemented)
- [x] Implement `axios-retry` on AI Service requests (Implemented)
- [x] Add password-protected PDF detection in Python AI Service (Implemented)
- [x] Create 207 Multi-Status for Partial Batch Upload Failures (Implemented)
- [x] Create UI polling/WebSocket updates for asynchronous background AI extraction status changes. (Implemented via Server-Sent Events)
