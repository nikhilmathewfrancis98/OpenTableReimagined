import { useContext } from 'react';
import { AuthContext } from '../firebase/provider';
import useDoc from '../firebase/firestore/use-doc';

export default function useUser() {
    const ctx: any = useContext(AuthContext as any);
    const authUser = ctx?.user ?? null;
    const authLoading = ctx?.loading ?? false;
    const { data: firestoreUser, isLoading: profileLoading, error } = useDoc(authUser ? `users/${authUser.uid}` : null);

    return { authUser, firestoreUser, loading: authLoading || profileLoading, error };
}

export { useUser };
