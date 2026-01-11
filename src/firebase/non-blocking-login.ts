// Auth helpers using @react-native-firebase/auth when available.
// Falls back to no-op if native modules aren't installed.
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleAuthProvider } from '@react-native-firebase/auth';

type Unsubscribe = () => void;

// const BACKEND_BASE = (globalThis as any)?.BACKEND_URL || 'http://10.123.36.249:4000';
const BACKEND_BASE = "https://us-central1-studio-1307585505-5b6be.cloudfunctions.net/api";

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
    console.log('[auth] signIn function called with:', email);
    if (!auth) {
        console.warn('Auth module not initialized. Is @react-native-firebase/auth installed?');
        throw new Error('Auth not initialized');
    }
    console.log('[auth] Testing server connection...');
    try {
        const healthRes = await fetch('https://us-central1-studio-1307585505-5b6be.cloudfunctions.net/api/health');
        console.log('[auth] Health response status:', healthRes.status);
        const healthData = await healthRes.json();
        console.log('[auth] Health check success:', healthData);
    } catch (err) {
        console.error('[auth] Health check failed:', err);
    }
    try {
        console.log('[auth] signIn start', { email });
        console.log('[auth] server signIn start', { email });

        const res = await fetch(`${BACKEND_BASE}/api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        console.log("Response from server: ", res);
        const data = await res.json();
        if (!res.ok) {
            const msg = (data && (data.error || data.details || JSON.stringify(data))) || 'Sign in failed';
            console.warn('[auth] server signIn failed', msg);
            const e: any = new Error(msg);
            e.code = data?.error?.code;
            throw e;
        }

        const { customToken, uid } = data;
        console.log('[auth] received customToken from server for uid=', uid);

        // Sign in the Firebase client SDK with the custom token
        const credential: any = await retryable(() => auth().signInWithCustomToken(customToken));
        const user = credential && credential.user ? credential.user : null;
        console.log('[auth] signIn with custom token success', { uid: user?.uid, email: user?.email });

        return user;
    } catch (err: any) {
        const message = mapAuthError(err);
        const e: any = new Error(message);
        e.code = err?.code;
        throw e;
    }
}

import { setDocumentNonBlocking } from './non-blocking-updates';
import api from '../lib/api';

// Backend base URL (override via global BACKEND_URL for devices)


export async function signUp(email: string, password: string, profile: { username?: string; name?: string; roles?: string[] } = {}): Promise<any | null> {
    if (!auth) {
        console.warn('Auth module not initialized. Is @react-native-firebase/auth installed?');
        throw new Error('Auth not initialized');
    }

    try {
        console.log('[auth] signUp start', { email, username: profile.username });
        const res = await fetch(`${BACKEND_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, username: profile.username, name: profile.name }),
        });

        const data = await res.json();
        if (!res.ok) {
            const msg = (data && (data.error || data.details || JSON.stringify(data))) || 'Sign up failed';
            console.warn('[auth] server signUp failed', msg);
            const e: any = new Error(msg);
            e.code = data?.error?.code;
            throw e;
        }

        const { customToken, uid } = data;
        console.log('[auth] received customToken from server for uid=', uid);

        // Sign in the Firebase client SDK with the custom token
        const credential: any = await retryable(() => auth().signInWithCustomToken(customToken));
        const user = credential && credential.user ? credential.user : null;
        console.log('[auth] signUp and signIn with custom token success', { uid: user?.uid, email: user?.email });

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
        await auth().signOut();
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

    const unsub = auth().onAuthStateChanged((user: any) => {
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

/**
 * Returns the current user's ID token (JWT) which can be sent to backend services.
 * If `forceRefresh` is true the SDK will refresh the token.
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
    try {
        if (!auth) return null;
        const user = auth().currentUser;
        if (!user) {
            console.log('[auth] getIdToken: No current user');
            return null;
        }

        console.log('[auth] getIdToken called, forceRefresh=', forceRefresh, 'for user:', user.uid);

        const token = await user.getIdToken(forceRefresh);

        if (token) {
            console.log('[auth] getIdToken success, token length=', token.length);
            // Log basic token info (skip detailed parsing for React Native compatibility)
            console.log('[auth] Token received successfully');
        } else {
            console.warn('[auth] getIdToken returned null token');
        }

        return token || null;
    } catch (err: any) {
        console.error('[auth] getIdToken error:', err);
        // Log specific error types for better debugging
        const errorCode = (err as any).code;
        if (errorCode === 'auth/user-token-expired') {
            console.error('[auth] Token expired, refresh needed');
        } else if (errorCode === 'auth/user-disabled') {
            console.error('[auth] User account disabled');
        } else if (errorCode === 'auth/user-not-found') {
            console.error('[auth] User not found');
        }
        return null;
    }
}

/**
 * Convenience helper returning an Authorization header value or null.
 */
export async function getAuthHeader(forceRefresh = false): Promise<string | null> {
    const token = await getIdToken(forceRefresh);
    const header = token ? `Bearer ${token}` : null;
    console.log('[auth] getAuthHeader created', header ? '[REDACTED]' : null);
    return header;
}
