import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { authConfig } from '../../config/auth';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { CreateUserDto, UpdateUserDto, UserResponse, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { Role } from '@prisma/client';

// Extended UserResponse to include multi-site support
export interface ExtendedUserResponse extends Omit<UserResponse, 'siteId' | 'siteName'> {
    currentSiteId: string | null;
    currentSiteName?: string;
    sites: Array<{ id: string; name: string; code: string }>;
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
    }): Promise<PaginatedResult<ExtendedUserResponse>> {
        const { page, limit, role, siteId, isActive } = params;
        const pagination = parsePaginationParams({ page, limit });

        const where: Record<string, unknown> = {};
        if (role) where.role = role;
        if (siteId) where.sites = { some: { siteId } };
        if (typeof isActive === 'boolean') where.isActive = isActive;

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
            currentSiteId: user.currentSiteId,
            currentSiteName: user.currentSite?.name,
            sites: user.sites.map((us) => us.site),
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        }));

        return buildPaginatedResult(mappedUsers, total, pagination);
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
            currentSiteId: user.currentSiteId,
            currentSiteName: user.currentSite?.name,
            sites: user.sites.map((us) => us.site),
            isActive: user.isActive,
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
            currentSiteId: user.currentSiteId,
            currentSiteName: user.currentSite?.name,
            sites: user.sites.map((us) => us.site),
            isActive: user.isActive,
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
            currentSiteId: user.currentSiteId,
            currentSiteName: user.currentSite?.name,
            sites: user.sites.map((us) => us.site),
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        };
    }
}

export const usersService = new UsersService();
export default usersService;

