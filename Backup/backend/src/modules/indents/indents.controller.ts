import { Request, Response, NextFunction } from 'express';
import { indentsService } from './indents.service';
import { IndentStatus } from '@prisma/client';
import { ForbiddenError } from '../../utils/errors';

class IndentsController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, status, siteId, createdById, fromDate, toDate, search } = req.query;

            const result = await indentsService.findAll(
                {
                    status: status as IndentStatus | undefined,
                    siteId: siteId as string | undefined,
                    createdById: createdById as string | undefined,
                    fromDate: fromDate ? new Date(fromDate as string) : undefined,
                    toDate: toDate ? new Date(toDate as string) : undefined,
                    search: search as string | undefined,
                },
                {
                    page: page ? parseInt(page as string, 10) : undefined,
                    limit: limit ? parseInt(limit as string, 10) : undefined,
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
            const indent = await indentsService.findById(
                req.params.id,
                req.user!.role,
                req.user!.siteId
            );
            res.json({ success: true, data: indent });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user!.siteId) {
                throw new ForbiddenError('Only Site Engineers can create indents');
            }

            const indent = await indentsService.create(
                req.body,
                req.user!.id,
                req.user!.siteId
            );

            res.status(201).json({ success: true, data: indent });
        } catch (error) {
            next(error);
        }
    }

    async purchaseApprove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const indent = await indentsService.purchaseApprove(
                req.params.id,
                req.user!.id,
                req.body.remarks
            );
            res.json({ success: true, data: indent });
        } catch (error) {
            next(error);
        }
    }

    async directorApprove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const indent = await indentsService.directorApprove(
                req.params.id,
                req.user!.id,
                req.body.remarks
            );
            res.json({ success: true, data: indent });
        } catch (error) {
            next(error);
        }
    }

    async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const indent = await indentsService.reject(
                req.params.id,
                req.user!.id,
                req.body.reason
            );
            res.json({ success: true, data: indent });
        } catch (error) {
            next(error);
        }
    }

    async close(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const indent = await indentsService.close(req.params.id, req.user!.id);
            res.json({ success: true, data: indent });
        } catch (error) {
            next(error);
        }
    }
}

export const indentsController = new IndentsController();
export default indentsController;
