import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  Car,
  Compass,
  Filter,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Store,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { PoolRecord } from '../../../../core/models/pool.model';
import { ProductRecord } from '../../../../core/models/product.model';
import { StoreRecord } from '../../../../core/models/store.model';
import { CartService } from '../../../../core/services/cart.service';
import { LocationService } from '../../../../core/services/location.service';
import { PoolService } from '../../../../core/services/pool.service';
import { ProductService } from '../../../../core/services/product.service';
import { StoreService } from '../../../../core/services/store.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { VEHICLE_PLACEHOLDER_SVG } from '../../../../core/utils/image.utils';
import { HOME_CATEGORIES } from '../../../home/pages/home-page/home-page.component';

@Component({
  selector: 'bm-explore-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-explore-view">
      <!-- Search Input Trigger -->
      <a routerLink="/search" class="bm-search-trigger">
        <lucide-icon [img]="SearchIcon" [size]="18" class="text-secondary"></lucide-icon>
        <span class="bm-placeholder">{{ t('search_placeholder') }}</span>
      </a>

      <!-- Category Filter Pills -->
      <div class="bm-cat-pills-row hide-scroll">
        <button
          type="button"
          class="bm-filter-pill"
          [class.is-active]="selectedCategory() === null"
          (click)="selectCategory(null)"
        >
          All
        </button>
        @for (cat of categories; track cat.id) {
          <button
            type="button"
            class="bm-filter-pill"
            [class.is-active]="selectedCategory() === cat.id"
            (click)="selectCategory(cat.id)"
          >
            {{ cat.icon }} {{ isMalayalam() ? cat.nameMl : cat.name }}
          </button>
        }
      </div>

      <!-- Discovery Radius Status Banner -->
      <div class="bm-radius-indicator">
        <div class="bm-radius-meta">
          <lucide-icon [img]="MapPinIcon" [size]="14" class="text-primary"></lucide-icon>
          <span>{{ locationLabel() }} (within {{ radius() }} km)</span>
        </div>
        <a routerLink="/location" class="bm-radius-change-link">{{ t('loc_change') }}</a>
      </div>

      <!-- Segment Tabs: All / Products / Stores / Pools -->
      <div class="bm-segment-tabs">
        <button
          type="button"
          class="bm-segment-btn"
          [class.is-active]="activeTab() === 'products'"
          (click)="setActiveTab('products')"
        >
          <lucide-icon [img]="CarIcon" [size]="14"></lucide-icon>
          <span>{{ t('search_products') }} ({{ products().length }})</span>
        </button>

        <button
          type="button"
          class="bm-segment-btn"
          [class.is-active]="activeTab() === 'pools'"
          (click)="setActiveTab('pools')"
        >
          <lucide-icon [img]="SparklesIcon" [size]="14"></lucide-icon>
          <span>{{ t('search_pools') }} ({{ pools().length }})</span>
        </button>

        <button
          type="button"
          class="bm-segment-btn"
          [class.is-active]="activeTab() === 'stores'"
          (click)="setActiveTab('stores')"
        >
          <lucide-icon [img]="StoreIcon" [size]="14"></lucide-icon>
          <span>{{ t('search_stores') }} ({{ stores().length }})</span>
        </button>
      </div>

      <!-- Tab Content -->
      @if (isLoading()) {
        @if (activeTab() === 'products') {
          <div class="bm-product-grid">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="bm-product-card is-skeleton">
                <div class="bm-prod-img-wrap bm-skeleton"></div>
                <div class="bm-prod-meta">
                  <div class="bm-skeleton bm-skeleton-text" style="width: 45%; margin-bottom: 3px;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 80%; height: 14px; margin-bottom: 4px;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 45%; height: 15px;"></div>
                </div>
                <div style="padding: 0 8px 8px;">
                  <div class="bm-skeleton" style="height: 30px; border-radius: var(--bm-radius-md);"></div>
                </div>
              </div>
            }
          </div>
        } @else if (activeTab() === 'pools') {
          <div class="bm-pools-list">
            @for (i of [1, 2, 3]; track i) {
              <div class="bm-pool-row-card is-skeleton">
                <div class="bm-pool-thumb bm-skeleton"></div>
                <div class="bm-pool-row-info">
                  <div class="bm-skeleton bm-skeleton-text" style="width: 90px; margin-bottom: 4px;"></div>
                  <div class="bm-skeleton bm-skeleton-title" style="width: 75%; height: 15px; margin-bottom: 6px;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 120px;"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="bm-stores-list">
            @for (i of [1, 2, 3]; track i) {
              <div class="bm-store-row-card is-skeleton">
                <div class="bm-store-img-box bm-skeleton"></div>
                <div class="bm-store-row-info">
                  <div class="bm-skeleton bm-skeleton-title" style="width: 60%; height: 15px; margin-bottom: 4px;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 40%; margin-bottom: 4px;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 75%;"></div>
                </div>
              </div>
            }
          </div>
        }
      } @else {
        <!-- Products View -->
        @if (activeTab() === 'products') {
          @if (products().length > 0) {
            <div class="bm-product-grid">
              @for (product of products(); track product.id) {
                <div class="bm-product-card">
                  <a [routerLink]="['/products', product.id]" class="bm-prod-link">
                    <div class="bm-prod-img-wrap">
                      <img [src]="product.primaryImageUrl || vehiclePlaceholder" [alt]="product.name" class="bm-prod-img" loading="lazy" decoding="async" />
                    </div>
                    <div class="bm-prod-meta">
                      <span class="bm-prod-store">{{ product.storeName || 'Authorized Dealer' }}</span>
                      <h4 class="bm-prod-name">{{ product.name }}</h4>
                      <div class="bm-price-line">
                        <span class="bm-price">₹{{ product.price | number }}</span>
                        <span class="bm-unit">/ {{ product.unit || 'vehicle' }}</span>
                      </div>
                    </div>
                  </a>
                  <button type="button" class="bm-add-btn" (click)="addToCart(product.id)">
                    <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                    <span>{{ t('add_to_cart') }}</span>
                  </button>
                </div>
              }
            </div>
          } @else {
            <div class="bm-empty-tab">
              <p>No vehicles found matching this category within {{ radius() }} km.</p>
            </div>
          }
        }

        <!-- Pools View -->
        @if (activeTab() === 'pools') {
          @if (pools().length > 0) {
            <div class="bm-pools-list">
              @for (pool of pools(); track pool.id) {
                <a [routerLink]="['/pools', pool.id]" class="bm-pool-row-card">
                  <img [src]="pool.primaryImageUrl || vehiclePlaceholder" [alt]="pool.title" class="bm-pool-thumb" loading="lazy" decoding="async" />
                  <div class="bm-pool-row-info">
                    <span class="bm-pool-store">{{ pool.storeName || 'Partner Store' }}</span>
                    <h3 class="bm-pool-row-title">{{ pool.title }}</h3>
                    <div class="bm-pool-tag-line">
                      <span class="bm-tag-discount">Up to {{ pool.maxDiscountPercentage }}% off</span>
                      @if (pool.distanceKm !== undefined) {
                        <span class="bm-tag-dist">{{ pool.distanceKm }} km away</span>
                      }
                    </div>
                  </div>
                </a>
              }
            </div>
          } @else {
            <div class="bm-empty-box">
              <p>No active group buying pools in this category right now.</p>
            </div>
          }
        }

        <!-- Stores View -->
        @if (activeTab() === 'stores') {
          @if (stores().length > 0) {
            <div class="bm-stores-list">
              @for (store of stores(); track store.id) {
                <a [routerLink]="['/stores', store.id]" class="bm-store-row-card">
                  <div class="bm-store-img-box">
                    @if (store.primaryImageUrl) {
                      <img [src]="store.primaryImageUrl" [alt]="store.storeName" class="bm-store-img" loading="lazy" decoding="async" />
                    } @else {
                      <lucide-icon [img]="StoreIcon" [size]="20" class="text-primary"></lucide-icon>
                    }
                  </div>
                  <div class="bm-store-row-info">
                    <div class="bm-store-name-line">
                      <h3 class="bm-store-name">{{ store.storeName }}</h3>
                      @if (store.distanceKm !== undefined) {
                        <span class="bm-dist">{{ store.distanceKm }} km</span>
                      }
                    </div>
                    <span class="bm-store-cat">{{ store.businessType }} • {{ store.city }}</span>
                    @if (store.description) {
                      <p class="bm-desc">{{ store.description }}</p>
                    }
                  </div>
                </a>
              }
            </div>
          } @else {
            <div class="bm-empty-box">
              <p>No partner stores found within {{ radius() }} km.</p>
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .bm-explore-view {
      padding: 12px 14px 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bm-search-trigger {
      display: flex;
      align-items: center;
      gap: 10px;
      height: 44px;
      padding: 0 14px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-full);
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-placeholder {
      font-size: 14px;
      color: var(--bm-color-text-muted);
    }

    .bm-cat-pills-row {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .bm-filter-pill {
      flex-shrink: 0;
      padding: 6px 12px;
      border-radius: var(--bm-radius-full);
      border: 1px solid var(--bm-color-border);
      background-color: var(--bm-color-surface);
      color: var(--bm-color-text-secondary);
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;

      &.is-active {
        background-color: var(--bm-color-primary);
        color: #fff;
        border-color: var(--bm-color-primary);
        font-weight: 600;
      }
    }

    .bm-radius-indicator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      font-size: 12px;
    }

    .bm-radius-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--bm-color-text-secondary);
    }

    .bm-radius-change-link {
      color: var(--bm-color-primary);
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .bm-segment-tabs {
      display: flex;
      border-bottom: 1px solid var(--bm-color-border);
      gap: 8px;
      overflow-x: auto;
    }

    .bm-segment-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px;
      font-size: 13px;
      font-weight: 500;
      color: var(--bm-color-text-secondary);
      border-bottom: 2px solid transparent;
      white-space: nowrap;
      flex-shrink: 0;

      &.is-active {
        color: var(--bm-color-primary);
        border-bottom-color: var(--bm-color-primary);
        font-weight: 600;
      }
    }

    .bm-product-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .bm-product-card {
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

    .bm-prod-img-wrap {
      height: 120px;
      background-color: var(--bm-color-surface-subtle);
    }

    .bm-prod-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-prod-meta {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-prod-store {
      font-size: 10px;
      color: var(--bm-color-text-muted);
    }

    .bm-prod-name {
      font-size: 12px;
      font-weight: 600;
      height: 32px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .bm-price-line {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-top: 4px;
    }

    .bm-price {
      font-size: 13px;
      font-weight: 700;
    }

    .bm-unit {
      font-size: 10px;
      color: var(--bm-color-text-muted);
    }

    .bm-add-btn {
      height: 32px;
      margin: 0 6px 6px;
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      border-radius: var(--bm-radius-sm);
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    // Pools list
    .bm-pools-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-pool-row-card {
      display: flex;
      gap: 12px;
      padding: 10px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
    }

    .bm-pool-thumb {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: var(--bm-radius-sm);
    }

    .bm-pool-row-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bm-pool-store {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-pool-row-title {
      font-size: 13px;
      font-weight: 600;
    }

    .bm-pool-tag-line {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: auto;
    }

    .bm-tag-discount {
      font-size: 11px;
      font-weight: 700;
      color: var(--bm-color-primary);
      background-color: var(--bm-color-primary-soft);
      padding: 1px 6px;
      border-radius: var(--bm-radius-sm);
    }

    .bm-tag-dist {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    // Stores list
    .bm-stores-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-store-row-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
    }

    .bm-store-img-box {
      width: 48px;
      height: 48px;
      border-radius: var(--bm-radius-sm);
      background-color: var(--bm-color-surface-subtle);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .bm-store-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-store-row-info {
      flex: 1;
      min-width: 0;
    }

    .bm-store-name-line {
      display: flex;
      justify-content: space-between;
    }

    .bm-store-name {
      font-size: 14px;
      font-weight: 600;
    }

    .bm-dist {
      font-size: 11px;
      font-weight: 600;
      color: var(--bm-color-primary);
    }

    .bm-store-cat {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-desc {
      font-size: 11px;
      color: var(--bm-color-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-empty-box {
      background-color: var(--bm-color-surface);
      border: 1px dashed var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      padding: 24px 16px;
      text-align: center;
      font-size: 13px;
      color: var(--bm-color-text-secondary);
    }

    .bm-product-card.is-skeleton,
    .bm-pool-row-card.is-skeleton,
    .bm-store-row-card.is-skeleton {
      pointer-events: none;
    }

    .bm-loading-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `],
})
export class ExplorePageComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly poolService = inject(PoolService);
  private readonly storeService = inject(StoreService);
  private readonly cartService = inject(CartService);
  private readonly locationService = inject(LocationService);
  private readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);

  readonly SearchIcon = Search;
  readonly MapPinIcon = MapPin;
  readonly CarIcon = Car;
  readonly SparklesIcon = Sparkles;
  readonly StoreIcon = Store;
  readonly PlusIcon = Plus;
  readonly vehiclePlaceholder = VEHICLE_PLACEHOLDER_SVG;

  readonly categories = HOME_CATEGORIES;
  readonly radius = this.locationService.radiusKm;
  readonly locationLabel = this.locationService.formattedLocationLabel;
  readonly isMalayalam = this.i18n.isMalayalam;

  readonly activeTab = signal<'products' | 'pools' | 'stores'>('products');
  readonly selectedCategory = signal<string | null>(null);

  readonly products = signal<ProductRecord[]>([]);
  readonly pools = signal<PoolRecord[]>([]);
  readonly stores = signal<StoreRecord[]>([]);
  readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      this.loadExploreData();
    });
  }

  setActiveTab(tab: 'products' | 'pools' | 'stores'): void {
    this.activeTab.set(tab);
  }

  selectCategory(catId: string | null): void {
    this.selectedCategory.set(catId);
    this.loadExploreData();
  }

  loadExploreData(): void {
    this.isLoading.set(true);
    const cat = this.selectedCategory() || undefined;

    this.productService.getProducts({ category: cat, limit: 30 }).subscribe({
      next: (res) => this.products.set(res.products),
    });

    this.poolService.getPools({ category: cat, limit: 20 }).subscribe({
      next: (res) => this.pools.set(res.pools),
    });

    this.storeService.getNearbyStores({ limit: 20 }).subscribe({
      next: (res) => {
        this.stores.set(res.stores);
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
