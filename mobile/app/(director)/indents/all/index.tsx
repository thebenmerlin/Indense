import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { indentsApi } from '../../../../src/api/indents.api';
import { sitesApi, Site } from '../../../../src/api/sites.api';
import { Indent } from '../../../../src/types';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
    }
};

export default function AllIndentsList() {
    const { siteId } = useLocalSearchParams<{ siteId?: string }>();
    const [indents, setIndents] = useState<Indent[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [siteFilter, setSiteFilter] = useState(siteId || 'all');
    const [statusFilter, setStatusFilter] = useState('all');
    const router = useRouter();

    const statusOptions = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'PT Approved', value: 'PT_APPROVED' },
        { label: 'Director Approved', value: 'DIRECTOR_APPROVED' },
        { label: 'Ordered', value: 'ORDERED' },
        { label: 'Received', value: 'RECEIVED' },
        { label: 'Closed', value: 'CLOSED' },
        { label: 'Rejected', value: 'REJECTED' },
    ];

    // Load sites for filter
    useEffect(() => {
        const loadSites = async () => {
            try {
                const response = await sitesApi.getAll({ limit: 100 });
                setSites(response.data);
            } catch (error) {
                console.error('Failed to fetch sites:', error);
            }
        };
        loadSites();
    }, []);

    const fetchIndents = useCallback(async () => {
        try {
            const response = await indentsApi.getAll({
                siteId: siteFilter !== 'all' ? siteFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                limit: 50,
            });
            // Sort by date, newest first
            const sortedData = [...response.data].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setIndents(sortedData);
        } catch (error) {
            console.error('Failed to fetch indents:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [siteFilter, statusFilter]);

    useFocusEffect(
        useCallback(() => {
            fetchIndents();
        }, [fetchIndents])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchIndents();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const getStatusColor = (status: string, isOnHold?: boolean) => {
        if (isOnHold) return theme.colors.warning;
        switch (status) {
            case 'DIRECTOR_APPROVED': case 'ORDERED': case 'RECEIVED': case 'CLOSED':
                return theme.colors.success;
            case 'REJECTED': return theme.colors.error;
            case 'PT_APPROVED': return theme.colors.primary;
            default: return theme.colors.textSecondary;
        }
    };

    const getStatusLabel = (status: string, isOnHold?: boolean) => {
        if (isOnHold) return 'On Hold';
        switch (status) {
            case 'PENDING': return 'Pending';
            case 'PT_APPROVED': return 'PT Approved';
            case 'DIRECTOR_APPROVED': return 'Approved';
            case 'ORDERED': return 'Ordered';
            case 'RECEIVED': return 'Received';
            case 'CLOSED': return 'Closed';
            case 'REJECTED': return 'Rejected';
            default: return status;
        }
    };

    const renderIndent = ({ item }: { item: Indent }) => {
        const siteName = item.site?.name || 'Unknown Site';
        const engineerName = item.createdBy?.name || 'Unknown';

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/(director)/indents/${item.id}` as any)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.indentName}>{item.name}</Text>
                    {item.status === 'CLOSED' && (
                        <View style={styles.closedBadge}>
                            <Text style={styles.closedText}>CLOSED</Text>
                        </View>
                    )}
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.infoText}>{engineerName} • {siteName}</Text>
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, item.isOnHold) + '15' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status, item.isOnHold) }]}>
                            {getStatusLabel(item.status, item.isOnHold)}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
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
            {/* Navigation Tabs */}
            <View style={styles.navTabs}>
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/pending' as any)}>
                    <Text style={styles.navTabText}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navTab, styles.navTabActive]}>
                    <Text style={[styles.navTabText, styles.navTabTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/damaged' as any)}>
                    <Text style={styles.navTabText}>Damaged</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/partial' as any)}>
                    <Text style={styles.navTabText}>Partial</Text>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filters}>
                <View style={styles.filterRow}>
                    <View style={styles.filterItem}>
                        <Text style={styles.filterLabel}>Site</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker selectedValue={siteFilter} onValueChange={setSiteFilter} style={styles.picker}>
                                <Picker.Item label="All Sites" value="all" />
                                {sites.map(s => <Picker.Item key={s.id} label={s.name} value={s.id} />)}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.filterItem}>
                        <Text style={styles.filterLabel}>Status</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker selectedValue={statusFilter} onValueChange={setStatusFilter} style={styles.picker}>
                                {statusOptions.map(s => <Picker.Item key={s.value} label={s.label} value={s.value} />)}
                            </Picker>
                        </View>
                    </View>
                </View>
            </View>

            <FlatList
                data={indents}
                keyExtractor={item => item.id}
                renderItem={renderIndent}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="document-text-outline" size={56} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No indents found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    navTabs: {
        flexDirection: 'row',
        backgroundColor: theme.colors.cardBg,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    navTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    navTabActive: { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
    navTabText: { fontSize: 14, color: theme.colors.textSecondary },
    navTabTextActive: { fontWeight: '600', color: theme.colors.primary },
    filters: { padding: 12 },
    filterRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    filterItem: { flex: 1 },
    filterLabel: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 4 },
    pickerWrapper: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    picker: { height: 36, marginTop: -8, marginBottom: -8 },
    list: { padding: 12, paddingTop: 0 },
    card: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    indentName: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, flex: 1 },
    closedBadge: { backgroundColor: theme.colors.textSecondary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    closedText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
    cardBody: { marginBottom: 10 },
    infoText: { fontSize: 13, color: theme.colors.textSecondary },
    dateText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 11, fontWeight: '600' },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
});
