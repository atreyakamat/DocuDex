import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getRecommendations } from '../services/recommendation.service';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const recommendations = await getRecommendations(req.user!.userId);
    res.json({ success: true, data: { recommendations } });
  } catch (error) {
    next(error);
  }
});

export default router;
