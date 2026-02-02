import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://indense.onrender.com/api/v1';

export default function ReceiptDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [receipt, setReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadReceipt();
    }, [id]);

    const loadReceipt = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/receipts/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) setReceipt(data.data);
        } catch (e) {
            console.warn('Failed to load receipt:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{receipt?.receiptNumber || 'Receipt'}</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Received Date</Text>
                    <Text style={styles.value}>
                        {receipt?.receivedDate ? new Date(receipt.receivedDate).toLocaleDateString() : 'N/A'}
                    </Text>

                    <Text style={[styles.label, { marginTop: 16 }]}>Indent</Text>
                    <Text style={styles.value}>{receipt?.indent?.indentNumber || 'N/A'}</Text>

                    {receipt?.remarks && (
                        <>
                            <Text style={[styles.label, { marginTop: 16 }]}>Remarks</Text>
                            <Text style={styles.value}>{receipt.remarks}</Text>
                        </>
                    )}
                </View>

                <Text style={styles.sectionTitle}>Items Received</Text>

                {receipt?.items?.map((item: any, index: number) => (
                    <View key={item.id || index} style={styles.itemCard}>
                        <Text style={styles.itemName}>{item.indentItem?.material?.name || 'Material'}</Text>
                        <Text style={styles.itemQty}>Qty: {item.receivedQty}</Text>
                    </View>
                ))}
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
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 },
    label: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    value: { fontSize: 16, color: '#111827', fontWeight: '500' },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
    itemCard: {
        backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, marginBottom: 8,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    itemName: { fontSize: 14, color: '#111827', flex: 1 },
    itemQty: { fontSize: 14, fontWeight: '600', color: '#10B981' },
});
