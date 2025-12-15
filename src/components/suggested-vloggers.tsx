import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SuggestedVloggers() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Suggested Vloggers</Text>
            <Text style={styles.item}>- Vlogger 1</Text>
            <Text style={styles.item}>- Vlogger 2</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 12, backgroundColor: '#fff', borderRadius: 8 },
    title: { fontWeight: '700', marginBottom: 8 },
    item: { color: '#444' },
});
