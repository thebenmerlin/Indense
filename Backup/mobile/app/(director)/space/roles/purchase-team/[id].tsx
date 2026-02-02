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
    FlatList,
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
        accent: '#3B82F6',
        success: '#10B981',
        error: '#EF4444',
    }
};

interface PurchaseMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    dob: string;
    assignedSites?: { id: string; name: string }[];
}

interface Site {
    id: string;
    name: string;
    selected: boolean;
}

export default function PurchaseMemberDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [member, setMember] = useState<PurchaseMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
    const [showSitePicker, setShowSitePicker] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [sites, setSites] = useState<Site[]>([]);

    useEffect(() => {
        fetchMember();
    }, [id]);

    const fetchMember = async () => {
        try {
            // TODO: Replace with actual API call
            setMember({
                id: id!,
                name: 'Vikram Singh',
                email: 'vikram@example.com',
                phone: '+91 98765 12345',
                dob: '1985-08-22',
                assignedSites: [],
            });
            setSites([
                { id: '1', name: 'Green Valley Residences', selected: false },
                { id: '2', name: 'Skyline Towers', selected: false },
                { id: '3', name: 'Riverside Complex', selected: false },
            ]);
        } catch (error) {
            console.error('Failed to fetch member:', error);
            Alert.alert('Error', 'Failed to load member details');
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

    const toggleSite = (siteId: string) => {
        setSites(sites.map(s => s.id === siteId ? { ...s, selected: !s.selected } : s));
    };

    const handleAssignAsSE = () => {
        const selectedSites = sites.filter(s => s.selected);
        if (selectedSites.length === 0) {
            Alert.alert('Error', 'Please select at least one site');
            return;
        }
        Alert.alert(
            'Assign as Site Engineer',
            `Assign ${member?.name} to ${selectedSites.length} site(s)?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Assign',
                    onPress: () => {
                        setMember(prev => prev ? { ...prev, assignedSites: selectedSites.map(s => ({ id: s.id, name: s.name })) } : null);
                        setShowSitePicker(false);
                        Alert.alert('Success', `${member?.name} has been assigned as Site Engineer`);
                    }
                }
            ]
        );
    };

    const handleRemoveSEAccess = () => {
        Alert.alert(
            'Remove Site Engineer Access',
            `Remove ${member?.name}'s Site Engineer access?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    onPress: () => {
                        setMember(prev => prev ? { ...prev, assignedSites: [] } : null);
                        setSites(sites.map(s => ({ ...s, selected: false })));
                        Alert.alert('Success', 'Site Engineer access removed');
                    }
                }
            ]
        );
    };

    const handleRevoke = () => {
        if (confirmText.toLowerCase() !== member?.name.toLowerCase()) {
            Alert.alert('Error', 'Please type the member\'s name correctly to confirm');
            return;
        }
        Alert.alert('Success', `${member?.name}'s access has been revoked`, [
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

    if (!member) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Member not found</Text>
            </View>
        );
    }

    const hasSEAccess = member.assignedSites && member.assignedSites.length > 0;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.name}>{member.name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Purchase Team</Text>
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
                            <Text style={styles.infoValue}>{member.phone}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date of Birth</Text>
                            <Text style={styles.infoValue}>{formatDate(member.dob)}</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>

                    {!hasSEAccess ? (
                        <TouchableOpacity style={styles.assignButton} onPress={() => setShowSitePicker(true)}>
                            <Ionicons name="construct" size={22} color={theme.colors.success} />
                            <Text style={styles.assignButtonText}>Assign as Site Engineer</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <View style={styles.assignedSitesCard}>
                                <Text style={styles.assignedLabel}>Assigned Sites:</Text>
                                {member.assignedSites?.map(site => (
                                    <Text key={site.id} style={styles.assignedSite}>• {site.name}</Text>
                                ))}
                            </View>
                            <TouchableOpacity style={styles.removeButton} onPress={handleRemoveSEAccess}>
                                <Ionicons name="close-circle" size={22} color={theme.colors.textSecondary} />
                                <Text style={styles.removeButtonText}>Remove Site Engineer Access</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity style={styles.revokeButton} onPress={() => setShowRevokeConfirm(true)}>
                        <Ionicons name="ban" size={22} color={theme.colors.error} />
                        <Text style={styles.revokeButtonText}>Revoke from Team</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Site Picker Modal */}
            <Modal visible={showSitePicker} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Sites</Text>
                        <TouchableOpacity onPress={() => setShowSitePicker(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={sites}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.siteOption} onPress={() => toggleSite(item.id)}>
                                <Ionicons
                                    name={item.selected ? "checkbox" : "square-outline"}
                                    size={24}
                                    color={item.selected ? theme.colors.success : theme.colors.textSecondary}
                                />
                                <Text style={styles.siteOptionText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.assignModalButton} onPress={handleAssignAsSE}>
                            <Text style={styles.assignModalButtonText}>Assign to Selected Sites</Text>
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
    assignButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success + '15',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 10,
    },
    assignButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.success },
    assignedSitesCard: {
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
    },
    assignedLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8 },
    assignedSite: { fontSize: 14, color: theme.colors.textPrimary, paddingVertical: 4 },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.border,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 10,
    },
    removeButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.textSecondary },
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
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    siteOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    siteOptionText: { fontSize: 15, color: theme.colors.textPrimary },
    modalFooter: {
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    assignModalButton: {
        backgroundColor: theme.colors.success,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    assignModalButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
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
