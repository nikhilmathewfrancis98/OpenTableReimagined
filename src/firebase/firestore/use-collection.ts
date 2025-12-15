// Hook skeleton for subscribing to a Firestore collection in RN.
// Adapt web-studio's implementation to use @react-native-firebase/firestore or web SDK as needed.
import { useEffect, useState, useRef } from 'react';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { firestore } from '../index';

/**
 * Cursor-based paginated collection hook.
 * - path: collection path
 * - opts: { pageSize, orderBy }
 */
export function useCollection<T = any>(path: string, opts?: { pageSize?: number; orderBy?: string }) {
    const pageSize = opts?.pageSize ?? 8;
    const orderBy = opts?.orderBy ?? 'createdAt';

    const [data, setData] = useState<(T & { id: string })[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const lastDocRef = useRef<any | null>(null);
    const hasMoreRef = useRef(true);

    async function fetchPage(startAfterDoc: any | null, append = false) {
        if (!path) return;
        if (!firestore) {
            setError(new Error('Firestore not initialized'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let q: any = firestore.collection(path).orderBy(orderBy, 'desc').limit(pageSize);
            if (startAfterDoc) q = q.startAfter(startAfterDoc);

            const snap = await q.get();
            const items: (T & { id: string })[] = [];
            snap.forEach((doc: any) => items.push({ ...(doc.data() as T), id: doc.id }));

            if (append) {
                setData((prev) => [...prev, ...items]);
            } else {
                setData(items);
            }

            lastDocRef.current = snap.docs.length ? snap.docs[snap.docs.length - 1] : lastDocRef.current;
            hasMoreRef.current = snap.docs.length === pageSize;
        } catch (e: any) {
            const contextualError = new FirestorePermissionError({ operation: 'list', path });
            setError(contextualError);
            errorEmitter.emit('permission-error', contextualError);
        } finally {
            setLoading(false);
        }
    }

    async function refresh() {
        lastDocRef.current = null;
        hasMoreRef.current = true;
        await fetchPage(null, false);
    }

    async function loadMore() {
        if (!hasMoreRef.current) return;
        await fetchPage(lastDocRef.current, true);
    }

    useEffect(() => {
        // initial load
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, pageSize, orderBy]);

    return { data, loading, error, refresh, loadMore, hasMore: hasMoreRef.current };
}

export default useCollection;
