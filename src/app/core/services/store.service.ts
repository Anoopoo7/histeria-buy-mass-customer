import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { StoreRecord } from '../models/store.model';
import { optimizeImageUrl } from '../utils/image.utils';
import { ApiClientService } from './api-client.service';
import { LocationService } from './location.service';

export interface TypesenseHit<T> {
  document: T;
  geo_distance_meters?: Record<string, number>;
}

export interface TypesenseSearchResult<T> {
  found: number;
  hits?: TypesenseHit<T>[];
  page: number;
}

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private readonly api = inject(ApiClientService);
  private readonly locationService = inject(LocationService);

  /**
   * Search nearby stores using Typesense geolocation or fallback listing.
   */
  getNearbyStores(params?: {
    query?: string;
    businessType?: string;
    city?: string;
    page?: number;
    limit?: number;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }): Observable<{ stores: StoreRecord[]; total: number }> {
    const loc = this.locationService.currentLocation();
    const lat = params?.lat !== undefined ? params.lat : loc.latitude;
    const lng = params?.lng !== undefined ? params.lng : loc.longitude;
    const radius = params?.radiusKm !== undefined ? params.radiusKm : loc.radiusKm;

    const queryParams: Record<string, string | number | undefined> = {
      q: params?.query || '*',
      businessType: params?.businessType,
      city: params?.city,
      page: params?.page || 1,
      limit: params?.limit || 20,
    };

    if (lat !== null && lng !== null && lat !== undefined && lng !== undefined) {
      queryParams['lat'] = lat;
      queryParams['long'] = lng;
      queryParams['radiusKm'] = radius;
    }

    return this.api.get<TypesenseSearchResult<any>>('/api/v1/search/stores', { params: queryParams }).pipe(
      map((res) => {
        const hits = res.hits || [];
        const stores: StoreRecord[] = hits.map((h) => {
          const doc = h.document;
          let distanceKm: number | undefined;
          if (h.geo_distance_meters) {
            const meters = Object.values(h.geo_distance_meters)[0];
            if (typeof meters === 'number') {
              distanceKm = Number((meters / 1000).toFixed(1));
            }
          }
          const normalized = this.normalizeStoreRecord(doc);
          if (distanceKm !== undefined) {
            normalized.distanceKm = distanceKm;
          }
          return normalized;
        });

        return {
          stores,
          total: res.found || stores.length,
        };
      }),
      catchError(() => {
        // Fallback to /api/v1/merchants if search service is idle
        return this.api.get<any>('/api/v1/merchants').pipe(
          map((res) => {
            const list = Array.isArray(res) ? res : res?.data || res?.merchants || [];
            const stores: StoreRecord[] = list.map((m: any) => this.normalizeStoreRecord(m));
            return { stores, total: stores.length };
          }),
          catchError(() => of({ stores: [], total: 0 })),
        );
      }),
    );
  }

  /**
   * Public API for getting store details:
   * GET /api/v1/stores/:storeId
   */
  getStoreById(storeId: string): Observable<StoreRecord | null> {
    if (!storeId) return of(null);

    return this.api.get<any>(`/api/v1/stores/${storeId}`).pipe(
      map((res) => {
        const storeDoc = res?.store || res?.data || res;
        if (storeDoc && (storeDoc.id || storeDoc._id)) {
          return this.normalizeStoreRecord(storeDoc);
        }
        return null;
      }),
      catchError(() => {
        // Fallback to Typesense search if direct endpoint encounters issues
        return this.api
          .get<TypesenseSearchResult<any>>('/api/v1/search/stores', { params: { q: storeId, limit: 1 } })
          .pipe(
            map((res) => {
              const match = res.hits?.find((h) => h.document.id === storeId)?.document;
              if (match) {
                return this.normalizeStoreRecord(match);
              }
              return null;
            }),
            catchError(() => of(null)),
          );
      }),
    );
  }

  normalizeStoreRecord(doc: any): StoreRecord {
    let lat: number | undefined;
    let lng: number | undefined;

    // Handle location object { latitude, longitude }
    if (doc.location && typeof doc.location === 'object') {
      if ('latitude' in doc.location && 'longitude' in doc.location) {
        lat = Number(doc.location.latitude);
        lng = Number(doc.location.longitude);
      } else if (Array.isArray(doc.location) && doc.location.length >= 2) {
        // GeoJSON [lng, lat]
        lng = Number(doc.location[0]);
        lat = Number(doc.location[1]);
      }
    }

    if (lat === undefined && doc.latitude !== undefined) {
      lat = Number(doc.latitude);
    }
    if (lng === undefined && doc.longitude !== undefined) {
      lng = Number(doc.longitude);
    }
    if (lat === undefined && doc.coordinates) {
      lat = Number(doc.coordinates.lat || doc.coordinates.latitude);
      lng = Number(doc.coordinates.lng || doc.coordinates.longitude);
    }
    if (lat === undefined && doc.address?.latitude && doc.address?.longitude) {
      lat = Number(doc.address.latitude);
      lng = Number(doc.address.longitude);
    }

    // Collect all photos / images in order
    const rawImages: string[] = [];

    if (Array.isArray(doc.photos) && doc.photos.length > 0) {
      doc.photos.forEach((p: any) => {
        const url = typeof p === 'string' ? p : p?.url;
        if (url) {
          rawImages.push(optimizeImageUrl(url, 'hero'));
        }
      });
    }

    if (Array.isArray(doc.imageUrls) && doc.imageUrls.length > 0) {
      doc.imageUrls.forEach((img: string) => {
        if (img) {
          const opt = optimizeImageUrl(img, 'hero');
          if (!rawImages.includes(opt)) rawImages.push(opt);
        }
      });
    }

    if (doc.primaryImageUrl) {
      const optPrimary = optimizeImageUrl(doc.primaryImageUrl, 'card');
      if (!rawImages.includes(optPrimary)) {
        rawImages.unshift(optPrimary);
      }
    }

    return {
      id: doc.id || doc._id,
      storeName: doc.storeName || doc.businessName || 'Partner Store',
      storeCode: doc.storeCode,
      businessType: doc.businessType || 'General Retail',
      description: doc.description,
      addressLine1: doc.addressLine1 || doc.address?.line1 || '',
      city: doc.city || doc.address?.city || 'Kerala',
      district: doc.district || doc.address?.district,
      state: doc.state || doc.address?.state || 'Kerala',
      postalCode: doc.postalCode || doc.address?.postalCode || '682001',
      country: doc.country || 'IN',
      latitude: lat,
      longitude: lng,
      location: doc.location,
      primaryImageUrl: optimizeImageUrl(doc.primaryImageUrl || rawImages[0], 'card'),
      photos: doc.photos,
      imageUrls: rawImages,
      status: doc.status || 'APPROVED',
      activeCampaignCount: doc.activeCampaignCount,
      distanceKm: doc.distanceKm,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
