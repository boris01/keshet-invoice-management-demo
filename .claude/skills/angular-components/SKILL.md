---
name: Angular 21+ — Components
description: Best practices and coding standards for Angular 21+ — Components.
---

## Angular 21+ — Components

### 1 Zoneless Architecture

Angular 21+ defaults to **zoneless change detection**. `zone.js` is NOT included.

```typescript
// ✅ Correct — zoneless
provideZonelessChangeDetection();

// ❌ FATAL — causes NG0908 and a white screen
provideZoneChangeDetection();
```

**What this means for your code:**

- **NEVER** inject `NgZone`. It does not exist in a zoneless app.
- **NEVER** call `NgZone.run()` or `NgZone.runOutsideAngular()`.
- **NEVER** use `ChangeDetectorRef.markForCheck()` or `detectChanges()`.
- Use Angular **Signals** for all mutable state. Calling `.set()` or `.update()` on a Signal automatically schedules a view refresh — even from 3rd-party async callbacks, Web Workers, or `setTimeout`.

### 2 Component Decorator

```typescript
@Component({
  selector: 'app-my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,  // ✅ ALWAYS
  encapsulation: ViewEncapsulation.None,             // or ShadowDom per project
  template: `...`,
  styles: [`...`],
  // ❌ NEVER add standalone: true — it is the default in Angular 19+ and is noise
})
```

### 3 Signal-Based APIs — Mandatory Replacements

| Old (FORBIDDEN)                          | New (REQUIRED)                                         |
| ---------------------------------------- | ------------------------------------------------------ |
| `@Input() foo: string`                   | `readonly foo = input.required<string>()`              |
| `@Input() bar?: number`                  | `readonly bar = input<number>()`                       |
| `@Output() clicked = new EventEmitter()` | `readonly clicked = output<void>()`                    |
| `@ViewChild('ref') set ref(...)`         | `readonly ref = viewChild.required<ElementRef>('ref')` |
| `loading = false`                        | `loading = signal(false)`                              |
| `error: string \| null = null`           | `error = signal<string \| null>(null)`                 |

### 4 Angular Signals — Complete Guide

Signals are the **foundation** of Angular 21+. Every piece of reactive state in a component, service, or store must be a Signal.

#### `signal()` — Writable State

```typescript
// Primitive state
readonly count = signal(0);
readonly name = signal('');
readonly items = signal<Item[]>([]);

// Update
this.count.set(42);                       // Replace value
this.count.update(prev => prev + 1);      // Derive from previous
this.items.update(prev => [...prev, newItem]);  // Immutable array update
```

> **RULE**: Never mutate the value inside `.update()`. Always return a **new** reference for objects/arrays, or Angular won't detect the change.

#### `computed()` — Derived State

```typescript
// Automatically re-evaluates when dependencies change — zero manual wiring
readonly fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
readonly total = computed(() => this.items().reduce((sum, i) => sum + i.price, 0));
readonly hasItems = computed(() => this.items().length > 0);
readonly filtered = computed(() =>
  this.items().filter(i => i.status === this.activeFilter())
);
```

> **RULE**: `computed()` must be **pure** — no side effects, no `.set()` calls, no HTTP requests inside.

#### `linkedSignal()` — Resettable Derived State (Angular 19+)

Use when a derived value needs to be **overridden** by the user but **reset** when its source changes:

```typescript
// Pagination: resets to page 1 whenever the filter changes
readonly filter = signal('all');
readonly page = linkedSignal({
  source: this.filter,
  computation: () => 1,   // reset to page 1 on filter change
});

// User can manually navigate to other pages
this.page.set(3);

// But when filter changes, page auto-resets to 1
this.filter.set('active');  // → page() is now 1 again
```

#### `resource()` — Async Data Fetching (Angular 19+)

```typescript
readonly userId = input.required<string>();

readonly userResource = resource({
  request: () => this.userId(),  // tracked dependency
  loader: async ({ request: id }) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
});

// In template:
// userResource.value()   — the loaded data (or undefined)
// userResource.isLoading() — boolean
// userResource.error()   — error if failed
// userResource.reload()  — manually re-fetch
```

