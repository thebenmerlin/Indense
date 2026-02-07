import React from 'react';
import { Stack } from 'expo-router';

export default function SiteEngineerLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#3B82F6' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="dashboard"
                options={{ title: 'Dashboard', headerBackVisible: false }}
            />
            <Stack.Screen
                name="indents/index"
                options={{ title: 'My Indents' }}
            />
            <Stack.Screen
                name="indents/create"
                options={{ title: 'Create Indent' }}
            />
            <Stack.Screen
                name="indents/[id]"
                options={{ title: 'Indent Details' }}
            />
            <Stack.Screen
                name="receipts/index"
                options={{ title: 'Confirm Receipts' }}
            />
            <Stack.Screen
                name="receipts/[id]"
                options={{ title: 'Add Receipt' }}
            />
            <Stack.Screen
                name="damages/index"
                options={{ title: 'Report Damage' }}
            />
            <Stack.Screen
                name="damages/[id]"
                options={{ title: 'Damage Details' }}
            />
            <Stack.Screen
                name="account"
                options={{ title: 'Profile' }}
            />
        </Stack>
    );
}
