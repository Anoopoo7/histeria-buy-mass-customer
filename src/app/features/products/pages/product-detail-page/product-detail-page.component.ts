import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  ArrowLeft,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  ShoppingBag,
  Sparkles,
  Store,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { PoolRecord } from '../../../../core/models/pool.model';
import { ProductRecord } from '../../../../core/models/product.model';
import { CartService } from '../../../../core/services/cart.service';
import { PoolService } from '../../../../core/services/pool.service';
import { ProductService } from '../../../../core/services/product.service';
import { RecentlyViewedService } from '../../../../core/services/recently-viewed.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-product-detail-view">
      <!-- Top Action Bar -->
      <div class="bm-top-bar">
        <a routerLink="/products" class="bm-icon-circle-btn" aria-label="Back">
          <lucide-icon [img]="ArrowLeftIcon" [size]="18"></lucide-icon>
        </a>
      </div>

      @if (product(); as prod) {
        <!-- Product Image Showcase -->
        <div class="bm-gallery-box">
          <img
            [src]="selectedImage() || prod.primaryImageUrl || '/favicon.ico'"
            [alt]="prod.name"
            class="bm-main-gallery-img"
          />

          @if (prod.imageUrls && prod.imageUrls.length > 1) {
            <div class="bm-thumb-strip">
              @for (img of prod.imageUrls; track img) {
                <button
                  type="button"
                  class="bm-thumb-btn"
                  [class.is-selected]="selectedImage() === img"
                  (click)="selectedImage.set(img)"
                >
                  <img [src]="img" [alt]="prod.name" class="bm-thumb-img" />
                </button>
              }
            </div>
          }
        </div>

        <!-- Product Core Info Card -->
        <div class="bm-info-card">
          <!-- Store Link -->
          <a [routerLink]="['/stores', prod.storeId]" class="bm-store-attribution">
            <lucide-icon [img]="StoreIcon" [size]="14" class="text-primary"></lucide-icon>
            <span class="bm-store-name">{{ prod.storeName || 'Partner Store' }}</span>
            <lucide-icon [img]="ChevronRightIcon" [size]="12" class="text-muted"></lucide-icon>
          </a>

          <h1 class="bm-prod-title">{{ prod.name }}</h1>

          <!-- Price & Discount -->
          <div class="bm-price-row">
            <span class="bm-price-val">₹{{ prod.price }}</span>
            @if (prod.originalPrice && prod.originalPrice > prod.price) {
              <span class="bm-orig-val">₹{{ prod.originalPrice }}</span>
              <span class="bm-save-badge">
                Save {{ Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) }}%
              </span>
            }
            <span class="bm-unit-label">/ {{ prod.unit }}</span>
          </div>

          <!-- Group-Buying Deal Notification Banner if available -->
          @if (relatedPool(); as pool) {
            <div class="bm-pool-callout">
              <div class="bm-pool-callout-icon">
                <lucide-icon [img]="SparklesIcon" [size]="18"></lucide-icon>
              </div>
              <div class="bm-pool-callout-info">
                <span class="bm-pool-callout-title">Active Group Deal Available!</span>
                <p class="bm-pool-callout-sub">
                  Join {{ pool.title }} to unlock up to {{ pool.maxDiscountPercentage }}% collective volume discount.
                </p>
                <a [routerLink]="['/pools', pool.id]" class="bm-pool-callout-link">
                  View Pool & Join →
                </a>
              </div>
            </div>
          }

          <!-- Description -->
          <div class="bm-desc-block">
            <h3 class="bm-desc-heading">Product Details</h3>
            <p class="bm-desc-text">
              {{ prod.description || 'Quality product sourced directly by local Kerala merchant. Pickup verified with WhatsApp OTP.' }}
            </p>
            @if (prod.brand) {
              <div class="bm-spec-row">
                <span class="bm-spec-label">Brand:</span>
                <span class="bm-spec-val">{{ prod.brand }}</span>
              </div>
            }
            @if (prod.category) {
              <div class="bm-spec-row">
                <span class="bm-spec-label">Category:</span>
                <span class="bm-spec-val">{{ prod.category }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Sticky Bottom Add-to-Cart Bar -->
        <div class="bm-bottom-action-bar">
          <div class="bm-qty-selector">
            <button
              type="button"
              class="bm-qty-btn"
              [disabled]="quantity() <= 1"
              (click)="decrementQty()"
              aria-label="Decrease quantity"
            >
              <lucide-icon [img]="MinusIcon" [size]="14"></lucide-icon>
            </button>
            <span class="bm-qty-val">{{ quantity() }}</span>
            <button
              type="button"
              class="bm-qty-btn"
              (click)="incrementQty()"
              aria-label="Increase quantity"
            >
              <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
            </button>
          </div>

          <button
            type="button"
            class="bm-add-submit-btn"
            (click)="addToCart(prod.id)"
          >
            <lucide-icon [img]="ShoppingBagIcon" [size]="18"></lucide-icon>
            <span>{{ t('add_to_cart') }} • ₹{{ prod.price * quantity() }}</span>
          </button>
        </div>
      } @else if (isLoading()) {
        <div class="bm-loading-placeholder">
          <div class="bm-gallery-skeleton bm-skeleton"></div>
          <div class="bm-info-skeleton bm-skeleton"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-product-detail-view {
      padding-bottom: 90px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px 0;
    }

    .bm-icon-circle-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--bm-radius-full);
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bm-color-text-primary);
    }

    .bm-gallery-box {
      width: 100%;
      background-color: var(--bm-color-surface);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
    }

    .bm-main-gallery-img {
      max-height: 240px;
      width: 100%;
      object-fit: contain;
    }

    .bm-thumb-strip {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      overflow-x: auto;
    }

    .bm-thumb-btn {
      width: 48px;
      height: 48px;
      border-radius: var(--bm-radius-sm);
      border: 1px solid var(--bm-color-border);
      overflow: hidden;

      &.is-selected {
        border-color: var(--bm-color-primary);
        border-width: 2px;
      }
    }

    .bm-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-info-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      margin: 0 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-store-attribution {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      padding: 4px 10px;
      border-radius: var(--bm-radius-full);
      align-self: flex-start;
      font-size: 12px;
      font-weight: 500;
    }

    .bm-prod-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      line-height: 1.3;
    }

    .bm-price-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .bm-price-val {
      font-size: 20px;
      font-weight: 800;
      color: var(--bm-color-primary);
    }

    .bm-orig-val {
      font-size: 14px;
      color: var(--bm-color-text-muted);
      text-decoration: line-through;
    }

    .bm-save-badge {
      font-size: 11px;
      font-weight: 700;
      color: var(--bm-color-success);
      background-color: var(--bm-color-success-bg);
      padding: 2px 6px;
      border-radius: var(--bm-radius-sm);
    }

    .bm-unit-label {
      font-size: 12px;
      color: var(--bm-color-text-muted);
    }

    .bm-pool-callout {
      display: flex;
      gap: 10px;
      background-color: var(--bm-color-primary-soft);
      border: 1px solid var(--bm-color-primary-border);
      border-radius: var(--bm-radius-md);
      padding: 12px;
    }

    .bm-pool-callout-icon {
      color: var(--bm-color-primary);
      flex-shrink: 0;
    }

    .bm-pool-callout-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .bm-pool-callout-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-pool-callout-sub {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.3;
    }

    .bm-pool-callout-link {
      font-size: 12px;
      font-weight: 700;
      color: var(--bm-color-primary);
      margin-top: 4px;
    }

    .bm-desc-block {
      border-top: 1px solid var(--bm-color-border-subtle);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bm-desc-heading {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
    }

    .bm-desc-text {
      font-size: 13px;
      color: var(--bm-color-text-secondary);
      line-height: 1.5;
    }

    .bm-spec-row {
      display: flex;
      gap: 8px;
      font-size: 12px;
    }

    .bm-spec-label {
      color: var(--bm-color-text-muted);
      width: 70px;
    }

    .bm-spec-val {
      color: var(--bm-color-text-primary);
      font-weight: 500;
    }

    // Sticky Bottom Action Bar
    .bm-bottom-action-bar {
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
      gap: 12px;
      z-index: 1000;
      box-shadow: var(--bm-shadow-sheet);
    }

    .bm-qty-selector {
      display: flex;
      align-items: center;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      height: 44px;
      padding: 0 4px;
    }

    .bm-qty-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bm-color-text-primary);

      &:disabled {
        opacity: 0.3;
      }
    }

    .bm-qty-val {
      min-width: 24px;
      text-align: center;
      font-weight: 700;
      font-size: 14px;
    }

    .bm-add-submit-btn {
      flex: 1;
      height: 44px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }
    }

    .bm-gallery-skeleton {
      height: 240px;
      border-radius: var(--bm-radius-lg);
      margin: 14px;
    }

    .bm-info-skeleton {
      height: 180px;
      border-radius: var(--bm-radius-lg);
      margin: 0 14px;
    }
  `],
})
export class ProductDetailPageComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly poolService = inject(PoolService);
  private readonly cartService = inject(CartService);
  private readonly recentService = inject(RecentlyViewedService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly StoreIcon = Store;
  readonly ChevronRightIcon = ChevronRight;
  readonly SparklesIcon = Sparkles;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly Math = Math;

  readonly product = signal<ProductRecord | null>(null);
  readonly selectedImage = signal<string | null>(null);
  readonly relatedPool = signal<PoolRecord | null>(null);
  readonly quantity = signal<number>(1);
  readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const productId = params['productId'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(productId: string): void {
    this.isLoading.set(true);
    this.productService.getProductById(productId).subscribe({
      next: (prod) => {
        if (prod) {
          this.product.set(prod);
          this.selectedImage.set(prod.primaryImageUrl || null);
          this.recentService.trackProduct(prod);

          // Check if there are pools for this product or store
          this.poolService.getPools({ storeId: prod.storeId, limit: 1 }).subscribe({
            next: (poolRes) => {
              if (poolRes.pools.length > 0) {
                this.relatedPool.set(poolRes.pools[0]);
              }
            },
          });
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  incrementQty(): void {
    this.quantity.update((q) => q + 1);
  }

  decrementQty(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  addToCart(productId: string): void {
    this.cartService.addItem(productId, this.quantity()).subscribe();
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
