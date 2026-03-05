---
name: Error Handling
description: Best practices and coding standards for Error Handling.
---

## Error Handling

### 1 Angular — Functional HTTP Interceptor

Use a **functional interceptor** (not class-based) to catch HTTP errors globally and surface them via a toast/notification service:

```typescript
// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip non-API requests (e.g., i18n JSON files)
  if (req.url.includes('/assets/')) return next(req);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const toast = inject(ToastService);

      if (err.status === 0) {
        toast.error('No internet connection');
      } else if (err.status >= 400 && err.status < 500) {
        toast.error(err.error?.message || 'Request failed');
      } else if (err.status >= 500) {
        toast.error('Server error — please try again');
      }

      return throwError(() => err); // Always re-throw so callers can still handle it
    }),
  );
};
```

Register in `app.config.ts`:

```typescript
provideHttpClient(withFetch(), withInterceptors([errorInterceptor]));
```

### 2 Angular — Component-Level Error State

Every component that makes HTTP calls should have its own error signal:

```typescript
readonly error = signal<string | null>(null);
readonly loading = signal(false);

private async loadData() {
  this.loading.set(true);
  this.error.set(null);
  try {
    const data = await firstValueFrom(this.http.get<T>(url));
    this.data.set(data);
  } catch (e) {
    this.error.set('Failed to load data');
  } finally {
    this.loading.set(false);
  }
}
```

Template pattern:

```html
@if (loading()) {
<div class="skeleton">Loading…</div>
} @else if (error()) {
<div class="error-banner">{{ error() }} <button (click)="retry()">Retry</button></div>
} @else {
<!-- normal content -->
}
```

### 3 NestJS — Global Exception Filter

Create a single `HttpExceptionFilter` and register it globally to standardize all error responses:

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.message : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
```

Register in `main.ts`:

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

### 4 NestJS — Service-Level Error Handling

Services should throw typed `HttpException` subclasses, never generic `Error`:

```typescript
// ✅ Correct — gives the client a proper status code and message
throw new NotFoundException(`Invoice ${id} not found`);
throw new BadRequestException('Invalid date range');

// ❌ Wrong — results in a generic 500
throw new Error('not found');
```

---

