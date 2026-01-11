import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { signUp } from '../firebase/non-blocking-login';

export default function SignUpScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<'user' | 'vlogger' | 'restaurant_owner' | ''>('');
    const [showRoles, setShowRoles] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        setLoading(true);
        try {
            const user = await signUp(email.trim(), password, { username, roles: role ? [role] : ['user'] });
            setLoading(false);
            if (user) {
                const isNewUser = user?.metadata && user.metadata.creationTime === user.metadata.lastSignInTime;
                if (isNewUser) {
                    // clear sensitive fields and navigate
                    setEmail('');
                    setPassword('');
                    setUsername('');
                    setRole('');
                    navigation.navigate('CompleteProfile');
                } else {
                    setEmail('');
                    setPassword('');
                    setUsername('');
                    setRole('');
                    navigation.navigate('Home');
                }
            } else {
                Alert.alert('Sign up', 'Unable to create account.');
            }
        } catch (err: any) {
            setLoading(false);
            Alert.alert('Sign up error', err?.message || String(err));
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.card}>
                <Text style={styles.logo}>FlavorFeed</Text>
                <Text style={styles.sub}>Create an account</Text>

                <TextInput mode="outlined" label="Username" value={username} onChangeText={setUsername} style={styles.input} />

                <View style={styles.roleRow}>
                    <Text style={styles.roleLabel}>Role</Text>
                    <TouchableOpacity onPress={() => setShowRoles(!showRoles)} style={styles.roleSelect}>
                        <Text style={{ color: role ? '#111' : '#888' }}>{role ? (role === 'user' ? 'Explorer' : role === 'vlogger' ? 'Food Vlogger' : 'Restaurant Owner') : 'Select a role'}</Text>
                    </TouchableOpacity>
                </View>
                {showRoles && (
                    <View style={styles.roleOptions}>
                        <TouchableOpacity style={styles.roleOption} onPress={() => { setRole('user'); setShowRoles(false); }}>
                            <Text>Explorer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.roleOption} onPress={() => { setRole('vlogger'); setShowRoles(false); }}>
                            <Text>Food Vlogger</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.roleOption} onPress={() => { setRole('restaurant_owner'); setShowRoles(false); }}>
                            <Text>Restaurant Owner</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TextInput mode="outlined" label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
                <TextInput mode="outlined" label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

                <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading} style={styles.cta}>
                    {loading ? 'Creating...' : 'Sign up'}
                </Button>

                <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.link}>
                    Already have an account? Log in
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0b1020', justifyContent: 'center', padding: 20 },
    card: { backgroundColor: 'rgba(255,255,255,0.04)', padding: 20, borderRadius: 12 },
    logo: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
    sub: { color: '#ddd', textAlign: 'center', marginBottom: 12 },
    input: { marginBottom: 12, backgroundColor: 'transparent' },
    cta: { marginTop: 8 },
    link: { marginTop: 12 },
    roleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    roleLabel: { color: '#ddd' },
    roleSelect: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 8 },
    roleOptions: { marginBottom: 12, backgroundColor: '#fff', borderRadius: 8, padding: 6 },
    roleOption: { paddingVertical: 8, paddingHorizontal: 6 },
});
// import React, { useState } from 'react';
// import { View, Text, Alert, StyleSheet } from 'react-native';
// import { TextInput, Button } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import { signUp } from '../firebase/non-blocking-login';

// export default function SignUpScreen() {
//     const navigation = useNavigation<any>();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [username, setUsername] = useState('');
//     const [loading, setLoading] = useState(false);

//     const onSubmit = async () => {
//         setLoading(true);
//         try {
//             const user = await signUp(email.trim(), password, { username });
//             setLoading(false);
//             if (user) {
//                 navigation.navigate('Home');
//             } else {
//                 Alert.alert('Sign up', 'Unable to create account.');
//             }
//         } catch (err: any) {
//             setLoading(false);
//             Alert.alert('Sign up error', err?.message || String(err));
//         }
//     };

//     return (
//         <View style={styles.root}>
//             <View style={styles.card}>
//                 <Text style={styles.logo}>FlavorFeed</Text>
//                 <Text style={styles.sub}>Create an account</Text>

//                 <TextInput mode="outlined" label="Username" value={username} onChangeText={setUsername} style={styles.input} />
//                 <TextInput mode="outlined" label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
//                 <TextInput mode="outlined" label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

//                 <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading} style={styles.cta}>
//                     {loading ? 'Creating...' : 'Sign up'}
//                 </Button>

//                 <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.link}>
//                     Already have an account? Log in
//                 </Button>
//             </View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     root: { flex: 1, backgroundColor: '#0b1020', justifyContent: 'center', padding: 20 },
//     card: { backgroundColor: 'rgba(255,255,255,0.04)', padding: 20, borderRadius: 12 },
//     logo: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
//     sub: { color: '#ddd', textAlign: 'center', marginBottom: 12 },
//     input: { marginBottom: 12, backgroundColor: 'transparent' },
//     cta: { marginTop: 8 },
//     link: { marginTop: 12 },
// });
