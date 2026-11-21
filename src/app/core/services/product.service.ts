import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ProductRecord } from '../models/product.model';
import { ApiClientService } from './api-client.service';
import { LocationService } from './location.service';
import { optimizeImageUrl } from '../utils/image.utils';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly api = inject(ApiClientService);
  private readonly locationService = inject(LocationService);

  getProducts(params?: {
    query?: string;
    category?: string;
    storeId?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    ignoreLocation?: boolean;
  }): Observable<{ products: ProductRecord[]; total: number }> {
    const loc = this.locationService.currentLocation();
    const queryParams: Record<string, string | number | undefined> = {
      q: params?.query || '*',
      category: params?.category,
      storeId: params?.storeId,
      brand: params?.brand,
      minPrice: params?.minPrice,
      maxPrice: params?.maxPrice,
      page: params?.page || 1,
      limit: params?.limit || 20,
    };

    if (!params?.ignoreLocation && loc.latitude && loc.longitude) {
      queryParams['lat'] = loc.latitude;
      queryParams['long'] = loc.longitude;
      queryParams['radiusKm'] = loc.radiusKm;
    }

    return this.api.get<any>('/api/v1/search/products', { params: queryParams }).pipe(
      map((res) => {
        const hits = res.hits || [];
        const products: ProductRecord[] = hits.map((h: any) => {
          const doc = h.document;
          let distanceKm: number | undefined;
          if (h.geo_distance_meters) {
            const meters = Object.values(h.geo_distance_meters)[0];
            if (typeof meters === 'number') {
              distanceKm = Number((meters / 1000).toFixed(1));
            }
          }
          const normalized = this.normalizeProductRecord(doc);
          if (distanceKm !== undefined) {
            normalized.distanceKm = distanceKm;
          }
          return normalized;
        });

        return { products, total: res.found || products.length };
      }),
      catchError(() => {
        // Fallback to /api/v1/products (MongoDB endpoint)
        return this.api
          .get<any>('/api/v1/products', {
            params: {
              storeId: params?.storeId,
              category: params?.category,
              search: params?.query,
            },
          })
          .pipe(
            map((res) => {
              const list = Array.isArray(res) ? res : res?.data || res?.products || [];
              const products: ProductRecord[] = list.map((p: any) => this.normalizeProductRecord(p));
              return { products, total: products.length };
            }),
            catchError(() => of({ products: [], total: 0 })),
          );
      }),
    );
  }

  getProductById(productId: string): Observable<ProductRecord | null> {
    if (!productId) return of(null);

    return this.api.get<any>(`/api/v1/products/${productId}`).pipe(
      map((res) => {
        const p = res?.product || res?.data || res;
        if (p && (p.id || p._id)) {
          return this.normalizeProductRecord(p);
        }
        return null;
      }),
      catchError(() => {
        // Fallback to Typesense search
        return this.api
          .get<any>('/api/v1/search/products', { params: { q: productId, limit: 1 } })
          .pipe(
            map((res) => {
              const match = res.hits?.find((h: any) => h.document.id === productId)?.document;
              if (match) {
                return this.normalizeProductRecord(match);
              }
              return null;
            }),
            catchError(() => of(null)),
          );
      }),
    );
  }

  normalizeProductRecord(doc: any): ProductRecord {
    const rawImages: string[] = [];
    if (doc.primaryImageUrl) rawImages.push(doc.primaryImageUrl);
    if (Array.isArray(doc.images)) {
      doc.images.forEach((img: any) => {
        const u = typeof img === 'string' ? img : img?.url;
        if (u && !rawImages.includes(u)) rawImages.push(u);
      });
    }
    if (Array.isArray(doc.imageUrls)) {
      doc.imageUrls.forEach((u: string) => {
        if (u && !rawImages.includes(u)) rawImages.push(u);
      });
    }

    const price = Number(doc.price) || 0;
    const originalPrice = doc.originalPrice ? Number(doc.originalPrice) : undefined;

    const storeObj = doc.store
      ? {
          id: doc.store.id || doc.storeId,
          storeName: doc.store.storeName || doc.storeName,
          city: doc.store.city || doc.storeCity,
          district: doc.store.district || doc.storeDistrict,
          state: doc.store.state || doc.storeState,
          location: doc.store.location,
          primaryImageUrl: optimizeImageUrl(doc.store.primaryImageUrl, 'avatar'),
        }
      : undefined;

    const optimizedPrimary = optimizeImageUrl(doc.primaryImageUrl || rawImages[0], 'card');
    const optimizedImages = rawImages.map((u) => optimizeImageUrl(u, 'hero'));

    return {
      id: doc.id || doc._id,
      storeId: doc.storeId || storeObj?.id,
      storeName: storeObj?.storeName || doc.storeName || 'Partner Store',
      storeCity: storeObj?.city || doc.storeCity || 'Kerala',
      storeDistrict: storeObj?.district || doc.storeDistrict,
      storeState: storeObj?.state || doc.storeState || 'Kerala',
      store: storeObj,
      name: doc.name,
      description: doc.description || '',
      category: doc.category || 'General',
      brand: doc.brand,
      sku: doc.sku,
      unit: doc.unit || 'unit',
      price,
      originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
      primaryImageUrl: optimizedPrimary,
      imageUrls: optimizedImages,
      images: Array.isArray(doc.images)
        ? doc.images.map((img: any) =>
            typeof img === 'string'
              ? optimizeImageUrl(img, 'hero')
              : { ...img, url: optimizeImageUrl(img?.url, 'hero') },
          )
        : undefined,
      status: doc.status || 'ACTIVE',
      distanceKm: doc.distanceKm,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
