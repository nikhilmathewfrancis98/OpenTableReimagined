import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Prefer Feather icons if available, otherwise fall back to emoji labels.
let Icon: any = null;
try {
    // require dynamically so project still works if package isn't installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Feather = require('react-native-vector-icons/Feather');
    Icon = Feather && (Feather.default || Feather);
} catch (e) {
    Icon = null;
}
if (!Icon) {
    // Helpful runtime warning when vector icons are not available/linked
    // This will appear in Metro/Android logcat so you can diagnose font linking issues.
    // eslint-disable-next-line no-console 
    //  These can be removed
    console.warn('react-native-vector-icons/Feather not available — using emoji fallback for BottomNav');
}

export default function BottomNav() {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Home')}>
                {Icon ? <Icon name="home" size={20} color="#333" /> : <Text style={styles.iconFallback}>🏠</Text>}
                <Text style={styles.label}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Explore')}>
                {Icon ? <Icon name="search" size={20} color="#333" /> : <Text style={styles.iconFallback}>🔎</Text>}
                <Text style={styles.label}>Explore</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Profile')}>
                {Icon ? <Icon name="user" size={20} color="#333" /> : <Text style={styles.iconFallback}>👤</Text>}
                <Text style={styles.label}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        height: 64,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
        zIndex: 10,
        elevation: 10,
    },
    tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    iconFallback: { fontSize: 20 },
    label: { fontSize: 12, marginTop: 2 },
});
