import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Info,
  Lock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { FormattedCart } from '../../../../core/models/cart.model';
import { PoolRecord } from '../../../../core/models/pool.model';
import { StoreRecord } from '../../../../core/models/store.model';
import { CartService } from '../../../../core/services/cart.service';
import { PoolService } from '../../../../core/services/pool.service';
import { StoreService } from '../../../../core/services/store.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-checkout-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-checkout-view">
      <!-- Top Bar -->
      <div class="bm-checkout-top">
        <a routerLink="/cart" class="bm-back-btn" aria-label="Back to Cart">
          <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
        </a>
        <h1 class="bm-checkout-title">{{ t('checkout_title') }}</h1>
      </div>

      @if (isLoading()) {
        <div class="bm-checkout-content is-skeleton">
          <!-- Store Details Card Skeleton -->
          <div class="bm-card bm-store-box">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div class="bm-skeleton bm-skeleton-circle" style="width: 20px; height: 20px;"></div>
              <div class="bm-skeleton bm-skeleton-title" style="width: 160px; height: 18px;"></div>
            </div>
            <div class="bm-skeleton bm-skeleton-text" style="width: 220px;"></div>
          </div>

          <!-- Fulfilment Method Card Skeleton -->
          <div class="bm-card bm-fulfilment-box">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div class="bm-skeleton bm-skeleton-circle" style="width: 20px; height: 20px;"></div>
              <div class="bm-skeleton bm-skeleton-title" style="width: 140px; height: 16px;"></div>
            </div>
            <div class="bm-skeleton bm-skeleton-text" style="width: 85%; margin-bottom: 8px;"></div>
            <div class="bm-skeleton" style="height: 38px; border-radius: var(--bm-radius-sm);"></div>
          </div>

          <!-- Items Snapshot Skeleton -->
          <div class="bm-card bm-items-box">
            <div class="bm-skeleton bm-skeleton-title" style="width: 150px; margin-bottom: 12px;"></div>
            <div class="bm-items-list">
              @for (i of [1, 2]; track i) {
                <div class="bm-checkout-item" style="padding: 8px 0; border-bottom: 1px solid var(--bm-color-border-subtle); display: flex; justify-content: space-between;">
                  <div class="bm-skeleton bm-skeleton-text" style="width: 60%;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 70px;"></div>
                </div>
              }
            </div>
          </div>

          <!-- Summary Box Skeleton -->
          <div class="bm-card bm-summary-box">
            <div class="bm-skeleton bm-skeleton-title" style="width: 120px; margin-bottom: 14px;"></div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div class="bm-skeleton bm-skeleton-text" style="width: 90px;"></div>
              <div class="bm-skeleton bm-skeleton-text" style="width: 60px;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div class="bm-skeleton bm-skeleton-text" style="width: 110px;"></div>
              <div class="bm-skeleton bm-skeleton-text" style="width: 40px;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--bm-color-border);">
              <div class="bm-skeleton bm-skeleton-title" style="width: 100px;"></div>
              <div class="bm-skeleton bm-skeleton-title" style="width: 80px;"></div>
            </div>
          </div>
        </div>

        <!-- Sticky Bottom Bar Skeleton -->
        <div class="bm-checkout-bottom-bar is-skeleton">
          <div>
            <div class="bm-skeleton bm-skeleton-text" style="width: 60px; margin-bottom: 4px;"></div>
            <div class="bm-skeleton bm-skeleton-title" style="width: 90px; height: 22px;"></div>
          </div>
          <div class="bm-skeleton bm-skeleton-btn" style="width: 160px; height: 44px;"></div>
        </div>
      } @else {
        @if (cart(); as c) {
        <div class="bm-checkout-content">
          <!-- Store Details Card -->
          <div class="bm-card bm-store-box">
            <div class="bm-store-head">
              <lucide-icon [img]="StoreIcon" [size]="18" class="text-primary"></lucide-icon>
              <h2 class="bm-store-name">{{ c.store.name }}</h2>
            </div>
            <div class="bm-store-location">
              <lucide-icon [img]="MapPinIcon" [size]="14" class="text-muted"></lucide-icon>
              <span>Authorized Dealership Showroom • Kerala</span>
            </div>
          </div>

          <!-- Fulfilment Method Card (Store Pickup) -->
          <div class="bm-card bm-fulfilment-box">
            <div class="bm-fulfilment-head">
              <lucide-icon [img]="ShieldCheckIcon" [size]="20" class="text-primary"></lucide-icon>
              <h3 class="bm-fulfilment-title">{{ t('checkout_pickup_title') }}</h3>
            </div>
            <p class="bm-fulfilment-desc">{{ t('checkout_pickup_desc') }}</p>
            <div class="bm-otp-notice">
              <span>A secure 6-digit handover OTP will be dispatched to your registered WhatsApp when the dealership confirms your vehicle booking.</span>
            </div>
          </div>

          <!-- Items Snapshot -->
          <div class="bm-card bm-items-box">
            <h3 class="bm-card-heading">Vehicle Booking Items ({{ c.itemCount }})</h3>
            <div class="bm-items-list">
              @for (item of c.items; track item.productId) {
                <div class="bm-checkout-item">
                  <div class="bm-item-left">
                    <span class="bm-item-qty">{{ item.quantity }}x</span>
                    <span class="bm-item-title">{{ item.name }}</span>
                  </div>
                  <span class="bm-item-amount">₹{{ ((item.currentPrice || item.priceAtAddition) * item.quantity) | number }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Applicable Pool Opportunity OR No Active Pool Alert -->
          @if (activeStorePool(); as pool) {
            <div class="bm-card bm-pool-opp-card">
              <div class="bm-opp-head">
                <lucide-icon [img]="SparklesIcon" [size]="18" class="text-primary"></lucide-icon>
                <span class="bm-opp-title">Vehicle Pool Active: {{ pool.title }}</span>
              </div>
              <p class="bm-opp-desc">
                Your booking will join <strong>{{ pool.title }}</strong> to earn up to {{ pool.maxDiscountPercentage || 15 }}% off showroom price!
              </p>
            </div>
          }

          <!-- Order Cost Summary -->
          <div class="bm-card bm-summary-box">
            <h3 class="bm-card-heading">{{ t('checkout_summary') }}</h3>

            <div class="bm-summary-row">
              <span class="bm-summary-label">{{ t('checkout_item_total') }}</span>
              <span class="bm-summary-val">₹{{ c.cartTotal | number }}</span>
            </div>

            <div class="bm-summary-row">
              <span class="bm-summary-label">Showroom Handover & PDI</span>
              <span class="bm-summary-val text-success">INCLUDED</span>
            </div>

            @if (activeStorePool()) {
              <div class="bm-summary-row">
                <span class="bm-summary-label">{{ t('checkout_group_discount') }}</span>
                <span class="bm-summary-val text-success">Up to {{ activeStorePool()?.maxDiscountPercentage }}% off</span>
              </div>
            } @else {
              <div class="bm-summary-row">
                <span class="bm-summary-label">{{ t('checkout_group_discount') }}</span>
                <span class="bm-summary-val text-muted">No Active Pool</span>
              </div>
            }

            <div class="bm-summary-divider"></div>

            <div class="bm-summary-row is-total">
              <span class="bm-total-label">{{ t('checkout_final_estimate') }}</span>
              <span class="bm-total-val">₹{{ c.cartTotal | number }}</span>
            </div>
          </div>
        </div>

        <!-- Sticky Confirmation Bar -->
        <div class="bm-sticky-confirm-bar">
          <div class="bm-confirm-total-box">
            <span class="bm-total-sub">Total Payable at Showroom</span>
            <span class="bm-total-amount">₹{{ c.cartTotal | number }}</span>
            @if (!isLoadingPool() && !activeStorePool()) {
              <span class="bm-pool-req-text">Active pool required to confirm</span>
            }
          </div>

          <button
            type="button"
            class="bm-btn-confirm-order"
            [class.is-disabled]="!activeStorePool()"
            [disabled]="isSubmitting() || isLoadingPool() || !activeStorePool()"
            (click)="confirmOrder(c.id, c.store.id)"
          >
            <lucide-icon [img]="activeStorePool() ? CheckCircleIcon : LockIcon" [size]="18"></lucide-icon>
            <span>
              @if (isSubmitting()) {
                Confirming...
              } @else if (isLoadingPool()) {
                Checking Pool...
              } @else if (!activeStorePool()) {
                Active Pool Required
              } @else {
                {{ t('checkout_place_order') }}
              }
            </span>
          </button>
        </div>
        } @else {
          <div class="bm-empty-checkout">
            <p>No active cart items found for this store.</p>
            <a routerLink="/cart" class="bm-btn-return">Return to Cart</a>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .bm-checkout-view {
      padding-bottom: 90px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-checkout-top {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background-color: var(--bm-color-surface);
      border-bottom: 1px solid var(--bm-color-border);
    }

    .bm-back-btn {
      color: var(--bm-color-text-primary);
      display: flex;
      align-items: center;
    }

    .bm-checkout-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-checkout-content {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 14px;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-card-heading {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      margin-bottom: 10px;
    }

    .bm-store-box {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bm-store-head {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm-store-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-store-location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-fulfilment-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-fulfilment-head {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bm-fulfilment-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-fulfilment-desc {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
    }

    .bm-otp-notice {
      background-color: var(--bm-color-surface-subtle);
      border: 1px dashed var(--bm-color-primary-border);
      border-radius: var(--bm-radius-md);
      padding: 8px 10px;
      font-size: 11px;
      color: var(--bm-color-text-primary);
      line-height: 1.35;
    }

    .bm-items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-checkout-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
    }

    .bm-item-left {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
    }

    .bm-item-qty {
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-item-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-item-amount {
      font-weight: 600;
      white-space: nowrap;
    }

    .bm-pool-opp-card {
      background-color: var(--bm-color-primary-soft);
      border-color: var(--bm-color-primary-border);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bm-opp-head {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm-opp-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-opp-desc {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.35;
    }

    .bm-summary-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;

      &.is-total {
        font-size: 16px;
        font-weight: 800;
        margin-top: 4px;
      }
    }

    .bm-summary-label {
      color: var(--bm-color-text-secondary);
    }

    .bm-summary-val {
      font-weight: 600;
    }

    .bm-summary-divider {
      height: 1px;
      background-color: var(--bm-color-border-subtle);
      margin: 4px 0;
    }

    .bm-total-label {
      color: var(--bm-color-text-primary);
    }

    .bm-total-val {
      color: var(--bm-color-primary);
    }

    .bm-sticky-confirm-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-width: var(--bm-max-mobile-width);
      margin: 0 auto;
      background-color: var(--bm-color-surface);
      border-top: 1px solid var(--bm-color-border);
      padding: 10px 14px calc(10px + var(--bm-safe-bottom));
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1000;
      box-shadow: var(--bm-shadow-sheet);
    }

    .bm-confirm-total-box {
      display: flex;
      flex-direction: column;
    }

    .bm-total-sub {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-total-amount {
      font-size: 18px;
      font-weight: 800;
      color: var(--bm-color-text-primary);
    }

    .bm-pool-req-text {
      font-size: 10.5px;
      font-weight: 600;
      color: #dc2626;
      margin-top: 2px;
    }

    .bm-btn-confirm-order {
      height: 44px;
      padding: 0 18px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      gap: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover:not(:disabled) {
        background-color: var(--bm-color-primary-hover);
      }

      &:disabled,
      &.is-disabled {
        opacity: 0.55;
        cursor: not-allowed;
        background-color: #94a3b8;
        box-shadow: none;
      }
    }

    .bm-checkout-content.is-skeleton,
    .bm-checkout-bottom-bar.is-skeleton {
      pointer-events: none;
    }

    .bm-empty-checkout {
      padding: 48px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .bm-btn-return {
      padding: 8px 16px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      border-radius: var(--bm-radius-md);
    }
  `],
})
export class CheckoutPageComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly poolService = inject(PoolService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly StoreIcon = Store;
  readonly MapPinIcon = MapPin;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly SparklesIcon = Sparkles;
  readonly CheckCircleIcon = CheckCircle2;
  readonly AlertCircleIcon = AlertCircle;
  readonly LockIcon = Lock;

  readonly cart = signal<FormattedCart | null>(null);
  readonly activeStorePool = signal<PoolRecord | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly isLoadingPool = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const storeId = params['storeId'];
      if (storeId) {
        this.isLoading.set(true);
        this.cartService.loadCarts().subscribe({
          next: () => {
            const matchingCart = this.cartService.getStoreCart(storeId);
            this.cart.set(matchingCart || null);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });

        // Check strictly for ACTIVE pools for this store
        this.isLoadingPool.set(true);
        this.poolService.getPools({ storeId, limit: 10, ignoreLocation: true }).subscribe({
          next: (res) => {
            // Strictly check for ACTIVE status
            const active = res.pools.find((p) => p.status === 'ACTIVE');
            this.activeStorePool.set(active || null);
            this.isLoadingPool.set(false);
          },
          error: () => {
            this.activeStorePool.set(null);
            this.isLoadingPool.set(false);
          },
        });
      } else {
        this.isLoading.set(false);
        this.isLoadingPool.set(false);
      }
    });
  }

  confirmOrder(cartId: string, storeId: string): void {
    const pool = this.activeStorePool();
    if (!pool) {
      this.toast.error('Booking disabled: No active group-buying pool for this showroom.');
      return;
    }

    this.isSubmitting.set(true);
    // In BuyMass group-buying model, orders strictly add to the active pool
    this.poolService.participateInPool(pool.id, cartId).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success('Store order submitted to pool! You will receive pickup OTP on WhatsApp.');
        this.cartService.loadCarts().subscribe();
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toast.error(err.message || 'Order submission could not be completed.');
      },
    });
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
