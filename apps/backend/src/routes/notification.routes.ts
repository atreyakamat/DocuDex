import { Router, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user!.userId]
    );
    res.json({ success: true, data: { notifications: result.rows } });
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) { next(err); }
});

router.patch('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [req.user!.userId]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user!.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Notification not found' }); return;
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
});

export default router;
