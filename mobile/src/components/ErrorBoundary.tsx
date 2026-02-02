import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('App Error:', error);
        console.error('Error Info:', errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <ScrollView style={styles.scroll}>
                        <Text style={styles.title}>App Crashed!</Text>
                        <Text style={styles.subtitle}>Error Details:</Text>
                        <Text style={styles.error}>
                            {this.state.error?.toString()}
                        </Text>
                        <Text style={styles.subtitle}>Stack Trace:</Text>
                        <Text style={styles.stack}>
                            {this.state.error?.stack}
                        </Text>
                        <Text style={styles.subtitle}>Component Stack:</Text>
                        <Text style={styles.stack}>
                            {this.state.errorInfo?.componentStack}
                        </Text>
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 20,
    },
    scroll: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ff4444',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 15,
        marginBottom: 5,
    },
    error: {
        fontSize: 14,
        color: '#ff8888',
        fontFamily: 'monospace',
    },
    stack: {
        fontSize: 12,
        color: '#cccccc',
        fontFamily: 'monospace',
    },
});

export default ErrorBoundary;
