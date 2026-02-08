import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { reportsApi, DashboardSummary } from '../../../src/api';

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
        purple: '#7C3AED',
    }
};

interface ReportItem {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
    color: string;
}

export default function DirectorAnalytics() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            fetchDashboardSummary();
        }, [])
    );

    const fetchDashboardSummary = async () => {
        try {
            const response = await reportsApi.getDashboardSummary();
            setSummary(response);
        } catch (error) {
            console.error('Failed to fetch dashboard summary:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardSummary();
    };

    const reports: ReportItem[] = [
        {
            title: 'Financial Report',
            description: 'Total costs, spending trends',
            icon: 'cash-outline',
            route: '/(director)/analytics/financial',
            color: theme.colors.success,
        },
        {
            title: 'Material Report',
            description: 'Most ordered materials',
            icon: 'cube-outline',
            route: '/(director)/analytics/materials',
            color: theme.colors.primary,
        },
        {
            title: "Vendor's List",
            description: 'All vendors and history',
            icon: 'people-outline',
            route: '/(director)/analytics/vendors',
            color: theme.colors.purple,
        },
        {
            title: 'Damage Report',
            description: 'Damaged materials summary',
            icon: 'alert-circle-outline',
            route: '/(director)/analytics/damage-report',
            color: theme.colors.error,
        },
    ];

    const formatCurrency = (amount: number) => {
        return `₹${(amount || 0).toLocaleString('en-IN')}`;
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Summary Stats */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { borderColor: theme.colors.primary }]}>
                        <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
                        <Text style={styles.statValue}>{summary?.totalIndents || 0}</Text>
                        <Text style={styles.statLabel}>Total Indents</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: theme.colors.warning }]}>
                        <Ionicons name="time-outline" size={24} color={theme.colors.warning} />
                        <Text style={styles.statValue}>{summary?.pendingIndents || 0}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: theme.colors.success }]}>
                        <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.success} />
                        <Text style={styles.statValue}>{summary?.closedSites || 0}</Text>
                        <Text style={styles.statLabel}>Closed Sites</Text>
                    </View>
                </View>

                {/* Total Expense Card */}
                <View style={styles.expenseCard}>
                    <View style={styles.expenseIcon}>
                        <Ionicons name="wallet-outline" size={28} color={theme.colors.success} />
                    </View>
                    <View style={styles.expenseContent}>
                        <Text style={styles.expenseLabel}>Total Expense</Text>
                        <Text style={styles.expenseValue}>{formatCurrency(summary?.totalExpense || 0)}</Text>
                    </View>
                </View>
            </View>

            {/* Detailed Reports */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detailed Reports</Text>
                {reports.map((report, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.reportCard}
                        onPress={() => router.push(report.route as any)}
                    >
                        <View style={[styles.reportIcon, { backgroundColor: report.color + '15' }]}>
                            <Ionicons name={report.icon} size={24} color={report.color} />
                        </View>
                        <View style={styles.reportContent}>
                            <Text style={styles.reportTitle}>{report.title}</Text>
                            <Text style={styles.reportDesc}>{report.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    section: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: {
        width: '47%',
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: { fontSize: 28, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 8 },
    statLabel: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 20,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 2,
        borderColor: theme.colors.success + '30',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    expenseIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.success + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    expenseContent: { flex: 1 },
    expenseLabel: { fontSize: 14, color: theme.colors.textSecondary },
    expenseValue: { fontSize: 26, fontWeight: '700', color: theme.colors.success, marginTop: 2 },
    reportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    reportIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    reportContent: { flex: 1 },
    reportTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    reportDesc: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
});
