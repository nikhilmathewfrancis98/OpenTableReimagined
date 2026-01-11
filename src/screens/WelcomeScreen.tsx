import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
    const navigation = useNavigation<any>();

    return (
        <View style={[styles.bg, { backgroundColor: '#0b1020' }]}
        >
            <View style={styles.overlay} />
            <View style={styles.content}>
                <View style={styles.center}>
                    <View style={styles.logoWrap}>
                        <Text style={styles.logo}>FlavorFeed</Text>
                    </View>
                    <Text style={styles.title}>Discover hidden gems and share your culinary adventures.</Text>
                </View>

                <View style={styles.bottom}>
                    <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.ctaText}>Get Started</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
    content: { flex: 1, justifyContent: 'space-between', padding: 24 },
    center: { alignItems: 'center', marginTop: 80 },
    logo: { color: '#fff', fontSize: 48, fontWeight: '800' },
    title: { color: '#eee', fontSize: 16, textAlign: 'center', marginTop: 12, maxWidth: 480 },
    bottom: { alignItems: 'center', marginBottom: 40 },
    cta: { backgroundColor: '#FF6B00', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 999 },
    ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    logoWrap: { marginBottom: 8 },
});
