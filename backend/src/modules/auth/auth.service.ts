import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/database';
import { authConfig } from '../../config/auth';
import { UnauthorizedError, BadRequestError } from '../../utils/errors';
import { JwtPayload, RefreshTokenPayload } from '../../types/express';

export interface LoginResult {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        siteId: string | null;
        siteName?: string;
    };
}

class AuthService {
    /**
     * Authenticate user with email and password
     */
    async login(email: string, password: string): Promise<LoginResult> {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                site: {
                    select: { name: true },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        if (!user.isActive) {
            throw new UnauthorizedError('Account is deactivated');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user.id);

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                siteId: user.siteId,
                siteName: user.site?.name,
            },
        };
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(refreshTokenString: string): Promise<{ accessToken: string; refreshToken: string }> {
        // Verify refresh token
        let payload: RefreshTokenPayload;
        try {
            payload = jwt.verify(
                refreshTokenString,
                authConfig.jwt.secret
            ) as RefreshTokenPayload;
        } catch {
            throw new UnauthorizedError('Invalid refresh token');
        }

        // Find refresh token in database
        const storedToken = await prisma.refreshToken.findUnique({
            where: { id: payload.tokenId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        siteId: true,
                        isActive: true,
                    },
                },
            },
        });

        if (!storedToken) {
            throw new UnauthorizedError('Refresh token not found');
        }

        if (storedToken.expiresAt < new Date()) {
            // Delete expired token
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new UnauthorizedError('Refresh token expired');
        }

        if (!storedToken.user.isActive) {
            throw new UnauthorizedError('Account is deactivated');
        }

        // Rotate refresh token (delete old, create new)
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });

        const newAccessToken = this.generateAccessToken(storedToken.user);
        const newRefreshToken = await this.generateRefreshToken(storedToken.userId);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    /**
     * Logout user by invalidating refresh token
     */
    async logout(userId: string, refreshTokenString?: string): Promise<void> {
        if (refreshTokenString) {
            // Delete specific refresh token
            try {
                const payload = jwt.verify(
                    refreshTokenString,
                    authConfig.jwt.secret
                ) as RefreshTokenPayload;

                await prisma.refreshToken.delete({
                    where: { id: payload.tokenId },
                });
            } catch {
                // Token invalid or already deleted, ignore
            }
        } else {
            // Delete all refresh tokens for user
            await prisma.refreshToken.deleteMany({
                where: { userId },
            });
        }
    }

    /**
     * Change user password
     */
    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestError('User not found');
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestError('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, authConfig.bcrypt.saltRounds);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        // Invalidate all refresh tokens (force re-login)
        await prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }

    /**
     * Generate access token
     */
    private generateAccessToken(user: {
        id: string;
        email: string;
        role: string;
        siteId: string | null;
    }): string {
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role as JwtPayload['role'],
            siteId: user.siteId,
        };

        return jwt.sign(payload, authConfig.jwt.secret, {
            expiresIn: authConfig.jwt.accessTokenExpiresIn as string,
        } as jwt.SignOptions);
    }

    /**
     * Generate and store refresh token
     */
    private async generateRefreshToken(userId: string): Promise<string> {
        const tokenId = uuidv4();

        // Parse refresh token expiry (e.g., "7d" -> 7 days)
        const expiresIn = authConfig.jwt.refreshTokenExpiresIn;
        const match = expiresIn.match(/^(\d+)([dh])$/);
        let expiresAt: Date;

        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];
            const now = new Date();

            if (unit === 'd') {
                expiresAt = new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
            } else {
                expiresAt = new Date(now.getTime() + value * 60 * 60 * 1000);
            }
        } else {
            // Default to 7 days
            expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }

        const payload: RefreshTokenPayload = {
            userId,
            tokenId,
        };

        const token = jwt.sign(payload, authConfig.jwt.secret, {
            expiresIn: expiresIn as string,
        } as jwt.SignOptions);

        // Store in database
        await prisma.refreshToken.create({
            data: {
                id: tokenId,
                token,
                userId,
                expiresAt,
            },
        });

        return token;
    }
}

export const authService = new AuthService();
export default authService;
