import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store';

const theme = {
    colors: {
        primary: '#3B82F6',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
        error: '#EF4444',
    }
};

export default function AccountScreen() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setLoggingOut(true);
                        try {
                            await logout();
                            router.replace('/(auth)/login');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout');
                        } finally {
                            setLoggingOut(false);
                        }
                    }
                }
            ]
        );
    };

    const MenuItem = ({
        icon,
        title,
        subtitle,
        onPress,
        showArrow = true,
        rightElement,
        danger = false,
    }: {
        icon: string;
        title: string;
        subtitle?: string;
        onPress?: () => void;
        showArrow?: boolean;
        rightElement?: React.ReactNode;
        danger?: boolean;
    }) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
                <Ionicons
                    name={icon as any}
                    size={20}
                    color={danger ? theme.colors.error : theme.colors.primary}
                />
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>
                    {title}
                </Text>
                {subtitle && (
                    <Text style={styles.menuSubtitle}>{subtitle}</Text>
                )}
            </View>
            {rightElement || (showArrow && (
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            ))}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.roleTag}>
                    <Text style={styles.roleText}>{user?.role?.replace('_', ' ')}</Text>
                </View>
            </View>

            {/* Site Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Site</Text>
                <MenuItem
                    icon="location"
                    title={user?.siteName || 'No site assigned'}
                    showArrow={false}
                />
            </View>

            {/* Preferences */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <MenuItem
                    icon="moon"
                    title="Dark Mode"
                    showArrow={false}
                    rightElement={
                        <Switch
                            value={isDarkMode}
                            onValueChange={setIsDarkMode}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                            thumbColor={isDarkMode ? theme.colors.primary : '#f4f3f4'}
                        />
                    }
                />
                <MenuItem
                    icon="notifications"
                    title="Notifications"
                    subtitle="Manage notification settings"
                    onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
                />
            </View>

            {/* About */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <MenuItem
                    icon="information-circle"
                    title="App Version"
                    subtitle="1.0.0"
                    showArrow={false}
                />
                <MenuItem
                    icon="help-circle"
                    title="Help & Support"
                    onPress={() => Alert.alert('Support', 'Contact support@indense.app for help')}
                />
                <MenuItem
                    icon="document-text"
                    title="Terms & Privacy"
                    onPress={() => Alert.alert('Terms', 'Terms and Privacy Policy')}
                />
            </View>

            {/* Logout */}
            <View style={styles.section}>
                <MenuItem
                    icon="log-out"
                    title={loggingOut ? 'Logging out...' : 'Logout'}
                    danger
                    showArrow={false}
                    onPress={handleLogout}
                />
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    profileCard: {
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        paddingVertical: 32,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 12,
    },
    roleTag: {
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    roleText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.primary,
        textTransform: 'capitalize',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        marginHorizontal: 16,
        marginBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuIconDanger: {
        backgroundColor: theme.colors.error + '15',
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textPrimary,
    },
    menuTitleDanger: {
        color: theme.colors.error,
    },
    menuSubtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
});
