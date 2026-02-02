import { Stack } from 'expo-router';

export default function PurchaseTeamLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="indents/index" />
            <Stack.Screen name="indents/[id]" />
            <Stack.Screen name="orders/index" />
            <Stack.Screen name="orders/[id]" />
            <Stack.Screen name="orders/select" />
            <Stack.Screen name="partial/index" />
            <Stack.Screen name="partial/[id]" />
            <Stack.Screen name="damages/index" />
            <Stack.Screen name="damages/[id]" />
            <Stack.Screen name="account" />
        </Stack>
    );
}
