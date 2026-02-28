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
import { pool } from './config/database';

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
app.get('/health', async (_req, res) => {
  const checks: Record<string, string> = { api: 'ok' };
  let overall = true;

  // Database check
  try {
    const r = await pool.query('SELECT 1 as ok');
    checks.database = r.rows.length ? 'ok' : 'error';
  } catch {
    checks.database = 'error';
    overall = false;
  }

  // Redis check (optional)
  try {
    const { redis } = await import('./config/redis');
    if (redis) {
      const pong = await redis.ping();
      checks.redis = pong === 'PONG' ? 'ok' : 'error';
    } else {
      checks.redis = 'not_configured';
    }
  } catch {
    checks.redis = 'not_configured';
  }

  const status = overall ? 200 : 503;
  res.status(status).json({
    status: overall ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
    uptime: Math.floor(process.uptime()),
    checks,
  });
});

// ─── API routes ──────────────────────────────
app.use('/api/v1', routes);

// ─── Error handling ──────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
