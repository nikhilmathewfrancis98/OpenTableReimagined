import React, { useState } from 'react';
import { Text, View, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import styles from './LoginScreen.styles';
import { useNavigation } from '@react-navigation/native';
import { signIn } from '../firebase/non-blocking-login';


const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        setLoading(true);
        try {
            const user = await signIn(email.trim(), password);
            setLoading(false);
            if (user) {
                navigation.navigate('Home');
            } else {
                Alert.alert('Login', 'Unable to sign in.');
            }
        } catch (err: any) {
            setLoading(false);
            Alert.alert('Login error', err?.message || String(err));
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome back</Text>

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

            <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading} style={{ marginTop: 8 }}>
                {loading ? 'Signing in...' : 'Log in'}
            </Button>

            <Button mode="text" onPress={() => navigation.navigate('SignUp')} style={{ marginTop: 12 }}>
                Don't have an account? Sign up
            </Button>
        </View>
    );
}
export default LoginScreen;
