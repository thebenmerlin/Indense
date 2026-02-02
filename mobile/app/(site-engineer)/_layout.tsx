import { Stack } from 'expo-router';

export default function SiteEngineerLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="indents/index" />
            <Stack.Screen name="indents/create" />
            <Stack.Screen name="indents/[id]" />
            <Stack.Screen name="receipts/index" />
            <Stack.Screen name="receipts/[id]" />
            <Stack.Screen name="damages/index" />
            <Stack.Screen name="damages/[id]" />
            <Stack.Screen name="account" />
        </Stack>
    );
}
