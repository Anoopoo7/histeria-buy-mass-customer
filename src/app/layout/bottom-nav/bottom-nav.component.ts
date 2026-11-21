import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Car, Compass, Home, LucideAngularModule, Sparkles, User } from 'lucide-angular';
import { CartService } from '../../core/services/cart.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'bm-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <nav class="bm-bottom-nav" aria-label="Bottom Navigation">
      <div class="bm-bottom-nav-inner">
        <!-- Home -->
        <a
          routerLink="/home"
          routerLinkActive="is-active"
          class="bm-nav-item"
          aria-label="Home"
        >
          <div class="bm-nav-icon-wrap">
            <lucide-icon [img]="HomeIcon" [size]="20"></lucide-icon>
          </div>
          <span class="bm-nav-label">{{ t('nav_home') }}</span>
        </a>

        <!-- Explore -->
        <a
          routerLink="/explore"
          routerLinkActive="is-active"
          class="bm-nav-item"
          aria-label="Explore"
        >
          <div class="bm-nav-icon-wrap">
            <lucide-icon [img]="CompassIcon" [size]="20"></lucide-icon>
          </div>
          <span class="bm-nav-label">{{ t('nav_explore') }}</span>
        </a>

        <!-- Pools -->
        <a
          routerLink="/pools"
          routerLinkActive="is-active"
          class="bm-nav-item"
          aria-label="Group Deals"
        >
          <div class="bm-nav-icon-wrap">
            <lucide-icon [img]="SparklesIcon" [size]="20"></lucide-icon>
          </div>
          <span class="bm-nav-label">{{ t('nav_pools') }}</span>
        </a>

        <!-- Cart with count badge -->
        <a
          routerLink="/cart"
          routerLinkActive="is-active"
          class="bm-nav-item bm-cart-item"
          aria-label="Cart"
        >
          <div class="bm-nav-icon-wrap">
            <lucide-icon [img]="CarIcon" [size]="20"></lucide-icon>
            @if (cartCount() > 0) {
              <span class="bm-cart-badge">{{ cartCount() > 99 ? '99+' : cartCount() }}</span>
            }
          </div>
          <span class="bm-nav-label">{{ t('nav_cart') }}</span>
        </a>

        <!-- Account -->
        <a
          routerLink="/profile"
          routerLinkActive="is-active"
          class="bm-nav-item"
          aria-label="Account"
        >
          <div class="bm-nav-icon-wrap">
            <lucide-icon [img]="UserIcon" [size]="20"></lucide-icon>
          </div>
          <span class="bm-nav-label">{{ t('nav_account') }}</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .bm-bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: calc(var(--bm-bottom-nav-height) + var(--bm-safe-bottom));
      padding-bottom: var(--bm-safe-bottom);
      background-color: var(--bm-color-surface);
      border-top: 1px solid var(--bm-color-border);
      z-index: 1000;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.04);
    }

    .bm-bottom-nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: var(--bm-bottom-nav-height);
      max-width: var(--bm-max-mobile-width);
      margin: 0 auto;
      padding: 0 4px;
    }

    .bm-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      height: 100%;
      color: var(--bm-color-text-secondary);
      transition: color 0.15s ease, transform 0.1s ease;
      position: relative;
      user-select: none;

      &:active {
        transform: scale(0.96);
      }

      &.is-active {
        color: var(--bm-color-primary);

        .bm-nav-icon-wrap {
          color: var(--bm-color-primary);
        }

        .bm-nav-label {
          font-weight: 600;
          color: var(--bm-color-primary);
        }
      }
    }

    .bm-nav-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 26px;
    }

    .bm-nav-label {
      font-size: 11px;
      margin-top: 2px;
      letter-spacing: -0.2px;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      text-align: center;
    }

    .bm-cart-badge {
      position: absolute;
      top: -3px;
      right: -8px;
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
  `],
})
export class BottomNavComponent {
  private readonly cartService = inject(CartService);
  private readonly i18n = inject(TranslationService);

  readonly HomeIcon = Home;
  readonly CompassIcon = Compass;
  readonly SparklesIcon = Sparkles;
  readonly CarIcon = Car;
  readonly UserIcon = User;

  readonly cartCount = this.cartService.totalItemCount;

  t(key: string): string {
    return this.i18n.t(key);
  }
}
