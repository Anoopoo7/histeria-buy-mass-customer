import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly http = inject(HttpClient);
  readonly baseUrl = environment.apiBaseUrl;

  get<T>(
    path: string,
    options?: {
      params?: HttpParams | Record<string, string | number | boolean | undefined>;
      headers?: HttpHeaders | Record<string, string>;
    },
  ): Observable<T> {
    const httpOptions = this.normalizeOptions(options);
    return this.http
      .get<T>(this.resolveUrl(path), httpOptions)
      .pipe(catchError((err: HttpErrorResponse) => this.handleError(err)));
  }

  post<T>(
    path: string,
    body: unknown,
    options?: {
      headers?: HttpHeaders | Record<string, string>;
    },
  ): Observable<T> {
    return this.http
      .post<T>(this.resolveUrl(path), body, options)
      .pipe(catchError((err: HttpErrorResponse) => this.handleError(err)));
  }

  patch<T>(
    path: string,
    body: unknown,
    options?: {
      headers?: HttpHeaders | Record<string, string>;
    },
  ): Observable<T> {
    return this.http
      .patch<T>(this.resolveUrl(path), body, options)
      .pipe(catchError((err: HttpErrorResponse) => this.handleError(err)));
  }

  delete<T>(
    path: string,
    options?: {
      headers?: HttpHeaders | Record<string, string>;
    },
  ): Observable<T> {
    return this.http
      .delete<T>(this.resolveUrl(path), options)
      .pipe(catchError((err: HttpErrorResponse) => this.handleError(err)));
  }

  private resolveUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const cleanBase = this.baseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }

  private normalizeOptions(options?: {
    params?: HttpParams | Record<string, string | number | boolean | undefined>;
    headers?: HttpHeaders | Record<string, string>;
  }) {
    if (!options) return undefined;
    let params: HttpParams | undefined;
    if (options.params instanceof HttpParams) {
      params = options.params;
    } else if (options.params) {
      let p = new HttpParams();
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          p = p.set(key, String(val));
        }
      });
      params = p;
    }
    return {
      params,
      headers: options.headers,
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let friendlyMessage = 'An unexpected error occurred. Please try again.';
    let code: string | undefined;
    let details: unknown;

    if (error.error instanceof ErrorEvent) {
      friendlyMessage = error.error.message || 'Network connection failed.';
    } else if (error.error && typeof error.error === 'object') {
      const errObj = error.error as Record<string, unknown>;
      if (typeof errObj['message'] === 'string') {
        friendlyMessage = errObj['message'];
      } else if (Array.isArray(errObj['message'])) {
        friendlyMessage = errObj['message'].join('. ');
      }
      if (typeof errObj['code'] === 'string') {
        code = errObj['code'];
      }
      details = errObj['details'];
    } else if (error.status === 0) {
      friendlyMessage = 'Unable to reach BuyMass servers. Please check your internet connection.';
    } else if (error.status === 401) {
      friendlyMessage = 'Your session has expired. Please sign in again.';
    } else if (error.status === 403) {
      friendlyMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      friendlyMessage = 'The requested item was not found.';
    } else if (error.status >= 500) {
      friendlyMessage = 'Server error occurred. Please try again shortly.';
    }

    const apiError: ApiError = {
      status: error.status,
      message: friendlyMessage,
      code,
      details,
    };

    return throwError(() => apiError);
  }
}
