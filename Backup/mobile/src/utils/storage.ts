import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

export const storage = {
    async getAccessToken(): Promise<string | null> {
        return SecureStore.getItemAsync(TOKEN_KEY);
    },

    async setAccessToken(token: string): Promise<void> {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    },

    async getRefreshToken(): Promise<string | null> {
        return SecureStore.getItemAsync(REFRESH_KEY);
    },

    async setRefreshToken(token: string): Promise<void> {
        await SecureStore.setItemAsync(REFRESH_KEY, token);
    },

    async getUser(): Promise<string | null> {
        return SecureStore.getItemAsync(USER_KEY);
    },

    async setUser(user: string): Promise<void> {
        await SecureStore.setItemAsync(USER_KEY, user);
    },

    async clearAuth(): Promise<void> {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    },
};

export default storage;
