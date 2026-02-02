import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function SelectOrderType() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.backButton}>← Back</Text></TouchableOpacity>
                <Text style={styles.title}>Create Order</Text>
                <View style={{ width: 50 }} />
            </View>
            <View style={styles.content}>
                <Text style={styles.subtitle}>Select approved indents to create an order</Text>
                <TouchableOpacity style={styles.card}>
                    <Text style={styles.cardIcon}>📋</Text>
                    <Text style={styles.cardTitle}>From Approved Indents</Text>
                    <Text style={styles.cardDesc}>Select materials from approved indents</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 16 },
    backButton: { color: '#FFFFFF', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    content: { flex: 1, padding: 20 },
    subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, alignItems: 'center' },
    cardIcon: { fontSize: 48, marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
    cardDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
