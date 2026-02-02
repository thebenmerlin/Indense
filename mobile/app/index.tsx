import { Redirect } from 'expo-router';

// Always go to login - no auth check
export default function Index() {
    return <Redirect href="/(auth)/login" />;
}
