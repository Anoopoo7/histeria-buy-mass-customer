import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ArrowRight,
  ChevronRight,
  Info,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { FormattedCart, FormattedCartItem } from '../../../../core/models/cart.model';
import { CartService } from '../../../../core/services/cart.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-cart-view">
      <!-- Header -->
      <div class="bm-cart-header">
        <h1 class="bm-cart-title">{{ t('cart_title') }}</h1>
        @if (carts().length > 0) {
          <span class="bm-store-count-badge">
            {{ carts().length }} {{ carts().length === 1 ? 'store cart' : 'store carts' }}
          </span>
        }
      </div>

      <!-- Store Separation Notice -->
      @if (carts().length > 0) {
        <div class="bm-notice-box">
          <lucide-icon [img]="InfoIcon" [size]="16" class="text-primary"></lucide-icon>
          <p class="bm-notice-text">{{ t('cart_multi_notice') }}</p>
        </div>
      }

      <!-- Store Carts List -->
      @if (isLoading()) {
        <div class="bm-loading-list">
          @for (i of [1, 2]; track i) {
            <div class="bm-cart-skeleton bm-skeleton"></div>
          }
        </div>
      } @else if (carts().length > 0) {
        <div class="bm-carts-container">
          @for (cart of carts(); track cart.id) {
            <div class="bm-store-cart-card">
              <!-- Store Cart Header -->
              <div class="bm-store-cart-head">
                <a [routerLink]="['/stores', cart.store.id]" class="bm-store-meta">
                  <lucide-icon [img]="StoreIcon" [size]="18" class="text-primary"></lucide-icon>
                  <span class="bm-store-name">{{ cart.store.name }}</span>
                  <lucide-icon [img]="ChevronRightIcon" [size]="14" class="text-muted"></lucide-icon>
                </a>

                <button
                  type="button"
                  class="bm-btn-clear-store"
                  (click)="clearStoreCart(cart.store.id)"
                  title="Clear this store cart"
                >
                  <lucide-icon [img]="TrashIcon" [size]="14"></lucide-icon>
                  <span>{{ t('cart_clear') }}</span>
                </button>
              </div>

              <!-- Cart Line Items -->
              <div class="bm-items-list">
                @for (item of cart.items; track item.productId) {
                  <div class="bm-item-row">
                    <img
                      [src]="item.image || '/favicon.ico'"
                      [alt]="item.name"
                      class="bm-item-thumb"
                    />

                    <div class="bm-item-details">
                      <h4 class="bm-item-name">{{ item.name }}</h4>
                      <div class="bm-item-unit-price">
                        ₹{{ item.currentPrice || item.priceAtAddition }}
                        @if (item.unit) {
                          <span class="bm-unit-sub">/ {{ item.unit }}</span>
                        }
                      </div>
                      <span class="bm-item-line-total">
                        Total: ₹{{ item.itemSubtotal || ((item.currentPrice || item.priceAtAddition) * item.quantity) }}
                      </span>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="bm-qty-control-box">
                      <button
                        type="button"
                        class="bm-qty-btn"
                        (click)="updateQuantity(item.productId, item.quantity - 1)"
                        aria-label="Decrease quantity"
                      >
                        <lucide-icon [img]="MinusIcon" [size]="12"></lucide-icon>
                      </button>
                      <span class="bm-qty-display">{{ item.quantity }}</span>
                      <button
                        type="button"
                        class="bm-qty-btn"
                        (click)="updateQuantity(item.productId, item.quantity + 1)"
                        aria-label="Increase quantity"
                      >
                        <lucide-icon [img]="PlusIcon" [size]="12"></lucide-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Store Cart Footer: Subtotal & Actions -->
              <div class="bm-store-cart-footer">
                <div class="bm-subtotal-row">
                  <span class="bm-subtotal-label">{{ t('cart_subtotal') }}</span>
                  <span class="bm-subtotal-val">₹{{ cart.cartTotal }}</span>
                </div>

                <div class="bm-cart-actions-row">
                  <a
                    [routerLink]="['/pools']"
                    [queryParams]="{ storeId: cart.store.id }"
                    class="bm-btn-join-pool"
                  >
                    <lucide-icon [img]="SparklesIcon" [size]="14"></lucide-icon>
                    <span>{{ t('cart_join_pool_prompt') }}</span>
                  </a>

                  <a
                    [routerLink]="['/checkout', cart.store.id]"
                    class="bm-btn-checkout"
                  >
                    <span>{{ t('cart_proceed_checkout') }}</span>
                    <lucide-icon [img]="ArrowRightIcon" [size]="14"></lucide-icon>
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Empty Cart -->
        <div class="bm-cart-empty">
          <div class="bm-empty-icon-wrap">
            <lucide-icon [img]="ShoppingBagIcon" [size]="36" class="text-muted"></lucide-icon>
          </div>
          <h3 class="bm-empty-title">{{ t('cart_empty_title') }}</h3>
          <p class="bm-empty-sub">{{ t('cart_empty_sub') }}</p>
          <a routerLink="/explore" class="bm-btn-explore">
            {{ t('cart_continue_shopping') }}
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-cart-view {
      padding: 14px 14px 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bm-cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bm-cart-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--bm-color-text-primary);
      letter-spacing: -0.4px;
    }

    .bm-store-count-badge {
      font-size: 11px;
      font-weight: 600;
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      padding: 3px 8px;
      border-radius: var(--bm-radius-full);
    }

    .bm-notice-box {
      display: flex;
      gap: 8px;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      padding: 10px 12px;
    }

    .bm-notice-text {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
    }

    .bm-carts-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .bm-store-cart-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      overflow: hidden;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-store-cart-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background-color: var(--bm-color-surface-subtle);
      border-bottom: 1px solid var(--bm-color-border);
    }

    .bm-store-meta {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm-store-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-btn-clear-store {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--bm-color-danger);
      font-size: 11px;
      font-weight: 600;
      opacity: 0.8;

      &:hover {
        opacity: 1;
      }
    }

    .bm-items-list {
      display: flex;
      flex-direction: column;
      padding: 0 14px;
    }

    .bm-item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--bm-color-border-subtle);

      &:last-child {
        border-bottom: none;
      }
    }

    .bm-item-thumb {
      width: 52px;
      height: 52px;
      object-fit: cover;
      border-radius: var(--bm-radius-md);
      background-color: var(--bm-color-surface-subtle);
      flex-shrink: 0;
    }

    .bm-item-details {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-item-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-item-unit-price {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-unit-sub {
      font-size: 10px;
      color: var(--bm-color-text-muted);
    }

    .bm-item-line-total {
      font-size: 12px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-qty-control-box {
      display: flex;
      align-items: center;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      height: 32px;
      padding: 0 2px;
    }

    .bm-qty-btn {
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bm-color-text-primary);
    }

    .bm-qty-display {
      min-width: 22px;
      text-align: center;
      font-size: 12px;
      font-weight: 700;
    }

    .bm-store-cart-footer {
      padding: 14px;
      background-color: var(--bm-color-surface-subtle);
      border-top: 1px solid var(--bm-color-border);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-subtotal-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }

    .bm-subtotal-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-secondary);
    }

    .bm-subtotal-val {
      font-size: 18px;
      font-weight: 800;
      color: var(--bm-color-text-primary);
    }

    .bm-cart-actions-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .bm-btn-join-pool {
      height: 40px;
      background-color: var(--bm-color-primary-soft);
      border: 1px solid var(--bm-color-primary-border);
      color: var(--bm-color-primary);
      border-radius: var(--bm-radius-md);
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      text-align: center;
    }

    .bm-btn-checkout {
      height: 40px;
      background-color: var(--bm-color-primary);
      color: #fff;
      border-radius: var(--bm-radius-md);
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      text-align: center;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }
    }

    .bm-cart-empty {
      padding: 48px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      background-color: var(--bm-color-surface);
      border: 1px dashed var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
    }

    .bm-empty-icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: var(--bm-radius-full);
      background-color: var(--bm-color-surface-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bm-empty-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-empty-sub {
      font-size: 13px;
      color: var(--bm-color-text-secondary);
      max-width: 260px;
    }

    .bm-btn-explore {
      margin-top: 8px;
      padding: 10px 20px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      border-radius: var(--bm-radius-md);
    }

    .bm-cart-skeleton {
      height: 180px;
      border-radius: var(--bm-radius-lg);
      margin-bottom: 12px;
    }

    .bm-loading-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `],
})
export class CartPageComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly i18n = inject(TranslationService);

  readonly StoreIcon = Store;
  readonly ChevronRightIcon = ChevronRight;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly SparklesIcon = Sparkles;
  readonly ArrowRightIcon = ArrowRight;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly InfoIcon = Info;

  readonly carts = this.cartService.carts;
  readonly isLoading = this.cartService.isLoading;

  ngOnInit(): void {
    this.cartService.loadCarts().subscribe();
  }

  updateQuantity(productId: string, qty: number): void {
    this.cartService.updateItemQuantity(productId, qty).subscribe();
  }

  clearStoreCart(storeId: string): void {
    if (confirm('Clear all items from this store cart?')) {
      this.cartService.clearStoreCart(storeId).subscribe();
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
