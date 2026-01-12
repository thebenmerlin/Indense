import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { authConfig } from '../../config/auth';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { CreateUserDto, UpdateUserDto, UserResponse, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { Role } from '@prisma/client';

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
    }): Promise<PaginatedResult<UserResponse>> {
        const { page, limit, role, siteId, isActive } = params;
        const pagination = parsePaginationParams({ page, limit });

        const where: Record<string, unknown> = {};
        if (role) where.role = role;
        if (siteId) where.siteId = siteId;
        if (typeof isActive === 'boolean') where.isActive = isActive;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    site: {
                        select: { name: true },
                    },
                },
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        const mappedUsers: UserResponse[] = users.map((user) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            siteId: user.siteId,
            siteName: user.site?.name,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        }));

        return buildPaginatedResult(mappedUsers, total, pagination);
    }

    /**
     * Get user by ID
     */
    async findById(id: string): Promise<UserResponse> {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                site: {
                    select: { name: true },
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
            siteId: user.siteId,
            siteName: user.site?.name,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        };
    }

    /**
     * Create new user
     */
    async create(data: CreateUserDto): Promise<UserResponse> {
        // Validate Site Engineer has siteId
        if (data.role === Role.SITE_ENGINEER && !data.siteId) {
            throw new BadRequestError('Site Engineer must be assigned to a site');
        }

        // Validate Purchase Team and Director don't have siteId
        if (data.role !== Role.SITE_ENGINEER && data.siteId) {
            throw new BadRequestError('Purchase Team and Director cannot be assigned to a site');
        }

        // Check if site exists
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
                siteId: data.siteId || null,
            },
            include: {
                site: {
                    select: { name: true },
                },
            },
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            siteId: user.siteId,
            siteName: user.site?.name,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        };
    }

    /**
     * Update user
     */
    async update(id: string, data: UpdateUserDto): Promise<UserResponse> {
        // Check user exists
        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('User not found');
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            include: {
                site: {
                    select: { name: true },
                },
            },
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            siteId: user.siteId,
            siteName: user.site?.name,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        };
    }
}

export const usersService = new UsersService();
export default usersService;
