import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList,
    ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://indense.onrender.com/api/v1';

const SEVERITY_COLORS: Record<string, string> = {
    MINOR: '#F59E0B',
    MODERATE: '#F97316',
    SEVERE: '#EF4444',
};

export default function Damages() {
    const [damages, setDamages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => { loadDamages(); }, []);

    const loadDamages = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/returns/damages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) setDamages(data.data || []);
        } catch (e) {
            console.warn('Failed to load damages:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => { setRefreshing(true); loadDamages(); };

    const renderDamage = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(site-engineer)/damages/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.damageName}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: SEVERITY_COLORS[item.severity] || '#6B7280' }]}>
                    <Text style={styles.badgeText}>{item.severity}</Text>
                </View>
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Damage Reports</Text>
                <View style={{ width: 50 }} />
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#3B82F6" /></View>
            ) : (
                <FlatList
                    data={damages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderDamage}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>⚠️</Text>
                            <Text style={styles.emptyText}>No damage reports</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 16,
    },
    backButton: { color: '#FFFFFF', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16 },
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    damageName: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
    description: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
    date: { fontSize: 12, color: '#9CA3AF' },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { fontSize: 16, color: '#6B7280' },
});
