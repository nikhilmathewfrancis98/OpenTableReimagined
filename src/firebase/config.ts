/**
 * Firebase config for React Native
 *
 * This file provides a single place to keep the Firebase configuration values
 * and documents two common approaches for using Firebase in React Native:
 *
 * 1) Native modules: `@react-native-firebase/*` (recommended for production)
 *    - Requires native files: `android/app/google-services.json` and
 *      `ios/GoogleService-Info.plist` and the native setup steps.
 *
 * 2) Web SDK: `firebase` JavaScript SDK
 *    - Can be used without native files but may need polyfills for some APIs.
 *
 * Replace the placeholder values or provide them via environment variables.
 */

// Prefer react-native-config values when available (production-ready).
let RNConfig: any = null;
try {
    // dynamic require so library is optional during initial development
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    RNConfig = require('react-native-config').default || require('react-native-config');
} catch (e) {
    RNConfig = null;
}

const _env = RNConfig ?? (globalThis as any)?.process?.env ?? {};

export const firebaseConfig = {
    apiKey: _env.FIREBASE_API_KEY || '<API_KEY>',
    authDomain: _env.FIREBASE_AUTH_DOMAIN || '<PROJECT>.firebaseapp.com',
    projectId: _env.FIREBASE_PROJECT_ID || '<PROJECT_ID>',
    storageBucket: _env.FIREBASE_STORAGE_BUCKET || '<PROJECT>.appspot.com',
    messagingSenderId: _env.FIREBASE_MESSAGING_SENDER_ID || '<SENDER_ID>',
    appId: _env.FIREBASE_APP_ID || '<APP_ID>',
};

export const FIREBASE_USE_NATIVE = (_env.FIREBASE_USE_NATIVE === 'false' || _env.FIREBASE_USE_NATIVE === false) ? false : true;

export default firebaseConfig;
