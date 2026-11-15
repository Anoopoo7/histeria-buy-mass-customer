import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { FormattedCart, FormattedCartItem, GetActiveCartsResponse } from '../models/cart.model';
import { ApiClientService } from './api-client.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly api = inject(ApiClientService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  private readonly _carts = signal<FormattedCart[]>([]);
  readonly carts = this._carts.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  // Total items across all store carts (for the bottom navigation badge)
  readonly totalItemCount = computed(() => {
    return this._carts().reduce((sum, cart) => sum + (cart.itemCount || cart.items.length), 0);
  });

  // Total active store carts
  readonly totalStoreCount = computed(() => this._carts().length);

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.loadCarts().subscribe();
    }
  }

  /**
   * GET /api/v1/cart
   * Loads all store-separated carts for the authenticated customer.
   */
  loadCarts(): Observable<FormattedCart[]> {
    if (!this.auth.isAuthenticated()) {
      return of([]);
    }

    this._isLoading.set(true);
    return this.api.get<GetActiveCartsResponse>('/api/v1/cart').pipe(
      map((res) => res?.carts || []),
      tap((carts) => {
        this._carts.set(carts);
        this._isLoading.set(false);
      }),
      catchError(() => {
        this._isLoading.set(false);
        return of([]);
      }),
    );
  }

  /**
   * Get active cart for a specific store
   */
  getStoreCart(storeId: string): FormattedCart | undefined {
    return this._carts().find((c) => c.store.id === storeId);
  }

  /**
   * POST /api/v1/cart/items
   * Adds product to cart. The backend assigns it to the appropriate store cart.
   */
  addItem(productId: string, quantity = 1): Observable<any> {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in to add items to your cart.');
      return of(null);
    }

    this._isLoading.set(true);
    return this.api.post<{ message: string; cart: FormattedCart }>('/api/v1/cart/items', { productId, quantity }).pipe(
      tap((res) => {
        this.toast.success('Item added to store cart');
        this.loadCarts().subscribe();
      }),
      catchError((err) => {
        this._isLoading.set(false);
        this.toast.error(err.message || 'Could not add item to cart');
        return of(null);
      }),
    );
  }

  /**
   * PATCH /api/v1/cart/items/:productId
   * Updates matching product quantity.
   */
  updateItemQuantity(productId: string, quantity: number): Observable<any> {
    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    this._isLoading.set(true);
    return this.api.patch<{ message: string; cart: FormattedCart }>(`/api/v1/cart/items/${productId}`, { quantity }).pipe(
      tap(() => {
        this.loadCarts().subscribe();
      }),
      catchError((err) => {
        this._isLoading.set(false);
        this.toast.error(err.message || 'Could not update item quantity');
        return of(null);
      }),
    );
  }

  /**
   * DELETE /api/v1/cart/items/:productId
   * Removes product from cart.
   */
  removeItem(productId: string): Observable<any> {
    this._isLoading.set(true);
    return this.api.delete<{ message: string; cart: FormattedCart }>(`/api/v1/cart/items/${productId}`).pipe(
      tap(() => {
        this.toast.info('Item removed from cart');
        this.loadCarts().subscribe();
      }),
      catchError((err) => {
        this._isLoading.set(false);
        this.toast.error(err.message || 'Could not remove item');
        return of(null);
      }),
    );
  }

  /**
   * DELETE /api/v1/cart/store/:storeId
   * Clears the specific store cart.
   */
  clearStoreCart(storeId: string): Observable<any> {
    this._isLoading.set(true);
    return this.api.delete<{ message: string }>(`/api/v1/cart/store/${storeId}`).pipe(
      tap(() => {
        this.toast.info('Store cart cleared');
        this.loadCarts().subscribe();
      }),
      catchError((err) => {
        this._isLoading.set(false);
        this.toast.error(err.message || 'Could not clear store cart');
        return of(null);
      }),
    );
  }
}
