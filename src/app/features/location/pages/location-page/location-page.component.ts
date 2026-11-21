import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Check,
  Crosshair,
  LucideAngularModule,
  MapPin,
  Navigation,
  Sliders,
} from 'lucide-angular';
import { KERALA_CITY_PRESETS } from '../../../../core/models/location.model';
import { GoogleMapsLoaderService } from '../../../../core/services/google-maps-loader.service';
import { LocationService } from '../../../../core/services/location.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { RadiusSelectorComponent } from '../../../../shared/ui/radius-selector/radius-selector.component';

@Component({
  selector: 'bm-location-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RadiusSelectorComponent],
  template: `
    <div class="bm-location-screen">
      <!-- Top Branding & Intro -->
      <div class="bm-loc-hero">
        <div class="bm-loc-icon-bubble">
          <lucide-icon [img]="MapPinIcon" [size]="28"></lucide-icon>
        </div>
        <h1 class="bm-loc-title">{{ t('loc_heading') }}</h1>
        <p class="bm-loc-desc">{{ t('loc_description') }}</p>
      </div>

      <!-- Discovery Radius Selector -->
      <div class="bm-loc-section">
        <bm-radius-selector></bm-radius-selector>
      </div>

      <!-- Location Options Tabs -->
      <div class="bm-method-tabs">
        <button
          type="button"
          class="bm-method-tab"
          [class.is-active]="activeTab() === 'gps'"
          (click)="setActiveTab('gps')"
        >
          <lucide-icon [img]="CrosshairIcon" [size]="16"></lucide-icon>
          <span>{{ t('loc_use_current') }}</span>
        </button>

        <button
          type="button"
          class="bm-method-tab"
          [class.is-active]="activeTab() === 'map'"
          (click)="setActiveTab('map')"
        >
          <lucide-icon [img]="NavigationIcon" [size]="16"></lucide-icon>
          <span>{{ t('loc_select_map') }}</span>
        </button>

        <button
          type="button"
          class="bm-method-tab"
          [class.is-active]="activeTab() === 'manual'"
          (click)="setActiveTab('manual')"
        >
          <lucide-icon [img]="SlidersIcon" [size]="16"></lucide-icon>
          <span>{{ t('loc_enter_manually') }}</span>
        </button>
      </div>

      <!-- Option A: Current GPS Location -->
      @if (activeTab() === 'gps') {
        <div class="bm-card bm-gps-box">
          <div class="bm-gps-info">
            <h3 class="bm-gps-title">{{ t('loc_use_current') }}</h3>
            <p class="bm-gps-desc">
              Uses your device's GPS to find the closest authorized car & bike dealerships and vehicle showrooms within {{ radius() >= 10000 ? 'any distance (Whole Kerala)' : radius() + ' km' }}.
            </p>
          </div>

          @if (locationError()) {
            <div class="bm-alert-box is-error">
              {{ locationError() }}
            </div>
          }

          <button
            type="button"
            class="bm-btn-primary bm-full-width"
            [disabled]="isDetecting()"
            (click)="triggerGps()"
          >
            <lucide-icon
              [img]="CrosshairIcon"
              [size]="18"
              [class.bm-spin]="isDetecting()"
            ></lucide-icon>
            <span>{{ isDetecting() ? t('loc_detecting') : t('loc_use_current') }}</span>
          </button>
        </div>
      }

      <!-- Option B: Select on Interactive Google Map -->
      @if (activeTab() === 'map') {
        <div class="bm-card bm-map-card">
          <div class="bm-map-coords-bar">
            <span class="bm-map-coords-text">
              Lat: {{ selectedLat().toFixed(4) }} | Lng: {{ selectedLng().toFixed(4) }}
            </span>
            <span class="bm-map-hint">{{ t('loc_pin_drag_hint') }}</span>
          </div>

          <!-- Quick Kerala Presets Bar -->
          <div class="bm-presets-bar hide-scroll">
            @for (city of cityPresets; track city.name) {
              <button
                type="button"
                class="bm-preset-btn"
                [class.is-active]="isCloseTo(city.lat, city.lng)"
                (click)="applyPreset(city.lat, city.lng, city.name)"
              >
                {{ city.name }}
              </button>
            }
          </div>

          <!-- Google Map Viewport -->
          <div class="bm-map-container">
            @if (mapLoading()) {
              <div class="bm-map-state-overlay">
                <div class="bm-spinner"></div>
                <span>Loading Google Maps...</span>
              </div>
            }
            @if (mapErrorMessage()) {
              <div class="bm-map-state-overlay is-error">
                <span>{{ mapErrorMessage() }}</span>
                <span class="bm-map-subhint">You can still confirm coordinates or choose a preset city above.</span>
              </div>
            }
            <div #mapContainer class="bm-google-map-canvas"></div>
          </div>

          @if (detectedAddressLabel()) {
            <div class="bm-map-detected-tag">
              <lucide-icon [img]="MapPinIcon" [size]="14"></lucide-icon>
              <span>{{ detectedAddressLabel() }}</span>
            </div>
          }

          <button
            type="button"
            class="bm-btn-primary bm-full-width"
            (click)="confirmMapLocation()"
          >
            <lucide-icon [img]="CheckIcon" [size]="18"></lucide-icon>
            <span>{{ t('loc_confirm_selection') }}</span>
          </button>
        </div>
      }

      <!-- Option C: Manual Address Entry -->
      @if (activeTab() === 'manual') {
        <div class="bm-card bm-manual-form">
          <div class="bm-field">
            <label class="bm-label">{{ t('loc_locality') }}</label>
            <input
              type="text"
              class="bm-input"
              [(ngModel)]="manualLocality"
              placeholder="e.g. Kadavanthra, Palayam, Calicut Beach"
            />
          </div>

          <div class="bm-field">
            <label class="bm-label">{{ t('loc_city') }}</label>
            <input
              type="text"
              class="bm-input"
              [(ngModel)]="manualCity"
              placeholder="e.g. Kochi, Thiruvananthapuram, Kozhikode"
            />
          </div>

          <div class="bm-field">
            <label class="bm-label">{{ t('loc_pincode') }}</label>
            <input
              type="text"
              class="bm-input"
              [(ngModel)]="manualPincode"
              placeholder="e.g. 682020"
              maxlength="6"
            />
          </div>

          <!-- Latitude & Longitude (Manual Coordinates) -->
          <div class="bm-coords-group">
            <span class="bm-coords-label">{{ t('loc_coordinates_label') }}</span>
            <div class="bm-coords-row">
              <div class="bm-field bm-col-half">
                <label class="bm-label">{{ t('loc_latitude') }}</label>
                <input
                  type="number"
                  step="any"
                  class="bm-input"
                  [(ngModel)]="manualLat"
                  placeholder="e.g. 9.9312"
                />
              </div>
              <div class="bm-field bm-col-half">
                <label class="bm-label">{{ t('loc_longitude') }}</label>
                <input
                  type="number"
                  step="any"
                  class="bm-input"
                  [(ngModel)]="manualLng"
                  placeholder="e.g. 76.2673"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            class="bm-btn-primary bm-full-width"
            [disabled]="!isManualFormValid()"
            (click)="submitManualLocation()"
          >
            <lucide-icon [img]="CheckIcon" [size]="18"></lucide-icon>
            <span>{{ t('loc_save_address') }}</span>
          </button>
        </div>
      }

      <!-- Saved Addresses (if any) -->
      @if (savedAddresses().length > 0) {
        <div class="bm-saved-section">
          <h3 class="bm-section-title">{{ t('profile_saved_locations') }}</h3>
          <div class="bm-saved-list">
            @for (addr of savedAddresses(); track addr.id) {
              <button
                type="button"
                class="bm-saved-item"
                (click)="selectSavedAddress(addr.id)"
              >
                <div class="bm-saved-icon">
                  <lucide-icon [img]="MapPinIcon" [size]="16"></lucide-icon>
                </div>
                <div class="bm-saved-meta">
                  <span class="bm-saved-name">{{ addr.title }}</span>
                  <span class="bm-saved-sub">{{ addr.locality }}, {{ addr.city }}</span>
                </div>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .bm-location-screen {
      padding: 24px 16px calc(24px + var(--bm-safe-bottom));
      max-width: var(--bm-max-mobile-width);
      margin: 0 auto;
      width: 100%;
    }

    .bm-loc-hero {
      text-align: center;
      margin-bottom: 20px;
    }

    .bm-loc-icon-bubble {
      width: 56px;
      height: 56px;
      border-radius: var(--bm-radius-full);
      background-color: var(--bm-color-primary-soft);
      color: var(--bm-color-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .bm-loc-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--bm-color-text-primary);
      margin-bottom: 6px;
      letter-spacing: -0.4px;
    }

    .bm-loc-desc {
      font-size: 14px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
      max-width: 320px;
      margin: 0 auto;
    }

    .bm-loc-section {
      margin-bottom: 16px;
    }

    .bm-method-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
      margin-bottom: 16px;
    }

    .bm-method-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 4px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      color: var(--bm-color-text-secondary);
      font-size: 11px;
      font-weight: 500;
      transition: all 0.15s ease;

      &.is-active {
        background-color: var(--bm-color-primary-soft);
        border-color: var(--bm-color-primary);
        color: var(--bm-color-primary);
        font-weight: 600;
      }
    }

    .bm-card {
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-lg);
      padding: 16px;
      box-shadow: var(--bm-shadow-xs);
    }

    .bm-gps-box {
      text-align: center;
      padding: 24px 16px;
    }

    .bm-gps-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--bm-color-text-primary);
    }

    .bm-gps-desc {
      font-size: 13px;
      color: var(--bm-color-text-secondary);
      line-height: 1.4;
      margin-bottom: 20px;
    }

    .bm-map-card {
      padding: 12px;
    }

    .bm-map-coords-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .bm-map-coords-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-primary);
    }

    .bm-map-hint {
      font-size: 11px;
      color: var(--bm-color-text-muted);
    }

    .bm-presets-bar {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      margin-bottom: 10px;
      padding-bottom: 2px;
    }

    .bm-preset-btn {
      flex-shrink: 0;
      padding: 4px 10px;
      border-radius: var(--bm-radius-full);
      border: 1px solid var(--bm-color-border);
      background-color: var(--bm-color-surface-subtle);
      font-size: 12px;
      color: var(--bm-color-text-secondary);

      &.is-active {
        background-color: var(--bm-color-primary);
        color: #fff;
        border-color: var(--bm-color-primary);
      }
    }

    .bm-map-container {
      position: relative;
      height: 240px;
      border-radius: var(--bm-radius-md);
      overflow: hidden;
      margin-bottom: 10px;
      border: 1px solid var(--bm-color-border);
      background-color: #f1f5f9;
    }

    .bm-google-map-canvas {
      width: 100%;
      height: 100%;
    }

    .bm-map-state-overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      text-align: center;
      z-index: 5;
      font-size: 13px;
      color: var(--bm-color-text-secondary);

      &.is-error {
        color: var(--bm-color-danger);
      }
    }

    .bm-map-subhint {
      font-size: 11px;
      color: var(--bm-color-text-muted);
      max-width: 260px;
    }

    .bm-map-detected-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background-color: var(--bm-color-primary-soft);
      border-radius: var(--bm-radius-md);
      color: var(--bm-color-primary);
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 12px;
    }

    .bm-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--bm-color-border);
      border-top-color: var(--bm-color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .bm-manual-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bm-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bm-coords-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-top: 6px;
      border-top: 1px dashed var(--bm-color-border);
    }

    .bm-coords-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--bm-color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .bm-coords-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .bm-col-half {
      min-width: 0;
    }

    .bm-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--bm-color-text-secondary);
    }

    .bm-input {
      height: 42px;
      padding: 0 12px;
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      background-color: var(--bm-color-surface-subtle);
      color: var(--bm-color-text-primary);
      outline: none;

      &:focus {
        border-color: var(--bm-color-primary);
        background-color: var(--bm-color-surface);
      }
    }

    .bm-btn-primary {
      height: 44px;
      background-color: var(--bm-color-primary);
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      border-radius: var(--bm-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--bm-color-primary-hover);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .bm-full-width {
      width: 100%;
    }

    .bm-alert-box {
      padding: 10px 12px;
      border-radius: var(--bm-radius-md);
      font-size: 13px;
      margin-bottom: 14px;

      &.is-error {
        background-color: var(--bm-color-danger-bg);
        color: var(--bm-color-danger);
        border: 1px solid var(--bm-color-danger-border);
      }
    }

    .bm-saved-section {
      margin-top: 24px;
    }

    .bm-section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--bm-color-text-secondary);
      margin-bottom: 8px;
    }

    .bm-saved-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bm-saved-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background-color: var(--bm-color-surface);
      border: 1px solid var(--bm-color-border);
      border-radius: var(--bm-radius-md);
      text-align: left;
    }

    .bm-saved-icon {
      color: var(--bm-color-primary);
    }

    .bm-saved-meta {
      display: flex;
      flex-direction: column;
    }

    .bm-saved-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--bm-color-text-primary);
    }

    .bm-saved-sub {
      font-size: 12px;
      color: var(--bm-color-text-muted);
    }

    .bm-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `],
})
export class LocationPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly locationService = inject(LocationService);
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);

  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  readonly MapPinIcon = MapPin;
  readonly CrosshairIcon = Crosshair;
  readonly NavigationIcon = Navigation;
  readonly SlidersIcon = Sliders;
  readonly CheckIcon = Check;

  readonly activeTab = signal<'gps' | 'map' | 'manual'>('gps');
  readonly cityPresets = KERALA_CITY_PRESETS;
  readonly radius = this.locationService.radiusKm;
  readonly savedAddresses = this.locationService.savedAddresses;
  readonly isDetecting = this.locationService.isDetecting;
  readonly locationError = this.locationService.locationError;

  readonly selectedLat = signal<number>(9.9312);
  readonly selectedLng = signal<number>(76.2673);
  readonly detectedAddressLabel = signal<string>('');
  readonly mapLoading = signal<boolean>(false);
  readonly mapErrorMessage = signal<string | null>(null);

  manualLocality = '';
  manualCity = '';
  manualPincode = '';
  manualLat: number | null = null;
  manualLng: number | null = null;

  private mapInstance: any = null;
  private markerInstance: any = null;

  ngOnInit(): void {
    const loc = this.locationService.currentLocation();
    if (loc.latitude && loc.longitude) {
      this.selectedLat.set(loc.latitude);
      this.selectedLng.set(loc.longitude);
      this.manualLat = loc.latitude;
      this.manualLng = loc.longitude;
      this.manualLocality = loc.locality || '';
      this.manualCity = loc.city || '';
      this.manualPincode = loc.postalCode || '';
      if (loc.locality || loc.city) {
        this.detectedAddressLabel.set([loc.locality, loc.city].filter(Boolean).join(', '));
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.activeTab() === 'map') {
      setTimeout(() => this.initGoogleMap(), 150);
    }
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  setActiveTab(tab: 'gps' | 'map' | 'manual'): void {
    this.activeTab.set(tab);
    if (tab === 'map') {
      setTimeout(() => this.initGoogleMap(), 100);
    }
  }

  async triggerGps(): Promise<void> {
    try {
      await this.locationService.detectCurrentGpsLocation();
      this.toast.success('Location detected!');
      this.router.navigate(['/home']);
    } catch {
      // Error is set in signal
    }
  }

  applyPreset(lat: number, lng: number, name: string): void {
    this.selectedLat.set(lat);
    this.selectedLng.set(lng);
    this.manualLat = lat;
    this.manualLng = lng;
    this.manualCity = name;
    this.manualLocality = name;
    this.detectedAddressLabel.set(name);

    if (this.mapInstance && this.markerInstance) {
      const pos = { lat, lng };
      this.markerInstance.setPosition(pos);
      this.mapInstance.panTo(pos);
    }
  }

  confirmMapLocation(): void {
    const label = this.detectedAddressLabel() || this.manualCity || 'Selected Location';
    this.locationService.setCoordinates(this.selectedLat(), this.selectedLng(), label, 'map');
    if (this.manualCity || (this.selectedLat() && this.selectedLng())) {
      this.locationService.setManualLocation({
        locality: this.manualLocality || this.manualCity || label,
        city: this.manualCity || label,
        postalCode: this.manualPincode,
        latitude: this.selectedLat(),
        longitude: this.selectedLng(),
      });
    }
    this.toast.success('Location set successfully!');
    this.router.navigate(['/home']);
  }

  isManualFormValid(): boolean {
    const hasCity = Boolean(this.manualCity.trim());
    const hasValidCoords =
      this.manualLat !== null &&
      this.manualLng !== null &&
      !isNaN(Number(this.manualLat)) &&
      !isNaN(Number(this.manualLng));
    return hasCity || hasValidCoords;
  }

  submitManualLocation(): void {
    if (!this.isManualFormValid()) return;

    const lat =
      this.manualLat !== null && !isNaN(Number(this.manualLat))
        ? Number(this.manualLat)
        : undefined;
    const lng =
      this.manualLng !== null && !isNaN(Number(this.manualLng))
        ? Number(this.manualLng)
        : undefined;

    const city =
      this.manualCity.trim() ||
      (lat !== undefined && lng !== undefined
        ? `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        : 'Selected Location');
    const locality = this.manualLocality.trim() || city;

    this.locationService.setManualLocation({
      locality,
      city,
      postalCode: this.manualPincode.trim(),
      latitude: lat,
      longitude: lng,
    });
    this.toast.success('Address saved!');
    this.router.navigate(['/home']);
  }

  selectSavedAddress(id: string): void {
    this.locationService.selectSavedAddress(id);
    this.toast.success('Active location switched!');
    this.router.navigate(['/home']);
  }

  isCloseTo(lat: number, lng: number): boolean {
    return Math.abs(this.selectedLat() - lat) < 0.05 && Math.abs(this.selectedLng() - lng) < 0.05;
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }

  private async initGoogleMap(): Promise<void> {
    if (!this.mapContainer || typeof window === 'undefined') return;

    this.mapLoading.set(true);
    this.mapErrorMessage.set(null);

    const loaded = await this.googleMapsLoader.load();
    this.mapLoading.set(false);

    if (!loaded) {
      this.mapErrorMessage.set(
        this.googleMapsLoader.errorMessage() || 'Unable to initialize Google Maps.'
      );
      return;
    }

    const google = (window as any).google;
    if (!google?.maps) {
      this.mapErrorMessage.set('Google Maps API is not available.');
      return;
    }

    this.destroyMap();

    const center = { lat: this.selectedLat(), lng: this.selectedLng() };

    this.mapInstance = new google.maps.Map(this.mapContainer.nativeElement, {
      center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    this.markerInstance = new google.maps.Marker({
      position: center,
      map: this.mapInstance,
      draggable: true,
      title: 'Drag to change location',
      animation: google.maps.Animation.DROP,
    });

    this.markerInstance.addListener('dragend', (evt: any) => {
      if (evt?.latLng) {
        const lat = Number(evt.latLng.lat().toFixed(6));
        const lng = Number(evt.latLng.lng().toFixed(6));
        this.selectedLat.set(lat);
        this.selectedLng.set(lng);
        this.manualLat = lat;
        this.manualLng = lng;
        this.reverseGeocode(lat, lng);
      }
    });

    this.mapInstance.addListener('click', (evt: any) => {
      if (evt?.latLng) {
        const lat = Number(evt.latLng.lat().toFixed(6));
        const lng = Number(evt.latLng.lng().toFixed(6));
        this.selectedLat.set(lat);
        this.selectedLng.set(lng);
        this.manualLat = lat;
        this.manualLng = lng;
        this.markerInstance.setPosition({ lat, lng });
        this.reverseGeocode(lat, lng);
      }
    });

    // Run initial reverse geocoding if not yet labeled
    if (!this.detectedAddressLabel()) {
      this.reverseGeocode(center.lat, center.lng);
    }
  }

  private reverseGeocode(lat: number, lng: number): void {
    const google = (window as any).google;
    if (!google?.maps?.Geocoder) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results?.[0]) {
        const best = results[0];
        let locality = '';
        let city = '';
        let postalCode = '';

        for (const comp of best.address_components || []) {
          const types = comp.types || [];
          if (types.includes('sublocality') || types.includes('neighborhood')) {
            locality = locality || comp.long_name;
          } else if (types.includes('locality')) {
            city = comp.long_name;
          } else if (types.includes('postal_code')) {
            postalCode = comp.long_name;
          } else if (types.includes('administrative_area_level_2') && !city) {
            city = comp.long_name;
          }
        }

        const resolved = locality && city ? `${locality}, ${city}` : (locality || city || best.formatted_address);
        this.detectedAddressLabel.set(resolved);

        if (locality) this.manualLocality = locality;
        if (city) this.manualCity = city;
        if (postalCode) this.manualPincode = postalCode;
      }
    });
  }

  private destroyMap(): void {
    if (this.markerInstance) {
      if ((window as any).google?.maps?.event) {
        (window as any).google.maps.event.clearInstanceListeners(this.markerInstance);
      }
      this.markerInstance.setMap(null);
      this.markerInstance = null;
    }
    if (this.mapInstance) {
      if ((window as any).google?.maps?.event) {
        (window as any).google.maps.event.clearInstanceListeners(this.mapInstance);
      }
      this.mapInstance = null;
    }
  }
}
