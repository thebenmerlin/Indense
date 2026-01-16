import { IndentStatus, Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { CreateIndentDto, IndentFilters, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { logIndentStateChange } from '../../middleware/auditLog';
import { AuditAction } from '../../types/enums';
import {
    validateTransition,
    canPurchaseApprove,
    canDirectorApprove,
    canClose,
} from './indents.stateMachine';

class IndentsService {
    /**
     * Generate unique indent number
     */
    private async generateIndentNumber(siteCode: string): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const prefix = `IND-${siteCode}-${year}${month}`;

        const lastIndent = await prisma.indent.findFirst({
            where: { indentNumber: { startsWith: prefix } },
            orderBy: { indentNumber: 'desc' },
        });

        let sequence = 1;
        if (lastIndent) {
            const lastSeq = parseInt(lastIndent.indentNumber.split('-').pop() || '0', 10);
            sequence = lastSeq + 1;
        }

        return `${prefix}-${String(sequence).padStart(4, '0')}`;
    }

    /**
     * Get all indents with filtering and pagination
     */
    async findAll(
        filters: IndentFilters,
        pagination: { page?: number; limit?: number },
        userRole: Role,
        userSiteId: string | null
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(pagination);

        const where: Record<string, unknown> = {};

        // Site filter - Site Engineers can only see their site's indents
        if (userRole === Role.SITE_ENGINEER && userSiteId) {
            where.siteId = userSiteId;
        } else if (filters.siteId) {
            where.siteId = filters.siteId;
        }

        if (filters.status) {
            where.status = Array.isArray(filters.status)
                ? { in: filters.status }
                : filters.status;
        }
        if (filters.createdById) where.createdById = filters.createdById;
        if (filters.fromDate || filters.toDate) {
            where.createdAt = {};
            if (filters.fromDate) (where.createdAt as Record<string, Date>).gte = filters.fromDate;
            if (filters.toDate) (where.createdAt as Record<string, Date>).lte = filters.toDate;
        }
        if (filters.search) {
            where.OR = [
                { indentNumber: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const [indents, total] = await Promise.all([
            prisma.indent.findMany({
                where,
                include: {
                    site: { select: { name: true, code: true } },
                    createdBy: { select: { name: true } },
                    items: {
                        include: { material: { select: { name: true, code: true, unit: true } } },
                    },
                    _count: { select: { items: true } },
                },
                skip: pag.skip,
                take: pag.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.indent.count({ where }),
        ]);

        return buildPaginatedResult(indents, total, pag);
    }

    /**
     * Get indent by ID
     */
    async findById(
        id: string,
        userRole: Role,
        userSiteId: string | null
    ): Promise<unknown> {
        const indent = await prisma.indent.findUnique({
            where: { id },
            include: {
                site: true,
                createdBy: { select: { id: true, name: true, email: true } },
                purchaseApprovedBy: { select: { id: true, name: true } },
                directorApprovedBy: { select: { id: true, name: true } },
                items: {
                    include: {
                        material: true,
                        damageReports: true,
                    },
                },
                order: {
                    include: { orderItems: true },
                },
            },
        });

        if (!indent) throw new NotFoundError('Indent not found');

        // Site Engineers can only view their site's indents
        if (userRole === Role.SITE_ENGINEER && indent.siteId !== userSiteId) {
            throw new ForbiddenError('Access denied to this indent');
        }

        return indent;
    }

    /**
     * Create new indent (Site Engineer only)
     */
    async create(
        data: CreateIndentDto,
        userId: string,
        siteId: string
    ): Promise<unknown> {
        // Get site code for indent number
        const site = await prisma.site.findUnique({ where: { id: siteId } });
        if (!site) throw new BadRequestError('Site not found');

        // Validate all materials exist
        const materialIds = data.items.map((item) => item.materialId);
        const materials = await prisma.material.findMany({
            where: { id: { in: materialIds }, isActive: true },
        });

        if (materials.length !== materialIds.length) {
            throw new BadRequestError('One or more materials not found or inactive');
        }

        const indentNumber = await this.generateIndentNumber(site.code);

        const indent = await prisma.indent.create({
            data: {
                indentNumber,
                status: IndentStatus.SUBMITTED,
                siteId,
                createdById: userId,
                priority: data.priority || 'NORMAL',
                notes: data.notes,
                requiredByDate: data.requiredByDate,
                items: {
                    create: data.items.map((item) => ({
                        materialId: item.materialId,
                        requestedQty: item.requestedQty,
                        pendingQty: item.requestedQty,
                        specifications: item.specifications,
                        notes: item.notes,
                    })),
                },
            },
            include: {
                items: { include: { material: true } },
                site: true,
            },
        });

        // Audit log
        await logIndentStateChange(
            userId,
            indent.id,
            AuditAction.INDENT_CREATED,
            '',
            IndentStatus.SUBMITTED,
            { indentNumber }
        );

        return indent;
    }

    /**
     * Purchase team approval
     */
    async purchaseApprove(
        id: string,
        userId: string,
        remarks?: string
    ): Promise<unknown> {
        const indent = await prisma.indent.findUnique({ where: { id } });
        if (!indent) throw new NotFoundError('Indent not found');

        if (!canPurchaseApprove(indent.status)) {
            throw new BadRequestError(`Cannot approve indent in ${indent.status} status`);
        }

        validateTransition(indent.status, IndentStatus.PURCHASE_APPROVED);

        const updated = await prisma.indent.update({
            where: { id },
            data: {
                status: IndentStatus.PURCHASE_APPROVED,
                purchaseApprovedById: userId,
                purchaseApprovedAt: new Date(),
                purchaseRemarks: remarks,
            },
            include: { items: true, site: true },
        });

        await logIndentStateChange(
            userId,
            id,
            AuditAction.INDENT_PURCHASE_APPROVED,
            indent.status,
            IndentStatus.PURCHASE_APPROVED,
            { remarks }
        );

        return updated;
    }

    /**
     * Director approval
     */
    async directorApprove(
        id: string,
        userId: string,
        remarks?: string
    ): Promise<unknown> {
        const indent = await prisma.indent.findUnique({ where: { id } });
        if (!indent) throw new NotFoundError('Indent not found');

        if (!canDirectorApprove(indent.status)) {
            throw new BadRequestError(`Cannot approve indent in ${indent.status} status`);
        }

        validateTransition(indent.status, IndentStatus.DIRECTOR_APPROVED);

        const updated = await prisma.indent.update({
            where: { id },
            data: {
                status: IndentStatus.DIRECTOR_APPROVED,
                directorApprovedById: userId,
                directorApprovedAt: new Date(),
                directorRemarks: remarks,
            },
            include: { items: true, site: true },
        });

        await logIndentStateChange(
            userId,
            id,
            AuditAction.INDENT_DIRECTOR_APPROVED,
            indent.status,
            IndentStatus.DIRECTOR_APPROVED,
            { remarks }
        );

        return updated;
    }

    /**
     * Reject indent (Purchase Team or Director)
     */
    async reject(
        id: string,
        userId: string,
        reason: string
    ): Promise<unknown> {
        const indent = await prisma.indent.findUnique({ where: { id } });
        if (!indent) throw new NotFoundError('Indent not found');

        // Can only reject from SUBMITTED or PURCHASE_APPROVED states
        const rejectableStatuses: IndentStatus[] = [IndentStatus.SUBMITTED, IndentStatus.PURCHASE_APPROVED];
        if (!rejectableStatuses.includes(indent.status)) {
            throw new BadRequestError(`Cannot reject indent in ${indent.status} status`);
        }

        validateTransition(indent.status, IndentStatus.REJECTED);

        const action = indent.status === IndentStatus.SUBMITTED
            ? AuditAction.INDENT_PURCHASE_REJECTED
            : AuditAction.INDENT_DIRECTOR_REJECTED;

        const updated = await prisma.indent.update({
            where: { id },
            data: {
                status: IndentStatus.REJECTED,
                rejectedById: userId,
                rejectedAt: new Date(),
                rejectionReason: reason,
            },
            include: { items: true, site: true },
        });

        await logIndentStateChange(
            userId,
            id,
            action,
            indent.status,
            IndentStatus.REJECTED,
            { reason }
        );

        return updated;
    }

    /**
     * Close indent (only if fully received and no unresolved damages)
     */
    async close(id: string, userId: string): Promise<unknown> {
        const indent = await prisma.indent.findUnique({
            where: { id },
            include: {
                items: {
                    include: { damageReports: { where: { isResolved: false } } },
                },
            },
        });

        if (!indent) throw new NotFoundError('Indent not found');

        if (!canClose(indent.status)) {
            throw new BadRequestError('Indent must be fully received before closing');
        }

        // Check for unresolved damage reports
        const hasUnresolvedDamage = indent.items.some(
            (item) => item.damageReports.length > 0
        );

        if (hasUnresolvedDamage) {
            throw new BadRequestError('Cannot close indent with unresolved damage reports');
        }

        validateTransition(indent.status, IndentStatus.CLOSED);

        const updated = await prisma.indent.update({
            where: { id },
            data: {
                status: IndentStatus.CLOSED,
                closedAt: new Date(),
            },
        });

        await logIndentStateChange(
            userId,
            id,
            AuditAction.INDENT_CLOSED,
            indent.status,
            IndentStatus.CLOSED
        );

        return updated;
    }
}

export const indentsService = new IndentsService();
export default indentsService;
