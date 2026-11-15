import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  ShoppingBag,
  Sparkles,
  Store,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { PoolRecord } from '../../../../core/models/pool.model';
import { ProductRecord } from '../../../../core/models/product.model';
import { StoreRecord } from '../../../../core/models/store.model';
import { CartService } from '../../../../core/services/cart.service';
import { PoolService } from '../../../../core/services/pool.service';
import { ProductService } from '../../../../core/services/product.service';
import { RecentlyViewedService } from '../../../../core/services/recently-viewed.service';
import { StoreService } from '../../../../core/services/store.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-store-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-store-detail-view">
      <!-- Top Navigation & Banner -->
      <div class="bm-store-banner">
        <a routerLink="/stores" class="bm-back-circle" aria-label="Back">
          <lucide-icon [img]="ArrowLeftIcon" [size]="18"></lucide-icon>
        </a>

        @if (store()?.primaryImageUrl) {
          <img [src]="store()?.primaryImageUrl" [alt]="store()?.storeName" class="bm-banner-img" />
        } @else {
          <div class="bm-banner-placeholder">
            <lucide-icon [img]="StoreIcon" [size]="36" class="text-muted"></lucide-icon>
          </div>
        }
      </div>

      <!-- Store Profile Header -->
      <div class="bm-store-profile-box">
        <div class="bm-profile-head">
          <h1 class="bm-profile-name">{{ store()?.storeName || 'Partner Merchant Store' }}</h1>
          <span class="bm-profile-cat">{{ store()?.businessType || 'General Store' }}</span>
        </div>

        <div class="bm-profile-location">
          <lucide-icon [img]="MapPinIcon" [size]="14" class="text-primary"></lucide-icon>
          <span>
            {{ store()?.addressLine1 ? store()?.addressLine1 + ', ' : '' }}{{ store()?.city || 'Kerala' }}
            {{ store()?.postalCode ? '• ' + store()?.postalCode : '' }}
          </span>
        </div>

        @if (store()?.description) {
          <p class="bm-profile-desc">{{ store()?.description }}</p>
        }
      </div>

      <!-- Active Group-Buying Deals for this Store -->
      @if (pools().length > 0) {
        <section class="bm-store-pools-section">
          <div class="bm-sec-header">
            <lucide-icon [img]="SparklesIcon" [size]="16" class="text-primary"></lucide-icon>
            <h2 class="bm-sec-title">Store Group-Buying Campaigns</h2>
          </div>

          <div class="bm-pools-slider hide-scroll">
            @for (pool of pools(); track pool.id) {
              <a [routerLink]="['/pools', pool.id]" class="bm-pool-mini-card">
                <div class="bm-pool-mini-head">
                  <span class="bm-badge-discount">Up to {{ pool.maxDiscountPercentage }}% OFF</span>
                </div>
                <h3 class="bm-pool-mini-title">{{ pool.title }}</h3>
                <span class="bm-pool-mini-cta">Join Group Deal →</span>
              </a>
            }
          </div>
        </section>
      }

      <!-- Store Products Catalog -->
      <section class="bm-store-products-section">
        <h2 class="bm-sec-title">Products Available at this Store</h2>

        @if (isLoadingProducts()) {
          <div class="bm-products-grid">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="bm-prod-skeleton bm-skeleton"></div>
            }
          </div>
        } @else if (products().length > 0) {
          <div class="bm-products-grid">
            @for (prod of products(); track prod.id) {
              <div class="bm-prod-card">
                <a [routerLink]="['/products', prod.id]" class="bm-prod-link">
                  <div class="bm-prod-img-box">
                    <img [src]="prod.primaryImageUrl || '/favicon.ico'" [alt]="prod.name" class="bm-prod-img" />
                  </div>
                  <div class="bm-prod-info">
                    <h4 class="bm-prod-title">{{ prod.name }}</h4>
                    <div class="bm-price-box">
                      <span class="bm-price">₹{{ prod.price }}</span>
                      <span class="bm-unit">/ {{ prod.unit }}</span>
                    </div>
                  </div>
                </a>
                <button type="button" class="bm-btn-add" (click)="addToCart(prod.id)">
                  <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                  <span>{{ t('add_to_cart') }}</span>
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="bm-empty-catalog">
            <p>No products currently listed for this store.</p>
          </div>
        }
      </section>

      <!-- Store Cart Sticky Bar if customer has items in this store's cart -->
      @if (currentStoreCart(); as storeCart) {
        @if (storeCart.items.length > 0) {
          <div class="bm-store-cart-bar">
            <div class="bm-cart-summary">
              <span class="bm-cart-count">{{ storeCart.itemCount }} {{ t('cart_items') }}</span>
              <span class="bm-cart-total">₹{{ storeCart.cartTotal }}</span>
            </div>
            <a routerLink="/cart" class="bm-view-cart-btn">
              <span>View Store Cart</span>
              <lucide-icon [img]="ChevronRightIcon" [size]="16"></lucide-icon>
            </a>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .bm-store-detail-view {
      padding-bottom: 80px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .bm-store-banner {
      position: relative;
      height: 160px;
      background-color: var(--bm-color-surface-subtle);
      width: 100%;
    }

    .bm-banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-banner-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bm-back-circle {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 36px;
      height: 36px;
      border-radius: var(--bm-radius-full);
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bm-color-text-primary);
      box-shadow: var(--bm-shadow-sm);
      z-index: 10;
    }

    .bm-store-profile-box {
      margin: -24px 14px 0;
      position: relative;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 16px;
      box-shadow: var(--bm-shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bm-profile-head {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-profile-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      letter-spacing: -0.4px;
    }

    .bm-profile-cat {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      font-weight: 500;
    }

    .bm-profile-location {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      margin-top: 2px;
    }

    .bm-profile-desc {
      font-size: 13px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
      margin-top: 6px;
      border-top: 1px solid var(--bm-color-border-subtle);
      padding-top: 8px;
    }

    .bm-store-pools-section {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-sec-header {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm-sec-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-pools-slider {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .bm-pool-mini-card {
      flex: 0 0 220px;
      background-color: var(--bm-color-primary-soft);
      border: 1px solid var(--bm-color-primary-border);
      border-radius: var(--bm-radius-md);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bm-badge-discount {
      font-size: 11px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-pool-mini-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-pool-mini-cta {
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-primary);
      margin-top: auto;
    }

    .bm-store-products-section {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-products-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .bm-prod-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .bm-prod-link {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .bm-prod-img-box {
      height: 120px;
      background-color: var(--bm-color-surface-subtle);
    }

    .bm-prod-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-prod-info {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-prod-title {
      font-size: 13px;
      font-weight: 600;
      height: 32px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .bm-price-box {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-top: 4px;
    }

    .bm-price {
      font-size: 14px;
      font-weight: 700;
    }

    .bm-unit {
      font-size: 10px;
      color: var(--bm-color-text-muted);
    }

    .bm-btn-add {
      height: 32px;
      margin: 0 6px 6px;
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      border-radius: var(--bm-radius-sm);
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .bm-prod-skeleton {
      height: 180px;
      border-radius: var(--bm-radius-md);
    }

    .bm-empty-catalog {
      padding: 24px 16px;
      text-align: center;
      background-color: var(--bm-color-surface);
      border: 1px dashed var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      font-size: 13px;
      color: var(--bm-color-text-secondary);
    }

    // Sticky store cart summary bar
    .bm-store-cart-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: var(--bm-color-primary);
      color: #fff;
      padding: 10px 16px calc(10px + var(--bm-safe-bottom));
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: var(--bm-max-mobile-width);
      margin: 0 auto;
      z-index: 950;
      box-shadow: var(--bm-shadow-sheet);
    }

    .bm-cart-summary {
      display: flex;
      flex-direction: column;
    }

    .bm-cart-count {
      font-size: 11px;
      opacity: 0.9;
    }

    .bm-cart-total {
      font-size: 16px;
      font-weight: 700;
    }

    .bm-view-cart-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      background-color: #fff;
      color: var(--bm-color-primary);
      padding: 8px 14px;
      border-radius: var(--bm-radius-md);
      font-size: 13px;
      font-weight: 700;
    }
  `],
})
export class StoreDetailPageComponent implements OnInit {
  private readonly storeService = inject(StoreService);
  private readonly productService = inject(ProductService);
  private readonly poolService = inject(PoolService);
  private readonly cartService = inject(CartService);
  private readonly recentService = inject(RecentlyViewedService);
  private readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly StoreIcon = Store;
  readonly MapPinIcon = MapPin;
  readonly SparklesIcon = Sparkles;
  readonly PlusIcon = Plus;
  readonly ChevronRightIcon = ChevronRight;

  readonly store = signal<StoreRecord | null>(null);
  readonly products = signal<ProductRecord[]>([]);
  readonly pools = signal<PoolRecord[]>([]);
  readonly isLoadingProducts = signal<boolean>(true);

  readonly currentStoreCart = signal<any>(null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const storeId = params['storeId'];
      if (storeId) {
        this.loadStoreDetails(storeId);
      }
    });
  }

  loadStoreDetails(storeId: string): void {
    this.storeService.getStoreById(storeId).subscribe({
      next: (s) => {
        if (s) {
          this.store.set(s);
          this.recentService.trackStore(s);
        } else {
          // Fallback minimal store info
          this.store.set({
            id: storeId,
            storeName: 'Kerala Partner Merchant',
            businessType: 'General Retail',
            city: 'Kerala',
            state: 'Kerala',
            postalCode: '682001',
            status: 'APPROVED',
          });
        }
      },
    });

    this.isLoadingProducts.set(true);
    this.productService.getProducts({ storeId, limit: 30 }).subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.isLoadingProducts.set(false);
      },
      error: () => this.isLoadingProducts.set(false),
    });

    this.poolService.getPools({ storeId, limit: 10 }).subscribe({
      next: (res) => this.pools.set(res.pools),
    });

    // Check if store cart exists in cart service
    const existing = this.cartService.getStoreCart(storeId);
    this.currentStoreCart.set(existing || null);
  }

  addToCart(productId: string): void {
    this.cartService.addItem(productId, 1).subscribe({
      next: () => {
        const storeId = this.store()?.id;
        if (storeId) {
          this.currentStoreCart.set(this.cartService.getStoreCart(storeId));
        }
      },
    });
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
