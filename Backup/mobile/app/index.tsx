import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store';
import { Role } from '../src/constants';

export default function Index() {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    if (user?.role === Role.SITE_ENGINEER) {
        return <Redirect href="/(site-engineer)/dashboard" />;
    } else if (user?.role === Role.PURCHASE_TEAM) {
        return <Redirect href="/(purchase-team)/dashboard" />;
    } else if (user?.role === Role.DIRECTOR) {
        return <Redirect href="/(director)/dashboard" />;
    }

    return <Redirect href="/(auth)/login" />;
}
