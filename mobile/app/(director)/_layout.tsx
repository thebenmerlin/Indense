import React from 'react';
import { Stack } from 'expo-router';

export default function DirectorLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#1E3A8A' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="dashboard"
                options={{ title: 'Director Dashboard', headerBackVisible: false }}
            />
            <Stack.Screen
                name="indents/index"
                options={{ title: 'All Indents' }}
            />
            <Stack.Screen
                name="indents/[id]"
                options={{ title: 'Indent Approval' }}
            />
            <Stack.Screen
                name="reports"
                options={{ title: 'Reports' }}
            />
        </Stack>
    );
}
