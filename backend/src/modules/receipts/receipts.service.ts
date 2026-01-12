import { IndentStatus, Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { CreateReceiptDto, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { canRecordReceipt, validateTransition } from '../indents/indents.stateMachine';
import { createAuditLog } from '../../middleware/auditLog';
import { AuditAction, EntityType } from '../../types/enums';

class ReceiptsService {
    private async generateReceiptNumber(siteCode: string): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const prefix = `RCP-${siteCode}-${year}${month}`;

        const lastReceipt = await prisma.receipt.findFirst({
            where: { receiptNumber: { startsWith: prefix } },
            orderBy: { receiptNumber: 'desc' },
        });

        let sequence = 1;
        if (lastReceipt) {
            const lastSeq = parseInt(lastReceipt.receiptNumber.split('-').pop() || '0', 10);
            sequence = lastSeq + 1;
        }

        return `${prefix}-${String(sequence).padStart(4, '0')}`;
    }

    async findAll(
        params: { page?: number; limit?: number; indentId?: string },
        userRole: Role,
        userSiteId: string | null
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);
        const where: Record<string, unknown> = {};

        if (params.indentId) where.indentId = params.indentId;

        // Site engineers can only see their site's receipts
        if (userRole === Role.SITE_ENGINEER && userSiteId) {
            where.createdBy = { siteId: userSiteId };
        }

        const [receipts, total] = await Promise.all([
            prisma.receipt.findMany({
                where,
                include: {
                    items: { include: { indentItem: { include: { material: true } } } },
                    images: true,
                    createdBy: { select: { name: true } },
                },
                skip: pag.skip,
                take: pag.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.receipt.count({ where }),
        ]);

        return buildPaginatedResult(receipts, total, pag);
    }

    async create(data: CreateReceiptDto, userId: string, userSiteId: string | null): Promise<unknown> {
        const indent = await prisma.indent.findUnique({
            where: { id: data.indentId },
            include: { site: true, items: true },
        });

        if (!indent) throw new NotFoundError('Indent not found');
        if (userSiteId && indent.siteId !== userSiteId) {
            throw new ForbiddenError('Access denied to this indent');
        }
        if (!canRecordReceipt(indent.status)) {
            throw new BadRequestError(`Cannot record receipt for indent in ${indent.status} status`);
        }

        const receiptNumber = await this.generateReceiptNumber(indent.site.code);

        const receipt = await prisma.$transaction(async (tx) => {
            const created = await tx.receipt.create({
                data: {
                    receiptNumber,
                    indentId: data.indentId,
                    createdById: userId,
                    deliveryNote: data.deliveryNote,
                    remarks: data.remarks,
                    items: {
                        create: data.items.map((item) => ({
                            indentItemId: item.indentItemId,
                            receivedQty: item.receivedQty,
                            remarks: item.remarks,
                        })),
                    },
                },
                include: { items: true },
            });

            // Update indent items received quantities
            for (const item of data.items) {
                const indentItem = indent.items.find((i) => i.id === item.indentItemId);
                if (indentItem) {
                    const newReceivedQty = indentItem.receivedQty + item.receivedQty;
                    const newPendingQty = indentItem.requestedQty - newReceivedQty;

                    await tx.indentItem.update({
                        where: { id: item.indentItemId },
                        data: {
                            receivedQty: newReceivedQty,
                            pendingQty: Math.max(0, newPendingQty),
                        },
                    });
                }
            }

            // Check if all items are fully received
            const updatedItems = await tx.indentItem.findMany({
                where: { indentId: data.indentId },
            });

            const allFullyReceived = updatedItems.every(
                (item) => item.receivedQty >= item.requestedQty
            );

            const newStatus = allFullyReceived
                ? IndentStatus.FULLY_RECEIVED
                : IndentStatus.PARTIALLY_RECEIVED;

            validateTransition(indent.status, newStatus);

            await tx.indent.update({
                where: { id: data.indentId },
                data: { status: newStatus },
            });

            return created;
        });

        await createAuditLog(userId, {
            action: AuditAction.RECEIPT_CREATED,
            entityType: EntityType.RECEIPT,
            entityId: receipt.id,
            indentId: data.indentId,
            metadata: { receiptNumber },
        });

        return receipt;
    }

    async uploadImage(receiptId: string, file: Express.Multer.File, userId: string): Promise<unknown> {
        const receipt = await prisma.receipt.findUnique({ where: { id: receiptId } });
        if (!receipt) throw new NotFoundError('Receipt not found');

        const image = await prisma.receiptImage.create({
            data: {
                receiptId,
                filename: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                path: file.path,
            },
        });

        await createAuditLog(userId, {
            action: AuditAction.RECEIPT_IMAGE_UPLOADED,
            entityType: EntityType.RECEIPT,
            entityId: receiptId,
            indentId: receipt.indentId,
        });

        return image;
    }
}

export const receiptsService = new ReceiptsService();
export default receiptsService;
