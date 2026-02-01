import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { indentsApi } from '../../../src/api';
import { Indent } from '../../../src/types';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        purple: '#7C3AED',
    }
};

interface SummaryStats {
    totalIndents: number;
    approvedIndents: number;
    pendingIndents: number;
    orderedIndents: number;
    totalValue: number;
}

interface ReportItem {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
    color: string;
}

export default function Analytics() {
    const [stats, setStats] = useState<SummaryStats>({
        totalIndents: 0,
        approvedIndents: 0,
        pendingIndents: 0,
        orderedIndents: 0,
        totalValue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState('all');
    const [siteFilter, setSiteFilter] = useState('all');
    const router = useRouter();

    useEffect(() => {
        fetchStats();
    }, [dateRange, siteFilter]);

    const fetchStats = async () => {
        try {
            const response = await indentsApi.getAll({ limit: 1000 });
            const indents = response.data;

            setStats({
                totalIndents: indents.length,
                approvedIndents: indents.filter(i => i.status === 'DIRECTOR_APPROVED').length,
                pendingIndents: indents.filter(i => i.status === 'SUBMITTED' || i.status === 'PURCHASE_APPROVED').length,
                orderedIndents: indents.filter(i => i.status === 'ORDER_PLACED').length,
                totalValue: 0, // TODO: Calculate from actual costs
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const reports: ReportItem[] = [
        {
            title: 'Financial Report',
            description: 'Total costs, spending trends',
            icon: 'cash-outline',
            route: '/(purchase-team)/analytics/financial',
            color: theme.colors.success,
        },
        {
            title: 'Material Report',
            description: 'Most ordered materials',
            icon: 'cube-outline',
            route: '/(purchase-team)/analytics/materials',
            color: theme.colors.primary,
        },
        {
            title: "Vendor's List",
            description: 'All vendors and history',
            icon: 'people-outline',
            route: '/(purchase-team)/analytics/vendors',
            color: theme.colors.purple,
        },
        {
            title: 'Damage Report',
            description: 'Damaged materials summary',
            icon: 'alert-circle-outline',
            route: '/(purchase-team)/analytics/damage-report',
            color: theme.colors.error,
        },
    ];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Filter Button */}
            <TouchableOpacity style={styles.filterBar} onPress={() => setShowFilters(true)}>
                <View style={styles.filterButton}>
                    <Ionicons name="filter" size={18} color={theme.colors.primary} />
                    <Text style={styles.filterText}>Filter</Text>
                </View>
            </TouchableOpacity>

            {/* Summary Stats */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { borderColor: theme.colors.primary }]}>
                        <Text style={styles.statValue}>{stats.totalIndents}</Text>
                        <Text style={styles.statLabel}>Total Indents</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: theme.colors.warning }]}>
                        <Text style={styles.statValue}>{stats.pendingIndents}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: theme.colors.success }]}>
                        <Text style={styles.statValue}>{stats.approvedIndents}</Text>
                        <Text style={styles.statLabel}>Approved</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: theme.colors.purple }]}>
                        <Text style={styles.statValue}>{stats.orderedIndents}</Text>
                        <Text style={styles.statLabel}>Ordered</Text>
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
                        <Text style={styles.filterLabel}>Date Range</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={dateRange}
                                onValueChange={setDateRange}
                            >
                                <Picker.Item label="All Time" value="all" />
                                <Picker.Item label="This Month" value="month" />
                                <Picker.Item label="Last 3 Months" value="3months" />
                                <Picker.Item label="This Year" value="year" />
                            </Picker>
                        </View>

                        <Text style={styles.filterLabel}>Site</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={siteFilter}
                                onValueChange={setSiteFilter}
                            >
                                <Picker.Item label="All Sites" value="all" />
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => { setDateRange('all'); setSiteFilter('all'); }}
                        >
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => { setShowFilters(false); setLoading(true); }}
                        >
                            <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    filterBar: {
        padding: 12,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: theme.colors.primary + '10',
        borderRadius: 20,
        gap: 6,
    },
    filterText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary },
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
    statValue: { fontSize: 28, fontWeight: '700', color: theme.colors.textPrimary },
    statLabel: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
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
    modalContainer: { flex: 1, backgroundColor: theme.colors.surface },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary },
    modalContent: { flex: 1, padding: 16 },
    filterLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8, marginTop: 16 },
    pickerContainer: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
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
    },
    resetButton: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
    resetButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.textSecondary },
    applyButton: { flex: 2, paddingVertical: 14, borderRadius: 10, backgroundColor: theme.colors.primary, alignItems: 'center' },
    applyButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
