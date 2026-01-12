import { Request, Response, NextFunction } from 'express';
import { sitesService } from './sites.service';

class SitesController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, isActive, search } = req.query;

            const result = await sitesService.findAll({
                page: page ? parseInt(page as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                search: search as string | undefined,
            });

            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const site = await sitesService.findById(req.params.id);
            res.json({ success: true, data: site });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const site = await sitesService.create(req.body);
            res.status(201).json({ success: true, data: site });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const site = await sitesService.update(req.params.id, req.body);
            res.json({ success: true, data: site });
        } catch (error) {
            next(error);
        }
    }
}

export const sitesController = new SitesController();
export default sitesController;
