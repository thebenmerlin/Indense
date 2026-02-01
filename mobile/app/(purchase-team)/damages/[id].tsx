import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { indentsApi } from '../../../src/api';
import { Indent, IndentItem } from '../../../src/types';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
        error: '#EF4444',
    }
};

interface DamageReport {
    materialId: string;
    materialName: string;
    name: string;
    description: string;
    imageUri?: string;
}

export default function DamageDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [reordering, setReordering] = useState(false);
    const [isReordered, setIsReordered] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [expectedDate, setExpectedDate] = useState(new Date());
    const [showDamageModal, setShowDamageModal] = useState(false);
    const [selectedDamage, setSelectedDamage] = useState<DamageReport | null>(null);

    // Mock damaged materials for demo
    const [damages] = useState<DamageReport[]>([
        {
            materialId: '1',
            materialName: 'Cement Bags',
            name: 'Water Damage',
            description: '50 bags damaged due to water leak during transit',
            imageUri: undefined,
        },
    ]);

    useEffect(() => {
        if (id) fetchIndent();
    }, [id]);

    const fetchIndent = async () => {
        try {
            const data = await indentsApi.getById(id!);
            setIndent(data);
        } catch (error) {
            console.error('Failed to fetch indent:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string | null | undefined | Date) => {
        if (!dateStr) return '-';
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleReorder = async () => {
        setReordering(true);
        try {
            // TODO: API call to reorder with expected date
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsReordered(true);
            Alert.alert('Success', 'Reorder placed successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to place reorder');
        } finally {
            setReordering(false);
            setShowDatePicker(false);
        }
    };

    const openDamageDetail = (damage: DamageReport) => {
        setSelectedDamage(damage);
        setShowDamageModal(true);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!indent) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Indent not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header Info */}
                <View style={styles.header}>
                    <Text style={styles.indentName}>{indent.name || indent.indentNumber}</Text>
                    <Text style={styles.indentNumber}>{indent.indentNumber}</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{indent.site?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{indent.createdBy?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>Created: {formatDate(indent.createdAt)}</Text>
                    </View>
                </View>

                {/* Damaged Materials List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Damaged Materials</Text>
                    {damages.map((damage) => (
                        <TouchableOpacity
                            key={damage.materialId}
                            style={styles.damageCard}
                            onPress={() => openDamageDetail(damage)}
                        >
                            <View style={styles.damageIcon}>
                                <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                            </View>
                            <View style={styles.damageInfo}>
                                <Text style={styles.damageMaterial}>{damage.materialName}</Text>
                                <Text style={styles.damageName}>{damage.name}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    ))}

                    {damages.length === 0 && (
                        <Text style={styles.noItems}>No damaged materials reported</Text>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Reorder Button */}
            <View style={styles.bottomButtons}>
                <TouchableOpacity
                    style={[styles.reorderButton, isReordered && styles.reorderedButton]}
                    onPress={() => setShowDatePicker(true)}
                    disabled={reordering || isReordered}
                >
                    {reordering ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Ionicons
                                name={isReordered ? "checkmark-circle" : "refresh"}
                                size={20}
                                color="#FFFFFF"
                            />
                            <Text style={styles.reorderButtonText}>
                                {isReordered ? 'Reordered' : 'Reorder'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Date Picker Modal */}
            <Modal visible={showDatePicker} transparent animationType="fade">
                <View style={styles.dateModalOverlay}>
                    <View style={styles.dateModalContent}>
                        <Text style={styles.dateModalTitle}>Expected Delivery Date</Text>
                        <DateTimePicker
                            value={expectedDate}
                            mode="date"
                            display="spinner"
                            onChange={(_, date) => date && setExpectedDate(date)}
                            minimumDate={new Date()}
                        />
                        <View style={styles.dateModalButtons}>
                            <TouchableOpacity
                                style={styles.dateModalCancel}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={styles.dateModalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dateModalConfirm}
                                onPress={handleReorder}
                            >
                                <Text style={styles.dateModalConfirmText}>Reorder</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Damage Detail Modal */}
            <Modal visible={showDamageModal} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Damage Details</Text>
                        <TouchableOpacity onPress={() => setShowDamageModal(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    {selectedDamage && (
                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.detailLabel}>Material</Text>
                            <Text style={styles.detailValue}>{selectedDamage.materialName}</Text>

                            <Text style={styles.detailLabel}>Damage Name</Text>
                            <Text style={styles.detailValue}>{selectedDamage.name}</Text>

                            <Text style={styles.detailLabel}>Description</Text>
                            <Text style={styles.detailValue}>{selectedDamage.description}</Text>

                            {selectedDamage.imageUri && (
                                <>
                                    <Text style={styles.detailLabel}>Photo</Text>
                                    <Image
                                        source={{ uri: selectedDamage.imageUri }}
                                        style={styles.damagePhoto}
                                    />
                                </>
                            )}
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    scrollView: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: theme.colors.textSecondary },
    header: { backgroundColor: theme.colors.cardBg, padding: 16, marginBottom: 8 },
    indentName: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary },
    indentNumber: { fontSize: 13, color: theme.colors.textSecondary, fontFamily: 'monospace', marginTop: 2, marginBottom: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    infoText: { fontSize: 14, color: theme.colors.textSecondary },
    section: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12 },
    damageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.error + '30',
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.error,
    },
    damageIcon: { marginRight: 12 },
    damageInfo: { flex: 1 },
    damageMaterial: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    damageName: { fontSize: 13, color: theme.colors.error, marginTop: 2 },
    noItems: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', padding: 24 },
    bottomButtons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    reorderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.error,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    reorderedButton: { backgroundColor: theme.colors.success },
    reorderButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
    dateModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateModalContent: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 16,
        padding: 20,
        width: '85%',
    },
    dateModalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 16 },
    dateModalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
    dateModalCancel: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    dateModalCancelText: { fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary },
    dateModalConfirm: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: theme.colors.error,
        alignItems: 'center',
    },
    dateModalConfirmText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
    modalContainer: { flex: 1, backgroundColor: theme.colors.surface },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    modalContent: { flex: 1, padding: 16 },
    detailLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 12 },
    detailValue: { fontSize: 16, fontWeight: '500', color: theme.colors.textPrimary, marginTop: 4 },
    damagePhoto: { width: '100%', height: 200, borderRadius: 10, marginTop: 8 },
});
