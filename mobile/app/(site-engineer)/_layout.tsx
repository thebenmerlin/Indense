import { Stack } from 'expo-router';

export default function SiteEngineerLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
        </Stack>
    );
}
