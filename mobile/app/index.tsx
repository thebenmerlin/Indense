import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// MINIMAL DEBUG INDEX - Just shows text, no auth redirect
export default function Index() {
    console.log('Index mounting...');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Indense App Loaded!</Text>
            <Text style={styles.subtitle}>If you see this, the app launched successfully.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
});
