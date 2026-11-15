import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { PoolParticipationRecord, PoolRecord } from '../models/pool.model';
import { ApiClientService } from './api-client.service';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root',
})
export class PoolService {
  private readonly api = inject(ApiClientService);
  private readonly locationService = inject(LocationService);

  getPools(params?: {
    query?: string;
    category?: string;
    storeId?: string;
    minDiscountPercentage?: number;
    page?: number;
    limit?: number;
  }): Observable<{ pools: PoolRecord[]; total: number }> {
    const loc = this.locationService.currentLocation();
    const queryParams: Record<string, string | number | undefined> = {
      q: params?.query || '*',
      category: params?.category,
      storeId: params?.storeId,
      minDiscountPercentage: params?.minDiscountPercentage,
      page: params?.page || 1,
      limit: params?.limit || 20,
    };

    if (loc.latitude && loc.longitude) {
      queryParams['lat'] = loc.latitude;
      queryParams['long'] = loc.longitude;
      queryParams['radiusKm'] = loc.radiusKm;
    }

    return this.api.get<any>('/api/v1/search/pools', { params: queryParams }).pipe(
      map((res) => {
        const hits = res.hits || [];
        const pools: PoolRecord[] = hits.map((h: any) => {
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
            poolCode: doc.poolCode,
            storeId: doc.storeId,
            storeName: doc.storeName,
            storeCity: doc.storeCity,
            storeState: doc.storeState,
            title: doc.title,
            description: doc.description,
            productIds: doc.productIds || [],
            productNames: doc.productNames || [],
            categories: doc.categories || [],
            primaryImageUrl: doc.primaryImageUrl,
            startsAt: new Date(doc.startsAt).toISOString(),
            endsAt: new Date(doc.endsAt).toISOString(),
            status: doc.status || 'ACTIVE',
            targetAmount: doc.targetAmount,
            discountPercentage: doc.maxDiscountPercentage || 10,
            maxDiscountPercentage: doc.maxDiscountPercentage || 10,
            tiers: [
              { targetAmount: Math.round((doc.targetAmount || 10000) * 0.3), discountPercentage: 5 },
              { targetAmount: Math.round((doc.targetAmount || 10000) * 0.6), discountPercentage: 10 },
              { targetAmount: doc.targetAmount || 10000, discountPercentage: doc.maxDiscountPercentage || 15 },
            ],
            currentParticipantCount: 6, // default estimate if not finalized
            distanceKm,
          };
        });

        return { pools, total: res.found || pools.length };
      }),
      catchError(() => {
        // Fallback to /api/v1/pools (MongoDB)
        return this.api
          .get<any>('/api/v1/pools', {
            params: {
              storeId: params?.storeId,
              search: params?.query,
              page: params?.page || 1,
              limit: params?.limit || 20,
            },
          })
          .pipe(
            map((res) => {
              const list = Array.isArray(res) ? res : res?.data || res?.pools || [];
              const pools: PoolRecord[] = list.map((p: any) => ({
                id: p.id || p._id,
                storeId: p.storeId,
                title: p.title,
                description: p.description,
                productIds: p.productIds || [],
                startsAt: p.startsAt,
                endsAt: p.endsAt,
                status: p.status || 'ACTIVE',
                tiers: p.tiers || [
                  { targetAmount: 3000, discountPercentage: 5 },
                  { targetAmount: 6000, discountPercentage: 10 },
                  { targetAmount: 10000, discountPercentage: 15 },
                ],
                targetAmount: p.targetAmount || 10000,
                discountPercentage: p.discountPercentage || 10,
                primaryImageUrl: p.primaryImageUrl,
              }));
              return { pools, total: pools.length };
            }),
            catchError(() => of({ pools: [], total: 0 })),
          );
      }),
    );
  }

  getPoolById(poolId: string): Observable<PoolRecord | null> {
    return this.api.get<any>(`/api/v1/pools/${poolId}`).pipe(
      map((res) => {
        const p = res?.pool || res;
        if (!p || !p.id) return null;
        return {
          id: p.id || p._id,
          poolCode: p.poolCode,
          storeId: p.storeId,
          storeName: p.storeName || 'Partner Store',
          title: p.title,
          description: p.description,
          productIds: p.productIds || [],
          products: p.products || [],
          startsAt: p.startsAt,
          endsAt: p.endsAt,
          durationMinutes: p.durationMinutes,
          status: p.status,
          minParticipants: p.minParticipants,
          tiers: p.tiers || [],
          targetAmount: p.targetAmount,
          discountPercentage: p.discountPercentage,
          maxDiscountPercentage: p.discountPercentage || p.tiers?.[p.tiers.length - 1]?.discountPercentage || 10,
          currentParticipantCount: p.finalParticipantCount || 4,
          currentTotalAmount: p.finalCombinedValue || 0,
          primaryImageUrl: p.primaryImageUrl,
        } as PoolRecord;
      }),
      catchError(() => of(null)),
    );
  }

  participateInPool(poolId: string, cartId: string): Observable<any> {
    return this.api.post(`/api/v1/pools/${poolId}/participate`, { cartId });
  }

  getMyParticipation(poolId: string): Observable<PoolParticipationRecord | null> {
    return this.api.get<any>(`/api/v1/pools/${poolId}/participation/me`).pipe(
      map((res) => res?.participation || null),
      catchError(() => of(null)),
    );
  }

  withdrawParticipation(poolId: string): Observable<any> {
    return this.api.post(`/api/v1/pools/${poolId}/participation/me/withdraw`, {});
  }
}