#### `toSignal()` / `toObservable()` — RxJS Interop

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

// Observable → Signal (use in components/services)
readonly params = toSignal(this.route.params, { initialValue: {} });
readonly data = toSignal(this.someService.data$);

// Signal → Observable (rare — only when feeding into RxJS pipes)
readonly search$ = toObservable(this.searchTerm);
readonly debouncedSearch$ = this.search$.pipe(debounceTime(300));
```

> **RULE**: Prefer Signals over Observables in new code. Only use RxJS when you need operators like `debounceTime`, `switchMap`, `combineLatest`, or when interfacing with APIs that return Observables (like `HttpClient`).

#### Signal-First Mental Model

```
┌─────────────────────────────────────────────────┐
│  signal()        — writable state               │
│  computed()      — derived (pure, auto-tracked)  │
│  linkedSignal()  — derived + resettable          │
│  resource()      — async data loader             │
│  effect()        — side effects (DOM, HTTP, log) │
│  input()         — signal from parent            │
│  output()        — event to parent               │
│  viewChild()     — signal from template          │
│  model()         — two-way binding signal        │
└─────────────────────────────────────────────────┘

Data flows DOWN through signals.
Events flow UP through outputs.
Side effects live in effect() — NEVER in computed().
```

### 5 `effect()` and `untracked()` — Preventing Infinite Loops

```typescript
constructor() {
  effect(() => {
    const id = this.someInput();      // ← this is the TRACKED dependency
    untracked(() => {                 // ← everything inside is NOT tracked
      this.doAsyncWork(id);           //    prevents re-trigger if doAsyncWork reads other signals
    });
  });
}
```

> **CRITICAL**: If `effect()` calls code that reads OTHER signals (like `loading()`, `viewChild()`), those become tracked dependencies and cause infinite re-triggers. **Always wrap side-effect logic in `untracked()`.**

### 6 Template Syntax — Modern Control Flow Only

```html
<!-- ✅ Built-in control flow (Angular 17+) -->
@if (loading()) {
<div>Loading…</div>
} @else if (error()) {
<div>Error occurred</div>
} @for (item of items(); track item.id) {
<div>{{ item.name }}</div>
} @switch (status()) { @case ('active') { <span>Active</span> } @default { <span>Unknown</span> } }

<!-- ❌ Legacy structural directives — NEVER use -->
<div *ngIf="loading">
  <div *ngFor="let item of items">
    <div [ngSwitch]="status"></div>
  </div>
</div>
```

### 7 Template Type Casting

```html
<!-- ❌ TypeScript `as` casts do NOT work in Angular templates -->
(input)="setValue(($event.target as HTMLInputElement).value)"

<!-- ✅ Use $any() instead -->
(input)="setValue($any($event.target).value)"
```

### 8 Async Race Condition Pattern

When a component triggers async work based on a rapidly changing input, use a **requestId guard** to discard stale responses:

```typescript
private currentRequestId = 0;

private async loadData(id: string) {
  this.cleanup();
  const requestId = this.currentRequestId;

  const result = await someAsyncOperation(id);
  if (this.currentRequestId !== requestId) return;  // Superseded — discard

  this.data.set(result);
}

private cleanup() {
  this.currentRequestId++;  // Invalidate all pending work
}
```

### 9 ViewChild Stability — CSS Hiding over Structural Removal

When a `viewChild()` element is conditionally visible, prefer **CSS hiding** to prevent the reference from becoming `undefined` during async transitions:

```html
<!-- ✅ Always in DOM, hidden via CSS — viewChild always valid -->
<div #container [class.hidden]="loading()"></div>

<!-- ❌ Causes viewChild to be undefined during load transitions -->
@if (!loading()) {
<div #container></div>
}
```

```css
.hidden {
  display: none !important;
}
```

### 10 HttpClient Configuration

```typescript
provideHttpClient(
  withFetch(), // Use the Fetch API backend
  withInterceptors([errorInterceptor]), // Functional interceptors
);
```

---

