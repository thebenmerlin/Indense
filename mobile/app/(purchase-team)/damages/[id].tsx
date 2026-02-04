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
import { damagesApi } from '../../../src/api';
import { DamageReport } from '../../../src/types';

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
        warning: '#F59E0B',
    }
};

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'SEVERE': return theme.colors.error;
        case 'MODERATE': return theme.colors.warning;
        case 'MINOR': return theme.colors.textSecondary;
        default: return theme.colors.textSecondary;
    }
};

export default function DamageDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [damage, setDamage] = useState<DamageReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [reordering, setReordering] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [expectedDate, setExpectedDate] = useState(new Date());
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchDamage();
    }, [id]);

    const fetchDamage = async () => {
        try {
            const data = await damagesApi.getById(id!);
            setDamage(data);
            // If already reordered, disable the reorder button
        } catch (error) {
            console.error('Failed to fetch damage:', error);
            Alert.alert('Error', 'Failed to load damage report');
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
            await damagesApi.reorder(id!, expectedDate.toISOString());
            setDamage(prev => prev ? { ...prev, isReordered: true, reorderExpectedDate: expectedDate.toISOString() } : null);
            Alert.alert('Success', 'Reorder placed successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to place reorder');
        } finally {
            setReordering(false);
            setShowDatePicker(false);
        }
    };

    const openImageModal = (imagePath: string) => {
        // Convert path to full URL if needed
        const imageUrl = imagePath.startsWith('http') ? imagePath : `https://your-server.com/${imagePath}`;
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!damage) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Damage report not found</Text>
            </View>
        );
    }

    const severityColor = getSeverityColor(damage.severity);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header Info */}
                <View style={[styles.header, { borderLeftColor: severityColor }]}>
                    <View style={styles.headerTop}>
                        <Text style={styles.materialName}>
                            {damage.indentItem?.material?.name || damage.name}
                        </Text>
                        <View style={[styles.severityBadge, { backgroundColor: severityColor + '20' }]}>
                            <Text style={[styles.severityText, { color: severityColor }]}>
                                {damage.severity}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.indentNumber}>{damage.indent?.indentNumber}</Text>
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{damage.site?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>Reported by: {damage.reportedBy?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>Reported: {formatDate(damage.createdAt)}</Text>
                    </View>
                    {damage.damagedQty && (
                        <View style={styles.infoRow}>
                            <Ionicons name="cube-outline" size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.infoText}>Damaged Qty: {damage.damagedQty}</Text>
                        </View>
                    )}
                </View>

                {/* Status Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status</Text>
                    <View style={styles.statusCard}>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Current Status</Text>
                            <View style={[styles.statusBadge, damage.isReordered && styles.reorderedBadge]}>
                                <Text style={[styles.statusBadgeText, damage.isReordered && styles.reorderedText]}>
                                    {damage.isReordered ? 'REORDERED' : damage.status}
                                </Text>
                            </View>
                        </View>
                        {damage.isReordered && damage.reorderExpectedDate && (
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Expected Delivery</Text>
                                <Text style={styles.statusValue}>{formatDate(damage.reorderExpectedDate)}</Text>
                            </View>
                        )}
                        {damage.reorderedBy && (
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Reordered By</Text>
                                <Text style={styles.statusValue}>{damage.reorderedBy.name}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <View style={styles.descriptionCard}>
                        <Text style={styles.descriptionText}>{damage.description}</Text>
                    </View>
                </View>

                {/* Photos */}
                {damage.images && damage.images.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Photos ({damage.images.length})</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                            {damage.images.map((image) => (
                                <TouchableOpacity
                                    key={image.id}
                                    onPress={() => openImageModal(image.path)}
                                >
                                    <Image
                                        source={{ uri: image.path }}
                                        style={styles.imageThumbnail}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Reorder Button - only show if not already reordered or resolved */}
            {!damage.isReordered && !damage.isResolved && (
                <View style={styles.bottomButtons}>
                    <TouchableOpacity
                        style={styles.reorderButton}
                        onPress={() => setShowDatePicker(true)}
                        disabled={reordering}
                    >
                        {reordering ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                                <Text style={styles.reorderButtonText}>Reorder Material</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Already reordered indicator */}
            {damage.isReordered && (
                <View style={styles.bottomButtons}>
                    <View style={[styles.reorderButton, styles.reorderedButton]}>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.reorderButtonText}>
                            Reordered - Expected: {formatDate(damage.reorderExpectedDate)}
                        </Text>
                    </View>
                </View>
            )}

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

            {/* Image Preview Modal */}
            <Modal visible={showImageModal} transparent animationType="fade">
                <View style={styles.imageModalOverlay}>
                    <TouchableOpacity
                        style={styles.imageModalClose}
                        onPress={() => setShowImageModal(false)}
                    >
                        <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
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
    header: {
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        marginBottom: 8,
        borderLeftWidth: 4,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    materialName: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, flex: 1 },
    severityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    severityText: { fontSize: 11, fontWeight: '700' },
    indentNumber: { fontSize: 13, color: theme.colors.textSecondary, fontFamily: 'monospace', marginTop: 4, marginBottom: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    infoText: { fontSize: 14, color: theme.colors.textSecondary },
    section: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12 },
    statusCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    statusLabel: { fontSize: 14, color: theme.colors.textSecondary },
    statusValue: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
    statusBadge: {
        backgroundColor: theme.colors.warning + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: { fontSize: 11, fontWeight: '700', color: theme.colors.warning },
    reorderedBadge: { backgroundColor: theme.colors.primary + '20' },
    reorderedText: { color: theme.colors.primary },
    descriptionCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
    },
    descriptionText: { fontSize: 14, color: theme.colors.textPrimary, lineHeight: 22 },
    imagesScroll: { marginTop: 8 },
    imageThumbnail: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 12,
    },
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
    reorderButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
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
    imageModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageModalClose: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
});
