import { Request, Response, NextFunction } from 'express';
import { receiptsService } from './receipts.service';

class ReceiptsController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, indentId } = req.query;
            const result = await receiptsService.findAll(
                {
                    page: page ? parseInt(page as string, 10) : undefined,
                    limit: limit ? parseInt(limit as string, 10) : undefined,
                    indentId: indentId as string | undefined,
                },
                req.user!.role,
                req.user!.siteId
            );
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const receipt = await receiptsService.create(
                req.body,
                req.user!.id,
                req.user!.siteId
            );
            res.status(201).json({ success: true, data: receipt });
        } catch (error) {
            next(error);
        }
    }

    async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, error: 'No file uploaded' });
                return;
            }
            const image = await receiptsService.uploadImage(
                req.params.id,
                req.file,
                req.user!.id
            );
            res.status(201).json({ success: true, data: image });
        } catch (error) {
            next(error);
        }
    }
}

export const receiptsController = new ReceiptsController();
export default receiptsController;
