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
    }
};

export default function MaterialReport() {
    const [exporting, setExporting] = useState(false);

    // Mock data
    const materialsData = {
        totalMaterials: 156,
        uniqueCategories: 12,
        topMaterials: [
            { name: 'Portland Cement (50kg)', category: 'Cement', qty: 2500, unit: 'bags' },
            { name: 'TMT Steel Bar 12mm', category: 'Steel', qty: 1800, unit: 'kg' },
            { name: 'Red Bricks', category: 'Masonry', qty: 15000, unit: 'pcs' },
            { name: 'River Sand', category: 'Aggregate', qty: 500, unit: 'cft' },
            { name: 'Electrical Wire 2.5mm', category: 'Electrical', qty: 1000, unit: 'm' },
        ],
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            Alert.alert('Success', 'Material report exported to Downloads');
        } catch (error) {
            Alert.alert('Error', 'Failed to export report');
        } finally {
            setExporting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Summary */}
            <View style={styles.section}>
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryValue}>{materialsData.totalMaterials}</Text>
                        <Text style={styles.summaryLabel}>Total Materials</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryValue}>{materialsData.uniqueCategories}</Text>
                        <Text style={styles.summaryLabel}>Categories</Text>
                    </View>
                </View>
            </View>

            {/* Top Ordered Materials */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Most Ordered Materials</Text>
                {materialsData.topMaterials.map((material, index) => (
                    <View key={index} style={styles.materialCard}>
                        <View style={styles.rankBadge}>
                            <Text style={styles.rankText}>{index + 1}</Text>
                        </View>
                        <View style={styles.materialInfo}>
                            <Text style={styles.materialName}>{material.name}</Text>
                            <Text style={styles.materialCategory}>{material.category}</Text>
                        </View>
                        <View style={styles.qtyBox}>
                            <Text style={styles.qtyValue}>{material.qty.toLocaleString()}</Text>
                            <Text style={styles.qtyUnit}>{material.unit}</Text>
                        </View>
                    </View>
                ))}
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
    summaryGrid: { flexDirection: 'row', gap: 12 },
    summaryCard: {
        flex: 1,
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryValue: { fontSize: 28, fontWeight: '700', color: theme.colors.primary },
    summaryLabel: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
    materialCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
    materialInfo: { flex: 1 },
    materialName: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
    materialCategory: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    qtyBox: { alignItems: 'flex-end' },
    qtyValue: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
    qtyUnit: { fontSize: 11, color: theme.colors.textSecondary },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    exportButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
