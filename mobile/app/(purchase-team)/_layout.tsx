import React from 'react';
import { Stack } from 'expo-router';

export default function PurchaseTeamLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#1D4ED8' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="dashboard"
                options={{ title: 'Purchase Dashboard', headerBackVisible: false }}
            />
            <Stack.Screen
                name="indents/index"
                options={{ title: 'All Indents' }}
            />
            <Stack.Screen
                name="indents/[id]"
                options={{ title: 'Indent Review' }}
            />
            <Stack.Screen
                name="orders"
                options={{ title: 'Orders' }}
            />
            <Stack.Screen
                name="reports"
                options={{ title: 'Reports' }}
            />
        </Stack>
    );
}
