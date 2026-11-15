import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export type GoogleMapsStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'no_key';

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsLoaderService {
  private loadPromise: Promise<boolean> | null = null;
  readonly status = signal<GoogleMapsStatus>('idle');
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any).gm_authFailure = () => {
        this.status.set('error');
        this.errorMessage.set('Google Maps authentication failed. Please verify your API key restrictions.');
      };
    }
  }

  load(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return Promise.resolve(false);
    }

    if ((window as any).google?.maps) {
      this.status.set('loaded');
      return Promise.resolve(true);
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    const apiKey = environment.googleMapsApiKey?.trim();
    if (!apiKey) {
      this.status.set('no_key');
      this.errorMessage.set('Google Maps API key is not configured in .env');
      return Promise.resolve(false);
    }

    this.status.set('loading');
    this.errorMessage.set(null);

    this.loadPromise = new Promise<boolean>((resolve) => {
      const existingScript = document.getElementById('google-maps-sdk');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          this.status.set('loaded');
          resolve(true);
        });
        existingScript.addEventListener('error', () => {
          this.status.set('error');
          this.errorMessage.set('Failed to load Google Maps SDK script');
          resolve(false);
        });
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-sdk';
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,geometry`;

      script.onload = () => {
        this.status.set('loaded');
        resolve(true);
      };

      script.onerror = () => {
        this.status.set('error');
        this.errorMessage.set('Could not load Google Maps SDK. Please check your network or API key.');
        resolve(false);
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}
