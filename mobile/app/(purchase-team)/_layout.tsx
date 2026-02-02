import { Stack } from 'expo-router';

export default function PurchaseTeamLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
        </Stack>
    );
}
