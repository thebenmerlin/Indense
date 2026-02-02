import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

// Safe wrapper for SecureStore operations that can fail on first boot
async function safeGetItem(key: string): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.warn(`SecureStore.getItem failed for ${key}:`, error);
        return null;
    }
}

async function safeSetItem(key: string, value: string): Promise<void> {
    try {
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.warn(`SecureStore.setItem failed for ${key}:`, error);
    }
}

async function safeDeleteItem(key: string): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.warn(`SecureStore.deleteItem failed for ${key}:`, error);
    }
}

export const storage = {
    async getAccessToken(): Promise<string | null> {
        return safeGetItem(TOKEN_KEY);
    },

    async setAccessToken(token: string): Promise<void> {
        await safeSetItem(TOKEN_KEY, token);
    },

    async getRefreshToken(): Promise<string | null> {
        return safeGetItem(REFRESH_KEY);
    },

    async setRefreshToken(token: string): Promise<void> {
        await safeSetItem(REFRESH_KEY, token);
    },

    async getUser(): Promise<string | null> {
        return safeGetItem(USER_KEY);
    },

    async setUser(user: string): Promise<void> {
        await safeSetItem(USER_KEY, user);
    },

    async clearAuth(): Promise<void> {
        await safeDeleteItem(TOKEN_KEY);
        await safeDeleteItem(REFRESH_KEY);
        await safeDeleteItem(USER_KEY);
    },
};

export default storage;
