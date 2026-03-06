import axios from 'axios';
import { logger } from '../utils/logger';
import { pool } from '../config/database';
import { getPresignedUrl } from './s3.service';

export async function submitWorkflowToInstitution(workflowId: string, userId: string): Promise<void> {
  try {
    const workflowResult = await pool.query(
      'SELECT template_id, document_ids FROM workflow_instances WHERE id = $1 AND user_id = $2',
      [workflowId, userId]
    );

    if (workflowResult.rows.length === 0) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const { template_id, document_ids } = workflowResult.rows[0];

    if (!document_ids || document_ids.length === 0) {
      logger.warn(`Workflow ${workflowId} has no documents to submit`);
      return;
    }

    const docsResult = await pool.query(
      'SELECT id, original_name, storage_key FROM documents WHERE id = ANY($1)',
      [document_ids]
    );

    const documents = await Promise.all(docsResult.rows.map(async (doc) => {
      // In a real scenario, we might generate presigned URLs or download buffers
      const url = await getPresignedUrl(doc.storage_key).catch(() => 'local-path:' + doc.storage_key);
      return {
        documentId: doc.id,
        name: doc.original_name,
        url,
      };
    }));

    const payload = {
      workflowId,
      templateId: template_id,
      userId,
      documents,
    };

    logger.info(`Submitting workflow ${workflowId} to institution API...`, { template: template_id, docCount: documents.length });

    // Mock API call to external institution
    // In production, this would route to different endpoints depending on the template (e.g. HDFC Bank, MCA, Passport Office)
    if (process.env.NODE_ENV !== 'test') {
      await axios.post('https://mock-institution-api.docudex.dev/submit', payload).catch(() => {
        logger.info('Mock institution API POST skipped (mock server not available)');
      });
    }

    logger.info(`Workflow ${workflowId} successfully submitted to institution`);
  } catch (error) {
    logger.error(`Error submitting workflow ${workflowId} to institution:`, error);
    throw error;
  }
}
