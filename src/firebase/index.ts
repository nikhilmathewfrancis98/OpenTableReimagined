// Firebase initialization helpers for React Native
// This file uses the native @react-native-firebase modules when available.
import firebaseConfig, { FIREBASE_USE_NATIVE } from './config';

let authModule: any = null;
let firestoreModule: any = null;

if (FIREBASE_USE_NATIVE) {
    try {
        // Native firebase modules (must be installed and linked)
        // These imports must be static for Metro to include native modules.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        authModule = require('@react-native-firebase/auth').default;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        firestoreModule = require('@react-native-firebase/firestore').default;
    } catch (e) {
        // If native modules aren't available, keep them null and consumer should fall back.
        // console.warn('Native Firebase modules not available', e);
    }
}

/**
 * Returns initialized modules depending on configuration.
 * - If `FIREBASE_USE_NATIVE` is true and native modules are installed,
 *   this returns `{ auth, firestore }` from `@react-native-firebase`.
 * - If native modules are not used, consumers should initialize the Web SDK themselves.
 */
export function initFirebase() {
    if (FIREBASE_USE_NATIVE && authModule && firestoreModule) {
        return { auth: authModule(), firestore: firestoreModule() };
    }

    // Web SDK path (consumer can initialize Web SDK using firebaseConfig)
    return { config: firebaseConfig };
}

export const auth = authModule ? authModule() : null;
export const firestore = firestoreModule ? firestoreModule() : null;

export default initFirebase;
