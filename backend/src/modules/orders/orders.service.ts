import { IndentStatus, Role, NotificationType } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { CreateOrderDto, UpdateOrderDto, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { filterOrderForRole, filterOrdersForRole } from '../../utils/visibility';
import { canPlaceOrder, validateTransition } from '../indents/indents.stateMachine';
import { logIndentStateChange, createAuditLog } from '../../middleware/auditLog';
import { AuditAction, EntityType } from '../../types/enums';
import * as fs from 'fs';
import * as path from 'path';
import notificationsService from '../notifications/notifications.service';

class OrdersService {
    private async generateOrderNumber(): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const prefix = `ORD-${year}${month}`;

        const lastOrder = await prisma.order.findFirst({
            where: { orderNumber: { startsWith: prefix } },
            orderBy: { orderNumber: 'desc' },
        });

        let sequence = 1;
        if (lastOrder) {
            const lastSeq = parseInt(lastOrder.orderNumber.split('-').pop() || '0', 10);
            sequence = lastSeq + 1;
        }

        return `${prefix}-${String(sequence).padStart(4, '0')}`;
    }

    async findAll(
        params: { 
            page?: number; 
            limit?: number; 
            siteId?: string;
            isPurchased?: boolean;
            fromDate?: Date;
            toDate?: Date;
        },
        userRole: Role
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);

        const where: Record<string, unknown> = {};
        if (params.siteId) {
            where.indent = { siteId: params.siteId };
        }
        if (params.isPurchased !== undefined) {
            where.isPurchased = params.isPurchased;
        }
        if (params.fromDate || params.toDate) {
            where.createdAt = {};
            if (params.fromDate) (where.createdAt as Record<string, Date>).gte = params.fromDate;
            if (params.toDate) (where.createdAt as Record<string, Date>).lte = params.toDate;
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    indent: { include: { site: true, createdBy: { select: { name: true } } } },
                    orderItems: { include: { invoices: true } },
                    invoices: true,
                    createdBy: { select: { name: true } },
                },
                skip: pag.skip,
                take: pag.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.order.count({ where }),
        ]);

        // Filter pricing based on role
        const filteredOrders = filterOrdersForRole(
            orders as Record<string, unknown>[],
            userRole
        );

        return buildPaginatedResult(filteredOrders, total, pag);
    }

    async findById(id: string, userRole: Role, userSiteId: string | null): Promise<unknown> {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                indent: { 
                    include: { 
                        site: true, 
                        items: { include: { material: true } },
                        createdBy: { select: { name: true, email: true } },
                    } 
                },
                orderItems: { include: { invoices: true } },
                invoices: true,
                createdBy: { select: { name: true } },
            },
        });

        if (!order) throw new NotFoundError('Order not found');

        // Site Engineers can only view their site's orders
        if (userRole === Role.SITE_ENGINEER && order.indent.siteId !== userSiteId) {
            throw new ForbiddenError('Access denied to this order');
        }

        return filterOrderForRole(order as Record<string, unknown>, userRole);
    }

    async create(data: CreateOrderDto, userId: string): Promise<unknown> {
        const indent = await prisma.indent.findUnique({
            where: { id: data.indentId },
            select: { id: true, status: true, createdById: true, indentNumber: true },
        });
        if (!indent) throw new NotFoundError('Indent not found');

        if (!canPlaceOrder(indent.status)) {
            throw new BadRequestError(`Cannot create order for indent in ${indent.status} status`);
        }

        validateTransition(indent.status, IndentStatus.ORDER_PLACED);

        const orderNumber = await this.generateOrderNumber();
        const grandTotal = (data.totalAmount || 0) + (data.taxAmount || 0) + (data.shippingAmount || 0);

        const order = await prisma.$transaction(async (tx) => {
            const created = await tx.order.create({
                data: {
                    orderNumber,
                    indentId: data.indentId,
                    vendorName: data.vendorName,
                    vendorContact: data.vendorContact,
                    vendorEmail: data.vendorEmail,
                    vendorAddress: data.vendorAddress,
                    vendorGstNo: data.vendorGstNo,
                    vendorContactPerson: data.vendorContactPerson,
                    vendorContactPhone: data.vendorContactPhone,
                    vendorNatureOfBusiness: data.vendorNatureOfBusiness,
                    totalAmount: data.totalAmount,
                    taxAmount: data.taxAmount,
                    shippingAmount: data.shippingAmount,
                    grandTotal,
                    expectedDeliveryDate: data.expectedDeliveryDate,
                    remarks: data.remarks,
                    createdById: userId,
                    orderItems: {
                        create: data.items.map((item) => ({
                            materialName: item.materialName,
                            materialCode: item.materialCode,
                            specifications: item.specifications,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.unitPrice ? item.unitPrice * item.quantity : null,
                            vendorName: item.vendorName,
                            vendorAddress: item.vendorAddress,
                            vendorGstNo: item.vendorGstNo,
                            vendorContactPerson: item.vendorContactPerson,
                            vendorContactPhone: item.vendorContactPhone,
                            vendorNatureOfBusiness: item.vendorNatureOfBusiness,
                        })),
                    },
                },
                include: { orderItems: true, invoices: true },
            });

            // Update indent status
            await tx.indent.update({
                where: { id: data.indentId },
                data: { status: IndentStatus.ORDER_PLACED },
            });

            return created;
        });

        await logIndentStateChange(
            userId,
            data.indentId,
            AuditAction.ORDER_CREATED,
            indent.status,
            IndentStatus.ORDER_PLACED,
            { orderNumber }
        );

        await notificationsService.notifySiteEngineer(
            NotificationType.ORDER_PLACED,
            data.indentId,
            `Order ${orderNumber} placed for indent ${indent.indentNumber}.`
        );

        await notificationsService.notifyRole(
            NotificationType.ORDER_PLACED,
            Role.DIRECTOR,
            data.indentId,
            `Order ${orderNumber} placed for indent ${indent.indentNumber}.`
        );

        return order;
    }

    async update(id: string, data: UpdateOrderDto, userId: string): Promise<unknown> {
        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) throw new NotFoundError('Order not found');

        const grandTotal = (data.totalAmount ?? order.totalAmount ?? 0) +
            (data.taxAmount ?? order.taxAmount ?? 0) +
            (data.shippingAmount ?? order.shippingAmount ?? 0);

        const updated = await prisma.order.update({
            where: { id },
            data: {
                vendorName: data.vendorName,
                vendorContact: data.vendorContact,
                vendorEmail: data.vendorEmail,
                vendorAddress: data.vendorAddress,
                vendorGstNo: data.vendorGstNo,
                vendorContactPerson: data.vendorContactPerson,
                vendorContactPhone: data.vendorContactPhone,
                vendorNatureOfBusiness: data.vendorNatureOfBusiness,
                totalAmount: data.totalAmount,
                taxAmount: data.taxAmount,
                shippingAmount: data.shippingAmount,
                grandTotal,
                expectedDeliveryDate: data.expectedDeliveryDate,
                remarks: data.remarks,
            },
            include: { orderItems: { include: { invoices: true } }, invoices: true },
        });

        await createAuditLog(userId, {
            action: AuditAction.ORDER_UPDATED,
            entityType: EntityType.ORDER,
            entityId: id,
            indentId: order.indentId,
        });

        return updated;
    }

    /**
     * Mark order as purchased
     */
    async markAsPurchased(id: string, userId: string): Promise<unknown> {
        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) throw new NotFoundError('Order not found');

        const updated = await prisma.order.update({
            where: { id },
            data: {
                isPurchased: true,
                purchasedAt: new Date(),
            },
            include: { orderItems: true, invoices: true },
        });

        await createAuditLog(userId, {
            action: AuditAction.ORDER_UPDATED,
            entityType: EntityType.ORDER,
            entityId: id,
            indentId: order.indentId,
            metadata: { action: 'marked_as_purchased' },
        });

        return updated;
    }

    /**
     * Update order item vendor details and pricing
     */
    async updateOrderItem(
        orderId: string,
        itemId: string,
        data: {
            vendorName?: string;
            vendorAddress?: string;
            vendorGstNo?: string;
            vendorContactPerson?: string;
            vendorContactPhone?: string;
            vendorNatureOfBusiness?: string;
            quantity?: number;
            unitPrice?: number;
        },
        userId: string
    ): Promise<unknown> {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new NotFoundError('Order not found');

        const orderItem = await prisma.orderItem.findFirst({
            where: { id: itemId, orderId },
        });
        if (!orderItem) throw new NotFoundError('Order item not found');

        const totalPrice = data.unitPrice && data.quantity
            ? data.unitPrice * data.quantity
            : data.unitPrice
                ? data.unitPrice * orderItem.quantity
                : data.quantity && orderItem.unitPrice
                    ? orderItem.unitPrice * data.quantity
                    : orderItem.totalPrice;

        const updated = await prisma.orderItem.update({
            where: { id: itemId },
            data: {
                ...data,
                totalPrice,
            },
            include: { invoices: true },
        });

        await createAuditLog(userId, {
            action: AuditAction.ORDER_UPDATED,
            entityType: EntityType.ORDER,
            entityId: orderId,
            indentId: order.indentId,
            metadata: { itemId, action: 'item_updated' },
        });

        return updated;
    }

    /**
     * Upload invoice for an order
     */
    async uploadOrderInvoice(
        orderId: string,
        file: Express.Multer.File,
        name: string,
        userId: string
    ): Promise<unknown> {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new NotFoundError('Order not found');

        const invoice = await prisma.orderInvoice.create({
            data: {
                orderId,
                name,
                filename: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                path: file.path,
            },
        });

        await createAuditLog(userId, {
            action: AuditAction.ORDER_UPDATED,
            entityType: EntityType.ORDER,
            entityId: orderId,
            indentId: order.indentId,
            metadata: { invoiceId: invoice.id, action: 'invoice_uploaded' },
        });

        return invoice;
    }

    /**
     * Upload invoice for an order item
     */
    async uploadOrderItemInvoice(
        orderId: string,
        itemId: string,
        file: Express.Multer.File,
        name: string,
        userId: string
    ): Promise<unknown> {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new NotFoundError('Order not found');

        const orderItem = await prisma.orderItem.findFirst({
            where: { id: itemId, orderId },
        });
        if (!orderItem) throw new NotFoundError('Order item not found');

        const invoice = await prisma.orderItemInvoice.create({
            data: {
                orderItemId: itemId,
                name,
                filename: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                path: file.path,
            },
        });

        await createAuditLog(userId, {
            action: AuditAction.ORDER_UPDATED,
            entityType: EntityType.ORDER,
            entityId: orderId,
            indentId: order.indentId,
            metadata: { itemId, invoiceId: invoice.id, action: 'item_invoice_uploaded' },
        });

        return invoice;
    }

    /**
     * Delete order invoice
     */
    async deleteOrderInvoice(orderId: string, invoiceId: string, userId: string): Promise<void> {
        const invoice = await prisma.orderInvoice.findFirst({
            where: { id: invoiceId, orderId },
        });
        if (!invoice) throw new NotFoundError('Invoice not found');

        // Delete file
        if (fs.existsSync(invoice.path)) {
            fs.unlinkSync(invoice.path);
        }

        await prisma.orderInvoice.delete({ where: { id: invoiceId } });

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order) {
            await createAuditLog(userId, {
                action: AuditAction.ORDER_UPDATED,
                entityType: EntityType.ORDER,
                entityId: orderId,
                indentId: order.indentId,
                metadata: { invoiceId, action: 'invoice_deleted' },
            });
        }
    }

    /**
     * Delete order item invoice
     */
    async deleteOrderItemInvoice(
        orderId: string,
        itemId: string,
        invoiceId: string,
        userId: string
    ): Promise<void> {
        const invoice = await prisma.orderItemInvoice.findFirst({
            where: { id: invoiceId, orderItemId: itemId },
        });
        if (!invoice) throw new NotFoundError('Invoice not found');

        // Delete file
        if (fs.existsSync(invoice.path)) {
            fs.unlinkSync(invoice.path);
        }

        await prisma.orderItemInvoice.delete({ where: { id: invoiceId } });

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order) {
            await createAuditLog(userId, {
                action: AuditAction.ORDER_UPDATED,
                entityType: EntityType.ORDER,
                entityId: orderId,
                indentId: order.indentId,
                metadata: { itemId, invoiceId, action: 'item_invoice_deleted' },
            });
        }
    }

    /**
     * Get director-approved indents ready for ordering
     */
    async getApprovedIndents(
        params: {
            page?: number;
            limit?: number;
            siteId?: string;
            fromDate?: Date;
            toDate?: Date;
        }
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);

        const where: Record<string, unknown> = {
            status: IndentStatus.DIRECTOR_APPROVED,
            order: null, // No order created yet
        };

        if (params.siteId) where.siteId = params.siteId;
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
                    createdBy: { select: { name: true } },
                    items: {
                        include: { material: { include: { unit: true } } },
                    },
                },
                skip: pag.skip,
                take: pag.take,
                orderBy: { directorApprovedAt: 'desc' },
            }),
            prisma.indent.count({ where }),
        ]);

        return buildPaginatedResult(indents, total, pag);
    }
}

export const ordersService = new OrdersService();
export default ordersService;
