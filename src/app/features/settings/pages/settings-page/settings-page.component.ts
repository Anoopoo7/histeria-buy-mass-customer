import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArrowLeft, Bell, Globe, LucideAngularModule, MapPin, Sliders } from 'lucide-angular';
import { LocationService } from '../../../../core/services/location.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { RadiusSelectorComponent } from '../../../../shared/ui/radius-selector/radius-selector.component';

@Component({
  selector: 'bm-settings-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, RadiusSelectorComponent],
  template: `
    <div class="bm-settings-view">
      <div class="bm-top-bar">
        <a routerLink="/profile" class="bm-back-btn">
          <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
        </a>
        <h1 class="bm-top-title">{{ t('settings_title') }}</h1>
      </div>

      <div class="bm-settings-content">
        <!-- Language -->
        <div class="bm-card">
          <div class="bm-card-head">
            <lucide-icon [img]="GlobeIcon" [size]="18" class="text-primary"></lucide-icon>
            <span class="bm-card-title">{{ t('profile_language') }}</span>
          </div>
          <div class="bm-options-row">
            <button
              type="button"
              class="bm-option-btn"
              [class.is-active]="currentLang() === 'ml'"
              (click)="setLang('ml')"
            >
              മലയാളം (Malayalam)
            </button>
            <button
              type="button"
              class="bm-option-btn"
              [class.is-active]="currentLang() === 'en'"
              (click)="setLang('en')"
            >
              English
            </button>
          </div>
        </div>

        <!-- Discovery Radius -->
        <div class="bm-radius-wrap">
          <bm-radius-selector></bm-radius-selector>
        </div>

        <!-- Location Management Link -->
        <div class="bm-card">
          <div class="bm-card-head">
            <lucide-icon [img]="MapPinIcon" [size]="18" class="text-primary"></lucide-icon>
            <span class="bm-card-title">Default Discovery Location</span>
          </div>
          <p class="bm-setting-desc">Currently: {{ locationLabel() }}</p>
          <a routerLink="/location" class="bm-link-btn">Change Discovery Location</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bm-settings-view {
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

    .bm-settings-content {
      padding: 0 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 14px;
      box-shadow: var(--bm-shadow-xs);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bm-card-head {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bm-card-title {
      font-size: 14px;
      font-weight: 600;
    }

    .bm-options-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .bm-option-btn {
      padding: 8px 10px;
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      background-color: var(--bm-color-surface-subtle);
      font-size: 12px;
      font-weight: 500;

      &.is-active {
        background-color: var(--bm-color-primary-soft);
        border-color: var(--bm-color-primary);
        color: var(--bm-color-primary);
        font-weight: 700;
      }
    }

    .bm-setting-desc {
      font-size: 13px;
      color: var(--bm-color-text-secondary);
    }

    .bm-link-btn {
      display: inline-block;
      color: var(--bm-color-primary);
      font-size: 13px;
      font-weight: 600;
    }
  `],
})
export class SettingsPageComponent {
  private readonly locationService = inject(LocationService);
  private readonly i18n = inject(TranslationService);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly GlobeIcon = Globe;
  readonly MapPinIcon = MapPin;

  readonly currentLang = this.i18n.currentLang;
  readonly locationLabel = this.locationService.formattedLocationLabel;

  setLang(lang: 'en' | 'ml'): void {
    this.i18n.setLanguage(lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
