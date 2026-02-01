import { Role, ReturnStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { CreateDamageReportDto, CreateReturnDto, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { createAuditLog } from '../../middleware/auditLog';
import { AuditAction, EntityType } from '../../types/enums';

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
        params: { page?: number; limit?: number; indentId?: string; isResolved?: boolean },
        userRole: Role,
        userSiteId: string | null
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);
        const where: Record<string, unknown> = {};

        if (params.indentId) {
            where.indentItem = { indentId: params.indentId };
        }
        if (typeof params.isResolved === 'boolean') {
            where.isResolved = params.isResolved;
        }
        if (userRole === Role.SITE_ENGINEER && userSiteId) {
            where.indentItem = { ...(where.indentItem as object || {}), indent: { siteId: userSiteId } };
        }

        const [reports, total] = await Promise.all([
            prisma.damageReport.findMany({
                where,
                include: {
                    indentItem: { include: { material: true, indent: { select: { indentNumber: true, siteId: true } } } },
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

    async createDamageReport(data: CreateDamageReportDto, userId: string): Promise<unknown> {
        // Validate indent exists
        const indent = await prisma.indent.findUnique({
            where: { id: data.indentId },
            include: { site: true },
        });
        if (!indent) throw new NotFoundError('Indent not found');

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
                indentItemId: data.indentItemId || null,
                reportedById: userId,
                name: data.name,
                damagedQty: data.damagedQty || null,
                description: data.description,
                severity: data.severity || 'MODERATE',
                status: data.isDraft ? 'DRAFT' : 'REPORTED',
                submittedAt: data.isDraft ? null : new Date(),
            },
            include: { indentItem: { include: { material: true } } },
        });

        await createAuditLog(userId, {
            action: AuditAction.DAMAGE_REPORTED,
            entityType: EntityType.DAMAGE_REPORT,
            entityId: report.id,
            indentId: data.indentId,
        });

        return report;
    }

    async resolveDamage(id: string, userId: string, resolution: string): Promise<unknown> {
        const report = await prisma.damageReport.findUnique({ where: { id } });
        if (!report) throw new NotFoundError('Damage report not found');
        if (report.isResolved) throw new BadRequestError('Damage already resolved');

        const updated = await prisma.damageReport.update({
            where: { id },
            data: {
                isResolved: true,
                resolvedAt: new Date(),
                resolution,
            },
        });

        await createAuditLog(userId, {
            action: AuditAction.DAMAGE_RESOLVED,
            entityType: EntityType.DAMAGE_REPORT,
            entityId: id,
        });

        return updated;
    }

    async findAllReturns(
        params: { page?: number; limit?: number; status?: ReturnStatus }
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);
        const where: Record<string, unknown> = {};
        if (params.status) where.status = params.status;

        const [returns, total] = await Promise.all([
            prisma.return.findMany({
                where,
                include: {
                    damageReport: { include: { indentItem: { include: { material: true } } } },
                    createdBy: { select: { name: true } },
                },
                skip: pag.skip,
                take: pag.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.return.count({ where }),
        ]);

        return buildPaginatedResult(returns, total, pag);
    }

    async createReturn(data: CreateReturnDto, userId: string): Promise<unknown> {
        const damageReport = await prisma.damageReport.findUnique({
            where: { id: data.damageReportId },
            include: {
                indentItem: { include: { indent: { include: { site: true } } } },
                return: true,
            },
        });

        if (!damageReport) throw new NotFoundError('Damage report not found');
        if (damageReport.return) throw new BadRequestError('Return already exists for this damage');

        // Get site code from indent (via indentItem if exists, or directly from indent)
        let siteCode: string;
        if (damageReport.indentItem) {
            siteCode = damageReport.indentItem.indent.site.code;
        } else {
            // Fallback to getting site from indent directly
            const indent = await prisma.indent.findUnique({
                where: { id: damageReport.indentId },
                include: { site: true },
            });
            if (!indent) throw new NotFoundError('Indent not found');
            siteCode = indent.site.code;
        }

        const returnNumber = await this.generateReturnNumber(siteCode);

        const indentId = damageReport.indentItem?.indentId || damageReport.indentId;

        const returnRecord = await prisma.return.create({
            data: {
                returnNumber,
                damageReportId: data.damageReportId,
                createdById: userId,
                quantity: data.quantity,
                reason: data.reason,
            },
        });

        await createAuditLog(userId, {
            action: AuditAction.RETURN_CREATED,
            entityType: EntityType.RETURN,
            entityId: returnRecord.id,
            indentId,
        });

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
}

export const returnsService = new ReturnsService();
export default returnsService;
