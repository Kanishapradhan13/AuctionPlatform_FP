import app from './app';
import { serverConfig, closeConnections, getRedisClient } from './config';
import logger from './config/logger';

const PORT = serverConfig.port;

// Initialize Redis connection
const initializeServices = async () => {
  try {
    // Connect to Redis
    await getRedisClient();
    logger.info('Services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await initializeServices();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Bidding Service running on port ${PORT}`);
    logger.info(`📍 Environment: ${serverConfig.nodeEnv}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await closeConnections();
        logger.info('All connections closed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
};

startServer();
