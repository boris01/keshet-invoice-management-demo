import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/assets/')) {
    return next(req);
  }

  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      const message =
        error.error?.message || error.statusText || 'An unexpected error occurred';
      toast.show(message, 'error');
      return throwError(() => error);
    })
  );
};
