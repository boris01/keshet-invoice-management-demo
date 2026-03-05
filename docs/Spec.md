# Generate Invoice Management App

## What to Build

A full-stack **invoice management application** called "Keshet" (קשת) with:

- **Backend**: NestJS 11 with TypeORM (SQLite in-memory), serving a REST API
- **Frontend**: Angular 21+ (zoneless, signals-only, OnPush), displaying invoices with PDF preview
- **Monorepo**: Nx workspace with shared types in `libs/shared`
- **Docker**: Multi-stage builds for both client (nginx) and server (node:22-alpine)

Before writing ANY code, read `CLAUDE.md` for critical rules and the individual skills in `.claude/skills/` for detailed patterns.

---

## UI Specification

The UI has **2 screens**. Reference images are in `docs/ui-reference-*.png`. **The default locale is Hebrew (RTL).** The app must also support English (LTR) with a runtime toggle.

### Screen 1: Invoice List (main screen)

**Blue header strip**: Full-width blue gradient bar (`#4285f4` → `#5a9cf5`) across the top. Contains:

- Top-right corner: "קשת" (Keshet) brand text in colorful/rainbow style
- Top-left corner: circular teal icon with a stylized symbol

**Controls bar** (white/light strip below the header, with slight shadow):

- **Far left** (in RTL this is the start): Two small icon buttons — a grid/tiles icon (⊞) and a hamburger menu icon (☰)

- **Left group**: Filter funnel icon (▽) + search input (🔍 placeholder "חיפוש...") + date range picker button ("11.04.2023 - 11.04.2023" with 📅 icon)
- **Right group (visually separated, in a raised/bordered container)**: 4 white rectangular count boxes, each showing a **number on top** and **Hebrew label below**: "8 הכל" (All), "8 מאושר" (Approved), "8 בטיפול" (In Process), "8 ממתין לאישור" (Pending Approval). The rightmost box is slightly wider to fit the 2-line label. Clicking a box filters the list by that status.

**Data table** (full width, below controls bar):

- **RTL layout** — columns right-to-left:
  1. **תיאור השובר** (Invoice Description): Status circle icon on far right of row + description text (bold) + date below in small gray text (e.g. "01/01/2024")
  2. **ספק** (Supplier): Supplier name
  3. **עלות** (Cost): Amount in ₪ with comma separators, left-aligned
- Gray column header row with Hebrew labels
- Rows have subtle alternating light gray/white backgrounds with thin gray bottom borders
- **Status icons on the FAR RIGHT of each row** (first visual column in RTL):
  - Hollow gray/dark circle ○ — pending/default
  - Green circle with white checkmark ✓ — approved
  - Red circle with white X ✗ — rejected
  - Dark gray/black circle with checkmark — in process
- Selected row: full blue highlight (`#d2e3fc` background) spanning the entire row width

**Row interactions**:

- Single click → selects row (blue highlight) + opens PDF panel on the LEFT side (~40% width)
- Double click → navigates to detail screen
- On mobile touch: tap-timing pattern (350ms threshold) since `dblclick` doesn't fire

**PDF preview panel** (LEFT side in RTL, appears when a row is selected):

- White card with shadow, showing the invoice rendered as a PDF preview (use pdf.js / pdfjs-dist canvas rendering, NOT iframe)
- Invoice follows a professional template: bold "INVOICE" header top-left, company logo+name ("WANDERERS INC.") top-right, BILL TO section, date + invoice number, red-accented description table (DESCRIPTION | HOURS | PRICE | TOTAL columns), total amount, PAYMENT METHOD + NOTES section, "Thank you!" closing with signature line, footer URL
- **3 pagination dots at bottom center** (● ● ○ style) — dark dots for current/visited pages, light dot for unvisited
- Close (✕) and expand (↗) buttons in panel corner

**Infinite scroll**: Load more invoices when user scrolls near the bottom of the table.

### Screen 2: Invoice Detail (navigated from double-click)

**Same blue header** as Screen 1 (blue gradient strip + "קשת" logo + teal icon). The controls bar is replaced with a **detail navigation bar**:

- Right side (RTL start): back arrow button (→ in RTL, ← in LTR) + "Supplier Name — INV-XXXXX" title
- Left side: status pill badge (color-coded: green "Approved", orange "Pending", red "Rejected", blue "In Process")

**Split content area** below the navigation bar:

- **LEFT panel (RTL)** (~55%): Full-size PDF viewer using pdf.js canvas rendering, same invoice template as the sidebar preview but at full size. Pagination dots at bottom for multi-page.
- **RIGHT panel** (~45%): Two detail cards with subtle shadows:
  - **Card 1** — Invoice info: invoice date, invoice number, services/goods description
  - **Card 2** — Amount breakdown table: description + amount row, subtotal (before VAT), VAT (17%), **TOTAL** in bold/highlighted

