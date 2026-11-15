import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ProductRecord } from '../models/product.model';
import { ApiClientService } from './api-client.service';
import { LocationService } from './location.service';

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

    if (loc.latitude && loc.longitude) {
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

          return {
            id: doc.id,
            storeId: doc.storeId,
            storeName: doc.storeName,
            storeCity: doc.storeCity,
            storeState: doc.storeState,
            name: doc.name,
            description: doc.description || '',
            category: doc.category,
            brand: doc.brand,
            sku: doc.sku,
            unit: doc.unit || 'unit',
            price: doc.price,
            originalPrice: doc.originalPrice || Math.round(doc.price * 1.15),
            primaryImageUrl: doc.primaryImageUrl,
            imageUrls: doc.imageUrls || [],
            status: doc.status || 'ACTIVE',
            distanceKm,
          };
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
              const products: ProductRecord[] = list.map((p: any) => ({
                id: p.id || p._id,
                storeId: p.storeId,
                name: p.name,
                description: p.description || '',
                category: p.category,
                brand: p.brand,
                sku: p.sku,
                unit: p.unit || 'unit',
                price: p.price,
                originalPrice: p.originalPrice || Math.round(p.price * 1.15),
                primaryImageUrl: p.images?.[0]?.url || p.primaryImageUrl,
                imageUrls: p.images?.map((i: any) => i.url) || [],
                status: p.status || 'ACTIVE',
              }));
              return { products, total: products.length };
            }),
            catchError(() => of({ products: [], total: 0 })),
          );
      }),
    );
  }

  getProductById(productId: string): Observable<ProductRecord | null> {
    return this.api.get<any>('/api/v1/search/products', { params: { q: productId, limit: 1 } }).pipe(
      map((res) => {
        const match = res.hits?.find((h: any) => h.document.id === productId)?.document;
        if (match) {
          return {
            id: match.id,
            storeId: match.storeId,
            storeName: match.storeName,
            storeCity: match.storeCity,
            storeState: match.storeState,
            name: match.name,
            description: match.description || '',
            category: match.category,
            brand: match.brand,
            sku: match.sku,
            unit: match.unit || 'unit',
            price: match.price,
            originalPrice: match.originalPrice,
            primaryImageUrl: match.primaryImageUrl,
            imageUrls: match.imageUrls || [],
            status: match.status,
          } as ProductRecord;
        }
        return null;
      }),
      catchError(() => of(null)),
    );
  }
}
