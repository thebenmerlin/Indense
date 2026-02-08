import React, { useState, useCallback, useEffect } from 'react';
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
import { sitesApi, SiteWithEngineers, SiteEngineer } from '../../../../src/api';

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

export default function SiteDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    // Data state
    const [site, setSite] = useState<SiteWithEngineers | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Engineer management
    const [editMode, setEditMode] = useState(false);
    const [engineers, setEngineers] = useState<SiteEngineer[]>([]);
    const [originalEngineers, setOriginalEngineers] = useState<SiteEngineer[]>([]);
    const [availableEngineers, setAvailableEngineers] = useState<SiteEngineer[]>([]);
    const [showAddEngineer, setShowAddEngineer] = useState(false);
    const [saving, setSaving] = useState(false);

    // Actions
    const [showActions, setShowActions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    // Fetch site details
    const fetchSite = useCallback(async () => {
        if (!id) return;
        try {
            const data = await sitesApi.getDetails(id);
            setSite(data);
            const engList = (data.engineers || []).map(e => ({
                id: e.id,
                name: e.name,
                email: e.email,
                phone: e.phone,
            }));
            setEngineers(engList);
            setOriginalEngineers(engList);
        } catch (error) {
            console.error('Failed to fetch site:', error);
            Alert.alert('Error', 'Failed to load site details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    // Fetch available engineers for adding
    const fetchAvailableEngineers = useCallback(async () => {
        if (!id) return;
        try {
            const data = await sitesApi.getAvailableEngineers(id);
            setAvailableEngineers(data);
        } catch (error) {
            console.error('Failed to fetch available engineers:', error);
        }
    }, [id]);

    useEffect(() => {
        fetchSite();
    }, [fetchSite]);

    useEffect(() => {
        if (editMode) {
            fetchAvailableEngineers();
        }
    }, [editMode, fetchAvailableEngineers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSite();
    };

    const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Engineer management handlers
    const handleRemoveEngineer = (engineerId: string) => {
        const removed = engineers.find(e => e.id === engineerId);
        setEngineers(prev => prev.filter(e => e.id !== engineerId));
        if (removed) {
            setAvailableEngineers(prev => [...prev, removed]);
        }
    };

    const handleAddEngineer = (engineer: SiteEngineer) => {
        setEngineers(prev => [...prev, engineer]);
        setAvailableEngineers(prev => prev.filter(e => e.id !== engineer.id));
        setShowAddEngineer(false);
    };

    const handleSaveEngineers = async () => {
        if (!id) return;
        setSaving(true);
        try {
            await sitesApi.assignEngineers(id, engineers.map(e => e.id));
            setOriginalEngineers(engineers);
            setEditMode(false);
            Alert.alert('Success', 'Engineers updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to update engineers');
            setEngineers(originalEngineers);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEngineers(originalEngineers);
    };

    // Site actions
    const navigateToIndents = () => {
        router.push(`/(director)/indents/all?siteId=${id}` as any);
    };

    const handleDeleteSite = async () => {
        if (!id || !site) return;
        if (confirmText.toLowerCase() !== site.city?.toLowerCase()) {
            Alert.alert('Error', 'Please type the site location correctly');
            return;
        }
        try {
            await sitesApi.deleteSite(id);
            Alert.alert('Deleted', 'Site has been deleted', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to delete site');
        }
    };

    const handleCloseSite = async () => {
        if (!id || !site) return;
        if (confirmText.toLowerCase() !== site.city?.toLowerCase()) {
            Alert.alert('Error', 'Please type the site location correctly');
            return;
        }
        try {
            await sitesApi.closeSite(id);
            Alert.alert('Closed', 'Site has been closed', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to close site');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!site) {
        return (
            <View style={styles.centered}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <Text style={styles.errorText}>Site not found</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Site Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.siteName}>{site.name}</Text>
                    <Text style={styles.siteCode}>{site.code}</Text>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={18} color={theme.colors.accent} />
                            <Text style={styles.infoLabel}>Location</Text>
                            <Text style={styles.infoValue}>{site.city || '-'}{site.state ? `, ${site.state}` : ''}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={18} color={theme.colors.accent} />
                            <Text style={styles.infoLabel}>Start Date</Text>
                            <Text style={styles.infoValue}>{formatDate(site.startDate)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="flag-outline" size={18} color={theme.colors.accent} />
                            <Text style={styles.infoLabel}>Expected Handover</Text>
                            <Text style={styles.infoValue}>{formatDate(site.expectedHandoverDate)}</Text>
                        </View>
                        <TouchableOpacity style={styles.infoItem} onPress={navigateToIndents}>
                            <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
                            <Text style={styles.infoLabel}>No. of Indents</Text>
                            <Text style={[styles.infoValue, styles.clickable]}>{site.indentCount ?? 0}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Site Engineers Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Site Engineers at {site.name}</Text>
                        {!editMode ? (
                            <TouchableOpacity onPress={() => setEditMode(true)} style={styles.editBtn}>
                                <Ionicons name="pencil" size={16} color={theme.colors.primary} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.editActions}>
                                <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelBtn}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveEngineers} style={styles.saveBtn} disabled={saving}>
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Text style={styles.saveBtnText}>Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Engineers List */}
                    {engineers.map(eng => (
                        <View key={eng.id} style={styles.engineerCard}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{eng.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.engineerInfo}>
                                <Text style={styles.engineerName}>{eng.name}</Text>
                                <Text style={styles.engineerEmail}>{eng.email}</Text>
                            </View>
                            {editMode && (
                                <TouchableOpacity onPress={() => handleRemoveEngineer(eng.id)}>
                                    <Ionicons name="remove-circle" size={24} color={theme.colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {editMode && (
                        <TouchableOpacity style={styles.addEngineerBtn} onPress={() => setShowAddEngineer(true)}>
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
                        <TouchableOpacity
                            style={styles.popupItem}
                            onPress={() => {
                                setShowActions(false);
                                router.push(`/(director)/space/sites/add?edit=${id}` as any);
                            }}
                        >
                            <Ionicons name="create-outline" size={20} color={theme.colors.textPrimary} />
                            <Text style={styles.popupText}>Edit Site</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.popupItem}
                            onPress={() => { setShowActions(false); setConfirmText(''); setShowCloseConfirm(true); }}
                        >
                            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.warning} />
                            <Text style={[styles.popupText, { color: theme.colors.warning }]}>Close Site</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.popupItem}
                            onPress={() => { setShowActions(false); setConfirmText(''); setShowDeleteConfirm(true); }}
                        >
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
                        <View style={[styles.confirmIcon, { backgroundColor: theme.colors.error + '20' }]}>
                            <Ionicons name="warning" size={40} color={theme.colors.error} />
                        </View>
                        <Text style={styles.confirmTitle}>Delete Site?</Text>
                        <Text style={styles.confirmMessage}>
                            This action cannot be undone. Type <Text style={styles.bold}>{site.city}</Text> to confirm.
                        </Text>
                        <TextInput
                            style={styles.confirmInput}
                            placeholder="Type site location"
                            value={confirmText}
                            onChangeText={setConfirmText}
                            autoCapitalize="none"
                        />
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity
                                style={styles.confirmCancel}
                                onPress={() => setShowDeleteConfirm(false)}
                            >
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
                            This will mark the site as closed. Type <Text style={styles.bold}>{site.city}</Text> to confirm.
                        </Text>
                        <TextInput
                            style={styles.confirmInput}
                            placeholder="Type site location"
                            value={confirmText}
                            onChangeText={setConfirmText}
                            autoCapitalize="none"
                        />
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity
                                style={styles.confirmCancel}
                                onPress={() => setShowCloseConfirm(false)}
                            >
                                <Text style={styles.confirmCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmDelete, { backgroundColor: theme.colors.warning }]}
                                onPress={handleCloseSite}
                            >
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
                                <View style={styles.avatar}>
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
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 12 },
    backBtn: { marginTop: 16, padding: 12, backgroundColor: theme.colors.primary, borderRadius: 8 },
    backBtnText: { color: '#FFF', fontWeight: '600' },

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
    clickable: { color: theme.colors.primary, textDecorationLine: 'underline' },

    section: { padding: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, flex: 1 },
    editBtn: { padding: 8, backgroundColor: theme.colors.primary + '15', borderRadius: 8 },
    editActions: { flexDirection: 'row', gap: 8 },
    cancelBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border },
    cancelBtnText: { fontSize: 13, color: theme.colors.textSecondary },
    saveBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: theme.colors.primary },
    saveBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },

    engineerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    avatar: {
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

    addEngineerBtn: {
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
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    confirmTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8 },
    confirmMessage: { fontSize: 15, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 16 },
    bold: { fontWeight: '700', color: theme.colors.textPrimary },
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
