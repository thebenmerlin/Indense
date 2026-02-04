import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { materialsApi, MaterialCategory, UnitOfMeasure } from '../../../../src/api/materials.api';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#10B981',
    }
};

export default function AddMaterial() {
    const router = useRouter();
    const [categories, setCategories] = useState<MaterialCategory[]>([]);
    const [units, setUnits] = useState<UnitOfMeasure[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [name, setName] = useState('');
    const [specification, setSpecification] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [color, setColor] = useState('');
    const [code, setCode] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadFormData = async () => {
            try {
                const [categoriesData, unitsData] = await Promise.all([
                    materialsApi.getCategories(),
                    materialsApi.getUnits(),
                ]);
                setCategories(categoriesData);
                setUnits(unitsData);
                // Set defaults
                if (categoriesData.length > 0) setSelectedCategoryId(categoriesData[0].id);
                if (unitsData.length > 0) setSelectedUnitId(unitsData[0].id);
            } catch (error) {
                console.error('Failed to load form data:', error);
                Alert.alert('Error', 'Failed to load categories and units');
            } finally {
                setLoadingData(false);
            }
        };
        loadFormData();
    }, []);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Material name is required');
            return;
        }
        if (!selectedCategoryId) {
            Alert.alert('Error', 'Please select a category');
            return;
        }
        if (!selectedUnitId) {
            Alert.alert('Error', 'Please select a unit');
            return;
        }

        setSaving(true);
        try {
            await materialsApi.create({
                name: name.trim(),
                specification: specification.trim() || undefined,
                dimensions: dimensions.trim() || undefined,
                color: color.trim() || undefined,
                code: code.trim() || undefined,
                itemGroupId: selectedCategoryId,
                uomId: selectedUnitId,
            });
            Alert.alert('Success', 'Material added successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Failed to create material:', error);
            const message = error?.response?.data?.message || 'Failed to add material';
            Alert.alert('Error', message);
        } finally {
            setSaving(false);
        }
    };

    if (loadingData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Material Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>Material Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter material name"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Specification */}
                <View style={styles.field}>
                    <Text style={styles.label}>Specification</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Fe 500D, OPC 53 Grade"
                        value={specification}
                        onChangeText={setSpecification}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Dimensions/Size */}
                <View style={styles.field}>
                    <Text style={styles.label}>Dimensions / Size</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 12mm x 12m, 50 kg bags"
                        value={dimensions}
                        onChangeText={setDimensions}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Color */}
                <View style={styles.field}>
                    <Text style={styles.label}>Color</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Black, Grey, White"
                        value={color}
                        onChangeText={setColor}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Material Code */}
                <View style={styles.field}>
                    <Text style={styles.label}>Material Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., TMT-500D-12"
                        value={code}
                        onChangeText={setCode}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Category */}
                <View style={styles.field}>
                    <Text style={styles.label}>Category *</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedCategoryId}
                            onValueChange={setSelectedCategoryId}
                            style={styles.picker}
                        >
                            {categories.map(cat => (
                                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Unit */}
                <View style={styles.field}>
                    <Text style={styles.label}>Unit *</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedUnitId}
                            onValueChange={setSelectedUnitId}
                            style={styles.picker}
                        >
                            {units.map(u => (
                                <Picker.Item key={u.id} label={`${u.name} (${u.abbreviation})`} value={u.id} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Ionicons name="save" size={20} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Material'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1, padding: 16 },
    field: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 },
    input: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
    },
    pickerWrapper: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    picker: { height: 50, marginTop: -4, marginBottom: -4 },
    footer: {
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.accent,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
