import { Router } from 'express';
import authRoutes from './auth.routes';
import documentRoutes from './document.routes';
import notificationRoutes from './notification.routes';
import workflowRoutes from './workflow.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/workflows', workflowRoutes);

export default router;
