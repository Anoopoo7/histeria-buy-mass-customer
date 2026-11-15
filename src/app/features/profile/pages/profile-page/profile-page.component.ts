import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Globe,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { LocationService } from '../../../../core/services/location.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-profile-view">
      <!-- Header -->
      <h1 class="bm-profile-heading">{{ t('profile_title') }}</h1>

      <!-- User Card or Guest Sign-in Banner -->
      @if (currentUser(); as user) {
        <div class="bm-card bm-user-card">
          <div class="bm-avatar-circle">
            <span class="bm-avatar-letter">{{ user.name.charAt(0).toUpperCase() }}</span>
          </div>

          <div class="bm-user-info">
            <div class="bm-user-name-line">
              <h2 class="bm-user-name">{{ user.name }}</h2>
              @if (user.isPhoneVerified) {
                <span class="bm-verified-tag">
                  <lucide-icon [img]="CheckCircleIcon" [size]="12"></lucide-icon>
                  <span>Verified</span>
                </span>
              }
            </div>
            <span class="bm-user-phone">{{ user.phone || 'No phone registered' }}</span>
            <span class="bm-user-email">{{ user.email }}</span>
          </div>
        </div>
      } @else {
        <div class="bm-card bm-guest-card">
          <div class="bm-guest-info">
            <h2 class="bm-guest-title">{{ t('profile_sign_in') }}</h2>
            <p class="bm-guest-desc">Sign in or create an account to track your orders, store carts, and group deals.</p>
          </div>
          <a routerLink="/auth/login" class="bm-btn-login">Sign In / Register</a>
        </div>
      }

      <!-- Language Selector Card (Malayalam & English) -->
      <div class="bm-card bm-lang-card">
        <div class="bm-lang-head">
          <div class="bm-lang-left">
            <lucide-icon [img]="GlobeIcon" [size]="18" class="text-primary"></lucide-icon>
            <span class="bm-lang-title">{{ t('profile_language') }}</span>
          </div>
          <span class="bm-lang-active">{{ currentLang() === 'ml' ? 'മലയാളം' : 'English' }}</span>
        </div>

        <div class="bm-lang-options">
          <button
            type="button"
            class="bm-lang-btn"
            [class.is-active]="currentLang() === 'ml'"
            (click)="setLang('ml')"
          >
            <span>മലയാളം (Malayalam)</span>
          </button>
          <button
            type="button"
            class="bm-lang-btn"
            [class.is-active]="currentLang() === 'en'"
            (click)="setLang('en')"
          >
            <span>English</span>
          </button>
        </div>
      </div>

      <!-- Navigation Links Menu -->
      <div class="bm-menu-group">
        <a routerLink="/orders" class="bm-menu-item">
          <div class="bm-menu-left">
            <lucide-icon [img]="PackageIcon" [size]="18" class="text-primary"></lucide-icon>
            <span class="bm-menu-label">{{ t('orders_title') }}</span>
          </div>
          <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-muted"></lucide-icon>
        </a>

        <a routerLink="/addresses" class="bm-menu-item">
          <div class="bm-menu-left">
            <lucide-icon [img]="MapPinIcon" [size]="18" class="text-primary"></lucide-icon>
            <span class="bm-menu-label">{{ t('profile_saved_locations') }}</span>
          </div>
          <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-muted"></lucide-icon>
        </a>

        <a routerLink="/notifications" class="bm-menu-item">
          <div class="bm-menu-left">
            <lucide-icon [img]="BellIcon" [size]="18" class="text-primary"></lucide-icon>
            <span class="bm-menu-label">{{ t('profile_notifications') }}</span>
          </div>
          <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-muted"></lucide-icon>
        </a>

        <a routerLink="/wishlist" class="bm-menu-item">
          <div class="bm-menu-left">
            <lucide-icon [img]="HeartIcon" [size]="18" class="text-primary"></lucide-icon>
            <span class="bm-menu-label">{{ t('profile_wishlist') }}</span>
          </div>
          <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-muted"></lucide-icon>
        </a>

        <a routerLink="/settings" class="bm-menu-item">
          <div class="bm-menu-left">
            <lucide-icon [img]="SettingsIcon" [size]="18" class="text-primary"></lucide-icon>
            <span class="bm-menu-label">{{ t('settings_title') }}</span>
          </div>
          <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-muted"></lucide-icon>
        </a>

        <a routerLink="/help" class="bm-menu-item">
          <div class="bm-menu-left">
            <lucide-icon [img]="HelpCircleIcon" [size]="18" class="text-primary"></lucide-icon>
            <span class="bm-menu-label">{{ t('profile_help') }}</span>
          </div>
          <lucide-icon [img]="ChevronRightIcon" [size]="16" class="text-muted"></lucide-icon>
        </a>
      </div>

      <!-- Log Out Button -->
      @if (currentUser()) {
        <button type="button" class="bm-btn-logout" (click)="logout()">
          <lucide-icon [img]="LogOutIcon" [size]="18"></lucide-icon>
          <span>{{ t('profile_logout') }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .bm-profile-view {
      padding: 14px 14px 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bm-profile-heading {
      font-size: 20px;
      font-weight: 800;
      color: var(--bm-color-text-primary);
      letter-spacing: -0.4px;
    }

    .bm-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 14px;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-user-card {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bm-avatar-circle {
      width: 52px;
      height: 52px;
      border-radius: var(--bm-radius-full);
      background-color: var(--bm-color-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .bm-user-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-user-name-line {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bm-user-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-verified-tag {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 10px;
      font-weight: 700;
      color: var(--bm-color-success);
      background-color: var(--bm-color-success-bg);
      padding: 2px 6px;
      border-radius: var(--bm-radius-full);
    }

    .bm-user-phone {
      font-size: 13px;
      font-weight: 500;
      color: var(--bm-color-text-secondary);
    }

    .bm-user-email {
      font-size: 12px;
      color: var(--bm-color-text-muted);
    }

    .bm-guest-card {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px;
    }

    .bm-guest-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-guest-desc {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
    }

    .bm-btn-login {
      height: 40px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bm-lang-card {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-lang-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bm-lang-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bm-lang-title {
      font-size: 13px;
      font-weight: 600;
    }

    .bm-lang-active {
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-primary);
    }

    .bm-lang-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .bm-lang-btn {
      padding: 8px 10px;
      border-radius: var(--bm-radius-md);
      border: 1px solid var(--bm-color-border);
      background-color: var(--bm-color-surface-subtle);
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      font-weight: 500;

      &.is-active {
        background-color: var(--bm-color-primary-soft);
        border-color: var(--bm-color-primary);
        color: var(--bm-color-primary);
        font-weight: 700;
      }
    }

    .bm-menu-group {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .bm-menu-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px;
      border-bottom: 1px solid var(--bm-color-border-subtle);

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: var(--bm-color-surface-subtle);
      }
    }

    .bm-menu-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bm-menu-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--bm-color-text-primary);
    }

    .bm-btn-logout {
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-danger-border);
      color: var(--bm-color-danger);
      border-radius: var(--bm-radius-md);
      font-size: 13px;
      font-weight: 600;
    }
  `],
})
export class ProfilePageComponent {
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(TranslationService);

  readonly GlobeIcon = Globe;
  readonly CheckCircleIcon = CheckCircle2;
  readonly PackageIcon = Package;
  readonly MapPinIcon = MapPin;
  readonly BellIcon = Bell;
  readonly HeartIcon = Heart;
  readonly SettingsIcon = Settings;
  readonly HelpCircleIcon = HelpCircle;
  readonly LogOutIcon = LogOut;
  readonly ChevronRightIcon = ChevronRight;

  readonly currentUser = this.auth.currentUser;
  readonly currentLang = this.i18n.currentLang;

  setLang(lang: 'en' | 'ml'): void {
    this.i18n.setLanguage(lang);
  }

  logout(): void {
    this.auth.logout();
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
