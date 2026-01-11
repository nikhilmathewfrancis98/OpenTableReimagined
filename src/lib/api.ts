import { getAuthHeader } from '../firebase/non-blocking-login';

// Use `any`-friendly signatures to avoid DOM-only TypeScript types in RN projects.
type FetchOptions = any & { retryOnUnauthorized?: boolean; maxRetries?: number };

function normalizeHeaders(headersLike: any): Record<string, string> {
    const out: Record<string, string> = {};
    if (!headersLike) return out;

    // Headers instance (whatwg) — iterate if present
    try {
        if (typeof headersLike.forEach === 'function') {
            // Headers and some implementations expose forEach
            // @ts-ignore
            headersLike.forEach((v: string, k: string) => (out[k] = v));
            return out;
        }
    } catch (e) {
        // fallthrough
    }

    // Plain object
    if (typeof headersLike === 'object') {
        for (const k of Object.keys(headersLike)) {
            const val = (headersLike as any)[k];
            if (val != null) out[k] = String(val);
        }
    }

    return out;
}

/**
 * Enhanced fetch wrapper that adds `Authorization: Bearer <idToken>` when available.
 * On 401 it will attempt one forced refresh of the token and retry once.
 * Includes comprehensive logging and error handling.
 */
export async function apiFetch(input: any, init?: FetchOptions): Promise<any> {
    const options: FetchOptions = {
        retryOnUnauthorized: init?.retryOnUnauthorized ?? true,
        maxRetries: init?.maxRetries ?? 1,
        ...(init || {})
    };

    let retryCount = 0;

    async function doFetch(forceRefresh = false): Promise<any> {
        try {
            const baseHeaders = normalizeHeaders(options.headers);
            const authHeader = await getAuthHeader(forceRefresh);

            if (authHeader) {
                baseHeaders['Authorization'] = authHeader;
                console.log(`[apiFetch] Request ${retryCount + 1}: Auth header attached`);
            } else {
                console.log(`[apiFetch] Request ${retryCount + 1}: No auth header available`);
            }

            const res = await fetch(input, { ...options, headers: baseHeaders });

            // Log response status for debugging
            console.log(`[apiFetch] Response status: ${res.status} for ${input}`);

            return res;
        } catch (error) {
            console.error(`[apiFetch] Network error on attempt ${retryCount + 1}:`, error);
            throw error;
        }
    }

    let res = await doFetch(false);

    // Handle 401 unauthorized with token refresh
    if (res && res.status === 401 && options.retryOnUnauthorized && retryCount < options.maxRetries) {
        retryCount++;
        console.log(`[apiFetch] Got 401, retrying with force token refresh (attempt ${retryCount})`);
        try {
            res = await doFetch(true);
        } catch (error) {
            console.error('[apiFetch] Retry after 401 failed:', error);
            throw error;
        }
    }

    return res;
}

/**
 * Helper method for common API calls with JSON response handling
 */
export async function apiCall<T = any>(url: string, options?: FetchOptions): Promise<T> {
    const response = await apiFetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[apiCall] API Error ${response.status}:`, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    try {
        return await response.json();
    } catch (error) {
        console.error('[apiCall] JSON parse error:', error);
        throw new Error('Invalid JSON response');
    }
}

export default { apiFetch, apiCall };
