import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
import { logger } from './utils/logger';

const app = express();

// ─── Security middleware ─────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate limiting ───────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many authentication attempts.' },
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api', limiter);

// ─── Body parsing & compression ─────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request logging ─────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
    skip: () => config.nodeEnv === 'test',
  })
);

// ─── Static file serving ─────────────────────
app.use('/uploads', express.static(config.storage.uploadDir));

// ─── Health check ────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv });
});

// ─── API routes ──────────────────────────────
app.use('/api/v1', routes);

// ─── Error handling ──────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
