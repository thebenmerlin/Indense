import { Role } from '../constants/roles';

// Auth types
export interface User {
    id: string;
    email: string;
    phone?: string | null;
    name: string;
    dob?: Date | null;
    role: Role;
    allowedRoles?: Role[]; // Roles user can switch to
    siteId?: string | null;
    siteName?: string;
    currentSiteId?: string | null;
    currentSiteName?: string;
    sites?: Array<{ id: string; name: string; code: string }>;
    theme?: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
