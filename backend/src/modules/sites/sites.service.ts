import { NotificationType } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { CreateSiteDto, UpdateSiteDto, SiteResponse, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';
import notificationsService from '../notifications/notifications.service';

interface SiteWithCounts extends SiteResponse {
    indentCount?: number;
    engineerCount?: number;
}

interface SiteWithEngineers extends SiteResponse {
    engineers: Array<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
    }>;
}

class SitesService {
    async findAll(params: {
        page?: number;
        limit?: number;
        isActive?: boolean;
        isClosed?: boolean;
        search?: string;
        includeCounts?: boolean;
    }): Promise<PaginatedResult<SiteWithCounts>> {
        const { page, limit, isActive, isClosed, search, includeCounts } = params;
        const pagination = parsePaginationParams({ page, limit });

        const where: Record<string, unknown> = {};
        if (typeof isActive === 'boolean') where.isActive = isActive;
        if (typeof isClosed === 'boolean') where.isClosed = isClosed;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [sites, total] = await Promise.all([
            prisma.site.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { name: 'asc' },
                include: includeCounts ? {
                    _count: {
                        select: {
                            indents: true,
                            users: true,
                        },
                    },
                } : undefined,
            }),
            prisma.site.count({ where }),
        ]);

        const result = sites.map(site => {
            const { _count, ...siteData } = site as typeof site & { _count?: { indents: number; users: number } };
            return {
                ...siteData,
                indentCount: _count?.indents,
                engineerCount: _count?.users,
            };
        });

        return buildPaginatedResult(result as SiteWithCounts[], total, pagination);
    }

    async findById(id: string): Promise<SiteResponse> {
        const site = await prisma.site.findUnique({ where: { id } });
        if (!site) {
            throw new NotFoundError('Site not found');
        }
        return site as SiteResponse;
    }

    /**
     * Get site with engineers and indent count
     */
    async findByIdWithEngineers(id: string): Promise<SiteWithEngineers & { indentCount: number }> {
        const site = await prisma.site.findUnique({
            where: { id },
            include: {
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        indents: true,
                    },
                },
            },
        });

        if (!site) {
            throw new NotFoundError('Site not found');
        }

        const { users, _count, ...siteData } = site;
        return {
            ...siteData,
            engineers: users.map(u => u.user),
            indentCount: _count.indents,
        } as SiteWithEngineers & { indentCount: number };
    }

    async create(data: CreateSiteDto & {
        startDate?: Date;
        expectedHandoverDate?: Date;
        engineerIds?: string[];
    }): Promise<SiteResponse> {
        const { engineerIds, ...siteData } = data;

        const site = await prisma.site.create({
            data: siteData,
        });

        // Assign engineers if provided
        if (engineerIds && engineerIds.length > 0) {
            await prisma.userSite.createMany({
                data: engineerIds.map(userId => ({
                    userId,
                    siteId: site.id,
                })),
                skipDuplicates: true,
            });

            await notificationsService.createMany(
                NotificationType.SITE_ASSIGNED,
                engineerIds,
                undefined,
                `You have been assigned to site ${site.name}.`
            );
        }

        return site as SiteResponse;
    }

    async update(id: string, data: UpdateSiteDto & {
        startDate?: Date;
        expectedHandoverDate?: Date;
    }): Promise<SiteResponse> {
        const existing = await prisma.site.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('Site not found');
        }

        const site = await prisma.site.update({ where: { id }, data });
        return site as SiteResponse;
    }

    /**
     * Assign engineers to a site
     */
    async assignEngineers(siteId: string, engineerIds: string[]): Promise<void> {
        const site = await prisma.site.findUnique({ where: { id: siteId } });
        if (!site) {
            throw new NotFoundError('Site not found');
        }

        // Verify all users exist and are site engineers
        const users = await prisma.user.findMany({
            where: {
                id: { in: engineerIds },
                role: 'SITE_ENGINEER',
                isActive: true,
                isRevoked: false,
            },
        });

        if (users.length !== engineerIds.length) {
            throw new BadRequestError('Some users are not valid site engineers');
        }

        await prisma.userSite.createMany({
            data: engineerIds.map(userId => ({
                userId,
                siteId,
            })),
            skipDuplicates: true,
        });

        await notificationsService.createMany(
            NotificationType.SITE_ASSIGNED,
            engineerIds,
            undefined,
            'You have been assigned to a new site.'
        );
    }

    /**
     * Remove an engineer from a site
     */
    async removeEngineer(siteId: string, engineerId: string): Promise<void> {
        const site = await prisma.site.findUnique({ where: { id: siteId } });
        if (!site) {
            throw new NotFoundError('Site not found');
        }

        await prisma.userSite.deleteMany({
            where: {
                siteId,
                userId: engineerId,
            },
        });

        // If this was user's current site, clear it
        await prisma.user.updateMany({
            where: {
                id: engineerId,
                currentSiteId: siteId,
            },
            data: {
                currentSiteId: null,
            },
        });
    }

    /**
     * Get all engineers not assigned to a specific site (for add engineer modal)
     */
    async getAvailableEngineers(siteId: string): Promise<Array<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
    }>> {
        const assignedUserIds = await prisma.userSite.findMany({
            where: { siteId },
            select: { userId: true },
        });

        const assignedIds = assignedUserIds.map(u => u.userId);

        const engineers = await prisma.user.findMany({
            where: {
                role: 'SITE_ENGINEER',
                isActive: true,
                isRevoked: false,
                id: { notIn: assignedIds.length > 0 ? assignedIds : ['none'] },
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
            },
            orderBy: { name: 'asc' },
        });

        return engineers;
    }

    /**
     * Close a site (mark as completed)
     */
    async closeSite(id: string): Promise<SiteResponse> {
        const site = await prisma.site.findUnique({ where: { id } });
        if (!site) {
            throw new NotFoundError('Site not found');
        }

        if (site.isClosed) {
            throw new BadRequestError('Site is already closed');
        }

        const updated = await prisma.site.update({
            where: { id },
            data: {
                isClosed: true,
                closedAt: new Date(),
                isActive: false,
            },
        });

        return updated as SiteResponse;
    }

    /**
     * Delete a site (soft delete - mark inactive)
     */
    async deleteSite(id: string): Promise<void> {
        const site = await prisma.site.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { indents: true },
                },
            },
        });

        if (!site) {
            throw new NotFoundError('Site not found');
        }

        // Prevent deletion if site has indents
        if (site._count.indents > 0) {
            throw new BadRequestError('Cannot delete site with existing indents. Close the site instead.');
        }

        // Remove all user assignments
        await prisma.userSite.deleteMany({ where: { siteId: id } });

        // Clear current site for any users
        await prisma.user.updateMany({
            where: { currentSiteId: id },
            data: { currentSiteId: null },
        });

        // Soft delete - just mark inactive
        await prisma.site.update({
            where: { id },
            data: { isActive: false },
        });
    }

    /**
     * Public method for registration - returns only active sites with minimal data
     */
    async findAllPublic(): Promise<Array<{ id: string; name: string; code: string }>> {
        const sites = await prisma.site.findMany({
            where: { isActive: true, isClosed: false },
            select: {
                id: true,
                name: true,
                code: true,
            },
            orderBy: { name: 'asc' },
        });

        return sites;
    }
}

export const sitesService = new SitesService();
export default sitesService;
