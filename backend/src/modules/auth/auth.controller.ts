import { Request, Response, NextFunction } from 'express';
import { authService, RegisterInput } from './auth.service';
import { createAuditLog } from '../../middleware/auditLog';
import { AuditAction, EntityType } from '../../types/enums';

class AuthController {
    /**
     * POST /api/v1/auth/register
     * Register a new user
     */
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const input: RegisterInput = {
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                name: req.body.name,
                dob: req.body.dob ? new Date(req.body.dob) : undefined,
                role: req.body.role,
                siteIds: req.body.siteIds,
                securityQuestion: req.body.securityQuestion,
                securityAnswer: req.body.securityAnswer,
            };

            const result = await authService.register(input);

            // Audit log
            await createAuditLog(result.user.id, {
                action: AuditAction.USER_LOGIN,
                entityType: EntityType.USER,
                entityId: result.user.id,
                metadata: { action: 'USER_REGISTERED' },
            }, req);

            res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/login
     * Authenticate user with email and password
     */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, phone, password } = req.body;

            // Support both email and phone login
            const result = email
                ? await authService.login(email, password)
                : await authService.loginWithPhone(phone, password);

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
     * POST /api/v1/auth/forgot-password
     * Get security question for password recovery
     */
    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { emailOrPhone } = req.body;

            const result = await authService.getSecurityQuestion(emailOrPhone);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/verify-security-question
     * Verify security answer and get reset token
     */
    async verifySecurityQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, answer } = req.body;

            const result = await authService.verifySecurityAnswer(userId, answer);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/reset-password
     * Reset password with reset token
     */
    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { resetToken, newPassword } = req.body;

            await authService.resetPassword(resetToken, newPassword);

            res.json({
                success: true,
                message: 'Password reset successfully',
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
     * POST /api/v1/auth/switch-site
     * Switch current active site for multi-site users
     */
    async switchSite(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { siteId } = req.body;

            const result = await authService.switchSite(userId, siteId);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/auth/theme
     * Update theme preference
     */
    async updateTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { theme } = req.body;

            await authService.updateTheme(userId, theme);

            res.json({
                success: true,
                message: 'Theme updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/switch-role
     * Switch active role for multi-role users
     */
    async switchRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { role } = req.body;

            const result = await authService.switchRole(userId, role);

            res.json({
                success: true,
                data: result,
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

