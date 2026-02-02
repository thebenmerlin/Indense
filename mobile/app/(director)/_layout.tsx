import { Stack } from 'expo-router';

export default function DirectorLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="indents/index" />
            <Stack.Screen name="indents/[id]" />
            <Stack.Screen name="analytics/index" />
            <Stack.Screen name="account" />
        </Stack>
    );
}
