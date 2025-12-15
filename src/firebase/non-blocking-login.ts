// Auth helpers using @react-native-firebase/auth when available.
// Falls back to no-op if native modules aren't installed.
import { auth, firestore } from './index';
import { GoogleAuthProvider } from '@react-native-firebase/auth';

type Unsubscribe = () => void;

function isTransientError(err: any) {
    const code = err?.code || '';
    const msg = String(err?.message || '').toLowerCase();
    // Network related errors are considered transient
    return code === 'auth/network-request-failed' || msg.includes('network') || msg.includes('timeout');
}

function mapAuthError(err: any) {
    const code = err?.code || '';
    switch (code) {
        case 'auth/email-already-in-use':
            return 'Email already in use.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/user-disabled':
            return 'This user account has been disabled.';
        case 'auth/user-not-found':
            return 'No user found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection and try again.';
        default:
            return err?.message || 'Authentication error.';
    }
}

async function retryable<T>(fn: () => Promise<T>, attempts = 2, delayMs = 300) {
    let lastErr: any = null;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            if (!isTransientError(err)) break;
            // exponential backoff
            await new Promise<void>((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)));
        }
    }
    throw lastErr;
}

export async function signIn(email: string, password: string): Promise<any | null> {
    if (!auth) {
        console.warn('Auth module not initialized. Is @react-native-firebase/auth installed?');
        throw new Error('Auth not initialized');
    }

    try {
        const credential: any = await retryable(() => auth.signInWithEmailAndPassword(email, password));
        return credential && credential.user ? credential.user : null;
    } catch (err: any) {
        const message = mapAuthError(err);
        const e: any = new Error(message);
        e.code = err?.code;
        throw e;
    }
}

export async function signUp(email: string, password: string, profile: { username?: string; name?: string; roles?: string[] } = {}): Promise<any | null> {
    if (!auth) {
        console.warn('Auth module not initialized. Is @react-native-firebase/auth installed?');
        throw new Error('Auth not initialized');
    }

    try {
        const credential: any = await retryable(() => auth.createUserWithEmailAndPassword(email, password));
        const user = credential && credential.user ? credential.user : null;

        // create users/{uid} profile document (best-effort)
        if (user && firestore) {
            try {
                const userRef = firestore.collection('users').doc(user.uid);
                const newUserProfile = {
                    id: user.uid,
                    email: user.email,
                    username: profile.username || (user.displayName || '').replace(/\s+/g, '').toLowerCase() || '',
                    name: profile.name || user.displayName || '',
                    roles: profile.roles || ['user'],
                    createdAt: firestore.FieldValue ? firestore.FieldValue.serverTimestamp() : null,
                };
                await userRef.set(newUserProfile);
            } catch (e) {
                // best-effort: don't fail signup if profile write fails
                console.warn('Failed to create users profile after signUp', e);
            }
        }

        return user;
    } catch (err: any) {
        const message = mapAuthError(err);
        const e: any = new Error(message);
        e.code = err?.code;
        throw e;
    }
}

export async function signOut(): Promise<void> {
    if (!auth) {
        console.warn('Auth module not initialized.');
        return;
    }

    try {
        await auth.signOut();
    } catch (err) {
        console.warn('signOut error', err);
        throw err;
    }
}

export function onAuthStateChanged(callback: (user: any | null) => void): Unsubscribe {
    if (!auth) {
        console.warn('Auth module not initialized. onAuthStateChanged is a no-op');
        return () => { };
    }

    const unsub = auth.onAuthStateChanged((user: any) => {
        callback(user || null);
    });

    return () => unsub && unsub();
}

/** Non-blocking helpers (fire-and-forget) modeled after web-studio utilities. */
export function initiateAnonymousSignIn(): void {
    if (!auth) {
        console.warn('Auth module not initialized. Cannot sign in anonymously.');
        return;
    }

    // Fire-and-forget
    try {
        // @ts-ignore
        auth.signInAnonymously().catch((e: any) => console.warn('Anonymous sign-in error', e));
    } catch (e) {
        console.warn('Anonymous sign-in error (sync)', e);
    }
}

export function initiateEmailSignIn(email: string, password: string): void {
    if (!auth) {
        console.warn('Auth module not initialized. Cannot sign in with email.');
        return;
    }

    try {
        // @ts-ignore
        auth.signInWithEmailAndPassword(email, password).catch((e: any) => console.warn('Email sign-in error', e));
    } catch (e) {
        console.warn('Email sign-in error (sync)', e);
    }
}

export function initiateGoogleSignIn(): void {
    if (!auth) {
        console.warn('Auth module not initialized. Cannot sign in with Google.');
        return;
    }

    const provider = new GoogleAuthProvider();

    try {
        // @ts-ignore
        auth.signInWithPopup(provider).catch((e: any) => console.warn('Google sign-in error', e));
    } catch (e) {
        console.warn('Google sign-in error (sync)', e);
    }
}

export default { signIn, signOut, onAuthStateChanged };
