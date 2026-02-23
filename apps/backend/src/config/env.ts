import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'docudex',
    user: process.env.DB_USER || 'docudex',
    password: process.env.DB_PASSWORD || 'docudex_pass',
    url: process.env.DATABASE_URL || 'postgresql://docudex:docudex_pass@localhost:5432/docudex',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  storage: {
    type: (process.env.STORAGE_TYPE || 'local') as 'local' | 's3',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50 MB
  },

  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};
