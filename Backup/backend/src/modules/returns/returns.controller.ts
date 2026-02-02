import { Request, Response, NextFunction } from 'express';
import { returnsService } from './returns.service';
import { ReturnStatus } from '@prisma/client';

class ReturnsController {
    async findAllDamageReports(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, indentId, isResolved } = req.query;
            const result = await returnsService.findAllDamageReports(
                {
                    page: page ? parseInt(page as string, 10) : undefined,
                    limit: limit ? parseInt(limit as string, 10) : undefined,
                    indentId: indentId as string | undefined,
                    isResolved: isResolved === 'true' ? true : isResolved === 'false' ? false : undefined,
                },
                req.user!.role,
                req.user!.siteId
            );
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async createDamageReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await returnsService.createDamageReport(req.body, req.user!.id);
            res.status(201).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    async resolveDamage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await returnsService.resolveDamage(
                req.params.id,
                req.user!.id,
                req.body.resolution
            );
            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    async findAllReturns(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, status } = req.query;
            const result = await returnsService.findAllReturns({
                page: page ? parseInt(page as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined,
                status: status as ReturnStatus | undefined,
            });
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async createReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const returnRecord = await returnsService.createReturn(req.body, req.user!.id);
            res.status(201).json({ success: true, data: returnRecord });
        } catch (error) {
            next(error);
        }
    }

    async approveReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const returnRecord = await returnsService.approveReturn(req.params.id, req.user!.id);
            res.json({ success: true, data: returnRecord });
        } catch (error) {
            next(error);
        }
    }

    async processReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const returnRecord = await returnsService.processReturn(
                req.params.id,
                req.user!.id,
                req.body.remarks
            );
            res.json({ success: true, data: returnRecord });
        } catch (error) {
            next(error);
        }
    }
}

export const returnsController = new ReturnsController();
export default returnsController;
