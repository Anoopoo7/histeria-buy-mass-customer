import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Package,
  Sparkles,
  Store,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { OrderRecord, OrderStatus } from '../../../../core/models/order.model';
import { OrderService } from '../../../../core/services/order.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-orders-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-orders-view">
      <!-- Header -->
      <div class="bm-orders-head">
        <h1 class="bm-orders-title">{{ t('orders_title') }}</h1>
        <span class="bm-orders-badge">{{ orders().length }}</span>
      </div>

      <!-- Pool Submissions Link Pill -->
      <a [routerLink]="['/cart']" [queryParams]="{ tab: 'submitted' }" class="bm-pool-sub-banner">
        <div class="bm-pool-sub-left">
          <lucide-icon [img]="SparklesIcon" [size]="15" class="text-primary"></lucide-icon>
          <span>Have a vehicle committed to a pool? View Pool-Submitted Vehicles</span>
        </div>
        <lucide-icon [img]="ChevronRightIcon" [size]="14" class="text-muted"></lucide-icon>
      </a>

      <!-- Status Filter Tabs -->
      <div class="bm-status-tabs hide-scroll">
        <button
          type="button"
          class="bm-status-tab"
          [class.is-active]="selectedStatus() === 'ALL'"
          (click)="setStatusFilter('ALL')"
        >
          All
        </button>
        <button
          type="button"
          class="bm-status-tab"
          [class.is-active]="selectedStatus() === 'READY_FOR_PICKUP'"
          (click)="setStatusFilter('READY_FOR_PICKUP')"
        >
          Ready for Pickup
        </button>
        <button
          type="button"
          class="bm-status-tab"
          [class.is-active]="selectedStatus() === 'CONFIRMED'"
          (click)="setStatusFilter('CONFIRMED')"
        >
          Confirmed
        </button>
        <button
          type="button"
          class="bm-status-tab"
          [class.is-active]="selectedStatus() === 'COMPLETED'"
          (click)="setStatusFilter('COMPLETED')"
        >
          Completed
        </button>
      </div>

      <!-- Orders List -->
      @if (isLoading()) {
        <div class="bm-orders-list">
          @for (i of [1, 2, 3]; track i) {
            <div class="bm-order-card is-skeleton">
              <div class="bm-order-head">
                <div>
                  <div class="bm-skeleton bm-skeleton-title" style="width: 110px; height: 16px; margin-bottom: 4px;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 80px;"></div>
                </div>
                <div class="bm-skeleton" style="width: 70px; height: 22px; border-radius: var(--bm-radius-full);"></div>
              </div>

              <div class="bm-order-store">
                <div class="bm-skeleton bm-skeleton-circle" style="width: 14px; height: 14px;"></div>
                <div class="bm-skeleton bm-skeleton-text" style="width: 140px;"></div>
              </div>

              <div class="bm-order-items">
                <div class="bm-order-item-line">
                  <div class="bm-skeleton bm-skeleton-text" style="width: 60%;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 60px;"></div>
                </div>
              </div>

              <div class="bm-order-foot">
                <div class="bm-skeleton bm-skeleton-title" style="width: 90px; height: 18px;"></div>
                <div class="bm-skeleton bm-skeleton-text" style="width: 50px;"></div>
              </div>
            </div>
          }
        </div>
      } @else if (filteredOrders().length > 0) {
        <div class="bm-orders-list">
          @for (order of filteredOrders(); track order.id) {
            <a [routerLink]="['/orders', order.id]" class="bm-order-card">
              <!-- Card Header -->
              <div class="bm-card-top">
                <div class="bm-order-num-group">
                  <span class="bm-order-number">{{ order.orderNumber }}</span>
                  <span class="bm-order-date">{{ formatDate(order.placedAt) }}</span>
                </div>
                <span class="bm-status-pill" [ngClass]="'is-' + order.status.toLowerCase()">
                  {{ formatStatus(order.status) }}
                </span>
              </div>

              <!-- Store & Items Info -->
              <div class="bm-order-body">
                <div class="bm-store-line">
                  <lucide-icon [img]="StoreIcon" [size]="14" class="text-primary"></lucide-icon>
                  <span class="bm-store-name">{{ order.storeName || 'Authorized Dealership' }}</span>
                </div>

                <div class="bm-items-summary">
                  <span class="bm-items-count">{{ order.items.length }} {{ order.items.length === 1 ? 'vehicle' : 'vehicles' }}</span>
                  @if (order.items.length > 0) {
                    <span class="bm-items-preview">
                      ({{ order.items[0].productName }}{{ order.items.length > 1 ? ' +' + (order.items.length - 1) + ' more' : '' }})
                    </span>
                  }
                </div>
              </div>

              <!-- Card Footer: Total & CTA -->
              <div class="bm-card-bottom">
                <div class="bm-amount-box">
                  <span class="bm-amount-label">Payable Amount</span>
                  <span class="bm-amount-val">₹{{ (order.finalAmount || order.regularTotal) | number }}</span>
                </div>

                <div class="bm-cta-line">
                  <span>{{ t('order_view_details') }}</span>
                  <lucide-icon [img]="ChevronRightIcon" [size]="14"></lucide-icon>
                </div>
              </div>
            </a>
          }
        </div>
      } @else {
        <div class="bm-orders-empty">
          <lucide-icon [img]="PackageIcon" [size]="40" class="text-muted"></lucide-icon>
          <h3>{{ t('orders_empty') }}</h3>
          <p>Join vehicle group buying pools to unlock fleet discounts on cars and bikes.</p>
          <a routerLink="/pools" class="bm-btn-discover">Discover Vehicle Deals</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-orders-view {
      padding: 14px 14px 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bm-orders-head {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bm-pool-sub-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 12px;
      background-color: rgba(23, 107, 80, 0.08);
      border: 1px solid rgba(23, 107, 80, 0.2);
      border-radius: var(--bm-radius-md);
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-primary);
      text-decoration: none;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: rgba(23, 107, 80, 0.14);
      }
    }

    .bm-pool-sub-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bm-orders-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--bm-color-text-primary);
      letter-spacing: -0.4px;
    }

    .bm-orders-badge {
      font-size: 11px;
      font-weight: 700;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      color: var(--bm-color-text-secondary);
      padding: 2px 7px;
      border-radius: var(--bm-radius-full);
    }

    .bm-status-tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .bm-status-tab {
      flex-shrink: 0;
      padding: 6px 12px;
      border-radius: var(--bm-radius-full);
      border: 1px solid var(--bm-color-border);
      background-color: var(--bm-color-surface);
      color: var(--bm-color-text-secondary);
      font-size: 12px;
      font-weight: 500;

      &.is-active {
        background-color: var(--bm-color-primary);
        color: #fff;
        border-color: var(--bm-color-primary);
        font-weight: 600;
      }
    }

    .bm-orders-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-order-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: var(--bm-shadow-xs);
      transition: border-color 0.15s ease;

      &:active {
        border-color: var(--bm-color-primary-border);
      }
    }

    .bm-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .bm-order-num-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-order-number {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-order-date {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-status-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--bm-radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.3px;

      &.is-placed {
        background-color: var(--bm-color-info-bg);
        color: var(--bm-color-info);
      }

      &.is-confirmed {
        background-color: var(--bm-color-primary-soft);
        color: var(--bm-color-primary);
      }

      &.is-ready_for_pickup {
        background-color: var(--bm-color-warning-bg);
        color: var(--bm-color-warning);
        border: 1px solid var(--bm-color-warning-border);
      }

      &.is-completed {
        background-color: var(--bm-color-success-bg);
        color: var(--bm-color-success);
      }

      &.is-cancelled {
        background-color: var(--bm-color-danger-bg);
        color: var(--bm-color-danger);
      }
    }

    .bm-order-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 0;
      border-top: 1px solid var(--bm-color-border-subtle);
      border-bottom: 1px solid var(--bm-color-border-subtle);
    }

    .bm-store-line {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm-store-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
    }

    .bm-items-summary {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-items-count {
      font-weight: 600;
    }

    .bm-items-preview {
      color: var(--bm-color-text-muted);
      margin-left: 4px;
    }

    .bm-card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bm-amount-box {
      display: flex;
      flex-direction: column;
    }

    .bm-amount-label {
      font-size: 10px;
      color: var(--bm-color-text-muted);
      text-transform: uppercase;
    }

    .bm-amount-val {
      font-size: 15px;
      font-weight: 800;
      color: var(--bm-color-text-primary);
    }

    .bm-cta-line {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-primary);
    }

    .bm-orders-empty {
      padding: 48px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      background-color: var(--bm-color-surface);
      border: 1px dashed var(--bm-color-border);
      border-radius: var(--bm-radius-lg);

      h3 {
        font-size: 16px;
        color: var(--bm-color-text-primary);
      }

      p {
        font-size: 13px;
        color: var(--bm-color-text-secondary);
        max-width: 280px;
      }
    }

    .bm-btn-discover {
      margin-top: 6px;
      padding: 10px 18px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
    }

    .bm-order-card.is-skeleton {
      pointer-events: none;
    }
  `],
})
export class OrdersPageComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly i18n = inject(TranslationService);

  readonly StoreIcon = Store;
  readonly ChevronRightIcon = ChevronRight;
  readonly PackageIcon = Package;
  readonly SparklesIcon = Sparkles;

  readonly orders = signal<OrderRecord[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly selectedStatus = signal<string>('ALL');

  ngOnInit(): void {
    this.orderService.getOrders({ limit: 40 }).subscribe({
      next: (res) => {
        this.orders.set(res.orders);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setStatusFilter(status: string): void {
    this.selectedStatus.set(status);
  }

  filteredOrders(): OrderRecord[] {
    const list = this.orders();
    if (this.selectedStatus() === 'ALL') return list;
    return list.filter((o) => o.status === this.selectedStatus());
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
