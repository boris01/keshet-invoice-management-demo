---
name: Caching
description: Best practices and coding standards for Caching.
---

## Caching

### 1 NestJS — `@nestjs/cache-manager` Setup

Use the official `@nestjs/cache-manager` with `cache-manager` v5+ and a Keyv store for Redis:

```bash
npm install @nestjs/cache-manager cache-manager keyv @keyv/redis
```

```typescript
// app.module.ts
CacheModule.registerAsync({
  isGlobal: true,
  useFactory: () => {
    const store = new KeyvRedis(process.env.REDIS_URL || 'redis://localhost:6379');
    return {
      store: createCache(new Keyv({ store })),
      ttl: 30_000,   // Default TTL in milliseconds
    };
  },
}),
```

### 2 Using Cache in Services

```typescript
@Injectable()
export class MyService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getExpensiveData(key: string): Promise<Data> {
    // Check cache first
    const cached = await this.cache.get<Data>(`data:${key}`);
    if (cached) return cached;

    // Compute and cache
    const data = await this.computeExpensiveData(key);
    await this.cache.set(`data:${key}`, data, 60_000); // 60s TTL
    return data;
  }
}
```

### 3 Cache Invalidation Patterns

- **TTL-based** (simple): Set appropriate `ttl` per key. Use short TTLs (5-30s) for frequently changing data.
- **Event-based** (precise): Call `this.cache.del(key)` when the underlying data is mutated.
- **Prefix namespacing**: Use `entity:id` pattern (e.g., `invoice:abc-123`) to enable targeted invalidation.

### 4 Cache Gotchas

- **Don't cache user-specific data** with global keys — always include the user/session identifier in the key.
- **Don't cache errors** — only cache successful results.
- **Redis connection failure** should not crash the app. The cache layer should degrade gracefully (fall through to the database).
- **Serialization**: Cached values must be JSON-serializable. Class instances, `Date` objects, and `Buffer`s need explicit serialization.

### 5 Angular — Frontend Caching

- Use `shareReplay({ bufferSize: 1, refCount: true })` on observables that multiple subscribers need.
- For offline/stale-while-revalidate, consider the `@angular/service-worker`.
- Never cache signals that track UI state — those are inherently transient.

---

