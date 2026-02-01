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
        error: '#EF4444',
    }
};

interface DamageSummary {
    materialName: string;
    siteName: string;
    damageName: string;
    reportedDate: string;
    status: 'Pending' | 'Reordered' | 'Resolved';
}

export default function DamageReport() {
    const [exporting, setExporting] = useState(false);

    // Mock data
    const damageStats = {
        totalDamages: 8,
        pendingReorders: 3,
        resolvedDamages: 5,
    };

    const damages: DamageSummary[] = [
        { materialName: 'Cement Bags', siteName: 'Site A', damageName: 'Water Damage', reportedDate: '2026-01-28', status: 'Pending' },
        { materialName: 'Steel Bars', siteName: 'Site B', damageName: 'Rust', reportedDate: '2026-01-25', status: 'Reordered' },
        { materialName: 'Electrical Wire', siteName: 'Site A', damageName: 'Cut/Torn', reportedDate: '2026-01-20', status: 'Resolved' },
        { materialName: 'Tiles', siteName: 'Site C', damageName: 'Broken', reportedDate: '2026-01-18', status: 'Resolved' },
    ];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return '#F59E0B';
            case 'Reordered': return theme.colors.primary;
            case 'Resolved': return '#10B981';
            default: return theme.colors.textSecondary;
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            Alert.alert('Success', 'Damage report exported to Downloads');
        } catch (error) {
            Alert.alert('Error', 'Failed to export');
        } finally {
            setExporting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Summary Stats */}
            <View style={styles.section}>
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { borderColor: theme.colors.error }]}>
                        <Text style={styles.statValue}>{damageStats.totalDamages}</Text>
                        <Text style={styles.statLabel}>Total Damages</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: '#F59E0B' }]}>
                        <Text style={styles.statValue}>{damageStats.pendingReorders}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: '#10B981', width: '100%' }]}>
                        <Text style={styles.statValue}>{damageStats.resolvedDamages}</Text>
                        <Text style={styles.statLabel}>Resolved</Text>
                    </View>
                </View>
            </View>

            {/* Damage List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Damages</Text>
                {damages.map((damage, index) => (
                    <View key={index} style={styles.damageCard}>
                        <View style={styles.damageIcon}>
                            <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                        </View>
                        <View style={styles.damageInfo}>
                            <Text style={styles.materialName}>{damage.materialName}</Text>
                            <Text style={styles.damageName}>{damage.damageName}</Text>
                            <Text style={styles.siteName}>{damage.siteName} • {formatDate(damage.reportedDate)}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(damage.status) + '15' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(damage.status) }]}>
                                {damage.status}
                            </Text>
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
    damageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.error + '30',
    },
    damageIcon: { marginRight: 12 },
    damageInfo: { flex: 1 },
    materialName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    damageName: { fontSize: 13, color: theme.colors.error, marginTop: 2 },
    siteName: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '600' },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.error,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    exportButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
