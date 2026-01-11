import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import api from '../lib/api';
import { getIdToken } from '../firebase/non-blocking-login';

export default function DebugApiScreen() {
    const [log, setLog] = useState<string[]>([]);

    function append(...lines: any[]) {
        setLog((l) => [...lines.map(String), '----', ...l].slice(0, 50));
    }

    return (
        <View style={styles.root}>
            <Text style={styles.title}>API Debug</Text>
            <Button title="Call protected /profile" onPress={async () => {
                try {
                    const token = await getIdToken(true);
                    append('getIdToken (truncated):', token ? token.slice(0, 60) + '...' : 'null');

                    const res = await api.apiFetch('http://10.0.2.2:4000/api/protected/profile');
                    append('status: ' + res.status);
                    let json = null;
                    try { json = await res.json(); } catch (e) { json = await res.text(); }
                    append(JSON.stringify(json));
                } catch (err) {
                    append('error: ' + String(err));
                }
            }} />

            <ScrollView style={styles.log}>
                {log.map((l, i) => <Text key={i} style={styles.line}>{l}</Text>)}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    log: { marginTop: 12, backgroundColor: '#f4f4f4', padding: 8, borderRadius: 8 },
    line: { fontSize: 12, color: '#111', marginBottom: 6 },
});
