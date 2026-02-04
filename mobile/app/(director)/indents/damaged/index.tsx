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
import { damagesApi } from '../../../../src/api/indents.api';
import { DamageReport } from '../../../../src/types';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        error: '#EF4444',
    }
};

export default function DamagedOrdersList() {
    const [reports, setReports] = useState<DamageReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchReports = useCallback(async () => {
        try {
            const response = await damagesApi.getAll({ limit: 50 });
            // Sort by date, newest first
            const sortedData = [...response.data].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setReports(sortedData);
        } catch (error) {
            console.error('Failed to fetch damage reports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchReports();
        }, [fetchReports])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchReports();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'SEVERE': return theme.colors.error;
            case 'MODERATE': return '#F59E0B';
            default: return theme.colors.textSecondary;
        }
    };

    const renderReport = ({ item }: { item: DamageReport }) => {
        const indentName = item.indent?.name || 'Unknown Indent';
        const siteName = item.indent?.site?.name || 'Unknown Site';
        const hasImages = (item.images?.length || 0) > 0;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/(director)/indents/${item.indentId}` as any)}
                activeOpacity={0.7}
            >
                <View style={styles.cardIcon}>
                    <Ionicons name="alert-circle" size={24} color={getSeverityColor(item.severity || 'MINOR')} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.indentName}>{item.name}</Text>
                    <Text style={styles.siteText}>{siteName}</Text>
                    <Text style={styles.metaText}>
                        {item.severity || 'MINOR'} • {formatDate(item.createdAt)}
                    </Text>
                </View>
                {hasImages && (
                    <View style={styles.imageBadge}>
                        <Ionicons name="images" size={16} color={theme.colors.primary} />
                    </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
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
            {/* Navigation Tabs */}
            <View style={styles.navTabs}>
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/pending' as any)}>
                    <Text style={styles.navTabText}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/all' as any)}>
                    <Text style={styles.navTabText}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navTab, styles.navTabActive]}>
                    <Text style={[styles.navTabText, styles.navTabTextActive]}>Damaged</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/partial' as any)}>
                    <Text style={styles.navTabText}>Partial</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={reports}
                keyExtractor={item => item.id}
                renderItem={renderReport}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="checkmark-circle-outline" size={56} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No damaged orders</Text>
                        <Text style={styles.emptySubtext}>All materials received in good condition</Text>
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
    list: { padding: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
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
    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.error + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: { flex: 1 },
    indentName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    siteText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    metaText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
    imageBadge: {
        backgroundColor: theme.colors.primary + '15',
        padding: 6,
        borderRadius: 6,
        marginRight: 8,
    },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
    emptySubtext: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
});
