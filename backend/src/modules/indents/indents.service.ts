import { IndentStatus, Role, NotificationType } from '@prisma/client';
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
import notificationsService from '../notifications/notifications.service';

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
                receipts: {
                    include: {
                        images: true,
                        createdBy: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: 'desc' },
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

        // Process items - create new materials if needed
        const processedItems: Array<{
            materialId: string;
            requestedQty: number;
            specifications: Record<string, string> | undefined;
            notes: string | undefined;
            isUrgent: boolean;
        }> = [];

        for (const item of data.items) {
            let materialId = item.materialId;

            // Check if this is a new material (temp ID or marked as new)
            if (item.materialId.startsWith('temp-') || item.isNewMaterial) {
                if (!item.newMaterial) {
                    throw new BadRequestError('New material data is required for new materials');
                }

                const newMat = item.newMaterial;

                // Find or create category
                let categoryId: string | undefined;
                if (newMat.categoryId) {
                    categoryId = newMat.categoryId;
                } else if (newMat.categoryName) {
                    // Find existing category by name
                    let category = await prisma.itemGroup.findFirst({
                        where: { name: { equals: newMat.categoryName, mode: 'insensitive' } },
                    });

                    if (!category) {
                        // Create new category
                        category = await prisma.itemGroup.create({
                            data: { name: newMat.categoryName, isActive: true },
                        });
                    }
                    categoryId = category.id;
                }

                if (!categoryId) {
                    throw new BadRequestError('Category is required for new materials');
                }

                // Find or create unit
                let unitId: string | undefined;
                if (newMat.unitId) {
                    unitId = newMat.unitId;
                } else if (newMat.unitCode || newMat.unitName) {
                    // Find existing unit by code or name
                    let unit = await prisma.unitOfMeasure.findFirst({
                        where: {
                            OR: [
                                { code: { equals: newMat.unitCode || '', mode: 'insensitive' } },
                                { name: { equals: newMat.unitName || '', mode: 'insensitive' } },
                            ],
                        },
                    });

                    if (!unit && (newMat.unitCode || newMat.unitName)) {
                        // Create new unit
                        const unitCode = newMat.unitCode || newMat.unitName!.substring(0, 10).toUpperCase();
                        unit = await prisma.unitOfMeasure.create({
                            data: {
                                code: unitCode,
                                name: newMat.unitName || unitCode,
                                isActive: true,
                            },
                        });
                    }
                    unitId = unit?.id;
                }

                if (!unitId) {
                    throw new BadRequestError('Unit is required for new materials');
                }

                // Generate material code
                const materialCode = `NEW-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

                // Create the new material
                const newMaterial = await prisma.material.create({
                    data: {
                        name: newMat.name,
                        code: materialCode,
                        itemGroupId: categoryId,
                        unitId: unitId,
                        description: [newMat.specification, newMat.dimensions, newMat.colour].filter(Boolean).join(' | ') || null,
                        specifications: {
                            specification: newMat.specification || '',
                            dimensions: newMat.dimensions || '',
                            colour: newMat.colour || '',
                        },
                        isSystemData: false,
                        isActive: true,
                    },
                });

                materialId = newMaterial.id;
            } else {
                // Validate existing material
                const material = await prisma.material.findUnique({
                    where: { id: materialId, isActive: true },
                });

                if (!material) {
                    throw new BadRequestError(`Material not found: ${materialId}`);
                }
            }

            processedItems.push({
                materialId,
                requestedQty: item.requestedQty,
                specifications: item.specifications,
                notes: item.notes,
                isUrgent: item.isUrgent || false,
            });
        }

        const indentNumber = await this.generateIndentNumber(site.code);

        const indent = await prisma.indent.create({
            data: {
                indentNumber,
                name: data.name,
                description: data.description || null,
                status: IndentStatus.SUBMITTED,
                siteId,
                createdById: userId,
                priority: data.priority || 'NORMAL',
                notes: data.notes,
                requiredByDate: data.requiredByDate,
                expectedDeliveryDate: data.expectedDeliveryDate,
                items: {
                    create: processedItems.map((item) => ({
                        materialId: item.materialId,
                        requestedQty: item.requestedQty,
                        pendingQty: item.requestedQty,
                        specifications: item.specifications,
                        notes: item.notes,
                        isUrgent: item.isUrgent,
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

        await notificationsService.notifyRole(
            NotificationType.INDENT_SUBMITTED,
            Role.PURCHASE_TEAM,
            indent.id,
            `New indent ${indent.indentNumber} submitted and awaiting review.`
        );

        await notificationsService.notifyRole(
            NotificationType.INDENT_SUBMITTED,
            Role.DIRECTOR,
            indent.id,
            `Indent ${indent.indentNumber} submitted and awaiting approval.`
        );

        if (indent.priority === 'URGENT') {
            await notificationsService.notifyRole(
                NotificationType.INDENT_URGENT,
                Role.PURCHASE_TEAM,
                indent.id,
                `Urgent indent ${indent.indentNumber} requires immediate attention.`
            );

            await notificationsService.notifyRole(
                NotificationType.INDENT_URGENT,
                Role.DIRECTOR,
                indent.id,
                `Urgent indent ${indent.indentNumber} requires approval.`
            );
        }

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

        await notificationsService.notifySiteEngineer(
            NotificationType.INDENT_PURCHASE_APPROVED,
            id,
            `Indent ${indent.indentNumber} approved by Purchase Team and awaiting Director approval.`
        );

        await notificationsService.notifyRole(
            NotificationType.INDENT_PURCHASE_APPROVED,
            Role.DIRECTOR,
            id,
            `Indent ${indent.indentNumber} is ready for your approval.`
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

        await notificationsService.notifySiteEngineer(
            NotificationType.INDENT_DIRECTOR_APPROVED,
            id,
            `Indent ${indent.indentNumber} fully approved. Order can now be placed.`
        );

        await notificationsService.notifyRole(
            NotificationType.INDENT_DIRECTOR_APPROVED,
            Role.PURCHASE_TEAM,
            id,
            `Indent ${indent.indentNumber} approved by Director. Proceed to ordering.`
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

        await notificationsService.notifySiteEngineer(
            NotificationType.INDENT_REJECTED,
            id,
            `Indent ${indent.indentNumber} rejected. Reason: ${reason}`
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

        await notificationsService.notifyRole(
            NotificationType.INDENT_CLOSED,
            Role.PURCHASE_TEAM,
            id,
            `Indent ${indent.indentNumber} has been closed.`
        );

        await notificationsService.notifyRole(
            NotificationType.INDENT_CLOSED,
            Role.DIRECTOR,
            id,
            `Indent ${indent.indentNumber} has been closed.`
        );

        return updated;
    }

    /**
     * Put indent on hold (Director only)
     * Can be used to temporarily pause processing of an indent
     */
    async putOnHold(
        id: string,
        userId: string,
        reason: string
    ): Promise<unknown> {
        const indent = await prisma.indent.findUnique({ where: { id } });
        if (!indent) throw new NotFoundError('Indent not found');

        // Can only put on hold if not already on hold, closed, or rejected
        const nonHoldableStatuses: IndentStatus[] = [IndentStatus.CLOSED, IndentStatus.REJECTED];
        if (nonHoldableStatuses.includes(indent.status)) {
            throw new BadRequestError(`Cannot put indent on hold in ${indent.status} status`);
        }

        if (indent.isOnHold) {
            throw new BadRequestError('Indent is already on hold');
        }

        const updated = await prisma.indent.update({
            where: { id },
            data: {
                isOnHold: true,
                onHoldAt: new Date(),
                onHoldById: userId,
                onHoldReason: reason,
            },
            include: { items: true, site: true, createdBy: { select: { name: true } } },
        });

        await notificationsService.notifySiteEngineer(
            NotificationType.INDENT_ON_HOLD,
            id,
            `Your indent "${indent.name}" is on hold. Reason: ${reason}`
        );

        return updated;
    }

    /**
     * Release indent from hold (Director only)
     */
    async releaseFromHold(id: string, userId: string): Promise<unknown> {
        const indent = await prisma.indent.findUnique({ where: { id } });
        if (!indent) throw new NotFoundError('Indent not found');

        if (!indent.isOnHold) {
            throw new BadRequestError('Indent is not on hold');
        }

        const updated = await prisma.indent.update({
            where: { id },
            data: {
                isOnHold: false,
                releasedFromHoldAt: new Date(),
            },
            include: { items: true, site: true, createdBy: { select: { name: true } } },
        });

        await notificationsService.notifySiteEngineer(
            NotificationType.INDENT_ON_HOLD,
            id,
            `Your indent "${indent.name}" has been released from hold.`
        );

        return updated;
    }

    /**
     * Update arrival status for an indent item (Site Engineer only)
     * GREEN = ARRIVED, YELLOW = PARTIAL, RED = NOT_ARRIVED
     */
    async updateArrivalStatus(
        indentId: string,
        itemId: string,
        userId: string,
        siteId: string,
        arrivalStatus: string,
        arrivalNotes?: string
    ): Promise<unknown> {
        // Find the indent and verify access
        const indent = await prisma.indent.findUnique({
            where: { id: indentId },
            include: { items: true },
        });

        if (!indent) throw new NotFoundError('Indent not found');

        // Site Engineers can only update their site's indents
        if (indent.siteId !== siteId) {
            throw new ForbiddenError('Access denied to this indent');
        }

        // Can only update arrival status after order is placed (purchased)
        const purchasedStatuses: IndentStatus[] = [
            IndentStatus.ORDER_PLACED,
            IndentStatus.PARTIALLY_RECEIVED,
            IndentStatus.FULLY_RECEIVED,
        ];
        if (!purchasedStatuses.includes(indent.status)) {
            throw new BadRequestError('Can only update arrival status after order is placed');
        }

        // Find the item
        const item = indent.items.find((i) => i.id === itemId);
        if (!item) {
            throw new NotFoundError('Indent item not found');
        }

        // Update the item
        const updated = await prisma.indentItem.update({
            where: { id: itemId },
            data: {
                arrivalStatus,
                arrivalNotes: arrivalStatus === 'PARTIAL' ? arrivalNotes : null,
            },
            include: {
                material: true,
            },
        });

        // Refresh indent items to check overall arrival status
        const refreshedIndent = await prisma.indent.findUnique({
            where: { id: indentId },
            include: { items: true },
        });

        if (refreshedIndent) {
            // Check if any item has PARTIAL or NOT_ARRIVED status
            const hasPartialOrNotArrived = refreshedIndent.items.some(
                (i) => i.arrivalStatus === 'PARTIAL' || i.arrivalStatus === 'NOT_ARRIVED'
            );

            // Check if all items are ARRIVED
            const allArrived = refreshedIndent.items.every(
                (i) => i.arrivalStatus === 'ARRIVED'
            );

            // Update indent status based on arrival statuses
            if (hasPartialOrNotArrived && refreshedIndent.status === IndentStatus.ORDER_PLACED) {
                await prisma.indent.update({
                    where: { id: indentId },
                    data: { status: IndentStatus.PARTIALLY_RECEIVED },
                });

                // Notify PT and Director about partial receipt
                const partialMessage = `Indent ${refreshedIndent.indentNumber} has materials with partial or pending arrival.`;
                await notificationsService.notifyRole(
                    NotificationType.MATERIAL_RECEIVED,
                    Role.PURCHASE_TEAM,
                    indentId,
                    partialMessage
                );

                await notificationsService.notifyRole(
                    NotificationType.MATERIAL_RECEIVED,
                    Role.DIRECTOR,
                    indentId,
                    partialMessage
                );
            } else if (allArrived && refreshedIndent.items.length > 0 &&
                (refreshedIndent.status === IndentStatus.ORDER_PLACED ||
                    refreshedIndent.status === IndentStatus.PARTIALLY_RECEIVED)) {
                await prisma.indent.update({
                    where: { id: indentId },
                    data: { status: IndentStatus.FULLY_RECEIVED },
                });

                // Notify about full receipt
                const fullMessage = `All materials for indent ${refreshedIndent.indentNumber} have arrived.`;
                await notificationsService.notifyRole(
                    NotificationType.MATERIAL_RECEIVED,
                    Role.PURCHASE_TEAM,
                    indentId,
                    fullMessage
                );

                await notificationsService.notifyRole(
                    NotificationType.MATERIAL_RECEIVED,
                    Role.DIRECTOR,
                    indentId,
                    fullMessage
                );
            }
        }

        // If NOT_ARRIVED, notify Purchase Team and Director via push
        if (arrivalStatus === 'NOT_ARRIVED') {
            const message = `Material "${updated.material.name}" marked as not arrived for indent ${indent.indentNumber}`;
            await notificationsService.notifyRole(
                NotificationType.MATERIAL_RECEIVED,
                Role.PURCHASE_TEAM,
                indentId,
                message
            );

            await notificationsService.notifyRole(
                NotificationType.MATERIAL_RECEIVED,
                Role.DIRECTOR,
                indentId,
                message
            );
        }

        return updated;
    }

    /**
     * Get pending indents count for Purchase Team dashboard badge
     * Pending = SUBMITTED status (awaiting PT approval)
     */
    async getPendingCount(siteId?: string): Promise<number> {
        const where: Record<string, unknown> = {
            status: IndentStatus.SUBMITTED,
        };

        if (siteId) {
            where.siteId = siteId;
        }

        return prisma.indent.count({ where });
    }

    /**
     * Get indent statistics for PT/Director dashboard
     */
    async getStats(siteId?: string): Promise<{
        totalIndents: number;
        pendingIndents: number;
        approvedIndents: number;
        purchasedIndents: number;
        closedIndents: number;
    }> {
        const baseWhere: Record<string, unknown> = {};
        if (siteId) {
            baseWhere.siteId = siteId;
        }

        const [total, pending, ptApproved, directorApproved, purchased, closed] = await Promise.all([
            prisma.indent.count({ where: baseWhere }),
            prisma.indent.count({ where: { ...baseWhere, status: IndentStatus.SUBMITTED } }),
            prisma.indent.count({ where: { ...baseWhere, status: IndentStatus.PURCHASE_APPROVED } }),
            prisma.indent.count({ where: { ...baseWhere, status: IndentStatus.DIRECTOR_APPROVED } }),
            prisma.indent.count({
                where: {
                    ...baseWhere,
                    status: { in: [IndentStatus.ORDER_PLACED, IndentStatus.PARTIALLY_RECEIVED, IndentStatus.FULLY_RECEIVED] },
                },
            }),
            prisma.indent.count({ where: { ...baseWhere, status: IndentStatus.CLOSED } }),
        ]);

        return {
            totalIndents: total,
            pendingIndents: pending,
            approvedIndents: ptApproved + directorApproved,
            purchasedIndents: purchased,
            closedIndents: closed,
        };
    }

    /**
     * Close indent by Site Engineer (different from admin close)
     * Can only close if all items are arrived and no unresolved damages
     */
    async closeByEngineer(id: string, userId: string, siteId: string): Promise<unknown> {
        const indent = await prisma.indent.findUnique({
            where: { id },
            include: {
                items: {
                    include: { damageReports: { where: { isResolved: false } } },
                },
                order: true,
            },
        });

        if (!indent) throw new NotFoundError('Indent not found');

        // Site Engineers can only close their site's indents
        if (indent.siteId !== siteId) {
            throw new ForbiddenError('Access denied to this indent');
        }

        // Must have an order (purchased)
        if (!indent.order) {
            throw new BadRequestError('Indent must be purchased before closing');
        }

        // Check for unresolved damage reports
        const hasUnresolvedDamage = indent.items.some(
            (item) => item.damageReports.length > 0
        );

        if (hasUnresolvedDamage) {
            throw new BadRequestError('Cannot close indent with unresolved damage reports');
        }

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

        await notificationsService.notifyRole(
            NotificationType.INDENT_CLOSED,
            Role.PURCHASE_TEAM,
            id,
            `Indent ${indent.indentNumber} has been closed.`
        );

        await notificationsService.notifyRole(
            NotificationType.INDENT_CLOSED,
            Role.DIRECTOR,
            id,
            `Indent ${indent.indentNumber} has been closed.`
        );

        return updated;
    }
}

export const indentsService = new IndentsService();
export default indentsService;
