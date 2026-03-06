import { pool } from '../config/database';
import { WORKFLOW_TEMPLATES } from '../config/workflows';

export interface Recommendation {
  workflowId: string;
  workflowName: string;
  missingDocuments: string[];
}

export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  // Get all documents the user currently has
  const result = await pool.query(
    'SELECT document_type FROM documents WHERE user_id = $1 AND status != \'EXPIRED\'',
    [userId]
  );
  
  const userDocumentTypes = new Set(
    result.rows.map((row) => row.document_type).filter(Boolean)
  );

  const recommendations: Recommendation[] = [];

  for (const template of WORKFLOW_TEMPLATES) {
    const missingDocs = template.requiredDocuments.filter(
      (docType) => !userDocumentTypes.has(docType)
    );

    if (missingDocs.length > 0) {
      recommendations.push({
        workflowId: template.id,
        workflowName: template.name,
        missingDocuments: missingDocs,
      });
    }
  }

  return recommendations;
}
