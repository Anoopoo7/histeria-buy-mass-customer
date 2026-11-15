import { Injectable, signal } from '@angular/core';
import { ProductRecord } from '../models/product.model';
import { StoreRecord } from '../models/store.model';

@Injectable({
  providedIn: 'root',
})
export class RecentlyViewedService {
  private readonly RECENT_PRODUCTS_KEY = 'bm_recent_products';
  private readonly RECENT_STORES_KEY = 'bm_recent_stores';

  private readonly _recentProducts = signal<ProductRecord[]>(this.getInitialProducts());
  readonly recentProducts = this._recentProducts.asReadonly();

  private readonly _recentStores = signal<StoreRecord[]>(this.getInitialStores());
  readonly recentStores = this._recentStores.asReadonly();

  trackProduct(product: ProductRecord): void {
    this._recentProducts.update((list) => {
      const filtered = list.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 10);
      this.persist(this.RECENT_PRODUCTS_KEY, updated);
      return updated;
    });
  }

  trackStore(store: StoreRecord): void {
    this._recentStores.update((list) => {
      const filtered = list.filter((s) => s.id !== store.id);
      const updated = [store, ...filtered].slice(0, 8);
      this.persist(this.RECENT_STORES_KEY, updated);
      return updated;
    });
  }

  private persist(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  private getInitialProducts(): ProductRecord[] {
    try {
      const s = localStorage.getItem(this.RECENT_PRODUCTS_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  }

  private getInitialStores(): StoreRecord[] {
    try {
      const s = localStorage.getItem(this.RECENT_STORES_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  }
}
