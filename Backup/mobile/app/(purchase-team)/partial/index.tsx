import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
        warning: '#F59E0B',
    }
};

export default function PartialOrders() {
    const [indents, setIndents] = useState<Indent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchIndents();
    }, []);

    const fetchIndents = async () => {
        try {
            // TODO: Fetch partially received orders
            // For now, fetching ordered indents as placeholder
            const response = await indentsApi.getAll({ status: 'PARTIALLY_RECEIVED', limit: 100 });
            // Filter to only show partial ones (when API supports it)
            setIndents(response.data);
        } catch (error) {
            console.error('Failed to fetch partial orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchIndents();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderIndent = ({ item }: { item: Indent }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(purchase-team)/partial/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.card}>
                <View style={styles.cardIcon}>
                    <Ionicons name="hourglass-outline" size={24} color={theme.colors.warning} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.indentName} numberOfLines={1}>
                        {item.name || item.indentNumber}
                    </Text>
                    <Text style={styles.siteName}>
                        <Ionicons name="location-outline" size={12} /> {item.site?.name}
                    </Text>
                    <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={styles.cardBadge}>
                    <Text style={styles.badgeText}>Partial</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={indents}
                keyExtractor={item => item.id}
                renderItem={renderIndent}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="checkmark-done-circle-outline" size={64} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No Partial Orders</Text>
                        <Text style={styles.emptySubtext}>All orders have been fully received</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.warning,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardIcon: { marginRight: 14 },
    cardContent: { flex: 1 },
    indentName: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
    siteName: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 2 },
    date: { fontSize: 12, color: theme.colors.textSecondary },
    cardBadge: {
        backgroundColor: theme.colors.warning + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    badgeText: { fontSize: 11, fontWeight: '600', color: theme.colors.warning },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
    emptySubtext: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
});
