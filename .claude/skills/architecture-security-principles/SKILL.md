---
name: Architecture & Security Principles
description: Best practices and coding standards for Architecture & Security Principles.
---

## Architecture & Security Principles

### 1 Single Responsibility for Services

Each service should have **one reason to change**. If a service handles both business logic AND external integrations, split it.

```typescript
// ❌ God service — does everything
@Injectable()
export class OrderService {
  async createOrder() {
    /* validate, save, send email, generate PDF, notify Slack */
  }
}

// ✅ Split by responsibility
@Injectable()
export class OrderService {
  // Business logic only
  async createOrder() {
    /* validate + save */
  }
}

@Injectable()
export class OrderNotificationService {
  // Notification concerns
  async notifyOrderCreated() {
    /* email + Slack */
  }
}

@Injectable()
export class OrderPdfService {
  // PDF generation
  async generateInvoice() {
    /* PDFKit rendering */
  }
}
```

**Angular equivalent**: Keep components thin. Extract HTTP calls into services, form logic into separate services, and reusable UI into shared components.

### 2 Proper Module Sharing Patterns

Modules should export only what other modules need. Never import the entire module when you only need one service.

```typescript
// ✅ Export only the public API
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService, UserRepository], // internal providers
  exports: [UserService], // only expose the service
})
export class UserModule {}

// ✅ Consuming module imports the module, not individual providers
@Module({
  imports: [UserModule], // gets access to UserService
})
export class OrderModule {}
```

**Rules:**

- Never export repositories or infrastructure — only application-layer services
- If multiple modules need the same utility, move it to a `SharedModule` or `libs/shared`
- Use `forRoot()` / `forFeature()` pattern for configurable modules (like TypeORM, Cache)
- A `SharedModule` should NEVER import feature modules

### 3 Repository Pattern for Data Access

Always abstract database access behind a repository. Controllers and services should **never** use `EntityManager` or `DataSource` directly.

```typescript
// ✅ Repository in infrastructure/ layer
@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly repo: Repository<InvoiceEntity>,
  ) {}

  async findPaginated(page: number, pageSize: number): Promise<[InvoiceEntity[], number]> {
    return this.repo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<InvoiceEntity | null> {
    return this.repo.findOneBy({ id });
  }
}

// ✅ Service in application/ layer — uses repository, never raw queries
@Injectable()
export class InvoiceService {
  constructor(private readonly invoiceRepo: InvoiceRepository) {}

  async getInvoice(id: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }
}

// ❌ NEVER do this — business logic coupled to ORM internals
@Injectable()
export class BadService {
  constructor(private dataSource: DataSource) {}
  async getInvoice(id: string) {
    return this.dataSource.query('SELECT * FROM invoices WHERE id = $1', [id]);
  }
}
```

### 4 Interface Segregation Principle

Don't force consumers to depend on methods they don't use. Split large interfaces into focused ones.

```typescript
// ❌ Fat interface — forces implementors to provide everything
export interface IStorageProvider {
  getFile(id: string): Promise<Buffer>;
  saveFile(data: Buffer, name: string): Promise<string>;
  deleteFile(id: string): Promise<void>;
  listFiles(): Promise<FileInfo[]>;
  getSignedUrl(id: string): Promise<string>;
  migrateToS3(): Promise<void>;
}

// ✅ Segregated interfaces — consumers depend only on what they need
export interface IFileReader {
  getFile(id: string): Promise<Buffer>;
}

export interface IFileWriter {
  saveFile(data: Buffer, name: string): Promise<string>;
  deleteFile(id: string): Promise<void>;
}

export interface IFileAdmin {
  listFiles(): Promise<FileInfo[]>;
  migrateToS3(): Promise<void>;
}
```

**Angular equivalent**: Keep service APIs small. A service with 15+ public methods is a code smell — split by domain concern.

### 5 Avoid Service Locator Anti-Pattern

Never use `ModuleRef.get()` or `Injector.get()` to resolve dependencies at runtime. It hides the dependency graph and makes testing impossible.

```typescript
// ❌ Service Locator — hidden dependencies, untestable
@Injectable()
export class OrderService {
  constructor(private moduleRef: ModuleRef) {}

  async process() {
    const mailer = this.moduleRef.get(MailerService); // hidden dependency!
    const logger = this.moduleRef.get(LoggerService); // not visible in constructor
    // ...
  }
}

// ✅ Explicit constructor injection — visible, testable
@Injectable()
export class OrderService {
  constructor(
    private readonly mailer: MailerService,
    private readonly logger: LoggerService,
  ) {}

  async process() {
    // dependencies are visible, mockable, and type-checked
  }
}
```

**Exceptions**: `ModuleRef` is acceptable in factory providers or dynamic module loaders where the type is not known at compile time.

**Angular equivalent**: Never use `Injector.get()` in components. Use `inject()` function or constructor injection exclusively:

```typescript
// ✅ Angular — inject() at field level
private readonly http = inject(HttpClient);
private readonly router = inject(Router);

// ❌ Never resolve at runtime
const svc = this.injector.get(SomeService);
```

### 6 Sanitize Output to Prevent XSS

Angular automatically sanitizes interpolated values in templates, but there are critical exceptions:

```typescript
// ✅ Safe — Angular auto-escapes interpolation
template: `<div>{{ userInput() }}</div>`

// ⚠️ DANGEROUS — bypasses Angular's sanitizer
template: `<div [innerHTML]="userHtml()"></div>`

// ✅ If you MUST use innerHTML, sanitize explicitly
import { DomSanitizer } from '@angular/platform-browser';
private readonly sanitizer = inject(DomSanitizer);
readonly safeHtml = computed(() =>
  this.sanitizer.sanitize(SecurityContext.HTML, this.rawHtml()) || ''
);
```

**NestJS backend rules:**

- Never return raw user input in error messages without sanitization
- Use a library like `sanitize-html` or `xss` when storing/serving user-generated HTML
- Set security headers via `helmet`:

```bash
npm install helmet
```

```typescript
// main.ts
import helmet from 'helmet';
app.use(helmet());
```

### 7 Validate All Input with DTOs and Pipes

**Every** endpoint must validate incoming data using `class-validator` + `class-transformer` with a global `ValidationPipe`.

```bash
npm install class-validator class-transformer
```

```typescript
// ✅ Request DTO with validation decorators
export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

// ✅ Controller uses the DTO — auto-validated by global pipe
@Post()
create(@Body() dto: CreateInvoiceDto) {
  return this.invoiceService.create(dto);
}

// ✅ Validate URL params too
@Get(':id')
getById(@Param('id', ParseUUIDPipe) id: string) {
  return this.invoiceService.getById(id);
}
```

Register globally in `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip properties not in DTO
    forbidNonWhitelisted: true, // Throw on unexpected properties
    transform: true, // Auto-transform payloads to DTO instances
  }),
);
```

**Rules:**

- **Every `@Body()`** must reference a class with `class-validator` decorators
- **Every `@Param()`** should use a built-in pipe (`ParseUUIDPipe`, `ParseIntPipe`, etc.)
- **Every `@Query()`** should use a DTO or explicit pipes for type safety
- **`whitelist: true`** is mandatory — prevents mass-assignment attacks
- Never trust raw `req.body` or `req.params` — always go through validation

---

