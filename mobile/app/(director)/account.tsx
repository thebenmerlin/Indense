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
import { useAuth } from '../../src/context';
import { Role, ROLE_NAMES } from '../../src/constants';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        error: '#EF4444',
    }
};

export default function DirectorAccount() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        router.replace('/');
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
                        {user?.name?.charAt(0).toUpperCase() || 'D'}
                    </Text>
                </View>
                <Text style={styles.userName}>{user?.name || 'Director'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {user?.role ? ROLE_NAMES[user.role as Role] : 'Director'}
                    </Text>
                </View>
            </View>

            {/* Account Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name</Text>
                        <Text style={styles.infoValue}>{user?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Role</Text>
                        <Text style={styles.infoValue}>{user?.role ? ROLE_NAMES[user.role as Role] : '-'}</Text>
                    </View>
                </View>
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

            {/* Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon')}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
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
    userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
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
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
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
        shadowOpacity: 0.06,
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
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    actionButtonText: { flex: 1, fontSize: 15, fontWeight: '500', color: theme.colors.textPrimary },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.error,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    logoutButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
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
