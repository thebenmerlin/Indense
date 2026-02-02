import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://indense.onrender.com/api/v1';

export default function Damages() {
    const [damages, setDamages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => { loadDamages(); }, []);

    const loadDamages = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/returns/damages`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (response.ok) setDamages(data.data || []);
        } catch (e) { } finally { setLoading(false); setRefreshing(false); }
    };

    const renderDamage = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/(purchase-team)/damages/${item.id}`)}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={[styles.badge, { backgroundColor: item.severity === 'SEVERE' ? '#FEE2E2' : '#FEF3C7' }]}>
                <Text style={[styles.badgeText, { color: item.severity === 'SEVERE' ? '#EF4444' : '#F59E0B' }]}>{item.severity}</Text>
            </View>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.backButton}>← Back</Text></TouchableOpacity>
                <Text style={styles.title}>Damages</Text>
                <View style={{ width: 50 }} />
            </View>
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#8B5CF6" /></View>
            ) : (
                <FlatList
                    data={damages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderDamage}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDamages(); }} />}
                    ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>⚠️</Text><Text style={styles.emptyText}>No damages</Text></View>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 16 },
    backButton: { color: '#FFFFFF', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
    name: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8 },
    badgeText: { fontSize: 10, fontWeight: '600' },
    desc: { fontSize: 14, color: '#6B7280' },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { fontSize: 16, color: '#6B7280' },
});
