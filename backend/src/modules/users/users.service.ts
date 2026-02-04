import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { authConfig } from '../../config/auth';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/errors';
import { CreateUserDto, UpdateUserDto, UserResponse, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { Role } from '@prisma/client';

// Extended UserResponse to include multi-site support
export interface ExtendedUserResponse extends Omit<UserResponse, 'siteId' | 'siteName'> {
    currentSiteId: string | null;
    currentSiteName?: string;
    sites: Array<{ id: string; name: string; code: string }>;
    isRevoked?: boolean;
    phone?: string | null;
}

class UsersService {
    /**
     * Get all users with pagination
     */
    async findAll(params: {
        page?: number;
        limit?: number;
        role?: Role;
        siteId?: string;
        isActive?: boolean;
        isRevoked?: boolean;
        search?: string;
    }): Promise<PaginatedResult<ExtendedUserResponse>> {
        const { page, limit, role, siteId, isActive, isRevoked, search } = params;
        const pagination = parsePaginationParams({ page, limit });

        const where: Record<string, unknown> = {};
        if (role) where.role = role;
        if (siteId) where.sites = { some: { siteId } };
        if (typeof isActive === 'boolean') where.isActive = isActive;
        if (typeof isRevoked === 'boolean') where.isRevoked = isRevoked;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    currentSite: { select: { name: true } },
                    sites: {
                        include: { site: { select: { id: true, name: true, code: true } } },
                    },
                },
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        const mappedUsers: ExtendedUserResponse[] = users.map((user) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            currentSiteId: user.currentSiteId,
            currentSiteName: user.currentSite?.name,
            sites: user.sites.map((us) => us.site),
            isActive: user.isActive,
            isRevoked: user.isRevoked,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        }));

        return buildPaginatedResult(mappedUsers, total, pagination);
    }

    /**
     * Get users by role (for Role Management screens)
     */
    async getUsersByRole(role: Role): Promise<ExtendedUserResponse[]> {
        const users = await prisma.user.findMany({
            where: { role },
            include: {
                currentSite: { select: { name: true } },
                sites: {
                    include: { site: { select: { id: true, name: true, code: true } } },
                },
            },
            orderBy: { name: 'asc' },
        });

        return users.map((user) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            currentSiteId: user.currentSiteId,
            currentSiteName: user.currentSite?.name,
            sites: user.sites.map((us) => us.site),
            isActive: user.isActive,
            isRevoked: user.isRevoked,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        }));
    }

    /**
     * Get role counts for dashboard
     */
    async getRoleCounts(): Promise<{
        siteEngineers: number;
        purchaseTeam: number;
        directors: number;
    }> {
        const [siteEngineers, purchaseTeam, directors] = await Promise.all([
            prisma.user.count({ where: { role: 'SITE_ENGINEER', isRevoked: false } }),
            prisma.user.count({ where: { role: 'PURCHASE_TEAM', isRevoked: false } }),
            prisma.user.count({ where: { role: 'DIRECTOR', isRevoked: false } }),
        ]);

        return { siteEngineers, purchaseTeam, directors };
    }

    /**
     * Get user by ID
     */
    async findById(id: string): Promise<ExtendedUserResponse> {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                currentSite: { select: { name: true } },
                sites: {
                    include: { site: { select: { id: true, name: true, code: true } } },
                },
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            currentSiteId: user.currentSiteId,
            currentSiteName: user.currentSite?.name,
            sites: user.sites.map((us) => us.site),
            isActive: user.isActive,
            isRevoked: user.isRevoked,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        };
    }

    /**
     * Create new user (admin function, not self-registration)
     */
    async create(data: CreateUserDto): Promise<ExtendedUserResponse> {
        // Validate Site Engineer has siteId
        if (data.role === Role.SITE_ENGINEER && !data.siteId) {
            throw new BadRequestError('Site Engineer must be assigned to a site');
        }

        // Check if site exists for Site Engineers
        if (data.siteId) {
            const site = await prisma.site.findUnique({ where: { id: data.siteId } });
            if (!site) {
                throw new BadRequestError('Site not found');
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, authConfig.bcrypt.saltRounds);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role,
                currentSiteId: data.siteId || null,
                sites: data.siteId ? {
                    create: [{ siteId: data.siteId }],
                } : undefined,
            },
            include: {
                currentSite: { select: { name: true } },
                sites: {
                    include: { site: { select: { id: true, name: true, code: true } } },
                },
            },
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            currentSiteId: user.currentSiteId,
            currentSiteName: user.currentSite?.name,
            sites: user.sites.map((us) => us.site),
            isActive: user.isActive,
            isRevoked: user.isRevoked,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        };
    }

    /**
     * Update user
     */
    async update(id: string, data: UpdateUserDto): Promise<ExtendedUserResponse> {
        // Check user exists
        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('User not found');
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            include: {
                currentSite: { select: { name: true } },
                sites: {
                    include: { site: { select: { id: true, name: true, code: true } } },
                },
            },
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            currentSiteId: user.currentSiteId,
            currentSiteName: user.currentSite?.name,
            sites: user.sites.map((us) => us.site),
            isActive: user.isActive,
            isRevoked: user.isRevoked,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        };
    }

    /**
     * Promote user to a higher role
     * - Site Engineer -> Purchase Team
     * - Purchase Team -> Director
     */
    async promoteUser(id: string, currentUserId: string): Promise<ExtendedUserResponse> {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.isRevoked) {
            throw new BadRequestError('Cannot promote a revoked user');
        }

        if (id === currentUserId) {
            throw new ForbiddenError('Cannot promote yourself');
        }

        let newRole: Role;
        if (user.role === 'SITE_ENGINEER') {
            newRole = 'PURCHASE_TEAM';
        } else if (user.role === 'PURCHASE_TEAM') {
            newRole = 'DIRECTOR';
        } else {
            throw new BadRequestError('User cannot be promoted further');
        }

        const updated = await prisma.user.update({
            where: { id },
            data: {
                role: newRole,
                // When promoting SE to PT, clear site assignments
                currentSiteId: newRole === 'PURCHASE_TEAM' ? null : user.currentSiteId,
            },
            include: {
                currentSite: { select: { name: true } },
                sites: {
                    include: { site: { select: { id: true, name: true, code: true } } },
                },
            },
        });

        // If promoted to PT or Director, remove site assignments
        if (newRole === 'PURCHASE_TEAM' || newRole === 'DIRECTOR') {
            await prisma.userSite.deleteMany({ where: { userId: id } });
        }

        return {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            role: updated.role,
            phone: updated.phone,
            currentSiteId: updated.currentSiteId,
            currentSiteName: updated.currentSite?.name,
            sites: [], // Promoted users (PT/Director) don't have site assignments
            isActive: updated.isActive,
            isRevoked: updated.isRevoked,
            createdAt: updated.createdAt,
            lastLoginAt: updated.lastLoginAt,
        };
    }

    /**
     * Demote user to a lower role
     * - Director -> Purchase Team
     * - Purchase Team -> Site Engineer
     */
    async demoteUser(id: string, currentUserId: string, siteId?: string): Promise<ExtendedUserResponse> {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.isRevoked) {
            throw new BadRequestError('Cannot demote a revoked user');
        }

        if (id === currentUserId) {
            throw new ForbiddenError('Cannot demote yourself');
        }

        let newRole: Role;
        if (user.role === 'DIRECTOR') {
            newRole = 'PURCHASE_TEAM';
        } else if (user.role === 'PURCHASE_TEAM') {
            newRole = 'SITE_ENGINEER';
            // Demoting to SE requires a site assignment
            if (!siteId) {
                throw new BadRequestError('Site ID is required when demoting to Site Engineer');
            }
            // Verify site exists
            const site = await prisma.site.findUnique({ where: { id: siteId } });
            if (!site) {
                throw new BadRequestError('Site not found');
            }
        } else {
            throw new BadRequestError('User cannot be demoted further');
        }

        const updated = await prisma.user.update({
            where: { id },
            data: {
                role: newRole,
                currentSiteId: newRole === 'SITE_ENGINEER' && siteId ? siteId : null,
            },
            include: {
                currentSite: { select: { name: true } },
                sites: {
                    include: { site: { select: { id: true, name: true, code: true } } },
                },
            },
        });

        // If demoted to SE, add site assignment
        if (newRole === 'SITE_ENGINEER' && siteId) {
            await prisma.userSite.create({
                data: { userId: id, siteId },
            }).catch(() => {
                // Ignore if already exists
            });
        }

        return {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            role: updated.role,
            phone: updated.phone,
            currentSiteId: updated.currentSiteId,
            currentSiteName: updated.currentSite?.name,
            sites: updated.sites.map((us) => us.site),
            isActive: updated.isActive,
            isRevoked: updated.isRevoked,
            createdAt: updated.createdAt,
            lastLoginAt: updated.lastLoginAt,
        };
    }

    /**
     * Revoke user access (critical action)
     * User cannot login but data is preserved
     */
    async revokeUser(id: string, currentUserId: string): Promise<ExtendedUserResponse> {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (id === currentUserId) {
            throw new ForbiddenError('Cannot revoke yourself');
        }

        if (user.isRevoked) {
            throw new BadRequestError('User is already revoked');
        }

        // Delete all refresh tokens for this user
        await prisma.refreshToken.deleteMany({ where: { userId: id } });

        const updated = await prisma.user.update({
            where: { id },
            data: {
                isRevoked: true,
                isActive: false,
            },
            include: {
                currentSite: { select: { name: true } },
                sites: {
                    include: { site: { select: { id: true, name: true, code: true } } },
                },
            },
        });

        return {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            role: updated.role,
            phone: updated.phone,
            currentSiteId: updated.currentSiteId,
            currentSiteName: updated.currentSite?.name,
            sites: updated.sites.map((us) => us.site),
            isActive: updated.isActive,
            isRevoked: updated.isRevoked,
            createdAt: updated.createdAt,
            lastLoginAt: updated.lastLoginAt,
        };
    }

    /**
     * Restore revoked user access
     */
    async restoreUser(id: string): Promise<ExtendedUserResponse> {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (!user.isRevoked) {
            throw new BadRequestError('User is not revoked');
        }

        const updated = await prisma.user.update({
            where: { id },
            data: {
                isRevoked: false,
                isActive: true,
            },
            include: {
                currentSite: { select: { name: true } },
                sites: {
                    include: { site: { select: { id: true, name: true, code: true } } },
                },
            },
        });

        return {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            role: updated.role,
            phone: updated.phone,
            currentSiteId: updated.currentSiteId,
            currentSiteName: updated.currentSite?.name,
            sites: updated.sites.map((us) => us.site),
            isActive: updated.isActive,
            isRevoked: updated.isRevoked,
            createdAt: updated.createdAt,
            lastLoginAt: updated.lastLoginAt,
        };
    }
}

export const usersService = new UsersService();
export default usersService;

