import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://indense.onrender.com/api/v1';

export default function DamageDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [damage, setDamage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => { loadDamage(); }, [id]);

    const loadDamage = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/returns/damages/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) setDamage(data.data);
        } catch (e) {
            console.warn('Failed:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color="#3B82F6" /></View></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Damage Report</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.name}>{damage?.name}</Text>
                    <View style={[styles.badge, { backgroundColor: damage?.severity === 'SEVERE' ? '#EF4444' : '#F59E0B' }]}>
                        <Text style={styles.badgeText}>{damage?.severity}</Text>
                    </View>

                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.value}>{damage?.description || 'No description'}</Text>

                    {damage?.damagedQty && (
                        <>
                            <Text style={[styles.label, { marginTop: 16 }]}>Damaged Quantity</Text>
                            <Text style={styles.value}>{damage.damagedQty}</Text>
                        </>
                    )}

                    <Text style={[styles.label, { marginTop: 16 }]}>Status</Text>
                    <Text style={styles.value}>{damage?.isResolved ? '✅ Resolved' : '⏳ Pending'}</Text>

                    <Text style={[styles.label, { marginTop: 16 }]}>Reported</Text>
                    <Text style={styles.value}>{damage?.createdAt ? new Date(damage.createdAt).toLocaleDateString() : 'N/A'}</Text>
                </View>
            </ScrollView>
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
    content: { flex: 1, padding: 16 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 },
    name: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 16 },
    badgeText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
    label: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    value: { fontSize: 16, color: '#111827' },
});
