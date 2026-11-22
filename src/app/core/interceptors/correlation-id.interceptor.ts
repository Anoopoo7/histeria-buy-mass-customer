import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { CORRELATION_ID_HEADER, CorrelationIdService } from '../services/correlation-id.service';

/**
 * Attaches the persistent x-correlation-id header to every outgoing API request.
 * If not yet initialized, generates and saves a new UUID.
 * When the server returns an x-correlation-id in the response header (success or error),
 * saves it to ensure all subsequent requests share that correlation ID.
 */
export const correlationIdInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const correlationService = inject(CorrelationIdService);

  // 1. Get existing or generate new correlation ID
  const correlationId = correlationService.getCorrelationId();

  // 2. Clone request and add x-correlation-id header if not already present
  let stampedReq = req;
  const hasCorrelationHeader =
    req.headers.has(CORRELATION_ID_HEADER) ||
    req.headers.has('X-Correlation-Id') ||
    req.headers.has('X-CORRELATION-ID');

  if (!hasCorrelationHeader) {
    stampedReq = req.clone({
      setHeaders: {
        [CORRELATION_ID_HEADER]: correlationId,
      },
    });
  }

  // 3. Forward request and capture x-correlation-id from response or error
  return next(stampedReq).pipe(
    tap((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse) {
        const respCorrelationId =
          event.headers.get(CORRELATION_ID_HEADER) ||
          event.headers.get('X-Correlation-Id') ||
          event.headers.get('X-CORRELATION-ID');

        if (respCorrelationId) {
          correlationService.setCorrelationId(respCorrelationId);
        }
      }
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.headers) {
        const errCorrelationId =
          error.headers.get(CORRELATION_ID_HEADER) ||
          error.headers.get('X-Correlation-Id') ||
          error.headers.get('X-CORRELATION-ID');

        if (errCorrelationId) {
          correlationService.setCorrelationId(errCorrelationId);
        }
      }
      return throwError(() => error);
    }),
  );
};
