import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../utils/logger';

export const redis = new Redis(config.redis.url, {
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null; // stop retrying after 3 attempts
    return Math.min(times * 50, 2000);
  },
});

let _connected = false;

redis.on('connect', () => { _connected = true;  logger.info('\u2705 Redis connected'); });
redis.on('error',   () => { _connected = false; }); // suppress noisy logs — we handle gracefully

/** True only after a successful connection */
export const isRedisConnected = () => _connected;

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch {
    logger.warn('\u26a0\ufe0f  Redis unavailable — token blacklisting and OTP features will be skipped');
  }
}
