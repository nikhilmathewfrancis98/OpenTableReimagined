import { useCallback } from 'react';
// Simple toast hook placeholder. Replace with a proper implementation (react-native-toast-message etc.)
export function useToast() {
    const show = useCallback((message: string) => {
        // TODO: integrate with a RN toast library
        // console.warn used as fallback
        console.warn('Toast:', message);
    }, []);

    return { show };
}

export default useToast;
