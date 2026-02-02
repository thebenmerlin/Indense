import { create } from 'zustand';
import { storage } from '../utils/storage';
import { authApi } from '../api';
import { User, AuthState } from '../types';
import { Role } from '../constants';

interface AuthStore extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loadStoredAuth: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (email: string, password: string) => {
        const response = await authApi.login(email, password);

        await storage.setAccessToken(response.accessToken);
        await storage.setRefreshToken(response.refreshToken);
        await storage.setUser(JSON.stringify(response.user));

        set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
        });
    },

    logout: async () => {
        const refreshToken = get().refreshToken;
        try {
            if (refreshToken) {
                await authApi.logout(refreshToken);
            }
        } catch (error) {
            // Ignore logout errors
        }

        await storage.clearAuth();

        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    loadStoredAuth: async () => {
        try {
            const [accessToken, refreshToken, userJson] = await Promise.all([
                storage.getAccessToken(),
                storage.getRefreshToken(),
                storage.getUser(),
            ]);

            if (accessToken && refreshToken && userJson) {
                const user = JSON.parse(userJson) as User;
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            set({ isLoading: false });
        }
    },

    setUser: (user: User | null) => set({ user }),
}));

export default useAuthStore;
