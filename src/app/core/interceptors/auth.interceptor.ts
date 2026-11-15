import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

const BYPASS_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/api/v1/auth/phone/otp/send',
  '/api/v1/auth/verify-phone',
];

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const isBackendUrl = req.url.startsWith('/') || req.url.startsWith(environment.apiBaseUrl);
  const isBypassUrl = BYPASS_PATHS.some((path) => req.url.includes(path));

  let authReq = req;
  const token = tokenStorage.getAccessToken();

  if (isBackendUrl && token && !isBypassUrl && !req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (isBackendUrl && error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          if (isBypassUrl || req.url.includes('/api/v1/auth/refresh')) {
            tokenStorage.clearTokens();
            return throwError(() => error);
          }

          if (!isRefreshing) {
            isRefreshing = true;
            refreshTokenSubject.next(null);

            return authService.refreshTokens().pipe(
              switchMap((response: AuthResponse) => {
                isRefreshing = false;
                refreshTokenSubject.next(response.accessToken);
                return next(
                  authReq.clone({
                    setHeaders: {
                      Authorization: `Bearer ${response.accessToken}`,
                    },
                  }),
                );
              }),
              catchError((refreshErr: unknown) => {
                isRefreshing = false;
                refreshTokenSubject.next(null);
                tokenStorage.clearTokens();
                return throwError(() => refreshErr);
              }),
            );
          } else {
            return refreshTokenSubject.pipe(
              filter((t): t is string => t !== null),
              take(1),
              switchMap((newToken: string) => {
                return next(
                  authReq.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`,
                    },
                  }),
                );
              }),
            );
          }
        }
      }
      return throwError(() => error);
    }),
  );
};
