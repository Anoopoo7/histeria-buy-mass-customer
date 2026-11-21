import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  ArrowRight,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Info,
  Minus,
  Plus,
  Sparkles,
  Store,
  Trash2,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { FormattedCart, SubmittedCartsPagination } from '../../../../core/models/cart.model';
import { CartService } from '../../../../core/services/cart.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { VEHICLE_PLACEHOLDER_SVG } from '../../../../core/utils/image.utils';

@Component({
  selector: 'bm-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-cart-view">
      <!-- Header -->
      <div class="bm-cart-header">
        <h1 class="bm-cart-title">{{ t('cart_title') }}</h1>
      </div>

      <!-- Navigation Tabs: Active Carts vs Pool-Submitted Carts -->
      <div class="bm-cart-tabs-nav">
        <button
          type="button"
          class="bm-cart-tab-btn"
          [class.is-active]="selectedTab() === 'active'"
          (click)="setTab('active')"
        >
          <div class="bm-tab-content">
            <lucide-icon [img]="CarIcon" [size]="15"></lucide-icon>
            <span>Active Bookings</span>
            @if (activeCarts().length > 0) {
              <span class="bm-tab-badge">{{ activeCarts().length }}</span>
            }
          </div>
        </button>

        <button
          type="button"
          class="bm-cart-tab-btn"
          [class.is-active]="selectedTab() === 'submitted'"
          (click)="setTab('submitted')"
        >
          <div class="bm-tab-content">
            <lucide-icon [img]="SparklesIcon" [size]="15"></lucide-icon>
            <span>Submitted to Pool</span>
            @if (activeSubmittedCarts().length > 0) {
              <span class="bm-tab-badge is-pool">{{ activeSubmittedCarts().length }}</span>
            }
          </div>
        </button>
      </div>

      <!-- TAB 1: ACTIVE STORE CARTS -->
      @if (selectedTab() === 'active') {
        <!-- Store Separation Notice -->
        @if (activeCarts().length > 0) {
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
        } @else if (activeCarts().length > 0) {
          <div class="bm-carts-container">
            @for (cart of activeCarts(); track cart.id) {
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
                        [src]="item.image || vehiclePlaceholder"
                        [alt]="item.name"
                        class="bm-item-thumb"
                        loading="lazy"
                        decoding="async"
                      />

                      <div class="bm-item-details">
                        <h4 class="bm-item-name">{{ item.name }}</h4>
                        <div class="bm-item-unit-price">
                          ₹{{ item.currentPrice || item.priceAtAddition | number }}
                          @if (item.unit) {
                            <span class="bm-unit-sub">/ {{ item.unit }}</span>
                          }
                        </div>
                        <span class="bm-item-line-total">
                          Total: ₹{{ (item.itemSubtotal || ((item.currentPrice || item.priceAtAddition) * item.quantity)) | number }}
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
                    <span class="bm-subtotal-val">₹{{ cart.cartTotal | number }}</span>
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
              <lucide-icon [img]="CarIcon" [size]="36" class="text-muted"></lucide-icon>
            </div>
            <h3 class="bm-empty-title">{{ t('cart_empty_title') }}</h3>
            <p class="bm-empty-sub">{{ t('cart_empty_sub') }}</p>
            <a routerLink="/explore" class="bm-btn-explore">
              {{ t('cart_continue_shopping') }}
            </a>
          </div>
        }
      }

      <!-- TAB 2: POOL-SUBMITTED CARTS -->
      @if (selectedTab() === 'submitted') {
        <!-- Submitted Info Banner -->
        <div class="bm-submitted-info-box">
          <lucide-icon [img]="SparklesIcon" [size]="18" class="text-primary"></lucide-icon>
          <div class="bm-submitted-info-text">
            <strong>Group Pool Vehicle Submissions</strong>
            <p>
              These vehicle bookings are committed to pool campaigns awaiting volume targets. Once the pool concludes, volume discounts are locked and dealership handover orders are placed.
            </p>
          </div>
        </div>

        <!-- Store Filter Pills (if multiple stores or active filter) -->
        @if (uniqueStores().length > 1 || selectedStoreFilter()) {
          <div class="bm-store-filter-bar hide-scroll">
            <span class="bm-filter-label">
              <lucide-icon [img]="FilterIcon" [size]="13"></lucide-icon>
              Filter Dealership:
            </span>
            <button
              type="button"
              class="bm-store-filter-chip"
              [class.is-active]="!selectedStoreFilter()"
              (click)="onStoreFilterChange('')"
            >
              All Dealerships
            </button>
            @for (st of uniqueStores(); track st.id) {
              <button
                type="button"
                class="bm-store-filter-chip"
                [class.is-active]="selectedStoreFilter() === st.id"
                (click)="onStoreFilterChange(st.id)"
              >
                {{ st.name }}
              </button>
            }
          </div>
        }

        <!-- Loading State -->
        @if (isSubmittedLoading()) {
          <div class="bm-loading-list">
            @for (i of [1, 2]; track i) {
              <div class="bm-cart-skeleton bm-skeleton"></div>
            }
          </div>
        } @else if (activeSubmittedCarts().length > 0) {
          <!-- Submitted Carts List -->
          <div class="bm-carts-container">
            @for (cart of activeSubmittedCarts(); track cart.id) {
              <div class="bm-store-cart-card is-submitted-card">
                <!-- Store Header & Pool Badge -->
                <div class="bm-store-cart-head">
                  <a [routerLink]="['/stores', cart.store.id]" class="bm-store-meta">
                    <lucide-icon [img]="StoreIcon" [size]="18" class="text-primary"></lucide-icon>
                    <div>
                      <span class="bm-store-name">{{ cart.store.name }}</span>
                      @if (cart.store.city) {
                        <span class="bm-store-city-sub">{{ cart.store.city }}</span>
                      }
                    </div>
                  </a>

                  <span class="bm-status-pill is-submitted">
                    <lucide-icon [img]="ClockIcon" [size]="12"></lucide-icon>
                    <span>Submitted to Pool</span>
                  </span>
                </div>

                <!-- Associated Pool Campaign Banner (if pool attached) -->
                @if (cart.pool) {
                  <div class="bm-cart-pool-banner">
                    <div class="bm-pool-meta">
                      <lucide-icon [img]="SparklesIcon" [size]="14" class="text-primary"></lucide-icon>
                      <span class="bm-pool-tag">Campaign:</span>
                      <strong class="bm-pool-title">{{ cart.pool.title }}</strong>
                    </div>

                    <a [routerLink]="['/pools', cart.pool.id]" class="bm-pool-view-link">
                      <span>View Deal</span>
                      <lucide-icon [img]="ChevronRightIcon" [size]="13"></lucide-icon>
                    </a>
                  </div>
                }

                <!-- Items Preview List -->
                <div class="bm-items-list">
                  @for (item of cart.items; track item.productId) {
                    <div class="bm-item-row is-readonly">
                      <img
                        [src]="item.image || vehiclePlaceholder"
                        [alt]="item.name"
                        class="bm-item-thumb"
                        loading="lazy"
                        decoding="async"
                      />

                      <div class="bm-item-details">
                        <h4 class="bm-item-name">{{ item.name }}</h4>
                        <div class="bm-item-unit-price">
                          Qty: <strong>{{ item.quantity }}</strong>
                          @if (item.unit) {
                            <span>({{ item.unit }})</span>
                          }
                          • ₹{{ (item.currentPrice || item.priceAtAddition) | number }} each
                        </div>
                        <span class="bm-item-line-total">
                          Subtotal: ₹{{ (item.itemSubtotal || ((item.currentPrice || item.priceAtAddition) * item.quantity)) | number }}
                        </span>
                      </div>
                    </div>
                  }
                </div>

                <!-- Footer: Total & Status info -->
                <div class="bm-store-cart-footer">
                  <div class="bm-subtotal-row">
                    <span class="bm-subtotal-label">Committed Cart Value</span>
                    <span class="bm-subtotal-val">₹{{ cart.cartTotal | number }}</span>
                  </div>

                  <div class="bm-submitted-meta-row">
                    <span class="bm-submitted-date">
                      Submitted {{ formatDate(cart.updatedAt || cart.createdAt) }}
                    </span>
                    <span class="bm-items-badge">
                      {{ cart.itemCount || cart.items.length }} {{ (cart.itemCount || cart.items.length) === 1 ? 'item' : 'items' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Pagination Controls -->
          @if (submittedPagination().totalPages > 1) {
            <div class="bm-pagination-controls">
              <button
                type="button"
                class="bm-page-btn"
                [disabled]="submittedPagination().page <= 1"
                (click)="goToSubmittedPage(submittedPagination().page - 1)"
              >
                <lucide-icon [img]="ChevronLeftIcon" [size]="14"></lucide-icon>
                <span>Previous</span>
              </button>

              <span class="bm-page-indicator">
                Page {{ submittedPagination().page }} of {{ submittedPagination().totalPages }}
              </span>

              <button
                type="button"
                class="bm-page-btn"
                [disabled]="submittedPagination().page >= submittedPagination().totalPages"
                (click)="goToSubmittedPage(submittedPagination().page + 1)"
              >
                <span>Next</span>
                <lucide-icon [img]="ChevronRightIcon" [size]="14"></lucide-icon>
              </button>
            </div>
          }
        } @else {
          <!-- Empty Submitted Carts State -->
          <div class="bm-cart-empty">
            <div class="bm-empty-icon-wrap">
              <lucide-icon [img]="CarIcon" [size]="34" class="text-primary"></lucide-icon>
            </div>
            <h3 class="bm-empty-title">No Submitted Pool Vehicles</h3>
            <p class="bm-empty-sub">
              @if (selectedStoreFilter()) {
                No submitted pool vehicles found for this dealership.
              } @else {
                Vehicle bookings committed to group deal pools will appear here until the campaign concludes.
              }
            </p>
            @if (selectedStoreFilter()) {
              <button type="button" class="bm-btn-secondary" (click)="onStoreFilterChange('')">
                Clear Dealership Filter
              </button>
            } @else {
              <a routerLink="/pools" class="bm-btn-explore">
                Explore Active Vehicle Pools
              </a>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .bm-cart-view {
      padding: 14px 14px 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-width: var(--bm-max-mobile-width);
      margin: 0 auto;
      width: 100%;
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

    /* Tabs Navigation */
    .bm-cart-tabs-nav {
      display: flex;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 3px;
      gap: 4px;
    }

    .bm-cart-tab-btn {
      flex: 1;
      height: 38px;
      border: none;
      background: transparent;
      border-radius: var(--bm-radius-md);
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;

      &.is-active {
        background-color: var(--bm-color-surface);
        color: var(--bm-color-primary);
        box-shadow: var(--bm-shadow-xs);
        font-weight: 700;
      }
    }

    .bm-tab-content {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm-tab-badge {
      font-size: 10px;
      font-weight: 700;
      background-color: rgba(0, 0, 0, 0.08);
      color: var(--bm-color-text-primary);
      padding: 1px 6px;
      border-radius: var(--bm-radius-full);

      &.is-pool {
        background-color: rgba(23, 107, 80, 0.15);
        color: var(--bm-color-primary);
      }
    }

    /* Notice & Info Boxes */
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

    .bm-submitted-info-box {
      display: flex;
      gap: 10px;
      background-color: rgba(23, 107, 80, 0.06);
      border: 1px solid rgba(23, 107, 80, 0.2);
      border-radius: var(--bm-radius-md);
      padding: 12px;
    }

    .bm-submitted-info-text {
      display: flex;
      flex-direction: column;
      gap: 3px;
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;

      strong {
        color: var(--bm-color-primary);
        font-size: 13px;
      }
    }

    /* Store Filter Bar */
    .bm-store-filter-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .bm-filter-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--bm-color-text-muted);
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }

    .bm-store-filter-chip {
      height: 28px;
      padding: 0 12px;
      border-radius: var(--bm-radius-full);
      border: 1px solid var(--bm-color-border);
      background-color: var(--bm-color-surface);
      color: var(--bm-color-text-secondary);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;

      &.is-active {
        background-color: var(--bm-color-primary);
        border-color: var(--bm-color-primary);
        color: #fff;
      }
    }

    /* Store Carts List */
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

      &.is-submitted-card {
        border-left: 3px solid var(--bm-color-primary);
      }
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
      gap: 8px;
      text-decoration: none;
    }

    .bm-store-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-store-city-sub {
      font-size: 10px;
      color: var(--bm-color-text-muted);
      display: block;
    }

    .bm-status-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--bm-radius-full);
      display: inline-flex;
      align-items: center;
      gap: 4px;

      &.is-submitted {
        background-color: rgba(23, 107, 80, 0.12);
        color: var(--bm-color-primary);
      }
    }

    .bm-cart-pool-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      background-color: rgba(23, 107, 80, 0.04);
      border-bottom: 1px dashed var(--bm-color-border);
    }

    .bm-pool-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .bm-pool-tag {
      color: var(--bm-color-text-muted);
      font-size: 11px;
    }

    .bm-pool-title {
      color: var(--bm-color-primary);
    }

    .bm-pool-view-link {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 11px;
      font-weight: 700;
      color: var(--bm-color-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .bm-btn-clear-store {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--bm-color-danger);
      font-size: 11px;
      font-weight: 600;
      background: transparent;
      border: none;
      cursor: pointer;
    }

    /* Cart Line Items */
    .bm-items-list {
      padding: 8px 14px;
      display: flex;
      flex-direction: column;
    }

    .bm-item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--bm-color-border-subtle);

      &:last-child {
        border-bottom: none;
      }
    }

    .bm-item-thumb {
      width: 52px;
      height: 52px;
      border-radius: var(--bm-radius-md);
      object-fit: cover;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      flex-shrink: 0;
    }

    .bm-item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-item-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
    }

    .bm-item-unit-price {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-unit-sub {
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
      gap: 6px;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      padding: 2px 6px;
    }

    .bm-qty-btn {
      width: 24px;
      height: 24px;
      border-radius: var(--bm-radius-sm);
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bm-color-text-primary);
      cursor: pointer;
    }

    .bm-qty-display {
      font-size: 12px;
      font-weight: 700;
      min-width: 16px;
      text-align: center;
    }

    /* Cart Footer */
    .bm-store-cart-footer {
      padding: 12px 14px;
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

    .bm-submitted-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-items-badge {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 2px 6px;
      border-radius: var(--bm-radius-sm);
      font-weight: 600;
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
      text-decoration: none;
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
      text-decoration: none;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }
    }

    /* Pagination */
    .bm-pagination-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
    }

    .bm-page-btn {
      height: 34px;
      padding: 0 12px;
      border-radius: var(--bm-radius-md);
      border: 1px solid var(--bm-color-border);
      background-color: var(--bm-color-surface);
      color: var(--bm-color-text-primary);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .bm-page-indicator {
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-text-secondary);
    }

    /* Empty State */
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
      max-width: 280px;
    }

    .bm-btn-explore {
      margin-top: 8px;
      padding: 10px 20px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      border-radius: var(--bm-radius-md);
      text-decoration: none;
    }

    .bm-btn-secondary {
      margin-top: 8px;
      padding: 8px 16px;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      color: var(--bm-color-text-primary);
      font-weight: 600;
      font-size: 12px;
      border-radius: var(--bm-radius-md);
      cursor: pointer;
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
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(TranslationService);

  readonly StoreIcon = Store;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly TrashIcon = Trash2;
  readonly vehiclePlaceholder = VEHICLE_PLACEHOLDER_SVG;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly SparklesIcon = Sparkles;
  readonly ArrowRightIcon = ArrowRight;
  readonly CarIcon = Car;
  readonly InfoIcon = Info;
  readonly ClockIcon = Clock;
  readonly FilterIcon = Filter;
  readonly CheckCircleIcon = CheckCircle2;

  readonly carts = this.cartService.carts;
  readonly isLoading = this.cartService.isLoading;

  // Filter only carts that have at least 1 item
  readonly activeCarts = computed(() => {
    return this.carts().filter((cart) => cart.items && cart.items.length > 0);
  });

  readonly selectedTab = signal<'active' | 'submitted'>('active');
  readonly submittedCarts = signal<FormattedCart[]>([]);
  readonly isSubmittedLoading = signal<boolean>(false);

  // Filter only submitted carts that have at least 1 item
  readonly activeSubmittedCarts = computed(() => {
    return this.submittedCarts().filter((cart) => cart.items && cart.items.length > 0);
  });
  readonly submittedPagination = signal<SubmittedCartsPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  readonly selectedStoreFilter = signal<string>('');

  readonly uniqueStores = signal<{ id: string; name: string }[]>([]);

  ngOnInit(): void {
    this.cartService.loadCarts().subscribe();

    this.route.queryParams.subscribe((params) => {
      if (params['tab'] === 'submitted') {
        this.selectedTab.set('submitted');
      }
      if (params['storeId']) {
        this.selectedStoreFilter.set(params['storeId']);
      }
      this.loadSubmittedCarts(1);
    });
  }

  setTab(tab: 'active' | 'submitted'): void {
    this.selectedTab.set(tab);
    if (tab === 'submitted' && this.submittedCarts().length === 0) {
      this.loadSubmittedCarts(1);
    }
  }

  onStoreFilterChange(storeId: string): void {
    this.selectedStoreFilter.set(storeId);
    this.loadSubmittedCarts(1);
  }

  loadSubmittedCarts(page = 1): void {
    this.isSubmittedLoading.set(true);
    this.cartService
      .getSubmittedCarts({
        page,
        limit: 10,
        storeId: this.selectedStoreFilter() || undefined,
        status: 'SUBMITTED',
      })
      .subscribe({
        next: (res) => {
          this.submittedCarts.set(res.data);
          this.submittedPagination.set(res.pagination);

          // Extract unique stores for filtering
          const storesMap = new Map<string, string>();
          res.data.forEach((c) => {
            if (c.store?.id) {
              storesMap.set(c.store.id, c.store.name);
            }
          });
          const storesList: { id: string; name: string }[] = [];
          storesMap.forEach((name, id) => storesList.push({ id, name }));
          if (storesList.length > 0) {
            this.uniqueStores.set(storesList);
          }

          this.isSubmittedLoading.set(false);
        },
        error: () => {
          this.isSubmittedLoading.set(false);
        },
      });
  }

  goToSubmittedPage(page: number): void {
    this.loadSubmittedCarts(page);
  }

  updateQuantity(productId: string, qty: number): void {
    this.cartService.updateItemQuantity(productId, qty).subscribe();
  }

  clearStoreCart(storeId: string): void {
    if (confirm('Clear all items from this store cart?')) {
      this.cartService.clearStoreCart(storeId).subscribe();
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
