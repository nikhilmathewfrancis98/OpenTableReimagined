import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { errorEmitter } from '../firebase/error-emitter';

// Subscribe to the centralized error emitter and show alerts/toasts.
export default function FirebaseErrorListener() {
    useEffect(() => {
        const handler = (err: any) => {
            try {
                const message = err?.message || String(err);
                Alert.alert('Error', message);
            } catch (e) {
                // ignore
            }
        };

        errorEmitter.on('generic-error', handler);

        return () => {
            errorEmitter.off('generic-error', handler);
        };
    }, []);

    return null;
}
