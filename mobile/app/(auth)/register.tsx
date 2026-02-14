import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BASE_URL } from '../../src/api/client';

const API_URL = BASE_URL;

const theme = {
    colors: {
        primary: '#3B82F6',
        primaryDark: '#1E40AF',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        error: '#EF4444',
        border: '#D1D5DB',
        success: '#10B981',
    },
};

const ROLES = [
    { label: 'Select your role', value: '' },
    { label: 'Site Engineer', value: 'SITE_ENGINEER' },
    { label: 'Purchase Team', value: 'PURCHASE_TEAM' },
    { label: 'Director', value: 'DIRECTOR' },
];

const SECURITY_QUESTIONS = [
    { label: 'Select a security question', value: '' },
    { label: "What is your mother's maiden name?", value: 'MOTHERS_MAIDEN_NAME' },
    { label: 'What is the name of your first pet?', value: 'FIRST_PET_NAME' },
    { label: 'What was your childhood nickname?', value: 'CHILDHOOD_NICKNAME' },
    { label: 'What was the name of your first school?', value: 'FIRST_SCHOOL' },
    { label: 'What is your favorite book?', value: 'FAVORITE_BOOK' },
    { label: 'What city were you born in?', value: 'BIRTHPLACE_CITY' },
];

interface Site {
    id: string;
    name: string;
    location: string;
}

