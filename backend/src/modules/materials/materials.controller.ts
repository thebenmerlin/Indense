import { Request, Response, NextFunction } from 'express';
import { materialsService } from './materials.service';

class MaterialsController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, itemGroupId, search, isActive } = req.query;
            const result = await materialsService.findAll({
                page: page ? parseInt(page as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined,
                itemGroupId: itemGroupId as string | undefined,
                search: search as string | undefined,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            });
            res.json({ success: true, data: result.data, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const material = await materialsService.findById(req.params.id);
            res.json({ success: true, data: material });
        } catch (error) {
            next(error);
        }
    }

    async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const categories = await materialsService.getCategories();
            res.json({ success: true, data: categories });
        } catch (error) {
            next(error);
        }
    }

    async getUnits(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const units = await materialsService.getUnits();
            res.json({ success: true, data: units });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Fast autocomplete search for material names
     * GET /materials/search?q=cement&itemGroupId=xxx&limit=20
     */
    async searchAutocomplete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { q, itemGroupId, limit } = req.query;
            const results = await materialsService.searchAutocomplete({
                query: (q as string) || '',
                itemGroupId: itemGroupId as string | undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined,
            });
            res.json({ success: true, data: results });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const material = await materialsService.create(req.body);
            res.status(201).json({ success: true, data: material });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const material = await materialsService.update(req.params.id, req.body);
            res.json({ success: true, data: material });
        } catch (error) {
            next(error);
        }
    }
}

export const materialsController = new MaterialsController();
export default materialsController;

