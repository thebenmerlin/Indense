import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { authConfig } from '../config/auth';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';
import { JwtPayload, AuthenticatedUser } from '../types/express';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        let payload: JwtPayload;
        try {
            payload = jwt.verify(token, authConfig.jwt.secret) as JwtPayload;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError('Token expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError('Invalid token');
            }
            throw error;
        }

        // Verify user exists and is active
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                siteId: true,
                isActive: true,
            },
        });

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        if (!user.isActive) {
            throw new UnauthorizedError('User account is deactivated');
        }

        // Attach user to request
        const authenticatedUser: AuthenticatedUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            siteId: user.siteId,
        };

        req.user = authenticatedUser;

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Optional authentication middleware
 * Same as authenticate but doesn't fail if no token is present
 */
export async function optionalAuthenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    return authenticate(req, res, next);
}

export default authenticate;
