import { createApp } from './app';
import { config } from './config';
import { prisma } from './config/database';
import { logger } from './utils/logger';

async function main(): Promise<void> {
    try {
        // Test database connection
        await prisma.$connect();
        logger.info('Database connected successfully');

        // Create Express app
        const app = createApp();

        // Start server
        const server = app.listen(config.port, () => {
            logger.info(`Server started on port ${config.port}`, {
                environment: config.env,
                port: config.port,
            });
        });

        // Graceful shutdown
        const shutdown = async (signal: string): Promise<void> => {
            logger.info(`${signal} received, shutting down gracefully`);

            server.close(async () => {
                logger.info('HTTP server closed');
                await prisma.$disconnect();
                logger.info('Database connection closed');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        logger.error('Failed to start server', { error });
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
