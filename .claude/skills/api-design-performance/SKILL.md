---
name: API Design & Performance
description: Best practices and coding standards for API Design & Performance.
---

## API Design & Performance

### 1 Avoid N+1 Query Problems

The N+1 problem occurs when loading a list of entities triggers a separate query for each entity's relations:

```typescript
// ❌ N+1 — executes 1 query for invoices + N queries for fileStorage (one per invoice)
const invoices = await this.invoiceRepo.find();
for (const inv of invoices) {
  inv.file = await this.fileRepo.findOneBy({ id: inv.fileStorageId });
}

// ✅ Eager join — single query loads both
const invoices = await this.invoiceRepo.find({
  relations: ['fileStorage'],
});

// ✅ Alternative — manual join via QueryBuilder
const invoices = await this.invoiceRepo.createQueryBuilder('inv').leftJoinAndSelect('inv.fileStorage', 'fs').where('inv.status = :status', { status }).getMany();

// ✅ Alternative — batch load with IN clause
const invoices = await this.invoiceRepo.find({ where: { status } });
const fileIds = invoices.map((i) => i.fileStorageId);
const files = await this.fileRepo.find({ where: { id: In(fileIds) } });
```

**Detection:**

- Enable TypeORM query logging: `logging: true` in config
- Watch for repeated `SELECT` queries with different `WHERE id = ?` values
- Use `EXPLAIN ANALYZE` on slow queries

### 2 Use API Versioning for Breaking Changes

When making breaking changes to API contracts, version the endpoints instead of modifying existing ones:

```typescript
// ✅ URI versioning (most common)
@Controller({ path: 'invoices', version: '1' })
export class InvoiceV1Controller {
  @Get()
  getAll() {
    /* returns { items, total } */
  }
}

@Controller({ path: 'invoices', version: '2' })
export class InvoiceV2Controller {
  @Get()
  getAll() {
    /* returns { data, meta: { total, page } } */
  }
}

// Enable in main.ts
app.enableVersioning({ type: VersioningType.URI }); // → /v1/invoices, /v2/invoices
```

**Rules:**

- Only version when the **response shape** or **required params** change in a breaking way
- Adding optional fields to a response is NOT a breaking change — don't version for that
- Keep old versions alive until all clients migrate
- Document deprecation timelines in API docs

### 3 Use DTOs and Serialization for API Responses

Never expose raw entities to the API. Use response DTOs with `class-transformer` to control what gets serialized:

```typescript
// ✅ Response DTO — controls exactly what the client sees
export class InvoiceResponseDto {
  @Expose() id: string;
  @Expose() description: string;
  @Expose() total: number;
  @Expose() status: string;

  @Exclude() internalNotes: string;     // ← never sent to client
  @Exclude() deletedAt: Date;           // ← soft-delete field hidden

  @Transform(({ value }) => value?.toISOString())
  @Expose() createdAt: string;
}

// ✅ Controller — transform entity to DTO
@Get(':id')
async getById(@Param('id', ParseUUIDPipe) id: string) {
  const entity = await this.invoiceService.getById(id);
  return plainToInstance(InvoiceResponseDto, entity, { excludeExtraneousValues: true });
}
```

Or use a global `ClassSerializerInterceptor`:

```typescript
// main.ts or module-level
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

**Rules:**

- Never return TypeORM entities directly from controllers
- Use `@Exclude()` on sensitive fields (passwords, internal IDs, soft-delete timestamps)
- Use `@Transform()` for date formatting, enum labels, computed fields
- Request DTOs validate input (§10.7); Response DTOs control output

### 4 Use Interceptors for Cross-Cutting Concerns

Interceptors wrap the **entire** request/response lifecycle. Use them for concerns that apply across many endpoints:

```typescript
// ✅ Logging interceptor — times every request
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => this.logger.log(`${method} ${url} — ${Date.now() - start}ms`)),
    );
  }
}

// ✅ Transform interceptor — wraps all responses in a standard envelope
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { data: T }> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<{ data: T }> {
    return next.handle().pipe(map(data => ({ data, timestamp: new Date().toISOString() })));
  }
}

// ✅ Cache interceptor — built-in
@UseInterceptors(CacheInterceptor)
@Get('stats')
getStats() { /* cached automatically */ }
```

**Common interceptors:**
| Interceptor | Purpose |
|---|---|
| `LoggingInterceptor` | Request timing and audit trail |
| `TransformInterceptor` | Standard response envelope |
| `CacheInterceptor` | Auto-cache GET responses |
| `TimeoutInterceptor` | Kill slow requests |
| `ClassSerializerInterceptor` | Auto-apply `@Exclude()` / `@Expose()` |
| `CircuitBreakerInterceptor` | Wrap external calls with opossum |

### 5 Use Pipes for Input Transformation

Pipes run **before** the handler. Use them to validate AND transform incoming data:

```typescript
// ✅ Built-in pipes — use these for simple params
@Get(':id')
getById(@Param('id', ParseUUIDPipe) id: string) {}

@Get()
getAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {}

@Get()
getFiltered(@Query('active', new DefaultValuePipe(true), ParseBoolPipe) active: boolean) {}

// ✅ Custom pipe — for complex transformations
@Injectable()
export class TrimStringPipe implements PipeTransform {
  transform(value: string): string {
    return typeof value === 'string' ? value.trim() : value;
  }
}

// ✅ Global validation pipe (already covered in §10.7)
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

**Pipe execution order:** Global pipes → Controller pipes → Route pipes → Param pipes. Each transforms the value for the next.

---

