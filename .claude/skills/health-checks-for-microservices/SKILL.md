---
name: Health Checks for Microservices
description: Best practices and coding standards for Health Checks for Microservices.
---

## Health Checks for Microservices

### 1 Setup with `@nestjs/terminus`

```bash
npm install @nestjs/terminus
```

```typescript
// health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database connectivity
      () => this.db.pingCheck('database'),

      // Redis / external service reachability
      () => this.http.pingCheck('redis', 'http://redis:6379'),

      // Memory usage (fail if heap > 300MB)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Disk usage (fail if > 90% used)
      () => this.disk.checkStorage('disk', { thresholdPercent: 0.9, path: '/' }),
    ]);
  }

  // Lightweight liveness probe — no dependency checks
  @Get('live')
  live() {
    return { status: 'ok' };
  }
}
```

```typescript
// health/health.module.ts
@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}

// Register in AppModule
@Module({
  imports: [HealthModule /* ...other modules */],
})
export class AppModule {}
```

### 2 Custom Health Indicator

For application-specific checks (queue depth, external API status, license validity):

```typescript
@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  constructor(private readonly queueService: QueueService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const depth = await this.queueService.getQueueDepth();
    const isHealthy = depth < 10_000;

    const result = this.getStatus(key, isHealthy, { queueDepth: depth });
    if (isHealthy) return result;
    throw new HealthCheckError('Queue is too deep', result);
  }
}
```

### 3 Docker Compose Integration

```yaml
services:
  server:
    build: ./docker/server
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U $POSTGRES_USER']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
```

### 4 Kubernetes Probes

```yaml
# In k8s deployment spec
containers:
  - name: server
    livenessProbe: # Is the process alive?
      httpGet:
        path: /api/health/live
        port: 3000
      initialDelaySeconds: 15
      periodSeconds: 20
    readinessProbe: # Is it ready to serve traffic?
      httpGet:
        path: /api/health
        port: 3000
      initialDelaySeconds: 5
      periodSeconds: 10
    startupProbe: # Has it finished starting?
      httpGet:
        path: /api/health/live
        port: 3000
      failureThreshold: 30
      periodSeconds: 10
```

### 5 Health Check Rules

- **`/health`** (readiness) checks ALL dependencies (DB, Redis, disk, memory). Used by load balancers to route traffic.
- **`/health/live`** (liveness) returns `{ status: 'ok' }` with zero dependency checks. Used by orchestrators to decide restarts.
- **Never** put expensive operations in health checks — they run every 10-30 seconds.
- **Never** require authentication on health endpoints — orchestrators call them without tokens.
- Use `start_period` / `startupProbe` to avoid false failures during cold start.
- Return **structured JSON** so monitoring tools can parse individual component statuses.

