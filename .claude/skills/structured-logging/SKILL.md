---
name: Structured Logging
description: Best practices and coding standards for Structured Logging.
---

## Structured Logging

### 1 NestJS — Pino Logger Setup

Use `nestjs-pino` for structured JSON logging with automatic correlation IDs:

```bash
npm install nestjs-pino pino-http
npm install -D pino-pretty   # REQUIRED for dev — server crashes without it
```

```typescript
// logger.module.ts
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
        autoLogging: true, // Auto-log every HTTP request
        genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
      },
    }),
  ],
})
export class AppLoggerModule {}
```

Bootstrap with Pino:

```typescript
const app = await NestFactory.create(AppModule, { bufferLogs: true });
app.useLogger(app.get(Logger)); // from nestjs-pino
```

> **CRITICAL**: Always install `pino-pretty` as a **dev dependency**. Without it, `pino-http` crashes at startup in development mode when the `transport.target` is set to `'pino-pretty'`.

### 2 Logging Best Practices

```typescript
// ✅ Use structured fields, not string interpolation
this.logger.log({ invoiceId: id, status: 'processing' }, 'Processing invoice');

// ❌ Avoid — not machine-parseable
this.logger.log(`Processing invoice ${id} with status processing`);
```

- **DO** log: request IDs, entity IDs, durations, status transitions, error details
- **DON'T** log: passwords, tokens, PII, full request/response bodies in production
- **DO** use log levels correctly: `debug` for dev detail, `info` for business events, `warn` for recoverable issues, `error` for failures

### 3 Angular — Frontend Logging

For frontend, errors are best surfaced via:

- `console.error()` for developer debugging (caught by browser DevTools)
- Toast/notification service for user-facing errors
- The HTTP error interceptor (§3.1) for automatic API error reporting

Avoid `console.log()` in production — use it only inside `catch` blocks or behind a `isDevMode()` check.

---

