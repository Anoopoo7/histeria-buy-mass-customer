import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  AlertCircle,
  ArrowLeft,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  LucideAngularModule,
  Plus,
  Share2,
  Sparkles,
  Store,
  Users,
} from 'lucide-angular';
import { FormattedCart } from '../../../../core/models/cart.model';
import { PoolParticipationRecord, PoolRecord } from '../../../../core/models/pool.model';
import { ProductRecord } from '../../../../core/models/product.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { PoolService } from '../../../../core/services/pool.service';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { CountdownTimerComponent } from '../../../../shared/ui/countdown-timer/countdown-timer.component';
import { PoolProgressComponent } from '../../../../shared/ui/pool-progress/pool-progress.component';
import { VEHICLE_PLACEHOLDER_SVG } from '../../../../core/utils/image.utils';

@Component({
  selector: 'bm-pool-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    CountdownTimerComponent,
    PoolProgressComponent,
  ],
  template: `
    <div class="bm-pool-detail-view">
      <!-- Top Navigation -->
      <div class="bm-top-nav">
        <a routerLink="/pools" class="bm-back-circle" aria-label="Back">
          <lucide-icon [img]="ArrowLeftIcon" [size]="18"></lucide-icon>
        </a>
      </div>

      @if (pool(); as p) {
        <!-- Campaign Header Media -->
        <div class="bm-campaign-media">
          <img
            [src]="p.primaryImageUrl || vehiclePlaceholder"
            [alt]="p.title"
            class="bm-campaign-img"
            fetchpriority="high"
            decoding="async"
          />
          <div class="bm-media-badges">
            <span class="bm-deal-badge">{{ t('pool_group_deal') }}</span>
            <bm-countdown-timer [endsAt]="p.endsAt"></bm-countdown-timer>
          </div>
        </div>

        <div class="bm-content-container">
          <!-- Main Card -->
          <div class="bm-card bm-main-info">
            <a [routerLink]="['/stores', p.storeId]" class="bm-store-pill">
              <lucide-icon [img]="StoreIcon" [size]="14" class="text-primary"></lucide-icon>
              <span>{{ p.storeName || 'Partner Store' }}</span>
            </a>

            <h1 class="bm-pool-title">{{ p.title }}</h1>
            @if (p.description) {
              <p class="bm-pool-desc">{{ p.description }}</p>
            }

            <!-- Progress Block -->
            <div class="bm-progress-wrapper">
              <bm-pool-progress
                [progress]="p.progress"
                [currentAmount]="p.currentTotalAmount || 0"
                [targetAmount]="p.targetAmount || 10000"
                [participantCountInput]="p.currentParticipantCount || 0"
                [maxDiscountInput]="p.maxDiscountPercentage || 15"
                [tiers]="p.tiers"
              ></bm-pool-progress>
            </div>
          </div>

          <!-- Volume Discount Tiers Breakdown -->
          <div class="bm-card bm-tiers-card">
            <h3 class="bm-card-title">
              <lucide-icon [img]="SparklesIcon" [size]="16" class="text-primary"></lucide-icon>
              <span>{{ t('pool_discount_tiers') }}</span>
            </h3>

            <div class="bm-tiers-list">
              @for (tier of (p.progress?.tiersProgress || p.tiers); track tier.targetAmount; let idx = $index) {
                <div class="bm-tier-row" [class.is-reached]="$any(tier).isReached">
                  <div class="bm-tier-badge" [class.is-unlocked]="$any(tier).isReached">
                    Tier {{ idx + 1 }}
                    @if ($any(tier).isReached) { ✓ }
                  </div>
                  <div class="bm-tier-details">
                    <span class="bm-tier-off">{{ tier.discountPercentage }}% Collective Discount</span>
                    @if ($any(tier).isReached) {
                      <span class="bm-tier-cond text-success font-semibold">Unlocked! Discount achieved</span>
                    } @else if ($any(tier).remainingAmount) {
                      <span class="bm-tier-cond">₹{{ $any(tier).remainingAmount }} needed to unlock</span>
                    } @else {
                      <span class="bm-tier-cond">Unlocked when pool hits ₹{{ tier.targetAmount }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Vehicles in this Pool Carousel Section -->
          <div class="bm-card bm-pool-products-card">
            <div class="bm-pool-products-head">
              <div class="bm-pool-products-title-group">
                <lucide-icon [img]="CarIcon" [size]="16" class="text-primary"></lucide-icon>
                <h3 class="bm-card-title mb-0">Vehicles in this Pool</h3>
                @if (poolProducts().length > 0) {
                  <span class="bm-pool-products-count">({{ poolProducts().length }})</span>
                }
              </div>
              <a
                [routerLink]="['/stores', p.storeId]"
                [queryParams]="{ tab: 'products' }"
                class="bm-view-all-link"
              >
                <span>View All</span>
                <lucide-icon [img]="ChevronRightIcon" [size]="14"></lucide-icon>
              </a>
            </div>

            @if (isLoadingPoolProducts()) {
              <div class="bm-pool-carousel-slider hide-scroll">
                @for (i of [1, 2, 3]; track i) {
                  <div class="bm-pool-prod-card is-skeleton">
                    <div class="bm-skeleton bm-pool-prod-skeleton-img"></div>
                    <div class="bm-pool-prod-info">
                      <div class="bm-skeleton" style="width: 70%; height: 14px; margin-bottom: 6px;"></div>
                      <div class="bm-skeleton" style="width: 40%; height: 14px; margin-bottom: 8px;"></div>
                      <div class="bm-skeleton" style="width: 100%; height: 28px; border-radius: var(--bm-radius-sm);"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (poolProducts().length > 0) {
              <div class="bm-pool-carousel-slider hide-scroll">
                @for (prod of poolProducts(); track prod.id) {
                  <div class="bm-pool-prod-card">
                    <a [routerLink]="['/products', prod.id]" class="bm-pool-prod-media">
                      <img
                        [src]="prod.primaryImageUrl || vehiclePlaceholder"
                        [alt]="prod.name"
                        class="bm-pool-prod-img"
                        loading="lazy"
                        decoding="async"
                      />
                      <span class="bm-pool-prod-badge">
                        Up to {{ p.maxDiscountPercentage || 15 }}% Off
                      </span>
                    </a>
                    <div class="bm-pool-prod-info">
                      <a [routerLink]="['/products', prod.id]" class="bm-pool-prod-title">
                        {{ prod.name }}
                      </a>
                      <div class="bm-pool-prod-price-box">
                        <span class="bm-pool-prod-price">₹{{ prod.price | number }}</span>
                        <span class="bm-pool-prod-unit">/ {{ prod.unit || 'vehicle' }}</span>
                      </div>
                      <button
                        type="button"
                        class="bm-pool-prod-add-btn"
                        (click)="addProductToCart(prod)"
                      >
                        <lucide-icon [img]="PlusIcon" [size]="13"></lucide-icon>
                        <span>Book</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="bm-empty-text">No vehicles currently listed for this pool.</p>
            }
          </div>

          <!-- Eligible Cart Items Supporting This Pool -->
          @if (!myParticipation() && matchingStoreCart(); as storeCart) {
            @if (poolEligibleItems().length > 0) {
              <div class="bm-card bm-eligible-cart-card">
                <div class="bm-eligible-head">
                  <div class="bm-eligible-title-group">
                    <div class="bm-eligible-badge">
                      <lucide-icon [img]="CarIcon" [size]="14"></lucide-icon>
                      <span>In Your Cart</span>
                    </div>
                    <h3 class="bm-eligible-title">
                      {{ poolEligibleItems().length }} vehicle{{ poolEligibleItems().length > 1 ? 's' : '' }} ready to join this deal
                    </h3>
                  </div>
                  <span class="bm-eligible-total">₹{{ eligibleTotalValue() | number }}</span>
                </div>

                <p class="bm-eligible-desc">
                  These vehicle(s) from <strong>{{ p.storeName || 'this dealership' }}</strong> are eligible for collective volume discounts under this campaign.
                </p>

                <!-- Item preview list with icons and details -->
                <div class="bm-eligible-items-list">
                  @for (item of poolEligibleItems(); track item.productId) {
                    <div class="bm-eligible-item-row">
                      <div class="bm-eligible-thumb-wrap">
                        <img
                          [src]="item.image || vehiclePlaceholder"
                          [alt]="item.name"
                          class="bm-eligible-thumb"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div class="bm-eligible-info">
                        <span class="bm-eligible-name">{{ item.name }}</span>
                        <div class="bm-eligible-price-line">
                          <span class="bm-eligible-qty">Qty: {{ item.quantity }}</span>
                          <span class="bm-eligible-price">
                            ₹{{ (item.itemSubtotal || item.currentPrice * item.quantity) | number }}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Direct Join Button inside Card -->
                <button
                  type="button"
                  class="bm-card-join-pool-btn"
                  [disabled]="isParticipating()"
                  (click)="participate(p.id, storeCart.id)"
                >
                  <lucide-icon [img]="SparklesIcon" [size]="16"></lucide-icon>
                  <span>
                    {{ isParticipating() ? 'Joining...' : 'Join Pool with this Cart • ₹' + (eligibleTotalValue() | number) }}
                  </span>
                </button>
              </div>
            }
          }

          <!-- Customer Participation State -->
          @if (myParticipation(); as part) {
            <div class="bm-card bm-joined-card">
              <div class="bm-joined-head">
                <lucide-icon [img]="CheckCircleIcon" [size]="20" class="text-success"></lucide-icon>
                <div>
                  <h4 class="bm-joined-title">{{ t('pool_already_joined') }}</h4>
                  <p class="bm-joined-val">Eligible Cart Value: ₹{{ part.eligibleCartValue | number }}</p>
                </div>
              </div>

              @if (part.status === 'SUBMITTED') {
                <button
                  type="button"
                  class="bm-btn-withdraw"
                  [disabled]="isWithdrawing()"
                  (click)="withdrawParticipation(p.id)"
                >
                  <span>{{ isWithdrawing() ? 'Withdrawing...' : t('pool_withdraw') }}</span>
                </button>
              }
            </div>
          }

          <!-- How BuyMass Works Explainer -->
          <div class="bm-card bm-explainer-card">
            <div class="bm-explainer-head">
              <lucide-icon [img]="HelpCircleIcon" [size]="18" class="text-primary"></lucide-icon>
              <h3 class="bm-explainer-title">{{ t('pool_how_it_works') }}</h3>
            </div>
            <p class="bm-explainer-text">
              {{ t('pool_explanation') }}
            </p>
          </div>
        </div>

        <!-- Sticky Participation Action Bar -->
        <div class="bm-sticky-action-bar">
          @if (!myParticipation()) {
            @if (matchingStoreCart(); as storeCart) {
              @if (poolEligibleItems().length > 0) {
                <div class="bm-action-cart-summary">
                  <!-- Stacked / row item icons -->
                  <div class="bm-cart-item-icons-row">
                    @for (item of poolEligibleItems().slice(0, 3); track item.productId) {
                      <div class="bm-mini-item-icon-box">
                        <img [src]="item.image || vehiclePlaceholder" [alt]="item.name" class="bm-mini-item-thumb" loading="lazy" decoding="async" />
                      </div>
                    }
                    @if (poolEligibleItems().length > 3) {
                      <div class="bm-mini-more-chip">+{{ poolEligibleItems().length - 3 }}</div>
                    }
                  </div>
                  <div class="bm-action-text-col">
                    <span class="bm-store-cart-summary">
                      {{ poolEligibleItems().length }} vehicle{{ poolEligibleItems().length > 1 ? 's' : '' }} (₹{{ eligibleTotalValue() | number }})
                    </span>
                    <span class="bm-ready-hint">Eligible for collective discount</span>
                  </div>
                </div>

                <button
                  type="button"
                  class="bm-btn-join"
                  [disabled]="isParticipating()"
                  (click)="participate(p.id, storeCart.id)"
                >
                  <lucide-icon [img]="SparklesIcon" [size]="18"></lucide-icon>
                  <span>{{ isParticipating() ? 'Submitting...' : t('pool_join_btn') }}</span>
                </button>
              } @else {
                <div class="bm-action-info">
                  <span class="bm-cart-empty-text">Your cart has no eligible items for this pool</span>
                </div>
                <a [routerLink]="['/stores', p.storeId]" class="bm-btn-browse">
                  <span>Browse Dealership</span>
                </a>
              }
            } @else {
              <div class="bm-action-info">
                <span class="bm-cart-empty-text">Add vehicles from this dealership to join</span>
              </div>
              <a [routerLink]="['/stores', p.storeId]" class="bm-btn-browse">
                <span>Browse Dealership</span>
              </a>
            }
          } @else {
            <div class="bm-participation-confirmed">
              <div class="bm-part-meta-left">
                <lucide-icon [img]="CheckCircleIcon" [size]="18" class="text-success"></lucide-icon>
                <span>Participation active. Final discount applies upon campaign close!</span>
              </div>
              <a [routerLink]="['/cart']" [queryParams]="{ tab: 'submitted', storeId: p.storeId }" class="bm-btn-view-submitted">
                View Submitted Cart
              </a>
            </div>
          }
        </div>
      } @else if (isLoading()) {
        <div class="bm-pool-detail-skeleton-wrap">
          <!-- Campaign Header Media Skeleton -->
          <div class="bm-campaign-media bm-skeleton" style="height: 200px;"></div>

          <div class="bm-content-container">
            <!-- Pool Hero Header Card Skeleton -->
            <div class="bm-card bm-pool-header-card is-skeleton">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <div class="bm-skeleton bm-skeleton-text" style="width: 120px;"></div>
                <div class="bm-skeleton" style="width: 50px; height: 16px; border-radius: var(--bm-radius-full);"></div>
              </div>
              <div class="bm-skeleton bm-skeleton-title" style="width: 75%; height: 22px; margin-bottom: 14px;"></div>

              <!-- Volume progress skeleton -->
              <div class="bm-skeleton" style="height: 14px; width: 45%; margin-bottom: 8px;"></div>
              <div class="bm-skeleton" style="height: 8px; width: 100%; border-radius: 4px; margin-bottom: 12px;"></div>
              <div style="display: flex; gap: 8px;">
                <div class="bm-skeleton" style="height: 48px; flex: 1; border-radius: var(--bm-radius-md);"></div>
                <div class="bm-skeleton" style="height: 48px; flex: 1; border-radius: var(--bm-radius-md);"></div>
                <div class="bm-skeleton" style="height: 48px; flex: 1; border-radius: var(--bm-radius-md);"></div>
              </div>
            </div>

            <!-- Dealership Information Card Skeleton -->
            <div class="bm-card bm-store-info-card is-skeleton">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="bm-skeleton bm-skeleton-circle" style="width: 38px; height: 38px; flex-shrink: 0;"></div>
                <div style="flex: 1;">
                  <div class="bm-skeleton bm-skeleton-title" style="width: 140px; margin-bottom: 4px;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 80px;"></div>
                </div>
              </div>
            </div>

            <!-- Eligible Vehicle Items List Skeleton -->
            <div class="bm-card bm-pool-cart-card is-skeleton">
              <div class="bm-skeleton bm-skeleton-title" style="width: 180px; margin-bottom: 12px;"></div>
              @for (i of [1, 2]; track i) {
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-top: 1px solid var(--bm-color-border-subtle);">
                  <div class="bm-skeleton" style="width: 44px; height: 44px; border-radius: var(--bm-radius-sm); flex-shrink: 0;"></div>
                  <div style="flex: 1;">
                    <div class="bm-skeleton bm-skeleton-text" style="width: 65%; margin-bottom: 4px;"></div>
                    <div class="bm-skeleton bm-skeleton-text" style="width: 40px;"></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Bottom Action Bar Skeleton -->
          <div class="bm-bottom-action-bar is-skeleton">
            <div class="bm-skeleton" style="width: 100%; height: 44px; border-radius: var(--bm-radius-md);"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-pool-detail-view {
      padding-bottom: 90px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bm-top-nav {
      position: absolute;
      top: 12px;
      left: 14px;
      z-index: 10;
    }

    .bm-back-circle {
      width: 36px;
      height: 36px;
      border-radius: var(--bm-radius-full);
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bm-color-text-primary);
      box-shadow: var(--bm-shadow-sm);
    }

    .bm-campaign-media {
      position: relative;
      height: 200px;
      background-color: var(--bm-color-surface-subtle);
      width: 100%;
    }

    .bm-campaign-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-media-badges {
      position: absolute;
      bottom: 12px;
      left: 14px;
      right: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bm-deal-badge {
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--bm-radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .bm-content-container {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 16px;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-main-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-store-pill {
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
      color: var(--bm-color-text-primary);
    }

    .bm-pool-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      line-height: 1.3;
    }

    .bm-pool-desc {
      font-size: 13px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
    }

    .bm-progress-wrapper {
      margin-top: 4px;
      padding-top: 10px;
      border-top: 1px solid var(--bm-color-border-subtle);
    }

    .bm-card-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
    }

    .bm-tiers-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-tier-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background-color: var(--bm-color-surface-subtle);
      border-radius: var(--bm-radius-md);
      border: 1px solid var(--bm-color-border-subtle);
    }

    .bm-tier-badge {
      font-size: 11px;
      font-weight: 700;
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      padding: 3px 6px;
      border-radius: var(--bm-radius-sm);
    }

    .bm-tier-details {
      display: flex;
      flex-direction: column;
    }

    .bm-tier-off {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-tier-cond {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    /* Vehicles in this Pool Carousel */
    .bm-pool-products-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-pool-products-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .bm-pool-products-title-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm-card-title.mb-0 {
      margin-bottom: 0;
    }

    .bm-pool-products-count {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-secondary);
    }

    .bm-view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-primary);
      text-decoration: none;
      padding: 3px 6px;
      border-radius: var(--bm-radius-sm);
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-soft);
      }
    }

    .bm-pool-carousel-slider {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 4px;
    }

    .bm-pool-prod-card {
      flex: 0 0 165px;
      width: 165px;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      scroll-snap-align: start;

      &.is-skeleton {
        pointer-events: none;
      }
    }

    .bm-pool-prod-media {
      position: relative;
      aspect-ratio: 4 / 3;
      display: block;
      overflow: hidden;
      background-color: #0f172a;
    }

    .bm-pool-prod-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.04);
      }
    }

    .bm-pool-prod-badge {
      position: absolute;
      top: 6px;
      left: 6px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: var(--bm-radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .bm-pool-prod-info {
      padding: 8px 10px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .bm-pool-prod-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;

      &:hover {
        color: var(--bm-color-primary);
      }
    }

    .bm-pool-prod-price-box {
      display: flex;
      align-items: baseline;
      gap: 3px;
    }

    .bm-pool-prod-price {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-pool-prod-unit {
      font-size: 10px;
      color: var(--bm-color-text-muted);
    }

    .bm-pool-prod-add-btn {
      margin-top: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 28px;
      background-color: var(--bm-color-primary);
      color: #fff;
      border: none;
      border-radius: var(--bm-radius-sm);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }
    }

    .bm-pool-prod-skeleton-img {
      width: 100%;
      aspect-ratio: 4 / 3;
    }

    .bm-empty-text {
      font-size: 12px;
      color: var(--bm-color-text-muted);
      margin: 0;
      padding: 8px 0;
    }

    .bm-explainer-card {
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-primary-border);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bm-explainer-head {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm-explainer-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-explainer-text {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.5;
    }

    /* Eligible Cart Items Supporting Pool Card */
    .bm-eligible-cart-card {
      background: linear-gradient(135deg, rgba(23, 107, 80, 0.05) 0%, rgba(34, 197, 94, 0.08) 100%);
      border: 1.5px solid var(--bm-color-primary-border);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-eligible-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }

    .bm-eligible-title-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bm-eligible-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 700;
      color: var(--bm-color-primary);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .bm-eligible-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      margin: 0;
      line-height: 1.3;
    }

    .bm-eligible-total {
      font-size: 16px;
      font-weight: 800;
      color: var(--bm-color-primary);
      white-space: nowrap;
    }

    .bm-eligible-desc {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
      margin: 0;
    }

    .bm-eligible-items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      padding: 8px 10px;
    }

    .bm-eligible-item-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bm-eligible-thumb-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--bm-radius-md);
      overflow: hidden;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border-subtle);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bm-eligible-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-eligible-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-eligible-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-eligible-price-line {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .bm-eligible-qty {
      font-weight: 600;
      color: var(--bm-color-text-secondary);
      background-color: var(--bm-color-surface-subtle);
      padding: 1px 6px;
      border-radius: var(--bm-radius-sm);
      font-size: 11px;
    }

    .bm-eligible-price {
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-card-join-pool-btn {
      height: 44px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      border: none;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(23, 107, 80, 0.25);
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }

    .bm-joined-card {
      border-color: var(--bm-color-success-border);
      background-color: var(--bm-color-success-bg);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-joined-head {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bm-joined-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-success);
    }

    .bm-joined-val {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-btn-withdraw {
      align-self: flex-start;
      font-size: 12px;
      color: var(--bm-color-danger);
      background: none;
      font-weight: 600;
      text-decoration: underline;
    }

    // Sticky Action Bar
    .bm-sticky-action-bar {
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
      gap: 12px;
      z-index: 1000;
      box-shadow: var(--bm-shadow-sheet);
    }

    /* Sticky Action Bar Supporting Cart Items */
    .bm-action-cart-summary {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .bm-cart-item-icons-row {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .bm-mini-item-icon-box {
      width: 34px;
      height: 34px;
      border-radius: var(--bm-radius-sm);
      overflow: hidden;
      border: 1.5px solid var(--bm-color-surface);
      background-color: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-left: -8px;

      &:first-child {
        margin-left: 0;
      }
    }

    .bm-mini-item-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-mini-more-chip {
      width: 26px;
      height: 26px;
      border-radius: var(--bm-radius-full);
      background-color: var(--bm-color-surface-subtle);
      border: 1.5px solid var(--bm-color-surface);
      font-size: 10px;
      font-weight: 700;
      color: var(--bm-color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: -6px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    }

    .bm-action-text-col {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .bm-action-info {
      display: flex;
      flex-direction: column;
    }

    .bm-store-cart-summary {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-ready-hint {
      font-size: 11px;
      color: var(--bm-color-primary);
    }

    .bm-cart-empty-text {
      font-size: 12px;
      color: var(--bm-color-text-muted);
    }

    .bm-btn-join {
      height: 42px;
      padding: 0 16px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }
    }

    .bm-btn-browse {
      height: 42px;
      padding: 0 14px;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      color: var(--bm-color-text-primary);
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
    }

    .bm-participation-confirmed {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      width: 100%;
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-success);
    }

    .bm-part-meta-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .bm-btn-view-submitted {
      padding: 6px 12px;
      background-color: var(--bm-color-primary);
      color: #fff;
      border-radius: var(--bm-radius-md);
      font-size: 11px;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }
    }

    .bm-pool-detail-skeleton-wrap {
      display: flex;
      flex-direction: column;
      pointer-events: none;
    }

    .bm-pool-header-card.is-skeleton,
    .bm-store-info-card.is-skeleton,
    .bm-pool-cart-card.is-skeleton {
      pointer-events: none;
    }

    .bm-bottom-action-bar.is-skeleton {
      pointer-events: none;
    }
  `],
})
export class PoolDetailPageComponent implements OnInit {
  private readonly poolService = inject(PoolService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly vehiclePlaceholder = VEHICLE_PLACEHOLDER_SVG;
  readonly StoreIcon = Store;
  readonly SparklesIcon = Sparkles;
  readonly HelpCircleIcon = HelpCircle;
  readonly CheckCircleIcon = CheckCircle2;
  readonly CarIcon = Car;
  readonly ChevronRightIcon = ChevronRight;
  readonly PlusIcon = Plus;

  readonly pool = signal<PoolRecord | null>(null);
  readonly myParticipation = signal<PoolParticipationRecord | null>(null);
  readonly poolProducts = signal<ProductRecord[]>([]);
  readonly isLoadingPoolProducts = signal<boolean>(false);

  // Reactive matching store cart from CartService
  readonly matchingStoreCart = computed(() => {
    const p = this.pool();
    if (!p) return null;
    return this.cartService.getStoreCart(p.storeId) || null;
  });

  // Items from matching store cart that support this pool
  readonly poolEligibleItems = computed(() => {
    const p = this.pool();
    const cart = this.matchingStoreCart();
    if (!p || !cart || !cart.items || cart.items.length === 0) return [];

    if (p.productIds && p.productIds.length > 0) {
      return cart.items.filter((item) => p.productIds.includes(item.productId));
    }
    return cart.items;
  });

  // Total value of eligible items in the cart
  readonly eligibleTotalValue = computed(() => {
    return this.poolEligibleItems().reduce(
      (sum, item) => sum + (item.itemSubtotal || (item.currentPrice || item.priceAtAddition) * item.quantity),
      0,
    );
  });

  readonly isLoading = signal<boolean>(true);
  readonly isParticipating = signal<boolean>(false);
  readonly isWithdrawing = signal<boolean>(false);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const poolId = params['poolId'];
      if (poolId) {
        this.loadPool(poolId);
      }
    });
  }

  loadPool(poolId: string): void {
    this.isLoading.set(true);
    this.poolService.getPoolById(poolId).subscribe({
      next: (p) => {
        if (p) {
          this.pool.set(p);
          this.loadPoolProducts(p);

          // If logged in, fetch participation
          if (this.auth.isAuthenticated()) {
            this.poolService.getMyParticipation(poolId).subscribe({
              next: (part) => this.myParticipation.set(part),
            });
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadPoolProducts(pool: PoolRecord): void {
    if (!pool.storeId) return;
    this.isLoadingPoolProducts.set(true);
    this.productService.getProducts({ storeId: pool.storeId, limit: 30, ignoreLocation: true }).subscribe({
      next: (res) => {
        const all = res?.products || [];
        if (pool.productIds && pool.productIds.length > 0) {
          const matched = all.filter((prod) => pool.productIds.includes(prod.id));
          this.poolProducts.set(matched.length > 0 ? matched : all.slice(0, 6));
        } else {
          this.poolProducts.set(all.slice(0, 6));
        }
        this.isLoadingPoolProducts.set(false);
      },
      error: () => {
        this.isLoadingPoolProducts.set(false);
      },
    });
  }

  addProductToCart(prod: ProductRecord): void {
    this.cartService.addItem(prod.id, 1, prod).subscribe({
      next: () => {
        const p = this.pool();
        if (p?.storeId) {
          // ensure cart data updates reactively
          this.cartService.loadCarts().subscribe();
        }
      },
    });
  }

  participate(poolId: string, cartId: string): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Please sign in to join this group pool.');
      return;
    }

    this.isParticipating.set(true);
    this.poolService.participateInPool(poolId, cartId).subscribe({
      next: (res) => {
        this.isParticipating.set(false);
        this.toast.success(res.message || 'Cart submitted to pool successfully!');
        this.loadPool(poolId);
        this.cartService.loadCarts().subscribe();
      },
      error: (err) => {
        this.isParticipating.set(false);
        this.toast.error(err.message || 'Failed to submit cart to pool.');
      },
    });
  }

  withdrawParticipation(poolId: string): void {
    this.isWithdrawing.set(true);
    this.poolService.withdrawParticipation(poolId).subscribe({
      next: (res) => {
        this.isWithdrawing.set(false);
        this.toast.info(res.message || 'Withdrawn from pool.');
        this.loadPool(poolId);
      },
      error: (err) => {
        this.isWithdrawing.set(false);
        this.toast.error(err.message || 'Could not withdraw from pool.');
      },
    });
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
