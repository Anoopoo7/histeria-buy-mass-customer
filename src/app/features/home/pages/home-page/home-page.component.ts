import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ArrowRight,
  Car,
  ChevronRight,
  Plus,
  Search,
  Sparkles,
  Store,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { DiscoveryRadius } from '../../../../core/models/location.model';
import { PoolRecord } from '../../../../core/models/pool.model';
import { ProductRecord } from '../../../../core/models/product.model';
import { StoreRecord } from '../../../../core/models/store.model';
import { CartService } from '../../../../core/services/cart.service';
import { LocationService } from '../../../../core/services/location.service';
import { PoolService } from '../../../../core/services/pool.service';
import { ProductService } from '../../../../core/services/product.service';
import { RecentlyViewedService } from '../../../../core/services/recently-viewed.service';
import { StoreService } from '../../../../core/services/store.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { CountdownTimerComponent } from '../../../../shared/ui/countdown-timer/countdown-timer.component';
import { PoolProgressComponent } from '../../../../shared/ui/pool-progress/pool-progress.component';
import { VEHICLE_PLACEHOLDER_SVG } from '../../../../core/utils/image.utils';

export interface CategoryCard {
  id: string;
  name: string;
  nameMl: string;
  icon: string;
}

export const HOME_CATEGORIES: CategoryCard[] = [
  { id: 'cars', name: 'Cars & SUVs', nameMl: 'കാറുകൾ & എസ്‌യുവി', icon: '🚗' },
  { id: 'bikes', name: 'Bikes & Moto', nameMl: 'ബൈക്കുകൾ', icon: '🏍️' },
  { id: 'scooters', name: 'Scooters', nameMl: 'സ്കൂട്ടറുകൾ', icon: '🛵' },
  { id: 'ev', name: 'Electric (EV)', nameMl: 'ഇലക്ട്രിക് (EV)', icon: '⚡' },
  { id: 'sedans', name: 'Luxury Cars', nameMl: 'ലക്ഷ്വറി & സെഡാൻ', icon: '🏎️' },
  { id: 'commercial', name: 'Commercial', nameMl: 'വാണിജ്യ വാഹനം', icon: '🛞' },
  { id: 'riding-gear', name: 'Riding Gear', nameMl: 'റൈഡിംഗ് ഗിയർ', icon: '🪖' },
  { id: 'spares', name: 'Accessories', nameMl: 'ആക്‌സസറികൾ', icon: '🔧' },
];

