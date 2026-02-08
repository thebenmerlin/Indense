import { DamageStatus, IndentStatus, NotificationType, Role, ReturnStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { CreateDamageReportDto, CreateReturnDto, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { createAuditLog } from '../../middleware/auditLog';
import { AuditAction, EntityType } from '../../types/enums';
import fs from 'fs';
import notificationsService from '../notifications/notifications.service';

class ReturnsService {
    private async generateReturnNumber(siteCode: string): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const prefix = `RET-${siteCode}-${year}${month}`;

        const lastReturn = await prisma.return.findFirst({
            where: { returnNumber: { startsWith: prefix } },
            orderBy: { returnNumber: 'desc' },
        });

        let sequence = 1;
        if (lastReturn) {
            const lastSeq = parseInt(lastReturn.returnNumber.split('-').pop() || '0', 10);
            sequence = lastSeq + 1;
        }

        return `${prefix}-${String(sequence).padStart(4, '0')}`;
    }

    async findAllDamageReports(
        params: { page?: number; limit?: number; indentId?: string; isResolved?: boolean; status?: string; siteId?: string; fromDate?: Date; toDate?: Date },
        userRole: Role,
        userSiteId: string | null
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);
        const where: Record<string, unknown> = {};

        if (params.indentId) {
            where.indentId = params.indentId;
        }
        if (typeof params.isResolved === 'boolean') {
            where.isResolved = params.isResolved;
        }
        if (params.status) {
            where.status = params.status;
        }

        // Site filtering
        if (userRole === Role.SITE_ENGINEER && userSiteId) {
            where.siteId = userSiteId;
        } else if (params.siteId) {
            where.siteId = params.siteId;
        }

        // Date filtering
        if (params.fromDate || params.toDate) {
            where.createdAt = {};
            if (params.fromDate) (where.createdAt as Record<string, Date>).gte = params.fromDate;
            if (params.toDate) (where.createdAt as Record<string, Date>).lte = params.toDate;
        }

        const [reports, total] = await Promise.all([
            prisma.damageReport.findMany({
                where,
                include: {
                    indent: { select: { id: true, indentNumber: true, name: true, status: true } },
                    site: { select: { name: true, code: true } },
                    indentItem: { include: { material: true } },
                    reportedBy: { select: { name: true } },
                    return: true,
                    images: true,
                },
                skip: pag.skip,
                take: pag.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.damageReport.count({ where }),
        ]);

        return buildPaginatedResult(reports, total, pag);
    }

    async findDamageReportById(id: string, userRole: Role, userSiteId: string | null): Promise<unknown> {
        const report = await prisma.damageReport.findUnique({
            where: { id },
            include: {
                indent: { select: { id: true, indentNumber: true, name: true, status: true } },
                site: { select: { name: true, code: true } },
                indentItem: { include: { material: true } },
                reportedBy: { select: { name: true } },
                return: true,
                images: true,
            },
        });

        if (!report) throw new NotFoundError('Damage report not found');

        // Site Engineers can only view their site's damage reports
        if (userRole === Role.SITE_ENGINEER && report.siteId !== userSiteId) {
            throw new ForbiddenError('Access denied to this damage report');
        }

        return report;
    }

    async findDamageReportsByIndentId(indentId: string, userRole: Role, userSiteId: string | null): Promise<unknown[]> {
        const indent = await prisma.indent.findUnique({ where: { id: indentId } });
        if (!indent) throw new NotFoundError('Indent not found');

        // Site Engineers can only view their site's damages
        if (userRole === Role.SITE_ENGINEER && indent.siteId !== userSiteId) {
            throw new ForbiddenError('Access denied to this indent');
        }

        const reports = await prisma.damageReport.findMany({
            where: { indentId },
            include: {
                indentItem: { include: { material: true } },
                reportedBy: { select: { name: true } },
                images: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return reports;
    }

    async createDamageReport(data: CreateDamageReportDto, userId: string, siteId: string | null): Promise<unknown> {
        // Validate indent exists
        const indent = await prisma.indent.findUnique({
            where: { id: data.indentId },
            include: { site: true, order: true },
        });
        if (!indent) throw new NotFoundError('Indent not found');

        // Site Engineers can only create damage reports for their site's indents
        if (siteId && indent.siteId !== siteId) {
            throw new ForbiddenError('Access denied to this indent');
        }

        // Can only report damage on purchased indents
        if (!indent.order) {
            throw new BadRequestError('Can only report damage on purchased indents');
        }

        // Optionally validate indent item if provided
        if (data.indentItemId) {
            const indentItem = await prisma.indentItem.findUnique({
                where: { id: data.indentItemId },
            });
            if (!indentItem || indentItem.indentId !== data.indentId) {
                throw new BadRequestError('Indent item does not belong to this indent');
            }
        }

        const report = await prisma.damageReport.create({
            data: {
                indentId: data.indentId,
                siteId: indent.siteId,
                indentItemId: data.indentItemId || null,
                reportedById: userId,
                name: data.name,
                damagedQty: data.damagedQty || null,
                description: data.description,
                severity: data.severity || 'MODERATE',
                status: data.isDraft ? DamageStatus.DRAFT : DamageStatus.REPORTED,
                submittedAt: data.isDraft ? null : new Date(),
            },
            include: {
                indentItem: { include: { material: true } },
                images: true,
            },
        });

        // If reported (not draft), notify Purchase Team and Director
        if (!data.isDraft) {
            const message = `Damage "${data.name}" reported for indent ${indent.indentNumber}`;
            await notificationsService.notifyRole(
                NotificationType.DAMAGE_REPORTED,
                Role.PURCHASE_TEAM,
                data.indentId,
                message
            );

            await notificationsService.notifyRole(
                NotificationType.DAMAGE_REPORTED,
                Role.DIRECTOR,
                data.indentId,
                message
            );
        }

        await createAuditLog(userId, {
            action: AuditAction.DAMAGE_REPORTED,
            entityType: EntityType.DAMAGE_REPORT,
            entityId: report.id,
            indentId: data.indentId,
        });

        return report;
    }

    async updateDamageReport(
        id: string,
        data: Partial<CreateDamageReportDto>,
        userId: string,
        siteId: string | null
    ): Promise<unknown> {
        const report = await prisma.damageReport.findUnique({ where: { id } });
        if (!report) throw new NotFoundError('Damage report not found');

        // Site Engineers can only update their site's damage reports
        if (siteId && report.siteId !== siteId) {
            throw new ForbiddenError('Access denied to this damage report');
        }

        // Can only update draft reports
        if (report.status !== DamageStatus.DRAFT) {
            throw new BadRequestError('Can only update draft damage reports');
        }

        const updated = await prisma.damageReport.update({
            where: { id },
            data: {
                name: data.name,
                indentItemId: data.indentItemId,
                damagedQty: data.damagedQty,
                description: data.description,
                severity: data.severity,
            },
            include: {
                indentItem: { include: { material: true } },
                images: true,
            },
        });

        return updated;
    }

    async submitDamageReport(id: string, userId: string, siteId: string | null): Promise<unknown> {
        const report = await prisma.damageReport.findUnique({
            where: { id },
            include: { indent: true },
        });
        if (!report) throw new NotFoundError('Damage report not found');

        // Site Engineers can only submit their site's damage reports
        if (siteId && report.siteId !== siteId) {
            throw new ForbiddenError('Access denied to this damage report');
        }

        // Can only submit draft reports
        if (report.status !== DamageStatus.DRAFT) {
            throw new BadRequestError('Damage report already submitted');
        }

        const updated = await prisma.damageReport.update({
            where: { id },
            data: {
                status: DamageStatus.REPORTED,
                submittedAt: new Date(),
            },
            include: {
                indentItem: { include: { material: true } },
                images: true,
            },
        });

        const message = `Damage "${report.name}" reported for indent ${report.indent.indentNumber}`;
        await notificationsService.notifyRole(
            NotificationType.DAMAGE_REPORTED,
            Role.PURCHASE_TEAM,
            report.indentId,
            message
        );

        await notificationsService.notifyRole(
            NotificationType.DAMAGE_REPORTED,
            Role.DIRECTOR,
            report.indentId,
            message
        );

        return updated;
    }

    async uploadDamageImage(damageReportId: string, file: Express.Multer.File, userId: string, siteId: string | null): Promise<unknown> {
        const report = await prisma.damageReport.findUnique({ where: { id: damageReportId } });
        if (!report) throw new NotFoundError('Damage report not found');

        // Site Engineers can only upload to their site's damage reports
        if (siteId && report.siteId !== siteId) {
            throw new ForbiddenError('Access denied to this damage report');
        }

        // Store relative path for URL construction
        const relativePath = `damages/${file.filename}`;

        const image = await prisma.damageImage.create({
            data: {
                damageReportId,
                filename: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                path: relativePath,
            },
        });

        return image;
    }

    async deleteDamageImage(damageReportId: string, imageId: string, userId: string, siteId: string | null): Promise<void> {
        const report = await prisma.damageReport.findUnique({ where: { id: damageReportId } });
        if (!report) throw new NotFoundError('Damage report not found');

        // Site Engineers can only delete their site's damage images
        if (siteId && report.siteId !== siteId) {
            throw new ForbiddenError('Access denied to this damage report');
        }

        const image = await prisma.damageImage.findUnique({ where: { id: imageId } });
        if (!image || image.damageReportId !== damageReportId) {
            throw new NotFoundError('Image not found');
        }

        // Delete the file
        try {
            if (fs.existsSync(image.path)) {
                fs.unlinkSync(image.path);
            }
        } catch (e) {
            console.error(`Failed to delete image file: ${image.path}`, e);
        }

        await prisma.damageImage.delete({ where: { id: imageId } });
    }

    async deleteDamageReport(id: string, userId: string, siteId: string | null): Promise<void> {
        const report = await prisma.damageReport.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!report) throw new NotFoundError('Damage report not found');

        // Site Engineers can only delete their site's damage reports
        if (siteId && report.siteId !== siteId) {
            throw new ForbiddenError('Access denied to this damage report');
        }

        // Can only delete draft reports
        if (report.status !== DamageStatus.DRAFT) {
            throw new BadRequestError('Can only delete draft damage reports');
        }

        // Delete associated image files
        for (const image of report.images) {
            try {
                if (fs.existsSync(image.path)) {
                    fs.unlinkSync(image.path);
                }
            } catch (e) {
                console.error(`Failed to delete image file: ${image.path}`, e);
            }
        }

        await prisma.damageReport.delete({ where: { id } });
    }

    async resolveDamage(id: string, userId: string, resolution: string): Promise<unknown> {
        const report = await prisma.damageReport.findUnique({
            where: { id },
            include: { indent: true, reportedBy: true },
        });
        if (!report) throw new NotFoundError('Damage report not found');
        if (report.isResolved) throw new BadRequestError('Damage already resolved');

        const updated = await prisma.damageReport.update({
            where: { id },
            data: {
                isResolved: true,
                resolvedAt: new Date(),
                resolution,
                status: DamageStatus.RESOLVED,
            },
        });

        // Notify the Site Engineer who reported the damage
        await notificationsService.notifySiteEngineer(
            NotificationType.DAMAGE_REPAIRED,
            report.indentId,
            `Damage "${report.name}" has been resolved.`
        );

        await createAuditLog(userId, {
            action: AuditAction.DAMAGE_RESOLVED,
            entityType: EntityType.DAMAGE_REPORT,
            entityId: id,
        });

        return updated;
    }

    /**
     * Mark a damage report as reordered by Purchase Team
     * Clears vendor details, cost, and invoices from the order item for repurchase
     */
    async reorderDamage(id: string, userId: string, expectedDeliveryDate: Date): Promise<unknown> {
        const report = await prisma.damageReport.findUnique({
            where: { id },
            include: {
                indent: { include: { order: { include: { orderItems: true } } } },
                reportedBy: true,
                indentItem: { include: { material: true } }
            },
        });
        if (!report) throw new NotFoundError('Damage report not found');
        if (report.isResolved) throw new BadRequestError('Cannot reorder a resolved damage report');
        if (report.isReordered) throw new BadRequestError('Material already reordered for this damage report');

        // Find the order item for this indent item to clear its data
        const order = report.indent.order;
        let orderItemId: string | null = null;

        if (order && report.indentItemId) {
            const orderItem = order.orderItems.find(oi => oi.indentItemId === report.indentItemId);
            if (orderItem) {
                orderItemId = orderItem.id;

                // Clear order item vendor details, cost, and mark as needs repurchase
                await prisma.orderItem.update({
                    where: { id: orderItem.id },
                    data: {
                        vendorName: null,
                        vendorAddress: null,
                        vendorGstNo: null,
                        vendorContactPerson: null,
                        vendorContactPhone: null,
                        vendorNatureOfBusiness: null,
                        unitPrice: null,
                        totalPrice: null,
                        isReordered: true,
                    },
                });

                // Delete all invoices for this order item
                const invoices = await prisma.orderItemInvoice.findMany({
                    where: { orderItemId: orderItem.id },
                });

                for (const invoice of invoices) {
                    // Delete the file
                    try {
                        if (fs.existsSync(invoice.path)) {
                            fs.unlinkSync(invoice.path);
                        }
                    } catch (e) {
                        console.error(`Failed to delete invoice file: ${invoice.path}`, e);
                    }
                }

                await prisma.orderItemInvoice.deleteMany({
                    where: { orderItemId: orderItem.id },
                });
            }
        }

        const updated = await prisma.damageReport.update({
            where: { id },
            data: {
                isReordered: true,
                reorderedAt: new Date(),
                reorderExpectedDate: expectedDeliveryDate,
                reorderedById: userId,
                status: DamageStatus.REORDERED,
            },
            include: {
                indent: { select: { id: true, indentNumber: true, name: true, status: true } },
                site: { select: { name: true, code: true } },
                indentItem: { include: { material: true } },
                reportedBy: { select: { name: true } },
                images: true,
            },
        });

        // Notify the Site Engineer who reported the damage
        const materialName = report.indentItem?.material?.name || report.name;
        await notificationsService.notifySiteEngineer(
            NotificationType.DAMAGE_REPAIRED,
            report.indentId,
            `Material "${materialName}" reordered. Expected delivery: ${expectedDeliveryDate.toLocaleDateString()}.`
        );

        await createAuditLog(userId, {
            action: AuditAction.DAMAGE_RESOLVED, // Using existing action type
            entityType: EntityType.DAMAGE_REPORT,
            entityId: id,
            metadata: { action: 'reorder', expectedDeliveryDate, orderItemCleared: !!orderItemId },
        });

        return updated;
    }

    /**
     * Get damage reports that have been reordered
     */
    async getReorderedDamageReports(
        params: { page?: number; limit?: number; siteId?: string; fromDate?: Date; toDate?: Date },
        userRole: Role,
        userSiteId: string | null
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);
        const where: Record<string, unknown> = {
            isReordered: true,
        };

        // Site filtering
        if (userRole === Role.SITE_ENGINEER && userSiteId) {
            where.siteId = userSiteId;
        } else if (params.siteId) {
            where.siteId = params.siteId;
        }

        // Date filtering
        if (params.fromDate || params.toDate) {
            where.reorderedAt = {};
            if (params.fromDate) (where.reorderedAt as Record<string, Date>).gte = params.fromDate;
            if (params.toDate) (where.reorderedAt as Record<string, Date>).lte = params.toDate;
        }

        const [reports, total] = await Promise.all([
            prisma.damageReport.findMany({
                where,
                include: {
                    indent: { select: { id: true, indentNumber: true, name: true, status: true } },
                    site: { select: { name: true, code: true } },
                    indentItem: { include: { material: true } },
                    reportedBy: { select: { name: true } },
                    reorderedBy: { select: { name: true } },
                    images: true,
                },
                skip: pag.skip,
                take: pag.take,
                orderBy: { reorderedAt: 'desc' },
            }),
            prisma.damageReport.count({ where }),
        ]);

        return buildPaginatedResult(reports, total, pag);
    }

    /**
     * Get indents with partial receipts (items with arrivalStatus = PARTIAL)
     */
    async getPartiallyReceivedIndents(
        params: { page?: number; limit?: number; siteId?: string; fromDate?: Date; toDate?: Date; search?: string },
        userRole: Role,
        userSiteId: string | null
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);
        const where: Record<string, unknown> = {
            status: IndentStatus.PARTIALLY_RECEIVED,
        };

        // Site filtering
        if (userRole === Role.SITE_ENGINEER && userSiteId) {
            where.siteId = userSiteId;
        } else if (params.siteId) {
            where.siteId = params.siteId;
        }

        // Date filtering
        if (params.fromDate || params.toDate) {
            where.createdAt = {};
            if (params.fromDate) (where.createdAt as Record<string, Date>).gte = params.fromDate;
            if (params.toDate) (where.createdAt as Record<string, Date>).lte = params.toDate;
        }

        // Search
        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { indentNumber: { contains: params.search, mode: 'insensitive' } },
            ];
        }

        const [indents, total] = await Promise.all([
            prisma.indent.findMany({
                where,
                include: {
                    site: { select: { name: true, code: true } },
                    createdBy: { select: { name: true } },
                    items: {
                        where: { arrivalStatus: { in: ['PARTIAL', 'NOT_ARRIVED'] } },
                        include: {
                            material: true,
                            damageReports: { where: { isResolved: false } },
                        },
                    },
                    order: {
                        include: {
                            orderItems: true,
                            invoices: true,
                        },
                    },
                },
                skip: pag.skip,
                take: pag.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.indent.count({ where }),
        ]);

        return buildPaginatedResult(indents, total, pag);
    }

    async findAllReturns(
        params: { page?: number; limit?: number; status?: ReturnStatus; siteId?: string },
        userRole?: Role,
        userSiteId?: string | null
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;

        // Site filtering
        if (userRole === Role.SITE_ENGINEER && userSiteId) {
            where.siteId = userSiteId;
        } else if (params.siteId) {
            where.siteId = params.siteId;
        }

        const [returns, total] = await Promise.all([
            prisma.return.findMany({
                where,
                include: {
                    damageReport: { include: { indentItem: { include: { material: true } }, images: true } },
                    site: { select: { name: true, code: true } },
                    createdBy: { select: { name: true } },
                    approvedBy: { select: { name: true } },
                },
                skip: pag.skip,
                take: pag.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.return.count({ where }),
        ]);

        return buildPaginatedResult(returns, total, pag);
    }

    async createReturn(data: CreateReturnDto, userId: string, siteId: string | null): Promise<unknown> {
        const damageReport = await prisma.damageReport.findUnique({
            where: { id: data.damageReportId },
            include: {
                indent: { include: { site: true } },
                indentItem: { include: { indent: { include: { site: true } } } },
                return: true,
            },
        });

        if (!damageReport) throw new NotFoundError('Damage report not found');
        if (damageReport.return) throw new BadRequestError('Return already exists for this damage');

        // Site Engineers can only create returns for their site's damage reports
        if (siteId && damageReport.siteId !== siteId) {
            throw new ForbiddenError('Access denied to this damage report');
        }

        // Get site code from indent
        const siteCode = damageReport.indent.site.code;

        const returnNumber = await this.generateReturnNumber(siteCode);

        const returnRecord = await prisma.return.create({
            data: {
                returnNumber,
                damageReportId: data.damageReportId,
                siteId: damageReport.siteId,
                createdById: userId,
                quantity: data.quantity,
                reason: data.reason,
            },
        });

        await createAuditLog(userId, {
            action: AuditAction.RETURN_CREATED,
            entityType: EntityType.RETURN,
            entityId: returnRecord.id,
            indentId: damageReport.indentId,
        });

        const message = `Return raised for damage "${damageReport.name}" on indent ${damageReport.indent.indentNumber}`;
        await notificationsService.notifyRole(
            NotificationType.RETURN_RAISED,
            Role.PURCHASE_TEAM,
            damageReport.indentId,
            message
        );

        await notificationsService.notifyRole(
            NotificationType.RETURN_RAISED,
            Role.DIRECTOR,
            damageReport.indentId,
            message
        );

        return returnRecord;
    }

    async approveReturn(id: string, userId: string): Promise<unknown> {
        const returnRecord = await prisma.return.findUnique({ where: { id } });
        if (!returnRecord) throw new NotFoundError('Return not found');
        if (returnRecord.status !== ReturnStatus.PENDING) {
            throw new BadRequestError('Return is not in pending status');
        }

        return prisma.return.update({
            where: { id },
            data: {
                status: ReturnStatus.APPROVED,
                approvedById: userId,
                approvedAt: new Date(),
            },
        });
    }

    async processReturn(id: string, userId: string, remarks?: string): Promise<unknown> {
        const returnRecord = await prisma.return.findUnique({ where: { id } });
        if (!returnRecord) throw new NotFoundError('Return not found');
        if (returnRecord.status !== ReturnStatus.APPROVED) {
            throw new BadRequestError('Return must be approved first');
        }

        return prisma.return.update({
            where: { id },
            data: {
                status: ReturnStatus.PROCESSED,
                processedAt: new Date(),
                remarks,
            },
        });
    }

    /**
     * Get indents that have been purchased (have an order) for damage reporting
     */
    async getPurchasedIndentsForDamage(
        params: { page?: number; limit?: number; search?: string; fromDate?: Date; toDate?: Date },
        userRole: Role,
        userSiteId: string | null
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);
        const where: Record<string, unknown> = {
            order: { isNot: null }, // Only indents with orders (purchased)
        };

        // Site filtering
        if (userRole === Role.SITE_ENGINEER && userSiteId) {
            where.siteId = userSiteId;
        }

        // Search
        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { indentNumber: { contains: params.search, mode: 'insensitive' } },
            ];
        }

        // Date filtering
        if (params.fromDate || params.toDate) {
            where.createdAt = {};
            if (params.fromDate) (where.createdAt as Record<string, Date>).gte = params.fromDate;
            if (params.toDate) (where.createdAt as Record<string, Date>).lte = params.toDate;
        }

        const [indents, total] = await Promise.all([
            prisma.indent.findMany({
                where,
                include: {
                    site: { select: { name: true, code: true } },
                    items: { include: { material: true } },
                    order: { select: { orderNumber: true, vendorName: true, createdAt: true } },
                    _count: { select: { damageReports: true } },
                },
                skip: pag.skip,
                take: pag.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.indent.count({ where }),
        ]);

        return buildPaginatedResult(indents, total, pag);
    }
}

export const returnsService = new ReturnsService();
export default returnsService;
