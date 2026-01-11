import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { onAuthStateChanged } from './non-blocking-login';

type UserRole = 'user' | 'vlogger' | 'admin';

type AuthContextValue = {
    user: any | null;
    loading: boolean;
    role: UserRole | null;
    initialized: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
    user: null,
    loading: true,
    role: null,
    initialized: false,
    signOut: async () => { },
    refreshUser: async () => { }
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [role, setRole] = useState<UserRole | null>(null);

    const fetchUserRole = useCallback(async (userData: any) => {
        if (!userData) return;
        try {
            const userDoc = await firestore().collection('users').doc(userData.uid).get();
            const docData = userDoc.data();
            if (docData) {
                setRole(docData.role || 'user');
            } else {
                setRole('user');
            }
        } catch (error) {
            console.warn('Failed to fetch user role:', error);
            setRole('user');
        }
    }, []);

    const refreshUser = useCallback(async () => {
        if (user) {
            await fetchUserRole(user);
        }
    }, [user, fetchUserRole]);

    const signOut = useCallback(async () => {
        try {
            const { signOut: authSignOut } = await import('./non-blocking-login');
            await authSignOut();
            setUser(null);
            setRole(null);
        } catch (error) {
            console.warn('Sign out error:', error);
        }
    }, []);

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const setupAuthListener = async () => {
            try {
                unsubscribe = onAuthStateChanged(async (userData) => {
                    console.log('[AuthProvider] Auth state changed:', userData?.uid || 'null');

                    if (userData) {
                        setUser(userData);
                        await fetchUserRole(userData);
                    } else {
                        setUser(null);
                        setRole(null);
                    }

                    setLoading(false);
                    setInitialized(true);
                });
            } catch (error) {
                console.error('[AuthProvider] Auth listener setup failed:', error);
                setLoading(false);
                setInitialized(true);
            }
        };

        setupAuthListener();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [fetchUserRole]);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            role,
            initialized,
            signOut,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export default FirebaseProvider;
