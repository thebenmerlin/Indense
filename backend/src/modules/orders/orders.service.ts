import { IndentStatus, Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { CreateOrderDto, UpdateOrderDto, PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';
import { filterOrderForRole, filterOrdersForRole } from '../../utils/visibility';
import { canPlaceOrder, validateTransition } from '../indents/indents.stateMachine';
import { logIndentStateChange, createAuditLog } from '../../middleware/auditLog';
import { AuditAction, EntityType } from '../../types/enums';

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
        params: { page?: number; limit?: number; siteId?: string },
        userRole: Role
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);

        const where: Record<string, unknown> = {};
        if (params.siteId) {
            where.indent = { siteId: params.siteId };
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    indent: { include: { site: true } },
                    orderItems: true,
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
                indent: { include: { site: true, items: { include: { material: true } } } },
                orderItems: true,
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
        const indent = await prisma.indent.findUnique({ where: { id: data.indentId } });
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
                        })),
                    },
                },
                include: { orderItems: true },
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
                ...data,
                grandTotal,
            },
            include: { orderItems: true },
        });

        await createAuditLog(userId, {
            action: AuditAction.ORDER_UPDATED,
            entityType: EntityType.ORDER,
            entityId: id,
            indentId: order.indentId,
        });

        return updated;
    }
}

export const ordersService = new OrdersService();
export default ordersService;
