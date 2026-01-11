import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { AuthContext } from '../firebase/provider';
import { useNavigation } from '@react-navigation/native';
import { firestore } from '../firebase/index';
import { updateDocumentNonBlocking } from '../firebase/non-blocking-updates';

export default function CompleteProfileScreen() {
    const { user, loading } = useContext(AuthContext);
    const navigation = useNavigation<any>();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [agree, setAgree] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            navigation.replace('Login');
        }
        if (user) {
            setName(user.displayName || '');
            setUsername(user.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') : '');
        }
    }, [user, loading, navigation]);

    const onSubmit = () => {
        if (!user) return;
        if (!agree) {
            Alert.alert('Please agree to the policies');
            return;
        }

        try {
            const userRef = firestore.collection('users').doc(user.uid);
            updateDocumentNonBlocking(userRef, { name, username });
            navigation.replace('Home');
        } catch (e: any) {
            Alert.alert('Error', 'Could not update profile.');
        }
    };

    if (loading || !user) {
        return <View style={styles.center}><Text>Loading...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <TextInput label="Full Name" value={name} onChangeText={setName} style={styles.input} />
            <TextInput label="Username" value={username} onChangeText={setUsername} style={styles.input} />
            <View style={{ height: 8 }} />
            <Button mode="contained" onPress={onSubmit} style={{ marginTop: 12 }}>Complete Profile</Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
    input: { marginBottom: 12 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
