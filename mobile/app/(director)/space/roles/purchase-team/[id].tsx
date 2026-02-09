import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    FlatList,
    RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usersApi, User } from '../../../../../src/api/users.api';
import { sitesApi } from '../../../../../src/api/sites.api';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#3B82F6',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        purple: '#8B5CF6',
    }
};

interface SiteOption {
    id: string;
    name: string;
    code: string;
}

export default function PurchaseMemberDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [member, setMember] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
    const [showSitePicker, setShowSitePicker] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [sites, setSites] = useState<SiteOption[]>([]);
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Check if user has Site Engineer access
    const hasSiteEngineerAccess = member?.allowedRoles?.includes('SITE_ENGINEER') || false;

    const fetchMember = useCallback(async () => {
        if (!id) return;
        try {
            const data = await usersApi.getById(id);
            setMember(data);
        } catch (error) {
            console.error('Failed to fetch member:', error);
            Alert.alert('Error', 'Failed to load member details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    const fetchSites = useCallback(async () => {
        try {
            const response = await sitesApi.getAll();
            setSites(response.data.filter(s => !s.isClosed));
        } catch (error) {
            console.error('Failed to fetch sites:', error);
        }
    }, []);

    useEffect(() => {
        fetchMember();
    }, [fetchMember]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMember();
    }, [fetchMember]);

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const handlePromote = async () => {
        if (!member) return;
        Alert.alert(
            'Promote to Director',
            `Are you sure you want to promote ${member.name} to Director?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Promote',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            const updated = await usersApi.promote(member.id);
                            setMember(updated);
                            Alert.alert('Success', `${member.name} has been promoted to Director`, [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Error', error?.message || 'Failed to promote');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const openSitePicker = async () => {
        await fetchSites();
        setShowSitePicker(true);
    };

    const handleToggleSiteEngineer = async () => {
        if (!member) return;

        // If assigning, need a site
        if (!hasSiteEngineerAccess && !selectedSiteId) {
            Alert.alert('Error', 'Please select a site to assign');
            return;
        }

        setActionLoading(true);
        try {
            const result = await usersApi.toggleSiteEngineer(
                member.id,
                hasSiteEngineerAccess ? undefined : selectedSiteId!
            );
            setMember(result);
            setShowSitePicker(false);
            setSelectedSiteId(null);
            Alert.alert(
                'Success',
                result.hasSiteEngineerAccess
                    ? `${member.name} can now switch to Site Engineer role`
                    : `${member.name}'s Site Engineer access has been removed`
            );
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to update role');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveSiteEngineer = () => {
        if (!member) return;
        Alert.alert(
            'Remove Site Engineer Access',
            `Are you sure you want to remove ${member.name}'s Site Engineer access? They will no longer be able to switch to Site Engineer role.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: handleToggleSiteEngineer }
            ]
        );
    };

    const handleRevoke = async () => {
        if (!member) return;
        if (confirmText.toLowerCase() !== member.name.toLowerCase()) {
            Alert.alert('Error', 'Please type the member\'s name correctly to confirm');
            return;
        }
        setActionLoading(true);
        try {
            await usersApi.revoke(member.id);
            Alert.alert('Success', `${member.name}'s access has been revoked`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to revoke access');
        } finally {
            setActionLoading(false);
            setShowRevokeConfirm(false);
            setConfirmText('');
        }
    };

    const handleRestore = async () => {
        if (!member) return;
        Alert.alert(
            'Restore Access',
            `Are you sure you want to restore ${member.name}'s access?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            const updated = await usersApi.restore(member.id);
                            setMember(updated);
                            Alert.alert('Success', `${member.name}'s access has been restored`);
                        } catch (error: any) {
                            Alert.alert('Error', error?.message || 'Failed to restore access');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!member) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Member not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={[styles.avatar, member.isRevoked && styles.revokedAvatar]}>
                        <Text style={[styles.avatarText, member.isRevoked && styles.revokedAvatarText]}>
                            {member.name.charAt(0)}
                        </Text>
                    </View>
                    <Text style={styles.name}>{member.name}</Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Purchase Team</Text>
                        </View>
                        {member.isRevoked && (
                            <View style={styles.revokedBadge}>
                                <Text style={styles.revokedBadgeText}>Revoked</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Information</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{member.email}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{member.phone || '-'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Joined</Text>
                            <Text style={styles.infoValue}>{formatDate(member.createdAt)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Last Login</Text>
                            <Text style={styles.infoValue}>{formatDate(member.lastLoginAt)}</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>

                    {member.isRevoked ? (
                        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={actionLoading}>
                            {actionLoading ? (
                                <ActivityIndicator size="small" color={theme.colors.success} />
                            ) : (
                                <>
                                    <Ionicons name="refresh-circle" size={22} color={theme.colors.success} />
                                    <Text style={styles.restoreButtonText}>Restore Access</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.promoteButton} onPress={handlePromote} disabled={actionLoading}>
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color={theme.colors.purple} />
                                ) : (
                                    <>
                                        <Ionicons name="arrow-up-circle" size={22} color={theme.colors.purple} />
                                        <Text style={styles.promoteButtonText}>Promote to Director</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {hasSiteEngineerAccess ? (
                                <TouchableOpacity style={styles.removeRoleButton} onPress={handleRemoveSiteEngineer} disabled={actionLoading}>
                                    <Ionicons name="remove-circle" size={22} color={theme.colors.warning} />
                                    <Text style={styles.removeRoleButtonText}>Remove as Site Engineer</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.assignRoleButton} onPress={openSitePicker} disabled={actionLoading}>
                                    <Ionicons name="add-circle" size={22} color={theme.colors.success} />
                                    <Text style={styles.assignRoleButtonText}>Assign as Site Engineer</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.revokeButton} onPress={() => setShowRevokeConfirm(true)} disabled={actionLoading}>
                                <Ionicons name="ban" size={22} color={theme.colors.error} />
                                <Text style={styles.revokeButtonText}>Revoke from Team</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Site Picker Modal for Assigning SE Role */}
            <Modal visible={showSitePicker} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Site to Assign</Text>
                        <TouchableOpacity onPress={() => { setShowSitePicker(false); setSelectedSiteId(null); }}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.modalSubtitle}>
                        Select a site to assign to this Purchase Team member. They will be able to switch to Site Engineer role.
                    </Text>
                    <FlatList
                        data={sites}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.siteOption, selectedSiteId === item.id && styles.siteOptionSelected]}
                                onPress={() => setSelectedSiteId(item.id)}
                            >
                                <Ionicons
                                    name={selectedSiteId === item.id ? "radio-button-on" : "radio-button-off"}
                                    size={24}
                                    color={selectedSiteId === item.id ? theme.colors.primary : theme.colors.textSecondary}
                                />
                                <View style={styles.siteOptionContent}>
                                    <Text style={styles.siteOptionText}>{item.name}</Text>
                                    <Text style={styles.siteOptionCode}>{item.code}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.noSites}>No active sites available</Text>
                        }
                    />
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.assignModalButton, !selectedSiteId && styles.buttonDisabled]}
                            onPress={handleToggleSiteEngineer}
                            disabled={!selectedSiteId || actionLoading}
                        >
                            {actionLoading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.assignModalButtonText}>Assign as Site Engineer</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Revoke Confirmation Modal */}
            <Modal visible={showRevokeConfirm} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModal}>
                        <View style={styles.confirmIcon}>
                            <Ionicons name="warning" size={40} color={theme.colors.error} />
                        </View>
                        <Text style={styles.confirmTitle}>Revoke Access?</Text>
                        <Text style={styles.confirmMessage}>
                            This will permanently invalidate this user's ID. Type <Text style={styles.boldText}>{member.name}</Text> to confirm.
                        </Text>
                        <TextInput
                            style={styles.confirmInput}
                            placeholder="Type member's name"
                            value={confirmText}
                            onChangeText={setConfirmText}
                            autoCapitalize="words"
                        />
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity style={styles.confirmCancel} onPress={() => { setShowRevokeConfirm(false); setConfirmText(''); }}>
                                <Text style={styles.confirmCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmRevoke}
                                onPress={handleRevoke}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.confirmRevokeText}>Revoke</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    scrollView: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: theme.colors.textSecondary },
    profileCard: {
        backgroundColor: theme.colors.cardBg,
        padding: 24,
        alignItems: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.accent + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    revokedAvatar: {
        backgroundColor: theme.colors.error + '20',
    },
    avatarText: { fontSize: 32, fontWeight: '700', color: theme.colors.accent },
    revokedAvatarText: { color: theme.colors.error },
    name: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary },
    badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    badge: {
        backgroundColor: theme.colors.accent + '15',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: { fontSize: 13, fontWeight: '600', color: theme.colors.accent },
    revokedBadge: {
        backgroundColor: theme.colors.error + '15',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
    },
    revokedBadgeText: { fontSize: 13, fontWeight: '600', color: theme.colors.error },
    section: { padding: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 12, textTransform: 'uppercase' },
    infoCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
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
    promoteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.purple + '15',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 10,
    },
    promoteButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.purple },
    assignRoleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success + '15',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 10,
    },
    assignRoleButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.success },
    removeRoleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.warning + '15',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 10,
    },
    removeRoleButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.warning },
    restoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success + '15',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 10,
    },
    restoreButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.success },
    revokeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.error + '10',
        padding: 16,
        borderRadius: 12,
        gap: 10,
    },
    revokeButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.error },
    modal: { flex: 1, backgroundColor: theme.colors.surface },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.cardBg,
    },
    modalTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary },
    modalSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        padding: 16,
        paddingBottom: 0,
    },
    siteOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    siteOptionSelected: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    siteOptionContent: { flex: 1 },
    siteOptionText: { fontSize: 16, fontWeight: '500', color: theme.colors.textPrimary },
    siteOptionCode: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    noSites: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', padding: 40 },
    modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.cardBg },
    assignModalButton: {
        backgroundColor: theme.colors.success,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    assignModalButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    buttonDisabled: { opacity: 0.5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    confirmModal: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    confirmIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.error + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    confirmTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8 },
    confirmMessage: { fontSize: 15, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 16 },
    boldText: { fontWeight: '700', color: theme.colors.textPrimary },
    confirmInput: {
        width: '100%',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        fontSize: 16,
        marginBottom: 16,
    },
    confirmButtons: { flexDirection: 'row', gap: 12, width: '100%' },
    confirmCancel: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
    confirmCancelText: { fontSize: 16, fontWeight: '600', color: theme.colors.textSecondary },
    confirmRevoke: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: theme.colors.error, alignItems: 'center' },
    confirmRevokeText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
