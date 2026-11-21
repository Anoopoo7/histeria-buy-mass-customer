import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { FormattedCart, FormattedCartItem, GetActiveCartsResponse, GetSubmittedCartsResponse, CartStatus } from '../models/cart.model';
import { optimizeImageUrl } from '../utils/image.utils';
import { ApiClientService } from './api-client.service';
import { AuthService } from './auth.service';
import { AddedToCartData, CartModalService } from './cart-modal.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly api = inject(ApiClientService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly cartModalService = inject(CartModalService);

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
      map((res) => {
        const carts = res?.carts || [];
        return carts.map((c) => ({
          ...c,
          items: (c.items || []).map((item) => ({
            ...item,
            image: optimizeImageUrl(item.image, 'thumb'),
          })),
        }));
      }),
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
  addItem(
    productId: string,
    quantity = 1,
    productHint?: {
      name?: string;
      image?: string | null;
      primaryImageUrl?: string | null;
      price?: number;
      storeName?: string;
      category?: string;
      brand?: string;
    },
  ): Observable<any> {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in to add items to your cart.');
      return of(null);
    }

    this._isLoading.set(true);
    return this.api
      .post<{ message: string; cart: FormattedCart }>('/api/v1/cart/items', { productId, quantity })
      .pipe(
        tap((res) => {
          this.loadCarts().subscribe();

          // Show added to cart popup across app (suppressed automatically on /cart)
          const foundItem = res?.cart?.items?.find((i: any) => i.productId === productId);
          const modalItem: AddedToCartData = {
            productId,
            name: productHint?.name || foundItem?.name || 'Vehicle',
            image: optimizeImageUrl(productHint?.primaryImageUrl || productHint?.image || foundItem?.image, 'thumb'),
            price: productHint?.price ?? (foundItem?.currentPrice || foundItem?.priceAtAddition || 0),
            quantity,
            storeName: productHint?.storeName || res?.cart?.store?.name,
            category: productHint?.category,
            brand: productHint?.brand,
          };
          this.cartModalService.open(modalItem);
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

  /**
   * GET /api/v1/cart/submitted
   * Returns paginated submitted carts (carts submitted to pool but not placed as order).
   * Filterable by storeId and status.
   */
  getSubmittedCarts(params?: {
    page?: number;
    limit?: number;
    storeId?: string;
    status?: CartStatus | CartStatus[] | 'ALL';
  }): Observable<GetSubmittedCartsResponse> {
    if (!this.auth.isAuthenticated()) {
      return of({
        data: [],
        pagination: { total: 0, page: 1, limit: params?.limit || 10, totalPages: 0 },
      });
    }

    const queryParams: Record<string, string | number> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    if (params?.storeId) {
      queryParams['storeId'] = params.storeId;
    }

    if (params?.status) {
      queryParams['status'] = Array.isArray(params.status) ? params.status.join(',') : params.status;
    } else {
      queryParams['status'] = 'SUBMITTED';
    }

    return this.api.get<GetSubmittedCartsResponse>('/api/v1/cart/submitted', { params: queryParams }).pipe(
      catchError(() =>
        of({
          data: [],
          pagination: { total: 0, page: 1, limit: params?.limit || 10, totalPages: 0 },
        }),
      ),
    );
  }

  /**
   * GET /api/v1/cart/submitted/:cartId
   * Returns single submitted cart details by cart ID.
   */
  getSubmittedCartById(cartId: string): Observable<FormattedCart | null> {
    if (!this.auth.isAuthenticated() || !cartId) {
      return of(null);
    }
    return this.api.get<{ cart: FormattedCart }>(`/api/v1/cart/submitted/${cartId}`).pipe(
      map((res) => res?.cart || null),
      catchError(() => of(null)),
    );
  }
}
