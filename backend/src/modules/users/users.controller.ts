import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { Role } from '@prisma/client';

class UsersController {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, role, siteId, isActive, isRevoked, search } = req.query;

            const result = await usersService.findAll({
                page: page ? parseInt(page as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined,
                role: role as Role | undefined,
                siteId: siteId as string | undefined,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                isRevoked: isRevoked === 'true' ? true : isRevoked === 'false' ? false : undefined,
                search: search as string | undefined,
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

    async getUsersByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { role } = req.params;
            const validRoles = ['SITE_ENGINEER', 'PURCHASE_TEAM', 'DIRECTOR'];

            if (!validRoles.includes(role)) {
                res.status(400).json({ success: false, message: 'Invalid role' });
                return;
            }

            const users = await usersService.getUsersByRole(role as Role);
            res.json({ success: true, data: users });
        } catch (error) {
            next(error);
        }
    }

    async getRoleCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const counts = await usersService.getRoleCounts();
            res.json({ success: true, data: counts });
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

    async promoteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUserId = req.user!.id;
            const user = await usersService.promoteUser(req.params.id, currentUserId);
            res.json({
                success: true,
                data: user,
                message: `User promoted to ${user.role}`,
            });
        } catch (error) {
            next(error);
        }
    }

    async demoteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUserId = req.user!.id;
            const { siteId } = req.body;
            const user = await usersService.demoteUser(req.params.id, currentUserId, siteId);
            res.json({
                success: true,
                data: user,
                message: `User demoted to ${user.role}`,
            });
        } catch (error) {
            next(error);
        }
    }

    async revokeUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUserId = req.user!.id;
            const user = await usersService.revokeUser(req.params.id, currentUserId);
            res.json({
                success: true,
                data: user,
                message: 'User access revoked',
            });
        } catch (error) {
            next(error);
        }
    }

    async restoreUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await usersService.restoreUser(req.params.id);
            res.json({
                success: true,
                data: user,
                message: 'User access restored',
            });
        } catch (error) {
            next(error);
        }
    }

    async toggleSiteEngineer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUserId = req.user!.id;
            const { siteId } = req.body;
            const result = await usersService.toggleSiteEngineerRole(req.params.id, currentUserId, siteId);
            res.json({
                success: true,
                data: result,
                message: result.hasSiteEngineerAccess
                    ? 'Site Engineer role assigned'
                    : 'Site Engineer role removed',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const usersController = new UsersController();
export default usersController;
