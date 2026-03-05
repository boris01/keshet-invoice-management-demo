---
name: Avoiding Circular Dependencies
description: Best practices and coding standards for Avoiding Circular Dependencies.
---

## Avoiding Circular Dependencies

### 1 NestJS — The `forwardRef()` Escape Hatch

Circular dependencies happen when Module A imports Module B while Module B imports Module A. NestJS provides `forwardRef()` as a last resort:

```typescript
// ❌ This will crash: "Nest cannot create the module instance"
@Module({ imports: [ModuleB] })
export class ModuleA {}

@Module({ imports: [ModuleA] })
export class ModuleB {}

// ✅ Use forwardRef if truly unavoidable
@Module({ imports: [forwardRef(() => ModuleB)] })
export class ModuleA {}

@Module({ imports: [forwardRef(() => ModuleA)] })
export class ModuleB {}
```

> **WARNING**: `forwardRef()` is a **code smell**. It is a band-aid, not a solution. Always prefer restructuring.

### 2 Prevention Strategies (Preferred)

**Strategy 1 — Extract a shared module:**

```
// Before: A ↔ B circular
// After:  A → Shared ← B
```

Move the shared entity, interface, or service into a `SharedModule` or `libs/shared` that both modules import.

**Strategy 2 — Use injection tokens and interfaces:**

```typescript
// shared/tokens.ts
export const NOTIFICATION_SERVICE = Symbol('NOTIFICATION_SERVICE');
export interface INotificationService {
  notify(userId: string, message: string): Promise<void>;
}

// Module A provides the implementation
{ provide: NOTIFICATION_SERVICE, useClass: NotificationService }

// Module B injects the interface
constructor(@Inject(NOTIFICATION_SERVICE) private notifier: INotificationService) {}
```

**Strategy 3 — Event-based decoupling:**

```typescript
// Instead of direct service calls across modules, use NestJS events
import { EventEmitter2 } from '@nestjs/event-emitter';

// Producer (Module A)
this.eventEmitter.emit('order.created', { orderId: '123' });

// Consumer (Module B)
@OnEvent('order.created')
handleOrderCreated(payload: { orderId: string }) {}
```

### 3 Detection

- NestJS will throw `"Nest cannot create the module instance"` or `"A circular dependency has been detected"` at startup.
- In Angular, the compiler emits `NG3003: Import cycle detected`. Fix by moving shared code to a separate file/module.
- Use `npx madge --circular --extensions ts src/` to scan for circular imports in any TypeScript project.

### 4 Layered Architecture Prevents Circularity

The clean architecture layers (§2.1) are ordered by dependency direction:

```
presentation → application → domain
                    ↓
             infrastructure
```

- **Domain** depends on nothing.
- **Application** depends on domain interfaces only.
- **Infrastructure** implements domain interfaces (e.g., repositories).
- **Presentation** calls application services.

Circular imports almost always mean a layer boundary was violated. If a service in `application/` needs to call a controller in `presentation/`, the design is wrong.

---

