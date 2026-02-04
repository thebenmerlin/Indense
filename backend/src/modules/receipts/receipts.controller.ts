import { Request, Response, NextFunction } from 'express';
import { receiptsService } from './receipts.service';

class ReceiptsController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, indentId, siteId, fromDate, toDate } = req.query;
            const result = await receiptsService.findAll(
                {
                    page: page ? parseInt(page as string, 10) : undefined,
                    limit: limit ? parseInt(limit as string, 10) : undefined,
                    indentId: indentId as string | undefined,
                    siteId: siteId as string | undefined,
                    fromDate: fromDate ? new Date(fromDate as string) : undefined,
                    toDate: toDate ? new Date(toDate as string) : undefined,
                },
                req.user!.role,
                req.user!.siteId
            );
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const receipt = await receiptsService.findById(
                req.params.id,
                req.user!.role,
                req.user!.siteId
            );
            res.json({ success: true, data: receipt });
        } catch (error) {
            next(error);
        }
    }

    async findByIndentId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const receipts = await receiptsService.findByIndentId(
                req.params.indentId,
                req.user!.role,
                req.user!.siteId
            );
            res.json({ success: true, data: receipts });
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

    async deleteReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await receiptsService.deleteReceipt(
                req.params.id,
                req.user!.id,
                req.user!.siteId
            );
            res.json({ success: true, message: 'Receipt deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await receiptsService.deleteImage(
                req.params.id,
                req.params.imageId,
                req.user!.id,
                req.user!.siteId
            );
            res.json({ success: true, message: 'Image deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export const receiptsController = new ReceiptsController();
export default receiptsController;
