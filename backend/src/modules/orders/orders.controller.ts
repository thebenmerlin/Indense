import { Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service';

class OrdersController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, siteId, isPurchased, fromDate, toDate } = req.query;
            const result = await ordersService.findAll(
                {
                    page: page ? parseInt(page as string, 10) : undefined,
                    limit: limit ? parseInt(limit as string, 10) : undefined,
                    siteId: siteId as string | undefined,
                    isPurchased: isPurchased === 'true' ? true : isPurchased === 'false' ? false : undefined,
                    fromDate: fromDate ? new Date(fromDate as string) : undefined,
                    toDate: toDate ? new Date(toDate as string) : undefined,
                },
                req.user!.role
            );
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const order = await ordersService.findById(
                req.params.id,
                req.user!.role,
                req.user!.siteId
            );
            res.json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const order = await ordersService.create(req.body, req.user!.id);
            res.status(201).json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const order = await ordersService.update(req.params.id, req.body, req.user!.id);
            res.json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    async markAsPurchased(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const order = await ordersService.markAsPurchased(req.params.id, req.user!.id);
            res.json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    async updateOrderItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const item = await ordersService.updateOrderItem(
                req.params.id,
                req.params.itemId,
                req.body,
                req.user!.id
            );
            res.json({ success: true, data: item });
        } catch (error) {
            next(error);
        }
    }

    async uploadOrderInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }
            const invoice = await ordersService.uploadOrderInvoice(
                req.params.id,
                req.file,
                req.body.name || 'Invoice',
                req.user!.id
            );
            res.status(201).json({ success: true, data: invoice });
        } catch (error) {
            next(error);
        }
    }

    async uploadOrderItemInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }
            const invoice = await ordersService.uploadOrderItemInvoice(
                req.params.id,
                req.params.itemId,
                req.file,
                req.body.name || 'Invoice',
                req.user!.id
            );
            res.status(201).json({ success: true, data: invoice });
        } catch (error) {
            next(error);
        }
    }

    async deleteOrderInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await ordersService.deleteOrderInvoice(
                req.params.id,
                req.params.invoiceId,
                req.user!.id
            );
            res.json({ success: true, message: 'Invoice deleted' });
        } catch (error) {
            next(error);
        }
    }

    async deleteOrderItemInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await ordersService.deleteOrderItemInvoice(
                req.params.id,
                req.params.itemId,
                req.params.invoiceId,
                req.user!.id
            );
            res.json({ success: true, message: 'Invoice deleted' });
        } catch (error) {
            next(error);
        }
    }

    async getApprovedIndents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, siteId, fromDate, toDate } = req.query;
            const result = await ordersService.getApprovedIndents({
                page: page ? parseInt(page as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined,
                siteId: siteId as string | undefined,
                fromDate: fromDate ? new Date(fromDate as string) : undefined,
                toDate: toDate ? new Date(toDate as string) : undefined,
            });
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }
}

export const ordersController = new OrdersController();
export default ordersController;
