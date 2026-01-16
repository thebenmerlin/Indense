import { NotificationType, Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotificationData, notificationTemplates } from './notifications.types';
import { PaginatedResult } from '../../types';
import { parsePaginationParams, buildPaginatedResult } from '../../utils/pagination';

class NotificationsService {
    /**
     * Create a notification for a user
     */
    async create(data: NotificationData): Promise<unknown> {
        return prisma.notification.create({
            data: {
                type: data.type,
                userId: data.userId,
                title: data.title,
                message: data.message,
                indentId: data.indentId,
                data: data.data as object | undefined,
            },
        });
    }

    /**
     * Create notifications for multiple users
     */
    async createMany(type: NotificationType, userIds: string[], indentId?: string, customMessage?: string): Promise<void> {
        const template = notificationTemplates[type];

        await prisma.notification.createMany({
            data: userIds.map((userId) => ({
                type,
                userId,
                title: template.title,
                message: customMessage || template.message,
                indentId,
            })),
        });
    }

    /**
     * Notify all users with a specific role
     */
    async notifyRole(type: NotificationType, role: Role, indentId?: string, customMessage?: string): Promise<void> {
        const users = await prisma.user.findMany({
            where: { role, isActive: true },
            select: { id: true },
        });

        await this.createMany(type, users.map((u) => u.id), indentId, customMessage);
    }

    /**
     * Notify site engineer by indentId
     */
    async notifySiteEngineer(type: NotificationType, indentId: string, customMessage?: string): Promise<void> {
        const indent = await prisma.indent.findUnique({
            where: { id: indentId },
            select: { createdById: true },
        });

        if (indent) {
            const template = notificationTemplates[type];
            await this.create({
                type,
                userId: indent.createdById,
                title: template.title,
                message: customMessage || template.message,
                indentId,
            });
        }
    }

    /**
     * Get notifications for a user
     */
    async findByUserId(
        userId: string,
        params: { page?: number; limit?: number; unreadOnly?: boolean }
    ): Promise<PaginatedResult<unknown>> {
        const pag = parsePaginationParams(params);
        const where: Record<string, unknown> = { userId };
        if (params.unreadOnly) where.isRead = false;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: pag.skip,
                take: pag.take,
            }),
            prisma.notification.count({ where }),
        ]);

        return buildPaginatedResult(notifications, total, pag);
    }

    /**
     * Mark notification as read
     */
    async markAsRead(id: string, userId: string): Promise<unknown> {
        return prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true, readAt: new Date() },
        });
    }

    /**
     * Mark all as read for user
     */
    async markAllAsRead(userId: string): Promise<void> {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }

    /**
     * Get unread count for user
     */
    async getUnreadCount(userId: string): Promise<number> {
        return prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
