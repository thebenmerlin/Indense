import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    TextInput,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { indentsApi } from '../../../src/api';
import { Indent } from '../../../src/types';

const theme = {
    colors: {
        primary: '#3B82F6',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
    }
};

interface Receipt {
    id: string;
    name: string;
    imageUri: string;
    createdAt: Date;
}

export default function ReceiptDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [showAddReceipt, setShowAddReceipt] = useState(false);
    const [newReceiptName, setNewReceiptName] = useState('');
    const [newReceiptImage, setNewReceiptImage] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchIndent();
        }
    }, [id]);

    const fetchIndent = async () => {
        try {
            const data = await indentsApi.getById(id!);
            setIndent(data);
            // TODO: Fetch existing receipts from API
        } catch (error) {
            console.error('Failed to fetch indent:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string | Date) => {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const requestPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
            Alert.alert(
                'Permissions Required',
                'Please grant camera and photo library permissions to upload receipts.'
            );
            return false;
        }
        return true;
    };

    const handleTakePhoto = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
            setNewReceiptImage(result.assets[0].uri);
        }
    };

    const handlePickFromGallery = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
            setNewReceiptImage(result.assets[0].uri);
        }
    };

    const handleSaveReceipt = () => {
        if (!newReceiptName.trim()) {
            Alert.alert('Required', 'Please enter a receipt name');
            return;
        }
        if (!newReceiptImage) {
            Alert.alert('Required', 'Please take or select a photo');
            return;
        }

        const newReceipt: Receipt = {
            id: `temp-${Date.now()}`,
            name: newReceiptName.trim(),
            imageUri: newReceiptImage,
            createdAt: new Date(),
        };

        setReceipts([...receipts, newReceipt]);
        setNewReceiptName('');
        setNewReceiptImage(null);
        setShowAddReceipt(false);

        // TODO: Upload to API
        Alert.alert('Success', 'Receipt added successfully');
    };

    const handleSaveAllReceipts = async () => {
        if (receipts.length === 0) {
            Alert.alert('No Receipts', 'Please add at least one receipt');
            return;
        }

        setSaving(true);
        try {
            // TODO: Upload all receipts to API
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert('Success', 'All receipts saved successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to save receipts');
        } finally {
            setSaving(false);
        }
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
        <ScrollView style={styles.container}>
            {/* Indent Info */}
            <View style={styles.header}>
                <Text style={styles.indentName}>{indent.name || indent.indentNumber}</Text>
                <Text style={styles.indentNumber}>{indent.indentNumber}</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.infoText}>{indent.site?.name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.infoText}>{formatDate(indent.createdAt)}</Text>
                </View>
            </View>

            {/* View Receipts */}
            {receipts.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>View Receipts</Text>
                    {receipts.map(receipt => (
                        <View key={receipt.id} style={styles.receiptCard}>
                            <Image
                                source={{ uri: receipt.imageUri }}
                                style={styles.receiptImage}
                                resizeMode="cover"
                            />
                            <View style={styles.receiptInfo}>
                                <Text style={styles.receiptName}>{receipt.name}</Text>
                                <Text style={styles.receiptDate}>{formatDate(receipt.createdAt)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Add Receipt Form */}
            {showAddReceipt && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>New Receipt</Text>
                    <View style={styles.addReceiptCard}>
                        <TextInput
                            style={styles.receiptNameInput}
                            placeholder="Receipt name (e.g., Invoice #123)"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={newReceiptName}
                            onChangeText={setNewReceiptName}
                        />

                        {newReceiptImage ? (
                            <View style={styles.previewContainer}>
                                <Image
                                    source={{ uri: newReceiptImage }}
                                    style={styles.previewImage}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setNewReceiptImage(null)}
                                >
                                    <Ionicons name="close-circle" size={28} color={theme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.uploadOptions}>
                                <TouchableOpacity style={styles.uploadButton} onPress={handleTakePhoto}>
                                    <Ionicons name="camera" size={24} color={theme.colors.primary} />
                                    <Text style={styles.uploadButtonText}>Take Photo</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.uploadButton} onPress={handlePickFromGallery}>
                                    <Ionicons name="images" size={24} color={theme.colors.primary} />
                                    <Text style={styles.uploadButtonText}>Your Photos</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.addReceiptButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setShowAddReceipt(false);
                                    setNewReceiptName('');
                                    setNewReceiptImage(null);
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveReceiptButton}
                                onPress={handleSaveReceipt}
                            >
                                <Text style={styles.saveReceiptButtonText}>Add Receipt</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Add Receipts Button */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.addReceiptMainButton}
                    onPress={() => setShowAddReceipt(true)}
                >
                    <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
                    <Text style={styles.addReceiptMainButtonText}>Add Receipt(s)</Text>
                </TouchableOpacity>
            </View>

            {/* Save All Button */}
            {receipts.length > 0 && (
                <TouchableOpacity
                    style={styles.saveAllButton}
                    onPress={handleSaveAllReceipts}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Ionicons name="save" size={20} color="#FFFFFF" />
                            <Text style={styles.saveAllButtonText}>Save All Receipts</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    header: {
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        marginBottom: 8,
    },
    indentName: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    indentNumber: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontFamily: 'monospace',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    receiptCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    receiptImage: {
        width: 80,
        height: 80,
    },
    receiptInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    receiptName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    receiptDate: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    addReceiptCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    receiptNameInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
    },
    uploadOptions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    uploadButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
    },
    uploadButtonText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
    },
    previewContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
    },
    addReceiptButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    saveReceiptButton: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    saveReceiptButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    addReceiptMainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        gap: 8,
    },
    addReceiptMainButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    saveAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success,
        marginHorizontal: 16,
        borderRadius: 12,
        paddingVertical: 16,
        gap: 8,
    },
    saveAllButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
