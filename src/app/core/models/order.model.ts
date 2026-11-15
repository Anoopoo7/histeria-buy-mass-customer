export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  quantity: number;
  regularUnitPrice: number;
  regularSubtotal: number;
  discountedSubtotal: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string;
  storeId: string;
  merchantId?: string;
  storeName?: string;
  poolId: string;
  participationId: string;
  cartId?: string;
  items: OrderItemSnapshot[];
  regularTotal: number;
  discountPercentage: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  status: OrderStatus;
  placedAt: string;
  confirmedAt?: string | null;
  readyForPickupAt?: string | null;
  pickupVerifiedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPickupInfo {
  orderId: string;
  orderNumber: string;
  storeName: string;
  storeAddress: string | null;
  orderStatus: OrderStatus;
  pickupAvailable: boolean;
  pickupStatus: string;
  readyForPickupAt: string | null;
  expiresAt: string | null;
  verifiedAt: string | null;
  instructions: string;
}

export interface ResendOtpResponse {
  message: string;
  orderId: string;
  cooldownSeconds?: number;
}
