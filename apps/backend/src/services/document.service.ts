import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { processDocumentWithAI } from './ai.service';
import type {
  Document,
  DocumentListResponse,
  DocumentSearchQuery,
  DocumentMetadata,
} from '@docudex/shared-types';

export async function uploadDocument(
  userId: string,
  file: Express.Multer.File,
  metadata?: Partial<DocumentMetadata>
): Promise<Document> {
  const id = uuidv4();
  const storageKey = file.filename;

  const result = await pool.query(
    `INSERT INTO documents
       (id, user_id, file_name, original_name, mime_type, file_size, storage_key, status,
        tags, extracted_fields)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'PROCESSING', $8, '{}')
     RETURNING *`,
    [
      id,
      userId,
      file.filename,
      file.originalname,
      file.mimetype,
      file.size,
      storageKey,
      metadata?.tags || [],
    ]
  );

  const document = mapDbDocument(result.rows[0]);

  // Trigger async AI processing (fire & forget)
  processDocumentWithAI(id, file.path, userId).catch((err) =>
    logger.error('AI processing failed for document', { documentId: id, error: err.message })
  );

  return document;
}

export async function getDocuments(
  userId: string,
  query: DocumentSearchQuery
): Promise<DocumentListResponse> {
  const { page = 1, limit = 20, category, documentType, status, isStarred, folderId } = query;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['user_id = $1'];
  const values: unknown[] = [userId];
  let paramIndex = 2;

  if (category) {
    conditions.push(`category = $${paramIndex++}`);
    values.push(category);
  }
  if (documentType) {
    conditions.push(`document_type = $${paramIndex++}`);
    values.push(documentType);
  }
  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (isStarred !== undefined) {
    conditions.push(`is_starred = $${paramIndex++}`);
    values.push(isStarred);
  }
  if (folderId) {
    conditions.push(`folder_id = $${paramIndex++}`);
    values.push(folderId);
  }
  if (query.query) {
    conditions.push(
      `(original_name ILIKE $${paramIndex} OR holder_name ILIKE $${paramIndex} OR document_number ILIKE $${paramIndex})`
    );
    values.push(`%${query.query}%`);
    paramIndex++;
  }

  const where = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM documents WHERE ${where}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const docsResult = await pool.query(
    `SELECT * FROM documents WHERE ${where}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    [...values, limit, offset]
  );

  return {
    documents: docsResult.rows.map(mapDbDocument),
    total,
    page,
    limit,
  };
}

export async function getDocumentById(documentId: string, userId: string): Promise<Document> {
  const result = await pool.query(
    'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
    [documentId, userId]
  );
  if (result.rows.length === 0) throw createError('Document not found', 404);
  return mapDbDocument(result.rows[0]);
}

export async function updateDocument(
  documentId: string,
  userId: string,
  updates: Partial<DocumentMetadata> & { isStarred?: boolean; folderId?: string }
): Promise<Document> {
  const setClauses: string[] = ['updated_at = NOW()'];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.tags !== undefined) {
    setClauses.push(`tags = $${paramIndex++}`);
    values.push(updates.tags);
  }
  if (updates.isStarred !== undefined) {
    setClauses.push(`is_starred = $${paramIndex++}`);
    values.push(updates.isStarred);
  }
  if (updates.folderId !== undefined) {
    setClauses.push(`folder_id = $${paramIndex++}`);
    values.push(updates.folderId || null);
  }
  if (updates.documentType !== undefined) {
    setClauses.push(`document_type = $${paramIndex++}`);
    values.push(updates.documentType);
  }

  values.push(documentId, userId);
  const result = await pool.query(
    `UPDATE documents SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) throw createError('Document not found', 404);
  return mapDbDocument(result.rows[0]);
}

export async function deleteDocument(documentId: string, userId: string): Promise<void> {
  const result = await pool.query(
    'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING storage_key',
    [documentId, userId]
  );

  if (result.rows.length === 0) throw createError('Document not found', 404);

  // Remove physical file
  const storagePath = path.join(
    process.env.UPLOAD_DIR || './uploads',
    result.rows[0].storage_key
  );
  if (fs.existsSync(storagePath)) {
    fs.unlinkSync(storagePath);
  }
}

export async function getDocumentStats(userId: string) {
  const result = await pool.query(
    `SELECT
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE status = 'CURRENT') as current,
       COUNT(*) FILTER (WHERE status = 'EXPIRING_SOON') as expiring_soon,
       COUNT(*) FILTER (WHERE status = 'EXPIRED') as expired,
       COUNT(*) FILTER (WHERE status = 'PROCESSING') as processing
     FROM documents WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
}

// Run periodically to update document status based on expiry dates
export async function updateDocumentStatuses(): Promise<void> {
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  await pool.query(
    `UPDATE documents SET status = 'EXPIRED', updated_at = NOW()
     WHERE expiry_date IS NOT NULL AND expiry_date < $1 AND status != 'PROCESSING'`,
    [now]
  );

  await pool.query(
    `UPDATE documents SET status = 'EXPIRING_SOON', updated_at = NOW()
     WHERE expiry_date IS NOT NULL AND expiry_date BETWEEN $1 AND $2 AND status NOT IN ('PROCESSING', 'EXPIRED')`,
    [now, in90Days]
  );

  await pool.query(
    `UPDATE documents SET status = 'CURRENT', updated_at = NOW()
     WHERE expiry_date IS NOT NULL AND expiry_date > $1 AND status NOT IN ('PROCESSING', 'EXPIRING_SOON', 'EXPIRED')`,
    [in90Days]
  );

  logger.debug('Document statuses refreshed');
}

// ─── Private helpers ─────────────────────────
function mapDbDocument(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    fileName: row.file_name as string,
    originalName: row.original_name as string,
    mimeType: row.mime_type as string,
    fileSize: row.file_size as number,
    storageKey: row.storage_key as string,
    status: (row.status as Document['status']) || 'PROCESSING',
    metadata: {
      documentType: (row.document_type as Document['metadata']['documentType']) || undefined,
      category: (row.category as Document['metadata']['category']) || undefined,
      issueDate: row.issue_date
        ? (row.issue_date as Date).toISOString().split('T')[0]
        : undefined,
      expiryDate: row.expiry_date
        ? (row.expiry_date as Date).toISOString().split('T')[0]
        : undefined,
      issuingAuthority: (row.issuing_authority as string) || undefined,
      documentNumber: (row.document_number as string) || undefined,
      holderName: (row.holder_name as string) || undefined,
      tags: (row.tags as string[]) || [],
      extractedFields: (row.extracted_fields as Record<string, string>) || {},
      classificationConfidence: (row.classification_confidence as number) || undefined,
    },
    folderId: (row.folder_id as string) || undefined,
    isStarred: row.is_starred as boolean,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}
