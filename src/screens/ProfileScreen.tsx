import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from '../firebase/non-blocking-login';
import { useContext } from 'react';
import { AuthContext } from '../firebase/provider';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await signOut();
                            // Navigation will be handled by AuthContext listener in App.tsx
                            // which will redirect to Login screen
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Image style={styles.avatar} source={{ uri: 'https://picsum.photos/seed/profile/200' }} />
            <Text style={styles.name}>{user?.displayName || 'New User'}</Text>
            <Text style={styles.handle}>@{user?.email || 'username'}</Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Logging out...' : 'Logout'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', padding: 24, backgroundColor: '#fff' },
    avatar: { width: 96, height: 96, borderRadius: 48, marginTop: 24 },
    name: { fontSize: 20, fontWeight: '700', marginTop: 12 },
    handle: { color: '#666', marginBottom: 16 },
    button: { backgroundColor: '#FF6B00', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    logoutButton: { backgroundColor: '#dc3545', marginTop: 16 },
    buttonText: { color: '#fff', fontWeight: '700' },
});
