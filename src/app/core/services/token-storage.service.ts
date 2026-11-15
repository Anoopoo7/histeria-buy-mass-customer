import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly ACCESS_KEY = 'buymass_customer_access_token';
  private readonly REFRESH_KEY = 'buymass_customer_refresh_token';

  readonly accessToken = signal<string | null>(this.getAccessToken());

  getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_KEY);
    } catch {
      return null;
    }
  }

  setAccessToken(token: string): void {
    try {
      localStorage.setItem(this.ACCESS_KEY, token);
      this.accessToken.set(token);
    } catch {
      // ignore
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_KEY);
    } catch {
      return null;
    }
  }

  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(this.REFRESH_KEY, token);
    } catch {
      // ignore
    }
  }

  clearTokens(): void {
    try {
      localStorage.removeItem(this.ACCESS_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
      this.accessToken.set(null);
    } catch {
      // ignore
    }
  }
}
