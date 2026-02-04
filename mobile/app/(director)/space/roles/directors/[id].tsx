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
    RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usersApi, User } from '../../../../../src/api/users.api';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#8B5CF6',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
    }
};

export default function DirectorDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [director, setDirector] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDirector = useCallback(async () => {
        if (!id) return;
        try {
            const data = await usersApi.getById(id);
            setDirector(data);
        } catch (error) {
            console.error('Failed to fetch director:', error);
            Alert.alert('Error', 'Failed to load director details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDirector();
    }, [fetchDirector]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDirector();
    }, [fetchDirector]);

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleDemote = async () => {
        if (!director) return;
        Alert.alert(
            'Demote to Purchase Team',
            `Are you sure you want to demote ${director.name} to Purchase Team?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Demote',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            const updated = await usersApi.demote(director.id);
                            setDirector(updated);
                            Alert.alert('Success', `${director.name} has been demoted to Purchase Team`, [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Error', error?.message || 'Failed to demote');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleRevoke = async () => {
        if (!director) return;
        if (confirmText.toLowerCase() !== director.name.toLowerCase()) {
            Alert.alert('Error', 'Please type the director\'s name correctly to confirm');
            return;
        }
        setActionLoading(true);
        try {
            await usersApi.revoke(director.id);
            Alert.alert('Success', `${director.name}'s access has been revoked`, [
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
        if (!director) return;
        Alert.alert(
            'Restore Access',
            `Are you sure you want to restore ${director.name}'s access?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            const updated = await usersApi.restore(director.id);
                            setDirector(updated);
                            Alert.alert('Success', `${director.name}'s access has been restored`);
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

    if (!director) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Director not found</Text>
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
                    <View style={[styles.avatar, director.isRevoked && styles.revokedAvatar]}>
                        <Text style={[styles.avatarText, director.isRevoked && styles.revokedAvatarText]}>
                            {director.name.charAt(0)}
                        </Text>
                    </View>
                    <Text style={styles.name}>{director.name}</Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Director</Text>
                        </View>
                        {director.isRevoked && (
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
                            <Text style={styles.infoValue}>{director.email}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{director.phone || '-'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Joined</Text>
                            <Text style={styles.infoValue}>{formatDate(director.createdAt)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Last Login</Text>
                            <Text style={styles.infoValue}>{formatDate(director.lastLoginAt)}</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>

                    {director.isRevoked ? (
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
                            <TouchableOpacity style={styles.demoteButton} onPress={handleDemote} disabled={actionLoading}>
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color={theme.colors.warning} />
                                ) : (
                                    <>
                                        <Ionicons name="arrow-down-circle" size={22} color={theme.colors.warning} />
                                        <Text style={styles.demoteButtonText}>Demote to Purchase Team</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.revokeButton} onPress={() => setShowRevokeConfirm(true)} disabled={actionLoading}>
                                <Ionicons name="ban" size={22} color={theme.colors.error} />
                                <Text style={styles.revokeButtonText}>Revoke Director</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Revoke Confirmation Modal */}
            <Modal visible={showRevokeConfirm} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModal}>
                        <View style={styles.confirmIcon}>
                            <Ionicons name="warning" size={40} color={theme.colors.error} />
                        </View>
                        <Text style={styles.confirmTitle}>Revoke Access?</Text>
                        <Text style={styles.confirmMessage}>
                            This will permanently invalidate this director's access. Type <Text style={styles.boldText}>{director.name}</Text> to confirm.
                        </Text>
                        <TextInput
                            style={styles.confirmInput}
                            placeholder="Type director's name"
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
    demoteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.warning + '15',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 10,
    },
    demoteButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.warning },
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
