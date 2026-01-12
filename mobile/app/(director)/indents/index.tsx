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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { indentsApi } from '../../../src/api';
import { Indent } from '../../../src/types';
import { IndentStatus, STATUS_LABELS, STATUS_COLORS } from '../../../src/constants';

const theme = {
    colors: {
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        primary: '#1E3A8A',
    }
};

export default function DirectorIndentsList() {
    const { status } = useLocalSearchParams<{ status?: string }>();
    const [indents, setIndents] = useState<Indent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchIndents = async () => {
        try {
            const response = await indentsApi.getAll({
                limit: 50,
                status: status as IndentStatus | undefined,
            });
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
    }, [status]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchIndents();
    };

    const StatusBadge = ({ indentStatus }: { indentStatus: IndentStatus }) => {
        const bgColor = STATUS_COLORS[indentStatus] + '20';
        const textColor = STATUS_COLORS[indentStatus];
        return (
            <View style={[styles.badge, { backgroundColor: bgColor }]}>
                <Text style={[styles.badgeText, { color: textColor }]}>
                    {STATUS_LABELS[indentStatus]}
                </Text>
            </View>
        );
    };

    const renderIndent = ({ item }: { item: Indent }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(director)/indents/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.indentNumber}>{item.indentNumber}</Text>
                    <StatusBadge indentStatus={item.status} />
                </View>
                <Text style={styles.siteName}>{item.site?.name}</Text>
                <Text style={styles.itemCount}>
                    {item.items?.length || 0} items • {item.createdBy?.name}
                </Text>
                <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString()}
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
            {status && (
                <View style={styles.filterBar}>
                    <Text style={styles.filterText}>Showing: {STATUS_LABELS[status as IndentStatus]}</Text>
                </View>
            )}
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
    filterBar: {
        backgroundColor: theme.colors.cardBg,
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    filterText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
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
    siteName: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    itemCount: {
        fontSize: 13,
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
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
});
