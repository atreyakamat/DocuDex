import axios from 'axios';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { uploadDocumentFromBuffer } from './document.service';

export async function processWhatsappWebhook(body: any): Promise<void> {
  try {
    const fromNumber = body.From; // e.g. "whatsapp:+14155238886"
    const numMedia = parseInt(body.NumMedia || '0', 10);

    if (numMedia === 0) {
      logger.info(`WhatsApp webhook received from ${fromNumber} with no media.`);
      return;
    }

    // Find user by phone number
    // Clean up WhatsApp prefix if present
    const cleanPhone = fromNumber.replace('whatsapp:', '');
    const userResult = await pool.query('SELECT id FROM users WHERE phone = $1 OR phone = $2', [cleanPhone, `+${cleanPhone}`]);
    
    if (userResult.rows.length === 0) {
      logger.warn(`WhatsApp upload rejected: No user found for phone ${cleanPhone}`);
      return;
    }
    
    const userId = userResult.rows[0].id;

    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = body[`MediaUrl${i}`];
      const contentType = body[`MediaContentType${i}`];
      const originalName = `whatsapp_upload_${Date.now()}_${i}.${contentType.split('/')[1] || 'bin'}`;

      // Fetch the file from Twilio
      const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      await uploadDocumentFromBuffer(
        userId,
        buffer,
        originalName,
        contentType,
        { tags: ['whatsapp', 'auto-upload'] }
      );
      logger.info(`Successfully processed WhatsApp document from ${cleanPhone}`);
    }
  } catch (error: any) {
    logger.error('Error processing WhatsApp webhook:', error.message);
    throw error;
  }
}
