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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        urgent: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
    }
};

interface PendingIndent {
    id: string;
    name: string;
    siteName: string;
    siteEngineer: string;
    createdAt: string;
    hasUrgent: boolean;
    status: 'PENDING' | 'PT_APPROVED' | 'ON_HOLD';
}

export default function PendingIndentsList() {
    const [indents, setIndents] = useState<PendingIndent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [siteFilter, setSiteFilter] = useState('all');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateFilter, setDateFilter] = useState<Date | null>(null);
    const router = useRouter();

    const sites = ['all', 'Green Valley', 'Skyline Towers', 'Riverside'];

    const fetchIndents = useCallback(async () => {
        try {
            // TODO: Replace with actual API call
            const mockData: PendingIndent[] = [
                { id: '1', name: 'Steel & Cement Order', siteName: 'Green Valley', siteEngineer: 'Rajesh Kumar', createdAt: '2024-02-01', hasUrgent: true, status: 'PT_APPROVED' },
                { id: '2', name: 'Electrical Wiring', siteName: 'Skyline Towers', siteEngineer: 'Priya Sharma', createdAt: '2024-01-30', hasUrgent: false, status: 'PT_APPROVED' },
                { id: '3', name: 'Plumbing Materials', siteName: 'Riverside', siteEngineer: 'Amit Patel', createdAt: '2024-01-28', hasUrgent: true, status: 'PENDING' },
                { id: '4', name: 'Finishing Work', siteName: 'Green Valley', siteEngineer: 'Rajesh Kumar', createdAt: '2024-01-25', hasUrgent: false, status: 'ON_HOLD' },
            ];
            // Sort by recents and urgency
            mockData.sort((a, b) => {
                if (a.hasUrgent !== b.hasUrgent) return a.hasUrgent ? -1 : 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setIndents(mockData);
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
        if (dateFilter) {
            const indentDate = new Date(indent.createdAt);
            if (indentDate < dateFilter) return false;
        }
        return true;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PT_APPROVED': return theme.colors.success;
            case 'ON_HOLD': return theme.colors.warning;
            default: return theme.colors.textSecondary;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PT_APPROVED': return 'PT Approved';
            case 'ON_HOLD': return 'On Hold';
            default: return 'Pending';
        }
    };

    const renderIndent = ({ item }: { item: PendingIndent }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(director)/indents/pending/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.indentName}>{item.name}</Text>
                {item.hasUrgent && (
                    <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>URGENT</Text>
                    </View>
                )}
            </View>
            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.infoText}>{item.siteEngineer}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.infoText}>{item.siteName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.infoText}>{formatDate(item.createdAt)}</Text>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
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
            {/* Navigation to other indent sections */}
            <View style={styles.navTabs}>
                <TouchableOpacity style={[styles.navTab, styles.navTabActive]}>
                    <Text style={[styles.navTabText, styles.navTabTextActive]}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/all' as any)}>
                    <Text style={styles.navTabText}>All</Text>
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
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar" size={18} color={theme.colors.primary} />
                    <Text style={styles.dateButtonText}>
                        {dateFilter ? dateFilter.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Date'}
                    </Text>
                </TouchableOpacity>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={siteFilter}
                        onValueChange={setSiteFilter}
                        style={styles.picker}
                    >
                        {sites.map(site => (
                            <Picker.Item key={site} label={site === 'all' ? 'All Sites' : site} value={site} />
                        ))}
                    </Picker>
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
                        <Text style={styles.emptyText}>No pending indents</Text>
                    </View>
                }
            />

            {showDatePicker && (
                <DateTimePicker
                    value={dateFilter || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) setDateFilter(date);
                    }}
                />
            )}
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
    filters: {
        flexDirection: 'row',
        padding: 12,
        gap: 10,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 6,
    },
    dateButtonText: { fontSize: 13, color: theme.colors.primary },
    pickerWrapper: {
        flex: 1,
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    picker: { height: 36, marginTop: -8, marginBottom: -8 },
    list: { padding: 12, paddingTop: 4 },
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    indentName: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, flex: 1 },
    urgentBadge: { backgroundColor: theme.colors.urgent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    urgentText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
    cardBody: { gap: 6, marginBottom: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 13, color: theme.colors.textSecondary },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 12, fontWeight: '600' },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
});
