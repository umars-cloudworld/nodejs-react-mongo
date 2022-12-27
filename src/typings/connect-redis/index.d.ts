declare module 'connect-redis' {
    interface RedisStore {
        all(callback: (err: unknown, obj: Session[]) => void): void;
    }
}
