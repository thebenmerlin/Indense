import { IndentStatus, Role, NotificationType } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { CreateReceiptDto, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { canRecordReceipt, validateTransition } from '../indents/indents.stateMachine';
import { createAuditLog } from '../../middleware/auditLog';
import { AuditAction, EntityType } from '../../types/enums';
import fs from 'fs';
import notificationsService from '../notifications/notifications.service';

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
        params: { page?: number; limit?: number; indentId?: string; siteId?: string; fromDate?: Date; toDate?: Date },
        userRole: Role,
        userSiteId: string | null
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);
        const where: Record<string, unknown> = {};

        if (params.indentId) where.indentId = params.indentId;

        // Site engineers can only see their site's receipts
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

        const [receipts, total] = await Promise.all([
            prisma.receipt.findMany({
                where,
                include: {
                    indent: {
                        select: { indentNumber: true, name: true, status: true },
                    },
                    site: { select: { name: true, code: true } },
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

    async findById(id: string, userRole: Role, userSiteId: string | null): Promise<unknown> {
        const receipt = await prisma.receipt.findUnique({
            where: { id },
            include: {
                indent: {
                    select: { id: true, indentNumber: true, name: true, status: true },
                },
                site: { select: { name: true, code: true } },
                items: { include: { indentItem: { include: { material: true } } } },
                images: true,
                createdBy: { select: { name: true } },
            },
        });

        if (!receipt) throw new NotFoundError('Receipt not found');

        // Site Engineers can only view their site's receipts
        if (userRole === Role.SITE_ENGINEER && receipt.siteId !== userSiteId) {
            throw new ForbiddenError('Access denied to this receipt');
        }

        return receipt;
    }

    async findByIndentId(indentId: string, userRole: Role, userSiteId: string | null): Promise<unknown[]> {
        const indent = await prisma.indent.findUnique({ where: { id: indentId } });
        if (!indent) throw new NotFoundError('Indent not found');

        // Site Engineers can only view their site's receipts
        if (userRole === Role.SITE_ENGINEER && indent.siteId !== userSiteId) {
            throw new ForbiddenError('Access denied to this indent');
        }

        const receipts = await prisma.receipt.findMany({
            where: { indentId },
            include: {
                images: true,
                createdBy: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return receipts;
    }

    async create(data: CreateReceiptDto & { name?: string }, userId: string, userSiteId: string | null): Promise<unknown> {
        const indent = await prisma.indent.findUnique({
            where: { id: data.indentId },
            include: { site: true, items: true },
        });

        if (!indent) throw new NotFoundError('Indent not found');
        if (userSiteId && indent.siteId !== userSiteId) {
            throw new ForbiddenError('Access denied to this indent');
        }
        
        // For Site Engineer receipts (just photo upload), we allow on approved indents
        const allowedStatuses: string[] = [
            IndentStatus.DIRECTOR_APPROVED,
            IndentStatus.ORDER_PLACED,
            IndentStatus.PARTIALLY_RECEIVED,
            IndentStatus.FULLY_RECEIVED,
        ];
        if (!allowedStatuses.includes(indent.status)) {
            throw new BadRequestError(`Cannot create receipt for indent in ${indent.status} status`);
        }

        const receiptNumber = await this.generateReceiptNumber(indent.site.code);

        let statusAfter = indent.status;

        const receipt = await prisma.$transaction(async (tx) => {
            const createData: Record<string, unknown> = {
                receiptNumber,
                name: data.name || null,
                indentId: data.indentId,
                siteId: indent.siteId,
                createdById: userId,
                deliveryNote: data.deliveryNote,
                remarks: data.remarks,
            };

            // Only add items if provided
            if (data.items && data.items.length > 0) {
                createData.items = {
                    create: data.items.map((item) => ({
                        indentItemId: item.indentItemId,
                        receivedQty: item.receivedQty,
                        remarks: item.remarks,
                    })),
                };
            }

            const created = await tx.receipt.create({
                data: createData as any,
                include: { items: true, images: true },
            });

            // Update indent items received quantities if items provided
            if (data.items && data.items.length > 0) {
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

                if (indent.status !== newStatus && canRecordReceipt(indent.status)) {
                    validateTransition(indent.status, newStatus);
                    await tx.indent.update({
                        where: { id: data.indentId },
                        data: { status: newStatus },
                    });
                    statusAfter = newStatus;
                }
            }

            return created;
        });

        await createAuditLog(userId, {
            action: AuditAction.RECEIPT_CREATED,
            entityType: EntityType.RECEIPT,
            entityId: receipt.id,
            indentId: data.indentId,
            metadata: { receiptNumber },
        });

        if (statusAfter === IndentStatus.FULLY_RECEIVED) {
            await notificationsService.notifyRole(
                NotificationType.MATERIAL_RECEIVED,
                Role.PURCHASE_TEAM,
                data.indentId,
                `All materials received for indent ${indent.indentNumber}.`
            );

            await notificationsService.notifyRole(
                NotificationType.MATERIAL_RECEIVED,
                Role.DIRECTOR,
                data.indentId,
                `All materials received for indent ${indent.indentNumber}.`
            );
        } else if (statusAfter === IndentStatus.PARTIALLY_RECEIVED) {
            await notificationsService.notifyRole(
                NotificationType.PARTIAL_RECEIVED,
                Role.PURCHASE_TEAM,
                data.indentId,
                `Partial receipt recorded for indent ${indent.indentNumber}.`
            );

            await notificationsService.notifyRole(
                NotificationType.PARTIAL_RECEIVED,
                Role.DIRECTOR,
                data.indentId,
                `Partial receipt recorded for indent ${indent.indentNumber}.`
            );
        }

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

    async deleteReceipt(receiptId: string, userId: string, userSiteId: string | null): Promise<void> {
        const receipt = await prisma.receipt.findUnique({
            where: { id: receiptId },
            include: { images: true },
        });

        if (!receipt) throw new NotFoundError('Receipt not found');

        // Site Engineers can only delete their own receipts
        if (receipt.siteId !== userSiteId) {
            throw new ForbiddenError('Access denied to this receipt');
        }

        // Delete associated image files
        for (const image of receipt.images) {
            try {
                if (fs.existsSync(image.path)) {
                    fs.unlinkSync(image.path);
                }
            } catch (e) {
                console.error(`Failed to delete image file: ${image.path}`, e);
            }
        }

        await prisma.receipt.delete({ where: { id: receiptId } });

        await createAuditLog(userId, {
            action: AuditAction.RECEIPT_DELETED as any,
            entityType: EntityType.RECEIPT,
            entityId: receiptId,
            indentId: receipt.indentId,
        });
    }

    async deleteImage(receiptId: string, imageId: string, userId: string, userSiteId: string | null): Promise<void> {
        const receipt = await prisma.receipt.findUnique({ where: { id: receiptId } });
        if (!receipt) throw new NotFoundError('Receipt not found');

        // Site Engineers can only delete their own receipts' images
        if (receipt.siteId !== userSiteId) {
            throw new ForbiddenError('Access denied to this receipt');
        }

        const image = await prisma.receiptImage.findUnique({ where: { id: imageId } });
        if (!image || image.receiptId !== receiptId) {
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

        await prisma.receiptImage.delete({ where: { id: imageId } });
    }
}

export const receiptsService = new ReceiptsService();
export default receiptsService;
