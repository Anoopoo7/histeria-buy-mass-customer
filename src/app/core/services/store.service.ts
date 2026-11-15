import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { StoreRecord } from '../models/store.model';
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

          return {
            id: doc.id,
            storeName: doc.storeName,
            storeCode: doc.storeCode,
            businessType: doc.businessType,
            description: doc.description,
            addressLine1: doc.addressLine1 || '',
            city: doc.city,
            district: doc.district,
            state: doc.state,
            postalCode: doc.postalCode,
            location: doc.location,
            primaryImageUrl: doc.primaryImageUrl,
            imageUrls: doc.imageUrls || [],
            status: doc.status || 'APPROVED',
            distanceKm,
          };
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
            const stores: StoreRecord[] = list.map((m: any) => ({
              id: m.id || m._id,
              storeName: m.storeName,
              storeCode: m.storeCode,
              businessType: m.businessType || 'General Retail',
              description: m.description,
              addressLine1: m.addressLine1,
              city: m.city || 'Kerala',
              district: m.district,
              state: m.state || 'Kerala',
              postalCode: m.postalCode || '682001',
              primaryImageUrl: m.photos?.[0]?.url || m.primaryImageUrl,
              status: m.status || 'APPROVED',
            }));
            return { stores, total: stores.length };
          }),
          catchError(() => of({ stores: [], total: 0 })),
        );
      }),
    );
  }

  /**
   * Resolve Store details by storeId.
   */
  getStoreById(storeId: string): Observable<StoreRecord | null> {
    // Attempt Typesense search by storeId
    return this.api.get<TypesenseSearchResult<any>>('/api/v1/search/stores', { params: { q: storeId, limit: 1 } }).pipe(
      map((res) => {
        const match = res.hits?.find((h) => h.document.id === storeId)?.document;
        if (match) {
          return {
            id: match.id,
            storeName: match.storeName,
            storeCode: match.storeCode,
            businessType: match.businessType,
            description: match.description,
            addressLine1: match.addressLine1,
            city: match.city,
            district: match.district,
            state: match.state,
            postalCode: match.postalCode,
            primaryImageUrl: match.primaryImageUrl,
            imageUrls: match.imageUrls || [],
            status: match.status,
          } as StoreRecord;
        }
        return null;
      }),
      catchError(() => of(null)),
    );
  }
}
