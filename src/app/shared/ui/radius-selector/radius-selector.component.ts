import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { LucideAngularModule, MapPin, Sliders } from 'lucide-angular';
import { ALLOWED_RADIUS_KM, DiscoveryRadius } from '../../../core/models/location.model';
import { LocationService } from '../../../core/services/location.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'bm-radius-selector',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (variant === 'inline') {
      <div class="bm-radius-widget-inline">
        <div class="bm-radius-widget-label">
          <lucide-icon [img]="MapPinIcon" [size]="13" class="bm-widget-icon"></lucide-icon>
          <span class="bm-inline-title">Distance:</span>
        </div>
        <div class="bm-inline-chips hide-scroll">
          @for (rad of allowedRadii; track rad) {
            <button
              type="button"
              class="bm-inline-chip"
              [class.is-active]="rad === currentRadius()"
              (click)="selectRadius(rad)"
            >
              {{ rad >= 10000 ? 'Whole Kerala' : rad + ' km' }}
            </button>
          }
        </div>
      </div>
    } @else {
      <div class="bm-radius-selector-card">
        @if (showHeader) {
          <div class="bm-radius-header">
            <span class="bm-radius-title">{{ t('loc_radius_label') }}</span>
            <span class="bm-radius-current">
              {{ currentRadius() >= 10000 ? 'No distance limit' : t('loc_showing_within', { radius: currentRadius() }) }}
            </span>
          </div>
        }

        <div class="bm-radius-chips-row hide-scroll">
          @for (rad of allowedRadii; track rad) {
            <button
              type="button"
              class="bm-radius-chip"
              [class.is-active]="rad === currentRadius()"
              (click)="selectRadius(rad)"
            >
              {{ rad >= 10000 ? 'Whole Kerala' : rad + ' km' }}
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    /* Inline Widget Style */
    .bm-radius-widget-inline {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border-subtle);
      border-radius: var(--bm-radius-full);
      max-width: 100%;
      box-sizing: border-box;
    }

    .bm-radius-widget-label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
      color: var(--bm-color-text-secondary);
      font-size: 11.5px;
      font-weight: 600;
    }

    .bm-widget-icon {
      color: var(--bm-color-primary);
    }

    .bm-inline-title {
      white-space: nowrap;
    }

    .bm-inline-chips {
      display: flex;
      align-items: center;
      gap: 5px;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      flex: 1;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .bm-inline-chip {
      flex-shrink: 0;
      padding: 4px 10px;
      border-radius: var(--bm-radius-full);
      border: 1px solid var(--bm-color-border);
      background-color: var(--bm-color-surface);
      color: var(--bm-color-text-secondary);
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;

      &:hover {
        background-color: var(--bm-color-border-subtle);
        color: var(--bm-color-text-primary);
      }

      &:active {
        transform: scale(0.96);
      }

      &.is-active {
        background-color: var(--bm-color-primary);
        color: #ffffff;
        border-color: var(--bm-color-primary);
        font-weight: 600;
        box-shadow: 0 1px 3px rgba(37, 99, 235, 0.25);
      }
    }

    /* Card Style */
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
      cursor: pointer;
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

  readonly MapPinIcon = MapPin;
  readonly SlidersIcon = Sliders;

  readonly allowedRadii = ALLOWED_RADIUS_KM;
  readonly currentRadius = this.locationService.radiusKm;

  @Input() variant: 'card' | 'inline' = 'card';
  @Input() showHeader = true;

  @Output() radiusChange = new EventEmitter<DiscoveryRadius>();

  selectRadius(rad: DiscoveryRadius): void {
    this.locationService.setRadius(rad);
    this.radiusChange.emit(rad);
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
