import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { damagesApi } from '../../../../src/api';
import { DamageReport } from '../../../../src/types';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
    }
};

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'SEVERE': return theme.colors.error;
        case 'MODERATE': return theme.colors.warning;
        case 'MINOR': return theme.colors.textSecondary;
        default: return theme.colors.textSecondary;
    }
};

const getStatusBadge = (status: string, isReordered?: boolean) => {
    if (isReordered) {
        return { label: 'Reordered', color: theme.colors.primary, bg: theme.colors.primary + '15' };
    }
    switch (status) {
        case 'REPORTED': return { label: 'Reported', color: theme.colors.error, bg: theme.colors.error + '15' };
        case 'ACKNOWLEDGED': return { label: 'Acknowledged', color: theme.colors.warning, bg: theme.colors.warning + '15' };
        case 'RESOLVED': return { label: 'Resolved', color: theme.colors.success, bg: theme.colors.success + '15' };
        default: return { label: status, color: theme.colors.textSecondary, bg: theme.colors.surface };
    }
};

export default function DamagedOrdersList() {
    const [damages, setDamages] = useState<DamageReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const router = useRouter();

    const fetchDamages = useCallback(async () => {
        try {
            const params: any = { limit: 100 };
            if (statusFilter !== 'all') {
                if (statusFilter === 'unresolved') {
                    params.isResolved = false;
                } else {
                    params.status = statusFilter;
                }
            }
            const response = await damagesApi.getAll(params);
            // Sort by date, newest first
            const sortedData = [...response.data].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setDamages(sortedData);
        } catch (error) {
            console.error('Failed to fetch damages:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [statusFilter]);

    useFocusEffect(
        useCallback(() => {
            fetchDamages();
        }, [fetchDamages])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchDamages();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderDamage = ({ item }: { item: DamageReport }) => {
        const severityColor = getSeverityColor(item.severity);
        const statusBadge = getStatusBadge(item.status, item.isReordered);

        return (
            <TouchableOpacity
                onPress={() => router.push(`/(director)/indents/damaged/${item.id}` as any)}
                activeOpacity={0.7}
            >
                <View style={[styles.card, { borderLeftColor: severityColor }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIcon}>
                            <Ionicons name="alert-circle" size={24} color={severityColor} />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.materialName} numberOfLines={1}>
                                {item.indentItem?.material?.name || item.name}
                            </Text>
                            <Text style={styles.indentNumber}>
                                {item.indent?.indentNumber}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
                            <Text style={[styles.statusText, { color: statusBadge.color }]}>
                                {statusBadge.label}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.cardDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} />
                            <Text style={styles.detailText}>{item.site?.name || item.indent?.site?.name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="person-outline" size={12} color={theme.colors.textSecondary} />
                            <Text style={styles.detailText}>{item.reportedBy?.name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
                            <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
                        </View>
                        {item.damagedQty && (
                            <View style={styles.detailRow}>
                                <Ionicons name="cube-outline" size={12} color={theme.colors.textSecondary} />
                                <Text style={styles.detailText}>Qty: {item.damagedQty}</Text>
                            </View>
                        )}
                    </View>
                    {item.isReordered && item.reorderExpectedDate && (
                        <View style={styles.reorderInfo}>
                            <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
                            <Text style={styles.reorderText}>
                                Expected: {formatDate(item.reorderExpectedDate)}
                            </Text>
                        </View>
                    )}
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} style={styles.chevron} />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Filter Bar */}
            <TouchableOpacity style={styles.filterBar} onPress={() => setShowFilters(true)}>
                <View style={styles.filterButton}>
                    <Ionicons name="filter" size={18} color={theme.colors.primary} />
                    <Text style={styles.filterText}>
                        {statusFilter === 'all' ? 'All Damages' :
                            statusFilter === 'unresolved' ? 'Unresolved' : statusFilter}
                    </Text>
                </View>
                <Text style={styles.countText}>{damages.length} report{damages.length !== 1 ? 's' : ''}</Text>
            </TouchableOpacity>

            <FlatList
                data={damages}
                keyExtractor={item => item.id}
                renderItem={renderDamage}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="checkmark-done-circle-outline" size={64} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No Damages Reported</Text>
                        <Text style={styles.emptySubtext}>All materials are in good condition</Text>
                    </View>
                }
            />

            {/* Filter Modal */}
            <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filters</Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalContent}>
                        <Text style={styles.filterLabel}>Status</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={statusFilter} onValueChange={setStatusFilter}>
                                <Picker.Item label="All Damages" value="all" />
                                <Picker.Item label="Unresolved" value="unresolved" />
                                <Picker.Item label="Reported" value="REPORTED" />
                                <Picker.Item label="Acknowledged" value="ACKNOWLEDGED" />
                                <Picker.Item label="Resolved" value="RESOLVED" />
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.resetButton} onPress={() => setStatusFilter('all')}>
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={() => { setShowFilters(false); setLoading(true); fetchDamages(); }}>
                            <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: theme.colors.primary + '10',
        borderRadius: 20,
        gap: 6,
    },
    filterText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
    countText: { fontSize: 13, color: theme.colors.textSecondary },
    list: { padding: 16 },
    card: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    cardIcon: { marginRight: 12 },
    cardContent: { flex: 1 },
    materialName: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
    indentNumber: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2, fontFamily: 'monospace' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '600' },
    cardDetails: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 12 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailText: { fontSize: 12, color: theme.colors.textSecondary },
    reorderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    reorderText: { fontSize: 13, color: theme.colors.primary, fontWeight: '500' },
    chevron: { position: 'absolute', right: 16, top: '50%' },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
    emptySubtext: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
    // Modal styles
    modalContainer: { flex: 1, backgroundColor: theme.colors.surface },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.cardBg,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    modalContent: { padding: 16 },
    filterLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 },
    pickerContainer: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.cardBg,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    resetButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    resetButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.textSecondary },
    applyButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    applyButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
