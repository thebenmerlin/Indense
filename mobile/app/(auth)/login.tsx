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
import { useAuth } from '../../src/context';

const API_URL = 'https://indense.onrender.com/api/v1';

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
    },
};

const Role = {
    SITE_ENGINEER: 'SITE_ENGINEER',
    PURCHASE_TEAM: 'PURCHASE_TEAM',
    DIRECTOR: 'DIRECTOR',
};

export default function LoginScreen() {
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

    const router = useRouter();
    const { login } = useAuth();

    const validate = () => {
        const newErrors: typeof errors = {};

        if (loginMethod === 'email') {
            if (!email.trim()) {
                newErrors.identifier = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                newErrors.identifier = 'Invalid email format';
            }
        } else {
            if (!phone.trim()) {
                newErrors.identifier = 'Phone number is required';
            } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
                newErrors.identifier = 'Enter valid 10-digit phone number';
            }
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const body = loginMethod === 'email'
                ? { email: email.trim().toLowerCase(), password }
                : { phone: phone.replace(/\D/g, ''), password };

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Login failed');
            }

            // API returns { success, data: { user, accessToken, refreshToken } }
            const { user, accessToken, refreshToken } = result.data;

            // Use context login
            await login(accessToken, refreshToken, user);

            // Navigate based on role
            if (user.role === Role.SITE_ENGINEER) {
                router.replace('/(site-engineer)/dashboard');
            } else if (user.role === Role.PURCHASE_TEAM) {
                router.replace('/(purchase-team)/dashboard');
            } else if (user.role === Role.DIRECTOR) {
                router.replace('/(director)/dashboard');
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        router.push('/(auth)/forgot-password');
    };

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
                    <Text style={styles.title}>Indense</Text>
                    <Text style={styles.subtitle}>Material Indent Management</Text>
                </View>

                <View style={styles.form}>
                    {/* Login Method Toggle */}
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, loginMethod === 'email' && styles.toggleActive]}
                            onPress={() => setLoginMethod('email')}
                        >
                            <Text style={[styles.toggleText, loginMethod === 'email' && styles.toggleTextActive]}>
                                Email
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, loginMethod === 'phone' && styles.toggleActive]}
                            onPress={() => setLoginMethod('phone')}
                        >
                            <Text style={[styles.toggleText, loginMethod === 'phone' && styles.toggleTextActive]}>
                                Phone
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                        </Text>
                        {loginMethod === 'email' ? (
                            <TextInput
                                style={[styles.input, errors.identifier && styles.inputError]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor={theme.colors.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        ) : (
                            <TextInput
                                style={[styles.input, errors.identifier && styles.inputError]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter 10-digit phone number"
                                placeholderTextColor={theme.colors.textSecondary}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        )}
                        {errors.identifier && <Text style={styles.errorText}>{errors.identifier}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            placeholderTextColor={theme.colors.textSecondary}
                            secureTextEntry
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <TouchableOpacity
                        style={styles.forgotButton}
                        onPress={handleForgotPassword}
                    >
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => router.push('/(auth)/register')}
                    >
                        <Text style={styles.linkText}>
                            Don't have an account? <Text style={styles.linkHighlight}>Register</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © 2026 Indense
                    </Text>
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
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#EBF5FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoText: {
        fontSize: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.textSecondary,
    },
    form: {
        marginBottom: 32,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        padding: 4,
        marginBottom: 20,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    toggleTextActive: {
        color: theme.colors.primary,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
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
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    button: {
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    buttonDisabled: {
        backgroundColor: theme.colors.textSecondary,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
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
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
});
