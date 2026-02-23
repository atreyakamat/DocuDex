import 'dotenv/config';
import app from './app';
import { connectDatabase, initializeDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { updateDocumentStatuses } from './services/document.service';
import { config } from './config/env';
import { logger } from './utils/logger';
import cron from 'node-cron';

async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();
    await initializeDatabase();

    // Connect to Redis (optional)
    await connectRedis();

    // Schedule document status updates every hour
    cron.schedule('0 * * * *', () => {
      updateDocumentStatuses().catch((err) =>
        logger.error('Cron: document status update failed', err)
      );
    });

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 DocuDex API running on http://localhost:${config.port}`);
      logger.info(`   Environment: ${config.nodeEnv}`);
      logger.info(`   API base: http://localhost:${config.port}/api/v1`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
