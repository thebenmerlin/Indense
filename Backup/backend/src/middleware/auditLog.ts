import { Request, Response, NextFunction, RequestHandler } from 'express';
import { prisma } from '../config/database';
import { AuditAction, EntityType } from '../types/enums';
import { logger } from '../utils/logger';

/**
 * Audit logging service
 * Logs all significant actions for auditability
 */

export interface AuditLogData {
    action: AuditAction | string;
    entityType: EntityType | string;
    entityId: string;
    previousState?: string;
    newState?: string;
    metadata?: Record<string, unknown>;
    indentId?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
    userId: string,
    data: AuditLogData,
    req?: Request
): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                previousState: data.previousState,
                newState: data.newState,
                metadata: data.metadata as object | undefined,
                indentId: data.indentId,
                ipAddress: req?.ip || req?.socket.remoteAddress,
                userAgent: req?.headers['user-agent'],
            },
        });

        logger.debug('Audit log created', {
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId,
            userId,
        });
    } catch (error) {
        // Don't fail the request if audit logging fails
        logger.error('Failed to create audit log', { error, data });
    }
}

/**
 * Middleware to log requests (lightweight version)
 */
export function auditRequest(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const startTime = Date.now();

        // Log response on finish
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const userId = req.user?.id || 'anonymous';

            logger.info('Request completed', {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                userId,
                ip: req.ip || req.socket.remoteAddress,
            });
        });

        next();
    };
}

/**
 * Helper to log indent state changes
 */
export async function logIndentStateChange(
    userId: string,
    indentId: string,
    action: AuditAction,
    previousState: string,
    newState: string,
    metadata?: Record<string, unknown>,
    req?: Request
): Promise<void> {
    await createAuditLog(userId, {
        action,
        entityType: EntityType.INDENT,
        entityId: indentId,
        previousState,
        newState,
        metadata,
        indentId,
    }, req);
}

export default { createAuditLog, auditRequest, logIndentStateChange };
