import { Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service';

class OrdersController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, siteId } = req.query;
            const result = await ordersService.findAll(
                {
                    page: page ? parseInt(page as string, 10) : undefined,
                    limit: limit ? parseInt(limit as string, 10) : undefined,
                    siteId: siteId as string | undefined,
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
}

export const ordersController = new OrdersController();
export default ordersController;
