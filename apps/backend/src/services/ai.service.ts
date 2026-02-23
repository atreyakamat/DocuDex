import axios from 'axios';
import { pool } from '../config/database';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import type { AIProcessingResult } from '@docudex/shared-types';

export async function processDocumentWithAI(
  documentId: string,
  filePath: string,
  _userId: string
): Promise<void> {
  try {
    logger.info(`Starting AI processing for document ${documentId}`);

    let result: AIProcessingResult;
    try {
      const response = await axios.post<AIProcessingResult>(
        `${config.aiService.url}/process`,
        { documentId, filePath },
        { timeout: 120000 }
      );
      result = response.data;
    } catch (aiError) {
      // Fallback: mark as current with minimal metadata if AI service is down
      logger.warn(`AI service unavailable for ${documentId}, using fallback`);
      result = {
        classification: { documentType: 'OTHER', category: 'OTHER', confidence: 0 },
        extraction: { fields: {}, processingTime: 0 },
        processingStatus: 'failed',
      };
    }

    // Update document with AI results
    const setClauses: string[] = [
      'status = $2',
      'document_type = $3',
      'category = $4',
      'classification_confidence = $5',
      'extracted_fields = $6',
      'updated_at = NOW()',
    ];

    const extractedData = result.extraction.fields;
    const values: unknown[] = [
      documentId,
      result.processingStatus === 'failed' ? 'CURRENT' : 'CURRENT',
      result.classification.documentType || null,
      result.classification.category || null,
      result.classification.confidence || null,
      extractedData,
    ];

    // Map known extracted fields to dedicated columns
    const holderName =
      extractedData.holderName?.value ||
      extractedData.name?.value ||
      null;
    const documentNumber =
      extractedData.documentNumber?.value ||
      extractedData.panNumber?.value ||
      extractedData.aadhaarNumber?.value ||
      null;
    const issuingAuthority = extractedData.issuingAuthority?.value || null;
    const issueDate = extractedData.issueDate?.value || null;
    const expiryDate = extractedData.expiryDate?.value || null;

    if (holderName) { setClauses.push(`holder_name = $${values.length + 1}`); values.push(holderName); }
    if (documentNumber) { setClauses.push(`document_number = $${values.length + 1}`); values.push(documentNumber); }
    if (issuingAuthority) { setClauses.push(`issuing_authority = $${values.length + 1}`); values.push(issuingAuthority); }
    if (issueDate) { setClauses.push(`issue_date = $${values.length + 1}`); values.push(issueDate); }
    if (expiryDate) { setClauses.push(`expiry_date = $${values.length + 1}`); values.push(expiryDate); }

    await pool.query(
      `UPDATE documents SET ${setClauses.join(', ')} WHERE id = $1`,
      values
    );

    logger.info(`AI processing completed for document ${documentId}`, {
      type: result.classification.documentType,
      confidence: result.classification.confidence,
    });
  } catch (error) {
    logger.error(`AI processing failed for document ${documentId}:`, error);
    // Set status to CURRENT even on failure so document is usable
    await pool.query(
      'UPDATE documents SET status = $1, updated_at = NOW() WHERE id = $2',
      ['CURRENT', documentId]
    );
  }
}

export async function classifyDocument(
  filePath: string
): Promise<AIProcessingResult> {
  const response = await axios.post<AIProcessingResult>(
    `${config.aiService.url}/process`,
    { filePath },
    { timeout: 60000 }
  );
  return response.data;
}
