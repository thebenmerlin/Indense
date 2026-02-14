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
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../src/context';
import { authApi } from '../../src/api';
import { Role, ROLE_NAMES } from '../../src/constants';

const theme = {
    colors: {
        primary: '#1D4ED8',
        success: '#10B981',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        error: '#EF4444',
    }
};

// Storage keys for auth
const AUTH_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    USER: 'auth_user',
};

// Storage helpers
const storage = {
    async set(key: string, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (e) {
            console.warn('Storage set failed:', e);
        }
    },
};

export default function AccountScreen() {
    const { user, logout, refreshAuth } = useAuth();
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);
    const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [switchingRole, setSwitchingRole] = useState(false);

    // Change password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Determine if user can switch roles (allowedRoles is populated)
    const allowedRoles: string[] = user?.allowedRoles || [];
    const canSwitchRole = allowedRoles.length > 0;

    // Get the target role to switch to
    const getAlternateRole = (): 'SITE_ENGINEER' | 'PURCHASE_TEAM' | null => {
        if (user?.role === 'PURCHASE_TEAM' && allowedRoles.includes('SITE_ENGINEER')) {
            return 'SITE_ENGINEER';
        }
        if (user?.role === 'SITE_ENGINEER' && allowedRoles.includes('PURCHASE_TEAM')) {
            return 'PURCHASE_TEAM';
        }
        return null;
    };

    const alternateRole = getAlternateRole();

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
                        await logout();
                        router.replace('/');
                    }
                }
            ]
        );
    };

    const handleChangePassword = async () => {
        if (!currentPassword.trim()) {
            Alert.alert('Error', 'Please enter your current password');
            return;
        }
        if (!newPassword.trim() || newPassword.length < 8) {
            Alert.alert('Error', 'New password must be at least 8 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setChangingPassword(true);
        try {
            await authApi.changePassword(currentPassword, newPassword);
            Alert.alert('Success', 'Password changed successfully');
            setShowChangePasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleSwitchRole = async () => {
        if (!alternateRole) {
            Alert.alert('Not Available', 'Role switching is not enabled for your account. Please contact a Director.');
            return;
        }

        const targetRoleName = alternateRole === 'SITE_ENGINEER' ? 'Site Engineer' : 'Purchase Team';

        Alert.alert(
            'Switch Role',
            `Are you sure you want to switch to ${targetRoleName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Switch',
                    onPress: async () => {
                        setSwitchingRole(true);
                        try {
                            const result = await authApi.switchRole(alternateRole);

                            // Update stored tokens and user
                            await storage.set(AUTH_KEYS.ACCESS_TOKEN, result.accessToken);
                            await storage.set(AUTH_KEYS.USER, JSON.stringify(result.user));

                            // Refresh auth context
                            await refreshAuth();

                            // Navigate to appropriate dashboard
                            if (alternateRole === 'SITE_ENGINEER') {
                                router.replace('/(site-engineer)/dashboard');
                            } else {
                                router.replace('/(purchase-team)/dashboard');
                            }
                        } catch (error: any) {
                            Alert.alert('Error', error?.response?.data?.message || 'Failed to switch role');
                        } finally {
                            setSwitchingRole(false);
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

    return (
        <ScrollView style={styles.container}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {user?.role ? ROLE_NAMES[user.role as Role] : 'Purchase Team'}
                    </Text>
                </View>
            </View>

            {/* Actions Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>

                {/* Account Info Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowAccountInfoModal(true)}
                >
                    <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Account Info</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                {/* Change Password Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowChangePasswordModal(true)}
                >
                    <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                {/* Switch Role Button - Only show if user has alternate roles */}
                {canSwitchRole && alternateRole && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleSwitchRole}
                        disabled={switchingRole}
                    >
                        <Ionicons name="swap-horizontal-outline" size={20} color={theme.colors.success} />
                        <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>
                            {switchingRole ? 'Switching...' :
                                `Switch to ${alternateRole === 'SITE_ENGINEER' ? 'Site Engineer' : 'Purchase Team'}`
                            }
                        </Text>
                        {switchingRole ? (
                            <ActivityIndicator size="small" color={theme.colors.success} />
                        ) : (
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <View style={styles.settingsCard}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="moon-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.settingLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    </View>
                </View>
            </View>

            {/* Logout */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Delete Account */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
                    onPress={() => setShowDeleteModal(true)}
                >
                    <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.logoutButtonText}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />

            {/* Account Info Modal */}
            <Modal
                visible={showAccountInfoModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAccountInfoModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Account Info</Text>
                            <TouchableOpacity onPress={() => setShowAccountInfoModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Name</Text>
                                <Text style={styles.infoValue}>{user?.name || '-'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{user?.email || '-'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Role</Text>
                                <Text style={styles.infoValue}>
                                    {user?.role ? ROLE_NAMES[user.role as Role] : '-'}
                                </Text>
                            </View>
                            {user?.phone && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Phone</Text>
                                    <Text style={styles.infoValue}>{user.phone}</Text>
                                </View>
                            )}
                            {user?.dob && (
                                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                                    <Text style={styles.infoLabel}>Date of Birth</Text>
                                    <Text style={styles.infoValue}>
                                        {new Date(user.dob).toLocaleDateString()}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => setShowAccountInfoModal(false)}
                        >
                            <Text style={styles.primaryButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                visible={showChangePasswordModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowChangePasswordModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Change Password</Text>
                            <TouchableOpacity onPress={() => setShowChangePasswordModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Current Password</Text>
                            <View style={styles.passwordInputRow}>
                                <TextInput
                                    style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={!showCurrentPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    <Ionicons
                                        name={showCurrentPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={theme.colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <View style={styles.passwordInputRow}>
                                <TextInput
                                    style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Enter new password (min 8 chars)"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNewPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <Ionicons
                                        name={showNewPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={theme.colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Confirm New Password</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setShowChangePasswordModal(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.primaryButton, changingPassword && { opacity: 0.5 }]}
                                onPress={handleChangePassword}
                                disabled={changingPassword}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {changingPassword ? 'Changing...' : 'Change Password'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Account Modal */}
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
    container: { flex: 1, backgroundColor: theme.colors.surface },
    profileCard: {
        backgroundColor: theme.colors.primary,
        padding: 24,
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: { fontSize: 32, fontWeight: '700', color: '#FFFFFF' },
    userName: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
    roleBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 12,
    },
    roleText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
    section: { padding: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
    infoCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    infoLabel: { fontSize: 14, color: theme.colors.textSecondary },
    infoValue: { fontSize: 14, fontWeight: '500', color: theme.colors.textPrimary },
    settingsCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingLabel: { fontSize: 15, color: theme.colors.textPrimary },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    actionButtonText: { flex: 1, fontSize: 15, fontWeight: '500', color: theme.colors.textPrimary },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    logoutButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.cardBg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: '40%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
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
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginBottom: 16,
        backgroundColor: theme.colors.surface,
    },
    inputContainer: {
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        marginBottom: 6,
    },
    passwordInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        padding: 4,
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginTop: 8,
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
    primaryButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
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
