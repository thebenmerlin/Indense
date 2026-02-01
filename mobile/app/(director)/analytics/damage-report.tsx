import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        error: '#EF4444',
        success: '#10B981',
    }
};

interface DamageItem {
    id: string;
    materialName: string;
    siteName: string;
    quantity: number;
    unit: string;
    reportedDate: string;
    reorderStatus: 'pending' | 'ordered' | 'received';
}

interface DamageSummary {
    totalIncidents: number;
    totalItems: number;
    resolved: number;
    monthlyData: { month: string; count: number }[];
}

export default function DamageReport() {
    const [summary, setSummary] = useState<DamageSummary | null>(null);
    const [items, setItems] = useState<DamageItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setSummary({
                totalIncidents: 12,
                totalItems: 28,
                resolved: 20,
                monthlyData: [
                    { month: 'Jan', count: 5 },
                    { month: 'Feb', count: 4 },
                    { month: 'Mar', count: 3 },
                ],
            });
            setItems([
                { id: '1', materialName: 'TMT Steel Bars', siteName: 'Green Valley', quantity: 50, unit: 'kg', reportedDate: '2024-02-02', reorderStatus: 'ordered' },
                { id: '2', materialName: 'Cement Bags', siteName: 'Skyline Towers', quantity: 10, unit: 'bags', reportedDate: '2024-01-28', reorderStatus: 'received' },
                { id: '3', materialName: 'PVC Pipes', siteName: 'Riverside', quantity: 15, unit: 'pieces', reportedDate: '2024-01-25', reorderStatus: 'pending' },
            ]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ordered': return theme.colors.primary;
            case 'received': return theme.colors.success;
            default: return theme.colors.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: DamageItem }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.materialName}>{item.materialName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.reorderStatus) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.reorderStatus) }]}>
                        {item.reorderStatus === 'ordered' ? 'Reordered' : item.reorderStatus === 'received' ? 'Received' : 'Pending'}
                    </Text>
                </View>
            </View>
            <Text style={styles.siteText}>{item.siteName} • {formatDate(item.reportedDate)}</Text>
            <Text style={styles.qtyText}>{item.quantity} {item.unit} damaged</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!summary) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Failed to load data</Text>
            </View>
        );
    }

    const resolvedPercent = (summary.resolved / summary.totalItems) * 100;

    return (
        <View style={styles.container}>
            {/* Summary */}
            <View style={styles.summarySection}>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
                        <Text style={styles.summaryTitle}>Damage Summary</Text>
                    </View>
                    <View style={styles.summaryStats}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{summary.totalIncidents}</Text>
                            <Text style={styles.summaryLabel}>Incidents</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{summary.totalItems}</Text>
                            <Text style={styles.summaryLabel}>Items</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>{summary.resolved}</Text>
                            <Text style={styles.summaryLabel}>Resolved</Text>
                        </View>
                    </View>
                    <View style={styles.progressSection}>
                        <Text style={styles.progressLabel}>Resolution Progress</Text>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${resolvedPercent}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{resolvedPercent.toFixed(0)}% resolved</Text>
                    </View>
                </View>
            </View>

            {/* Recent Damage Items */}
            <Text style={styles.sectionTitle}>Recent Damage Reports</Text>
            <FlatList
                data={items}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No damage reports</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: theme.colors.textSecondary },
    summarySection: { padding: 16 },
    summaryCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 14,
        padding: 16,
    },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    summaryTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    summaryStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
    summaryItem: { alignItems: 'center' },
    summaryValue: { fontSize: 28, fontWeight: '700', color: theme.colors.textPrimary },
    summaryLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    progressSection: { paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
    progressLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 8 },
    progressBarBg: { height: 8, backgroundColor: theme.colors.border, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: theme.colors.success, borderRadius: 4 },
    progressText: { fontSize: 13, fontWeight: '600', color: theme.colors.success, textAlign: 'center', marginTop: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, paddingHorizontal: 16, marginBottom: 12 },
    list: { paddingHorizontal: 16, paddingBottom: 40 },
    card: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.error,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    materialName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 11, fontWeight: '600' },
    siteText: { fontSize: 13, color: theme.colors.textSecondary },
    qtyText: { fontSize: 13, color: theme.colors.error, marginTop: 4 },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 16, color: theme.colors.textSecondary },
});
