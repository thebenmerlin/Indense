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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

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

interface IndentItem {
    id: string;
    name: string;
    siteName: string;
    siteEngineer: string;
    createdAt: string;
    approvalStatus: string;
    purchaseStatus: string;
    isClosed: boolean;
}

export default function AllIndentsList() {
    const { siteId } = useLocalSearchParams<{ siteId?: string }>();
    const [indents, setIndents] = useState<IndentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [siteFilter, setSiteFilter] = useState(siteId || 'all');
    const [approvalFilter, setApprovalFilter] = useState('all');
    const [purchaseFilter, setPurchaseFilter] = useState('all');
    const router = useRouter();

    const sites = ['all', 'Green Valley', 'Skyline Towers', 'Riverside'];
    const approvalStatuses = ['all', 'Approved', 'Rejected', 'Pending', 'On Hold'];
    const purchaseStatuses = ['all', 'Ordered', 'Received', 'Pending'];

    const fetchIndents = useCallback(async () => {
        try {
            // TODO: Replace with actual API call
            setIndents([
                { id: '1', name: 'Steel & Cement Order', siteName: 'Green Valley', siteEngineer: 'Rajesh Kumar', createdAt: '2024-02-01', approvalStatus: 'Approved', purchaseStatus: 'Ordered', isClosed: false },
                { id: '2', name: 'Electrical Wiring', siteName: 'Skyline Towers', siteEngineer: 'Priya Sharma', createdAt: '2024-01-28', approvalStatus: 'Approved', purchaseStatus: 'Received', isClosed: true },
                { id: '3', name: 'Plumbing Materials', siteName: 'Riverside', siteEngineer: 'Amit Patel', createdAt: '2024-01-25', approvalStatus: 'Pending', purchaseStatus: 'Pending', isClosed: false },
                { id: '4', name: 'Finishing Work', siteName: 'Green Valley', siteEngineer: 'Rajesh Kumar', createdAt: '2024-01-20', approvalStatus: 'Rejected', purchaseStatus: 'Pending', isClosed: false },
            ]);
        } catch (error) {
            console.error('Failed to fetch indents:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchIndents();
    }, [fetchIndents]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchIndents();
    };

    const filteredIndents = indents.filter(indent => {
        if (siteFilter !== 'all' && indent.siteName !== siteFilter) return false;
        if (approvalFilter !== 'all' && indent.approvalStatus !== approvalFilter) return false;
        if (purchaseFilter !== 'all' && indent.purchaseStatus !== purchaseFilter) return false;
        return true;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': case 'Ordered': case 'Received': return theme.colors.success;
            case 'Rejected': return theme.colors.error;
            case 'On Hold': return theme.colors.warning;
            default: return theme.colors.textSecondary;
        }
    };

    const renderIndent = ({ item }: { item: IndentItem }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(director)/indents/all/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.indentName}>{item.name}</Text>
                {item.isClosed && (
                    <View style={styles.closedBadge}>
                        <Text style={styles.closedText}>CLOSED</Text>
                    </View>
                )}
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.infoText}>{item.siteEngineer} • {item.siteName}</Text>
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.approvalStatus) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.approvalStatus) }]}>{item.approvalStatus}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.purchaseStatus) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.purchaseStatus) }]}>{item.purchaseStatus}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
        </TouchableOpacity>
    );

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
                                {sites.map(s => <Picker.Item key={s} label={s === 'all' ? 'All Sites' : s} value={s} />)}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.filterItem}>
                        <Text style={styles.filterLabel}>Approval</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker selectedValue={approvalFilter} onValueChange={setApprovalFilter} style={styles.picker}>
                                {approvalStatuses.map(s => <Picker.Item key={s} label={s === 'all' ? 'All' : s} value={s} />)}
                            </Picker>
                        </View>
                    </View>
                </View>
                <View style={styles.filterRow}>
                    <View style={styles.filterItem}>
                        <Text style={styles.filterLabel}>Purchase Status</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker selectedValue={purchaseFilter} onValueChange={setPurchaseFilter} style={styles.picker}>
                                {purchaseStatuses.map(s => <Picker.Item key={s} label={s === 'all' ? 'All' : s} value={s} />)}
                            </Picker>
                        </View>
                    </View>
                </View>
            </View>

            <FlatList
                data={filteredIndents}
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
