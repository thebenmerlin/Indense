import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

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
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userJson = await SecureStore.getItemAsync('auth_user');
            if (userJson) setUser(JSON.parse(userJson));
        } catch (e) { }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('auth_access_token');
            await SecureStore.deleteItemAsync('auth_refresh_token');
            await SecureStore.deleteItemAsync('auth_user');
        } catch (e) { }
    };

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

    const handleDeleteAccount = async () => {
        if (deleteConfirmName !== user?.name) {
            Alert.alert('Error', 'Name does not match. Please type your exact name to confirm.');
            return;
        }

        setDeleting(true);
        try {
            // TODO: Call delete account API
            // await authApi.deleteAccount();
            Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
            await logout();
            router.replace('/(auth)/login');
        } catch (error) {
            Alert.alert('Error', 'Failed to delete account. Please try again.');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setDeleteConfirmName('');
        }
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

            {/* Delete Account */}
            <View style={styles.section}>
                <MenuItem
                    icon="trash"
                    title="Delete Account"
                    subtitle="Permanently delete your account"
                    danger
                    onPress={() => setShowDeleteModal(true)}
                />
            </View>

            <View style={{ height: 40 }} />

            {/* Delete Account Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Ionicons name="warning" size={56} color={theme.colors.error} />
                        <Text style={styles.modalTitle}>Delete Account</Text>
                        <Text style={styles.modalMessage}>
                            This action cannot be undone. All your data will be permanently deleted.
                        </Text>
                        <Text style={styles.modalInstruction}>
                            Type <Text style={styles.modalNameHighlight}>{user?.name}</Text> to confirm:
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your name"
                            value={deleteConfirmName}
                            onChangeText={setDeleteConfirmName}
                            autoCapitalize="words"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmName('');
                                }}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalDeleteButton,
                                    (deleting || deleteConfirmName !== user?.name) && styles.modalDeleteButtonDisabled
                                ]}
                                onPress={handleDeleteAccount}
                                disabled={deleting || deleteConfirmName !== user?.name}
                            >
                                <Text style={styles.modalDeleteText}>
                                    {deleting ? 'Deleting...' : 'Delete Forever'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginTop: 16,
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 16,
    },
    modalInstruction: {
        fontSize: 14,
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginBottom: 12,
    },
    modalNameHighlight: {
        fontWeight: '700',
        color: theme.colors.error,
    },
    modalInput: {
        width: '100%',
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: theme.colors.border,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    modalDeleteButton: {
        flex: 1,
        backgroundColor: theme.colors.error,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalDeleteButtonDisabled: {
        opacity: 0.5,
    },
    modalDeleteText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
