# CLAUDE.md

We're building the app described in @docs/Spec.md. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Only the rules that **break the app** if violated. For detailed examples, see the individual markdown files in `.claude/skills/`.

## Stack

- **Frontend**: Angular 21+ (zoneless, signals, OnPush) in `apps/client/`
- **Backend**: NestJS 11 (TypeORM, Pino, ThrottlerGuard) in `apps/server/`
- **Monorepo**: Nx with shared libs in `libs/shared/`
- **Deploy**: Docker multi-stage → nginx (client) + node:22-alpine (server)

## Critical Angular Rules

**Use `angular-cli` MCP tools** when available: `list_projects` to discover workspace structure, `find_examples` + `get_best_practices` to verify modern patterns before writing code, and `search_documentation` for API lookups. Use shell commands for builds, serves, and generation.

This app uses `provideZonelessChangeDetection()`. **zone.js does NOT exist.**

- **NEVER** inject `NgZone`, call `markForCheck()`, or `detectChanges()`
- **NEVER** add `standalone: true` (default since Angular 19)
- **NEVER** use `*ngIf`, `*ngFor`, `[ngSwitch]` — use `@if`, `@for`, `@switch`
- **ALWAYS** use `ChangeDetectionStrategy.OnPush`
- **ALWAYS** use signal APIs: `input()`, `output()`, `viewChild()`, `signal()`, `computed()`, `effect()`
- Wrap side-effect logic inside `effect()` with `untracked()` to prevent infinite loops
- Use `resource()` for async data loading, `linkedSignal()` for resettable derived state
- Prefer Signals over RxJS; use `toSignal()`/`toObservable()` only at boundaries
- Use `$any()` in templates for type casts (TypeScript `as` doesn't work in templates)
- Keep `viewChild` elements in DOM (CSS `.hidden`), not behind `@if`, to avoid undefined refs
- `error` and `loading` signals for every async data source
- Mobile-first CSS: `@media (min-width:)`, `rem`/`clamp()`, touch targets ≥ 44×44px
- Mock services in tests — never make real HTTP calls
- Extract reusable components (headers, status pills, PDF viewers) into `shared/` — reuse across screens, never duplicate

## Critical NestJS Rules

- **ALWAYS** use explicit entity imports — glob patterns silently fail in webpack builds
- **ALWAYS** declare static routes (`@Get('stats')`) before parameterized (`@Get(':id')`)
- **ALWAYS** use `class-validator` DTOs + global `ValidationPipe({ whitelist: true, transform: true })`
- **ALWAYS** throw `NotFoundException`, `BadRequestException`, etc. — never bare `Error`
- Use `import X = require('lib')` for CommonJS libraries (PDFKit, Opossum)
- Use `nestjs-pino` with structured JSON fields (install `pino-pretty` as devDep or it crashes)
- Repository Pattern: services use repos, never raw `DataSource`/`EntityManager`
- Avoid N+1: use `relations`, `QueryBuilder` joins, or batch `IN` clauses
- Health checks: `@nestjs/terminus` at `/health` (readiness) and `/health/live` (liveness)
- Global `ThrottlerGuard` = 60 req/min — configure client libs for single-request mode
- Response DTOs with `@Expose()`/`@Exclude()` — never return raw entities from controllers
- Use Interceptors for cross-cutting concerns (logging, caching, response envelope)
- No circular deps — extract shared code, use injection tokens, or events
- Single Responsibility per service; export only services from modules, never repos

## Architecture

```
feature-module/
├── domain/          # Entities, interfaces
├── application/     # Services (single responsibility each)
├── infrastructure/  # Repos, external integrations
└── presentation/    # Controllers, DTOs
```

## Docker Gotchas

- Native modules (`better-sqlite3`, `sharp`) need `npm rebuild` in Linux container
- `.mjs` files need `application/javascript mjs;` in nginx MIME types
- `__dirname` = output dir (`dist/apps/server`), not source tree

## Testing

- Mock at boundaries (HTTP, DB, filesystem), not internal classes
- E2E: Supertest with same global pipes/filters/guards as `main.ts`
- Unit: `Test.createTestingModule()` with mocked repos

## Quick Debugging

| Symptom                       | Fix                                       |
| ----------------------------- | ----------------------------------------- |
| White screen / `NG0908`       | Use `provideZonelessChangeDetection()`    |
| `effect()` infinite loop      | Wrap in `untracked()`                     |
| Stale data after rapid input  | Use `requestId` guard pattern             |
| `viewChild()` undefined       | Keep in DOM, hide with CSS                |
| Bulk 429 errors               | Configure library for single-request mode |
| `X is not a constructor`      | `import X = require('lib')`               |
| `Exec format error` in Docker | `npm rebuild <pkg>` in container          |
| Pino crashes on startup       | `npm install -D pino-pretty`              |
| N+1 slow queries              | Use `relations` or batch `IN`             |

## Detailed Reference

For full code examples and patterns on all topics above (plus caching, i18n, responsive design, security, interceptors, pipes, API versioning), see the individual skills in the `.claude/skills/` directory.
