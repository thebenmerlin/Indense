import React, { useState } from 'react';
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
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context';

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

// Helper to format date for display
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return dateString;
    }
};

export default function AccountScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [deleting, setDeleting] = useState(false);

    // Account Info states
    const [showAccountInfo, setShowAccountInfo] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        name: user?.name || '',
        dob: (user as any)?.dob || '',
        companyEmail: user?.email || '',
        phoneNumber: (user as any)?.phoneNumber || '',
    });
    const [saving, setSaving] = useState(false);

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

    const handleEditAccountInfo = () => {
        setEditData({
            name: user?.name || '',
            dob: (user as any)?.dob || '',
            companyEmail: user?.email || '',
            phoneNumber: (user as any)?.phoneNumber || '',
        });
        setShowEditModal(true);
    };

    const handleSaveAccountInfo = async () => {
        setSaving(true);
        try {
            // TODO: Call update profile API
            // await authApi.updateProfile(editData);
            Alert.alert('Success', 'Account information updated successfully');
            setShowEditModal(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update account information');
        } finally {
            setSaving(false);
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

    const InfoRow = ({ label, value }: { label: string; value: string }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || 'Not set'}</Text>
        </View>
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

            {/* Account Info Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <MenuItem
                    icon="person-circle"
                    title="Account Info"
                    subtitle="View and edit your personal details"
                    onPress={() => setShowAccountInfo(!showAccountInfo)}
                    rightElement={
                        <Ionicons
                            name={showAccountInfo ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={theme.colors.textSecondary}
                        />
                    }
                />
                {showAccountInfo && (
                    <View style={styles.accountInfoContainer}>
                        <InfoRow label="Name" value={user?.name || ''} />
                        <InfoRow label="Date of Birth" value={formatDate((user as any)?.dob)} />
                        <InfoRow label="Company Email" value={user?.email || ''} />
                        <InfoRow label="Phone Number" value={(user as any)?.phoneNumber || ''} />
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={handleEditAccountInfo}
                        >
                            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.editButtonText}>Edit Information</Text>
                        </TouchableOpacity>
                    </View>
                )}
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

            {/* Edit Account Info Modal */}
            <Modal
                visible={showEditModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.editModalContent}>
                        <View style={styles.editModalHeader}>
                            <Text style={styles.editModalTitle}>Edit Account Info</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.editModalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.name}
                                    onChangeText={(text) => setEditData({ ...editData, name: text })}
                                    placeholder="Enter your name"
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Date of Birth</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.dob}
                                    onChangeText={(text) => setEditData({ ...editData, dob: text })}
                                    placeholder="DD/MM/YYYY"
                                    keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Company Email</Text>
                                <TextInput
                                    style={[styles.input, styles.inputDisabled]}
                                    value={editData.companyEmail}
                                    editable={false}
                                    placeholder="Company email"
                                />
                                <Text style={styles.inputHint}>Email cannot be changed</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.phoneNumber}
                                    onChangeText={(text) => setEditData({ ...editData, phoneNumber: text })}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.editModalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                                onPress={handleSaveAccountInfo}
                                disabled={saving}
                            >
                                <Text style={styles.saveButtonText}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
    // Account Info styles
    accountInfoContainer: {
        backgroundColor: theme.colors.cardBg,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border + '50',
    },
    infoLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: theme.colors.textPrimary,
        fontWeight: '600',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 16,
        gap: 8,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    // Edit Modal styles
    editModalContent: {
        backgroundColor: theme.colors.cardBg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: '100%',
        maxHeight: '80%',
        position: 'absolute',
        bottom: 0,
    },
    editModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    editModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    editModalBody: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: theme.colors.textPrimary,
        backgroundColor: theme.colors.cardBg,
    },
    inputDisabled: {
        backgroundColor: theme.colors.surface,
        color: theme.colors.textSecondary,
    },
    inputHint: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    editModalFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: theme.colors.border,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    saveButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Delete Modal styles
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
