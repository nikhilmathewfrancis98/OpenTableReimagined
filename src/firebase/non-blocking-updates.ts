import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

// Import Firestore methods from @react-native-firebase/firestore shape
// We accept the RN firestore instance exported from ./index
import { firestore } from './index';

/** Fire-and-forget set on a document reference. */
export function setDocumentNonBlocking(docRef: any, data: any, options?: any) {
    if (!firestore || !docRef) {
        console.warn('setDocumentNonBlocking: firestore not initialized or docRef missing');
        return;
    }

    try {
        // @ts-ignore
        docRef.set(data, options).catch((err: any) => {
            const e = new FirestorePermissionError({ path: docRef.path || docRef._documentPath || 'unknown', operation: 'write', requestResourceData: data });
            errorEmitter.emit('permission-error', e);
        });
    } catch (err) {
        const e = new FirestorePermissionError({ path: docRef.path || docRef._documentPath || 'unknown', operation: 'write', requestResourceData: data });
        errorEmitter.emit('permission-error', e);
    }
}

/** Fire-and-forget add to collection. Returns the promise (optional). */
export function addDocumentNonBlocking(colRef: any, data: any) {
    if (!firestore || !colRef) {
        console.warn('addDocumentNonBlocking: firestore not initialized or colRef missing');
        return Promise.reject(new Error('firestore not initialized'));
    }

    const promise = colRef.add(data).catch((err: any) => {
        const e = new FirestorePermissionError({ path: colRef.path || 'unknown', operation: 'create', requestResourceData: data });
        errorEmitter.emit('permission-error', e);
    });

    return promise;
}

/** Fire-and-forget update on a document reference. */
export function updateDocumentNonBlocking(docRef: any, data: any) {
    if (!firestore || !docRef) {
        console.warn('updateDocumentNonBlocking: firestore not initialized or docRef missing');
        return;
    }

    try {
        // @ts-ignore
        docRef.update(data).catch((err: any) => {
            const e = new FirestorePermissionError({ path: docRef.path || docRef._documentPath || 'unknown', operation: 'update', requestResourceData: data });
            errorEmitter.emit('permission-error', e);
        });
    } catch (err) {
        const e = new FirestorePermissionError({ path: docRef.path || docRef._documentPath || 'unknown', operation: 'update', requestResourceData: data });
        errorEmitter.emit('permission-error', e);
    }
}

/** Fire-and-forget delete on a document reference. */
export function deleteDocumentNonBlocking(docRef: any) {
    if (!firestore || !docRef) {
        console.warn('deleteDocumentNonBlocking: firestore not initialized or docRef missing');
        return;
    }

    try {
        // @ts-ignore
        docRef.delete().catch((err: any) => {
            const e = new FirestorePermissionError({ path: docRef.path || docRef._documentPath || 'unknown', operation: 'delete' });
            errorEmitter.emit('permission-error', e);
        });
    } catch (err) {
        const e = new FirestorePermissionError({ path: docRef.path || docRef._documentPath || 'unknown', operation: 'delete' });
        errorEmitter.emit('permission-error', e);
    }
}

export default { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking };
