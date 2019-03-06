declare module 'event-emitter' {
    export default function (prototype: object): void;
}

interface EventEmitter {
    emit(event: string, ...args: any)
    on(event: string, listener: (...args: any) => void)
}