import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Car, Plus, Search } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { ProductRecord } from '../../../../core/models/product.model';
import { CartService } from '../../../../core/services/cart.service';
import { LocationService } from '../../../../core/services/location.service';
import { ProductService } from '../../../../core/services/product.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { VEHICLE_PLACEHOLDER_SVG } from '../../../../core/utils/image.utils';

@Component({
  selector: 'bm-products-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-products-view">
      <!-- Header -->
      <div class="bm-page-head">
        <h1 class="bm-title">{{ t('sec_popular_products') }}</h1>
        <span class="bm-count">{{ products().length }} vehicles found</span>
      </div>

      <!-- Products 2-Column Grid -->
      @if (isLoading()) {
        <div class="bm-prod-grid">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="bm-grid-skeleton bm-skeleton"></div>
          }
        </div>
      } @else if (products().length > 0) {
        <div class="bm-prod-grid">
          @for (product of products(); track product.id) {
            <div class="bm-card">
              <a [routerLink]="['/products', product.id]" class="bm-card-link">
                <div class="bm-card-img-box">
                  <img
                    [src]="product.primaryImageUrl || vehiclePlaceholder"
                    [alt]="product.name"
                    class="bm-card-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="bm-card-meta">
                  <span class="bm-card-store">{{ product.storeName || 'Authorized Dealership' }}</span>
                  <h3 class="bm-card-name">{{ product.name }}</h3>
                  <div class="bm-card-price-row">
                    <span class="bm-price">₹{{ product.price | number }}</span>
                    @if (product.originalPrice && product.originalPrice > product.price) {
                      <span class="bm-orig">₹{{ product.originalPrice | number }}</span>
                    }
                    <span class="bm-unit">/ {{ product.unit || 'vehicle' }}</span>
                  </div>
                </div>
              </a>

              <button
                type="button"
                class="bm-add-cart-action"
                (click)="addToCart(product.id)"
              >
                <lucide-icon [img]="PlusIcon" [size]="15"></lucide-icon>
                <span>{{ t('add_to_cart') }}</span>
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="bm-empty-catalog">
          <p>No vehicles available matching your criteria.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-products-view {
      padding: 14px 14px 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bm-page-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }

    .bm-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      letter-spacing: -0.4px;
    }

    .bm-count {
      font-size: 12px;
      color: var(--bm-color-text-muted);
    }

    .bm-prod-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .bm-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-card-link {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .bm-card-img-box {
      height: 130px;
      background-color: var(--bm-color-surface-subtle);
    }

    .bm-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-card-meta {
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
    }

    .bm-card-store {
      font-size: 10px;
      color: var(--bm-color-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-card-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
      line-height: 1.3;
      height: 34px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .bm-card-price-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-top: 4px;
    }

    .bm-price {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-orig {
      font-size: 11px;
      color: var(--bm-color-text-muted);
      text-decoration: line-through;
    }

    .bm-unit {
      font-size: 10px;
      color: var(--bm-color-text-muted);
    }

    .bm-add-cart-action {
      height: 34px;
      margin: 0 8px 8px;
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
      transition: all 0.15s ease;

      &:active {
        background-color: var(--bm-color-primary);
        color: #fff;
      }
    }

    .bm-grid-skeleton {
      height: 220px;
      border-radius: var(--bm-radius-lg);
    }

    .bm-empty-catalog {
      padding: 32px 16px;
      text-align: center;
      font-size: 13px;
      color: var(--bm-color-text-secondary);
      background-color: var(--bm-color-surface);
      border: 1px dashed var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
    }
  `],
})
export class ProductsPageComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);

  readonly PlusIcon = Plus;
  readonly vehiclePlaceholder = VEHICLE_PLACEHOLDER_SVG;

  readonly products = signal<ProductRecord[]>([]);
  readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const category = params['category'];
      const storeId = params['storeId'];
      this.loadProducts(category, storeId);
    });
  }

  loadProducts(category?: string, storeId?: string): void {
    this.isLoading.set(true);
    this.productService.getProducts({ category, storeId, limit: 40 }).subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  addToCart(productId: string): void {
    const prod = this.products().find((p) => p.id === productId);
    this.cartService.addItem(productId, 1, prod || undefined).subscribe();
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