The overall look and feel (colors, fonts, spacing, shadows, border-radius) must match Screen 1 exactly — it should feel like the same app.

### Design Tokens

```css
:root {
  /* Header */
  --color-header-bg: linear-gradient(135deg, #4285f4, #5a9cf5);
  --color-controls-bg: #f1f3f4;

  /* Status icons */
  --color-approved: #34a853;
  --color-pending: #4285f4;
  --color-rejected: #ea4335;
  --color-in-process: #4285f4;
  --color-selected-row: #d2e3fc;

  /* General */
  --color-bg: #ffffff;
  --color-surface: #ffffff;
  --color-text: #202124;
  --color-text-secondary: #5f6368;
  --color-border: #e0e0e0;
  --color-table-header-bg: #f8f9fa;
  --color-row-alt: #fafafa;

  --font-family: "Inter", "Segoe UI", system-ui, sans-serif;
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --radius: 8px;
  --radius-lg: 16px;
}
```

---

## Backend Specification

### Data Model

```typescript
// Invoice entity
{
  id: string (UUID)
  invoiceNumber: string ("INV-00001" format)
  status: 'APPROVED' | 'PENDING_APPROVAL' | 'IN_PROCESS' | 'REJECTED'
  description: string
  supplier: string
  issueDate: string (YYYY-MM-DD)
  amountBeforeVat: number
  vatAmount: number (17% of amountBeforeVat)
  totalAmount: number
  cost: number (same as totalAmount — display field)
  fileStorageId: string (FK to FileStorage)
}

// FileStorage entity
{
  id: string (UUID)
  filename: string
  fileLocation: string
}
```

### API Endpoints

| Method | Path                                                                 | Description                                       |
| ------ | -------------------------------------------------------------------- | ------------------------------------------------- |
| `GET`  | `/api/invoices?page=1&pageSize=20&search=&status=&dateFrom=&dateTo=` | Paginated list                                    |
| `GET`  | `/api/invoices/status-counts`                                        | `{ all, approved, pending, inProcess, rejected }` |
| `GET`  | `/api/invoices/:id`                                                  | Single invoice detail                             |
| `GET`  | `/api/files/:id`                                                     | Stream PDF (generated on-the-fly by PDFKit)       |

### Seed Data

Generate **500 invoices** at startup with randomized:

- Suppliers: Globex, SkyBridge Tech, DataStream, Veridian Dynamics, Umbrella Ltd, Soylent Corp, Wayne Enterprises, TechNovus, InfraCore, NetPulse, Nakatomi Corp, Initech, Cyberdyne, Massive Dynamic
- Descriptions: Mobile app maintenance, Server hardware upgrade, Data analytics platform, Office renovation, Cybersecurity solutions, Web development project, Equipment leasing, Security audit services, Customer support tools, Design and branding, Legal consulting fees, Network infrastructure, ERP system module, R&D equipment purchase
- Dates: random within 2022-2026
- Amounts: random ₪5,000 – ₪600,000
- Statuses: roughly equal distribution

### FileStorage Module (Clean Architecture)

The file handling must be a **separate NestJS module** (`FileStorageModule`) with a swappable storage provider:

```
file-storage/
├── domain/
│   └── file-storage.entity.ts        # TypeORM entity
├── application/
│   ├── storage-provider.interface.ts  # IStorageProvider + STORAGE_PROVIDER token
│   ├── file-storage.service.ts        # CRUD for FileStorage records
│   └── invoice-pdf.service.ts         # PDF generation (seed + fallback)
├── infrastructure/
│   └── local-disk.provider.ts         # Implements IStorageProvider using Node fs
├── presentation/
│   └── file.controller.ts             # GET /api/files/:id → streams PDF
└── file-storage.module.ts
```

**Key interfaces:**

- `IStorageProvider` — `getFile(path)`, `saveFile(path, buffer)`, `deleteFile(path)` — abstract interface
- `LocalDiskProvider` — implements `IStorageProvider` using `fs` on local disk
- `STORAGE_PROVIDER` — injection token for swapping implementations (local → S3, Azure Blob, etc.)
- `InvoicePdfService` — generates PDFs using PDFKit

**Hybrid PDF strategy (seed + fallback):**

1. **At startup (seeder)**: Generate all 500 invoice PDFs and save them to disk via `LocalDiskProvider`. Each `FileStorage` record points to the saved file path.
2. **At runtime (FileController)**: Try to serve the pre-generated file from disk. If the file is **missing or corrupted**, fall back to `InvoicePdfService` to generate it on-the-fly, save it for next time, then stream it to the client.

