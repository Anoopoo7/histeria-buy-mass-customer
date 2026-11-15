import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  LucideAngularModule,
  MapPin,
  MessageCircle,
  RotateCw,
  ShieldCheck,
  Store,
} from 'lucide-angular';
import { CustomerPickupInfo, OrderRecord, OrderStatus } from '../../../../core/models/order.model';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-order-detail-view">
      <!-- Top Bar -->
      <div class="bm-top-bar">
        <a routerLink="/orders" class="bm-back-btn" aria-label="Back to orders">
          <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
        </a>
        <h1 class="bm-top-title">Order Details</h1>
      </div>

      @if (order(); as o) {
        <div class="bm-detail-content">
          <!-- Order Header Card -->
          <div class="bm-card bm-order-hero">
            <div class="bm-hero-top">
              <div>
                <span class="bm-order-num-label">Order Number</span>
                <h2 class="bm-hero-order-num">{{ o.orderNumber }}</h2>
              </div>
              <span class="bm-hero-status-badge" [ngClass]="'is-' + o.status.toLowerCase()">
                {{ formatStatus(o.status) }}
              </span>
            </div>
            <span class="bm-hero-date">Placed on {{ formatDate(o.placedAt) }}</span>
          </div>

          <!-- Store Pickup OTP Verification Card (Phase 8 Guidance) -->
          <div class="bm-card bm-pickup-guidance-card">
            <div class="bm-pickup-head">
              <lucide-icon [img]="ShieldCheckIcon" [size]="22" class="text-primary"></lucide-icon>
              <div>
                <h3 class="bm-pickup-heading">{{ t('order_pickup_otp_title') }}</h3>
                <span class="bm-pickup-sub">WhatsApp Delivered Verification</span>
              </div>
            </div>

            <p class="bm-pickup-text">{{ t('order_pickup_otp_desc') }}</p>

            <!-- Store Instructions from GET /pickup -->
            @if (pickupInfo(); as pInfo) {
              @if (pInfo.instructions) {
                <div class="bm-instructions-box">
                  <span class="bm-instructions-title">Store Instructions:</span>
                  <p class="bm-instructions-content">{{ pInfo.instructions }}</p>
                </div>
              }
            }

            <!-- Resend OTP via WhatsApp Button with Cooldown -->
            <div class="bm-resend-row">
              <button
                type="button"
                class="bm-btn-resend-otp"
                [disabled]="isResending() || cooldownSeconds() > 0"
                (click)="resendOtp(o.id)"
              >
                <lucide-icon
                  [img]="RotateCwIcon"
                  [size]="14"
                  [class.bm-spin]="isResending()"
                ></lucide-icon>
                <span>
                  {{
                    cooldownSeconds() > 0
                      ? t('order_resend_cooldown', { seconds: cooldownSeconds() })
                      : t('order_resend_otp')
                  }}
                </span>
              </button>
            </div>
          </div>

          <!-- Pickup Location -->
          <div class="bm-card bm-store-loc-card">
            <div class="bm-loc-card-head">
              <lucide-icon [img]="StoreIcon" [size]="18" class="text-primary"></lucide-icon>
              <h3 class="bm-loc-card-title">{{ o.storeName || 'Partner Store' }}</h3>
            </div>
            <div class="bm-loc-address">
              <lucide-icon [img]="MapPinIcon" [size]="14" class="text-muted"></lucide-icon>
              <span>{{ pickupInfo()?.storeAddress || 'Store Pickup Location • Kerala, India' }}</span>
            </div>
          </div>

          <!-- Ordered Items List -->
          <div class="bm-card bm-items-card">
            <h3 class="bm-card-title">Order Items ({{ o.items.length }})</h3>
            <div class="bm-order-items-list">
              @for (item of o.items; track item.productId) {
                <div class="bm-order-item-row">
                  <div class="bm-item-info">
                    <span class="bm-item-qty">{{ item.quantity }}x</span>
                    <span class="bm-item-name">{{ item.productName }}</span>
                  </div>
                  <div class="bm-item-pricing">
                    <span class="bm-item-price">₹{{ item.discountedSubtotal || item.regularSubtotal }}</span>
                    @if (item.discountedSubtotal && item.discountedSubtotal < item.regularSubtotal) {
                      <span class="bm-item-orig">₹{{ item.regularSubtotal }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Payment Breakdown -->
          <div class="bm-card bm-bill-card">
            <h3 class="bm-card-title">Payment Summary</h3>

            <div class="bm-bill-row">
              <span class="bm-bill-label">Items Subtotal</span>
              <span class="bm-bill-val">₹{{ o.regularTotal }}</span>
            </div>

            @if (o.discountAmount > 0) {
              <div class="bm-bill-row">
                <span class="bm-bill-label text-success">
                  Group Discount ({{ o.discountPercentage }}%)
                </span>
                <span class="bm-bill-val text-success">-₹{{ o.discountAmount }}</span>
              </div>
            }

            <div class="bm-bill-row">
              <span class="bm-bill-label">Store Pickup</span>
              <span class="bm-bill-val text-success">FREE</span>
            </div>

            <div class="bm-bill-divider"></div>

            <div class="bm-bill-row is-total">
              <span class="bm-total-label">Total Payable at Collection</span>
              <span class="bm-total-val">₹{{ o.finalAmount || o.regularTotal }}</span>
            </div>
          </div>
        </div>
      } @else if (isLoading()) {
        <div class="bm-loading-box">
          <div class="bm-order-skeleton bm-skeleton"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-order-detail-view {
      padding-bottom: 40px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-top-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background-color: var(--bm-color-surface);
      border-bottom: 1px solid var(--bm-color-border);
    }

    .bm-back-btn {
      color: var(--bm-color-text-primary);
      display: flex;
      align-items: center;
    }

    .bm-top-title {
      font-size: 17px;
      font-weight: 700;
    }

    .bm-detail-content {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 14px;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-card-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      margin-bottom: 8px;
    }

    .bm-order-hero {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bm-hero-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .bm-order-num-label {
      font-size: 11px;
      color: var(--bm-color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .bm-hero-order-num {
      font-size: 18px;
      font-weight: 800;
      color: var(--bm-color-text-primary);
    }

    .bm-hero-date {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-hero-status-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--bm-radius-sm);
      text-transform: uppercase;

      &.is-ready_for_pickup {
        background-color: var(--bm-color-warning-bg);
        color: var(--bm-color-warning);
        border: 1px solid var(--bm-color-warning-border);
      }

      &.is-confirmed {
        background-color: var(--bm-color-primary-soft);
        color: var(--bm-color-primary);
      }

      &.is-completed {
        background-color: var(--bm-color-success-bg);
        color: var(--bm-color-success);
      }
    }

    // Pickup OTP Guidance Card
    .bm-pickup-guidance-card {
      background-color: var(--bm-color-surface-subtle);
      border-color: var(--bm-color-primary-border);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-pickup-head {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bm-pickup-heading {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-pickup-sub {
      font-size: 11px;
      color: var(--bm-color-text-secondary);
    }

    .bm-pickup-text {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.45;
    }

    .bm-instructions-box {
      background-color: var(--bm-color-surface);
      border: 1px dashed var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-instructions-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-instructions-content {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
    }

    .bm-resend-row {
      display: flex;
      margin-top: 2px;
    }

    .bm-btn-resend-otp {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-primary);
      color: var(--bm-color-primary);
      font-size: 12px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
      transition: all 0.15s ease;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .bm-store-loc-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bm-loc-card-head {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm-loc-card-title {
      font-size: 14px;
      font-weight: 700;
    }

    .bm-loc-address {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-order-items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-order-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
    }

    .bm-item-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bm-item-qty {
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-item-pricing {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .bm-item-price {
      font-weight: 700;
    }

    .bm-item-orig {
      font-size: 11px;
      color: var(--bm-color-text-muted);
      text-decoration: line-through;
    }

    .bm-bill-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-bill-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;

      &.is-total {
        font-size: 16px;
        font-weight: 800;
      }
    }

    .bm-bill-label {
      color: var(--bm-color-text-secondary);
    }

    .bm-bill-val {
      font-weight: 600;
    }

    .bm-bill-divider {
      height: 1px;
      background-color: var(--bm-color-border-subtle);
      margin: 4px 0;
    }

    .bm-total-label {
      color: var(--bm-color-text-primary);
    }

    .bm-total-val {
      color: var(--bm-color-primary);
    }

    .bm-order-skeleton {
      height: 260px;
      border-radius: var(--bm-radius-lg);
      margin: 14px;
    }

    .bm-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `],
})
export class OrderDetailPageComponent implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly StoreIcon = Store;
  readonly MapPinIcon = MapPin;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly RotateCwIcon = RotateCw;

  readonly order = signal<OrderRecord | null>(null);
  readonly pickupInfo = signal<CustomerPickupInfo | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly isResending = signal<boolean>(false);
  readonly cooldownSeconds = signal<number>(0);

  private cooldownTimer: any = null;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const orderId = params['orderId'];
      if (orderId) {
        this.loadOrder(orderId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
  }

  loadOrder(orderId: string): void {
    this.isLoading.set(true);
    this.orderService.getOrderById(orderId).subscribe({
      next: (ord) => {
        if (ord) {
          this.order.set(ord);
          this.orderService.getPickupInfo(orderId).subscribe({
            next: (p) => this.pickupInfo.set(p),
          });
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  resendOtp(orderId: string): void {
    this.isResending.set(true);
    this.orderService.resendPickupOtp(orderId).subscribe({
      next: (res) => {
        this.isResending.set(false);
        this.toast.success('Pickup OTP has been resent to your registered WhatsApp.');
        this.startCooldown(res.cooldownSeconds || 60);
      },
      error: (err) => {
        this.isResending.set(false);
        this.toast.error(err.message || 'Could not resend OTP. Please wait before retrying.');
      },
    });
  }

  private startCooldown(seconds: number): void {
    this.cooldownSeconds.set(seconds);
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      this.cooldownSeconds.update((s) => {
        if (s <= 1) {
          clearInterval(this.cooldownTimer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatStatus(status: OrderStatus): string {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return 'Ready for Pickup';
      case 'PLACED':
        return 'Placed';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
