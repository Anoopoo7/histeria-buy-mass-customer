import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Car,
  Sparkles,
  Store,
  X,
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
import { CountdownTimerComponent } from '../../../../shared/ui/countdown-timer/countdown-timer.component';
import { PoolProgressComponent } from '../../../../shared/ui/pool-progress/pool-progress.component';
import { VEHICLE_PLACEHOLDER_SVG } from '../../../../core/utils/image.utils';

@Component({
  selector: 'bm-product-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    CountdownTimerComponent,
    PoolProgressComponent,
  ],
  template: `
    <div class="bm-product-detail-view">
      <!-- Top Action Navigation Bar -->
      <div class="bm-top-bar">
        <a routerLink="/products" class="bm-icon-circle-btn" aria-label="Back to Products">
          <lucide-icon [img]="ArrowLeftIcon" [size]="18"></lucide-icon>
        </a>

        <div class="bm-top-right-actions">
          <a routerLink="/cart" class="bm-icon-circle-btn bm-cart-circle-btn" aria-label="View Cart">
            <lucide-icon [img]="ShoppingCartIcon" [size]="18"></lucide-icon>
            @if (cartCount() > 0) {
              <span class="bm-top-badge">{{ cartCount() > 99 ? '99+' : cartCount() }}</span>
            }
          </a>

          <button
            type="button"
            class="bm-icon-circle-btn"
            [class.is-wishlisted]="isWishlisted()"
            (click)="toggleWishlist()"
            aria-label="Save to Wishlist"
          >
            <lucide-icon
              [img]="HeartIcon"
              [size]="18"
              [class.is-filled]="isWishlisted()"
            ></lucide-icon>
          </button>

          <button
            type="button"
            class="bm-icon-circle-btn"
            (click)="shareProduct()"
            aria-label="Share product"
          >
            <lucide-icon [img]="Share2Icon" [size]="18"></lucide-icon>
          </button>
        </div>
      </div>

      @if (product(); as prod) {
        <!-- Product Image Gallery Showcase -->
        <div class="bm-gallery-box">
          <div class="bm-main-img-wrapper" (click)="openLightbox(activeImage())">
            <img
              [src]="activeImage() || prod.primaryImageUrl || vehiclePlaceholder"
              [alt]="prod.name"
              class="bm-main-gallery-img"
              fetchpriority="high"
              decoding="async"
            />

            <!-- Discount percentage chip overlay -->
            @if (discountPercentage() > 0) {
              <div class="bm-save-overlay-tag">
                {{ discountPercentage() }}% OFF
              </div>
            }

            <span class="bm-zoom-hint">Tap to zoom</span>
          </div>

          <!-- Thumbnail Strip if multiple images -->
          @if (galleryImages().length > 1) {
            <div class="bm-thumb-strip hide-scroll">
              @for (img of galleryImages(); track img) {
                <button
                  type="button"
                  class="bm-thumb-btn"
                  [class.is-selected]="activeImage() === img"
                  (click)="activeImage.set(img)"
                >
                  <img [src]="img" [alt]="prod.name" class="bm-thumb-img" loading="lazy" decoding="async" />
                </button>
              }
            </div>
          }
        </div>

        <!-- Fullscreen Image Lightbox Modal -->
        @if (lightboxUrl()) {
          <div class="bm-lightbox-backdrop" (click)="closeLightbox()">
            <button
              type="button"
              class="bm-lightbox-close-btn"
              (click)="closeLightbox()"
              aria-label="Close"
            >
              <lucide-icon [img]="CloseIcon" [size]="20"></lucide-icon>
            </button>
            <img
              [src]="lightboxUrl()"
              [alt]="prod.name"
              class="bm-lightbox-img"
              decoding="async"
              (click)="$event.stopPropagation()"
            />
          </div>
        }

        <!-- Product Core Info Card -->
        <div class="bm-info-card">
          <!-- Store Attribution Pill -->
          <a [routerLink]="['/stores', prod.storeId]" class="bm-store-attribution">
            @if (prod.store?.primaryImageUrl) {
              <img [src]="prod.store?.primaryImageUrl" [alt]="prod.store?.storeName || prod.storeName" class="bm-store-avatar" loading="lazy" decoding="async" />
            } @else {
              <div class="bm-store-icon-bubble">
                <lucide-icon [img]="StoreIcon" [size]="14" class="text-primary"></lucide-icon>
              </div>
            }
            <div class="bm-store-meta-text">
              <span class="bm-store-name">{{ prod.store?.storeName || prod.storeName || 'Partner Store' }}</span>
              @if (prod.store?.city || prod.storeCity) {
                <span class="bm-store-location-tag">
                  {{ prod.store?.city || prod.storeCity }}{{ (prod.store?.district || prod.storeDistrict) ? ', ' + (prod.store?.district || prod.storeDistrict) : '' }}
                </span>
              }
            </div>
            <lucide-icon [img]="ChevronRightIcon" [size]="14" class="bm-store-chevron text-muted"></lucide-icon>
          </a>

          <h1 class="bm-prod-title">{{ prod.name }}</h1>

          <!-- Price & Savings Row -->
          <div class="bm-price-row">
            <span class="bm-price-val">₹{{ prod.price | number }}</span>
            @if (prod.originalPrice && prod.originalPrice > prod.price) {
              <span class="bm-orig-val">₹{{ prod.originalPrice | number }}</span>
              <span class="bm-save-pill">
                Save ₹{{ prod.originalPrice - prod.price | number }}
              </span>
            }
            <span class="bm-unit-badge">Per {{ (prod.unit === 'g' || !prod.unit) ? 'Vehicle' : prod.unit }}</span>
          </div>

          <!-- Stock & Guarantee Status -->
          <div class="bm-guarantee-row">
            <div class="bm-status-pill is-in-stock">
              <lucide-icon [img]="CheckIcon" [size]="12"></lucide-icon>
              <span>Showroom Delivery & PDI</span>
            </div>
            <div class="bm-status-pill is-verified">
              <lucide-icon [img]="ShieldCheckIcon" [size]="12"></lucide-icon>
              <span>Authorized Dealership</span>
            </div>
          </div>

          <!-- Group-Buying Deal Notification Banner (if pool active) -->
          @if (relatedPool(); as pool) {
            <div class="bm-pool-deal-card">
              <div class="bm-pool-deal-header">
                <div class="bm-deal-badge-wrap">
                  <lucide-icon [img]="SparklesIcon" [size]="15"></lucide-icon>
                  <span class="bm-deal-badge-title">Active Vehicle Group Deal</span>
                </div>
                <bm-countdown-timer [endsAt]="pool.endsAt"></bm-countdown-timer>
              </div>

              <p class="bm-pool-deal-desc">
                Commit this vehicle to <strong>{{ pool.title }}</strong> to unlock up to
                <strong>{{ pool.maxDiscountPercentage }}% collective volume discount</strong>!
              </p>

              <!-- Live Pool Progress Component -->
              <bm-pool-progress
                [progress]="pool.progress"
                [currentAmount]="pool.currentTotalAmount || 0"
                [targetAmount]="pool.targetAmount || 10000"
                [participantCountInput]="pool.currentParticipantCount || 0"
                [maxDiscountInput]="pool.maxDiscountPercentage || 15"
                [tiers]="pool.tiers"
              ></bm-pool-progress>

              <a [routerLink]="['/pools', pool.id]" class="bm-join-pool-btn">
                <span>View Campaign & Join Group Deal</span>
                <lucide-icon [img]="ChevronRightIcon" [size]="14"></lucide-icon>
              </a>
            </div>
          }

          <!-- Quick Action Buttons in Info Card -->
          <div class="bm-card-action-row">
            <button
              type="button"
              class="bm-card-add-cart-btn"
              [disabled]="isAdding()"
              (click)="addToCart(prod.id)"
            >
              <lucide-icon [img]="ShoppingCartIcon" [size]="16"></lucide-icon>
              <span>{{ isAdding() ? 'Adding...' : 'Add to Cart' }}</span>
            </button>
          </div>

          <!-- Store Pickup Information Notice -->
          <div class="bm-pickup-notice-box">
            <div class="bm-notice-icon-bubble">
              <lucide-icon [img]="MapPinIcon" [size]="16"></lucide-icon>
            </div>
            <div class="bm-notice-meta">
              <span class="bm-notice-title">Showroom Delivery & Handover</span>
              <span class="bm-notice-sub">
                Handover OTP sent to WhatsApp upon deal completion. Pre-delivery inspection (PDI), registration support, and key handover directly from {{ prod.store?.storeName || prod.storeName || 'the showroom' }}@if (prod.store?.city || prod.storeCity) { ({{ prod.store?.city || prod.storeCity }})}.
              </span>
            </div>
          </div>

          <!-- Product Specifications & Details -->
          <div class="bm-specs-container">
            <h3 class="bm-section-title">Vehicle Details & Specifications</h3>
            <p class="bm-desc-text">
              {{ prod.description || 'Verified vehicle sourced directly through authorized dealership network. Inspected with manufacturer warranty.' }}
            </p>

            <div class="bm-specs-table">
              @if (prod.brand) {
                <div class="bm-spec-row">
                  <span class="bm-spec-label">Brand / Manufacturer</span>
                  <span class="bm-spec-val">{{ prod.brand }}</span>
                </div>
              }
              <div class="bm-spec-row">
                <span class="bm-spec-label">Vehicle Category</span>
                <span class="bm-spec-val">{{ prod.category }}</span>
              </div>
              <div class="bm-spec-row">
                <span class="bm-spec-label">Booking Unit</span>
                <span class="bm-spec-val">{{ (prod.unit === 'g' || !prod.unit) ? 'Vehicle / Unit' : prod.unit }}</span>
              </div>
              @if (prod.sku) {
                <div class="bm-spec-row">
                  <span class="bm-spec-label">Variant / Model SKU</span>
                  <span class="bm-spec-val">{{ prod.sku }}</span>
                </div>
              }
              <div class="bm-spec-row">
                <span class="bm-spec-label">Fulfilled by</span>
                <a [routerLink]="['/stores', prod.storeId]" class="bm-spec-store-link">
                  {{ prod.store?.storeName || prod.storeName || 'Authorized Dealership' }}
                  @if (prod.store?.city || prod.storeCity) {
                    <span>({{ prod.store?.city || prod.storeCity }})</span>
                  }
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- More from this Store Section -->
        @if (relatedProducts().length > 0) {
          <section class="bm-related-section">
            <div class="bm-sec-header">
              <h3 class="bm-sec-title">More Vehicles from {{ prod.store?.storeName || prod.storeName || 'this Showroom' }}</h3>
              <a [routerLink]="['/stores', prod.storeId]" class="bm-sec-link">
                View All
                <lucide-icon [img]="ChevronRightIcon" [size]="13"></lucide-icon>
              </a>
            </div>

            <div class="bm-related-slider hide-scroll">
              @for (rel of relatedProducts(); track rel.id) {
                <div class="bm-rel-card">
                  <a [routerLink]="['/products', rel.id]" class="bm-rel-link">
                    <div class="bm-rel-img-box">
                      <img [src]="rel.primaryImageUrl || vehiclePlaceholder" [alt]="rel.name" class="bm-rel-img" loading="lazy" decoding="async" />
                    </div>
                    <div class="bm-rel-info">
                      <h4 class="bm-rel-title">{{ rel.name }}</h4>
                      <div class="bm-rel-price">₹{{ rel.price | number }}</div>
                    </div>
                  </a>
                  <button
                    type="button"
                    class="bm-rel-add-btn"
                    (click)="addRelatedToCart(rel.id)"
                    aria-label="Add to cart"
                  >
                    <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                    <span>Book</span>
                  </button>
                </div>
              }
            </div>
          </section>
        }

        <!-- Sticky Bottom Add-to-Cart Purchase Bar -->
        <div class="bm-bottom-action-bar">
          <!-- Stepper Quantity Selector -->
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

          <!-- Add to Cart Button -->
          <button
            type="button"
            class="bm-add-cart-outline-btn"
            [disabled]="isAdding()"
            (click)="addToCart(prod.id)"
          >
            <lucide-icon [img]="ShoppingCartIcon" [size]="17"></lucide-icon>
            <span>{{ isAdding() ? 'Adding...' : 'Add to Cart' }}</span>
          </button>

          <!-- Book Now / Direct Booking Button -->
          <button
            type="button"
            class="bm-add-submit-btn"
            [disabled]="isAdding()"
            (click)="bookNow(prod.id)"
          >
            <lucide-icon [img]="CarIcon" [size]="17"></lucide-icon>
            <span>
              {{ isAdding() ? 'Booking...' : 'Book • ₹' + ((prod.price * quantity()) | number) }}
            </span>
          </button>
        </div>
      } @else if (isLoading()) {
        <div class="bm-pdp-skeleton-container">
          <!-- Gallery Box Skeleton -->
          <div class="bm-gallery-box is-skeleton">
            <div class="bm-main-img-wrapper bm-skeleton" style="height: 250px;"></div>
            <div class="bm-thumb-strip hide-scroll" style="margin-top: 8px; display: flex; gap: 8px;">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="bm-skeleton" style="width: 56px; height: 56px; border-radius: var(--bm-radius-md); flex-shrink: 0;"></div>
              }
            </div>
          </div>

          <!-- Product Core Info Card Skeleton -->
          <div class="bm-info-card is-skeleton">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div class="bm-skeleton bm-skeleton-circle" style="width: 24px; height: 24px;"></div>
              <div class="bm-skeleton bm-skeleton-text" style="width: 140px;"></div>
            </div>
            <div class="bm-skeleton bm-skeleton-title" style="width: 75%; height: 22px; margin-bottom: 8px;"></div>
            <div class="bm-skeleton bm-skeleton-text" style="width: 35%; margin-bottom: 16px;"></div>

            <!-- Price line skeleton -->
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
              <div class="bm-skeleton" style="width: 110px; height: 28px; border-radius: var(--bm-radius-sm);"></div>
              <div class="bm-skeleton" style="width: 60px; height: 20px; border-radius: var(--bm-radius-sm);"></div>
            </div>

            <!-- Trust badges skeleton -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding-top: 12px; border-top: 1px solid var(--bm-color-border-subtle);">
              <div class="bm-skeleton" style="height: 48px; border-radius: var(--bm-radius-md);"></div>
              <div class="bm-skeleton" style="height: 48px; border-radius: var(--bm-radius-md);"></div>
              <div class="bm-skeleton" style="height: 48px; border-radius: var(--bm-radius-md);"></div>
            </div>
          </div>

          <!-- Specs Card Skeleton -->
          <div class="bm-specs-card is-skeleton">
            <div class="bm-skeleton bm-skeleton-title" style="width: 120px; margin-bottom: 12px;"></div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="bm-skeleton" style="height: 52px; border-radius: var(--bm-radius-md);"></div>
              }
            </div>
          </div>

          <!-- Sticky Bottom Action Bar Skeleton -->
          <div class="bm-bottom-action-bar is-skeleton">
            <div class="bm-skeleton" style="width: 100px; height: 44px; border-radius: var(--bm-radius-md);"></div>
            <div class="bm-skeleton" style="flex: 1.2; height: 44px; border-radius: var(--bm-radius-md);"></div>
          </div>
        </div>
      } @else {
        <div class="bm-error-state">
          <p>Product could not be found.</p>
          <a routerLink="/products" class="bm-btn-primary">Browse All Products</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-product-detail-view {
      padding-bottom: 96px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: var(--bm-max-mobile-width);
      margin: 0 auto;
      width: 100%;
    }

    .bm-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px 4px;
    }

    .bm-top-right-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bm-icon-circle-btn {
      width: 38px;
      height: 38px;
      border-radius: var(--bm-radius-full);
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bm-color-text-primary);
      cursor: pointer;
      transition: all 0.15s ease;
      text-decoration: none;

      &:hover,
      &:active {
        background-color: var(--bm-color-surface-subtle);
      }

      &.is-wishlisted {
        color: #ef4444;
        border-color: #fca5a5;
        background-color: #fef2f2;
      }
    }

    .bm-cart-circle-btn {
      position: relative;
    }

    .bm-top-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      min-width: 17px;
      height: 17px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border: 2px solid var(--bm-color-surface);
      line-height: 1;
    }

    .is-filled {
      fill: #ef4444;
    }

    /* Product Gallery */
    .bm-gallery-box {
      background-color: var(--bm-color-surface);
      border-bottom: 1px solid var(--bm-color-border);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 14px 12px;
    }

    .bm-main-img-wrapper {
      position: relative;
      width: 100%;
      height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: zoom-in;
    }

    .bm-main-gallery-img {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
      border-radius: var(--bm-radius-md);
      transition: transform 0.2s ease;
    }

    .bm-save-overlay-tag {
      position: absolute;
      top: 6px;
      left: 6px;
      background-color: #ef4444;
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: var(--bm-radius-sm);
      letter-spacing: 0.3px;
    }

    .bm-zoom-hint {
      position: absolute;
      bottom: 4px;
      right: 6px;
      font-size: 10px;
      color: var(--bm-color-text-muted);
      background-color: rgba(255, 255, 255, 0.85);
      padding: 2px 6px;
      border-radius: var(--bm-radius-sm);
    }

    .bm-thumb-strip {
      display: flex;
      gap: 8px;
      margin-top: 14px;
      overflow-x: auto;
      width: 100%;
      padding-bottom: 4px;
    }

    .bm-thumb-btn {
      width: 52px;
      height: 52px;
      border-radius: var(--bm-radius-md);
      border: 1px solid var(--bm-color-border);
      background-color: var(--bm-color-surface-subtle);
      overflow: hidden;
      cursor: pointer;
      padding: 2px;
      flex-shrink: 0;
      transition: border-color 0.15s ease;

      &.is-selected {
        border-color: var(--bm-color-primary);
        border-width: 2px;
      }
    }

    .bm-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: calc(var(--bm-radius-md) - 2px);
    }

    /* Lightbox Modal */
    .bm-lightbox-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 2000;
      animation: fadeIn 0.15s ease;
    }

    .bm-lightbox-close-btn {
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
    }

    .bm-lightbox-img {
      max-width: 95%;
      max-height: 85vh;
      object-fit: contain;
      border-radius: var(--bm-radius-md);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Product Core Info Card */
    .bm-info-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      margin: 0 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-store-attribution {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      padding: 4px 10px 4px 6px;
      border-radius: var(--bm-radius-full);
      align-self: flex-start;
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
      text-decoration: none;
      transition: background-color 0.15s ease;

      &:hover,
      &:active {
        background-color: var(--bm-color-border);
      }
    }

    .bm-store-avatar {
      width: 24px;
      height: 24px;
      border-radius: var(--bm-radius-full);
      object-fit: cover;
      flex-shrink: 0;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .bm-store-icon-bubble {
      width: 24px;
      height: 24px;
      border-radius: var(--bm-radius-full);
      background-color: rgba(23, 107, 80, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .bm-store-meta-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
      line-height: 1.2;
    }

    .bm-store-name {
      font-size: 12px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-store-location-tag {
      font-size: 10px;
      font-weight: 500;
      color: var(--bm-color-text-muted);
    }

    .bm-store-chevron {
      margin-left: 2px;
      flex-shrink: 0;
    }

    .bm-prod-title {
      font-size: 19px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      line-height: 1.35;
      letter-spacing: -0.3px;
    }

    .bm-price-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
    }

    .bm-price-val {
      font-size: 22px;
      font-weight: 800;
      color: var(--bm-color-primary);
    }

    .bm-orig-val {
      font-size: 14px;
      color: var(--bm-color-text-muted);
      text-decoration: line-through;
    }

    .bm-save-pill {
      font-size: 11px;
      font-weight: 700;
      color: #15803d;
      background-color: #dcfce7;
      padding: 2px 7px;
      border-radius: var(--bm-radius-sm);
    }

    .bm-unit-badge {
      font-size: 12px;
      color: var(--bm-color-text-muted);
      margin-left: auto;
    }

    .bm-guarantee-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .bm-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: var(--bm-radius-full);

      &.is-in-stock {
        background-color: var(--bm-color-primary-soft);
        color: var(--bm-color-primary);
      }

      &.is-verified {
        background-color: var(--bm-color-surface-subtle);
        color: var(--bm-color-text-secondary);
        border: 1px solid var(--bm-color-border);
      }
    }

    .bm-card-action-row {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }

    .bm-card-add-cart-btn {
      flex: 1;
      height: 40px;
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      border: 1px solid var(--bm-color-primary-border);
      border-radius: var(--bm-radius-md);
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: #d1fae5;
      }

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }

    .bm-card-book-now-btn {
      flex: 1;
      height: 40px;
      background-color: var(--bm-color-primary);
      color: #fff;
      border: none;
      border-radius: var(--bm-radius-md);
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }

    /* Group-Buying Deal Card */
    .bm-pool-deal-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background-color: var(--bm-color-primary-soft);
      border: 1px solid var(--bm-color-primary-border);
      border-radius: var(--bm-radius-md);
      padding: 12px;
    }

    .bm-pool-deal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .bm-deal-badge-wrap {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--bm-color-primary);
      font-weight: 700;
      font-size: 12px;
    }

    .bm-pool-deal-desc {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;

      strong {
        color: var(--bm-color-text-primary);
      }
    }

    .bm-join-pool-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      padding: 8px 12px;
      border-radius: var(--bm-radius-md);
      text-decoration: none;
      margin-top: 4px;
      transition: background-color 0.15s ease;

      &:hover,
      &:active {
        background-color: var(--bm-color-primary-hover);
      }
    }

    /* Pickup Notice */
    .bm-pickup-notice-box {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      background-color: var(--bm-color-surface-subtle);
      border-radius: var(--bm-radius-md);
      border: 1px solid var(--bm-color-border);
    }

    .bm-notice-icon-bubble {
      width: 28px;
      height: 28px;
      border-radius: var(--bm-radius-full);
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .bm-notice-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-notice-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-notice-sub {
      font-size: 11px;
      color: var(--bm-color-text-secondary);
      line-height: 1.35;
    }

    /* Specs Container */
    .bm-specs-container {
      border-top: 1px solid var(--bm-color-border-subtle);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-section-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-desc-text {
      font-size: 13px;
      color: var(--bm-color-text-secondary);
      line-height: 1.5;
    }

    .bm-specs-table {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }

    .bm-spec-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 4px 0;
      border-bottom: 1px dashed var(--bm-color-border-subtle);
    }

    .bm-spec-label {
      color: var(--bm-color-text-muted);
    }

    .bm-spec-val {
      color: var(--bm-color-text-primary);
      font-weight: 600;
    }

    .bm-spec-store-link {
      color: var(--bm-color-primary);
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;

      &:hover,
      &:active {
        text-decoration: underline;
      }
    }

    /* Related Products Section */
    .bm-related-section {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-sec-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bm-sec-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-sec-link {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-primary);
      text-decoration: none;
    }

    .bm-related-slider {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .bm-rel-card {
      flex: 0 0 130px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .bm-rel-link {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      flex: 1;
    }

    .bm-rel-img-box {
      height: 90px;
      background-color: var(--bm-color-surface-subtle);
    }

    .bm-rel-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-rel-info {
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-rel-title {
      font-size: 11px;
      font-weight: 600;
      height: 28px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .bm-rel-price {
      font-size: 12px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-rel-add-btn {
      height: 28px;
      margin: 0 4px 4px;
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      border: none;
      border-radius: var(--bm-radius-sm);
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
    }

    /* Sticky Bottom Action Bar */
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
      border-radius: var(--bm-radius-sm);
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bm-color-text-primary);
      cursor: pointer;

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .bm-qty-val {
      min-width: 24px;
      text-align: center;
      font-weight: 700;
      font-size: 14px;
    }

    .bm-add-cart-outline-btn {
      flex: 1;
      height: 44px;
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      border: 1.5px solid var(--bm-color-primary-border);
      border-radius: var(--bm-radius-md);
      font-size: 13.5px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      white-space: nowrap;
      transition: background-color 0.15s ease, border-color 0.15s ease;

      &:hover {
        background-color: #d1fae5;
      }

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }

    .bm-add-submit-btn {
      flex: 1.2;
      height: 44px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 13.5px;
      font-weight: 600;
      border: none;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      white-space: nowrap;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }

    .bm-pdp-skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .bm-specs-card.is-skeleton {
      background-color: var(--bm-color-surface);
      border-radius: var(--bm-radius-lg);
      padding: 14px;
      border: 1px solid var(--bm-color-border);
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-bottom-action-bar.is-skeleton {
      pointer-events: none;
    }

    .bm-error-state {
      padding: 48px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-btn-primary {
      padding: 10px 18px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
      text-decoration: none;
      font-size: 13px;
    }
  `],
})
export class ProductDetailPageComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly poolService = inject(PoolService);
  readonly cartService = inject(CartService);
  private readonly recentService = inject(RecentlyViewedService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly StoreIcon = Store;
  readonly ChevronRightIcon = ChevronRight;
  readonly SparklesIcon = Sparkles;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly CarIcon = Car;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly HeartIcon = Heart;
  readonly Share2Icon = Share2;
  readonly CheckIcon = Check;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly MapPinIcon = MapPin;
  readonly CloseIcon = X;
  readonly vehiclePlaceholder = VEHICLE_PLACEHOLDER_SVG;

  readonly cartCount = this.cartService.totalItemCount;

  readonly product = signal<ProductRecord | null>(null);
  readonly activeImage = signal<string>('');
  readonly lightboxUrl = signal<string | null>(null);
  readonly relatedPool = signal<PoolRecord | null>(null);
  readonly relatedProducts = signal<ProductRecord[]>([]);
  readonly quantity = signal<number>(1);
  readonly isLoading = signal<boolean>(true);
  readonly isAdding = signal<boolean>(false);
  readonly isWishlisted = signal<boolean>(false);

  readonly galleryImages = computed<string[]>(() => {
    const p = this.product();
    if (!p) return [];
    const images: string[] = [];
    if (p.primaryImageUrl) images.push(p.primaryImageUrl);
    if (p.imageUrls && p.imageUrls.length > 0) {
      p.imageUrls.forEach((img) => {
        if (img && !images.includes(img)) images.push(img);
      });
    }
    return images;
  });

  readonly discountPercentage = computed<number>(() => {
    const p = this.product();
    if (!p || !p.originalPrice || p.originalPrice <= p.price) return 0;
    return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  });

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
    this.quantity.set(1);

    this.productService.getProductById(productId).subscribe({
      next: (prod) => {
        if (prod) {
          this.product.set(prod);
          this.activeImage.set(prod.primaryImageUrl || prod.imageUrls?.[0] || '');
          this.recentService.trackProduct(prod);
          this.checkWishlistStatus(prod.id);

          // Check if there is an active group-buy pool for this product or store
          this.poolService.getPools({ storeId: prod.storeId, limit: 1 }).subscribe({
            next: (poolRes) => {
              if (poolRes.pools.length > 0) {
                this.relatedPool.set(poolRes.pools[0]);
              }
            },
          });

          // Fetch more products from the same store
          this.productService.getProducts({ storeId: prod.storeId, limit: 6 }).subscribe({
            next: (relRes) => {
              const others = relRes.products.filter((p) => p.id !== prod.id);
              this.relatedProducts.set(others);
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
    const prod = this.product();
    const qty = this.quantity();

    this.isAdding.set(true);
    this.cartService.addItem(productId, qty, prod || undefined).subscribe({
      next: () => {
        this.isAdding.set(false);
      },
      error: () => {
        this.isAdding.set(false);
      },
    });
  }

  bookNow(productId: string): void {
    this.isAdding.set(true);
    this.cartService.addItem(productId, this.quantity(), this.product() || undefined).subscribe({
      next: () => {
        this.isAdding.set(false);
        this.router.navigate(['/cart']);
      },
      error: () => {
        this.isAdding.set(false);
      },
    });
  }

  addRelatedToCart(productId: string): void {
    const rel = this.relatedProducts().find((p) => p.id === productId);
    this.cartService.addItem(productId, 1, rel || undefined).subscribe();
  }

  openLightbox(url: string): void {
    if (url) {
      this.lightboxUrl.set(url);
    }
  }

  closeLightbox(): void {
    this.lightboxUrl.set(null);
  }

  toggleWishlist(): void {
    const prod = this.product();
    if (!prod) return;

    const list = this.getStoredWishlist();
    const idx = list.indexOf(prod.id);

    if (idx > -1) {
      list.splice(idx, 1);
      this.isWishlisted.set(false);
      this.toast.info('Removed from wishlist');
    } else {
      list.push(prod.id);
      this.isWishlisted.set(true);
      this.toast.success('Saved to wishlist');
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('buymass_wishlist', JSON.stringify(list));
    }
  }

  shareProduct(): void {
    const prod = this.product();
    if (!prod || typeof window === 'undefined') return;

    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: prod.name,
          text: `Check out ${prod.name} on BuyMass for ₹${prod.price}!`,
          url,
        })
        .catch(() => { });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      this.toast.success('Product link copied to clipboard!');
    }
  }

  private checkWishlistStatus(id: string): void {
    const list = this.getStoredWishlist();
    this.isWishlisted.set(list.includes(id));
  }

  private getStoredWishlist(): string[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('buymass_wishlist') || '[]');
    } catch {
      return [];
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
