import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { uploadDocumentFromBuffer } from './document.service';

export async function processEmailWebhook(body: any, files: Express.Multer.File[]): Promise<void> {
  try {
    // SendGrid inbound parse sends 'from' containing the sender's email. e.g. "User Name <user@example.com>"
    const fromHeader = body.from || body.From || '';
    const emailMatch = fromHeader.match(/<([^>]+)>/);
    const senderEmail = emailMatch ? emailMatch[1] : fromHeader.trim();

    if (!senderEmail) {
      logger.warn('Email upload rejected: No sender email found.');
      return;
    }

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [senderEmail]);
    if (userResult.rows.length === 0) {
      logger.warn(`Email upload rejected: No user found for email ${senderEmail}`);
      return;
    }

    const userId = userResult.rows[0].id;

    if (!files || files.length === 0) {
      logger.info(`Email webhook received from ${senderEmail} with no attachments.`);
      return;
    }

    for (const file of files) {
      // In webhook, multer provides file.buffer if we use memoryStorage
      if (!file.buffer) {
         logger.warn('Attachment buffer missing.');
         continue;
      }
      await uploadDocumentFromBuffer(
        userId,
        file.buffer,
        file.originalname || `email_attachment_${Date.now()}`,
        file.mimetype,
        { tags: ['email', 'auto-upload'] }
      );
      logger.info(`Successfully processed Email document attachment from ${senderEmail}`);
    }
  } catch (error: any) {
    logger.error('Error processing Email webhook:', error.message);
    throw error;
  }
}
