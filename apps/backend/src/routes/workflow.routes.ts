import { Router, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { WORKFLOW_TEMPLATES } from '../config/workflows';
import { submitWorkflowToInstitution } from '../services/institution-api.service';

const router = Router();
router.use(authenticate);

// Templates
router.get('/templates', (_req, res: Response) => {
  res.json({ success: true, data: { templates: WORKFLOW_TEMPLATES } });
});

router.get('/templates/:id', (req, res: Response) => {
  const template = WORKFLOW_TEMPLATES.find((t) => t.id === req.params.id);
  if (!template) {
    res.status(404).json({ success: false, error: 'Template not found' });
    return;
  }
  res.json({ success: true, data: { template } });
});

// Workflow instances
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'SELECT * FROM workflow_instances WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.userId]
    );
    res.json({ success: true, data: { workflows: result.rows } });
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { templateId } = req.body;
    const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      res.status(404).json({ success: false, error: 'Template not found' }); return;
    }
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO workflow_instances
         (id, user_id, template_id, template_name, status, current_step, total_steps, document_ids)
       VALUES ($1, $2, $3, $4, 'DRAFT', 0, $5, '{}')
       RETURNING *`,
      [id, req.user!.userId, templateId, template.name, template.requiredDocuments.length]
    );
    res.status(201).json({ success: true, data: { workflow: result.rows[0] } });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'SELECT * FROM workflow_instances WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Workflow not found' }); return;
    }
    res.json({ success: true, data: { workflow: result.rows[0] } });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, currentStep, documentIds } = req.body;
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let p = 1;

    if (status) { setClauses.push(`status = $${p++}`); values.push(status); }
    if (currentStep !== undefined) { setClauses.push(`current_step = $${p++}`); values.push(currentStep); }
    if (documentIds) { setClauses.push(`document_ids = $${p++}`); values.push(documentIds); }

    // If it's being marked COMPLETED, set completed_at
    if (status === 'COMPLETED') {
      setClauses.push(`completed_at = NOW()`);
    }

    values.push(req.params.id, req.user!.userId);

    const result = await pool.query(
      `UPDATE workflow_instances SET ${setClauses.join(', ')}
       WHERE id = $${p++} AND user_id = $${p}
       RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Workflow not found' }); return;
    }

    const workflow = result.rows[0];

    // Trigger external institution submission
    if (status === 'COMPLETED') {
      submitWorkflowToInstitution(workflow.id, req.user!.userId).catch(err => 
        logger.error(`Institution submission failed for workflow ${workflow.id}`, err)
      );
    }

    res.json({ success: true, data: { workflow } });
  } catch (err) { next(err); }
});

export default router;
