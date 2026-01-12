import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError } from '../utils/errors';

/**
 * Site filtering middleware
 * 
 * Critical for multi-site data isolation:
 * - Site Engineers can ONLY access data for their assigned site
 * - Purchase Team and Director can access all sites
 * 
 * This middleware adds siteId filter to req for use in queries
 */

declare global {
    namespace Express {
        interface Request {
            siteFilter?: {
                siteId?: string;
                applySiteFilter: boolean;
            };
        }
    }
}

/**
 * Apply site filtering based on user role
 * Site Engineers are restricted to their assigned site
 */
export function applySiteFilter(): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                req.siteFilter = { applySiteFilter: false };
                return next();
            }

            const { role, siteId } = req.user;

            if (role === Role.SITE_ENGINEER) {
                // Site Engineers MUST have a siteId
                if (!siteId) {
                    throw new ForbiddenError('Site Engineer must be assigned to a site');
                }

                // Apply site filter for all queries
                req.siteFilter = {
                    siteId,
                    applySiteFilter: true,
                };
            } else {
                // Purchase Team and Director can access all sites
                // They can optionally filter by site using query params
                const querySiteId = req.query.siteId as string | undefined;

                req.siteFilter = {
                    siteId: querySiteId || undefined,
                    applySiteFilter: !!querySiteId,
                };
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Validate that Site Engineer is accessing their own site's resource
 */
export function validateSiteAccess(resourceSiteId: string, req: Request): void {
    if (!req.user) {
        throw new ForbiddenError('Authentication required');
    }

    const { role, siteId: userSiteId } = req.user;

    if (role === Role.SITE_ENGINEER) {
        if (!userSiteId || resourceSiteId !== userSiteId) {
            throw new ForbiddenError('Access denied to this site\'s data');
        }
    }
    // Purchase Team and Director can access any site
}

/**
 * Build Prisma where clause with site filter
 */
export function buildSiteWhereClause(
    req: Request,
    additionalWhere: Record<string, unknown> = {}
): Record<string, unknown> {
    const where: Record<string, unknown> = { ...additionalWhere };

    if (req.siteFilter?.applySiteFilter && req.siteFilter.siteId) {
        where.siteId = req.siteFilter.siteId;
    }

    return where;
}

export default applySiteFilter;
