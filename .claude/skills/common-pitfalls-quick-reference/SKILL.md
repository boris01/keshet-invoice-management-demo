---
name: Common Pitfalls Quick Reference
description: Best practices and coding standards for Common Pitfalls Quick Reference.
---

## Common Pitfalls Quick Reference

| Symptom                              | Cause                                                                | Fix                                             |
| ------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------- |
| White screen, `NG0908`               | `provideZoneChangeDetection()` in zoneless app                       | Use `provideZonelessChangeDetection()`          |
| `effect()` infinite loop             | Reading signals inside effect that are also written downstream       | Wrap side effects in `untracked()`              |
| Stale data after rapid input changes | Async race condition — old response overwrites new                   | Use `requestId` guard pattern                   |
| `viewChild()` is `undefined`         | Element removed from DOM by `@if` during transitions                 | Keep in DOM, hide with CSS                      |
| Infinite 429 errors                  | Library (PDF.js, etc.) fires bulk HTTP requests against rate limiter | Configure library for single-request mode       |
| `X is not a constructor` in NestJS   | ESM star-import of CommonJS module                                   | Use `import X = require('lib')`                 |
| `Exec format error` in Docker        | Native module built on wrong platform                                | `npm rebuild <module>` in Docker runner         |
| `.mjs` 404 or MIME error             | Nginx missing MIME type for `.mjs`                                   | Add `application/javascript mjs;`               |
| Entity not found by TypeORM          | Glob pattern in entity config                                        | Use explicit imports                            |
| Route `:id` catches static paths     | Parameterized route declared before static                           | Move static `@Get()` routes above `@Get(':id')` |

---

