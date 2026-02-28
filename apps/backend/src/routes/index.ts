import { Router } from 'express';
import authRoutes from './auth.routes';
import documentRoutes from './document.routes';
import notificationRoutes from './notification.routes';
import workflowRoutes from './workflow.routes';
import folderRoutes from './folder.routes';
import shareRoutes from './share.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/workflows', workflowRoutes);
router.use('/folders', folderRoutes);
router.use('/', shareRoutes); // share routes mount at /documents/:id/share and /share/:token

export default router;
