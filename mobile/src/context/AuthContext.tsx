import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

// Auth storage keys
const AUTH_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER: 'auth_user',
} as const;

// User type
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
    dob?: string;
    siteId?: string;
    siteName?: string;
    currentSiteId?: string;
    currentSiteName?: string;
    allowedRoles?: string[];
    sites?: Array<{ id: string; name: string; code: string }>;
    theme?: string;
}

// Auth context state
interface AuthContextState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// Auth context actions
interface AuthContextActions {
    login: (accessToken: string, refreshToken: string, user: AuthUser) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

type AuthContextType = AuthContextState & AuthContextActions;

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage helpers
const storage = {
    async get(key: string): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(key);
        } catch {
            return null;
        }
    },
    async set(key: string, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (e) {
            console.warn('Storage set failed:', e);
        }
    },
    async remove(key: string): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (e) {
            console.warn('Storage remove failed:', e);
        }
    },
};

// Auth Provider component
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load stored auth on mount
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const [accessToken, userJson] = await Promise.all([
                storage.get(AUTH_KEYS.ACCESS_TOKEN),
                storage.get(AUTH_KEYS.USER),
            ]);

            if (accessToken && userJson) {
                const parsedUser = JSON.parse(userJson) as AuthUser;
                setUser(parsedUser);
            }
        } catch (e) {
            console.warn('Failed to load stored auth:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = useCallback(async (accessToken: string, refreshToken: string, userData: AuthUser) => {
        await Promise.all([
            storage.set(AUTH_KEYS.ACCESS_TOKEN, accessToken),
            storage.set(AUTH_KEYS.REFRESH_TOKEN, refreshToken),
            storage.set(AUTH_KEYS.USER, JSON.stringify(userData)),
        ]);
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        await Promise.all([
            storage.remove(AUTH_KEYS.ACCESS_TOKEN),
            storage.remove(AUTH_KEYS.REFRESH_TOKEN),
            storage.remove(AUTH_KEYS.USER),
        ]);
        setUser(null);
    }, []);

    const refreshAuth = useCallback(async () => {
        await loadStoredAuth();
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Export default
export default AuthContext;
