import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExploreScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>This is a placeholder for the Explore tab — add filters and discovery UI here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    subtitle: { textAlign: 'center', color: '#666' },
});
