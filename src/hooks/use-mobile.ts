import { useMemo } from 'react';
import { Platform } from 'react-native';

export function useMobile() {
    const isMobile = useMemo(() => Platform.OS === 'ios' || Platform.OS === 'android', []);
    return { isMobile };
}

export default useMobile;