```typescript
// FileController pseudo-logic:
async getFile(id: string) {
  const record = await fileStorageService.findById(id);
  const file = await storageProvider.getFile(record.fileLocation);
  if (file) return streamFile(file);
  // Fallback: generate, save, then stream
  const pdf = await invoicePdfService.generate(record);
  await storageProvider.saveFile(record.fileLocation, pdf);
  return streamBuffer(pdf);
}
```

**PDFKit** (require-style import: `import PDFDocument = require('pdfkit')`) generates PDFs with:

- Header: "INVOICE" with company logo on the right
- Bill-to section with recipient details
- Description/hours/price/total table
- Total amount section
- Payment method and notes
- "Thank you!" closing
- REJECTED invoices: diagonal "REJECTED" watermark in red

---

## i18n

**Default locale: Hebrew (RTL).** Support English (LTR) toggle:

- Signal-based `I18nService` that loads flat JSON from `assets/i18n/{locale}.json`
- Sets `document.dir` and `document.lang` via `effect()`
- `CurrencyIlsPipe` for ₪ formatting
- RTL CSS: use `border-inline-start/end`, `inset-inline-start/end` — never `left/right`
- All table headers, buttons, labels, and placeholders must be translated

---

## Caching (Redis)

Use `@nestjs/cache-manager` with `cache-manager-redis-store` for server-side caching:

### What to cache

| Endpoint                             | Cache key pattern                                   | TTL  | Invalidation            |
| ------------------------------------ | --------------------------------------------------- | ---- | ----------------------- |
| `GET /api/invoices`                  | `invoices:page:{p}:size:{s}:status:{st}:search:{q}` | 60s  | On any invoice mutation |
| `GET /api/invoices/status-counts`    | `invoice-status-counts`                             | 60s  | On any invoice mutation |
| `GET /api/files/:id` (generated PDF) | `pdf:{fileStorageId}`                               | 300s | On invoice update       |

### Implementation

- Register `CacheModule.registerAsync()` in `AppModule` with Redis connection from `process.env.REDIS_URL` (fallback to in-memory cache if Redis unavailable)
- Use `@UseInterceptors(CacheInterceptor)` on read-only controller methods
- For custom keys: inject `CACHE_MANAGER` and use `cache.get()`/`cache.set()` in services
- Invalidate cache via `cache.del()` after any write operation, or use event-based invalidation with `@nestjs/event-emitter`

### Docker

- Add a `redis` service (`redis:7-alpine`) to `docker-compose.yml`
- Set `REDIS_URL=redis://redis:6379` in server environment

---

## Mobile Responsiveness

- **≤ 1024px**: PDF panel takes 50% width
- **≤ 768px**: Stack vertically (PDF above list), hide supplier column, horizontal-scroll count boxes, date picker uses `position: fixed`
- **≤ 480px**: Hide status icon column

---

## Architecture Rules

Follow Clean Architecture for NestJS modules:

```
feature-module/
├── domain/          # Entities, interfaces
├── application/     # Services
├── infrastructure/  # Repos, external integrations
└── presentation/    # Controllers, DTOs
```

Follow ALL rules in `CLAUDE.md`:

- Zoneless Angular (signals, OnPush, no NgZone)
- Explicit TypeORM entity imports (no globs)
- Static routes before parameterized routes
- DTOs with class-validator
- Repository pattern
- Global ValidationPipe, HttpExceptionFilter, ThrottlerGuard

---

## Error Handling

### Frontend

- HTTP error interceptor (skip i18n requests, show toast for errors)
- Signal-based toast service (auto-dismiss)
- Loading skeletons (8 skeleton rows while fetching)
- Empty state when no results match filters
- `error` and `loading` signals on every async data source

### Backend

- Global `HttpExceptionFilter` returning `{ statusCode, message, path, timestamp }`
- Typed exceptions (`NotFoundException`, `BadRequestException`)
- Structured logging via `nestjs-pino`
- Rate limiting via `@nestjs/throttler` (60 req/min)
- Circuit breaker via `opossum` interceptor

---

## Docker

### Server Dockerfile

- Multi-stage: `node:22-alpine` build → `node:22-alpine` run
- Both stages: `apk add python3 make g++` (native module compilation)
- Runner: `npm rebuild better-sqlite3` after copying node_modules
- CMD: `node dist/main.js`

### Client Dockerfile

- Multi-stage: `node:22-alpine` build → `nginx:alpine` run
- Copy `dist/apps/client/browser` to nginx html directory

### nginx.conf

- `/api/` → proxy to `http://server:3000/api/`
- `/` → `try_files $uri $uri/ /index.html` (SPA fallback)
- Add `application/javascript mjs;` to MIME types

### docker-compose.yml

- `server` service on port 3000
- `client` service on port 4200 (maps to 80 internally)
- Shared bridge network

