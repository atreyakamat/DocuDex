import { Router } from 'express';
import {
  uploadDocument,
  uploadMultipleDocuments,
  listDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getStats,
} from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All document routes require authentication
router.use(authenticate);

router.get('/stats', getStats);
router.get('/', listDocuments);
router.post('/upload', upload.single('file'), uploadDocument);
router.post('/upload/bulk', upload.array('files', 10), uploadMultipleDocuments);
router.get('/:id', getDocument);
router.patch('/:id', updateDocument);
router.delete('/:id', deleteDocument);
router.get('/:id/download', downloadDocument);

export default router;
