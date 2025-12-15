import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import styles from './LoginScreen.styles';
import { signUp } from '../firebase/non-blocking-login';

export default function SignUpScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        setLoading(true);
        try {
            const user = await signUp(email.trim(), password, { username });
            setLoading(false);
            if (user) {
                navigation.navigate('Home');
            } else {
                Alert.alert('Sign up', 'Unable to create account.');
            }
        } catch (err: any) {
            setLoading(false);
            Alert.alert('Sign up error', err?.message || String(err));
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Create account</Text>

            <TextInput mode="outlined" label="Username" value={username} onChangeText={setUsername} style={styles.input} />
            <TextInput mode="outlined" label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
            <TextInput mode="outlined" label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

            <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading} style={{ marginTop: 8 }}>
                {loading ? 'Creating...' : 'Sign up'}
            </Button>
        </View>
    );
}
