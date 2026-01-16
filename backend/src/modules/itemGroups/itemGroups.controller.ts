import { Request, Response, NextFunction } from 'express';
import { itemGroupsService } from './itemGroups.service';

class ItemGroupsController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { search, isActive, includeCounts } = req.query;
            const result = await itemGroupsService.findAll({
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
            const itemGroup = await itemGroupsService.findById(req.params.id);
            res.json({ success: true, data: itemGroup });
        } catch (error) {
            next(error);
        }
    }

    async getNames(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const names = await itemGroupsService.getNames();
            res.json({ success: true, data: names });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const itemGroup = await itemGroupsService.create(req.body);
            res.status(201).json({ success: true, data: itemGroup });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const itemGroup = await itemGroupsService.update(req.params.id, req.body);
            res.json({ success: true, data: itemGroup });
        } catch (error) {
            next(error);
        }
    }
}

export const itemGroupsController = new ItemGroupsController();
export default itemGroupsController;
