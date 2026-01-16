import { Request, Response, NextFunction } from 'express';
import { uomService } from './uom.service';

class UOMController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { search, isActive, includeCounts } = req.query;
            const result = await uomService.findAll({
                search: search as string | undefined,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                includeCounts: includeCounts === 'true',
            });
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const unit = await uomService.findById(req.params.id);
            res.json({ success: true, data: unit });
        } catch (error) {
            next(error);
        }
    }

    async getForDropdown(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const units = await uomService.getForDropdown();
            res.json({ success: true, data: units });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const unit = await uomService.create(req.body);
            res.status(201).json({ success: true, data: unit });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const unit = await uomService.update(req.params.id, req.body);
            res.json({ success: true, data: unit });
        } catch (error) {
            next(error);
        }
    }
}

export const uomController = new UOMController();
export default uomController;
