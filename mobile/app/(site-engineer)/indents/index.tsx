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
import { indentsApi } from '../../../src/api';
import { Indent } from '../../../src/types';
import { IndentStatus, STATUS_LABELS, STATUS_COLORS } from '../../../src/constants';

const theme = {
    colors: {
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        primary: '#3B82F6',
    }
};

export default function IndentsList() {
    const [indents, setIndents] = useState<Indent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchIndents = async () => {
        try {
            const response = await indentsApi.getAll({ limit: 50 });
            setIndents(response.data);
        } catch (error) {
            console.error('Failed to fetch indents:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchIndents();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchIndents();
    };

    const StatusBadge = ({ status }: { status: IndentStatus }) => {
        const bgColor = STATUS_COLORS[status] + '20';
        const textColor = STATUS_COLORS[status];
        return (
            <View style={[styles.badge, { backgroundColor: bgColor }]}>
                <Text style={[styles.badgeText, { color: textColor }]}>
                    {STATUS_LABELS[status]}
                </Text>
            </View>
        );
    };

    const renderIndent = ({ item }: { item: Indent }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(site-engineer)/indents/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.indentNumber}>{item.indentNumber}</Text>
                    <StatusBadge status={item.status} />
                </View>
                <Text style={styles.itemCount}>
                    {item.items?.length || 0} items
                </Text>
                <Text style={styles.date}>
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
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
                keyExtractor={(item) => item.id}
                renderItem={renderIndent}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No indents found</Text>
                        <Text style={styles.emptySubtext}>Create your first indent to get started</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    indentNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    itemCount: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    empty: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
});
