import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { sitesApi, Site } from '../../../../src/api';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#8B5CF6',
    }
};

export default function SitesListPage() {
    const router = useRouter();
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSites = useCallback(async () => {
        try {
            const response = await sitesApi.getAll({
                includeCounts: true,
                isClosed: false,
            });
            setSites(response.data || []);
        } catch (error) {
            console.error('Failed to fetch sites:', error);
            Alert.alert('Error', 'Failed to load sites');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchSites();
        }, [fetchSites])
    );

    const handleAddSite = () => {
        router.push('/(director)/space/sites/add' as any);
    };

    const handleOpenSite = (siteId: string) => {
        router.push(`/(director)/space/sites/${siteId}` as any);
    };

    const renderSiteCard = ({ item }: { item: Site }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleOpenSite(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.cardIcon}>
                <Ionicons name="business" size={24} color={theme.colors.accent} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.siteName}>{item.name}</Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.locationText}>
                        {item.city || item.address || 'No location set'}
                    </Text>
                </View>
            </View>
            <View style={styles.cardRight}>
                <View style={styles.statBadge}>
                    <Text style={styles.statValue}>{item.indentCount ?? 0}</Text>
                    <Text style={styles.statLabel}>indents</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Add Site Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddSite}>
                <Ionicons name="add-circle" size={22} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Site</Text>
            </TouchableOpacity>

            {/* Sites List */}
            <FlatList
                data={sites}
                keyExtractor={(item) => item.id}
                renderItem={renderSiteCard}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchSites();
                        }}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="business-outline" size={56} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyTitle}>No Sites Yet</Text>
                        <Text style={styles.emptySubtitle}>Add your first site to get started</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.accent,
        margin: 16,
        marginBottom: 8,
        padding: 14,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

    list: { padding: 16, paddingTop: 8 },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: theme.colors.accent + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardContent: { flex: 1 },
    siteName: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    locationText: { fontSize: 13, color: theme.colors.textSecondary },
    cardRight: { alignItems: 'flex-end', gap: 8 },
    statBadge: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
    statLabel: { fontSize: 10, color: theme.colors.textSecondary },

    empty: { padding: 48, alignItems: 'center' },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
});
