import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * Authorization middleware factory
 * Creates middleware that checks if user has required role(s)
 */
export function authorize(...allowedRoles: Role[]): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new UnauthorizedError('Authentication required');
            }

            if (allowedRoles.length === 0) {
                // No specific roles required, just need to be authenticated
                return next();
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new ForbiddenError(
                    `Access denied. Required role(s): ${allowedRoles.join(', ')}`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Middleware to ensure user is a Site Engineer
 */
export const requireSiteEngineer = authorize(Role.SITE_ENGINEER);

/**
 * Middleware to ensure user is Purchase Team
 */
export const requirePurchaseTeam = authorize(Role.PURCHASE_TEAM);

/**
 * Middleware to ensure user is Director
 */
export const requireDirector = authorize(Role.DIRECTOR);

/**
 * Middleware for Purchase Team or Director (head office users)
 */
export const requireHeadOffice = authorize(Role.PURCHASE_TEAM, Role.DIRECTOR);

/**
 * Middleware for any authenticated user
 */
export const requireAuthenticated = authorize();

export default authorize;