export default function RegisterScreen() {
    // Step 1: Basic Info
    const [name, setName] = useState('');
    const [dob, setDob] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Step 2: Role & Sites
    const [role, setRole] = useState('');
    const [sites, setSites] = useState<Site[]>([]);
    const [selectedSites, setSelectedSites] = useState<string[]>([]);
    const [loadingSites, setLoadingSites] = useState(false);

    // Step 3: Password & Security
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [step, setStep] = useState(1);

    const router = useRouter();

    // Fetch sites when role is Site Engineer
    useEffect(() => {
        if (role === 'SITE_ENGINEER') {
            fetchSites();
        }
    }, [role]);

    const fetchSites = async () => {
        setLoadingSites(true);
        try {
            const response = await fetch(`${API_URL}/sites/public`);
            const result = await response.json();
            if (result.success && result.data) {
                setSites(result.data.sites || result.data);
            }
        } catch (error) {
            console.warn('Failed to fetch sites:', error);
        } finally {
            setLoadingSites(false);
        }
    };

    const toggleSite = (siteId: string) => {
        setSelectedSites(prev =>
            prev.includes(siteId)
                ? prev.filter(id => id !== siteId)
                : [...prev, siteId]
        );
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Name is required';
        if (!dob) newErrors.dob = 'Date of birth is required';

        if (!email.trim()) {
            newErrors.email = 'Company email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Enter valid 10-digit phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        if (!role) newErrors.role = 'Please select your role';

        if (role === 'SITE_ENGINEER' && selectedSites.length === 0) {
            newErrors.sites = 'Please select at least one site';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!securityQuestion) {
            newErrors.securityQuestion = 'Please select a security question';
        }

        if (!securityAnswer.trim()) {
            newErrors.securityAnswer = 'Security answer is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleRegister = async () => {
        if (!validateStep3()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone.replace(/\D/g, ''),
                    dob: dob?.toISOString(),
                    role,
                    siteIds: role === 'SITE_ENGINEER' ? selectedSites : undefined,
                    password,
                    securityQuestion,
                    securityAnswer: securityAnswer.trim().toLowerCase(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Registration failed');
            }

            Alert.alert(
                'Registration Successful! ✓',
                'Your account has been created. Please login with your credentials.',
                [{ text: 'Go to Login', onPress: () => router.replace('/(auth)/login') }]
            );
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const renderStep1 = () => (
        <>
            <Text style={styles.stepTitle}>Personal Information</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="words"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Date of Birth *</Text>
                <TouchableOpacity
                    style={[styles.input, styles.dateInput, errors.dob && styles.inputError]}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={dob ? styles.dateText : styles.datePlaceholder}>
                        {dob ? formatDate(dob) : 'Select your date of birth'}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={dob || new Date(2000, 0, 1)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        maximumDate={new Date()}
                        onChange={(_, date) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (date) setDob(date);
                        }}
                    />
                )}
                {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Company Email *</Text>
                <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="yourname@company.com"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter 10-digit phone number"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="phone-pad"
                    maxLength={10}
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>
        </>
    );

    const renderStep2 = () => (
        <>
            <Text style={styles.stepTitle}>Role & Assignment</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Your Role *</Text>
                <View style={[styles.pickerContainer, errors.role && styles.inputError]}>
                    <Picker
                        selectedValue={role}
                        onValueChange={setRole}
                        style={styles.picker}
                    >
                        {ROLES.map((r) => (
                            <Picker.Item key={r.value} label={r.label} value={r.value} />
                        ))}
                    </Picker>
                </View>
                {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
            </View>

            {role === 'SITE_ENGINEER' && (
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Assigned Sites *</Text>
                    <Text style={styles.helperText}>Select all sites you're assigned to</Text>

                    {loadingSites ? (
                        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 12 }} />
                    ) : (
                        <View style={styles.sitesContainer}>
                            {sites.map((site) => (
                                <TouchableOpacity
                                    key={site.id}
                                    style={[
                                        styles.siteChip,
                                        selectedSites.includes(site.id) && styles.siteChipSelected
                                    ]}
                                    onPress={() => toggleSite(site.id)}
                                >
                                    <Text style={[
                                        styles.siteChipText,
                                        selectedSites.includes(site.id) && styles.siteChipTextSelected
                                    ]}>
                                        {site.name}
                                    </Text>
                                    {selectedSites.includes(site.id) && (
                                        <Text style={styles.checkmark}> ✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                            {sites.length === 0 && !loadingSites && (
                                <Text style={styles.noSitesText}>No sites available</Text>
                            )}
                        </View>
                    )}
                    {errors.sites && <Text style={styles.errorText}>{errors.sites}</Text>}
                </View>
            )}
        </>
    );

    const renderStep3 = () => (
        <>
            <Text style={styles.stepTitle}>Security Setup</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Create Password *</Text>
                <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter your password"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Security Question *</Text>
                <Text style={styles.helperText}>Used for password recovery</Text>
                <View style={[styles.pickerContainer, errors.securityQuestion && styles.inputError]}>
                    <Picker
                        selectedValue={securityQuestion}
                        onValueChange={setSecurityQuestion}
                        style={styles.picker}
                    >
                        {SECURITY_QUESTIONS.map((q) => (
                            <Picker.Item key={q.value} label={q.label} value={q.value} />
                        ))}
                    </Picker>
                </View>
                {errors.securityQuestion && <Text style={styles.errorText}>{errors.securityQuestion}</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Security Answer *</Text>
                <TextInput
                    style={[styles.input, errors.securityAnswer && styles.inputError]}
                    value={securityAnswer}
                    onChangeText={setSecurityAnswer}
                    placeholder="Your answer"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="none"
                />
                {errors.securityAnswer && <Text style={styles.errorText}>{errors.securityAnswer}</Text>}
            </View>
        </>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>📦</Text>
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Indense Material Management</Text>
                </View>

                {/* Progress Steps */}
                <View style={styles.progressContainer}>
                    {[1, 2, 3].map((s) => (
                        <View key={s} style={styles.progressStep}>
                            <View style={[
                                styles.progressDot,
                                step >= s && styles.progressDotActive,
                                step > s && styles.progressDotComplete
                            ]}>
                                <Text style={[
                                    styles.progressNumber,
                                    step >= s && styles.progressNumberActive
                                ]}>
                                    {step > s ? '✓' : s}
                                </Text>
                            </View>
                            <Text style={[styles.progressLabel, step === s && styles.progressLabelActive]}>
                                {s === 1 ? 'Info' : s === 2 ? 'Role' : 'Security'}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.form}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <View style={styles.buttonRow}>
                        {step > 1 && (
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={prevStep}
                            >
                                <Text style={styles.backButtonText}>← Back</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.button,
                                loading && styles.buttonDisabled,
                                step > 1 && styles.buttonFlex
                            ]}
                            onPress={step === 3 ? handleRegister : nextStep}
                            disabled={loading}
                            activeOpacity={0.7}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {step === 3 ? 'Create Account' : 'Continue →'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => router.replace('/(auth)/login')}
                    >
                        <Text style={styles.linkText}>
                            Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 50,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#EBF5FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoText: {
        fontSize: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 32,
    },
    progressStep: {
        alignItems: 'center',
    },
    progressDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    progressDotActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    progressDotComplete: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
    },
    progressNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    progressNumberActive: {
        color: '#FFFFFF',
    },
    progressLabel: {
        fontSize: 11,
        color: theme.colors.textSecondary,
    },
    progressLabelActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    form: {
        marginBottom: 24,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 14,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    helperText: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        fontSize: 11,
        color: theme.colors.error,
        marginTop: 3,
    },
    dateInput: {
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
    datePlaceholder: {
        fontSize: 15,
        color: theme.colors.textSecondary,
    },
    pickerContainer: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        color: theme.colors.textPrimary,
    },
    sitesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    siteChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    siteChipSelected: {
        backgroundColor: '#EBF5FF',
        borderColor: theme.colors.primary,
    },
    siteChipText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    siteChipTextSelected: {
        color: theme.colors.primary,
        fontWeight: '500',
    },
    checkmark: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    noSitesText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    buttonFlex: {
        flex: 2,
    },
    buttonDisabled: {
        backgroundColor: theme.colors.textSecondary,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
    linkButton: {
        alignItems: 'center',
        marginTop: 20,
    },
    linkText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    linkHighlight: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
});
