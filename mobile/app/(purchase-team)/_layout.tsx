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
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="pending/index" options={{ title: 'Pending Indents' }} />
            <Stack.Screen name="pending/[id]" options={{ title: 'Indent Details' }} />
            <Stack.Screen name="indents/index" options={{ title: 'All Indents' }} />
            <Stack.Screen name="indents/[id]" options={{ title: 'Indent Details' }} />
            <Stack.Screen name="orders/index" options={{ title: 'Order Management' }} />
            <Stack.Screen name="orders/select" options={{ title: 'Select Indent' }} />
            <Stack.Screen name="orders/[id]" options={{ title: 'Process Order' }} />
            <Stack.Screen name="damages/index" options={{ title: 'Damages Reported' }} />
            <Stack.Screen name="damages/[id]" options={{ title: 'Damage Details' }} />
            <Stack.Screen name="partial/index" options={{ title: 'Partial Orders' }} />
            <Stack.Screen name="partial/[id]" options={{ title: 'Partial Details' }} />
            <Stack.Screen name="analytics/index" options={{ title: 'Analytics' }} />
            <Stack.Screen name="analytics/financial" options={{ title: 'Financial Report' }} />
            <Stack.Screen name="analytics/materials" options={{ title: 'Material Report' }} />
            <Stack.Screen name="analytics/vendors" options={{ title: "Vendor's List" }} />
            <Stack.Screen name="analytics/damage-report" options={{ title: 'Damage Report' }} />
            <Stack.Screen name="account" options={{ title: 'Account' }} />
        </Stack>
    );
}
