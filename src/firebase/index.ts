// Firebase initialization for React Native using @react-native-firebase only
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Export initialized Firebase modules
export { auth, firestore };

// Initialize Firebase (native modules auto-initialize)
export function initFirebase() {
    return { auth, firestore };
}

export default initFirebase;
