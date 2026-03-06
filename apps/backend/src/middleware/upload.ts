import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { createError } from './errorHandler';
import { s3Client } from '../services/s3.service';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/tiff',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = config.storage.uploadDir;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const s3Storage = multerS3({
  s3: s3Client as any, // multer-s3 types can sometimes conflict with @aws-sdk/client-s3
  bucket: () => config.aws.s3Bucket || 'docudex',
  key: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `documents/${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const storage = config.storage.type === 's3' ? s3Storage : localStorage;

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError(`File type ${file.mimetype} is not allowed`, 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.storage.maxFileSize,
    files: 10,
  },
});
