import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChevronDown, LucideAngularModule, MapPin } from 'lucide-angular';
import { LocationService } from '../../core/services/location.service';

@Component({
  selector: 'bm-top-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <header class="bm-header">
      <div class="bm-header-container">
        <!-- Brand Logo -->
        <a routerLink="/home" class="bm-brand-logo" aria-label="BuyMass Home">
          <span class="bm-logo-badge">BM</span>
          <span class="bm-logo-text">BuyMass</span>
        </a>

        <!-- Small Mobile-Friendly Location Switcher -->
        <a routerLink="/location" class="bm-location-pill" title="Change location">
          <lucide-icon [img]="MapPinIcon" [size]="13" class="bm-loc-icon"></lucide-icon>
          <span class="bm-loc-text">{{ locationLabel() }}</span>
          <lucide-icon [img]="ChevronDownIcon" [size]="13" class="bm-loc-chevron"></lucide-icon>
        </a>
      </div>
    </header>
  `,
  styles: [`
    .bm-header {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      background-color: var(--bm-color-surface);
      border-bottom: 1px solid var(--bm-color-border);
      z-index: 900;
      padding-top: var(--bm-safe-top);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .bm-header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--bm-header-height);
      max-width: var(--bm-max-mobile-width);
      margin: 0 auto;
      padding: 0 14px;
      gap: 12px;
    }

    .bm-brand-logo {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      text-decoration: none;
    }

    .bm-logo-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-weight: 800;
      font-size: 11px;
      border-radius: var(--bm-radius-sm);
      letter-spacing: -0.5px;
    }

    .bm-logo-text {
      font-size: 15px;
      font-weight: 700;
      color: var(--bm-color-primary);
      letter-spacing: -0.5px;
      display: none;

      @media (min-width: 380px) {
        display: inline-block;
      }
    }

    /* Small & mobile-friendly location switcher pill */
    .bm-location-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px 5px 8px;
      background-color: var(--bm-color-surface-subtle);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-full);
      max-width: 70%;
      min-width: 0;
      text-decoration: none;
      transition: background-color 0.15s ease, border-color 0.15s ease;
      cursor: pointer;
      flex-shrink: 1;

      &:hover,
      &:active {
        background-color: var(--bm-color-border);
      }
    }

    .bm-loc-icon {
      color: var(--bm-color-primary);
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    }

    .bm-loc-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }

    .bm-loc-chevron {
      color: var(--bm-color-text-muted);
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    }
  `],
})
export class TopHeaderComponent {
  private readonly locationService = inject(LocationService);

  readonly MapPinIcon = MapPin;
  readonly ChevronDownIcon = ChevronDown;

  readonly locationLabel = this.locationService.formattedLocationLabel;
}
