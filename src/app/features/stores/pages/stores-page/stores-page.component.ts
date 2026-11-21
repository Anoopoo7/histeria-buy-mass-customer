import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChevronRight, MapPin, Search, Store } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { StoreRecord } from '../../../../core/models/store.model';
import { LocationService } from '../../../../core/services/location.service';
import { StoreService } from '../../../../core/services/store.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'bm-stores-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="bm-stores-view">
      <!-- Header Bar -->
      <div class="bm-page-header">
        <h1 class="bm-page-title">{{ t('sec_nearby_stores') }}</h1>
        <div class="bm-page-loc-badge">
          <lucide-icon [img]="MapPinIcon" [size]="12"></lucide-icon>
          <span>{{ radius() >= 10000 ? 'Kerala' : radius() + ' km radius' }}</span>
        </div>
      </div>

      <!-- Stores Listing -->
      @if (isLoading()) {
        <div class="bm-stores-list">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="bm-store-card is-skeleton">
              <div class="bm-store-avatar bm-skeleton"></div>
              <div class="bm-store-body">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <div class="bm-skeleton bm-skeleton-title" style="width: 55%; height: 16px;"></div>
                  <div class="bm-skeleton bm-skeleton-text" style="width: 45px;"></div>
                </div>
                <div class="bm-skeleton bm-skeleton-text" style="width: 70%; margin-bottom: 4px;"></div>
                <div class="bm-skeleton bm-skeleton-text" style="width: 85%;"></div>
              </div>
            </div>
          }
        </div>
      } @else if (stores().length > 0) {
        <div class="bm-stores-list">
          @for (store of stores(); track store.id) {
            <a [routerLink]="['/stores', store.id]" class="bm-store-card">
              <div class="bm-store-avatar">
                @if (store.primaryImageUrl) {
                  <img [src]="store.primaryImageUrl" [alt]="store.storeName" class="bm-store-img" loading="lazy" decoding="async" />
                } @else {
                  <lucide-icon [img]="StoreIcon" [size]="24" class="text-primary"></lucide-icon>
                }
              </div>

              <div class="bm-store-body">
                <div class="bm-store-name-row">
                  <h3 class="bm-store-name">{{ store.storeName }}</h3>
                  @if (store.distanceKm !== undefined) {
                    <span class="bm-store-dist">{{ store.distanceKm }} km</span>
                  }
                </div>
                <span class="bm-store-cat">{{ store.businessType }} • {{ store.city }}</span>
                @if (store.addressLine1) {
                  <span class="bm-store-addr">{{ store.addressLine1 }}</span>
                }
                @if (store.description) {
                  <p class="bm-store-desc">{{ store.description }}</p>
                }
              </div>

              <lucide-icon [img]="ChevronRightIcon" [size]="18" class="bm-chevron"></lucide-icon>
            </a>
          }
        </div>
      } @else {
        <div class="bm-stores-empty">
          <lucide-icon [img]="StoreIcon" [size]="36" class="text-muted"></lucide-icon>
          <h3>No stores found in this area</h3>
          <p>Try increasing your discovery radius in location settings.</p>
          <a routerLink="/location" class="bm-btn-change">{{ t('loc_change') }}</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-stores-view {
      padding: 14px 14px 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bm-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bm-page-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      letter-spacing: -0.4px;
    }

    .bm-page-loc-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-full);
      font-size: 11px;
      color: var(--bm-color-primary);
      font-weight: 600;
    }

    .bm-stores-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-store-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      box-shadow: var(--bm-shadow-xs);
      transition: border-color 0.15s ease;

      &:active {
        border-color: var(--bm-color-primary-border);
      }
    }

    .bm-store-avatar {
      width: 52px;
      height: 52px;
      border-radius: var(--bm-radius-md);
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }

    .bm-store-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-store-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bm-store-name-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 6px;
    }

    .bm-store-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-store-dist {
      font-size: 11px;
      font-weight: 600;
      color: var(--bm-color-primary);
      white-space: nowrap;
    }

    .bm-store-cat {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
    }

    .bm-store-addr {
      font-size: 11px;
      color: var(--bm-color-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-store-desc {
      font-size: 11px;
      color: var(--bm-color-text-secondary);
      margin-top: 2px;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-chevron {
      color: var(--bm-color-text-muted);
      flex-shrink: 0;
    }

    .bm-store-card.is-skeleton {
      pointer-events: none;
    }

    .bm-stores-empty {
      padding: 40px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      background-color: var(--bm-color-surface);
      border: 1px dashed var(--bm-color-border);
      border-radius: var(--bm-radius-lg);

      h3 {
        font-size: 15px;
        color: var(--bm-color-text-primary);
      }

      p {
        font-size: 13px;
        color: var(--bm-color-text-secondary);
      }
    }

    .bm-btn-change {
      display: inline-block;
      margin-top: 4px;
      padding: 8px 16px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
    }
  `],
})
export class StoresPageComponent implements OnInit {
  private readonly storeService = inject(StoreService);
  private readonly locationService = inject(LocationService);
  private readonly i18n = inject(TranslationService);

  readonly MapPinIcon = MapPin;
  readonly StoreIcon = Store;
  readonly ChevronRightIcon = ChevronRight;

  readonly stores = signal<StoreRecord[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly radius = this.locationService.radiusKm;

  ngOnInit(): void {
    this.storeService.getNearbyStores({ limit: 40 }).subscribe({
      next: (res) => {
        this.stores.set(res.stores);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
