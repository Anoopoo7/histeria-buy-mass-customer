import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface AddedToCartData {
  productId: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  storeName?: string;
  category?: string;
  brand?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartModalService {
  private readonly router = inject(Router);

  readonly isOpen = signal<boolean>(false);
  readonly data = signal<AddedToCartData | null>(null);

  open(item: AddedToCartData): void {
    // Never show popup inside the cart page
    if (this.isCartPage()) {
      return;
    }

    this.data.set(item);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  private isCartPage(): boolean {
    const url = this.router.url;
    return url === '/cart' || url.startsWith('/cart/') || url.startsWith('/cart?');
  }
}
