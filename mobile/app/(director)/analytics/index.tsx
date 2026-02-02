import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Analytics() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.backButton}>← Back</Text></TouchableOpacity>
                <Text style={styles.title}>Analytics</Text>
                <View style={{ width: 50 }} />
            </View>
            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📊 Monthly Overview</Text>
                    <View style={styles.statRow}>
                        <View style={styles.stat}><Text style={styles.statValue}>156</Text><Text style={styles.statLabel}>Total Indents</Text></View>
                        <View style={styles.stat}><Text style={[styles.statValue, { color: '#10B981' }]}>₹24.5L</Text><Text style={styles.statLabel}>Total Value</Text></View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📦 By Status</Text>
                    <View style={styles.barRow}><Text style={styles.barLabel}>Approved</Text><View style={[styles.bar, { width: '80%', backgroundColor: '#10B981' }]} /></View>
                    <View style={styles.barRow}><Text style={styles.barLabel}>Pending</Text><View style={[styles.bar, { width: '20%', backgroundColor: '#F59E0B' }]} /></View>
                    <View style={styles.barRow}><Text style={styles.barLabel}>Rejected</Text><View style={[styles.bar, { width: '5%', backgroundColor: '#EF4444' }]} /></View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏗️ Top Sites</Text>
                    <View style={styles.listItem}><Text style={styles.listText}>Site Alpha</Text><Text style={styles.listValue}>45 indents</Text></View>
                    <View style={styles.listItem}><Text style={styles.listText}>Site Beta</Text><Text style={styles.listValue}>38 indents</Text></View>
                    <View style={styles.listItem}><Text style={styles.listText}>Site Gamma</Text><Text style={styles.listValue}>32 indents</Text></View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 16 },
    backButton: { color: '#FFFFFF', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    content: { flex: 1, padding: 16 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
    statRow: { flexDirection: 'row', justifyContent: 'space-around' },
    stat: { alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
    statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
    barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    barLabel: { width: 80, fontSize: 12, color: '#6B7280' },
    bar: { height: 12, borderRadius: 6 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    listText: { fontSize: 14, color: '#111827' },
    listValue: { fontSize: 14, color: '#6B7280' },
});
