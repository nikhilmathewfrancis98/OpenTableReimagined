import React, { useState, useEffect } from 'react';
import { Text, View, Alert, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { signIn } from '../firebase/non-blocking-login';
import { useContext } from 'react';
import { AuthContext } from '../firebase/provider';


const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset form when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            setEmail('');
            setPassword('');
            setLoading(false);
            setError('');
        }, [])
    );

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigation.navigate('MainTabs');
        }
    }, [user, navigation]);

    const onSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const loggedInUser = await signIn(email.trim(), password);
            if (loggedInUser) {
                // Clear sensitive fields after successful sign in
                setEmail('');
                setPassword('');
                // Navigation will be handled by useEffect when user state updates
            } else {
                setError('Unable to sign in. Please check your credentials.');
            }
        } catch (err: any) {
            console.log('Login error:', err);
            console.log('Error type:', typeof err);
            console.log('Error message:', err?.message);
            console.log('Error stringified:', JSON.stringify(err));

            // Handle different error formats
            let errorMessage = 'Login failed. Please try again.';
            if (typeof err === 'string') {
                errorMessage = err;
            } else if (err?.message && typeof err.message === 'string') {
                errorMessage = err.message;
            } else if (err?.error && typeof err.error === 'string') {
                errorMessage = err.error;
            } else if (err?.details && typeof err.details === 'string') {
                errorMessage = err.details;
            } else {
                errorMessage = JSON.stringify(err);
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.card}>
                <Text style={styles.logo}>FlavorFeed</Text>
                <Text style={styles.sub}>Sign in to continue</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TextInput
                    mode="outlined"
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                />

                <TextInput
                    mode="outlined"
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />

                <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading} style={styles.cta}>
                    {loading ? 'Signing in...' : 'Log in'}
                </Button>

                <Button mode="text" onPress={() => navigation.navigate('SignUp')} style={styles.link}>
                    Don't have an account? Sign up
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0b1020', justifyContent: 'center', padding: 20 },
    card: { backgroundColor: 'rgba(255,255,255,0.04)', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.2 },
    logo: { color: '#fff', fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
    sub: { color: '#ddd', textAlign: 'center', marginBottom: 16 },
    errorText: { color: '#ff6b6b', textAlign: 'center', marginBottom: 12, fontSize: 14 },
    input: { marginBottom: 12, backgroundColor: 'transparent' },
    cta: { marginTop: 8, paddingVertical: 6 },
    link: { marginTop: 12 },
});

export default LoginScreen;
