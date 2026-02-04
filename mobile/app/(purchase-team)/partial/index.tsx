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
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { damagesApi } from '../../../src/api';
import { Indent } from '../../../src/types';
import FilterModal, { FilterOptions } from '../../../src/components/FilterModal';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        warning: '#F59E0B',
        success: '#10B981',
        error: '#EF4444',
    }
};

export default function PartialOrders() {
    const [indents, setIndents] = useState<Indent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({ startDate: null, endDate: null, status: 'ALL' });
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            fetchIndents();
        }, [filters])
    );

    const fetchIndents = async () => {
        try {
            setLoading(true);
            const response = await damagesApi.getPartiallyReceivedIndents({
                siteId: filters.siteId || undefined,
                fromDate: filters.startDate?.toISOString(),
                toDate: filters.endDate?.toISOString(),
            });
            setIndents(response.data || []);
        } catch (error) {
            console.error('Failed to fetch partial orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchIndents();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getProgress = (indent: Indent) => {
        const total = indent.items?.length || 0;
        if (total === 0) return { received: 0, total: 0, percent: 0 };
        const received = indent.items?.filter((item) => item.arrivalStatus === 'ARRIVED').length || 0;
        return { received, total, percent: Math.round((received / total) * 100) };
    };

    const handleApplyFilters = (newFilters: FilterOptions) => {
        setFilters(newFilters);
        setShowFilter(false);
    };

    const renderIndent = ({ item }: { item: Indent }) => {
        const progress = getProgress(item);
        
        return (
            <TouchableOpacity
                onPress={() => router.push(`/(purchase-team)/partial/${item.id}` as any)}
                activeOpacity={0.7}
            >
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIcon}>
                            <Ionicons name="hourglass-outline" size={24} color={theme.colors.warning} />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.indentName} numberOfLines={1}>
                                {item.name || item.indentNumber}
                            </Text>
                            <Text style={styles.indentNumber}>{item.indentNumber}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.cardDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.detailText}>{item.site?.name || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
                        </View>
                    </View>

                    {/* Progress Section */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Received Progress</Text>
                            <Text style={styles.progressValue}>{progress.percent}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
                        </View>
                        <View style={styles.itemCounts}>
                            <Text style={styles.countText}>
                                <Text style={styles.countReceived}>{progress.received}</Text> / {progress.total} items received
                            </Text>
                            <Text style={styles.pendingText}>{progress.total - progress.received} pending</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const activeFilterCount = [filters.startDate, filters.endDate, filters.siteId].filter(Boolean).length;

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Filter */}
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>Partially Received ({indents.length})</Text>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilter(true)}
                >
                    <Ionicons name="filter" size={20} color={theme.colors.primary} />
                    {activeFilterCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                data={indents}
                keyExtractor={item => item.id}
                renderItem={renderIndent}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="checkmark-done-circle-outline" size={64} color={theme.colors.success} />
                        <Text style={styles.emptyText}>All Orders Complete</Text>
                        <Text style={styles.emptySubtext}>No partially received orders found</Text>
                    </View>
                }
            />

            <FilterModal
                visible={showFilter}
                onClose={() => setShowFilter(false)}
                onApply={handleApplyFilters}
                initialFilters={filters}
                showStatusFilter={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    filterButton: { flexDirection: 'row', alignItems: 'center', padding: 8 },
    filterBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
    list: { padding: 16 },
    card: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.warning,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIcon: { marginRight: 14 },
    cardContent: { flex: 1 },
    indentName: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
    indentNumber: { fontSize: 12, color: theme.colors.textSecondary, fontFamily: 'monospace', marginTop: 2 },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 12,
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailText: { fontSize: 13, color: theme.colors.textSecondary },
    progressSection: {
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: { fontSize: 13, color: theme.colors.textSecondary },
    progressValue: { fontSize: 14, fontWeight: '700', color: theme.colors.warning },
    progressBar: {
        height: 8,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.warning,
        borderRadius: 4,
    },
    itemCounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    countText: { fontSize: 12, color: theme.colors.textSecondary },
    countReceived: { fontWeight: '700', color: theme.colors.success },
    pendingText: { fontSize: 12, fontWeight: '600', color: theme.colors.error },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
    emptySubtext: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
});