---

## Testing

Write tests for **all** services, controllers, components, and pipes. Follow patterns in `.claude/skills/testing/SKILL.md`.

### Backend Unit Tests (Jest)

Use `Test.createTestingModule()` with mocked repositories. Test:

- **InvoiceService**: pagination logic, search filtering, status filtering, date range filtering, `getStatusCounts()` aggregation, `getInvoiceById()` with valid/invalid ID
- **InvoicePdfService**: generates valid PDF buffer, includes correct invoice data, adds REJECTED watermark for rejected invoices
- **FileStorageService**: file CRUD operations
- **InvoiceController**: correct HTTP status codes, calls service methods with correct params, returns paginated response shape
- **FileController**: streams PDF with correct `Content-Type: application/pdf`

Mock all external dependencies (TypeORM repos, filesystem). Never hit a real DB in unit tests.

### Backend E2E Tests (Supertest)

Use `@nestjs/testing` + Supertest with the full app module (real SQLite in-memory DB). Test:

- `GET /api/invoices` returns paginated data with correct shape
- `GET /api/invoices?search=Globex` returns filtered results
- `GET /api/invoices?status=APPROVED` returns only approved invoices
- `GET /api/invoices/status-counts` returns counts that sum to total
- `GET /api/invoices/:id` returns invoice detail / 404 for invalid ID
- `GET /api/files/:id` returns PDF stream / 404 for invalid ID
- Rate limiting: 61st request within 1 minute returns 429

Apply the same global pipes, filters, and guards as `main.ts`.

### Frontend Unit Tests (Vitest)

Use `TestBed.configureTestingModule()` with mocked services. Test:

- **InvoiceService**: signal state changes after fetch, search debounce, pagination/loadMore, error handling sets `error` signal
- **InvoiceListComponent**: renders table rows, search input triggers service, status filter buttons work, row click selects invoice, skeleton shows during loading
- **InvoiceDetailComponent**: renders detail cards with correct data, back button navigates
- **StatusPillComponent**: renders correct icon and color per status
- **CurrencyIlsPipe**: formats numbers with ₪ and comma separators
- **I18nService**: loads translations, toggles locale, sets `document.dir`

Mock `HttpClient` — never make real HTTP calls in tests.

### Frontend E2E Tests (Playwright)

Use the Playwright MCP plugin (or Playwright CLI) to test all main functions and pages via end-to-end user flows in a real browser. Test:

- **Invoice List Screen**:
  - Main data table renders correctly and infinite scroll fetches more records
  - Filtering by status updates the list correctly
  - Typing in the search bar filters results
  - Language toggle switches text and layout direction (RTL ↔ LTR)
- **PDF Preview & Interactions**:
  - Selecting a row opens the PDF side-panel correctly
- **Invoice Detail Screen**:
  - Double clicking an invoice navigates successfully to the detail view
  - The split view renders appropriately (PDF on one side, detail cards on the other)
  - The back button successfully returns the user to the list

### Coverage Target

- **Minimum 80%** line coverage for both backend and frontend
- Run: `npx nx test server --coverage` and `npx nx test client --coverage`
- Add coverage thresholds in `jest.config.ts` (backend) and `vitest.config.ts` (frontend):
  ```json
  coverageThreshold: { global: { branches: 70, functions: 80, lines: 80, statements: 80 } }
  ```

---

## Verification Checklist

After building, verify:

- [ ] `npx nx build server` succeeds
- [ ] `npx nx build client` succeeds
- [ ] `curl localhost:3000/api/invoices?page=1&pageSize=3` returns 3 invoices
- [ ] `curl localhost:3000/api/invoices/status-counts` returns counts summing to 500
- [ ] `curl -o test.pdf localhost:3000/api/files/{id}` produces valid PDF
- [ ] Invoice list loads in browser with 500 invoices (Hebrew RTL by default)
- [ ] Search filters in real-time (debounced)
- [ ] Status count buttons filter the list
- [ ] Single-click opens PDF panel on the LEFT (RTL) with correct invoice data
- [ ] Double-click navigates to detail screen (same header design)
- [ ] Infinite scroll loads more invoices
- [ ] Language toggle switches HE ↔ EN with RTL/LTR layout flip
- [ ] `docker-compose up --build` runs successfully
- [ ] Mobile layout works at 768px and 480px breakpoints
- [ ] `npx nx test server` — all backend unit tests pass
- [ ] `npx nx test client` — all frontend unit tests pass
- [ ] `npx nx test server --coverage` — ≥ 80% line coverage
- [ ] `npx nx test client --coverage` — ≥ 80% line coverage
- [ ] E2E tests pass with Supertest
- [ ] Frontend E2E tests pass using Playwright for all main functions and UI flows
