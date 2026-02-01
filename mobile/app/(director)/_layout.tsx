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
            <Stack.Screen name="dashboard" options={{ title: 'Director', headerShown: false }} />
            <Stack.Screen name="account" options={{ title: 'Account' }} />
            <Stack.Screen name="space/index" options={{ title: "Director's Space" }} />
            <Stack.Screen name="space/sites/index" options={{ title: 'Site Management' }} />
            <Stack.Screen name="space/sites/[id]" options={{ title: 'Site Details' }} />
            <Stack.Screen name="space/sites/add" options={{ title: 'Add Site' }} />
            <Stack.Screen name="space/roles/index" options={{ title: 'Role Management' }} />
            <Stack.Screen name="space/roles/engineers/index" options={{ title: 'Site Engineers' }} />
            <Stack.Screen name="space/roles/engineers/[id]" options={{ title: 'Engineer Details' }} />
            <Stack.Screen name="space/roles/purchase-team/index" options={{ title: 'Purchase Team' }} />
            <Stack.Screen name="space/roles/purchase-team/[id]" options={{ title: 'Member Details' }} />
            <Stack.Screen name="space/roles/directors/index" options={{ title: 'Directors' }} />
            <Stack.Screen name="space/roles/directors/[id]" options={{ title: 'Director Details' }} />
            <Stack.Screen name="space/materials/index" options={{ title: 'Material Management' }} />
            <Stack.Screen name="space/materials/[id]" options={{ title: 'Material Details' }} />
            <Stack.Screen name="space/materials/add" options={{ title: 'Add Material' }} />
            <Stack.Screen name="indents/pending/index" options={{ title: 'Pending Approvals' }} />
            <Stack.Screen name="indents/pending/[id]" options={{ title: 'Indent Details' }} />
            <Stack.Screen name="indents/all/index" options={{ title: 'All Indents' }} />
            <Stack.Screen name="indents/all/[id]" options={{ title: 'Indent Details' }} />
            <Stack.Screen name="indents/damaged/index" options={{ title: 'Damaged Orders' }} />
            <Stack.Screen name="indents/damaged/[id]" options={{ title: 'Damage Details' }} />
            <Stack.Screen name="indents/partial/index" options={{ title: 'Partial Orders' }} />
            <Stack.Screen name="indents/partial/[id]" options={{ title: 'Partial Details' }} />
            <Stack.Screen name="analytics/index" options={{ title: 'Analytics' }} />
            <Stack.Screen name="analytics/financial" options={{ title: 'Financial Report' }} />
            <Stack.Screen name="analytics/materials" options={{ title: 'Material Report' }} />
            <Stack.Screen name="analytics/vendors" options={{ title: "Vendor's List" }} />
            <Stack.Screen name="analytics/damage-report" options={{ title: 'Damage Report' }} />
        </Stack>
    );
}
