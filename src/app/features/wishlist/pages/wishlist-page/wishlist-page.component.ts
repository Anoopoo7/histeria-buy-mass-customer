import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArrowLeft, Heart, LucideAngularModule, Plus, ShoppingBag } from 'lucide-angular';
import { ProductRecord } from '../../../../core/models/product.model';
import { CartService } from '../../../../core/services/cart.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-wishlist-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-wishlist-view">
      <div class="bm-top-bar">
        <a routerLink="/profile" class="bm-back-btn">
          <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
        </a>
        <h1 class="bm-top-title">{{ t('profile_wishlist') }}</h1>
      </div>

      @if (items().length > 0) {
        <div class="bm-wishlist-grid">
          @for (prod of items(); track prod.id) {
            <div class="bm-wishlist-card">
              <a [routerLink]="['/products', prod.id]" class="bm-link">
                <img [src]="prod.primaryImageUrl || '/favicon.ico'" [alt]="prod.name" class="bm-img" />
                <div class="bm-meta">
                  <h4 class="bm-name">{{ prod.name }}</h4>
                  <span class="bm-price">₹{{ prod.price }}</span>
                </div>
              </a>
              <button type="button" class="bm-add-cart-btn" (click)="addToCart(prod.id)">
                <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                <span>Add to Cart</span>
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="bm-empty-wishlist">
          <lucide-icon [img]="HeartIcon" [size]="36" class="text-muted"></lucide-icon>
          <h3>Your wishlist is empty</h3>
          <p>Explore deals and tap save to keep track of items you love.</p>
          <a routerLink="/explore" class="bm-btn-explore">Explore Deals</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-wishlist-view {
      padding-bottom: 30px;
      display: flex;
      flex-direction: column;
      gap: 14px;
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

    .bm-wishlist-grid {
      padding: 0 14px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .bm-wishlist-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .bm-link {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .bm-img {
      width: 100%;
      height: 110px;
      object-fit: cover;
    }

    .bm-meta {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-name {
      font-size: 12px;
      font-weight: 600;
      height: 30px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .bm-price {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-primary);
    }

    .bm-add-cart-btn {
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

    .bm-empty-wishlist {
      padding: 48px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      background-color: var(--bm-color-surface);
      border: 1px dashed var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      margin: 0 14px;

      h3 {
        font-size: 15px;
        color: var(--bm-color-text-primary);
      }

      p {
        font-size: 12px;
        color: var(--bm-color-text-secondary);
        max-width: 240px;
      }
    }

    .bm-btn-explore {
      margin-top: 6px;
      padding: 8px 16px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
    }
  `],
})
export class WishlistPageComponent {
  private readonly cartService = inject(CartService);
  private readonly i18n = inject(TranslationService);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly HeartIcon = Heart;
  readonly PlusIcon = Plus;

  readonly items = signal<ProductRecord[]>([]);

  addToCart(productId: string): void {
    const prod = this.items().find((p) => p.id === productId);
    this.cartService.addItem(productId, 1, prod || undefined).subscribe();
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
