import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Observable, from, switchMap } from 'rxjs';
import CircuitBreaker = require('opossum');

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private readonly breaker: CircuitBreaker;

  constructor() {
    const action = (handler: CallHandler): Promise<unknown> =>
      handler.handle().toPromise();

    this.breaker = new CircuitBreaker(action, {
      timeout: 10000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    });

    this.breaker.fallback(() => {
      throw new ServiceUnavailableException(
        'Service temporarily unavailable. Please try again later.',
      );
    });
  }

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return from(this.breaker.fire(next)).pipe(
      switchMap((result) =>
        result instanceof Observable ? result : from(Promise.resolve(result)),
      ),
    );
  }
}
