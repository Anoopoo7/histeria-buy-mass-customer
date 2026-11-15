import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ALLOWED_RADIUS_KM, DiscoveryRadius } from '../../../core/models/location.model';
import { LocationService } from '../../../core/services/location.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'bm-radius-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bm-radius-selector-card">
      <div class="bm-radius-header">
        <span class="bm-radius-title">{{ t('loc_radius_label') }}</span>
        <span class="bm-radius-current">
          {{ t('loc_showing_within', { radius: currentRadius() }) }}
        </span>
      </div>

      <div class="bm-radius-chips-row hide-scroll">
        @for (rad of allowedRadii; track rad) {
          <button
            type="button"
            class="bm-radius-chip"
            [class.is-active]="rad === currentRadius()"
            (click)="selectRadius(rad)"
          >
            {{ rad }} km
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .bm-radius-selector-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 12px 14px;
    }

    .bm-radius-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .bm-radius-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
    }

    .bm-radius-current {
      font-size: 12px;
      color: var(--bm-color-primary);
      font-weight: 500;
    }

    .bm-radius-chips-row {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .bm-radius-chip {
      flex-shrink: 0;
      padding: 6px 12px;
      border-radius: var(--bm-radius-full);
      border: 1px solid var(--bm-color-border);
      background-color: var(--bm-color-surface-subtle);
      color: var(--bm-color-text-secondary);
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s ease;

      &:active {
        transform: scale(0.96);
      }

      &.is-active {
        background-color: var(--bm-color-primary);
        color: #fff;
        border-color: var(--bm-color-primary);
        font-weight: 600;
      }
    }
  `],
})
export class RadiusSelectorComponent {
  private readonly locationService = inject(LocationService);
  private readonly i18n = inject(TranslationService);

  readonly allowedRadii = ALLOWED_RADIUS_KM;
  readonly currentRadius = this.locationService.radiusKm;

  @Output() radiusChange = new EventEmitter<DiscoveryRadius>();

  selectRadius(rad: DiscoveryRadius): void {
    this.locationService.setRadius(rad);
    this.radiusChange.emit(rad);
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
