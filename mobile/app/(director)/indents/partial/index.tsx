import React, { useState, useCallback } from 'react';
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
import { indentsApi } from '../../../../src/api/indents.api';
import { Indent } from '../../../../src/types';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        warning: '#F59E0B',
    }
};

export default function PartialOrdersList() {
    const [indents, setIndents] = useState<Indent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchIndents = useCallback(async () => {
        try {
            // Get indents with PARTIALLY_RECEIVED status
            const response = await indentsApi.getAll({
                status: 'PARTIALLY_RECEIVED',
                limit: 50,
            });
            // Sort by date, newest first
            const sortedData = [...response.data].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setIndents(sortedData);
        } catch (error) {
            console.error('Failed to fetch indents:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

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

    const calculateProgress = (indent: Indent) => {
        const items = indent.items || [];
        if (items.length === 0) return { received: 0, total: 0, percent: 0 };

        const arrivedItems = items.filter(i => i.arrivalStatus === 'ARRIVED').length;
        const percent = Math.round((arrivedItems / items.length) * 100);
        return { received: arrivedItems, total: items.length, percent };
    };

    const renderIndent = ({ item }: { item: Indent }) => {
        const siteName = item.site?.name || 'Unknown Site';
        const progress = calculateProgress(item);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/(director)/indents/${item.id}` as any)}
                activeOpacity={0.7}
            >
                <View style={styles.cardIcon}>
                    <Ionicons name="pie-chart" size={24} color={theme.colors.warning} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.indentName}>{item.name}</Text>
                    <Text style={styles.siteText}>{siteName}</Text>
                    <Text style={styles.metaText}>
                        {progress.received}/{progress.total} items received • {formatDate(item.updatedAt || item.createdAt)}
                    </Text>
                </View>
                <View style={styles.progressBadge}>
                    <Text style={styles.progressText}>{progress.percent}%</Text>
                </View>
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
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/damaged' as any)}>
                    <Text style={styles.navTabText}>Damaged</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navTab, styles.navTabActive]}>
                    <Text style={[styles.navTabText, styles.navTabTextActive]}>Partial</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={indents}
                keyExtractor={item => item.id}
                renderItem={renderIndent}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="checkmark-circle-outline" size={56} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No partial orders</Text>
                        <Text style={styles.emptySubtext}>All orders received in full</Text>
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
        backgroundColor: theme.colors.warning + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: { flex: 1 },
    indentName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    siteText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    metaText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
    progressBadge: {
        backgroundColor: theme.colors.warning + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    progressText: { fontSize: 12, fontWeight: '600', color: theme.colors.warning },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
    emptySubtext: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
});
