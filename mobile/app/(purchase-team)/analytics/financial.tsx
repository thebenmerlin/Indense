import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
    }
};

export default function FinancialReport() {
    const [exporting, setExporting] = useState(false);

    // Mock data
    const financialData = {
        totalSpent: 2450000,
        monthlySpent: 450000,
        avgOrderValue: 75000,
        topCategories: [
            { name: 'Cement & Concrete', amount: 850000 },
            { name: 'Steel & Metal', amount: 650000 },
            { name: 'Electrical', amount: 350000 },
            { name: 'Plumbing', amount: 250000 },
            { name: 'Wood & Timber', amount: 200000 },
        ],
        monthlySummary: [
            { month: 'Jan', amount: 350000 },
            { month: 'Feb', amount: 420000 },
            { month: 'Mar', amount: 380000 },
            { month: 'Apr', amount: 450000 },
        ],
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)}L`;
        }
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            // TODO: Implement actual Excel export
            await new Promise(resolve => setTimeout(resolve, 1500));
            Alert.alert('Success', 'Financial report exported to Downloads');
        } catch (error) {
            Alert.alert('Error', 'Failed to export report');
        } finally {
            setExporting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Summary Cards */}
            <View style={styles.section}>
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryValue}>{formatCurrency(financialData.totalSpent)}</Text>
                        <Text style={styles.summaryLabel}>Total Spent</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryValue}>{formatCurrency(financialData.monthlySpent)}</Text>
                        <Text style={styles.summaryLabel}>This Month</Text>
                    </View>
                    <View style={[styles.summaryCard, { width: '100%' }]}>
                        <Text style={styles.summaryValue}>{formatCurrency(financialData.avgOrderValue)}</Text>
                        <Text style={styles.summaryLabel}>Average Order Value</Text>
                    </View>
                </View>
            </View>

            {/* Top Categories */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Categories by Spending</Text>
                {financialData.topCategories.map((category, index) => {
                    const maxAmount = financialData.topCategories[0].amount;
                    const percentage = (category.amount / maxAmount) * 100;
                    return (
                        <View key={index} style={styles.categoryItem}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Monthly Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Monthly Summary</Text>
                <View style={styles.monthGrid}>
                    {financialData.monthlySummary.map((item, index) => (
                        <View key={index} style={styles.monthCard}>
                            <Text style={styles.monthName}>{item.month}</Text>
                            <Text style={styles.monthAmount}>{formatCurrency(item.amount)}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Export Button */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.exportButton}
                    onPress={handleExport}
                    disabled={exporting}
                >
                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.exportButtonText}>
                        {exporting ? 'Exporting...' : 'Export to Excel'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    section: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12 },
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    summaryCard: {
        width: '47%',
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryValue: { fontSize: 24, fontWeight: '700', color: theme.colors.success },
    summaryLabel: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
    categoryItem: { marginBottom: 16 },
    categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    categoryName: { fontSize: 14, fontWeight: '500', color: theme.colors.textPrimary },
    categoryAmount: { fontSize: 14, fontWeight: '600', color: theme.colors.success },
    progressBar: {
        height: 8,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.success,
        borderRadius: 4,
    },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    monthCard: {
        width: '47%',
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    monthName: { fontSize: 13, color: theme.colors.textSecondary },
    monthAmount: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 4 },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    exportButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
