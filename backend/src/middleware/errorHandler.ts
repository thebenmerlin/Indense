import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, isOperationalError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';
import { ApiResponse } from '../types';

/**
 * Global error handler middleware
 * Must be the last middleware in the chain
 */
export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Log the error
    if (isOperationalError(error)) {
        logger.warn('Operational error', {
            message: error.message,
            statusCode: (error as AppError).statusCode,
            path: req.path,
            method: req.method,
        });
    } else {
        logger.error('Unexpected error', {
            message: error.message,
            stack: error.stack,
            path: req.path,
            method: req.method,
        });
    }

    // Handle operational errors
    if (isOperationalError(error)) {
        const appError = error as AppError;
        const response: ApiResponse & { errors?: Record<string, string[]> } = {
            success: false,
            error: appError.message,
        };

        // Add validation errors if present
        if (error instanceof ValidationError) {
            response.errors = error.errors;
        }

        res.status(appError.statusCode).json(response);
        return;
    }

    // Handle Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error as unknown as { code: string; meta?: { target?: string[] } };

        if (prismaError.code === 'P2002') {
            // Unique constraint violation
            const target = prismaError.meta?.target?.join(', ') || 'field';
            res.status(409).json({
                success: false,
                error: `A record with this ${target} already exists`,
            });
            return;
        }

        if (prismaError.code === 'P2025') {
            // Record not found
            res.status(404).json({
                success: false,
                error: 'Record not found',
            });
            return;
        }
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            error: 'Invalid token',
        });
        return;
    }

    if (error.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            error: 'Token expired',
        });
        return;
    }

    // Default to 500 for unexpected errors
    const errorMessage = config.env === 'production'
        ? 'An unexpected error occurred'
        : error.message;

    res.status(500).json({
        success: false,
        error: errorMessage,
    });
}

/**
 * Handle 404 errors for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
}

export default errorHandler;
