---
name: Testing
description: Best practices and coding standards for Testing.
---

## Testing

### 1 Mock External Services in Tests

Never make real HTTP calls, database queries, or file system operations in unit tests. Mock everything external:

```typescript
// ✅ NestJS — mock a service with a factory
const module = await Test.createTestingModule({
  providers: [
    OrderService,
    {
      provide: PaymentGateway,
      useValue: {
        charge: jest.fn().mockResolvedValue({ id: "txn_123", status: "paid" }),
        refund: jest.fn().mockResolvedValue({ status: "refunded" }),
      },
    },
    {
      provide: getRepositoryToken(OrderEntity),
      useValue: {
        findOneBy: jest.fn().mockResolvedValue({ id: "1", total: 100 }),
        save: jest
          .fn()
          .mockImplementation((entity) => ({ id: "1", ...entity })),
      },
    },
  ],
}).compile();
```

```typescript
// ✅ Angular — mock a service in component tests
TestBed.configureTestingModule({
  providers: [
    {
      provide: InvoiceService,
      useValue: {
        invoices: signal([]),
        loading: signal(false),
        fetchInvoices: vi.fn(),
      },
    },
  ],
});
```

**Rules:**

- Mock at the **boundary** (HTTP, database, filesystem) — not internal classes
- Use `jest.fn()` (for Backend) / `vi.fn()` (for Frontend Vitest) so you can assert calls
- Each test should set up its own mocks — never share mutable state between tests
- Mock return values should be realistic (match actual DTOs/entities)

### 2 Use Supertest for E2E Testing

E2E tests should exercise the full NestJS request pipeline (guards, pipes, interceptors, controllers, services):

```typescript
import * as request from "supertest";

describe("InvoiceController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource) // Override only external deps
      .useValue(mockDataSource)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(() => app.close());

  it("GET /api/invoices returns paginated results", () => {
    return request(app.getHttpServer())
      .get("/api/invoices?page=1&pageSize=10")
      .expect(200)
      .expect((res) => {
        expect(res.body.items).toHaveLength(10);
        expect(res.body.total).toBeGreaterThan(0);
        expect(res.body.page).toBe(1);
      });
  });

  it("GET /api/invoices/:id returns 404 for missing invoice", () => {
    return request(app.getHttpServer())
      .get("/api/invoices/nonexistent-uuid")
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toContain("not found");
      });
  });

  it("POST /api/invoices validates input", () => {
    return request(app.getHttpServer())
      .post("/api/invoices")
      .send({ description: "" }) // missing required fields
      .expect(400);
  });
});
```

**Rules:**

- Apply the same global pipes, filters, and guards as `main.ts`
- Override only external providers (database, payment, email) — keep the rest real
- Test both success paths AND error paths (400, 404, 422, 500)
- Test query params, URL params, and body validation

### 3 Use Testing Module for Unit Tests

NestJS `Test.createTestingModule()` gives you a real DI container with controlled providers:

```typescript
describe("OrderService", () => {
  let service: OrderService;
  let repo: jest.Mocked<Repository<OrderEntity>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(OrderService);
    repo = module.get(getRepositoryToken(OrderEntity));
  });

  it("should throw NotFoundException for missing order", async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.getById("missing")).rejects.toThrow(NotFoundException);
  });

  it("should return the order when found", async () => {
    const mockOrder = { id: "1", total: 100 } as OrderEntity;
    repo.findOneBy.mockResolvedValue(mockOrder);

    const result = await service.getById("1");
    expect(result).toEqual(mockOrder);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: "1" });
  });
});
```

**Angular unit tests:**

```typescript
describe("InvoiceListComponent", () => {
  let fixture: ComponentFixture<InvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceListComponent],
      providers: [
        {
          provide: InvoiceService,
          useValue: { invoices: signal([]), loading: signal(false) },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceListComponent);
    fixture.detectChanges();
  });

  it("should show loading skeleton when loading", () => {
    // ...
  });
});
```

---
