import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
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
        success: '#10B981',
        warning: '#F59E0B',
    }
};

interface FinancialData {
    totalSpend: number;
    thisMonth: number;
    lastMonth: number;
    monthlyTrend: { month: string; amount: number }[];
    topCategories: { name: string; amount: number }[];
}

export default function FinancialReport() {
    const [data, setData] = useState<FinancialData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setData({
                totalSpend: 4560000,
                thisMonth: 560000,
                lastMonth: 480000,
                monthlyTrend: [
                    { month: 'Jan', amount: 420000 },
                    { month: 'Feb', amount: 480000 },
                    { month: 'Mar', amount: 560000 },
                ],
                topCategories: [
                    { name: 'Structural', amount: 1800000 },
                    { name: 'Plumbing', amount: 850000 },
                    { name: 'Electrical', amount: 720000 },
                    { name: 'Finishing', amount: 650000 },
                ],
            });
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        }
        return `₹${(amount / 1000).toFixed(0)}K`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Failed to load data</Text>
            </View>
        );
    }

    const monthChange = ((data.thisMonth - data.lastMonth) / data.lastMonth) * 100;

    return (
        <ScrollView style={styles.container}>
            {/* Total Spend */}
            <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Total Spend</Text>
                <Text style={styles.totalAmount}>{formatCurrency(data.totalSpend)}</Text>
            </View>

            {/* Month Comparison */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Monthly Comparison</Text>
                <View style={styles.comparisonCard}>
                    <View style={styles.comparisonItem}>
                        <Text style={styles.comparisonLabel}>This Month</Text>
                        <Text style={styles.comparisonValue}>{formatCurrency(data.thisMonth)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.comparisonItem}>
                        <Text style={styles.comparisonLabel}>Last Month</Text>
                        <Text style={styles.comparisonValue}>{formatCurrency(data.lastMonth)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.comparisonItem}>
                        <Text style={styles.comparisonLabel}>Change</Text>
                        <View style={styles.changeRow}>
                            <Ionicons
                                name={monthChange >= 0 ? "arrow-up" : "arrow-down"}
                                size={16}
                                color={monthChange >= 0 ? theme.colors.warning : theme.colors.success}
                            />
                            <Text style={[styles.changeValue, { color: monthChange >= 0 ? theme.colors.warning : theme.colors.success }]}>
                                {Math.abs(monthChange).toFixed(1)}%
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Monthly Trend */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Monthly Trend</Text>
                <View style={styles.trendCard}>
                    {data.monthlyTrend.map((item, index) => (
                        <View key={index} style={styles.trendItem}>
                            <View style={styles.trendBarContainer}>
                                <View
                                    style={[
                                        styles.trendBar,
                                        { height: `${(item.amount / Math.max(...data.monthlyTrend.map(t => t.amount))) * 100}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.trendMonth}>{item.month}</Text>
                            <Text style={styles.trendAmount}>{formatCurrency(item.amount)}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Top Categories */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Categories</Text>
                {data.topCategories.map((cat, index) => (
                    <View key={index} style={styles.categoryCard}>
                        <View style={styles.categoryInfo}>
                            <Text style={styles.categoryName}>{cat.name}</Text>
                            <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text>
                        </View>
                        <View style={styles.categoryBarBg}>
                            <View
                                style={[
                                    styles.categoryBarFill,
                                    { width: `${(cat.amount / data.topCategories[0].amount) * 100}%` }
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: theme.colors.textSecondary },
    totalCard: {
        backgroundColor: theme.colors.primary,
        padding: 24,
        margin: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    totalLabel: { fontSize: 14, color: '#FFFFFF', opacity: 0.8 },
    totalAmount: { fontSize: 40, fontWeight: '700', color: '#FFFFFF', marginTop: 4 },
    section: { padding: 16, paddingTop: 0 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12 },
    comparisonCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
    },
    comparisonItem: { flex: 1, alignItems: 'center' },
    comparisonLabel: { fontSize: 12, color: theme.colors.textSecondary },
    comparisonValue: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 4 },
    divider: { width: 1, backgroundColor: theme.colors.border },
    changeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    changeValue: { fontSize: 18, fontWeight: '700' },
    trendCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    trendItem: { alignItems: 'center' },
    trendBarContainer: { height: 100, width: 30, justifyContent: 'flex-end' },
    trendBar: { backgroundColor: theme.colors.primary, borderRadius: 4, width: '100%' },
    trendMonth: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 8 },
    trendAmount: { fontSize: 11, color: theme.colors.textPrimary, fontWeight: '600' },
    categoryCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
    },
    categoryInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    categoryName: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
    categoryAmount: { fontSize: 14, fontWeight: '600', color: theme.colors.success },
    categoryBarBg: { height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: 'hidden' },
    categoryBarFill: { height: '100%', backgroundColor: theme.colors.success, borderRadius: 3 },
});
