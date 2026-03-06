import axios from 'axios';
import { processWhatsappWebhook } from '../whatsapp-ingestion.service';
import { processEmailWebhook } from '../email-ingestion.service';
import { uploadDocumentFromBuffer } from '../document.service';
import { pool } from '../../config/database';

jest.mock('axios');
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));
jest.mock('../document.service');

describe('Webhook Ingestion Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WhatsApp Ingestion', () => {
    it('should skip if no media is attached', async () => {
      await processWhatsappWebhook({ From: 'whatsapp:+1234567890', NumMedia: '0' });
      expect(pool.query).not.toHaveBeenCalled();
      expect(uploadDocumentFromBuffer).not.toHaveBeenCalled();
    });

    it('should drop upload if user is not found', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await processWhatsappWebhook({ From: 'whatsapp:+1234567890', NumMedia: '1' });
      
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['+1234567890', '++1234567890']);
      expect(uploadDocumentFromBuffer).not.toHaveBeenCalled();
    });

    it('should process media correctly', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 'user-id' }] });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: Buffer.from('test') });
      
      await processWhatsappWebhook({ 
        From: 'whatsapp:+1234567890', 
        NumMedia: '1',
        MediaUrl0: 'https://example.com/media',
        MediaContentType0: 'image/jpeg'
      });

      expect(axios.get).toHaveBeenCalledWith('https://example.com/media', { responseType: 'arraybuffer' });
      expect(uploadDocumentFromBuffer).toHaveBeenCalledWith(
        'user-id',
        expect.any(Buffer),
        expect.stringContaining('whatsapp_upload_'),
        'image/jpeg',
        { tags: ['whatsapp', 'auto-upload'] }
      );
    });
  });

  describe('Email Ingestion', () => {
    it('should skip if sender email is not found in payload', async () => {
      await processEmailWebhook({}, []);
      expect(pool.query).not.toHaveBeenCalled();
      expect(uploadDocumentFromBuffer).not.toHaveBeenCalled();
    });

    it('should parse email and drop upload if user is not found', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await processEmailWebhook({ from: 'Test User <test@example.com>' }, []);
      
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['test@example.com']);
      expect(uploadDocumentFromBuffer).not.toHaveBeenCalled();
    });

    it('should process attachments correctly', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 'user-id' }] });
      
      const files = [{
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
      }] as Express.Multer.File[];

      await processEmailWebhook({ from: 'test@example.com' }, files);

      expect(uploadDocumentFromBuffer).toHaveBeenCalledWith(
        'user-id',
        expect.any(Buffer),
        'test.pdf',
        'application/pdf',
        { tags: ['email', 'auto-upload'] }
      );
    });
  });
});
