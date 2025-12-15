import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged as authListener } from './non-blocking-login';
import { firestore } from './index';

type AuthContextValue = {
    user: any | null;
    loading: boolean;
};

export const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function FirebaseProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to auth state changes and expose via context only.
        const unsub = authListener((u) => {
            setUser(u);
            setLoading(false);
            // Ensure a minimal users/{uid} profile exists (best-effort)
            (async function ensureProfile() {
                try {
                    if (u && firestore) {
                        const ref = firestore.collection('users').doc(u.uid);
                        const snap = await ref.get();
                        if (!snap.exists) {
                            await ref.set({ id: u.uid, email: u.email || '', username: (u.displayName || '').replace(/\s+/g, '').toLowerCase(), createdAt: firestore.FieldValue ? firestore.FieldValue.serverTimestamp() : null });
                        }
                    }
                } catch (e) {
                    // Do not block auth flow on profile creation errors
                    // console.warn('ensureProfile error', e);
                }
            })();
        });
        return () => unsub && unsub();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export default FirebaseProvider;
