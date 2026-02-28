import { Router, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// List all folders for the current user
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'SELECT * FROM folders WHERE user_id = $1 ORDER BY name ASC',
      [req.user!.userId]
    );
    res.json({ success: true, data: { folders: result.rows.map(mapFolder) } });
  } catch (err) { next(err); }
});

// Create folder
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, parentId } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw createError('Folder name is required', 400);
    }

    // Validate parent belongs to user if provided
    if (parentId) {
      const parent = await pool.query(
        'SELECT id FROM folders WHERE id = $1 AND user_id = $2',
        [parentId, req.user!.userId]
      );
      if (parent.rows.length === 0) throw createError('Parent folder not found', 404);
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO folders (id, user_id, name, parent_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, req.user!.userId, name.trim(), parentId || null]
    );
    res.status(201).json({ success: true, data: { folder: mapFolder(result.rows[0]) } });
  } catch (err) { next(err); }
});

// Rename folder
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw createError('Folder name is required', 400);
    }
    const result = await pool.query(
      `UPDATE folders SET name = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [name.trim(), req.params.id, req.user!.userId]
    );
    if (result.rows.length === 0) throw createError('Folder not found', 404);
    res.json({ success: true, data: { folder: mapFolder(result.rows[0]) } });
  } catch (err) { next(err); }
});

// Delete folder (documents inside become un-foldered)
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user!.userId]
    );
    if (result.rows.length === 0) throw createError('Folder not found', 404);
    res.json({ success: true, message: 'Folder deleted' });
  } catch (err) { next(err); }
});

function mapFolder(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    parentId: row.parent_id || undefined,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

export default router;
