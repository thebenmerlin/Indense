import React, { useState } from 'react';
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

// Map enum values to readable questions
const SECURITY_QUESTION_LABELS: Record<string, string> = {
    MOTHERS_MAIDEN_NAME: "What is your mother's maiden name?",
    FIRST_PET_NAME: 'What is the name of your first pet?',
    CHILDHOOD_NICKNAME: 'What was your childhood nickname?',
    FIRST_SCHOOL: 'What was the name of your first school?',
    FAVORITE_BOOK: 'What is your favorite book?',
    BIRTHPLACE_CITY: 'What city were you born in?',
};

export default function ForgotPasswordScreen() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Step 1: Email or Phone
    const [emailOrPhone, setEmailOrPhone] = useState('');

    // Step 2: Security Question
    const [userId, setUserId] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');

    // Step 3: Reset Password
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const router = useRouter();

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!emailOrPhone.trim()) {
            newErrors.emailOrPhone = 'Email or phone number is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!securityAnswer.trim()) {
            newErrors.securityAnswer = 'Security answer is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};
        if (!newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }
        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Step 1: Get security question
    const handleGetSecurityQuestion = async () => {
        if (!validateStep1()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrPhone: emailOrPhone.trim() }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'User not found');
            }

            setUserId(result.data.userId);
            setSecurityQuestion(result.data.question);
            setStep(2);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to find account');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify security answer
    const handleVerifyAnswer = async () => {
        if (!validateStep2()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/verify-security-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    answer: securityAnswer.trim().toLowerCase(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Incorrect answer');
            }

            setResetToken(result.data.resetToken);
            setStep(3);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async () => {
        if (!validateStep3()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resetToken,
                    newPassword,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Reset failed');
            }

            Alert.alert(
                'Password Reset Successful! ✓',
                'Your password has been changed. Please login with your new password.',
                [{ text: 'Go to Login', onPress: () => router.replace('/(auth)/login') }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <>
            <Text style={styles.stepTitle}>Find Your Account</Text>
            <Text style={styles.stepDescription}>
                Enter your email address or phone number to recover your password.
            </Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email or Phone Number *</Text>
                <TextInput
                    style={[styles.input, errors.emailOrPhone && styles.inputError]}
                    value={emailOrPhone}
                    onChangeText={setEmailOrPhone}
                    placeholder="Enter email or phone"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                {errors.emailOrPhone && <Text style={styles.errorText}>{errors.emailOrPhone}</Text>}
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleGetSecurityQuestion}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <Text style={styles.buttonText}>Continue →</Text>
                )}
            </TouchableOpacity>
        </>
    );

    const renderStep2 = () => (
        <>
            <Text style={styles.stepTitle}>Security Question</Text>
            <Text style={styles.stepDescription}>
                Answer your security question to verify your identity.
            </Text>

            <View style={styles.questionCard}>
                <Text style={styles.questionLabel}>Your Security Question:</Text>
                <Text style={styles.questionText}>
                    {SECURITY_QUESTION_LABELS[securityQuestion] || securityQuestion}
                </Text>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Your Answer *</Text>
                <TextInput
                    style={[styles.input, errors.securityAnswer && styles.inputError]}
                    value={securityAnswer}
                    onChangeText={setSecurityAnswer}
                    placeholder="Enter your answer"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="none"
                />
                {errors.securityAnswer && <Text style={styles.errorText}>{errors.securityAnswer}</Text>}
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.buttonFlex, loading && styles.buttonDisabled]}
                    onPress={handleVerifyAnswer}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Verify →</Text>
                    )}
                </TouchableOpacity>
            </View>
        </>
    );

    const renderStep3 = () => (
        <>
            <Text style={styles.stepTitle}>Create New Password</Text>
            <Text style={styles.stepDescription}>
                Enter your new password below.
            </Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password *</Text>
                <TextInput
                    style={[styles.input, errors.newPassword && styles.inputError]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                />
                {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
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

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.buttonFlex, loading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Reset Password</Text>
                    )}
                </TouchableOpacity>
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
                        <Text style={styles.logoText}>🔐</Text>
                    </View>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>Recover access to your account</Text>
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
                                {s === 1 ? 'Find' : s === 2 ? 'Verify' : 'Reset'}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.form}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => router.replace('/(auth)/login')}
                    >
                        <Text style={styles.linkText}>
                            Remember your password? <Text style={styles.linkHighlight}>Sign In</Text>
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
        backgroundColor: '#FEF3C7',
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
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 20,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: 4,
    },
    questionCard: {
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    questionLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 6,
    },
    questionText: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
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
        borderRadius: 10,
        paddingVertical: 16,
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
        marginTop: 24,
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
