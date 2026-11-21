import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Car, Check, LucideAngularModule, X } from 'lucide-angular';
import { CartModalService } from '../../../core/services/cart-modal.service';
import { VEHICLE_PLACEHOLDER_SVG } from '../../../core/utils/image.utils';

@Component({
  selector: 'bm-added-to-cart-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    @if (modal.isOpen() && modal.data(); as item) {
      <div class="bm-modal-backdrop" (click)="close()">
        <div class="bm-modal-dialog" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="bm-modal-header">
            <div class="bm-modal-success-badge">
              <div class="bm-modal-check-circle">
                <lucide-icon [img]="CheckIcon" [size]="15"></lucide-icon>
              </div>
              <div class="bm-modal-title-wrap">
                <h3 class="bm-modal-title">Added to Cart!</h3>
                <span class="bm-modal-sub">Ready in your booking list</span>
              </div>
            </div>
            <button
              type="button"
              class="bm-modal-close-btn"
              (click)="close()"
              aria-label="Close"
            >
              <lucide-icon [img]="CloseIcon" [size]="18"></lucide-icon>
            </button>
          </div>

          <!-- Product Info Snippet -->
          <div class="bm-modal-product-card">
            <div class="bm-modal-prod-img-box">
              <img
                [src]="item.image || vehiclePlaceholder"
                [alt]="item.name"
                class="bm-modal-prod-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="bm-modal-prod-details">
              <h4 class="bm-modal-prod-name">{{ item.name }}</h4>
              @if (item.storeName) {
                <span class="bm-modal-prod-dealer">{{ item.storeName }}</span>
              }
              @if (item.brand || item.category) {
                <span class="bm-modal-prod-cat">
                  {{ item.brand ? item.brand + ' • ' : '' }}{{ item.category || '' }}
                </span>
              }
              <div class="bm-modal-price-line">
                <span class="bm-modal-unit-price">₹{{ item.price | number }}</span>
                <span class="bm-modal-qty-chip">Qty: {{ item.quantity }}</span>
              </div>
            </div>
          </div>

          <!-- Subtotal Banner -->
          <div class="bm-modal-total-banner">
            <span class="bm-modal-total-label">Subtotal ({{ item.quantity }} vehicle{{ item.quantity > 1 ? 's' : '' }}):</span>
            <span class="bm-modal-total-val">₹{{ (item.price * item.quantity) | number }}</span>
          </div>

          <!-- 2 Buttons: Continue Shopping & Book Now -->
          <div class="bm-modal-actions">
            <button
              type="button"
              class="bm-modal-btn-secondary"
              (click)="close()"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              class="bm-modal-btn-primary"
              (click)="goToCart()"
            >
              <lucide-icon [img]="CarIcon" [size]="16"></lucide-icon>
              <span>Book Now</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .bm-modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.65);
      z-index: 1100;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      backdrop-filter: blur(2px);
      animation: bmFadeIn 0.2s ease;
    }

    .bm-modal-dialog {
      width: 100%;
      max-width: var(--bm-max-mobile-width);
      background-color: var(--bm-color-surface);
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 18px 16px calc(18px + var(--bm-safe-bottom));
      box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.16);
      animation: bmSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bm-modal-success-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bm-modal-check-circle {
      width: 32px;
      height: 32px;
      border-radius: var(--bm-radius-full);
      background-color: #dcfce7;
      color: #15803d;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .bm-modal-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .bm-modal-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      margin: 0;
    }

    .bm-modal-sub {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-modal-close-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--bm-radius-full);
      border: none;
      background-color: var(--bm-color-surface-subtle);
      color: var(--bm-color-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-border);
      }
    }

    .bm-modal-product-card {
      display: flex;
      gap: 12px;
      padding: 10px 12px;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      align-items: center;
    }

    .bm-modal-prod-img-box {
      width: 64px;
      height: 64px;
      border-radius: var(--bm-radius-md);
      overflow: hidden;
      background-color: #fff;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--bm-color-border-subtle);
    }

    .bm-modal-prod-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-modal-prod-details {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-modal-prod-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
    }

    .bm-modal-prod-dealer {
      font-size: 11px;
      color: var(--bm-color-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-modal-prod-cat {
      font-size: 10.5px;
      color: var(--bm-color-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-modal-price-line {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }

    .bm-modal-unit-price {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-modal-qty-chip {
      font-size: 10.5px;
      font-weight: 600;
      background-color: rgba(0, 0, 0, 0.06);
      color: var(--bm-color-text-secondary);
      padding: 1px 6px;
      border-radius: var(--bm-radius-sm);
    }

    .bm-modal-total-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: var(--bm-color-primary-soft);
      border: 1px solid var(--bm-color-primary-border);
      border-radius: var(--bm-radius-md);
      font-size: 12.5px;
    }

    .bm-modal-total-label {
      color: var(--bm-color-text-secondary);
      font-weight: 500;
    }

    .bm-modal-total-val {
      font-weight: 700;
      color: var(--bm-color-primary);
      font-size: 14px;
    }

    .bm-modal-actions {
      display: flex;
      gap: 10px;
      width: 100%;
      margin-top: 2px;
    }

    .bm-modal-btn-secondary {
      flex: 1;
      height: 44px;
      background-color: var(--bm-color-surface);
      border: 1.5px solid var(--bm-color-border);
      color: var(--bm-color-text-primary);
      font-size: 13.5px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      white-space: nowrap;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-surface-subtle);
      }
    }

    .bm-modal-btn-primary {
      flex: 1.2;
      height: 44px;
      background-color: var(--bm-color-primary);
      border: none;
      color: #fff;
      font-size: 13.5px;
      font-weight: 600;
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
    }

    @keyframes bmSlideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    @keyframes bmFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `],
})
export class AddedToCartModalComponent {
  readonly modal = inject(CartModalService);
  private readonly router = inject(Router);

  readonly CheckIcon = Check;
  readonly CloseIcon = X;
  readonly CarIcon = Car;
  readonly vehiclePlaceholder = VEHICLE_PLACEHOLDER_SVG;

  close(): void {
    this.modal.close();
  }

  goToCart(): void {
    this.modal.close();
    this.router.navigate(['/cart']);
  }
}
