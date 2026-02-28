import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

// ── Authenticated: create share link ──────────────────────────
router.post(
  '/documents/:id/share',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { expiresInHours = 72, recipientEmail } = req.body;

      // Verify document ownership
      const doc = await pool.query(
        'SELECT id, original_name FROM documents WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user!.userId]
      );
      if (doc.rows.length === 0) throw createError('Document not found', 404);

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

      await pool.query(
        `INSERT INTO document_shares (id, document_id, user_id, token, expires_at, recipient_email)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
        [req.params.id, req.user!.userId, token, expiresAt, recipientEmail || null]
      );

      const shareUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/share/${token}`;
      res.json({ success: true, data: { shareUrl, token, expiresAt } });
    } catch (err) { next(err); }
  }
);

// List share links for a document
router.get(
  '/documents/:id/shares',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query(
        `SELECT s.*, d.original_name
         FROM document_shares s
         JOIN documents d ON d.id = s.document_id
         WHERE s.document_id = $1 AND s.user_id = $2
         ORDER BY s.created_at DESC`,
        [req.params.id, req.user!.userId]
      );
      res.json({ success: true, data: { shares: result.rows } });
    } catch (err) { next(err); }
  }
);

// Revoke a share link
router.delete(
  '/shares/:token',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query(
        'DELETE FROM document_shares WHERE token = $1 AND user_id = $2 RETURNING id',
        [req.params.token, req.user!.userId]
      );
      if (result.rows.length === 0) throw createError('Share link not found', 404);
      res.json({ success: true, message: 'Share link revoked' });
    } catch (err) { next(err); }
  }
);

// ── Public: access shared document (no auth required) ──────────────────────
router.get(
  '/share/:token',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query(
        `SELECT s.*, d.original_name, d.mime_type, d.file_size, d.storage_key,
                d.status, d.document_type, d.holder_name, d.expiry_date
         FROM document_shares s
         JOIN documents d ON d.id = s.document_id
         WHERE s.token = $1 AND s.expires_at > NOW()`,
        [req.params.token]
      );

      if (result.rows.length === 0) {
        throw createError('Share link not found or expired', 404);
      }

      // Increment access count
      await pool.query(
        'UPDATE document_shares SET access_count = access_count + 1 WHERE token = $1',
        [req.params.token]
      );

      const row = result.rows[0];
      res.json({
        success: true,
        data: {
          documentName: row.original_name,
          mimeType: row.mime_type,
          fileSize: row.file_size,
          status: row.status,
          documentType: row.document_type,
          holderName: row.holder_name,
          expiryDate: row.expiry_date,
          expiresAt: row.expires_at,
        },
      });
    } catch (err) { next(err); }
  }
);

export default router;
