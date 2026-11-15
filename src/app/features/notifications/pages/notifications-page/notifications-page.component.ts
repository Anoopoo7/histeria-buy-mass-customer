import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArrowLeft, Bell, CheckCircle2, Clock, LucideAngularModule, Sparkles } from 'lucide-angular';
import { TranslationService } from '../../../../core/services/translation.service';

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'pickup' | 'pool' | 'info';
  read: boolean;
}

@Component({
  selector: 'bm-notifications-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-notif-view">
      <div class="bm-top-bar">
        <a routerLink="/profile" class="bm-back-btn">
          <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
        </a>
        <h1 class="bm-top-title">{{ t('profile_notifications') }}</h1>
      </div>

      <div class="bm-notif-list">
        @for (item of notifications; track item.id) {
          <div class="bm-notif-card" [class.is-unread]="!item.read">
            <div class="bm-notif-icon">
              @if (item.type === 'pickup') {
                <lucide-icon [img]="CheckCircleIcon" [size]="18" class="text-success"></lucide-icon>
              } @else if (item.type === 'pool') {
                <lucide-icon [img]="SparklesIcon" [size]="18" class="text-primary"></lucide-icon>
              } @else {
                <lucide-icon [img]="BellIcon" [size]="18" class="text-secondary"></lucide-icon>
              }
            </div>

            <div class="bm-notif-body">
              <div class="bm-notif-header">
                <h4 class="bm-notif-title">{{ item.title }}</h4>
                <span class="bm-notif-time">{{ item.time }}</span>
              </div>
              <p class="bm-notif-text">{{ item.message }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .bm-notif-view {
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

    .bm-notif-list {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-notif-card {
      display: flex;
      gap: 12px;
      padding: 12px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);

      &.is-unread {
        background-color: var(--bm-color-surface-subtle);
        border-color: var(--bm-color-primary-border);
      }
    }

    .bm-notif-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .bm-notif-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .bm-notif-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .bm-notif-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
    }

    .bm-notif-time {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-notif-text {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
    }
  `],
})
export class NotificationsPageComponent {
  private readonly i18n = inject(TranslationService);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly CheckCircleIcon = CheckCircle2;
  readonly SparklesIcon = Sparkles;
  readonly BellIcon = Bell;

  readonly notifications: CustomerNotification[] = [
    {
      id: 'n1',
      title: 'Store Pickup Code Dispatched',
      message: 'Your 6-digit WhatsApp verification OTP has been sent for Order #BM-04928. Collect from Kadavanthra Grocery Store.',
      time: '10m ago',
      type: 'pickup',
      read: false,
    },
    {
      id: 'n2',
      title: 'Group Deal Target Reached!',
      message: 'Kochi Coconut Oil Group Pool reached Tier 2 (10% off). Final price has been applied.',
      time: '2h ago',
      type: 'pool',
      read: true,
    },
  ];

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
