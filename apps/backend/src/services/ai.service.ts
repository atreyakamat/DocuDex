import axios from 'axios';
import axiosRetry from 'axios-retry';
import FormData from 'form-data';
import fs from 'fs';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { pool } from '../config/database';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { s3Client } from './s3.service';
import type { AIProcessingResult } from '@docudex/shared-types';

// Configure retry logic for AI service resilience
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 503;
  },
  onRetry: (retryCount, error, requestConfig) => {
    logger.warn(`Retrying AI service request (attempt ${retryCount}) due to: ${error.message}`);
  },
});

export async function processDocumentWithAI(
  documentId: string,
  storageKey: string,
  _userId: string,
  mimeType: string,
  originalName: string
): Promise<void> {
  try {
    logger.info(`Starting AI processing for document ${documentId}`);

    let fileStream: Readable;

    if (config.storage.type === 's3') {
      const command = new GetObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: storageKey,
      });
      const response = await s3Client.send(command);
      fileStream = response.Body as Readable;
    } else {
      const filePath = config.storage.uploadDir + '/' + storageKey;
      fileStream = fs.createReadStream(filePath);
    }

    const form = new FormData();
    form.append('file', fileStream, {
      filename: originalName,
      contentType: mimeType,
    });

    let result: AIProcessingResult;
    try {
      const response = await axios.post<AIProcessingResult>(
        `${config.aiService.url}/process`,
        form,
        { 
          headers: form.getHeaders(),
          timeout: 120000 
        }
      );
      result = response.data;
    } catch (aiError: any) {
      logger.error(`AI service error for ${documentId}:`, aiError.message || aiError);
      result = {
        classification: { documentType: 'OTHER', category: 'OTHER', confidence: 0 },
        extraction: { fields: {}, processingTime: 0 },
        summary: undefined,
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
      'summary = $7',
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
      result.summary || null,
    ];

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
    await pool.query(
      'UPDATE documents SET status = $1, updated_at = NOW() WHERE id = $2',
      ['CURRENT', documentId]
    );
  }
}
