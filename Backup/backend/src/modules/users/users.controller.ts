import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { Role } from '@prisma/client';

class UsersController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, role, siteId, isActive } = req.query;

            const result = await usersService.findAll({
                page: page ? parseInt(page as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined,
                role: role as Role | undefined,
                siteId: siteId as string | undefined,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            });

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await usersService.findById(req.params.id);
            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await usersService.create(req.body);
            res.status(201).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await usersService.update(req.params.id, req.body);
            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const usersController = new UsersController();
export default usersController;