@Component({
  selector: 'bm-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    CountdownTimerComponent,
    PoolProgressComponent,
  ],
  template: `
    <div class="bm-home-view">
      <!-- Search Bar Banner -->
      <section class="bm-home-search-wrap">
        <a routerLink="/search" class="bm-search-input-fake" aria-label="Search">
          <lucide-icon [img]="SearchIcon" [size]="18" class="bm-search-icon"></lucide-icon>
          <span class="bm-search-placeholder">{{ t('search_placeholder') }}</span>
        </a>
      </section>
      <!-- Active Group-Buying Pools (Core Highlight) -->
      <section class="bm-section">
        <div class="bm-section-head">
          <div class="bm-head-title-group">
            <h2 class="bm-section-title">
              <lucide-icon [img]="SparklesIcon" [size]="18" class="text-primary"></lucide-icon>
              <span>{{ t('sec_active_pools') }}</span>
            </h2>
            <p class="bm-section-subtitle">{{ t('sec_active_pools_sub') }}</p>
          </div>
          <a routerLink="/pools" class="bm-section-link">
            <span>{{ t('view_all') }}</span>
            <lucide-icon [img]="ChevronRightIcon" [size]="14"></lucide-icon>
          </a>
        </div>

        @if (isLoadingPools()) {
          <div class="bm-carousel hide-scroll">
            @for (i of [1, 2]; track i) {
              <div class="bm-pool-card is-skeleton">
                <div class="bm-pool-img-wrap bm-skeleton"></div>
                <div class="bm-pool-body">
                  <div class="bm-skeleton bm-skeleton-text" style="width: 45%; margin-bottom: 6px;"></div>
                  <div class="bm-skeleton bm-skeleton-title" style="width: 80%; margin-bottom: 12px;"></div>
                  <div class="bm-skeleton" style="height: 6px; width: 100%; border-radius: 3px; margin-bottom: 10px;"></div>
                  <div class="bm-pool-tiers-preview">
                    <div class="bm-tier-preview-pill is-skeleton bm-skeleton"></div>
                    <div class="bm-tier-preview-pill is-skeleton bm-skeleton"></div>
                    <div class="bm-tier-preview-pill is-skeleton bm-skeleton"></div>
                  </div>
                  <div class="bm-skeleton bm-skeleton-btn" style="width: 100%; margin-top: 10px;"></div>
                </div>
              </div>
            }
          </div>
        } @else if (pools().length > 0) {
          <div class="bm-carousel hide-scroll">
            @for (pool of pools(); track pool.id) {
              <div class="bm-pool-card">
                <div class="bm-pool-img-wrap">
                  <img
                    [src]="pool.primaryImageUrl || vehiclePlaceholder"
                    [alt]="pool.title"
                    class="bm-pool-img"
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="bm-pool-badge-overlay">
                    <bm-countdown-timer [endsAt]="pool.endsAt"></bm-countdown-timer>
                  </div>
                </div>

                <div class="bm-pool-body">
                  <div class="bm-pool-store-row">
                    <span class="bm-pool-store-name">{{ pool.storeName || 'Authorized Dealership' }}</span>
                    @if (pool.distanceKm !== undefined) {
                      <span class="bm-pool-distance">{{ pool.distanceKm }} km</span>
                    }
                  </div>

                  <h3 class="bm-pool-title">{{ pool.title }}</h3>

                  <!-- Volume progress & discount tiers -->
                  <bm-pool-progress
                    [progress]="pool.progress"
                    [currentAmount]="pool.currentTotalAmount || 0"
                    [targetAmount]="pool.targetAmount || 10000"
                    [participantCountInput]="pool.currentParticipantCount || 0"
                    [maxDiscountInput]="pool.maxDiscountPercentage || 15"
                    [tiers]="pool.tiers"
                  ></bm-pool-progress>

                  <a [routerLink]="['/pools', pool.id]" class="bm-pool-cta-btn">
                    <span>{{ t('pool_join_btn') }}</span>
                    <lucide-icon [img]="ArrowRightIcon" [size]="14"></lucide-icon>
                  </a>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="bm-empty-zone-card">
            <p class="bm-empty-zone-msg">
              No active pools within {{ radius() >= 10000 ? 'any distance' : radius() + ' km' }}.
            </p>
            @if (radius() < 10000) {
              <button type="button" class="bm-switch-nolimit-btn" (click)="setNoLimit()">
                Show All Pools (Kerala)
              </button>
            }
          </div>
        }
      </section>

      <!-- Browse Categories -->
      <section class="bm-section">
        <div class="bm-section-head">
          <h2 class="bm-section-title">{{ t('sec_browse_categories') }}</h2>
        </div>
        <div class="bm-cat-scroll hide-scroll">
          @for (cat of categories; track cat.id) {
            <a [routerLink]="['/explore']" [queryParams]="{ category: cat.id }" class="bm-cat-item">
              <div class="bm-cat-bubble">
                <span class="bm-cat-emoji">{{ cat.icon }}</span>
              </div>
              <span class="bm-cat-name">{{ isMalayalam() ? cat.nameMl : cat.name }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Nearby Stores -->
      <section class="bm-section">
        <div class="bm-section-head">
          <div class="bm-head-title-group">
            <h2 class="bm-section-title">
              <lucide-icon [img]="StoreIcon" [size]="18" class="text-primary"></lucide-icon>
              <span>{{ t('sec_nearby_stores') }}</span>
            </h2>
            <p class="bm-section-subtitle">{{ t('sec_nearby_stores_sub') }}</p>
          </div>
          <a routerLink="/stores" class="bm-section-link">
            <span>{{ t('view_all') }}</span>
            <lucide-icon [img]="ChevronRightIcon" [size]="14"></lucide-icon>
          </a>
        </div>

        @if (isLoadingStores()) {
          <div class="bm-grid-stores">
            @for (i of [1, 2, 3]; track i) {
              <div class="bm-store-card is-skeleton">
                <div class="bm-store-avatar bm-skeleton"></div>
                <div class="bm-store-info">
                  <div class="bm-store-row">
                    <div class="bm-skeleton bm-skeleton-text" style="width: 55%; height: 14px;"></div>
                    <div class="bm-skeleton bm-skeleton-text" style="width: 38px;"></div>
                  </div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 70%; margin-top: 4px;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 85%; margin-top: 4px;"></div>
                </div>
              </div>
            }
          </div>
        } @else if (stores().length > 0) {
          <div class="bm-grid-stores">
            @for (store of stores().slice(0, 4); track store.id) {
              <a [routerLink]="['/stores', store.id]" class="bm-store-card">
                <div class="bm-store-avatar">
                  @if (store.primaryImageUrl) {
                    <img [src]="store.primaryImageUrl" [alt]="store.storeName" class="bm-store-img" loading="lazy" decoding="async" />
                  } @else {
                    <lucide-icon [img]="StoreIcon" [size]="20" class="bm-store-fallback-icon"></lucide-icon>
                  }
                </div>
                <div class="bm-store-info">
                  <div class="bm-store-row">
                    <h3 class="bm-store-title">{{ store.storeName }}</h3>
                    @if (store.distanceKm !== undefined) {
                      <span class="bm-store-dist">{{ store.distanceKm }} km</span>
                    }
                  </div>
                  <span class="bm-store-cat">{{ store.businessType || 'Dealership' }} • {{ store.city }}</span>
                  @if (store.description) {
                    <p class="bm-store-desc">{{ store.description }}</p>
                  }
                </div>
                <lucide-icon [img]="ChevronRightIcon" [size]="16" class="bm-store-chevron"></lucide-icon>
              </a>
            }
          </div>
        } @else {
          <div class="bm-empty-zone-card">
            <p class="bm-empty-zone-msg">
              No authorized dealerships within {{ radius() >= 10000 ? 'any distance' : radius() + ' km' }}.
            </p>
            @if (radius() < 10000) {
              <button type="button" class="bm-switch-nolimit-btn" (click)="setNoLimit()">
                Show All Dealers (Kerala)
              </button>
            }
          </div>
        }
      </section>

      <!-- Popular Products -->
      <section class="bm-section">
        <div class="bm-section-head">
          <div class="bm-head-title-group">
            <h2 class="bm-section-title">
              <lucide-icon [img]="CarIcon" [size]="18" class="text-primary"></lucide-icon>
              <span>{{ t('sec_popular_products') }}</span>
            </h2>
          </div>
          <a routerLink="/products" class="bm-section-link">
            <span>{{ t('view_all') }}</span>
            <lucide-icon [img]="ChevronRightIcon" [size]="14"></lucide-icon>
          </a>
        </div>

        @if (isLoadingProducts()) {
          <div class="bm-product-grid">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="bm-product-card is-skeleton">
                <div class="bm-product-img-box bm-skeleton"></div>
                <div class="bm-product-meta">
                  <div class="bm-skeleton bm-skeleton-text" style="width: 45%; margin-bottom: 3px;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 85%; height: 14px; margin-bottom: 4px;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 50%; height: 15px;"></div>
                </div>
                <div style="padding: 0 10px 10px;">
                  <div class="bm-skeleton" style="height: 32px; border-radius: var(--bm-radius-md);"></div>
                </div>
              </div>
            }
          </div>
        } @else if (products().length > 0) {
          <div class="bm-product-grid">
            @for (product of products().slice(0, 6); track product.id) {
              <div class="bm-product-card">
                <a [routerLink]="['/products', product.id]" class="bm-product-media-link">
                  <div class="bm-product-img-box">
                    <img
                      [src]="product.primaryImageUrl || vehiclePlaceholder"
                      [alt]="product.name"
                      class="bm-product-img"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div class="bm-product-meta">
                    <span class="bm-product-store">{{ product.storeName || 'Authorized Dealer' }}</span>
                    <h4 class="bm-product-title">{{ product.name }}</h4>
                    <div class="bm-price-row">
                      <span class="bm-product-price">₹{{ product.price | number }}</span>
                      @if (product.originalPrice && product.originalPrice > product.price) {
                        <span class="bm-product-orig">₹{{ product.originalPrice | number }}</span>
                      }
                      <span class="bm-product-unit">/ {{ product.unit || 'vehicle' }}</span>
                    </div>
                  </div>
                </a>

                <button
                  type="button"
                  class="bm-add-cart-btn"
                  (click)="addToCart(product.id)"
                  aria-label="Add to cart"
                >
                  <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
                  <span>{{ t('add_to_cart') }}</span>
                </button>
              </div>
            }
          </div>
        }
      </section>

      <!-- Recently Viewed -->
      @if (recentProducts().length > 0) {
        <section class="bm-section bm-last-section">
          <div class="bm-section-head">
            <h2 class="bm-section-title">{{ t('sec_recently_viewed') }}</h2>
          </div>
          <div class="bm-recent-scroll hide-scroll">
            @for (item of recentProducts(); track item.id) {
              <a [routerLink]="['/products', item.id]" class="bm-recent-card">
                <img [src]="item.primaryImageUrl || vehiclePlaceholder" [alt]="item.name" class="bm-recent-img" loading="lazy" decoding="async" />
                <span class="bm-recent-title">{{ item.name }}</span>
                <span class="bm-recent-price">₹{{ item.price }}</span>
              </a>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .bm-home-view {
      padding: 12px 14px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .bm-home-search-wrap {
      width: 100%;
    }

    .bm-home-radius-wrap {
      width: 100%;
      margin-top: -6px;
    }

    .bm-empty-zone-card {
      padding: 16px 14px;
      text-align: center;
      background-color: var(--bm-color-surface);
      border: 1px dashed var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .bm-empty-zone-msg {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      margin: 0;
    }

    .bm-switch-nolimit-btn {
      padding: 5px 14px;
      font-size: 11.5px;
      font-weight: 600;
      color: #fff;
      background-color: var(--bm-color-primary);
      border: none;
      border-radius: var(--bm-radius-full);
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-dark, #1d4ed8);
      }
    }

    .bm-search-input-fake {
      display: flex;
      align-items: center;
      gap: 10px;
      height: 44px;
      padding: 0 14px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-full);
      box-shadow: var(--bm-shadow-xs);
      color: var(--bm-color-text-muted);
      transition: border-color 0.15s ease;

      &:active {
        border-color: var(--bm-color-primary);
      }
    }

    .bm-search-icon {
      color: var(--bm-color-text-secondary);
    }

    .bm-search-placeholder {
      font-size: 14px;
      color: var(--bm-color-text-muted);
    }

    .bm-section {
      margin-bottom: 28px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-section-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .bm-head-title-group {
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
      min-width: 0;
    }

    .bm-section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: -0.3px;
      line-height: 1.25;
    }

    .bm-section-subtitle {
      font-size: 12px;
      line-height: 1.35;
      color: var(--bm-color-text-secondary);
    }

    .bm-section-link {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-primary);
      white-space: nowrap;
      flex-shrink: 0;
      padding-top: 2px;
      text-decoration: none;

      lucide-icon {
        flex-shrink: 0;
      }
    }

    // Horizontal Carousel for Pools
    .bm-carousel {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      margin: 0 -14px;
      padding: 0 14px 6px;
      -webkit-overflow-scrolling: touch;
    }

    .bm-pool-card {
      flex: 0 0 295px;
      scroll-snap-align: start;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-pool-img-wrap {
      position: relative;
      height: 140px;
      background-color: var(--bm-color-surface-subtle);
    }

    .bm-pool-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-pool-badge-overlay {
      position: absolute;
      top: 8px;
      left: 8px;
    }

    .bm-pool-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }

    .bm-pool-store-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-pool-store-name {
      font-weight: 600;
      color: var(--bm-color-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-pool-distance {
      color: var(--bm-color-primary);
      font-weight: 600;
    }

    .bm-pool-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .bm-pool-cta-btn {
      margin-top: auto;
      height: 36px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }
    }

    // Categories Horizontal Scroll
    .bm-cat-scroll {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      margin: 0 -14px;
      padding: 0 14px 6px;
      -webkit-overflow-scrolling: touch;
    }

    .bm-cat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      flex: 0 0 74px;
      width: 74px;
      text-align: center;
      text-decoration: none;
    }

    .bm-cat-bubble {
      width: 54px;
      height: 54px;
      border-radius: var(--bm-radius-full);
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-cat-emoji {
      font-size: 24px;
    }

    .bm-cat-name {
      font-size: 11px;
      color: var(--bm-color-text-secondary);
      line-height: 1.25;
      font-weight: 500;
      word-break: break-word;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 74px;
    }

    // Stores List
    .bm-grid-stores {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-store-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      box-shadow: var(--bm-shadow-xs);
      transition: border-color 0.15s ease;

      &:active {
        border-color: var(--bm-color-primary-border);
      }
    }

    .bm-store-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--bm-radius-md);
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }

    .bm-store-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-store-fallback-icon {
      color: var(--bm-color-primary);
    }

    .bm-store-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-store-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .bm-store-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-store-dist {
      font-size: 11px;
      font-weight: 600;
      color: var(--bm-color-primary);
      white-space: nowrap;
    }

    .bm-store-cat {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-store-desc {
      font-size: 11px;
      color: var(--bm-color-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-store-chevron {
      color: var(--bm-color-text-muted);
      flex-shrink: 0;
    }

    // Products 2-column Grid
    .bm-product-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .bm-product-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-product-media-link {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .bm-product-img-box {
      height: 130px;
      background-color: var(--bm-color-surface-subtle);
      overflow: hidden;
    }

    .bm-product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-product-meta {
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
    }

    .bm-product-store {
      font-size: 10px;
      color: var(--bm-color-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-product-title {
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

    .bm-price-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-top: 4px;
    }

    .bm-product-price {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-product-orig {
      font-size: 11px;
      color: var(--bm-color-text-muted);
      text-decoration: line-through;
    }

    .bm-product-unit {
      font-size: 10px;
      color: var(--bm-color-text-muted);
    }

    .bm-add-cart-btn {
      height: 34px;
      margin: 0 8px 8px;
      border: 1px solid var(--bm-color-primary);
      background-color: var(--bm-color-primary-soft);
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

    // Recently viewed scroll
    .bm-recent-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .bm-recent-card {
      flex: 0 0 100px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bm-recent-img {
      width: 100%;
      height: 70px;
      object-fit: cover;
      border-radius: var(--bm-radius-sm);
    }

    .bm-recent-title {
      font-size: 11px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-recent-price {
      font-size: 11px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    // Skeletons
    .bm-pool-card.is-skeleton {
      pointer-events: none;

      .bm-pool-img-wrap {
        height: 140px;
      }

      .bm-pool-tiers-preview {
        display: flex;
        gap: 6px;
      }

      .bm-tier-preview-pill.is-skeleton {
        height: 36px;
        flex: 1;
        border-radius: var(--bm-radius-sm);
      }
    }

    .bm-store-card.is-skeleton {
      pointer-events: none;

      .bm-store-avatar {
        width: 56px;
        height: 56px;
      }
    }

    .bm-product-card.is-skeleton {
      pointer-events: none;
    }

    .bm-empty-banner {
      background-color: var(--bm-color-surface);
      border: 1px dashed var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 16px;
      text-align: center;
      font-size: 13px;
      color: var(--bm-color-text-secondary);
    }

    .bm-inline-link {
      display: inline-block;
      margin-top: 4px;
      color: var(--bm-color-primary);
      font-weight: 600;
    }
  `],
})
export class HomePageComponent implements OnInit {
  private readonly poolService = inject(PoolService);
  private readonly storeService = inject(StoreService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly locationService = inject(LocationService);
  private readonly recentService = inject(RecentlyViewedService);
  private readonly i18n = inject(TranslationService);

  readonly SparklesIcon = Sparkles;
  readonly StoreIcon = Store;
  readonly CarIcon = Car;
  readonly SearchIcon = Search;
  readonly ChevronRightIcon = ChevronRight;
  readonly ArrowRightIcon = ArrowRight;
  readonly PlusIcon = Plus;
  readonly vehiclePlaceholder = VEHICLE_PLACEHOLDER_SVG;

  readonly categories = HOME_CATEGORIES;
  readonly radius = this.locationService.radiusKm;
  readonly locationLabel = this.locationService.formattedLocationLabel;
  readonly isMalayalam = this.i18n.isMalayalam;
  readonly recentProducts = this.recentService.recentProducts;

  readonly pools = signal<PoolRecord[]>([]);
  readonly stores = signal<StoreRecord[]>([]);
  readonly products = signal<ProductRecord[]>([]);

  readonly isLoadingPools = signal<boolean>(true);
  readonly isLoadingStores = signal<boolean>(true);
  readonly isLoadingProducts = signal<boolean>(true);

  ngOnInit(): void {
    this.loadHomeData();
  }

  loadHomeData(): void {
    this.isLoadingPools.set(true);
    this.poolService.getPools({ limit: 6 }).subscribe({
      next: (res) => {
        this.pools.set(res.pools);
        this.isLoadingPools.set(false);
      },
      error: () => this.isLoadingPools.set(false),
    });

    this.isLoadingStores.set(true);
    this.storeService.getNearbyStores({ limit: 6 }).subscribe({
      next: (res) => {
        this.stores.set(res.stores);
        this.isLoadingStores.set(false);
      },
      error: () => this.isLoadingStores.set(false),
    });

    this.isLoadingProducts.set(true);
    this.productService.getProducts({ limit: 8 }).subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.isLoadingProducts.set(false);
      },
      error: () => this.isLoadingProducts.set(false),
    });
  }

  setNoLimit(): void {
    this.locationService.setRadius(10000);
    this.loadHomeData();
  }

  onRadiusChange(newRadius: DiscoveryRadius): void {
    this.loadHomeData();
  }

  addToCart(productId: string): void {
    const prod = this.products().find((p) => p.id === productId);
    this.cartService.addItem(productId, 1, prod || undefined).subscribe();
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
