// General utility helpers ported from web-studio/lib/utils.ts
export function noop() { }

export function formatDateISO(d?: Date) {
    const date = d || new Date();
    return date.toISOString();
}

export default { noop, formatDateISO };
