import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';

class NotificationsController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, unreadOnly } = req.query;
            const result = await notificationsService.findByUserId(req.user!.id, {
                page: page ? parseInt(page as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined,
                unreadOnly: unreadOnly === 'true',
            });
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const count = await notificationsService.getUnreadCount(req.user!.id);
            res.json({ success: true, data: { count } });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await notificationsService.markAsRead(req.params.id, req.user!.id);
            res.json({ success: true, message: 'Notification marked as read' });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await notificationsService.markAllAsRead(req.user!.id);
            res.json({ success: true, message: 'All notifications marked as read' });
        } catch (error) {
            next(error);
        }
    }
}

export const notificationsController = new NotificationsController();
export default notificationsController;
