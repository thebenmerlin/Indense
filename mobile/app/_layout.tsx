import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// MINIMAL LAYOUT - Just routes, no auth initialization
export default function RootLayout() {
    return (
        <>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(site-engineer)" options={{ headerShown: false }} />
                <Stack.Screen name="(purchase-team)" options={{ headerShown: false }} />
                <Stack.Screen name="(director)" options={{ headerShown: false }} />
            </Stack>
        </>
    );
}
