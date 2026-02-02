import { Stack } from 'expo-router';

export default function DirectorLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
        </Stack>
    );
}
