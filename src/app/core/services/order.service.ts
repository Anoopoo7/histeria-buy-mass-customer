import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { CustomerPickupInfo, OrderRecord, ResendOtpResponse } from '../models/order.model';
import { ApiClientService } from './api-client.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly api = inject(ApiClientService);

  /**
   * GET /api/v1/orders
   * Lists authenticated customer's orders.
   */
  getOrders(params?: {
    status?: string;
    poolId?: string;
    storeId?: string;
    page?: number;
    limit?: number;
  }): Observable<{ orders: OrderRecord[]; total: number }> {
    return this.api.get<any>('/api/v1/orders', { params: params as any }).pipe(
      map((res) => {
        const list = Array.isArray(res) ? res : res?.data || res?.orders || [];
        const total = res?.pagination?.total || list.length;
        const orders: OrderRecord[] = list.map((o: any) => ({
          id: o.id || o._id,
          orderNumber: o.orderNumber || 'BM-' + (o.id || '').substring(0, 8).toUpperCase(),
          userId: o.userId,
          storeId: o.storeId,
          storeName: o.storeName || 'Partner Store',
          poolId: o.poolId,
          participationId: o.participationId,
          cartId: o.cartId,
          items: o.items || [],
          regularTotal: o.regularTotal || 0,
          discountPercentage: o.discountPercentage || 0,
          discountAmount: o.discountAmount || 0,
          finalAmount: o.finalAmount || 0,
          currency: o.currency || 'INR',
          status: o.status || 'PLACED',
          placedAt: o.placedAt || o.createdAt,
          confirmedAt: o.confirmedAt,
          readyForPickupAt: o.readyForPickupAt,
          pickupVerifiedAt: o.pickupVerifiedAt,
          completedAt: o.completedAt,
          cancelledAt: o.cancelledAt,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        }));
        return { orders, total };
      }),
      catchError(() => of({ orders: [], total: 0 })),
    );
  }

  /**
   * GET /api/v1/orders/:orderId
   * Return complete order details for customer.
   */
  getOrderById(orderId: string): Observable<OrderRecord | null> {
    return this.api.get<any>(`/api/v1/orders/${orderId}`).pipe(
      map((res) => {
        const o = res?.order || res;
        if (!o || !o.id) return null;
        return {
          id: o.id || o._id,
          orderNumber: o.orderNumber || 'BM-' + (o.id || '').substring(0, 8).toUpperCase(),
          userId: o.userId,
          storeId: o.storeId,
          storeName: o.storeName || 'Partner Store',
          poolId: o.poolId,
          participationId: o.participationId,
          cartId: o.cartId,
          items: o.items || [],
          regularTotal: o.regularTotal || 0,
          discountPercentage: o.discountPercentage || 0,
          discountAmount: o.discountAmount || 0,
          finalAmount: o.finalAmount || 0,
          currency: o.currency || 'INR',
          status: o.status || 'PLACED',
          placedAt: o.placedAt || o.createdAt,
          confirmedAt: o.confirmedAt,
          readyForPickupAt: o.readyForPickupAt,
          pickupVerifiedAt: o.pickupVerifiedAt,
          completedAt: o.completedAt,
          cancelledAt: o.cancelledAt,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        } as OrderRecord;
      }),
      catchError(() => of(null)),
    );
  }

  /**
   * GET /api/v1/orders/:orderId/pickup
   * Return pickup status and store instructions. Never exposes OTP.
   */
  getPickupInfo(orderId: string): Observable<CustomerPickupInfo | null> {
    return this.api.get<any>(`/api/v1/orders/${orderId}/pickup`).pipe(
      map((res) => res?.pickup || null),
      catchError(() => of(null)),
    );
  }

  /**
   * POST /api/v1/orders/:orderId/pickup/resend
   * Invalidates previous OTP and dispatches a fresh 6-digit OTP via WhatsApp.
   */
  resendPickupOtp(orderId: string): Observable<ResendOtpResponse> {
    return this.api.post<ResendOtpResponse>(`/api/v1/orders/${orderId}/pickup/resend`, {});
  }
}
