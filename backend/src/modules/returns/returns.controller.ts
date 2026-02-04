import { Request, Response, NextFunction } from 'express';
import { returnsService } from './returns.service';
import { ReturnStatus } from '@prisma/client';

class ReturnsController {
    async findAllDamageReports(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, indentId, isResolved, status, siteId, fromDate, toDate } = req.query;
            const result = await returnsService.findAllDamageReports(
                {
                    page: page ? parseInt(page as string, 10) : undefined,
                    limit: limit ? parseInt(limit as string, 10) : undefined,
                    indentId: indentId as string | undefined,
                    isResolved: isResolved === 'true' ? true : isResolved === 'false' ? false : undefined,
                    status: status as string | undefined,
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

    async findDamageReportById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await returnsService.findDamageReportById(
                req.params.id,
                req.user!.role,
                req.user!.siteId
            );
            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    async findDamageReportsByIndentId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reports = await returnsService.findDamageReportsByIndentId(
                req.params.indentId,
                req.user!.role,
                req.user!.siteId
            );
            res.json({ success: true, data: reports });
        } catch (error) {
            next(error);
        }
    }

    async createDamageReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await returnsService.createDamageReport(
                req.body,
                req.user!.id,
                req.user!.siteId
            );
            res.status(201).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    async updateDamageReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await returnsService.updateDamageReport(
                req.params.id,
                req.body,
                req.user!.id,
                req.user!.siteId
            );
            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    async submitDamageReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await returnsService.submitDamageReport(
                req.params.id,
                req.user!.id,
                req.user!.siteId
            );
            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    async uploadDamageImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, error: 'No file uploaded' });
                return;
            }
            const image = await returnsService.uploadDamageImage(
                req.params.id,
                req.file,
                req.user!.id,
                req.user!.siteId
            );
            res.status(201).json({ success: true, data: image });
        } catch (error) {
            next(error);
        }
    }

    async deleteDamageImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await returnsService.deleteDamageImage(
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

    async deleteDamageReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await returnsService.deleteDamageReport(
                req.params.id,
                req.user!.id,
                req.user!.siteId
            );
            res.json({ success: true, message: 'Damage report deleted successfully' });
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

    async reorderDamage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { expectedDeliveryDate } = req.body;
            if (!expectedDeliveryDate) {
                res.status(400).json({ success: false, error: 'Expected delivery date is required' });
                return;
            }
            const report = await returnsService.reorderDamage(
                req.params.id,
                req.user!.id,
                new Date(expectedDeliveryDate)
            );
            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    async getReorderedDamageReports(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, siteId, fromDate, toDate } = req.query;
            const result = await returnsService.getReorderedDamageReports(
                {
                    page: page ? parseInt(page as string, 10) : undefined,
                    limit: limit ? parseInt(limit as string, 10) : undefined,
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

    async getPartiallyReceivedIndents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, siteId, fromDate, toDate, search } = req.query;
            const result = await returnsService.getPartiallyReceivedIndents(
                {
                    page: page ? parseInt(page as string, 10) : undefined,
                    limit: limit ? parseInt(limit as string, 10) : undefined,
                    siteId: siteId as string | undefined,
                    fromDate: fromDate ? new Date(fromDate as string) : undefined,
                    toDate: toDate ? new Date(toDate as string) : undefined,
                    search: search as string | undefined,
                },
                req.user!.role,
                req.user!.siteId
            );
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async getPurchasedIndentsForDamage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, search, fromDate, toDate } = req.query;
            const result = await returnsService.getPurchasedIndentsForDamage(
                {
                    page: page ? parseInt(page as string, 10) : undefined,
                    limit: limit ? parseInt(limit as string, 10) : undefined,
                    search: search as string | undefined,
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

    async findAllReturns(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, status, siteId } = req.query;
            const result = await returnsService.findAllReturns(
                {
                    page: page ? parseInt(page as string, 10) : undefined,
                    limit: limit ? parseInt(limit as string, 10) : undefined,
                    status: status as ReturnStatus | undefined,
                    siteId: siteId as string | undefined,
                },
                req.user!.role,
                req.user!.siteId
            );
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async createReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const returnRecord = await returnsService.createReturn(
                req.body,
                req.user!.id,
                req.user!.siteId
            );
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
