import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArrowRight, Clock, Filter, MapPin, Sparkles, Store, Users } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { PoolRecord } from '../../../../core/models/pool.model';
import { LocationService } from '../../../../core/services/location.service';
import { PoolService } from '../../../../core/services/pool.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { parseTimestampMs } from '../../../../core/utils/date.utils';
import { CountdownTimerComponent } from '../../../../shared/ui/countdown-timer/countdown-timer.component';
import { PoolProgressComponent } from '../../../../shared/ui/pool-progress/pool-progress.component';

@Component({
  selector: 'bm-pools-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    CountdownTimerComponent,
    PoolProgressComponent,
  ],
  template: `
    <div class="bm-pools-view">
      <!-- Page Header -->
      <div class="bm-page-head">
        <div>
          <h1 class="bm-page-title">{{ t('sec_active_pools') }}</h1>
          <p class="bm-page-desc">{{ t('sec_active_pools_sub') }}</p>
        </div>
        <div class="bm-radius-pill">
          <lucide-icon [img]="MapPinIcon" [size]="12"></lucide-icon>
          <span>{{ radius() }} km</span>
        </div>
      </div>

      <!-- Quick Filter Chips -->
      <div class="bm-filter-row hide-scroll">
        <button
          type="button"
          class="bm-chip"
          [class.is-active]="selectedFilter() === 'all'"
          (click)="setFilter('all')"
        >
          All Deals
        </button>
        <button
          type="button"
          class="bm-chip"
          [class.is-active]="selectedFilter() === 'ending'"
          (click)="setFilter('ending')"
        >
          Ending Soon
        </button>
        <button
          type="button"
          class="bm-chip"
          [class.is-active]="selectedFilter() === 'popular'"
          (click)="setFilter('popular')"
        >
          High Discount
        </button>
      </div>

      <!-- Pools Grid / List -->
      @if (isLoading()) {
        <div class="bm-pools-loading">
          @for (i of [1, 2, 3]; track i) {
            <div class="bm-pool-skeleton bm-skeleton"></div>
          }
        </div>
      } @else if (filteredPools().length > 0) {
        <div class="bm-pools-grid">
          @for (pool of filteredPools(); track pool.id) {
            <div class="bm-pool-card">
              <div class="bm-card-media">
                <img
                  [src]="pool.primaryImageUrl || '/favicon.ico'"
                  [alt]="pool.title"
                  class="bm-card-img"
                  loading="lazy"
                />
                <div class="bm-timer-badge">
                  <bm-countdown-timer [endsAt]="pool.endsAt"></bm-countdown-timer>
                </div>
              </div>

              <div class="bm-card-body">
                <div class="bm-store-row">
                  <span class="bm-store-name">{{ pool.storeName || 'Partner Store' }}</span>
                  @if (pool.distanceKm !== undefined) {
                    <span class="bm-dist">{{ pool.distanceKm }} km away</span>
                  }
                </div>

                <h3 class="bm-pool-title">{{ pool.title }}</h3>
                @if (pool.description) {
                  <p class="bm-pool-desc">{{ pool.description }}</p>
                }

                <!-- Progress & Tiers -->
                <bm-pool-progress
                  [progress]="pool.progress"
                  [currentAmount]="pool.currentTotalAmount || 0"
                  [targetAmount]="pool.targetAmount || 10000"
                  [participantCountInput]="pool.currentParticipantCount || 0"
                  [maxDiscountInput]="pool.maxDiscountPercentage || 15"
                  [tiers]="pool.tiers"
                ></bm-pool-progress>

                <a [routerLink]="['/pools', pool.id]" class="bm-view-btn">
                  <span>{{ t('pool_view_deal') }}</span>
                  <lucide-icon [img]="ArrowRightIcon" [size]="14"></lucide-icon>
                </a>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="bm-empty-pools">
          <lucide-icon [img]="SparklesIcon" [size]="36" class="text-muted"></lucide-icon>
          <h3>No group buying deals found</h3>
          <p>Try switching your location or expanding your discovery radius.</p>
          <a routerLink="/location" class="bm-btn-action">{{ t('loc_change') }}</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-pools-view {
      padding: 14px 14px 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bm-page-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }

    .bm-page-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      letter-spacing: -0.4px;
    }

    .bm-page-desc {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      margin-top: 2px;
    }

    .bm-radius-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-full);
      font-size: 11px;
      font-weight: 600;
      color: var(--bm-color-primary);
      white-space: nowrap;
    }

    .bm-filter-row {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .bm-chip {
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

    .bm-pools-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-pool-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-card-media {
      position: relative;
      height: 150px;
      background-color: var(--bm-color-surface-subtle);
    }

    .bm-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bm-timer-badge {
      position: absolute;
      top: 8px;
      left: 8px;
    }

    .bm-card-body {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-store-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
    }

    .bm-store-name {
      font-weight: 600;
      color: var(--bm-color-text-secondary);
    }

    .bm-dist {
      color: var(--bm-color-primary);
      font-weight: 600;
    }

    .bm-pool-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      line-height: 1.3;
    }

    .bm-pool-desc {
      font-size: 12px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .bm-view-btn {
      margin-top: 4px;
      height: 38px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }
    }

    .bm-pool-skeleton {
      height: 240px;
      border-radius: var(--bm-radius-lg);
      margin-bottom: 10px;
    }

    .bm-empty-pools {
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

    .bm-btn-action {
      margin-top: 6px;
      padding: 8px 16px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--bm-radius-md);
    }
  `],
})
export class PoolsPageComponent implements OnInit {
  private readonly poolService = inject(PoolService);
  private readonly locationService = inject(LocationService);
  private readonly i18n = inject(TranslationService);

  readonly MapPinIcon = MapPin;
  readonly SparklesIcon = Sparkles;
  readonly ArrowRightIcon = ArrowRight;

  readonly pools = signal<PoolRecord[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly selectedFilter = signal<'all' | 'ending' | 'popular'>('all');
  readonly radius = this.locationService.radiusKm;

  ngOnInit(): void {
    this.loadPools();
  }

  loadPools(): void {
    this.isLoading.set(true);
    this.poolService.getPools({ limit: 30 }).subscribe({
      next: (res) => {
        this.pools.set(res.pools);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setFilter(filter: 'all' | 'ending' | 'popular'): void {
    this.selectedFilter.set(filter);
  }

  filteredPools(): PoolRecord[] {
    const list = this.pools();
    if (this.selectedFilter() === 'ending') {
      return [...list].sort(
        (a, b) => parseTimestampMs(a.endsAt) - parseTimestampMs(b.endsAt),
      );
    }
    if (this.selectedFilter() === 'popular') {
      return [...list].sort(
        (a, b) => (b.maxDiscountPercentage || 0) - (a.maxDiscountPercentage || 0),
      );
    }
    return list;
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
