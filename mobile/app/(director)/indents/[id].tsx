import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://indense.onrender.com/api/v1';

export default function IndentDetail() {
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

    if (loading) return <SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View></SafeAreaView>;

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
                    <Text style={styles.meta}>Status: {indent?.status}</Text>
                    <Text style={styles.meta}>Site: {indent?.site?.name}</Text>
                    <Text style={styles.meta}>Requester: {indent?.createdBy?.name}</Text>
                </View>
                <Text style={styles.sectionTitle}>Materials ({indent?.items?.length || 0})</Text>
                {indent?.items?.map((item: any) => (
                    <View key={item.id} style={styles.itemCard}>
                        <Text style={styles.itemName}>{item.material?.name}</Text>
                        <Text style={styles.itemQty}>Qty: {item.requestedQty}</Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 16 },
    backButton: { color: '#FFFFFF', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, padding: 16 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 },
    name: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
    meta: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
    itemCard: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
    itemName: { fontSize: 14, color: '#111827', flex: 1 },
    itemQty: { fontSize: 14, fontWeight: '600', color: '#059669' },
});
