import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  LucideAngularModule,
  Share2,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from 'lucide-angular';
import { FormattedCart } from '../../../../core/models/cart.model';
import { PoolParticipationRecord, PoolRecord } from '../../../../core/models/pool.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { PoolService } from '../../../../core/services/pool.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { CountdownTimerComponent } from '../../../../shared/ui/countdown-timer/countdown-timer.component';
import { PoolProgressComponent } from '../../../../shared/ui/pool-progress/pool-progress.component';

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
            [src]="p.primaryImageUrl || '/favicon.ico'"
            [alt]="p.title"
            class="bm-campaign-img"
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

          <!-- Customer Participation State -->
          @if (myParticipation(); as part) {
            <div class="bm-card bm-joined-card">
              <div class="bm-joined-head">
                <lucide-icon [img]="CheckCircleIcon" [size]="20" class="text-success"></lucide-icon>
                <div>
                  <h4 class="bm-joined-title">{{ t('pool_already_joined') }}</h4>
                  <p class="bm-joined-val">Eligible Cart Value: ₹{{ part.eligibleCartValue }}</p>
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
        </div>

        <!-- Sticky Participation Action Bar -->
        <div class="bm-sticky-action-bar">
          @if (!myParticipation()) {
            @if (matchingStoreCart(); as storeCart) {
              @if (storeCart.items.length > 0) {
                <div class="bm-action-info">
                  <span class="bm-store-cart-summary">
                    Store Cart: {{ storeCart.itemCount }} items (₹{{ storeCart.cartTotal }})
                  </span>
                  <span class="bm-ready-hint">Ready to commit to this pool</span>
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
                  <span class="bm-cart-empty-text">Your store cart is empty</span>
                </div>
                <a [routerLink]="['/stores', p.storeId]" class="bm-btn-browse">
                  <span>Browse Store Products</span>
                </a>
              }
            } @else {
              <div class="bm-action-info">
                <span class="bm-cart-empty-text">Add store products to join</span>
              </div>
              <a [routerLink]="['/stores', p.storeId]" class="bm-btn-browse">
                <span>Browse Store Products</span>
              </a>
            }
          } @else {
            <div class="bm-participation-confirmed">
              <lucide-icon [img]="CheckCircleIcon" [size]="18" class="text-success"></lucide-icon>
              <span>Participation active. Final discount applies upon campaign close!</span>
            </div>
          }
        </div>
      } @else if (isLoading()) {
        <div class="bm-loading-box">
          <div class="bm-detail-skeleton bm-skeleton"></div>
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
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-success);
    }

    .bm-detail-skeleton {
      height: 300px;
      border-radius: var(--bm-radius-lg);
      margin: 14px;
    }
  `],
})
export class PoolDetailPageComponent implements OnInit {
  private readonly poolService = inject(PoolService);
  private readonly cartService = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly StoreIcon = Store;
  readonly SparklesIcon = Sparkles;
  readonly HelpCircleIcon = HelpCircle;
  readonly CheckCircleIcon = CheckCircle2;

  readonly pool = signal<PoolRecord | null>(null);
  readonly myParticipation = signal<PoolParticipationRecord | null>(null);
  readonly matchingStoreCart = signal<FormattedCart | null>(null);

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

          // Find store cart matching this pool's store
          const storeCart = this.cartService.getStoreCart(p.storeId);
          this.matchingStoreCart.set(storeCart || null);

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
