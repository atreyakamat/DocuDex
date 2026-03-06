import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { processWhatsappWebhook } from '../services/whatsapp-ingestion.service';
import { processEmailWebhook } from '../services/email-ingestion.service';
import { logger } from '../utils/logger';

const router = Router();

// Memory storage for email attachments (SendGrid Send Inbound Parse)
const upload = multer({ storage: multer.memoryStorage() });

// Twilio WhatsApp Webhook
router.post('/whatsapp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Respond immediately to Twilio to prevent timeout
    res.status(200).send('<Response></Response>'); 
    
    // Process asynchronously
    await processWhatsappWebhook(req.body);
  } catch (error) {
    logger.error('WhatsApp webhook error:', error);
    // Don't call next(error) since response is already sent
  }
});

// Sendgrid Email Webhook (Inbound Parse)
router.post('/email', upload.any(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Respond immediately
    res.status(200).send('OK');

    // Process asynchronously
    const files = req.files as Express.Multer.File[];
    await processEmailWebhook(req.body, files);
  } catch (error) {
    logger.error('Email webhook error:', error);
  }
});

export default router;
