import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

// MINIMAL DEBUG LAYOUT - No store, no auth, just basic routing
export default function RootLayout() {
    console.log('RootLayout mounting...');

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(site-engineer)" options={{ headerShown: false }} />
                <Stack.Screen name="(purchase-team)" options={{ headerShown: false }} />
                <Stack.Screen name="(director)" options={{ headerShown: false }} />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
