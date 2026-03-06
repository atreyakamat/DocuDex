import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import * as documentService from '../services/document.service';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import type { DocumentSearchQuery } from '@docudex/shared-types';

export async function uploadDocument(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }
    const document = await documentService.uploadDocument(
      req.user!.userId,
      req.file,
      req.body.metadata ? JSON.parse(req.body.metadata) : undefined
    );
    res.status(201).json({ success: true, data: { document } });
  } catch (error) {
    next(error);
  }
}

export async function uploadMultipleDocuments(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: 'No files uploaded' });
      return;
    }

    const results = await Promise.allSettled(
      files.map((file) => documentService.uploadDocument(req.user!.userId, file))
    );

    const successful = [];
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push({
          fileName: files[index].originalname,
          error: result.reason?.message || 'Unknown error during upload',
        });
      }
    });

    if (failed.length > 0 && successful.length > 0) {
      // Partial success
      res.status(207).json({
        success: true,
        message: 'Some documents failed to upload',
        data: { documents: successful, failed },
      });
    } else if (failed.length > 0 && successful.length === 0) {
      // All failed
      res.status(500).json({
        success: false,
        error: 'All document uploads failed',
        details: failed,
      });
    } else {
      // All successful
      res.status(201).json({ success: true, data: { documents: successful } });
    }
  } catch (error) {
    next(error);
  }
}

export async function listDocuments(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query: DocumentSearchQuery = {
      query: req.query.q as string,
      category: req.query.category as DocumentSearchQuery['category'],
      documentType: req.query.documentType as DocumentSearchQuery['documentType'],
      status: req.query.status as DocumentSearchQuery['status'],
      isStarred: req.query.isStarred === 'true' ? true : req.query.isStarred === 'false' ? false : undefined,
      folderId: req.query.folderId as string,
      page: parseInt(req.query.page as string || '1', 10),
      limit: parseInt(req.query.limit as string || '20', 10),
    };

    const result = await documentService.getDocuments(req.user!.userId, query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getDocument(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const document = await documentService.getDocumentById(req.params.id, req.user!.userId);
    res.status(200).json({ success: true, data: { document } });
  } catch (error) {
    next(error);
  }
}

export async function updateDocument(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const document = await documentService.updateDocument(
      req.params.id,
      req.user!.userId,
      req.body
    );
    res.status(200).json({ success: true, data: { document } });
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await documentService.deleteDocument(req.params.id, req.user!.userId);
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function downloadDocument(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const document = await documentService.getDocumentById(req.params.id, req.user!.userId);

    if (config.storage.type === 's3') {
      const { getPresignedUrl } = await import('../services/s3.service');
      const url = await getPresignedUrl(document.storageKey);
      res.redirect(url);
    } else {
      const filePath = path.join(config.storage.uploadDir, document.storageKey);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ success: false, error: 'File not found on server' });
        return;
      }

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      res.sendFile(path.resolve(filePath));
    }
  } catch (error) {
    next(error);
  }
}

export async function getStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await documentService.getDocumentStats(req.user!.userId);
    res.status(200).json({ success: true, data: { stats } });
  } catch (error) {
    next(error);
  }
}

export async function getDocumentStatusStream(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.id;
    const userId = req.user!.userId;

    // Verify document exists and belongs to user
    const doc = await documentService.getDocumentById(documentId, userId);

    // Setup Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE

    // Send initial state
    res.write(`data: ${JSON.stringify({ status: doc.status })}\n\n`);

    if (doc.status !== 'PROCESSING') {
      res.write('event: complete\ndata: {}\n\n');
      res.end();
      return;
    }

    // Polling the database every 2 seconds for updates
    // In a production system, this should be replaced with Redis Pub/Sub or similar event emitter
    const interval = setInterval(async () => {
      try {
        const updatedDoc = await documentService.getDocumentById(documentId, userId);
        
        if (updatedDoc.status !== 'PROCESSING') {
          res.write(`data: ${JSON.stringify({ status: updatedDoc.status })}\n\n`);
          res.write('event: complete\ndata: {}\n\n');
          clearInterval(interval);
          res.end();
        }
      } catch (error) {
        logger.error(`SSE polling error for doc ${documentId}:`, error);
        clearInterval(interval);
        res.end();
      }
    }, 2000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  } catch (error) {
    next(error);
  }
}
