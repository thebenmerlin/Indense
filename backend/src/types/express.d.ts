import { Role } from '@prisma/client';

// Extend Express Request to include authenticated user
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

// Authenticated user attached to requests
export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: Role;
    siteId: string | null;
}

// JWT Payload
export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
    siteId: string | null;
    iat?: number;
    exp?: number;
}

// Refresh Token Payload
export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
    iat?: number;
    exp?: number;
}

export { };
