import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  ArrowLeft,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Image,
  MapPin,
  Navigation,
  Plus,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { KERALA_CITY_PRESETS } from '../../../../core/models/location.model';
import { PoolRecord } from '../../../../core/models/pool.model';
import { ProductRecord } from '../../../../core/models/product.model';
import { StoreRecord } from '../../../../core/models/store.model';
import { CartService } from '../../../../core/services/cart.service';
import { GoogleMapsLoaderService } from '../../../../core/services/google-maps-loader.service';
import { LocationService } from '../../../../core/services/location.service';
import { PoolService } from '../../../../core/services/pool.service';
import { ProductService } from '../../../../core/services/product.service';
import { RecentlyViewedService } from '../../../../core/services/recently-viewed.service';
import { VEHICLE_PLACEHOLDER_SVG } from '../../../../core/utils/image.utils';
import { StoreService } from '../../../../core/services/store.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-store-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-store-detail-view">
      <!-- Store Photographs Carousel at Top -->
      <div class="bm-carousel-wrapper">
        <a routerLink="/stores" class="bm-back-circle" aria-label="Back to Stores">
          <lucide-icon [img]="ArrowLeftIcon" [size]="18"></lucide-icon>
        </a>

        @if (storeImages().length > 0) {
          <div class="bm-carousel-viewport">
            <img
              [src]="storeImages()[currentSlideIndex()]"
              [alt]="store()?.storeName"
              class="bm-carousel-img"
              loading="lazy"
              decoding="async"
            />

            <!-- Left / Right Carousel Controls if multiple images -->
            @if (storeImages().length > 1) {
              <button
                type="button"
                class="bm-carousel-btn is-prev"
                (click)="prevSlide($event)"
                aria-label="Previous photo"
              >
                <lucide-icon [img]="ChevronLeftIcon" [size]="18"></lucide-icon>
              </button>

              <button
                type="button"
                class="bm-carousel-btn is-next"
                (click)="nextSlide($event)"
                aria-label="Next photo"
              >
                <lucide-icon [img]="ChevronRightIcon" [size]="18"></lucide-icon>
              </button>

              <!-- Counter Tag -->
              <div class="bm-slide-counter">
                {{ currentSlideIndex() + 1 }} / {{ storeImages().length }}
              </div>

              <!-- Indicators Dots -->
              <div class="bm-carousel-dots">
                @for (img of storeImages(); track $index) {
                  <button
                    type="button"
                    class="bm-dot"
                    [class.is-active]="$index === currentSlideIndex()"
                    (click)="goToSlide($index, $event)"
                    [attr.aria-label]="'Go to photo ' + ($index + 1)"
                  ></button>
                }
              </div>
            }
          </div>
        } @else {
          <div class="bm-carousel-placeholder">
            <lucide-icon [img]="StoreIcon" [size]="40" class="text-muted"></lucide-icon>
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
            {{ store()?.addressLine1 ? store()?.addressLine1 + ', ' : '' }}{{ store()?.city || 'Kerala' }}{{ store()?.district ? ', ' + store()?.district : '' }}{{ store()?.postalCode ? ' • ' + store()?.postalCode : '' }}
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
            <h2 class="bm-sec-title">Showroom Group-Buying Campaigns</h2>
          </div>

          <div class="bm-pools-slider hide-scroll">
            @for (pool of pools(); track pool.id) {
              <a [routerLink]="['/pools', pool.id]" class="bm-pool-mini-card">
                @if (pool.primaryImageUrl) {
                  <div class="bm-pool-mini-media">
                    <img [src]="pool.primaryImageUrl" [alt]="pool.title" class="bm-pool-mini-img" loading="lazy" decoding="async" />
                  </div>
                }
                <div class="bm-pool-mini-content">
                  <div class="bm-pool-mini-head">
                    <span class="bm-badge-discount">Up to {{ pool.maxDiscountPercentage || 15 }}% OFF</span>
                  </div>
                  <h3 class="bm-pool-mini-title">{{ pool.title }}</h3>
                  <span class="bm-pool-mini-cta">Join Vehicle Deal →</span>
                </div>
              </a>
            }
          </div>
        </section>
      }

      <!-- 3 Tabs: Vehicles, Location & Route, Showroom Photos -->
      <section class="bm-store-tabs-section">
        <div class="bm-segment-tabs">
          <button
            type="button"
            class="bm-segment-tab"
            [class.is-active]="activeStoreTab() === 'products'"
            (click)="setActiveStoreTab('products')"
          >
            <lucide-icon [img]="CarIcon" [size]="15"></lucide-icon>
            <span>Vehicles</span>
          </button>

          <button
            type="button"
            class="bm-segment-tab"
            [class.is-active]="activeStoreTab() === 'location'"
            (click)="setActiveStoreTab('location')"
          >
            <lucide-icon [img]="NavigationIcon" [size]="15"></lucide-icon>
            <span>Location & Route</span>
          </button>

          <button
            type="button"
            class="bm-segment-tab"
            [class.is-active]="activeStoreTab() === 'photos'"
            (click)="setActiveStoreTab('photos')"
          >
            <lucide-icon [img]="ImageIcon" [size]="15"></lucide-icon>
            <span>Showroom Photos</span>
          </button>
        </div>

        <!-- TAB 1: Vehicles Available at this Showroom -->
        @if (activeStoreTab() === 'products') {
          <div class="bm-card bm-store-products-card">
            <div class="bm-tab-card-header">
              <h2 class="bm-sec-title">Vehicles Available at this Showroom</h2>
              <span class="bm-tab-card-subtitle" *ngIf="products().length > 0">
                {{ products().length }} model{{ products().length > 1 ? 's' : '' }} ready for booking
              </span>
            </div>

            @if (isLoadingProducts()) {
              <div class="bm-products-grid">
                @for (i of [1, 2, 3, 4]; track i) {
                  <div class="bm-prod-card is-skeleton">
                    <div class="bm-prod-img-box bm-skeleton"></div>
                    <div class="bm-prod-info">
                      <div class="bm-skeleton bm-skeleton-title" style="width: 75%; height: 14px; margin-bottom: 4px;"></div>
                      <div class="bm-skeleton bm-skeleton-text" style="width: 45%; height: 15px;"></div>
                    </div>
                    <div style="padding: 0 4px 4px;">
                      <div class="bm-skeleton" style="height: 28px; border-radius: var(--bm-radius-sm);"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (products().length > 0) {
              <div class="bm-products-grid">
                @for (prod of products(); track prod.id) {
                  <div class="bm-prod-card">
                    <a [routerLink]="['/products', prod.id]" class="bm-prod-link">
                      <div class="bm-prod-img-box">
                        <img [src]="prod.primaryImageUrl || vehiclePlaceholder" [alt]="prod.name" class="bm-prod-img" loading="lazy" decoding="async" />
                      </div>
                      <div class="bm-prod-info">
                        <h4 class="bm-prod-title">{{ prod.name }}</h4>
                        <div class="bm-price-box">
                          <span class="bm-price">₹{{ prod.price | number }}</span>
                          <span class="bm-unit">/ {{ prod.unit || 'vehicle' }}</span>
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
                <p>No vehicles currently listed for this showroom.</p>
              </div>
            }
          </div>
        }

        <!-- TAB 2: Location & Non-changeable Driving/Bike Route -->
        @if (activeStoreTab() === 'location') {
          <div class="bm-card bm-location-card">
            <!-- Non-changeable Route Mode Indicator (Car / Bike Fixed) -->
            <div class="bm-direction-summary">
              <div class="bm-mode-pill">
                <lucide-icon [img]="CarIcon" [size]="14"></lucide-icon>
                <span>Drive / Bike Route</span>
                <span class="bm-fixed-tag">Direct</span>
              </div>

              @if (routeDistance()) {
                <div class="bm-route-stats">
                  <span class="bm-stat-dist">{{ routeDistance() }}</span>
                  <span class="bm-stat-sep">•</span>
                  <span class="bm-stat-time">{{ routeDuration() }}</span>
                </div>
              }
            </div>

            <!-- Embedded Google Map Canvas with Route -->
            <div class="bm-map-container">
              @if (isMapLoading()) {
                <div class="bm-map-loading">
                  <div class="bm-spinner"></div>
                  <span>Loading route from your location...</span>
                </div>
              }
              <div #storeMapContainer class="bm-google-map-canvas"></div>
            </div>

            <!-- Route Endpoints (From selected location -> Store) -->
            <div class="bm-route-endpoints">
              <div class="bm-endpoint-row">
                <div class="bm-endpoint-dot is-origin"></div>
                <div class="bm-endpoint-meta">
                  <span class="bm-endpoint-label">From Selected Location</span>
                  <span class="bm-endpoint-val">{{ userLocationLabel() }}</span>
                </div>
              </div>

              <div class="bm-endpoint-divider"></div>

              <div class="bm-endpoint-row">
                <div class="bm-endpoint-dot is-destination"></div>
                <div class="bm-endpoint-meta">
                  <span class="bm-endpoint-label">Destination Showroom</span>
                  <span class="bm-endpoint-val">
                    {{ store()?.storeName }} ({{ store()?.addressLine1 ? store()?.addressLine1 + ', ' : '' }}{{ store()?.city }})
                  </span>
                </div>
              </div>
            </div>

            <!-- Open in Native Google Maps Navigation Button -->
            <a
              [href]="googleMapsDirectionsUrl()"
              target="_blank"
              rel="noopener noreferrer"
              class="bm-open-maps-btn"
            >
              <lucide-icon [img]="NavigationIcon" [size]="15"></lucide-icon>
              <span>Navigate in Google Maps</span>
              <lucide-icon [img]="ExternalLinkIcon" [size]="13" class="bm-ext-icon"></lucide-icon>
            </a>
          </div>
        }

        <!-- TAB 3: Store Photos in Grid -->
        @if (activeStoreTab() === 'photos') {
          <div class="bm-card bm-photos-card">
            @if (storeImages().length > 0) {
              <div class="bm-store-photos-grid">
                @for (img of storeImages(); track $index) {
                  <div class="bm-photo-grid-item" (click)="openPhotoPreview(img)">
                    <img
                      [src]="img"
                      [alt]="(store()?.storeName || 'Store') + ' photo ' + ($index + 1)"
                      class="bm-grid-img"
                      loading="lazy"
                      decoding="async"
                    />
                    @if (getPhotoCategory($index)) {
                      <span class="bm-photo-category-tag">{{ getPhotoCategory($index) }}</span>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="bm-empty-photos">
                <lucide-icon [img]="ImageIcon" [size]="36" class="text-muted"></lucide-icon>
                <p>No photos available for this store yet.</p>
              </div>
            }
          </div>
        }
      </section>

      <!-- Fullscreen Photo Preview Modal -->
      @if (previewPhotoUrl()) {
        <div class="bm-photo-modal-backdrop" (click)="closePhotoPreview()">
          <button
            type="button"
            class="bm-modal-close-btn"
            (click)="closePhotoPreview()"
            aria-label="Close photo"
          >
            <lucide-icon [img]="CloseIcon" [size]="20"></lucide-icon>
          </button>
          <img
            [src]="previewPhotoUrl()"
            alt="Store photo full view"
            class="bm-modal-img"
            decoding="async"
            (click)="$event.stopPropagation()"
          />
        </div>
      }

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
      padding-bottom: 90px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: var(--bm-max-mobile-width);
      margin: 0 auto;
      width: 100%;
    }

    /* Store Photo Carousel */
    .bm-carousel-wrapper {
      position: relative;
      height: 200px;
      background-color: #0f172a;
      width: 100%;
      overflow: hidden;
    }

    .bm-carousel-viewport {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .bm-carousel-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .bm-carousel-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bm-color-surface-subtle);
    }

    .bm-back-circle {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 36px;
      height: 36px;
      border-radius: var(--bm-radius-full);
      background-color: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bm-color-text-primary);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      z-index: 20;
      text-decoration: none;
    }

    .bm-carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      border-radius: var(--bm-radius-full);
      background-color: rgba(255, 255, 255, 0.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bm-color-text-primary);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      z-index: 10;
      cursor: pointer;

      &.is-prev {
        left: 10px;
      }
      &.is-next {
        right: 10px;
      }
    }

    .bm-slide-counter {
      position: absolute;
      top: 14px;
      right: 14px;
      background-color: rgba(0, 0, 0, 0.65);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: var(--bm-radius-full);
      z-index: 10;
    }

    .bm-carousel-dots {
      position: absolute;
      bottom: 10px;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      z-index: 10;
    }

    .bm-dot {
      width: 7px;
      height: 7px;
      border-radius: var(--bm-radius-full);
      background-color: rgba(255, 255, 255, 0.5);
      border: none;
      padding: 0;
      cursor: pointer;
      transition: all 0.2s ease;

      &.is-active {
        width: 18px;
        background-color: #fff;
      }
    }

    /* Store Profile Header */
    .bm-store-profile-box {
      margin: -20px 14px 0;
      position: relative;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 16px;
      box-shadow: var(--bm-shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 5;
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

    /* Store Section Tabs */
    .bm-store-tabs-section {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-segment-tabs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      background-color: var(--bm-color-surface-subtle);
      padding: 4px;
      border-radius: var(--bm-radius-md);
      border: 1px solid var(--bm-color-border);
    }

    .bm-segment-tab {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 8px 6px;
      border: none;
      border-radius: var(--bm-radius-sm);
      background-color: transparent;
      color: var(--bm-color-text-secondary);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;

      &.is-active {
        background-color: var(--bm-color-surface);
        color: var(--bm-color-primary);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
    }

    .bm-tab-card-header {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 12px;
    }

    .bm-tab-card-subtitle {
      font-size: 11px;
      color: var(--bm-color-text-muted);
      font-weight: 500;
    }

    .bm-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 14px;
      box-shadow: var(--bm-shadow-xs);
    }

    /* Tab 1: Location & Directions */
    .bm-direction-summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .bm-mode-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      padding: 4px 10px;
      border-radius: var(--bm-radius-full);
      font-size: 12px;
      font-weight: 600;
    }

    .bm-fixed-tag {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      opacity: 0.75;
      font-weight: 700;
    }

    .bm-route-stats {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-stat-sep {
      color: var(--bm-color-text-muted);
    }

    .bm-stat-dist {
      color: var(--bm-color-primary);
    }

    .bm-map-container {
      position: relative;
      height: 220px;
      border-radius: var(--bm-radius-md);
      overflow: hidden;
      margin-bottom: 12px;
      border: 1px solid var(--bm-color-border);
      background-color: #f1f5f9;
    }

    .bm-google-map-canvas {
      width: 100%;
      height: 100%;
    }

    .bm-map-loading {
      position: absolute;
      inset: 0;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      z-index: 5;
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-spinner {
      width: 22px;
      height: 22px;
      border: 3px solid var(--bm-color-border);
      border-top-color: var(--bm-color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .bm-route-endpoints {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
      padding: 10px 12px;
      background-color: var(--bm-color-surface-subtle);
      border-radius: var(--bm-radius-md);
    }

    .bm-endpoint-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .bm-endpoint-dot {
      width: 10px;
      height: 10px;
      border-radius: var(--bm-radius-full);
      margin-top: 4px;
      flex-shrink: 0;

      &.is-origin {
        background-color: #3b82f6;
      }
      &.is-destination {
        background-color: var(--bm-color-primary);
      }
    }

    .bm-endpoint-divider {
      width: 2px;
      height: 10px;
      background-color: var(--bm-color-border);
      margin-left: 4px;
    }

    .bm-endpoint-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .bm-endpoint-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--bm-color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .bm-endpoint-val {
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-open-maps-btn {
      height: 40px;
      width: 100%;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      color: var(--bm-color-text-primary);
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      transition: background-color 0.15s ease;

      &:hover,
      &:active {
        background-color: var(--bm-color-border);
      }
    }

    .bm-ext-icon {
      color: var(--bm-color-text-muted);
    }

    /* Tab 2: Store Photos Grid */
    .bm-photos-card {
      padding: 12px;
    }

    .bm-store-photos-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;

      @media (min-width: 440px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .bm-photo-grid-item {
      position: relative;
      aspect-ratio: 4 / 3;
      border-radius: var(--bm-radius-md);
      overflow: hidden;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      cursor: pointer;

      &:active {
        opacity: 0.85;
      }
    }

    .bm-grid-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.04);
      }
    }

    .bm-photo-category-tag {
      position: absolute;
      bottom: 6px;
      left: 6px;
      background-color: rgba(15, 23, 42, 0.75);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: var(--bm-radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .bm-empty-photos {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 32px 16px;
      text-align: center;
      color: var(--bm-color-text-secondary);
      font-size: 13px;
    }

    /* Photo Lightbox Preview Modal */
    .bm-photo-modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 1000;
      animation: fadeIn 0.15s ease;
    }

    .bm-modal-close-btn {
      position: absolute;
      top: calc(16px + var(--bm-safe-top));
      right: 16px;
      width: 40px;
      height: 40px;
      border-radius: var(--bm-radius-full);
      background-color: rgba(255, 255, 255, 0.2);
      color: #fff;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &:active {
        background-color: rgba(255, 255, 255, 0.35);
      }
    }

    .bm-modal-img {
      max-width: 100%;
      max-height: 85vh;
      border-radius: var(--bm-radius-md);
      object-fit: contain;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Campaigns & Products Section */
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
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      box-shadow: var(--bm-shadow-xs);
      transition: transform 0.15s ease, box-shadow 0.15s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--bm-shadow-sm);
      }
    }

    .bm-pool-mini-media {
      width: 100%;
      height: 90px;
      overflow: hidden;
      background-color: #0f172a;
    }

    .bm-pool-mini-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .bm-pool-mini-content {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
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
      text-decoration: none;
      color: inherit;
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
      color: var(--bm-color-text-primary);
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
      color: var(--bm-color-text-primary);
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
      border: none;
      border-radius: var(--bm-radius-sm);
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
    }

    .bm-prod-card.is-skeleton {
      pointer-events: none;
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

    /* Sticky store cart summary bar */
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
      text-decoration: none;
    }
  `],
})
export class StoreDetailPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly storeService = inject(StoreService);
  private readonly productService = inject(ProductService);
  private readonly poolService = inject(PoolService);
  private readonly cartService = inject(CartService);
  private readonly recentService = inject(RecentlyViewedService);
  private readonly locationService = inject(LocationService);
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);
  private readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);

  @ViewChild('storeMapContainer') storeMapContainer?: ElementRef<HTMLDivElement>;

  readonly ArrowLeftIcon = ArrowLeft;
  readonly StoreIcon = Store;
  readonly MapPinIcon = MapPin;
  readonly SparklesIcon = Sparkles;
  readonly PlusIcon = Plus;
  readonly ChevronRightIcon = ChevronRight;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly NavigationIcon = Navigation;
  readonly ExternalLinkIcon = ExternalLink;
  readonly CarIcon = Car;
  readonly ImageIcon = Image;
  readonly CloseIcon = X;
  readonly vehiclePlaceholder = VEHICLE_PLACEHOLDER_SVG;

  readonly store = signal<StoreRecord | null>(null);
  readonly products = signal<ProductRecord[]>([]);
  readonly pools = signal<PoolRecord[]>([]);
  readonly isLoadingProducts = signal<boolean>(true);
  readonly currentStoreCart = signal<any>(null);

  // Active section tab: 'products', 'location' or 'photos'
  readonly activeStoreTab = signal<'products' | 'location' | 'photos'>('products');
  readonly previewPhotoUrl = signal<string | null>(null);

  // Carousel state
  readonly currentSlideIndex = signal<number>(0);
  readonly storeImages = computed<string[]>(() => {
    const s = this.store();
    if (!s) return [];
    const images: string[] = [];
    if (s.imageUrls && s.imageUrls.length > 0) {
      s.imageUrls.forEach((img) => {
        if (img && !images.includes(img)) images.push(img);
      });
    }
    if (s.photos && s.photos.length > 0) {
      s.photos.forEach((p) => {
        if (p.url && !images.includes(p.url)) images.push(p.url);
      });
    }
    if (s.primaryImageUrl && !images.includes(s.primaryImageUrl)) {
      images.unshift(s.primaryImageUrl);
    }
    return images;
  });

  // Directions & Map state
  readonly isMapLoading = signal<boolean>(false);
  readonly routeDistance = signal<string>('');
  readonly routeDuration = signal<string>('');
  readonly userLocationLabel = this.locationService.formattedLocationLabel;

  readonly googleMapsDirectionsUrl = computed(() => {
    const loc = this.locationService.currentLocation();
    const userLat = loc.latitude || 9.9312;
    const userLng = loc.longitude || 76.2673;
    const s = this.store();
    const destLat = s?.latitude !== undefined ? s.latitude : this.fallbackCityLat(s?.city);
    const destLng = s?.longitude !== undefined ? s.longitude : this.fallbackCityLng(s?.city);
    return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`;
  });

  private mapInstance: any = null;
  private directionsRenderer: any = null;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const storeId = params['storeId'];
      if (storeId) {
        this.loadStoreDetails(storeId);
      }
    });

    this.route.queryParams.subscribe((queryParams) => {
      const tab = queryParams['tab'];
      if (tab === 'products' || tab === 'location' || tab === 'photos') {
        this.setActiveStoreTab(tab);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.activeStoreTab() === 'location') {
      setTimeout(() => this.initDirectionsMap(), 250);
    }
  }

  ngOnDestroy(): void {
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer = null;
    }
    this.mapInstance = null;
  }

  setActiveStoreTab(tab: 'products' | 'location' | 'photos'): void {
    this.activeStoreTab.set(tab);
    if (tab === 'location') {
      setTimeout(() => this.initDirectionsMap(), 150);
    }
  }

  openPhotoPreview(url: string): void {
    this.previewPhotoUrl.set(url);
  }

  closePhotoPreview(): void {
    this.previewPhotoUrl.set(null);
  }

  getPhotoCategory(index: number): string | null {
    const s = this.store();
    return s?.photos?.[index]?.category || null;
  }

  prevSlide(event?: Event): void {
    if (event) event.stopPropagation();
    const total = this.storeImages().length;
    if (total <= 1) return;
    this.currentSlideIndex.update((curr) => (curr - 1 + total) % total);
  }

  nextSlide(event?: Event): void {
    if (event) event.stopPropagation();
    const total = this.storeImages().length;
    if (total <= 1) return;
    this.currentSlideIndex.update((curr) => (curr + 1) % total);
  }

  goToSlide(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.currentSlideIndex.set(index);
  }

  loadStoreDetails(storeId: string): void {
    this.storeService.getStoreById(storeId).subscribe({
      next: (s) => {
        if (s) {
          this.store.set(s);
          this.recentService.trackStore(s);
        } else {
          this.store.set({
            id: storeId,
            storeName: 'Kerala Partner Merchant',
            businessType: 'General Retail',
            city: 'Kochi',
            state: 'Kerala',
            postalCode: '682001',
            status: 'APPROVED',
            latitude: 9.9312,
            longitude: 76.2673,
          });
        }
        if (this.activeStoreTab() === 'location') {
          setTimeout(() => this.initDirectionsMap(), 200);
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

    const existing = this.cartService.getStoreCart(storeId);
    this.currentStoreCart.set(existing || null);
  }

  private async initDirectionsMap(): Promise<void> {
    if (!this.storeMapContainer || typeof window === 'undefined') return;

    this.isMapLoading.set(true);
    const loaded = await this.googleMapsLoader.load();
    this.isMapLoading.set(false);

    if (!loaded) return;

    const google = (window as any).google;
    if (!google?.maps) return;

    const loc = this.locationService.currentLocation();
    const origin = {
      lat: loc.latitude || 9.9312,
      lng: loc.longitude || 76.2673,
    };

    const s = this.store();
    const destLat = s?.latitude !== undefined ? s.latitude : this.fallbackCityLat(s?.city);
    const destLng = s?.longitude !== undefined ? s.longitude : this.fallbackCityLng(s?.city);
    const destination = { lat: destLat, lng: destLng };

    this.mapInstance = new google.maps.Map(this.storeMapContainer.nativeElement, {
      center: destination,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.mapInstance,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#176B50',
        strokeWeight: 5,
        strokeOpacity: 0.85,
      },
    });

    const directionsService = new google.maps.DirectionsService();

    // Fixed travel mode: DRIVING (for bike / car navigation) - cannot be changed by user
    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        if (status === 'OK' && result) {
          this.directionsRenderer.setDirections(result);
          const leg = result.routes?.[0]?.legs?.[0];
          if (leg) {
            this.routeDistance.set(leg.distance?.text || '');
            this.routeDuration.set(leg.duration?.text || '');
          }
        } else {
          this.fallbackMarkers(google, origin, destination);
        }
      },
    );
  }

  private fallbackMarkers(google: any, origin: any, destination: any): void {
    new google.maps.Marker({
      position: origin,
      map: this.mapInstance,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    new google.maps.Marker({
      position: destination,
      map: this.mapInstance,
      title: this.store()?.storeName || 'Store Location',
    });

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(destination);
    this.mapInstance.fitBounds(bounds, 50);
  }

  private fallbackCityLat(city?: string): number {
    if (!city) return 9.9312;
    const match = KERALA_CITY_PRESETS.find(
      (p) =>
        p.name.toLowerCase().includes(city.toLowerCase()) ||
        city.toLowerCase().includes(p.name.toLowerCase()),
    );
    return match ? match.lat : 9.9312;
  }

  private fallbackCityLng(city?: string): number {
    if (!city) return 76.2673;
    const match = KERALA_CITY_PRESETS.find(
      (p) =>
        p.name.toLowerCase().includes(city.toLowerCase()) ||
        city.toLowerCase().includes(p.name.toLowerCase()),
    );
    return match ? match.lng : 76.2673;
  }

  addToCart(productId: string): void {
    const prod = this.products().find((p) => p.id === productId);
    this.cartService.addItem(productId, 1, prod || undefined).subscribe({
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
