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
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
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
        urgent: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
    }
};

export default function PendingIndentsList() {
    const [indents, setIndents] = useState<Indent[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [siteFilter, setSiteFilter] = useState('all');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateFilter, setDateFilter] = useState<Date | null>(null);
    const router = useRouter();

    // Load sites for filter dropdown
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
            // Director sees:
            // - SUBMITTED (new indents - director can approve directly, bypassing PT)
            // - PURCHASE_APPROVED (PT approved, awaiting director approval)
            // - ON_HOLD indents
            const response = await indentsApi.getAll({
                status: ['SUBMITTED', 'PURCHASE_APPROVED', 'ON_HOLD'],
                siteId: siteFilter !== 'all' ? siteFilter : undefined,
                fromDate: dateFilter ? dateFilter.toISOString().split('T')[0] : undefined,
                limit: 50,
            });

            // Sort by urgency (items with urgent materials first), then by date
            const sortedData = [...response.data].sort((a, b) => {
                const aHasUrgent = a.items?.some(item => item.isUrgent) || false;
                const bHasUrgent = b.items?.some(item => item.isUrgent) || false;
                if (aHasUrgent !== bHasUrgent) return aHasUrgent ? -1 : 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setIndents(sortedData);
        } catch (error) {
            console.error('Failed to fetch indents:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [siteFilter, dateFilter]);

    // Refresh on focus
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
            case 'SUBMITTED': return theme.colors.warning;
            case 'PURCHASE_APPROVED': return theme.colors.success;
            case 'DIRECTOR_APPROVED': return theme.colors.success;
            default: return theme.colors.textSecondary;
        }
    };

    const getStatusLabel = (status: string, isOnHold?: boolean) => {
        if (isOnHold) return 'On Hold';
        switch (status) {
            case 'SUBMITTED': return 'New';
            case 'PURCHASE_APPROVED': return 'PT Approved';
            case 'DIRECTOR_APPROVED': return 'Approved';
            default: return status;
        }
    };

    const renderIndent = ({ item }: { item: Indent }) => {
        const hasUrgent = item.items?.some(i => i.isUrgent) || false;
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
                    {hasUrgent && (
                        <View style={styles.urgentBadge}>
                            <Text style={styles.urgentText}>URGENT</Text>
                        </View>
                    )}
                </View>
                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{engineerName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="business-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{siteName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{formatDate(item.createdAt)}</Text>
                    </View>
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
                        <Picker.Item label="All Sites" value="all" />
                        {sites.map(site => (
                            <Picker.Item key={site.id} label={site.name} value={site.id} />
                        ))}
                    </Picker>
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
