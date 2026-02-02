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
        accent: '#8B5CF6',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
    }
};

interface SiteEngineer {
    id: string;
    name: string;
    email: string;
}

interface Site {
    id: string;
    name: string;
    code: string;
    address: string | null;
    city: string | null;
    state: string | null;
    startDate?: string;
    expectedHandover?: string;
    indentCount?: number;
    engineers?: SiteEngineer[];
}

export default function SiteDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [site, setSite] = useState<Site | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [engineers, setEngineers] = useState<SiteEngineer[]>([]);
    const [availableEngineers, setAvailableEngineers] = useState<SiteEngineer[]>([]);
    const [showAddEngineer, setShowAddEngineer] = useState(false);

    useEffect(() => {
        fetchSite();
    }, [id]);

    const fetchSite = async () => {
        try {
            // TODO: Replace with actual API call
            // Mock data
            const mockSite: Site = {
                id: id!,
                name: 'Green Valley Residences',
                code: 'GVR',
                address: '123 Main Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                startDate: '2024-01-15',
                expectedHandover: '2025-06-30',
                indentCount: 12,
                engineers: [
                    { id: '1', name: 'Rajesh Kumar', email: 'rajesh@example.com' },
                    { id: '2', name: 'Priya Sharma', email: 'priya@example.com' },
                ],
            };
            setSite(mockSite);
            setEngineers(mockSite.engineers || []);
            setAvailableEngineers([
                { id: '3', name: 'Amit Patel', email: 'amit@example.com' },
                { id: '4', name: 'Sneha Reddy', email: 'sneha@example.com' },
            ]);
        } catch (error) {
            console.error('Failed to fetch site:', error);
            Alert.alert('Error', 'Failed to load site details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleRemoveEngineer = (engineerId: string) => {
        setEngineers(prev => prev.filter(e => e.id !== engineerId));
    };

    const handleAddEngineer = (engineer: SiteEngineer) => {
        setEngineers(prev => [...prev, engineer]);
        setAvailableEngineers(prev => prev.filter(e => e.id !== engineer.id));
        setShowAddEngineer(false);
    };

    const handleSaveEngineers = () => {
        Alert.alert('Success', 'Site engineers updated successfully');
        setEditMode(false);
    };

    const handleDeleteSite = () => {
        if (confirmText.toLowerCase() !== site?.city?.toLowerCase()) {
            Alert.alert('Error', 'Please type the site location correctly to confirm');
            return;
        }
        Alert.alert('Deleted', 'Site has been deleted', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    const handleCloseSite = () => {
        if (confirmText.toLowerCase() !== site?.city?.toLowerCase()) {
            Alert.alert('Error', 'Please type the site location correctly to confirm');
            return;
        }
        Alert.alert('Closed', 'Site has been closed', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    const navigateToIndents = () => {
        // Navigate to indents with site filter
        router.push(`/(director)/indents/all?siteId=${id}` as any);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!site) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Site not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Site Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.siteName}>{site.name}</Text>
                    <Text style={styles.siteCode}>{site.code}</Text>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={18} color={theme.colors.accent} />
                            <Text style={styles.infoLabel}>Location</Text>
                            <Text style={styles.infoValue}>{site.city}, {site.state}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={18} color={theme.colors.accent} />
                            <Text style={styles.infoLabel}>Start Date</Text>
                            <Text style={styles.infoValue}>{formatDate(site.startDate)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="flag-outline" size={18} color={theme.colors.accent} />
                            <Text style={styles.infoLabel}>Expected Handover</Text>
                            <Text style={styles.infoValue}>{formatDate(site.expectedHandover)}</Text>
                        </View>
                        <TouchableOpacity style={styles.infoItem} onPress={navigateToIndents}>
                            <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
                            <Text style={styles.infoLabel}>Indents</Text>
                            <Text style={[styles.infoValue, styles.clickableValue]}>{site.indentCount}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Site Engineers Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Site Engineers at {site.name}</Text>
                        {!editMode ? (
                            <TouchableOpacity onPress={() => setEditMode(true)} style={styles.editButton}>
                                <Ionicons name="pencil" size={16} color={theme.colors.primary} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.editActions}>
                                <TouchableOpacity onPress={() => { setEditMode(false); setEngineers(site.engineers || []); }} style={styles.cancelButton}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveEngineers} style={styles.saveButton}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {engineers.map(engineer => (
                        <View key={engineer.id} style={styles.engineerCard}>
                            <View style={styles.engineerAvatar}>
                                <Text style={styles.avatarText}>{engineer.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.engineerInfo}>
                                <Text style={styles.engineerName}>{engineer.name}</Text>
                                <Text style={styles.engineerEmail}>{engineer.email}</Text>
                            </View>
                            {editMode && (
                                <TouchableOpacity onPress={() => handleRemoveEngineer(engineer.id)} style={styles.removeButton}>
                                    <Ionicons name="remove-circle" size={24} color={theme.colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {editMode && (
                        <TouchableOpacity style={styles.addEngineerButton} onPress={() => setShowAddEngineer(true)}>
                            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.addEngineerText}>Add Site Engineer</Text>
                        </TouchableOpacity>
                    )}

                    {engineers.length === 0 && !editMode && (
                        <Text style={styles.noEngineers}>No site engineers assigned</Text>
                    )}
                </View>

                {/* Actions Button */}
                <TouchableOpacity style={styles.actionsButton} onPress={() => setShowActions(true)}>
                    <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textPrimary} />
                    <Text style={styles.actionsButtonText}>Actions</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Actions Popup */}
            <Modal visible={showActions} transparent animationType="fade">
                <TouchableOpacity style={styles.overlay} onPress={() => setShowActions(false)}>
                    <View style={styles.popup}>
                        <TouchableOpacity style={styles.popupItem} onPress={() => { setShowActions(false); router.push(`/(director)/space/sites/add?edit=${id}` as any); }}>
                            <Ionicons name="create-outline" size={20} color={theme.colors.textPrimary} />
                            <Text style={styles.popupText}>Edit Site</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.popupItem} onPress={() => { setShowActions(false); setShowCloseConfirm(true); }}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.warning} />
                            <Text style={[styles.popupText, { color: theme.colors.warning }]}>Close Site</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.popupItem} onPress={() => { setShowActions(false); setShowDeleteConfirm(true); }}>
                            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                            <Text style={[styles.popupText, { color: theme.colors.error }]}>Delete Site</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal visible={showDeleteConfirm} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModal}>
                        <View style={styles.confirmIcon}>
                            <Ionicons name="warning" size={40} color={theme.colors.error} />
                        </View>
                        <Text style={styles.confirmTitle}>Delete Site?</Text>
                        <Text style={styles.confirmMessage}>
                            This action cannot be undone. Type <Text style={styles.boldText}>{site.city}</Text> to confirm.
                        </Text>
                        <TextInput
                            style={styles.confirmInput}
                            placeholder="Type site location"
                            value={confirmText}
                            onChangeText={setConfirmText}
                            autoCapitalize="none"
                        />
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity style={styles.confirmCancel} onPress={() => { setShowDeleteConfirm(false); setConfirmText(''); }}>
                                <Text style={styles.confirmCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmDelete} onPress={handleDeleteSite}>
                                <Text style={styles.confirmDeleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Close Site Confirmation Modal */}
            <Modal visible={showCloseConfirm} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModal}>
                        <View style={[styles.confirmIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                            <Ionicons name="lock-closed" size={40} color={theme.colors.warning} />
                        </View>
                        <Text style={styles.confirmTitle}>Close Site?</Text>
                        <Text style={styles.confirmMessage}>
                            This will mark the site as closed. Type <Text style={styles.boldText}>{site.city}</Text> to confirm.
                        </Text>
                        <TextInput
                            style={styles.confirmInput}
                            placeholder="Type site location"
                            value={confirmText}
                            onChangeText={setConfirmText}
                            autoCapitalize="none"
                        />
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity style={styles.confirmCancel} onPress={() => { setShowCloseConfirm(false); setConfirmText(''); }}>
                                <Text style={styles.confirmCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmDelete, { backgroundColor: theme.colors.warning }]} onPress={handleCloseSite}>
                                <Text style={styles.confirmDeleteText}>Close Site</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Engineer Modal */}
            <Modal visible={showAddEngineer} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.addEngineerModal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Site Engineer</Text>
                        <TouchableOpacity onPress={() => setShowAddEngineer(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={availableEngineers}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.engineerCard} onPress={() => handleAddEngineer(item)}>
                                <View style={styles.engineerAvatar}>
                                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                                </View>
                                <View style={styles.engineerInfo}>
                                    <Text style={styles.engineerName}>{item.name}</Text>
                                    <Text style={styles.engineerEmail}>{item.email}</Text>
                                </View>
                                <Ionicons name="add-circle" size={24} color={theme.colors.success} />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.noEngineers}>No available engineers to add</Text>
                        }
                    />
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
    infoCard: {
        backgroundColor: theme.colors.cardBg,
        padding: 20,
        margin: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    siteName: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary },
    siteCode: { fontSize: 14, color: theme.colors.accent, fontFamily: 'monospace', marginTop: 4 },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, gap: 12 },
    infoItem: {
        width: '47%',
        backgroundColor: theme.colors.surface,
        padding: 14,
        borderRadius: 12,
    },
    infoLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 6 },
    infoValue: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 2 },
    clickableValue: { color: theme.colors.primary, textDecorationLine: 'underline' },
    section: { padding: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    editButton: { padding: 8, backgroundColor: theme.colors.primary + '15', borderRadius: 8 },
    editActions: { flexDirection: 'row', gap: 8 },
    cancelButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border },
    cancelButtonText: { fontSize: 13, color: theme.colors.textSecondary },
    saveButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: theme.colors.primary },
    saveButtonText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
    engineerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    engineerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.accent + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { fontSize: 18, fontWeight: '600', color: theme.colors.accent },
    engineerInfo: { flex: 1 },
    engineerName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    engineerEmail: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    removeButton: { padding: 4 },
    addEngineerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        gap: 8,
        marginTop: 8,
    },
    addEngineerText: { fontSize: 14, fontWeight: '500', color: theme.colors.primary },
    noEngineers: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', padding: 20 },
    actionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 16,
        padding: 14,
        borderRadius: 10,
        backgroundColor: theme.colors.cardBg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 8,
    },
    actionsButtonText: { fontSize: 15, fontWeight: '500', color: theme.colors.textPrimary },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    popup: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 16,
        padding: 8,
        minWidth: 200,
    },
    popupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    popupText: { fontSize: 16, color: theme.colors.textPrimary },
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
    confirmDelete: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: theme.colors.error, alignItems: 'center' },
    confirmDeleteText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    addEngineerModal: { flex: 1, backgroundColor: theme.colors.surface },
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
});
