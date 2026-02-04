import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal,
    Image,
    FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { indentsApi, damagesApi } from '../../../src/api';
import { Indent, IndentItem, DamageReport, DamageImage } from '../../../src/types';

const theme = {
    colors: {
        primary: '#3B82F6',
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

interface LocalDamageImage {
    id: string;
    uri: string;
    isUploaded: boolean;
}

export default function DamageDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [damageReport, setDamageReport] = useState<DamageReport | null>(null);
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<'MINOR' | 'MODERATE' | 'SEVERE'>('MODERATE');
    const [damageImages, setDamageImages] = useState<LocalDamageImage[]>([]);

    // Add damage image modal state
    const [showImagePicker, setShowImagePicker] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDamageReport();
        }
    }, [id]);

    const fetchDamageReport = async () => {
        try {
            const report = await damagesApi.getById(id!);
            setDamageReport(report);
            setDescription(report.description || '');
            setSeverity(report.severity || 'MODERATE');
            
            // Convert existing images to local format
            const existingImages: LocalDamageImage[] = (report.images || []).map((img: DamageImage) => ({
                id: img.id,
                uri: img.path,
                isUploaded: true,
            }));
            setDamageImages(existingImages);
            
            // Fetch the associated indent
            if (report.indentId) {
                const indentData = await indentsApi.getById(report.indentId);
                setIndent(indentData);
            }
        } catch (error) {
            console.error('Failed to fetch damage report:', error);
            Alert.alert('Error', 'Failed to load damage report');
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

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant photo library access');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadDamageImage(result.assets[0].uri);
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera access');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadDamageImage(result.assets[0].uri);
        }
    };

    const uploadDamageImage = async (uri: string) => {
        try {
            const fileName = `damage_${Date.now()}.jpg`;
            await damagesApi.uploadImage(id!, uri, fileName);
            
            // Add to local state
            const newImage: LocalDamageImage = {
                id: `local-${Date.now()}`,
                uri,
                isUploaded: true,
            };
            setDamageImages([...damageImages, newImage]);
            
            // Refresh to get actual image from server
            await fetchDamageReport();
        } catch (error) {
            console.error('Failed to upload image:', error);
            Alert.alert('Error', 'Failed to upload image');
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        Alert.alert(
            'Delete Image',
            'Are you sure you want to delete this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await damagesApi.deleteImage(id!, imageId);
                            setDamageImages(damageImages.filter(img => img.id !== imageId));
                        } catch (error) {
                            console.error('Failed to delete image:', error);
                            Alert.alert('Error', 'Failed to delete image');
                        }
                    },
                },
            ]
        );
    };

    const handleUpdateDamageReport = async () => {
        setSaving(true);
        try {
            await damagesApi.update(id!, {
                description: description.trim(),
                severity,
            });
            Alert.alert('Saved', 'Damage report updated');
        } catch (error) {
            console.error('Failed to update:', error);
            Alert.alert('Error', 'Failed to update damage report');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitDamageReport = async () => {
        if (!description.trim()) {
            Alert.alert('Required', 'Please enter a description of the damage');
            return;
        }
        if (damageImages.length === 0) {
            Alert.alert('Required', 'Please add at least one image of the damage');
            return;
        }

        Alert.alert(
            'Submit Damage Report',
            'Once submitted, you cannot edit this report. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit',
                    style: 'destructive',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            await damagesApi.submit(id!);
                            Alert.alert(
                                'Submitted',
                                'Damage report has been submitted successfully',
                                [{ text: 'OK', onPress: () => router.back() }]
                            );
                        } catch (error) {
                            console.error('Failed to submit:', error);
                            Alert.alert('Error', 'Failed to submit damage report');
                        } finally {
                            setSaving(false);
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteDamageReport = async () => {
        Alert.alert(
            'Delete Report',
            'Are you sure you want to delete this damage report?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await damagesApi.delete(id!);
                            router.back();
                        } catch (error) {
                            console.error('Failed to delete:', error);
                            Alert.alert('Error', 'Failed to delete damage report');
                        }
                    },
                },
            ]
        );
    };

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'MINOR': return theme.colors.success;
            case 'MODERATE': return theme.colors.warning;
            case 'SEVERE': return theme.colors.error;
            default: return theme.colors.textSecondary;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!damageReport) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Damage report not found</Text>
            </View>
        );
    }

    const isSubmitted = damageReport.status !== 'DRAFT';

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Indent Info */}
                {indent && (
                    <View style={styles.header}>
                        <Text style={styles.indentName}>{indent.name || indent.indentNumber}</Text>
                        <Text style={styles.indentNumber}>{indent.indentNumber}</Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.infoText}>{indent.site?.name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.infoText}>{formatDate(damageReport.createdAt)}</Text>
                        </View>
                        <View style={styles.statusRow}>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: isSubmitted ? theme.colors.error + '20' : theme.colors.warning + '20' }
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    { color: isSubmitted ? theme.colors.error : theme.colors.warning }
                                ]}>
                                    {isSubmitted ? 'Submitted' : 'Draft'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Severity Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Severity Level</Text>
                    <View style={styles.severityOptions}>
                        {(['MINOR', 'MODERATE', 'SEVERE'] as const).map(level => (
                            <TouchableOpacity
                                key={level}
                                style={[
                                    styles.severityOption,
                                    severity === level && { borderColor: getSeverityColor(level), backgroundColor: getSeverityColor(level) + '15' },
                                ]}
                                onPress={() => !isSubmitted && setSeverity(level)}
                                disabled={isSubmitted}
                            >
                                <Text style={[
                                    styles.severityOptionText,
                                    severity === level && { color: getSeverityColor(level), fontWeight: '700' }
                                ]}>
                                    {level}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description *</Text>
                    <TextInput
                        style={[styles.textArea, isSubmitted && styles.inputDisabled]}
                        placeholder="Describe the damage in detail..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        editable={!isSubmitted}
                    />
                </View>

                {/* Damage Images */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Damage Photos</Text>
                    
                    {damageImages.length > 0 && (
                        <View style={styles.imageGrid}>
                            {damageImages.map(image => (
                                <View key={image.id} style={styles.imageContainer}>
                                    <Image source={{ uri: image.uri }} style={styles.damageImage} />
                                    {!isSubmitted && (
                                        <TouchableOpacity
                                            style={styles.deleteImageButton}
                                            onPress={() => handleDeleteImage(image.id)}
                                        >
                                            <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {!isSubmitted && (
                        <View style={styles.uploadOptions}>
                            <TouchableOpacity style={styles.uploadOption} onPress={handleTakePhoto}>
                                <Ionicons name="camera" size={24} color={theme.colors.primary} />
                                <Text style={styles.uploadOptionText}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.uploadOption} onPress={handlePickImage}>
                                <Ionicons name="images" size={24} color={theme.colors.primary} />
                                <Text style={styles.uploadOptionText}>Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Delete Button for Draft */}
                {!isSubmitted && (
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDeleteDamageReport}
                        >
                            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                            <Text style={styles.deleteButtonText}>Delete Draft</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Buttons */}
            {!isSubmitted && (
                <View style={styles.bottomButtons}>
                    <TouchableOpacity
                        style={styles.draftButton}
                        onPress={handleUpdateDamageReport}
                        disabled={saving}
                    >
                        <Text style={styles.draftButtonText}>Save Draft</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={handleSubmitDamageReport}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.reportButtonText}>Submit Report</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    scrollView: {
        flex: 1,
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
    statusRow: {
        marginTop: 12,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
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
    severityOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    severityOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.cardBg,
    },
    severityOptionText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    textArea: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputDisabled: {
        backgroundColor: theme.colors.surface,
        color: theme.colors.textSecondary,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    imageContainer: {
        position: 'relative',
        width: '31%',
        aspectRatio: 1,
    },
    damageImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    deleteImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    uploadOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    uploadOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
    },
    uploadOptionText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    deleteButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.error,
    },
    bottomButtons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        backgroundColor: theme.colors.cardBg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    draftButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    draftButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    reportButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: theme.colors.error,
        alignItems: 'center',
    },
    reportButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
