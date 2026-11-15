import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(type: ToastMessage['type'], text: string, duration = 3500): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, text, duration };
    this._toasts.update((current) => [...current, toast]);

    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  success(text: string, duration?: number): void {
    this.show('success', text, duration);
  }

  error(text: string, duration?: number): void {
    this.show('error', text, duration);
  }

  info(text: string, duration?: number): void {
    this.show('info', text, duration);
  }

  warning(text: string, duration?: number): void {
    this.show('warning', text, duration);
  }

  dismiss(id: string): void {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
