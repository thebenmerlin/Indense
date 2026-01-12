import { Role } from '../constants/roles';

// Auth types
export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    siteId: string | null;
    siteName?: string;
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
