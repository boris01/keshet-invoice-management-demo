---
name: NestJS — Backend Standards
description: Best practices and coding standards for NestJS — Backend Standards.
---

## NestJS — Backend Standards

### 1 Clean Architecture Module Layout

```
feature-module/
├── domain/          # Entities, value objects, interfaces
├── application/     # Services, use-cases, provider interfaces + tokens
├── infrastructure/  # TypeORM repos, external integrations, seeders
└── presentation/    # Controllers, request/response DTOs
```

### 2 TypeORM Entity Registration

```typescript
// ❌ NEVER use glob patterns — they silently fail in webpack production builds
entities: [__dirname + '/../**/*.entity.{ts,js}'];

// ✅ ALWAYS use explicit entity imports
import { UserEntity } from '../users/domain/user.entity';
import { OrderEntity } from '../orders/domain/order.entity';
entities: [UserEntity, OrderEntity];
```

### 3 Route Ordering in Controllers

Express matches routes top-to-bottom. **Static segments MUST be declared before parameterized segments**, or they'll be swallowed:

```typescript
@Get('stats')       // ✅ Must come FIRST — "stats" is a literal
getStats() {}

@Get(':id')          // Comes after all static routes
getById(@Param('id') id: string) {}
```

### 4 CommonJS Imports for Webpack-Bundled Libraries

Certain Node.js libraries export a constructor or default function that breaks under ESM star-import. Use `require`-style import:

```typescript
// PDFKit
import PDFDocument = require('pdfkit'); // ✅ gives callable constructor
import * as PDFDocument from 'pdfkit'; // ❌ "PDFDocument is not a constructor"

// Opossum (circuit breaker)
import CircuitBreaker = require('opossum'); // ✅ correct
import * as CircuitBreaker from 'opossum'; // ❌ breaks at runtime
```

### 5 ThrottlerGuard Interaction with Frontend Libraries

When using `@nestjs/throttler` globally, be aware that frontend libraries like **PDF.js** fire dozens of HTTP Range requests per document. Configure them to download files in a single request:

```typescript
// In Angular component
pdfjsLib.getDocument({
  url: fileUrl,
  disableRange: true,
  disableStream: true,
});
```

### 6 `__dirname` in Webpack Bundles

In a webpack-bundled NestJS app (Nx default), `__dirname` resolves to the **output directory** (e.g., `dist/apps/server`), not the source tree:

```typescript
path.join(__dirname, 'assets', 'data'); // ✅ relative to dist output
path.join(__dirname, '..', '..', 'assets'); // ❌ wrong — escapes the output dir
```

### 7 Global Filters and Guards

Register global concerns in `main.ts`:

```typescript
const app = await NestFactory.create(AppModule, { bufferLogs: true });
app.useLogger(app.get(PinoLogger));
app.enableCors();
app.useGlobalFilters(new HttpExceptionFilter());
```

Register `ThrottlerGuard` as `APP_GUARD` in the root module:

```typescript
providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }];
```

---

