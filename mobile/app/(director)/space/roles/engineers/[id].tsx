import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#F59E0B',
        success: '#10B981',
        error: '#EF4444',
    }
};

interface Engineer {
    id: string;
    name: string;
    email: string;
    phone: string;
    dob: string;
    sites: { id: string; name: string }[];
    isPromoted?: boolean;
}

export default function EngineerDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [engineer, setEngineer] = useState<Engineer | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        fetchEngineer();
    }, [id]);

    const fetchEngineer = async () => {
        try {
            // TODO: Replace with actual API call
            setEngineer({
                id: id!,
                name: 'Rajesh Kumar',
                email: 'rajesh@example.com',
                phone: '+91 98765 43210',
                dob: '1990-05-15',
                sites: [
                    { id: '1', name: 'Green Valley Residences' },
                    { id: '2', name: 'Skyline Towers' },
                ],
                isPromoted: false,
            });
        } catch (error) {
            console.error('Failed to fetch engineer:', error);
            Alert.alert('Error', 'Failed to load engineer details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const handlePromote = () => {
        Alert.alert(
            'Promote to Purchase Team',
            `Are you sure you want to promote ${engineer?.name} to Purchase Team?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Promote',
                    onPress: () => {
                        setEngineer(prev => prev ? { ...prev, isPromoted: true } : null);
                        Alert.alert('Success', `${engineer?.name} has been promoted to Purchase Team`);
                    }
                }
            ]
        );
    };

    const handleDemote = () => {
        Alert.alert(
            'Demote to Site Engineer',
            `Are you sure you want to demote ${engineer?.name} back to Site Engineer only?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Demote',
                    onPress: () => {
                        setEngineer(prev => prev ? { ...prev, isPromoted: false } : null);
                        Alert.alert('Success', `${engineer?.name} has been demoted to Site Engineer`);
                    }
                }
            ]
        );
    };

    const handleRevoke = () => {
        if (confirmText.toLowerCase() !== engineer?.name.toLowerCase()) {
            Alert.alert('Error', 'Please type the engineer\'s name correctly to confirm');
            return;
        }
        Alert.alert('Success', `${engineer?.name}'s access has been revoked`, [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!engineer) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Engineer not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{engineer.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.name}>{engineer.name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Site Engineer</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Information</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{engineer.email}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{engineer.phone}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date of Birth</Text>
                            <Text style={styles.infoValue}>{formatDate(engineer.dob)}</Text>
                        </View>
                    </View>
                </View>

                {/* Sites */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Assigned Sites</Text>
                    {engineer.sites.map(site => (
                        <View key={site.id} style={styles.siteItem}>
                            <Ionicons name="business" size={20} color={theme.colors.accent} />
                            <Text style={styles.siteName}>{site.name}</Text>
                        </View>
                    ))}
                    {engineer.sites.length === 0 && (
                        <Text style={styles.noSites}>No sites assigned</Text>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>

                    {!engineer.isPromoted ? (
                        <TouchableOpacity style={styles.promoteButton} onPress={handlePromote}>
                            <Ionicons name="arrow-up-circle" size={22} color={theme.colors.success} />
                            <Text style={styles.promoteButtonText}>Promote to Purchase Team</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.demoteButton} onPress={handleDemote}>
                            <Ionicons name="arrow-down-circle" size={22} color={theme.colors.textSecondary} />
                            <Text style={styles.demoteButtonText}>Demote to Site Engineer</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.revokeButton} onPress={() => setShowRevokeConfirm(true)}>
                        <Ionicons name="ban" size={22} color={theme.colors.error} />
                        <Text style={styles.revokeButtonText}>Revoke Engineer</Text>
                    </TouchableOpacity>
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
                            This will permanently invalidate this user's ID. Type <Text style={styles.boldText}>{engineer.name}</Text> to confirm.
                        </Text>
                        <TextInput
                            style={styles.confirmInput}
                            placeholder="Type engineer's name"
                            value={confirmText}
                            onChangeText={setConfirmText}
                            autoCapitalize="words"
                        />
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity style={styles.confirmCancel} onPress={() => { setShowRevokeConfirm(false); setConfirmText(''); }}>
                                <Text style={styles.confirmCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmRevoke} onPress={handleRevoke}>
                                <Text style={styles.confirmRevokeText}>Revoke</Text>
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
    avatarText: { fontSize: 32, fontWeight: '700', color: theme.colors.accent },
    name: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary },
    badge: {
        backgroundColor: theme.colors.accent + '15',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
    },
    badgeText: { fontSize: 13, fontWeight: '600', color: theme.colors.accent },
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
    siteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        gap: 12,
    },
    siteName: { fontSize: 15, color: theme.colors.textPrimary },
    noSites: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', padding: 20 },
    promoteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success + '15',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 10,
    },
    promoteButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.success },
    demoteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.border,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 10,
    },
    demoteButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.textSecondary },
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
