import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function Input(props: any) {
    return <TextInput style={[styles.input, props.style]} {...props} />;
}

const styles = StyleSheet.create({
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        color: '#111',
        backgroundColor: '#fff'
    },
});
