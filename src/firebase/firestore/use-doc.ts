import { useEffect, useState } from 'react';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { firestore } from '../index';

/** Hook to subscribe to a single document in Firestore (React Native).
 *  @param path string path to document (e.g. 'posts/abc')
 */
export function useDoc<T = any>(path: string | null | undefined) {
    const [data, setData] = useState<(T & { id: string }) | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!path) {
            setData(null);
            setIsLoading(false);
            setError(null);
            return;
        }

        if (!firestore) {
            setData(null);
            setIsLoading(false);
            setError(new Error('Firestore not initialized'));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const ref = firestore.doc(path as string);
            const unsubscribe = ref.onSnapshot(
                (snapshot: any) => {
                    if (snapshot.exists && typeof snapshot.exists === 'function' ? snapshot.exists() : snapshot.exists) {
                        setData({ ...(snapshot.data() as T), id: snapshot.id });
                    } else {
                        setData(null);
                    }
                    setIsLoading(false);
                    setError(null);
                },
                (e: any) => {
                    const contextualError = new FirestorePermissionError({ operation: 'get', path });
                    setError(contextualError);
                    setData(null);
                    setIsLoading(false);
                    errorEmitter.emit('permission-error', contextualError);
                }
            );

            return () => unsubscribe && unsubscribe();
        } catch (e) {
            const contextualError = new FirestorePermissionError({ operation: 'get', path });
            setError(contextualError);
            setData(null);
            setIsLoading(false);
            errorEmitter.emit('permission-error', contextualError);
            return () => { };
        }
    }, [path]);

    return { data, isLoading, error };
}

export default useDoc;
// import { useEffect, useState } from 'react';

// export function useDoc<T = any>(path: string) {
//     const [data, setData] = useState<T | null>(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         // TODO: subscribe to document snapshot and map to data
//         setTimeout(() => {
//             setData(null);
//             setLoading(false);
//         }, 200);

//         return () => {
//             // unsubscribe
//         };
//     }, [path]);

//     return { data, loading };
// }

// export default useDoc;
