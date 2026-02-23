import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import * as documentService from '../services/document.service';
import { config } from '../config/env';
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

    const documents = await Promise.all(
      files.map((file) => documentService.uploadDocument(req.user!.userId, file))
    );

    res.status(201).json({ success: true, data: { documents } });
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
    const filePath = path.join(config.storage.uploadDir, document.storageKey);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: 'File not found on server' });
      return;
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.sendFile(path.resolve(filePath));
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
