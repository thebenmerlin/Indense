import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { createAuditLog } from '../../middleware/auditLog';
import { AuditAction, EntityType } from '../../types/enums';

class AuthController {
    /**
     * POST /api/v1/auth/login
     * Authenticate user and return tokens
     */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            // Audit log
            await createAuditLog(result.user.id, {
                action: AuditAction.USER_LOGIN,
                entityType: EntityType.USER,
                entityId: result.user.id,
            }, req);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/refresh
     * Refresh access token
     */
    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;

            const result = await authService.refreshAccessToken(refreshToken);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/logout
     * Invalidate refresh token
     */
    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { refreshToken } = req.body;

            await authService.logout(userId, refreshToken);

            // Audit log
            await createAuditLog(userId, {
                action: AuditAction.USER_LOGOUT,
                entityType: EntityType.USER,
                entityId: userId,
            }, req);

            res.json({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/change-password
     * Change user password
     */
    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { currentPassword, newPassword } = req.body;

            await authService.changePassword(userId, currentPassword, newPassword);

            res.json({
                success: true,
                message: 'Password changed successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/auth/me
     * Get current user profile
     */
    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.json({
                success: true,
                data: req.user,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
export default authController;
