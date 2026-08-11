let listeners = {}

export function on(event, callback) {
    (listeners[event] ??= []).push(callback);
}

export function emit(event, ...args) {
   (listeners[event] ??= []).forEach(callback => callback(...args))
}