import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { sitesApi, usersApi, SiteEngineer, User } from '../../../../src/api';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#8B5CF6',
        success: '#10B981',
        error: '#EF4444',
    }
};

export default function AddSite() {
    const router = useRouter();
    const { edit } = useLocalSearchParams<{ edit?: string }>();
    const isEditing = !!edit;

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [address, setAddress] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [expectedHandover, setExpectedHandover] = useState<Date | null>(null);
    const [engineers, setEngineers] = useState<SiteEngineer[]>([]);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showHandoverPicker, setShowHandoverPicker] = useState(false);
    const [showEngineerPicker, setShowEngineerPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadingEngineers, setLoadingEngineers] = useState(false);
    const [availableEngineers, setAvailableEngineers] = useState<SiteEngineer[]>([]);

    // Fetch available engineers (all site engineers)
    const fetchAvailableEngineers = async () => {
        setLoadingEngineers(true);
        try {
            const users = await usersApi.getByRole('SITE_ENGINEER');
            // Filter out already selected engineers
            const selectedIds = new Set(engineers.map(e => e.id));
            const available = users
                .filter(u => !u.isRevoked && !selectedIds.has(u.id))
                .map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone }));
            setAvailableEngineers(available);
        } catch (error) {
            console.error('Failed to fetch engineers:', error);
        } finally {
            setLoadingEngineers(false);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'Select date';
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleAddEngineer = (engineer: SiteEngineer) => {
        if (!engineers.find(e => e.id === engineer.id)) {
            setEngineers([...engineers, engineer]);
            setAvailableEngineers(prev => prev.filter(e => e.id !== engineer.id));
        }
        setShowEngineerPicker(false);
    };

    const handleRemoveEngineer = (id: string) => {
        const removed = engineers.find(e => e.id === id);
        setEngineers(engineers.filter(e => e.id !== id));
        if (removed) {
            setAvailableEngineers(prev => [...prev, removed]);
        }
    };

    const generateCode = (siteName: string) => {
        // Generate a code from the site name (first letters of each word, uppercase)
        const words = siteName.trim().split(/\s+/);
        let generatedCode = words
            .slice(0, 3)
            .map(w => w.charAt(0).toUpperCase())
            .join('');
        
        // If code is too short, pad with more characters
        if (generatedCode.length < 2 && words[0]) {
            generatedCode = words[0].substring(0, 3).toUpperCase();
        }
        
        return generatedCode;
    };

    const handleNameChange = (text: string) => {
        setName(text);
        // Auto-generate code if not manually edited
        if (!isEditing) {
            setCode(generateCode(text));
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter the project name');
            return;
        }
        if (!code.trim()) {
            Alert.alert('Error', 'Please enter the site code');
            return;
        }
        if (!city.trim()) {
            Alert.alert('Error', 'Please enter the city');
            return;
        }

        setSaving(true);
        try {
            await sitesApi.create({
                name: name.trim(),
                code: code.trim().toUpperCase(),
                city: city.trim(),
                state: state.trim() || undefined,
                address: address.trim() || undefined,
                startDate: startDate?.toISOString(),
                expectedHandoverDate: expectedHandover?.toISOString(),
                engineerIds: engineers.map(e => e.id),
            });
            Alert.alert('Success', 'Site created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to save site';
            Alert.alert('Error', message);
        } finally {
            setSaving(false);
        }
    };

    const openEngineerPicker = () => {
        fetchAvailableEngineers();
        setShowEngineerPicker(true);
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Project Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>Name of the Project *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter project name"
                        value={name}
                        onChangeText={handleNameChange}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Site Code */}
                <View style={styles.field}>
                    <Text style={styles.label}>Site Code *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., GVR"
                        value={code}
                        onChangeText={(text) => setCode(text.toUpperCase())}
                        placeholderTextColor={theme.colors.textSecondary}
                        autoCapitalize="characters"
                        maxLength={10}
                    />
                </View>

                {/* City */}
                <View style={styles.field}>
                    <Text style={styles.label}>City *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter city"
                        value={city}
                        onChangeText={setCity}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* State */}
                <View style={styles.field}>
                    <Text style={styles.label}>State</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter state"
                        value={state}
                        onChangeText={setState}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Address */}
                <View style={styles.field}>
                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        placeholder="Enter full address"
                        value={address}
                        onChangeText={setAddress}
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                    />
                </View>

                {/* Start Date */}
                <View style={styles.field}>
                    <Text style={styles.label}>Start Date</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color={theme.colors.accent} />
                        <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                    </TouchableOpacity>
                </View>

                {/* Expected Handover */}
                <View style={styles.field}>
                    <Text style={styles.label}>Expected Handover Date</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowHandoverPicker(true)}>
                        <Ionicons name="flag-outline" size={20} color={theme.colors.accent} />
                        <Text style={styles.dateText}>{formatDate(expectedHandover)}</Text>
                    </TouchableOpacity>
                </View>

                {/* Add Site Engineers */}
                <View style={styles.field}>
                    <Text style={styles.label}>Site Engineers</Text>
                    <TouchableOpacity style={styles.addEngineerButton} onPress={openEngineerPicker}>
                        <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
                        <Text style={styles.addEngineerText}>Add Site Engineer</Text>
                    </TouchableOpacity>
                </View>

                {/* Engineers List */}
                {engineers.length > 0 && (
                    <View style={styles.engineersList}>
                        <Text style={styles.subLabel}>Assigned Engineers</Text>
                        {engineers.map(engineer => (
                            <View key={engineer.id} style={styles.engineerItem}>
                                <View style={styles.engineerAvatar}>
                                    <Text style={styles.avatarText}>{engineer.name.charAt(0)}</Text>
                                </View>
                                <View style={styles.engineerInfo}>
                                    <Text style={styles.engineerName}>{engineer.name}</Text>
                                    <Text style={styles.engineerEmail}>{engineer.email}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRemoveEngineer(engineer.id)}>
                                    <Ionicons name="close-circle" size={22} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>{saving ? 'Saving...' : (isEditing ? 'Update Site' : 'Save Site')}</Text>
                </TouchableOpacity>
            </View>

            {/* Date Pickers */}
            {showStartPicker && (
                <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setShowStartPicker(false);
                        if (date) setStartDate(date);
                    }}
                />
            )}
            {showHandoverPicker && (
                <DateTimePicker
                    value={expectedHandover || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setShowHandoverPicker(false);
                        if (date) setExpectedHandover(date);
                    }}
                />
            )}

            {/* Engineer Picker Modal */}
            <Modal visible={showEngineerPicker} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Engineer</Text>
                        <TouchableOpacity onPress={() => setShowEngineerPicker(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    {loadingEngineers ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                        </View>
                    ) : (
                    <FlatList
                        data={availableEngineers}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.engineerOption} onPress={() => handleAddEngineer(item)}>
                                <View style={styles.engineerAvatar}>
                                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                                </View>
                                <View style={styles.engineerInfo}>
                                    <Text style={styles.engineerName}>{item.name}</Text>
                                    <Text style={styles.engineerEmail}>{item.email}</Text>
                                </View>
                                <Ionicons name="add-circle" size={24} color={theme.colors.success} />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No available engineers to assign</Text>
                        }
                    />
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    scrollView: { flex: 1, padding: 16 },
    field: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 },
    subLabel: { fontSize: 13, fontWeight: '500', color: theme.colors.textSecondary, marginBottom: 12 },
    input: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 12,
    },
    dateText: { fontSize: 16, color: theme.colors.textPrimary },
    addEngineerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        gap: 8,
    },
    addEngineerText: { fontSize: 15, fontWeight: '500', color: theme.colors.primary },
    engineersList: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    engineerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    engineerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.accent + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { fontSize: 16, fontWeight: '600', color: theme.colors.accent },
    engineerInfo: { flex: 1 },
    engineerName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    engineerEmail: { fontSize: 13, color: theme.colors.textSecondary },
    footer: {
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    saveButton: {
        backgroundColor: theme.colors.accent,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
    modal: { flex: 1, backgroundColor: theme.colors.surface },
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
    engineerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    emptyText: { fontSize: 15, color: theme.colors.textSecondary, textAlign: 'center', padding: 20 },
});
