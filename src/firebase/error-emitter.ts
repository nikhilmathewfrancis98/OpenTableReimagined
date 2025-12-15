// Simple strongly-typed event emitter used across the app (ported from web-studio)
type Callback<T> = (data: T) => void;

function createEventEmitter<T extends Record<string, any>>() {
    const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};

    return {
        on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
            if (!events[eventName]) events[eventName] = [];
            events[eventName]!.push(callback);
        },
        off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
            if (!events[eventName]) return;
            events[eventName] = events[eventName]!.filter((cb) => cb !== callback);
        },
        emit<K extends keyof T>(eventName: K, data: T[K]) {
            if (!events[eventName]) return;
            events[eventName]!.forEach((cb) => cb(data));
        },
    };
}

export const errorEmitter = createEventEmitter<Record<string, any>>();

export default errorEmitter;
