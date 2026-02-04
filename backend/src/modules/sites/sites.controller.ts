import { Request, Response, NextFunction } from 'express';
import { sitesService } from './sites.service';

class SitesController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, isActive, isClosed, search, includeCounts } = req.query;

            const result = await sitesService.findAll({
                page: page ? parseInt(page as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                isClosed: isClosed === 'true' ? true : isClosed === 'false' ? false : undefined,
                search: search as string | undefined,
                includeCounts: includeCounts === 'true',
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

    async findByIdWithEngineers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const site = await sitesService.findByIdWithEngineers(req.params.id);
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

    async assignEngineers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { engineerIds } = req.body;
            await sitesService.assignEngineers(req.params.id, engineerIds);
            res.json({ success: true, message: 'Engineers assigned successfully' });
        } catch (error) {
            next(error);
        }
    }

    async removeEngineer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await sitesService.removeEngineer(req.params.id, req.params.engineerId);
            res.json({ success: true, message: 'Engineer removed successfully' });
        } catch (error) {
            next(error);
        }
    }

    async getAvailableEngineers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const engineers = await sitesService.getAvailableEngineers(req.params.id);
            res.json({ success: true, data: engineers });
        } catch (error) {
            next(error);
        }
    }

    async closeSite(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const site = await sitesService.closeSite(req.params.id);
            res.json({ success: true, data: site, message: 'Site closed successfully' });
        } catch (error) {
            next(error);
        }
    }

    async deleteSite(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await sitesService.deleteSite(req.params.id);
            res.json({ success: true, message: 'Site deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/sites/public
     * Public endpoint for registration - no auth required
     */
    async findAllPublic(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const sites = await sitesService.findAllPublic();
            res.json({ success: true, data: sites });
        } catch (error) {
            next(error);
        }
    }
}

export const sitesController = new SitesController();
export default sitesController;
