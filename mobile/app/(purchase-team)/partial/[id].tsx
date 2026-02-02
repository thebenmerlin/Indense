import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://indense.onrender.com/api/v1';

export default function PartialDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [indent, setIndent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => { loadIndent(); }, [id]);

    const loadIndent = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/indents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (response.ok) setIndent(data.data);
        } catch (e) { } finally { setLoading(false); }
    };

    if (loading) return <SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color="#8B5CF6" /></View></SafeAreaView>;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.backButton}>← Back</Text></TouchableOpacity>
                <Text style={styles.title}>{indent?.indentNumber}</Text>
                <View style={{ width: 50 }} />
            </View>
            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.name}>{indent?.name}</Text>
                    <View style={styles.badge}><Text style={styles.badgeText}>PARTIALLY RECEIVED</Text></View>
                </View>
                <Text style={styles.sectionTitle}>Items</Text>
                {indent?.items?.map((item: any) => (
                    <View key={item.id} style={styles.itemCard}>
                        <Text style={styles.itemName}>{item.material?.name}</Text>
                        <View style={styles.itemQtys}>
                            <Text style={styles.qty}>Req: {item.requestedQty}</Text>
                            <Text style={[styles.qty, { color: '#10B981' }]}>Recv: {item.receivedQty}</Text>
                            <Text style={[styles.qty, { color: '#F59E0B' }]}>Pend: {item.pendingQty}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 16 },
    backButton: { color: '#FFFFFF', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, padding: 16 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 },
    name: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
    badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start' },
    badgeText: { fontSize: 12, color: '#F59E0B', fontWeight: '600' },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
    itemCard: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, marginBottom: 8 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
    itemQtys: { flexDirection: 'row', justifyContent: 'space-between' },
    qty: { fontSize: 12, color: '#6B7280' },
});
