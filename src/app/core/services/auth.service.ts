import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  PublicUser,
  RegisterRequest,
  RegisterResponse,
  SendPhoneOtpRequest,
  SendPhoneOtpResponse,
  VerifyPhoneOtpRequest,
  VerifyPhoneOtpResponse,
} from '../models/auth.model';
import { ApiClientService, ApiError } from './api-client.service';
import { ToastService } from './toast.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiClient = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<PublicUser | null>(this.getInitialUser());
  readonly currentUser = this._currentUser.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  readonly isAuthenticated = computed(() => !!this._currentUser() && !!this.tokenStorage.accessToken());
  readonly isPhoneVerified = computed(() => !!this._currentUser()?.isPhoneVerified);

  private readonly _pendingPhone = signal<string | null>(null);
  readonly pendingPhone = this._pendingPhone.asReadonly();

  initializeSession(): Observable<boolean> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return of(false);
    }

    return this.refreshTokens().pipe(
      map(() => true),
      catchError(() => {
        this.tokenStorage.clearTokens();
        this._currentUser.set(null);
        return of(false);
      }),
    );
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    this._isLoading.set(true);
    const requestPayload: RegisterRequest = {
      ...payload,
      acceptTerms: true,
    };

    return this.apiClient.post<RegisterResponse>('/api/v1/auth/register', requestPayload).pipe(
      tap((res) => {
        this._isLoading.set(false);
        this._pendingPhone.set(payload.phone);
      }),
      catchError((err: ApiError) => {
        this._isLoading.set(false);
        return throwError(() => err);
      }),
    );
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    const request = {
      email: payload.identifier,
      password: payload.password,
    };

    return this.apiClient.post<AuthResponse>('/api/v1/auth/login', request).pipe(
      tap((res) => {
        this.tokenStorage.setAccessToken(res.accessToken);
        this.tokenStorage.setRefreshToken(res.refreshToken);
        this._currentUser.set(res.user);
        this.persistUser(res.user);
        this._isLoading.set(false);
      }),
      catchError((err: ApiError) => {
        this._isLoading.set(false);
        return throwError(() => err);
      }),
    );
  }

  sendPhoneOtp(phone: string): Observable<SendPhoneOtpResponse> {
    this._isLoading.set(true);
    const req: SendPhoneOtpRequest = { phone };
    return this.apiClient.post<SendPhoneOtpResponse>('/api/v1/auth/phone/otp/send', req).pipe(
      tap((res) => {
        this._isLoading.set(false);
        this._pendingPhone.set(phone);
        this.toast.info(res.message || 'Verification code sent to your WhatsApp');
      }),
      catchError((err: ApiError) => {
        this._isLoading.set(false);
        return throwError(() => err);
      }),
    );
  }

  verifyPhone(phone: string, otp: string): Observable<VerifyPhoneOtpResponse> {
    this._isLoading.set(true);
    const req: VerifyPhoneOtpRequest = { phone: phone.trim(), otp: otp.trim() };
    return this.apiClient.post<VerifyPhoneOtpResponse>('/api/v1/auth/phone/otp/verify', req).pipe(
      tap((res) => {
        this._isLoading.set(false);
        this.toast.success(res.message || 'Phone number verified successfully');
        const curr = this._currentUser();
        if (curr) {
          const updated = { ...curr, isPhoneVerified: true, phone: phone.trim() };
          this._currentUser.set(updated);
          this.persistUser(updated);
        }
      }),
      catchError((err: ApiError) => {
        this._isLoading.set(false);
        return throwError(() => err);
      }),
    );
  }

  refreshTokens(): Observable<AuthResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => ({
        status: 401,
        message: 'No refresh token available.',
      } as ApiError));
    }

    return this.apiClient.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken }).pipe(
      tap((res) => {
        this.tokenStorage.setAccessToken(res.accessToken);
        this.tokenStorage.setRefreshToken(res.refreshToken);
        this._currentUser.set(res.user);
        this.persistUser(res.user);
      }),
      catchError((err: ApiError) => {
        this.tokenStorage.clearTokens();
        this._currentUser.set(null);
        this.persistUser(null);
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    this.tokenStorage.clearTokens();
    this._currentUser.set(null);
    this.persistUser(null);
    this.toast.info('Signed out successfully.');
    this.router.navigate(['/home']);
  }

  setPendingPhone(phone: string | null): void {
    this._pendingPhone.set(phone);
  }

  private persistUser(user: PublicUser | null): void {
    try {
      if (user) {
        localStorage.setItem('buymass_customer_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('buymass_customer_user');
      }
    } catch {
      // ignore
    }
  }

  private getInitialUser(): PublicUser | null {
    try {
      const stored = localStorage.getItem('buymass_customer_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
