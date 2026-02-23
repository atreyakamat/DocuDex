import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../utils/logger';

export const redis = new Redis(config.redis.url, {
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error('Redis error:', err));

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (error) {
    logger.warn('Redis connection failed, continuing without cache:', error);
  }
}
