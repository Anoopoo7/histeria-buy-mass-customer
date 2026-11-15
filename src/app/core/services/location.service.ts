import { Injectable, computed, signal } from '@angular/core';
import { CustomerLocation, DiscoveryRadius, KERALA_CITY_PRESETS, SavedAddress } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly STORAGE_LOC_KEY = 'buymass_customer_location';
  private readonly STORAGE_RADIUS_KEY = 'buymass_customer_radius';
  private readonly STORAGE_SAVED_ADDR_KEY = 'buymass_customer_saved_addresses';

  // Active Location state
  private readonly _currentLocation = signal<CustomerLocation>(this.getInitialLocation());
  readonly currentLocation = this._currentLocation.asReadonly();

  // Selected radius state
  private readonly _radiusKm = signal<DiscoveryRadius>(this.getInitialRadius());
  readonly radiusKm = this._radiusKm.asReadonly();

  // Saved Addresses list state
  private readonly _savedAddresses = signal<SavedAddress[]>(this.getInitialSavedAddresses());
  readonly savedAddresses = this._savedAddresses.asReadonly();

  // State indicators
  readonly isLocationSet = computed(() => {
    const loc = this._currentLocation();
    return !!loc.latitude && !!loc.longitude && loc.source !== 'default';
  });

  readonly isDetecting = signal<boolean>(false);
  readonly permissionDenied = signal<boolean>(false);
  readonly locationError = signal<string | null>(null);

  readonly formattedLocationLabel = computed(() => {
    const loc = this._currentLocation();
    if (loc.locality && loc.city) {
      if (loc.locality.trim().toLowerCase() === loc.city.trim().toLowerCase()) {
        return loc.city;
      }
      return `${loc.locality}, ${loc.city}`;
    }
    return loc.city || loc.locality || loc.addressLabel || 'Kerala, India';
  });

  /**
   * Option A — Geolocation API
   * Requests permission strictly upon explicit user interaction.
   */
  detectCurrentGpsLocation(): Promise<CustomerLocation> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        const err = 'Geolocation is not supported by your browser.';
        this.locationError.set(err);
        return reject(new Error(err));
      }

      this.isDetecting.set(true);
      this.permissionDenied.set(false);
      this.locationError.set(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.isDetecting.set(false);
          const lat = Number(position.coords.latitude.toFixed(6));
          const lng = Number(position.coords.longitude.toFixed(6));

          // Identify nearest Kerala preset or set label
          const closestPreset = this.findClosestPreset(lat, lng);
          const addressLabel = closestPreset ? `Near ${closestPreset.name}` : `Current Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;

          const updated: CustomerLocation = {
            latitude: lat,
            longitude: lng,
            addressLabel,
            locality: closestPreset?.district,
            city: closestPreset?.name,
            state: 'Kerala',
            radiusKm: this._radiusKm(),
            selectedAt: Date.now(),
            source: 'gps',
          };

          this.setLocation(updated);
          resolve(updated);
        },
        (error: GeolocationPositionError) => {
          this.isDetecting.set(false);
          let message = 'Unable to retrieve location.';
          if (error.code === error.PERMISSION_DENIED) {
            this.permissionDenied.set(true);
            message = 'Location access was denied. Please select on map or enter manually.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location request timed out. Please try again or select on map.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'GPS signal unavailable. Please select on map.';
          }
          this.locationError.set(message);
          reject(new Error(message));
        },
        { timeout: 12000, enableHighAccuracy: true, maximumAge: 60000 },
      );
    });
  }

  /**
   * Option B / Preset selection
   */
  setCoordinates(lat: number, lng: number, label?: string, source: CustomerLocation['source'] = 'map'): void {
    const closestPreset = this.findClosestPreset(lat, lng);
    const resolvedLabel = label || (closestPreset ? closestPreset.name : `Selected Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`);

    const updated: CustomerLocation = {
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      addressLabel: resolvedLabel,
      city: closestPreset?.name,
      district: closestPreset?.district,
      state: 'Kerala',
      radiusKm: this._radiusKm(),
      selectedAt: Date.now(),
      source,
    };

    this.setLocation(updated);
  }

  /**
   * Option C — Manual Address Entry
   */
  setManualLocation(details: {
    locality: string;
    city: string;
    postalCode?: string;
    label?: string;
    latitude?: number;
    longitude?: number;
  }): void {
    let lat: number;
    let lng: number;

    if (
      details.latitude !== undefined &&
      details.longitude !== undefined &&
      !isNaN(details.latitude) &&
      !isNaN(details.longitude)
    ) {
      lat = details.latitude;
      lng = details.longitude;
    } else {
      // Check if entered city matches any preset coordinates
      const matchedPreset = KERALA_CITY_PRESETS.find(
        (p) =>
          p.name.toLowerCase().includes(details.city.toLowerCase()) ||
          details.city.toLowerCase().includes(p.name.toLowerCase()),
      );
      lat = matchedPreset ? matchedPreset.lat : 9.9312;
      lng = matchedPreset ? matchedPreset.lng : 76.2673;
    }

    const updated: CustomerLocation = {
      latitude: lat,
      longitude: lng,
      addressLabel: details.label || `${details.locality}, ${details.city}`,
      locality: details.locality,
      city: details.city,
      district: details.city,
      state: 'Kerala',
      postalCode: details.postalCode,
      radiusKm: this._radiusKm(),
      selectedAt: Date.now(),
      source: 'manual',
    };

    this.setLocation(updated);
  }

  /**
   * Radius Selector (1, 3, 5, 10, 20, 30, 50 km)
   */
  setRadius(radius: DiscoveryRadius): void {
    this._radiusKm.set(radius);
    try {
      localStorage.setItem(this.STORAGE_RADIUS_KEY, String(radius));
    } catch {
      // ignore
    }

    // Refresh current location with updated radius
    this._currentLocation.update((curr) => ({
      ...curr,
      radiusKm: radius,
      selectedAt: Date.now(),
    }));
    this.persistLocation(this._currentLocation());
  }

  /**
   * Saved Locations Management
   */
  saveAddress(addr: Omit<SavedAddress, 'id'>): SavedAddress {
    const newAddress: SavedAddress = {
      ...addr,
      id: 'addr_' + Math.random().toString(36).substring(2, 9),
    };

    this._savedAddresses.update((list) => [...list, newAddress]);
    this.persistSavedAddresses(this._savedAddresses());
    return newAddress;
  }

  selectSavedAddress(id: string): void {
    const address = this._savedAddresses().find((a) => a.id === id);
    if (!address) return;

    this.setLocation({
      latitude: address.latitude,
      longitude: address.longitude,
      addressLabel: address.title,
      locality: address.locality,
      city: address.city,
      district: address.district,
      state: 'Kerala',
      postalCode: address.postalCode,
      radiusKm: this._radiusKm(),
      selectedAt: Date.now(),
      source: 'manual',
    });
  }

  deleteSavedAddress(id: string): void {
    this._savedAddresses.update((list) => list.filter((a) => a.id !== id));
    this.persistSavedAddresses(this._savedAddresses());
  }

  private setLocation(loc: CustomerLocation): void {
    this._currentLocation.set(loc);
    this.persistLocation(loc);
  }

  private persistLocation(loc: CustomerLocation): void {
    try {
      localStorage.setItem(this.STORAGE_LOC_KEY, JSON.stringify(loc));
    } catch {
      // ignore
    }
  }

  private persistSavedAddresses(addresses: SavedAddress[]): void {
    try {
      localStorage.setItem(this.STORAGE_SAVED_ADDR_KEY, JSON.stringify(addresses));
    } catch {
      // ignore
    }
  }

  private getInitialLocation(): CustomerLocation {
    try {
      const stored = localStorage.getItem(this.STORAGE_LOC_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // Default: Kochi, Kerala coordinates with 20 km discovery radius
    return {
      latitude: 9.9312,
      longitude: 76.2673,
      addressLabel: 'Kochi (Ernakulam)',
      locality: 'Marine Drive',
      city: 'Kochi',
      district: 'Ernakulam',
      state: 'Kerala',
      postalCode: '682011',
      radiusKm: 20,
      selectedAt: Date.now(),
      source: 'default',
    };
  }

  private getInitialRadius(): DiscoveryRadius {
    try {
      const stored = localStorage.getItem(this.STORAGE_RADIUS_KEY);
      if (stored) {
        const val = parseInt(stored, 10);
        if ([1, 3, 5, 10, 20, 30, 50].includes(val)) {
          return val as DiscoveryRadius;
        }
      }
    } catch {
      // ignore
    }
    return 20;
  }

  private getInitialSavedAddresses(): SavedAddress[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_SAVED_ADDR_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'default_home',
        type: 'HOME',
        title: 'Home (Kochi)',
        locality: 'Kadavanthra',
        city: 'Kochi',
        district: 'Ernakulam',
        postalCode: '682020',
        latitude: 9.9674,
        longitude: 76.2995,
        isDefault: true,
      },
    ];
  }

  private findClosestPreset(lat: number, lng: number) {
    let closest = KERALA_CITY_PRESETS[0];
    let minDistance = Number.MAX_VALUE;

    for (const preset of KERALA_CITY_PRESETS) {
      const d = Math.sqrt(Math.pow(preset.lat - lat, 2) + Math.pow(preset.lng - lng, 2));
      if (d < minDistance) {
        minDistance = d;
        closest = preset;
      }
    }
    // If within ~0.4 degrees (~40 km), return preset name
    return minDistance < 0.4 ? closest : null;
  }
}
