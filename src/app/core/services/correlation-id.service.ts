import { Injectable } from '@angular/core';

export const CORRELATION_ID_STORAGE_KEY = 'buymass_correlation_id';
export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable({
  providedIn: 'root',
})
export class CorrelationIdService {
  private inMemoryCorrelationId: string | null = null;

  /**
   * Retrieves the current saved correlation ID.
   * If none exists in memory or sessionStorage, generates a new UUID,
   * saves it, and returns it.
   */
  getCorrelationId(): string {
    if (this.inMemoryCorrelationId) {
      return this.inMemoryCorrelationId;
    }

    const stored = this.readFromStorage();
    if (stored) {
      this.inMemoryCorrelationId = stored;
      return stored;
    }

    const newId = this.generateUuid();
    this.setCorrelationId(newId);
    return newId;
  }

  /**
   * Persists the given correlation ID in memory and sessionStorage.
   */
  setCorrelationId(id: string): void {
    if (!id || typeof id !== 'string') return;
    const cleanId = id.trim();
    if (!cleanId) return;

    this.inMemoryCorrelationId = cleanId;
    this.writeToStorage(cleanId);
  }

  /**
   * Returns the currently saved correlation ID without generating a new one.
   */
  getSavedCorrelationId(): string | null {
    return this.inMemoryCorrelationId || this.readFromStorage();
  }

  /**
   * Clears the correlation ID from memory and sessionStorage.
   */
  clear(): void {
    this.inMemoryCorrelationId = null;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(CORRELATION_ID_STORAGE_KEY);
      }
    } catch {
      // Storage access blocked or unavailable
    }
  }

  private generateUuid(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private readFromStorage(): string | null {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const val = window.sessionStorage.getItem(CORRELATION_ID_STORAGE_KEY);
        return val ? val.trim() : null;
      }
    } catch {
      // Storage access blocked or unavailable
    }
    return null;
  }

  private writeToStorage(val: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(CORRELATION_ID_STORAGE_KEY, val);
      }
    } catch {
      // Storage access blocked or unavailable
    }
  }
}
