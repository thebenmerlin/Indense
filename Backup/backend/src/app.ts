import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler, notFoundHandler, auditRequest } from './middleware';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import sitesRoutes from './modules/sites/sites.routes';
import materialsRoutes from './modules/materials/materials.routes';
import indentsRoutes from './modules/indents/indents.routes';
import ordersRoutes from './modules/orders/orders.routes';
import receiptsRoutes from './modules/receipts/receipts.routes';
import returnsRoutes from './modules/returns/returns.routes';
import reportsRoutes from './modules/reports/reports.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import itemGroupsRoutes from './modules/itemGroups/itemGroups.routes';
import uomRoutes from './modules/uom/uom.routes';

export function createApp(): Application {
    const app = express();

    // Security middleware
    app.use(helmet());

    // CORS configuration
    app.use(cors({
        origin: config.env === 'production'
            ? process.env.ALLOWED_ORIGINS?.split(',')
            : '*',
        credentials: true,
    }));

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use(auditRequest());

    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: config.env,
        });
    });

    // API routes
    const apiPrefix = '/api/v1';

    app.use(`${apiPrefix}/auth`, authRoutes);
    app.use(`${apiPrefix}/users`, usersRoutes);
    app.use(`${apiPrefix}/sites`, sitesRoutes);
    app.use(`${apiPrefix}/materials`, materialsRoutes);
    app.use(`${apiPrefix}/item-groups`, itemGroupsRoutes);
    app.use(`${apiPrefix}/units-of-measure`, uomRoutes);
    app.use(`${apiPrefix}/indents`, indentsRoutes);
    app.use(`${apiPrefix}/orders`, ordersRoutes);
    app.use(`${apiPrefix}/receipts`, receiptsRoutes);
    app.use(`${apiPrefix}/returns`, returnsRoutes);
    app.use(`${apiPrefix}/reports`, reportsRoutes);
    app.use(`${apiPrefix}/notifications`, notificationsRoutes);

    // 404 handler
    app.use(notFoundHandler);

    // Global error handler (must be last)
    app.use(errorHandler);

    logger.info('Express app configured', {
        environment: config.env,
        apiPrefix,
    });

    return app;
}

export default createApp;
