import { Router } from 'express';
import authRoutes from './auth.routes';
import oauthRoutes from './oauth.routes';
import documentRoutes from './document.routes';
import notificationRoutes from './notification.routes';
import workflowRoutes from './workflow.routes';
import folderRoutes from './folder.routes';
import shareRoutes from './share.routes';
import webhookRoutes from './webhook.routes';
import recommendationRoutes from './recommendation.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/oauth', oauthRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/workflows', workflowRoutes);
router.use('/folders', folderRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/', shareRoutes); // share routes mount at /documents/:id/share and /share/:token

export default router;
