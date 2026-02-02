import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

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

const CATEGORIES = ['Structural', 'Plumbing', 'Electrical', 'Finishing', 'Hardware', 'Other'];
const UNITS = ['kg', 'bags', 'pieces', 'meter', 'sqft', 'sqm', 'liters', 'nos'];

export default function AddMaterial() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [specification, setSpecification] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [color, setColor] = useState('');
    const [category, setCategory] = useState('Structural');
    const [unit, setUnit] = useState('kg');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Material name is required');
            return;
        }
        setSaving(true);
        try {
            // TODO: API call to save
            await new Promise(resolve => setTimeout(resolve, 500));
            Alert.alert('Success', 'Material added successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to add material');
        } finally {
            setSaving(false);
        }
    };

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

                {/* Category */}
                <View style={styles.field}>
                    <Text style={styles.label}>Category *</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={category}
                            onValueChange={setCategory}
                            style={styles.picker}
                        >
                            {CATEGORIES.map(cat => (
                                <Picker.Item key={cat} label={cat} value={cat} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Unit */}
                <View style={styles.field}>
                    <Text style={styles.label}>Unit *</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={unit}
                            onValueChange={setUnit}
                            style={styles.picker}
                        >
                            {UNITS.map(u => (
                                <Picker.Item key={u} label={u} value={u} />
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
